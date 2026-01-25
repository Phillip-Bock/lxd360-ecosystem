/**
 * Skill Decay Calculator
 *
 * Models the forgetting curve using exponential decay.
 * Memory fades over time; mastery scores must account for elapsed time
 * since last practice.
 *
 * Formula: P(retained) = P(mastery) * e^(-lambda * t)
 * Where lambda is the decay rate and t is time since last practice
 */

import { logger } from '@/lib/logger';

import type { KnowledgeState } from './bkt';

const log = logger.scope('SkillDecay');

// =============================================================================
// TYPES
// =============================================================================

export interface DecayParams {
  /** Base decay rate (per day) - higher = faster forgetting */
  lambda: number;
  /** Minimum retention floor (mastery never drops below this) */
  floor: number;
  /** Strength factor from repetitions (more practice = slower decay) */
  strengthFactor: number;
}

export interface DecayedState {
  /** Original mastery before decay */
  originalMastery: number;
  /** Mastery after applying decay */
  decayedMastery: number;
  /** Days since last practice */
  daysSinceLastPractice: number;
  /** Percentage retained */
  retentionRate: number;
  /** Whether review is recommended */
  needsReview: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const DEFAULT_DECAY_PARAMS: DecayParams = {
  lambda: 0.1, // 10% decay per day baseline
  floor: 0.1, // Never drop below 10%
  strengthFactor: 0.1, // Each repetition reduces decay by 10%
};

/** Review threshold - recommend review if retention drops below this */
const REVIEW_THRESHOLD = 0.7;

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Calculate effective decay rate based on practice strength
 * More practice = slower forgetting
 */
export function calculateDecayRate(
  opportunities: number,
  streak: number,
  params: DecayParams = DEFAULT_DECAY_PARAMS,
): number {
  // Strength from total opportunities (diminishing returns)
  const opportunityStrength = Math.log(opportunities + 1) * params.strengthFactor;

  // Bonus from recent streak (consecutive correct = stronger memory)
  const streakStrength = streak * params.strengthFactor * 0.5;

  // Effective decay rate (minimum 10% of base rate)
  const effectiveLambda = Math.max(
    params.lambda * 0.1,
    params.lambda - opportunityStrength - streakStrength,
  );

  return effectiveLambda;
}

/**
 * Apply decay to a mastery score based on time elapsed
 */
export function applyDecay(
  state: KnowledgeState,
  asOf: Date = new Date(),
  params: DecayParams = DEFAULT_DECAY_PARAMS,
): DecayedState {
  // If no last practice recorded, assume no decay
  if (!state.lastPractice) {
    return {
      originalMastery: state.masteryProbability,
      decayedMastery: state.masteryProbability,
      daysSinceLastPractice: 0,
      retentionRate: 1.0,
      needsReview: false,
    };
  }

  const daysSinceLastPractice =
    (asOf.getTime() - state.lastPractice.getTime()) / (1000 * 60 * 60 * 24);

  // No decay if practiced today
  if (daysSinceLastPractice < 1) {
    return {
      originalMastery: state.masteryProbability,
      decayedMastery: state.masteryProbability,
      daysSinceLastPractice: 0,
      retentionRate: 1.0,
      needsReview: false,
    };
  }

  // Calculate effective decay rate
  const lambda = calculateDecayRate(state.totalAttempts, state.streakCorrect, params);

  // Apply exponential decay: P(retained) = P(mastery) * e^(-lambda * t)
  const retentionRate = Math.exp(-lambda * daysSinceLastPractice);

  // Calculate decayed mastery (with floor)
  const decayedMastery = Math.max(params.floor, state.masteryProbability * retentionRate);

  const result: DecayedState = {
    originalMastery: state.masteryProbability,
    decayedMastery,
    daysSinceLastPractice: Math.round(daysSinceLastPractice),
    retentionRate: Math.round(retentionRate * 100) / 100,
    needsReview: retentionRate < REVIEW_THRESHOLD,
  };

  if (result.needsReview) {
    log.debug('Skill decay detected', {
      skillId: state.skillId,
      daysSince: result.daysSinceLastPractice,
      retention: result.retentionRate,
    });
  }

  return result;
}

/**
 * Get all skills that need review due to decay
 */
export function getDecayedSkills(
  skillStates: Map<string, KnowledgeState>,
  asOf: Date = new Date(),
  params: DecayParams = DEFAULT_DECAY_PARAMS,
): Array<{ skillId: string; skillName: string; decayedState: DecayedState }> {
  const decayed: Array<{ skillId: string; skillName: string; decayedState: DecayedState }> = [];

  for (const [skillId, state] of skillStates) {
    const decayedState = applyDecay(state, asOf, params);
    if (decayedState.needsReview) {
      decayed.push({ skillId, skillName: state.skillName, decayedState });
    }
  }

  // Sort by urgency (lowest retention first)
  decayed.sort((a, b) => a.decayedState.retentionRate - b.decayedState.retentionRate);

  return decayed;
}

/**
 * Get explanation of decay for Glass Box
 */
export function explainDecay(decayed: DecayedState, skillName: string): string {
  if (!decayed.needsReview) {
    return `Your ${skillName} skills are fresh.`;
  }

  if (decayed.retentionRate < 0.3) {
    return `It's been ${decayed.daysSinceLastPractice} days since you practiced ${skillName}. Memory research shows significant fade - a quick review will restore your mastery.`;
  }

  if (decayed.retentionRate < 0.5) {
    return `${skillName} is starting to fade after ${decayed.daysSinceLastPractice} days. A brief refresher will prevent forgetting.`;
  }

  return `Time for a ${skillName} check-in. Brief practice now will strengthen long-term retention.`;
}

/**
 * Calculate optimal review timing based on decay parameters
 * Returns the number of days until mastery drops below threshold
 */
export function calculateOptimalReviewTiming(
  state: KnowledgeState,
  targetRetention: number = 0.8,
  params: DecayParams = DEFAULT_DECAY_PARAMS,
): number {
  const lambda = calculateDecayRate(state.totalAttempts, state.streakCorrect, params);

  // Solve: targetRetention = e^(-lambda * t)
  // t = -ln(targetRetention) / lambda
  const optimalDays = -Math.log(targetRetention) / lambda;

  return Math.max(1, Math.round(optimalDays));
}

/**
 * Get decay urgency level for prioritization
 */
export function getDecayUrgency(decayed: DecayedState): 'critical' | 'high' | 'medium' | 'low' {
  if (decayed.retentionRate < 0.3) return 'critical';
  if (decayed.retentionRate < 0.5) return 'high';
  if (decayed.retentionRate < 0.7) return 'medium';
  return 'low';
}
