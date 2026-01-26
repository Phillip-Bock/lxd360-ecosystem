/**
 * =============================================================================
 * LXD360 Deep Profile xAPI Extensions
 * =============================================================================
 *
 * Focused extensions for behavioral telemetry and adaptive learning.
 * Captures hesitation, confidence, and engagement signals for the
 * xAPI Statement Emitter.
 *
 * @module lib/xapi/extensions
 * @version 1.0.0
 */

// ============================================================================
// EXTENSION NAMESPACES
// ============================================================================

const LXD360_NS = 'https://lxd360.com/xapi/extensions';
const VIDEO_NS = 'https://w3id.org/xapi/video/extensions';

// ============================================================================
// DEEP PROFILE EXTENSIONS
// ============================================================================

/**
 * Deep Profile Extensions Registry
 *
 * These extensions capture behavioral signals that indicate learning state,
 * hesitation patterns, confidence levels, and engagement depth.
 */
export const DeepProfileExtensions = {
  // ==========================================================================
  // HESITATION SIGNALS
  // ==========================================================================

  /**
   * Response latency in milliseconds
   * High latency + correct = uncertainty despite knowledge
   * Low latency + incorrect = guessing or overconfidence
   */
  hesitationTime: `${LXD360_NS}/hesitation-time`,

  /**
   * Time to first interaction in milliseconds
   * Very low values may indicate not reading/guessing
   */
  timeToFirstAction: `${LXD360_NS}/time-to-first-action`,

  /**
   * Number of answer changes before final submission
   * High count = uncertainty or careful consideration
   */
  revisionCount: `${LXD360_NS}/revision-count`,

  /**
   * Pause duration during response (mouse/keyboard idle)
   * Indicates thinking or hesitation mid-response
   */
  pauseDuration: `${LXD360_NS}/pause-duration`,

  /**
   * Number of hover events over answer options
   * Indicates consideration of alternatives
   */
  optionHoverCount: `${LXD360_NS}/option-hover-count`,

  // ==========================================================================
  // CONFIDENCE SIGNALS
  // ==========================================================================

  /**
   * Self-reported confidence level (1-5 scale)
   * Optional learner-provided metacognitive signal
   */
  selfReportedConfidence: `${LXD360_NS}/self-reported-confidence`,

  /**
   * Inferred confidence from behavioral signals (0-1)
   * Computed from latency, revisions, and interaction patterns
   */
  inferredConfidence: `${LXD360_NS}/inferred-confidence`,

  /**
   * Whether learner requested a hint before answering
   */
  usedHint: `${LXD360_NS}/used-hint`,

  /**
   * Whether learner checked reference material
   */
  consultedReference: `${LXD360_NS}/consulted-reference`,

  /**
   * IDs of distractors (wrong answers) that were considered
   * Useful for misconception detection
   */
  distractorsConsidered: `${LXD360_NS}/distractors-considered`,

  // ==========================================================================
  // ENGAGEMENT SIGNALS
  // ==========================================================================

  /**
   * Engagement depth on 1-5 scale
   * 1=skimmed, 2=read, 3=interacted, 4=explored, 5=mastered
   */
  engagementDepth: `${LXD360_NS}/engagement-depth`,

  /**
   * Total interaction count on content block
   */
  interactionCount: `${LXD360_NS}/interaction-count`,

  /**
   * Scroll depth percentage (0-100)
   * For text/scrollable content
   */
  scrollDepth: `${LXD360_NS}/scroll-depth`,

  /**
   * Number of focus loss events (tab switches, etc.)
   */
  focusLossCount: `${LXD360_NS}/focus-loss-count`,

  /**
   * Total time content was in background/unfocused
   */
  backgroundTime: `${LXD360_NS}/background-time`,

  /**
   * Rapid repeated clicks indicating frustration
   */
  rageClicks: `${LXD360_NS}/rage-clicks`,

  /**
   * Active engagement time (excludes idle/background)
   */
  activeTime: `${LXD360_NS}/active-time`,

  // ==========================================================================
  // MODALITY TRACKING
  // ==========================================================================

  /**
   * Content modality before switch
   */
  previousModality: `${LXD360_NS}/previous-modality`,

  /**
   * Content modality after switch
   */
  currentModality: `${LXD360_NS}/current-modality`,

  /**
   * Reason for modality switch: learner-initiated, ai-recommended, auto
   */
  modalitySwitchReason: `${LXD360_NS}/modality-switch-reason`,

  /**
   * Whether the modality was AI-recommended
   */
  aiRecommended: `${LXD360_NS}/ai-recommended`,

  /**
   * Whether learner overrode an AI recommendation
   */
  learnerOverride: `${LXD360_NS}/learner-override`,

  // ==========================================================================
  // SESSION & CONTEXT
  // ==========================================================================

  /**
   * Learning session ID
   */
  sessionId: `${LXD360_NS}/session-id`,

  /**
   * Content block ID from INSPIRE Studio
   */
  blockId: `${LXD360_NS}/block-id`,

  /**
   * Content block type (e.g., 'quiz', 'video', 'flashcard')
   */
  blockType: `${LXD360_NS}/block-type`,

  /**
   * Sequence number within session
   */
  sequenceNumber: `${LXD360_NS}/sequence-number`,

  // ==========================================================================
  // VIDEO/MEDIA SPECIFIC (xAPI Video Profile)
  // ==========================================================================

  /**
   * Current playback time in seconds
   */
  time: `${VIDEO_NS}/time`,

  /**
   * Video length in seconds
   */
  length: `${VIDEO_NS}/length`,

  /**
   * Progress through video (0-1)
   */
  progress: `${VIDEO_NS}/progress`,

  /**
   * Playback rate (1.0 = normal)
   */
  playbackRate: `${VIDEO_NS}/played-segments`,

  /**
   * Time position before seek
   */
  timeFrom: `${VIDEO_NS}/time-from`,

  /**
   * Time position after seek
   */
  timeTo: `${VIDEO_NS}/time-to`,

  /**
   * Video segments that were played (array of [start, end] pairs)
   */
  playedSegments: `${VIDEO_NS}/played-segments`,
} as const;

