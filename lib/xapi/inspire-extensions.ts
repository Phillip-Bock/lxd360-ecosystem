/**
 * INSPIRE Cognitive Extensions for xAPI
 *
 * These extensions capture cognitive and adaptive learning signals
 * beyond standard xAPI, enabling the HBTN (Hybrid Bayesian-Transformer
 * Network) to make intelligent content recommendations.
 *
 * @module lib/xapi/inspire-extensions
 * @see EU AI Act compliance: All AI decisions using these extensions
 *      must be logged to ai_decisions table with Glass Box explanations.
 */

// ============================================================================
// INSPIRE EXTENSION NAMESPACE
// ============================================================================

const INSPIRE_NS = 'https://inspire.lxd360.com/xapi/extensions';

/**
 * INSPIRE Cognitive Extensions Registry
 *
 * These extensions power the adaptive learning engine by capturing
 * behavioral signals that indicate cognitive state and learning progress.
 */
export const InspireExtensions = {
  // ==========================================================================
  // BEHAVIORAL TELEMETRY (Hesitation, Engagement, Focus)
  // ==========================================================================

  /**
   * Response latency in milliseconds - hesitation indicator
   * High latency + correct = uncertainty despite knowledge
   * Low latency + incorrect = overconfidence or guessing
   */
  latency: `${INSPIRE_NS}/latency`,

  /**
   * Engagement depth on 1-5 scale
   * 1 = skimmed, 2 = read, 3 = interacted, 4 = explored, 5 = mastered
   */
  depth: `${INSPIRE_NS}/depth`,

  /**
   * Time to first interaction in milliseconds
   * Very low = didn't read the question (guessing signal)
   */
  timeToFirstAction: `${INSPIRE_NS}/time-to-first-action`,

  /**
   * Number of answer revisions before final submission
   * High revision count = uncertainty or careful consideration
   */
  revisionCount: `${INSPIRE_NS}/revision-count`,

  /**
   * IDs of wrong answers the learner considered before final selection
   * Useful for misconception detection
   */
  distractorsConsidered: `${INSPIRE_NS}/distractors-considered`,

  /**
   * Rapid repeated clicks indicating frustration
   */
  rageClicks: `${INSPIRE_NS}/rage-clicks`,

  /**
   * Tab/window visibility changes during activity
   * High count = distraction or multitasking
   */
  focusLossCount: `${INSPIRE_NS}/focus-loss-count`,

  // ==========================================================================
  // CONTENT MODALITY (For Adaptive Content Selection)
  // ==========================================================================

  /**
   * Content delivery modality
   * Used by modality swapper to track what format was delivered
   */
  modality: `${INSPIRE_NS}/modality`,

  /**
   * Whether content was AI-recommended vs manually selected
   */
  aiRecommended: `${INSPIRE_NS}/ai-recommended`,

  /**
   * Whether learner overrode AI recommendation
   * Critical for EU AI Act: learner agency must be preserved
   */
  learnerOverride: `${INSPIRE_NS}/learner-override`,

  /**
   * AI recommendation ID that was overridden (for audit trail)
   */
  overrideRecommendationId: `${INSPIRE_NS}/override-recommendation-id`,

  // ==========================================================================
  // SKILL & MASTERY TRACKING
  // ==========================================================================

  /**
   * Skill/competency ID from the skill taxonomy
   */
  skillId: `${INSPIRE_NS}/skill-id`,

  /**
   * Current mastery estimate (0-1) from BKT model
   */
  masteryEstimate: `${INSPIRE_NS}/mastery-estimate`,

  /**
   * Mastery level category: novice, developing, proficient, mastered
   */
  masteryLevel: `${INSPIRE_NS}/mastery-level`,

  /**
   * Confidence interval for mastery estimate (±)
   */
  masteryConfidenceInterval: `${INSPIRE_NS}/mastery-confidence-interval`,

  // ==========================================================================
  // COGNITIVE LOAD FRAMEWORK (ICL)
  // ==========================================================================

  /**
   * Estimated cognitive load (1-10 scale)
   * Computed from content complexity + learner state
   */
  cognitiveLoad: `${INSPIRE_NS}/cognitive-load`,

  /**
   * Intrinsic load component (content complexity)
   */
  intrinsicLoad: `${INSPIRE_NS}/intrinsic-load`,

  /**
   * Extraneous load component (design friction)
   */
  extraneousLoad: `${INSPIRE_NS}/extraneous-load`,

  /**
   * Germane load component (learning effort)
   */
  germaneLoad: `${INSPIRE_NS}/germane-load`,

  /**
   * Functional learning state (NOT emotion - EU AI Act compliant)
   * Values: focused, uncertain, struggling, fatigued, disengaged
   */
  functionalState: `${INSPIRE_NS}/functional-state`,

  // ==========================================================================
  // SPACED REPETITION (SM-2)
  // ==========================================================================

  /**
   * SM-2 easiness factor for this skill
   */
  easinessFactor: `${INSPIRE_NS}/easiness-factor`,

  /**
   * Days until next scheduled review
   */
  reviewInterval: `${INSPIRE_NS}/review-interval`,

  /**
   * Whether this interaction was a scheduled review
   */
  isScheduledReview: `${INSPIRE_NS}/is-scheduled-review`,

  // ==========================================================================
  // CONSENT & COMPLIANCE (EU AI Act, GDPR)
  // ==========================================================================

  /**
   * Learner's consent tier for cross-tenant learning
   * 0 = isolated, 1 = receive only, 2 = contribute, 3 = industry pool
   */
  consentTier: `${INSPIRE_NS}/consent-tier`,

  /**
   * Data residency requirement (e.g., 'eu', 'us', 'global')
   */
  dataResidency: `${INSPIRE_NS}/data-residency`,

  /**
   * Whether this data can be used for model training
   */
  trainingConsent: `${INSPIRE_NS}/training-consent`,

  // ==========================================================================
  // SESSION & CONTEXT
  // ==========================================================================

  /**
   * Learning session ID (groups related statements)
   */
  sessionId: `${INSPIRE_NS}/session-id`,

  /**
   * Content block ID from INSPIRE Studio
   */
  blockId: `${INSPIRE_NS}/block-id`,

  /**
   * Content block type (e.g., 'quiz', 'video', 'flashcard')
   */
  blockType: `${INSPIRE_NS}/block-type`,

  /**
   * INSPIRE encoding phase that generated this content
   * Values: itla, nppm, ilmi, ices
   */
  encodingPhase: `${INSPIRE_NS}/encoding-phase`,

  // ==========================================================================
  // ACCESSIBILITY
  // ==========================================================================

  /**
   * Accessibility features active during interaction
   * Array of: screen-reader, high-contrast, reduced-motion, captions, etc.
   */
  a11yFeatures: `${INSPIRE_NS}/a11y-features`,

  /**
   * Input method used: mouse, keyboard, touch, voice, switch
   */
  inputMethod: `${INSPIRE_NS}/input-method`,
} as const;

