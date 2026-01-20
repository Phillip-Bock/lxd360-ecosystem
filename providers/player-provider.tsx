'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { usePlayer } from '@/hooks/studio/use-player';
import type {
  BookmarkState,
  DebugLog,
  LessonProgress,
  NavigationTarget,
  PlayerConfig,
  PlayerEvent,
  PlayerEventListener,
  PlayerEventType,
  PlayerLesson,
  PlayerSlide,
  PlayerState,
  QuestionAttempt,
  SerializablePlayerState,
  TimelinePlaybackState,
} from '@/types/studio/player';
import type { TimeMs } from '@/types/studio/timeline';
import type { TriggerAction } from '@/types/studio/triggers';

// =============================================================================
// CONTEXT TYPE
// =============================================================================

interface PlayerContextValue {
  // State
  state: PlayerState;
  currentSlide: PlayerSlide | null;
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  progress: LessonProgress;
  timelineState: TimelinePlaybackState;

  // Initialization
  initialize: (lesson: PlayerLesson) => void;
  reset: () => void;

  // Playback
  play: () => void;
  pause: () => void;
  stop: () => void;
  resume: () => void;
  togglePlayPause: () => void;

  // Navigation
  goToSlide: (target: NavigationTarget) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  goToFirstSlide: () => void;
  goToLastSlide: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;

  // Timeline
  playTimeline: () => void;
  pauseTimeline: () => void;
  seekTimeline: (time: TimeMs) => void;
  setTimelineRate: (rate: number) => void;

  // Layers
  showLayer: (layerId: string) => void;
  hideLayer: (layerId: string) => void;
  toggleLayer: (layerId: string) => void;
  isLayerVisible: (layerId: string) => boolean;

  // Variables
  getVariable: (variableId: string) => unknown;
  setVariable: (variableId: string, value: unknown) => void;
  incrementVariable: (variableId: string, amount?: number) => void;
  decrementVariable: (variableId: string, amount?: number) => void;

  // Object States
  getObjectState: (objectId: string) => string | null;
  setObjectState: (objectId: string, stateId: string) => void;

  // Assessment
  submitAnswer: (
    questionId: string,
    response: unknown,
    correct: boolean,
    score: number,
    maxScore: number,
  ) => void;
  getQuestionAttempts: (questionId: string) => QuestionAttempt[];
  resetQuestion: (questionId: string) => void;

  // Progress
  markSlideComplete: (slideId: string) => void;
  saveBookmark: () => BookmarkState;
  restoreBookmark: (bookmark: BookmarkState) => void;
  saveProgress: () => SerializablePlayerState;
  restoreProgress: (saved: SerializablePlayerState) => void;

  // Events
  on: (event: PlayerEventType, listener: PlayerEventListener) => () => void;
  off: (event: PlayerEventType, listener: PlayerEventListener) => void;
  emit: (event: PlayerEvent) => void;

  // Triggers
  executeActions: (actions: TriggerAction[]) => Promise<void>;
  dispatchEvent: (eventName: string, data?: unknown) => void;

  // Debug
  setDebugMode: (enabled: boolean) => void;
  log: (level: DebugLog['level'], message: string, data?: unknown) => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

// =============================================================================
// PROVIDER PROPS
// =============================================================================

interface PlayerProviderProps {
  children: ReactNode;

  // Configuration
  config?: Partial<PlayerConfig>;

  // Initial lesson (optional - can also call initialize later)
  lesson?: PlayerLesson;

  // Callbacks
  onReady?: () => void;
  onSlideChange?: (slideIndex: number, slideId: string) => void;
  onProgress?: (progress: LessonProgress) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;

