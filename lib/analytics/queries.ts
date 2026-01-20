// TODO(LXD-301): Implement with Firestore

import type {
  DateRange,
  DropOffPoint,
  LeaderboardEntry,
  LearnerActivity,
  LearnerProgress,
  LearnerStreak,
  OrgDashboardData,
  PopularContent,
  RecentStatement,
  TimeSeriesDataPoint,
  TopCourse,
  TopLearner,
} from './types';

// ============================================================================
// MIGRATION HELPER
// ============================================================================

function migrationError(operation: string): never {
  throw new Error(`${operation}: Database not configured - migration to Firestore in progress`);
}

// ============================================================================
// LEARNER ANALYTICS
// ============================================================================

/**
 * Get comprehensive learner progress data
 */
export async function getLearnerProgress(
  _userId: string,
  _courseId?: string,
): Promise<LearnerProgress> {
  migrationError('getLearnerProgress');
}

/**
 * Get learner activity over time
 */
export async function getLearnerActivity(
  _userId: string,
  _days: 7 | 30 | 90 = 30,
): Promise<LearnerActivity[]> {
  migrationError('getLearnerActivity');
}

/**
 * Get learner streak data
 */
export async function getLearnerStreak(_userId: string): Promise<LearnerStreak> {
  migrationError('getLearnerStreak');
}

/**
 * Get recent statements for a user
 */
export async function getRecentStatements(
  _userId: string,
  _limit: number = 20,
): Promise<RecentStatement[]> {
  migrationError('getRecentStatements');
}

// ============================================================================
// COURSE ANALYTICS
// ============================================================================

/**
 * Get course completion rate
 */
export async function getCourseCompletionRate(
  _courseId: string,
): Promise<{ completionRate: number; total: number; completed: number }> {
  migrationError('getCourseCompletionRate');
}

/**
 * Get course average score
 */
export async function getCourseAverageScore(_courseId: string): Promise<number> {
  migrationError('getCourseAverageScore');
}

/**
 * Get course drop-off points
 */
export async function getCourseDropOffPoints(_courseId: string): Promise<DropOffPoint[]> {
  migrationError('getCourseDropOffPoints');
}

// ============================================================================
// ORGANIZATION ANALYTICS
// ============================================================================

/**
 * Get organization active users
 */
export async function getOrgActiveUsers(
  _orgId: string,
  _period: DateRange = '30d',
): Promise<number> {
  migrationError('getOrgActiveUsers');
}

/**
 * Get organization completions
 */
export async function getOrgCompletions(
  _orgId: string,
  _period: DateRange = '30d',
): Promise<number> {
  migrationError('getOrgCompletions');
}

/**
 * Get organization top courses
 */
export async function getOrgTopCourses(_orgId: string, _limit: number = 5): Promise<TopCourse[]> {
  migrationError('getOrgTopCourses');
}

/**
 * Get organization top learners
 */
export async function getOrgTopLearners(
  _orgId: string,
  _limit: number = 10,
): Promise<TopLearner[]> {
  migrationError('getOrgTopLearners');
}

/**
 * Get organization engagement trend
 */
export async function getOrgEngagementTrend(
  _orgId: string,
  _days: number = 30,
): Promise<TimeSeriesDataPoint[]> {
  migrationError('getOrgEngagementTrend');
}

/**
 * Get full organization dashboard data
 */
export async function getOrgDashboardData(_orgId: string): Promise<OrgDashboardData> {
  migrationError('getOrgDashboardData');
}

// ============================================================================
// CONTENT ANALYTICS
// ============================================================================

/**
 * Get most viewed content
 */
export async function getMostViewedContent(
  _orgId: string,
  _limit: number = 10,
): Promise<PopularContent[]> {
  migrationError('getMostViewedContent');
}

/**
 * Get leaderboard
 */
export async function getLeaderboard(
  _orgId: string,
  _courseId?: string,
  _limit: number = 20,
): Promise<LeaderboardEntry[]> {
  migrationError('getLeaderboard');
}
