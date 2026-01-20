'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import type {
  BookmarkState,
  DebugLog,
  LessonProgress,
  NavigationTarget,
  PlayerAction,
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
import {
  DEFAULT_PLAYER_CONFIG,
  deserializePlayerState,
  INITIAL_PLAYER_STATE,
  serializePlayerState,
} from '@/types/studio/player';
import type { TimeMs } from '@/types/studio/timeline';
import type { TriggerAction } from '@/types/studio/triggers';

// =============================================================================
// ID GENERATOR
// =============================================================================

function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// =============================================================================
// REDUCER
// =============================================================================

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    // =========================================================================
    // INITIALIZATION
    // =========================================================================
    case 'INITIALIZE': {
      const lesson = action.lesson;
      const config = action.config;
      const startSlideIndex =
        typeof config.startSlide === 'number'
          ? config.startSlide
          : lesson.slides.findIndex((s) => s.id === config.startSlide) || 0;

      const startSlide = lesson.slides[startSlideIndex];

      // Initialize variables
      const variables = new Map<string, unknown>();
      for (const variable of lesson.variables) {
        variables.set(variable.id, variable.defaultValue);
      }

      return {
        ...state,
        mode: config.mode,
        playbackState: config.autoPlay ? 'playing' : 'idle',
        isInitialized: true,
        isLoading: false,
        error: null,
        lesson,
        currentSlideIndex: startSlideIndex,
        currentSlideId: startSlide?.id || null,
        previousSlideIndex: null,
        canNavigateNext: startSlideIndex < lesson.slides.length - 1,
        canNavigatePrev: startSlideIndex > 0,
        visitedSlides: new Set([startSlide?.id].filter(Boolean) as string[]),
        progress: {
          completedSlides: new Set(),
          totalSlides: lesson.slides.length,
          percentComplete: 0,
          score: 0,
          maxScore: 0,
          passed: null,
          attemptNumber: 1,
          timeSpent: 0,
          lastAccessedSlide: startSlide?.id || null,
        },
        variables,
        objectStates: new Map(),
        activeLayers: new Set(),
        sessionId: generateId('session'),
        startTime: Date.now(),
        elapsedTime: 0,
        debugInfo: config.debug
          ? {
              fps: 0,
              memoryUsage: 0,
              renderTime: 0,
              activeTimelines: 0,
              activeTriggers: 0,
              pendingActions: 0,
              lastTriggerExecution: null,
              logs: [],
            }
          : null,
      };
    }

    case 'RESET':
      return {
        ...INITIAL_PLAYER_STATE,
        sessionId: generateId('session'),
      };

    case 'DESTROY':
      return INITIAL_PLAYER_STATE;

    // =========================================================================
    // PLAYBACK
    // =========================================================================
    case 'PLAY':
      return {
        ...state,
        playbackState: 'playing',
        timelineState: {
          ...state.timelineState,
          isPlaying: true,
          isPaused: false,
        },
      };

    case 'PAUSE':
      return {
        ...state,
        playbackState: 'paused',
        timelineState: {
          ...state.timelineState,
          isPlaying: false,
          isPaused: true,
        },
      };

    case 'STOP':
      return {
        ...state,
        playbackState: 'idle',
        timelineState: {
          ...state.timelineState,
          isPlaying: false,
          isPaused: false,
          currentTime: 0,
        },
      };

    case 'RESUME':
      return {
        ...state,
        playbackState: 'playing',
        timelineState: {
          ...state.timelineState,
          isPlaying: true,
          isPaused: false,
        },
      };

    // =========================================================================
    // NAVIGATION
    // =========================================================================
    case 'GO_TO_SLIDE': {
      if (!state.lesson) return state;

      let targetIndex: number;
      const target = action.target;

      if (target.slideIndex !== undefined) {
        targetIndex = target.slideIndex;
      } else if (target.slideId) {
        targetIndex = state.lesson.slides.findIndex((s) => s.id === target.slideId);
      } else {
        return state;
      }

      if (targetIndex < 0 || targetIndex >= state.lesson.slides.length) {
        return state;
      }

      const targetSlide = state.lesson.slides[targetIndex];
      const newVisited = new Set(state.visitedSlides);
      newVisited.add(targetSlide.id);

      // Add to navigation history
      const newHistory = [
        ...state.navigationHistory,
        {
          slideId: state.currentSlideId || '',
          slideIndex: state.currentSlideIndex,
          timestamp: Date.now(),
          duration: state.timelineState.currentTime,
        },
      ];

      return {
        ...state,
        previousSlideIndex: state.currentSlideIndex,
        currentSlideIndex: targetIndex,
        currentSlideId: targetSlide.id,
        canNavigateNext: targetIndex < state.lesson.slides.length - 1,
        canNavigatePrev: targetIndex > 0,
        visitedSlides: newVisited,
        navigationHistory: newHistory,
        timelineState: {
          ...state.timelineState,
          currentTime: 0,
          duration: targetSlide.duration || 0,
        },
        progress: {
          ...state.progress,
          lastAccessedSlide: targetSlide.id,
        },
      };
    }

    case 'NEXT_SLIDE': {
      if (!state.lesson || state.currentSlideIndex >= state.lesson.slides.length - 1) {
        return state;
      }
      return playerReducer(state, {
        type: 'GO_TO_SLIDE',
        target: { type: 'slide', slideIndex: state.currentSlideIndex + 1 },
      });
    }

    case 'PREV_SLIDE': {
      if (!state.lesson || state.currentSlideIndex <= 0) {
        return state;
      }
      return playerReducer(state, {
        type: 'GO_TO_SLIDE',
        target: { type: 'slide', slideIndex: state.currentSlideIndex - 1 },
      });
    }

    case 'GO_TO_FIRST_SLIDE':
      return playerReducer(state, {
        type: 'GO_TO_SLIDE',
        target: { type: 'slide', slideIndex: 0 },
      });

    case 'GO_TO_LAST_SLIDE': {
      if (!state.lesson) return state;
      return playerReducer(state, {
        type: 'GO_TO_SLIDE',
        target: { type: 'slide', slideIndex: state.lesson.slides.length - 1 },
      });
    }

    // =========================================================================
    // TIMELINE
    // =========================================================================
    case 'PLAY_TIMELINE':
      return {
        ...state,
        timelineState: {
          ...state.timelineState,
          isPlaying: true,
          isPaused: false,
        },
      };

    case 'PAUSE_TIMELINE':
      return {
        ...state,
        timelineState: {
          ...state.timelineState,
          isPlaying: false,
          isPaused: true,
        },
      };

    case 'SEEK_TIMELINE':
      return {
        ...state,
        timelineState: {
          ...state.timelineState,
          currentTime: Math.max(0, Math.min(action.time, state.timelineState.duration)),
        },
      };

    case 'SET_TIMELINE_RATE':
      return {
        ...state,
        timelineState: {
          ...state.timelineState,
          playbackRate: Math.max(0.25, Math.min(4, action.rate)),
        },
      };

    // =========================================================================
    // LAYERS
    // =========================================================================
    case 'SHOW_LAYER': {
      const newLayers = new Set(state.activeLayers);
      newLayers.add(action.layerId);
      return { ...state, activeLayers: newLayers };
    }

    case 'HIDE_LAYER': {
      const newLayers = new Set(state.activeLayers);
      newLayers.delete(action.layerId);
      return { ...state, activeLayers: newLayers };
    }

    case 'TOGGLE_LAYER': {
      const newLayers = new Set(state.activeLayers);
      if (newLayers.has(action.layerId)) {
        newLayers.delete(action.layerId);
      } else {
        newLayers.add(action.layerId);
      }
      return { ...state, activeLayers: newLayers };
    }

    // =========================================================================
    // VARIABLES
    // =========================================================================
    case 'SET_VARIABLE': {
      const newVariables = new Map(state.variables);
      newVariables.set(action.variableId, action.value);
      return { ...state, variables: newVariables };
    }

    case 'INCREMENT_VARIABLE': {
      const newVariables = new Map(state.variables);
      const current = newVariables.get(action.variableId);
      if (typeof current === 'number') {
        newVariables.set(action.variableId, current + (action.amount ?? 1));
      }
      return { ...state, variables: newVariables };
    }

    case 'DECREMENT_VARIABLE': {
      const newVariables = new Map(state.variables);
      const current = newVariables.get(action.variableId);
      if (typeof current === 'number') {
        newVariables.set(action.variableId, current - (action.amount ?? 1));
      }
      return { ...state, variables: newVariables };
    }

    case 'RESET_VARIABLE': {
      if (!state.lesson) return state;
      const variable = state.lesson.variables.find((v) => v.id === action.variableId);
      if (!variable) return state;

      const newVariables = new Map(state.variables);
      newVariables.set(action.variableId, variable.defaultValue);
      return { ...state, variables: newVariables };
    }

    // =========================================================================
    // OBJECT STATES
    // =========================================================================
    case 'SET_OBJECT_STATE': {
      const newStates = new Map(state.objectStates);
      newStates.set(action.objectId, action.stateId);
      return { ...state, objectStates: newStates };
    }

    case 'NEXT_OBJECT_STATE':
    case 'PREV_OBJECT_STATE':
    case 'RESET_OBJECT_STATE':
      // These require knowledge of available states - handled in hook logic
      return state;

    // =========================================================================
    // ASSESSMENT
    // =========================================================================
    case 'SUBMIT_ANSWER': {
      const { attempt } = action;
      const newAttempts = new Map(state.assessmentState.attempts);
      const existing = newAttempts.get(attempt.questionId) || [];
      newAttempts.set(attempt.questionId, [...existing, attempt]);

      const newScores = new Map(state.assessmentState.scores);
      newScores.set(attempt.questionId, attempt.score);

      return {
        ...state,
        assessmentState: {
          ...state.assessmentState,
          attempts: newAttempts,
          scores: newScores,
        },
      };
    }

    case 'RESET_QUESTION': {
      const newAttempts = new Map(state.assessmentState.attempts);
      newAttempts.delete(action.questionId);

      const newScores = new Map(state.assessmentState.scores);
      newScores.delete(action.questionId);

      return {
        ...state,
        assessmentState: {
          ...state.assessmentState,
          attempts: newAttempts,
          scores: newScores,
        },
      };
    }

    case 'COMPLETE_QUIZ':
      // Handled in hook logic
      return state;

    // =========================================================================
    // PROGRESS
    // =========================================================================
    case 'MARK_SLIDE_COMPLETE': {
      const newCompleted = new Set(state.progress.completedSlides);
      newCompleted.add(action.slideId);

      const percentComplete = state.lesson
        ? (newCompleted.size / state.lesson.slides.length) * 100
        : 0;

      return {
        ...state,
        progress: {
          ...state.progress,
          completedSlides: newCompleted,
          percentComplete,
        },
      };
    }

    case 'SAVE_BOOKMARK':
      return {
        ...state,
        progress: {
          ...state.progress,
          bookmark: action.bookmark,
        },
      };

    case 'RESTORE_BOOKMARK': {
      const bookmark = action.bookmark;

      // Restore variables if present
      const variables = bookmark.variables
        ? new Map(Object.entries(bookmark.variables))
        : state.variables;

      // Restore object states if present
      const objectStates = bookmark.objectStates
        ? new Map(Object.entries(bookmark.objectStates))
        : state.objectStates;

      return {
        ...state,
        currentSlideIndex: bookmark.slideIndex,
        currentSlideId: bookmark.slideId,
        variables,
        objectStates,
        timelineState: {
          ...state.timelineState,
          currentTime: bookmark.timelinePosition ?? 0,
        },
      };
    }

    case 'UPDATE_PROGRESS':
      return {
        ...state,
        progress: {
          ...state.progress,
          ...action.progress,
        },
      };

    // =========================================================================
    // TRIGGERS
    // =========================================================================
    case 'EXECUTE_TRIGGER':
    case 'EXECUTE_ACTIONS':
    case 'DISPATCH_EVENT':
      // Handled in hook logic
      return state;

    // =========================================================================
    // DEBUG
    // =========================================================================
    case 'SET_DEBUG_MODE':
      return {
        ...state,
        debugInfo: action.enabled
          ? {
              fps: 0,
              memoryUsage: 0,
              renderTime: 0,
              activeTimelines: 0,
              activeTriggers: 0,
              pendingActions: 0,
              lastTriggerExecution: null,
              logs: state.debugInfo?.logs || [],
            }
          : null,
      };

    case 'LOG_DEBUG': {
      if (!state.debugInfo) return state;

      const logs = [...state.debugInfo.logs, action.log].slice(-100); // Keep last 100 logs
      return {
        ...state,
        debugInfo: {
          ...state.debugInfo,
          logs,
        },
      };
    }

    // =========================================================================
    // ERROR HANDLING
    // =========================================================================
    case 'SET_ERROR':
      return {
        ...state,
        error: action.error?.message || null,
        playbackState: action.error?.recoverable ? state.playbackState : 'error',
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
        playbackState: state.playbackState === 'error' ? 'idle' : state.playbackState,
      };

    default:
      return state;
  }
}

