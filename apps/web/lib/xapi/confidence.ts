// =============================================================================
// CONFIDENCE CALCULATION MODULE — Deep xAPI Profile
// =============================================================================
// Calculates learner confidence indicators based on behavioral telemetry.
// Used for "False Confidence" detection in assessments.
//
// Standard xAPI: "User completed course."
// Deep xAPI: "User completed course with hesitation and low confidence."
// =============================================================================

import type {
  ConfidenceIndicator,
  HesitationData,
  InteractionPattern,
} from '@/types/xapi/deep-profile';

// =============================================================================
// CONFIGURATION CONSTANTS
// =============================================================================

/**
 * Default thresholds for confidence calculation.
 * These can be overridden per question type or difficulty level.
 */
export const CONFIDENCE_THRESHOLDS = {
  /** Speed ratio below this = "fast" response */
  FAST_THRESHOLD: 0.5,
  /** Speed ratio below this = "normal" response */
  NORMAL_THRESHOLD: 1.0,
  /** Speed ratio below this = "slow" response */
  SLOW_THRESHOLD: 2.0,
  /** Answer changes at or below this = minimal hesitation */
  LOW_CHANGES_THRESHOLD: 1,
  /** Answer changes at or below this = moderate hesitation */
  MODERATE_CHANGES_THRESHOLD: 2,
  /** Speed ratio above this with changes = likely guessing */
  GUESSING_FAST_THRESHOLD: 0.3,
} as const;

// =============================================================================
// CONFIDENCE INDICATOR CALCULATION
// =============================================================================

/**
 * Calculate learner confidence indicator based on answer behavior.
 *
 * This algorithm detects "false confidence" by analyzing:
 * - Time taken vs expected time
 * - Number of answer changes
 * - Patterns that suggest guessing
 *
 * @param answerChanges - Number of times the answer was changed before final submission
 * @param timeToAnswer - Actual time to final answer (ms)
 * @param expectedTime - Expected/average time for this question type (ms)
 * @returns Confidence indicator: 'mastery' | 'confident' | 'uncertain' | 'guessing'
 *
 * @example
 * ```typescript
 * // Fast answer with no changes = mastery
 * calculateConfidence(0, 2000, 10000); // 'mastery'
 *
 * // Normal speed with minimal changes = confident
 * calculateConfidence(1, 8000, 10000); // 'confident'
 *
 * // Multiple changes or slow = uncertain
 * calculateConfidence(2, 15000, 10000); // 'uncertain'
 *
 * // Very fast with changes = guessing (clicked around randomly)
 * calculateConfidence(3, 2000, 10000); // 'guessing'
 *
 * // Very slow with many changes = guessing
 * calculateConfidence(4, 25000, 10000); // 'guessing'
 * ```
 *
 * @example
 * ```typescript
 * // Usage with xAPI statement builder
 * import { calculateConfidence } from '@/lib/xapi/confidence';
 * import { createHesitationExtension } from '@/types/xapi/deep-profile';
 *
 * const hesitationData = {
 *   answer_changes: answerChanges,
 *   time_to_first_answer_ms: firstAnswerTime,
 *   time_to_final_answer_ms: finalAnswerTime,
 * };
 *
 * const extension = createHesitationExtension(hesitationData, expectedTime);
 * // extension includes auto-calculated confidence_indicator
 * ```
 */
export function calculateConfidence(
  answerChanges: number,
  timeToAnswer: number,
  expectedTime: number,
): ConfidenceIndicator {
  // Guard against invalid inputs
  if (expectedTime <= 0) {
    return 'uncertain';
  }

  const speedRatio = timeToAnswer / expectedTime;

  // Pattern: Very fast WITH changes = guessing (random clicking)
  // This catches learners who click through options quickly without thinking
  if (speedRatio < CONFIDENCE_THRESHOLDS.GUESSING_FAST_THRESHOLD && answerChanges >= 1) {
    return 'guessing';
  }

  // Pattern: Fast with no changes = mastery (knew it immediately)
  if (answerChanges === 0 && speedRatio < CONFIDENCE_THRESHOLDS.FAST_THRESHOLD) {
    return 'mastery';
  }

  // Pattern: Reasonable speed with minimal changes = confident
  if (
    answerChanges <= CONFIDENCE_THRESHOLDS.LOW_CHANGES_THRESHOLD &&
    speedRatio < CONFIDENCE_THRESHOLDS.NORMAL_THRESHOLD
  ) {
    return 'confident';
  }

  // Pattern: Some hesitation or changes but within bounds = uncertain
  if (
    answerChanges <= CONFIDENCE_THRESHOLDS.MODERATE_CHANGES_THRESHOLD &&
    speedRatio < CONFIDENCE_THRESHOLDS.SLOW_THRESHOLD
  ) {
    return 'uncertain';
  }

  // Pattern: Long delay OR many changes = guessing
  return 'guessing';
}

