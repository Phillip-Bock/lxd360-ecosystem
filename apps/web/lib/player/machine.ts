// =============================================================================
// INSPIRE PLAYER STATE MACHINE
// =============================================================================
// Mathematical model prevents impossible states
// Headless — can render to any target (web, mobile, Slack, etc.)
// Uses Zustand for state management with XState-like patterns
// =============================================================================

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { AtomProgress, ConsumptionModality, ContentAtom } from '@/types/content/atom';
import type { DeepXAPIStatement } from '@/types/xapi/deep-profile';

// =============================================================================
// STATE TYPES
// =============================================================================

/**
 * Player states (finite state machine).
 */
export type PlayerStateValue =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'buffering'
  | 'seeking'
  | 'completed'
  | 'error';

/**
 * Player mode (video, audio, or text).
 */
export type PlayerMode = 'video' | 'audio' | 'text';

/**
 * Playback rate options.
 */
export type PlaybackRate = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;

/**
 * Error types for player.
 */
export type PlayerErrorType =
  | 'network'
  | 'decode'
  | 'source_not_found'
  | 'format_unsupported'
  | 'drm_error'
  | 'unknown';

/**
 * Player error object.
 */
export interface PlayerError {
  type: PlayerErrorType;
  message: string;
  code?: number;
  recoverable: boolean;
}

// =============================================================================
// ENGAGEMENT TRACKING STATE
// =============================================================================

/**
 * Engagement metrics tracked during playback.
 */
export interface EngagementMetrics {
  /** Total interaction events (clicks, drags, etc.) */
  interactionCount: number;
  /** Mouse idle time in ms */
  idleTimeMs: number;
  /** Window blur time in ms */
  blurTimeMs: number;
  /** Tab switch count */
  tabSwitches: number;
  /** Scroll velocity (for text mode) */
  scrollVelocity: number;
  /** Calculated focus score (0-100) */
  focusScore: number;
}

// =============================================================================
// PLAYER CONTEXT (State Data)
// =============================================================================

/**
 * Player context — all state data for the player.
 */
export interface PlayerContext {
  // ─── Content ─────────────────────────────────────────────────────────────────
  /** Current content atom */
  atom: ContentAtom | null;
  /** Learner progress for this atom */
  progress: AtomProgress | null;

  // ─── Playback State ──────────────────────────────────────────────────────────
  /** Current finite state */
  state: PlayerStateValue;
  /** Current playback time (seconds) */
  currentTime: number;
  /** Total duration (seconds) */
  duration: number;
  /** Buffered time (seconds) */
  bufferedTime: number;
  /** Playback rate */
  playbackRate: PlaybackRate;
  /** Volume level (0-1) */
  volume: number;
  /** Muted state */
  isMuted: boolean;

  // ─── Mode ────────────────────────────────────────────────────────────────────
  /** Current player mode (video, audio, text) */
  mode: PlayerMode;
  /** Background/Podcast mode active */
  isBackgroundMode: boolean;
  /** Screen locked (mobile) */
  isScreenLocked: boolean;
  /** Fullscreen active */
  isFullscreen: boolean;

  // ─── Progress ────────────────────────────────────────────────────────────────
  /** Watch segments for unique time tracking */
  watchedSegments: Array<[number, number]>;
  /** Calculated progress percentage (0-100) */
  progressPercent: number;
  /** Completion threshold percentage */
  completionThreshold: number;
  /** Has met completion criteria */
  isComplete: boolean;

  // ─── Engagement ──────────────────────────────────────────────────────────────
  /** Engagement metrics */
  engagement: EngagementMetrics;
  /** Session start time */
  sessionStartTime: number | null;
  /** Total session time (ms) */
  sessionTimeMs: number;

  // ─── Offline Queue ───────────────────────────────────────────────────────────
  /** Pending xAPI statements to sync */
  pendingStatements: DeepXAPIStatement[];
  /** Online status */
  isOnline: boolean;
  /** Sync in progress */
  isSyncing: boolean;

