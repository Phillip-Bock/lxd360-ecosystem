import { z } from 'zod';

/**
 * xAPI Actor (Agent or Group)
 */
export const XApiActorSchema = z.object({
  objectType: z.enum(['Agent', 'Group']).default('Agent'),
  name: z.string().optional(),
  mbox: z.string().email().optional(),
  mbox_sha1sum: z.string().optional(),
  openid: z.string().url().optional(),
  account: z
    .object({
      homePage: z.string().url(),
      name: z.string(),
    })
    .optional(),
});
export type XApiActor = z.infer<typeof XApiActorSchema>;

/**
 * xAPI Verb
 */
export const XApiVerbSchema = z.object({
  id: z.string().url(),
  display: z.record(z.string()).optional(), // Language map
});
export type XApiVerb = z.infer<typeof XApiVerbSchema>;

/**
 * Common xAPI Verbs (ADL vocabulary)
 */
export const XApiVerbs = {
  answered: {
    id: 'http://adlnet.gov/expapi/verbs/answered',
    display: { 'en-US': 'answered' },
  },
  attempted: {
    id: 'http://adlnet.gov/expapi/verbs/attempted',
    display: { 'en-US': 'attempted' },
  },
  completed: {
    id: 'http://adlnet.gov/expapi/verbs/completed',
    display: { 'en-US': 'completed' },
  },
  experienced: {
    id: 'http://adlnet.gov/expapi/verbs/experienced',
    display: { 'en-US': 'experienced' },
  },
  failed: {
    id: 'http://adlnet.gov/expapi/verbs/failed',
    display: { 'en-US': 'failed' },
  },
  initialized: {
    id: 'http://adlnet.gov/expapi/verbs/initialized',
    display: { 'en-US': 'initialized' },
  },
  interacted: {
    id: 'http://adlnet.gov/expapi/verbs/interacted',
    display: { 'en-US': 'interacted' },
  },
  launched: {
    id: 'http://adlnet.gov/expapi/verbs/launched',
    display: { 'en-US': 'launched' },
  },
  mastered: {
    id: 'http://adlnet.gov/expapi/verbs/mastered',
    display: { 'en-US': 'mastered' },
  },
  passed: {
    id: 'http://adlnet.gov/expapi/verbs/passed',
    display: { 'en-US': 'passed' },
  },
  progressed: {
    id: 'http://adlnet.gov/expapi/verbs/progressed',
    display: { 'en-US': 'progressed' },
  },
  registered: {
    id: 'http://adlnet.gov/expapi/verbs/registered',
    display: { 'en-US': 'registered' },
  },
  resumed: {
    id: 'http://adlnet.gov/expapi/verbs/resumed',
    display: { 'en-US': 'resumed' },
  },
  scored: {
    id: 'http://adlnet.gov/expapi/verbs/scored',
    display: { 'en-US': 'scored' },
  },
  suspended: {
    id: 'http://adlnet.gov/expapi/verbs/suspended',
    display: { 'en-US': 'suspended' },
  },
  terminated: {
    id: 'http://adlnet.gov/expapi/verbs/terminated',
    display: { 'en-US': 'terminated' },
  },
  // LXP360-specific verbs
  identified: {
    id: 'http://adlnet.gov/expapi/verbs/identified',
    display: { 'en-US': 'identified' },
  },
  skipped: {
    id: 'http://id.tincanapi.com/verb/skipped',
    display: { 'en-US': 'skipped' },
  },
  paused: {
    id: 'http://id.tincanapi.com/verb/paused',
    display: { 'en-US': 'paused' },
  },
  played: {
    id: 'http://activitystrea.ms/schema/1.0/play',
    display: { 'en-US': 'played' },
  },
} as const;

/**
 * xAPI Activity Definition
 */
export const XApiActivityDefinitionSchema = z.object({
  type: z.string().url().optional(),
  name: z.record(z.string()).optional(),
  description: z.record(z.string()).optional(),
  moreInfo: z.string().url().optional(),
  interactionType: z
    .enum([
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
    ])
    .optional(),
  correctResponsesPattern: z.array(z.string()).optional(),
  choices: z
    .array(
      z.object({
        id: z.string(),
        description: z.record(z.string()),
      }),
    )
    .optional(),
  scale: z
    .array(
      z.object({
        id: z.string(),
        description: z.record(z.string()),
      }),
    )
    .optional(),
  source: z
    .array(
      z.object({
        id: z.string(),
        description: z.record(z.string()),
      }),
    )
    .optional(),
  target: z
    .array(
      z.object({
        id: z.string(),
        description: z.record(z.string()),
      }),
    )
    .optional(),
  steps: z
    .array(
      z.object({
        id: z.string(),
        description: z.record(z.string()),
      }),
    )
    .optional(),
  extensions: z.record(z.unknown()).optional(),
});
export type XApiActivityDefinition = z.infer<typeof XApiActivityDefinitionSchema>;

/**
 * xAPI Object (Activity)
 */
