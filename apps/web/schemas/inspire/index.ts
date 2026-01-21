/**
 * INSPIRE Schemas Index
 *
 * Central export point for all INSPIRE Studio Zod schemas.
 * All types are inferred from schemas (z.infer<typeof Schema>).
 *
 * @module schemas/inspire
 */

// ============================================================================
// ENCODING PHASE SCHEMAS (Step 1.1-1.5)
// ============================================================================

export {
  type DigitalFluency,
  // Learner Persona (1.2)
  DigitalFluencySchema,
  type EncodingData,
  // Combined Encoding Data
  EncodingDataSchema,
  type EngagementLevel,
  type EngagementLevelConfig,
  // ICES Engagement Spectrum (1.5)
  EngagementLevelConfigSchema,
  EngagementLevelSchema,
  type ICESOutput,
  ICESOutputSchema,
  type ILMIOutput,
  // ILMI Modality Integrator (1.4)
  ILMIOutputSchema,
  type IndustryAnalysis,
  // Industry Analysis (1.1)
  IndustryAnalysisSchema,
  type ITLAOutput,
  // ITLA Activation Strategy (1.3)
  ITLAOutputSchema,
  // Type guards
  isEncodingData,
  isICESOutput,
  isILMIOutput,
  isITLAOutput,
  isLearnerPersona,
  type LearnerArchetype,
  LearnerArchetypeSchema,
  type LearnerPersona,
  LearnerPersonaSchema,
  type ModalitySelection,
  ModalitySelectionSchema,
  type ModalityType,
  ModalityTypeSchema,
  type NeuroPrinciple,
  type NeuroPrincipleConfig,
  NeuroPrincipleConfigSchema,
  NeuroPrincipleSchema,
  type PerformanceGap,
  PerformanceGapSchema,
  type PriorKnowledgeLevel,
  PriorKnowledgeLevelSchema,
} from './encoding';

// ============================================================================
// SYNTHESIZATION PHASE SCHEMAS (Step 2.1-2.4)
// ============================================================================

export {
  type BloomVerb,
  // ICDT Cognitive Demand (2.2)
  BloomVerbSchema,
  type ComplexityLevel,
  ComplexityLevelSchema,
  type DomainBenchmark,
  // ICPF Capability Progression (2.3)
  DomainBenchmarkSchema,
  type ICDTOutput,
  ICDTOutputSchema,
  type ICLOutput,
  // ICL Competency Ladder (2.4)
  ICLOutputSchema,
  type ICPFOutput,
  ICPFOutputSchema,
  type IPMGOutput,
  // IPMG Performance Mapping (2.1)
  IPMGOutputSchema,
  // Type guards
  isICDTOutput,
  isICLOutput,
  isICPFOutput,
  isIPMGOutput,
  isSynthesizationData,
  type JobTask,
  JobTaskSchema,
  type LadderRung,
  LadderRungSchema,
  type LearningDomain,
  LearningDomainSchema,
  type ObjectiveDemand,
  ObjectiveDemandSchema,
  type PerformanceCriterion,
  PerformanceCriterionSchema,
  type ProficiencyLevel,
  ProficiencyLevelSchema,
  type ScaffoldingConfig,
  ScaffoldingConfigSchema,
  type SynthesizationData,
  // Combined Synthesization Data
  SynthesizationDataSchema,
  type TaskCompetencyLink,
  TaskCompetencyLinkSchema,
  type TaskCriticality,
  TaskCriticalitySchema,
  type TaskFrequency,
  TaskFrequencySchema,
} from './synthesization';

// ============================================================================
// ASSIMILATION PHASE SCHEMAS (Step 3.1-3.4)
// ============================================================================

