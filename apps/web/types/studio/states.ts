/**
 * INSPIRE Studio - Object State Types
 * Full state machine capabilities for canvas objects
 */

// =============================================================================
// STATE PROPERTIES - Visual properties that can change per state
// =============================================================================

export interface StateProperties {
  // Transform
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;

  // Appearance
  opacity?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  boxShadow?: string;

  // Typography (for text blocks)
  fontSize?: number;
  fontWeight?: number | string;
  fontStyle?: 'normal' | 'italic';
  color?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: 'none' | 'underline' | 'line-through';
  letterSpacing?: number;
  lineHeight?: number;

  // Media (for image/video)
  src?: string;
  filter?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none';
  objectPosition?: string;

  // Effects
  blur?: number;
  brightness?: number;
  contrast?: number;
  saturate?: number;
  grayscale?: number;
  sepia?: number;
  hueRotate?: number;

  // Clip & Mask
  clipPath?: string;
  maskImage?: string;

  // Custom CSS (for advanced users)
  customCSS?: Record<string, string>;
}

// =============================================================================
// EASING FUNCTIONS
// =============================================================================

export type EasingFunction =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'spring'
  | 'bounce'
  | 'elastic'
  | `cubic-bezier(${number},${number},${number},${number})`;

export const EASING_PRESETS: Record<string, EasingFunction> = {
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  spring: 'spring',
  bounce: 'bounce',
  elastic: 'elastic',
  snappy: 'cubic-bezier(0.4,0,0.2,1)',
  smooth: 'cubic-bezier(0.25,0.1,0.25,1)',
  dramatic: 'cubic-bezier(0.68,-0.55,0.265,1.55)',
};

// =============================================================================
// TRANSITION TRIGGERS
// =============================================================================

export type TransitionTriggerType =
  | 'click'
  | 'hover'
  | 'hover-end'
  | 'timer'
  | 'scroll'
  | 'scroll-in-view'
  | 'media-end'
  | 'media-play'
  | 'media-pause'
  | 'media-time'
  | 'cross-object'
  | 'variable-change'
  | 'quiz-correct'
  | 'quiz-incorrect'
  | 'custom';

export interface TransitionTrigger {
  type: TransitionTriggerType;
  config: TransitionTriggerConfig;
}

export interface TransitionTriggerConfig {
  // Timer trigger
  delay?: number; // ms

  // Scroll trigger
  scrollThreshold?: number; // 0-1 (percentage of viewport)
  scrollDirection?: 'up' | 'down' | 'both';
  scrollOffset?: number; // px

  // Media trigger
  mediaObjectId?: string;
  mediaEvent?: 'play' | 'pause' | 'end' | 'timeupdate';
  mediaTime?: number; // seconds

  // Cross-object trigger
  sourceObjectId?: string;
  sourceState?: string;
  sourceEvent?: 'enter' | 'exit';

  // Variable trigger
  variableName?: string;
  variableOperator?: 'equals' | 'not-equals' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains';
  variableValue?: string | number | boolean;

  // Custom trigger
  eventName?: string;
  eventData?: Record<string, unknown>;
}

// =============================================================================
// TRANSITION ANIMATION
// =============================================================================

export interface TransitionAnimation {
  duration: number; // ms
  easing: EasingFunction;
  delay?: number; // ms
  properties?: (keyof StateProperties)[]; // Which properties to animate (null = all)
  staggerDelay?: number; // For grouped objects
}

export const DEFAULT_ANIMATION: TransitionAnimation = {
  duration: 300,
  easing: 'ease-out',
  delay: 0,
};

// =============================================================================
// STATE TRANSITION
// =============================================================================

export interface StateTransition {
  id: string;
  name?: string;
  fromState: string;
  toState: string;
  trigger: TransitionTrigger;
  animation: TransitionAnimation;
  enabled: boolean;
  conditions?: TransitionCondition[];
}

