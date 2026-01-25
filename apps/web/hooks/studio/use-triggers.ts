/**
 * useTriggers Hook - Phase 9
 * React hook for managing triggers and actions in INSPIRE Studio
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { logger } from '@/lib/logger';
import { createTriggerEngine, type TriggerEngine } from '@/lib/studio/trigger-engine';
import type {
  AnimateActionConfig,
  AudioActionConfig,
  NavigationActionConfig,
  Trigger,
  TriggerAction,
  TriggerAPI,
  TriggerExecution,
  VisibilityActionConfig,
  XAPIActionConfig,
} from '@/types/studio/triggers';

const log = logger.scope('useTriggers');

// =============================================================================
// TYPES
// =============================================================================

interface UseTriggersOptions {
  lessonId: string;
  slideId: string;
  onSlideChange?: (slideId: string) => void;
  onLayerChange?: (layerId: string, visible: boolean) => void;
  onNavigate?: (direction: 'next' | 'previous' | 'first' | 'last') => void;
  debugMode?: boolean;
  enabled?: boolean;
}

interface UseTriggersReturn {
  // Engine
  engine: TriggerEngine | null;

  // Registration
  registerObjectTriggers: (objectId: string, triggers: Trigger[]) => void;
  registerSlideTriggers: (slideId: string, triggers: Trigger[]) => void;
  registerGlobalTriggers: (triggers: Trigger[]) => void;
  unregisterObjectTriggers: (objectId: string) => void;
  unregisterSlideTriggers: (slideId: string) => void;

  // Event handling
  handleClick: (objectId: string, event: React.MouseEvent) => void;
  handleDoubleClick: (objectId: string, event: React.MouseEvent) => void;
  handleMouseEnter: (objectId: string, event: React.MouseEvent) => void;
  handleMouseLeave: (objectId: string, event: React.MouseEvent) => void;
  handleKeyDown: (objectId: string, event: React.KeyboardEvent) => void;
  handleKeyUp: (objectId: string, event: React.KeyboardEvent) => void;
  handleFocus: (objectId: string, event: React.FocusEvent) => void;
  handleBlur: (objectId: string, event: React.FocusEvent) => void;
  handleDragStart: (objectId: string, event: React.DragEvent) => void;
  handleDragEnd: (objectId: string, event: React.DragEvent) => void;
  handleDrop: (objectId: string, event: React.DragEvent) => void;

  // Direct action execution
  executeActions: (actions: TriggerAction[]) => Promise<void>;

  // Lifecycle events
  emitSlideEnter: (slideId: string) => void;
  emitSlideExit: (slideId: string) => void;
  emitLessonStart: () => void;
  emitLessonComplete: () => void;
  emitCustomEvent: (eventName: string, payload?: unknown) => void;

  // State
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  debugMode: boolean;
  setDebugMode: (enabled: boolean) => void;

  // History
  executionHistory: TriggerExecution[];
  clearHistory: () => void;
}

// =============================================================================
// AUDIO UTILITIES
// =============================================================================

const audioCache = new Map<string, HTMLAudioElement>();
let currentAudio: HTMLAudioElement | null = null;

function playAudio(src: string, options?: AudioActionConfig): void {
  if (typeof window === 'undefined') return;

  let audio = audioCache.get(src);
  if (!audio) {
    audio = new Audio(src);
    audioCache.set(src, audio);
  }

  if (options?.stopOthers && currentAudio && currentAudio !== audio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  audio.volume = options?.volume ?? 1;
  audio.loop = options?.loop ?? false;
  audio.currentTime = 0;
  audio.play().catch(console.error);
  currentAudio = audio;
}

function stopAudio(src?: string): void {
  if (src) {
    const audio = audioCache.get(src);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  } else {
    // Stop all
    audioCache.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    currentAudio = null;
  }
}

// =============================================================================
// MAIN HOOK
// =============================================================================

export function useTriggers(options: UseTriggersOptions): UseTriggersReturn {
  const {
    // lessonId - reserved for future analytics
    slideId,
    onSlideChange,
    onLayerChange,
    onNavigate,
    debugMode: initialDebugMode = false,
    enabled: initialEnabled = true,
  } = options;

  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [debugMode, setDebugMode] = useState(initialDebugMode);
  const [executionHistory, setExecutionHistory] = useState<TriggerExecution[]>([]);

  // Refs for stable callbacks
  const onSlideChangeRef = useRef(onSlideChange);
  const onLayerChangeRef = useRef(onLayerChange);
  const onNavigateRef = useRef(onNavigate);

  // Update refs
  useEffect(() => {
    onSlideChangeRef.current = onSlideChange;
    onLayerChangeRef.current = onLayerChange;
    onNavigateRef.current = onNavigate;
  }, [onSlideChange, onLayerChange, onNavigate]);

  // Object visibility state
  const objectVisibilityRef = useRef<Map<string, boolean>>(new Map());

  // Object states
  const objectStatesRef = useRef<Map<string, string>>(new Map());

  // Variables
  const variablesRef = useRef<Map<string, unknown>>(new Map());

  // Media elements
  const mediaElementsRef = useRef<Map<string, HTMLMediaElement>>(new Map());

  // Animations
  const animationsRef = useRef<Map<string, Animation>>(new Map());

  // Custom event listeners
  const customEventListenersRef = useRef<Map<string, Set<(payload?: unknown) => void>>>(new Map());

  // Create the API
  const api = useMemo<TriggerAPI>(
    () => ({
      // Object manipulation
      showObject: (objectId: string, transition?: VisibilityActionConfig['transition']) => {
        objectVisibilityRef.current.set(objectId, true);

        const element = document.querySelector(`[data-object-id="${objectId}"]`) as HTMLElement;
        if (element) {
          if (transition?.type === 'fade') {
            element.style.transition = `opacity ${transition.duration || 300}ms ${transition.easing || 'ease'}`;
            element.style.opacity = '0';
            element.style.display = '';
            requestAnimationFrame(() => {
              element.style.opacity = '1';
            });
          } else {
            element.style.display = '';
          }
        }
      },

      hideObject: (objectId: string, transition?: VisibilityActionConfig['transition']) => {
        objectVisibilityRef.current.set(objectId, false);

        const element = document.querySelector(`[data-object-id="${objectId}"]`) as HTMLElement;
        if (element) {
          if (transition?.type === 'fade') {
            element.style.transition = `opacity ${transition.duration || 300}ms ${transition.easing || 'ease'}`;
            element.style.opacity = '0';
            setTimeout(() => {
              element.style.display = 'none';
            }, transition.duration || 300);
          } else {
            element.style.display = 'none';
          }
        }
      },

      setObjectState: (objectId: string, stateId: string) => {
        objectStatesRef.current.set(objectId, stateId);

        const element = document.querySelector(`[data-object-id="${objectId}"]`);
        if (element) {
          element.setAttribute('data-state', stateId);
          // Dispatch custom event for React components to react
          element.dispatchEvent(new CustomEvent('statechange', { detail: { stateId } }));
        }
      },

      animateObject: (objectId: string, animation: AnimateActionConfig['animation']) => {
        const element = document.querySelector(`[data-object-id="${objectId}"]`) as HTMLElement;
        if (!element) return;

        // Cancel existing animation
        const existingAnim = animationsRef.current.get(objectId);
        if (existingAnim) {
          existingAnim.cancel();
        }

        // Build keyframes
        const keyframes: Keyframe[] = [];
        const fromFrame: Keyframe = {};
        const toFrame: Keyframe = {};

        Object.entries(animation.properties).forEach(([prop, values]) => {
          const cssProperty = prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
          if (values.from !== undefined) {
            fromFrame[cssProperty as keyof Keyframe] = String(values.from);
          }
          toFrame[cssProperty as keyof Keyframe] = String(values.to);
        });

        if (Object.keys(fromFrame).length > 0) {
          keyframes.push(fromFrame);
        }
        keyframes.push(toFrame);

        // Create animation
        const anim = element.animate(keyframes, {
          duration: animation.duration,
          easing: animation.easing || 'ease',
          delay: animation.delay || 0,
          iterations: animation.repeat === -1 ? Infinity : animation.repeat || 1,
          direction: animation.yoyo ? 'alternate' : 'normal',
          fill: 'forwards',
        });

        animationsRef.current.set(objectId, anim);
      },

      // Navigation
      goToSlide: (
        slideIdOrIndex: string | number,
        _transition?: NavigationActionConfig['transition'],
      ) => {
        const targetSlide =
          typeof slideIdOrIndex === 'string' ? slideIdOrIndex : `slide-${slideIdOrIndex}`;
        onSlideChangeRef.current?.(targetSlide);
      },

      goToNextSlide: () => {
        onNavigateRef.current?.('next');
      },

      goToPreviousSlide: () => {
        onNavigateRef.current?.('previous');
      },

      showLayer: (layerId: string) => {
        onLayerChangeRef.current?.(layerId, true);
      },

      hideLayer: (layerId: string) => {
        onLayerChangeRef.current?.(layerId, false);
      },

      // Media
      playMedia: (objectId: string) => {
        const element = mediaElementsRef.current.get(objectId);
        if (element) {
          element.play().catch(console.error);
        } else {
          const mediaEl = document.querySelector(
            `[data-object-id="${objectId}"] video, [data-object-id="${objectId}"] audio`,
          ) as HTMLMediaElement;
          if (mediaEl) {
            mediaElementsRef.current.set(objectId, mediaEl);
            mediaEl.play().catch(console.error);
          }
        }
      },

      pauseMedia: (objectId: string) => {
        const element = mediaElementsRef.current.get(objectId);
        if (element) {
          element.pause();
        } else {
          const mediaEl = document.querySelector(
            `[data-object-id="${objectId}"] video, [data-object-id="${objectId}"] audio`,
          ) as HTMLMediaElement;
          if (mediaEl) {
            mediaElementsRef.current.set(objectId, mediaEl);
            mediaEl.pause();
          }
        }
      },

      seekMedia: (objectId: string, timeMs: number) => {
        const element = mediaElementsRef.current.get(objectId);
        if (element) {
          element.currentTime = timeMs / 1000;
        } else {
          const mediaEl = document.querySelector(
            `[data-object-id="${objectId}"] video, [data-object-id="${objectId}"] audio`,
          ) as HTMLMediaElement;
          if (mediaEl) {
            mediaElementsRef.current.set(objectId, mediaEl);
            mediaEl.currentTime = timeMs / 1000;
          }
        }
      },

      // Variables
      getVariable: (variableId: string) => {
        return variablesRef.current.get(variableId);
      },

      setVariable: (variableId: string, value: unknown) => {
        variablesRef.current.set(variableId, value);
        // Dispatch variable change event
        if (engineRef.current) {
          engineRef.current.setVariable(variableId, value);
        }
      },

      // Timeline (placeholder - integrate with actual timeline)
      playTimeline: () => {
        document.dispatchEvent(new CustomEvent('timeline:play'));
      },

      pauseTimeline: () => {
        document.dispatchEvent(new CustomEvent('timeline:pause'));
      },

      seekTimeline: (timeMs: number) => {
        document.dispatchEvent(new CustomEvent('timeline:seek', { detail: { time: timeMs } }));
      },

      // Audio
      playSound: (src: string, options?: AudioActionConfig) => {
        playAudio(src, options);
      },

      stopSound: (src?: string) => {
        stopAudio(src);
      },

      // xAPI
      emitStatement: (config: XAPIActionConfig) => {
        // Dispatch custom event for xAPI handler
        document.dispatchEvent(new CustomEvent('xapi:statement', { detail: config }));
      },

      // Custom events
      dispatchEvent: (eventName: string, payload?: unknown) => {
        const listeners = customEventListenersRef.current.get(eventName);
        if (listeners) {
          listeners.forEach((listener) => {
            listener(payload);
          });
        }

        // Also dispatch DOM event for cross-component communication
        document.dispatchEvent(new CustomEvent(`trigger:${eventName}`, { detail: payload }));
      },

      // Utilities
      wait: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

      log: (...args: unknown[]) => {
        if (debugMode) {
          log.debug('TriggerEngine', { args });
        }
      },
    }),
    [debugMode],
  );

  // Create engine
  const engineRef = useRef<TriggerEngine | null>(null);

  useEffect(() => {
    engineRef.current = createTriggerEngine(api);
    engineRef.current.setDebugMode(debugMode);
    engineRef.current.setEnabled(isEnabled);

    return () => {
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, [api, debugMode, isEnabled]);

  // Update engine settings when they change
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setDebugMode(debugMode);
      engineRef.current.setEnabled(isEnabled);
    }
  }, [debugMode, isEnabled]);

  // Sync execution history
  useEffect(() => {
    const interval = setInterval(() => {
      if (engineRef.current) {
        const history = engineRef.current.getExecutionHistory();
        if (history.length !== executionHistory.length) {
          setExecutionHistory([...history]);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [executionHistory.length]);

  // ----------------------------------------
  // REGISTRATION
  // ----------------------------------------

  const registerObjectTriggers = useCallback((objectId: string, triggers: Trigger[]) => {
    if (engineRef.current) {
      engineRef.current.registerTriggers(triggers, { objectId });
    }
  }, []);

  const registerSlideTriggers = useCallback((targetSlideId: string, triggers: Trigger[]) => {
    if (engineRef.current) {
      engineRef.current.registerTriggers(triggers, { slideId: targetSlideId });
    }
  }, []);

  const registerGlobalTriggers = useCallback((triggers: Trigger[]) => {
    if (engineRef.current) {
      engineRef.current.registerTriggers(triggers, {});
    }
  }, []);

  const unregisterObjectTriggers = useCallback((objectId: string) => {
    if (engineRef.current) {
      engineRef.current.unregisterObjectTriggers(objectId);
    }
  }, []);

  const unregisterSlideTriggers = useCallback((targetSlideId: string) => {
    if (engineRef.current) {
      engineRef.current.unregisterSlideTriggers(targetSlideId);
    }
  }, []);

  // ----------------------------------------
  // EVENT HANDLERS
  // ----------------------------------------

  // Wrapped in useCallback to prevent recreation on every render
  const createEventData = useCallback(
    (
      event: React.MouseEvent | React.KeyboardEvent | React.FocusEvent | React.DragEvent,
    ): Record<string, unknown> => {
      const data: Record<string, unknown> = {
        type: event.type,
        timestamp: Date.now(),
      };

      if ('key' in event) {
        data.key = event.key;
        data.code = event.code;
        data.ctrlKey = event.ctrlKey;
        data.shiftKey = event.shiftKey;
        data.altKey = event.altKey;
        data.metaKey = event.metaKey;
      }

      if ('button' in event) {
        data.button = event.button;
        data.clientX = event.clientX;
        data.clientY = event.clientY;
        data.ctrlKey = event.ctrlKey;
        data.shiftKey = event.shiftKey;
        data.altKey = event.altKey;
        data.metaKey = event.metaKey;
      }

      return data;
    },
    [],
  );

  const handleClick = useCallback(
    (objectId: string, event: React.MouseEvent) => {
      engineRef.current?.handleEvent('click', {
        objectId,
        slideId,
        originalEvent: event.nativeEvent,
        eventData: createEventData(event),
      });
    },
    [slideId, createEventData],
  );

  const handleDoubleClick = useCallback(
    (objectId: string, event: React.MouseEvent) => {
      engineRef.current?.handleEvent('double-click', {
        objectId,
        slideId,
        originalEvent: event.nativeEvent,
        eventData: createEventData(event),
      });
    },
    [slideId, createEventData],
  );

  const handleMouseEnter = useCallback(
    (objectId: string, event: React.MouseEvent) => {
      engineRef.current?.handleEvent('mouse-enter', {
        objectId,
        slideId,
        originalEvent: event.nativeEvent,
        eventData: createEventData(event),
      });
      engineRef.current?.handleEvent('hover-start', {
        objectId,
        slideId,
        originalEvent: event.nativeEvent,
        eventData: createEventData(event),
      });
    },
    [slideId, createEventData],
  );

  const handleMouseLeave = useCallback(
    (objectId: string, event: React.MouseEvent) => {
      engineRef.current?.handleEvent('mouse-leave', {
        objectId,
        slideId,
        originalEvent: event.nativeEvent,
        eventData: createEventData(event),
      });
      engineRef.current?.handleEvent('hover-end', {
        objectId,
        slideId,
        originalEvent: event.nativeEvent,
        eventData: createEventData(event),
      });
    },
    [slideId, createEventData],
  );

  const handleKeyDown = useCallback(
    (objectId: string, event: React.KeyboardEvent) => {
      engineRef.current?.handleEvent('key-down', {
        objectId,
        slideId,
        originalEvent: event.nativeEvent,
        eventData: createEventData(event),
      });
    },
    [slideId, createEventData],
  );

  const handleKeyUp = useCallback(
    (objectId: string, event: React.KeyboardEvent) => {
      engineRef.current?.handleEvent('key-up', {
        objectId,
        slideId,
        originalEvent: event.nativeEvent,
        eventData: createEventData(event),
      });
      engineRef.current?.handleEvent('key-press', {
        objectId,
        slideId,
        originalEvent: event.nativeEvent,
        eventData: createEventData(event),
      });
    },
    [slideId, createEventData],
  );

  const handleFocus = useCallback(
    (objectId: string, event: React.FocusEvent) => {
      engineRef.current?.handleEvent('focus', {
        objectId,
        slideId,
        originalEvent: event.nativeEvent,
        eventData: createEventData(event),
      });
    },
    [slideId, createEventData],
  );

  const handleBlur = useCallback(
    (objectId: string, event: React.FocusEvent) => {
      engineRef.current?.handleEvent('blur', {
        objectId,
        slideId,
        originalEvent: event.nativeEvent,
        eventData: createEventData(event),
      });
    },
    [slideId, createEventData],
  );

  const handleDragStart = useCallback(
    (objectId: string, event: React.DragEvent) => {
      engineRef.current?.handleEvent('drag-start', {
        objectId,
        slideId,
        originalEvent: event.nativeEvent,
        eventData: createEventData(event),
      });
    },
    [slideId, createEventData],
  );

  const handleDragEnd = useCallback(
    (objectId: string, event: React.DragEvent) => {
      engineRef.current?.handleEvent('drag-end', {
        objectId,
        slideId,
        originalEvent: event.nativeEvent,
        eventData: createEventData(event),
      });
    },
    [slideId, createEventData],
  );

  const handleDrop = useCallback(
    (objectId: string, event: React.DragEvent) => {
      engineRef.current?.handleEvent('drop', {
        objectId,
        slideId,
        originalEvent: event.nativeEvent,
        eventData: createEventData(event),
      });
    },
    [slideId, createEventData],
  );

  // ----------------------------------------
  // DIRECT EXECUTION
  // ----------------------------------------

  const executeActions = useCallback(async (actions: TriggerAction[]) => {
    if (!engineRef.current) return;

    // Create a temporary trigger to execute
    const tempTrigger: Trigger = {
      id: `temp_${Date.now()}`,
      name: 'Direct Execution',
      enabled: true,
      event: { type: 'custom-event', config: { type: 'custom', eventName: 'direct' } },
      actions,
      settings: {
        executeOnce: false,
        continueOnError: true,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    engineRef.current.registerTrigger(tempTrigger, {});
    engineRef.current.handleEvent('custom-event', {
      eventData: { eventName: 'direct' },
    });
    engineRef.current.unregisterTrigger(tempTrigger.id);
  }, []);

  // ----------------------------------------
  // LIFECYCLE EVENTS
  // ----------------------------------------

  const emitSlideEnter = useCallback((targetSlideId: string) => {
    engineRef.current?.handleEvent('slide-enter', {
      slideId: targetSlideId,
    });
  }, []);

  const emitSlideExit = useCallback((targetSlideId: string) => {
    engineRef.current?.handleEvent('slide-exit', {
      slideId: targetSlideId,
    });
  }, []);

  const emitLessonStart = useCallback(() => {
    engineRef.current?.handleEvent('lesson-start', {});
  }, []);

  const emitLessonComplete = useCallback(() => {
    engineRef.current?.handleEvent('lesson-complete', {});
  }, []);

  const emitCustomEvent = useCallback((eventName: string, payload?: unknown) => {
    engineRef.current?.handleEvent('custom-event', {
      eventData: { eventName, payload },
    });
  }, []);

  // ----------------------------------------
  // STATE SETTERS
  // ----------------------------------------

  const setEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
  }, []);

  const setDebugModeCallback = useCallback((enabled: boolean) => {
    setDebugMode(enabled);
  }, []);

  const clearHistory = useCallback(() => {
    engineRef.current?.clearExecutionHistory();
    setExecutionHistory([]);
  }, []);

  return {
    engine: engineRef.current,
    registerObjectTriggers,
    registerSlideTriggers,
    registerGlobalTriggers,
    unregisterObjectTriggers,
    unregisterSlideTriggers,
    handleClick,
    handleDoubleClick,
    handleMouseEnter,
    handleMouseLeave,
    handleKeyDown,
    handleKeyUp,
    handleFocus,
    handleBlur,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    executeActions,
    emitSlideEnter,
    emitSlideExit,
    emitLessonStart,
    emitLessonComplete,
    emitCustomEvent,
    isEnabled,
    setEnabled,
    debugMode,
    setDebugMode: setDebugModeCallback,
    executionHistory,
    clearHistory,
  };
}

// =============================================================================
// TRIGGER EVENT PROPS HELPER
// =============================================================================

export interface TriggerEventProps {
  onClick?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onKeyUp?: (e: React.KeyboardEvent) => void;
  onFocus?: (e: React.FocusEvent) => void;
  onBlur?: (e: React.FocusEvent) => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export function useTriggerEventProps(
  objectId: string,
  triggers: ReturnType<typeof useTriggers>,
): TriggerEventProps {
  return useMemo(
    () => ({
      onClick: (e: React.MouseEvent) => triggers.handleClick(objectId, e),
      onDoubleClick: (e: React.MouseEvent) => triggers.handleDoubleClick(objectId, e),
      onMouseEnter: (e: React.MouseEvent) => triggers.handleMouseEnter(objectId, e),
      onMouseLeave: (e: React.MouseEvent) => triggers.handleMouseLeave(objectId, e),
      onKeyDown: (e: React.KeyboardEvent) => triggers.handleKeyDown(objectId, e),
      onKeyUp: (e: React.KeyboardEvent) => triggers.handleKeyUp(objectId, e),
      onFocus: (e: React.FocusEvent) => triggers.handleFocus(objectId, e),
      onBlur: (e: React.FocusEvent) => triggers.handleBlur(objectId, e),
      onDragStart: (e: React.DragEvent) => triggers.handleDragStart(objectId, e),
      onDragEnd: (e: React.DragEvent) => triggers.handleDragEnd(objectId, e),
      onDrop: (e: React.DragEvent) => triggers.handleDrop(objectId, e),
    }),
    [objectId, triggers],
  );
}

// =============================================================================
// USE OBJECT WITH TRIGGERS
// =============================================================================

export function useObjectWithTriggers(
  objectId: string,
  objectTriggers: Trigger[],
  triggers: ReturnType<typeof useTriggers>,
): {
  eventProps: TriggerEventProps;
  dataProps: { 'data-object-id': string };
} {
  // Register triggers on mount
  useEffect(() => {
    if (objectTriggers.length > 0) {
      triggers.registerObjectTriggers(objectId, objectTriggers);
    }
    return () => {
      triggers.unregisterObjectTriggers(objectId);
    };
  }, [objectId, objectTriggers, triggers]);

  const eventProps = useTriggerEventProps(objectId, triggers);

  return {
    eventProps,
    dataProps: { 'data-object-id': objectId },
  };
}
