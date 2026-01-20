/**
 * Triggers & Actions System Types - Phase 9
 * Comprehensive event-driven triggers and actions for rich interactivity
 */

// =============================================================================
// TRIGGER EVENT TYPES
// =============================================================================

/** All supported trigger event types */
export type TriggerEventType =
  // Mouse events
  | 'click'
  | 'double-click'
  | 'right-click'
  | 'mouse-enter'
  | 'mouse-leave'
  | 'mouse-down'
  | 'mouse-up'
  | 'hover-start'
  | 'hover-end'

  // Touch events
  | 'tap'
  | 'double-tap'
  | 'long-press'
  | 'swipe-left'
  | 'swipe-right'
  | 'swipe-up'
  | 'swipe-down'
  | 'pinch'
  | 'rotate'

  // Keyboard events
  | 'key-press'
  | 'key-down'
  | 'key-up'

  // Focus events
  | 'focus'
  | 'blur'

  // Drag events
  | 'drag-start'
  | 'drag-end'
  | 'drag-over'
  | 'drop'
  | 'drop-correct'
  | 'drop-incorrect'

  // Scroll events
  | 'scroll-start'
  | 'scroll-end'
  | 'scroll-to-element'
  | 'scroll-past-element'

  // Media events
  | 'media-play'
  | 'media-pause'
  | 'media-ended'
  | 'media-time'
  | 'media-progress'

  // Lifecycle events
  | 'slide-enter'
  | 'slide-exit'
  | 'object-enter'
  | 'object-exit'
  | 'lesson-start'
  | 'lesson-complete'

  // Timer events
  | 'timer-start'
  | 'timer-end'
  | 'timer-tick'
  | 'delay'

  // Variable events
  | 'variable-change'
  | 'variable-equals'
  | 'variable-gt'
  | 'variable-lt'

  // State events
  | 'state-enter'
  | 'state-exit'

  // Assessment events
  | 'answer-correct'
  | 'answer-incorrect'
  | 'answer-submitted'
  | 'quiz-complete'
  | 'quiz-passed'
  | 'quiz-failed'

  // Custom events
  | 'custom-event';

// =============================================================================
// EVENT CONFIGURATIONS
// =============================================================================

export interface KeyEventConfig {
  type: 'key';
  key?: string;
  keys?: string[];
  keyCombo?: string;
  preventDefault?: boolean;
}

export interface MouseEventConfig {
  type: 'mouse';
  button?: 'left' | 'right' | 'middle';
  modifiers?: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  };
  clickCount?: number;
}

export interface TouchEventConfig {
  type: 'touch';
  fingers?: number;
  direction?: 'left' | 'right' | 'up' | 'down' | 'any';
  minDistance?: number;
  maxDuration?: number;
  longPressDuration?: number;
}

export interface MediaEventConfig {
  type: 'media';
  mediaObjectId?: string;
  timestamp?: number;
  progress?: number;
  tolerance?: number;
}

export interface TimerEventConfig {
  type: 'timer';
  delay?: number;
  interval?: number;
  maxRepeat?: number;
}

export interface VariableEventConfig {
  type: 'variable';
  variableId: string;
  operator?: 'equals' | 'not-equals' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'changed';
  value?: string | number | boolean;
  previousValue?: string | number | boolean;
}

export interface StateEventConfig {
  type: 'state';
  objectId: string;
  stateId: string;
}

export interface ScrollEventConfig {
  type: 'scroll';
  targetElementId?: string;
  threshold?: number;
  offset?: number;
}

export interface CustomEventConfig {
  type: 'custom';
  eventName: string;
  payload?: Record<string, unknown>;
}

export type TriggerEventConfig =
  | KeyEventConfig
  | MouseEventConfig
  | TouchEventConfig
  | MediaEventConfig
  | TimerEventConfig
  | VariableEventConfig
  | StateEventConfig
  | ScrollEventConfig
  | CustomEventConfig;

// =============================================================================
// TRIGGER EVENT
// =============================================================================

export interface TriggerEvent {
  type: TriggerEventType;
  sourceObjectId?: string;
  config: TriggerEventConfig;
}

// =============================================================================
// TRIGGER CONDITIONS
// =============================================================================

