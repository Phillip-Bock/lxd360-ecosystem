// ============================================================================
// INSPIRE IGNITE — JITAI Controller (Just-In-Time Adaptive Interventions)
// LRS-First Implementation: Step 3c
// Location: lib/xapi/jitai-controller.ts
// Version: 1.0.0
// ============================================================================
//
// PURPOSE: Determine when to trigger real-time learning interventions
// RESEARCH: Based on JITAI framework (Nahum-Shani et al., 2018)
//
// ============================================================================

import { getFirestore } from 'firebase-admin/firestore';
import type { FluencyZone, Modality } from './cognitive-utils';
import {
  DEFAULT_INTERVENTION_THRESHOLDS,
  shouldTriggerCognitiveLoadIntervention,
} from './cognitive-utils';

// ----------------------------------------------------------------------------
// TYPE DEFINITIONS
// ----------------------------------------------------------------------------

export type InterventionType =
  | 'modality_swap'
  | 'difficulty_adjust'
  | 'break_suggestion'
  | 'scaffold'
  | 'encouragement'
  | 'review_prompt'
  | 'cognitive_offload';

export interface Intervention {
  type: InterventionType;
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  suggested_action?: string;
  suggested_modality?: Modality;
  suggested_content_id?: string;
  expires_at?: Date;
  metadata?: Record<string, unknown>;
}

export interface InterventionCheckInput {
  tenantId: string;
  learnerId: string;
  cognitiveLoad: number;
  fluencyZone: FluencyZone;
  statement: {
    verb?: { id: string };
    result?: { success?: boolean; score?: { scaled?: number } };
    object?: { id: string };
    context?: {
      registration?: string;
      extensions?: Record<string, unknown>;
    };
  };
}

export interface LearnerState {
  struggle_streak: number;
  incorrect_streak: number;
  session_duration_minutes: number;
  interactions_this_session: number;
  last_break_at?: Date;
  current_modality?: Modality;
  preferred_modality?: Modality;
  avg_cognitive_load_session: number;
  frustration_index: number;
}

// ----------------------------------------------------------------------------
// INTERVENTION THRESHOLDS
// ----------------------------------------------------------------------------

const INTERVENTION_CONFIG = {
  // Streak thresholds
  struggle_streak_warning: 2,
  struggle_streak_critical: 4,
  incorrect_streak_warning: 3,
  incorrect_streak_critical: 5,

  // Session thresholds
  session_duration_break_suggest: 45, // minutes
  interactions_before_break_check: 30,

  // Cognitive thresholds
  cognitive_load_high: 7,
  cognitive_load_critical: 9,
  frustration_index_warning: 0.6,
  frustration_index_critical: 0.8,

  // Cooldown periods (prevent intervention spam)
  min_interval_same_type_minutes: 5,
  min_interval_any_type_minutes: 2,

  // Encouragement triggers
  correct_streak_for_encouragement: 5,
  score_threshold_for_praise: 0.9,
};

// ----------------------------------------------------------------------------
// INTERVENTION DECISION ENGINE
// ----------------------------------------------------------------------------

/**
 * Check if an intervention should be triggered based on current learner state
 *
 * This function evaluates multiple signals:
 * 1. Cognitive load levels
 * 2. Fluency zone patterns
 * 3. Streak patterns (struggle, incorrect)
 * 4. Session duration and fatigue
 * 5. Frustration signals
 *
 * @param input - Current interaction context
 * @returns Intervention to trigger, or null if none needed
 */
export async function checkInterventionTriggers(
  input: InterventionCheckInput,
): Promise<Intervention | null> {
  // Get learner's current session state
  const learnerState = await getLearnerSessionState(input.tenantId, input.learnerId);

  // Update state with current interaction
  const updatedState = updateStateWithInteraction(learnerState, input);

  // Check if we're in cooldown from recent intervention
  if (await isInCooldown(input.tenantId, input.learnerId)) {
    // Still save the updated state
    await saveLearnerSessionState(input.tenantId, input.learnerId, updatedState);
    return null;
  }

  // Evaluate intervention triggers in priority order
  const intervention = evaluateInterventionTriggers(input, updatedState);

  // Save updated state
  await saveLearnerSessionState(input.tenantId, input.learnerId, updatedState);

  // Log intervention if triggered
  if (intervention) {
    await logInterventionTrigger(input, intervention);
  }

  return intervention;
}

/**
 * Evaluate all intervention triggers and return highest priority
 */
