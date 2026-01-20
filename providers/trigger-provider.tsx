/**
 * TriggerProvider - Phase 9
 * React context provider for trigger system
 */

'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { type TriggerEventProps, useTriggers } from '@/hooks/studio/use-triggers';
import type {
  LessonTriggers,
  SlideTriggers,
  Trigger,
  TriggerAction,
  TriggerExecution,
} from '@/types/studio/triggers';

// =============================================================================
// CONTEXT TYPES
// =============================================================================

interface TriggerContextValue {
  // Registration
  registerObjectTriggers: (objectId: string, triggers: Trigger[]) => void;
  registerSlideTriggers: (slideId: string, triggers: Trigger[]) => void;
  registerGlobalTriggers: (triggers: Trigger[]) => void;
  unregisterObjectTriggers: (objectId: string) => void;
  unregisterSlideTriggers: (slideId: string) => void;

  // Event handlers
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

  // Direct execution
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

  // Current context
  currentSlideId: string;
  currentLessonId: string;

  // History
  executionHistory: TriggerExecution[];
  clearHistory: () => void;

  // Helper to get event props for an object
  getEventProps: (objectId: string) => TriggerEventProps;
}

// =============================================================================
// CONTEXT
// =============================================================================

const TriggerContext = createContext<TriggerContextValue | null>(null);

// =============================================================================
// PROVIDER PROPS
// =============================================================================

interface TriggerProviderProps {
  children: ReactNode;
  lessonId: string;
  initialSlideId?: string;
  lessonTriggers?: LessonTriggers;
  debugMode?: boolean;
  enabled?: boolean;
  onSlideChange?: (slideId: string) => void;
  onLayerChange?: (layerId: string, visible: boolean) => void;
  onNavigate?: (direction: 'next' | 'previous' | 'first' | 'last') => void;
}

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

