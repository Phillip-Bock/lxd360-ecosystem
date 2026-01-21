'use client';

/**
 * useObjectStates - Hook for managing object state machine
 * Provides state management, transitions, and persistence
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  EasingFunction,
  ObjectState,
  ObjectStateConfig,
  StateHistoryEntry,
  StateProperties,
  StateTransition,
  TransitionAnimation,
} from '@/types/studio/states';
import {
  DEFAULT_ANIMATION,
  interpolateProperties,
  validateStateConfig,
} from '@/types/studio/states';

// =============================================================================
// TYPES
// =============================================================================

export interface UseObjectStatesOptions {
  objectId: string;
  initialStates?: ObjectState[];
  onStateChange?: (fromState: string, toState: string) => void;
  onTransitionStart?: (transitionId: string) => void;
  onTransitionEnd?: (transitionId: string) => void;
  persistToDatabase?: boolean;
  maxHistorySize?: number;
}

export interface UseObjectStatesReturn {
  // State data
  states: ObjectState[];
  currentState: string;
  currentProperties: StateProperties;
  stateHistory: StateHistoryEntry[];

  // State management
  addState: (state: Omit<ObjectState, 'id'>) => string;
  updateState: (stateId: string, updates: Partial<ObjectState>) => void;
  deleteState: (stateId: string) => void;
  duplicateState: (stateId: string) => string;
  setDefaultState: (stateId: string) => void;
  reorderStates: (fromIndex: number, toIndex: number) => void;

  // Transitions
  goToState: (stateId: string, animate?: boolean) => Promise<void>;
  addTransition: (stateId: string, transition: Omit<StateTransition, 'id'>) => string;
  updateTransition: (
    stateId: string,
    transitionId: string,
    updates: Partial<StateTransition>,
  ) => void;
  removeTransition: (stateId: string, transitionId: string) => void;

  // Properties
  updateStateProperties: (stateId: string, properties: Partial<StateProperties>) => void;
  getInterpolatedProperties: (
    progress: number,
    fromState: string,
    toState: string,
  ) => StateProperties;
  getCurrentStateObject: () => ObjectState | undefined;

  // Animation control
  isAnimating: boolean;
  cancelAnimation: () => void;
  animationProgress: number;

  // Persistence
  save: () => Promise<void>;
  load: () => Promise<void>;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;

  // Validation
  errors: Array<{ field: string; message: string }>;
  isValid: boolean;
}

// =============================================================================
// UTILITIES
// =============================================================================

function generateId(): string {
  return `state_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function generateTransitionId(): string {
  return `trans_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function applyEasing(progress: number, easing: EasingFunction): number {
  switch (easing) {
    case 'linear':
      return progress;
    case 'ease':
      return progress < 0.5 ? 2 * progress * progress : 1 - (-2 * progress + 2) ** 2 / 2;
    case 'ease-in':
      return progress * progress;
    case 'ease-out':
      return 1 - (1 - progress) ** 2;
    case 'ease-in-out':
      return progress < 0.5 ? 2 * progress * progress : 1 - (-2 * progress + 2) ** 2 / 2;
    case 'spring':
      return 1 - Math.cos(progress * Math.PI * 0.5) * Math.exp(-progress * 3);
    case 'bounce': {
      if (progress < 1 / 2.75) {
        return 7.5625 * progress * progress;
      }
      if (progress < 2 / 2.75) {
        const t = progress - 1.5 / 2.75;
        return 7.5625 * t * t + 0.75;
      }
      if (progress < 2.5 / 2.75) {
        const t = progress - 2.25 / 2.75;
        return 7.5625 * t * t + 0.9375;
      }
      const t = progress - 2.625 / 2.75;
      return 7.5625 * t * t + 0.984375;
    }
    case 'elastic':
      if (progress === 0 || progress === 1) return progress;
      return -(2 ** (10 * progress - 10)) * Math.sin((progress * 10 - 10.75) * ((2 * Math.PI) / 3));
    default:
      // Handle cubic-bezier
      if (easing.startsWith('cubic-bezier')) {
        // Simplified cubic bezier - in production use a proper library
        return progress;
      }
      return progress;
  }
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useObjectStates(options: UseObjectStatesOptions): UseObjectStatesReturn {
  const {
    objectId,
    initialStates = [],
    onStateChange,
    onTransitionStart,
    onTransitionEnd,
    persistToDatabase = false,
    maxHistorySize = 50,
  } = options;

  // State
  const [states, setStates] = useState<ObjectState[]>(() => {
    if (initialStates.length > 0) return initialStates;
    // Create default state if none provided
    return [
      {
        id: 'default',
        name: 'Default',
        isDefault: true,
        properties: {},
        transitions: [],
        sortOrder: 0,
      },
    ];
  });

  const [currentState, setCurrentState] = useState<string>(() => {
    const defaultState = initialStates.find((s) => s.isDefault);
    return defaultState?.id || initialStates[0]?.id || 'default';
  });

  const [stateHistory, setStateHistory] = useState<StateHistoryEntry[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Refs for animation
  const animationRef = useRef<number | null>(null);
  const animationResolveRef = useRef<(() => void) | null>(null);

  // Computed values
  const currentStateObject = useMemo(
    () => states.find((s) => s.id === currentState),
    [states, currentState],
  );

  const currentProperties = useMemo(
    () => currentStateObject?.properties || {},
    [currentStateObject],
  );

  const errors = useMemo(() => {
    const config: ObjectStateConfig = {
      objectId,
      states,
      currentState,
      stateHistory,
      enabled: true,
    };
    return validateStateConfig(config);
  }, [objectId, states, currentState, stateHistory]);

  const isValid = errors.length === 0;

  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================

  const addState = useCallback(
    (state: Omit<ObjectState, 'id'>): string => {
      const id = generateId();
      const newState: ObjectState = {
        ...state,
        id,
        sortOrder: states.length,
      };

      setStates((prev) => {
        // If this is the default, unset other defaults
        if (newState.isDefault) {
          return [...prev.map((s) => ({ ...s, isDefault: false })), newState];
        }
        return [...prev, newState];
      });

      setIsDirty(true);
      return id;
    },
    [states.length],
  );

  const updateState = useCallback((stateId: string, updates: Partial<ObjectState>) => {
    setStates((prev) => prev.map((s) => (s.id === stateId ? { ...s, ...updates } : s)));
    setIsDirty(true);
  }, []);

  const deleteState = useCallback(
    (stateId: string) => {
      setStates((prev) => {
        const filtered = prev.filter((s) => s.id !== stateId);
        // Ensure at least one state remains
        if (filtered.length === 0) {
          return prev;
        }
        // If deleting default, make first remaining state default
        if (prev.find((s) => s.id === stateId)?.isDefault) {
          filtered[0].isDefault = true;
        }
        return filtered;
      });

      // If deleting current state, switch to default
      if (stateId === currentState) {
        const defaultState = states.find((s) => s.isDefault && s.id !== stateId);
        if (defaultState) {
          setCurrentState(defaultState.id);
        }
      }

      setIsDirty(true);
    },
    [currentState, states],
  );

  const duplicateState = useCallback(
    (stateId: string): string => {
      const original = states.find((s) => s.id === stateId);
      if (!original) return '';

      const id = generateId();
      const duplicate: ObjectState = {
        ...original,
        id,
        name: `${original.name} (Copy)`,
        isDefault: false,
        sortOrder: states.length,
        transitions: original.transitions.map((t) => ({
          ...t,
          id: generateTransitionId(),
        })),
      };

      setStates((prev) => [...prev, duplicate]);
      setIsDirty(true);
      return id;
    },
    [states],
  );

  const setDefaultState = useCallback((stateId: string) => {
    setStates((prev) =>
      prev.map((s) => ({
        ...s,
        isDefault: s.id === stateId,
      })),
    );
    setIsDirty(true);
  }, []);

  const reorderStates = useCallback((fromIndex: number, toIndex: number) => {
    setStates((prev) => {
      const sorted = [...prev].sort((a, b) => a.sortOrder - b.sortOrder);
      const [moved] = sorted.splice(fromIndex, 1);
      sorted.splice(toIndex, 0, moved);
      return sorted.map((s, idx) => ({ ...s, sortOrder: idx }));
    });
    setIsDirty(true);
  }, []);

  // ==========================================================================
  // TRANSITIONS
  // ==========================================================================

  const cancelAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsAnimating(false);
    setAnimationProgress(0);
    if (animationResolveRef.current) {
      animationResolveRef.current();
      animationResolveRef.current = null;
    }
  }, []);

  const goToState = useCallback(
    async (stateId: string, animate = true): Promise<void> => {
      const targetState = states.find((s) => s.id === stateId);
      if (!targetState || stateId === currentState) return;

      const fromState = currentState;

      // Find matching transition for animation config
      const sourceState = states.find((s) => s.id === fromState);
      const transition = sourceState?.transitions.find(
        (t) => t.fromState === fromState && t.toState === stateId && t.enabled,
      );

      const animation: TransitionAnimation = transition?.animation || DEFAULT_ANIMATION;

      if (!animate || animation.duration === 0) {
        // Instant transition
        setCurrentState(stateId);
        setStateHistory((prev) => {
          const entry: StateHistoryEntry = {
            stateId,
            timestamp: new Date(),
            trigger: 'direct',
          };
          const updated = [...prev, entry];
          return updated.slice(-maxHistorySize);
        });
        onStateChange?.(fromState, stateId);
        return;
      }

      // Animated transition
      return new Promise<void>((resolve) => {
        cancelAnimation();
        animationResolveRef.current = resolve;

        setIsAnimating(true);
        onTransitionStart?.(transition?.id || 'direct');

        const startTime = performance.now();
        const { duration, delay = 0, easing } = animation;

        const animate = (time: number) => {
          const elapsed = time - startTime - delay;

          if (elapsed < 0) {
            animationRef.current = requestAnimationFrame(animate);
            return;
          }

          const rawProgress = Math.min(elapsed / duration, 1);
          const easedProgress = applyEasing(rawProgress, easing);
          setAnimationProgress(easedProgress);

          if (rawProgress < 1) {
            animationRef.current = requestAnimationFrame(animate);
          } else {
            // Animation complete
            setCurrentState(stateId);
            setIsAnimating(false);
            setAnimationProgress(0);
            animationRef.current = null;

            setStateHistory((prev) => {
              const entry: StateHistoryEntry = {
                stateId,
                timestamp: new Date(),
                trigger: transition?.trigger.type || 'direct',
              };
              const updated = [...prev, entry];
              return updated.slice(-maxHistorySize);
            });

            onTransitionEnd?.(transition?.id || 'direct');
            onStateChange?.(fromState, stateId);
            resolve();
          }
        };

        animationRef.current = requestAnimationFrame(animate);
      });
    },
    [
      states,
      currentState,
      cancelAnimation,
      onStateChange,
      onTransitionStart,
      onTransitionEnd,
      maxHistorySize,
    ],
  );

  const addTransition = useCallback(
    (stateId: string, transition: Omit<StateTransition, 'id'>): string => {
      const id = generateTransitionId();
      const newTransition: StateTransition = { ...transition, id };

      setStates((prev) =>
        prev.map((s) =>
          s.id === stateId ? { ...s, transitions: [...s.transitions, newTransition] } : s,
        ),
      );

      setIsDirty(true);
      return id;
    },
    [],
  );

  const updateTransition = useCallback(
    (stateId: string, transitionId: string, updates: Partial<StateTransition>) => {
      setStates((prev) =>
        prev.map((s) =>
          s.id === stateId
            ? {
                ...s,
                transitions: s.transitions.map((t) =>
                  t.id === transitionId ? { ...t, ...updates } : t,
                ),
              }
            : s,
        ),
      );
      setIsDirty(true);
    },
    [],
  );

  const removeTransition = useCallback((stateId: string, transitionId: string) => {
    setStates((prev) =>
      prev.map((s) =>
        s.id === stateId
          ? { ...s, transitions: s.transitions.filter((t) => t.id !== transitionId) }
          : s,
      ),
    );
    setIsDirty(true);
  }, []);

  // ==========================================================================
  // PROPERTIES
  // ==========================================================================

  const updateStateProperties = useCallback(
    (stateId: string, properties: Partial<StateProperties>) => {
      setStates((prev) =>
        prev.map((s) =>
          s.id === stateId ? { ...s, properties: { ...s.properties, ...properties } } : s,
        ),
      );
      setIsDirty(true);
    },
    [],
  );

  const getInterpolatedProperties = useCallback(
    (progress: number, fromStateId: string, toStateId: string): StateProperties => {
      const fromState = states.find((s) => s.id === fromStateId);
      const toState = states.find((s) => s.id === toStateId);

      if (!fromState || !toState) return {};

      return interpolateProperties(fromState.properties, toState.properties, progress);
    },
    [states],
  );

  const getCurrentStateObject = useCallback(
    () => states.find((s) => s.id === currentState),
    [states, currentState],
  );

  // ==========================================================================
  // PERSISTENCE
  // ==========================================================================

  const save = useCallback(async (): Promise<void> => {
    if (!persistToDatabase) {
      setIsDirty(false);
      setLastSaved(new Date());
      return;
    }

    setIsSaving(true);

    try {
      // TODO(LXD-297): Implement with Firestore
      // await setDoc(doc(db, 'object_states', objectId), ...)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setIsDirty(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save states:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [persistToDatabase]);

  const load = useCallback(async (): Promise<void> => {
    if (!persistToDatabase) return;

    try {
      // TODO(LXD-297): Implement with Firestore
      // const docSnap = await getDoc(doc(db, 'object_states', objectId))

      // For now, just mark as not dirty
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to load states:', error);
      throw error;
    }
  }, [persistToDatabase]);

  // Load on mount
  useEffect(() => {
    if (persistToDatabase) {
      load();
    }
  }, [persistToDatabase, load]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    // State data
    states,
    currentState,
    currentProperties,
    stateHistory,

    // State management
    addState,
    updateState,
    deleteState,
    duplicateState,
    setDefaultState,
    reorderStates,

    // Transitions
    goToState,
    addTransition,
    updateTransition,
    removeTransition,

    // Properties
    updateStateProperties,
    getInterpolatedProperties,
    getCurrentStateObject,

    // Animation control
    isAnimating,
    cancelAnimation,
    animationProgress,

    // Persistence
    save,
    load,
    isDirty,
    isSaving,
    lastSaved,

    // Validation
    errors,
    isValid,
  };
}

export default useObjectStates;
