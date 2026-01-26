/**
 * Player Library - Background Audio Service
 *
 * Services for persistent media playback:
 * - backgroundAudio: Singleton service for background playback with Media Session API
 */

export {
  type AudioEventCallback,
  type AudioEventType,
  type BackgroundAudioState,
  backgroundAudio,
  type MediaMetadataInfo,
} from './background-audio';
