// =============================================================================
// BASE XAPI TYPES (xAPI 1.0.3 Specification)
// =============================================================================

/**
 * xAPI Actor - the entity performing the action.
 * Can be an Agent (individual) or Group.
 */
export interface XAPIActor {
  objectType?: 'Agent' | 'Group';
  name?: string;
  mbox?: string;
  mbox_sha1sum?: string;
  openid?: string;
  account?: {
    homePage: string;
    name: string;
  };
  member?: XAPIActor[];
}

/**
 * xAPI Verb - the action being performed.
 */
export interface XAPIVerb {
  id: string;
  display?: Record<string, string>;
}

/**
 * xAPI Verb Object - same as XAPIVerb, used for processed statements.
 */
export type XAPIVerbObject = XAPIVerb;

/**
 * xAPI Object - the thing being acted upon.
 */
export interface XAPIObject {
  objectType?: 'Activity' | 'Agent' | 'Group' | 'StatementRef' | 'SubStatement';
  id: string;
  definition?: {
    name?: Record<string, string>;
    description?: Record<string, string>;
    type?: string;
    moreInfo?: string;
    interactionType?: string;
    correctResponsesPattern?: string[];
    choices?: Array<{ id: string; description: Record<string, string> }>;
    scale?: Array<{ id: string; description: Record<string, string> }>;
    source?: Array<{ id: string; description: Record<string, string> }>;
    target?: Array<{ id: string; description: Record<string, string> }>;
    steps?: Array<{ id: string; description: Record<string, string> }>;
    extensions?: Record<string, unknown>;
  };
}

/**
 * xAPI Result - outcome of the experience.
 */
export interface XAPIResult {
  score?: {
    scaled?: number;
    raw?: number;
    min?: number;
    max?: number;
  };
  success?: boolean;
  completion?: boolean;
  response?: string;
  duration?: string;
  extensions?: Record<string, unknown>;
}

/**
 * xAPI Context - additional contextual information.
 */
export interface XAPIContext {
  registration?: string;
  instructor?: XAPIActor;
  team?: XAPIActor;
  contextActivities?: {
    parent?: XAPIObject[];
    grouping?: XAPIObject[];
    category?: XAPIObject[];
    other?: XAPIObject[];
  };
  revision?: string;
  platform?: string;
  language?: string;
  statement?: {
    objectType: 'StatementRef';
    id: string;
  };
  extensions?: Record<string, unknown>;
}

/**
 * xAPI Statement - complete learning experience record.
 */
export interface XAPIStatement {
  id?: string;
  actor: XAPIActor;
  verb: XAPIVerb;
  object: XAPIObject;
  result?: XAPIResult;
  context?: XAPIContext;
  timestamp?: string;
  stored?: string;
  authority?: XAPIActor;
  version?: string;
  attachments?: Array<{
    usageType: string;
    display: Record<string, string>;
    description?: Record<string, string>;
    contentType: string;
    length: number;
    sha2: string;
    fileUrl?: string;
  }>;
}

/**
 * Standard xAPI verb IRIs from ADL registry.
 */
export const XAPI_VERB_IRIS = {
  completed: 'http://adlnet.gov/expapi/verbs/completed',
  passed: 'http://adlnet.gov/expapi/verbs/passed',
  failed: 'http://adlnet.gov/expapi/verbs/failed',
  answered: 'http://adlnet.gov/expapi/verbs/answered',
  attempted: 'http://adlnet.gov/expapi/verbs/attempted',
  experienced: 'http://adlnet.gov/expapi/verbs/experienced',
  interacted: 'http://adlnet.gov/expapi/verbs/interacted',
  launched: 'http://adlnet.gov/expapi/verbs/launched',
  initialized: 'http://adlnet.gov/expapi/verbs/initialized',
  terminated: 'http://adlnet.gov/expapi/verbs/terminated',
  progressed: 'http://adlnet.gov/expapi/verbs/progressed',
  scored: 'http://adlnet.gov/expapi/verbs/scored',
  mastered: 'http://adlnet.gov/expapi/verbs/mastered',
  viewed: 'http://id.tincanapi.com/verb/viewed',
} as const;

// =============================================================================
// TRACKING MODE CONFIGURATION (Internal vs External)
// =============================================================================

/**
 * Tracking mode determines where xAPI statements are sent.
 * - internal: Statements stored in Firestore (for LXP360 platform use)
 * - external: Statements sent to configured external LRS (for published packages)
 */