export type ConditionType =
  | 'variable-equals'
  | 'variable-not-equals'
  | 'variable-gt'
  | 'variable-gte'
  | 'variable-lt'
  | 'variable-lte'
  | 'variable-contains'
  | 'variable-empty'
  | 'object-visible'
  | 'object-hidden'
  | 'object-in-state'
  | 'slide-is-current'
  | 'media-is-playing'
  | 'media-is-paused'
  | 'quiz-passed'
  | 'quiz-failed'
  | 'attempt-count'
  | 'score-gte'
  | 'score-lte'
  | 'time-elapsed-gte'
  | 'time-elapsed-lte'
  | 'device-is'
  | 'viewport-gte'
  | 'viewport-lte'
  | 'custom-expression';

export interface VariableConditionConfig {
  type: 'variable';
  variableId: string;
  value?: string | number | boolean;
}

export interface ObjectConditionConfig {
  type: 'object';
  objectId: string;
  stateId?: string;
}

export interface SlideConditionConfig {
  type: 'slide';
  slideId: string;
}

export interface MediaConditionConfig {
  type: 'media';
  mediaObjectId: string;
}

export interface QuizConditionConfig {
  type: 'quiz';
  quizId?: string;
  passingScore?: number;
}

export interface TimeConditionConfig {
  type: 'time';
  milliseconds: number;
}

export interface DeviceConditionConfig {
  type: 'device';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  minWidth?: number;
  maxWidth?: number;
}

export interface CustomConditionConfig {
  type: 'custom';
  expression: string;
}

export type ConditionConfig =
  | VariableConditionConfig
  | ObjectConditionConfig
  | SlideConditionConfig
  | MediaConditionConfig
  | QuizConditionConfig
  | TimeConditionConfig
  | DeviceConditionConfig
  | CustomConditionConfig;

export interface TriggerCondition {
  id: string;
  type: ConditionType;
  config: ConditionConfig;
  negate?: boolean;
}

// =============================================================================
// TRIGGER SETTINGS
// =============================================================================

export interface TriggerSettings {
  executeOnce: boolean;
  executeCount?: number;
  cooldown?: number;
  debounce?: number;
  throttle?: number;
  delay?: number;
  stopPropagation?: boolean;
  preventDefault?: boolean;
  priority?: number;
  continueOnError?: boolean;
  announceToScreenReader?: string;
}

// =============================================================================
// ACTION TYPES
// =============================================================================

/** All supported action types */
export type ActionType =
  // Visibility actions
  | 'show'
  | 'hide'
  | 'toggle-visibility'
  | 'fade-in'
  | 'fade-out'

  // State actions
  | 'go-to-state'
  | 'go-to-next-state'
  | 'go-to-previous-state'
  | 'reset-state'

  // Animation actions
  | 'animate'
  | 'stop-animation'
  | 'pause-animation'
  | 'resume-animation'

  // Navigation actions
  | 'go-to-slide'
  | 'go-to-next-slide'
  | 'go-to-previous-slide'
  | 'go-to-first-slide'
  | 'go-to-last-slide'
  | 'go-to-layer'
  | 'close-layer'
  | 'close-all-layers'

  // Media actions
  | 'play-media'
  | 'pause-media'
  | 'stop-media'
  | 'toggle-media'
  | 'seek-media'
  | 'set-volume'
  | 'mute-media'
  | 'unmute-media'

  // Timeline actions
  | 'play-timeline'
  | 'pause-timeline'
  | 'stop-timeline'
  | 'seek-timeline'
  | 'set-playback-rate'

  // Variable actions
  | 'set-variable'
  | 'increment-variable'
  | 'decrement-variable'
  | 'toggle-variable'
  | 'reset-variable'

  // Audio actions
  | 'play-sound'
  | 'stop-sound'
  | 'stop-all-sounds'

  // Focus actions
  | 'focus-object'
  | 'blur-object'
  | 'scroll-to-object'

  // Quiz actions
  | 'submit-answer'
  | 'reset-quiz'
  | 'show-feedback'
  | 'hide-feedback'
  | 'show-results'

  // xAPI actions
  | 'emit-xapi-statement'

  // Print/Export actions
  | 'print-slide'
  | 'download-file'
  | 'open-url'

  // Custom actions
  | 'execute-javascript'
  | 'dispatch-event'
  | 'call-function'

  // Control flow
  | 'if-then-else'
  | 'loop'
  | 'delay'
  | 'stop-actions';