// =============================================================================
// CONFIDENCE SCORE CALCULATION
// =============================================================================

/**
 * Calculate a numeric confidence score (0-100) for more granular analysis.
 *
 * This provides a continuous score rather than discrete categories,
 * useful for analytics and trend tracking.
 *
 * @param answerChanges - Number of answer changes
 * @param timeToAnswer - Time to final answer (ms)
 * @param expectedTime - Expected time for this question (ms)
 * @returns Confidence score from 0 (no confidence) to 100 (full mastery)
 *
 * @example
 * ```typescript
 * // Perfect confidence
 * calculateConfidenceScore(0, 2000, 10000); // ~95
 *
 * // Good confidence
 * calculateConfidenceScore(1, 8000, 10000); // ~70
 *
 * // Low confidence
 * calculateConfidenceScore(3, 15000, 10000); // ~30
 * ```
 */
export function calculateConfidenceScore(
  answerChanges: number,
  timeToAnswer: number,
  expectedTime: number,
): number {
  if (expectedTime <= 0) {
    return 50; // Neutral when we can't calculate
  }

  const speedRatio = timeToAnswer / expectedTime;

  // Base score starts at 100 and decreases based on factors
  let score = 100;

  // Penalize for answer changes (each change reduces score)
  // First change: -10, second: -15, third+: -20 each
  if (answerChanges >= 1) score -= 10;
  if (answerChanges >= 2) score -= 15;
  if (answerChanges >= 3) score -= (answerChanges - 2) * 20;

  // Penalize for slow responses
  // Normal speed (ratio ~1): no penalty
  // Slow (ratio 1-2): moderate penalty
  // Very slow (ratio 2+): heavy penalty
  if (speedRatio > 1) {
    const slowPenalty = Math.min(30, (speedRatio - 1) * 15);
    score -= slowPenalty;
  }

  // Bonus for fast responses (but not if there were changes)
  if (speedRatio < 0.5 && answerChanges === 0) {
    score += 5; // Small bonus for quick, decisive answers
  }

  // Penalize heavily for guessing pattern (fast + changes)
  if (speedRatio < 0.3 && answerChanges >= 1) {
    score -= 25; // Heavy penalty for random clicking
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

// =============================================================================
// FOCUS SCORE CALCULATION
// =============================================================================

/**
 * Calculate engagement focus score from interaction metrics.
 *
 * Focus score indicates how much attention the learner paid to content.
 * High idle time or window blur time reduces the score.
 *
 * @param totalTime - Total time on content (ms)
 * @param idleTime - Total mouse/keyboard idle time (ms)
 * @param blurTime - Total time window was not in focus (ms)
 * @returns Focus score from 0 (no focus) to 100 (full focus)
 *
 * @example
 * ```typescript
 * // Full focus - no idle, no blur
 * calculateFocusScore(60000, 0, 0); // 100
 *
 * // Moderate focus - some idle time
 * calculateFocusScore(60000, 15000, 5000); // ~67
 *
 * // Low focus - mostly idle/blurred
 * calculateFocusScore(60000, 30000, 20000); // ~17
 *
 * // Edge case - zero total time
 * calculateFocusScore(0, 0, 0); // 0
 * ```
 */
export function calculateFocusScore(totalTime: number, idleTime: number, blurTime: number): number {
  if (totalTime <= 0) {
    return 0;
  }

  // Active time = total - (idle + blur)
  // Note: idle and blur can overlap, so we cap at totalTime
  const inactiveTime = Math.min(idleTime + blurTime, totalTime);
  const activeTime = totalTime - inactiveTime;
  const focusRatio = activeTime / totalTime;

  return Math.max(0, Math.min(100, Math.round(focusRatio * 100)));
}

// =============================================================================
// INTERACTION PATTERN DETECTION
// =============================================================================

/**
 * Detect interaction pattern from engagement metrics.
 *
 * This identifies how the learner consumed content:
 * - 'deep': Thorough engagement with content
 * - 'skimming': Fast scrolling, minimal interaction
 * - 'clicking-through': Just advancing without reading
 * - 'revisiting': Going back to review (indicates learning)
 *
 * @param scrollVelocity - Average scroll velocity (pixels per second)
 * @param focusScore - Focus score (0-100) from calculateFocusScore
 * @param timePerItem - Average time per content item (ms)
 * @param expectedTimePerItem - Expected time per item for this content type (ms)
 * @returns Detected interaction pattern
 *
 * @example
 * ```typescript
 * // Deep engagement - slow scroll, high focus, good time
 * detectInteractionPattern(100, 85, 30000, 20000); // 'deep'
 *
 * // Skimming - fast scroll, moderate focus
 * detectInteractionPattern(800, 45, 10000, 20000); // 'skimming'
 *
 * // Clicking through - minimal time, low focus
 * detectInteractionPattern(200, 20, 5000, 20000); // 'clicking-through'
 * ```
 */
export function detectInteractionPattern(
  scrollVelocity: number,
  focusScore: number,
  timePerItem: number,
  expectedTimePerItem: number,
): InteractionPattern {
  // Guard against division by zero
  if (expectedTimePerItem <= 0) {
    return 'skimming';
  }

  const timeRatio = timePerItem / expectedTimePerItem;

  // Pattern: Very fast with low focus = clicking through
  // Learner is just advancing without engaging
  if (timeRatio < 0.3 && focusScore < 30) {
    return 'clicking-through';
  }

  // Pattern: Fast scrolling with low focus = skimming
  // Learner is scanning but not deeply reading
  if (scrollVelocity > 500 && focusScore < 50) {
    return 'skimming';
  }

  // Pattern: Good time and high focus = deep engagement
  // Learner is thoroughly consuming content
  if (timeRatio >= 0.7 && focusScore >= 70) {
    return 'deep';
  }

  // Pattern: Excessive time might indicate revisiting
  // (This could be enhanced with navigation tracking)
  if (timeRatio > 1.5 && focusScore >= 50) {
    return 'revisiting';
  }

  // Default: Assume skimming when uncertain
  return 'skimming';
}

// =============================================================================
// HESITATION DATA BUILDER
// =============================================================================

/**
 * Build complete hesitation data with calculated confidence.
 *
 * This is a convenience function that combines raw metrics with
 * calculated confidence indicator.
 *
 * @param rawData - Raw hesitation metrics without confidence indicator
 * @param expectedTime - Expected time for this question (ms)
 * @returns Complete HesitationData with confidence indicator
 *
 * @example
 * ```typescript
 * const hesitationData = buildHesitationData(
 *   {
 *     answer_changes: 1,
 *     time_to_first_answer_ms: 3000,
 *     time_to_final_answer_ms: 8000,
 *   },
 *   10000 // Expected 10 seconds for this question
 * );
 *
 * // Result:
 * // {
 * //   answer_changes: 1,
 * //   time_to_first_answer_ms: 3000,
 * //   time_to_final_answer_ms: 8000,
 * //   confidence_indicator: 'confident'
 * // }
 * ```
 */
export function buildHesitationData(
  rawData: Omit<HesitationData, 'confidence_indicator'>,
  expectedTime: number,
): HesitationData {
  const confidenceIndicator = calculateConfidence(
    rawData.answer_changes,
    rawData.time_to_final_answer_ms,
    expectedTime,
  );

  return {
    ...rawData,
    confidence_indicator: confidenceIndicator,
  };
}

// =============================================================================
// BATCH CONFIDENCE ANALYSIS
// =============================================================================

/**
 * Analyze confidence across multiple answers for aggregate scoring.
 *
 * Useful for quiz-level or course-level confidence metrics.
 *
 * @param hesitationDataList - Array of hesitation data from multiple questions
 * @returns Aggregate confidence analysis
 *
 * @example
 * ```typescript
 * const quizHesitationData = [
 *   { confidence_indicator: 'mastery', ... },
 *   { confidence_indicator: 'confident', ... },
 *   { confidence_indicator: 'uncertain', ... },
 * ];
 *
 * const analysis = analyzeConfidenceDistribution(quizHesitationData);
 * // {
 * //   total: 3,
 * //   distribution: { mastery: 1, confident: 1, uncertain: 1, guessing: 0 },
 * //   percentages: { mastery: 33.3, confident: 33.3, uncertain: 33.3, guessing: 0 },
 * //   averageScore: 73.3,
 * //   dominantIndicator: 'mastery' // ties go to highest confidence
 * // }
 * ```
 */
export function analyzeConfidenceDistribution(
  hesitationDataList: Pick<HesitationData, 'confidence_indicator'>[],
): {
  total: number;
  distribution: Record<ConfidenceIndicator, number>;
  percentages: Record<ConfidenceIndicator, number>;
  averageScore: number;
  dominantIndicator: ConfidenceIndicator;
} {
  const distribution: Record<ConfidenceIndicator, number> = {
    mastery: 0,
    confident: 0,
    uncertain: 0,
    guessing: 0,
  };

  const scoreMap: Record<ConfidenceIndicator, number> = {
    mastery: 100,
    confident: 75,
    uncertain: 50,
    guessing: 25,
  };

  for (const data of hesitationDataList) {
    distribution[data.confidence_indicator]++;
  }

  const total = hesitationDataList.length;
  const percentages: Record<ConfidenceIndicator, number> = {
    mastery: total > 0 ? Math.round((distribution.mastery / total) * 1000) / 10 : 0,
    confident: total > 0 ? Math.round((distribution.confident / total) * 1000) / 10 : 0,
    uncertain: total > 0 ? Math.round((distribution.uncertain / total) * 1000) / 10 : 0,
    guessing: total > 0 ? Math.round((distribution.guessing / total) * 1000) / 10 : 0,
  };

  const totalScore = hesitationDataList.reduce(
    (sum, data) => sum + scoreMap[data.confidence_indicator],
    0,
  );
  const averageScore = total > 0 ? Math.round((totalScore / total) * 10) / 10 : 0;

  // Find dominant indicator (ties favor higher confidence)
  const indicators: ConfidenceIndicator[] = ['mastery', 'confident', 'uncertain', 'guessing'];
  let dominantIndicator: ConfidenceIndicator = 'uncertain';
  let maxCount = 0;

  for (const indicator of indicators) {
    if (distribution[indicator] > maxCount) {
      maxCount = distribution[indicator];
      dominantIndicator = indicator;
    }
  }

  return {
    total,
    distribution,
    percentages,
    averageScore,
    dominantIndicator,
  };
}

// =============================================================================
// FALSE CONFIDENCE DETECTION
// =============================================================================

/**
 * Detect if a learner exhibits "false confidence" pattern.
 *
 * False confidence occurs when:
 * - High quiz score BUT low confidence indicators
 * - Quick answers BUT many were guesses
 * - Pattern suggests lucky guessing rather than mastery
 *
 * @param quizScore - Quiz score (0-100)
 * @param hesitationDataList - Hesitation data from quiz questions
 * @returns False confidence analysis
 *
 * @example
 * ```typescript
 * // High score but low confidence = false confidence
 * const analysis = detectFalseConfidence(85, [
 *   { confidence_indicator: 'guessing', ... },
 *   { confidence_indicator: 'uncertain', ... },
 *   { confidence_indicator: 'guessing', ... },
 * ]);
 *
 * // {
 * //   hasFalseConfidence: true,
 * //   scoreConfidenceGap: 35, // 85 score - 50 avg confidence
 * //   recommendation: 'Review material - score may not reflect mastery'
 * // }
 * ```
 */
export function detectFalseConfidence(
  quizScore: number,
  hesitationDataList: Pick<HesitationData, 'confidence_indicator'>[],
): {
  hasFalseConfidence: boolean;
  scoreConfidenceGap: number;
  confidenceScore: number;
  recommendation: string | null;
} {
  const analysis = analyzeConfidenceDistribution(hesitationDataList);
  const confidenceScore = analysis.averageScore;
  const scoreConfidenceGap = quizScore - confidenceScore;

  // False confidence threshold: score is 25+ points higher than confidence
  const hasFalseConfidence = scoreConfidenceGap >= 25 && quizScore >= 70;

  let recommendation: string | null = null;
  if (hasFalseConfidence) {
    if (scoreConfidenceGap >= 40) {
      recommendation =
        'Strong false confidence detected - recommend comprehensive review before proceeding';
    } else {
      recommendation = 'Review material - quiz performance may not reflect true mastery';
    }
  } else if (scoreConfidenceGap < 0 && Math.abs(scoreConfidenceGap) >= 20) {
    recommendation = 'Confidence exceeds score - learner may benefit from additional practice';
  }

  return {
    hasFalseConfidence,
    scoreConfidenceGap,
    confidenceScore,
    recommendation,
  };
}