export type TrackingMode = 'internal' | 'external';

/**
 * Configuration for internal tracking mode (LXP360 platform).
 * Statements are stored directly in Firestore with real-time analytics.
 */
export interface InternalTrackingConfig {
  mode: 'internal';
  organizationId: string;
  sessionId?: string;
  enableRealtimeAnalytics?: boolean;
  enableBigQuerySync?: boolean;
}

/**
 * Configuration for external tracking mode (published packages).
 * Statements are sent to a configured external LRS endpoint.
 */
export interface ExternalTrackingConfig {
  mode: 'external';
  lrsEndpoint: string;
  lrsAuth?: string;
  mirrorToLXP360?: boolean;
  lxp360ApiKey?: string;
  enableOfflineQueue?: boolean;
  offlineQueueSize?: number;
}

/**
 * Union type for tracking configuration.
 */
export type TrackingConfig = InternalTrackingConfig | ExternalTrackingConfig;

/**
 * Type guard to check if config is internal mode.
 */
export function isInternalMode(config: TrackingConfig): config is InternalTrackingConfig {
  return config.mode === 'internal';
}

/**
 * Type guard to check if config is external mode.
 */
export function isExternalMode(config: TrackingConfig): config is ExternalTrackingConfig {
  return config.mode === 'external';
}

// =============================================================================
// EXTENDED VERB DEFINITIONS
// =============================================================================

/**
 * Extended xAPI verbs including cmi5 and lifecycle verbs.
 */
export type ExtendedXAPIVerb =
  | 'initialized'
  | 'launched'
  | 'completed'
  | 'passed'
  | 'failed'
  | 'terminated'
  | 'progressed'
  | 'resumed'
  | 'suspended'
  | 'answered'
  | 'asked'
  | 'attempted'
  | 'interacted'
  | 'experienced'
  | 'played'
  | 'paused'
  | 'seeked'
  | 'scored'
  | 'mastered'
  | 'commented'
  | 'shared'
  | 'liked'
  | 'exited'
  | 'skipped'
  | 'satisfied'
  | 'waived';

/**
 * Extended verb IRIs including cmi5 verbs.
 */
export const EXTENDED_VERB_IRIS: Record<ExtendedXAPIVerb, string> = {
  // Lifecycle verbs
  initialized: 'http://adlnet.gov/expapi/verbs/initialized',
  launched: 'http://adlnet.gov/expapi/verbs/launched',
  completed: 'http://adlnet.gov/expapi/verbs/completed',
  passed: 'http://adlnet.gov/expapi/verbs/passed',
  failed: 'http://adlnet.gov/expapi/verbs/failed',
  terminated: 'http://adlnet.gov/expapi/verbs/terminated',

  // Progress verbs
  progressed: 'http://adlnet.gov/expapi/verbs/progressed',
  resumed: 'http://adlnet.gov/expapi/verbs/resumed',
  suspended: 'http://adlnet.gov/expapi/verbs/suspended',

  // Interaction verbs
  answered: 'http://adlnet.gov/expapi/verbs/answered',
  asked: 'http://adlnet.gov/expapi/verbs/asked',
  attempted: 'http://adlnet.gov/expapi/verbs/attempted',
  interacted: 'http://adlnet.gov/expapi/verbs/interacted',
  experienced: 'http://adlnet.gov/expapi/verbs/experienced',

  // Media verbs
  played: 'https://w3id.org/xapi/video/verbs/played',
  paused: 'https://w3id.org/xapi/video/verbs/paused',
  seeked: 'https://w3id.org/xapi/video/verbs/seeked',

  // Assessment verbs
  scored: 'http://adlnet.gov/expapi/verbs/scored',
  mastered: 'http://adlnet.gov/expapi/verbs/mastered',

  // Social verbs
  commented: 'http://adlnet.gov/expapi/verbs/commented',
  shared: 'http://adlnet.gov/expapi/verbs/shared',
  liked: 'http://adlnet.gov/expapi/verbs/liked',

  // Navigation verbs
  exited: 'http://adlnet.gov/expapi/verbs/exited',
  skipped: 'http://adlnet.gov/expapi/verbs/skipped',

  // cmi5 verbs
  satisfied: 'https://w3id.org/xapi/adl/verbs/satisfied',
  waived: 'https://w3id.org/xapi/adl/verbs/waived',
} as const;

