// ============================================================================
// INSPIRE IGNITE — Cognitive Utilities Library
// LRS-First Implementation: Step 3a
// Location: lib/xapi/cognitive-utils.ts
// Version: 1.0.0
// ============================================================================

// ----------------------------------------------------------------------------
// TYPE DEFINITIONS
// ----------------------------------------------------------------------------

export type ICDTLevel = 'recall' | 'apply' | 'analyze' | 'evaluate';
export type FluencyZone = 'too_fast' | 'fluency' | 'thinking' | 'struggle';
export type Modality =
  | 'visual'
  | 'auditory'
  | 'textual'
  | 'kinesthetic'
  | 'social_async'
  | 'gamified'
  | 'reflective'
  | 'contextual_situated';

export type EngagementLevel =
  | 'passive'
  | 'reflective'
  | 'active'
  | 'collaborative'
  | 'exploratory'
  | 'immersive';

export interface FluencyThresholds {
  too_fast_max_ms: number;
  fluency_max_ms: number;
  thinking_max_ms: number;
}

export interface CognitiveLoadInput {
  hesitation_ms?: number;
  icdt_level?: ICDTLevel;
  self_report?: number;
  frustration_signals?: number;
  focus_depth?: number;
}

export interface CognitiveLoadFactors {
  intrinsic: number;
  extraneous: number;
  germane: number;
  total: number;
  sources: {
    intrinsic: string[];
    extraneous: string[];
    germane: string[];
  };
}

// ----------------------------------------------------------------------------
// FLUENCY THRESHOLD CONSTANTS
// Based on Cognitive Load Theory research (Van Merriënboer & Sweller, 2005)
// ----------------------------------------------------------------------------

export const FLUENCY_THRESHOLDS: Record<ICDTLevel, FluencyThresholds> = {
  recall: {
    too_fast_max_ms: 800, // Below 800ms = likely guessing
    fluency_max_ms: 3000, // 800-3000ms = fluent retrieval
    thinking_max_ms: 8000, // 3000-8000ms = effortful recall
    // Above 8000ms = struggle zone
  },
  apply: {
    too_fast_max_ms: 1500,
    fluency_max_ms: 6000,
    thinking_max_ms: 15000,
  },
  analyze: {
    too_fast_max_ms: 3000,
    fluency_max_ms: 12000,
    thinking_max_ms: 30000,
  },
  evaluate: {
    too_fast_max_ms: 5000,
    fluency_max_ms: 20000,
    thinking_max_ms: 60000,
  },
};

// Cognitive load weights for ICL Framework
const ICDT_INTRINSIC_WEIGHTS: Record<ICDTLevel, number> = {
  recall: 2,
  apply: 4,
  analyze: 6,
  evaluate: 8,
};

// ----------------------------------------------------------------------------
// FLUENCY ZONE CLASSIFICATION
// ----------------------------------------------------------------------------

/**
 * Classify a response time into a fluency zone based on ICDT level
 *
 * @param hesitation_ms - Response time in milliseconds
 * @param icdt_level - Cognitive depth level of the task
 * @returns The fluency zone classification
 *
 * @example
 * classifyFluencyZone(2500, 'recall') // => 'fluency'
 * classifyFluencyZone(500, 'recall')  // => 'too_fast' (likely guessing)
 * classifyFluencyZone(15000, 'recall') // => 'struggle'
 */
export function classifyFluencyZone(hesitation_ms: number, icdt_level: ICDTLevel): FluencyZone {
  const thresholds = FLUENCY_THRESHOLDS[icdt_level];

  if (hesitation_ms < thresholds.too_fast_max_ms) {
    return 'too_fast';
  }
  if (hesitation_ms < thresholds.fluency_max_ms) {
    return 'fluency';
  }
  if (hesitation_ms < thresholds.thinking_max_ms) {
    return 'thinking';
  }
  return 'struggle';
}

/**
 * Get the fluency thresholds for a specific ICDT level
 */
export function getFluencyThresholds(icdt_level: ICDTLevel): FluencyThresholds {
  return FLUENCY_THRESHOLDS[icdt_level];
}

// ----------------------------------------------------------------------------
// COGNITIVE LOAD CALCULATION (ICL FRAMEWORK)
// ----------------------------------------------------------------------------

