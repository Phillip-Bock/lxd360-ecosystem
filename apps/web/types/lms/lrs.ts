/**
 * Learning Record Store (LRS) and xAPI type definitions
 * Full xAPI 1.0.3 specification implementation
 */

// ============================================
// xAPI Core Types
// ============================================

export interface xAPIStatement {
  id: string;
  actor: xAPIActor;
  verb: xAPIVerb;
  object: xAPIObject;
  result?: xAPIResult;
  context?: xAPIContext;
  timestamp: string;
  stored: string;
  authority: xAPIActor;
  version?: string;
  attachments?: xAPIAttachment[];
}

export interface xAPIActor {
  objectType?: 'Agent' | 'Group';
  name?: string;
  mbox?: string;
  mbox_sha1sum?: string;
  openid?: string;
  account?: xAPIAccount;
  member?: xAPIActor[]; // For Group only
}

export interface xAPIAccount {
  homePage: string;
  name: string;
}

export interface xAPIVerb {
  id: string; // IRI
  display: LanguageMap;
}

export type LanguageMap = Record<string, string>;

export type xAPIObject = xAPIActivity | xAPIActor | xAPIStatementRef | xAPISubStatement;

export interface xAPIActivity {
  objectType?: 'Activity';
  id: string; // IRI
  definition?: xAPIActivityDefinition;
}

export interface xAPIActivityDefinition {
  name?: LanguageMap;
  description?: LanguageMap;
  type?: string; // IRI
  moreInfo?: string; // IRI
  extensions?: Record<string, unknown>;
  interactionType?: xAPIInteractionType;
  correctResponsesPattern?: string[];
  choices?: xAPIInteractionComponent[];
  scale?: xAPIInteractionComponent[];
  source?: xAPIInteractionComponent[];
  target?: xAPIInteractionComponent[];
  steps?: xAPIInteractionComponent[];
}

export type xAPIInteractionType =
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

export interface xAPIInteractionComponent {
  id: string;
  description?: LanguageMap;
}

export interface xAPIStatementRef {
  objectType: 'StatementRef';
  id: string;
}

export interface xAPISubStatement {
  objectType: 'SubStatement';
  actor: xAPIActor;
  verb: xAPIVerb;
  object: xAPIActivity | xAPIActor | xAPIStatementRef;
  result?: xAPIResult;
  context?: xAPIContext;
  timestamp?: string;
  attachments?: xAPIAttachment[];
}

export interface xAPIResult {
  score?: xAPIScore;
  success?: boolean;
  completion?: boolean;
  response?: string;
  duration?: string; // ISO 8601 duration
  extensions?: Record<string, unknown>;
}

export interface xAPIScore {
  scaled?: number; // -1 to 1
  raw?: number;
  min?: number;
  max?: number;
}

export interface xAPIContext {
  registration?: string; // UUID
  instructor?: xAPIActor;
  team?: xAPIActor;
  contextActivities?: xAPIContextActivities;
  revision?: string;
  platform?: string;
  language?: string;
  statement?: xAPIStatementRef;
  extensions?: Record<string, unknown>;
}

export interface xAPIContextActivities {
  parent?: xAPIActivity[];
  grouping?: xAPIActivity[];
  category?: xAPIActivity[];
  other?: xAPIActivity[];
}

export interface xAPIAttachment {
  usageType: string; // IRI
  display: LanguageMap;
  description?: LanguageMap;
  contentType: string;
  length: number;
  sha2: string;
  fileUrl?: string;
}

// ============================================
// LRS-Specific Types
// ============================================

export interface LRSDashboard {
  overview: {
    totalStatements: number;
    statementsToday: number;
    statementsThisWeek: number;
    activeAgents: number;
    activeActivities: number;
    verbsUsed: number;
  };
  trends: {
    date: string;
    count: number;
  }[];
  verbDistribution: {
    verbId: string;
    verbName: string;
    count: number;
    percentage: number;
  }[];
  topActivities: {
    activityId: string;
    activityName: string;
    statementCount: number;
    uniqueActors: number;
  }[];
  topAgents: {
    agentId: string;
    agentName: string;
    statementCount: number;
    lastActive: string;
  }[];
}

export interface StatementQuery {
  statementId?: string;
  voidedStatementId?: string;
  agent?: xAPIActor;
  verb?: string;
  activity?: string;
  registration?: string;
  related_activities?: boolean;
  related_agents?: boolean;
  since?: string;
  until?: string;
  limit?: number;
  format?: 'ids' | 'exact' | 'canonical';
  attachments?: boolean;
  ascending?: boolean;
}

