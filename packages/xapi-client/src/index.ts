/**
 * @inspire/xapi-client
 *
 * xAPI 1.0.3 client library for the INSPIRE LRS platform.
 *
 * @module @inspire/xapi-client
 */

// ============================================================================
// RE-EXPORT CONSTANTS FROM @inspire/types
// ============================================================================

export {
  CONSENT_TIERS,
  CONTENT_MODALITIES,
  type ConsentTier,
  type ContentModality,
  FUNCTIONAL_STATES,
  type FunctionalState,
  INSPIRE_EXTENSIONS,
  type InspireExtensionIRI,
  type InspireExtensionKey,
} from '@inspire/types';

// ============================================================================
// SCHEMAS
// ============================================================================

export {
  // Activity
  ACTIVITY_TYPES,
  type Account,
  // Actor
  AccountSchema,
  type Activity,
  type ActivityDefinition,
  ActivityDefinitionSchema,
  ActivitySchema,
  type ActivityTypeKey,
  type Actor,
  ActorSchema,
  // Verb
  ADL_VERBS,
  type Agent,
  AgentSchema,
  ALL_VERBS,
  // Attachment
  ATTACHMENT_USAGE_TYPES,
  type Attachment,
  AttachmentSchema,
  type Context,
  type ContextActivities,
  // Context
  ContextActivitiesSchema,
  ContextSchema,
  type Duration,
  // Primitives
  DurationSchema,
  type Extensions,
  ExtensionsSchema,
  // Result
  formatDuration,
  type Group,
  GroupSchema,
  getActivityType,
  getVerb,
  INSPIRE_VERBS,
  type InteractionComponent,
  InteractionComponentSchema,
  type InteractionType,
  InteractionTypeSchema,
  type IRI,
  IRISchema,
  isKnownVerb,
  type LanguageMap,
  LanguageMapSchema,
  parseDuration,
  type Result,
  ResultSchema,
  type Score,
  ScoreSchema,
  type Statement,
  type StatementBatch,
  // Statement
  StatementBatchSchema,
  type StatementObject,
  StatementObjectSchema,
  type StatementRef,
  StatementRefSchema,
  type StatementResult,
  StatementResultSchema,
  StatementSchema,
  type Timestamp,
  TimestampSchema,
  type UUID,
  UUIDSchema,
  type Verb,
  type VerbKey,
  VerbSchema,
  VIDEO_VERBS,
  type VoidingStatement,
  VoidingStatementSchema,
} from './schemas';

// ============================================================================
// BUILDER
// ============================================================================

export {
  type ActivityOptions,
  type ActorOptions,
  type ContextActivityOptions,
  createStatementBuilder,
  StatementBuilder,
} from './builder';

// ============================================================================
// VALIDATOR
// ============================================================================

export {
  hasConsentTier,
  hasRequiredInspireExtensions,
  isValidVoidingStatement,
  parseStatement,
  safeParseStatement,
  type ValidationError,
  type ValidationResult,
  validateStatement,
  validateStatementBatch,
} from './validator';

// ============================================================================
// RECIPES
// ============================================================================

export {
  type AssessmentAnswerInput,
  type ContentBlockInteractionInput,
  type ContentBlockVerb,
  createAssessmentAnswerStatement,
  createContentBlockStatement,
  createModalitySwapStatement,
  createProbeStatement,
  createSkillMasteryStatement,
  type DepthLevel,
  type IntelligentProbeInput,
  type MasteryLevel,
  type ModalitySwapInput,
  type SkillMasteryInput,
} from './recipes';