/**
 * Calculate cognitive load using the INSPIRE Cognitive Load (ICL) Framework
 *
 * Based on Cognitive Load Theory (Sweller, 1988):
 * - Intrinsic Load: Inherent complexity of the material
 * - Extraneous Load: How information is presented (design friction)
 * - Germane Load: Mental effort devoted to learning (schema construction)
 *
 * @param input - Cognitive load input signals
 * @returns Estimated cognitive load (1-10 scale)
 */
export async function calculateCognitiveLoad(input: CognitiveLoadInput): Promise<number> {
  const factors = calculateCognitiveLoadFactors(input);
  return factors.total;
}

/**
 * Calculate detailed cognitive load factors
 */
export function calculateCognitiveLoadFactors(input: CognitiveLoadInput): CognitiveLoadFactors {
  const sources = {
    intrinsic: [] as string[],
    extraneous: [] as string[],
    germane: [] as string[],
  };

  // INTRINSIC LOAD (content complexity)
  let intrinsicLoad = 3; // Base intrinsic load

  if (input.icdt_level) {
    intrinsicLoad = ICDT_INTRINSIC_WEIGHTS[input.icdt_level];
    sources.intrinsic.push(`ICDT level: ${input.icdt_level}`);
  }

  // EXTRANEOUS LOAD (processing friction)
  let extraneousLoad = 2; // Base extraneous load

  // Hesitation indicates processing difficulty
  if (input.hesitation_ms !== undefined && input.icdt_level) {
    const zone = classifyFluencyZone(input.hesitation_ms, input.icdt_level);

    switch (zone) {
      case 'too_fast':
        extraneousLoad -= 1; // Might be too easy or guessing
        sources.extraneous.push('Response too fast (possible guess)');
        break;
      case 'fluency':
        extraneousLoad += 0; // Optimal
        sources.extraneous.push('Fluent response');
        break;
      case 'thinking':
        extraneousLoad += 2;
        sources.extraneous.push('Extended processing time');
        break;
      case 'struggle':
        extraneousLoad += 4;
        sources.extraneous.push('Struggle zone detected');
        break;
    }
  }

  // Frustration signals add to extraneous load
  if (input.frustration_signals !== undefined && input.frustration_signals > 0) {
    extraneousLoad += Math.min(input.frustration_signals * 0.5, 3);
    sources.extraneous.push(`Frustration signals: ${input.frustration_signals}`);
  }

  // GERMANE LOAD (learning effort)
  let germaneLoad = 3; // Base germane load

  // Focus depth indicates engagement
  if (input.focus_depth !== undefined) {
    germaneLoad = 2 + input.focus_depth * 4; // Scale 0-1 to 2-6
    sources.germane.push(`Focus depth: ${(input.focus_depth * 100).toFixed(0)}%`);
  }

  // Self-reported load is a strong signal
  if (input.self_report !== undefined) {
    // Weight self-report heavily (40% of total)
    const selfReportContribution = input.self_report * 0.4;
    sources.germane.push(`Self-reported load: ${input.self_report}/10`);

    return {
      intrinsic: Math.min(10, Math.max(1, intrinsicLoad)),
      extraneous: Math.min(10, Math.max(1, extraneousLoad)),
      germane: Math.min(10, Math.max(1, germaneLoad)),
      total: Math.min(
        10,
        Math.max(
          1,
          intrinsicLoad * 0.25 + extraneousLoad * 0.25 + germaneLoad * 0.1 + selfReportContribution,
        ),
      ),
      sources,
    };
  }

  // Without self-report, calculate weighted average
  const total = intrinsicLoad * 0.4 + extraneousLoad * 0.4 + germaneLoad * 0.2;

  return {
    intrinsic: Math.min(10, Math.max(1, intrinsicLoad)),
    extraneous: Math.min(10, Math.max(1, extraneousLoad)),
    germane: Math.min(10, Math.max(1, germaneLoad)),
    total: Math.min(10, Math.max(1, total)),
    sources,
  };
}

// ----------------------------------------------------------------------------
// MASTERY DECAY CALCULATION
// ----------------------------------------------------------------------------

