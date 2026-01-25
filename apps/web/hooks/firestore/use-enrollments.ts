'use client';

/**
 * useEnrollments - Hook for fetching and managing enrollment data
 *
 * Wraps the enrollments Firestore service to provide React-friendly
 * state management with loading, error, and data states.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  getCompletedEnrollments,
  getCourseEnrollments,
  getInProgressEnrollments,
  getLearnerEnrollments,
  isEnrolled,
  type PaginationOptions,
} from '@/lib/firestore/services/enrollments';
import type { Enrollment, EnrollmentStatus } from '@/types/lms/progress';
import { useOrganization } from './use-organization';

// =============================================================================
// TYPES
// =============================================================================

export interface UseEnrollmentsState {
  /** List of enrollments */
  enrollments: Enrollment[];
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Whether there are more results */
  hasMore: boolean;
  /** Cursor for pagination */
  nextCursor?: string;
}

export interface UseEnrollmentsActions {
  /** Refresh the enrollments list */
  refresh: () => Promise<void>;
  /** Load more enrollments (pagination) */
  loadMore: () => Promise<void>;
}

export type UseEnrollmentsReturn = UseEnrollmentsState & UseEnrollmentsActions;

// =============================================================================
// HOOK: useLearnerEnrollments
// =============================================================================

export function useLearnerEnrollments(
  learnerId: string | null,
  status?: EnrollmentStatus,
): Omit<UseEnrollmentsReturn, 'loadMore' | 'hasMore' | 'nextCursor'> {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnrollments = useCallback(async () => {
    if (!organizationId || !learnerId) {
      setEnrollments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getLearnerEnrollments(organizationId, learnerId, status);
      setEnrollments(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch enrollments';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [organizationId, learnerId, status]);

  useEffect(() => {
    if (!orgLoading) {
      fetchEnrollments();
    }
  }, [orgLoading, fetchEnrollments]);

  const refresh = useCallback(async () => {
    await fetchEnrollments();
  }, [fetchEnrollments]);

  return {
    enrollments,
    loading: loading || orgLoading,
    error,
    refresh,
  };
}

// =============================================================================
// HOOK: useCourseEnrollments
// =============================================================================

export function useCourseEnrollments(
  courseId: string | null,
  options: PaginationOptions = {},
): UseEnrollmentsReturn {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();

  const fetchEnrollments = useCallback(
    async (append = false, cursor?: string) => {
      if (!organizationId || !courseId) {
        setEnrollments([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getCourseEnrollments(organizationId, courseId, {
          limit: options.limit,
          cursor,
        });

        setEnrollments((prev) => (append ? [...prev, ...response.items] : response.items));
        setHasMore(response.hasMore);
        setNextCursor(response.nextCursor);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch enrollments';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [organizationId, courseId, options.limit],
  );

  useEffect(() => {
    if (!orgLoading) {
      fetchEnrollments();
    }
  }, [orgLoading, fetchEnrollments]);

  const refresh = useCallback(async () => {
    await fetchEnrollments(false);
  }, [fetchEnrollments]);

  const loadMore = useCallback(async () => {
    if (hasMore && nextCursor) {
      await fetchEnrollments(true, nextCursor);
    }
  }, [fetchEnrollments, hasMore, nextCursor]);

  return {
    enrollments,
    loading: loading || orgLoading,
    error,
    hasMore,
    nextCursor,
    refresh,
    loadMore,
  };
}

// =============================================================================
// HOOK: useInProgressEnrollments (My Learning)
// =============================================================================

export function useInProgressEnrollments(
  learnerId: string | null,
): Omit<UseEnrollmentsReturn, 'loadMore' | 'hasMore' | 'nextCursor'> {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnrollments = useCallback(async () => {
    if (!organizationId || !learnerId) {
      setEnrollments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getInProgressEnrollments(organizationId, learnerId);
      setEnrollments(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch enrollments';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [organizationId, learnerId]);

  useEffect(() => {
    if (!orgLoading) {
      fetchEnrollments();
    }
  }, [orgLoading, fetchEnrollments]);

  const refresh = useCallback(async () => {
    await fetchEnrollments();
  }, [fetchEnrollments]);

  return {
    enrollments,
    loading: loading || orgLoading,
    error,
    refresh,
  };
}

// =============================================================================
// HOOK: useCompletedEnrollments
// =============================================================================

export function useCompletedEnrollments(
  learnerId: string | null,
): Omit<UseEnrollmentsReturn, 'loadMore' | 'hasMore' | 'nextCursor'> {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnrollments = useCallback(async () => {
    if (!organizationId || !learnerId) {
      setEnrollments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getCompletedEnrollments(organizationId, learnerId);
      setEnrollments(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch enrollments';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [organizationId, learnerId]);

  useEffect(() => {
    if (!orgLoading) {
      fetchEnrollments();
    }
  }, [orgLoading, fetchEnrollments]);

  const refresh = useCallback(async () => {
    await fetchEnrollments();
  }, [fetchEnrollments]);

  return {
    enrollments,
    loading: loading || orgLoading,
    error,
    refresh,
  };
}

// =============================================================================
// HOOK: useIsEnrolled
// =============================================================================

export interface UseIsEnrolledReturn {
  isEnrolled: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useIsEnrolled(
  learnerId: string | null,
  courseId: string | null,
): UseIsEnrolledReturn {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkEnrollment = useCallback(async () => {
    if (!organizationId || !learnerId || !courseId) {
      setEnrolled(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await isEnrolled(organizationId, learnerId, courseId);
      setEnrolled(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check enrollment';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [organizationId, learnerId, courseId]);

  useEffect(() => {
    if (!orgLoading) {
      checkEnrollment();
    }
  }, [orgLoading, checkEnrollment]);

  const refresh = useCallback(async () => {
    await checkEnrollment();
  }, [checkEnrollment]);

  return {
    isEnrolled: enrolled,
    loading: loading || orgLoading,
    error,
    refresh,
  };
}