// =============================================================================
// ACTION CONFIGURATIONS
// =============================================================================

export interface VisibilityActionConfig {
  type: 'visibility';
  transition?: {
    type: 'none' | 'fade' | 'slide' | 'scale' | 'custom';
    duration?: number;
    easing?: string;
    direction?: 'up' | 'down' | 'left' | 'right';
  };
}

export interface StateActionConfig {
  type: 'state';
  stateId?: string;
  transition?: boolean;
}

export interface AnimateActionConfig {
  type: 'animate';
  animation: {
    properties: Record<
      string,
      {
        from?: number | string;
        to: number | string;
      }
    >;
    duration: number;
    easing?: string;
    delay?: number;
    repeat?: number;
    yoyo?: boolean;
    stagger?: number;
  };
}

export interface NavigationActionConfig {
  type: 'navigation';
  slideId?: string;
  slideIndex?: number;
  layerId?: string;
  transition?: {
    type: 'none' | 'fade' | 'slide' | 'zoom' | 'flip';
    duration?: number;
    direction?: 'left' | 'right' | 'up' | 'down';
  };
  pushHistory?: boolean;
}

export interface MediaActionConfig {
  type: 'media';
  mediaObjectId?: string;
  seekTo?: number;
  seekToPercent?: number;
  volume?: number;
  playbackRate?: number;
  loop?: boolean;
  startTime?: number;
  endTime?: number;
}

export interface TimelineActionConfig {
  type: 'timeline';
  timelineId?: string;
  seekTo?: number;
  playbackRate?: number;
}

export interface VariableActionConfig {
  type: 'variable';
  variableId: string;
  value?: string | number | boolean;
  operation?: 'set' | 'add' | 'subtract' | 'multiply' | 'divide' | 'append' | 'toggle';
  amount?: number;
}

export interface AudioActionConfig {
  type: 'audio';
  src?: string;
  volume?: number;
  loop?: boolean;
  stopOthers?: boolean;
}

export interface FocusActionConfig {
  type: 'focus';
  scrollBehavior?: 'auto' | 'smooth' | 'instant';
  scrollBlock?: 'start' | 'center' | 'end' | 'nearest';
  highlight?: boolean;
  highlightDuration?: number;
}

export interface QuizActionConfig {
  type: 'quiz';
  quizId?: string;
  questionId?: string;
  feedbackLayerId?: string;
}

export interface XAPIActionConfig {
  type: 'xapi';
  verb: string;
  verbId?: string;
  objectId?: string;
  objectType?: string;
  objectName?: string;
  result?: {
    success?: boolean;
    completion?: boolean;
    score?: {
      raw?: number;
      min?: number;
      max?: number;
      scaled?: number;
    };
    duration?: string;
    response?: string;
  };
  context?: Record<string, unknown>;
  extensions?: Record<string, unknown>;
}

export interface URLActionConfig {
  type: 'url';
  url: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  downloadFilename?: string;
}

export interface JavaScriptActionConfig {
  type: 'javascript';
  code: string;
  async?: boolean;
  timeout?: number;
  sandboxed?: boolean;
}

export interface ControlFlowActionConfig {
  type: 'control-flow';
  condition?: TriggerCondition;
  thenActions?: TriggerAction[];
  elseActions?: TriggerAction[];
  loopCount?: number;
  loopVariable?: string;
  loopActions?: TriggerAction[];
  delayMs?: number;
}

export type ActionConfig =
  | VisibilityActionConfig
  | StateActionConfig
  | AnimateActionConfig
  | NavigationActionConfig
  | MediaActionConfig
  | TimelineActionConfig
  | VariableActionConfig
  | AudioActionConfig
  | FocusActionConfig
  | QuizActionConfig
  | XAPIActionConfig
  | URLActionConfig
  | JavaScriptActionConfig
  | ControlFlowActionConfig;

// =============================================================================
// TRIGGER ACTION
// =============================================================================

export interface TriggerAction {
  id: string;
  type: ActionType;
  name?: string;
  enabled: boolean;
  config: ActionConfig;
  delay?: number;
  duration?: number;
  targetObjectId?: string;
  targetObjectIds?: string[];
  onError?: 'ignore' | 'stop' | 'retry';
  maxRetries?: number;
}

// =============================================================================
// TRIGGER DEFINITION
// =============================================================================

