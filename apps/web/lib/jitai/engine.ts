/**
 * JITAI Engine — Just-In-Time Adaptive Intervention Orchestrator
 *
 * Central coordinator for all behavioral interventions.
 * Monitors signals, evaluates triggers, and dispatches interventions.
 */

import type { KnowledgeState } from '@/lib/adaptive-learning/bkt';
import type { HesitationSignal } from '@/lib/adaptive-learning/hesitation';
import { logger } from '@/lib/logger';

import * as DoomScroll from './doom-scroll';
import * as FalseConfidence from './false-confidence';
import * as MicroBridgeGen from './micro-bridge';
import * as SpeedBump from './speed-bump';
import type {
  BehavioralSignal,
  ContentBlock,
  Intervention,
  JITAISkillGap,
  MicroBridge,
} from './types';

const log = logger.scope('JITAIEngine');

// =============================================================================
// TYPES
// =============================================================================

export interface JITAIContext {
  learnerId: string;
  sessionId: string;
  currentContentId?: string;
  skillStates: Map<string, KnowledgeState>;
  recentGaps: JITAISkillGap[];
}

export interface JITAIResult {
  intervention: Intervention | null;
  microBridge: MicroBridge | null;
  signals: BehavioralSignal[];
  glassBoxExplanation?: string;
}

// =============================================================================
// INTERVENTION QUEUE
// =============================================================================

interface QueuedIntervention {
  intervention: Intervention;
  expiresAt: Date;
}

const interventionQueues = new Map<string, QueuedIntervention[]>();

/** Default intervention expiry time in ms (5 minutes) */
const DEFAULT_EXPIRY_MS = 5 * 60 * 1000;

// =============================================================================
// CORE ENGINE
// =============================================================================

/**
 * Process a content block completion event
 */
export function onBlockComplete(
  context: JITAIContext,
  block: ContentBlock,
  timeSpentMs: number,
): JITAIResult {
  const signals: BehavioralSignal[] = [];
  let intervention: Intervention | null = null;
  let microBridge: MicroBridge | null = null;
  let glassBoxExplanation: string | undefined;

  // 1. Record engagement and check for doom-scrolling
  const metrics = DoomScroll.recordBlockEngagement(context.learnerId, block, timeSpentMs);

  const doomSignal = DoomScroll.generateSignal(context.learnerId);
  if (doomSignal) signals.push(doomSignal);

  // 2. Check if speed bump should trigger
  if (SpeedBump.shouldTriggerSpeedBump(metrics)) {
    intervention = SpeedBump.generateSpeedBump(context.learnerId, metrics, block.id);
    glassBoxExplanation = SpeedBump.explainSpeedBump(metrics);

    // Queue the intervention
    queueIntervention(context.learnerId, intervention);

    // If severe, also generate micro-bridge
    if (intervention.priority === 'high' && context.recentGaps.length > 0) {
      microBridge = MicroBridgeGen.generateMicroBridge(context.learnerId, context.recentGaps);
    }
  }

  log.debug('Block completion processed', {
    learnerId: context.learnerId,
    blockId: block.id,
    timeSpentMs,
    interventionTriggered: !!intervention,
  });

  return { intervention, microBridge, signals, glassBoxExplanation };
}

/**
 * Process an assessment response event
 */