export type InspireExtensionKey = keyof typeof InspireExtensions;
export type InspireExtensionIRI = (typeof InspireExtensions)[InspireExtensionKey];

// ============================================================================
// MODALITY VALUES
// ============================================================================

/**
 * Content modality options for adaptive delivery
 */
export const ContentModality = {
  VIDEO: 'video',
  AUDIO: 'audio',
  TEXT: 'text',
  INTERACTIVE: 'interactive',
  SIMULATION: 'simulation',
  INFOGRAPHIC: 'infographic',
  ANIMATION: 'animation',
  QUIZ: 'quiz',
  FLASHCARD: 'flashcard',
  SCENARIO: 'scenario',
  VR: 'vr',
  AR: 'ar',
} as const;

export type ContentModalityType = (typeof ContentModality)[keyof typeof ContentModality];

// ============================================================================
// FUNCTIONAL LEARNING STATES (EU AI Act Compliant - NOT Emotions)
// ============================================================================

/**
 * Functional learning states derived from behavioral signals
 * These are NOT emotions (which would violate EU AI Act in educational contexts)
 * but rather observable learning states that inform content adaptation.
 */
export const FunctionalLearningState = {
  /** Learner is actively engaged and processing effectively */
  FOCUSED: 'focused',
  /** Learner shows hesitation signals - may need scaffolding */
  UNCERTAIN: 'uncertain',
  /** Multiple failures or high cognitive load indicators */
  STRUGGLING: 'struggling',
  /** Time-on-task and response quality declining */
  FATIGUED: 'fatigued',
  /** Low interaction depth, skipping, rapid navigation */
  DISENGAGED: 'disengaged',
  /** Baseline state when insufficient data */
  NEUTRAL: 'neutral',
} as const;

export type FunctionalLearningStateType =
  (typeof FunctionalLearningState)[keyof typeof FunctionalLearningState];

// ============================================================================
// CONSENT TIERS (Cross-Tenant Learning)
// ============================================================================

/**
 * Consent tiers for federated learning across tenants
 */
export const ConsentTier = {
  /** Data never leaves tenant - full isolation */
  ISOLATED: 0,
  /** Can receive insights from pool but doesn't contribute */
  RECEIVE_ONLY: 1,
  /** Contributes anonymized data and receives insights */
  CONTRIBUTE: 2,
  /** Full participation in industry-wide learning pool */
  INDUSTRY_POOL: 3,
} as const;

export type ConsentTierLevel = (typeof ConsentTier)[keyof typeof ConsentTier];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Build extensions object for an xAPI statement
 */
