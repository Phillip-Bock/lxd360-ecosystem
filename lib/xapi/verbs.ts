import type { Verb } from './types';

// ============================================================================
// XAPI VERB REGISTRY
// ============================================================================

/**
 * Comprehensive xAPI verb registry organized by category
 * Includes ADL core verbs, video/audio profile verbs, and custom LXD360 verbs
 */
export const XAPI_VERBS = {
  // ==========================================================================
  // CORE ADL VERBS
  // ==========================================================================

  /**
   * Indicates the actor experienced the object (view, read, observe)
   */
  experienced: {
    id: 'http://adlnet.gov/expapi/verbs/experienced',
    display: { 'en-US': 'experienced' },
  },

  /**
   * Indicates attendance at an event or virtual event
   */
  attended: {
    id: 'http://adlnet.gov/expapi/verbs/attended',
    display: { 'en-US': 'attended' },
  },

  /**
   * Indicates an effort to complete an activity
   */
  attempted: {
    id: 'http://adlnet.gov/expapi/verbs/attempted',
    display: { 'en-US': 'attempted' },
  },

  /**
   * Indicates the actor finished or concluded the activity
   */
  completed: {
    id: 'http://adlnet.gov/expapi/verbs/completed',
    display: { 'en-US': 'completed' },
  },

  /**
   * Indicates the actor achieved a passing score
   */
  passed: {
    id: 'http://adlnet.gov/expapi/verbs/passed',
    display: { 'en-US': 'passed' },
  },

  /**
   * Indicates the actor did not achieve a passing score
   */
  failed: {
    id: 'http://adlnet.gov/expapi/verbs/failed',
    display: { 'en-US': 'failed' },
  },

  /**
   * Indicates the actor replied to a question
   */
  answered: {
    id: 'http://adlnet.gov/expapi/verbs/answered',
    display: { 'en-US': 'answered' },
  },

  /**
   * Indicates the actor engaged with the object
   */
  interacted: {
    id: 'http://adlnet.gov/expapi/verbs/interacted',
    display: { 'en-US': 'interacted' },
  },

  /**
   * Indicates the actor started an activity
   */
  launched: {
    id: 'http://adlnet.gov/expapi/verbs/launched',
    display: { 'en-US': 'launched' },
  },

  /**
   * Indicates the actor left or closed an activity
   */
  exited: {
    id: 'http://adlnet.gov/expapi/verbs/exited',
    display: { 'en-US': 'exited' },
  },

  /**
   * Indicates the actor started a process or application
   */
  initialized: {
    id: 'http://adlnet.gov/expapi/verbs/initialized',
    display: { 'en-US': 'initialized' },
  },

  /**
   * Indicates the actor progressed in the activity
   */
  progressed: {
    id: 'http://adlnet.gov/expapi/verbs/progressed',
    display: { 'en-US': 'progressed' },
  },

  /**
   * Indicates the actor achieved mastery
   */
  mastered: {
    id: 'http://adlnet.gov/expapi/verbs/mastered',
    display: { 'en-US': 'mastered' },
  },

  /**
   * Indicates a score was achieved
   */
  scored: {
    id: 'http://adlnet.gov/expapi/verbs/scored',
    display: { 'en-US': 'scored' },
  },

  /**
   * Indicates the actor terminated the activity
   */
  terminated: {
    id: 'http://adlnet.gov/expapi/verbs/terminated',
    display: { 'en-US': 'terminated' },
  },

  /**
   * Indicates the actor suspended the activity for later
   */
  suspended: {
    id: 'http://adlnet.gov/expapi/verbs/suspended',
    display: { 'en-US': 'suspended' },
  },

  /**
   * Indicates the actor resumed a previously suspended activity
   */
  resumed: {
    id: 'http://adlnet.gov/expapi/verbs/resumed',
    display: { 'en-US': 'resumed' },
  },

  /**
   * Indicates the actor registered for the activity
   */
  registered: {
    id: 'http://adlnet.gov/expapi/verbs/registered',
    display: { 'en-US': 'registered' },
  },

  /**
   * Indicates the actor posed a question
   */
  asked: {
    id: 'http://adlnet.gov/expapi/verbs/asked',
    display: { 'en-US': 'asked' },
  },

  /**
   * Indicates the actor made a comment
   */
  commented: {
    id: 'http://adlnet.gov/expapi/verbs/commented',
    display: { 'en-US': 'commented' },
  },

  /**
   * Indicates the actor shared content
   */
  shared: {
    id: 'http://adlnet.gov/expapi/verbs/shared',
    display: { 'en-US': 'shared' },
  },

  /**
   * Indicates the actor expressed a preference
   */
  preferred: {
    id: 'http://adlnet.gov/expapi/verbs/preferred',
    display: { 'en-US': 'preferred' },
  },

  /**
   * Indicates the actor nullified a previous statement
   */
  voided: {
    id: 'http://adlnet.gov/expapi/verbs/voided',
    display: { 'en-US': 'voided' },
  },

  // ==========================================================================
  // CMI5 PROFILE VERBS
  // ==========================================================================

  /**
   * Indicates the learner satisfied the objective (cmi5)
   */
  satisfied: {
    id: 'https://w3id.org/xapi/adl/verbs/satisfied',
    display: { 'en-US': 'satisfied' },
  },

  /**
   * Indicates the requirement was waived for the learner (cmi5)
   */
  waived: {
    id: 'https://w3id.org/xapi/adl/verbs/waived',
    display: { 'en-US': 'waived' },
  },

  // ==========================================================================
  // VIDEO PROFILE VERBS (xAPI Video Profile)
  // ==========================================================================

  /**
   * Indicates video/audio playback started
   */
  played: {
    id: 'https://w3id.org/xapi/video/verbs/played',
    display: { 'en-US': 'played' },
  },

  /**
   * Indicates video/audio playback was paused
   */
  paused: {
    id: 'https://w3id.org/xapi/video/verbs/paused',
    display: { 'en-US': 'paused' },
  },

  /**
   * Indicates the actor jumped to a different position
   */
  seeked: {
    id: 'https://w3id.org/xapi/video/verbs/seeked',
    display: { 'en-US': 'seeked' },
  },

  // ==========================================================================
  // TINCAN API / ACTIVITY STREAMS VERBS
  // ==========================================================================

  /**
   * Indicates the actor skipped content
   */
  skipped: {
    id: 'http://id.tincanapi.com/verb/skipped',
    display: { 'en-US': 'skipped' },
  },

  /**
   * Indicates the actor bookmarked content for later
   */
  bookmarked: {
    id: 'http://id.tincanapi.com/verb/bookmarked',
    display: { 'en-US': 'bookmarked' },
  },

  /**
   * Indicates the actor reviewed content
   */
  reviewed: {
    id: 'http://id.tincanapi.com/verb/reviewed',
    display: { 'en-US': 'reviewed' },
  },

  /**
   * Indicates the actor downloaded content
   */
  downloaded: {
    id: 'http://id.tincanapi.com/verb/downloaded',
    display: { 'en-US': 'downloaded' },
  },

  /**
   * Indicates the actor liked content
   */
  liked: {
    id: 'http://id.tincanapi.com/verb/liked',
    display: { 'en-US': 'liked' },
  },

  /**
   * Indicates the actor earned something (badge, points, etc.)
   */
  earned: {
    id: 'http://id.tincanapi.com/verb/earned',
    display: { 'en-US': 'earned' },
  },

  /**
   * Indicates the actor viewed content (typically read)
   */
  viewed: {
    id: 'http://id.tincanapi.com/verb/viewed',
    display: { 'en-US': 'viewed' },
  },

  /**
   * Indicates the actor read content
   */
  read: {
    id: 'http://id.tincanapi.com/verb/read',
    display: { 'en-US': 'read' },
  },

  /**
   * Indicates the actor started something
   */
  started: {
    id: 'http://id.tincanapi.com/verb/started',
    display: { 'en-US': 'started' },
  },

  /**
   * Indicates the actor created content
   */
  created: {
    id: 'http://id.tincanapi.com/verb/created',
    display: { 'en-US': 'created' },
  },

  /**
   * Indicates the actor edited content
   */
  edited: {
    id: 'http://id.tincanapi.com/verb/edited',
    display: { 'en-US': 'edited' },
  },

  /**
   * Indicates the actor closed something
   */
  closed: {
    id: 'http://id.tincanapi.com/verb/closed',
    display: { 'en-US': 'closed' },
  },

  /**
   * Indicates the actor opened something
   */
  opened: {
    id: 'http://id.tincanapi.com/verb/opened',
    display: { 'en-US': 'opened' },
  },

  // ==========================================================================
  // CUSTOM LXD360 VERBS
  // ==========================================================================

  /**
   * Indicates the actor identified something (hazards, objects, etc.)
   */
  identified: {
    id: 'https://lxd360.com/xapi/verbs/identified',
    display: { 'en-US': 'identified' },
  },

  /**
   * Indicates the actor rated content
   */
  rated: {
    id: 'https://lxd360.com/xapi/verbs/rated',
    display: { 'en-US': 'rated' },
  },

  /**
   * Indicates the actor selected an option or choice
   */
  selected: {
    id: 'https://lxd360.com/xapi/verbs/selected',
    display: { 'en-US': 'selected' },
  },

  /**
   * Indicates the actor submitted a response
   */
  submitted: {
    id: 'https://lxd360.com/xapi/verbs/submitted',
    display: { 'en-US': 'submitted' },
  },

  /**
   * Indicates the actor unlocked content or an achievement
   */
  unlocked: {
    id: 'https://lxd360.com/xapi/verbs/unlocked',
    display: { 'en-US': 'unlocked' },
  },

  /**
   * Indicates the actor explored content (scenario navigation, etc.)
   */
  explored: {
    id: 'https://lxd360.com/xapi/verbs/explored',
    display: { 'en-US': 'explored' },
  },

  /**
   * Indicates the actor toggled something (accordion, tab, etc.)
   */
  toggled: {
    id: 'https://lxd360.com/xapi/verbs/toggled',
    display: { 'en-US': 'toggled' },
  },

  /**
   * Indicates the actor expanded content (accordion, details, etc.)
   */
  expanded: {
    id: 'https://lxd360.com/xapi/verbs/expanded',
    display: { 'en-US': 'expanded' },
  },

  /**
   * Indicates the actor collapsed content
   */
  collapsed: {
    id: 'https://lxd360.com/xapi/verbs/collapsed',
    display: { 'en-US': 'collapsed' },
  },

  /**
   * Indicates the actor dragged an item
   */
  dragged: {
    id: 'https://lxd360.com/xapi/verbs/dragged',
    display: { 'en-US': 'dragged' },
  },

  /**
   * Indicates the actor dropped an item
   */
  dropped: {
    id: 'https://lxd360.com/xapi/verbs/dropped',
    display: { 'en-US': 'dropped' },
  },

  /**
   * Indicates the actor flipped content (flipcard)
   */
  flipped: {
    id: 'https://lxd360.com/xapi/verbs/flipped',
    display: { 'en-US': 'flipped' },
  },

  /**
   * Indicates the actor clicked on something (hotspot, button, etc.)
   */
  clicked: {
    id: 'https://lxd360.com/xapi/verbs/clicked',
    display: { 'en-US': 'clicked' },
  },

  /**
   * Indicates the actor hovered over something
   */
  hovered: {
    id: 'https://lxd360.com/xapi/verbs/hovered',
    display: { 'en-US': 'hovered' },
  },

  /**
   * Indicates the actor matched items correctly
   */
  matched: {
    id: 'https://lxd360.com/xapi/verbs/matched',
    display: { 'en-US': 'matched' },
  },

  /**
   * Indicates the actor sorted items
   */
  sorted: {
    id: 'https://lxd360.com/xapi/verbs/sorted',
    display: { 'en-US': 'sorted' },
  },

  /**
   * Indicates the actor categorized items
   */
  categorized: {
    id: 'https://lxd360.com/xapi/verbs/categorized',
    display: { 'en-US': 'categorized' },
  },

  /**
   * Indicates the actor scrolled content
   */
  scrolled: {
    id: 'https://lxd360.com/xapi/verbs/scrolled',
    display: { 'en-US': 'scrolled' },
  },

  /**
   * Indicates the actor zoomed content
   */
  zoomed: {
    id: 'https://lxd360.com/xapi/verbs/zoomed',
    display: { 'en-US': 'zoomed' },
  },

  /**
   * Indicates the actor retried an activity
   */
  retried: {
    id: 'https://lxd360.com/xapi/verbs/retried',
    display: { 'en-US': 'retried' },
  },

  /**
   * Indicates the actor requested a hint
   */
  hinted: {
    id: 'https://lxd360.com/xapi/verbs/hinted',
    display: { 'en-US': 'requested hint' },
  },

  /**
   * Indicates the actor navigated to a different section
   */
  navigated: {
    id: 'https://lxd360.com/xapi/verbs/navigated',
    display: { 'en-US': 'navigated' },
  },

  /**
   * Indicates the actor chose a path in a scenario
   */
  chose: {
    id: 'https://lxd360.com/xapi/verbs/chose',
    display: { 'en-US': 'chose' },
  },

  /**
   * Indicates the actor decided in a decision point
   */
  decided: {
    id: 'https://lxd360.com/xapi/verbs/decided',
    display: { 'en-US': 'decided' },
  },

  /**
   * Indicates the actor revealed hidden content
   */
  revealed: {
    id: 'https://lxd360.com/xapi/verbs/revealed',
    display: { 'en-US': 'revealed' },
  },

  /**
   * Indicates the actor highlighted content
   */
  highlighted: {
    id: 'https://lxd360.com/xapi/verbs/highlighted',
    display: { 'en-US': 'highlighted' },
  },

  /**
   * Indicates the actor annotated content
   */
  annotated: {
    id: 'https://lxd360.com/xapi/verbs/annotated',
    display: { 'en-US': 'annotated' },
  },

  /**
   * Indicates the actor recorded content (audio/video)
   */
  recorded: {
    id: 'https://lxd360.com/xapi/verbs/recorded',
    display: { 'en-US': 'recorded' },
  },

  /**
   * Indicates the actor uploaded content
   */
  uploaded: {
    id: 'https://lxd360.com/xapi/verbs/uploaded',
    display: { 'en-US': 'uploaded' },
  },

  /**
   * Indicates the actor printed content
   */
  printed: {
    id: 'https://lxd360.com/xapi/verbs/printed',
    display: { 'en-US': 'printed' },
  },
} as const satisfies Record<string, Verb>;