// =============================================================================
// HOOK INTERFACE
// =============================================================================

interface UsePlayerOptions {
  config?: Partial<PlayerConfig>;
  onReady?: () => void;
  onSlideChange?: (slideIndex: number, slideId: string) => void;
  onProgress?: (progress: LessonProgress) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

interface UsePlayerReturn {
  // State
  state: PlayerState;
  currentSlide: PlayerSlide | null;
  isPlaying: boolean;
  isPaused: boolean;
  progress: LessonProgress;
  timelineState: TimelinePlaybackState;

  // Initialization
  initialize: (lesson: PlayerLesson) => void;
  reset: () => void;
  destroy: () => void;

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

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function usePlayer(options: UsePlayerOptions = {}): UsePlayerReturn {
  const { config: userConfig, onReady, onSlideChange, onProgress, onComplete, onError } = options;

  const config = useMemo(
    () => ({
      ...DEFAULT_PLAYER_CONFIG,
      ...userConfig,
    }),
    [userConfig],
  );

  const [state, dispatch] = useReducer(playerReducer, INITIAL_PLAYER_STATE);

  // Event listeners
  const listenersRef = useRef<Map<PlayerEventType, Set<PlayerEventListener>>>(new Map());

  // Elapsed time tracking
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Callback refs for stable references
  const onReadyRef = useRef(onReady);
  const onSlideChangeRef = useRef(onSlideChange);
  const onProgressRef = useRef(onProgress);
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);