// =============================================================================
// ACTIVITY TYPES
// =============================================================================

/**
 * Activity type IRIs from ADL registry.
 */
export const ACTIVITY_TYPE_IRIS = {
  course: 'http://adlnet.gov/expapi/activities/course',
  module: 'http://adlnet.gov/expapi/activities/module',
  lesson: 'http://adlnet.gov/expapi/activities/lesson',
  assessment: 'http://adlnet.gov/expapi/activities/assessment',
  question: 'http://adlnet.gov/expapi/activities/question',
  interaction: 'http://adlnet.gov/expapi/activities/interaction',
  simulation: 'http://adlnet.gov/expapi/activities/simulation',
  media: 'http://adlnet.gov/expapi/activities/media',
  video: 'https://w3id.org/xapi/video/activity-type/video',
  audio: 'https://w3id.org/xapi/audio/activity-type/audio',
  slide: 'http://id.tincanapi.com/activitytype/slide',
  page: 'http://activitystrea.ms/schema/1.0/page',
  file: 'http://activitystrea.ms/schema/1.0/file',
  link: 'http://adlnet.gov/expapi/activities/link',
  objective: 'http://adlnet.gov/expapi/activities/objective',
  attempt: 'http://adlnet.gov/expapi/activities/attempt',
} as const;

/**
 * CMI interaction types for assessments.
 */
export type InteractionType =
  | 'true-false'
  | 'choice'
  | 'fill-in'
  | 'long-fill-in'
  | 'matching'
  | 'performance'
  | 'sequencing'
  | 'likert'
  | 'numeric'
  | 'other';

// =============================================================================
// EXTENSION IRIS
// =============================================================================

/**
 * Common extension IRIs for xAPI statements.
 */
export const EXTENSION_IRIS = {
  // Session extensions
  sessionId: 'https://w3id.org/xapi/cmi5/context/extensions/sessionid',
  attemptId: 'https://lxd360.com/xapi/extensions/attemptId',

  // Progress extensions
  progress: 'https://w3id.org/xapi/cmi5/result/extensions/progress',
  timeOnTask: 'https://lxd360.com/xapi/extensions/timeOnTask',

  // Interaction extensions
  interactionCount: 'https://lxd360.com/xapi/extensions/interactionCount',
  hintsUsed: 'https://lxd360.com/xapi/extensions/hintsUsed',
  attemptsCount: 'https://lxd360.com/xapi/extensions/attemptsCount',

  // Media extensions
  playedSegments: 'https://w3id.org/xapi/video/extensions/played-segments',
  currentTime: 'https://w3id.org/xapi/video/extensions/time',
  duration: 'https://w3id.org/xapi/video/extensions/length',
  completionThreshold: 'https://w3id.org/xapi/video/extensions/completion-threshold',

  // Cognitive load extensions
  cognitiveLoad: 'https://lxd360.com/xapi/extensions/cognitiveLoad',
  intrinsicLoad: 'https://lxd360.com/xapi/extensions/intrinsicLoad',
  extraneousLoad: 'https://lxd360.com/xapi/extensions/extraneousLoad',
  germaneLoad: 'https://lxd360.com/xapi/extensions/germaneLoad',

  // Device/browser extensions
  userAgent: 'https://lxd360.com/xapi/extensions/userAgent',
  screenSize: 'https://lxd360.com/xapi/extensions/screenSize',
  deviceType: 'https://lxd360.com/xapi/extensions/deviceType',

  // Assessment extensions
  questionType: 'https://lxd360.com/xapi/extensions/questionType',
  correctAnswers: 'https://lxd360.com/xapi/extensions/correctAnswers',
  learnerAnswers: 'https://lxd360.com/xapi/extensions/learnerAnswers',
  partialCredit: 'https://lxd360.com/xapi/extensions/partialCredit',

  // Competency extensions
  competencyId: 'https://lxd360.com/xapi/extensions/competencyId',
  competencyLevel: 'https://lxd360.com/xapi/extensions/competencyLevel',
} as const;

// =============================================================================
// LRS CONFIGURATION
// =============================================================================

/**
 * LRS (Learning Record Store) configuration.
 */
