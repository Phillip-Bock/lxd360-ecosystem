// =============================================================================
// DEEP XAPI PROFILE — Extended Learning Analytics
// =============================================================================
// Addresses "False Confidence" detection, engagement patterns, and multi-modality
// tracking for the INSPIRE Ignite LMS Player.
// =============================================================================

import type { XAPIContext, XAPIResult, XAPIStatement } from './index';

// =============================================================================
// CUSTOM VERBS (LXD360 Vocabulary)
// =============================================================================

/**
 * LXD360 custom verb definitions for deep tracking.
 */
export const DEEP_VERBS = {
  /** Content was consumed (video/audio/text) */
  consumed: {
    id: 'https://lxd360.com/xapi/verbs/consumed',
    display: { 'en-US': 'consumed' },
  },
  /** Learner hesitated before answering (false confidence indicator) */
  hesitated: {
    id: 'https://lxd360.com/xapi/verbs/hesitated',
    display: { 'en-US': 'hesitated' },
  },
  /** Content was skimmed (low engagement indicator) */
  skimmed: {
    id: 'https://lxd360.com/xapi/verbs/skimmed',
    display: { 'en-US': 'skimmed' },
  },
  /** Modality was switched (e.g., video → audio) */
  switched_modality: {
    id: 'https://lxd360.com/xapi/verbs/switched-modality',
    display: { 'en-US': 'switched modality' },
  },
  /** Content was resumed from a bookmark */
  resumed_from_bookmark: {
    id: 'https://lxd360.com/xapi/verbs/resumed-from-bookmark',
    display: { 'en-US': 'resumed from bookmark' },
  },
  /** Content was downloaded for offline use */
  downloaded_offline: {
    id: 'https://lxd360.com/xapi/verbs/downloaded-offline',
    display: { 'en-US': 'downloaded for offline' },
  },
  /** Synced offline data back to server */
  synced_offline: {
    id: 'https://lxd360.com/xapi/verbs/synced-offline',
    display: { 'en-US': 'synced offline data' },
  },
  /** Entered background/Podcast mode */
  entered_background: {
    id: 'https://lxd360.com/xapi/verbs/entered-background',
    display: { 'en-US': 'entered background mode' },
  },
  /** Exited background/Podcast mode */
  exited_background: {
    id: 'https://lxd360.com/xapi/verbs/exited-background',
    display: { 'en-US': 'exited background mode' },
  },
} as const;

export type DeepVerbId = (typeof DEEP_VERBS)[keyof typeof DEEP_VERBS]['id'];

// =============================================================================
// EXTENSION IRIS (LXD360 Namespace)
// =============================================================================

/**
 * LXD360 extension IRIs for deep analytics.
 */
export const DEEP_EXTENSION_IRIS = {
  // ─── Hesitation/Confidence Tracking ────────────────────────────────────────
  hesitation: 'https://lxd360.com/xapi/extensions/hesitation',
  confidence_indicator: 'https://lxd360.com/xapi/extensions/confidence-indicator',
  answer_changes: 'https://lxd360.com/xapi/extensions/answer-changes',
  time_to_first_answer: 'https://lxd360.com/xapi/extensions/time-to-first-answer',
  time_to_final_answer: 'https://lxd360.com/xapi/extensions/time-to-final-answer',

  // ─── Engagement Tracking ───────────────────────────────────────────────────
  engagement: 'https://lxd360.com/xapi/extensions/engagement',
  scroll_velocity: 'https://lxd360.com/xapi/extensions/scroll-velocity',
  focus_score: 'https://lxd360.com/xapi/extensions/focus-score',
  interaction_pattern: 'https://lxd360.com/xapi/extensions/interaction-pattern',
  mouse_idle_time: 'https://lxd360.com/xapi/extensions/mouse-idle-time',
  tab_switches: 'https://lxd360.com/xapi/extensions/tab-switches',
  window_blur_time: 'https://lxd360.com/xapi/extensions/window-blur-time',

  // ─── Modality Tracking ─────────────────────────────────────────────────────
  modality: 'https://lxd360.com/xapi/extensions/modality',
  consumption_mode: 'https://lxd360.com/xapi/extensions/consumption-mode',
  playback_speed: 'https://lxd360.com/xapi/extensions/playback-speed',
  background_mode: 'https://lxd360.com/xapi/extensions/background-mode',
  screen_locked: 'https://lxd360.com/xapi/extensions/screen-locked',
  previous_modality: 'https://lxd360.com/xapi/extensions/previous-modality',

  // ─── Offline/Sync Tracking ─────────────────────────────────────────────────
  offline_status: 'https://lxd360.com/xapi/extensions/offline-status',
  sync_latency: 'https://lxd360.com/xapi/extensions/sync-latency',
  offline_duration: 'https://lxd360.com/xapi/extensions/offline-duration',
  conflict_resolution: 'https://lxd360.com/xapi/extensions/conflict-resolution',

  // ─── Device/Context ────────────────────────────────────────────────────────
  device_battery_level: 'https://lxd360.com/xapi/extensions/device-battery-level',
  network_type: 'https://lxd360.com/xapi/extensions/network-type',
  bandwidth_estimate: 'https://lxd360.com/xapi/extensions/bandwidth-estimate',

  // ─── Learning Science ──────────────────────────────────────────────────────
  mastery_probability: 'https://lxd360.com/xapi/extensions/mastery-probability',
  bkt_params: 'https://lxd360.com/xapi/extensions/bkt-params',
  sm2_params: 'https://lxd360.com/xapi/extensions/sm2-params',
  skill_delta: 'https://lxd360.com/xapi/extensions/skill-delta',
} as const;

