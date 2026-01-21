/**
 * INSPIRE xAPI Verb Vocabulary
 *
 * Standard xAPI verbs plus INSPIRE-specific custom verbs.
 * All verbs follow the ADL xAPI Vocabulary specification.
 *
 * @module lib/inspire/constants/verbs
 */

// ============================================================================
// VERB TYPES
// ============================================================================

export interface Verb {
  /** Verb IRI */
  id: string;
  /** Display text by language */
  display: Record<string, string>;
  /** Description */
  description?: string;
  /** Category */
  category?: VerbCategory;
}

export type VerbCategory =
  | 'interaction'
  | 'completion'
  | 'assessment'
  | 'session'
  | 'media'
  | 'cognitive'
  | 'social'
  | 'adaptive';

// ============================================================================
// ADL STANDARD VERBS
// ============================================================================

const ADL_NAMESPACE = 'http://adlnet.gov/expapi/verbs';

export const VERBS_ADL = {
  // Session Verbs
  LAUNCHED: {
    id: `${ADL_NAMESPACE}/launched`,
    display: { 'en-US': 'launched' },
    description: 'Indicates the actor started a learning activity',
    category: 'session' as VerbCategory,
  },
  INITIALIZED: {
    id: `${ADL_NAMESPACE}/initialized`,
    display: { 'en-US': 'initialized' },
    description: 'Indicates the activity was ready to be started',
    category: 'session' as VerbCategory,
  },
  TERMINATED: {
    id: `${ADL_NAMESPACE}/terminated`,
    display: { 'en-US': 'terminated' },
    description: 'Indicates the actor exited the activity',
    category: 'session' as VerbCategory,
  },
  SUSPENDED: {
    id: `${ADL_NAMESPACE}/suspended`,
    display: { 'en-US': 'suspended' },
    description: 'Indicates the actor paused the activity temporarily',
    category: 'session' as VerbCategory,
  },
  RESUMED: {
    id: `${ADL_NAMESPACE}/resumed`,
    display: { 'en-US': 'resumed' },
    description: 'Indicates the actor continued the activity',
    category: 'session' as VerbCategory,
  },

  // Interaction Verbs
  EXPERIENCED: {
    id: `${ADL_NAMESPACE}/experienced`,
    display: { 'en-US': 'experienced' },
    description: 'Indicates the actor interacted with content',
    category: 'interaction' as VerbCategory,
  },
  INTERACTED: {
    id: `${ADL_NAMESPACE}/interacted`,
    display: { 'en-US': 'interacted' },
    description: 'Indicates the actor interacted with an object',
    category: 'interaction' as VerbCategory,
  },
  ATTEMPTED: {
    id: `${ADL_NAMESPACE}/attempted`,
    display: { 'en-US': 'attempted' },
    description: 'Indicates the actor made an attempt',
    category: 'interaction' as VerbCategory,
  },
  PROGRESSED: {
    id: `${ADL_NAMESPACE}/progressed`,
    display: { 'en-US': 'progressed' },
    description: 'Indicates the actor made progress',
    category: 'interaction' as VerbCategory,
  },

  // Completion Verbs
  COMPLETED: {
    id: `${ADL_NAMESPACE}/completed`,
    display: { 'en-US': 'completed' },
    description: 'Indicates the actor finished the activity',
    category: 'completion' as VerbCategory,
  },
  PASSED: {
    id: `${ADL_NAMESPACE}/passed`,
    display: { 'en-US': 'passed' },
    description: 'Indicates the actor passed the activity',
    category: 'assessment' as VerbCategory,
  },
  FAILED: {
    id: `${ADL_NAMESPACE}/failed`,
    display: { 'en-US': 'failed' },
    description: 'Indicates the actor failed the activity',
    category: 'assessment' as VerbCategory,
  },

  // Assessment Verbs
  ANSWERED: {
    id: `${ADL_NAMESPACE}/answered`,
    display: { 'en-US': 'answered' },
    description: 'Indicates the actor answered a question',
    category: 'assessment' as VerbCategory,
  },
  ASKED: {
    id: `${ADL_NAMESPACE}/asked`,
    display: { 'en-US': 'asked' },
    description: 'Indicates the actor asked a question',
    category: 'assessment' as VerbCategory,
  },
  SCORED: {
    id: `${ADL_NAMESPACE}/scored`,
    display: { 'en-US': 'scored' },
    description: 'Indicates the actor achieved a score',
    category: 'assessment' as VerbCategory,
  },
  MASTERED: {
    id: `${ADL_NAMESPACE}/mastered`,
    display: { 'en-US': 'mastered' },
    description: 'Indicates the actor mastered a skill or topic',
    category: 'assessment' as VerbCategory,
  },

  // Social Verbs
  COMMENTED: {
    id: `${ADL_NAMESPACE}/commented`,
    display: { 'en-US': 'commented' },
    description: 'Indicates the actor commented',
    category: 'social' as VerbCategory,
  },
  SHARED: {
    id: `${ADL_NAMESPACE}/shared`,
    display: { 'en-US': 'shared' },
    description: 'Indicates the actor shared something',
    category: 'social' as VerbCategory,
  },

  // Voiding
  VOIDED: {
    id: `${ADL_NAMESPACE}/voided`,
    display: { 'en-US': 'voided' },
    description: 'Indicates a previous statement should be voided',
    category: 'session' as VerbCategory,
  },
} as const satisfies Record<string, Verb>;

