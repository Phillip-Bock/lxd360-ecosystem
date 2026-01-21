/**
 * SM-2 Spaced Repetition Algorithm
 *
 * Implementation of the SuperMemo SM-2 algorithm for optimal
 * review scheduling based on learner performance.
 *
 * Original algorithm by Piotr Wozniak:
 * https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 *
 * @module @inspire/ml/sm2
 */

// ============================================================================
// SM-2 STATE
// ============================================================================

/**
 * SM-2 review state for a skill/item.
 */
export interface SM2State {
  /** Easiness factor (minimum 1.3) */
  easinessFactor: number;
  /** Current interval in days */
  interval: number;
  /** Number of successful repetitions */
  repetitions: number;
  /** Next scheduled review date (ISO string) */
  nextReviewDate: string | null;
  /** Last review date (ISO string) */
  lastReviewDate: string | null;
}

/**
 * Default initial SM-2 state.
 */
export const DEFAULT_SM2_STATE: SM2State = {
  easinessFactor: 2.5,
  interval: 0,
  repetitions: 0,
  nextReviewDate: null,
  lastReviewDate: null,
};

// ============================================================================
// QUALITY GRADES
// ============================================================================

/**
 * SM-2 quality grades (0-5).
 *
 * - 0: Complete blackout, no recall
 * - 1: Incorrect response, but remembered upon seeing answer
 * - 2: Incorrect response, but easy to recall when shown
 * - 3: Correct response with serious difficulty
 * - 4: Correct response after hesitation
 * - 5: Perfect response
 */
export type QualityGrade = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Convert a boolean correct/incorrect to a quality grade.
 * Uses latency to estimate difficulty.
 */
export function booleanToQuality(
  correct: boolean,
  latencyMs: number,
  expectedLatencyMs: number,
): QualityGrade {
  if (!correct) {
    // Incorrect response
    return latencyMs < expectedLatencyMs ? 1 : 2;
  }

  // Correct response - grade based on hesitation
  const latencyRatio = latencyMs / expectedLatencyMs;

  if (latencyRatio < 0.5) {
    return 5; // Very fast, confident
  }
  if (latencyRatio < 1.0) {
    return 5; // Normal speed, good recall
  }
  if (latencyRatio < 1.5) {
    return 4; // Slight hesitation
  }
  if (latencyRatio < 2.5) {
    return 3; // Significant hesitation
  }

  return 3; // Very slow but correct
}

// ============================================================================
// SM-2 CORE ALGORITHM
// ============================================================================

/**
 * Calculate new easiness factor based on quality of response.
 *
 * EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
 * EF' = max(1.3, EF')
 */
export function calculateEasinessFactor(currentEF: number, quality: QualityGrade): number {
  const newEF = currentEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  return Math.max(1.3, newEF);
}

/**
 * Calculate next interval based on repetition count and easiness factor.
 */
export function calculateInterval(
  repetitions: number,
  easinessFactor: number,
  currentInterval: number,
): number {
  if (repetitions === 0) {
    return 1; // First review after 1 day
  }
  if (repetitions === 1) {
    return 6; // Second review after 6 days
  }

  // Subsequent reviews: I(n) = I(n-1) * EF
  return Math.round(currentInterval * easinessFactor);
}

/**
 * Process a review and return updated SM-2 state.
 */
export function processReview(
  state: SM2State,
  quality: QualityGrade,
  reviewDate: Date = new Date(),
): SM2State {
  const reviewDateStr = reviewDate.toISOString();

  // If quality < 3, reset repetitions (failed recall)
  if (quality < 3) {
    return {
      easinessFactor: calculateEasinessFactor(state.easinessFactor, quality),
      interval: 1,
      repetitions: 0,
      nextReviewDate: addDays(reviewDate, 1).toISOString(),
      lastReviewDate: reviewDateStr,
    };
  }

  // Successful recall (quality >= 3)
  const newEF = calculateEasinessFactor(state.easinessFactor, quality);
  const newReps = state.repetitions + 1;
  const newInterval = calculateInterval(newReps, newEF, state.interval);

  return {
    easinessFactor: newEF,
    interval: newInterval,
    repetitions: newReps,
    nextReviewDate: addDays(reviewDate, newInterval).toISOString(),
    lastReviewDate: reviewDateStr,
  };
}

/**
 * Check if a skill is due for review.
 */
export function isDueForReview(state: SM2State, currentDate: Date = new Date()): boolean {
  if (!state.nextReviewDate) {
    return true; // Never reviewed
  }

  const nextReview = new Date(state.nextReviewDate);
  return currentDate >= nextReview;
}

/**
 * Calculate days overdue for a skill.
 * Returns negative if not yet due.
 */
export function getDaysOverdue(state: SM2State, currentDate: Date = new Date()): number {
  if (!state.nextReviewDate) {
    return Infinity; // Never reviewed
  }

  const nextReview = new Date(state.nextReviewDate);
  const diffMs = currentDate.getTime() - nextReview.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Get priority score for review (higher = more urgent).
 */
export function getReviewPriority(state: SM2State, currentDate: Date = new Date()): number {
  const overdue = getDaysOverdue(state, currentDate);

  if (overdue === Infinity) {
    return 100; // Never reviewed - highest priority
  }

  if (overdue <= 0) {
    return 0; // Not due yet
  }

  // Priority increases with days overdue, scaled by interval
  // Short intervals = higher urgency when overdue
  const urgencyFactor = Math.max(1, 10 / state.interval);
  return Math.min(100, overdue * urgencyFactor);
}

// ============================================================================
// MASTERY DECAY
// ============================================================================

/**
 * Estimate mastery decay over time without practice.
 *
 * Uses exponential decay based on interval/EF.
 */
export function estimateMasteryDecay(
  pMastery: number,
  daysSinceReview: number,
  easinessFactor: number,
): number {
  if (daysSinceReview <= 0) return pMastery;

  // Decay rate inversely proportional to easiness factor
  const decayRate = 0.05 / easinessFactor;
  const decayedMastery = pMastery * Math.exp(-decayRate * daysSinceReview);

  // Don't decay below 0.1 (some memory remains)
  return Math.max(0.1, decayedMastery);
}

/**
 * Check if a skill needs review based on estimated decay.
 */
export function needsReview(
  pMastery: number,
  daysSinceReview: number,
  easinessFactor: number,
  threshold: number = 0.7,
): boolean {
  const currentMastery = estimateMasteryDecay(pMastery, daysSinceReview, easinessFactor);
  return currentMastery < threshold;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Add days to a date.
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Create initial SM-2 state.
 */
export function createSM2State(): SM2State {
  return { ...DEFAULT_SM2_STATE };
}

/**
 * Merge SM-2 state with BKT mastery for integrated tracking.
 */
export function integrateWithBKT(
  sm2State: SM2State,
  bktMastery: number,
): { reviewPriority: number; adjustedInterval: number } {
  // Higher mastery = longer intervals
  const masteryMultiplier = 0.5 + bktMastery;
  const adjustedInterval = Math.round(sm2State.interval * masteryMultiplier);

  // Review priority inversely proportional to mastery
  const basePriority = getReviewPriority(sm2State);
  const adjustedPriority = basePriority * (1.5 - bktMastery);

  return {
    reviewPriority: adjustedPriority,
    adjustedInterval,
  };
}
