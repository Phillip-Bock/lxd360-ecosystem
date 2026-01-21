import type { LearningEvent, MasteryScore, QualityRating, SpacedRepetitionParams } from './types';

/**
 * Calculate mastery score from learning events
 * Uses weighted recent performance with decay
 */
export function calculateMasteryScore(
  skillId: string,
  skillName: string,
  events: LearningEvent[],
): MasteryScore {
  if (events.length === 0) {
    return {
      skillId,
      skillName,
      masteryLevel: 0,
      confidence: 0,
      learningVelocity: 0,
      status: 'not_started',
      totalAttempts: 0,
      successfulAttempts: 0,
      retentionEstimate: 0,
    };
  }

  // Sort events by timestamp (newest first)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  // Calculate weighted score (recent events weighted more heavily)
  let weightedScore = 0;
  let totalWeight = 0;
  const decayFactor = 0.9; // Each older event weighted 10% less

  sortedEvents.forEach((event, index) => {
    const weight = decayFactor ** index;
    const eventScore = calculateEventScore(event);
    weightedScore += eventScore * weight;
    totalWeight += weight;
  });

  const masteryLevel = totalWeight > 0 ? weightedScore / totalWeight : 0;

  // Calculate confidence based on number of attempts and consistency
  const confidence = calculateConfidence(events);

  // Calculate learning velocity (improvement rate)
  const learningVelocity = calculateLearningVelocity(sortedEvents);

  // Determine status
  const status = getMasteryStatus(masteryLevel, confidence);

  // Calculate retention estimate (forgetting curve)
  const retentionEstimate = calculateRetentionEstimate(sortedEvents[0]);

  // Calculate next review date
  const nextReviewDate = calculateNextReviewDate(masteryLevel, retentionEstimate);

  return {
    skillId,
    skillName,
    masteryLevel,
    confidence,
    learningVelocity,
    status,
    totalAttempts: events.length,
    successfulAttempts: events.filter((e) => e.success).length,
    lastAttemptDate: sortedEvents[0]?.timestamp,
    retentionEstimate,
    nextReviewDate,
  };
}

/**
 * Calculate score for a single learning event
 */
function calculateEventScore(event: LearningEvent): number {
  let score = 0;

  // Base score from success/failure
  if (event.success) {
    score = event.score !== undefined ? event.score / 100 : 1;
  } else {
    score = event.partialCredit ?? 0;
  }

  // Penalties
  // Multiple changes indicate uncertainty
  if (event.numberOfChanges > 2) {
    score *= 0.9;
  }

  // Using hints reduces demonstrated mastery
  if (event.hintsUsed > 0) {
    score *= Math.max(0.5, 1 - event.hintsUsed * 0.1);
  }

  // Multiple attempts needed
  if (event.attemptNumber > 1) {
    score *= Math.max(0.6, 1 - (event.attemptNumber - 1) * 0.1);
  }

  // Time factor - very fast might be guessing, very slow might be struggling
  if (event.expectedDuration) {
    const timeRatio = event.duration / event.expectedDuration;
    if (timeRatio < 0.3) {
      // Too fast - possible guessing
      score *= 0.8;
    } else if (timeRatio > 3) {
      // Too slow - struggling
      score *= 0.9;
    }
  }

  return Math.max(0, Math.min(1, score));
}

/**
 * Calculate confidence in mastery estimate
 */
function calculateConfidence(events: LearningEvent[]): number {
  if (events.length === 0) return 0;
  if (events.length === 1) return 0.3;

  // More attempts = higher confidence (up to a point)
  const attemptConfidence = Math.min(1, events.length / 10);

  // Consistency check
  const scores = events.map((e) => calculateEventScore(e));
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / scores.length;
  const consistencyConfidence = Math.max(0, 1 - Math.sqrt(variance));

  // Recency - more recent data = higher confidence
  const mostRecent = new Date(events[0].timestamp);
  const daysSinceLastAttempt = (Date.now() - mostRecent.getTime()) / (1000 * 60 * 60 * 24);
  const recencyConfidence = Math.max(0, 1 - daysSinceLastAttempt / 30);

  return attemptConfidence * 0.4 + consistencyConfidence * 0.3 + recencyConfidence * 0.3;
}

