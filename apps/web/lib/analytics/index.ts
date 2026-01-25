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

// ============================================================================
// GOD VIEW ANALYTICS — TYPES
// ============================================================================

export type {
  BusinessMetrics,
  CompetencyScore,
  ComplianceCompetencyGap,
  ComplianceScore,
  Department,
  DepartmentRiskScore,
  DepartmentSkillMetrics,
  GodViewLearningMetrics,
  HeatmapCell,
  RiskFactor,
  ROICorrelation,
  ROIDashboard,
  SkillGapHeatmap,
  SkillMetrics,
  TeamMember,
} from './god-view-types';

// ============================================================================
// GOD VIEW ANALYTICS — HEATMAP
// ============================================================================

export {
  calculateCellRisk,
  calculateDepartmentRisk,
  calculateSkillMetrics,
  explainCell,
  generateHeatmap,
  generateHeatmapCell,
  getDepartmentsByRisk,
  getHotspots,
} from './heatmap';

// ============================================================================
// GOD VIEW ANALYTICS — COMPLIANCE GAP
// ============================================================================

export {
  analyzeDepartments,
  analyzeGap,
  calculateCompetencyScore,
  calculateComplianceScore,
  explainGap,
  generateRiskScore,
  getDepartmentsByRiskLevel,
  getOrganizationSummary,
} from './compliance-gap';

// ============================================================================
// GOD VIEW ANALYTICS — ROI ENGINE
// ============================================================================

export {
  buildROIDashboard,
  calculateAllCorrelations,
  calculateCorrelation,
  calculateEstimatedROI,
  explainROI,
  generateExecutiveSummary,
  getTopCorrelations,
} from './roi';
