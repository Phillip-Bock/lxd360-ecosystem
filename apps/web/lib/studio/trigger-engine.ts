/**
 * TriggerEngine - Phase 9
 * Core engine for handling triggers and executing actions
 */

import { logger } from '@/lib/logger';
import type {
  AnimateActionConfig,
  AudioActionConfig,
  ControlFlowActionConfig,
  CustomConditionConfig,
  JavaScriptActionConfig,
  KeyEventConfig,
  MediaActionConfig,
  MediaEventConfig,
  MouseEventConfig,
  NavigationActionConfig,
  ObjectConditionConfig,
  StateActionConfig,
  TimelineActionConfig,
  Trigger,
  TriggerAction,
  TriggerAPI,
  TriggerCondition,
  TriggerContext,
  TriggerEvent,
  TriggerEventType,
  TriggerExecution,
  VariableActionConfig,
  VariableConditionConfig,
  VariableEventConfig,
  VisibilityActionConfig,
  XAPIActionConfig,
} from '@/types/studio/triggers';

const log = logger.scope('TriggerEngine');

// =============================================================================
// TRIGGER ENGINE CLASS
// =============================================================================

export class TriggerEngine {
  private triggers: Map<string, Trigger> = new Map();
  private objectTriggers: Map<string, Set<string>> = new Map();
  private slideTriggers: Map<string, Set<string>> = new Map();
  private globalTriggers: Set<string> = new Set();

  private executionHistory: TriggerExecution[] = [];
  private executionCounts: Map<string, number> = new Map();
  private lastExecutionTime: Map<string, number> = new Map();

  private variables: Map<string, unknown> = new Map();
  private objectStates: Map<string, string> = new Map();
  private objectVisibility: Map<string, boolean> = new Map();

  private api: TriggerAPI;
  private isEnabled = true;
  private debugMode = false;

  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private throttleTimers: Map<string, boolean> = new Map();

  constructor(api: TriggerAPI) {
    this.api = api;
  }

  // ----------------------------------------
  // TRIGGER REGISTRATION
  // ----------------------------------------

  registerTrigger(trigger: Trigger, scope: { objectId?: string; slideId?: string }): void {
    this.triggers.set(trigger.id, trigger);

    if (scope.objectId) {
      const objectSet = this.objectTriggers.get(scope.objectId) || new Set<string>();
      objectSet.add(trigger.id);
      this.objectTriggers.set(scope.objectId, objectSet);
    } else if (scope.slideId) {
      const slideSet = this.slideTriggers.get(scope.slideId) || new Set<string>();
      slideSet.add(trigger.id);
      this.slideTriggers.set(scope.slideId, slideSet);
    } else {
      this.globalTriggers.add(trigger.id);
    }

    if (this.debugMode) {
      this.api.log(`[TriggerEngine] Registered trigger: ${trigger.name}`);
    }
  }

  registerTriggers(triggers: Trigger[], scope: { objectId?: string; slideId?: string }): void {
    for (const trigger of triggers) {
      this.registerTrigger(trigger, scope);
    }
  }

  unregisterTrigger(triggerId: string): void {
    const trigger = this.triggers.get(triggerId);
    if (!trigger) return;

    this.triggers.delete(triggerId);
    this.executionCounts.delete(triggerId);
    this.lastExecutionTime.delete(triggerId);

    // Clear any pending debounce/throttle timers
    const debounceTimer = this.debounceTimers.get(triggerId);
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      this.debounceTimers.delete(triggerId);
    }
    this.throttleTimers.delete(triggerId);

    // Remove from all scopes
    this.objectTriggers.forEach((set) => {
      set.delete(triggerId);
    });
    this.slideTriggers.forEach((set) => {
      set.delete(triggerId);
    });
    this.globalTriggers.delete(triggerId);

