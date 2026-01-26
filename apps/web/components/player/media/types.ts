/**
 * =============================================================================
 * LXD360 | Media Player Types
 * =============================================================================
 *
 * Shared type definitions for media player components (VideoPlayer, AudioPlayer, etc.)
 *
 * @version 1.0.0
 * @updated 2026-01-26
 */

/**
 * Transcript cue for synced transcripts
 */
export interface TranscriptCue {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  speaker?: string;
}

/**
 * Media player machine interface
 * Represents the state and controls from usePlayer hook
 */
export interface MediaPlayerMachine {
  // State
  isPlaying: boolean;
  isPaused: boolean;
  isMuted: boolean;
  isBuffering: boolean;
  isEnded: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  buffered: number;
  isFullscreen: boolean;
  error: string | null;

  // Actions
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  toggleFullscreen: () => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
}

/**
 * Video source configuration
 */
export interface VideoSource {
  src: string;
  type: string;
  label?: string;
  quality?: '360p' | '480p' | '720p' | '1080p' | '4k';
}

/**
 * Audio source configuration
 */
export interface AudioSource {
  src: string;
  type: string;
  label?: string;
}

/**
 * Caption/subtitle track configuration
 */
export interface CaptionTrack {
  src: string;
  srclang: string;
  label: string;
  default?: boolean;
}

/**
 * Playback speed options
 */
export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

/**
 * Format time in seconds to MM:SS or HH:MM:SS
 */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parse time string to seconds
 */
export function parseTime(timeString: string): number {
  const parts = timeString.split(':').map(Number);

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }

  return parts[0] || 0;
}

/**
 * Keyboard shortcuts for media player
 */
export const KEYBOARD_SHORTCUTS = {
  TOGGLE_PLAY: ' ',
  TOGGLE_PLAY_K: 'k',
  SEEK_FORWARD: 'ArrowRight',
  SEEK_BACKWARD: 'ArrowLeft',
  VOLUME_UP: 'ArrowUp',
  VOLUME_DOWN: 'ArrowDown',
  TOGGLE_MUTE: 'm',
  TOGGLE_FULLSCREEN: 'f',
  DECREASE_SPEED: '<',
  INCREASE_SPEED: '>',
  SEEK_TO_START: 'Home',
  SEEK_TO_END: 'End',
} as const;