export interface LRSConfig {
  /** LRS endpoint URL */
  endpoint: string;
  /** Basic auth username */
  username?: string;
  /** Basic auth password */
  password?: string;
  /** Pre-encoded auth header */
  auth?: string;
  /** xAPI version (default 1.0.3) */
  version?: string;
  /** Enable strict validation */
  strictMode?: boolean;
}

/**
 * Response from LRS after sending statements.
 */
export interface LRSResponse {
  success: boolean;
  statementIds?: string[];
  error?: {
    code: number;
    message: string;
  };
}

// =============================================================================
// STATEMENT QUEUE
// =============================================================================

/**
 * Queued statement awaiting sending.
 */
export interface QueuedStatement {
  id: string;
  statement: XAPIStatement;
  attempts: number;
  lastAttempt?: string;
  error?: string;
  priority: 'high' | 'normal' | 'low';
  createdAt: string;
}

/**
 * Configuration for statement queue behavior.
 */
export interface StatementQueueConfig {
  /** Max statements per batch (default 50) */
  maxBatchSize: number;
  /** Auto-flush interval in ms (default 10000) */
  flushInterval: number;
  /** Max retry attempts (default 3) */
  maxRetries: number;
  /** Delay between retries in ms (default 1000) */
  retryDelay: number;
  /** Store statements when offline */
  offlineStorage: boolean;
  /** Max queued statements (default 1000) */
  maxQueueSize: number;
}

// =============================================================================
// TRACKING SESSION
// =============================================================================

/**
 * Active tracking session for a lesson.
 */
export interface TrackingSession {
  /** Session UUID */
  id: string;
  /** Lesson being tracked */
  lessonId: string;
  /** User ID */
  userId: string;
  /** xAPI registration UUID */
  registration: string;

  // Timing
  startedAt: string;
  lastActivityAt: string;
  totalDuration: number;

  // Progress
  currentSlideIndex: number;
  currentSlideId: string;
  completedSlides: string[];
  visitedSlides: string[];

  // Assessment
  quizAttempts: Record<string, QuizAttemptData>;
  questionAttempts: Record<string, QuestionAttemptData>;

  // Score
  totalScore: number;
  maxScore: number;
  scaledScore: number;

  // Status
  status: 'active' | 'suspended' | 'completed' | 'passed' | 'failed';
  completionStatus: boolean;
  successStatus?: boolean;

  // Bookmark
  bookmark?: SessionBookmark;
}

/**
 * Bookmark for session suspend/resume.
 */
export interface SessionBookmark {
  slideId: string;
  slideIndex: number;
  timestamp: number;
  state?: Record<string, unknown>;
}

/**
 * Quiz attempt tracking data.
 */
export interface QuizAttemptData {
  quizId: string;
  attemptNumber: number;
  startedAt: string;
  completedAt?: string;
  score: number;
  maxScore: number;
  scaledScore: number;
  passed: boolean;
  questionIds: string[];
  duration: number;
}

/**
 * Individual question attempt tracking data.
 */
export interface QuestionAttemptData {
  questionId: string;
  questionType: InteractionType;
  attemptNumber: number;
  responses: QuestionResponse[];
  finalResponse?: string;
  finalCorrect?: boolean;
  finalScore: number;
  maxScore: number;
  duration: number;
  hintsUsed: number;
}

/**
 * Individual question response.
 */
export interface QuestionResponse {
  response: string;
  timestamp: string;
  correct: boolean;
  score: number;
}

// =============================================================================
// CMI5 TYPES
// =============================================================================

/**
 * cmi5 launch data structure.
 */
export interface CMI5LaunchData {
  contextTemplate: XAPIContext;
  launchMode: 'Normal' | 'Browse' | 'Review';
  launchMethod: 'OwnWindow' | 'AnyWindow';
  moveOn: 'Passed' | 'Completed' | 'CompletedAndPassed' | 'CompletedOrPassed' | 'NotApplicable';
  masteryScore?: number;
  returnURL?: string;
  entitlementKey?: {
    courseStructure?: string;
    alternate?: string;
  };
}

/**
 * cmi5 session data.
 */
export interface CMI5Session {
  sessionId: string;
  endpoint: string;
  fetch: string;
  actor: XAPIActor;
  registration: string;
  activityId: string;
  launchData: CMI5LaunchData;
}

// =============================================================================
// ANALYTICS TYPES
// =============================================================================

/**
 * Analytics query parameters.
 */