export interface StatementQueryResult {
  statements: xAPIStatement[];
  more?: string; // URL for next page
}

export interface LRSState {
  stateId: string;
  activityId: string;
  agent: xAPIActor;
  registration?: string;
  content: unknown;
  contentType: string;
  etag?: string;
  updated: string;
}

export interface LRSActivityProfile {
  profileId: string;
  activityId: string;
  content: unknown;
  contentType: string;
  etag?: string;
  updated: string;
}

export interface LRSAgentProfile {
  profileId: string;
  agent: xAPIActor;
  content: unknown;
  contentType: string;
  etag?: string;
  updated: string;
}

// ============================================
// xAPI Vocabulary (Common Verbs)
// ============================================

export const XAPI_VERBS = {
  // ADL Verbs
  launched: 'http://adlnet.gov/expapi/verbs/launched',
  initialized: 'http://adlnet.gov/expapi/verbs/initialized',
  attempted: 'http://adlnet.gov/expapi/verbs/attempted',
  completed: 'http://adlnet.gov/expapi/verbs/completed',
  passed: 'http://adlnet.gov/expapi/verbs/passed',
  failed: 'http://adlnet.gov/expapi/verbs/failed',
  answered: 'http://adlnet.gov/expapi/verbs/answered',
  experienced: 'http://adlnet.gov/expapi/verbs/experienced',
  interacted: 'http://adlnet.gov/expapi/verbs/interacted',
  progressed: 'http://adlnet.gov/expapi/verbs/progressed',
  scored: 'http://adlnet.gov/expapi/verbs/scored',
  suspended: 'http://adlnet.gov/expapi/verbs/suspended',
  resumed: 'http://adlnet.gov/expapi/verbs/resumed',
  terminated: 'http://adlnet.gov/expapi/verbs/terminated',
  exited: 'http://adlnet.gov/expapi/verbs/exited',

  // Activity Stream Verbs
  asked: 'http://activitystrea.ms/schema/1.0/ask',
  shared: 'http://activitystrea.ms/schema/1.0/share',
  commented: 'http://activitystrea.ms/schema/1.0/comment',

  // TinCan Verbs
  earned: 'http://id.tincanapi.com/verb/earned',
  viewed: 'http://id.tincanapi.com/verb/viewed',
  downloaded: 'http://id.tincanapi.com/verb/downloaded',
  rated: 'http://id.tincanapi.com/verb/rated',

  // LXD360-Specific Verbs
  mastered: 'https://lxd360.com/xapi/verbs/mastered',
  struggled: 'https://lxd360.com/xapi/verbs/struggled',
  reviewed: 'https://lxd360.com/xapi/verbs/reviewed',
  skipped: 'https://lxd360.com/xapi/verbs/skipped',
  bookmarked: 'https://lxd360.com/xapi/verbs/bookmarked',
  noted: 'https://lxd360.com/xapi/verbs/noted',
  highlighted: 'https://lxd360.com/xapi/verbs/highlighted',
  practiced: 'https://lxd360.com/xapi/verbs/practiced',
  reflected: 'https://lxd360.com/xapi/verbs/reflected',
  integrated: 'https://lxd360.com/xapi/verbs/integrated',
  enrolled: 'https://lxd360.com/xapi/verbs/enrolled',
  unenrolled: 'https://lxd360.com/xapi/verbs/unenrolled',
} as const;

// ============================================
// xAPI Activity Types
// ============================================

export const XAPI_ACTIVITY_TYPES = {
  // ADL Activity Types
  course: 'http://adlnet.gov/expapi/activities/course',
  module: 'http://adlnet.gov/expapi/activities/module',
  assessment: 'http://adlnet.gov/expapi/activities/assessment',
  question: 'http://adlnet.gov/expapi/activities/question',
  interaction: 'http://adlnet.gov/expapi/activities/interaction',
  lesson: 'http://adlnet.gov/expapi/activities/lesson',
  media: 'http://adlnet.gov/expapi/activities/media',
  simulation: 'http://adlnet.gov/expapi/activities/simulation',

  // TinCan Activity Types
  video: 'http://id.tincanapi.com/activitytype/video',
  audio: 'http://id.tincanapi.com/activitytype/audio',
  article: 'http://id.tincanapi.com/activitytype/article',
  book: 'http://id.tincanapi.com/activitytype/book',
  document: 'http://id.tincanapi.com/activitytype/document',
  slideshow: 'http://id.tincanapi.com/activitytype/slideshow',
  webinar: 'http://id.tincanapi.com/activitytype/webinar',
  discussion: 'http://id.tincanapi.com/activitytype/discussion',

  // LXD360-Specific Activity Types
  learningPath: 'https://lxd360.com/xapi/activities/learning-path',
  skill: 'https://lxd360.com/xapi/activities/skill',
  badge: 'https://lxd360.com/xapi/activities/badge',
  certificate: 'https://lxd360.com/xapi/activities/certificate',
  compliance: 'https://lxd360.com/xapi/activities/compliance',
  practice: 'https://lxd360.com/xapi/activities/practice',
  reflection: 'https://lxd360.com/xapi/activities/reflection',
  scenario: 'https://lxd360.com/xapi/activities/scenario',
} as const;