// ============================================================================
// ACTIVITY STREAM VERBS
// ============================================================================

const ACTIVITYSTREA_MS = 'http://activitystrea.ms/schema/1.0';

export const VERBS_ACTIVITY_STREAM = {
  WATCHED: {
    id: `${ACTIVITYSTREA_MS}/watch`,
    display: { 'en-US': 'watched' },
    description: 'Indicates the actor watched media',
    category: 'media' as VerbCategory,
  },
  LISTENED: {
    id: `${ACTIVITYSTREA_MS}/listen`,
    display: { 'en-US': 'listened' },
    description: 'Indicates the actor listened to audio',
    category: 'media' as VerbCategory,
  },
  READ: {
    id: `${ACTIVITYSTREA_MS}/read`,
    display: { 'en-US': 'read' },
    description: 'Indicates the actor read content',
    category: 'media' as VerbCategory,
  },
  PLAYED: {
    id: `${ACTIVITYSTREA_MS}/play`,
    display: { 'en-US': 'played' },
    description: 'Indicates the actor played something',
    category: 'media' as VerbCategory,
  },
} as const satisfies Record<string, Verb>;

// ============================================================================
// CMI5 VERBS
// ============================================================================

const CMI5_NAMESPACE = 'https://w3id.org/xapi/cmi5/verbs';

export const VERBS_CMI5 = {
  WAIVED: {
    id: `${CMI5_NAMESPACE}/waived`,
    display: { 'en-US': 'waived' },
    description: 'Indicates the activity was waived',
    category: 'completion' as VerbCategory,
  },
  SATISFIED: {
    id: `${CMI5_NAMESPACE}/satisfied`,
    display: { 'en-US': 'satisfied' },
    description: 'Indicates the actor satisfied the requirements',
    category: 'completion' as VerbCategory,
  },
  ABANDONED: {
    id: `${CMI5_NAMESPACE}/abandoned`,
    display: { 'en-US': 'abandoned' },
    description: 'Indicates the actor abandoned the activity',
    category: 'session' as VerbCategory,
  },
} as const satisfies Record<string, Verb>;

// ============================================================================
// INSPIRE CUSTOM VERBS
// ============================================================================

const INSPIRE_NAMESPACE = 'https://lxd360.com/xapi/verbs';

