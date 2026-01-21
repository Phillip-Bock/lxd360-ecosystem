// ============================================================================
// CORE XAPI TYPES - Per ADL xAPI 1.0.3 Specification
// ============================================================================

/**
 * Language map for internationalized strings
 * Keys are RFC 5646 language tags
 */
export type LanguageMap = Record<string, string>;

/**
 * Extension map for custom data
 * Keys are IRIs (Internationalized Resource Identifiers)
 */
export type Extensions = Record<string, unknown>;

/**
 * ISO 8601 duration format (e.g., "PT1H30M")
 */
export type Duration = string;

/**
 * ISO 8601 timestamp format
 */
export type Timestamp = string;

/**
 * UUID v4 format
 */
export type UUID = string;

/**
 * IRI format for identifiers
 */
export type IRI = string;

/**
 * Mailto IRI format (e.g., "mailto:user@example.com")
 */
export type MailtoIRI = `mailto:${string}`;

// ============================================================================
// ACTOR TYPES
// ============================================================================

/**
 * Account identifier for non-email-based identification
 */
export interface Account {
  /** Homepage of the account provider */
  homePage: IRI;
  /** Unique account name/identifier */
  name: string;
}

/**
 * Agent object type - represents a single individual
 */
export type AgentObjectType = 'Agent';

/**
 * Group object type - represents multiple individuals
 */
export type GroupObjectType = 'Group';

/**
 * Base agent properties (must have exactly one identifier)
 */
interface BaseAgent {
  /** Optional display name */
  name?: string;
}

/**
 * Agent identified by email
 */
export interface AgentWithMbox extends BaseAgent {
  objectType?: AgentObjectType;
  mbox: MailtoIRI;
  mbox_sha1sum?: never;
  openid?: never;
  account?: never;
}

/**
 * Agent identified by SHA1 hash of email
 */
export interface AgentWithMboxSha1sum extends BaseAgent {
  objectType?: AgentObjectType;
  mbox?: never;
  mbox_sha1sum: string;
  openid?: never;
  account?: never;
}

/**
 * Agent identified by OpenID
 */
export interface AgentWithOpenid extends BaseAgent {
  objectType?: AgentObjectType;
  mbox?: never;
  mbox_sha1sum?: never;
  openid: IRI;
  account?: never;
}

/**
 * Agent identified by account
 */
export interface AgentWithAccount extends BaseAgent {
  objectType?: AgentObjectType;
  mbox?: never;
  mbox_sha1sum?: never;
  openid?: never;
  account: Account;
}

/**
 * Agent - represents an individual Actor
 */
export type Agent = AgentWithMbox | AgentWithMboxSha1sum | AgentWithOpenid | AgentWithAccount;

/**
 * Identified Group - has its own identifier
 */
export interface IdentifiedGroup {
  objectType: GroupObjectType;
  name?: string;
  member?: Agent[];
  mbox?: MailtoIRI;
  mbox_sha1sum?: string;
  openid?: IRI;
  account?: Account;
}

/**
 * Anonymous Group - identified only by members
 */
export interface AnonymousGroup {
  objectType: GroupObjectType;
  name?: string;
  member: Agent[];
  mbox?: never;
  mbox_sha1sum?: never;
  openid?: never;
  account?: never;
}

/**
 * Group - represents multiple individuals
 */
export type Group = IdentifiedGroup | AnonymousGroup;

/**
 * Actor - can be either Agent or Group
 */
export type Actor = Agent | Group;

// ============================================================================
// VERB TYPES
// ============================================================================

/**
 * Verb definition in xAPI statement
 */
export interface Verb {
  /** IRI identifying the verb */
  id: IRI;
  /** Human-readable display names by language */
  display?: LanguageMap;
}

/**
 * Standard ADL verbs used in LXP360
 */
