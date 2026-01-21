import { z } from 'zod';

// ============================================================================
// LANGUAGE MAP
// ============================================================================

export const LanguageMapSchema = z.record(z.string());
export type LanguageMap = z.infer<typeof LanguageMapSchema>;

// ============================================================================
// ACTOR (Agent or Group)
// ============================================================================

export const AccountSchema = z.object({
  homePage: z.string().url(),
  name: z.string(),
});
export type Account = z.infer<typeof AccountSchema>;

/**
 * xAPI Agent schema with IFI (Inverse Functional Identifier) validation.
 * Per xAPI spec, an Agent MUST have exactly one IFI.
 */
export const AgentSchema = z
  .object({
    objectType: z.literal('Agent').default('Agent'),
    name: z.string().optional(),
    mbox: z.string().optional(),
    mbox_sha1sum: z.string().optional(),
    openid: z.string().url().optional(),
    account: AccountSchema.optional(),
  })
  .refine(
    (agent) => {
      // Count how many IFIs are present
      const ifiCount = [agent.mbox, agent.mbox_sha1sum, agent.openid, agent.account].filter(
        Boolean,
      ).length;
      // Agent must have exactly one IFI (or none for anonymous)
      return ifiCount <= 1;
    },
    {
      message:
        'Agent must have at most one Inverse Functional Identifier (mbox, mbox_sha1sum, openid, or account)',
    },
  );
export type Agent = z.infer<typeof AgentSchema>;

export const GroupSchema = z.object({
  objectType: z.literal('Group'),
  name: z.string().optional(),
  mbox: z.string().optional(),
  mbox_sha1sum: z.string().optional(),
  openid: z.string().url().optional(),
  account: AccountSchema.optional(),
  member: z.array(AgentSchema).optional(),
});
export type Group = z.infer<typeof GroupSchema>;

export const ActorSchema = z.union([AgentSchema, GroupSchema]);
export type Actor = z.infer<typeof ActorSchema>;

// ============================================================================
// VERB
// ============================================================================

export const VerbSchema = z.object({
  id: z.string().url(),
  display: LanguageMapSchema.optional(),
});
export type Verb = z.infer<typeof VerbSchema>;

// ============================================================================
// ACTIVITY DEFINITION
// ============================================================================

export const InteractionTypeSchema = z.enum([
  'true-false',
  'choice',
  'fill-in',
  'long-fill-in',
  'matching',
  'performance',
  'sequencing',
  'likert',
  'numeric',
  'other',
]);
export type InteractionType = z.infer<typeof InteractionTypeSchema>;

export const InteractionComponentSchema = z.object({
  id: z.string(),
  description: LanguageMapSchema.optional(),
});
export type InteractionComponent = z.infer<typeof InteractionComponentSchema>;

export const ActivityDefinitionSchema = z.object({
  type: z.string().url().optional(),
  name: LanguageMapSchema.optional(),
  description: LanguageMapSchema.optional(),
  moreInfo: z.string().url().optional(),
  interactionType: InteractionTypeSchema.optional(),
  correctResponsesPattern: z.array(z.string()).optional(),
  choices: z.array(InteractionComponentSchema).optional(),
  scale: z.array(InteractionComponentSchema).optional(),
  source: z.array(InteractionComponentSchema).optional(),
  target: z.array(InteractionComponentSchema).optional(),
  steps: z.array(InteractionComponentSchema).optional(),
  extensions: z.record(z.unknown()).optional(),
});
export type ActivityDefinition = z.infer<typeof ActivityDefinitionSchema>;

// ============================================================================
// OBJECT (Activity, Agent, StatementRef, SubStatement)
// ============================================================================

export const ActivitySchema = z.object({
  objectType: z.literal('Activity').default('Activity'),
  id: z.string().url(),
  definition: ActivityDefinitionSchema.optional(),
});
export type Activity = z.infer<typeof ActivitySchema>;

export const StatementRefSchema = z.object({
  objectType: z.literal('StatementRef'),
  id: z.string().uuid(),
});
export type StatementRef = z.infer<typeof StatementRefSchema>;