export function buildInspireExtensions(
  data: Partial<{
    latency: number;
    depth: number;
    timeToFirstAction: number;
    revisionCount: number;
    distractorsConsidered: string[];
    rageClicks: number;
    focusLossCount: number;
    modality: ContentModalityType;
    aiRecommended: boolean;
    learnerOverride: boolean;
    overrideRecommendationId: string;
    skillId: string;
    masteryEstimate: number;
    masteryLevel: string;
    masteryConfidenceInterval: number;
    cognitiveLoad: number;
    intrinsicLoad: number;
    extraneousLoad: number;
    germaneLoad: number;
    functionalState: FunctionalLearningStateType;
    easinessFactor: number;
    reviewInterval: number;
    isScheduledReview: boolean;
    consentTier: ConsentTierLevel;
    dataResidency: string;
    trainingConsent: boolean;
    sessionId: string;
    blockId: string;
    blockType: string;
    encodingPhase: string;
    a11yFeatures: string[];
    inputMethod: string;
  }>,
): Record<string, unknown> {
  const extensions: Record<string, unknown> = {};

  // Only include defined values
  if (data.latency !== undefined) extensions[InspireExtensions.latency] = data.latency;
  if (data.depth !== undefined) extensions[InspireExtensions.depth] = data.depth;
  if (data.timeToFirstAction !== undefined)
    extensions[InspireExtensions.timeToFirstAction] = data.timeToFirstAction;
  if (data.revisionCount !== undefined)
    extensions[InspireExtensions.revisionCount] = data.revisionCount;
  if (data.distractorsConsidered !== undefined)
    extensions[InspireExtensions.distractorsConsidered] = data.distractorsConsidered;
  if (data.rageClicks !== undefined) extensions[InspireExtensions.rageClicks] = data.rageClicks;
  if (data.focusLossCount !== undefined)
    extensions[InspireExtensions.focusLossCount] = data.focusLossCount;
  if (data.modality !== undefined) extensions[InspireExtensions.modality] = data.modality;
  if (data.aiRecommended !== undefined)
    extensions[InspireExtensions.aiRecommended] = data.aiRecommended;
  if (data.learnerOverride !== undefined)
    extensions[InspireExtensions.learnerOverride] = data.learnerOverride;
  if (data.overrideRecommendationId !== undefined)
    extensions[InspireExtensions.overrideRecommendationId] = data.overrideRecommendationId;
  if (data.skillId !== undefined) extensions[InspireExtensions.skillId] = data.skillId;
  if (data.masteryEstimate !== undefined)
    extensions[InspireExtensions.masteryEstimate] = data.masteryEstimate;
  if (data.masteryLevel !== undefined)
    extensions[InspireExtensions.masteryLevel] = data.masteryLevel;
  if (data.masteryConfidenceInterval !== undefined)
    extensions[InspireExtensions.masteryConfidenceInterval] = data.masteryConfidenceInterval;
  if (data.cognitiveLoad !== undefined)
    extensions[InspireExtensions.cognitiveLoad] = data.cognitiveLoad;
  if (data.intrinsicLoad !== undefined)
    extensions[InspireExtensions.intrinsicLoad] = data.intrinsicLoad;
  if (data.extraneousLoad !== undefined)
    extensions[InspireExtensions.extraneousLoad] = data.extraneousLoad;
  if (data.germaneLoad !== undefined) extensions[InspireExtensions.germaneLoad] = data.germaneLoad;
  if (data.functionalState !== undefined)
    extensions[InspireExtensions.functionalState] = data.functionalState;
  if (data.easinessFactor !== undefined)
    extensions[InspireExtensions.easinessFactor] = data.easinessFactor;
  if (data.reviewInterval !== undefined)
    extensions[InspireExtensions.reviewInterval] = data.reviewInterval;
  if (data.isScheduledReview !== undefined)
    extensions[InspireExtensions.isScheduledReview] = data.isScheduledReview;
  if (data.consentTier !== undefined) extensions[InspireExtensions.consentTier] = data.consentTier;
  if (data.dataResidency !== undefined)
    extensions[InspireExtensions.dataResidency] = data.dataResidency;
  if (data.trainingConsent !== undefined)
    extensions[InspireExtensions.trainingConsent] = data.trainingConsent;
  if (data.sessionId !== undefined) extensions[InspireExtensions.sessionId] = data.sessionId;
  if (data.blockId !== undefined) extensions[InspireExtensions.blockId] = data.blockId;
  if (data.blockType !== undefined) extensions[InspireExtensions.blockType] = data.blockType;
  if (data.encodingPhase !== undefined)
    extensions[InspireExtensions.encodingPhase] = data.encodingPhase;
  if (data.a11yFeatures !== undefined)
    extensions[InspireExtensions.a11yFeatures] = data.a11yFeatures;
  if (data.inputMethod !== undefined) extensions[InspireExtensions.inputMethod] = data.inputMethod;

  return extensions;
}