  // ─── Error ───────────────────────────────────────────────────────────────────
  /** Current error (if any) */
  error: PlayerError | null;
}

// =============================================================================
// PLAYER EVENTS
// =============================================================================

/**
 * Player events that trigger state transitions.
 */
export type PlayerEvent =
  | { type: 'LOAD'; atom: ContentAtom; progress?: AtomProgress }
  | { type: 'LOADED'; duration: number }
  | { type: 'LOAD_ERROR'; error: PlayerError }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'SEEK'; time: number }
  | { type: 'SEEKING' }
  | { type: 'SEEKED' }
  | { type: 'BUFFERING' }
  | { type: 'BUFFERED' }
  | { type: 'TIME_UPDATE'; time: number }
  | { type: 'PROGRESS'; buffered: number }
  | { type: 'ENDED' }
  | { type: 'COMPLETE' }
  | { type: 'SET_VOLUME'; volume: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'SET_PLAYBACK_RATE'; rate: PlaybackRate }
  | { type: 'SWITCH_MODE'; mode: PlayerMode }
  | { type: 'ENTER_BACKGROUND' }
  | { type: 'EXIT_BACKGROUND' }
  | { type: 'ENTER_FULLSCREEN' }
  | { type: 'EXIT_FULLSCREEN' }
  | { type: 'SCREEN_LOCK' }
  | { type: 'SCREEN_UNLOCK' }
  | { type: 'INTERACTION' }
  | { type: 'IDLE_TICK'; ms: number }
  | { type: 'BLUR' }
  | { type: 'FOCUS' }
  | { type: 'TAB_SWITCH' }
  | { type: 'SCROLL'; velocity: number }
  | { type: 'ONLINE' }
  | { type: 'OFFLINE' }
  | { type: 'SYNC_START' }
  | { type: 'SYNC_COMPLETE' }
  | { type: 'SYNC_ERROR'; error: string }
  | { type: 'QUEUE_STATEMENT'; statement: DeepXAPIStatement }
  | { type: 'CLEAR_QUEUE' }
  | { type: 'RESET' }
  | { type: 'RETRY' };

// =============================================================================
// PLAYER ACTIONS (Store)
// =============================================================================

/**
 * Player actions for the Zustand store.
 */
export interface PlayerActions {
  /** Dispatch an event to the state machine */
  dispatch: (event: PlayerEvent) => void;
  /** Load a content atom */
  load: (atom: ContentAtom, progress?: AtomProgress) => void;
  /** Play content */
  play: () => void;
  /** Pause content */
  pause: () => void;
  /** Seek to time */
  seek: (time: number) => void;
  /** Set volume */
  setVolume: (volume: number) => void;
  /** Toggle mute */
  toggleMute: () => void;
  /** Set playback rate */
  setPlaybackRate: (rate: PlaybackRate) => void;
  /** Switch mode (video/audio/text) */
  switchMode: (mode: PlayerMode) => void;
  /** Enter background mode */
  enterBackground: () => void;
  /** Exit background mode */
  exitBackground: () => void;
  /** Toggle fullscreen */
  toggleFullscreen: () => void;
  /** Record interaction for engagement tracking */
  recordInteraction: () => void;
  /** Queue an xAPI statement */
  queueStatement: (statement: DeepXAPIStatement) => void;
  /** Sync pending statements */
  syncStatements: () => Promise<void>;
  /** Reset player */
  reset: () => void;
  /** Get current progress snapshot */
  getProgressSnapshot: () => AtomProgress | null;
}

/**
 * Player store type.
 */
export type PlayerStore = PlayerContext & PlayerActions;

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialEngagement: EngagementMetrics = {
  interactionCount: 0,
  idleTimeMs: 0,
  blurTimeMs: 0,
  tabSwitches: 0,
  scrollVelocity: 0,
  focusScore: 100,
};

