/**
 * Analytics and reporting type definitions
 */

export type TimeRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all-time' | 'custom';
export type MetricTrend = 'up' | 'down' | 'stable';
export type ChartType = 'line' | 'bar' | 'pie' | 'donut' | 'area' | 'radar' | 'heatmap' | 'funnel';

export interface AnalyticsDashboard {
  id: string;
  name: string;
  description?: string;
  // Layout
  widgets: DashboardWidget[];
  layout: GridLayout[];
  // Filters
  globalFilters: DashboardFilter[];
  // Access
  ownerId: string;
  isPublic: boolean;
  sharedWith: string[];
  // Metadata
  createdAt: string;
  updatedAt: string;
  lastViewedAt?: string;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  // Data
  metric: string;
  dataSource: string;
  query?: AnalyticsQuery;
  // Display
  chartType?: ChartType;
  chartConfig?: ChartConfig;
  // Size
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
}

export type WidgetType =
  | 'metric'
  | 'chart'
  | 'table'
  | 'leaderboard'
  | 'progress'
  | 'list'
  | 'map'
  | 'text';

export interface GridLayout {
  widgetId: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DashboardFilter {
  id: string;
  field: string;
  label: string;
  type: 'select' | 'multi-select' | 'date-range' | 'search';
  options?: { value: string; label: string }[];
  defaultValue?: unknown;
}

export interface ChartConfig {
  xAxis?: string;
  yAxis?: string;
  series?: string[];
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  showLabels?: boolean;
  stacked?: boolean;
  smooth?: boolean;
  fillArea?: boolean;
}

export interface AnalyticsQuery {
  metrics: string[];
  dimensions?: string[];
  filters?: QueryFilter[];
  sort?: QuerySort[];
  limit?: number;
  timeRange?: TimeRange;
  customRange?: {
    start: string;
    end: string;
  };
  groupBy?: string;
  compareWith?: TimeRange;
}

export interface QueryFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'between';
  value: unknown;
}

export interface QuerySort {
  field: string;
  direction: 'asc' | 'desc';
}

// Learning Analytics
export interface LearningAnalytics {
  timeRange: TimeRange;
  // Overview Metrics
  overview: {
    totalLearners: MetricValue;
    activeLearners: MetricValue;
    coursesCompleted: MetricValue;
    averageCompletionRate: MetricValue;
    totalLearningHours: MetricValue;
    averageQuizScore: MetricValue;
    complianceRate: MetricValue;
    engagementScore: MetricValue;
  };
  // Trends
  trends: {
    enrollments: TimeSeriesData[];
    completions: TimeSeriesData[];
    activeUsers: TimeSeriesData[];
    learningHours: TimeSeriesData[];
  };
  // Breakdowns
  byCategory: CategoryBreakdown[];
  byDepartment: DepartmentBreakdown[];
  byCourse: CourseBreakdown[];
  bySkill: SkillBreakdown[];
  // Engagement
  engagement: EngagementMetrics;
  // Generated
  generatedAt: string;
}

export interface MetricValue {
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  trend: MetricTrend;
  target?: number;
  targetPercent?: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  comparePeriodValue?: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  enrollments: number;
  completions: number;
  completionRate: number;
  averageScore: number;
  totalHours: number;
}

export interface DepartmentBreakdown {
  departmentId: string;
  departmentName: string;
  learnerCount: number;
  activePercent: number;
  completionRate: number;
  averageScore: number;
  complianceRate: number;
  totalHours: number;
}

export interface CourseBreakdown {
  courseId: string;
  courseTitle: string;
  category: string;
  enrollments: number;
  completions: number;
  completionRate: number;
  averageScore: number;
  averageTimeToComplete: number;
  rating: number;
  dropoffRate: number;
}

export interface SkillBreakdown {
  skillId: string;
  skillName: string;
  category: string;
  learnersWithSkill: number;
  averageLevel: number;
  growthRate: number;
  topCourses: string[];
}

export interface EngagementMetrics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number;
  sessionsPerUser: number;
  pageViewsPerSession: number;
  bounceRate: number;
  // Content engagement
  videoCompletionRate: number;
  quizAttemptRate: number;
  discussionParticipation: number;
  resourceDownloads: number;
  // By day
  activityByDay: { day: string; count: number }[];
  // By hour
  activityByHour: { hour: number; count: number }[];
}

