'use client';

/**
 * useCourseProgress - Hook for fetching and tracking course progress
 *
 * Provides real-time course progress data with Firestore listeners.
 * Integrates with xAPI emitter for completion tracking.
 */

import { collection, doc, onSnapshot, query, type Unsubscribe, where } from 'firebase/firestore';
import { useCallback, useEffect, useReducer, useState } from 'react';
import { requireDb } from '@/lib/firebase/client';
import type { CourseProgress, LessonProgress, ModuleProgress } from '@/types/lms/progress';
import { useOrganization } from './use-organization';

// =============================================================================
// TYPES
// =============================================================================

export interface UseCourseProgressState {
  /** Overall progress data */
  progress: CourseProgress | null;
  /** Module progress list */
  moduleProgress: ModuleProgress[];
  /** Lesson progress list */
  lessonProgress: LessonProgress[];
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
}

export interface UseCourseProgressActions {
  /** Refresh progress data */
  refresh: () => void;
}

export type UseCourseProgressReturn = UseCourseProgressState & UseCourseProgressActions;

// =============================================================================
// COLLECTION HELPERS
// =============================================================================

function progressCollection(organizationId: string) {
  return collection(requireDb(), 'organizations', organizationId, 'progress');
}

function lessonProgressCollection(organizationId: string) {
  return collection(requireDb(), 'organizations', organizationId, 'lessonProgress');
}

// =============================================================================
// HOOK: useCourseProgress
// =============================================================================

/**
 * Hook for fetching and subscribing to course progress
 *
 * @example
 * ```tsx
 * function CoursePlayer({ courseId, learnerId }) {
 *   const { progress, moduleProgress, lessonProgress, loading, error } = useCourseProgress(
 *     courseId,
 *     learnerId
 *   );
 *
 *   if (loading) return <Spinner />;
 *   if (error) return <ErrorMessage error={error} />;
 *
 *   return (
 *     <div>
 *       <ProgressRing progress={progress?.overallProgress ?? 0} />
 *       {moduleProgress.map(mod => (
 *         <ModuleProgressCard key={mod.moduleId} {...mod} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useCourseProgress(
  courseId: string | null,
  learnerId: string | null,
): UseCourseProgressReturn {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, forceRefresh] = useReducer((x: number) => x + 1, 0);

  // Subscribe to progress updates
  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey intentionally triggers re-subscription
  useEffect(() => {
    if (!organizationId || !courseId || !learnerId) {
      setProgress(null);
      setModuleProgress([]);
      setLessonProgress([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribers: Unsubscribe[] = [];

    try {
      // Subscribe to main progress document
      const progressDocRef = doc(progressCollection(organizationId), `${learnerId}_${courseId}`);

      const unsubProgress = onSnapshot(
        progressDocRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as CourseProgress;
            setProgress(data);
            setModuleProgress(data.moduleProgress ?? []);
          } else {
            // Initialize empty progress
            setProgress(null);
            setModuleProgress([]);
          }
        },
        (err) => {
          setError(err.message);
        },
      );
      unsubscribers.push(unsubProgress);

      // Subscribe to lesson progress
      const lessonProgressQuery = query(
        lessonProgressCollection(organizationId),
        where('learnerId', '==', learnerId),
        where('courseId', '==', courseId),
      );

      const unsubLessons = onSnapshot(
        lessonProgressQuery,
        (snapshot) => {
          const lessons = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as LessonProgress[];
          setLessonProgress(lessons);
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        },
      );
      unsubscribers.push(unsubLessons);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load progress';
      setError(message);
      setLoading(false);
    }

    return () => {
      for (const unsubscribe of unsubscribers) {
        unsubscribe();
      }
    };
    // refreshKey is used to force re-subscription when refresh() is called
  }, [organizationId, courseId, learnerId, refreshKey]);

  const refresh = useCallback(() => {
    forceRefresh();
  }, []);

  return {
    progress,
    moduleProgress,
    lessonProgress,
    loading: loading || orgLoading,
    error,
    refresh,
  };
}

// =============================================================================
// HOOK: useModuleProgress
// =============================================================================

export interface UseModuleProgressReturn {
  moduleProgress: ModuleProgress | null;
  lessons: LessonProgress[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Hook for fetching progress for a specific module
 */
export function useModuleProgress(
  moduleId: string | null,
  courseId: string | null,
  learnerId: string | null,
): UseModuleProgressReturn {
  const { progress, lessonProgress, loading, error, refresh } = useCourseProgress(
    courseId,
    learnerId,
  );

  const moduleProgressData = progress?.moduleProgress.find((m) => m.moduleId === moduleId) ?? null;

  // Filter lessons for this module (assuming lesson IDs contain module reference)
  const moduleLessons = lessonProgress.filter((l) => l.lessonId.includes(moduleId ?? ''));

  return {
    moduleProgress: moduleProgressData,
    lessons: moduleLessons,
    loading,
    error,
    refresh,
  };
}

// =============================================================================
// HOOK: useProgressSummary
// =============================================================================

export interface ProgressSummary {
  overallProgress: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  modulesCompleted: number;
  modulesTotal: number;
  timeSpent: number;
  currentStreak: number;
  isCompleted: boolean;
}

export interface UseProgressSummaryReturn {
  summary: ProgressSummary | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for getting a summarized view of course progress
 */
export function useProgressSummary(
  courseId: string | null,
  learnerId: string | null,
): UseProgressSummaryReturn {
  const { progress, moduleProgress, loading, error } = useCourseProgress(courseId, learnerId);

  if (!progress) {
    return {
      summary: null,
      loading,
      error,
    };
  }

  const modulesCompleted = moduleProgress.filter((m) => m.status === 'completed').length;
  const lessonsCompleted = moduleProgress.reduce((sum, m) => sum + m.lessonsCompleted, 0);
  const lessonsTotal = moduleProgress.reduce((sum, m) => sum + m.lessonsTotal, 0);

  const summary: ProgressSummary = {
    overallProgress: progress.overallProgress,
    lessonsCompleted,
    lessonsTotal,
    modulesCompleted,
    modulesTotal: moduleProgress.length,
    timeSpent: progress.timeSpent,
    currentStreak: progress.currentStreak,
    isCompleted: progress.overallProgress >= 100,
  };

  return {
    summary,
    loading,
    error,
  };
}
