'use client';

/**
 * =============================================================================
 * LXD360 | usePlayer Hook
 * =============================================================================
 *
 * React hook for consuming the player state machine (LXD-344).
 * Provides a clean API for components to interact with playback state.
 *
 * @version 1.0.0
 * @updated 2026-01-27
 */

import { useCallback, useMemo } from 'react';
import {
  createPlayerStore,
  type PlaybackRate,
  type PlayerMode,
  type PlayerStateValue,
  selectAvailableModalities,
  selectBufferedPercent,
  selectFormattedDuration,
  selectFormattedTime,
  selectHasError,
  selectIsLoading,
  selectIsPlayable,
  selectIsPlaying,
} from '@/lib/player/machine';
import type { AtomProgress, ContentAtom } from '@/types/content/atom';

/**
 * Player hook return type
 */
export interface UsePlayerReturn {
  // ─── State ─────────────────────────────────────────────────────────────────
  /** Current finite state (idle, loading, ready, playing, etc.) */
  state: PlayerStateValue;
  /** Loaded content atom */
  atom: ContentAtom | null;
  /** Current progress data */
  progress: AtomProgress | null;

  // ─── Playback ──────────────────────────────────────────────────────────────
  /** Whether content is actively playing */
  isPlaying: boolean;
  /** Whether player is in a playable state */
  isPlayable: boolean;
  /** Whether player is loading or buffering */
  isLoading: boolean;
  /** Whether player has an error */
  hasError: boolean;
  /** Error message if present */
  errorMessage: string | null;

  // ─── Time ──────────────────────────────────────────────────────────────────
  /** Current playback time in seconds */
  currentTime: number;
  /** Total duration in seconds */
  duration: number;
  /** Formatted current time (MM:SS) */
  formattedTime: string;
  /** Formatted duration (MM:SS) */
  formattedDuration: string;

  // ─── Progress ──────────────────────────────────────────────────────────────
  /** Progress percentage (0-100) */
  progressPercent: number;
  /** Buffered percentage (0-100) */
  bufferedPercent: number;
  /** Whether completion threshold has been met */
  isComplete: boolean;

  // ─── Volume & Speed ────────────────────────────────────────────────────────
  /** Volume level (0-1) */
  volume: number;
  /** Whether muted */
  isMuted: boolean;
  /** Current playback rate */
  playbackRate: PlaybackRate;

  // ─── Mode ──────────────────────────────────────────────────────────────────
  /** Current player mode (video, audio, text) */
  mode: PlayerMode;
  /** Available modalities for current content */
  availableModalities: PlayerMode[];
  /** Whether in background/podcast mode */
  isBackgroundMode: boolean;
  /** Whether in fullscreen */
  isFullscreen: boolean;

  // ─── Actions ───────────────────────────────────────────────────────────────
  /** Load content atom */
  load: (atom: ContentAtom, progress?: AtomProgress) => void;
  /** Play content */
  play: () => void;
  /** Pause content */
  pause: () => void;
  /** Toggle play/pause */
  togglePlayPause: () => void;
  /** Seek to time in seconds */
  seek: (time: number) => void;
  /** Seek relative to current time */
  seekRelative: (delta: number) => void;
  /** Skip forward */
  skipForward: (seconds?: number) => void;
  /** Skip backward */
  skipBackward: (seconds?: number) => void;
  /** Set volume (0-1) */
  setVolume: (volume: number) => void;
  /** Toggle mute */
  toggleMute: () => void;
  /** Set playback rate */
  setPlaybackRate: (rate: PlaybackRate) => void;
  /** Switch mode (video/audio/text) */
  switchMode: (mode: PlayerMode) => void;
  /** Enter background/podcast mode */
  enterBackground: () => void;
  /** Exit background mode */
  exitBackground: () => void;
  /** Toggle fullscreen */
  toggleFullscreen: () => void;
  /** Record interaction for engagement tracking */
  recordInteraction: () => void;
  /** Reset player to idle state */
  reset: () => void;
  /** Retry after error */
  retry: () => void;

  // ─── Events ────────────────────────────────────────────────────────────────
  /** Dispatch time update from media element */
  onTimeUpdate: (time: number) => void;
  /** Dispatch buffered progress from media element */
  onProgress: (buffered: number) => void;
  /** Dispatch media loaded event */
  onLoaded: (duration: number) => void;
  /** Dispatch seeking start */
  onSeeking: () => void;
  /** Dispatch seek completed */
  onSeeked: () => void;
  /** Dispatch buffering start */
  onBuffering: () => void;
  /** Dispatch buffering complete */
  onBuffered: () => void;
  /** Dispatch media ended */
  onEnded: () => void;
  /** Dispatch error */
  onError: (message: string) => void;
}

/**
 * Options for usePlayer hook
 */
export interface UsePlayerOptions {
  /** Completion threshold percentage (default: 80) */
  completionThreshold?: number;
  /** Callback when state changes */
  onStateChange?: (state: PlayerStateValue) => void;
  /** Callback when content is completed */
  onComplete?: (progress: AtomProgress) => void;
}

