'use client';

/**
 * =============================================================================
 * LXD360 xAPI Emitter React Hook
 * =============================================================================
 *
 * React hook for using the XAPIEmitter singleton in components.
 * Provides type-safe access to emission methods with automatic
 * queue status tracking.
 *
 * @module hooks/use-xapi-emitter
 * @version 1.0.0
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Statement } from '@/lib/xapi/types';
import {
  getEmitter,
  XAPIEmitter,
  type EmitOptions,
  type EmitterConfig,
  type EmitterQueueStatus,
  type SendResult,
} from '@/lib/xapi/emitter';
import type {
  ConfidenceData,
  EngagementData,
  HesitationData,
  ModalityData,
} from '@/lib/xapi/extensions';
import type { ActorOptions, ActivityOptions } from '@/lib/xapi/statement-builder';
import type { XAPIVerbKey } from '@/lib/xapi/verbs';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Actor context for the hook
 */
export interface ActorContext {
  userId: string;
  name?: string;
  email?: string;
  homePage?: string;
}

/**
 * Activity context for the hook
 */
export interface ActivityContext {
  courseId?: string;
  courseName?: string;
  lessonId?: string;
  lessonName?: string;
  registration?: string;
  sessionId?: string;
}

/**
 * Hook configuration
 */
export interface UseXAPIEmitterOptions {
  /** Actor information (learner) */
  actor?: ActorContext;
  /** Activity context (course, lesson, etc.) */
  context?: ActivityContext;
  /** Emitter configuration overrides */
  emitterConfig?: EmitterConfig;
  /** Custom send handler */
  sendHandler?: (statements: Statement[]) => Promise<SendResult>;
  /** Enable auto-initialization */
  autoInitialize?: boolean;
}

/**
 * Hook return type
 */
export interface UseXAPIEmitterReturn {
  /** Current queue status */
  queueStatus: EmitterQueueStatus;
  /** Whether emitter is ready */
  isReady: boolean;
  /** Basic emit function */
  emit: (params: {
    verb: XAPIVerbKey;
    activity: ActivityOptions;
    result?: {
      score?: { scaled?: number; raw?: number; min?: number; max?: number };
      success?: boolean;
      completion?: boolean;
      response?: string;
      durationSeconds?: number;
    };
    extensions?: Record<string, unknown>;
    options?: EmitOptions;
  }) => string | null;
  /** Emit with Deep Profile extensions */
  emitWithProfile: (params: {
    verb: XAPIVerbKey;
    activity: ActivityOptions;
    hesitation?: HesitationData;
    confidence?: ConfidenceData;
    engagement?: EngagementData;
    modality?: ModalityData;
    result?: {
      score?: { scaled?: number; raw?: number; min?: number; max?: number };
      success?: boolean;
      completion?: boolean;
      response?: string;
      durationSeconds?: number;
    };
    options?: EmitOptions;
  }) => string | null;
  /** Emit video played */
  emitVideoPlayed: (videoId: string, videoName: string, currentTime: number) => string | null;
  /** Emit video paused */
  emitVideoPaused: (videoId: string, videoName: string, currentTime: number) => string | null;
  /** Emit video seeked */
  emitVideoSeeked: (
    videoId: string,
    videoName: string,
    fromTime: number,
    toTime: number,
  ) => string | null;
  /** Emit progress update */
  emitProgress: (activityId: string, activityName: string, progress: number) => string | null;
  /** Emit completion */
  emitCompleted: (
    activityId: string,
    activityName: string,
    result?: { score?: number; maxScore?: number; passed?: boolean; durationSeconds?: number },
  ) => string | null;
  /** Emit modality switch */
  emitModalitySwitch: (
    activityId: string,
    activityName: string,
    fromModality: string,
    toModality: string,
    reason: string,
  ) => string | null;
  /** Emit focus change (background/foreground) */
  emitFocusChange: (
    activityId: string,
    activityName: string,
    inBackground: boolean,
    backgroundDuration?: number,
  ) => string | null;
  /** Flush queue */
  flush: () => Promise<void>;
  /** Clear queue */
  clearQueue: () => void;
  /** Update actor context */
  setActor: (actor: ActorContext) => void;
  /** Update activity context */
  setContext: (context: ActivityContext) => void;
}