export const ADL_VERBS = {
  // Experience verbs
  EXPERIENCED: 'http://adlnet.gov/expapi/verbs/experienced',
  ATTENDED: 'http://adlnet.gov/expapi/verbs/attended',
  LAUNCHED: 'http://adlnet.gov/expapi/verbs/launched',

  // Progression verbs
  PROGRESSED: 'http://adlnet.gov/expapi/verbs/progressed',
  COMPLETED: 'http://adlnet.gov/expapi/verbs/completed',
  MASTERED: 'http://adlnet.gov/expapi/verbs/mastered',

  // Assessment verbs
  ANSWERED: 'http://adlnet.gov/expapi/verbs/answered',
  PASSED: 'http://adlnet.gov/expapi/verbs/passed',
  FAILED: 'http://adlnet.gov/expapi/verbs/failed',
  SCORED: 'http://adlnet.gov/expapi/verbs/scored',

  // Interaction verbs
  INTERACTED: 'http://adlnet.gov/expapi/verbs/interacted',
  ATTEMPTED: 'http://adlnet.gov/expapi/verbs/attempted',
  INITIALIZED: 'http://adlnet.gov/expapi/verbs/initialized',
  TERMINATED: 'http://adlnet.gov/expapi/verbs/terminated',
  SUSPENDED: 'http://adlnet.gov/expapi/verbs/suspended',
  RESUMED: 'http://adlnet.gov/expapi/verbs/resumed',

  // Media verbs
  PLAYED: 'https://w3id.org/xapi/video/verbs/played',
  PAUSED: 'https://w3id.org/xapi/video/verbs/paused',
  SEEKED: 'https://w3id.org/xapi/video/verbs/seeked',

  // Social verbs
  SHARED: 'http://adlnet.gov/expapi/verbs/shared',
  COMMENTED: 'http://adlnet.gov/expapi/verbs/commented',
  LIKED: 'http://activitystrea.ms/schema/1.0/like',
  ASKED: 'http://adlnet.gov/expapi/verbs/asked',

  // State verbs
  VOIDED: 'http://adlnet.gov/expapi/verbs/voided',
  REGISTERED: 'http://adlnet.gov/expapi/verbs/registered',
  UNREGISTERED: 'http://adlnet.gov/expapi/verbs/unregistered',
} as const;

export type ADLVerbId = (typeof ADL_VERBS)[keyof typeof ADL_VERBS];

// ============================================================================
// OBJECT/ACTIVITY TYPES
// ============================================================================

/**
 * Interaction types supported in xAPI
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

/**
 * Interaction component for choice/matching/sequencing
 */
export interface InteractionComponent {
  /** Unique identifier within the interaction */
  id: string;
  /** Human-readable description */
  description?: LanguageMap;
}

/**
 * Activity definition
 */
export interface ActivityDefinition {
  /** Human-readable name */
  name?: LanguageMap;
  /** Human-readable description */
  description?: LanguageMap;
  /** Activity type IRI */
  type?: IRI;
  /** URL for more information */
  moreInfo?: IRI;
  /** Interaction type (for assessments) */
  interactionType?: InteractionType;
  /** Correct response patterns */
  correctResponsesPattern?: string[];
  /** Available choices */
  choices?: InteractionComponent[];
  /** Scale items (for Likert) */
  scale?: InteractionComponent[];
  /** Source items (for matching) */
  source?: InteractionComponent[];
  /** Target items (for matching) */
  target?: InteractionComponent[];
  /** Steps (for sequencing) */
  steps?: InteractionComponent[];
  /** Custom extensions */
  extensions?: Extensions;
}

/**
 * Activity object
 */
export interface Activity {
  objectType?: 'Activity';
  /** Activity IRI - unique identifier */
  id: IRI;
  /** Activity definition */
  definition?: ActivityDefinition;
}

/**
 * Statement reference - points to another statement
 */
export interface StatementRef {
  objectType: 'StatementRef';
  /** UUID of referenced statement */
  id: UUID;
}