// =============================================================================
// CONFIDENCE INDICATOR TYPES
// =============================================================================

/**
 * Confidence levels derived from hesitation analysis.
 * Used to detect "false confidence" in assessments.
 */
export type ConfidenceIndicator =
  | 'mastery' // Fast, no changes — true mastery
  | 'confident' // Reasonable speed, minimal changes
  | 'uncertain' // Some hesitation, changes made
  | 'guessing'; // Long delay or many changes

/**
 * Interaction patterns detected during content consumption.
 */
export type InteractionPattern =
  | 'deep' // Thorough engagement (scrolling, highlighting, notes)
  | 'skimming' // Fast scrolling, minimal interaction
  | 'clicking-through' // Minimal time per item, just advancing
  | 'revisiting'; // Going back to review previous content

/**
 * Consumption modality for multi-modal content.
 */
export type ConsumptionMode = 'video' | 'audio' | 'text' | 'interactive';

/**
 * Network connection type for adaptive delivery.
 */
export type NetworkType = 'wifi' | '4g' | '3g' | '2g' | 'offline' | 'unknown';

// =============================================================================
// HESITATION EXTENSION DATA
// =============================================================================

/**
 * Hesitation data tracked during quiz/assessment interactions.
 * Used to detect false confidence and uncertain knowledge.
 */
export interface HesitationData {
  /** Number of times the answer was changed */
  answer_changes: number;
  /** Time from question display to first answer selection (ms) */
  time_to_first_answer_ms: number;
  /** Time from question display to final answer submission (ms) */
  time_to_final_answer_ms: number;
  /** Calculated confidence indicator */
  confidence_indicator: ConfidenceIndicator;
  /** Sequence of answers selected (for pattern analysis) */
  answer_sequence?: string[];
  /** Time spent on each answer before changing (ms) */
  dwell_times_ms?: number[];
}

/**
 * Hesitation extension structure for xAPI result.
 */
export interface HesitationExtension {
  [key: string]: HesitationData;
}

// =============================================================================
// ENGAGEMENT EXTENSION DATA
// =============================================================================

/**
 * Engagement data tracked during content consumption.
 * Used to detect skimming vs. deep engagement.
 */
export interface EngagementData {
  /** Average scroll velocity (pixels per second) */
  scroll_velocity: number;
  /** Focus score (0-100) based on time-on-task vs. idle */
  focus_score: number;
  /** Detected interaction pattern */
  interaction_pattern: InteractionPattern;
  /** Total mouse idle time (ms) */
  mouse_idle_time_ms: number;
  /** Number of tab switches during content */
  tab_switches: number;
  /** Total time window was blurred (ms) */
  window_blur_time_ms: number;
  /** Total interaction events (clicks, scrolls, etc.) */
  interaction_count: number;
  /** Highlights or notes created */
  annotations_created: number;
}

/**
 * Engagement extension structure for xAPI result.
 */
export interface EngagementExtension {
  [key: string]: EngagementData;
}

// =============================================================================
// MODALITY EXTENSION DATA
// =============================================================================

/**
 * Modality data tracked for multi-modal content (Podcast Mode).
 */
export interface ModalityData {
  /** How the content was consumed */
  consumption_mode: ConsumptionMode;
  /** Playback speed multiplier */
  playback_speed: number;
  /** Was consumed in background/Podcast mode */
  background_mode: boolean;
  /** Was screen locked during consumption */
  screen_locked: boolean;
  /** Previous modality (if switched) */
  previous_modality?: ConsumptionMode;
  /** Time spent in each modality (ms) */
  modality_durations?: Record<ConsumptionMode, number>;
}

/**
 * Modality extension structure for xAPI context.
 */
export interface ModalityExtension {
  [key: string]: ModalityData;
}

// =============================================================================
// OFFLINE/SYNC EXTENSION DATA
// =============================================================================

