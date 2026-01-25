/**
 * State Trigger Engine - Cross-object state interaction system
 * Listens for state changes and triggers cascading changes in other objects
 */

import { logger } from '@/lib/logger';

const log = logger.scope('StateTriggerEngine');

// =============================================================================
// TYPES
// =============================================================================

export interface TriggerRule {
  id: string;
  name: string;
  enabled: boolean;
  sourceObjectId: string;
  sourceEvent: TriggerEvent;
  targetObjectId: string;
  targetAction: TriggerAction;
  conditions?: TriggerCondition[];
  priority?: number; // Higher priority executes first
}

export type TriggerEvent =
  | { type: 'state-enter'; stateId: string }
  | { type: 'state-exit'; stateId: string }
  | { type: 'click' }
  | { type: 'hover-start' }
  | { type: 'hover-end' }
  | { type: 'media-play' }
  | { type: 'media-pause' }
  | { type: 'media-end' }
  | { type: 'media-time'; time: number }
  | { type: 'quiz-correct' }
  | { type: 'quiz-incorrect' }
  | { type: 'quiz-submit' }
  | { type: 'animation-end' }
  | { type: 'scroll-in-view' }
  | { type: 'scroll-out-view' }
  | { type: 'timer'; delay: number }
  | { type: 'variable-change'; variableName: string };

export type TriggerAction =
  | { type: 'go-to-state'; stateId: string; animate?: boolean }
  | { type: 'toggle-visibility' }
  | { type: 'show' }
  | { type: 'hide' }
  | { type: 'play-media' }
  | { type: 'pause-media' }
  | { type: 'seek-media'; time: number }
  | { type: 'enable' }
  | { type: 'disable' }
  | { type: 'focus' }
  | { type: 'blur' }
  | { type: 'scroll-to' }
  | { type: 'emit-xapi'; verb: string; object?: object }
  | { type: 'set-variable'; variableName: string; value: string | number | boolean }
  | { type: 'increment-variable'; variableName: string; amount: number }
  | { type: 'custom'; handler: string; data?: Record<string, unknown> };

export interface TriggerCondition {
  type:
    | 'state-is'
    | 'state-not'
    | 'variable-equals'
    | 'variable-not-equals'
    | 'variable-gt'
    | 'variable-lt'
    | 'variable-gte'
    | 'variable-lte'
    | 'variable-contains'
    | 'object-visible'
    | 'object-hidden'
    | 'media-playing'
    | 'media-paused';
  objectId?: string;
  stateId?: string;
  variableName?: string;
  value?: string | number | boolean;
  negate?: boolean;
}

export type TriggerEventHandler = (
  objectId: string,
  event: TriggerEvent,
  rule: TriggerRule,
) => void;

export interface ActionExecutor {
  executeAction: (targetObjectId: string, action: TriggerAction) => Promise<void>;
}

// =============================================================================
// STATE CONTEXT
// =============================================================================

export interface StateContext {
  // Object states
  getObjectState: (objectId: string) => string | undefined;
  setObjectState: (objectId: string, stateId: string, animate?: boolean) => Promise<void>;

  // Variables
  getVariable: (name: string) => string | number | boolean | undefined;
  setVariable: (name: string, value: string | number | boolean) => void;

  // Object visibility
  isObjectVisible: (objectId: string) => boolean;
  setObjectVisible: (objectId: string, visible: boolean) => void;

  // Media control
  isMediaPlaying: (objectId: string) => boolean;
  playMedia: (objectId: string) => void;
  pauseMedia: (objectId: string) => void;
  seekMedia: (objectId: string, time: number) => void;

  // Focus
  focusObject: (objectId: string) => void;
  blurObject: (objectId: string) => void;

  // Scroll
  scrollToObject: (objectId: string) => void;

  // xAPI
  emitXAPIStatement: (verb: string, object?: object) => void;
}

// =============================================================================
// STATE TRIGGER ENGINE
// =============================================================================