    if (this.debugMode) {
      this.api.log(`[TriggerEngine] Unregistered trigger: ${trigger.name}`);
    }
  }

  unregisterObjectTriggers(objectId: string): void {
    const triggerIds = this.objectTriggers.get(objectId);
    if (triggerIds) {
      triggerIds.forEach((id) => {
        this.unregisterTrigger(id);
      });
      this.objectTriggers.delete(objectId);
    }
  }

  unregisterSlideTriggers(slideId: string): void {
    const triggerIds = this.slideTriggers.get(slideId);
    if (triggerIds) {
      triggerIds.forEach((id) => {
        this.unregisterTrigger(id);
      });
      this.slideTriggers.delete(slideId);
    }
  }

  clearAllTriggers(): void {
    // Clear all debounce/throttle timers
    this.debounceTimers.forEach((timer) => {
      clearTimeout(timer);
    });
    this.debounceTimers.clear();
    this.throttleTimers.clear();

    this.triggers.clear();
    this.objectTriggers.clear();
    this.slideTriggers.clear();
    this.globalTriggers.clear();
    this.executionCounts.clear();
    this.lastExecutionTime.clear();

    if (this.debugMode) {
      this.api.log('[TriggerEngine] Cleared all triggers');
    }
  }

  // ----------------------------------------
  // EVENT HANDLING
  // ----------------------------------------

  handleEvent(
    eventType: TriggerEventType,
    context: {
      objectId?: string;
      slideId?: string;
      originalEvent?: Event;
      eventData?: Record<string, unknown>;
    },
  ): void {
    if (!this.isEnabled) return;

    const timestamp = Date.now();
    const triggersToCheck: Trigger[] = [];

    // Collect relevant triggers
    if (context.objectId) {
      const objectTriggerIds = this.objectTriggers.get(context.objectId);
      objectTriggerIds?.forEach((id) => {
        const trigger = this.triggers.get(id);
        if (trigger) triggersToCheck.push(trigger);
      });
    }

    if (context.slideId) {
      const slideTriggerIds = this.slideTriggers.get(context.slideId);
      slideTriggerIds?.forEach((id) => {
        const trigger = this.triggers.get(id);
        if (trigger) triggersToCheck.push(trigger);
      });
    }

    this.globalTriggers.forEach((id) => {
      const trigger = this.triggers.get(id);
      if (trigger) triggersToCheck.push(trigger);
    });

    // Sort by priority (higher first)
    triggersToCheck.sort((a, b) => (b.settings.priority || 0) - (a.settings.priority || 0));

    if (this.debugMode && triggersToCheck.length > 0) {
      this.api.log(
        `[TriggerEngine] Event "${eventType}" - checking ${triggersToCheck.length} triggers`,
      );
    }

    // Check and execute matching triggers
    for (const trigger of triggersToCheck) {
      if (this.shouldExecuteTrigger(trigger, eventType, context, timestamp)) {
        // Handle debounce
        if (trigger.settings.debounce && trigger.settings.debounce > 0) {
          this.handleDebounce(trigger, eventType, context, timestamp);
          continue;
        }

        // Handle throttle
        if (trigger.settings.throttle && trigger.settings.throttle > 0) {
          if (this.throttleTimers.get(trigger.id)) {
            continue; // Skip if throttled
          }
          this.throttleTimers.set(trigger.id, true);
          setTimeout(() => {
            this.throttleTimers.delete(trigger.id);
          }, trigger.settings.throttle);
        }

        this.executeTrigger(trigger, {
          event: {
            type: eventType,
            originalEvent: context.originalEvent,
            timestamp,
          },
          source: {
            objectId: context.objectId || '',
            objectType: 'unknown',
            slideId: context.slideId || '',
            lessonId: '',
          },
          state: {
            variables: this.variables,
            objectStates: this.objectStates,
            slideIndex: 0,
            isPlaying: true,
          },
          api: this.api,
        });

        // Handle stop propagation
        if (trigger.settings.stopPropagation) {
          context.originalEvent?.stopPropagation();
          break;
        }

        // Handle prevent default
        if (trigger.settings.preventDefault) {
          context.originalEvent?.preventDefault();
        }
      }
    }
  }

  private handleDebounce(
    trigger: Trigger,
    eventType: TriggerEventType,
    context: {
      objectId?: string;
      slideId?: string;
      originalEvent?: Event;
      eventData?: Record<string, unknown>;
    },
    timestamp: number,
  ): void {
    const existingTimer = this.debounceTimers.get(trigger.id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      this.debounceTimers.delete(trigger.id);
      this.executeTrigger(trigger, {
        event: {
          type: eventType,
          originalEvent: context.originalEvent,
          timestamp,
        },
        source: {
          objectId: context.objectId || '',
          objectType: 'unknown',
          slideId: context.slideId || '',
          lessonId: '',
        },
        state: {
          variables: this.variables,
          objectStates: this.objectStates,
          slideIndex: 0,
          isPlaying: true,
        },
        api: this.api,
      });
    }, trigger.settings.debounce);

    this.debounceTimers.set(trigger.id, timer);
  }

  // ----------------------------------------
  // TRIGGER EXECUTION
  // ----------------------------------------

  private shouldExecuteTrigger(
    trigger: Trigger,
    eventType: TriggerEventType,
    context: {
      objectId?: string;
      slideId?: string;
      eventData?: Record<string, unknown>;
    },
    timestamp: number,
  ): boolean {
    // Check if enabled
    if (!trigger.enabled) return false;

    // Check event type matches
    if (trigger.event.type !== eventType) return false;

    // Check source object
    if (trigger.event.sourceObjectId) {
      const expectedSource =
        trigger.event.sourceObjectId === 'self' ? context.objectId : trigger.event.sourceObjectId;

      if (context.objectId !== expectedSource) return false;
    }

    // Check execute once
    if (trigger.settings.executeOnce) {
      const count = this.executionCounts.get(trigger.id) || 0;
      if (count > 0) return false;
    }

    // Check execute count
    if (trigger.settings.executeCount && trigger.settings.executeCount > 0) {
      const count = this.executionCounts.get(trigger.id) || 0;
      if (count >= trigger.settings.executeCount) return false;
    }

    // Check cooldown
    if (trigger.settings.cooldown && trigger.settings.cooldown > 0) {
      const lastExec = this.lastExecutionTime.get(trigger.id);
      if (lastExec && timestamp - lastExec < trigger.settings.cooldown) {
        return false;
      }
    }

    // Check event-specific config
    if (!this.checkEventConfig(trigger.event, context.eventData)) {
      return false;
    }

    // Check conditions
    if (trigger.conditions && trigger.conditions.length > 0) {
      const allConditionsMet = trigger.conditions.every((condition) =>
        this.evaluateCondition(condition),
      );
      if (!allConditionsMet) return false;
    }

    return true;
  }

  private checkEventConfig(event: TriggerEvent, eventData?: Record<string, unknown>): boolean {
    const config = event.config;

    switch (config.type) {
      case 'key': {
        const keyConfig = config as KeyEventConfig;
        if (!eventData) return false;
        const pressedKey = eventData.key as string;

        if (keyConfig.key && pressedKey !== keyConfig.key) return false;
        if (keyConfig.keys && !keyConfig.keys.includes(pressedKey)) return false;

        if (keyConfig.keyCombo) {
          const combo = keyConfig.keyCombo.toLowerCase();
          const ctrl = eventData.ctrlKey as boolean;
          const shift = eventData.shiftKey as boolean;
          const alt = eventData.altKey as boolean;
          const meta = eventData.metaKey as boolean;

          const requiredCtrl = combo.includes('ctrl+');
          const requiredShift = combo.includes('shift+');
          const requiredAlt = combo.includes('alt+');
          const requiredMeta = combo.includes('cmd+') || combo.includes('meta+');

          if (requiredCtrl !== ctrl) return false;
          if (requiredShift !== shift) return false;
          if (requiredAlt !== alt) return false;
          if (requiredMeta !== meta) return false;

          const keyPart = combo.split('+').pop();
          if (keyPart && pressedKey.toLowerCase() !== keyPart) return false;
        }

        return true;
      }

      case 'mouse': {
        const mouseConfig = config as MouseEventConfig;
        if (!eventData) return true;

        if (mouseConfig.button) {
          const button = eventData.button as number;
          const buttonMap: Record<string, number> = {
            left: 0,
            middle: 1,
            right: 2,
          };
          if (button !== buttonMap[mouseConfig.button]) return false;
        }

        if (mouseConfig.modifiers) {
          if (mouseConfig.modifiers.ctrl && !eventData.ctrlKey) return false;
          if (mouseConfig.modifiers.shift && !eventData.shiftKey) return false;
          if (mouseConfig.modifiers.alt && !eventData.altKey) return false;
          if (mouseConfig.modifiers.meta && !eventData.metaKey) return false;
        }

        return true;
      }

      case 'media': {
        const mediaConfig = config as MediaEventConfig;
        if (!eventData) return false;

        if (mediaConfig.timestamp !== undefined) {
          const currentTime = eventData.currentTime as number;
          const tolerance = mediaConfig.tolerance || 100;
          if (Math.abs(currentTime - mediaConfig.timestamp) > tolerance) return false;
        }

        if (mediaConfig.progress !== undefined) {
          const progress = eventData.progress as number;
          if (Math.abs(progress - mediaConfig.progress) > 0.01) return false;
        }

        return true;
      }

      case 'variable': {
        const varConfig = config as VariableEventConfig;
        const currentValue = this.variables.get(varConfig.variableId);

        switch (varConfig.operator) {
          case 'equals':
            return currentValue === varConfig.value;
          case 'not-equals':
            return currentValue !== varConfig.value;
          case 'gt':
            return (currentValue as number) > (varConfig.value as number);
          case 'gte':
            return (currentValue as number) >= (varConfig.value as number);
          case 'lt':
            return (currentValue as number) < (varConfig.value as number);
          case 'lte':
            return (currentValue as number) <= (varConfig.value as number);
          case 'contains':
            return String(currentValue).includes(String(varConfig.value));
          case 'changed':
            return true;
          default:
            return true;
        }
      }

      default:
        return true;
    }
  }

  private async executeTrigger(trigger: Trigger, context: TriggerContext): Promise<void> {
    const startTime = Date.now();
    const execution: TriggerExecution = {
      id: `exec_${startTime}_${trigger.id}`,
      triggerId: trigger.id,
      triggerName: trigger.name,
      event: trigger.event.type,
      timestamp: startTime,
      duration: 0,
      success: true,
      actionsExecuted: [],
    };

    if (this.debugMode) {
      this.api.log(`[TriggerEngine] Executing trigger: ${trigger.name}`);
    }

    try {
      // Apply initial delay
      if (trigger.settings.delay && trigger.settings.delay > 0) {
        await this.api.wait(trigger.settings.delay);
      }

      // Screen reader announcement
      if (trigger.settings.announceToScreenReader) {
        this.announceToScreenReader(trigger.settings.announceToScreenReader);
      }

      // Execute actions in sequence
      for (const action of trigger.actions) {
        if (!action.enabled) continue;

        const actionStart = Date.now();
        let actionSuccess = true;
        let actionError: string | undefined;

        try {
          // Apply action delay
          if (action.delay && action.delay > 0) {
            await this.api.wait(action.delay);
          }

          await this.executeAction(action, context);
        } catch (error) {
          actionSuccess = false;
          actionError = error instanceof Error ? error.message : String(error);

          if (action.onError === 'retry' && action.maxRetries) {
            for (let i = 0; i < action.maxRetries; i++) {
              try {
                await this.executeAction(action, context);
                actionSuccess = true;
                actionError = undefined;
                break;
              } catch {
                // Continue retrying
              }
            }
          }

          if (!actionSuccess && action.onError !== 'ignore' && !trigger.settings.continueOnError) {
            throw error;
          }
        }

        execution.actionsExecuted.push({
          actionId: action.id,
          actionType: action.type,
          success: actionSuccess,
          error: actionError,
          duration: Date.now() - actionStart,
        });
      }

      // Update execution tracking
      const count = this.executionCounts.get(trigger.id) || 0;
      this.executionCounts.set(trigger.id, count + 1);
      this.lastExecutionTime.set(trigger.id, startTime);
    } catch (error) {
      execution.success = false;
      execution.error = error instanceof Error ? error.message : String(error);

      if (this.debugMode) {
        log.error('Trigger execution failed', error, { triggerName: trigger.name });
      }
    }

    execution.duration = Date.now() - startTime;
    this.executionHistory.push(execution);

    // Limit history size
    if (this.executionHistory.length > 1000) {
      this.executionHistory = this.executionHistory.slice(-500);
    }

    if (this.debugMode) {
      this.api.log(
        `[TriggerEngine] Trigger "${trigger.name}" completed in ${execution.duration}ms`,
      );
    }
  }

  // ----------------------------------------
  // ACTION EXECUTION
  // ----------------------------------------

  private async executeAction(action: TriggerAction, context: TriggerContext): Promise<void> {
    const targetId =
      action.targetObjectId === 'self' ? context.source.objectId : action.targetObjectId;

    const targetIds = action.targetObjectIds || (targetId ? [targetId] : []);

    switch (action.type) {
      // Visibility actions
      case 'show': {
        const config = action.config as VisibilityActionConfig;
        for (const id of targetIds) {
          context.api.showObject(id, config.transition);
          this.objectVisibility.set(id, true);
        }
        break;
      }

      case 'hide': {
        const config = action.config as VisibilityActionConfig;
        for (const id of targetIds) {
          context.api.hideObject(id, config.transition);
          this.objectVisibility.set(id, false);
        }
        break;
      }

      case 'toggle-visibility': {
        const config = action.config as VisibilityActionConfig;
        for (const id of targetIds) {
          const isVisible = this.objectVisibility.get(id) ?? true;
          if (isVisible) {
            context.api.hideObject(id, config.transition);
            this.objectVisibility.set(id, false);
          } else {
            context.api.showObject(id, config.transition);
            this.objectVisibility.set(id, true);
          }
        }
        break;
      }

      case 'fade-in': {
        const config = action.config as VisibilityActionConfig;
        for (const id of targetIds) {
          context.api.showObject(id, {
            type: 'fade',
            duration: config.transition?.duration || 300,
            easing: config.transition?.easing,
          });
          this.objectVisibility.set(id, true);
        }
        break;
      }

      case 'fade-out': {
        const config = action.config as VisibilityActionConfig;
        for (const id of targetIds) {
          context.api.hideObject(id, {
            type: 'fade',
            duration: config.transition?.duration || 300,
            easing: config.transition?.easing,
          });
          this.objectVisibility.set(id, false);
        }
        break;
      }

      // State actions
      case 'go-to-state': {
        const config = action.config as StateActionConfig;
        if (config.stateId) {
          for (const id of targetIds) {
            context.api.setObjectState(id, config.stateId);
          }
        }
        break;
      }

      case 'reset-state': {
        for (const id of targetIds) {
          context.api.setObjectState(id, 'default');
        }
        break;
      }

      // Animation actions
      case 'animate': {
        const config = action.config as AnimateActionConfig;
        for (const id of targetIds) {
          context.api.animateObject(id, config.animation);
        }
        break;
      }

      // Navigation actions
      case 'go-to-slide': {
        const config = action.config as NavigationActionConfig;
        if (config.slideId) {
          context.api.goToSlide(config.slideId, config.transition);
        } else if (config.slideIndex !== undefined) {
          context.api.goToSlide(config.slideIndex, config.transition);
        }
        break;
      }

      case 'go-to-next-slide':
        context.api.goToNextSlide();
        break;

      case 'go-to-previous-slide':
        context.api.goToPreviousSlide();
        break;

      case 'go-to-layer': {
        const config = action.config as NavigationActionConfig;
        if (config.layerId) {
          context.api.showLayer(config.layerId);
        }
        break;
      }

      case 'close-layer': {
        const config = action.config as NavigationActionConfig;
        if (config.layerId) {
          context.api.hideLayer(config.layerId);
        }
        break;
      }

      // Media actions
      case 'play-media': {
        const config = action.config as MediaActionConfig;
        const mediaId = config.mediaObjectId || targetId;
        if (mediaId) {
          if (config.seekTo !== undefined) {
            context.api.seekMedia(mediaId, config.seekTo);
          }
          context.api.playMedia(mediaId);
        }
        break;
      }

      case 'pause-media': {
        const config = action.config as MediaActionConfig;
        const mediaId = config.mediaObjectId || targetId;
        if (mediaId) {
          context.api.pauseMedia(mediaId);
        }
        break;
      }

      case 'seek-media': {
        const config = action.config as MediaActionConfig;
        const mediaId = config.mediaObjectId || targetId;
        if (mediaId && config.seekTo !== undefined) {
          context.api.seekMedia(mediaId, config.seekTo);
        }
        break;
      }

      // Timeline actions
      case 'play-timeline':
        context.api.playTimeline();
        break;

      case 'pause-timeline':
        context.api.pauseTimeline();
        break;

      case 'seek-timeline': {
        const config = action.config as TimelineActionConfig;
        if (config.seekTo !== undefined) {
          context.api.seekTimeline(config.seekTo);
        }
        break;
      }

      // Variable actions
      case 'set-variable': {
        const config = action.config as VariableActionConfig;
        context.api.setVariable(config.variableId, config.value);
        break;
      }

      case 'increment-variable': {
        const config = action.config as VariableActionConfig;
        const current = (context.api.getVariable(config.variableId) as number) || 0;
        const amount = config.amount || 1;
        context.api.setVariable(config.variableId, current + amount);
        break;
      }

      case 'decrement-variable': {
        const config = action.config as VariableActionConfig;
        const current = (context.api.getVariable(config.variableId) as number) || 0;
        const amount = config.amount || 1;
        context.api.setVariable(config.variableId, current - amount);
        break;
      }

      case 'toggle-variable': {
        const config = action.config as VariableActionConfig;
        const current = context.api.getVariable(config.variableId);
        context.api.setVariable(config.variableId, !current);
        break;
      }

      case 'reset-variable': {
        const config = action.config as VariableActionConfig;
        context.api.setVariable(config.variableId, config.value ?? null);
        break;
      }

      // Audio actions
      case 'play-sound': {
        const config = action.config as AudioActionConfig;
        if (config.src) {
          context.api.playSound(config.src, config);
        }
        break;
      }

      case 'stop-sound': {
        const config = action.config as AudioActionConfig;
        context.api.stopSound(config.src);
        break;
      }

      case 'stop-all-sounds':
        context.api.stopSound();
        break;

      // xAPI actions
      case 'emit-xapi-statement': {
        const config = action.config as XAPIActionConfig;
        context.api.emitStatement(config);
        break;
      }

      // URL actions
      case 'open-url': {
        const config = action.config as {
          type: 'url';
          url: string;
          target?: string;
        };
        if (typeof window !== 'undefined') {
          window.open(config.url, config.target || '_blank');
        }
        break;
      }

      // JavaScript actions
      case 'execute-javascript': {
        const config = action.config as JavaScriptActionConfig;
        await this.executeJavaScript(config, context);
        break;
      }

      // Control flow
      case 'if-then-else': {
        const config = action.config as ControlFlowActionConfig;
        if (config.condition) {
          const conditionMet = this.evaluateCondition(config.condition);
          const actionsToExecute = conditionMet ? config.thenActions : config.elseActions;

          if (actionsToExecute) {
            for (const subAction of actionsToExecute) {
              await this.executeAction(subAction, context);
            }
          }
        }
        break;
      }

      case 'loop': {
        const config = action.config as ControlFlowActionConfig;
        if (config.loopCount && config.loopActions) {
          for (let i = 0; i < config.loopCount; i++) {
            if (config.loopVariable) {
              context.api.setVariable(config.loopVariable, i);
            }
            for (const subAction of config.loopActions) {
              await this.executeAction(subAction, context);
            }
          }
        }
        break;
      }

      case 'delay': {
        const config = action.config as ControlFlowActionConfig;
        if (config.delayMs) {
          await context.api.wait(config.delayMs);
        }
        break;
      }

      case 'dispatch-event': {
        const config = action.config as unknown as { eventName: string; payload?: unknown };
        context.api.dispatchEvent(config.eventName, config.payload);
        break;
      }

      default:
        if (this.debugMode) {
          log.warn('Unknown action type', { actionType: action.type });
        }
    }
  }

  // ----------------------------------------
  // JAVASCRIPT EXECUTION
  // ----------------------------------------

  private async executeJavaScript(
    config: JavaScriptActionConfig,
    context: TriggerContext,
  ): Promise<void> {
    const { code, async: isAsync, timeout = 5000 } = config;

    // Create execution context with safe API access
    const safeContext = {
      // Variables
      getVariable: context.api.getVariable,
      setVariable: context.api.setVariable,

      // Objects
      showObject: context.api.showObject,
      hideObject: context.api.hideObject,
      setObjectState: context.api.setObjectState,
      animateObject: context.api.animateObject,

      // Navigation
      goToSlide: context.api.goToSlide,
      goToNextSlide: context.api.goToNextSlide,
      goToPreviousSlide: context.api.goToPreviousSlide,
      showLayer: context.api.showLayer,
      hideLayer: context.api.hideLayer,

      // Media
      playMedia: context.api.playMedia,
      pauseMedia: context.api.pauseMedia,
      seekMedia: context.api.seekMedia,

      // Audio
      playSound: context.api.playSound,
      stopSound: context.api.stopSound,

      // Timeline
      playTimeline: context.api.playTimeline,
      pauseTimeline: context.api.pauseTimeline,
      seekTimeline: context.api.seekTimeline,

      // Utilities
      wait: context.api.wait,
      log: context.api.log,
      dispatchEvent: context.api.dispatchEvent,

      // Event info
      event: context.event,
      source: context.source,
    };

    const contextKeys = Object.keys(safeContext);
    const contextValues = Object.values(safeContext);

    try {
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error('JavaScript execution timeout')), timeout);
      });

      const executePromise = new Promise<void>((resolve, reject) => {
        try {
          const fn = new Function(
            ...contextKeys,
            isAsync ? `return (async () => { ${code} })()` : code,
          );
          const result = fn(...contextValues);

          if (result instanceof Promise) {
            result.then(() => resolve()).catch(reject);
          } else {
            resolve();
          }
        } catch (error) {
          reject(error);
        }
      });

      await Promise.race([executePromise, timeoutPromise]);
    } catch (error) {
      log.error('JavaScript execution error', error);
      throw error;
    }
  }

  // ----------------------------------------
  // CONDITION EVALUATION
  // ----------------------------------------

  private evaluateCondition(condition: TriggerCondition): boolean {
    let result = false;

    switch (condition.type) {
      case 'variable-equals': {
        const config = condition.config as VariableConditionConfig;
        result = this.variables.get(config.variableId) === config.value;
        break;
      }

      case 'variable-not-equals': {
        const config = condition.config as VariableConditionConfig;
        result = this.variables.get(config.variableId) !== config.value;
        break;
      }

      case 'variable-gt': {
        const config = condition.config as VariableConditionConfig;
        result = (this.variables.get(config.variableId) as number) > (config.value as number);
        break;
      }

      case 'variable-gte': {
        const config = condition.config as VariableConditionConfig;
        result = (this.variables.get(config.variableId) as number) >= (config.value as number);
        break;
      }

      case 'variable-lt': {
        const config = condition.config as VariableConditionConfig;
        result = (this.variables.get(config.variableId) as number) < (config.value as number);
        break;
      }

      case 'variable-lte': {
        const config = condition.config as VariableConditionConfig;
        result = (this.variables.get(config.variableId) as number) <= (config.value as number);
        break;
      }

      case 'variable-contains': {
        const config = condition.config as VariableConditionConfig;
        result = String(this.variables.get(config.variableId)).includes(String(config.value));
        break;
      }

      case 'variable-empty': {
        const config = condition.config as VariableConditionConfig;
        const value = this.variables.get(config.variableId);
        result = value === undefined || value === null || value === '';
        break;
      }

      case 'object-visible': {
        const config = condition.config as ObjectConditionConfig;
        result = this.objectVisibility.get(config.objectId) ?? true;
        break;
      }

      case 'object-hidden': {
        const config = condition.config as ObjectConditionConfig;
        result = !(this.objectVisibility.get(config.objectId) ?? true);
        break;
      }

      case 'object-in-state': {
        const config = condition.config as ObjectConditionConfig;
        result = this.objectStates.get(config.objectId) === config.stateId;
        break;
      }

      case 'custom-expression': {
        const config = condition.config as CustomConditionConfig;
        try {
          const fn = new Function('variables', 'states', `return ${config.expression}`);
          result = fn(Object.fromEntries(this.variables), Object.fromEntries(this.objectStates));
        } catch (error) {
          log.error('Custom condition error', error);
          result = false;
        }
        break;
      }

      default:
        result = true;
    }

    return condition.negate ? !result : result;
  }

  // ----------------------------------------
  // STATE MANAGEMENT
  // ----------------------------------------

  setVariable(id: string, value: unknown): void {
    const previousValue = this.variables.get(id);
    this.variables.set(id, value);

    // Dispatch variable change event
    this.handleEvent('variable-change', {
      eventData: {
        variableId: id,
        value,
        previousValue,
      },
    });
  }

  getVariable(id: string): unknown {
    return this.variables.get(id);
  }

  setAllVariables(variables: Map<string, unknown>): void {
    this.variables = new Map(variables);
  }

  setObjectState(objectId: string, stateId: string): void {
    const previousState = this.objectStates.get(objectId);
    this.objectStates.set(objectId, stateId);

    // Dispatch state events
    if (previousState) {
      this.handleEvent('state-exit', {
        objectId,
        eventData: { stateId: previousState },
      });
    }

    this.handleEvent('state-enter', {
      objectId,
      eventData: { stateId },
    });
  }

  setObjectVisibility(objectId: string, visible: boolean): void {
    this.objectVisibility.set(objectId, visible);
  }

  // ----------------------------------------
  // ACCESSIBILITY
  // ----------------------------------------

  private announceToScreenReader(message: string): void {
    if (typeof document === 'undefined') return;

    const announcer = document.getElementById('trigger-announcer');
    if (announcer) {
      announcer.textContent = '';
      // Small delay to ensure the change is picked up
      setTimeout(() => {
        announcer.textContent = message;
      }, 50);
    }
  }

  // ----------------------------------------
  // DEBUG & HISTORY
  // ----------------------------------------

  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  isEngineEnabled(): boolean {
    return this.isEnabled;
  }

  getExecutionHistory(): TriggerExecution[] {
    return [...this.executionHistory];
  }

  clearExecutionHistory(): void {
    this.executionHistory = [];
  }

  getExecutionCount(triggerId: string): number {
    return this.executionCounts.get(triggerId) || 0;
  }

  resetExecutionCount(triggerId: string): void {
    this.executionCounts.delete(triggerId);
    this.lastExecutionTime.delete(triggerId);
  }

  resetAllExecutionCounts(): void {
    this.executionCounts.clear();
    this.lastExecutionTime.clear();
  }

  getTrigger(triggerId: string): Trigger | undefined {
    return this.triggers.get(triggerId);
  }

  getAllTriggers(): Trigger[] {
    return Array.from(this.triggers.values());
  }

  getObjectTriggers(objectId: string): Trigger[] {
    const triggerIds = this.objectTriggers.get(objectId);
    if (!triggerIds) return [];
    return Array.from(triggerIds)
      .map((id) => this.triggers.get(id))
      .filter((t): t is Trigger => t !== undefined);
  }

  // ----------------------------------------
  // CLEANUP
  // ----------------------------------------

  destroy(): void {
    this.clearAllTriggers();
    this.executionHistory = [];
    this.variables.clear();
    this.objectStates.clear();
    this.objectVisibility.clear();
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export function createTriggerEngine(api: TriggerAPI): TriggerEngine {
  return new TriggerEngine(api);
}