// Forward reference for SubStatement
export const ObjectSchema = z.union([ActivitySchema, AgentSchema, GroupSchema, StatementRefSchema]);
export type StatementObject = z.infer<typeof ObjectSchema>;

// ============================================================================
// SCORE
// ============================================================================

export const ScoreSchema = z.object({
  scaled: z.number().min(-1).max(1).optional(),
  raw: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
});
export type Score = z.infer<typeof ScoreSchema>;

// ============================================================================
// RESULT
// ============================================================================

export const ResultSchema = z.object({
  score: ScoreSchema.optional(),
  success: z.boolean().optional(),
  completion: z.boolean().optional(),
  response: z.string().optional(),
  duration: z.string().optional(), // ISO 8601 duration (e.g., "PT12.5S")
  extensions: z.record(z.unknown()).optional(),
});
export type Result = z.infer<typeof ResultSchema>;

// ============================================================================
// CONTEXT
// ============================================================================

export const ContextActivitiesSchema = z.object({
  parent: z.array(ActivitySchema).optional(),
  grouping: z.array(ActivitySchema).optional(),
  category: z.array(ActivitySchema).optional(),
  other: z.array(ActivitySchema).optional(),
});
export type ContextActivities = z.infer<typeof ContextActivitiesSchema>;

export const ContextSchema = z.object({
  registration: z.string().uuid().optional(),
  instructor: ActorSchema.optional(),
  team: GroupSchema.optional(),
  contextActivities: ContextActivitiesSchema.optional(),
  revision: z.string().optional(),
  platform: z.string().optional(),
  language: z.string().optional(),
  statement: StatementRefSchema.optional(),
  extensions: z.record(z.unknown()).optional(),
});
export type Context = z.infer<typeof ContextSchema>;

// ============================================================================
// ATTACHMENT
// ============================================================================

export const AttachmentSchema = z.object({
  usageType: z.string().url(),
  display: LanguageMapSchema,
  description: LanguageMapSchema.optional(),
  contentType: z.string(),
  length: z.number().int().positive(),
  sha2: z.string(),
  fileUrl: z.string().url().optional(),
});
export type Attachment = z.infer<typeof AttachmentSchema>;

// ============================================================================
// STATEMENT
// ============================================================================

export const StatementSchema = z.object({
  id: z.string().uuid().optional(),
  actor: ActorSchema,
  verb: VerbSchema,
  object: ObjectSchema,
  result: ResultSchema.optional(),
  context: ContextSchema.optional(),
  timestamp: z.string().datetime().optional(),
  stored: z.string().datetime().optional(),
  authority: ActorSchema.optional(),
  version: z.string().default('1.0.3'),
  attachments: z.array(AttachmentSchema).optional(),
});
export type Statement = z.infer<typeof StatementSchema>;

// ============================================================================
// STATEMENT QUERY
// ============================================================================

