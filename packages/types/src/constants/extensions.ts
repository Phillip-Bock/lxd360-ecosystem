/**
 * INSPIRE xAPI Extension URIs
 *
 * All custom extension IRIs used by the INSPIRE platform.
 * These follow the xAPI 1.0.3 specification for extensions.
 *
 * @module @inspire/types/constants/extensions
 */

const INSPIRE_NS = 'https://lxd360.com/xapi/extensions';

// ============================================================================
// INSPIRE EXTENSIONS
// ============================================================================

export const INSPIRE_EXTENSIONS = {
  // ==========================================================================
  // BEHAVIORAL TELEMETRY
  // ==========================================================================

  /** Response latency in milliseconds */
  LATENCY: `${INSPIRE_NS}/latency`,
  /** Engagement depth (1-5 scale) */
  DEPTH: `${INSPIRE_NS}/depth`,
  /** Time to first interaction in milliseconds */
  TIME_TO_FIRST_ACTION: `${INSPIRE_NS}/time-to-first-action`,
  /** Number of answer revisions before submission */
  REVISION_COUNT: `${INSPIRE_NS}/revision-count`,
  /** IDs of distractors the learner considered */
  DISTRACTORS_CONSIDERED: `${INSPIRE_NS}/distractors-considered`,
  /** Number of rapid repeated clicks (frustration indicator) */
  RAGE_CLICKS: `${INSPIRE_NS}/rage-clicks`,
  /** Tab/window visibility changes */
  FOCUS_LOSS_COUNT: `${INSPIRE_NS}/focus-loss-count`,
  /** Hesitation count */
  HESITATION_COUNT: `${INSPIRE_NS}/hesitation-count`,

  // ==========================================================================
  // COGNITIVE LOAD (ICL Framework)
  // ==========================================================================

  /** Total cognitive load (0-10) */
  COGNITIVE_LOAD: `${INSPIRE_NS}/cognitive-load`,
  /** Intrinsic load component */
  INTRINSIC_LOAD: `${INSPIRE_NS}/intrinsic-load`,
  /** Extraneous load component */
  EXTRANEOUS_LOAD: `${INSPIRE_NS}/extraneous-load`,
  /** Germane load component */
  GERMANE_LOAD: `${INSPIRE_NS}/germane-load`,
  /** Functional learning state (NOT emotion) */
  FUNCTIONAL_STATE: `${INSPIRE_NS}/functional-state`,

  // ==========================================================================
  // MODALITY & ADAPTATION
  // ==========================================================================

  /** Content modality (text, video, audio, etc.) */
  MODALITY: `${INSPIRE_NS}/modality`,
  /** Learner's preferred modality */
  MODALITY_PREFERENCE: `${INSPIRE_NS}/modality-preference`,
  /** Whether content was AI-recommended */
  AI_RECOMMENDED: `${INSPIRE_NS}/ai-recommended`,
  /** Whether learner overrode AI recommendation */
  LEARNER_OVERRIDE: `${INSPIRE_NS}/learner-override`,
  /** ID of the overridden recommendation */
  OVERRIDE_RECOMMENDATION_ID: `${INSPIRE_NS}/override-recommendation-id`,

  // ==========================================================================
  // SKILL & MASTERY (BKT)
  // ==========================================================================

  /** Skill/competency ID */
  SKILL_ID: `${INSPIRE_NS}/skill-id`,
  /** Current mastery estimate (0-1) */
  MASTERY_ESTIMATE: `${INSPIRE_NS}/mastery-estimate`,
  /** BKT prior probability */
  BKT_PRIOR: `${INSPIRE_NS}/bkt-prior`,
  /** BKT posterior probability */
  BKT_POSTERIOR: `${INSPIRE_NS}/bkt-posterior`,
  /** Mastery level category */
  MASTERY_LEVEL: `${INSPIRE_NS}/mastery-level`,
  /** Confidence interval for mastery estimate */
  MASTERY_CONFIDENCE_INTERVAL: `${INSPIRE_NS}/mastery-confidence-interval`,

  // ==========================================================================
  // SPACED REPETITION (SM-2)
  // ==========================================================================

  /** SM-2 easiness factor */
  EASINESS_FACTOR: `${INSPIRE_NS}/easiness-factor`,
  /** Review interval in days */
  REVIEW_INTERVAL: `${INSPIRE_NS}/review-interval`,
  /** Whether this was a scheduled review */
  IS_SCHEDULED_REVIEW: `${INSPIRE_NS}/is-scheduled-review`,

  // ==========================================================================
  // CONTENT BLOCK METADATA
  // ==========================================================================

  /** Content block ID (INSPIRE Studio) */
  BLOCK_ID: `${INSPIRE_NS}/block-id`,
  /** Content block type */
  BLOCK_TYPE: `${INSPIRE_NS}/block-type`,
  /** Content block version */
  BLOCK_VERSION: `${INSPIRE_NS}/block-version`,
  /** INSPIRE encoding phase */
  ENCODING_PHASE: `${INSPIRE_NS}/encoding-phase`,

  // ==========================================================================
  // SESSION & CONTEXT
  // ==========================================================================

  /** Learning session ID */
  SESSION_ID: `${INSPIRE_NS}/session-id`,
  /** Device type */
  DEVICE_TYPE: `${INSPIRE_NS}/device-type`,
  /** Navigation path */
  NAVIGATION_PATH: `${INSPIRE_NS}/navigation-path`,

  // ==========================================================================
  // ACCESSIBILITY
  // ==========================================================================

  /** Accessibility mode settings */
  A11Y_MODE: `${INSPIRE_NS}/accessibility-mode`,
  /** Input method (mouse, keyboard, touch, voice) */
  INPUT_METHOD: `${INSPIRE_NS}/input-method`,

  // ==========================================================================
  // COMPLIANCE (EU AI Act, GDPR)
  // ==========================================================================

  /** Consent tier for cross-tenant learning */
  CONSENT_TIER: `${INSPIRE_NS}/consent-tier`,
  /** Data residency requirement */
  DATA_RESIDENCY: `${INSPIRE_NS}/data-residency`,
  /** Training consent flag */
  TRAINING_CONSENT: `${INSPIRE_NS}/training-consent`,
} as const;