export interface Trigger {
  id: string;
  name: string;
  enabled: boolean;
  event: TriggerEvent;
  conditions?: TriggerCondition[];
  actions: TriggerAction[];
  settings: TriggerSettings;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// TRIGGER CONTEXT & API
// =============================================================================

export interface TriggerContext {
  event: {
    type: TriggerEventType;
    originalEvent?: Event;
    timestamp: number;
  };
  source: {
    objectId: string;
    objectType: string;
    slideId: string;
    lessonId: string;
  };
  state: {
    variables: Map<string, unknown>;
    objectStates: Map<string, string>;
    slideIndex: number;
    isPlaying: boolean;
  };
  api: TriggerAPI;
}

export interface TriggerAPI {
  // Object manipulation
  showObject: (objectId: string, options?: VisibilityActionConfig['transition']) => void;
  hideObject: (objectId: string, options?: VisibilityActionConfig['transition']) => void;
  setObjectState: (objectId: string, stateId: string) => void;
  animateObject: (objectId: string, animation: AnimateActionConfig['animation']) => void;

  // Navigation
  goToSlide: (
    slideIdOrIndex: string | number,
    transition?: NavigationActionConfig['transition'],
  ) => void;
  goToNextSlide: () => void;
  goToPreviousSlide: () => void;
  showLayer: (layerId: string) => void;
  hideLayer: (layerId: string) => void;

  // Media
  playMedia: (objectId: string) => void;
  pauseMedia: (objectId: string) => void;
  seekMedia: (objectId: string, timeMs: number) => void;

  // Variables
  getVariable: (variableId: string) => unknown;
  setVariable: (variableId: string, value: unknown) => void;

  // Timeline
  playTimeline: () => void;
  pauseTimeline: () => void;
  seekTimeline: (timeMs: number) => void;

  // Audio
  playSound: (src: string, options?: AudioActionConfig) => void;
  stopSound: (src?: string) => void;

  // xAPI
  emitStatement: (config: XAPIActionConfig) => void;

  // Custom
  dispatchEvent: (eventName: string, payload?: unknown) => void;