/**
 * Offline sync data for tracking sync status.
 */
export interface OfflineSyncData {
  /** Was this statement created offline */
  created_offline: boolean;
  /** Time spent offline before sync (seconds) */
  offline_duration_seconds: number;
  /** Sync latency from creation to server receipt (ms) */
  sync_latency_ms: number;
  /** Conflict resolution strategy used (if any) */
  conflict_resolution?: 'server_wins' | 'local_wins' | 'merge' | 'none';
  /** Number of statements in sync batch */
  batch_size?: number;
}

// =============================================================================
// LEARNING SCIENCE EXTENSION DATA
// =============================================================================

/**
 * BKT (Bayesian Knowledge Tracing) parameters.
 */
export interface BKTParams {
  /** Prior probability of knowing the skill */
  p_know: number;
  /** Probability of learning on each opportunity */
  p_learn: number;
  /** Probability of guessing correctly */
  p_guess: number;
  /** Probability of slipping (knowing but getting wrong) */
  p_slip: number;
}

/**
 * SM-2 (Spaced Repetition) parameters.
 */
export interface SM2Params {
  /** Easiness factor (>= 1.3) */
  easiness_factor: number;
  /** Repetition count */
  repetition_count: number;
  /** Current interval (days) */
  interval_days: number;
  /** Next review date (ISO 8601) */
  next_review_date: string;
}

/**
 * Learning science extension data.
 */
export interface LearningScienceData {
  /** Current mastery probability (0-1) */
  mastery_probability: number;
  /** Change in mastery from this interaction */
  mastery_delta: number;
  /** BKT parameters */
  bkt_params?: BKTParams;
  /** SM-2 parameters */
  sm2_params?: SM2Params;
  /** Skill IDs affected */
  skill_ids: string[];
  /** Per-skill mastery changes */
  skill_deltas?: Record<string, number>;
}

// =============================================================================
// DEEP XAPI RESULT (Extended)
// =============================================================================

/**
 * Deep xAPI Result — Extends standard xAPI result with deep analytics.
 */
export interface DeepXAPIResult extends XAPIResult {
  extensions?: {
    /** Hesitation tracking for assessments */
    [DEEP_EXTENSION_IRIS.hesitation]?: HesitationData;
    /** Engagement tracking for content */
    [DEEP_EXTENSION_IRIS.engagement]?: EngagementData;
    /** Learning science metrics */
    [DEEP_EXTENSION_IRIS.mastery_probability]?: number;
    [DEEP_EXTENSION_IRIS.bkt_params]?: BKTParams;
    [DEEP_EXTENSION_IRIS.skill_delta]?: number;
    /** Allow other extensions */
    [key: string]: unknown;
  };
}

// =============================================================================
// DEEP XAPI CONTEXT (Extended)
// =============================================================================

/**
 * Deep xAPI Context — Extends standard xAPI context with modality/device info.
 */
export interface DeepXAPIContext extends XAPIContext {
  extensions?: {
    /** Modality tracking */
    [DEEP_EXTENSION_IRIS.modality]?: ModalityData;
    /** Offline sync status */
    [DEEP_EXTENSION_IRIS.offline_status]?: OfflineSyncData;
    /** Device battery level (0-100) */
    [DEEP_EXTENSION_IRIS.device_battery_level]?: number;
    /** Network type */
    [DEEP_EXTENSION_IRIS.network_type]?: NetworkType;
    /** Bandwidth estimate (kbps) */
    [DEEP_EXTENSION_IRIS.bandwidth_estimate]?: number;
    /** Allow other extensions */
    [key: string]: unknown;
  };
}

// =============================================================================
// DEEP XAPI STATEMENT (Full Statement)
// =============================================================================

/**
 * Deep xAPI Statement — Full statement with deep analytics extensions.
 */
export interface DeepXAPIStatement extends Omit<XAPIStatement, 'result' | 'context'> {
  result?: DeepXAPIResult;
  context?: DeepXAPIContext;
}

// =============================================================================
// CONFIDENCE CALCULATION UTILITIES
// =============================================================================

/**
 * Calculate confidence indicator from hesitation metrics.
 *
 * @param answerChanges - Number of times answer was changed
 * @param timeToAnswer - Time to final answer (ms)
 * @param expectedTime - Expected time for this question type (ms)
 * @returns Confidence indicator
 */
export function calculateConfidence(
  answerChanges: number,
  timeToAnswer: number,
  expectedTime: number,
): ConfidenceIndicator {
  const speedRatio = timeToAnswer / expectedTime;

  // Fast with no changes = mastery
  if (answerChanges === 0 && speedRatio < 0.5) {
    return 'mastery';
  }

  // Reasonable speed with minimal changes = confident
  if (answerChanges <= 1 && speedRatio < 1.0) {
    return 'confident';
  }

  // Some hesitation or changes = uncertain
  if (answerChanges <= 2 && speedRatio < 2.0) {
    return 'uncertain';
  }

  // Long delay or many changes = guessing
  return 'guessing';
}

