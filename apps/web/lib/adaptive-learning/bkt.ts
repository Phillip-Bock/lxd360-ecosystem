// ============================================================================
// TYPES
// ============================================================================

export type MasteryLevel = 'novice' | 'developing' | 'proficient' | 'mastered';
export type CognitiveLoadLevel = 'low' | 'optimal' | 'high' | 'overload';

/**
 * BKT parameters for a skill
 */
export interface BKTParams {
  pInit: number; // P(L₀): Prior probability of knowing (0.1-0.5)
  pLearn: number; // P(T): Learning rate per opportunity (0.05-0.3)
  pGuess: number; // P(G): Guess probability (0.1-0.3)
  pSlip: number; // P(S): Slip probability (0.05-0.2)
}

/**
 * Default BKT parameters - research-validated starting points
 */
export const DEFAULT_BKT_PARAMS: BKTParams = {
  pInit: 0.3,
  pLearn: 0.1,
  pGuess: 0.2,
  pSlip: 0.1,
};

/**
 * Safety-critical BKT parameters - stricter for regulated industries
 */
export const SAFETY_CRITICAL_BKT_PARAMS: BKTParams = {
  pInit: 0.2, // Lower initial - assume less prior knowledge
  pLearn: 0.12, // Slightly faster learning for motivated trainees
  pGuess: 0.15, // Lower guess tolerance
  pSlip: 0.08, // Lower slip tolerance
};

/**
 * Knowledge state for a learner-skill pair
 */
export interface KnowledgeState {
  learnerId: string;
  skillId: string;
  skillName: string;

  // BKT state
  masteryProbability: number; // Current P(L): 0-1
  masteryLevel: MasteryLevel;
  bktParams: BKTParams;

  // Performance history
  totalAttempts: number;
  successfulAttempts: number;
  streakCorrect: number;
  streakIncorrect: number;

  // Timing metrics
  avgResponseTimeMs: number | null;
  expectedResponseTimeMs: number | null;

  // Safety-critical: confidence calibration (-1 to 1)
  // Positive = underconfident, Negative = overconfident
  confidenceCalibration: number | null;

  // SM-2 spaced repetition
  easinessFactor: number;
  intervalDays: number;
  repetitions: number;
  lastPractice: Date | null;
  nextReviewDue: Date | null;

  // Metadata
  updatedAt: Date;
  tenantId: string | null;
}

/**
 * Record of a single learning attempt with behavioral telemetry
 */
export interface AttemptRecord {
  skillId: string;
  correct: boolean;
  responseTimeMs: number;

  // Behavioral signals
  confidenceRating?: number; // Self-reported 0-1
  revisionCount?: number; // Answer changes before submit
  timeToFirstActionMs?: number; // Did they read the question?
  distractorsTouched?: string[]; // Which wrong answers they considered
  rageClicks?: number; // Frustration indicator

  timestamp?: Date;
}

/**
 * Insights produced after processing an attempt
 */
export interface AttemptInsights {
  masteryChange: number; // Delta in mastery probability
  newMastery: number;
  newMasteryLevel: MasteryLevel;

  guessDetected: boolean;
  guessProbability: number;

  confidenceWarning: boolean;
  confidenceWarningType?: 'overconfident_error' | 'underconfident_correct';

  interventionRecommended: InterventionRecommendation | null;
}

/**
 * Intervention recommendation from the system
 */
export interface InterventionRecommendation {
  type: 'scaffolding' | 'misconception_correction' | 'engagement' | 'pathway_adjustment';
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  action: string;
  message: string;
}

// ============================================================================
// MASTERY LEVEL CONVERSION
// ============================================================================

/**
 * Convert mastery probability to discrete level
 */
export function getMasteryLevel(probability: number): MasteryLevel {
  if (probability >= 0.95) return 'mastered';
  if (probability >= 0.7) return 'proficient';
  if (probability >= 0.4) return 'developing';
  return 'novice';
}

// ============================================================================
// BAYESIAN KNOWLEDGE TRACING CORE
// ============================================================================

/**
 * Create initial knowledge state for a learner-skill pair
 */