export interface TransitionCondition {
  type:
    | 'state-is'
    | 'state-not'
    | 'variable-equals'
    | 'variable-gt'
    | 'variable-lt'
    | 'variable-contains';
  objectId?: string;
  stateId?: string;
  variableName?: string;
  value?: string | number | boolean;
  negate?: boolean;
}

// =============================================================================
// OBJECT STATE
// =============================================================================

export interface ObjectState {
  id: string;
  name: string;
  isDefault: boolean;
  properties: StateProperties;
  transitions: StateTransition[];
  sortOrder: number;
  description?: string;
  thumbnail?: string; // Base64 or URL for state preview
}

export const DEFAULT_STATE: Omit<ObjectState, 'id'> = {
  name: 'Default',
  isDefault: true,
  properties: {},
  transitions: [],
  sortOrder: 0,
};

// =============================================================================
// OBJECT STATE CONFIG
// =============================================================================

export interface ObjectStateConfig {
  objectId: string;
  states: ObjectState[];
  currentState: string;
  stateHistory: StateHistoryEntry[];
  enabled: boolean;
}

export interface StateHistoryEntry {
  stateId: string;
  timestamp: Date;
  trigger?: string;
}

// =============================================================================
// STATE MACHINE EVENTS
// =============================================================================

export type StateMachineEvent =
  | { type: 'STATE_ENTER'; stateId: string; objectId: string }
  | { type: 'STATE_EXIT'; stateId: string; objectId: string }
  | { type: 'TRANSITION_START'; transitionId: string; objectId: string }
  | { type: 'TRANSITION_END'; transitionId: string; objectId: string }
  | { type: 'TRANSITION_CANCEL'; transitionId: string; objectId: string };

export type StateMachineEventHandler = (event: StateMachineEvent) => void;

// =============================================================================
// PROPERTY INTERPOLATION
// =============================================================================

export interface InterpolationConfig {
  fromProperties: StateProperties;
  toProperties: StateProperties;
  progress: number; // 0-1
  easing: EasingFunction;
}

/**
 * Get interpolated value between two numbers
 */
export function interpolateNumber(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}

/**
 * Get interpolated properties between two states
 */
export function interpolateProperties(
  from: StateProperties,
  to: StateProperties,
  progress: number,
): StateProperties {
  const result: Record<string, unknown> = {};
  const allKeys = new Set([...Object.keys(from), ...Object.keys(to)]);

  for (const key of allKeys) {
    const fromValue = from[key as keyof StateProperties];
    const toValue = to[key as keyof StateProperties];

    if (fromValue === undefined && toValue === undefined) {
      continue;
    }

    if (typeof fromValue === 'number' && typeof toValue === 'number') {
      result[key] = interpolateNumber(fromValue, toValue, progress);
    } else if (typeof fromValue === 'number' && toValue === undefined) {
      result[key] = fromValue;
    } else if (fromValue === undefined && typeof toValue === 'number') {
      result[key] = toValue * progress;
    } else {
      // For non-numeric values, switch at 50%
      result[key] = progress < 0.5 ? fromValue : toValue;
    }
  }

  return result as StateProperties;
}

// =============================================================================
// STATE PRESETS
// =============================================================================

export interface StatePreset {
  id: string;
  name: string;
  description: string;
  category: 'visibility' | 'transform' | 'style' | 'interactive' | 'custom';
  states: Omit<ObjectState, 'id'>[];
}

