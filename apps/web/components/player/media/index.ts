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

export { AudioPlayer, type AudioPlayerProps } from './AudioPlayer';
export { PlayerControls, type PlayerControlsProps } from './PlayerControls';
export { type ChapterMarker, ProgressBar, type ProgressBarProps } from './ProgressBar';
export { SpeedControl, type SpeedControlProps } from './SpeedControl';
export { TranscriptPanel, type TranscriptPanelProps } from './TranscriptPanel';
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
export { VideoPlayer, type VideoPlayerProps } from './VideoPlayer';
