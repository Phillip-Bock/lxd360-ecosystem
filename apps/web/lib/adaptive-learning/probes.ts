/**
 * Intelligent Probe Selector
 *
 * Selects diagnostic questions that maximize information gain about
 * learner mastery. Used during cold-start to rapidly build learner profile.
 *
 * Strategy: Target skills with maximum uncertainty (P(mastery) ~ 0.5)
 */

import { logger } from '@/lib/logger';

import type { KnowledgeState } from './bkt';

const log = logger.scope('IntelligentProbes');

// =============================================================================
// TYPES
// =============================================================================

export interface Probe {
  id: string;
  skillId: string;
  question: {
    text: string;
    type: 'multiple_choice' | 'true_false';
    difficulty: number; // 0-1
  };
  /** Pre-calculated information gain potential */
  informationGain: number;
}

export interface ProbeResult {
  probeId: string;
  skillId: string;
  correct: boolean;
  latencyMs: number;
}

export interface ProbeSession {
  learnerId: string;
  probesCompleted: ProbeResult[];
  skillsAssessed: Set<string>;
  targetProbeCount: number;
  isComplete: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Default number of probes for initial assessment */
const DEFAULT_PROBE_COUNT = 7;

/** Minimum probes before we have useful data */
const MIN_PROBES = 3;

/** Maximum probes to avoid fatigue */
const MAX_PROBES = 12;

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Calculate entropy (uncertainty) of a mastery probability
 * Maximum entropy at P = 0.5
 */
export function calculateEntropy(pMastery: number): number {
  // Avoid log(0)
  const p = Math.max(0.001, Math.min(0.999, pMastery));
  const q = 1 - p;
  return -(p * Math.log2(p) + q * Math.log2(q));
}

/**
 * Calculate expected information gain from probing a skill
 * Higher gain = more useful to probe
 */
export function calculateInformationGain(state: KnowledgeState): number {
  // Base entropy from current uncertainty
  const currentEntropy = calculateEntropy(state.masteryProbability);

  // Bonus for skills with few observations (we know less about them)
  const observationBonus = Math.max(0, 1 - state.totalAttempts / 10);

  // Combined score (0-2 range, normalized to 0-1)
  return (currentEntropy + observationBonus) / 2;
}

/**
 * Create a new probe session for a learner
 */
export function createProbeSession(
  learnerId: string,
  targetCount: number = DEFAULT_PROBE_COUNT,
): ProbeSession {
  return {
    learnerId,
    probesCompleted: [],
    skillsAssessed: new Set(),
    targetProbeCount: Math.max(MIN_PROBES, Math.min(MAX_PROBES, targetCount)),
    isComplete: false,
  };
}

/**
 * Select the next best probe based on current skill states
 */
export function selectNextProbe(
  availableProbes: Probe[],
  skillStates: Map<string, KnowledgeState>,
  session: ProbeSession,
): Probe | null {
  // Filter out already-assessed skills (one probe per skill per session)
  const candidateProbes = availableProbes.filter((p) => !session.skillsAssessed.has(p.skillId));

  if (candidateProbes.length === 0) {
    log.debug('No more candidate probes available');
    return null;
  }

  // Score each probe by information gain
  const scoredProbes = candidateProbes.map((probe) => {
    const skillState = skillStates.get(probe.skillId);
    const informationGain = skillState ? calculateInformationGain(skillState) : 1.0; // Unknown skills have maximum information gain

    return { probe, informationGain };
  });

  // Sort by information gain (descending)
  scoredProbes.sort((a, b) => b.informationGain - a.informationGain);

  const selected = scoredProbes[0];

  log.debug('Probe selected', {
    probeId: selected.probe.id,
    skillId: selected.probe.skillId,
    informationGain: selected.informationGain.toFixed(3),
  });

  return selected.probe;
}

/**
 * Record a probe result and update session
 */
export function recordProbeResult(session: ProbeSession, result: ProbeResult): ProbeSession {
  const updatedSession: ProbeSession = {
    ...session,
    probesCompleted: [...session.probesCompleted, result],
    skillsAssessed: new Set([...session.skillsAssessed, result.skillId]),
    isComplete: session.probesCompleted.length + 1 >= session.targetProbeCount,
  };

  log.info('Probe recorded', {
    learnerId: session.learnerId,
    completed: updatedSession.probesCompleted.length,
    target: session.targetProbeCount,
    isComplete: updatedSession.isComplete,
  });

  return updatedSession;
}

/**
 * Get summary of probe session for Glass Box
 */
export function summarizeProbeSession(
  session: ProbeSession,
  skillStates?: Map<string, KnowledgeState>,
): {
  summary: string;
  strengths: string[];
  areasForGrowth: string[];
} {
  const correct = session.probesCompleted.filter((p) => p.correct).length;
  const total = session.probesCompleted.length;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  const strengths: string[] = [];
  const areasForGrowth: string[] = [];

  // Analyze skill states if provided
  if (skillStates) {
    for (const result of session.probesCompleted) {
      const state = skillStates.get(result.skillId);
      if (state) {
        if (state.masteryProbability >= 0.7) {
          strengths.push(state.skillName);
        } else if (state.masteryProbability < 0.4) {
          areasForGrowth.push(state.skillName);
        }
      }
    }
  }

  return {
    summary: `Initial assessment complete: ${correct}/${total} correct (${percentage}%). We've identified your starting point across ${session.skillsAssessed.size} skill areas.`,
    strengths: strengths.slice(0, 3),
    areasForGrowth: areasForGrowth.slice(0, 3),
  };
}

/**
 * Check if a probe session should continue
 */
export function shouldContinueProbing(session: ProbeSession): boolean {
  if (session.isComplete) {
    return false;
  }

  // Minimum probes not yet reached
  if (session.probesCompleted.length < MIN_PROBES) {
    return true;
  }

  // Target not yet reached and we have more probes
  return session.probesCompleted.length < session.targetProbeCount;
}

/**
 * Get progress percentage through probe session
 */
export function getProbeProgress(session: ProbeSession): number {
  if (session.targetProbeCount === 0) return 100;
  return Math.round((session.probesCompleted.length / session.targetProbeCount) * 100);
}
