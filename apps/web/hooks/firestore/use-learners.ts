'use client';

/**
 * useLearners - Hook for fetching and managing learner data
 *
 * Wraps the learners Firestore service to provide React-friendly
 * state management with loading, error, and data states.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  getLearner,
  getLearners,
  getLearnersByStatus,
  type PaginatedResponse,
  type PaginationOptions,
  searchLearners,
} from '@/lib/firestore/services/learners';
import type { Learner, LearnerStatus } from '@/types/lms/learner';
import { useOrganization } from './use-organization';

// =============================================================================
// TYPES
// =============================================================================

export interface UseLearnersState {
  /** List of learners */
  learners: Learner[];
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Whether there are more results */
  hasMore: boolean;
  /** Cursor for pagination */
  nextCursor?: string;
}

export interface UseLearnersActions {
  /** Refresh the learners list */
  refresh: () => Promise<void>;
  /** Load more learners (pagination) */
  loadMore: () => Promise<void>;
  /** Search learners by query */
  search: (query: string) => Promise<void>;
  /** Filter by status */
  filterByStatus: (status: LearnerStatus | undefined) => void;
}

export type UseLearnersReturn = UseLearnersState & UseLearnersActions;

// =============================================================================
// HOOK: useLearners
// =============================================================================

export function useLearners(options: PaginationOptions = {}): UseLearnersReturn {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [currentStatus, setCurrentStatus] = useState<LearnerStatus | undefined>();

  const fetchLearners = useCallback(
    async (append = false, cursor?: string) => {
      if (!organizationId) {
        setLearners([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let response: PaginatedResponse<Learner>;

        if (currentStatus) {
          response = await getLearnersByStatus(organizationId, currentStatus, {
            limit: options.limit,
            cursor,
          });
        } else {
          response = await getLearners(organizationId, {
            limit: options.limit,
            cursor,
          });
        }

        setLearners((prev) => (append ? [...prev, ...response.items] : response.items));
        setHasMore(response.hasMore);
        setNextCursor(response.nextCursor);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch learners';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [organizationId, currentStatus, options.limit],
  );

  // Initial fetch
  useEffect(() => {
    if (!orgLoading) {
      fetchLearners();
    }
  }, [orgLoading, fetchLearners]);

  const refresh = useCallback(async () => {
    await fetchLearners(false);
  }, [fetchLearners]);

  const loadMore = useCallback(async () => {
    if (hasMore && nextCursor) {
      await fetchLearners(true, nextCursor);
    }
  }, [fetchLearners, hasMore, nextCursor]);

  const search = useCallback(
    async (query: string) => {
      if (!organizationId) return;

      setLoading(true);
      setError(null);

      try {
        // searchLearners returns Learner[] not PaginatedResponse
        const results = await searchLearners(organizationId, query, { limit: options.limit });
        setLearners(results);
        setHasMore(false);
        setNextCursor(undefined);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to search learners';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [organizationId, options.limit],
  );

  const filterByStatus = useCallback((status: LearnerStatus | undefined) => {
    setCurrentStatus(status);
  }, []);

  return {
    learners,
    loading: loading || orgLoading,
    error,
    hasMore,
    nextCursor,
    refresh,
    loadMore,
    search,
    filterByStatus,
  };
}

// =============================================================================
// HOOK: useLearner (single learner)
// =============================================================================

export interface UseLearnerReturn {
  learner: Learner | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useLearner(learnerId: string | null): UseLearnerReturn {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [learner, setLearner] = useState<Learner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLearner = useCallback(async () => {
    if (!organizationId || !learnerId) {
      setLearner(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getLearner(organizationId, learnerId);
      setLearner(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch learner';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [organizationId, learnerId]);

  useEffect(() => {
    if (!orgLoading) {
      fetchLearner();
    }
  }, [orgLoading, fetchLearner]);

  const refresh = useCallback(async () => {
    await fetchLearner();
  }, [fetchLearner]);

  return {
    learner,
    loading: loading || orgLoading,
    error,
    refresh,
  };
}
