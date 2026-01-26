// =============================================================================
// INSPIRE PLAYER MODULE
// =============================================================================
// Headless LMS player engine with state machine, multi-modality support,
// and offline sync capabilities.
// =============================================================================

// Background Audio Service exports (Podcast Mode)
export {
  type AudioEventCallback,
  type AudioEventType,
  type BackgroundAudioState,
  backgroundAudio,
  type MediaMetadataInfo,
} from './background-audio';
// Player State Machine exports
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
