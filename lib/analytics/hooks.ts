'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  AnalyticsFilters,
  CourseAnalytics,
  DateRange,
  LeaderboardEntry,
  LearnerActivity,
  LearnerProgress,
  LearnerStreak,
  OrgDashboardData,
  RecentStatement,
} from './types';

// ============================================================================
// TYPES
// ============================================================================

interface UseQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

interface UseRealTimeOptions {
  enabled?: boolean;
  limit?: number;
}

// ============================================================================
// HELPER: FETCH WITH ERROR HANDLING
// ============================================================================

async function fetchAnalytics<T>(
  endpoint: string,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  const url = new URL(endpoint, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Analytics request failed: ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// LEARNER ANALYTICS HOOKS
// ============================================================================

/**
 * Hook for fetching learner progress data
 *
 * @example
 * const { data: progress, isLoading } = useLearnerProgress('user-123')
 */
export function useLearnerProgress(
  userId: string,
  options: { courseId?: string; refreshInterval?: number } = {},
): UseQueryResult<LearnerProgress> {
  const [data, setData] = useState<LearnerProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { courseId, refreshInterval } = options;

  const fetchData = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await fetchAnalytics<LearnerProgress>('/api/analytics/learner/progress', {
        userId,
        courseId,
      });

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [userId, courseId]);

  useEffect(() => {
    fetchData();

    if (refreshInterval) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return { data, isLoading, error, refresh: fetchData };
}

/**
 * Hook for fetching learner activity timeline
 */
export function useLearnerActivity(
  userId: string,
  dateRange: DateRange = '30d',
): UseQueryResult<LearnerActivity[]> {
  const [data, setData] = useState<LearnerActivity[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await fetchAnalytics<LearnerActivity[]>('/api/analytics/learner/activity', {
        userId,
        dateRange,
      });

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [userId, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refresh: fetchData };
}

/**
 * Hook for fetching learner streak data
 */
export function useLearnerStreak(userId: string): UseQueryResult<LearnerStreak> {
  const [data, setData] = useState<LearnerStreak | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await fetchAnalytics<LearnerStreak>('/api/analytics/learner/streak', {
        userId,
      });

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refresh: fetchData };
}

// ============================================================================
// COURSE ANALYTICS HOOKS
// ============================================================================

/**
 * Hook for fetching course analytics
 *
 * @example
 * const { data: analytics, isLoading } = useCourseAnalytics('course-123')
 */
export function useCourseAnalytics(
  courseId: string,
  options: { dateRange?: DateRange; refreshInterval?: number } = {},
): UseQueryResult<CourseAnalytics> {
  const [data, setData] = useState<CourseAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { dateRange = '30d', refreshInterval } = options;

  const fetchData = useCallback(async () => {
    if (!courseId) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await fetchAnalytics<CourseAnalytics>('/api/analytics/course', {
        courseId,
        dateRange,
      });

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [courseId, dateRange]);

  useEffect(() => {
    fetchData();

    if (refreshInterval) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return { data, isLoading, error, refresh: fetchData };
}

// ============================================================================
// ORGANIZATION ANALYTICS HOOKS
// ============================================================================

/**
 * Hook for fetching organization dashboard data
 *
 * @example
 * const { data: dashboard, isLoading } = useOrgDashboard('org-123')
 */
export function useOrgDashboard(
  orgId: string,
  options: { dateRange?: DateRange; refreshInterval?: number } = {},
): UseQueryResult<OrgDashboardData> {
  const [data, setData] = useState<OrgDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { dateRange = '30d', refreshInterval } = options;

  const fetchData = useCallback(async () => {
    if (!orgId) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await fetchAnalytics<OrgDashboardData>('/api/analytics/org/dashboard', {
        orgId,
        dateRange,
      });

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [orgId, dateRange]);

  useEffect(() => {
    fetchData();

    if (refreshInterval) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return { data, isLoading, error, refresh: fetchData };
}

// ============================================================================
// REAL-TIME ACTIVITY HOOK
// ============================================================================

/**
 * Hook for real-time activity stream using Firestore subscriptions
 *
 * @example
 * const { statements, isConnected } = useRealTimeActivity({
 *   enabled: true,
 *   limit: 20,
 * })
 */
export function useRealTimeActivity(
  _orgId?: string,
  options: UseRealTimeOptions = {},
): {
  statements: RecentStatement[];
  isConnected: boolean;
  error: Error | null;
} {
  const { enabled = true } = options;
  const [statements] = useState<RecentStatement[]>([]);
  const [isConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const channelRef = useRef<unknown>(null);

  useEffect(() => {
    if (!enabled) return;

    // TODO(LXD-301): Implement Firestore real-time subscription
    setError(new Error('Database not configured - migration in progress'));

    return () => {
      // Cleanup - no-op during migration
      if (channelRef.current) {
        channelRef.current = null;
      }
    };
  }, [enabled]);

  return { statements, isConnected, error };
}

// ============================================================================
// LEADERBOARD HOOK
// ============================================================================

/**
 * Hook for fetching leaderboard data
 *
 * @example
 * const { data: leaders, isLoading } = useLeaderboard('course-123', 10)
 */
export function useLeaderboard(
  courseId?: string,
  limit: number = 10,
  options: { period?: 'week' | 'month' | 'all-time'; refreshInterval?: number } = {},
): UseQueryResult<LeaderboardEntry[]> {
  const [data, setData] = useState<LeaderboardEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { period = 'all-time', refreshInterval } = options;

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await fetchAnalytics<LeaderboardEntry[]>('/api/analytics/leaderboard', {
        courseId,
        limit,
        period,
      });

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [courseId, limit, period]);

  useEffect(() => {
    fetchData();

    if (refreshInterval) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return { data, isLoading, error, refresh: fetchData };
}

// ============================================================================
// ANALYTICS FILTERS HOOK
// ============================================================================

/**
 * Hook for managing analytics filters state
 *
 * @example
 * const { filters, setFilter, resetFilters } = useAnalyticsFilters()
 */
export function useAnalyticsFilters(initialFilters: Partial<AnalyticsFilters> = {}): {
  filters: AnalyticsFilters;
  setFilter: <K extends keyof AnalyticsFilters>(key: K, value: AnalyticsFilters[K]) => void;
  setFilters: (filters: Partial<AnalyticsFilters>) => void;
  resetFilters: () => void;
} {
  const defaultFilters: AnalyticsFilters = {
    dateRange: '30d',
    ...initialFilters,
  };

  const [filters, setFiltersState] = useState<AnalyticsFilters>(defaultFilters);

  const setFilter = useCallback(
    <K extends keyof AnalyticsFilters>(key: K, value: AnalyticsFilters[K]) => {
      setFiltersState((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const setFilters = useCallback((newFilters: Partial<AnalyticsFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState({
      dateRange: '30d',
      ...initialFilters,
    });
  }, [initialFilters]);

  return { filters, setFilter, setFilters, resetFilters };
}

// ============================================================================
// HELPERS
// ============================================================================