export type DeepProfileExtensionKey = keyof typeof DeepProfileExtensions;
export type DeepProfileExtensionIRI = (typeof DeepProfileExtensions)[DeepProfileExtensionKey];

// ============================================================================
// EXTENSION VALUES
// ============================================================================

/**
 * Content modality options
 */
export const Modality = {
  TEXT: 'text',
  VIDEO: 'video',
  AUDIO: 'audio',
  INTERACTIVE: 'interactive',
  SIMULATION: 'simulation',
  INFOGRAPHIC: 'infographic',
  ANIMATION: 'animation',
  VR: 'vr',
  AR: 'ar',
} as const;

export type ModalityType = (typeof Modality)[keyof typeof Modality];

/**
 * Modality switch reasons
 */
export const ModalitySwitchReason = {
  LEARNER_INITIATED: 'learner-initiated',
  AI_RECOMMENDED: 'ai-recommended',
  AUTO_ACCESSIBILITY: 'auto-accessibility',
  AUTO_BANDWIDTH: 'auto-bandwidth',
  AUTO_PREFERENCE: 'auto-preference',
} as const;

export type ModalitySwitchReasonType =
  (typeof ModalitySwitchReason)[keyof typeof ModalitySwitchReason];

/**
 * Engagement depth levels
 */
export const EngagementLevel = {
  SKIMMED: 1,
  READ: 2,
  INTERACTED: 3,
  EXPLORED: 4,
  MASTERED: 5,
} as const;

export type EngagementLevelType = (typeof EngagementLevel)[keyof typeof EngagementLevel];

// ============================================================================
// BUILDER HELPERS
// ============================================================================

/**
 * Hesitation signal data for xAPI statements
 */
export interface HesitationData {
  hesitationTime?: number;
  timeToFirstAction?: number;
  revisionCount?: number;
  pauseDuration?: number;
  optionHoverCount?: number;
}

/**
 * Confidence signal data for xAPI statements
 */
export interface ConfidenceData {
  selfReportedConfidence?: number;
  inferredConfidence?: number;
  usedHint?: boolean;
  consultedReference?: boolean;
  distractorsConsidered?: string[];
}

/**
 * Engagement signal data for xAPI statements
 */
export interface EngagementData {
  engagementDepth?: EngagementLevelType;
  interactionCount?: number;
  scrollDepth?: number;
  focusLossCount?: number;
  backgroundTime?: number;
  rageClicks?: number;
  activeTime?: number;
}

/**
 * Modality tracking data for xAPI statements
 */
export interface ModalityData {
  previousModality?: ModalityType;
  currentModality?: ModalityType;
  modalitySwitchReason?: ModalitySwitchReasonType;
  aiRecommended?: boolean;
  learnerOverride?: boolean;
}

/**
 * Video/media tracking data for xAPI statements
 */
export interface MediaData {
  time?: number;
  length?: number;
  progress?: number;
  playbackRate?: number;
  timeFrom?: number;
  timeTo?: number;
  playedSegments?: Array<[number, number]>;
}

/**
 * Build hesitation extensions for an xAPI statement
 */