/**
 * Sub-statement - statement within a statement (cannot contain another sub-statement)
 */
export interface SubStatement {
  objectType: 'SubStatement';
  actor: Actor;
  verb: Verb;
  object: Activity | Agent | Group | StatementRef;
  result?: Result;
  context?: Omit<Context, 'statement'>;
  timestamp?: Timestamp;
  attachments?: Attachment[];
}

/**
 * Statement object - what the action was performed on
 */
export type StatementObject = Activity | Agent | Group | StatementRef | SubStatement;

// ============================================================================
// RESULT TYPES
// ============================================================================

/**
 * Score object for assessment results
 */
export interface Score {
  /** Scaled score between -1.0 and 1.0 */
  scaled?: number;
  /** Raw score */
  raw?: number;
  /** Minimum possible score */
  min?: number;
  /** Maximum possible score */
  max?: number;
}

/**
 * Result of the statement's action
 */
export interface Result {
  /** Score achieved */
  score?: Score;
  /** Whether the attempt was successful */
  success?: boolean;
  /** Whether the activity was completed */
  completion?: boolean;
  /** Learner's response (e.g., for fill-in) */
  response?: string;
  /** Time spent (ISO 8601 duration) */
  duration?: Duration;
  /** Custom extensions */
  extensions?: Extensions;
}

// ============================================================================
// CONTEXT TYPES
// ============================================================================

/**
 * Context activities grouping
 */
export interface ContextActivities {
  /** Direct parent activities (e.g., lesson containing a quiz) */
  parent?: Activity[];
  /** Indirect related activities (e.g., course containing the lesson) */
  grouping?: Activity[];
  /** Category of the activity (e.g., tags, competencies) */
  category?: Activity[];
  /** Other related activities */
  other?: Activity[];
}

/**
 * Context for the statement
 */
export interface Context {
  /** Registration UUID - groups related statements */
  registration?: UUID;
  /** Instructor/facilitator */
  instructor?: Agent | Group;
  /** Team/group the actor was part of */
  team?: Group;
  /** Related activities */
  contextActivities?: ContextActivities;
  /** Revision of the activity */
  revision?: string;
  /** Platform used */
  platform?: string;
  /** Language (RFC 5646 tag) */
  language?: string;
  /** Reference to related statement */
  statement?: StatementRef;
  /** Custom extensions */
  extensions?: Extensions;
}

// ============================================================================
// ATTACHMENT TYPES
// ============================================================================

/**
 * Statement attachment
 */
export interface Attachment {
  /** Content-Type of the attachment */
  contentType: string;
  /** SHA-256 hash of the attachment content */
  sha2: string;
  /** Human-readable display name */
  display: LanguageMap;
  /** Description of the attachment */
  description?: LanguageMap;
  /** Size in bytes */
  length: number;
  /** IRI if attachment is at a URL */
  fileUrl?: IRI;
}

// ============================================================================
// COMPLETE STATEMENT TYPE
// ============================================================================

/**
 * Complete xAPI Statement
 */
export interface XAPIStatement {
  /** Statement UUID */
  id?: UUID;
  /** Who performed the action */
  actor: Actor;
  /** What action was performed */
  verb: Verb;
  /** What the action was performed on */
  object: StatementObject;
  /** Outcome of the action */
  result?: Result;
  /** Additional context */
  context?: Context;
  /** When the experience occurred (ISO 8601) */
  timestamp?: Timestamp;
  /** When the statement was stored (set by LRS) */
  stored?: Timestamp;
  /** Who is asserting this statement is true */
  authority?: Agent | Group;
  /** xAPI version (default "1.0.0") */
  version?: string;
  /** Attached files */
  attachments?: Attachment[];
}

// ============================================================================
// LRS QUERY TYPES
// ============================================================================

/**
 * Query parameters for retrieving statements
 */
