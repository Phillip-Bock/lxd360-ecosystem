// Core BKT Algorithm
export {
  type AttemptInsights,
  type AttemptRecord,
  type BKTParams,
  type CognitiveLoadLevel,
  createInitialKnowledgeState,
  // Constants
  DEFAULT_BKT_PARAMS,
  detectGuessing,
  // Functions
  getMasteryLevel,
  getNextBestContent,
  type InterventionRecommendation,
  type KnowledgeState,
  // Types
  type MasteryLevel,
  SAFETY_CRITICAL_BKT_PARAMS,
  updateKnowledgeState,
} from './bkt';

// Cognitive Load Detection
export {
  // Types
  type BehavioralTelemetry,
  type CognitiveLoadAssessment,
  CognitiveLoadDetector,
  type CognitiveLoadFeatures,
  classifyLoadLevel,
  // Functions
  computeFeatures,
  computeLoadScore,
  determineIntervention,
  type TelemetryEvent,
  // Classes
  TelemetryWindow,
} from './cognitive-load';
// React Hooks (client-side)
export {
  type TelemetryData,
  type UseTelemetryOptions,
  useActivitySession,
  useConfidenceRating,
  useTelemetry,
} from './hooks';
// Integration Service
export {
  AdaptiveLearningService,
  type ProcessedAttempt,
  type SkillDefinition,
} from './service';
