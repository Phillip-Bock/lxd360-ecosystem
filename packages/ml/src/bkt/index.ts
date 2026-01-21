/**
 * BKT (Bayesian Knowledge Tracing) Exports
 *
 * @module @inspire/ml/bkt
 */

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
