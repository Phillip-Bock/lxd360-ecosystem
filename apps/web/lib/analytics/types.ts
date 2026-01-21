// ============================================================================
// TIME SERIES DATA
// ============================================================================

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface TimeSeriesData {
  label: string;
  data: TimeSeriesDataPoint[];
  color?: string;
}

export type DateRange = '7d' | '30d' | '90d' | '1y' | 'all';

// ============================================================================
// LEARNER ANALYTICS
// ============================================================================

export interface LearnerProgress {
  userId: string;
  displayName: string;
  email: string;
  avatarUrl?: string;

  // Completion metrics
  coursesCompleted: number;
  coursesInProgress: number;
  totalCourses: number;
  completionRate: number;

  // Score metrics
  averageScore: number;
  highestScore: number;
  lowestScore: number;

  // Time metrics
  totalTimeSpent: number; // seconds
  averageSessionDuration: number; // seconds
  lastActivityAt: string | null;

  // Engagement
  currentStreak: number; // days
  longestStreak: number;
  totalActiveDays: number;

  // By course breakdown
  courseProgress?: CourseProgress[];
}

export interface CourseProgress {
  courseId: string;
  courseName: string;
  progress: number; // 0-100
  score?: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  timeSpent: number; // seconds
  modulesCompleted: number;
  totalModules: number;
}

export interface LearnerActivity {
  date: string;
  statements: number;
  timeSpent: number; // seconds
  completions: number;
  interactions: number;
}

export interface LearnerStreak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  streakHistory: { date: string; active: boolean }[];
}

// ============================================================================
// COURSE ANALYTICS
// ============================================================================

export interface CourseAnalytics {
  courseId: string;
  courseName: string;
  description?: string;
  thumbnailUrl?: string;

  // Enrollment
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  dropOffCount: number;

  // Rates
  completionRate: number;
  passRate: number;
  averageScore: number;
  averageTimeToComplete: number; // seconds

  // Engagement
  averageProgress: number;
  totalTimeSpent: number; // seconds
  dailyActiveUsers: number;
  weeklyActiveUsers: number;

  // Content performance
  moduleCompletion: ModuleCompletion[];
  dropOffPoints: DropOffPoint[];
  assessmentPerformance: AssessmentPerformance[];
}

export interface ModuleCompletion {
  moduleId: string;
  moduleName: string;
  order: number;
  completionRate: number;
  averageScore?: number;
  averageTimeSpent: number; // seconds
  totalAttempts: number;
}

export interface DropOffPoint {
  moduleId: string;
  moduleName: string;
  order: number;
  dropOffCount: number;
  dropOffRate: number;
  commonExitPoints: string[];
}

export interface AssessmentPerformance {
  assessmentId: string;
  assessmentName: string;
  moduleId: string;
  type: 'quiz' | 'test' | 'assignment' | 'survey';
  attempts: number;
  averageScore: number;
  passRate: number;
  averageAttempts: number;
  questionAnalysis?: QuestionAnalysis[];
}

export interface QuestionAnalysis {
  questionId: string;
  questionText: string;
  correctRate: number;
  averageTimeSpent: number;
  commonWrongAnswers: { answer: string; count: number }[];
}

// ============================================================================
// ORGANIZATION ANALYTICS
// ============================================================================

export interface OrgAnalytics {
  orgId: string;
  orgName: string;

  // Users
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;

  // Learning
  totalCompletions: number;
  totalTimeSpent: number; // seconds
  averageScore: number;

  // Engagement
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  engagementRate: number;

  // Trends
  completionsTrend: TimeSeriesDataPoint[];
  activeUsersTrend: TimeSeriesDataPoint[];
  scoresTrend: TimeSeriesDataPoint[];
}

export interface OrgDashboardData {
  stats: OrgStats;
  topCourses: TopCourse[];
  topLearners: TopLearner[];
  recentActivity: RecentStatement[];
  engagementTrend: TimeSeriesDataPoint[];
  completionsTrend: TimeSeriesDataPoint[];
}

export interface OrgStats {
  activeUsers: number;
  activeUsersDelta: number; // percentage change
  completions: number;
  completionsDelta: number;
  averageScore: number;
  averageScoreDelta: number;
  engagementRate: number;
  engagementRateDelta: number;
}

export interface TopCourse {
  courseId: string;
  courseName: string;
  thumbnailUrl?: string;
  enrollments: number;
  completions: number;
  averageScore: number;
  completionRate: number;
}

export interface TopLearner {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  completions: number;
  averageScore: number;
  timeSpent: number;
  rank: number;
}

// ============================================================================
// CONTENT ANALYTICS
// ============================================================================

export interface ContentAnalytics {
  contentId: string;
  contentName: string;
  contentType: 'video' | 'document' | 'interactive' | 'assessment' | 'other';

  // Engagement
  totalViews: number;
  uniqueViewers: number;
  averageTimeSpent: number; // seconds
  completionRate: number;

  // Performance
  averageScore?: number;
  interactionRate: number;

  // Trends
  viewsTrend: TimeSeriesDataPoint[];
}

export interface PopularContent {
  contentId: string;
  contentName: string;
  contentType: string;
  courseId?: string;
  courseName?: string;
  views: number;
  completions: number;
  averageTimeSpent: number;
  rating?: number;
}

// ============================================================================
// LEADERBOARD
// ============================================================================

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  score: number;
  completions: number;
  timeSpent: number;
  streak?: number;
  badges?: number;
  change?: 'up' | 'down' | 'same';
  changeAmount?: number;
}

export interface Leaderboard {
  period: 'week' | 'month' | 'all-time';
  courseId?: string;
  entries: LeaderboardEntry[];
  totalParticipants: number;
  lastUpdated: string;
}

// ============================================================================
// ACTIVITY FEED
// ============================================================================

export interface RecentStatement {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  verb: string;
  verbDisplay: string;
  objectName: string;
  objectType: string;
  courseId?: string;
  courseName?: string;
  score?: number;
  timestamp: string;
}

// ============================================================================
// ENGAGEMENT METRICS
// ============================================================================

export interface EngagementMetrics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number; // seconds
  averageSessionsPerUser: number;
  bounceRate: number;
  returnRate: number;
  peakHours: { hour: number; users: number }[];
  peakDays: { day: string; users: number }[];
}

// ============================================================================
// COGNITIVE LOAD ANALYTICS (LXP360 specific)
// ============================================================================

export interface CognitiveLoadAnalytics {
  averageLoad: number;
  loadDistribution: {
    low: number;
    optimal: number;
    high: number;
    overload: number;
  };
  loadByHour: { hour: number; avgLoad: number }[];
  loadByContent: { contentId: string; contentName: string; avgLoad: number }[];
  recommendations: string[];
}

// ============================================================================
// FILTER OPTIONS
// ============================================================================

export interface AnalyticsFilters {
  dateRange: DateRange;
  courseId?: string;
  userId?: string;
  contentType?: string;
  verbType?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}
