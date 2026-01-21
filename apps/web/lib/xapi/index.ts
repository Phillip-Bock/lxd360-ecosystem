// ============================================================================
// TYPES
// ============================================================================

export type {
  Account,
  Activity,
  ActivityDefinition,
  ActivityProfile,
  ActivityProfileRow,
  ActivityStateRow,
  Actor,
  Agent,
  AgentProfile,
  AgentProfileRow,
  Attachment,
  Context,
  ContextActivities,
  Group,
  InteractionComponent,
  InteractionType,
  // Core xAPI Types
  LanguageMap,
  Result,
  Score,
  // Document API Types
  StateDocument,
  Statement,
  StatementObject,
  // Query Types
  StatementQuery,
  StatementRef,
  StatementResult,
  // Database Row Types
  StatementRow,
  Verb,
} from './types';

// ============================================================================
// SCHEMAS (Zod validation)
// ============================================================================

export {
  AccountSchema,
  ActivityDefinitionSchema,
  ActivitySchema,
  ActorSchema,
  AgentSchema,
  AttachmentSchema,
  ContextActivitiesSchema,
  ContextSchema,
  GroupSchema,
  InteractionComponentSchema,
  InteractionTypeSchema,
  LanguageMapSchema,
  ObjectSchema,
  ResultSchema,
  ScoreSchema,
  StatementRefSchema,
  StatementSchema,
  VerbSchema,
} from './types';

// ============================================================================
// LXP360 EXTENSIONS
// ============================================================================

export type { LXP360ExtensionKey } from './types';
export { LXP360Extensions } from './types';

// ============================================================================
// INSPIRE COGNITIVE EXTENSIONS (NEW)
// ============================================================================

export type {
  ConsentTierLevel,
  ContentModalityType,
  FunctionalLearningStateType,
  InspireExtensionIRI,
  InspireExtensionKey,
} from './inspire-extensions';

export {
  buildInspireExtensions,
  ConsentTier,
  ContentModality,
  extractInspireExtensions,
  FunctionalLearningState,
  InspireExtensions,
  inferFunctionalState,
} from './inspire-extensions';

// ============================================================================
// MODALITY SWAPPER (Real-time Adaptation)
// ============================================================================

export type {
  ModalityRecommendation,
  ModalitySwapPromptProps,
  ModalitySwapperConfig,
  ModalitySwapperState,
} from './modality-swapper';

export {
  getModalityDisplayName,
  getModalityIcon,
  useModalitySwapper,
} from './modality-swapper';

// ============================================================================
// VOCABULARY
// ============================================================================

export type { ActivityTypeKey, VerbKey } from './vocabulary';
export {
  // Activity Type Definitions
  ACTIVITY_TYPES,
  buildActivity,
  // Helper Functions
  buildActivityId,
  createActorFromAccount,
  createActorFromEmail,
  formatDuration,
  getActivityType,
  getVerb,
  parseDuration,
  // Verb Definitions
  VERBS,
} from './vocabulary';

// ============================================================================
// SERVICE (Server-side)
// ============================================================================

export type { StoreStatementOptions, StoreStatementResult } from './service';
export {
  deleteState,
  // Profile Operations
  getActivityProfile,
  getAgentProfile,
  // Analytics
  getLearnerProgress,
  // State Operations
  getState,
  getStatement,
  getStatements,
  setActivityProfile,
  setAgentProfile,
  setState,
  // Statement Operations
  storeStatement,
  storeStatements,
  voidStatement,
} from './service';

// ============================================================================
// HOOKS (Client-side)
// ============================================================================

export type {
  LearnerProgressData,
  TrackStatementOptions,
  UseActivityStateOptions,
  UseActivityStateReturn,
  UseLearnerProgressOptions,
  UseXAPITrackerOptions,
  UseXAPITrackerReturn,
} from './hooks';
export {
  useActivityState,
  useLearnerProgress,
  useXAPITracker,
} from './hooks';

// ============================================================================
// BIGQUERY CLIENT (Analytics Pipeline)
// ============================================================================

export type {
  BatchSendResult,
  BigQueryClientConfig,
  BigQueryIngestionResponse,
  ClientStatus,
} from './bigquery-client';

export {
  BigQueryXAPIClient,
  flushBigQueryQueue,
  getBigQueryClient,
  hasBigQueryClient,
  initializeBigQueryClient,
  queueStatementForBigQuery,
  sendStatementsToBigQuery,
  sendStatementToBigQuery,
} from './bigquery-client';

// ============================================================================
// BLOCK STATEMENTS (Content Block Templates)
// ============================================================================

export type {
  BlockStatementTemplate,
  ContentBlockType,
} from './block-statements';
export {
  BLOCK_ACTIVITY_TYPES,
  // Block Type Mappings
  BLOCK_VERBS,
  buildInteractionDefinition,
  buildReadingProgressResult,
  buildScenarioChoiceResult,
  buildVideoContextExtensions,
  buildVideoResultExtensions,
  getBlockActivityType,
  // Template Functions
  getBlockStatementTemplate,
  getValidVerbs,
  // Interaction Extensions
  INTERACTION_EXTENSIONS,
  isValidBlockVerb,
  // Reading Extensions
  READING_EXTENSIONS,
  // Scenario Extensions
  SCENARIO_EXTENSIONS,
  // Video Extensions
  VIDEO_EXTENSIONS,
} from './block-statements';

// ============================================================================
// STATEMENT GENERATOR
// ============================================================================