export interface StatementQuery {
  statementId?: string;
  voidedStatementId?: string;
  agent?: Actor;
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

export interface StatementResult {
  statements: Statement[];
  more: string;
}

// ============================================================================
// STATE API
// ============================================================================

export interface StateDocument {
  id: string;
  activityId: string;
  agent: Agent;
  registration?: string;
  stateId: string;
  stateData: unknown;
  contentType: string;
  etag: string;
  updatedAt: string;
}

// ============================================================================
// ACTIVITY PROFILE API
// ============================================================================

export interface ActivityProfile {
  id: string;
  activityId: string;
  profileId: string;
  profileData: unknown;
  contentType: string;
  etag: string;
  updatedAt: string;
}

// ============================================================================
// AGENT PROFILE API
// ============================================================================

export interface AgentProfile {
  id: string;
  agent: Agent;
  profileId: string;
  profileData: unknown;
  contentType: string;
  etag: string;
  updatedAt: string;
}

// ============================================================================
// LXP360 EXTENSIONS
// ============================================================================

/**
 * LXP360-specific context extension keys
 */
export const LXP360Extensions = {
  // Session & Device
  sessionId: 'https://lxp360.com/xapi/extensions/session-id',
  deviceType: 'https://lxp360.com/xapi/extensions/device-type',
  userCohort: 'https://lxp360.com/xapi/extensions/user-cohort',

  // Cognitive Load
  cognitiveLoadIndex: 'https://lxp360.com/xapi/extensions/cognitive-load-index',
  cognitiveLoadLevel: 'https://lxp360.com/xapi/extensions/cognitive-load-level',
  fatigueLevel: 'https://lxp360.com/xapi/extensions/fatigue-level',
  breakRecommended: 'https://lxp360.com/xapi/extensions/break-recommended',

  // Assessment
  masteryScore: 'https://lxp360.com/xapi/extensions/mastery-score',
  attemptNumber: 'https://lxp360.com/xapi/extensions/attempt-number',
  confidenceInterval: 'https://lxp360.com/xapi/extensions/confidence-interval',
  partialCreditAwarded: 'https://lxp360.com/xapi/extensions/partial-credit-awarded',

  // Interaction Details
  distractorType: 'https://lxp360.com/xapi/extensions/distractor-type',
  numberOfChanges: 'https://lxp360.com/xapi/extensions/number-of-changes',
  selectedCount: 'https://lxp360.com/xapi/extensions/selected-count',
  correctCountExpected: 'https://lxp360.com/xapi/extensions/correct-count-expected',
  errorType: 'https://lxp360.com/xapi/extensions/error-type',
  levenshteinDistance: 'https://lxp360.com/xapi/extensions/levenshtein-distance',
  typingSpeedWpm: 'https://lxp360.com/xapi/extensions/typing-speed-wpm',
  mismatches: 'https://lxp360.com/xapi/extensions/mismatches',

  // Media
  audioDuration: 'https://lxp360.com/xapi/extensions/audio-duration',
  audioClarityScore: 'https://lxp360.com/xapi/extensions/audio-clarity-score',
  wordsPerMinute: 'https://lxp360.com/xapi/extensions/words-per-minute',
  mediaPosition: 'https://lxp360.com/xapi/extensions/media-position',
  mediaPlaybackRate: 'https://lxp360.com/xapi/extensions/media-playback-rate',

  // AI Features
  aiTranscription: 'https://lxp360.com/xapi/extensions/ai/transcription',
  aiEmotionDetected: 'https://lxp360.com/xapi/extensions/ai/emotion-detected',
  aiEyeContactPercentage: 'https://lxp360.com/xapi/extensions/ai/eye-contact-percentage',
  aiObjectsDetected: 'https://lxp360.com/xapi/extensions/ai/objects-detected',
  aiConfidenceScore: 'https://lxp360.com/xapi/extensions/ai/confidence-score',

  // Safety & Compliance
  incidentSeverityRating: 'https://lxp360.com/xapi/extensions/incident-severity-rating',
  timeToIdentification: 'https://lxp360.com/xapi/extensions/time-to-identification',
} as const;

export type LXP360ExtensionKey = keyof typeof LXP360Extensions;

// ============================================================================
// DATABASE TYPES (Firestore)
// ============================================================================

export interface StatementRow {
  id: string;
  statement_id: string;
  actor: Actor;
  verb: Verb;
  object: StatementObject;
  result: Result | null;
  context: Context | null;
  timestamp: string;
  stored: string;
  authority: Actor | null;
  attachments: Attachment[] | null;
  tenant_id: string | null;
  learner_id: string | null;
  course_id: string | null;
  module_id: string | null;
  activity_type: string | null;
  verb_id: string;
  actor_mbox: string | null;
  object_id: string;
  object_type: string | null;
  cognitive_load_index: number | null;
  cognitive_load_level: string | null;
  voided: boolean;
  voided_by: string | null;
  created_at: string;
}

export interface ActivityStateRow {
  id: string;
  activity_id: string;
  agent: Agent;
  state_id: string;
  registration: string | null;
  state_data: unknown;
  content_type: string;
  etag: string;
  updated_at: string;
  tenant_id: string | null;
}

export interface ActivityProfileRow {
  id: string;
  activity_id: string;
  profile_id: string;
  profile_data: unknown;
  content_type: string;
  etag: string;
  updated_at: string;
  tenant_id: string | null;
}

export interface AgentProfileRow {
  id: string;
  agent: Agent;
  profile_id: string;
  profile_data: unknown;
  content_type: string;
  etag: string;
  updated_at: string;
  tenant_id: string | null;
}
