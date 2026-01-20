// ============================================================================
// XAPI ACTIVITY TYPES REGISTRY
// ============================================================================

/**
 * Comprehensive activity type registry organized by category
 * Includes ADL, TinCan, xAPI profiles, and custom LXD360 types
 */
export const ACTIVITY_TYPES = {
  // ==========================================================================
  // COURSE STRUCTURE TYPES (ADL)
  // ==========================================================================

  /**
   * A course or training curriculum
   */
  course: 'http://adlnet.gov/expapi/activities/course',

  /**
   * A module or unit within a course
   */
  module: 'http://adlnet.gov/expapi/activities/module',

  /**
   * A lesson or topic within a module
   */
  lesson: 'http://adlnet.gov/expapi/activities/lesson',

  /**
   * A learning objective
   */
  objective: 'http://adlnet.gov/expapi/activities/objective',

  /**
   * An attempt at an activity
   */
  attempt: 'http://adlnet.gov/expapi/activities/attempt',

  // ==========================================================================
  // MEDIA TYPES
  // ==========================================================================

  /**
   * Generic media content
   */
  media: 'http://adlnet.gov/expapi/activities/media',

  /**
   * Video content (xAPI Video Profile)
   */
  video: 'https://w3id.org/xapi/video/activity-type/video',

  /**
   * Audio content (xAPI Audio Profile)
   */
  audio: 'https://w3id.org/xapi/audio/activity-type/audio',

  /**
   * Image content
   */
  image: 'http://id.tincanapi.com/activitytype/image',

  /**
   * Document file (PDF, Word, etc.)
   */
  document: 'http://id.tincanapi.com/activitytype/document',

  /**
   * Slide presentation
   */
  slide: 'http://id.tincanapi.com/activitytype/slide',

  /**
   * Slide deck/presentation
   */
  slideshow: 'http://id.tincanapi.com/activitytype/slide-deck',

  // ==========================================================================
  // ASSESSMENT TYPES (ADL)
  // ==========================================================================

  /**
   * An assessment or test
   */
  assessment: 'http://adlnet.gov/expapi/activities/assessment',

  /**
   * A question or assessment item
   */
  question: 'http://adlnet.gov/expapi/activities/question',

  /**
   * An interaction (cmi.interaction)
   */
  interaction: 'http://adlnet.gov/expapi/activities/cmi.interaction',

  /**
   * A performance-based assessment
   */
  performance: 'http://adlnet.gov/expapi/activities/performance',

  // ==========================================================================
  // CONTENT TYPES (TinCan/Activity Streams)
  // ==========================================================================

  /**
   * An article or text content
   */
  article: 'http://activitystrea.ms/schema/1.0/article',

  /**
   * A book or ebook
   */
  book: 'http://id.tincanapi.com/activitytype/book',

  /**
   * A chapter within a book
   */
  chapter: 'http://id.tincanapi.com/activitytype/chapter',

  /**
   * An ebook
   */
  ebook: 'http://id.tincanapi.com/activitytype/ebook',

  /**
   * A file attachment
   */
  file: 'http://adlnet.gov/expapi/activities/file',

  /**
   * A link to external content
   */
  link: 'http://adlnet.gov/expapi/activities/link',

  /**
   * A meeting or event
   */
  meeting: 'http://adlnet.gov/expapi/activities/meeting',

  /**
   * A user profile
   */
  profile: 'http://adlnet.gov/expapi/activities/profile',

  // ==========================================================================
  // SIMULATION & GAME TYPES (ADL/TinCan)
  // ==========================================================================

  /**
   * A simulation activity
   */
  simulation: 'http://adlnet.gov/expapi/activities/simulation',

  /**
   * A serious game
   */
  game: 'http://id.tincanapi.com/activitytype/serious-game',

  /**
   * A scenario or branching activity
   */
  scenario: 'https://lxp360.com/xapi/activities/scenario',

  // ==========================================================================
  // CUSTOM LXD360 ACTIVITY TYPES
  // ==========================================================================

  // --- Interactive Content ---

  /**
   * Flashcard activity
   */
  flashcard: 'https://lxd360.com/xapi/activities/flashcard',

  /**
   * Hotspot image interaction
   */
  hotspot: 'https://lxd360.com/xapi/activities/hotspot',

  /**
   * Timeline interactive
   */
  timeline: 'https://lxd360.com/xapi/activities/timeline',

  /**
   * Branching scenario
   */
  branching: 'https://lxd360.com/xapi/activities/branching-scenario',

  /**
   * Accordion expandable content
   */
  accordion: 'https://lxd360.com/xapi/activities/accordion',

  /**
   * Tabs content container
   */
  tabs: 'https://lxd360.com/xapi/activities/tabs',

  /**
   * Carousel/slider content
   */
  carousel: 'https://lxd360.com/xapi/activities/carousel',

  /**
   * Flip card interaction
   */
  flipcard: 'https://lxd360.com/xapi/activities/flipcard',

  /**
   * Process/steps diagram
   */
  process: 'https://lxd360.com/xapi/activities/process',

  /**
   * Labeled image with annotations
   */
  labeledImage: 'https://lxd360.com/xapi/activities/labeled-image',

  /**
   * Click-to-reveal content
   */
  clickReveal: 'https://lxd360.com/xapi/activities/click-reveal',

  /**
   * Slider-reveal content
   */
  sliderReveal: 'https://lxd360.com/xapi/activities/slider-reveal',

  /**
   * Image comparison (before/after)
   */
  imageCompare: 'https://lxd360.com/xapi/activities/image-compare',

  /**
   * Lightbox modal content
   */
  lightbox: 'https://lxd360.com/xapi/activities/lightbox',

  // --- Drag & Drop Activities ---

  /**
   * Sorting activity
   */
  sorting: 'https://lxd360.com/xapi/activities/sorting',

  /**
   * Matching activity
   */
  matching: 'https://lxd360.com/xapi/activities/matching',

  /**
   * Categorization activity
   */
  categorize: 'https://lxd360.com/xapi/activities/categorize',

  /**
   * Ordering/sequencing activity
   */
  ordering: 'https://lxd360.com/xapi/activities/ordering',

  /**
   * Ranking activity
   */
  ranking: 'https://lxd360.com/xapi/activities/ranking',

  // --- Question Types ---

  /**
   * Multiple choice question
   */
  multipleChoice: 'https://lxd360.com/xapi/activities/multiple-choice',

  /**
   * Multiple select question
   */
  multipleSelect: 'https://lxd360.com/xapi/activities/multiple-select',

  /**
   * True/false question
   */
  trueFalse: 'https://lxd360.com/xapi/activities/true-false',

  /**
   * Fill-in-the-blank question
   */
  fillBlank: 'https://lxd360.com/xapi/activities/fill-blank',

  /**
   * Short answer question
   */
  shortAnswer: 'https://lxd360.com/xapi/activities/short-answer',

  /**
   * Essay/long form question
   */
  essay: 'https://lxd360.com/xapi/activities/essay',

  /**
   * Hotspot question
   */
  hotspotQuestion: 'https://lxd360.com/xapi/activities/hotspot-question',

  /**
   * Likert scale question
   */
  likert: 'https://lxd360.com/xapi/activities/likert',

  /**
   * File upload question
   */
  fileUpload: 'https://lxd360.com/xapi/activities/file-upload',

  /**
   * Knowledge check (informal assessment)
   */
  knowledgeCheck: 'https://lxd360.com/xapi/activities/knowledge-check',

  /**
   * Survey activity
   */
  survey: 'https://lxd360.com/xapi/activities/survey',

  /**
   * Quiz container
   */
  quiz: 'https://lxd360.com/xapi/activities/quiz',

  // --- Text Content Types ---

  /**
   * Text paragraph content
   */
  textParagraph: 'https://lxd360.com/xapi/activities/text-paragraph',

  /**
   * Heading content
   */
  heading: 'https://lxd360.com/xapi/activities/heading',

  /**
   * Quote/blockquote content
   */
  quote: 'https://lxd360.com/xapi/activities/quote',

  /**
   * Code block content
   */
  codeBlock: 'https://lxd360.com/xapi/activities/code-block',

  /**
   * List content
   */
  list: 'https://lxd360.com/xapi/activities/list',

  /**
   * Callout/alert content
   */
  callout: 'https://lxd360.com/xapi/activities/callout',

  // --- Data & Visualization Types ---

  /**
   * Table content
   */
  table: 'https://lxd360.com/xapi/activities/table',

  /**
   * Chart/graph visualization
   */
  chart: 'https://lxd360.com/xapi/activities/chart',

  /**
   * Statistics display
   */
  stat: 'https://lxd360.com/xapi/activities/stat',

  /**
   * Comparison table/chart
   */
  comparison: 'https://lxd360.com/xapi/activities/comparison',

  /**
   * Data card display
   */
  dataCard: 'https://lxd360.com/xapi/activities/data-card',

  // --- Scenario & Dialogue Types ---

  /**
   * Dialogue content
   */
  dialogue: 'https://lxd360.com/xapi/activities/dialogue',

  /**
   * Conversation/chat content
   */
  conversation: 'https://lxd360.com/xapi/activities/conversation',

  /**
   * Character display
   */
  character: 'https://lxd360.com/xapi/activities/character',

  /**
   * Decision point in scenario
   */
  decision: 'https://lxd360.com/xapi/activities/decision',

  /**
   * Scenario node
   */
  scenarioNode: 'https://lxd360.com/xapi/activities/scenario-node',

  // --- Layout & Container Types ---

  /**
   * Container/section
   */
  container: 'https://lxd360.com/xapi/activities/container',

  /**
   * Grid layout
   */
  grid: 'https://lxd360.com/xapi/activities/grid',

  /**
   * Columns layout
   */
  columns: 'https://lxd360.com/xapi/activities/columns',

  /**
   * Card component
   */
  card: 'https://lxd360.com/xapi/activities/card',

  // --- Special Content Types ---

  /**
   * Testimonial content
   */
  testimonial: 'https://lxd360.com/xapi/activities/testimonial',

  /**
   * Team member profile
   */
  teamMember: 'https://lxd360.com/xapi/activities/team-member',

  /**
   * Feature list
   */
  feature: 'https://lxd360.com/xapi/activities/feature',

  /**
   * Call-to-action
   */
  cta: 'https://lxd360.com/xapi/activities/cta',

  /**
   * Countdown timer
   */
  countdown: 'https://lxd360.com/xapi/activities/countdown',

  /**
   * Progress indicator
   */
  progress: 'https://lxd360.com/xapi/activities/progress',

  /**
   * Code playground (interactive code editor)
   */
  codePlayground: 'https://lxd360.com/xapi/activities/code-playground',

  /**
   * Embed content (iframe, oembed)
   */
  embed: 'https://lxd360.com/xapi/activities/embed',

  /**
   * Image gallery
   */
  gallery: 'https://lxd360.com/xapi/activities/gallery',

  // --- Gamification & Achievement Types ---

  /**
   * Badge earned
   */
  badge: 'https://lxd360.com/xapi/activities/badge',

  /**
   * Certificate earned
   */
  certificate: 'https://lxd360.com/xapi/activities/certificate',

  /**
   * Learning path
   */
  learningPath: 'https://lxd360.com/xapi/activities/learning-path',

  /**
   * Microlearning unit
   */
  microlearning: 'https://lxd360.com/xapi/activities/microlearning',

  /**
   * Practice exercise
   */
  practiceExercise: 'https://lxd360.com/xapi/activities/practice-exercise',

  /**
   * Safety checklist
   */
  safetyChecklist: 'https://lxd360.com/xapi/activities/safety-checklist',

  // --- Immersive Types ---

  /**
   * 3D simulation
   */
  simulation3d: 'https://lxd360.com/xapi/activities/simulation-3d',

  /**
   * VR experience
   */
  vrExperience: 'https://lxd360.com/xapi/activities/vr-experience',

  /**
   * AR experience
   */
  arExperience: 'https://lxd360.com/xapi/activities/ar-experience',
} as const;