export function createInitialKnowledgeState(
  learnerId: string,
  skillId: string,
  skillName: string,
  options: {
    params?: Partial<BKTParams>;
    expectedResponseTimeMs?: number;
    tenantId?: string | null;
    isSafetyCritical?: boolean;
  } = {},
): KnowledgeState {
  const baseParams = options.isSafetyCritical ? SAFETY_CRITICAL_BKT_PARAMS : DEFAULT_BKT_PARAMS;

  const params: BKTParams = { ...baseParams, ...options.params };

  return {
    learnerId,
    skillId,
    skillName,
    masteryProbability: params.pInit,
    masteryLevel: getMasteryLevel(params.pInit),
    bktParams: params,
    totalAttempts: 0,
    successfulAttempts: 0,
    streakCorrect: 0,
    streakIncorrect: 0,
    avgResponseTimeMs: null,
    expectedResponseTimeMs: options.expectedResponseTimeMs ?? null,
    confidenceCalibration: null,
    easinessFactor: 2.5,
    intervalDays: 1,
    repetitions: 0,
    lastPractice: null,
    nextReviewDue: null,
    updatedAt: new Date(),
    tenantId: options.tenantId ?? null,
  };
}

/**
 * Detect guessing behavior from behavioral signals
 * Returns probability (0-1) that this attempt was a guess
 */
export function detectGuessing(state: KnowledgeState, attempt: AttemptRecord): number {
  const signals: number[] = [];

  // Signal 1: Extremely fast response (didn't read/think)
  const RAPID_GUESS_RATIO = 0.1; // Less than 10% of expected time
  const MIN_READING_TIME_MS = 2000; // Minimum reasonable time

  if (state.expectedResponseTimeMs) {
    const timeRatio = attempt.responseTimeMs / state.expectedResponseTimeMs;
    if (timeRatio < RAPID_GUESS_RATIO) {
      signals.push(0.9); // Very strong guess indicator
    } else if (timeRatio < 0.3) {
      signals.push(0.6);
    }
  } else if (attempt.responseTimeMs < MIN_READING_TIME_MS) {
    signals.push(0.7);
  }

  // Signal 2: No distractor consideration (for MCQ)
  if (attempt.distractorsTouched?.length === 0 && attempt.responseTimeMs < 5000) {
    signals.push(0.4);
  }

  // Signal 3: Low prior mastery with correct answer
  if (state.masteryProbability < 0.3 && attempt.correct) {
    signals.push(0.3); // Correct despite low mastery - might be lucky
  }

  // Signal 4: No answer revision on hard question
  if ((attempt.revisionCount ?? 0) === 0 && state.masteryProbability < 0.5) {
    signals.push(0.2);
  }

  if (signals.length === 0) return 0;

  // Combine signals: P(at least one true) = 1 - product(1-p)
  const combined = 1 - signals.reduce((acc, s) => acc * (1 - s), 1);
  return Math.min(combined, 0.95); // Cap at 95%
}

/**
 * Apply confidence-based adjustment to mastery (safety-critical)
 */
function applyConfidenceAdjustment(
  posterior: number,
  correct: boolean,
  confidence: number,
): {
  adjustedMastery: number;
  warning: boolean;
  warningType?: 'overconfident_error' | 'underconfident_correct';
} {
  const OVERCONFIDENT_PENALTY = 0.15;

  if (!correct && confidence > 0.7) {
    // Overconfident error: dangerous misconception
    const penalty = OVERCONFIDENT_PENALTY * confidence;
    return {
      adjustedMastery: posterior * (1 - penalty),
      warning: true,
      warningType: 'overconfident_error',
    };
  }

  if (correct && confidence < 0.3) {
    // Underconfident correct: knows but doesn't realize
    const boost = 0.05 * (1 - confidence);
    return {
      adjustedMastery: Math.min(0.99, posterior + boost),
      warning: true,
      warningType: 'underconfident_correct',
    };
  }

  return { adjustedMastery: posterior, warning: false };
}

/**
 * Update SM-2 spaced repetition parameters
 */
function updateSpacedRepetition(
  state: KnowledgeState,
  attempt: AttemptRecord,
): { easinessFactor: number; intervalDays: number; repetitions: number; nextReviewDue: Date } {
  let { easinessFactor, intervalDays, repetitions } = state;

  // Map performance to SM-2 quality rating (0-5)
  let quality: number;
  if (attempt.correct) {
    if (attempt.responseTimeMs < (state.avgResponseTimeMs ?? 5000) * 0.5) {
      quality = 5; // Fast and correct = perfect
    } else if (attempt.confidenceRating && attempt.confidenceRating > 0.8) {
      quality = 5; // Confident and correct
    } else {
      quality = 4; // Correct with hesitation
    }
  } else {
    if (attempt.confidenceRating && attempt.confidenceRating > 0.5) {
      quality = 1; // Wrong despite confidence = concerning
    } else {
      quality = 2; // Wrong but uncertain
    }
  }

  // Update easiness factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easinessFactor = Math.max(
    1.3,
    easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );

  if (quality >= 3) {
    // Successful recall
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easinessFactor);
    }
    repetitions++;
  } else {
    // Failed recall - reset
    repetitions = 0;
    intervalDays = 1;
  }

  const nextReviewDue = new Date();
  nextReviewDue.setDate(nextReviewDue.getDate() + intervalDays);

  return { easinessFactor, intervalDays, repetitions, nextReviewDue };
}