export interface AnalyticsQuery {
  /** Filter by actor */
  actor?: string;
  /** Filter by verb */
  verb?: ExtendedXAPIVerb | ExtendedXAPIVerb[];
  /** Filter by activity */
  activity?: string;
  /** Filter by registration */
  registration?: string;
  /** Start timestamp (ISO 8601) */
  since?: string;
  /** End timestamp (ISO 8601) */
  until?: string;
  /** Max results to return */
  limit?: number;
  /** Ascending order (default false = descending) */
  ascending?: boolean;
}

/**
 * Aggregated analytics result.
 */
export interface AnalyticsResult {
  /** Total statements matching query */
  totalStatements: number;
  /** Unique actors */
  uniqueActors: number;
  /** Verb distribution */
  verbCounts: Record<string, number>;
  /** Activity distribution */
  activityCounts: Record<string, number>;
  /** Time series data */
  timeSeriesData?: TimeSeriesPoint[];
  /** Score statistics */
  scoreStats?: ScoreStatistics;
  /** Completion statistics */
  completionStats?: CompletionStatistics;
}

/**
 * Time series data point.
 */
export interface TimeSeriesPoint {
  timestamp: string;
  count: number;
  verb?: string;
}

/**
 * Score statistics.
 */
export interface ScoreStatistics {
  count: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  standardDeviation: number;
  distribution: ScoreDistributionBucket[];
}

/**
 * Score distribution bucket.
 */
export interface ScoreDistributionBucket {
  rangeStart: number;
  rangeEnd: number;
  count: number;
  percentage: number;
}

/**
 * Completion statistics.
 */
export interface CompletionStatistics {
  totalAttempts: number;
  completedCount: number;
  completionRate: number;
  passedCount: number;
  passRate: number;
  averageAttempts: number;
  averageDuration: number;
}

// =============================================================================
// LEARNER PROGRESS
// =============================================================================

/**
 * Learner progress for a course/lesson.
 */
export interface LearnerProgress {
  userId: string;
  courseId?: string;
  lessonId: string;
  registration: string;

  // Progress metrics
  progressPercentage: number;
  completedActivities: string[];
  totalActivities: number;

  // Time tracking
  firstAccessed: string;
  lastAccessed: string;
  totalTimeSpent: number;

  // Score
  currentScore: number;
  maxPossibleScore: number;
  scaledScore: number;

  // Status
  completionStatus: 'not-started' | 'in-progress' | 'completed';
  successStatus: 'unknown' | 'passed' | 'failed';

  // Attempts
  attemptCount: number;
  currentAttempt: number;
}

/**
 * Activity state for suspend/resume.
 */
export interface ActivityState {
  activityId: string;
  stateId: string;
  agent: XAPIActor;
  registration?: string;
  document: Record<string, unknown>;
  updatedAt: string;
}

// =============================================================================
// XAPI PROVIDER CONTEXT
// =============================================================================

/**
 * xAPI Provider configuration options.
 */
export interface XAPIProviderConfig {
  /** LRS configuration */
  lrsConfig?: LRSConfig;
  /** Statement queue configuration */
  queueConfig?: Partial<StatementQueueConfig>;
  /** Platform identifier */
  platform?: string;
  /** Language code */
  language?: string;
  /** Auto-track page views */
  autoTrackPageViews?: boolean;
  /** Auto-track session lifecycle */
  autoTrackLifecycle?: boolean;
  /** Debug mode - log statements to console */
  debug?: boolean;
}

/**
 * xAPI event callback data.
 */
export interface XAPIEventData {
  verb: ExtendedXAPIVerb;
  objectId: string;
  objectName?: string;
  result?: Partial<XAPIResult>;
  context?: Partial<XAPIContext>;
  extensions?: Record<string, unknown>;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Statement with guaranteed ID (after being processed).
 */
export interface ProcessedStatement {
  id: string;
  timestamp: string;
  actor: XAPIActor;
  verb: XAPIVerbObject;
  object: XAPIObject;
  result?: XAPIResult;
  context?: XAPIContext;
}

/**
 * Batch send result.
 */
export interface BatchSendResult {
  success: boolean;
  sent: number;
  failed: number;
  errors: Array<{ statementId: string; error: string }>;
}

/**
 * Queue status information.
 */
export interface QueueStatus {
  length: number;
  pending: number;
  failed: number;
  isOnline: boolean;
  isFlushing: boolean;
}