export {
  type AssimilationData,
  // Combined Assimilation Data
  AssimilationDataSchema,
  type BlockA11yConfig,
  // Block Types
  BlockA11yConfigSchema,
  type BlockInspireMeta,
  BlockInspireMetaSchema,
  type BlockStyle,
  BlockStyleSchema,
  type BlockType,
  BlockTypeSchema,
  type BlockXAPIConfig,
  BlockXAPIConfigSchema,
  type CanvasConfig,
  // Canvas Configuration
  CanvasConfigSchema,
  type ContentBlock,
  ContentBlockSchema,
  type ExportConfig,
  // Export Configuration
  ExportConfigSchema,
  type ExportFormat,
  ExportFormatSchema,
  type GridType,
  GridTypeSchema,
  // Type guards
  isAssimilationData,
  isCanvasConfig,
  isContentBlock,
  isExportConfig,
} from './assimilation';

// ============================================================================
// XAPI SCHEMAS
// ============================================================================

export {
  type INSPIREStatementTemplate,
  // INSPIRE Statement Template
  INSPIREStatementTemplateSchema,
  // Type guards
  isINSPIREStatementTemplate,
  isXAPIStatement,
  isXAPIVerb,
  type XAPIActivityDefinition,
  // Core xAPI types
  XAPIActivityDefinitionSchema,
  type XAPIActor,
  XAPIActorSchema,
  type XAPIContext,
  type XAPIContextActivities,
  XAPIContextActivitiesSchema,
  XAPIContextSchema,
  type XAPIObject,
  XAPIObjectSchema,
  type XAPIResult,
  XAPIResultSchema,
  type XAPIScore,
  XAPIScoreSchema,
  type XAPIStatement,
  XAPIStatementSchema,
  type XAPIVerb,
  XAPIVerbSchema,
} from './xapi';

// ============================================================================
// MISSION MANIFEST (GOLDEN THREAD)
// ============================================================================

export {
  type CompetencyRung,
  // Competency Ladder
  CompetencyRungSchema,
  // Type guards
  isCompetencyRung,
  isMissionManifest,
  type ManifestExport,
  // Manifest Export
  ManifestExportSchema,
  type MissionManifest,
  // Mission Manifest
  MissionManifestSchema,
  type MissionMetadata,
  // Mission Metadata
  MissionMetadataSchema,
  type NeuroSignature,
  // Neuro Signature
  NeuroSignatureSchema,
} from './missionManifest';

// ============================================================================
// SCENARIO SCHEMAS (Logic-Branching Editor)
// ============================================================================

export {
  type ActionNodeData,
  ActionNodeDataSchema,
  BRANCHING_XAPI_EXTENSIONS,
  // xAPI constants
  BRANCHING_XAPI_VERBS,
  type Choice,
  // Choice types
  ChoiceSchema,
  type ComparisonOperator,
  // Condition types
  ComparisonOperatorSchema,
  type Condition,
  type ConditionGroup,
  ConditionGroupSchema,
  ConditionSchema,
  type DialogueNodeData,
  DialogueNodeDataSchema,
  type EndStateNodeData,
  EndStateNodeDataSchema,
  isChoice,
  isCondition,
  // Type guards
  isScenarioManifest,
  isVariable,
  type LogicGateNodeData,
  LogicGateNodeDataSchema,
  type MutationOperation,
  // Mutation types
  MutationOperationSchema,
  type OutcomeType,
  OutcomeTypeSchema,
  type PathAnalysis,
  PathAnalysisSchema,
  type Position,
  PositionSchema,
  type ScenarioEdge,
  ScenarioEdgeSchema,
  type ScenarioEdgeType,
  // Edge types
  ScenarioEdgeTypeSchema,
  type ScenarioManifest,
  ScenarioManifestSchema,
  type ScenarioMetadata,
  // Scenario manifest
  ScenarioMetadataSchema,
  type ScenarioNode,
  type ScenarioNodeData,
  ScenarioNodeDataSchema,
  ScenarioNodeSchema,
  type ScenarioNodeType,
  // Node types
  ScenarioNodeTypeSchema,
  type StartNodeData,
  StartNodeDataSchema,
  type ValidationIssue,
  ValidationIssueSchema,
  type ValidationSeverity,
  // Validation types
  ValidationSeveritySchema,
  type Variable,
  type VariableMutation,
  VariableMutationSchema,
  VariableSchema,
  type VariableType,
  // Variable types
  VariableTypeSchema,
  type VariableValue,
  VariableValueSchema,
} from './scenario';