export interface StatementQuery {
  /** Filter by statement ID */
  statementId?: UUID;
  /** Filter by voided statement ID */
  voidedStatementId?: UUID;
  /** Filter by actor */
  agent?: Agent;
  /** Filter by verb IRI */
  verb?: IRI;
  /** Filter by activity IRI */
  activity?: IRI;
  /** Filter by registration UUID */
  registration?: UUID;
  /** Include related activities in object */
  related_activities?: boolean;
  /** Include related agents in actor */
  related_agents?: boolean;
  /** Filter statements stored after this time */
  since?: Timestamp;
  /** Filter statements stored before this time */
  until?: Timestamp;
  /** Maximum statements to return */
  limit?: number;
  /** Return in ascending order by stored time */
  ascending?: boolean;
  /** Return statements in canonical format */
  format?: 'ids' | 'exact' | 'canonical';
  /** Include attachments in response */
  attachments?: boolean;
}

/**
 * Result of statement query
 */
export interface StatementResult {
  /** Returned statements */
  statements: XAPIStatement[];
  /** IRL for fetching more results (if available) */
  more?: IRI;
}

// ============================================================================
// LXP360 CUSTOM EXTENSIONS
// ============================================================================

/**
 * LXP360 custom extension IRIs
 */
export const LXP360_EXTENSIONS = {
  // Cognitive Load Extensions
  COGNITIVE_LOAD_SCORE: 'http://lxp360.com/extension/cognitive_load_score',
  ATTENTION_SCORE: 'http://lxp360.com/extension/attention_score',
  ENGAGEMENT_LEVEL: 'http://lxp360.com/extension/engagement_level',

  // Assessment Extensions
  LEVENSHTEIN_DISTANCE: 'http://lxp360.com/extension/levenshtein_distance',
  TYPING_SPEED_WPM: 'http://lxp360.com/extension/typing_speed_wpm',
  ERROR_TYPE: 'http://lxp360.com/extension/error_type',
  SPEARMAN_RANK_CORRELATION: 'http://lxp360.com/extension/spearman_rank_correlation',
  PARTIAL_CREDIT_AWARDED: 'http://lxp360.com/extension/partial_credit_awarded',

  // Adaptive Learning Extensions
  RECOMMENDED_LEVEL: 'http://lxp360.com/extension/recommended_level',
  SKILLS_GAP: 'http://lxp360.com/extension/skills_gap',
  CONTENT_SKIPPED: 'http://lxp360.com/extension/content_skipped',
  MASTERY_PROBABILITY: 'http://lxp360.com/extension/mastery_probability',

  // Interaction Extensions
  CLICK_COORDINATES: 'http://lxp360.com/extension/click_coordinates',
  VIEWPORT_SIZE: 'http://lxp360.com/extension/viewport_size',
  DEVICE_TYPE: 'http://lxp360.com/extension/device_type',

  // Session Extensions
  SESSION_ID: 'http://lxp360.com/extension/session_id',
  ORGANIZATION_ID: 'http://lxp360.com/extension/organization_id',
  COURSE_VERSION: 'http://lxp360.com/extension/course_version',
} as const;

/**
 * LXP360 activity types
 */
export const LXP360_ACTIVITY_TYPES = {
  LESSON: 'http://lxp360.com/activity-type/lesson',
  MODULE: 'http://lxp360.com/activity-type/module',
  COURSE: 'http://lxp360.com/activity-type/course',
  PROGRAM: 'http://lxp360.com/activity-type/program',
  ASSESSMENT: 'http://lxp360.com/activity-type/assessment',
  SIMULATION: 'http://lxp360.com/activity-type/simulation',
  XR_EXPERIENCE: 'http://lxp360.com/activity-type/xr-experience',
  VIDEO: 'http://lxp360.com/activity-type/video',
  INTERACTIVE: 'http://lxp360.com/activity-type/interactive',
  DOCUMENT: 'http://lxp360.com/activity-type/document',
  DISCUSSION: 'http://lxp360.com/activity-type/discussion',
  MEETING: 'http://lxp360.com/activity-type/meeting',
} as const;