function evaluateInterventionTriggers(
  input: InterventionCheckInput,
  state: LearnerState,
): Intervention | null {
  const candidates: Intervention[] = [];

  // 1. CRITICAL: Cognitive overload check
  const cognitiveCheck = shouldTriggerCognitiveLoadIntervention(
    input.cognitiveLoad,
    DEFAULT_INTERVENTION_THRESHOLDS,
  );

  if (cognitiveCheck.level === 'critical') {
    candidates.push({
      type: 'cognitive_offload',
      reason: "Your cognitive load is very high. Let's simplify.",
      priority: 'critical',
      suggested_action: 'break_content_into_chunks',
    });
  } else if (cognitiveCheck.level === 'warning') {
    candidates.push({
      type: 'scaffold',
      reason: 'This content seems challenging. Would you like some guidance?',
      priority: 'high',
    });
  }

  // 2. HIGH: Struggle streak detection
  if (state.struggle_streak >= INTERVENTION_CONFIG.struggle_streak_critical) {
    candidates.push({
      type: 'modality_swap',
      reason: `You've been in the struggle zone for ${state.struggle_streak} interactions. A different approach might help.`,
      priority: 'high',
      suggested_modality: suggestAlternativeModality(state.current_modality),
    });
  } else if (state.struggle_streak >= INTERVENTION_CONFIG.struggle_streak_warning) {
    candidates.push({
      type: 'scaffold',
      reason: "Let's slow down and review the foundations.",
      priority: 'medium',
    });
  }

  // 3. HIGH: Incorrect streak detection
  if (state.incorrect_streak >= INTERVENTION_CONFIG.incorrect_streak_critical) {
    candidates.push({
      type: 'review_prompt',
      reason: `You've missed ${state.incorrect_streak} in a row. Reviewing earlier material might help.`,
      priority: 'high',
      suggested_action: 'navigate_to_prerequisite',
    });
  } else if (state.incorrect_streak >= INTERVENTION_CONFIG.incorrect_streak_warning) {
    candidates.push({
      type: 'difficulty_adjust',
      reason: "This might be too challenging right now. Let's try something easier.",
      priority: 'medium',
    });
  }

  // 4. MEDIUM: Frustration detection
  if (state.frustration_index >= INTERVENTION_CONFIG.frustration_index_critical) {
    candidates.push({
      type: 'break_suggestion',
      reason: 'You seem frustrated. A short break can help reset your focus.',
      priority: 'high',
    });
  } else if (state.frustration_index >= INTERVENTION_CONFIG.frustration_index_warning) {
    candidates.push({
      type: 'encouragement',
      reason: "Learning takes effort. You're making progress even when it feels hard.",
      priority: 'medium',
    });
  }

  // 5. MEDIUM: Session duration / fatigue check
  if (state.session_duration_minutes >= INTERVENTION_CONFIG.session_duration_break_suggest) {
    const minutesSinceBreak = state.last_break_at
      ? (Date.now() - state.last_break_at.getTime()) / 60000
      : state.session_duration_minutes;

    if (minutesSinceBreak >= INTERVENTION_CONFIG.session_duration_break_suggest) {
      candidates.push({
        type: 'break_suggestion',
        reason: `You've been learning for ${Math.round(state.session_duration_minutes)} minutes. Your brain consolidates learning during rest.`,
        priority: 'medium',
      });
    }
  }

  // 6. LOW: Positive reinforcement (encouragement)
  if (
    input.statement.result?.success &&
    input.statement.result?.score?.scaled &&
    input.statement.result.score.scaled >= INTERVENTION_CONFIG.score_threshold_for_praise
  ) {
    candidates.push({
      type: 'encouragement',
      reason: "Excellent work! You're demonstrating strong mastery.",
      priority: 'low',
    });
  }

  // Return highest priority intervention
  if (candidates.length === 0) {
    return null;
  }

  // Sort by priority
  const priorityOrder: Record<Intervention['priority'], number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  candidates.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return candidates[0];
}

// ----------------------------------------------------------------------------
// STATE MANAGEMENT
// ----------------------------------------------------------------------------

/**
 * Get learner's current session state from Firestore
 */
async function getLearnerSessionState(tenantId: string, learnerId: string): Promise<LearnerState> {
  const db = getFirestore();
  const sessionRef = db
    .collection('tenants')
    .doc(tenantId)
    .collection('learner_sessions')
    .doc(learnerId);

  const doc = await sessionRef.get();

  if (!doc.exists) {
    // Return default state for new session
    return {
      struggle_streak: 0,
      incorrect_streak: 0,
      session_duration_minutes: 0,
      interactions_this_session: 0,
      avg_cognitive_load_session: 5,
      frustration_index: 0,
    };
  }

  return doc.data() as LearnerState;
}

