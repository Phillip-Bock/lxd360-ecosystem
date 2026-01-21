'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useXAPIContext, useXAPIContextOptional } from '@/providers/xapi-provider';
import type { InteractionType } from '@/types/xapi';

// =============================================================================
// CORE HOOK
// =============================================================================

/**
 * Main xAPI tracking hook.
 * Provides access to all tracking functions and session state.
 */
export function useXAPI() {
  return useXAPIContext();
}

/**
 * Optional xAPI hook that returns null if not in provider.
 */
export function useXAPIOptional() {
  return useXAPIContextOptional();
}

// =============================================================================
// SLIDE TRACKING
// =============================================================================

/**
 * Hook for tracking slide/page views with automatic timing.
 */
export function useSlideTracking(slideId: string, slideName: string, slideIndex: number) {
  const xapi = useXAPIContextOptional();
  const viewStartRef = useRef<number | null>(null);
  const hasTrackedViewRef = useRef(false);

  // Track view on mount
  useEffect(() => {
    if (!xapi) return;

    viewStartRef.current = Date.now();

    if (!hasTrackedViewRef.current) {
      xapi.trackSlideViewed(slideId, slideName, slideIndex);
      hasTrackedViewRef.current = true;
    }

    return () => {
      // Track completion on unmount
      if (viewStartRef.current && xapi) {
        const duration = (Date.now() - viewStartRef.current) / 1000;
        xapi.trackSlideCompleted(slideId, slideName, duration);
      }
    };
  }, [xapi, slideId, slideName, slideIndex]);

  // Manual completion tracking
  const trackComplete = useCallback(() => {
    if (!xapi || !viewStartRef.current) return;

    const duration = (Date.now() - viewStartRef.current) / 1000;
    xapi.trackSlideCompleted(slideId, slideName, duration);
  }, [xapi, slideId, slideName]);

  return { trackComplete };
}

// =============================================================================
// INTERACTION TRACKING
// =============================================================================

/**
 * Hook for tracking interactive block interactions.
 */
export function useInteractionTracking(blockId: string, blockName: string, blockType: string) {
  const xapi = useXAPIContextOptional();
  const interactionCountRef = useRef(0);

  const trackInteraction = useCallback(
    (data?: Record<string, unknown>) => {
      if (!xapi) return;

      interactionCountRef.current++;

      xapi.trackInteracted(blockId, blockName, blockType, {
        ...data,
        interactionNumber: interactionCountRef.current,
      });
    },
    [xapi, blockId, blockName, blockType],
  );

  // Reset count on block change - blockId is intentional to reset on new block
  const prevBlockIdRef = useRef(blockId);
  if (prevBlockIdRef.current !== blockId) {
    prevBlockIdRef.current = blockId;
    interactionCountRef.current = 0;
  }

  return {
    trackInteraction,
    interactionCount: interactionCountRef.current,
  };
}

// =============================================================================
// QUESTION TRACKING
// =============================================================================

interface QuestionTrackingOptions {
  questionId: string;
  questionText: string;
  interactionType: InteractionType;
  maxScore?: number;
}

/**
 * Hook for tracking assessment question responses.
 */
export function useQuestionTracking(options: QuestionTrackingOptions) {
  const xapi = useXAPIContextOptional();
  const startTimeRef = useRef<number | null>(null);
  const attemptCountRef = useRef(0);

  // Start timing on question change - questionId is intentional
  const prevQuestionIdRef = useRef(options.questionId);
  if (prevQuestionIdRef.current !== options.questionId) {
    prevQuestionIdRef.current = options.questionId;
    startTimeRef.current = Date.now();
    attemptCountRef.current = 0;
  }

  // Initial setup
  if (startTimeRef.current === null) {
    startTimeRef.current = Date.now();
  }

  const trackAnswer = useCallback(
    (response: unknown, correct: boolean, score: number) => {
      if (!xapi) return;

      attemptCountRef.current++;
      const duration = startTimeRef.current
        ? (Date.now() - startTimeRef.current) / 1000
        : undefined;

      xapi.trackQuestionAnswered(
        options.questionId,
        options.questionText,
        options.interactionType,
        response,
        correct,
        score,
        options.maxScore || score,
        duration,
      );
    },
    [xapi, options],
  );

  const resetTimer = useCallback(() => {
    startTimeRef.current = Date.now();
  }, []);

  return {
    trackAnswer,
    resetTimer,
    attemptCount: attemptCountRef.current,
  };
}

// =============================================================================
// QUIZ TRACKING
// =============================================================================

interface QuizTrackingOptions {
  quizId: string;
  quizName: string;
  passingScore?: number;
}

/**
 * Hook for tracking quiz/assessment attempts.
 */