// ============================================================================
// DEFAULT STATUS
// ============================================================================

const DEFAULT_STATUS: EmitterQueueStatus = {
  total: 0,
  pending: 0,
  failed: 0,
  highPriority: 0,
  isFlushing: false,
  isOnline: true,
};

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * React hook for using the xAPI Emitter
 *
 * @example
 * ```tsx
 * function LessonPlayer({ lessonId, userId }) {
 *   const {
 *     emit,
 *     emitWithProfile,
 *     emitVideoPlayed,
 *     queueStatus,
 *   } = useXAPIEmitter({
 *     actor: { userId, name: 'John Doe' },
 *     context: {
 *       courseId: 'course-1',
 *       courseName: 'Safety Training',
 *       lessonId,
 *       lessonName: 'Introduction',
 *     },
 *   });
 *
 *   const handleVideoPlay = (currentTime: number) => {
 *     emitVideoPlayed('video-1', 'Welcome Video', currentTime);
 *   };
 *
 *   const handleQuestionAnswer = (correct: boolean, responseTime: number) => {
 *     emitWithProfile({
 *       verb: 'answered',
 *       activity: { id: 'question-1', name: 'Quiz Question' },
 *       hesitation: { hesitationTime: responseTime },
 *       result: { success: correct },
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       {queueStatus.total > 0 && (
 *         <span>Syncing {queueStatus.total} events...</span>
 *       )}
 *       // ... rest of component
 *     </div>
 *   );
 * }
 * ```
 */