// ============================================================================
// LEARNING ANALYTICS TYPES
// ============================================================================

/**
 * Mastery levels for learner progress
 */
export type MasteryLevel =
  | 'novice'
  | 'beginner'
  | 'intermediate'
  | 'proficient'
  | 'expert'
  | 'master';

/**
 * Assessment score record
 */
export interface AssessmentScore {
  /** Assessment activity ID */
  assessmentId: string;
  /** Assessment name */
  assessmentName: string;
  /** Scaled score (0-1) */
  scaledScore: number;
  /** Raw score */
  rawScore: number;
  /** Maximum possible score */
  maxScore: number;
  /** Whether passed */
  passed: boolean;
  /** Number of attempts */
  attemptCount: number;
  /** Time spent on assessment */
  duration: Duration;
  /** When completed */
  completedAt: Timestamp;
}

/**
 * Learner progress record
 */
export interface LearnerProgress {
  /** Learner's unique identifier */
  learnerId: string;
  /** Course identifier */
  courseId: string;
  /** Course name */
  courseName: string;
  /** Completion percentage (0-100) */
  completionPercentage: number;
  /** Total time spent in seconds */
  timeSpentSeconds: number;
  /** Last access timestamp */
  lastAccessedAt: Date;
  /** First access timestamp */
  firstAccessedAt: Date;
  /** Assessment scores */
  assessmentScores: AssessmentScore[];
  /** Current mastery level */
  masteryLevel: MasteryLevel;
  /** Bayesian knowledge tracing probability */
  knowledgeProbability: number;
  /** Current module/lesson */
  currentPosition: {
    moduleId: string;
    lessonId: string;
  };
  /** Completed module IDs */
  completedModules: string[];
  /** Completed lesson IDs */
  completedLessons: string[];
}

/**
 * Content analytics aggregate
 */
export interface ContentAnalytics {
  /** Activity ID */
  activityId: string;
  /** Activity name */
  activityName: string;
  /** Activity type */
  activityType: string;
  /** Total views/launches */
  totalViews: number;
  /** Unique learners who accessed */
  uniqueLearners: number;
  /** Average time spent (seconds) */
  avgTimeSpent: number;
  /** Completion rate (0-1) */
  completionRate: number;
  /** Average score (if assessment) */
  avgScore?: number;
  /** Pass rate (if assessment) */
  passRate?: number;
  /** Drop-off rate (0-1) */
  dropOffRate: number;
  /** Engagement score (0-100) */
  engagementScore: number;
  /** Date range for analytics */
  dateRange: {
    start: Date;
    end: Date;
  };
}

/**
 * Organization-level analytics
 */
export interface OrganizationAnalytics {
  /** Organization ID */
  organizationId: string;
  /** Organization name */
  organizationName: string;
  /** Total active learners */
  totalActiveLearners: number;
  /** Total courses */
  totalCourses: number;
  /** Overall completion rate */
  overallCompletionRate: number;
  /** Average engagement score */
  avgEngagementScore: number;
  /** Compliance status */
  complianceStatus: {
    compliant: number;
    nonCompliant: number;
    pending: number;
  };
  /** Training hours this period */
  trainingHours: number;
  /** Top performing courses */
  topCourses: Array<{
    courseId: string;
    courseName: string;
    completionRate: number;
  }>;
  /** Skill gap areas */
  skillGaps: Array<{
    skillName: string;
    gapPercentage: number;
    affectedLearners: number;
  }>;
}

// ============================================================================
// STATEMENT BUILDER TYPES
// ============================================================================

/**
 * Configuration for building xAPI statements
 */