const initialContext: PlayerContext = {
  atom: null,
  progress: null,
  state: 'idle',
  currentTime: 0,
  duration: 0,
  bufferedTime: 0,
  playbackRate: 1,
  volume: 1,
  isMuted: false,
  mode: 'video',
  isBackgroundMode: false,
  isScreenLocked: false,
  isFullscreen: false,
  watchedSegments: [],
  progressPercent: 0,
  completionThreshold: 80,
  isComplete: false,
  engagement: initialEngagement,
  sessionStartTime: null,
  sessionTimeMs: 0,
  pendingStatements: [],
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isSyncing: false,
  error: null,
};

// =============================================================================
// STATE MACHINE TRANSITIONS
// =============================================================================

/**
 * Valid state transitions.
 */
const validTransitions: Record<PlayerStateValue, PlayerStateValue[]> = {
  idle: ['loading'],
  loading: ['ready', 'error'],
  ready: ['playing', 'seeking', 'error'],
  playing: ['paused', 'buffering', 'seeking', 'completed', 'error'],
  paused: ['playing', 'seeking', 'completed', 'error'],
  buffering: ['playing', 'paused', 'error'],
  seeking: ['playing', 'paused', 'buffering', 'ready', 'error'],
  completed: ['playing', 'seeking', 'idle'],
  error: ['loading', 'idle'],
};

/**
 * Check if a state transition is valid.
 */