export type InspireExtensionKey = keyof typeof INSPIRE_EXTENSIONS;
export type InspireExtensionIRI = (typeof INSPIRE_EXTENSIONS)[InspireExtensionKey];

// ============================================================================
// MODALITY VALUES
// ============================================================================

export const CONTENT_MODALITIES = {
  TEXT: 'text',
  VIDEO: 'video',
  AUDIO: 'audio',
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

export type ContentModality = (typeof CONTENT_MODALITIES)[keyof typeof CONTENT_MODALITIES];

// ============================================================================
// FUNCTIONAL LEARNING STATES (EU AI Act Compliant - NOT Emotions)
// ============================================================================

export const FUNCTIONAL_STATES = {
  /** Actively engaged and processing effectively */
  FOCUSED: 'focused',
  /** Shows hesitation signals - may need scaffolding */
  UNCERTAIN: 'uncertain',
  /** Multiple failures or high cognitive load */
  STRUGGLING: 'struggling',
  /** Time-on-task and response quality declining */
  FATIGUED: 'fatigued',
  /** Low interaction depth, skipping behavior */
  DISENGAGED: 'disengaged',
  /** Baseline state with insufficient data */
  NEUTRAL: 'neutral',
} as const;

export type FunctionalState = (typeof FUNCTIONAL_STATES)[keyof typeof FUNCTIONAL_STATES];

// ============================================================================
// CONSENT TIERS (Federated Learning)
// ============================================================================

export const CONSENT_TIERS = {
  /** Data never leaves tenant - full isolation */
  ISOLATED: 0,
  /** Receives insights from pool but doesn't contribute */
  RECEIVE_ONLY: 1,
  /** Contributes anonymized data and receives insights */
  CONTRIBUTE: 2,
  /** Full participation in industry-wide learning pool */
  INDUSTRY_POOL: 3,
} as const;

export type ConsentTier = (typeof CONSENT_TIERS)[keyof typeof CONSENT_TIERS];
