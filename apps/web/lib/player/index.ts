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
// Content Format Detection exports
export {
  type DetectionResult,
  detectContentFormat,
  detectContentFormatFromStorage,
  detectContentFormatFromUrl,
  getScorm2004Edition,
  type PackageFile,
} from './content-detector';
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
// Media Session API exports (Lock Screen Controls)
export {
  clearMediaSession,
  isMediaSessionSupported,
  type MediaArtwork,
  type MediaControls,
  type MediaSessionMetadata,
  setupMediaSession,
  updateMediaSessionPlaybackState,
  updateMediaSessionPosition,
} from './media-session';
// Content Wrapper Hook exports
export {
  type ContentWrapperState,
  type UseContentWrapperConfig,
  type UseContentWrapperReturn,
  useContentWrapper,
} from './use-content-wrapper';

// Content Format Types exports
export type {
  AiccConfig,
  Cmi5Config,
  Cmi5LaunchMode,
  Cmi5MoveOn,
  ContentFormat,
  ContentManifest,
  ContentWrapper,
  Html5Config,
  NativeConfig,
  PdfConfig,
  Scorm12Config,
  Scorm12DataModel,
  Scorm2004Config,
  Scorm2004DataModel,
  Scorm2004Edition,
  WrapperCommitData,
  WrapperConfig,
  WrapperConfigBase,
  WrapperError,
  WrapperProgress,
  WrapperResult,
  XApiActivity,
  XApiActor,
  XApiConfig,
  XApiContext,
  XApiResult,
  XApiStatement,
  XApiVerb,
} from './wrappers';
// Content Wrapper exports
export {
  AiccWrapper,
  CMI5_VERBS,
  Cmi5Wrapper,
  createAiccWrapper,
  createCmi5Wrapper,
  // Individual wrapper factories
  createScorm12Wrapper,
  createScorm2004Wrapper,
  // Factory function
  createWrapper,
  createXApiWrapper,
  Html5Wrapper,
  // Type guards
  isHtml5Wrapper,
  isNativeWrapper,
  isPdfWrapper,
  NativeWrapper,
  PdfWrapper,
  // Wrapper classes
  Scorm12ApiWrapper,
  Scorm2004ApiWrapper,
  // Verbs
  XAPI_VERBS,
  XApiWrapper,
} from './wrappers';

// xAPI Integration exports (LXD-349)
export {
  type CompletionResult,
  createPlayerSyncHandler,
  createPlayerXAPIEmitter,
  type EngagementData,
  type HesitationData,
  type OfflineResumeData,
  type PlayerXAPIConfig,
  PlayerXAPIEmitter,
  type UsePlayerXAPIOptions,
} from './xapi-integration';