// ============================================
// LRS Extensions (Custom LXD360)
// ============================================

export const XAPI_EXTENSIONS = {
  // Context Extensions
  sessionId: 'https://lxd360.com/xapi/extensions/session-id',
  device: 'https://lxd360.com/xapi/extensions/device',
  browser: 'https://lxd360.com/xapi/extensions/browser',
  location: 'https://lxd360.com/xapi/extensions/location',
  inspireStage: 'https://lxd360.com/xapi/extensions/inspire-stage',

  // Result Extensions
  cognitiveLoad: 'https://lxd360.com/xapi/extensions/cognitive-load',
  confidenceLevel: 'https://lxd360.com/xapi/extensions/confidence-level',
  masteryLevel: 'https://lxd360.com/xapi/extensions/mastery-level',
  attemptCount: 'https://lxd360.com/xapi/extensions/attempt-count',
  timeOnTask: 'https://lxd360.com/xapi/extensions/time-on-task',

  // Activity Extensions
  difficulty: 'https://lxd360.com/xapi/extensions/difficulty',
  prerequisites: 'https://lxd360.com/xapi/extensions/prerequisites',
  skills: 'https://lxd360.com/xapi/extensions/skills',
  tags: 'https://lxd360.com/xapi/extensions/tags',
} as const;

// ============================================
// LRS Admin Types
// ============================================

export interface LRSCredentials {
  id: string;
  name: string;
  key: string;
  secret: string;
  permissions: LRSPermission[];
  scopes: string[];
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
  isActive: boolean;
}

export type LRSPermission =
  | 'statements/read'
  | 'statements/write'
  | 'state/read'
  | 'state/write'
  | 'profile/read'
  | 'profile/write'
  | 'all/read'
  | 'all';

export interface LRSExport {
  id: string;
  name: string;
  format: 'json' | 'csv' | 'xlsx';
  query: StatementQuery;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileUrl?: string;
  fileSize?: number;
  statementCount?: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface LRSWebhook {
  id: string;
  name: string;
  url: string;
  events: LRSWebhookEvent[];
  filters?: {
    verbs?: string[];
    activities?: string[];
    agents?: string[];
  };
  headers?: Record<string, string>;
  secret?: string;
  isActive: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
  triggerCount: number;
  errorCount: number;
}

export type LRSWebhookEvent =
  | 'statement.created'
  | 'statement.voided'
  | 'state.updated'
  | 'profile.updated';

// ============================================
// Cognitive Insights (LXD360 Extension)
// ============================================

export interface CognitiveLoadMetrics {
  learnerId: string;
  sessionId: string;
  timestamp: string;
  // Real-time metrics
  currentLoad: number; // 0-100
  intrinsicLoad: number;
  extraneousLoad: number;
  germaneLoad: number;
  // Signals
  pauseFrequency: number;
  rewindFrequency: number;
  notesTaken: number;
  timeOnContent: number;
  expectedTime: number;
  // Assessment
  loadLevel: 'low' | 'optimal' | 'high' | 'overload';
  recommendBreak: boolean;
  interventionSuggested: boolean;
}

export interface LearningVelocity {
  learnerId: string;
  courseId: string;
  // Speed metrics
  averageTimePerLesson: number;
  expectedTimePerLesson: number;
  speedRatio: number; // < 1 = slower, > 1 = faster
  // Mastery metrics
  masteryGainRate: number;
  retentionRate: number;
  // Predictions
  estimatedCompletion: string;
  predictedScore: number;
  struggleProbability: number;
}

export interface AdaptiveRecommendation {
  id: string;
  learnerId: string;
  type: 'content' | 'pace' | 'difficulty' | 'review' | 'break';
  priority: 'low' | 'medium' | 'high';
  recommendation: string;
  reason: string;
  // Content
  suggestedContent?: {
    type: 'course' | 'lesson' | 'resource';
    id: string;
    title: string;
  };
  // Status
  status: 'pending' | 'shown' | 'accepted' | 'dismissed';
  createdAt: string;
  respondedAt?: string;
}