export const VERBS_INSPIRE = {
  // Cognitive Verbs
  HESITATED: {
    id: `${INSPIRE_NAMESPACE}/hesitated`,
    display: { 'en-US': 'hesitated' },
    description: 'Indicates the actor paused or showed uncertainty',
    category: 'cognitive' as VerbCategory,
  },
  OVERLOADED: {
    id: `${INSPIRE_NAMESPACE}/overloaded`,
    display: { 'en-US': 'experienced-cognitive-overload' },
    description: 'Indicates cognitive load exceeded threshold',
    category: 'cognitive' as VerbCategory,
  },
  REFLECTED: {
    id: `${INSPIRE_NAMESPACE}/reflected`,
    display: { 'en-US': 'reflected' },
    description: 'Indicates the actor engaged in metacognitive reflection',
    category: 'cognitive' as VerbCategory,
  },

  // Adaptive Verbs
  ADAPTED_TO: {
    id: `${INSPIRE_NAMESPACE}/adapted-to`,
    display: { 'en-US': 'adapted to' },
    description: 'Indicates system adapted to learner needs',
    category: 'adaptive' as VerbCategory,
  },
  MODALITY_SWITCHED: {
    id: `${INSPIRE_NAMESPACE}/modality-switched`,
    display: { 'en-US': 'switched modality' },
    description: 'Indicates content modality was changed',
    category: 'adaptive' as VerbCategory,
  },
  SCAFFOLDED: {
    id: `${INSPIRE_NAMESPACE}/scaffolded`,
    display: { 'en-US': 'received scaffolding' },
    description: 'Indicates scaffolding support was provided',
    category: 'adaptive' as VerbCategory,
  },
  BRANCHED: {
    id: `${INSPIRE_NAMESPACE}/branched`,
    display: { 'en-US': 'branched' },
    description: 'Indicates learning path branched based on performance',
    category: 'adaptive' as VerbCategory,
  },

  // Social/Collaborative Verbs
  COLLABORATED: {
    id: `${INSPIRE_NAMESPACE}/collaborated`,
    display: { 'en-US': 'collaborated' },
    description: 'Indicates collaborative learning activity',
    category: 'social' as VerbCategory,
  },
  MENTORED: {
    id: `${INSPIRE_NAMESPACE}/mentored`,
    display: { 'en-US': 'mentored' },
    description: 'Indicates peer mentoring occurred',
    category: 'social' as VerbCategory,
  },
  PEER_REVIEWED: {
    id: `${INSPIRE_NAMESPACE}/peer-reviewed`,
    display: { 'en-US': 'peer reviewed' },
    description: 'Indicates peer review was performed',
    category: 'social' as VerbCategory,
  },

  // Media Interaction Verbs
  SEEKED: {
    id: `${INSPIRE_NAMESPACE}/seeked`,
    display: { 'en-US': 'seeked' },
    description: 'Indicates video/audio position was changed',
    category: 'media' as VerbCategory,
  },
  ZOOMED: {
    id: `${INSPIRE_NAMESPACE}/zoomed`,
    display: { 'en-US': 'zoomed' },
    description: 'Indicates content was zoomed in/out',
    category: 'media' as VerbCategory,
  },
  ROTATED: {
    id: `${INSPIRE_NAMESPACE}/rotated`,
    display: { 'en-US': 'rotated' },
    description: 'Indicates 3D/360 content was rotated',
    category: 'media' as VerbCategory,
  },
  EXPLORED: {
    id: `${INSPIRE_NAMESPACE}/explored`,
    display: { 'en-US': 'explored' },
    description: 'Indicates spatial exploration occurred',
    category: 'media' as VerbCategory,
  },

  // Assessment Verbs
  RETRIED: {
    id: `${INSPIRE_NAMESPACE}/retried`,
    display: { 'en-US': 'retried' },
    description: 'Indicates the actor attempted again',
    category: 'assessment' as VerbCategory,
  },
  REVEALED_HINT: {
    id: `${INSPIRE_NAMESPACE}/revealed-hint`,
    display: { 'en-US': 'revealed hint' },
    description: 'Indicates a hint was revealed',
    category: 'assessment' as VerbCategory,
  },
  SKIPPED: {
    id: `${INSPIRE_NAMESPACE}/skipped`,
    display: { 'en-US': 'skipped' },
    description: 'Indicates content was skipped',
    category: 'interaction' as VerbCategory,
  },

  // Competency Verbs
  ACHIEVED_RUNG: {
    id: `${INSPIRE_NAMESPACE}/achieved-rung`,
    display: { 'en-US': 'achieved competency rung' },
    description: 'Indicates a competency ladder rung was completed',
    category: 'completion' as VerbCategory,
  },
  DEMONSTRATED: {
    id: `${INSPIRE_NAMESPACE}/demonstrated`,
    display: { 'en-US': 'demonstrated' },
    description: 'Indicates skill demonstration',
    category: 'assessment' as VerbCategory,
  },
} as const satisfies Record<string, Verb>;