  // Auto-save settings
  autoSaveProgress?: boolean;
  saveProgressKey?: string;
}

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

export function PlayerProvider({
  children,
  config,
  lesson: initialLesson,
  onReady,
  onSlideChange,
  onProgress,
  onComplete,
  onError,
  autoSaveProgress = false,
  saveProgressKey,
}: PlayerProviderProps) {
  const player = usePlayer({
    config,
    onReady,
    onSlideChange,
    onProgress,
    onComplete,
    onError,
  });

  const hasInitializedRef = useRef(false);

  // Initialize with lesson if provided
  useEffect(() => {
    if (initialLesson && !hasInitializedRef.current) {
      hasInitializedRef.current = true;

      // Check for saved progress
      if (autoSaveProgress && saveProgressKey) {
        try {
          const savedData = localStorage.getItem(saveProgressKey);
          if (savedData) {
            const saved = JSON.parse(savedData) as SerializablePlayerState;
            player.initialize(initialLesson);
            player.restoreProgress(saved);
            return;
          }
        } catch {
          // Ignore parsing errors, start fresh
        }
      }

      player.initialize(initialLesson);
    }
  }, [initialLesson, player, autoSaveProgress, saveProgressKey]);

  // Auto-save progress
  useEffect(() => {
    if (!autoSaveProgress || !saveProgressKey || !player.state.isInitialized) {
      return;
    }

    const saveInterval = setInterval(() => {
      try {
        const progress = player.saveProgress();
        localStorage.setItem(saveProgressKey, JSON.stringify(progress));
      } catch {
        // Ignore storage errors
      }
    }, 30000); // Save every 30 seconds

    // Also save on visibility change (tab switch/close)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        try {
          const progress = player.saveProgress();
          localStorage.setItem(saveProgressKey, JSON.stringify(progress));
        } catch {
          // Ignore storage errors
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(saveInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [autoSaveProgress, saveProgressKey, player]);

  // Cleanup on unmount - intentionally empty deps to only run once
  // biome-ignore lint/correctness/useExhaustiveDependencies: cleanup effect intentionally runs only on unmount
  useEffect(() => {
    return () => {
      // Save progress on unmount if enabled
      if (autoSaveProgress && saveProgressKey && player.state.isInitialized) {
        try {
          const progress = player.saveProgress();
          localStorage.setItem(saveProgressKey, JSON.stringify(progress));
        } catch {
          // Ignore storage errors
        }
      }

      player.destroy();
    };
  }, []);

  // Custom initialize that supports auto-save restore
  const initialize = useCallback(
    (lesson: PlayerLesson) => {
      if (autoSaveProgress && saveProgressKey) {
        try {
          const savedData = localStorage.getItem(saveProgressKey);
          if (savedData) {
            const saved = JSON.parse(savedData) as SerializablePlayerState;
            player.initialize(lesson);
            player.restoreProgress(saved);
            return;
          }
        } catch {
          // Ignore parsing errors
        }
      }

      player.initialize(lesson);
    },
    [player, autoSaveProgress, saveProgressKey],
  );

  // ----------------------------------------
  // CONTEXT VALUE
  // ----------------------------------------

  const contextValue: PlayerContextValue = useMemo(
    () => ({
      // State
      state: player.state,
      currentSlide: player.currentSlide,
      isPlaying: player.isPlaying,
      isPaused: player.isPaused,
      isLoading: player.state.isLoading,
      isInitialized: player.state.isInitialized,
      progress: player.progress,
      timelineState: player.timelineState,

      // Initialization
      initialize,
      reset: player.reset,

      // Playback
      play: player.play,
      pause: player.pause,
      stop: player.stop,
      resume: player.resume,
      togglePlayPause: player.togglePlayPause,

      // Navigation
      goToSlide: player.goToSlide,
      nextSlide: player.nextSlide,
      prevSlide: player.prevSlide,
      goToFirstSlide: player.goToFirstSlide,
      goToLastSlide: player.goToLastSlide,
      canGoNext: player.canGoNext,
      canGoPrev: player.canGoPrev,

      // Timeline
      playTimeline: player.playTimeline,
      pauseTimeline: player.pauseTimeline,
      seekTimeline: player.seekTimeline,
      setTimelineRate: player.setTimelineRate,

      // Layers
      showLayer: player.showLayer,
      hideLayer: player.hideLayer,
      toggleLayer: player.toggleLayer,
      isLayerVisible: player.isLayerVisible,

      // Variables
      getVariable: player.getVariable,
      setVariable: player.setVariable,
      incrementVariable: player.incrementVariable,
      decrementVariable: player.decrementVariable,

      // Object States
      getObjectState: player.getObjectState,
      setObjectState: player.setObjectState,

      // Assessment
      submitAnswer: player.submitAnswer,
      getQuestionAttempts: player.getQuestionAttempts,
      resetQuestion: player.resetQuestion,

      // Progress
      markSlideComplete: player.markSlideComplete,
      saveBookmark: player.saveBookmark,
      restoreBookmark: player.restoreBookmark,
      saveProgress: player.saveProgress,
      restoreProgress: player.restoreProgress,

      // Events
      on: player.on,
      off: player.off,
      emit: player.emit,

      // Triggers
      executeActions: player.executeActions,
      dispatchEvent: player.dispatchEvent,

      // Debug
      setDebugMode: player.setDebugMode,
      log: player.log,
    }),
    [player, initialize],
  );

  return <PlayerContext.Provider value={contextValue}>{children}</PlayerContext.Provider>;
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook to access player context.
 * @throws Error if used outside PlayerProvider
 */
export function usePlayerContext(): PlayerContextValue {
  const context = useContext(PlayerContext);

  if (!context) {
    throw new Error('usePlayerContext must be used within a PlayerProvider');
  }

  return context;
}

/**
 * Optional hook that returns null if outside provider.
 */
export function usePlayerContextOptional(): PlayerContextValue | null {
  return useContext(PlayerContext);
}

/**
 * Hook for navigation controls only.
 */
export function usePlayerNavigation() {
  const context = usePlayerContext();

  return {
    goToSlide: context.goToSlide,
    nextSlide: context.nextSlide,
    prevSlide: context.prevSlide,
    goToFirstSlide: context.goToFirstSlide,
    goToLastSlide: context.goToLastSlide,
    canGoNext: context.canGoNext,
    canGoPrev: context.canGoPrev,
    currentSlide: context.currentSlide,
    currentSlideIndex: context.state.currentSlideIndex,
  };
}

/**
 * Hook for playback controls only.
 */
export function usePlayerPlayback() {
  const context = usePlayerContext();

  return {
    play: context.play,
    pause: context.pause,
    stop: context.stop,
    resume: context.resume,
    togglePlayPause: context.togglePlayPause,
    isPlaying: context.isPlaying,
    isPaused: context.isPaused,
  };
}

/**
 * Hook for timeline controls only.
 */
export function usePlayerTimeline() {
  const context = usePlayerContext();

  return {
    playTimeline: context.playTimeline,
    pauseTimeline: context.pauseTimeline,
    seekTimeline: context.seekTimeline,
    setTimelineRate: context.setTimelineRate,
    timelineState: context.timelineState,
  };
}

/**
 * Hook for progress tracking only.
 */
export function usePlayerProgress() {
  const context = usePlayerContext();

  return {
    progress: context.progress,
    markSlideComplete: context.markSlideComplete,
    saveBookmark: context.saveBookmark,
    restoreBookmark: context.restoreBookmark,
    saveProgress: context.saveProgress,
    restoreProgress: context.restoreProgress,
  };
}

/**
 * Hook for variable management only.
 */
export function usePlayerVariables() {
  const context = usePlayerContext();

  return {
    getVariable: context.getVariable,
    setVariable: context.setVariable,
    incrementVariable: context.incrementVariable,
    decrementVariable: context.decrementVariable,
    variables: context.state.variables,
  };
}

/**
 * Hook for layer management only.
 */
export function usePlayerLayers() {
  const context = usePlayerContext();

  return {
    showLayer: context.showLayer,
    hideLayer: context.hideLayer,
    toggleLayer: context.toggleLayer,
    isLayerVisible: context.isLayerVisible,
    activeLayers: context.state.activeLayers,
  };
}

/**
 * Hook for assessment only.
 */
export function usePlayerAssessment() {
  const context = usePlayerContext();

  return {
    submitAnswer: context.submitAnswer,
    getQuestionAttempts: context.getQuestionAttempts,
    resetQuestion: context.resetQuestion,
    assessmentState: context.state.assessmentState,
  };
}
