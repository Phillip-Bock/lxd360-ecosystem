/**
 * Bayesian Knowledge Tracing (BKT) Implementation
 *
 * BKT models a learner's knowledge state as a binary latent variable
 * (mastered vs. not mastered) and uses observations (correct/incorrect
 * responses) to update the probability of mastery.
 *
 * @module @inspire/ml/bkt
 */

// ============================================================================
// BKT PARAMETERS
// ============================================================================

/**
 * BKT model parameters for a skill.
 */
export interface BKTParams {
  /** Prior probability of mastery before any practice (P(L0)) */
  pInit: number;
  /** Probability of learning from each opportunity (P(T)) */
  pLearn: number;
  /** Probability of guessing correctly when not mastered (P(G)) */
  pGuess: number;
  /** Probability of slipping (making error when mastered) (P(S)) */
  pSlip: number;
}

/**
 * Default BKT parameters based on empirical learning science research.
 */
export const DEFAULT_BKT_PARAMS: BKTParams = {
  pInit: 0.0, // Assume no prior knowledge
  pLearn: 0.1, // 10% chance of learning per opportunity
  pGuess: 0.2, // 20% chance of guessing correctly
  pSlip: 0.1, // 10% chance of error when mastered
};

/**
 * Mastery state with BKT tracking data.
 */
export interface BKTState {
  /** Current probability of mastery (P(Ln)) */
  pMastery: number;
  /** BKT parameters for this skill */
  params: BKTParams;
  /** Total number of practice opportunities */
  opportunities: number;
  /** Number of correct responses */
  correctCount: number;
  /** Number of incorrect responses */
  incorrectCount: number;
}

// ============================================================================
// BKT CORE ALGORITHM
// ============================================================================

/**
 * Update mastery probability based on observed response.
 *
 * This is the core BKT update equation:
 * - P(Ln|obs) = P(Ln|obs) * P(L(n-1)) / P(obs)
 *
 * @param pMastery Current probability of mastery
 * @param correct Whether the response was correct
 * @param params BKT parameters
 * @returns Updated probability of mastery
 */
export function updateMastery(
  pMastery: number,
  correct: boolean,
  params: BKTParams = DEFAULT_BKT_PARAMS,
): number {
  const { pLearn, pGuess, pSlip } = params;

  // Calculate P(correct | mastered) and P(correct | not mastered)
  const pCorrectIfMastered = 1 - pSlip;
  const pCorrectIfNotMastered = pGuess;

  // Calculate posterior P(mastered | observation)
  let pMasteredGivenObs: number;

  if (correct) {
    // Bayes' theorem for correct response
    const numerator = pCorrectIfMastered * pMastery;
    const denominator = pCorrectIfMastered * pMastery + pCorrectIfNotMastered * (1 - pMastery);
    pMasteredGivenObs = numerator / denominator;
  } else {
    // Bayes' theorem for incorrect response
    const pIncorrectIfMastered = pSlip;
    const pIncorrectIfNotMastered = 1 - pGuess;
    const numerator = pIncorrectIfMastered * pMastery;
    const denominator = pIncorrectIfMastered * pMastery + pIncorrectIfNotMastered * (1 - pMastery);
    pMasteredGivenObs = numerator / denominator;
  }

  // Apply learning transition
  // P(Ln) = P(Ln-1|obs) + P(not Ln-1|obs) * P(T)
  const pMasteryAfterLearning = pMasteredGivenObs + (1 - pMasteredGivenObs) * pLearn;

  // Clamp to valid probability range
  return Math.max(0, Math.min(1, pMasteryAfterLearning));
}

/**
 * Calculate the probability of a correct response given mastery state.
 *
 * P(correct) = P(correct|mastered)*P(mastered) + P(correct|not mastered)*P(not mastered)
 */
export function predictCorrectProbability(
  pMastery: number,
  params: BKTParams = DEFAULT_BKT_PARAMS,
): number {
  const { pGuess, pSlip } = params;
  return (1 - pSlip) * pMastery + pGuess * (1 - pMastery);
}