export function useXAPIEmitter(options: UseXAPIEmitterOptions = {}): UseXAPIEmitterReturn {
  const {
    actor: initialActor,
    context: initialContext,
    emitterConfig,
    sendHandler,
    autoInitialize = true,
  } = options;

  // State
  const [queueStatus, setQueueStatus] = useState<EmitterQueueStatus>(DEFAULT_STATUS);
  const [isReady, setIsReady] = useState(false);

  // Refs for mutable values
  const actorRef = useRef<ActorContext | undefined>(initialActor);
  const contextRef = useRef<ActivityContext | undefined>(initialContext);
  const emitterRef = useRef<XAPIEmitter | null>(null);

  // Initialize emitter
  useEffect(() => {
    if (!autoInitialize) return;

    const emitter = getEmitter(emitterConfig);
    emitterRef.current = emitter;

    // Set send handler if provided
    if (sendHandler) {
      emitter.setSendHandler(sendHandler);
    }

    // Subscribe to status changes
    const unsubscribe = emitter.onStatusChange(setQueueStatus);

    // Set initial status
    setQueueStatus(emitter.getQueueStatus());
    setIsReady(true);

    return () => {
      unsubscribe();
    };
  }, [autoInitialize, emitterConfig, sendHandler]);

  // Update actor ref when prop changes
  useEffect(() => {
    actorRef.current = initialActor;
  }, [initialActor]);

  // Update context ref when prop changes
  useEffect(() => {
    contextRef.current = initialContext;
  }, [initialContext]);

  // Build actor options from context
  const getActorOptions = useCallback((): ActorOptions | null => {
    const actor = actorRef.current;
    if (!actor?.userId) return null;

    return {
      userId: actor.userId,
      name: actor.name,
      email: actor.email,
      homePage: actor.homePage,
    };
  }, []);

  // Build parent/grouping context
  const getContextOptions = useCallback(() => {
    const ctx = contextRef.current;
    if (!ctx) return {};

    return {
      registration: ctx.registration,
      sessionId: ctx.sessionId,
      parentActivity:
        ctx.lessonId && ctx.lessonName
          ? { id: ctx.lessonId, name: ctx.lessonName, type: 'lesson' }
          : undefined,
      groupingActivity:
        ctx.courseId && ctx.courseName
          ? { id: ctx.courseId, name: ctx.courseName, type: 'course' }
          : undefined,
    };
  }, []);

  // ----------------------------------------
  // EMISSION METHODS
  // ----------------------------------------

  const emit = useCallback(
    (params: {
      verb: XAPIVerbKey;
      activity: ActivityOptions;
      result?: {
        score?: { scaled?: number; raw?: number; min?: number; max?: number };
        success?: boolean;
        completion?: boolean;
        response?: string;
        durationSeconds?: number;
      };
      extensions?: Record<string, unknown>;
      options?: EmitOptions;
    }): string | null => {
      const emitter = emitterRef.current;
      const actor = getActorOptions();

      if (!emitter || !actor) return null;

      const ctxOptions = getContextOptions();

      return emitter.emit({
        actor,
        verb: params.verb,
        activity: params.activity,
        result: params.result,
        context: {
          ...ctxOptions,
          extensions: params.extensions,
        },
        options: params.options,
      });
    },
    [getActorOptions, getContextOptions],
  );

  const emitWithProfile = useCallback(
    (params: {
      verb: XAPIVerbKey;
      activity: ActivityOptions;
      hesitation?: HesitationData;
      confidence?: ConfidenceData;
      engagement?: EngagementData;
      modality?: ModalityData;
      result?: {
        score?: { scaled?: number; raw?: number; min?: number; max?: number };
        success?: boolean;
        completion?: boolean;
        response?: string;
        durationSeconds?: number;
      };
      options?: EmitOptions;
    }): string | null => {
      const emitter = emitterRef.current;
      const actor = getActorOptions();

      if (!emitter || !actor) return null;

      const ctxOptions = getContextOptions();

      return emitter.emitWithProfile({
        actor,
        verb: params.verb,
        activity: params.activity,
        hesitation: params.hesitation,
        confidence: params.confidence,
        engagement: params.engagement,
        modality: params.modality,
        result: params.result,
        context: {
          ...ctxOptions,
          sessionId: contextRef.current?.sessionId,
        },
        options: params.options,
      });
    },
    [getActorOptions, getContextOptions],
  );

  const emitVideoPlayed = useCallback(
    (videoId: string, videoName: string, currentTime: number): string | null => {
      const emitter = emitterRef.current;
      const actor = getActorOptions();

      if (!emitter || !actor) return null;

      return emitter.emitVideoPlayed(
        actor,
        { id: videoId, name: videoName, type: 'video' },
        currentTime,
        contextRef.current?.registration,
      );
    },
    [getActorOptions],
  );

  const emitVideoPaused = useCallback(
    (videoId: string, videoName: string, currentTime: number): string | null => {
      const emitter = emitterRef.current;
      const actor = getActorOptions();

      if (!emitter || !actor) return null;

      return emitter.emitVideoPaused(
        actor,
        { id: videoId, name: videoName, type: 'video' },
        currentTime,
        contextRef.current?.registration,
      );
    },
    [getActorOptions],
  );

  const emitVideoSeeked = useCallback(
    (videoId: string, videoName: string, fromTime: number, toTime: number): string | null => {
      const emitter = emitterRef.current;
      const actor = getActorOptions();

      if (!emitter || !actor) return null;

      return emitter.emitVideoSeeked(
        actor,
        { id: videoId, name: videoName, type: 'video' },
        fromTime,
        toTime,
        contextRef.current?.registration,
      );
    },
    [getActorOptions],
  );

  const emitProgress = useCallback(
    (activityId: string, activityName: string, progress: number): string | null => {
      const emitter = emitterRef.current;
      const actor = getActorOptions();

      if (!emitter || !actor) return null;

      return emitter.emitProgressed(
        actor,
        { id: activityId, name: activityName },
        progress,
        contextRef.current?.registration,
      );
    },
    [getActorOptions],
  );

  const emitCompleted = useCallback(
    (
      activityId: string,
      activityName: string,
      result?: { score?: number; maxScore?: number; passed?: boolean; durationSeconds?: number },
    ): string | null => {
      const emitter = emitterRef.current;
      const actor = getActorOptions();

      if (!emitter || !actor) return null;

      const scoreResult = result?.score !== undefined && result?.maxScore !== undefined
        ? {
            score: {
              scaled: result.score / result.maxScore,
              raw: result.score,
              max: result.maxScore,
            },
            success: result.passed,
            durationSeconds: result.durationSeconds,
          }
        : undefined;

      return emitter.emitCompleted(
        actor,
        { id: activityId, name: activityName },
        scoreResult,
        contextRef.current?.registration,
      );
    },
    [getActorOptions],
  );

  const emitModalitySwitch = useCallback(
    (
      activityId: string,
      activityName: string,
      fromModality: string,
      toModality: string,
      reason: string,
    ): string | null => {
      const emitter = emitterRef.current;
      const actor = getActorOptions();

      if (!emitter || !actor) return null;

      return emitter.emitModalitySwitched(
        actor,
        { id: activityId, name: activityName },
        fromModality,
        toModality,
        reason,
        contextRef.current?.registration,
      );
    },
    [getActorOptions],
  );

  const emitFocusChange = useCallback(
    (
      activityId: string,
      activityName: string,
      inBackground: boolean,
      backgroundDuration?: number,
    ): string | null => {
      const emitter = emitterRef.current;
      const actor = getActorOptions();

      if (!emitter || !actor) return null;

      if (inBackground) {
        return emitter.emitEnteredBackground(
          actor,
          { id: activityId, name: activityName },
          contextRef.current?.registration,
        );
      }
      return emitter.emitEnteredForeground(
        actor,
        { id: activityId, name: activityName },
        backgroundDuration ?? 0,
        contextRef.current?.registration,
      );
    },
    [getActorOptions],
  );

  // ----------------------------------------
  // QUEUE MANAGEMENT
  // ----------------------------------------

  const flush = useCallback(async () => {
    const emitter = emitterRef.current;
    if (!emitter) return;

    await emitter.flush();
  }, []);

  const clearQueue = useCallback(() => {
    const emitter = emitterRef.current;
    if (!emitter) return;

    emitter.clearQueue();
  }, []);

  // ----------------------------------------
  // CONTEXT UPDATERS
  // ----------------------------------------

  const setActor = useCallback((actor: ActorContext) => {
    actorRef.current = actor;
  }, []);

  const setContext = useCallback((context: ActivityContext) => {
    contextRef.current = context;
  }, []);

  // ----------------------------------------
  // RETURN VALUE
  // ----------------------------------------

  return useMemo(
    () => ({
      queueStatus,
      isReady,
      emit,
      emitWithProfile,
      emitVideoPlayed,
      emitVideoPaused,
      emitVideoSeeked,
      emitProgress,
      emitCompleted,
      emitModalitySwitch,
      emitFocusChange,
      flush,
      clearQueue,
      setActor,
      setContext,
    }),
    [
      queueStatus,
      isReady,
      emit,
      emitWithProfile,
      emitVideoPlayed,
      emitVideoPaused,
      emitVideoSeeked,
      emitProgress,
      emitCompleted,
      emitModalitySwitch,
      emitFocusChange,
      flush,
      clearQueue,
      setActor,
      setContext,
    ],
  );
}

// ============================================================================
// CONVENIENCE HOOK
// ============================================================================

/**
 * Simplified hook for tracking visibility/focus changes
 */
export function useXAPIFocusTracking(
  activityId: string,
  activityName: string,
  options: UseXAPIEmitterOptions = {},
): void {
  const { emitFocusChange, isReady } = useXAPIEmitter(options);
  const backgroundStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isReady || typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        backgroundStartRef.current = Date.now();
        emitFocusChange(activityId, activityName, true);
      } else if (backgroundStartRef.current) {
        const duration = Date.now() - backgroundStartRef.current;
        emitFocusChange(activityId, activityName, false, duration);
        backgroundStartRef.current = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activityId, activityName, emitFocusChange, isReady]);
}
