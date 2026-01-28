/**
 * =============================================================================
 * LXD360 | Media Player Components
 * =============================================================================
 *
 * Unified media player components for video and audio playback with
 * neural-futuristic theme styling and full accessibility support.
 *
 * @version 1.0.0
 * @updated 2026-01-26
 */

export { AudioPlayer, type AudioPlayerProps } from './audio-player';
export { PlayerControls, type PlayerControlsProps } from './player-controls';
export { type ChapterMarker, ProgressBar, type ProgressBarProps } from './progress-bar';
export { SpeedControl, type SpeedControlProps } from './speed-control';
export { TranscriptPanel, type TranscriptPanelProps } from './transcript-panel';
export {
  type AudioSource,
  type CaptionTrack,
  formatTime,
  KEYBOARD_SHORTCUTS,
  type MediaPlayerMachine,
  PLAYBACK_SPEEDS,
  type PlaybackSpeed,
  parseTime,
  type TranscriptCue,
  type VideoSource,
} from './types';
export { VideoPlayer, type VideoPlayerProps } from './video-player';
