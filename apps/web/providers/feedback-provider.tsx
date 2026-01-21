'use client';

/**
 * FeedbackProvider - Context for managing feedback messages, toasts, and celebrations
 * Provides centralized feedback management with queue, history, and accessibility support
 */

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import {
  type AssessmentFeedback,
  type CelebrationFeedback,
  DEFAULT_FEEDBACK_STATE,
  type EncouragementFeedback,
  type FeedbackMessage,
  type FeedbackReducerAction,
  type FeedbackSettings,
  type FeedbackSoundId,
  type FeedbackState,
  type FeedbackType,
  type GuidanceFeedback,
  type ProgressFeedback,
  type SystemFeedback,
} from '@/types/studio/feedback';

// =============================================================================
// CONTEXT TYPES
// =============================================================================

interface FeedbackContextValue {
  // State
  state: FeedbackState;

  // Core methods
  showFeedback: (feedback: Omit<FeedbackMessage, 'id' | 'timestamp'>) => string;
  dismissFeedback: (id: string) => void;
  dismissAll: (type?: FeedbackType) => void;

  // Typed feedback methods
  showAssessmentFeedback: (
    feedback: Omit<AssessmentFeedback, 'id' | 'timestamp' | 'type'>,
  ) => string;
  showGuidanceFeedback: (feedback: Omit<GuidanceFeedback, 'id' | 'timestamp' | 'type'>) => string;
  showProgressFeedback: (feedback: Omit<ProgressFeedback, 'id' | 'timestamp' | 'type'>) => string;
  showSystemFeedback: (feedback: Omit<SystemFeedback, 'id' | 'timestamp' | 'type'>) => string;
  showCelebrationFeedback: (
    feedback: Omit<CelebrationFeedback, 'id' | 'timestamp' | 'type'>,
  ) => string;
  showEncouragementFeedback: (
    feedback: Omit<EncouragementFeedback, 'id' | 'timestamp' | 'type'>,
  ) => string;

  // Quick methods
  toast: (message: string, options?: Partial<FeedbackMessage>) => string;
  success: (message: string, title?: string) => string;
  error: (message: string, title?: string) => string;
  warning: (message: string, title?: string) => string;
  info: (message: string, title?: string) => string;

  // Queue management
  queueFeedback: (feedback: Omit<FeedbackMessage, 'id' | 'timestamp'>, delay: number) => string;
  clearQueue: () => void;

  // Settings
  updateSettings: (settings: Partial<FeedbackSettings>) => void;
  toggleSound: (enabled: boolean) => void;

  // History
  getHistory: (limit?: number) => FeedbackMessage[];
  clearHistory: () => void;

  // Audio
  playSound: (soundId: FeedbackSoundId) => void;