export interface StatementBuilderConfig {
  /** Base IRI for activities */
  activityBaseIri: string;
  /** Platform identifier */
  platform: string;
  /** Default language */
  defaultLanguage: string;
  /** Authority agent */
  authority: Agent;
  /** Organization ID extension */
  organizationId?: string;
}

/**
 * Simplified statement creation parameters
 */
export interface CreateStatementParams {
  /** Learner information */
  learner: {
    id: string;
    email: string;
    name?: string;
  };
  /** Verb to use */
  verb: ADLVerbId | string;
  /** Activity information */
  activity: {
    id: string;
    name: string;
    type: string;
    description?: string;
  };
  /** Result data (optional) */
  result?: Partial<Result>;
  /** Context data (optional) */
  context?: {
    registration?: string;
    parentActivityId?: string;
    groupingActivityIds?: string[];
    extensions?: Extensions;
  };
  /** Custom timestamp (defaults to now) */
  timestamp?: Date;
}

// ============================================================================
// TYPE GUARDS & HELPERS
// ============================================================================

/**
 * Type guard for Agent vs Group
 */
export function isAgent(actor: Actor): actor is Agent {
  return actor.objectType !== 'Group';
}

/**
 * Type guard for Group
 */
export function isGroup(actor: Actor): actor is Group {
  return actor.objectType === 'Group';
}

/**
 * Type guard for Activity object
 */
export function isActivity(obj: StatementObject): obj is Activity {
  return obj.objectType === 'Activity' || obj.objectType === undefined;
}

/**
 * Type guard for StatementRef
 */
export function isStatementRef(obj: StatementObject): obj is StatementRef {
  return obj.objectType === 'StatementRef';
}

/**
 * Type guard for SubStatement
 */
export function isSubStatement(obj: StatementObject): obj is SubStatement {
  return obj.objectType === 'SubStatement';
}

/**
 * Create a verb object from an IRI
 */
export function createVerb(id: IRI, displayName?: string): Verb {
  const verb: Verb = { id };
  if (displayName) {
    verb.display = { 'en-US': displayName };
  }
  return verb;
}

/**
 * Create an agent from email
 */
export function createAgentFromEmail(email: string, name?: string): AgentWithMbox {
  const agent: AgentWithMbox = {
    mbox: `mailto:${email}` as MailtoIRI,
  };
  if (name) {
    agent.name = name;
  }
  return agent;
}

/**
 * Create an agent from account
 */
export function createAgentFromAccount(
  homePage: string,
  accountName: string,
  name?: string,
): AgentWithAccount {
  const agent: AgentWithAccount = {
    account: { homePage, name: accountName },
  };
  if (name) {
    agent.name = name;
  }
  return agent;
}

/**
 * Parse ISO 8601 duration to seconds
 */
export function parseDurationToSeconds(duration: Duration): number {
  const match = duration.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/);
  if (!match) return 0;

  const days = parseInt(match[1] || '0', 10);
  const hours = parseInt(match[2] || '0', 10);
  const minutes = parseInt(match[3] || '0', 10);
  const seconds = parseFloat(match[4] || '0');

  return days * 86400 + hours * 3600 + minutes * 60 + seconds;
}

/**
 * Format seconds to ISO 8601 duration
 */
export function formatSecondsToDuration(totalSeconds: number): Duration {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.round(totalSeconds % 60);

  let duration = 'PT';
  if (hours > 0) duration += `${hours}H`;
  if (minutes > 0) duration += `${minutes}M`;
  if (seconds > 0 || duration === 'PT') duration += `${seconds}S`;

  return duration;
}

// ============================================================================
// XAPI TYPE ALIASES (for xapi-templates.ts compatibility)
// ============================================================================

/**
 * XAPIActor type alias for cross-module compatibility
 * Note: XAPIStatement is already defined above in COMPLETE STATEMENT TYPE section
 */
export type XAPIActor = Agent & {
  objectType?: 'Agent';
};