/**
 * Determine if intervention is needed
 */
function recommendIntervention(
  state: KnowledgeState,
  insights: Partial<AttemptInsights>,
): InterventionRecommendation | null {
  // Condition 1: Multiple consecutive failures
  if (state.streakIncorrect >= 3) {
    return {
      type: 'scaffolding',
      severity: 'high',
      reason: `Streak of ${state.streakIncorrect} incorrect attempts`,
      action: 'provide_hint_or_simplify',
      message:
        "Let's try a different approach. Would you like to see a worked example or break this down into smaller steps?",
    };
  }

  // Condition 2: Overconfident error (safety critical)
  if (insights.confidenceWarning && insights.confidenceWarningType === 'overconfident_error') {
    return {
      type: 'misconception_correction',
      severity: 'critical',
      reason: 'Overconfident incorrect response detected',
      action: 'direct_instruction',
      message:
        "Let's pause and clarify an important concept. Your answer indicates a possible misconception that we should address.",
    };
  }

  // Condition 3: Guessing detected
  if (insights.guessDetected) {
    return {
      type: 'engagement',
      severity: 'medium',
      reason: 'Possible guessing behavior',
      action: 'require_explanation',
      message: 'Take your time to think through this one. Can you explain your reasoning?',
    };
  }

  // Condition 4: Mastery plateau
  if (state.totalAttempts >= 10 && state.masteryProbability < 0.5) {
    const successRate = state.successfulAttempts / state.totalAttempts;
    if (successRate < 0.4) {
      return {
        type: 'pathway_adjustment',
        severity: 'medium',
        reason: 'Low progress despite multiple attempts',
        action: 'prerequisite_review',
        message:
          "Let's strengthen the foundation. I'll guide you through some prerequisite concepts first.",
      };
    }
  }

  return null;
}

/**
 * Core BKT update function
 * Updates knowledge state based on a new learning attempt
 */