  // Update refs
  useEffect(() => {
    onReadyRef.current = onReady;
    onSlideChangeRef.current = onSlideChange;
    onProgressRef.current = onProgress;
    onCompleteRef.current = onComplete;
    onErrorRef.current = onError;
  }, [onReady, onSlideChange, onProgress, onComplete, onError]);

  // ==========================================================================
  // COMPUTED VALUES
  // ==========================================================================

  const currentSlide = useMemo(() => {
    if (!state.lesson || state.currentSlideIndex < 0) return null;
    return state.lesson.slides[state.currentSlideIndex] || null;
  }, [state.lesson, state.currentSlideIndex]);

  // ==========================================================================
  // ELAPSED TIME TRACKING
  // ==========================================================================

  useEffect(() => {
    if (state.playbackState === 'playing') {
      elapsedIntervalRef.current = setInterval(() => {
        // Update elapsed time (this is handled externally to avoid re-renders)
      }, 1000);
    } else if (elapsedIntervalRef.current) {
      clearInterval(elapsedIntervalRef.current);
      elapsedIntervalRef.current = null;
    }

    return () => {
      if (elapsedIntervalRef.current) {
        clearInterval(elapsedIntervalRef.current);
      }
    };
  }, [state.playbackState]);

  // ==========================================================================
  // EVENT EMISSION
  // ==========================================================================