// Course Analytics
export interface CourseAnalytics {
  courseId: string;
  timeRange: TimeRange;
  // Overview
  overview: {
    totalEnrollments: MetricValue;
    activeEnrollments: MetricValue;
    completions: MetricValue;
    completionRate: MetricValue;
    averageScore: MetricValue;
    averageTimeToComplete: MetricValue;
    rating: MetricValue;
  };
  // Funnel
  funnel: {
    enrolled: number;
    started: number;
    halfway: number;
    almostDone: number;
    completed: number;
  };
  // Content performance
  lessonPerformance: LessonPerformance[];
  quizPerformance: QuizPerformance[];
  // Drop-off analysis
  dropoffPoints: DropoffPoint[];
  // Learner segments
  segments: {
    completedOnTime: number;
    completedLate: number;
    inProgress: number;
    notStarted: number;
    dropped: number;
  };
  // Feedback
  reviews: {
    average: number;
    count: number;
    distribution: { stars: number; count: number }[];
    recent: { rating: number; comment: string; date: string }[];
  };
}

export interface LessonPerformance {
  lessonId: string;
  lessonTitle: string;
  moduleTitle: string;
  order: number;
  views: number;
  completions: number;
  completionRate: number;
  averageTimeSpent: number;
  expectedTime: number;
  dropoffRate: number;
  replayRate: number;
  score?: number;
}

export interface QuizPerformance {
  quizId: string;
  quizTitle: string;
  attempts: number;
  uniqueAttempts: number;
  passRate: number;
  averageScore: number;
  averageTime: number;
  questionAnalysis: QuestionAnalysis[];
}

export interface QuestionAnalysis {
  questionId: string;
  questionText: string;
  correctRate: number;
  averageTime: number;
  discrimination: number; // how well it differentiates learners
  difficulty: number;
  commonWrongAnswers?: { answer: string; count: number }[];
}

export interface DropoffPoint {
  lessonId: string;
  lessonTitle: string;
  dropoffCount: number;
  dropoffRate: number;
  averageTimeBeforeDropoff: number;
  reasons?: string[];
}

// Learner Analytics
export interface LearnerAnalytics {
  learnerId: string;
  timeRange: TimeRange;
  // Learning summary
  summary: {
    coursesEnrolled: number;
    coursesCompleted: number;
    totalLearningTime: number;
    averageScore: number;
    skillsGained: number;
    badgesEarned: number;
    currentStreak: number;
  };
  // Progress
  courseProgress: {
    courseId: string;
    courseTitle: string;
    progress: number;
    status: string;
    lastActivity: string;
  }[];
  // Activity
  activityTimeline: {
    date: string;
    minutes: number;
    activities: number;
    courses: string[];
  }[];
  // Strengths and weaknesses
  skillProfile: {
    skillId: string;
    skillName: string;
    level: number;
    trend: MetricTrend;
  }[];
  // Learning patterns
  patterns: {
    preferredTime: string;
    preferredDay: string;
    averageSessionLength: number;
    contentPreferences: { type: string; engagement: number }[];
  };
}

// Report Templates
export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  type: ReportType;
  // Configuration
  metrics: string[];
  dimensions: string[];
  filters: ReportFilter[];
  groupBy?: string[];
  sortBy?: { field: string; direction: 'asc' | 'desc' }[];
  // Scheduling
  schedule?: ReportSchedule;
  // Output
  format: 'pdf' | 'csv' | 'xlsx' | 'json';
  includeCharts: boolean;
  // Access
  createdBy: string;
  sharedWith: string[];
  // Metadata
  createdAt: string;
  updatedAt: string;
  lastRunAt?: string;
}

export type ReportType =
  | 'completion'
  | 'compliance'
  | 'engagement'
  | 'skill-gap'
  | 'assessment'
  | 'time-spent'
  | 'user-activity'
  | 'content-performance'
  | 'custom';

export interface ReportFilter {
  field: string;
  label: string;
  type: 'select' | 'multi-select' | 'date-range' | 'number-range';
  value?: unknown;
  required: boolean;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  timezone: string;
  recipients: string[];
  isActive: boolean;
}

export interface GeneratedReport {
  id: string;
  templateId: string;
  templateName: string;
  generatedAt: string;
  generatedBy: string;
  // Parameters
  timeRange: TimeRange;
  filters: Record<string, unknown>;
  // Output
  format: string;
  fileUrl: string;
  fileSize: number;
  rowCount: number;
  // Status
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

// AI Insights
export interface AIInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  // Impact
  severity: 'info' | 'warning' | 'critical';
  impactScore: number;
  // Data
  metric: string;
  currentValue: number;
  expectedValue: number;
  deviation: number;
  // Recommendations
  recommendations: string[];
  // Entities
  affectedLearners?: string[];
  affectedCourses?: string[];
  // Dates
  detectedAt: string;
  validUntil?: string;
  dismissedAt?: string;
  dismissedBy?: string;
}

export type InsightType =
  | 'completion-drop'
  | 'engagement-decline'
  | 'skill-gap'
  | 'at-risk-learner'
  | 'content-issue'
  | 'compliance-risk'
  | 'trend-anomaly'
  | 'opportunity';