/**
 * XAPIObject type alias for xapi-templates.ts
 */
export type XAPIObject = Activity;

/**
 * XAPIResult type alias for xapi-templates.ts
 */
export type XAPIResult = Result;

/**
 * XAPIContext type alias for xapi-templates.ts
 */
export type XAPIContext = Context;

/**
 * XAPIVerb type - keys for verbs used in xapi-templates
 */
export type XAPIVerb =
  | 'experienced'
  | 'interacted'
  | 'answered'
  | 'passed'
  | 'failed'
  | 'completed'
  | 'played'
  | 'paused'
  | 'seeked'
  | 'progressed'
  | 'asked'
  | 'attempted'
  | 'scored';

/**
 * XAPIVerbObject - the verb object structure
 */
export interface XAPIVerbObject {
  id: IRI;
  display: LanguageMap;
}

/**
 * xAPI Verb IRI constants
 */
export const XAPI_VERB_IRIS: Record<XAPIVerb, IRI> = {
  experienced: 'http://adlnet.gov/expapi/verbs/experienced',
  interacted: 'http://adlnet.gov/expapi/verbs/interacted',
  answered: 'http://adlnet.gov/expapi/verbs/answered',
  passed: 'http://adlnet.gov/expapi/verbs/passed',
  failed: 'http://adlnet.gov/expapi/verbs/failed',
  completed: 'http://adlnet.gov/expapi/verbs/completed',
  played: 'https://w3id.org/xapi/video/verbs/played',
  paused: 'https://w3id.org/xapi/video/verbs/paused',
  seeked: 'https://w3id.org/xapi/video/verbs/seeked',
  progressed: 'http://adlnet.gov/expapi/verbs/progressed',
  asked: 'http://adlnet.gov/expapi/verbs/asked',
  attempted: 'http://adlnet.gov/expapi/verbs/attempted',
  scored: 'http://adlnet.gov/expapi/verbs/scored',
};

/**
 * Extended verb IRIs including lifecycle verbs for analytics-service
 */
export const EXTENDED_VERB_IRIS = {
  ...XAPI_VERB_IRIS,
  initialized: 'http://adlnet.gov/expapi/verbs/initialized',
  terminated: 'http://adlnet.gov/expapi/verbs/terminated',
  suspended: 'http://adlnet.gov/expapi/verbs/suspended',
  resumed: 'http://adlnet.gov/expapi/verbs/resumed',
  launched: 'http://adlnet.gov/expapi/verbs/launched',
  mastered: 'http://adlnet.gov/expapi/verbs/mastered',
  // Social verbs
  commented: 'http://adlnet.gov/expapi/verbs/commented',
  shared: 'http://adlnet.gov/expapi/verbs/shared',
  liked: 'http://activitystrea.ms/schema/1.0/like',
  // Navigation verbs
  exited: 'http://adlnet.gov/expapi/verbs/exited',
  skipped: 'http://id.tincanapi.com/verb/skipped',
  // cmi5 verbs
  satisfied: 'https://w3id.org/xapi/adl/verbs/satisfied',
  waived: 'https://w3id.org/xapi/adl/verbs/waived',
} as const;

export type ExtendedXAPIVerb = keyof typeof EXTENDED_VERB_IRIS;

// ============================================================================
// LRS CLIENT TYPES
// ============================================================================

/**
 * LRS Configuration
 */
export interface LRSConfig {
  /** LRS endpoint URL */
  endpoint: string;
  /** Authorization header value */
  auth?: string;
  /** Username for basic auth */
  username?: string;
  /** Password for basic auth */
  password?: string;
  /** xAPI version */
  version?: string;
}

/**
 * LRS Response
 */
export interface LRSResponse {
  success: boolean;
  statementIds?: string[];
  error?: {
    code: number;
    message: string;
  };
}

/**
 * Queued statement for offline storage
 */