/**
 * Estimate if the learner is likely guessing based on response patterns.
 *
 * A learner is likely guessing if:
 * - Low mastery but high correct rate (lucky guesses)
 * - Very fast response times (not reading/thinking)
 */
export function estimateGuessProbability(
  pMastery: number,
  correctRate: number,
  avgLatencyMs: number,
  expectedLatencyMs: number,
  params: BKTParams = DEFAULT_BKT_PARAMS,
): number {
  // Base guess probability from BKT
  let guessProb = params.pGuess;

  // Increase if correct rate is higher than expected given mastery
  const expectedCorrectRate = predictCorrectProbability(pMastery, params);
  if (correctRate > expectedCorrectRate + 0.15) {
    guessProb += 0.2;
  }

  // Increase if responding very fast (< 20% of expected time)
  if (avgLatencyMs < expectedLatencyMs * 0.2) {
    guessProb += 0.3;
  }

  return Math.min(1, guessProb);
}

// ============================================================================
// BKT STATE MANAGEMENT
// ============================================================================

/**
 * Create initial BKT state for a new skill.
 */
export function createBKTState(params: Partial<BKTParams> = {}): BKTState {
  const mergedParams = { ...DEFAULT_BKT_PARAMS, ...params };
  return {
    pMastery: mergedParams.pInit,
    params: mergedParams,
    opportunities: 0,
    correctCount: 0,
    incorrectCount: 0,
  };
}

/**
 * Process an observation and return updated BKT state.
 */
export function processObservation(state: BKTState, correct: boolean): BKTState {
  const newPMastery = updateMastery(state.pMastery, correct, state.params);

  return {
    ...state,
    pMastery: newPMastery,
    opportunities: state.opportunities + 1,
    correctCount: state.correctCount + (correct ? 1 : 0),
    incorrectCount: state.incorrectCount + (correct ? 0 : 1),
  };
}

/**
 * Process multiple observations in sequence.
 */
export function processObservations(state: BKTState, observations: boolean[]): BKTState {
  return observations.reduce((s, correct) => processObservation(s, correct), state);
}

// ============================================================================
// MASTERY CLASSIFICATION
// ============================================================================

export type MasteryLevel = 'novice' | 'developing' | 'proficient' | 'mastered';

/**
 * Mastery level thresholds.
 */
export const MASTERY_THRESHOLDS = {
  novice: 0.25,
  developing: 0.5,
  proficient: 0.75,
  mastered: 0.95,
} as const;

/**
 * Classify mastery probability into a level.
 */
export function classifyMasteryLevel(pMastery: number): MasteryLevel {
  if (pMastery >= MASTERY_THRESHOLDS.mastered) return 'mastered';
  if (pMastery >= MASTERY_THRESHOLDS.proficient) return 'proficient';
  if (pMastery >= MASTERY_THRESHOLDS.developing) return 'developing';
  return 'novice';
}

/**
 * Check if learner has achieved mastery.
 */
export function hasMastery(
  pMastery: number,
  threshold: number = MASTERY_THRESHOLDS.mastered,
): boolean {
  return pMastery >= threshold;
}

/**
 * Calculate opportunities needed to reach mastery from current state.
 */
export function estimateOpportunitiesToMastery(
  state: BKTState,
  targetMastery: number = MASTERY_THRESHOLDS.mastered,
  assumedCorrectRate: number = 0.7,
): number {
  if (state.pMastery >= targetMastery) return 0;

  let pMastery = state.pMastery;
  let opportunities = 0;
  const maxIterations = 100; // Prevent infinite loops

  while (pMastery < targetMastery && opportunities < maxIterations) {
    // Simulate expected outcome based on assumed correct rate
    const correct = Math.random() < assumedCorrectRate;
    pMastery = updateMastery(pMastery, correct, state.params);
    opportunities++;
  }

  return opportunities;
}
