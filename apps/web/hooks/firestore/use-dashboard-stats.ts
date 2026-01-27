'use client';

/**
 * useDashboardStats - Hook for fetching dashboard metrics
 *
 * Aggregates data from courses, learners, and enrollments for
 * the Mission Control dashboard. Returns persona-specific metrics.
 *
 * @see LXD-364 - Dashboard Addon Tabs & User Tabs Audit
 */

import { useCallback, useEffect, useState } from 'react';
import { getCoursesByOrg } from '@/lib/firestore/services/courses';
import {
  getCompletedEnrollments,
  getInProgressEnrollments,
} from '@/lib/firestore/services/enrollments';
import { getLearners } from '@/lib/firestore/services/learners';
import { useSafeAuth } from '@/providers/SafeAuthProvider';
import { useOrganization } from './use-organization';

// =============================================================================
// TYPES
// =============================================================================

export interface LearnerDashboardStats {
  coursesActive: number;
  coursesCompleted: number;
  skillsMastered: number;
  learningStreak: number;
}

export interface EditorDashboardStats {
  activeCourses: number;
  draftCourses: number;
  totalStudents: number;
  avgCompletion: number;
}

export interface ManagerDashboardStats {
  teamMembers: number;
  complianceRate: number;
  atRiskCount: number;
  avgProgress: number;
}

export interface OwnerDashboardStats {
  totalCourses: number;
  totalLearners: number;
  activeEnrollments: number;
  completionRate: number;
}

export type DashboardStats =
  | LearnerDashboardStats
  | EditorDashboardStats
  | ManagerDashboardStats
  | OwnerDashboardStats;

export interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useDashboardStats(): UseDashboardStatsReturn {
  const { user, persona } = useSafeAuth();
  const { organizationId, loading: orgLoading } = useOrganization();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLearnerStats = useCallback(async (): Promise<LearnerDashboardStats> => {
    if (!organizationId || !user?.uid) {
      return {
        coursesActive: 0,
        coursesCompleted: 0,
        skillsMastered: 0,
        learningStreak: 0,
      };
    }

    try {
      const [inProgress, completed] = await Promise.all([
        getInProgressEnrollments(organizationId, user.uid),
        getCompletedEnrollments(organizationId, user.uid),
      ]);

      return {
        coursesActive: inProgress.length,
        coursesCompleted: completed.length,
        // TODO(LXD-365): Fetch from xAPI LRS when implemented
        skillsMastered: 0,
        // TODO(LXD-366): Calculate from activity timestamps
        learningStreak: 0,
      };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch learner stats');
    }
  }, [organizationId, user?.uid]);

  const fetchEditorStats = useCallback(async (): Promise<EditorDashboardStats> => {
    if (!organizationId || !user?.uid) {
      return {
        activeCourses: 0,
        draftCourses: 0,
        totalStudents: 0,
        avgCompletion: 0,
      };
    }

    try {
      const coursesResponse = await getCoursesByOrg(organizationId, { limit: 100 });
      const courses = coursesResponse.items;

      // Filter courses by instructor
      const myCourses = courses.filter(
        (c) => c.createdBy === user.uid || c.instructorId === user.uid,
      );

      const activeCourses = myCourses.filter((c) => c.status === 'published');
      const draftCourses = myCourses.filter((c) => c.status === 'draft');

      const totalStudents = activeCourses.reduce((sum, c) => sum + (c.enrollmentCount ?? 0), 0);
      const avgCompletion =
        activeCourses.length > 0
          ? activeCourses.reduce((sum, c) => sum + (c.completionRate ?? 0), 0) /
            activeCourses.length
          : 0;

      return {
        activeCourses: activeCourses.length,
        draftCourses: draftCourses.length,
        totalStudents,
        avgCompletion: Math.round(avgCompletion),
      };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch editor stats');
    }
  }, [organizationId, user?.uid]);

  const fetchManagerStats = useCallback(async (): Promise<ManagerDashboardStats> => {
    if (!organizationId) {
      return {
        teamMembers: 0,
        complianceRate: 0,
        atRiskCount: 0,
        avgProgress: 0,
      };
    }

    try {
      const learnersResponse = await getLearners(organizationId, { limit: 100 });
      const learners = learnersResponse.items;

      // Count active learners
      const activeCount = learners.filter((l) => l.status === 'active').length;

      // Count at-risk learners (inactive or failing)
      const atRiskCount = learners.filter(
        (l) => l.status === 'inactive' || l.status === 'suspended',
      ).length;

      // TODO(LXD-367): Calculate compliance from required course enrollments
      // For now, estimate based on active vs total
      const complianceRate =
        learners.length > 0 ? Math.round((activeCount / learners.length) * 100) : 0;

      return {
        teamMembers: learners.length,
        complianceRate,
        atRiskCount,
        // TODO(LXD-368): Calculate from enrollment progress averages
        avgProgress: 0,
      };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch manager stats');
    }
  }, [organizationId]);

  const fetchOwnerStats = useCallback(async (): Promise<OwnerDashboardStats> => {
    if (!organizationId) {
      return {
        totalCourses: 0,
        totalLearners: 0,
        activeEnrollments: 0,
        completionRate: 0,
      };
    }

    try {
      const [coursesResponse, learnersResponse] = await Promise.all([
        getCoursesByOrg(organizationId, { limit: 100 }),
        getLearners(organizationId, { limit: 100 }),
      ]);

      const courses = coursesResponse.items;
      const learners = learnersResponse.items;

      // Calculate totals
      const totalCourses = courses.length;
      const totalLearners = learners.length;
      const publishedCourses = courses.filter((c) => c.status === 'published');

      // Aggregate enrollment counts
      const activeEnrollments = publishedCourses.reduce(
        (sum, c) => sum + (c.enrollmentCount ?? 0),
        0,
      );

      // Calculate average completion rate
      const completionRate =
        publishedCourses.length > 0
          ? Math.round(
              publishedCourses.reduce((sum, c) => sum + (c.completionRate ?? 0), 0) /
                publishedCourses.length,
            )
          : 0;

      return {
        totalCourses,
        totalLearners,
        activeEnrollments,
        completionRate,
      };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch owner stats');
    }
  }, [organizationId]);

  const fetchStats = useCallback(async () => {
    if (!organizationId || orgLoading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let fetchedStats: DashboardStats;

      switch (persona) {
        case 'learner':
          fetchedStats = await fetchLearnerStats();
          break;
        case 'editor':
          fetchedStats = await fetchEditorStats();
          break;
        case 'manager':
          fetchedStats = await fetchManagerStats();
          break;
        default:
          // Owner persona (default case)
          fetchedStats = await fetchOwnerStats();
          break;
      }

      setStats(fetchedStats);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch dashboard stats';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [
    organizationId,
    orgLoading,
    persona,
    fetchLearnerStats,
    fetchEditorStats,
    fetchManagerStats,
    fetchOwnerStats,
  ]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    if (!orgLoading && organizationId) {
      fetchStats();
    }
  }, [orgLoading, organizationId, fetchStats]);

  const refresh = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading: loading || orgLoading,
    error,
    refresh,
  };
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

export function isLearnerStats(stats: DashboardStats): stats is LearnerDashboardStats {
  return 'coursesActive' in stats && 'learningStreak' in stats;
}

export function isEditorStats(stats: DashboardStats): stats is EditorDashboardStats {
  return 'activeCourses' in stats && 'draftCourses' in stats;
}

export function isManagerStats(stats: DashboardStats): stats is ManagerDashboardStats {
  return 'teamMembers' in stats && 'complianceRate' in stats;
}

export function isOwnerStats(stats: DashboardStats): stats is OwnerDashboardStats {
  return 'totalCourses' in stats && 'totalLearners' in stats;
}