function canTransition(from: PlayerStateValue, to: PlayerStateValue): boolean {
  return validTransitions[from]?.includes(to) ?? false;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Merge watched segments to calculate unique watch time.
 */
function mergeSegments(
  segments: Array<[number, number]>,
  newStart: number,
  newEnd: number,
): Array<[number, number]> {
  if (newStart >= newEnd) return segments;

  const merged: Array<[number, number]> = [];
  let added = false;

  for (const [start, end] of segments) {
    if (newEnd < start) {
      if (!added) {
        merged.push([newStart, newEnd]);
        added = true;
      }
      merged.push([start, end]);
    } else if (newStart > end) {
      merged.push([start, end]);
    } else {
      newStart = Math.min(newStart, start);
      newEnd = Math.max(newEnd, end);
    }
  }

  if (!added) {
    merged.push([newStart, newEnd]);
  }

  return merged;
}

/**
 * Calculate total watched time from segments.
 */
function calculateWatchedTime(segments: Array<[number, number]>): number {
  return segments.reduce((total, [start, end]) => total + (end - start), 0);
}

/**
 * Calculate progress percentage.
 */
function calculateProgress(segments: Array<[number, number]>, duration: number): number {
  if (duration === 0) return 0;
  const watched = calculateWatchedTime(segments);
  return Math.min(100, Math.round((watched / duration) * 100));
}

/**
 * Calculate focus score from engagement metrics.
 */
function calculateFocusScore(
  sessionTimeMs: number,
  idleTimeMs: number,
  blurTimeMs: number,
): number {
  if (sessionTimeMs === 0) return 100;
  const activeTime = sessionTimeMs - idleTimeMs - blurTimeMs;
  return Math.max(0, Math.min(100, Math.round((activeTime / sessionTimeMs) * 100)));
}

// =============================================================================
// PLAYER STORE FACTORY
// =============================================================================

/**
 * Create a new player store instance.
 * Each player component should have its own store instance.
 */
export function createPlayerStore(
  options?: Partial<{
    completionThreshold: number;
    onStateChange: (state: PlayerStateValue) => void;
    onComplete: (progress: AtomProgress) => void;
    onStatementQueued: (statement: DeepXAPIStatement) => void;
  }>,
) {
  return create<PlayerStore>()(
    subscribeWithSelector((set, get) => ({
      ...initialContext,
      completionThreshold: options?.completionThreshold ?? 80,

      // ─── Dispatch Event ────────────────────────────────────────────────────────
      dispatch: (event: PlayerEvent) => {
        const current = get();

        switch (event.type) {
          case 'LOAD': {
            if (!canTransition(current.state, 'loading')) return;
            set({
              state: 'loading',
              atom: event.atom,
              progress: event.progress ?? null,
              currentTime: event.progress?.last_position_seconds ?? 0,
              error: null,
              watchedSegments: [],
              isComplete: false,
              sessionStartTime: Date.now(),
              sessionTimeMs: 0,
              engagement: initialEngagement,
            });
            options?.onStateChange?.('loading');
            break;
          }

          case 'LOADED': {
            if (!canTransition(current.state, 'ready')) return;
            set({
              state: 'ready',
              duration: event.duration,
            });
            options?.onStateChange?.('ready');
            break;
          }

          case 'LOAD_ERROR': {
            set({
              state: 'error',
              error: event.error,
            });
            options?.onStateChange?.('error');
            break;
          }

          case 'PLAY': {
            if (!canTransition(current.state, 'playing')) return;
            set({ state: 'playing' });
            options?.onStateChange?.('playing');
            break;
          }

          case 'PAUSE': {
            if (!canTransition(current.state, 'paused')) return;
            set({ state: 'paused' });
            options?.onStateChange?.('paused');
            break;
          }

          case 'SEEK': {
            if (!canTransition(current.state, 'seeking')) return;
            set({
              state: 'seeking',
              currentTime: Math.max(0, Math.min(event.time, current.duration)),
            });
            options?.onStateChange?.('seeking');
            break;
          }

          case 'SEEKED': {
            const nextState = current.state === 'seeking' ? 'paused' : current.state;
            if (canTransition(current.state, 'paused')) {
              set({ state: nextState as PlayerStateValue });
              options?.onStateChange?.(nextState as PlayerStateValue);
            }
            break;
          }

          case 'BUFFERING': {
            if (!canTransition(current.state, 'buffering')) return;
            set({ state: 'buffering' });
            options?.onStateChange?.('buffering');
            break;
          }

          case 'BUFFERED': {
            if (current.state === 'buffering') {
              set({ state: 'playing' });
              options?.onStateChange?.('playing');
            }
            break;
          }

          case 'TIME_UPDATE': {
            const newSegments = mergeSegments(
              current.watchedSegments,
              current.currentTime,
              event.time,
            );
            const newProgress = calculateProgress(newSegments, current.duration);
            const isNowComplete = !current.isComplete && newProgress >= current.completionThreshold;

            set({
              currentTime: event.time,
              watchedSegments: newSegments,
              progressPercent: newProgress,
              isComplete: current.isComplete || isNowComplete,
              sessionTimeMs:
                current.sessionStartTime !== null ? Date.now() - current.sessionStartTime : 0,
            });

            if (isNowComplete) {
              const progress = get().getProgressSnapshot();
              if (progress) {
                options?.onComplete?.(progress);
              }
            }
            break;
          }

          case 'PROGRESS': {
            set({ bufferedTime: event.buffered });
            break;
          }

          case 'ENDED': {
            if (!canTransition(current.state, 'completed')) return;
            set({ state: 'completed', isComplete: true });
            options?.onStateChange?.('completed');
            const progress = get().getProgressSnapshot();
            if (progress) {
              options?.onComplete?.(progress);
            }
            break;
          }

          case 'COMPLETE': {
            set({ isComplete: true, state: 'completed' });
            options?.onStateChange?.('completed');
            const progress = get().getProgressSnapshot();
            if (progress) {
              options?.onComplete?.(progress);
            }
            break;
          }

          case 'SET_VOLUME': {
            set({
              volume: Math.max(0, Math.min(1, event.volume)),
              isMuted: event.volume === 0,
            });
            break;
          }

          case 'TOGGLE_MUTE': {
            set({ isMuted: !current.isMuted });
            break;
          }

          case 'SET_PLAYBACK_RATE': {
            set({ playbackRate: event.rate });
            break;
          }

          case 'SWITCH_MODE': {
            set({ mode: event.mode });
            break;
          }

          case 'ENTER_BACKGROUND': {
            set({ isBackgroundMode: true, mode: 'audio' });
            break;
          }

          case 'EXIT_BACKGROUND': {
            set({ isBackgroundMode: false });
            break;
          }

          case 'ENTER_FULLSCREEN': {
            set({ isFullscreen: true });
            break;
          }

          case 'EXIT_FULLSCREEN': {
            set({ isFullscreen: false });
            break;
          }

          case 'SCREEN_LOCK': {
            set({ isScreenLocked: true });
            break;
          }

          case 'SCREEN_UNLOCK': {
            set({ isScreenLocked: false });
            break;
          }

          case 'INTERACTION': {
            set({
              engagement: {
                ...current.engagement,
                interactionCount: current.engagement.interactionCount + 1,
                idleTimeMs: 0, // Reset idle on interaction
              },
            });
            break;
          }

          case 'IDLE_TICK': {
            const newIdleTime = current.engagement.idleTimeMs + event.ms;
            set({
              engagement: {
                ...current.engagement,
                idleTimeMs: newIdleTime,
                focusScore: calculateFocusScore(
                  current.sessionTimeMs,
                  newIdleTime,
                  current.engagement.blurTimeMs,
                ),
              },
            });
            break;
          }

          case 'BLUR': {
            set({
              engagement: {
                ...current.engagement,
                blurTimeMs: current.engagement.blurTimeMs + 1000, // Increment per tick
              },
            });
            break;
          }

          case 'FOCUS': {
            // Reset blur tracking
            break;
          }

          case 'TAB_SWITCH': {
            set({
              engagement: {
                ...current.engagement,
                tabSwitches: current.engagement.tabSwitches + 1,
              },
            });
            break;
          }

          case 'SCROLL': {
            set({
              engagement: {
                ...current.engagement,
                scrollVelocity: event.velocity,
              },
            });
            break;
          }

          case 'ONLINE': {
            set({ isOnline: true });
            break;
          }

          case 'OFFLINE': {
            set({ isOnline: false });
            break;
          }

          case 'SYNC_START': {
            set({ isSyncing: true });
            break;
          }

          case 'SYNC_COMPLETE': {
            set({ isSyncing: false, pendingStatements: [] });
            break;
          }

          case 'SYNC_ERROR': {
            set({ isSyncing: false });
            break;
          }

          case 'QUEUE_STATEMENT': {
            set({
              pendingStatements: [...current.pendingStatements, event.statement],
            });
            options?.onStatementQueued?.(event.statement);
            break;
          }

          case 'CLEAR_QUEUE': {
            set({ pendingStatements: [] });
            break;
          }

          case 'RESET': {
            set(initialContext);
            options?.onStateChange?.('idle');
            break;
          }

          case 'RETRY': {
            if (current.state === 'error' && current.atom) {
              set({ state: 'loading', error: null });
              options?.onStateChange?.('loading');
            }
            break;
          }
        }
      },

      // ─── Convenience Methods ───────────────────────────────────────────────────
      load: (atom, progress) => {
        get().dispatch({ type: 'LOAD', atom, progress });
      },

      play: () => {
        get().dispatch({ type: 'PLAY' });
      },

      pause: () => {
        get().dispatch({ type: 'PAUSE' });
      },

      seek: (time) => {
        get().dispatch({ type: 'SEEK', time });
      },

      setVolume: (volume) => {
        get().dispatch({ type: 'SET_VOLUME', volume });
      },

      toggleMute: () => {
        get().dispatch({ type: 'TOGGLE_MUTE' });
      },

      setPlaybackRate: (rate) => {
        get().dispatch({ type: 'SET_PLAYBACK_RATE', rate });
      },

      switchMode: (mode) => {
        get().dispatch({ type: 'SWITCH_MODE', mode });
      },

      enterBackground: () => {
        get().dispatch({ type: 'ENTER_BACKGROUND' });
      },

      exitBackground: () => {
        get().dispatch({ type: 'EXIT_BACKGROUND' });
      },

      toggleFullscreen: () => {
        const current = get();
        get().dispatch({
          type: current.isFullscreen ? 'EXIT_FULLSCREEN' : 'ENTER_FULLSCREEN',
        });
      },

      recordInteraction: () => {
        get().dispatch({ type: 'INTERACTION' });
      },

      queueStatement: (statement) => {
        get().dispatch({ type: 'QUEUE_STATEMENT', statement });
      },

      syncStatements: async () => {
        const current = get();
        if (current.isSyncing || current.pendingStatements.length === 0) return;

        get().dispatch({ type: 'SYNC_START' });

        try {
          // TODO(LXD-XXX): Implement actual sync to LRS/Firestore
          // For now, simulate successful sync
          await new Promise((resolve) => setTimeout(resolve, 500));
          get().dispatch({ type: 'SYNC_COMPLETE' });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          get().dispatch({ type: 'SYNC_ERROR', error: message });
        }
      },

      reset: () => {
        get().dispatch({ type: 'RESET' });
      },

      getProgressSnapshot: () => {
        const current = get();
        if (!current.atom) return null;

        const now = new Date().toISOString();

        return {
          id: '', // Will be set by Firestore
          atom_id: current.atom.id,
          learner_id: '', // Will be set by context
          tenant_id: current.atom.tenant_id,
          status: current.isComplete ? 'completed' : 'in_progress',
          progress_percent: current.progressPercent,
          consumed_via: current.mode as ConsumptionModality,
          playback_speed: current.playbackRate,
          background_mode: current.isBackgroundMode,
          device_type: 'desktop', // TODO: Detect actual device
          time_spent_seconds: Math.round(current.sessionTimeMs / 1000),
          last_position_seconds: Math.round(current.currentTime),
          access_count: 1,
          first_accessed_at: now,
          last_accessed_at: now,
          completed_at: current.isComplete ? now : undefined,
          offline_synced: current.isOnline,
          last_sync_at: now,
          sync_version: 1,
        };
      },
    })),
  );
}

// =============================================================================
// SINGLETON STORE (for simple use cases)
// =============================================================================

/**
 * Default player store instance.
 * Use this for simple single-player scenarios.
 * For multiple players, use createPlayerStore() to create separate instances.
 */
export const usePlayerStore = createPlayerStore();

// =============================================================================
// SELECTORS
// =============================================================================

/**
 * Selector for checking if player is in a playable state.
 */
export const selectIsPlayable = (state: PlayerContext): boolean =>
  state.state === 'ready' ||
  state.state === 'playing' ||
  state.state === 'paused' ||
  state.state === 'buffering' ||
  state.state === 'completed';

/**
 * Selector for checking if player is actively playing.
 */
export const selectIsPlaying = (state: PlayerContext): boolean => state.state === 'playing';

/**
 * Selector for checking if player is loading.
 */
export const selectIsLoading = (state: PlayerContext): boolean =>
  state.state === 'loading' || state.state === 'buffering';

/**
 * Selector for checking if player has error.
 */
export const selectHasError = (state: PlayerContext): boolean => state.state === 'error';

/**
 * Selector for formatted current time.
 */
export const selectFormattedTime = (state: PlayerContext): string => {
  const minutes = Math.floor(state.currentTime / 60);
  const seconds = Math.floor(state.currentTime % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Selector for formatted duration.
 */
export const selectFormattedDuration = (state: PlayerContext): string => {
  const minutes = Math.floor(state.duration / 60);
  const seconds = Math.floor(state.duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Selector for buffered percentage.
 */
export const selectBufferedPercent = (state: PlayerContext): number => {
  if (state.duration === 0) return 0;
  return Math.round((state.bufferedTime / state.duration) * 100);
};

/**
 * Selector for available modalities from atom.
 */
export const selectAvailableModalities = (state: PlayerContext): PlayerMode[] => {
  if (!state.atom?.modalities) return ['video'];

  const modes: PlayerMode[] = [];
  if (state.atom.modalities.video_url) modes.push('video');
  if (state.atom.modalities.audio_url) modes.push('audio');
  if (state.atom.modalities.transcript_text) modes.push('text');

  return modes.length > 0 ? modes : ['video'];
};

/**
 * Selector for pending statement count.
 */
export const selectPendingStatementCount = (state: PlayerContext): number =>
  state.pendingStatements.length;