export function onAssessmentResponse(
  context: JITAIContext,
  skillId: string,
  skillName: string,
  correct: boolean,
  selfReportedConfidence: number,
  hesitation: HesitationSignal,
): JITAIResult {
  const signals: BehavioralSignal[] = [];
  let intervention: Intervention | null = null;
  let microBridge: MicroBridge | null = null;
  let glassBoxExplanation: string | undefined;

  // Get knowledge state for this skill
  const knowledgeState = context.skillStates.get(skillId);
  if (!knowledgeState) {
    log.warn('No knowledge state for skill', { skillId });
    return { intervention: null, microBridge: null, signals };
  }

  // Add hesitation signal
  signals.push({
    type: 'hesitation_latency',
    timestamp: new Date(),
    value: hesitation.latencyMs,
    metadata: { confidence: hesitation.confidence },
  });

  // Check for false confidence
  const fcSignal = FalseConfidence.detectFalseConfidence(
    context.learnerId,
    skillId,
    selfReportedConfidence,
    knowledgeState,
    hesitation,
  );

  if (fcSignal.isFalseConfidence) {
    intervention = FalseConfidence.generateFalseConfidenceIntervention(fcSignal, skillName);
    glassBoxExplanation = FalseConfidence.explainFalseConfidence(fcSignal, skillName);

    // Queue the intervention
    queueIntervention(context.learnerId, intervention);

    // For severe false confidence, generate micro-bridge
    if (fcSignal.severity === 'severe') {
      const gap = MicroBridgeGen.createSkillGapFromMastery(
        skillId,
        skillName,
        knowledgeState.masteryProbability,
        0.8,
      );
      microBridge = MicroBridgeGen.generateMicroBridge(context.learnerId, [gap]);
    }
  }

  log.debug('Assessment response processed', {
    learnerId: context.learnerId,
    skillId,
    correct,
    falseConfidenceDetected: fcSignal.isFalseConfidence,
  });

  return { intervention, microBridge, signals, glassBoxExplanation };
}

/**
 * Queue an intervention for a learner
 */
function queueIntervention(learnerId: string, intervention: Intervention): void {
  const queue = interventionQueues.get(learnerId) || [];
  const expiresAt = new Date(Date.now() + DEFAULT_EXPIRY_MS);

  queue.push({ intervention, expiresAt });
  interventionQueues.set(learnerId, queue);

  log.debug('Intervention queued', {
    learnerId,
    interventionId: intervention.id,
    type: intervention.type,
    expiresAt,
  });
}

/**
 * Get pending interventions for a learner
 */
export function getPendingInterventions(learnerId: string): Intervention[] {
  const queue = interventionQueues.get(learnerId) || [];
  const now = new Date();

  // Filter expired and return valid
  const valid = queue.filter((q) => q.expiresAt > now);
  interventionQueues.set(learnerId, valid);

  return valid.map((q) => q.intervention);
}

/**
 * Dismiss an intervention
 */
export function dismissIntervention(learnerId: string, interventionId: string): void {
  const queue = interventionQueues.get(learnerId) || [];
  const updated = queue.filter((q) => q.intervention.id !== interventionId);
  interventionQueues.set(learnerId, updated);

  log.info('Intervention dismissed', { learnerId, interventionId });
}

/**
 * Accept an intervention (user chose to engage)
 */
export function acceptIntervention(learnerId: string, interventionId: string): void {
  const queue = interventionQueues.get(learnerId) || [];
  const item = queue.find((q) => q.intervention.id === interventionId);

  if (item) {
    item.intervention.acceptedAt = new Date();
    log.info('Intervention accepted', { learnerId, interventionId });

    // Reset doom-scroll session if it was a speed bump
    if (item.intervention.type === 'speed_bump') {
      DoomScroll.resetSession(learnerId);
    }
  }
}

/**
 * Clear all interventions for a learner (e.g., session end)
 */
export function clearInterventions(learnerId: string): void {
  interventionQueues.delete(learnerId);
  log.debug('Interventions cleared', { learnerId });
}

/**
 * Create a new JITAI context for a learning session
 */
export function createContext(
  learnerId: string,
  sessionId: string,
  skillStates?: Map<string, KnowledgeState>,
): JITAIContext {
  return {
    learnerId,
    sessionId,
    skillStates: skillStates || new Map(),
    recentGaps: [],
  };
}

/**
 * Add a skill gap to the context for potential micro-bridge generation
 */
export function addGapToContext(context: JITAIContext, gap: JITAISkillGap): void {
  // Keep only the most recent 10 gaps
  context.recentGaps = [...context.recentGaps.slice(-9), gap];
}