export function buildHesitationExtensions(data: HesitationData): Record<string, unknown> {
  const extensions: Record<string, unknown> = {};

  if (data.hesitationTime !== undefined) {
    extensions[DeepProfileExtensions.hesitationTime] = data.hesitationTime;
  }
  if (data.timeToFirstAction !== undefined) {
    extensions[DeepProfileExtensions.timeToFirstAction] = data.timeToFirstAction;
  }
  if (data.revisionCount !== undefined) {
    extensions[DeepProfileExtensions.revisionCount] = data.revisionCount;
  }
  if (data.pauseDuration !== undefined) {
    extensions[DeepProfileExtensions.pauseDuration] = data.pauseDuration;
  }
  if (data.optionHoverCount !== undefined) {
    extensions[DeepProfileExtensions.optionHoverCount] = data.optionHoverCount;
  }

  return extensions;
}

/**
 * Build confidence extensions for an xAPI statement
 */
export function buildConfidenceExtensions(data: ConfidenceData): Record<string, unknown> {
  const extensions: Record<string, unknown> = {};

  if (data.selfReportedConfidence !== undefined) {
    extensions[DeepProfileExtensions.selfReportedConfidence] = data.selfReportedConfidence;
  }
  if (data.inferredConfidence !== undefined) {
    extensions[DeepProfileExtensions.inferredConfidence] = data.inferredConfidence;
  }
  if (data.usedHint !== undefined) {
    extensions[DeepProfileExtensions.usedHint] = data.usedHint;
  }
  if (data.consultedReference !== undefined) {
    extensions[DeepProfileExtensions.consultedReference] = data.consultedReference;
  }
  if (data.distractorsConsidered !== undefined) {
    extensions[DeepProfileExtensions.distractorsConsidered] = data.distractorsConsidered;
  }

  return extensions;
}

/**
 * Build engagement extensions for an xAPI statement
 */
export function buildEngagementExtensions(data: EngagementData): Record<string, unknown> {
  const extensions: Record<string, unknown> = {};

  if (data.engagementDepth !== undefined) {
    extensions[DeepProfileExtensions.engagementDepth] = data.engagementDepth;
  }
  if (data.interactionCount !== undefined) {
    extensions[DeepProfileExtensions.interactionCount] = data.interactionCount;
  }
  if (data.scrollDepth !== undefined) {
    extensions[DeepProfileExtensions.scrollDepth] = data.scrollDepth;
  }
  if (data.focusLossCount !== undefined) {
    extensions[DeepProfileExtensions.focusLossCount] = data.focusLossCount;
  }
  if (data.backgroundTime !== undefined) {
    extensions[DeepProfileExtensions.backgroundTime] = data.backgroundTime;
  }
  if (data.rageClicks !== undefined) {
    extensions[DeepProfileExtensions.rageClicks] = data.rageClicks;
  }
  if (data.activeTime !== undefined) {
    extensions[DeepProfileExtensions.activeTime] = data.activeTime;
  }

  return extensions;
}

/**
 * Build modality tracking extensions for an xAPI statement
 */
export function buildModalityExtensions(data: ModalityData): Record<string, unknown> {
  const extensions: Record<string, unknown> = {};

  if (data.previousModality !== undefined) {
    extensions[DeepProfileExtensions.previousModality] = data.previousModality;
  }
  if (data.currentModality !== undefined) {
    extensions[DeepProfileExtensions.currentModality] = data.currentModality;
  }
  if (data.modalitySwitchReason !== undefined) {
    extensions[DeepProfileExtensions.modalitySwitchReason] = data.modalitySwitchReason;
  }
  if (data.aiRecommended !== undefined) {
    extensions[DeepProfileExtensions.aiRecommended] = data.aiRecommended;
  }
  if (data.learnerOverride !== undefined) {
    extensions[DeepProfileExtensions.learnerOverride] = data.learnerOverride;
  }

  return extensions;
}

/**
 * Build media tracking extensions for an xAPI statement
 */
export function buildMediaExtensions(data: MediaData): Record<string, unknown> {
  const extensions: Record<string, unknown> = {};

  if (data.time !== undefined) {
    extensions[DeepProfileExtensions.time] = data.time;
  }
  if (data.length !== undefined) {
    extensions[DeepProfileExtensions.length] = data.length;
  }
  if (data.progress !== undefined) {
    extensions[DeepProfileExtensions.progress] = data.progress;
  }
  if (data.playbackRate !== undefined) {
    extensions[DeepProfileExtensions.playbackRate] = data.playbackRate;
  }
  if (data.timeFrom !== undefined) {
    extensions[DeepProfileExtensions.timeFrom] = data.timeFrom;
  }
  if (data.timeTo !== undefined) {
    extensions[DeepProfileExtensions.timeTo] = data.timeTo;
  }
  if (data.playedSegments !== undefined) {
    extensions[DeepProfileExtensions.playedSegments] = data.playedSegments;
  }

  return extensions;
}

/**
 * Build all Deep Profile extensions from combined data
 */
