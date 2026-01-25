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
// Skill Decay Calculator (Phase 7b)
export {
  applyDecay,
  calculateDecayRate,
  calculateOptimalReviewTiming,
  DEFAULT_DECAY_PARAMS,
  type DecayedState,
  type DecayParams,
  explainDecay,
  getDecayedSkills,
  getDecayUrgency,
} from './decay';
// Hesitation Monitor (Phase 7b)
export {
  adjustBKTForHesitation,
  type ConfidenceLevel,
  calculateExpectedResponseTime,
  explainHesitation,
  type HesitationContext,
  type HesitationSignal,
  interpretHesitation,
} from './hesitation';
// React Hooks (client-side)
export {
  type TelemetryData,
  type UseTelemetryOptions,
  useActivitySession,
  useConfidenceRating,
  useTelemetry,
} from './hooks';
// Adaptive Learning Orchestrator (Phase 7b)
export {
  blendPredictions,
  calculateModelWeights,
  createOrchestratorState,
  explainModelState,
  type InteractionRecord,
  interactionsUntilPersonalized,
  isInColdStart,
  isPersonalized,
  type ModelWeights,
  type OrchestratorState,
  updateOrchestratorState,
} from './orchestrator';
// Intelligent Probe Selector (Phase 7b)
export {
  calculateEntropy,
  calculateInformationGain,
  createProbeSession,
  getProbeProgress,
  type Probe,
  type ProbeResult,
  type ProbeSession,
  recordProbeResult,
  selectNextProbe,
  shouldContinueProbing,
  summarizeProbeSession,
} from './probes';
// Integration Service
export {
  AdaptiveLearningService,
  type ProcessedAttempt,
  type SkillDefinition,
} from './service';
// SM-2 Spaced Repetition Algorithm
export {
  // Functions
  adjustIntervalByMastery,
  calculateRetentionRate,
  createSM2Item,
  descriptorFromQuality,
  estimateStudyTime,
  getDueItems,
  getItemStatistics,
  masteryToQuality,
  qualityFromDescriptor,
  // Types
  type SM2Item,
  type SM2ItemWithMeta,
  type SM2Response,
  type SM2ResponseDescriptor,
  sortByPriority,
  sortByPriorityWithBoost,
  updateSM2,
} from './sm2';
