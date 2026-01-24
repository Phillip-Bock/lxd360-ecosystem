export type CharacterState =
  | 'idle'
  | 'thinking'
  | 'speaking'
  | 'listening'
  | 'celebrating'
  | 'error';

// Animation clip names (must match names in GLB file)
export const ANIMATION_NAMES: Record<CharacterState, string> = {
  idle: 'Idle',
  thinking: 'Thinking',
  speaking: 'Talking',
  listening: 'Listening',
  celebrating: 'Victory',
  error: 'Defeated',
};

// Transition durations in seconds
export const TRANSITION_DURATIONS: Record<CharacterState, number> = {
  idle: 0.5,
  thinking: 0.3,
  speaking: 0.2,
  listening: 0.3,
  celebrating: 0.4,
  error: 0.3,
};

// Which states should loop
export const LOOPING_STATES: CharacterState[] = ['idle', 'thinking', 'speaking', 'listening'];

// Aliases for alternate naming conventions
export const ANIMATION_CLIPS = ANIMATION_NAMES;
export const TRANSITION_DURATION = TRANSITION_DURATIONS;