export function buildDeepProfileExtensions(data: {
  hesitation?: HesitationData;
  confidence?: ConfidenceData;
  engagement?: EngagementData;
  modality?: ModalityData;
  media?: MediaData;
  sessionId?: string;
  blockId?: string;
  blockType?: string;
  sequenceNumber?: number;
}): Record<string, unknown> {
  const extensions: Record<string, unknown> = {};

  // Merge all extension categories
  if (data.hesitation) {
    Object.assign(extensions, buildHesitationExtensions(data.hesitation));
  }
  if (data.confidence) {
    Object.assign(extensions, buildConfidenceExtensions(data.confidence));
  }
  if (data.engagement) {
    Object.assign(extensions, buildEngagementExtensions(data.engagement));
  }
  if (data.modality) {
    Object.assign(extensions, buildModalityExtensions(data.modality));
  }
  if (data.media) {
    Object.assign(extensions, buildMediaExtensions(data.media));
  }

  // Add session context
  if (data.sessionId !== undefined) {
    extensions[DeepProfileExtensions.sessionId] = data.sessionId;
  }
  if (data.blockId !== undefined) {
    extensions[DeepProfileExtensions.blockId] = data.blockId;
  }
  if (data.blockType !== undefined) {
    extensions[DeepProfileExtensions.blockType] = data.blockType;
  }
  if (data.sequenceNumber !== undefined) {
    extensions[DeepProfileExtensions.sequenceNumber] = data.sequenceNumber;
  }

  return extensions;
}

// ============================================================================
// INFERENCE HELPERS
// ============================================================================

/**
 * Infer confidence level from behavioral signals
 *
 * @param signals - Behavioral signals to analyze
 * @returns Inferred confidence (0-1)
 */
export function inferConfidence(signals: {
  responseTimeMs: number;
  expectedTimeMs?: number;
  revisionCount?: number;
  usedHint?: boolean;
  correct?: boolean;
}): number {
  const {
    responseTimeMs,
    expectedTimeMs = 10000,
    revisionCount = 0,
    usedHint = false,
    correct,
  } = signals;

  let confidence = 0.5; // Start at neutral

  // Time-based adjustment
  const timeRatio = responseTimeMs / expectedTimeMs;
  if (timeRatio < 0.3) {
    // Very fast - could be guessing or very confident
    confidence += correct ? 0.2 : -0.3;
  } else if (timeRatio < 0.7) {
    // Good timing - likely confident
    confidence += 0.15;
  } else if (timeRatio < 1.5) {
    // Slightly slow - some hesitation
    confidence -= 0.1;
  } else {
    // Very slow - significant hesitation
    confidence -= 0.25;
  }

  // Revision penalty
  confidence -= revisionCount * 0.1;

  // Hint penalty
  if (usedHint) {
    confidence -= 0.2;
  }

  // Correct answer bonus
  if (correct === true) {
    confidence += 0.1;
  } else if (correct === false) {
    confidence -= 0.1;
  }

  // Clamp to [0, 1]
  return Math.max(0, Math.min(1, confidence));
}

/**
 * Infer engagement level from behavioral signals
 *
 * @param signals - Behavioral signals to analyze
 * @returns Engagement depth level (1-5)
 */
export function inferEngagementLevel(signals: {
  timeOnContent: number;
  expectedTime?: number;
  interactionCount?: number;
  scrollDepth?: number;
  focusLossCount?: number;
}): EngagementLevelType {
  const {
    timeOnContent,
    expectedTime = 30000,
    interactionCount = 0,
    scrollDepth = 0,
    focusLossCount = 0,
  } = signals;

  // Calculate base engagement from time
  const timeRatio = timeOnContent / expectedTime;

  // Heavy focus loss indicates disengagement
  if (focusLossCount > 5) {
    return EngagementLevel.SKIMMED;
  }

  // Very short time = skimmed
  if (timeRatio < 0.2) {
    return EngagementLevel.SKIMMED;
  }

  // Short time with low scroll = read partially
  if (timeRatio < 0.5 && scrollDepth < 50) {
    return EngagementLevel.SKIMMED;
  }

  // Reasonable time = read
  if (timeRatio < 0.8 && interactionCount < 2) {
    return EngagementLevel.READ;
  }

  // Good time with some interaction = interacted
  if (timeRatio < 1.5 && interactionCount >= 2) {
    return EngagementLevel.INTERACTED;
  }

  // Extended time with multiple interactions = explored
  if (timeRatio >= 1.5 && interactionCount >= 3) {
    return EngagementLevel.EXPLORED;
  }

  // Very extended engagement with high interaction = mastered
  if (timeRatio >= 2 && interactionCount >= 5 && scrollDepth >= 90) {
    return EngagementLevel.MASTERED;
  }

  // Default to interacted if met basic criteria
  if (interactionCount >= 1) {
    return EngagementLevel.INTERACTED;
  }

  return EngagementLevel.READ;
}