export interface QueuedStatement {
  id: string;
  statement: XAPIStatement;
  attempts: number;
  priority: 'high' | 'normal' | 'low';
  createdAt: string;
  lastAttempt?: string;
  error?: string;
}

/**
 * Queue status
 */
export interface QueueStatus {
  length: number;
  pending: number;
  failed: number;
  isOnline: boolean;
  isFlushing: boolean;
}

/**
 * Statement queue configuration
 */
export interface StatementQueueConfig {
  maxBatchSize: number;
  flushInterval: number;
  maxRetries: number;
  retryDelay: number;
  offlineStorage: boolean;
  maxQueueSize: number;
}

/**
 * Batch send result
 */
export interface BatchSendResult {
  success: boolean;
  sent: number;
  failed: number;
  errors: Array<{
    statementId: string;
    error: string;
  }>;
}

/**
 * Internal tracking configuration (Firestore)
 */
export interface InternalTrackingConfig {
  mode: 'internal';
  organizationId: string;
  sessionId?: string;
  enableBigQuerySync?: boolean;
}

/**
 * External tracking configuration (LRS)
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
 * Tracking configuration union type
 */
export type TrackingConfig = InternalTrackingConfig | ExternalTrackingConfig;

// ============================================================================
// ANALYTICS SERVICE TYPES
// ============================================================================

/**
 * Analytics query parameters
 */
export interface AnalyticsQuery {
  actor?: string;
  verb?: ExtendedXAPIVerb | ExtendedXAPIVerb[];
  activity?: string;
  registration?: string;
  since?: string;
  until?: string;
  limit?: number;
  ascending?: boolean;
}

/**
 * Analytics result aggregate
 */
export interface AnalyticsResult {
  totalStatements: number;
  uniqueActors: number;
  verbCounts: Record<string, number>;
  activityCounts: Record<string, number>;
  scoreStats?: ScoreStatistics;
}

/**
 * Score statistics
 */
export interface ScoreStatistics {
  count: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  standardDeviation: number;
  distribution: Array<{
    rangeStart: number;
    rangeEnd: number;
    count: number;
    percentage: number;
  }>;
}

/**
 * Completion statistics
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

/**
 * Time series data point
 */
export interface TimeSeriesPoint {
  timestamp: string;
  count: number;
  verb?: string;
}

// ============================================================================
// XAPI PROVIDER TYPES
// ============================================================================

/**
 * Tracking session state
 */
export interface TrackingSession {
  id: string;
  lessonId: string;
  userId: string;
  registration: string;

  startedAt: string;
  lastActivityAt: string;
  totalDuration: number;

  currentSlideIndex: number;
  currentSlideId: string;
  completedSlides: string[];
  visitedSlides: string[];

  quizAttempts: Record<string, QuizAttempt>;
  questionAttempts: Record<string, QuestionAttempt>;

  totalScore: number;
  maxScore: number;
  scaledScore: number;

  status: 'active' | 'suspended' | 'completed' | 'passed' | 'failed';
  completionStatus: boolean;
  successStatus?: boolean;

  bookmark?: {
    slideId: string;
    slideIndex: number;
    timestamp: number;
    state?: Record<string, unknown>;
  };
}

/**
 * Quiz attempt tracking
 */
export interface QuizAttempt {
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
 * Question attempt tracking
 */
export interface QuestionAttempt {
  questionId: string;
  questionType: InteractionType;
  attemptNumber: number;
  responses: Array<{
    response: string;
    timestamp: string;
    correct: boolean;
    score: number;
  }>;
  finalResponse: string;
  finalCorrect: boolean;
  finalScore: number;
  maxScore: number;
  duration: number;
  hintsUsed: number;
}

/**
 * xAPI Provider configuration
 */
export interface XAPIProviderConfig {
  debug?: boolean;
  platform?: string;
  language?: string;
  queueConfig?: Partial<StatementQueueConfig>;
}