export function updateKnowledgeState(
  state: KnowledgeState,
  attempt: AttemptRecord,
): { updatedState: KnowledgeState; insights: AttemptInsights } {
  const { bktParams } = state;
  const priorMastery = state.masteryProbability;

  // Step 1: Detect guessing
  const guessProbability = detectGuessing(state, attempt);
  const guessDetected = guessProbability > 0.7;
  const effectivePGuess = guessDetected
    ? Math.max(bktParams.pGuess, guessProbability)
    : bktParams.pGuess;

  // Step 2: Core BKT Update using Bayes' theorem
  let posterior: number;

  if (attempt.correct) {
    // P(L|correct) = P(correct|L)P(L) / P(correct)
    const pCorrectGivenKnow = 1 - bktParams.pSlip;
    const pCorrectGivenNotKnow = effectivePGuess;
    const pCorrect = pCorrectGivenKnow * priorMastery + pCorrectGivenNotKnow * (1 - priorMastery);
    const pKnowGivenCorrect = (pCorrectGivenKnow * priorMastery) / pCorrect;

    // Apply learning opportunity
    posterior = pKnowGivenCorrect + (1 - pKnowGivenCorrect) * bktParams.pLearn;
  } else {
    // P(L|incorrect) = P(incorrect|L)P(L) / P(incorrect)
    const pIncorrectGivenKnow = bktParams.pSlip;
    const pIncorrectGivenNotKnow = 1 - effectivePGuess;
    const pIncorrect =
      pIncorrectGivenKnow * priorMastery + pIncorrectGivenNotKnow * (1 - priorMastery);
    posterior = (pIncorrectGivenKnow * priorMastery) / pIncorrect;

    // Still apply partial learning opportunity
    posterior = posterior + (1 - posterior) * bktParams.pLearn * 0.5;
  }

  // Step 3: Confidence adjustment (safety-critical)
  let confidenceWarning = false;
  let confidenceWarningType: 'overconfident_error' | 'underconfident_correct' | undefined;

  if (attempt.confidenceRating !== undefined) {
    const adjustment = applyConfidenceAdjustment(
      posterior,
      attempt.correct,
      attempt.confidenceRating,
    );
    posterior = adjustment.adjustedMastery;
    confidenceWarning = adjustment.warning;
    confidenceWarningType = adjustment.warningType;
  }

  // Step 4: Apply bounds
  posterior = Math.max(0.001, Math.min(0.999, posterior));

  // Step 5: Update streaks
  const streakCorrect = attempt.correct ? state.streakCorrect + 1 : 0;
  const streakIncorrect = attempt.correct ? 0 : state.streakIncorrect + 1;

  // Step 6: Update response time average (exponential moving average)
  const alpha = 0.3;
  const avgResponseTimeMs =
    state.avgResponseTimeMs === null
      ? attempt.responseTimeMs
      : alpha * attempt.responseTimeMs + (1 - alpha) * state.avgResponseTimeMs;

  // Step 7: Update confidence calibration
  let confidenceCalibration = state.confidenceCalibration;
  if (attempt.confidenceRating !== undefined) {
    const accuracyPoint = attempt.correct ? 1.0 : 0.0;
    const calibrationError = Math.abs(attempt.confidenceRating - accuracyPoint);
    const newCalibration = 1.0 - calibrationError;

    if (confidenceCalibration === null) {
      confidenceCalibration = newCalibration;
    } else {
      const calAlpha = Math.min(0.3, 3 / (state.totalAttempts + 1));
      confidenceCalibration = calAlpha * newCalibration + (1 - calAlpha) * confidenceCalibration;
    }
  }

  // Step 8: Update spaced repetition
  const sr = updateSpacedRepetition(state, attempt);

  // Build insights
  const insights: AttemptInsights = {
    masteryChange: posterior - priorMastery,
    newMastery: posterior,
    newMasteryLevel: getMasteryLevel(posterior),
    guessDetected,
    guessProbability,
    confidenceWarning,
    confidenceWarningType,
    interventionRecommended: null,
  };

  // Build updated state
  const updatedState: KnowledgeState = {
    ...state,
    masteryProbability: posterior,
    masteryLevel: getMasteryLevel(posterior),
    totalAttempts: state.totalAttempts + 1,
    successfulAttempts: state.successfulAttempts + (attempt.correct ? 1 : 0),
    streakCorrect,
    streakIncorrect,
    avgResponseTimeMs,
    confidenceCalibration,
    easinessFactor: sr.easinessFactor,
    intervalDays: sr.intervalDays,
    repetitions: sr.repetitions,
    lastPractice: attempt.timestamp ?? new Date(),
    nextReviewDue: sr.nextReviewDue,
    updatedAt: new Date(),
  };

  // Check for intervention
  insights.interventionRecommended = recommendIntervention(updatedState, insights);

  return { updatedState, insights };
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Get recommended content based on Zone of Proximal Development
 */
export function getNextBestContent(
  knowledgeStates: KnowledgeState[],
  availableContent: Array<{
    contentId: string;
    requiredSkills: string[];
    teachesSkills: string[];
    difficultyLevel: number;
  }>,
): { contentId: string; score: number; reason: string } | null {
  const masteryBySkill = new Map(knowledgeStates.map((s) => [s.skillId, s.masteryProbability]));
  const reviewDue = new Set(
    knowledgeStates
      .filter((s) => s.nextReviewDue && s.nextReviewDue <= new Date())
      .map((s) => s.skillId),
  );

  const scored = availableContent
    .map((content) => {
      // Check prerequisites
      const prereqMastery = content.requiredSkills.map((s) => masteryBySkill.get(s) ?? 0.3);
      if (prereqMastery.length > 0 && Math.min(...prereqMastery) < 0.6) {
        return { ...content, score: -1, reason: 'prerequisites_not_met' };
      }

      // Calculate target mastery
      const targetMastery = content.teachesSkills.map((s) => masteryBySkill.get(s) ?? 0.3);
      const avgTargetMastery =
        targetMastery.length > 0
          ? targetMastery.reduce((a, b) => a + b, 0) / targetMastery.length
          : 0.5;

      // ZPD scoring
      let zpdScore: number;
      let reason: string;

      if (avgTargetMastery >= 0.4 && avgTargetMastery <= 0.7) {
        zpdScore = 1.0;
        reason = 'optimal_challenge';
      } else if (avgTargetMastery > 0.9) {
        zpdScore = 0.2;
        reason = 'already_mastered';
      } else if (avgTargetMastery < 0.3) {
        zpdScore = 0.4;
        reason = 'may_be_challenging';
      } else {
        zpdScore = 0.7;
        reason = 'good_fit';
      }

      // Boost for spaced repetition
      const hasReviewDue = content.teachesSkills.some((s) => reviewDue.has(s));
      if (hasReviewDue) {
        zpdScore += 0.3;
        reason = 'due_for_review';
      }

      return { ...content, score: zpdScore, reason };
    })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored[0] ?? null;
}