/**
 * Extract INSPIRE extensions from an xAPI statement's context or result extensions
 */
export function extractInspireExtensions(extensions: Record<string, unknown> | undefined): {
  latency?: number;
  depth?: number;
  timeToFirstAction?: number;
  revisionCount?: number;
  distractorsConsidered?: string[];
  rageClicks?: number;
  focusLossCount?: number;
  modality?: ContentModalityType;
  aiRecommended?: boolean;
  learnerOverride?: boolean;
  overrideRecommendationId?: string;
  skillId?: string;
  masteryEstimate?: number;
  masteryLevel?: string;
  cognitiveLoad?: number;
  functionalState?: FunctionalLearningStateType;
  consentTier?: ConsentTierLevel;
  sessionId?: string;
  blockId?: string;
  blockType?: string;
} {
  if (!extensions) return {};

  return {
    latency: extensions[InspireExtensions.latency] as number | undefined,
    depth: extensions[InspireExtensions.depth] as number | undefined,
    timeToFirstAction: extensions[InspireExtensions.timeToFirstAction] as number | undefined,
    revisionCount: extensions[InspireExtensions.revisionCount] as number | undefined,
    distractorsConsidered: extensions[InspireExtensions.distractorsConsidered] as
      | string[]
      | undefined,
    rageClicks: extensions[InspireExtensions.rageClicks] as number | undefined,
    focusLossCount: extensions[InspireExtensions.focusLossCount] as number | undefined,
    modality: extensions[InspireExtensions.modality] as ContentModalityType | undefined,
    aiRecommended: extensions[InspireExtensions.aiRecommended] as boolean | undefined,
    learnerOverride: extensions[InspireExtensions.learnerOverride] as boolean | undefined,
    overrideRecommendationId: extensions[InspireExtensions.overrideRecommendationId] as
      | string
      | undefined,
    skillId: extensions[InspireExtensions.skillId] as string | undefined,
    masteryEstimate: extensions[InspireExtensions.masteryEstimate] as number | undefined,
    masteryLevel: extensions[InspireExtensions.masteryLevel] as string | undefined,
    cognitiveLoad: extensions[InspireExtensions.cognitiveLoad] as number | undefined,
    functionalState: extensions[InspireExtensions.functionalState] as
      | FunctionalLearningStateType
      | undefined,
    consentTier: extensions[InspireExtensions.consentTier] as ConsentTierLevel | undefined,
    sessionId: extensions[InspireExtensions.sessionId] as string | undefined,
    blockId: extensions[InspireExtensions.blockId] as string | undefined,
    blockType: extensions[InspireExtensions.blockType] as string | undefined,
  };
}

/**
 * Detect functional learning state from behavioral signals
 * This is rule-based detection; the HBTN model provides more sophisticated inference
 */
export function inferFunctionalState(signals: {
  latency?: number;
  expectedLatency?: number;
  revisionCount?: number;
  rageClicks?: number;
  focusLossCount?: number;
  streakIncorrect?: number;
  cognitiveLoad?: number;
  timeOnTask?: number;
}): FunctionalLearningStateType {
  const {
    latency = 0,
    expectedLatency = 5000,
    revisionCount = 0,
    rageClicks = 0,
    focusLossCount = 0,
    streakIncorrect = 0,
    cognitiveLoad = 5,
    timeOnTask = 0,
  } = signals;

  // Struggling: multiple failures or high cognitive load with slow responses
  if (streakIncorrect >= 3 || (cognitiveLoad > 8 && latency > expectedLatency * 2)) {
    return FunctionalLearningState.STRUGGLING;
  }

  // Fatigued: long time on task with declining performance indicators
  if (timeOnTask > 30 * 60 * 1000 && focusLossCount > 3) {
    // 30+ minutes
    return FunctionalLearningState.FATIGUED;
  }

  // Disengaged: low latency (not reading), high focus loss, skipping behavior
  if (latency < expectedLatency * 0.1 || focusLossCount > 5) {
    return FunctionalLearningState.DISENGAGED;
  }

  // Uncertain: high revision count or moderate hesitation
  if (revisionCount > 2 || (latency > expectedLatency * 1.5 && latency < expectedLatency * 3)) {
    return FunctionalLearningState.UNCERTAIN;
  }

  // Frustrated: rage clicks detected
  if (rageClicks > 3) {
    return FunctionalLearningState.STRUGGLING;
  }

  // Focused: normal latency range, low distractions
  if (latency >= expectedLatency * 0.5 && latency <= expectedLatency * 1.5 && focusLossCount < 2) {
    return FunctionalLearningState.FOCUSED;
  }

  return FunctionalLearningState.NEUTRAL;
}
