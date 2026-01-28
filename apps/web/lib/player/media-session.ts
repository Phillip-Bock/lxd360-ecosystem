/**
 * =============================================================================
 * LXD360 | Media Session API Helper
 * =============================================================================
 *
 * PWA Media Session API integration for lock screen controls.
 * Enables playback control when screen is locked (Podcast Mode).
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API
 * @version 1.0.0
 * @updated 2026-01-27
 */

import { logger } from '@/lib/logger';
import type { ContentAtom } from '@/types/content/atom';

const log = logger.scope('MediaSession');

/**
 * Media controls interface for action handlers
 */
export interface MediaControls {
  play: () => void | Promise<void>;
  pause: () => void;
  seekBackward: (seekOffset?: number) => void;
  seekForward: (seekOffset?: number) => void;
  seekTo?: (time: number) => void;
  stop?: () => void;
  previousTrack?: () => void;
  nextTrack?: () => void;
}

/**
 * Artwork metadata for media session
 */
export interface MediaArtwork {
  src: string;
  sizes: string;
  type: string;
}

/**
 * Media metadata for the session
 */
export interface MediaSessionMetadata {
  title: string;
  artist?: string;
  album?: string;
  artwork?: MediaArtwork[];
}

/**
 * Check if Media Session API is supported
 */
export function isMediaSessionSupported(): boolean {
  return typeof navigator !== 'undefined' && 'mediaSession' in navigator;
}

/**
 * Setup PWA Media Session API for lock screen controls
 *
 * @param atom - The content atom being played
 * @param controls - Media control handlers
 *
 * @example
 * ```ts
 * setupMediaSession(atom, {
 *   play: () => audioRef.current?.play(),
 *   pause: () => audioRef.current?.pause(),
 *   seekBackward: () => seek(-10),
 *   seekForward: () => seek(10),
 * });
 * ```
 */
export function setupMediaSession(
  atom: Pick<ContentAtom, 'title'> & {
    course_title?: string;
    courseTitle?: string;
    thumbnail_url?: string;
    thumbnail?: string;
    modalities?: { thumbnail_url?: string };
  },
  controls: MediaControls,
): void {
  if (!isMediaSessionSupported()) {
    return;
  }

  // Get thumbnail from various possible sources
  const thumbnailUrl = atom.thumbnail_url || atom.thumbnail || atom.modalities?.thumbnail_url || '';

  // Set metadata
  navigator.mediaSession.metadata = new MediaMetadata({
    title: atom.title,
    artist: 'INSPIRE Ignite',
    album: atom.course_title || atom.courseTitle || 'Learning',
    artwork: thumbnailUrl
      ? [
          { src: thumbnailUrl, sizes: '96x96', type: 'image/png' },
          { src: thumbnailUrl, sizes: '128x128', type: 'image/png' },
          { src: thumbnailUrl, sizes: '192x192', type: 'image/png' },
          { src: thumbnailUrl, sizes: '256x256', type: 'image/png' },
          { src: thumbnailUrl, sizes: '384x384', type: 'image/png' },
          { src: thumbnailUrl, sizes: '512x512', type: 'image/png' },
        ]
      : [],
  });

  // Set action handlers
  navigator.mediaSession.setActionHandler('play', () => {
    const result = controls.play();
    if (result instanceof Promise) {
      result.catch((error) => log.error('Media session play failed', error));
    }
  });

  navigator.mediaSession.setActionHandler('pause', () => {
    controls.pause();
  });

  navigator.mediaSession.setActionHandler('seekbackward', (details) => {
    const skipTime = details.seekOffset ?? 10;
    controls.seekBackward(skipTime);
  });

  navigator.mediaSession.setActionHandler('seekforward', (details) => {
    const skipTime = details.seekOffset ?? 10;
    controls.seekForward(skipTime);
  });

  if (controls.seekTo) {
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined && controls.seekTo) {
        controls.seekTo(details.seekTime);
      }
    });
  }

  if (controls.stop) {
    navigator.mediaSession.setActionHandler('stop', () => {
      controls.stop?.();
    });
  }

  if (controls.previousTrack) {
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      controls.previousTrack?.();
    });
  }

  if (controls.nextTrack) {
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      controls.nextTrack?.();
    });
  }
}

/**
 * Update the position state for the media session
 *
 * @param duration - Total duration in seconds
 * @param position - Current position in seconds
 * @param playbackRate - Current playback rate (default: 1)
 */
export function updateMediaSessionPosition(
  duration: number,
  position: number,
  playbackRate = 1,
): void {
  if (!isMediaSessionSupported()) {
    return;
  }

  try {
    navigator.mediaSession.setPositionState({
      duration: Math.max(0, duration),
      playbackRate: Math.max(0.5, Math.min(2, playbackRate)),
      position: Math.max(0, Math.min(position, duration)),
    });
  } catch {
    // Position state update failed, not critical
  }
}

/**
 * Update the playback state
 *
 * @param state - The playback state ('playing', 'paused', 'none')
 */
export function updateMediaSessionPlaybackState(state: 'playing' | 'paused' | 'none'): void {
  if (!isMediaSessionSupported()) {
    return;
  }

  navigator.mediaSession.playbackState = state;
}

/**
 * Clear the media session (when playback ends)
 */
export function clearMediaSession(): void {
  if (!isMediaSessionSupported()) {
    return;
  }

  navigator.mediaSession.metadata = null;
  navigator.mediaSession.playbackState = 'none';

  // Clear all action handlers
  const actions: MediaSessionAction[] = [
    'play',
    'pause',
    'seekbackward',
    'seekforward',
    'seekto',
    'stop',
    'previoustrack',
    'nexttrack',
  ];

  for (const action of actions) {
    try {
      navigator.mediaSession.setActionHandler(action, null);
    } catch {
      // Handler clearing failed, not critical
    }
  }
}
