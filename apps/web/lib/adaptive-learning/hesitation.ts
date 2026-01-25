/**
 * Hesitation Monitor
 *
 * Interprets response latency as a cognitive signal.
 * Fast + correct = confident mastery
 * Slow + correct = uncertainty or lucky guess
 *
 * Based on INSPIRE architecture: "Hesitation latency serves as a direct
 * proxy for cognitive load and confidence."
 */

import { logger } from '@/lib/logger';

const log = logger.scope('HesitationMonitor');

// =============================================================================
// TYPES
// =============================================================================

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'uncertain';

export interface HesitationSignal {
  /** Raw response time in milliseconds */
  latencyMs: number;
  /** Expected response time based on difficulty */
  expectedMs: number;
  /** Ratio of actual to expected (< 1 = fast, > 1 = slow) */
  ratio: number;
  /** Interpreted confidence level */
  confidence: ConfidenceLevel;
  /** Whether this suggests the answer was a guess */
  possibleGuess: boolean;
}

export interface HesitationContext {
  /** Question/content difficulty (0-1 scale) */
  difficulty: number;
  /** Content type affects expected response time */
  contentType: 'multiple_choice' | 'true_false' | 'short_answer' | 'drag_drop' | 'simulation';
  /** Whether the response was correct */
  wasCorrect: boolean;
  /** Learner's historical average response time (if available) */
  learnerAverageMs?: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Base expected response time by content type (ms) */
const BASE_RESPONSE_TIME: Record<HesitationContext['contentType'], number> = {
  true_false: 3000,
  multiple_choice: 5000,
  short_answer: 15000,
  drag_drop: 8000,
  simulation: 30000,
};

/** Difficulty multiplier range */
const DIFFICULTY_MULTIPLIER = {
  min: 0.5, // Easy questions = 50% of base time expected
  max: 2.0, // Hard questions = 200% of base time expected
};

/** Confidence thresholds (ratio of actual/expected) */
const CONFIDENCE_THRESHOLDS = {
  high: 0.5, // < 50% of expected time = high confidence
  medium: 1.0, // < 100% of expected time = medium confidence
  low: 1.5, // < 150% of expected time = low confidence
  // > 150% = uncertain
};

/** If response is this fast AND correct, might be a guess */
const SUSPICIOUSLY_FAST_RATIO = 0.2;

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Calculate expected response time based on content and difficulty
 */
export function calculateExpectedResponseTime(context: HesitationContext): number {
  const baseTime = BASE_RESPONSE_TIME[context.contentType];

  // Difficulty scales from min to max multiplier
  const difficultyMultiplier =
    DIFFICULTY_MULTIPLIER.min +
    (DIFFICULTY_MULTIPLIER.max - DIFFICULTY_MULTIPLIER.min) * context.difficulty;

  let expected = baseTime * difficultyMultiplier;

  // If we have learner history, blend with their personal average
  if (context.learnerAverageMs) {
    expected = (expected + context.learnerAverageMs) / 2;
  }

  return Math.round(expected);
}

/**
 * Interpret hesitation signal from response latency
 */
export function interpretHesitation(
  latencyMs: number,
  context: HesitationContext,
): HesitationSignal {
  const expectedMs = calculateExpectedResponseTime(context);
  const ratio = latencyMs / expectedMs;

  // Determine confidence level
  let confidence: ConfidenceLevel;
  if (ratio < CONFIDENCE_THRESHOLDS.high) {
    confidence = 'high';
  } else if (ratio < CONFIDENCE_THRESHOLDS.medium) {
    confidence = 'medium';
  } else if (ratio < CONFIDENCE_THRESHOLDS.low) {
    confidence = 'low';
  } else {
    confidence = 'uncertain';
  }

  // Detect possible guess: suspiciously fast AND correct
  const possibleGuess =
    context.wasCorrect && ratio < SUSPICIOUSLY_FAST_RATIO && context.contentType !== 'simulation'; // Simulations can't really be guessed

  const signal: HesitationSignal = {
    latencyMs,
    expectedMs,
    ratio: Math.round(ratio * 100) / 100,
    confidence,
    possibleGuess,
  };

  log.debug('Hesitation interpreted', {
    latencyMs,
    expectedMs,
    ratio: signal.ratio,
    confidence,
    possibleGuess,
  });

  return signal;
}

/**
 * Adjust BKT update based on hesitation signal
 *
 * High confidence correct → stronger mastery boost
 * Low confidence correct → weaker mastery boost (might be a guess)
 * Possible guess → apply guess penalty to pLearn
 */
export function adjustBKTForHesitation(signal: HesitationSignal, basePLearn: number): number {
  if (signal.possibleGuess) {
    // Reduce learning rate for suspected guesses
    return basePLearn * 0.5;
  }

  switch (signal.confidence) {
    case 'high':
      return basePLearn * 1.2; // Confident mastery = faster learning
    case 'medium':
      return basePLearn;
    case 'low':
      return basePLearn * 0.8;
    case 'uncertain':
      return basePLearn * 0.6;
  }
}

/**
 * Get human-readable explanation of hesitation for Glass Box
 */
export function explainHesitation(signal: HesitationSignal, wasCorrect: boolean): string {
  if (signal.possibleGuess) {
    return "Your quick response suggests you may have guessed. We'll revisit this concept to confirm mastery.";
  }

  if (wasCorrect) {
    switch (signal.confidence) {
      case 'high':
        return 'You answered quickly and correctly, showing confident mastery.';
      case 'medium':
        return 'Good response time with a correct answer.';
      case 'low':
        return 'You got it right, but took some time to think it through.';
      case 'uncertain':
        return 'You eventually found the right answer after careful consideration.';
    }
  } else {
    switch (signal.confidence) {
      case 'high':
      case 'medium':
        return 'A quick incorrect response. This concept needs more practice.';
      case 'low':
      case 'uncertain':
        return "You took time but still struggled. Let's approach this differently.";
    }
  }
}
