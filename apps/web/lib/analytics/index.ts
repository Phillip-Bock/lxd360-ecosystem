/**
 * USAGE:
 *
 * // Types
 * import type { LearnerProgress, CourseAnalytics } from '@/lib/analytics'
 *
 * // Server-side queries
 * import { getLearnerProgress, getOrgDashboardData } from '@/lib/analytics/queries'
 *
 * // Client-side hooks
 * import { useLearnerProgress, useOrgDashboard } from '@/lib/analytics'
 *
 * =============================================================================
 */

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Filters
  AnalyticsFilters,
  AssessmentPerformance,
  // Cognitive Load
  CognitiveLoadAnalytics,
  // Content Analytics
  ContentAnalytics,
  // Course Analytics
  CourseAnalytics,
  CourseProgress,
  DateRange,
  DropOffPoint,
  // Engagement
  EngagementMetrics,
  Leaderboard,
  // Leaderboard
  LeaderboardEntry,
  LearnerActivity,
  // Learner Analytics
  LearnerProgress,
  LearnerStreak,
  ModuleCompletion,
  // Organization Analytics
  OrgAnalytics,
  OrgDashboardData,
  OrgStats,
  PopularContent,
  QuestionAnalysis,
  // Activity Feed
  RecentStatement,
  TimeSeriesData,
  // Time Series
  TimeSeriesDataPoint,
  TopCourse,
  TopLearner,
} from './types';

// ============================================================================
// CLIENT HOOKS
// ============================================================================

export {
  // Filters
  useAnalyticsFilters,
  // Course hooks
  useCourseAnalytics,
  // Leaderboard
  useLeaderboard,
  useLearnerActivity,
  // Learner hooks
  useLearnerProgress,
  useLearnerStreak,
  // Organization hooks
  useOrgDashboard,
  // Real-time
  useRealTimeActivity,
} from './hooks';