/**
 * Calculate learning velocity (improvement rate)
 */
function calculateLearningVelocity(sortedEvents: LearningEvent[]): number {
  if (sortedEvents.length < 3) return 0;

  // Compare recent performance to earlier performance
  const recentCount = Math.min(3, Math.floor(sortedEvents.length / 2));
  const recentEvents = sortedEvents.slice(0, recentCount);
  const earlierEvents = sortedEvents.slice(-recentCount);

  const recentAvg = recentEvents.reduce((sum, e) => sum + calculateEventScore(e), 0) / recentCount;
  const earlierAvg =
    earlierEvents.reduce((sum, e) => sum + calculateEventScore(e), 0) / recentCount;

  // Positive = improving, negative = declining
  return recentAvg - earlierAvg;
}

/**
 * Get mastery status label
 */
function getMasteryStatus(masteryLevel: number, confidence: number): MasteryScore['status'] {
  if (masteryLevel === 0) return 'not_started';

  // Require minimum confidence for higher levels
  const adjustedMastery = masteryLevel * (0.5 + confidence * 0.5);

  if (adjustedMastery >= 0.9) return 'mastered';
  if (adjustedMastery >= 0.7) return 'proficient';
  if (adjustedMastery >= 0.5) return 'approaching';
  return 'developing';
}

/**
 * Calculate retention estimate based on forgetting curve
 * Ebbinghaus formula: R = e^(-t/S)
 */
function calculateRetentionEstimate(lastEvent?: LearningEvent): number {
  if (!lastEvent) return 0;

  const daysSinceLastAttempt =
    (Date.now() - new Date(lastEvent.timestamp).getTime()) / (1000 * 60 * 60 * 24);

  // Stability factor (higher mastery = slower forgetting)
  const eventScore = calculateEventScore(lastEvent);
  const stability = 5 + eventScore * 25; // 5-30 days

  // Ebbinghaus forgetting curve
  const retention = Math.exp(-daysSinceLastAttempt / stability);

  return Math.max(0, Math.min(1, retention));
}

/**
 * Calculate next review date based on spaced repetition
 */
function calculateNextReviewDate(masteryLevel: number, retention: number): string {
  // Base interval in days
  let interval = 1;

  if (masteryLevel > 0.9 && retention > 0.8) {
    interval = 21; // 3 weeks
  } else if (masteryLevel > 0.7 && retention > 0.6) {
    interval = 7; // 1 week
  } else if (masteryLevel > 0.5 && retention > 0.4) {
    interval = 3; // 3 days
  } else {
    interval = 1; // Tomorrow
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);
  return nextDate.toISOString();
}

/**
 * SM-2 Algorithm for spaced repetition
 * Quality ratings: 0-5 (0-2 = failure, 3-5 = success)
 */
export function updateSpacedRepetition(
  params: SpacedRepetitionParams,
  quality: QualityRating,
): SpacedRepetitionParams {
  let { easeFactor, interval, repetitions } = params;

  if (quality < 3) {
    // Failed - reset
    repetitions = 0;
    interval = 1;
  } else {
    // Success - increase interval
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);

  return {
    easeFactor,
    interval,
    repetitions,
    nextReviewDate: nextDate.toISOString(),
  };
}

/**
 * Convert learning event outcome to SM-2 quality rating
 */
export function eventToQualityRating(event: LearningEvent): QualityRating {
  if (!event.success) {
    // Failures: 0-2
    if (event.partialCredit && event.partialCredit > 0.5) return 2;
    if (event.partialCredit && event.partialCredit > 0) return 1;
    return 0;
  }

  // Successes: 3-5
  const score = calculateEventScore(event);

  if (score > 0.9) return 5; // Perfect
  if (score > 0.7) return 4; // Good with minor issues
  return 3; // Correct but difficult
}