  const emit = useCallback((event: PlayerEvent) => {
    const listeners = listenersRef.current.get(event.type);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in player event listener for ${event.type}:`, error);
        }
      }
    }
  }, []);

  const on = useCallback((eventType: PlayerEventType, listener: PlayerEventListener) => {
    if (!listenersRef.current.has(eventType)) {
      listenersRef.current.set(eventType, new Set());
    }
    listenersRef.current.get(eventType)?.add(listener);

    return () => {
      listenersRef.current.get(eventType)?.delete(listener);
    };
  }, []);

  const off = useCallback((eventType: PlayerEventType, listener: PlayerEventListener) => {
    listenersRef.current.get(eventType)?.delete(listener);
  }, []);

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  const initialize = useCallback(
    (lesson: PlayerLesson) => {
      dispatch({ type: 'INITIALIZE', lesson, config });

      emit({ type: 'ready', timestamp: Date.now() });
      onReadyRef.current?.();
    },
    [config, emit],
  );

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const destroy = useCallback(() => {
    if (elapsedIntervalRef.current) {
      clearInterval(elapsedIntervalRef.current);
    }
    listenersRef.current.clear();
    dispatch({ type: 'DESTROY' });
  }, []);

  // ==========================================================================
  // PLAYBACK
  // ==========================================================================

  const play = useCallback(() => {
    dispatch({ type: 'PLAY' });
    emit({ type: 'play', timestamp: Date.now() });
  }, [emit]);

  const pause = useCallback(() => {
    dispatch({ type: 'PAUSE' });
    emit({ type: 'pause', timestamp: Date.now() });
  }, [emit]);

  const stop = useCallback(() => {
    dispatch({ type: 'STOP' });
    emit({ type: 'stop', timestamp: Date.now() });
  }, [emit]);

  const resume = useCallback(() => {
    dispatch({ type: 'RESUME' });
    emit({ type: 'play', timestamp: Date.now() });
  }, [emit]);

  const togglePlayPause = useCallback(() => {
    if (state.playbackState === 'playing') {
      pause();
    } else {
      play();
    }
  }, [state.playbackState, play, pause]);

  // ==========================================================================
  // NAVIGATION
  // ==========================================================================

  const goToSlide = useCallback(
    (target: NavigationTarget) => {
      const prevIndex = state.currentSlideIndex;
      const prevId = state.currentSlideId;

      dispatch({ type: 'GO_TO_SLIDE', target });

      // Emit events after state update
      if (prevId) {
        emit({
          type: 'slideExit',
          timestamp: Date.now(),
          data: { slideId: prevId, slideIndex: prevIndex },
        });
      }

      // Get target slide info
      let targetIndex: number | undefined;
      if (target.slideIndex !== undefined) {
        targetIndex = target.slideIndex;
      } else if (target.slideId && state.lesson) {
        targetIndex = state.lesson.slides.findIndex((s) => s.id === target.slideId);
      }

      if (targetIndex !== undefined && state.lesson) {
        const targetSlide = state.lesson.slides[targetIndex];
        if (targetSlide) {
          emit({
            type: 'slideEnter',
            timestamp: Date.now(),
            data: { slideId: targetSlide.id, slideIndex: targetIndex },
          });
          onSlideChangeRef.current?.(targetIndex, targetSlide.id);
        }
      }
    },
    [state.currentSlideIndex, state.currentSlideId, state.lesson, emit],
  );

  const nextSlide = useCallback(() => {
    dispatch({ type: 'NEXT_SLIDE' });
  }, []);

  const prevSlide = useCallback(() => {
    dispatch({ type: 'PREV_SLIDE' });
  }, []);

  const goToFirstSlide = useCallback(() => {
    dispatch({ type: 'GO_TO_FIRST_SLIDE' });
  }, []);

  const goToLastSlide = useCallback(() => {
    dispatch({ type: 'GO_TO_LAST_SLIDE' });
  }, []);

  // ==========================================================================
  // TIMELINE
  // ==========================================================================

  const playTimeline = useCallback(() => {
    dispatch({ type: 'PLAY_TIMELINE' });
    emit({ type: 'timelinePlay', timestamp: Date.now() });
  }, [emit]);

  const pauseTimeline = useCallback(() => {
    dispatch({ type: 'PAUSE_TIMELINE' });
    emit({ type: 'timelinePause', timestamp: Date.now() });
  }, [emit]);

  const seekTimeline = useCallback((time: TimeMs) => {
    dispatch({ type: 'SEEK_TIMELINE', time });
  }, []);

  const setTimelineRate = useCallback((rate: number) => {
    dispatch({ type: 'SET_TIMELINE_RATE', rate });
  }, []);

  // ==========================================================================
  // LAYERS
  // ==========================================================================

  const showLayer = useCallback(
    (layerId: string) => {
      dispatch({ type: 'SHOW_LAYER', layerId });
      emit({ type: 'layerShow', timestamp: Date.now(), data: { layerId } });
    },
    [emit],
  );

  const hideLayer = useCallback(
    (layerId: string) => {
      dispatch({ type: 'HIDE_LAYER', layerId });
      emit({ type: 'layerHide', timestamp: Date.now(), data: { layerId } });
    },
    [emit],
  );

  const toggleLayer = useCallback((layerId: string) => {
    dispatch({ type: 'TOGGLE_LAYER', layerId });
  }, []);

  const isLayerVisible = useCallback(
    (layerId: string) => {
      return state.activeLayers.has(layerId);
    },
    [state.activeLayers],
  );

  // ==========================================================================
  // VARIABLES
  // ==========================================================================

  const getVariable = useCallback(
    (variableId: string) => {
      return state.variables.get(variableId);
    },
    [state.variables],
  );

  const setVariable = useCallback(
    (variableId: string, value: unknown) => {
      dispatch({ type: 'SET_VARIABLE', variableId, value });
      emit({ type: 'variableChange', timestamp: Date.now(), data: { variableId, value } });
    },
    [emit],
  );

  const incrementVariable = useCallback((variableId: string, amount?: number) => {
    dispatch({ type: 'INCREMENT_VARIABLE', variableId, amount });
  }, []);

  const decrementVariable = useCallback((variableId: string, amount?: number) => {
    dispatch({ type: 'DECREMENT_VARIABLE', variableId, amount });
  }, []);

  // ==========================================================================
  // OBJECT STATES
  // ==========================================================================

  const getObjectState = useCallback(
    (objectId: string) => {
      return state.objectStates.get(objectId) || null;
    },
    [state.objectStates],
  );

  const setObjectState = useCallback(
    (objectId: string, stateId: string) => {
      dispatch({ type: 'SET_OBJECT_STATE', objectId, stateId });
      emit({ type: 'stateChange', timestamp: Date.now(), data: { objectId, stateId } });
    },
    [emit],
  );

  // ==========================================================================
  // ASSESSMENT
  // ==========================================================================

  const submitAnswer = useCallback(
    (questionId: string, response: unknown, correct: boolean, score: number, maxScore: number) => {
      const attempt: QuestionAttempt = {
        questionId,
        response,
        correct,
        score,
        maxScore,
        timestamp: Date.now(),
      };

      // Dispatch update through reducer
      dispatch({ type: 'SUBMIT_ANSWER', attempt });

      // Emit event for external listeners
      emit({
        type: 'questionAnswered',
        timestamp: Date.now(),
        data: { questionId, response, correct, score, maxScore },
      });
    },
    [emit],
  );

  const getQuestionAttempts = useCallback(
    (questionId: string) => {
      return state.assessmentState.attempts.get(questionId) || [];
    },
    [state.assessmentState.attempts],
  );

  const resetQuestion = useCallback((questionId: string) => {
    dispatch({ type: 'RESET_QUESTION', questionId });
  }, []);

  // ==========================================================================
  // PROGRESS
  // ==========================================================================

  const markSlideComplete = useCallback(
    (slideId: string) => {
      dispatch({ type: 'MARK_SLIDE_COMPLETE', slideId });

      emit({ type: 'slideComplete', timestamp: Date.now(), data: { slideId } });
      emit({ type: 'progressUpdate', timestamp: Date.now(), data: state.progress });
      onProgressRef.current?.(state.progress);

      // Check if lesson is complete
      if (state.lesson) {
        const newCompletedCount = state.progress.completedSlides.size + 1;
        if (newCompletedCount >= state.lesson.slides.length) {
          emit({ type: 'lessonComplete', timestamp: Date.now() });
          onCompleteRef.current?.();
        }
      }
    },
    [state.lesson, state.progress, emit],
  );

  const saveBookmark = useCallback((): BookmarkState => {
    const bookmark: BookmarkState = {
      slideId: state.currentSlideId || '',
      slideIndex: state.currentSlideIndex,
      timelinePosition: state.timelineState.currentTime,
      variables: Object.fromEntries(state.variables),
      objectStates: Object.fromEntries(state.objectStates),
      savedAt: new Date().toISOString(),
    };

    dispatch({ type: 'SAVE_BOOKMARK', bookmark });
    emit({ type: 'bookmarkSave', timestamp: Date.now(), data: bookmark });

    return bookmark;
  }, [
    state.currentSlideId,
    state.currentSlideIndex,
    state.timelineState.currentTime,
    state.variables,
    state.objectStates,
    emit,
  ]);

  const restoreBookmark = useCallback(
    (bookmark: BookmarkState) => {
      dispatch({ type: 'RESTORE_BOOKMARK', bookmark });
      emit({ type: 'bookmarkRestore', timestamp: Date.now(), data: bookmark });
    },
    [emit],
  );

  const saveProgress = useCallback((): SerializablePlayerState => {
    return serializePlayerState(state);
  }, [state]);

  const restoreProgress = useCallback(
    (saved: SerializablePlayerState) => {
      const restored = deserializePlayerState(saved, state);
      // Apply restored state through individual actions
      if (restored.currentSlideIndex !== undefined) {
        goToSlide({ type: 'slide', slideIndex: restored.currentSlideIndex });
      }
      if (restored.variables) {
        for (const [key, value] of restored.variables) {
          setVariable(key, value);
        }
      }
      if (restored.objectStates) {
        for (const [objectId, stateId] of restored.objectStates) {
          setObjectState(objectId, stateId);
        }
      }
    },
    [state, goToSlide, setVariable, setObjectState],
  );

  // ==========================================================================
  // TRIGGERS
  // ==========================================================================

  const executeActions = useCallback(
    async (actions: TriggerAction[]) => {
      for (const action of actions) {
        if (!action.enabled) continue;

        try {
          // Handle delay
          if (action.delay) {
            await new Promise((resolve) => setTimeout(resolve, action.delay));
          }

          // Execute action based on type
          switch (action.type) {
            case 'go-to-slide':
              if (action.config.type === 'navigation' && 'slideId' in action.config) {
                goToSlide({ type: 'slide', slideId: action.config.slideId });
              }
              break;
            case 'go-to-next-slide':
              nextSlide();
              break;
            case 'go-to-previous-slide':
              prevSlide();
              break;
            case 'show':
              if (action.targetObjectId) {
                // Handled by trigger system
              }
              break;
            case 'hide':
              if (action.targetObjectId) {
                // Handled by trigger system
              }
              break;
            case 'go-to-layer':
              if (
                action.config.type === 'navigation' &&
                'layerId' in action.config &&
                action.config.layerId
              ) {
                showLayer(action.config.layerId);
              }
              break;
            case 'close-layer':
              if (
                action.config.type === 'navigation' &&
                'layerId' in action.config &&
                action.config.layerId
              ) {
                hideLayer(action.config.layerId);
              }
              break;
            case 'play-timeline':
              playTimeline();
              break;
            case 'pause-timeline':
              pauseTimeline();
              break;
            case 'set-variable':
              if (action.config.type === 'variable') {
                setVariable(action.config.variableId, action.config.value);
              }
              break;
            case 'increment-variable':
              if (action.config.type === 'variable') {
                incrementVariable(action.config.variableId, action.config.amount);
              }
              break;
            case 'decrement-variable':
              if (action.config.type === 'variable') {
                decrementVariable(action.config.variableId, action.config.amount);
              }
              break;
            case 'go-to-state':
              if (
                action.targetObjectId &&
                action.config.type === 'state' &&
                action.config.stateId
              ) {
                setObjectState(action.targetObjectId, action.config.stateId);
              }
              break;
            default:
              // Other actions handled by trigger engine
              break;
          }

          emit({
            type: 'triggerExecute',
            timestamp: Date.now(),
            data: { actionType: action.type, actionId: action.id },
          });
        } catch (error) {
          console.error(`Error executing action ${action.type}:`, error);
          if (action.onError === 'stop') {
            break;
          }
        }
      }
    },
    [
      goToSlide,
      nextSlide,
      prevSlide,
      showLayer,
      hideLayer,
      playTimeline,
      pauseTimeline,
      setVariable,
      incrementVariable,
      decrementVariable,
      setObjectState,
      emit,
    ],
  );

  const dispatchPlayerEvent = useCallback((eventName: string, data?: unknown) => {
    // Dispatch custom event for trigger system
    if (typeof document !== 'undefined') {
      document.dispatchEvent(new CustomEvent(`player:${eventName}`, { detail: data }));
    }
  }, []);

  // ==========================================================================
  // DEBUG
  // ==========================================================================

  const setDebugMode = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_DEBUG_MODE', enabled });
  }, []);

  const log = useCallback((level: DebugLog['level'], message: string, data?: unknown) => {
    dispatch({
      type: 'LOG_DEBUG',
      log: { level, message, timestamp: Date.now(), data },
    });
  }, []);

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    // State
    state,
    currentSlide,
    isPlaying: state.playbackState === 'playing',
    isPaused: state.playbackState === 'paused',
    progress: state.progress,
    timelineState: state.timelineState,

    // Initialization
    initialize,
    reset,
    destroy,

    // Playback
    play,
    pause,
    stop,
    resume,
    togglePlayPause,

    // Navigation
    goToSlide,
    nextSlide,
    prevSlide,
    goToFirstSlide,
    goToLastSlide,
    canGoNext: state.canNavigateNext,
    canGoPrev: state.canNavigatePrev,

    // Timeline
    playTimeline,
    pauseTimeline,
    seekTimeline,
    setTimelineRate,

    // Layers
    showLayer,
    hideLayer,
    toggleLayer,
    isLayerVisible,

    // Variables
    getVariable,
    setVariable,
    incrementVariable,
    decrementVariable,

    // Object States
    getObjectState,
    setObjectState,

    // Assessment
    submitAnswer,
    getQuestionAttempts,
    resetQuestion,

    // Progress
    markSlideComplete,
    saveBookmark,
    restoreBookmark,
    saveProgress,
    restoreProgress,

    // Events
    on,
    off,
    emit,

    // Triggers
    executeActions,
    dispatchEvent: dispatchPlayerEvent,

    // Debug
    setDebugMode,
    log,
  };
}

export default usePlayer;