/**
 * Calculate decayed mastery probability based on time since last practice
 *
 * Uses exponential decay model: P(t) = P0 * e^(-λt)
 * where λ is calibrated to halve mastery every 30 days without practice
 *
 * @param currentMastery - Current P(mastery) from 0 to 1
 * @param daysSinceLastPractice - Days since last interaction
 * @param decayRate - Decay constant (default: 0.023 for 30-day half-life)
 * @returns Decayed mastery probability
 */
export function calculateMasteryDecay(
  currentMastery: number,
  daysSinceLastPractice: number,
  decayRate: number = 0.023, // ln(2)/30 ≈ 0.023
): number {
  const decayedMastery = currentMastery * Math.exp(-decayRate * daysSinceLastPractice);
  return Math.max(0, Math.min(1, decayedMastery));
}

/**
 * Check if a skill needs review based on decayed mastery
 *
 * @param decayedMastery - Current decayed P(mastery)
 * @param threshold - Mastery threshold (default: 0.7)
 * @returns Whether the skill needs review
 */
export function needsReview(decayedMastery: number, threshold: number = 0.7): boolean {
  return decayedMastery < threshold;
}

// ----------------------------------------------------------------------------
// GUESS DETECTION
// ----------------------------------------------------------------------------

/**
 * Estimate probability that a correct answer was a guess
 *
 * Based on:
 * - Response time relative to fluency thresholds
 * - Historical guess rate for this learner
 * - Number of answer choices (if applicable)
 *
 * @param hesitation_ms - Response time
 * @param icdt_level - Task complexity
 * @param numChoices - Number of answer choices (for MCQ)
 * @returns Estimated guess probability (0-1)
 */
export function estimateGuessProbability(
  hesitation_ms: number,
  icdt_level: ICDTLevel,
  numChoices: number = 4,
): number {
  const thresholds = FLUENCY_THRESHOLDS[icdt_level];

  // Base guess probability from number of choices
  const baseGuessProb = 1 / numChoices;

  // If response is in "too fast" zone, higher guess probability
  if (hesitation_ms < thresholds.too_fast_max_ms) {
    // Scale: faster = more likely guess
    const speedFactor = 1 - hesitation_ms / thresholds.too_fast_max_ms;
    return Math.min(1, baseGuessProb + speedFactor * (1 - baseGuessProb) * 0.8);
  }

  // If in fluency zone, low guess probability
  if (hesitation_ms < thresholds.fluency_max_ms) {
    return baseGuessProb * 0.2; // 20% of base
  }

  // In thinking or struggle zone, very low guess probability
  return baseGuessProb * 0.1;
}

// ----------------------------------------------------------------------------
// INTERVENTION THRESHOLD CHECKS
// ----------------------------------------------------------------------------

export interface InterventionThresholds {
  cognitive_load_high: number;
  cognitive_load_critical: number;
  frustration_warning: number;
  frustration_critical: number;
  struggle_streak: number;
}

export const DEFAULT_INTERVENTION_THRESHOLDS: InterventionThresholds = {
  cognitive_load_high: 7,
  cognitive_load_critical: 9,
  frustration_warning: 3,
  frustration_critical: 5,
  struggle_streak: 3,
};

/**
 * Check if cognitive load warrants intervention
 */
export function shouldTriggerCognitiveLoadIntervention(
  cognitiveLoad: number,
  thresholds: InterventionThresholds = DEFAULT_INTERVENTION_THRESHOLDS,
): { should: boolean; level: 'none' | 'warning' | 'critical' } {
  if (cognitiveLoad >= thresholds.cognitive_load_critical) {
    return { should: true, level: 'critical' };
  }
  if (cognitiveLoad >= thresholds.cognitive_load_high) {
    return { should: true, level: 'warning' };
  }
  return { should: false, level: 'none' };
}

// ----------------------------------------------------------------------------
// EXPORTS
// ----------------------------------------------------------------------------

export const CognitiveUtils = {
  classifyFluencyZone,
  getFluencyThresholds,
  calculateCognitiveLoad,
  calculateCognitiveLoadFactors,
  calculateMasteryDecay,
  needsReview,
  estimateGuessProbability,
  shouldTriggerCognitiveLoadIntervention,
  FLUENCY_THRESHOLDS,
  DEFAULT_INTERVENTION_THRESHOLDS,
};

export default CognitiveUtils;