// Create a singleton store for the player
const playerStore = createPlayerStore();

/**
 * Hook for consuming player state machine.
 *
 * @example
 * ```tsx
 * const player = usePlayer();
 *
 * // Load content
 * player.load(contentAtom);
 *
 * // Play/pause
 * player.togglePlayPause();
 *
 * // Render time display
 * <span>{player.formattedTime} / {player.formattedDuration}</span>
 * ```
 */
export function usePlayer(_options?: UsePlayerOptions): UsePlayerReturn {
  // Subscribe to store state
  const storeState = playerStore();

  // Memoized selectors
  const isPlaying = useMemo(() => selectIsPlaying(storeState), [storeState]);
  const isPlayable = useMemo(() => selectIsPlayable(storeState), [storeState]);
  const isLoading = useMemo(() => selectIsLoading(storeState), [storeState]);
  const hasError = useMemo(() => selectHasError(storeState), [storeState]);
  const formattedTime = useMemo(() => selectFormattedTime(storeState), [storeState]);
  const formattedDuration = useMemo(() => selectFormattedDuration(storeState), [storeState]);
  const bufferedPercent = useMemo(() => selectBufferedPercent(storeState), [storeState]);
  const availableModalities = useMemo(() => selectAvailableModalities(storeState), [storeState]);

  // Actions
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      storeState.pause();
    } else {
      storeState.play();
    }
  }, [isPlaying, storeState]);

  const seekRelative = useCallback(
    (delta: number) => {
      const newTime = Math.max(0, Math.min(storeState.currentTime + delta, storeState.duration));
      storeState.seek(newTime);
    },
    [storeState],
  );

  const skipForward = useCallback(
    (seconds = 10) => {
      seekRelative(seconds);
    },
    [seekRelative],
  );

  const skipBackward = useCallback(
    (seconds = 10) => {
      seekRelative(-seconds);
    },
    [seekRelative],
  );

  const retry = useCallback(() => {
    storeState.dispatch({ type: 'RETRY' });
  }, [storeState]);

  // Event dispatchers
  const onTimeUpdate = useCallback(
    (time: number) => {
      storeState.dispatch({ type: 'TIME_UPDATE', time });
    },
    [storeState],
  );

  const onProgress = useCallback(
    (buffered: number) => {
      storeState.dispatch({ type: 'PROGRESS', buffered });
    },
    [storeState],
  );

  const onLoaded = useCallback(
    (duration: number) => {
      storeState.dispatch({ type: 'LOADED', duration });
    },
    [storeState],
  );

  const onSeeking = useCallback(() => {
    storeState.dispatch({ type: 'SEEKING' });
  }, [storeState]);

  const onSeeked = useCallback(() => {
    storeState.dispatch({ type: 'SEEKED' });
  }, [storeState]);

  const onBuffering = useCallback(() => {
    storeState.dispatch({ type: 'BUFFERING' });
  }, [storeState]);

  const onBuffered = useCallback(() => {
    storeState.dispatch({ type: 'BUFFERED' });
  }, [storeState]);

  const onEnded = useCallback(() => {
    storeState.dispatch({ type: 'ENDED' });
  }, [storeState]);

  const onError = useCallback(
    (message: string) => {
      storeState.dispatch({
        type: 'LOAD_ERROR',
        error: {
          type: 'unknown',
          message,
          recoverable: true,
        },
      });
    },
    [storeState],
  );

  return {
    // State
    state: storeState.state,
    atom: storeState.atom,
    progress: storeState.progress,

    // Playback
    isPlaying,
    isPlayable,
    isLoading,
    hasError,
    errorMessage: storeState.error?.message ?? null,

    // Time
    currentTime: storeState.currentTime,
    duration: storeState.duration,
    formattedTime,
    formattedDuration,

    // Progress
    progressPercent: storeState.progressPercent,
    bufferedPercent,
    isComplete: storeState.isComplete,

    // Volume & Speed
    volume: storeState.volume,
    isMuted: storeState.isMuted,
    playbackRate: storeState.playbackRate,

    // Mode
    mode: storeState.mode,
    availableModalities,
    isBackgroundMode: storeState.isBackgroundMode,
    isFullscreen: storeState.isFullscreen,

    // Actions
    load: storeState.load,
    play: storeState.play,
    pause: storeState.pause,
    togglePlayPause,
    seek: storeState.seek,
    seekRelative,
    skipForward,
    skipBackward,
    setVolume: storeState.setVolume,
    toggleMute: storeState.toggleMute,
    setPlaybackRate: storeState.setPlaybackRate,
    switchMode: storeState.switchMode,
    enterBackground: storeState.enterBackground,
    exitBackground: storeState.exitBackground,
    toggleFullscreen: storeState.toggleFullscreen,
    recordInteraction: storeState.recordInteraction,
    reset: storeState.reset,
    retry,

    // Events
    onTimeUpdate,
    onProgress,
    onLoaded,
    onSeeking,
    onSeeked,
    onBuffering,
    onBuffered,
    onEnded,
    onError,
  };
}

export default usePlayer;