export type {
  GenerateStatementOptions,
  QuizStatementOptions,
  ReadingStatementOptions,
  ScenarioStatementOptions,
  VideoStatementOptions,
} from './statement-generator';
export {
  addCognitiveLoadContext,
  // Helpers
  createActor,
  // Core Generator
  generateBlockStatement,
  generateQuizStatement,
  generateReadingStatement,
  generateScenarioStatement,
  // Specialized Generators
  generateVideoStatement,
} from './statement-generator';

// ============================================================================
// XAPI VERB REGISTRY (Comprehensive)
// ============================================================================

export type { VerbCategory, XAPIVerbKey } from './verbs';
export {
  getVerbKeyFromId,
  getXAPIVerb,
  isValidVerbId,
  VERB_CATEGORIES,
  XAPI_VERBS,
} from './verbs';

// ============================================================================
// ACTIVITY TYPES REGISTRY (Comprehensive)
// ============================================================================

export type {
  ActivityTypeCategory,
  ActivityTypeKey as XAPIActivityTypeKey,
} from './activity-types';
export {
  ACTIVITY_TYPE_CATEGORIES,
  ACTIVITY_TYPES as XAPI_ACTIVITY_TYPES,
  getActivityType as getXAPIActivityType,
  getActivityTypeKey,
  isValidActivityType,
} from './activity-types';

// ============================================================================
// STATEMENT TEMPLATES (All Content Blocks)
// ============================================================================

export type {
  EventTemplate,
  StatementTemplate,
} from './templates';
export {
  CONTENT_BLOCK_TEMPLATES,
  EXTENSION_URIS,
  getBlockTemplate,
  getEventTemplate,
  getSupportedBlockTypes,
  getValidTriggers,
  isBlockTypeSupported,
  isValidTrigger,
} from './templates';

// ============================================================================
// STATEMENT BUILDER (Fluent API)
// ============================================================================

export type {
  ActivityOptions,
  ActorOptions,
  ContextActivityOptions,
  ResultOptions,
} from './statement-builder';
export {
  buildBlockStatement,
  buildQuizStatement,
  buildVideoStatement,
  createStatementBuilder,
  StatementBuilder,
} from './statement-builder';

// ============================================================================
// COGNITIVE UTILITIES (ICL Framework)
// ============================================================================

export type {
  CognitiveLoadFactors,
  CognitiveLoadInput,
  EngagementLevel,
  FluencyThresholds,
  FluencyZone,
  ICDTLevel,
  InterventionThresholds,
  Modality,
} from './cognitive-utils';

export {
  CognitiveUtils,
  calculateCognitiveLoad,
  calculateCognitiveLoadFactors,
  calculateMasteryDecay,
  classifyFluencyZone,
  DEFAULT_INTERVENTION_THRESHOLDS,
  estimateGuessProbability,
  FLUENCY_THRESHOLDS,
  getFluencyThresholds,
  needsReview,
  shouldTriggerCognitiveLoadIntervention,
} from './cognitive-utils';

// ============================================================================
// GLASS BOX AI (EU AI Act Explainability)
// ============================================================================

export type {
  ExplanationInput,
  GlassBoxExplanation,
  InterventionContext,
} from './glass-box';

export {
  formatForAccessibility,
  formatForHUD,
  GlassBox,
  generateGlassBoxExplanation,
} from './glass-box';

// ============================================================================
// JITAI CONTROLLER (Just-In-Time Adaptive Interventions)
// ============================================================================

export type {
  Intervention,
  InterventionCheckInput,
  InterventionType,
  LearnerState,
} from './jitai-controller';

export {
  checkInterventionTriggers,
  JITAIController,
} from './jitai-controller';

// ============================================================================
// HESITATION TRACKER HOOKS (Real-time Behavioral Signals)
// ============================================================================

export type {
  HesitationEvent,
  HesitationMetrics,
  UseHesitationTrackerOptions,
  UseHesitationTrackerReturn,
} from './hooks/use-hesitation-tracker';

export {
  useFocusHesitation,
  useHesitationTracker,
  useIdleHesitation,
  useVisibilityHesitation,
} from './hooks/use-hesitation-tracker';

// ============================================================================
// INSPIRE STUDIO xAPI (Content Authoring Tracking)
// ============================================================================

export type {
  A11yCompliance,
  AISuggestionOutcome,
  AuthoringVerb,
  BlockActionOptions,
  ExportFormat,
  InspirePhase,
  StudioActivityType,
  StudioExtensionIRI,
  StudioExtensionKey,
  StudioStatementOptions,
  UseBlockXAPIOptions,
  UseBlockXAPIReturn,
  UseCanvasXAPIOptions,
  UseCanvasXAPIReturn,
  UseStudioXAPIOptions,
  UseStudioXAPIReturn,
} from './studio';

export {
  A11yComplianceSchema,
  AISuggestionOutcomeSchema,
  AuthoringVerbSchema,
  buildAIGenerationStatement,
  buildAuditActivity,
  buildAuditStatement,
  buildBlockActivity,
  buildBlockCreatedStatement,
  buildBlockDeletedStatement,
  buildBlockEditedStatement,
  buildBlockMovedStatement,
  buildBlockResizedStatement,
  buildCanvasActivity,
  buildExportActivity,
  buildExportStatement,
  buildMissionActivity,
  buildPhaseActivity,
  buildPhaseCompletedStatement,
  buildStepActivity,
  buildStudioContextExtensions,
  buildStudioStatement,
  ExportFormatSchema,
  getStudioVerb,
  InspirePhaseSchema,
  STUDIO_ACTIVITY_TYPES,
  STUDIO_EXTENSIONS,
  STUDIO_VERBS,
  useBlockXAPI,
  useCanvasXAPI,
  useStudioXAPI,
} from './studio';
