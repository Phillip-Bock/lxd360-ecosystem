'use client';

/**
 * useLessonStatus - Hook for fetching and tracking individual lesson status
 *
 * Provides real-time lesson completion status with Firestore listeners.
 * Includes helper for emitting xAPI statements on completion.
 */

import { doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { useCallback, useEffect, useReducer, useState } from 'react';
import { useXAPIEmitter } from '@/hooks/use-xapi-emitter';
import { requireDb } from '@/lib/firebase/client';
import { useAuth } from '@/lib/firebase/useAuth';
import type { LessonProgress } from '@/types/lms/progress';
import { useOrganization } from './use-organization';

// =============================================================================
// TYPES
// =============================================================================

export type LessonStatusType = 'not-started' | 'in-progress' | 'completed' | 'locked';

export interface UseLessonStatusState {
  /** Current lesson status */
  status: LessonStatusType;
  /** Progress percentage (0-100) */
  progress: number;
  /** Time spent in seconds */
  timeSpent: number;
  /** Lesson started timestamp */
  startedAt: string | null;
  /** Lesson completed timestamp */
  completedAt: string | null;
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
}

export interface UseLessonStatusActions {
  /** Mark lesson as started */
  startLesson: () => Promise<void>;
  /** Update lesson progress */
  updateProgress: (progress: number, timeSpent?: number) => Promise<void>;
  /** Mark lesson as completed */
  completeLesson: (score?: number) => Promise<void>;
  /** Refresh status */
  refresh: () => void;
}

export type UseLessonStatusReturn = UseLessonStatusState & UseLessonStatusActions;

// =============================================================================
// COLLECTION HELPERS
// =============================================================================

function lessonProgressRef(organizationId: string, lessonProgressId: string) {
  return doc(requireDb(), 'organizations', organizationId, 'lessonProgress', lessonProgressId);
}

// =============================================================================
// HOOK: useLessonStatus
// =============================================================================

/**
 * Hook for tracking individual lesson status with real-time updates
 *
 * @example
 * ```tsx
 * function LessonPlayer({ lessonId, courseId }) {
 *   const { status, progress, startLesson, updateProgress, completeLesson } = useLessonStatus({
 *     lessonId,
 *     lessonName: 'Introduction to React',
 *     courseId,
 *     courseName: 'React Fundamentals',
 *   });
 *
 *   useEffect(() => {
 *     if (status === 'not-started') {
 *       startLesson();
 *     }
 *   }, [status, startLesson]);
 *
 *   const handleVideoProgress = (percent: number) => {
 *     updateProgress(percent);
 *     if (percent >= 100) {
 *       completeLesson();
 *     }
 *   };
 *
 *   return <LessonStatus status={status} progress={progress} />;
 * }
 * ```
 */
export function useLessonStatus(options: {
  lessonId: string | null;
  lessonName?: string;
  courseId: string | null;
  courseName?: string;
  learnerId?: string | null;
}): UseLessonStatusReturn {
  const { lessonId, lessonName, courseId, courseName, learnerId: providedLearnerId } = options;

  const { organizationId, loading: orgLoading } = useOrganization();
  const { user } = useAuth();
  const learnerId = providedLearnerId ?? user?.uid ?? null;

  const [status, setStatus] = useState<LessonStatusType>('not-started');
  const [progress, setProgress] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, forceRefresh] = useReducer((x: number) => x + 1, 0);

  // xAPI emitter for tracking
  const {
    emitProgress,
    emitCompleted,
    isReady: xapiReady,
  } = useXAPIEmitter({
    actor: learnerId ? { userId: learnerId } : undefined,
    context: courseId && courseName ? { courseId, courseName } : undefined,
  });

  // Generate document ID
  const docId = learnerId && lessonId ? `${learnerId}_${lessonId}` : null;

  // Subscribe to lesson status updates
  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey intentionally triggers re-subscription
  useEffect(() => {
    if (!organizationId || !docId) {
      setStatus('not-started');
      setProgress(0);
      setTimeSpent(0);
      setStartedAt(null);
      setCompletedAt(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const docRef = lessonProgressRef(organizationId, docId);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as LessonProgress;
          setStatus(data.status);
          setProgress(data.progress);
          setTimeSpent(data.timeSpent);
          setStartedAt(data.startedAt ?? null);
          setCompletedAt(data.completedAt ?? null);
        } else {
          setStatus('not-started');
          setProgress(0);
          setTimeSpent(0);
          setStartedAt(null);
          setCompletedAt(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [organizationId, docId, refreshKey]);

  // Start lesson
  const startLesson = useCallback(async () => {
    if (!organizationId || !docId || !lessonId || !learnerId) {
      return;
    }

    try {
      const docRef = lessonProgressRef(organizationId, docId);
      await setDoc(
        docRef,
        {
          id: docId,
          lessonId,
          learnerId,
          enrollmentId: `${learnerId}_${courseId}`,
          status: 'in-progress',
          progress: 0,
          timeSpent: 0,
          startedAt: new Date().toISOString(),
          attempts: 1,
          xapiStatements: 0,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start lesson';
      setError(message);
    }
  }, [organizationId, docId, lessonId, learnerId, courseId]);

  // Update progress
  const updateProgress = useCallback(
    async (newProgress: number, additionalTimeSpent?: number) => {
      if (!organizationId || !docId) {
        return;
      }

      const clampedProgress = Math.min(100, Math.max(0, newProgress));

      try {
        const docRef = lessonProgressRef(organizationId, docId);
        const updates: Record<string, unknown> = {
          progress: clampedProgress,
          updatedAt: serverTimestamp(),
        };

        if (additionalTimeSpent !== undefined) {
          updates.timeSpent = timeSpent + additionalTimeSpent;
        }

        if (status === 'not-started') {
          updates.status = 'in-progress';
          updates.startedAt = new Date().toISOString();
        }

        await updateDoc(docRef, updates);

        // Emit xAPI progress statement
        if (xapiReady && lessonId && lessonName) {
          emitProgress(lessonId, lessonName, clampedProgress / 100);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update progress';
        setError(message);
      }
    },
    [organizationId, docId, status, timeSpent, xapiReady, lessonId, lessonName, emitProgress],
  );

  // Complete lesson
  const completeLesson = useCallback(
    async (score?: number) => {
      if (!organizationId || !docId) {
        return;
      }

      try {
        const docRef = lessonProgressRef(organizationId, docId);
        const completedTimestamp = new Date().toISOString();

        await updateDoc(docRef, {
          status: 'completed',
          progress: 100,
          completedAt: completedTimestamp,
          ...(score !== undefined && { score }),
          updatedAt: serverTimestamp(),
        });

        // Emit xAPI completion statement
        if (xapiReady && lessonId && lessonName) {
          emitCompleted(lessonId, lessonName, score !== undefined ? { score } : undefined);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to complete lesson';
        setError(message);
      }
    },
    [organizationId, docId, xapiReady, lessonId, lessonName, emitCompleted],
  );

  const refresh = useCallback(() => {
    forceRefresh();
  }, []);

  return {
    status,
    progress,
    timeSpent,
    startedAt,
    completedAt,
    loading: loading || orgLoading,
    error,
    startLesson,
    updateProgress,
    completeLesson,
    refresh,
  };
}

// =============================================================================
// HOOK: useLessonCompletion
// =============================================================================

/**
 * Simplified hook that just tracks if a lesson is completed
 */
export function useLessonCompletion(
  lessonId: string | null,
  learnerId: string | null,
): {
  isCompleted: boolean;
  loading: boolean;
} {
  const { status, loading } = useLessonStatus({
    lessonId,
    courseId: null,
    learnerId,
  });

  return {
    isCompleted: status === 'completed',
    loading,
  };
}
