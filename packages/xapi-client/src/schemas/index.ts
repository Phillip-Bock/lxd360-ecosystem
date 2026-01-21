/**
 * xAPI 1.0.3 Schemas
 *
 * @module @inspire/xapi-client/schemas
 */

// Activity
export {
  ACTIVITY_TYPES,
  type Activity,
  type ActivityDefinition,
  ActivityDefinitionSchema,
  ActivitySchema,
  type ActivityTypeKey,
  getActivityType,
  type InteractionComponent,
  InteractionComponentSchema,
  type InteractionType,
  InteractionTypeSchema,
  type StatementObject,
  StatementObjectSchema,
  type StatementRef,
  StatementRefSchema,
} from './activity';

// Actor
export {
  type Account,
  AccountSchema,
  type Actor,
  ActorSchema,
  type Agent,
  AgentSchema,
  type Group,
  GroupSchema,
} from './actor';
// Attachment
export {
  ATTACHMENT_USAGE_TYPES,
  type Attachment,
  AttachmentSchema,
} from './attachment';
// Context
export {
  type Context,
  type ContextActivities,
  ContextActivitiesSchema,
  ContextSchema,
} from './context';
// Primitives
export {
  type Duration,
  DurationSchema,
  type Extensions,
  ExtensionsSchema,
  type IRI,
  IRISchema,
  type LanguageMap,
  LanguageMapSchema,
  type Timestamp,
  TimestampSchema,
  type UUID,
  UUIDSchema,
} from './primitives';
// Result
export {
  formatDuration,
  parseDuration,
  type Result,
  ResultSchema,
  type Score,
  ScoreSchema,
} from './result';
// Statement
export {
  type Statement,
  type StatementBatch,
  StatementBatchSchema,
  type StatementResult,
  StatementResultSchema,
  StatementSchema,
  type VoidingStatement,
  VoidingStatementSchema,
} from './statement';
// Verb
export {
  ADL_VERBS,
  ALL_VERBS,
  getVerb,
  INSPIRE_VERBS,
  isKnownVerb,
  type Verb,
  type VerbKey,
  VerbSchema,
  VIDEO_VERBS,
} from './verb';