export const XApiObjectSchema = z.object({
  objectType: z.literal('Activity').default('Activity'),
  id: z.string().url(),
  definition: XApiActivityDefinitionSchema.optional(),
});
export type XApiObject = z.infer<typeof XApiObjectSchema>;

/**
 * xAPI Score
 */
export const XApiScoreSchema = z.object({
  scaled: z.number().min(-1).max(1).optional(),
  raw: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
});
export type XApiScore = z.infer<typeof XApiScoreSchema>;

/**
 * xAPI Result
 */
export const XApiResultSchema = z.object({
  score: XApiScoreSchema.optional(),
  success: z.boolean().optional(),
  completion: z.boolean().optional(),
  response: z.string().optional(),
  duration: z.string().optional(), // ISO 8601 duration (e.g., "PT12.5S")
  extensions: z.record(z.unknown()).optional(),
});
export type XApiResult = z.infer<typeof XApiResultSchema>;

/**
 * xAPI Context Activities
 */
export const XApiContextActivitiesSchema = z.object({
  parent: z.array(XApiObjectSchema).optional(),
  grouping: z.array(XApiObjectSchema).optional(),
  category: z.array(XApiObjectSchema).optional(),
  other: z.array(XApiObjectSchema).optional(),
});
export type XApiContextActivities = z.infer<typeof XApiContextActivitiesSchema>;

/**
 * xAPI Context
 */
export const XApiContextSchema = z.object({
  registration: z.string().uuid().optional(),
  instructor: XApiActorSchema.optional(),
  team: XApiActorSchema.optional(),
  contextActivities: XApiContextActivitiesSchema.optional(),
  revision: z.string().optional(),
  platform: z.string().optional(),
  language: z.string().optional(),
  statement: z
    .object({
      objectType: z.literal('StatementRef'),
      id: z.string().uuid(),
    })
    .optional(),
  extensions: z.record(z.unknown()).optional(),
});
export type XApiContext = z.infer<typeof XApiContextSchema>;

/**
 * Complete xAPI Statement
 */
export const XApiStatementSchema = z.object({
  id: z.string().uuid().optional(),
  actor: XApiActorSchema,
  verb: XApiVerbSchema,
  object: XApiObjectSchema,
  result: XApiResultSchema.optional(),
  context: XApiContextSchema.optional(),
  timestamp: z.string().datetime().optional(),
  stored: z.string().datetime().optional(),
  authority: XApiActorSchema.optional(),
  version: z.string().default('1.0.0'),
  attachments: z.array(z.unknown()).optional(),
});
export type XApiStatement = z.infer<typeof XApiStatementSchema>;

/**
 * LXP360-specific context extensions
 * Based on xAPI Implementation Specifications
 */
export const LXP360ExtensionKeys = {
  sessionId: 'http://lxp360.com/extension/session_id',
  deviceType: 'http://lxp360.com/extension/device_type',
  masteryScore: 'http://lxp360.com/extension/mastery_score',
  userCohort: 'http://lxp360.com/extension/user_cohort',
  distractorType: 'http://lxp360.com/extension/distractor_type',
  numberOfChanges: 'http://lxp360.com/extension/number_of_changes',
  confidenceInterval: 'http://lxp360.com/extension/confidence_interval',
  selectedCount: 'http://lxp360.com/extension/selected_count',
  correctCountExpected: 'http://lxp360.com/extension/correct_count_expected',
  partialCreditAwarded: 'http://lxp360.com/extension/partial_credit_awarded',
  errorType: 'http://lxp360.com/extension/error_type',
  levenshteinDistance: 'http://lxp360.com/extension/levenshtein_distance',
  typingSpeedWpm: 'http://lxp360.com/extension/typing_speed_wpm',
  attemptNumber: 'http://lxp360.com/extension/attempt_number',
  mismatches: 'http://lxp360.com/extension/mismatches',
  audioDuration: 'http://lxp360.com/extension/audio_duration',
  audioClarityScore: 'http://lxp360.com/extension/audio_clarity_score',
  wordsPerMinute: 'http://lxp360.com/extension/words_per_minute',
  incidentSeverityRating: 'http://lxp360.com/extension/incident_severity_rating',
  timeToIdentification: 'http://lxp360.com/extension/time_to_identification',
  // AI-specific extensions
  aiTranscription: 'http://lxp360.com/extension/ai/transcription',
  aiEmotionDetected: 'http://lxp360.com/extension/ai/emotion_detected',
  aiEyeContactPercentage: 'http://lxp360.com/extension/ai/eye_contact_percentage',
  aiObjectsDetected: 'http://lxp360.com/extension/ai/objects_detected',
  // Cognitive load extensions
  cognitiveLoadIndex: 'http://lxp360.com/extension/cognitive_load_index',
  fatigueLevel: 'http://lxp360.com/extension/fatigue_level',
  breakRecommended: 'http://lxp360.com/extension/break_recommended',
} as const;

export type LXP360ExtensionKey = keyof typeof LXP360ExtensionKeys;