/**
 * Type for verb keys from the registry
 */
export type XAPIVerbKey = keyof typeof XAPI_VERBS;

/**
 * Get a verb by key
 *
 * @param key - Verb key from XAPI_VERBS
 * @returns Verb object
 */
export function getXAPIVerb(key: XAPIVerbKey): Verb {
  return XAPI_VERBS[key];
}

/**
 * Check if a verb ID exists in the registry
 *
 * @param verbId - Verb IRI to check
 * @returns true if verb exists
 */
export function isValidVerbId(verbId: string): boolean {
  return Object.values(XAPI_VERBS).some((verb) => verb.id === verbId);
}

/**
 * Get verb key from verb ID
 *
 * @param verbId - Verb IRI
 * @returns Verb key or undefined
 */
export function getVerbKeyFromId(verbId: string): XAPIVerbKey | undefined {
  const entry = Object.entries(XAPI_VERBS).find(([, verb]) => verb.id === verbId);
  return entry?.[0] as XAPIVerbKey | undefined;
}

/**
 * Verb categories for organization
 */
export const VERB_CATEGORIES = {
  lifecycle: [
    'launched',
    'initialized',
    'terminated',
    'exited',
    'suspended',
    'resumed',
  ] as XAPIVerbKey[],
  progress: ['started', 'progressed', 'completed', 'mastered'] as XAPIVerbKey[],
  assessment: ['attempted', 'answered', 'passed', 'failed', 'scored'] as XAPIVerbKey[],
  media: ['played', 'paused', 'seeked'] as XAPIVerbKey[],
  interaction: [
    'interacted',
    'clicked',
    'hovered',
    'toggled',
    'expanded',
    'collapsed',
    'revealed',
  ] as XAPIVerbKey[],
  navigation: ['navigated', 'scrolled', 'zoomed', 'bookmarked'] as XAPIVerbKey[],
  content: ['experienced', 'viewed', 'read', 'attended', 'reviewed'] as XAPIVerbKey[],
  social: ['commented', 'shared', 'liked', 'rated'] as XAPIVerbKey[],
  creation: ['created', 'edited', 'uploaded', 'recorded', 'annotated'] as XAPIVerbKey[],
  gamification: ['earned', 'unlocked', 'skipped', 'retried', 'hinted'] as XAPIVerbKey[],
  dragdrop: ['dragged', 'dropped', 'matched', 'sorted', 'categorized'] as XAPIVerbKey[],
  scenario: ['chose', 'decided', 'explored', 'identified', 'selected'] as XAPIVerbKey[],
  misc: [
    'downloaded',
    'printed',
    'opened',
    'closed',
    'flipped',
    'highlighted',
    'submitted',
  ] as XAPIVerbKey[],
} as const;

export type VerbCategory = keyof typeof VERB_CATEGORIES;