/**
 * Update state with current interaction
 */
function updateStateWithInteraction(
  state: LearnerState,
  input: InterventionCheckInput,
): LearnerState {
  const newState = { ...state };

  // Update interaction count
  newState.interactions_this_session++;

  // Update streaks based on fluency zone
  if (input.fluencyZone === 'struggle') {
    newState.struggle_streak++;
  } else {
    newState.struggle_streak = 0;
  }

  // Update incorrect streak
  if (input.statement.result?.success === false) {
    newState.incorrect_streak++;
  } else if (input.statement.result?.success === true) {
    newState.incorrect_streak = 0;
  }

  // Update rolling average cognitive load
  const alpha = 0.2; // Exponential smoothing factor
  newState.avg_cognitive_load_session =
    alpha * input.cognitiveLoad + (1 - alpha) * newState.avg_cognitive_load_session;

  // Update frustration index (based on struggle streaks and cognitive load)
  newState.frustration_index = calculateFrustrationIndex(newState, input);

  return newState;
}

/**
 * Calculate frustration index based on multiple signals
 */
function calculateFrustrationIndex(state: LearnerState, input: InterventionCheckInput): number {
  let index = 0;

  // Struggle streak contribution
  index += Math.min(state.struggle_streak * 0.15, 0.45);

  // Incorrect streak contribution
  index += Math.min(state.incorrect_streak * 0.1, 0.3);

  // Cognitive load contribution
  if (input.cognitiveLoad > 7) {
    index += (input.cognitiveLoad - 7) * 0.1;
  }

  return Math.min(1, index);
}

/**
 * Save learner session state
 */
async function saveLearnerSessionState(
  tenantId: string,
  learnerId: string,
  state: LearnerState,
): Promise<void> {
  const db = getFirestore();
  const sessionRef = db
    .collection('tenants')
    .doc(tenantId)
    .collection('learner_sessions')
    .doc(learnerId);

  await sessionRef.set(state, { merge: true });
}

/**
 * Check if learner is in intervention cooldown
 */
async function isInCooldown(tenantId: string, learnerId: string): Promise<boolean> {
  const db = getFirestore();
  const recentRef = db
    .collection('tenants')
    .doc(tenantId)
    .collection('recent_interventions')
    .doc(learnerId);

  const doc = await recentRef.get();
  if (!doc.exists) return false;

  const data = doc.data();
  const lastInterventionAt = data?.last_intervention_at?.toDate();

  if (!lastInterventionAt) return false;

  const minutesSinceLastIntervention = (Date.now() - lastInterventionAt.getTime()) / 60000;

  return minutesSinceLastIntervention < INTERVENTION_CONFIG.min_interval_any_type_minutes;
}

/**
 * Log intervention trigger for analytics
 */
async function logInterventionTrigger(
  input: InterventionCheckInput,
  intervention: Intervention,
): Promise<void> {
  const db = getFirestore();

  // Update cooldown tracker
  const recentRef = db
    .collection('tenants')
    .doc(input.tenantId)
    .collection('recent_interventions')
    .doc(input.learnerId);

  await recentRef.set({
    last_intervention_at: new Date(),
    last_intervention_type: intervention.type,
  });

  // Log to intervention history
  const historyRef = db
    .collection('tenants')
    .doc(input.tenantId)
    .collection('intervention_history')
    .doc();

  await historyRef.set({
    learner_id: input.learnerId,
    intervention_type: intervention.type,
    intervention_reason: intervention.reason,
    intervention_priority: intervention.priority,
    triggered_at: new Date(),
    cognitive_load: input.cognitiveLoad,
    fluency_zone: input.fluencyZone,
    session_id: input.statement.context?.registration,
    content_id: input.statement.object?.id,
  });
}

// ----------------------------------------------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------------------------------------------

/**
 * Suggest an alternative modality based on current modality
 */
function suggestAlternativeModality(current?: Modality): Modality {
  const modalityFallbacks: Record<Modality, Modality> = {
    textual: 'visual',
    visual: 'auditory',
    auditory: 'kinesthetic',
    kinesthetic: 'visual',
    social_async: 'textual',
    gamified: 'visual',
    reflective: 'social_async',
    contextual_situated: 'visual',
  };

  return current ? modalityFallbacks[current] : 'visual';
}

// ----------------------------------------------------------------------------
// EXPORTS
// ----------------------------------------------------------------------------

export const JITAIController = {
  checkInterventionTriggers,
  INTERVENTION_CONFIG,
};

export default JITAIController;
