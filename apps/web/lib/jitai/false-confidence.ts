/**
 * False Confidence Detector
 *
 * Implements Artemis vision: "Flag 'False Confidence' (people who think they
 * know safety rules but are actually guessing)."
 *
 * Mathematical definition:
 * FalseConfidence = self_reported_confidence > (BKT_mastery - hesitation_penalty)
 */

import { v4 as uuid } from 'uuid';

import type { KnowledgeState } from '@/lib/adaptive-learning/bkt';
import type { HesitationSignal } from '@/lib/adaptive-learning/hesitation';
import { logger } from '@/lib/logger';

import type { FalseConfidenceSignal, Intervention } from './types';

const log = logger.scope('FalseConfidence');

// =============================================================================
// CONSTANTS
// =============================================================================

/** Divergence threshold for mild false confidence */
const MILD_THRESHOLD = 0.15;

/** Divergence threshold for moderate false confidence */
const MODERATE_THRESHOLD = 0.25;

/** Divergence threshold for severe false confidence */
const SEVERE_THRESHOLD = 0.4;

/** Hesitation penalty mapping */
const HESITATION_PENALTIES: Record<HesitationSignal['confidence'], number> = {
  high: 0,
  medium: 0.05,
  low: 0.15,
  uncertain: 0.25,
};

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Calculate hesitation penalty from signal
 */
export function calculateHesitationPenalty(hesitation: HesitationSignal): number {
  let penalty = HESITATION_PENALTIES[hesitation.confidence];

  // Additional penalty for suspected guesses
  if (hesitation.possibleGuess) {
    penalty += 0.1;
  }

  return Math.min(0.3, penalty); // Cap at 0.3
}

/**
 * Detect false confidence
 */
export function detectFalseConfidence(
  learnerId: string,
  skillId: string,
  selfReportedConfidence: number,
  knowledgeState: KnowledgeState,
  hesitation: HesitationSignal,
): FalseConfidenceSignal {
  const hesitationPenalty = calculateHesitationPenalty(hesitation);
  const adjustedMastery = knowledgeState.masteryProbability - hesitationPenalty;
  const divergence = selfReportedConfidence - adjustedMastery;

  // Determine if false confidence
  const isFalseConfidence = divergence > MILD_THRESHOLD;

  // Determine severity
  let severity: FalseConfidenceSignal['severity'];
  if (divergence > SEVERE_THRESHOLD) {
    severity = 'severe';
  } else if (divergence > MODERATE_THRESHOLD) {
    severity = 'moderate';
  } else {
    severity = 'mild';
  }

  const signal: FalseConfidenceSignal = {
    learnerId,
    skillId,
    selfReportedConfidence,
    bktMastery: knowledgeState.masteryProbability,
    hesitationPenalty,
    divergence: Math.round(divergence * 100) / 100,
    isFalseConfidence,
    severity,
  };

  if (isFalseConfidence) {
    log.warn('False confidence detected', {
      learnerId,
      skillId,
      selfReported: selfReportedConfidence.toFixed(2),
      bktMastery: knowledgeState.masteryProbability.toFixed(2),
      divergence: divergence.toFixed(2),
      severity,
    });
  }

  return signal;
}

/**
 * Generate intervention for false confidence
 */
export function generateFalseConfidenceIntervention(
  signal: FalseConfidenceSignal,
  skillName: string,
): Intervention {
  const messages: Record<FalseConfidenceSignal['severity'], string> = {
    mild: `You seem confident about ${skillName}, but let's do a quick check to make sure it's solid.`,
    moderate: `I noticed some hesitation when you answered ${skillName} questions. Let's review the fundamentals to build true confidence.`,
    severe: `Your responses suggest you may be overestimating your ${skillName} knowledge. This is common! Let's work through some practice together.`,
  };

  const intervention: Intervention = {
    id: uuid(),
    type: 'confidence_check',
    trigger: {
      signal: 'hesitation_latency',
      condition: 'above',
      threshold: signal.divergence,
      windowMs: 300000, // Last 5 minutes
    },
    priority: signal.severity === 'severe' ? 'high' : 'medium',
    message: messages[signal.severity],
    actionLabel: 'Practice Quiz',
    targetSkillIds: [signal.skillId],
    createdAt: new Date(),
  };

  return intervention;
}

/**
 * Get Glass Box explanation for false confidence
 */
export function explainFalseConfidence(signal: FalseConfidenceSignal, skillName: string): string {
  const selfPercent = Math.round(signal.selfReportedConfidence * 100);
  const actualPercent = Math.round((signal.bktMastery - signal.hesitationPenalty) * 100);

  return (
    `Your self-reported confidence in ${skillName} is ${selfPercent}%, ` +
    `but your response patterns suggest actual mastery around ${actualPercent}%. ` +
    `This gap of ${Math.round(signal.divergence * 100)}% is called "false confidence" — ` +
    `it's very common and nothing to worry about! ` +
    `Targeted practice will help align your confidence with true competence.`
  );
}
