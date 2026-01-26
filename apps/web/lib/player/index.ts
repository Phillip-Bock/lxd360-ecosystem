// =============================================================================
// INSPIRE PLAYER MODULE
// =============================================================================
// Headless LMS player engine with state machine, multi-modality support,
// and offline sync capabilities.
// =============================================================================

export {
  // Store factory
  createPlayerStore,
  type EngagementMetrics,
  type PlaybackRate,
  type PlayerActions,
  type PlayerContext,
  type PlayerError,
  type PlayerErrorType,
  type PlayerEvent,
  type PlayerMode,
  // Types
  type PlayerStateValue,
  type PlayerStore,
  selectAvailableModalities,
  selectBufferedPercent,
  selectFormattedDuration,
  selectFormattedTime,
  selectHasError,
  selectIsLoading,
  // Selectors
  selectIsPlayable,
  selectIsPlaying,
  selectPendingStatementCount,
  usePlayerStore,
} from './machine';