/**
 * Calculate engagement focus score from interaction metrics.
 *
 * @param totalTime - Total time on content (ms)
 * @param idleTime - Total idle time (ms)
 * @param blurTime - Total window blur time (ms)
 * @returns Focus score (0-100)
 */
export function calculateFocusScore(totalTime: number, idleTime: number, blurTime: number): number {
  if (totalTime === 0) return 0;

  const activeTime = totalTime - idleTime - blurTime;
  const focusRatio = activeTime / totalTime;

  return Math.max(0, Math.min(100, Math.round(focusRatio * 100)));
}

/**
 * Detect interaction pattern from engagement metrics.
 *
 * @param scrollVelocity - Average scroll velocity (px/s)
 * @param focusScore - Focus score (0-100)
 * @param timePerItem - Average time per content item (ms)
 * @param expectedTimePerItem - Expected time per item (ms)
 * @returns Detected interaction pattern
 */
export function detectInteractionPattern(
  scrollVelocity: number,
  focusScore: number,
  timePerItem: number,
  expectedTimePerItem: number,
): InteractionPattern {
  const timeRatio = timePerItem / expectedTimePerItem;

  // Very fast with low focus = clicking through
  if (timeRatio < 0.3 && focusScore < 30) {
    return 'clicking-through';
  }

  // Fast scrolling with low focus = skimming
  if (scrollVelocity > 500 && focusScore < 50) {
    return 'skimming';
  }

  // Good time and focus = deep
  if (timeRatio >= 0.7 && focusScore >= 70) {
    return 'deep';
  }

  // Default to skimming if uncertain
  return 'skimming';
}

// =============================================================================
// STATEMENT BUILDER HELPERS
// =============================================================================

/**
 * Create a hesitation extension object.
 */
export function createHesitationExtension(
  data: Omit<HesitationData, 'confidence_indicator'>,
  expectedTime: number,
): Record<string, HesitationData> {
  const confidence = calculateConfidence(
    data.answer_changes,
    data.time_to_final_answer_ms,
    expectedTime,
  );

  return {
    [DEEP_EXTENSION_IRIS.hesitation]: {
      ...data,
      confidence_indicator: confidence,
    },
  };
}

/**
 * Create an engagement extension object.
 */
export function createEngagementExtension(
  data: Omit<EngagementData, 'focus_score' | 'interaction_pattern'>,
  totalTime: number,
  expectedTimePerItem: number,
): Record<string, EngagementData> {
  const focusScore = calculateFocusScore(
    totalTime,
    data.mouse_idle_time_ms,
    data.window_blur_time_ms,
  );

  const interactionPattern = detectInteractionPattern(
    data.scroll_velocity,
    focusScore,
    totalTime / Math.max(1, data.interaction_count),
    expectedTimePerItem,
  );

  return {
    [DEEP_EXTENSION_IRIS.engagement]: {
      ...data,
      focus_score: focusScore,
      interaction_pattern: interactionPattern,
    },
  };
}

/**
 * Create a modality extension object.
 */
export function createModalityExtension(data: ModalityData): Record<string, ModalityData> {
  return {
    [DEEP_EXTENSION_IRIS.modality]: data,
  };
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard for DeepXAPIStatement.
 */
export function isDeepXAPIStatement(
  statement: XAPIStatement | DeepXAPIStatement,
): statement is DeepXAPIStatement {
  const extensions = statement.result?.extensions ?? statement.context?.extensions;
  if (!extensions) return false;

  return (
    DEEP_EXTENSION_IRIS.hesitation in extensions ||
    DEEP_EXTENSION_IRIS.engagement in extensions ||
    DEEP_EXTENSION_IRIS.modality in extensions
  );
}

/**
 * Type guard for HesitationData.
 */
export function hasHesitationData(
  result: XAPIResult | DeepXAPIResult | undefined,
): result is DeepXAPIResult {
  return Boolean(result?.extensions && DEEP_EXTENSION_IRIS.hesitation in result.extensions);
}

/**
 * Type guard for EngagementData.
 */
export function hasEngagementData(
  result: XAPIResult | DeepXAPIResult | undefined,
): result is DeepXAPIResult {
  return Boolean(result?.extensions && DEEP_EXTENSION_IRIS.engagement in result.extensions);
}

/**
 * Type guard for ModalityData.
 */
export function hasModalityData(
  context: XAPIContext | DeepXAPIContext | undefined,
): context is DeepXAPIContext {
  return Boolean(context?.extensions && DEEP_EXTENSION_IRIS.modality in context.extensions);
}