class StateTriggerEngine {
  private rules: Map<string, TriggerRule> = new Map();
  private listeners: Map<string, Set<TriggerEventHandler>> = new Map();
  private context: StateContext | null = null;
  private eventQueue: Array<{ objectId: string; event: TriggerEvent }> = [];
  private isProcessing = false;
  private timerIds: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.rules = new Map();
    this.listeners = new Map();
  }

  // ==========================================================================
  // CONTEXT
  // ==========================================================================

  setContext(context: StateContext): void {
    this.context = context;
  }

  getContext(): StateContext | null {
    return this.context;
  }

  // ==========================================================================
  // RULE MANAGEMENT
  // ==========================================================================

  addRule(rule: Omit<TriggerRule, 'id'>): string {
    const id = `rule_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const newRule: TriggerRule = { ...rule, id };
    this.rules.set(id, newRule);
    return id;
  }

  updateRule(ruleId: string, updates: Partial<TriggerRule>): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      this.rules.set(ruleId, { ...rule, ...updates });
    }
  }

  removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
    // Clear any timers associated with this rule
    const timerId = this.timerIds.get(ruleId);
    if (timerId) {
      clearTimeout(timerId);
      this.timerIds.delete(ruleId);
    }
  }

  enableRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      this.rules.set(ruleId, { ...rule, enabled: true });
    }
  }

  disableRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      this.rules.set(ruleId, { ...rule, enabled: false });
    }
  }

  getRule(ruleId: string): TriggerRule | undefined {
    return this.rules.get(ruleId);
  }

  getAllRules(): TriggerRule[] {
    return Array.from(this.rules.values());
  }

  getRulesForObject(objectId: string): TriggerRule[] {
    return Array.from(this.rules.values()).filter(
      (rule) => rule.sourceObjectId === objectId || rule.targetObjectId === objectId,
    );
  }

  getRulesForSource(objectId: string): TriggerRule[] {
    return Array.from(this.rules.values()).filter((rule) => rule.sourceObjectId === objectId);
  }

  getRulesForTarget(objectId: string): TriggerRule[] {
    return Array.from(this.rules.values()).filter((rule) => rule.targetObjectId === objectId);
  }

  clearAllRules(): void {
    // Clear all timers
    for (const timerId of this.timerIds.values()) {
      clearTimeout(timerId);
    }
    this.timerIds.clear();
    this.rules.clear();
  }

  // ==========================================================================
  // EVENT HANDLING
  // ==========================================================================

  emit(objectId: string, event: TriggerEvent): void {
    this.eventQueue.push({ objectId, event });
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.eventQueue.length > 0) {
      const item = this.eventQueue.shift();
      if (item) {
        await this.processEvent(item.objectId, item.event);
      }
    }

    this.isProcessing = false;
  }

  private async processEvent(objectId: string, event: TriggerEvent): Promise<void> {
    // Notify listeners
    const objectListeners = this.listeners.get(objectId);
    if (objectListeners) {
      for (const listener of objectListeners) {
        // Find matching rule for this listener call
        const matchingRule = this.findMatchingRule(objectId, event);
        if (matchingRule) {
          listener(objectId, event, matchingRule);
        }
      }
    }

    // Find and execute matching rules
    const matchingRules = this.findMatchingRules(objectId, event);

    // Sort by priority (higher first)
    matchingRules.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    for (const rule of matchingRules) {
      if (this.evaluateConditions(rule.conditions || [])) {
        await this.executeAction(rule.targetObjectId, rule.targetAction);
      }
    }
  }

  private findMatchingRule(objectId: string, event: TriggerEvent): TriggerRule | undefined {
    return Array.from(this.rules.values()).find(
      (rule) =>
        rule.enabled &&
        rule.sourceObjectId === objectId &&
        this.eventMatches(rule.sourceEvent, event),
    );
  }

  private findMatchingRules(objectId: string, event: TriggerEvent): TriggerRule[] {
    return Array.from(this.rules.values()).filter(
      (rule) =>
        rule.enabled &&
        rule.sourceObjectId === objectId &&
        this.eventMatches(rule.sourceEvent, event),
    );
  }

  private eventMatches(ruleEvent: TriggerEvent, actualEvent: TriggerEvent): boolean {
    if (ruleEvent.type !== actualEvent.type) return false;

    switch (ruleEvent.type) {
      case 'state-enter':
      case 'state-exit':
        return (
          (ruleEvent as { type: string; stateId: string }).stateId ===
          (actualEvent as { type: string; stateId: string }).stateId
        );
      case 'media-time': {
        // Allow some tolerance for time-based triggers
        const ruleTime = (ruleEvent as { type: string; time: number }).time;
        const actualTime = (actualEvent as { type: string; time: number }).time;
        return Math.abs(ruleTime - actualTime) < 0.5;
      }
      case 'timer':
        return (
          (ruleEvent as { type: string; delay: number }).delay ===
          (actualEvent as { type: string; delay: number }).delay
        );
      case 'variable-change':
        return (
          (ruleEvent as { type: string; variableName: string }).variableName ===
          (actualEvent as { type: string; variableName: string }).variableName
        );
      default:
        return true;
    }
  }

  subscribe(objectId: string, callback: TriggerEventHandler): () => void {
    if (!this.listeners.has(objectId)) {
      this.listeners.set(objectId, new Set());
    }
    this.listeners.get(objectId)?.add(callback);

    return () => {
      this.listeners.get(objectId)?.delete(callback);
    };
  }

  unsubscribe(objectId: string, callback: TriggerEventHandler): void {
    this.listeners.get(objectId)?.delete(callback);
  }

  // ==========================================================================
  // CONDITION EVALUATION
  // ==========================================================================

  evaluateConditions(conditions: TriggerCondition[]): boolean {
    if (!this.context) return true;
    if (conditions.length === 0) return true;

    return conditions.every((condition) => {
      const result = this.evaluateCondition(condition);
      return condition.negate ? !result : result;
    });
  }

  private evaluateCondition(condition: TriggerCondition): boolean {
    if (!this.context) return true;

    switch (condition.type) {
      case 'state-is':
        return (
          condition.objectId !== undefined &&
          condition.stateId !== undefined &&
          this.context.getObjectState(condition.objectId) === condition.stateId
        );

      case 'state-not':
        return (
          condition.objectId !== undefined &&
          condition.stateId !== undefined &&
          this.context.getObjectState(condition.objectId) !== condition.stateId
        );

      case 'variable-equals':
        return (
          condition.variableName !== undefined &&
          this.context.getVariable(condition.variableName) === condition.value
        );

      case 'variable-not-equals':
        return (
          condition.variableName !== undefined &&
          this.context.getVariable(condition.variableName) !== condition.value
        );

      case 'variable-gt': {
        if (!condition.variableName) return false;
        const val = this.context.getVariable(condition.variableName);
        return (
          typeof val === 'number' && typeof condition.value === 'number' && val > condition.value
        );
      }

      case 'variable-lt': {
        if (!condition.variableName) return false;
        const val = this.context.getVariable(condition.variableName);
        return (
          typeof val === 'number' && typeof condition.value === 'number' && val < condition.value
        );
      }

      case 'variable-gte': {
        if (!condition.variableName) return false;
        const val = this.context.getVariable(condition.variableName);
        return (
          typeof val === 'number' && typeof condition.value === 'number' && val >= condition.value
        );
      }

      case 'variable-lte': {
        if (!condition.variableName) return false;
        const val = this.context.getVariable(condition.variableName);
        return (
          typeof val === 'number' && typeof condition.value === 'number' && val <= condition.value
        );
      }

      case 'variable-contains': {
        if (!condition.variableName) return false;
        const val = this.context.getVariable(condition.variableName);
        return (
          typeof val === 'string' &&
          typeof condition.value === 'string' &&
          val.includes(condition.value)
        );
      }

      case 'object-visible':
        return condition.objectId !== undefined && this.context.isObjectVisible(condition.objectId);

      case 'object-hidden':
        return (
          condition.objectId !== undefined && !this.context.isObjectVisible(condition.objectId)
        );

      case 'media-playing':
        return condition.objectId !== undefined && this.context.isMediaPlaying(condition.objectId);

      case 'media-paused':
        return condition.objectId !== undefined && !this.context.isMediaPlaying(condition.objectId);

      default:
        return true;
    }
  }

  // ==========================================================================
  // ACTION EXECUTION
  // ==========================================================================

  async executeAction(targetObjectId: string, action: TriggerAction): Promise<void> {
    if (!this.context) {
      log.warn('No context set for trigger engine');
      return;
    }

    switch (action.type) {
      case 'go-to-state':
        await this.context.setObjectState(targetObjectId, action.stateId, action.animate ?? true);
        break;

      case 'toggle-visibility': {
        const isVisible = this.context.isObjectVisible(targetObjectId);
        this.context.setObjectVisible(targetObjectId, !isVisible);
        break;
      }

      case 'show':
        this.context.setObjectVisible(targetObjectId, true);
        break;

      case 'hide':
        this.context.setObjectVisible(targetObjectId, false);
        break;

      case 'play-media':
        this.context.playMedia(targetObjectId);
        break;

      case 'pause-media':
        this.context.pauseMedia(targetObjectId);
        break;

      case 'seek-media':
        this.context.seekMedia(targetObjectId, action.time);
        break;

      case 'focus':
        this.context.focusObject(targetObjectId);
        break;

      case 'blur':
        this.context.blurObject(targetObjectId);
        break;

      case 'scroll-to':
        this.context.scrollToObject(targetObjectId);
        break;

      case 'emit-xapi':
        this.context.emitXAPIStatement(action.verb, action.object);
        break;

      case 'set-variable':
        this.context.setVariable(action.variableName, action.value);
        break;

      case 'increment-variable': {
        const currentValue = this.context.getVariable(action.variableName);
        if (typeof currentValue === 'number') {
          this.context.setVariable(action.variableName, currentValue + action.amount);
        }
        break;
      }

      case 'enable':
      case 'disable':
        // TODO(LXD-312): Implement enable/disable in context
        void targetObjectId;
        break;

      case 'custom':
        // TODO(LXD-312): Register custom handlers
        void action.data;
        break;
    }
  }

  // ==========================================================================
  // TIMER TRIGGERS
  // ==========================================================================

  scheduleTimerTrigger(ruleId: string, objectId: string, delay: number): void {
    // Clear existing timer for this rule
    const existingTimer = this.timerIds.get(ruleId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timerId = setTimeout(() => {
      this.emit(objectId, { type: 'timer', delay });
      this.timerIds.delete(ruleId);
    }, delay);

    this.timerIds.set(ruleId, timerId);
  }

  cancelTimerTrigger(ruleId: string): void {
    const timerId = this.timerIds.get(ruleId);
    if (timerId) {
      clearTimeout(timerId);
      this.timerIds.delete(ruleId);
    }
  }

  // ==========================================================================
  // SERIALIZATION
  // ==========================================================================

  toJSON(): { rules: TriggerRule[] } {
    return {
      rules: Array.from(this.rules.values()),
    };
  }

  fromJSON(data: { rules: TriggerRule[] }): void {
    this.clearAllRules();
    for (const rule of data.rules) {
      this.rules.set(rule.id, rule);
    }
  }

  // ==========================================================================
  // DEBUG
  // ==========================================================================

  debug(): void {
    log.debug('State Trigger Engine Debug', {
      rules: this.rules.size,
      listeners: this.listeners.size,
      eventQueue: this.eventQueue.length,
      activeTimers: this.timerIds.size,
      contextSet: this.context ? 'Set' : 'Not set',
    });
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const triggerEngine = new StateTriggerEngine();

export default StateTriggerEngine;
