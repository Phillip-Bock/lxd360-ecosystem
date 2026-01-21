/**
 * @inspire/ml
 *
 * Machine learning algorithms for adaptive learning:
 * - BKT (Bayesian Knowledge Tracing) for mastery estimation
 * - SM-2 (SuperMemo 2) for spaced repetition scheduling
 *
 * @module @inspire/ml
 */

// ============================================================================
// BKT (BAYESIAN KNOWLEDGE TRACING)
// ============================================================================

export {
  type BKTParams,
  type BKTState,
  classifyMasteryLevel,
  createBKTState,
  DEFAULT_BKT_PARAMS,
  estimateGuessProbability,
  estimateOpportunitiesToMastery,
  hasMastery,
  MASTERY_THRESHOLDS,
  type MasteryLevel,
  predictCorrectProbability,
  processObservation,
  processObservations,
  updateMastery,
} from './bkt';

// ============================================================================
// SM-2 (SPACED REPETITION)
// ============================================================================

export {
  booleanToQuality,
  calculateEasinessFactor,
  calculateInterval,
  createSM2State,
  DEFAULT_SM2_STATE,
  estimateMasteryDecay,
  getDaysOverdue,
  getReviewPriority,
  integrateWithBKT,
  isDueForReview,
  needsReview,
  processReview,
  type QualityGrade,
  type SM2State,
} from './sm2';
