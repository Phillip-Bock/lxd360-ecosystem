/**
 * Cognitive Load Index (CLI) Thresholds
 * Based on Sweller's Cognitive Load Theory and learning science research
 */
export const COGNITIVE_LOAD_THRESHOLDS = {
  /** Below this = low cognitive load (potential boredom) */
  LOW: 15,
  /** Below this = optimal learning zone (flow state) */
  OPTIMAL: 40,
  /** Below this = high load, needs scaffolding support */
  HIGH: 70,
  /** Maximum cognitive load before overwhelm */
  MAX: 100,
} as const;

export type CognitiveLoadLevel = 'low' | 'optimal' | 'high' | 'overload';

/**
 * Determine cognitive load level from CLI score
 */
export function getCognitiveLoadLevel(cli: number): CognitiveLoadLevel {
  if (cli < COGNITIVE_LOAD_THRESHOLDS.LOW) return 'low';
  if (cli < COGNITIVE_LOAD_THRESHOLDS.OPTIMAL) return 'optimal';
  if (cli < COGNITIVE_LOAD_THRESHOLDS.HIGH) return 'high';
  return 'overload';
}

/**
 * Cognitive Load Indicator Colors
 */
export const COGNITIVE_LOAD_COLORS = {
  low: 'var(--info-500)',
  optimal: 'var(--success-500)',
  high: 'var(--warning-500)',
  overload: 'var(--danger-500)',
} as const;