export function useQuizTracking(options: QuizTrackingOptions) {
  const xapi = useXAPIContextOptional();
  const startTimeRef = useRef<number | null>(null);
  const isStartedRef = useRef(false);

  const startQuiz = useCallback(() => {
    if (!xapi || isStartedRef.current) return;

    startTimeRef.current = Date.now();
    isStartedRef.current = true;
    xapi.trackQuizStarted(options.quizId, options.quizName);
  }, [xapi, options.quizId, options.quizName]);

  const completeQuiz = useCallback(
    (score: number, maxScore: number) => {
      if (!xapi || !isStartedRef.current) return;

      const duration = startTimeRef.current ? (Date.now() - startTimeRef.current) / 1000 : 0;

      const passed = options.passingScore ? score >= options.passingScore : score >= maxScore * 0.7;

      xapi.trackQuizCompleted(options.quizId, options.quizName, score, maxScore, passed, duration);

      isStartedRef.current = false;
    },
    [xapi, options],
  );

  const resetQuiz = useCallback(() => {
    startTimeRef.current = null;
    isStartedRef.current = false;
  }, []);

  return {
    startQuiz,
    completeQuiz,
    resetQuiz,
    isStarted: isStartedRef.current,
  };
}

// =============================================================================
// MEDIA TRACKING
// =============================================================================

interface MediaTrackingOptions {
  mediaId: string;
  mediaName: string;
  duration?: number;
  completionThreshold?: number;
}

/**
 * Hook for tracking video/audio media playback.
 */
export function useMediaTracking(options: MediaTrackingOptions) {
  const xapi = useXAPIContextOptional();
  const playSegmentsRef = useRef<Array<{ start: number; end: number }>>([]);
  const currentSegmentStartRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);

  const trackPlay = useCallback(
    (currentTime: number) => {
      if (!xapi) return;

      isPlayingRef.current = true;
      currentSegmentStartRef.current = currentTime;
      xapi.trackMediaPlayed(options.mediaId, options.mediaName, currentTime);
    },
    [xapi, options.mediaId, options.mediaName],
  );

  const trackPause = useCallback(
    (currentTime: number) => {
      if (!xapi) return;

      isPlayingRef.current = false;

      // Record segment
      if (currentSegmentStartRef.current !== null) {
        playSegmentsRef.current.push({
          start: currentSegmentStartRef.current,
          end: currentTime,
        });
        currentSegmentStartRef.current = null;
      }

      xapi.trackMediaPaused(options.mediaId, options.mediaName, currentTime);
    },
    [xapi, options.mediaId, options.mediaName],
  );

  const trackSeek = useCallback(
    (fromTime: number, toTime: number) => {
      if (!xapi) return;

      // End current segment if playing
      if (isPlayingRef.current && currentSegmentStartRef.current !== null) {
        playSegmentsRef.current.push({
          start: currentSegmentStartRef.current,
          end: fromTime,
        });
        currentSegmentStartRef.current = toTime;
      }

      xapi.trackMediaSeeked(options.mediaId, options.mediaName, fromTime, toTime);
    },
    [xapi, options.mediaId, options.mediaName],
  );

  const trackComplete = useCallback(
    (watchedDuration?: number) => {
      if (!xapi) return;

      // Calculate progress from segments
      let progress = 1;
      if (options.duration && playSegmentsRef.current.length > 0) {
        const totalWatched = calculateUniqueWatchTime(playSegmentsRef.current);
        progress = Math.min(1, totalWatched / options.duration);
      }

      xapi.trackMediaCompleted(
        options.mediaId,
        options.mediaName,
        watchedDuration || options.duration || 0,
        progress,
      );
    },
    [xapi, options],
  );

  // Check if media should be marked complete based on threshold
  const checkCompletion = useCallback(
    (currentTime: number) => {
      if (!options.duration || !options.completionThreshold) return false;

      const progress = currentTime / options.duration;
      return progress >= options.completionThreshold;
    },
    [options.duration, options.completionThreshold],
  );

  // Reset on media change - mediaId is intentional
  const prevMediaIdRef = useRef(options.mediaId);
  if (prevMediaIdRef.current !== options.mediaId) {
    prevMediaIdRef.current = options.mediaId;
    playSegmentsRef.current = [];
    currentSegmentStartRef.current = null;
    isPlayingRef.current = false;
  }

  return {
    trackPlay,
    trackPause,
    trackSeek,
    trackComplete,
    checkCompletion,
    isPlaying: isPlayingRef.current,
  };
}

// Helper to calculate unique watch time from segments
function calculateUniqueWatchTime(segments: Array<{ start: number; end: number }>): number {
  if (segments.length === 0) return 0;

  // Sort by start time
  const sorted = [...segments].sort((a, b) => a.start - b.start);

  // Merge overlapping segments
  const merged: Array<{ start: number; end: number }> = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    if (current.start <= last.end) {
      last.end = Math.max(last.end, current.end);
    } else {
      merged.push(current);
    }
  }

  // Calculate total time
  return merged.reduce((total, segment) => total + (segment.end - segment.start), 0);
}

// =============================================================================
// PROGRESS TRACKING
// =============================================================================

