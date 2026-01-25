/**
 * Adaptive Learning Orchestrator
 *
 * Manages the dynamic transition between model weights based on
 * interaction count. Implements the "20 Interaction Threshold" pattern.
 *
 * Interactions 0-5:   90% BKT priors, 10% observed
 * Interactions 6-20:  Linear blend
 * Interactions 20+:   10% BKT anchor, 90% observed/temporal
 */

import { logger } from '@/lib/logger';

import type { HesitationSignal } from './hesitation';

const log = logger.scope('Orchestrator');

// =============================================================================
// TYPES
// =============================================================================

export interface ModelWeights {
  /** Weight for BKT (Bayesian priors) */
  bkt: number;
  /** Weight for observed/temporal patterns */
  temporal: number;
  /** Current phase description */
  phase: 'cold_start' | 'transition' | 'personalized';
}

export interface OrchestratorState {
  learnerId: string;
  /** Total interactions across all skills */
  totalInteractions: number;
  /** Current model weights */
  weights: ModelWeights;
  /** Timestamp of last interaction */
  lastInteraction: Date;
  /** Running average response time (for hesitation baseline) */
  averageResponseTimeMs: number;
}

export interface InteractionRecord {
  skillId: string;
  correct: boolean;
  latencyMs: number;
  hesitation: HesitationSignal;
  timestamp: Date;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const COLD_START_THRESHOLD = 5;
const PERSONALIZED_THRESHOLD = 20;

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Calculate model weights based on interaction count
 */
export function calculateModelWeights(interactionCount: number): ModelWeights {
  if (interactionCount <= COLD_START_THRESHOLD) {
    return {
      bkt: 0.9,
      temporal: 0.1,
      phase: 'cold_start',
    };
  }

  if (interactionCount >= PERSONALIZED_THRESHOLD) {
    return {
      bkt: 0.1,
      temporal: 0.9,
      phase: 'personalized',
    };
  }

  // Linear interpolation between thresholds
  const t =
    (interactionCount - COLD_START_THRESHOLD) / (PERSONALIZED_THRESHOLD - COLD_START_THRESHOLD);

  return {
    bkt: 0.9 - 0.8 * t,
    temporal: 0.1 + 0.8 * t,
    phase: 'transition',
  };
}

/**
 * Create initial orchestrator state for a new learner
 */
export function createOrchestratorState(learnerId: string): OrchestratorState {
  return {
    learnerId,
    totalInteractions: 0,
    weights: calculateModelWeights(0),
    lastInteraction: new Date(),
    averageResponseTimeMs: 5000, // Default baseline
  };
}

/**
 * Update orchestrator state after an interaction
 */
export function updateOrchestratorState(
  state: OrchestratorState,
  interaction: InteractionRecord,
): OrchestratorState {
  const newTotalInteractions = state.totalInteractions + 1;

  // Update running average response time (exponential moving average)
  const alpha = 0.1; // Smoothing factor
  const newAverageResponseTime =
    alpha * interaction.latencyMs + (1 - alpha) * state.averageResponseTimeMs;

  const newWeights = calculateModelWeights(newTotalInteractions);

  // Log phase transitions
  if (newWeights.phase !== state.weights.phase) {
    log.info('Phase transition', {
      learnerId: state.learnerId,
      from: state.weights.phase,
      to: newWeights.phase,
      interactions: newTotalInteractions,
    });
  }

  return {
    ...state,
    totalInteractions: newTotalInteractions,
    weights: newWeights,
    lastInteraction: interaction.timestamp,
    averageResponseTimeMs: Math.round(newAverageResponseTime),
  };
}

/**
 * Blend predictions from multiple models using current weights
 */
export function blendPredictions(
  bktPrediction: number,
  temporalPrediction: number | null,
  weights: ModelWeights,
): number {
  // If no temporal prediction available (cold start), use BKT only
  if (temporalPrediction === null) {
    return bktPrediction;
  }

  const blended = weights.bkt * bktPrediction + weights.temporal * temporalPrediction;

  // Clamp to valid probability range
  return Math.max(0.001, Math.min(0.999, blended));
}

/**
 * Get explanation of current model state for Glass Box
 */
export function explainModelState(state: OrchestratorState): string {
  switch (state.weights.phase) {
    case 'cold_start':
      return `We're still getting to know your learning style (${state.totalInteractions}/${PERSONALIZED_THRESHOLD} interactions). Recommendations are based on general patterns.`;
    case 'transition':
      return `Building your personalized profile (${state.totalInteractions}/${PERSONALIZED_THRESHOLD} interactions). Recommendations are becoming more tailored to you.`;
    case 'personalized':
      return `Recommendations are fully personalized based on ${state.totalInteractions} interactions with your learning patterns.`;
  }
}

/**
 * Check if the learner is still in cold start phase
 */
export function isInColdStart(state: OrchestratorState): boolean {
  return state.weights.phase === 'cold_start';
}

/**
 * Check if the learner has reached personalization threshold
 */
export function isPersonalized(state: OrchestratorState): boolean {
  return state.weights.phase === 'personalized';
}

/**
 * Get the number of interactions remaining until personalization
 */
export function interactionsUntilPersonalized(state: OrchestratorState): number {
  return Math.max(0, PERSONALIZED_THRESHOLD - state.totalInteractions);
}