/**
 * Type for activity type keys
 */
export type ActivityTypeKey = keyof typeof ACTIVITY_TYPES;

/**
 * Get activity type IRI by key
 *
 * @param key - Activity type key
 * @returns Activity type IRI
 */
export function getActivityType(key: ActivityTypeKey): string {
  return ACTIVITY_TYPES[key];
}

/**
 * Check if an activity type IRI exists
 *
 * @param typeId - Activity type IRI to check
 * @returns true if type exists
 */
export function isValidActivityType(typeId: string): boolean {
  return (Object.values(ACTIVITY_TYPES) as string[]).includes(typeId);
}

/**
 * Get activity type key from IRI
 *
 * @param typeId - Activity type IRI
 * @returns Activity type key or undefined
 */
export function getActivityTypeKey(typeId: string): ActivityTypeKey | undefined {
  const entry = Object.entries(ACTIVITY_TYPES).find(([, type]) => type === typeId);
  return entry?.[0] as ActivityTypeKey | undefined;
}

/**
 * Activity type categories for organization
 */
export const ACTIVITY_TYPE_CATEGORIES = {
  structure: ['course', 'module', 'lesson', 'objective', 'attempt'] as ActivityTypeKey[],
  media: [
    'media',
    'video',
    'audio',
    'image',
    'document',
    'slide',
    'slideshow',
    'gallery',
    'embed',
  ] as ActivityTypeKey[],
  assessment: [
    'assessment',
    'question',
    'interaction',
    'performance',
    'quiz',
    'knowledgeCheck',
    'survey',
    'multipleChoice',
    'multipleSelect',
    'trueFalse',
    'fillBlank',
    'shortAnswer',
    'essay',
    'hotspotQuestion',
    'likert',
    'fileUpload',
  ] as ActivityTypeKey[],
  interactive: [
    'accordion',
    'tabs',
    'carousel',
    'flipcard',
    'hotspot',
    'labeledImage',
    'clickReveal',
    'sliderReveal',
    'imageCompare',
    'lightbox',
    'timeline',
    'process',
    'flashcard',
  ] as ActivityTypeKey[],
  dragdrop: ['sorting', 'matching', 'categorize', 'ordering', 'ranking'] as ActivityTypeKey[],
  scenario: [
    'scenario',
    'branching',
    'dialogue',
    'conversation',
    'character',
    'decision',
    'scenarioNode',
  ] as ActivityTypeKey[],
  text: [
    'article',
    'textParagraph',
    'heading',
    'quote',
    'codeBlock',
    'list',
    'callout',
  ] as ActivityTypeKey[],
  data: ['table', 'chart', 'stat', 'comparison', 'dataCard'] as ActivityTypeKey[],
  layout: ['container', 'grid', 'columns', 'card'] as ActivityTypeKey[],
  special: [
    'testimonial',
    'teamMember',
    'feature',
    'cta',
    'countdown',
    'progress',
    'codePlayground',
  ] as ActivityTypeKey[],
  gamification: [
    'badge',
    'certificate',
    'learningPath',
    'microlearning',
    'practiceExercise',
    'safetyChecklist',
  ] as ActivityTypeKey[],
  immersive: [
    'simulation',
    'simulation3d',
    'vrExperience',
    'arExperience',
    'game',
  ] as ActivityTypeKey[],
  content: ['book', 'chapter', 'ebook', 'file', 'link', 'meeting', 'profile'] as ActivityTypeKey[],
} as const;

export type ActivityTypeCategory = keyof typeof ACTIVITY_TYPE_CATEGORIES;