/**
 * Hook for tracking and reporting lesson progress.
 */
export function useProgressTracking() {
  const xapi = useXAPIContextOptional();
  const lastProgressRef = useRef(0);
  const throttleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trackProgress = useCallback(
    (progress: number, immediate = false) => {
      if (!xapi) return;

      // Only track if progress changed significantly (5%+)
      if (Math.abs(progress - lastProgressRef.current) < 0.05 && !immediate) {
        return;
      }

      // Throttle progress updates
      if (throttleRef.current && !immediate) {
        return;
      }

      const sendProgress = () => {
        xapi.trackProgressed(progress);
        lastProgressRef.current = progress;
        throttleRef.current = null;
      };

      if (immediate) {
        sendProgress();
      } else {
        throttleRef.current = setTimeout(sendProgress, 5000);
      }
    },
    [xapi],
  );

  // Cleanup throttle on unmount
  useEffect(() => {
    return () => {
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
    };
  }, []);

  return { trackProgress };
}

// =============================================================================
// BLOCK EVENT HANDLER
// =============================================================================

/**
 * Hook that creates an onXAPIEvent handler for blocks.
 * Bridges block events to xAPI tracking.
 */
export function useBlockEventHandler(blockId: string, blockType: string, blockName: string) {
  const xapi = useXAPIContextOptional();

  const handleXAPIEvent = useCallback(
    (verb: string, data?: Record<string, unknown>) => {
      if (!xapi) return;

      switch (verb) {
        case 'experienced':
          xapi.trackExperienced(blockId, blockName, data?.duration as number | undefined);
          break;

        case 'interacted':
          xapi.trackInteracted(blockId, blockName, blockType, data);
          break;

        case 'answered':
          if (data) {
            xapi.trackQuestionAnswered(
              blockId,
              blockName,
              (data.interactionType as InteractionType) || 'other',
              data.response,
              data.correct as boolean,
              data.score as number,
              data.maxScore as number,
              data.duration as number | undefined,
            );
          }
          break;

        case 'passed':
        case 'failed':
          if (data) {
            xapi.trackQuestionAnswered(
              blockId,
              blockName,
              (data.interactionType as InteractionType) || 'other',
              data.response,
              verb === 'passed',
              data.score as number,
              data.maxScore as number,
              data.duration as number | undefined,
            );
          }
          break;

        case 'played':
          xapi.trackMediaPlayed(blockId, blockName, (data?.currentTime as number) || 0);
          break;

        case 'paused':
          xapi.trackMediaPaused(blockId, blockName, (data?.currentTime as number) || 0);
          break;

        case 'seeked':
          xapi.trackMediaSeeked(
            blockId,
            blockName,
            (data?.fromTime as number) || 0,
            (data?.toTime as number) || 0,
          );
          break;

        case 'completed':
          xapi.trackMediaCompleted(
            blockId,
            blockName,
            (data?.duration as number) || 0,
            data?.progress as number | undefined,
          );
          break;

        default: {
          // Custom verb - create statement directly
          const builder = xapi.createStatementBuilder();
          builder
            .verb(verb as import('@/types/xapi').ExtendedXAPIVerb)
            .block(blockId, blockType, blockName);

          if (data) {
            Object.entries(data).forEach(([key, value]) => {
              builder.withContextExtension(`https://lxd360.com/xapi/extensions/${key}`, value);
            });
          }

          xapi.sendStatement(builder.build());
        }
      }
    },
    [xapi, blockId, blockType, blockName],
  );

  return handleXAPIEvent;
}

// =============================================================================
// SESSION HOOK
// =============================================================================

/**
 * Hook for accessing session state and management.
 */
export function useXAPISession() {
  const xapi = useXAPIContextOptional();

  const session = xapi?.session || null;
  const registration = xapi?.registration || null;
  const queueStatus = xapi?.queueStatus || {
    length: 0,
    pending: 0,
    failed: 0,
    isOnline: true,
    isFlushing: false,
  };

  const saveBookmark = useCallback(
    (slideId: string, slideIndex: number, state?: Record<string, unknown>) => {
      xapi?.saveBookmark(slideId, slideIndex, state);
    },
    [xapi],
  );

  const suspend = useCallback(
    (bookmark?: string) => {
      xapi?.trackSuspended(bookmark);
    },
    [xapi],
  );

  const resume = useCallback(
    (bookmark?: string) => {
      xapi?.trackResumed(bookmark);
    },
    [xapi],
  );

  const complete = useCallback(
    (options?: { score?: number; maxScore?: number; passed?: boolean }) => {
      xapi?.trackCompleted(options);
    },
    [xapi],
  );

  const flushQueue = useCallback(async () => {
    await xapi?.flushQueue();
  }, [xapi]);

  return {
    session,
    registration,
    queueStatus,
    saveBookmark,
    suspend,
    resume,
    complete,
    flushQueue,
  };
}