  // Utilities
  wait: (ms: number) => Promise<void>;
  log: (...args: unknown[]) => void;
}

// =============================================================================
// OBJECT & SLIDE TRIGGERS
// =============================================================================

export interface ObjectTriggers {
  objectId: string;
  triggers: Trigger[];
  onClick?: TriggerAction[];
  onHover?: {
    enter?: TriggerAction[];
    exit?: TriggerAction[];
  };
  onKeyPress?: {
    key: string;
    actions: TriggerAction[];
  }[];
}

export interface SlideTriggers {
  slideId: string;
  onEnter?: TriggerAction[];
  onExit?: TriggerAction[];
  onComplete?: TriggerAction[];
  keyboardShortcuts?: {
    key: string;
    actions: TriggerAction[];
    description?: string;
  }[];
  triggers: Trigger[];
}

export interface LessonTriggers {
  lessonId: string;
  onStart?: TriggerAction[];
  onComplete?: TriggerAction[];
  onResume?: TriggerAction[];
  onSuspend?: TriggerAction[];
  globalShortcuts?: {
    key: string;
    actions: TriggerAction[];
    description?: string;
    allowOverride?: boolean;
  }[];
  triggers: Trigger[];
}

// =============================================================================
// TRIGGER EXECUTION HISTORY
// =============================================================================

export interface TriggerExecution {
  id: string;
  triggerId: string;
  triggerName: string;
  event: TriggerEventType;
  timestamp: number;
  duration: number;
  success: boolean;
  error?: string;
  actionsExecuted: {
    actionId: string;
    actionType: ActionType;
    success: boolean;
    error?: string;
    duration: number;
  }[];
}

// =============================================================================
// TRIGGER ENGINE STATE
// =============================================================================

export interface TriggerEngineState {
  isEnabled: boolean;
  debugMode: boolean;
  triggers: Map<string, Trigger>;
  executionHistory: TriggerExecution[];
  executionCounts: Map<string, number>;
  lastExecutionTime: Map<string, number>;
  variables: Map<string, unknown>;
  objectStates: Map<string, string>;
}

// =============================================================================
// DEFAULT TRIGGER SETTINGS
// =============================================================================

export const DEFAULT_TRIGGER_SETTINGS: TriggerSettings = {
  executeOnce: false,
  executeCount: 0,
  cooldown: 0,
  debounce: 0,
  throttle: 0,
  delay: 0,
  stopPropagation: false,
  preventDefault: false,
  priority: 0,
  continueOnError: true,
};

// =============================================================================
// TRIGGER EVENT TYPE CATEGORIES
// =============================================================================

export const TRIGGER_EVENT_CATEGORIES = {
  mouse: [
    'click',
    'double-click',
    'right-click',
    'mouse-enter',
    'mouse-leave',
    'mouse-down',
    'mouse-up',
    'hover-start',
    'hover-end',
  ] as TriggerEventType[],
  touch: [
    'tap',
    'double-tap',
    'long-press',
    'swipe-left',
    'swipe-right',
    'swipe-up',
    'swipe-down',
    'pinch',
    'rotate',
  ] as TriggerEventType[],
  keyboard: ['key-press', 'key-down', 'key-up'] as TriggerEventType[],
  focus: ['focus', 'blur'] as TriggerEventType[],
  drag: [
    'drag-start',
    'drag-end',
    'drag-over',
    'drop',
    'drop-correct',
    'drop-incorrect',
  ] as TriggerEventType[],
  scroll: [
    'scroll-start',
    'scroll-end',
    'scroll-to-element',
    'scroll-past-element',
  ] as TriggerEventType[],
  media: [
    'media-play',
    'media-pause',
    'media-ended',
    'media-time',
    'media-progress',
  ] as TriggerEventType[],
  lifecycle: [
    'slide-enter',
    'slide-exit',
    'object-enter',
    'object-exit',
    'lesson-start',
    'lesson-complete',
  ] as TriggerEventType[],
  timer: ['timer-start', 'timer-end', 'timer-tick', 'delay'] as TriggerEventType[],
  variable: [
    'variable-change',
    'variable-equals',
    'variable-gt',
    'variable-lt',
  ] as TriggerEventType[],
  state: ['state-enter', 'state-exit'] as TriggerEventType[],
  assessment: [
    'answer-correct',
    'answer-incorrect',
    'answer-submitted',
    'quiz-complete',
    'quiz-passed',
    'quiz-failed',
  ] as TriggerEventType[],
  custom: ['custom-event'] as TriggerEventType[],
};

// =============================================================================
// ACTION TYPE CATEGORIES
// =============================================================================

export const ACTION_TYPE_CATEGORIES = {
  visibility: ['show', 'hide', 'toggle-visibility', 'fade-in', 'fade-out'] as ActionType[],
  state: ['go-to-state', 'go-to-next-state', 'go-to-previous-state', 'reset-state'] as ActionType[],
  animation: ['animate', 'stop-animation', 'pause-animation', 'resume-animation'] as ActionType[],
  navigation: [
    'go-to-slide',
    'go-to-next-slide',
    'go-to-previous-slide',
    'go-to-first-slide',
    'go-to-last-slide',
    'go-to-layer',
    'close-layer',
    'close-all-layers',
  ] as ActionType[],
  media: [
    'play-media',
    'pause-media',
    'stop-media',
    'toggle-media',
    'seek-media',
    'set-volume',
    'mute-media',
    'unmute-media',
  ] as ActionType[],
  timeline: [
    'play-timeline',
    'pause-timeline',
    'stop-timeline',
    'seek-timeline',
    'set-playback-rate',
  ] as ActionType[],
  variable: [
    'set-variable',
    'increment-variable',
    'decrement-variable',
    'toggle-variable',
    'reset-variable',
  ] as ActionType[],
  audio: ['play-sound', 'stop-sound', 'stop-all-sounds'] as ActionType[],
  focus: ['focus-object', 'blur-object', 'scroll-to-object'] as ActionType[],
  quiz: [
    'submit-answer',
    'reset-quiz',
    'show-feedback',
    'hide-feedback',
    'show-results',
  ] as ActionType[],
  xapi: ['emit-xapi-statement'] as ActionType[],
  export: ['print-slide', 'download-file', 'open-url'] as ActionType[],
  custom: ['execute-javascript', 'dispatch-event', 'call-function'] as ActionType[],
  controlFlow: ['if-then-else', 'loop', 'delay', 'stop-actions'] as ActionType[],
};
