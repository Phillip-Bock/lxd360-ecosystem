/**
 * INSPIRE Type Exports
 *
 * Re-exports all types from schemas for convenience.
 * Types are inferred from Zod schemas (z.infer<typeof Schema>).
 *
 * @module types/inspire
 */

// ============================================================================
// ENCODING PHASE TYPES
// ============================================================================

export type {
  // Learner Persona (1.2)
  DigitalFluency,
  // Combined Encoding Data
  EncodingData,
  // ICES Engagement Spectrum (1.5)
  EngagementLevel,
  EngagementLevelConfig,
  ICESOutput,
  // ILMI Modality Integrator (1.4)
  ILMIOutput,
  // Industry Analysis (1.1)
  IndustryAnalysis,
  // ITLA Activation Strategy (1.3)
  ITLAOutput,
  LearnerArchetype,
  LearnerPersona,
  ModalitySelection,
  ModalityType,
  NeuroPrinciple,
  NeuroPrincipleConfig,
  PerformanceGap,
  PriorKnowledgeLevel,
} from '@/schemas/inspire';

// ============================================================================
// SYNTHESIZATION PHASE TYPES
// ============================================================================

export type {
  // ICDT Cognitive Demand (2.2)
  BloomVerb,
  ComplexityLevel,
  // ICPF Capability Progression (2.3)
  DomainBenchmark,
  ICDTOutput,
  // ICL Competency Ladder (2.4)
  ICLOutput,
  ICPFOutput,
  // IPMG Performance Mapping (2.1)
  IPMGOutput,
  JobTask,
  LadderRung,
  LearningDomain,
  ObjectiveDemand,
  PerformanceCriterion,
  ProficiencyLevel,
  ScaffoldingConfig,
  // Combined Synthesization Data
  SynthesizationData,
  TaskCompetencyLink,
  TaskCriticality,
  TaskFrequency,
} from '@/schemas/inspire';

// ============================================================================
// ASSIMILATION PHASE TYPES
// ============================================================================

export type {
  // Combined Assimilation Data
  AssimilationData,
  // Block Types
  BlockA11yConfig,
  BlockInspireMeta,
  BlockStyle,
  BlockType,
  BlockXAPIConfig,
  // Canvas Configuration
  CanvasConfig,
  ContentBlock,
  // Export Configuration
  ExportConfig,
  ExportFormat,
  GridType,
} from '@/schemas/inspire';

// ============================================================================
// XAPI TYPES
// ============================================================================

export type {
  // INSPIRE Statement Template
  INSPIREStatementTemplate,
  // Core xAPI types
  XAPIActivityDefinition,
  XAPIActor,
  XAPIContext,
  XAPIContextActivities,
  XAPIObject,
  XAPIResult,
  XAPIScore,
  XAPIStatement,
  XAPIVerb,
} from '@/schemas/inspire';

// ============================================================================
// MISSION MANIFEST TYPES
// ============================================================================

export type {
  // Competency Ladder
  CompetencyRung,
  // Manifest Export
  ManifestExport,
  // Mission Manifest
  MissionManifest,
  // Mission Metadata
  MissionMetadata,
  // Neuro Signature
  NeuroSignature,
} from '@/schemas/inspire';

// ============================================================================
// STORE TYPES
// ============================================================================

export type { MissionPhase, MissionStep } from '@/store/inspire';