export const STATE_PRESETS: StatePreset[] = [
  {
    id: 'fade-in-out',
    name: 'Fade In/Out',
    description: 'Simple opacity toggle',
    category: 'visibility',
    states: [
      {
        name: 'Hidden',
        isDefault: true,
        properties: { opacity: 0 },
        transitions: [],
        sortOrder: 0,
      },
      {
        name: 'Visible',
        isDefault: false,
        properties: { opacity: 1 },
        transitions: [],
        sortOrder: 1,
      },
    ],
  },
  {
    id: 'hover-scale',
    name: 'Hover Scale',
    description: 'Scale up on hover',
    category: 'interactive',
    states: [
      {
        name: 'Normal',
        isDefault: true,
        properties: { scale: 1 },
        transitions: [],
        sortOrder: 0,
      },
      {
        name: 'Hovered',
        isDefault: false,
        properties: { scale: 1.05 },
        transitions: [],
        sortOrder: 1,
      },
    ],
  },
  {
    id: 'button-states',
    name: 'Button States',
    description: 'Standard button interaction states',
    category: 'interactive',
    states: [
      {
        name: 'Default',
        isDefault: true,
        properties: { opacity: 1, scale: 1 },
        transitions: [],
        sortOrder: 0,
      },
      {
        name: 'Hover',
        isDefault: false,
        properties: { opacity: 0.9, scale: 1.02 },
        transitions: [],
        sortOrder: 1,
      },
      {
        name: 'Active',
        isDefault: false,
        properties: { opacity: 1, scale: 0.98 },
        transitions: [],
        sortOrder: 2,
      },
      {
        name: 'Disabled',
        isDefault: false,
        properties: { opacity: 0.5 },
        transitions: [],
        sortOrder: 3,
      },
    ],
  },
  {
    id: 'slide-reveal',
    name: 'Slide Reveal',
    description: 'Slide in from the side',
    category: 'transform',
    states: [
      {
        name: 'Hidden',
        isDefault: true,
        properties: { opacity: 0, x: -50 },
        transitions: [],
        sortOrder: 0,
      },
      {
        name: 'Visible',
        isDefault: false,
        properties: { opacity: 1, x: 0 },
        transitions: [],
        sortOrder: 1,
      },
    ],
  },
  {
    id: 'quiz-feedback',
    name: 'Quiz Feedback',
    description: 'States for quiz answer feedback',
    category: 'interactive',
    states: [
      {
        name: 'Unanswered',
        isDefault: true,
        properties: { borderColor: 'transparent', borderWidth: 2 },
        transitions: [],
        sortOrder: 0,
      },
      {
        name: 'Correct',
        isDefault: false,
        properties: {
          borderColor: '#22c55e',
          borderWidth: 2,
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
        },
        transitions: [],
        sortOrder: 1,
      },
      {
        name: 'Incorrect',
        isDefault: false,
        properties: {
          borderColor: '#ef4444',
          borderWidth: 2,
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
        },
        transitions: [],
        sortOrder: 2,
      },
      {
        name: 'Reviewed',
        isDefault: false,
        properties: { borderColor: '#6b7280', borderWidth: 1, opacity: 0.8 },
        transitions: [],
        sortOrder: 3,
      },
    ],
  },
];

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type StatePropertyKey = keyof StateProperties;

export interface StateValidationError {
  field: string;
  message: string;
  stateId?: string;
  transitionId?: string;
}

/**
 * Validate state configuration
 */
export function validateStateConfig(config: ObjectStateConfig): StateValidationError[] {
  const errors: StateValidationError[] = [];

  if (!config.states || config.states.length === 0) {
    errors.push({ field: 'states', message: 'At least one state is required' });
  }

  const defaultStates = config.states.filter((s) => s.isDefault);
  if (defaultStates.length === 0) {
    errors.push({ field: 'states', message: 'One state must be marked as default' });
  }
  if (defaultStates.length > 1) {
    errors.push({ field: 'states', message: 'Only one state can be the default' });
  }

  const stateIds = new Set<string>();
  for (const state of config.states) {
    if (stateIds.has(state.id)) {
      errors.push({
        field: 'states',
        message: `Duplicate state ID: ${state.id}`,
        stateId: state.id,
      });
    }
    stateIds.add(state.id);

    for (const transition of state.transitions) {
      if (!stateIds.has(transition.fromState) && transition.fromState !== state.id) {
        // fromState might be in a state not yet processed
      }
      if (!config.states.some((s) => s.id === transition.toState)) {
        errors.push({
          field: 'transitions',
          message: `Invalid toState: ${transition.toState}`,
          stateId: state.id,
          transitionId: transition.id,
        });
      }
    }
  }

  return errors;
}