// ============================================================================
// COMBINED VERB EXPORTS
// ============================================================================

export const VERBS = {
  ...VERBS_ADL,
  ...VERBS_ACTIVITY_STREAM,
  ...VERBS_CMI5,
  ...VERBS_INSPIRE,
} as const;

export type VerbKey = keyof typeof VERBS;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get a verb by its ID (IRI)
 */
export function getVerbById(id: string): Verb | undefined {
  return Object.values(VERBS).find((v) => v.id === id);
}

/**
 * Get all verbs in a category
 */
export function getVerbsByCategory(category: VerbCategory): Verb[] {
  return Object.values(VERBS).filter((v) => v.category === category);
}

/**
 * Check if a string is a valid verb ID
 */
export function isValidVerbId(id: string): boolean {
  return Object.values(VERBS).some((v) => v.id === id);
}

/**
 * Get verb display text for a language
 */
export function getVerbDisplay(verb: Verb, language = 'en-US'): string {
  return verb.display[language] ?? verb.display['en-US'] ?? verb.id;
}

// ============================================================================
// INSPIRE EXTENSION IRIS
// ============================================================================

const INSPIRE_EXT_NAMESPACE = 'https://lxd360.com/xapi/extensions';

export const INSPIRE_EXTENSIONS = {
  /** Response latency in milliseconds */
  LATENCY: `${INSPIRE_EXT_NAMESPACE}/latency`,
  /** Cognitive load metric (0-100) */
  COGNITIVE_LOAD: `${INSPIRE_EXT_NAMESPACE}/cognitive-load`,
  /** Hesitation count */
  HESITATION_COUNT: `${INSPIRE_EXT_NAMESPACE}/hesitation-count`,
  /** Functional state (focused, uncertain, etc.) */
  FUNCTIONAL_STATE: `${INSPIRE_EXT_NAMESPACE}/functional-state`,
  /** Session identifier */
  SESSION_ID: `${INSPIRE_EXT_NAMESPACE}/session-id`,
  /** Content modality */
  MODALITY: `${INSPIRE_EXT_NAMESPACE}/modality`,
  /** Block identifier */
  BLOCK_ID: `${INSPIRE_EXT_NAMESPACE}/block-id`,
  /** Encoding phase */
  ENCODING_PHASE: `${INSPIRE_EXT_NAMESPACE}/encoding-phase`,
  /** Consent tier level */
  CONSENT_TIER: `${INSPIRE_EXT_NAMESPACE}/consent-tier`,
  /** Competency ladder rung */
  LADDER_RUNG: `${INSPIRE_EXT_NAMESPACE}/ladder-rung`,
  /** Proficiency level */
  PROFICIENCY_LEVEL: `${INSPIRE_EXT_NAMESPACE}/proficiency-level`,
  /** Scaffolding level */
  SCAFFOLDING_LEVEL: `${INSPIRE_EXT_NAMESPACE}/scaffolding-level`,
  /** Adaptive path taken */
  ADAPTIVE_PATH: `${INSPIRE_EXT_NAMESPACE}/adaptive-path`,
  /** Engagement level */
  ENGAGEMENT_LEVEL: `${INSPIRE_EXT_NAMESPACE}/engagement-level`,
  /** Dual coding score */
  DUAL_CODING_SCORE: `${INSPIRE_EXT_NAMESPACE}/dual-coding-score`,
} as const;

export type INSPIREExtensionKey = keyof typeof INSPIRE_EXTENSIONS;