  // Accessibility
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

// =============================================================================
// REDUCER
// =============================================================================

function generateId(): string {
  return `feedback_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function feedbackReducer(state: FeedbackState, action: FeedbackReducerAction): FeedbackState {
  switch (action.type) {
    case 'SHOW_FEEDBACK': {
      const newMessage = action.payload;

      // Handle different display modes
      if (newMessage.displayMode === 'toast') {
        // Stack or replace toasts
        const newToastStack = state.settings.stackToasts
          ? [newMessage, ...state.toastStack].slice(0, state.maxToasts)
          : [newMessage];

        return {
          ...state,
          activeMessages: [...state.activeMessages, newMessage],
          toastStack: newToastStack,
        };
      }

      if (newMessage.displayMode === 'modal') {
        return {
          ...state,
          activeMessages: [...state.activeMessages, newMessage],
          isModalActive: true,
        };
      }

      return {
        ...state,
        activeMessages: [...state.activeMessages, newMessage],
      };
    }

    case 'DISMISS_FEEDBACK': {
      const { id } = action.payload;
      const dismissedMessage = state.activeMessages.find((m) => m.id === id);

      return {
        ...state,
        activeMessages: state.activeMessages.filter((m) => m.id !== id),
        toastStack: state.toastStack.filter((m) => m.id !== id),
        isModalActive: dismissedMessage?.displayMode === 'modal' ? false : state.isModalActive,
        history: dismissedMessage ? [...state.history, dismissedMessage] : state.history,
      };
    }

    case 'DISMISS_ALL': {
      const type = action.payload?.type;
      const toDismiss = type
        ? state.activeMessages.filter((m) => m.type === type)
        : state.activeMessages;
      const remaining = type ? state.activeMessages.filter((m) => m.type !== type) : [];

      return {
        ...state,
        activeMessages: remaining,
        toastStack: type ? state.toastStack.filter((m) => m.type !== type) : [],
        isModalActive: type ? state.isModalActive : false,
        history: [...state.history, ...toDismiss],
      };
    }

    case 'QUEUE_FEEDBACK': {
      const { feedback, delay } = action.payload;
      const queueItem = {
        feedback,
        position: state.queue.length,
        delay,
        isActive: false,
        isDismissed: false,
      };

      return {
        ...state,
        queue: [...state.queue, queueItem],
      };
    }

    case 'DEQUEUE_FEEDBACK': {
      return {
        ...state,
        queue: state.queue.filter((q) => q.feedback.id !== action.payload.id),
      };
    }

    case 'PROCESS_QUEUE': {
      // Process first item in queue
      if (state.queue.length === 0) return state;

      const [first, ...rest] = state.queue;
      if (first.isDismissed) {
        return { ...state, queue: rest };
      }

      return {
        ...state,
        queue: rest,
        activeMessages: [...state.activeMessages, first.feedback],
        toastStack:
          first.feedback.displayMode === 'toast'
            ? [first.feedback, ...state.toastStack].slice(0, state.maxToasts)
            : state.toastStack,
      };
    }

    case 'UPDATE_SETTINGS': {
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    }

    case 'TOGGLE_SOUND': {
      return {
        ...state,
        soundEnabled: action.payload,
        settings: { ...state.settings, audioEnabled: action.payload },
      };
    }

    case 'SET_MODAL_ACTIVE': {
      return {
        ...state,
        isModalActive: action.payload,
      };
    }

    case 'CLEAR_HISTORY': {
      return {
        ...state,
        history: [],
      };
    }

    case 'ADD_TO_HISTORY': {
      return {
        ...state,
        history: [...state.history, action.payload],
      };
    }

    default:
      return state;
  }
}

// =============================================================================
// PROVIDER
// =============================================================================

interface FeedbackProviderProps {
  children: ReactNode;
  initialSettings?: Partial<FeedbackSettings>;
}

export function FeedbackProvider({ children, initialSettings }: FeedbackProviderProps) {
  const initialState: FeedbackState = {
    ...DEFAULT_FEEDBACK_STATE,
    settings: { ...DEFAULT_FEEDBACK_STATE.settings, ...initialSettings },
  };

  const [state, dispatch] = useReducer(feedbackReducer, initialState);
  const timerRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const audioRefs = useRef<Map<FeedbackSoundId, HTMLAudioElement>>(new Map());
  const announcerRef = useRef<HTMLOutputElement>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      for (const timer of timerRefs.current.values()) {
        clearTimeout(timer);
      }
    };
  }, []);

  // Auto-dismiss handling
  useEffect(() => {
    for (const message of state.activeMessages) {
      if (
        message.duration > 0 &&
        state.settings.autoDismiss &&
        !timerRefs.current.has(message.id)
      ) {
        const timer = setTimeout(() => {
          dispatch({ type: 'DISMISS_FEEDBACK', payload: { id: message.id } });
          timerRefs.current.delete(message.id);
        }, message.duration);
        timerRefs.current.set(message.id, timer);
      }
    }

    // Clean up timers for dismissed messages
    for (const [id, timer] of timerRefs.current.entries()) {
      if (!state.activeMessages.find((m) => m.id === id)) {
        clearTimeout(timer);
        timerRefs.current.delete(id);
      }
    }
  }, [state.activeMessages, state.settings.autoDismiss]);

  // Process queue
  useEffect(() => {
    if (state.queue.length > 0) {
      const firstItem = state.queue[0];
      const timer = setTimeout(() => {
        dispatch({ type: 'PROCESS_QUEUE' });
      }, firstItem.delay);

      return () => clearTimeout(timer);
    }
  }, [state.queue]);

  // ==========================================================================
  // AUDIO - must be defined before methods that use it
  // ==========================================================================

  const playSound = useCallback(
    (soundId: FeedbackSoundId) => {
      if (!state.settings.audioEnabled || !state.soundEnabled) return;

      // Get or create audio element
      let audio = audioRefs.current.get(soundId);
      if (!audio) {
        audio = new Audio(`/sounds/feedback/${soundId}.mp3`);
        audio.volume = state.settings.audioVolume;
        audioRefs.current.set(soundId, audio);
      }

      // Reset and play
      audio.currentTime = 0;
      audio.volume = state.settings.audioVolume;
      audio.play().catch(() => {
        // Audio play failed - ignore (common due to autoplay restrictions)
      });
    },
    [state.settings.audioEnabled, state.settings.audioVolume, state.soundEnabled],
  );

  // ==========================================================================
  // ACCESSIBILITY - must be defined before methods that use it
  // ==========================================================================

  const announceToScreenReader = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      if (!announcerRef.current) return;

      // Clear previous announcement
      announcerRef.current.textContent = '';

      // Use setTimeout to ensure the change is announced
      const timeout = setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.setAttribute('aria-live', priority);
          announcerRef.current.textContent = message;
        }
      }, 100);

      return () => clearTimeout(timeout);
    },
    [],
  );

  // ==========================================================================
  // CORE METHODS
  // ==========================================================================

  const showFeedback = useCallback(
    (feedback: Omit<FeedbackMessage, 'id' | 'timestamp'>): string => {
      if (!state.settings.enabled) return '';

      const id = generateId();
      const fullFeedback: FeedbackMessage = {
        ...feedback,
        id,
        timestamp: new Date().toISOString(),
      };

      dispatch({ type: 'SHOW_FEEDBACK', payload: fullFeedback });

      // Screen reader announcement
      if (state.settings.screenReaderAnnouncements) {
        const priority = feedback.priority === 'critical' ? 'assertive' : 'polite';
        announceToScreenReader(feedback.message, priority);
      }

      return id;
    },
    [state.settings.enabled, state.settings.screenReaderAnnouncements, announceToScreenReader],
  );

  const dismissFeedback = useCallback((id: string) => {
    dispatch({ type: 'DISMISS_FEEDBACK', payload: { id } });
  }, []);

  const dismissAll = useCallback((type?: FeedbackType) => {
    dispatch({ type: 'DISMISS_ALL', payload: type ? { type } : undefined });
  }, []);

  // ==========================================================================
  // TYPED FEEDBACK METHODS
  // ==========================================================================

  const showAssessmentFeedback = useCallback(
    (feedback: Omit<AssessmentFeedback, 'id' | 'timestamp' | 'type'>): string => {
      return showFeedback({ ...feedback, type: 'assessment' } as AssessmentFeedback);
    },
    [showFeedback],
  );

  const showGuidanceFeedback = useCallback(
    (feedback: Omit<GuidanceFeedback, 'id' | 'timestamp' | 'type'>): string => {
      return showFeedback({ ...feedback, type: 'guidance' } as GuidanceFeedback);
    },
    [showFeedback],
  );

  const showProgressFeedback = useCallback(
    (feedback: Omit<ProgressFeedback, 'id' | 'timestamp' | 'type'>): string => {
      return showFeedback({ ...feedback, type: 'progress' } as ProgressFeedback);
    },
    [showFeedback],
  );

  const showSystemFeedback = useCallback(
    (feedback: Omit<SystemFeedback, 'id' | 'timestamp' | 'type'>): string => {
      return showFeedback({ ...feedback, type: 'system' } as SystemFeedback);
    },
    [showFeedback],
  );

  const showCelebrationFeedback = useCallback(
    (feedback: Omit<CelebrationFeedback, 'id' | 'timestamp' | 'type'>): string => {
      return showFeedback({ ...feedback, type: 'celebration' } as CelebrationFeedback);
    },
    [showFeedback],
  );

  const showEncouragementFeedback = useCallback(
    (feedback: Omit<EncouragementFeedback, 'id' | 'timestamp' | 'type'>): string => {
      return showFeedback({ ...feedback, type: 'encouragement' } as EncouragementFeedback);
    },
    [showFeedback],
  );

  // ==========================================================================
  // QUICK METHODS
  // ==========================================================================

  const toast = useCallback(
    (message: string, options?: Partial<FeedbackMessage>): string => {
      return showFeedback({
        type: 'system',
        displayMode: 'toast',
        sentiment: 'neutral',
        priority: 'medium',
        message,
        duration: state.settings.defaultToastDuration,
        dismissible: true,
        ...options,
      });
    },
    [showFeedback, state.settings.defaultToastDuration],
  );

  const success = useCallback(
    (message: string, title?: string): string => {
      playSound('success');
      return toast(message, {
        title,
        sentiment: 'positive',
        icon: 'check-circle',
      });
    },
    [toast, playSound],
  );

  const error = useCallback(
    (message: string, title?: string): string => {
      playSound('error');
      return toast(message, {
        title: title || 'Error',
        sentiment: 'negative',
        priority: 'high',
        icon: 'x-circle',
        duration: 0, // Persist until dismissed
      });
    },
    [toast, playSound],
  );

  const warning = useCallback(
    (message: string, title?: string): string => {
      playSound('warning');
      return toast(message, {
        title: title || 'Warning',
        sentiment: 'warning',
        icon: 'exclamation-triangle',
      });
    },
    [toast, playSound],
  );

  const info = useCallback(
    (message: string, title?: string): string => {
      return toast(message, {
        title,
        sentiment: 'neutral',
        icon: 'information-circle',
      });
    },
    [toast],
  );

  // ==========================================================================
  // QUEUE MANAGEMENT
  // ==========================================================================

  const queueFeedback = useCallback(
    (feedback: Omit<FeedbackMessage, 'id' | 'timestamp'>, delay: number): string => {
      const id = generateId();
      const fullFeedback: FeedbackMessage = {
        ...feedback,
        id,
        timestamp: new Date().toISOString(),
      };

      dispatch({ type: 'QUEUE_FEEDBACK', payload: { feedback: fullFeedback, delay } });
      return id;
    },
    [],
  );

  const clearQueue = useCallback(() => {
    for (const item of state.queue) {
      dispatch({ type: 'DEQUEUE_FEEDBACK', payload: { id: item.feedback.id } });
    }
  }, [state.queue]);

  // ==========================================================================
  // SETTINGS
  // ==========================================================================

  const updateSettings = useCallback((settings: Partial<FeedbackSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, []);

  const toggleSound = useCallback((enabled: boolean) => {
    dispatch({ type: 'TOGGLE_SOUND', payload: enabled });
  }, []);

  // ==========================================================================
  // HISTORY
  // ==========================================================================

  const getHistory = useCallback(
    (limit?: number): FeedbackMessage[] => {
      if (limit) {
        return state.history.slice(-limit);
      }
      return state.history;
    },
    [state.history],
  );

  const clearHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_HISTORY' });
  }, []);

  // ==========================================================================
  // CONTEXT VALUE
  // ==========================================================================

  const contextValue = useMemo<FeedbackContextValue>(
    () => ({
      state,
      showFeedback,
      dismissFeedback,
      dismissAll,
      showAssessmentFeedback,
      showGuidanceFeedback,
      showProgressFeedback,
      showSystemFeedback,
      showCelebrationFeedback,
      showEncouragementFeedback,
      toast,
      success,
      error,
      warning,
      info,
      queueFeedback,
      clearQueue,
      updateSettings,
      toggleSound,
      getHistory,
      clearHistory,
      playSound,
      announceToScreenReader,
    }),
    [
      state,
      showFeedback,
      dismissFeedback,
      dismissAll,
      showAssessmentFeedback,
      showGuidanceFeedback,
      showProgressFeedback,
      showSystemFeedback,
      showCelebrationFeedback,
      showEncouragementFeedback,
      toast,
      success,
      error,
      warning,
      info,
      queueFeedback,
      clearQueue,
      updateSettings,
      toggleSound,
      getHistory,
      clearHistory,
      playSound,
      announceToScreenReader,
    ],
  );

  return (
    <FeedbackContext.Provider value={contextValue}>
      {children}
      {/* Screen reader announcer */}
      <output ref={announcerRef} aria-live="polite" aria-atomic="true" className="sr-only" />
    </FeedbackContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }
  return context;
}

// =============================================================================
// SELECTOR HOOKS
// =============================================================================

/**
 * Hook for accessing toast stack only
 */
export function useToasts() {
  const { state, dismissFeedback } = useFeedback();
  return {
    toasts: state.toastStack,
    dismiss: dismissFeedback,
    position: state.settings.toastPosition,
  };
}

/**
 * Hook for accessing active modal feedback
 */
export function useFeedbackModal() {
  const { state, dismissFeedback } = useFeedback();
  const modalFeedback = state.activeMessages.find((m) => m.displayMode === 'modal');

  return {
    isOpen: state.isModalActive,
    feedback: modalFeedback,
    dismiss: () => modalFeedback && dismissFeedback(modalFeedback.id),
  };
}

/**
 * Hook for feedback settings
 */
export function useFeedbackSettings() {
  const { state, updateSettings, toggleSound } = useFeedback();
  return {
    settings: state.settings,
    soundEnabled: state.soundEnabled,
    updateSettings,
    toggleSound,
  };
}