export function TriggerProvider({
  children,
  lessonId,
  initialSlideId = 'slide-1',
  lessonTriggers,
  debugMode: initialDebugMode = false,
  enabled: initialEnabled = true,
  onSlideChange,
  onLayerChange,
  onNavigate,
}: TriggerProviderProps) {
  const [currentSlideId, setCurrentSlideId] = useState(initialSlideId);

  // Handle slide changes
  const handleSlideChange = useCallback(
    (slideId: string) => {
      setCurrentSlideId(slideId);
      onSlideChange?.(slideId);
    },
    [onSlideChange],
  );

  // Initialize the triggers hook
  const triggers = useTriggers({
    lessonId,
    slideId: currentSlideId,
    onSlideChange: handleSlideChange,
    onLayerChange,
    onNavigate,
    debugMode: initialDebugMode,
    enabled: initialEnabled,
  });

  // Register lesson-level triggers on mount
  useEffect(() => {
    if (lessonTriggers?.triggers && lessonTriggers.triggers.length > 0) {
      triggers.registerGlobalTriggers(lessonTriggers.triggers);
    }

    // Execute onStart actions
    if (lessonTriggers?.onStart && lessonTriggers.onStart.length > 0) {
      triggers.executeActions(lessonTriggers.onStart);
    }

    return () => {
      // Execute onSuspend actions (when component unmounts)
      if (lessonTriggers?.onSuspend && lessonTriggers.onSuspend.length > 0) {
        triggers.executeActions(lessonTriggers.onSuspend);
      }
    };
  }, [
    lessonTriggers?.onStart,
    lessonTriggers?.onSuspend,
    lessonTriggers?.triggers,
    triggers.executeActions,
    triggers.registerGlobalTriggers,
  ]);

  // Create helper function to get event props for an object
  const getEventProps = useCallback(
    (objectId: string): TriggerEventProps => ({
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
    [triggers],
  );

  // Build context value
  const contextValue = useMemo<TriggerContextValue>(
    () => ({
      registerObjectTriggers: triggers.registerObjectTriggers,
      registerSlideTriggers: triggers.registerSlideTriggers,
      registerGlobalTriggers: triggers.registerGlobalTriggers,
      unregisterObjectTriggers: triggers.unregisterObjectTriggers,
      unregisterSlideTriggers: triggers.unregisterSlideTriggers,
      handleClick: triggers.handleClick,
      handleDoubleClick: triggers.handleDoubleClick,
      handleMouseEnter: triggers.handleMouseEnter,
      handleMouseLeave: triggers.handleMouseLeave,
      handleKeyDown: triggers.handleKeyDown,
      handleKeyUp: triggers.handleKeyUp,
      handleFocus: triggers.handleFocus,
      handleBlur: triggers.handleBlur,
      handleDragStart: triggers.handleDragStart,
      handleDragEnd: triggers.handleDragEnd,
      handleDrop: triggers.handleDrop,
      executeActions: triggers.executeActions,
      emitSlideEnter: triggers.emitSlideEnter,
      emitSlideExit: triggers.emitSlideExit,
      emitLessonStart: triggers.emitLessonStart,
      emitLessonComplete: triggers.emitLessonComplete,
      emitCustomEvent: triggers.emitCustomEvent,
      isEnabled: triggers.isEnabled,
      setEnabled: triggers.setEnabled,
      debugMode: triggers.debugMode,
      setDebugMode: triggers.setDebugMode,
      currentSlideId,
      currentLessonId: lessonId,
      executionHistory: triggers.executionHistory,
      clearHistory: triggers.clearHistory,
      getEventProps,
    }),
    [triggers, currentSlideId, lessonId, getEventProps],
  );

  return (
    <TriggerContext.Provider value={contextValue}>
      {/* Screen reader announcer for trigger actions */}
      <output id="trigger-announcer" className="sr-only" aria-live="polite" aria-atomic="true" />
      {children}
    </TriggerContext.Provider>
  );
}

// =============================================================================
// HOOKS
// =============================================================================

export function useTriggerContext(): TriggerContextValue {
  const context = useContext(TriggerContext);
  if (!context) {
    throw new Error('useTriggerContext must be used within a TriggerProvider');
  }
  return context;
}

export function useTriggerRegistration() {
  const context = useTriggerContext();
  return {
    registerObjectTriggers: context.registerObjectTriggers,
    registerSlideTriggers: context.registerSlideTriggers,
    registerGlobalTriggers: context.registerGlobalTriggers,
    unregisterObjectTriggers: context.unregisterObjectTriggers,
    unregisterSlideTriggers: context.unregisterSlideTriggers,
  };
}

export function useTriggerEvents() {
  const context = useTriggerContext();
  return {
    handleClick: context.handleClick,
    handleDoubleClick: context.handleDoubleClick,
    handleMouseEnter: context.handleMouseEnter,
    handleMouseLeave: context.handleMouseLeave,
    handleKeyDown: context.handleKeyDown,
    handleKeyUp: context.handleKeyUp,
    handleFocus: context.handleFocus,
    handleBlur: context.handleBlur,
    handleDragStart: context.handleDragStart,
    handleDragEnd: context.handleDragEnd,
    handleDrop: context.handleDrop,
    getEventProps: context.getEventProps,
  };
}

export function useTriggerExecution() {
  const context = useTriggerContext();
  return {
    executeActions: context.executeActions,
    emitSlideEnter: context.emitSlideEnter,
    emitSlideExit: context.emitSlideExit,
    emitLessonStart: context.emitLessonStart,
    emitLessonComplete: context.emitLessonComplete,
    emitCustomEvent: context.emitCustomEvent,
  };
}

export function useTriggerSettings() {
  const context = useTriggerContext();
  return {
    isEnabled: context.isEnabled,
    setEnabled: context.setEnabled,
    debugMode: context.debugMode,
    setDebugMode: context.setDebugMode,
  };
}

export function useTriggerHistory() {
  const context = useTriggerContext();
  return {
    executionHistory: context.executionHistory,
    clearHistory: context.clearHistory,
  };
}

// =============================================================================
// OBJECT TRIGGER HOOK
// =============================================================================

export function useObjectTrigger(
  objectId: string,
  triggers?: Trigger[],
): TriggerEventProps & { 'data-object-id': string } {
  const context = useTriggerContext();

  // Register triggers on mount
  useEffect(() => {
    if (triggers && triggers.length > 0) {
      context.registerObjectTriggers(objectId, triggers);
    }
    return () => {
      context.unregisterObjectTriggers(objectId);
    };
  }, [objectId, triggers, context]);

  return {
    ...context.getEventProps(objectId),
    'data-object-id': objectId,
  };
}

// =============================================================================
// SLIDE TRIGGER HOOK
// =============================================================================

export function useSlideTrigger(slideId: string, slideTriggers?: SlideTriggers) {
  const context = useTriggerContext();
  const prevSlideIdRef = useRef<string | null>(null);

  // Register triggers
  useEffect(() => {
    if (slideTriggers?.triggers && slideTriggers.triggers.length > 0) {
      context.registerSlideTriggers(slideId, slideTriggers.triggers);
    }
    return () => {
      context.unregisterSlideTriggers(slideId);
    };
  }, [slideId, slideTriggers, context]);

  // Handle slide enter/exit
  useEffect(() => {
    if (context.currentSlideId === slideId && prevSlideIdRef.current !== slideId) {
      // Entering this slide
      context.emitSlideEnter(slideId);

      // Execute onEnter actions
      if (slideTriggers?.onEnter && slideTriggers.onEnter.length > 0) {
        context.executeActions(slideTriggers.onEnter);
      }
    }

    if (prevSlideIdRef.current === slideId && context.currentSlideId !== slideId) {
      // Exiting this slide
      context.emitSlideExit(slideId);

      // Execute onExit actions
      if (slideTriggers?.onExit && slideTriggers.onExit.length > 0) {
        context.executeActions(slideTriggers.onExit);
      }
    }

    prevSlideIdRef.current = context.currentSlideId;
  }, [context.currentSlideId, slideId, slideTriggers, context]);

  return {
    isCurrentSlide: context.currentSlideId === slideId,
    emitComplete: () => {
      if (slideTriggers?.onComplete && slideTriggers.onComplete.length > 0) {
        context.executeActions(slideTriggers.onComplete);
      }
    },
  };
}
