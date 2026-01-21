import { ACTIVITY_TYPES } from '../activity-types';
import type { Result } from '../types';
import type { XAPIVerbKey } from '../verbs';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Event template defining which verb to use for a specific trigger
 */
export interface EventTemplate {
  /** The event trigger name (e.g., 'started', 'completed', 'clicked') */
  trigger: string;
  /** The xAPI verb to use */
  verb: XAPIVerbKey;
  /** The activity type IRI */
  activityType: string;
  /** Optional result template */
  resultTemplate?: Partial<Result>;
  /** Optional result extensions to include */
  resultExtensions?: Record<string, string>;
  /** Optional context extensions to include */
  contextExtensions?: Record<string, string>;
}

/**
 * Statement template for a specific content block type
 */
export interface StatementTemplate {
  /** The block type this template is for */
  blockType: string;
  /** Description of the block */
  description: string;
  /** All events that can be tracked for this block */
  events: EventTemplate[];
}

// ============================================================================
// EXTENSION URIS
// ============================================================================

/**
 * Common extension URIs used across templates
 */
export const EXTENSION_URIS = {
  // Video extensions
  videoTime: 'https://w3id.org/xapi/video/extensions/time',
  videoProgress: 'https://w3id.org/xapi/video/extensions/progress',
  videoLength: 'https://w3id.org/xapi/video/extensions/length',
  videoTimeFrom: 'https://w3id.org/xapi/video/extensions/time-from',
  videoTimeTo: 'https://w3id.org/xapi/video/extensions/time-to',
  videoPlaybackRate: 'https://w3id.org/xapi/video/extensions/playback-rate',
  videoVolume: 'https://w3id.org/xapi/video/extensions/volume',
  videoFullScreen: 'https://w3id.org/xapi/video/extensions/full-screen',
  videoQuality: 'https://w3id.org/xapi/video/extensions/quality',
  videoSessionId: 'https://w3id.org/xapi/video/extensions/session-id',

  // Reading extensions
  pageNumber: 'https://lxd360.com/xapi/extensions/page-number',
  totalPages: 'https://lxd360.com/xapi/extensions/total-pages',
  scrollPercentage: 'https://lxd360.com/xapi/extensions/scroll-percentage',
  timeOnPage: 'https://lxd360.com/xapi/extensions/time-on-page',
  bookmarkPosition: 'https://lxd360.com/xapi/extensions/bookmark-position',

  // Assessment extensions
  attemptNumber: 'https://lxd360.com/xapi/extensions/attempt-number',
  questionId: 'https://lxd360.com/xapi/extensions/question-id',
  questionType: 'https://lxd360.com/xapi/extensions/question-type',
  timeSpent: 'https://lxd360.com/xapi/extensions/time-spent',
  hintsUsed: 'https://lxd360.com/xapi/extensions/hints-used',
  responseChanged: 'https://lxd360.com/xapi/extensions/response-changed',
  partialCredit: 'https://lxd360.com/xapi/extensions/partial-credit',

  // Interactive extensions
  itemId: 'https://lxd360.com/xapi/extensions/item-id',
  itemIndex: 'https://lxd360.com/xapi/extensions/item-index',
  totalItems: 'https://lxd360.com/xapi/extensions/total-items',
  interactionCount: 'https://lxd360.com/xapi/extensions/interaction-count',
  expandedItems: 'https://lxd360.com/xapi/extensions/expanded-items',
  selectedTab: 'https://lxd360.com/xapi/extensions/selected-tab',
  slideIndex: 'https://lxd360.com/xapi/extensions/slide-index',
  flipState: 'https://lxd360.com/xapi/extensions/flip-state',

  // Hotspot extensions
  hotspotId: 'https://lxd360.com/xapi/extensions/hotspot-id',
  clickX: 'https://lxd360.com/xapi/extensions/click-x',
  clickY: 'https://lxd360.com/xapi/extensions/click-y',
  visitedHotspots: 'https://lxd360.com/xapi/extensions/visited-hotspots',

  // Scenario extensions
  choiceId: 'https://lxd360.com/xapi/extensions/choice-id',
  choiceText: 'https://lxd360.com/xapi/extensions/choice-text',
  branchId: 'https://lxd360.com/xapi/extensions/branch-id',
  scenarioPath: 'https://lxd360.com/xapi/extensions/scenario-path',
  optimalPath: 'https://lxd360.com/xapi/extensions/optimal-path',
  pathDeviation: 'https://lxd360.com/xapi/extensions/path-deviation',
  nodeId: 'https://lxd360.com/xapi/extensions/node-id',
  characterId: 'https://lxd360.com/xapi/extensions/character-id',

  // Drag & Drop extensions
  sourcePosition: 'https://lxd360.com/xapi/extensions/source-position',
  targetPosition: 'https://lxd360.com/xapi/extensions/target-position',
  itemsOrdered: 'https://lxd360.com/xapi/extensions/items-ordered',
  correctMatches: 'https://lxd360.com/xapi/extensions/correct-matches',
  incorrectMatches: 'https://lxd360.com/xapi/extensions/incorrect-matches',
  categoryId: 'https://lxd360.com/xapi/extensions/category-id',

  // Code playground extensions
  codeLanguage: 'https://lxd360.com/xapi/extensions/code-language',
  codeOutput: 'https://lxd360.com/xapi/extensions/code-output',
  codeErrors: 'https://lxd360.com/xapi/extensions/code-errors',
  executionTime: 'https://lxd360.com/xapi/extensions/execution-time',

  // Progress extensions
  progressValue: 'https://lxd360.com/xapi/extensions/progress-value',
  progressMax: 'https://lxd360.com/xapi/extensions/progress-max',

  // Timeline extensions
  eventId: 'https://lxd360.com/xapi/extensions/event-id',
  eventDate: 'https://lxd360.com/xapi/extensions/event-date',

  // File extensions
  fileName: 'https://lxd360.com/xapi/extensions/file-name',
  fileSize: 'https://lxd360.com/xapi/extensions/file-size',
  fileType: 'https://lxd360.com/xapi/extensions/file-type',
} as const;

// ============================================================================
// CONTENT BLOCK TEMPLATES
// ============================================================================

/**
 * Comprehensive statement templates for all content block types
 */
export const CONTENT_BLOCK_TEMPLATES: Record<string, StatementTemplate> = {
  // ==========================================================================
  // TEXT BLOCKS
  // ==========================================================================

  text: {
    blockType: 'text',
    description: 'Text paragraph content',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.textParagraph },
      { trigger: 'read', verb: 'read', activityType: ACTIVITY_TYPES.textParagraph },
      {
        trigger: 'completed',
        verb: 'completed',
        activityType: ACTIVITY_TYPES.textParagraph,
        resultTemplate: { completion: true },
      },
    ],
  },

  heading: {
    blockType: 'heading',
    description: 'Heading content',
    events: [{ trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.heading }],
  },

  quote: {
    blockType: 'quote',
    description: 'Quote/blockquote content',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.quote },
      { trigger: 'read', verb: 'read', activityType: ACTIVITY_TYPES.quote },
    ],
  },

  code: {
    blockType: 'code',
    description: 'Code block content',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.codeBlock },
      { trigger: 'copied', verb: 'interacted', activityType: ACTIVITY_TYPES.codeBlock },
    ],
  },

  list: {
    blockType: 'list',
    description: 'List content (bullet, numbered, checklist)',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.list },
      { trigger: 'checked', verb: 'interacted', activityType: ACTIVITY_TYPES.list },
      {
        trigger: 'completed',
        verb: 'completed',
        activityType: ACTIVITY_TYPES.list,
        resultTemplate: { completion: true },
      },
    ],
  },

  callout: {
    blockType: 'callout',
    description: 'Callout/alert content',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.callout },
      { trigger: 'dismissed', verb: 'closed', activityType: ACTIVITY_TYPES.callout },
    ],
  },

  divider: {
    blockType: 'divider',
    description: 'Divider/separator content',
    events: [{ trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.textParagraph }],
  },

  // ==========================================================================
  // MEDIA BLOCKS
  // ==========================================================================

  image: {
    blockType: 'image',
    description: 'Image content',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.image },
      { trigger: 'zoomed', verb: 'zoomed', activityType: ACTIVITY_TYPES.image },
      { trigger: 'downloaded', verb: 'downloaded', activityType: ACTIVITY_TYPES.image },
    ],
  },

  imageGallery: {
    blockType: 'imageGallery',
    description: 'Image gallery with multiple images',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.gallery },
      { trigger: 'navigated', verb: 'navigated', activityType: ACTIVITY_TYPES.gallery },
      {
        trigger: 'completed',
        verb: 'completed',
        activityType: ACTIVITY_TYPES.gallery,
        resultTemplate: { completion: true },
      },
    ],
  },

  imageCompare: {
    blockType: 'imageCompare',
    description: 'Before/after image comparison',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.imageCompare },
      { trigger: 'interacted', verb: 'interacted', activityType: ACTIVITY_TYPES.imageCompare },
      {
        trigger: 'completed',
        verb: 'completed',
        activityType: ACTIVITY_TYPES.imageCompare,
        resultTemplate: { completion: true },
      },
    ],
  },

  video: {
    blockType: 'video',
    description: 'Video content',
    events: [
      { trigger: 'started', verb: 'launched', activityType: ACTIVITY_TYPES.video },
      { trigger: 'played', verb: 'played', activityType: ACTIVITY_TYPES.video },
      { trigger: 'paused', verb: 'paused', activityType: ACTIVITY_TYPES.video },
      { trigger: 'seeked', verb: 'seeked', activityType: ACTIVITY_TYPES.video },
      { trigger: 'progressed', verb: 'progressed', activityType: ACTIVITY_TYPES.video },
      {
        trigger: 'completed',
        verb: 'completed',
        activityType: ACTIVITY_TYPES.video,
        resultTemplate: { completion: true },
      },
      { trigger: 'terminated', verb: 'terminated', activityType: ACTIVITY_TYPES.video },
    ],
  },

  audio: {
    blockType: 'audio',
    description: 'Audio content',
    events: [
      { trigger: 'started', verb: 'launched', activityType: ACTIVITY_TYPES.audio },
      { trigger: 'played', verb: 'played', activityType: ACTIVITY_TYPES.audio },
      { trigger: 'paused', verb: 'paused', activityType: ACTIVITY_TYPES.audio },
      { trigger: 'seeked', verb: 'seeked', activityType: ACTIVITY_TYPES.audio },
      { trigger: 'progressed', verb: 'progressed', activityType: ACTIVITY_TYPES.audio },
      {
        trigger: 'completed',
        verb: 'completed',
        activityType: ACTIVITY_TYPES.audio,
        resultTemplate: { completion: true },
      },
    ],
  },

  embed: {
    blockType: 'embed',
    description: 'Embedded content (iframe, oembed)',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.embed },
      { trigger: 'interacted', verb: 'interacted', activityType: ACTIVITY_TYPES.embed },
    ],
  },

  iframe: {
    blockType: 'iframe',
    description: 'iFrame embedded content',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.embed },
      { trigger: 'interacted', verb: 'interacted', activityType: ACTIVITY_TYPES.embed },
    ],
  },

  file: {
    blockType: 'file',
    description: 'Downloadable file content',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.file },
      { trigger: 'downloaded', verb: 'downloaded', activityType: ACTIVITY_TYPES.file },
      { trigger: 'previewed', verb: 'experienced', activityType: ACTIVITY_TYPES.file },
    ],
  },

  // ==========================================================================
  // LAYOUT BLOCKS
  // ==========================================================================

  columns: {
    blockType: 'columns',
    description: 'Multi-column layout',
    events: [{ trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.columns }],
  },

  container: {
    blockType: 'container',
    description: 'Container/section layout',
    events: [{ trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.container }],
  },

  grid: {
    blockType: 'grid',
    description: 'Grid layout',
    events: [{ trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.grid }],
  },

  spacer: {
    blockType: 'spacer',
    description: 'Spacer/divider',
    events: [],
  },

  card: {
    blockType: 'card',
    description: 'Card component',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.card },
      { trigger: 'clicked', verb: 'clicked', activityType: ACTIVITY_TYPES.card },
    ],
  },

  // ==========================================================================
  // INTERACTIVE BLOCKS
  // ==========================================================================

  accordion: {
    blockType: 'accordion',
    description: 'Expandable accordion content',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.accordion },
      { trigger: 'expanded', verb: 'expanded', activityType: ACTIVITY_TYPES.accordion },
      { trigger: 'collapsed', verb: 'collapsed', activityType: ACTIVITY_TYPES.accordion },
      {
        trigger: 'allExpanded',
        verb: 'completed',
        activityType: ACTIVITY_TYPES.accordion,
        resultTemplate: { completion: true },
      },
    ],
  },

  tabs: {
    blockType: 'tabs',
    description: 'Tabbed content container',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.tabs },
      { trigger: 'tabSelected', verb: 'selected', activityType: ACTIVITY_TYPES.tabs },
      {
        trigger: 'allTabsViewed',
        verb: 'completed',
        activityType: ACTIVITY_TYPES.tabs,
        resultTemplate: { completion: true },
      },
    ],
  },

  carousel: {
    blockType: 'carousel',
    description: 'Carousel/slider content',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.carousel },
      { trigger: 'navigated', verb: 'navigated', activityType: ACTIVITY_TYPES.carousel },
      {
        trigger: 'allSlidesViewed',
        verb: 'completed',
        activityType: ACTIVITY_TYPES.carousel,
        resultTemplate: { completion: true },
      },
    ],
  },

  flipCard: {
    blockType: 'flipCard',
    description: 'Flip card interaction',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.flipcard },
      { trigger: 'flipped', verb: 'flipped', activityType: ACTIVITY_TYPES.flipcard },
      {
        trigger: 'allFlipped',
        verb: 'completed',
        activityType: ACTIVITY_TYPES.flipcard,
        resultTemplate: { completion: true },
      },
    ],
  },

  timeline: {
    blockType: 'timeline',
    description: 'Timeline interactive content',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.timeline },
      { trigger: 'eventViewed', verb: 'interacted', activityType: ACTIVITY_TYPES.timeline },
      {
        trigger: 'completed',
        verb: 'completed',
        activityType: ACTIVITY_TYPES.timeline,
        resultTemplate: { completion: true },
      },
    ],
  },

  process: {
    blockType: 'process',
    description: 'Process/steps diagram',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.process },
      { trigger: 'stepViewed', verb: 'interacted', activityType: ACTIVITY_TYPES.process },
      {
        trigger: 'completed',
        verb: 'completed',
        activityType: ACTIVITY_TYPES.process,
        resultTemplate: { completion: true },
      },
    ],
  },

  hotspot: {
    blockType: 'hotspot',
    description: 'Hotspot image interaction',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.hotspot },
      { trigger: 'clicked', verb: 'clicked', activityType: ACTIVITY_TYPES.hotspot },
      {
        trigger: 'allHotspotsViewed',
        verb: 'completed',
        activityType: ACTIVITY_TYPES.hotspot,
        resultTemplate: { completion: true },
      },
    ],
  },

  labeledImage: {
    blockType: 'labeledImage',
    description: 'Labeled image with annotations',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.labeledImage },
      { trigger: 'labelViewed', verb: 'interacted', activityType: ACTIVITY_TYPES.labeledImage },
      {
        trigger: 'completed',
        verb: 'completed',
        activityType: ACTIVITY_TYPES.labeledImage,
        resultTemplate: { completion: true },
      },
    ],
  },

  clickReveal: {
    blockType: 'clickReveal',
    description: 'Click-to-reveal content',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.clickReveal },
      { trigger: 'revealed', verb: 'revealed', activityType: ACTIVITY_TYPES.clickReveal },
      {
        trigger: 'allRevealed',
        verb: 'completed',
        activityType: ACTIVITY_TYPES.clickReveal,
        resultTemplate: { completion: true },
      },
    ],
  },

  sliderReveal: {
    blockType: 'sliderReveal',
    description: 'Slider-reveal content',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.sliderReveal },
      { trigger: 'sliderMoved', verb: 'interacted', activityType: ACTIVITY_TYPES.sliderReveal },
      {
        trigger: 'completed',
        verb: 'completed',
        activityType: ACTIVITY_TYPES.sliderReveal,
        resultTemplate: { completion: true },
      },
    ],
  },

  sorting: {
    blockType: 'sorting',
    description: 'Sorting/ordering activity',
    events: [
      { trigger: 'started', verb: 'launched', activityType: ACTIVITY_TYPES.sorting },
      { trigger: 'itemMoved', verb: 'dragged', activityType: ACTIVITY_TYPES.sorting },
      { trigger: 'submitted', verb: 'answered', activityType: ACTIVITY_TYPES.sorting },
      {
        trigger: 'passed',
        verb: 'passed',
        activityType: ACTIVITY_TYPES.sorting,
        resultTemplate: { success: true, completion: true },
      },
      {
        trigger: 'failed',
        verb: 'failed',
        activityType: ACTIVITY_TYPES.sorting,
        resultTemplate: { success: false, completion: true },
      },
    ],
  },

  matching: {
    blockType: 'matching',
    description: 'Matching pairs activity',
    events: [
      { trigger: 'started', verb: 'launched', activityType: ACTIVITY_TYPES.matching },
      { trigger: 'matched', verb: 'matched', activityType: ACTIVITY_TYPES.matching },
      { trigger: 'submitted', verb: 'answered', activityType: ACTIVITY_TYPES.matching },
      {
        trigger: 'passed',
        verb: 'passed',
        activityType: ACTIVITY_TYPES.matching,
        resultTemplate: { success: true, completion: true },
      },
      {
        trigger: 'failed',
        verb: 'failed',
        activityType: ACTIVITY_TYPES.matching,
        resultTemplate: { success: false, completion: true },
      },
    ],
  },

  categorize: {
    blockType: 'categorize',
    description: 'Categorization activity',
    events: [
      { trigger: 'started', verb: 'launched', activityType: ACTIVITY_TYPES.categorize },
      { trigger: 'categorized', verb: 'categorized', activityType: ACTIVITY_TYPES.categorize },
      { trigger: 'submitted', verb: 'answered', activityType: ACTIVITY_TYPES.categorize },
      {
        trigger: 'passed',
        verb: 'passed',
        activityType: ACTIVITY_TYPES.categorize,
        resultTemplate: { success: true, completion: true },
      },
      {
        trigger: 'failed',
        verb: 'failed',
        activityType: ACTIVITY_TYPES.categorize,
        resultTemplate: { success: false, completion: true },
      },
    ],
  },

  lightbox: {
    blockType: 'lightbox',
    description: 'Lightbox modal content',
    events: [
      { trigger: 'opened', verb: 'opened', activityType: ACTIVITY_TYPES.lightbox },
      { trigger: 'closed', verb: 'closed', activityType: ACTIVITY_TYPES.lightbox },
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.lightbox },
    ],
  },

  // ==========================================================================
  // ASSESSMENT BLOCKS
  // ==========================================================================

  quiz: {
    blockType: 'quiz',
    description: 'Quiz container with multiple questions',
    events: [
      { trigger: 'started', verb: 'launched', activityType: ACTIVITY_TYPES.quiz },
      { trigger: 'attempted', verb: 'attempted', activityType: ACTIVITY_TYPES.quiz },
      { trigger: 'submitted', verb: 'submitted', activityType: ACTIVITY_TYPES.quiz },
      {
        trigger: 'passed',
        verb: 'passed',
        activityType: ACTIVITY_TYPES.quiz,
        resultTemplate: { success: true, completion: true },
      },
      {
        trigger: 'failed',
        verb: 'failed',
        activityType: ACTIVITY_TYPES.quiz,
        resultTemplate: { success: false, completion: true },
      },
      {
        trigger: 'completed',
        verb: 'completed',
        activityType: ACTIVITY_TYPES.quiz,
        resultTemplate: { completion: true },
      },
    ],
  },

  multipleChoice: {
    blockType: 'multipleChoice',
    description: 'Multiple choice question',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.multipleChoice },
      { trigger: 'attempted', verb: 'attempted', activityType: ACTIVITY_TYPES.multipleChoice },
      { trigger: 'answered', verb: 'answered', activityType: ACTIVITY_TYPES.multipleChoice },
      {
        trigger: 'passed',
        verb: 'passed',
        activityType: ACTIVITY_TYPES.multipleChoice,
        resultTemplate: { success: true, completion: true },
      },
      {
        trigger: 'failed',
        verb: 'failed',
        activityType: ACTIVITY_TYPES.multipleChoice,
        resultTemplate: { success: false, completion: true },
      },
    ],
  },

  multipleSelect: {
    blockType: 'multipleSelect',
    description: 'Multiple select question',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.multipleSelect },
      { trigger: 'attempted', verb: 'attempted', activityType: ACTIVITY_TYPES.multipleSelect },
      { trigger: 'answered', verb: 'answered', activityType: ACTIVITY_TYPES.multipleSelect },
      {
        trigger: 'passed',
        verb: 'passed',
        activityType: ACTIVITY_TYPES.multipleSelect,
        resultTemplate: { success: true, completion: true },
      },
      {
        trigger: 'failed',
        verb: 'failed',
        activityType: ACTIVITY_TYPES.multipleSelect,
        resultTemplate: { success: false, completion: true },
      },
    ],
  },

  trueFalse: {
    blockType: 'trueFalse',
    description: 'True/false question',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.trueFalse },
      { trigger: 'attempted', verb: 'attempted', activityType: ACTIVITY_TYPES.trueFalse },
      { trigger: 'answered', verb: 'answered', activityType: ACTIVITY_TYPES.trueFalse },
      {
        trigger: 'passed',
        verb: 'passed',
        activityType: ACTIVITY_TYPES.trueFalse,
        resultTemplate: { success: true, completion: true },
      },
      {
        trigger: 'failed',
        verb: 'failed',
        activityType: ACTIVITY_TYPES.trueFalse,
        resultTemplate: { success: false, completion: true },
      },
    ],
  },

  fillBlank: {
    blockType: 'fillBlank',
    description: 'Fill-in-the-blank question',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.fillBlank },
      { trigger: 'attempted', verb: 'attempted', activityType: ACTIVITY_TYPES.fillBlank },
      { trigger: 'answered', verb: 'answered', activityType: ACTIVITY_TYPES.fillBlank },
      {
        trigger: 'passed',
        verb: 'passed',
        activityType: ACTIVITY_TYPES.fillBlank,
        resultTemplate: { success: true, completion: true },
      },
      {
        trigger: 'failed',
        verb: 'failed',
        activityType: ACTIVITY_TYPES.fillBlank,
        resultTemplate: { success: false, completion: true },
      },
    ],
  },

  matchingQuestion: {
    blockType: 'matchingQuestion',
    description: 'Matching question type',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.interaction },
      { trigger: 'attempted', verb: 'attempted', activityType: ACTIVITY_TYPES.interaction },
      { trigger: 'answered', verb: 'answered', activityType: ACTIVITY_TYPES.interaction },
      {
        trigger: 'passed',
        verb: 'passed',
        activityType: ACTIVITY_TYPES.interaction,
        resultTemplate: { success: true, completion: true },
      },
      {
        trigger: 'failed',
        verb: 'failed',
        activityType: ACTIVITY_TYPES.interaction,
        resultTemplate: { success: false, completion: true },
      },
    ],
  },

  ordering: {
    blockType: 'ordering',
    description: 'Ordering/sequencing question',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.ordering },
      { trigger: 'attempted', verb: 'attempted', activityType: ACTIVITY_TYPES.ordering },
      { trigger: 'answered', verb: 'answered', activityType: ACTIVITY_TYPES.ordering },
      {
        trigger: 'passed',
        verb: 'passed',
        activityType: ACTIVITY_TYPES.ordering,
        resultTemplate: { success: true, completion: true },
      },
      {
        trigger: 'failed',
        verb: 'failed',
        activityType: ACTIVITY_TYPES.ordering,
        resultTemplate: { success: false, completion: true },
      },
    ],
  },

  shortAnswer: {
    blockType: 'shortAnswer',
    description: 'Short answer question',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.shortAnswer },
      { trigger: 'attempted', verb: 'attempted', activityType: ACTIVITY_TYPES.shortAnswer },
      { trigger: 'answered', verb: 'answered', activityType: ACTIVITY_TYPES.shortAnswer },
      { trigger: 'submitted', verb: 'submitted', activityType: ACTIVITY_TYPES.shortAnswer },
    ],
  },

  essay: {
    blockType: 'essay',
    description: 'Essay/long form question',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.essay },
      { trigger: 'attempted', verb: 'attempted', activityType: ACTIVITY_TYPES.essay },
      { trigger: 'answered', verb: 'answered', activityType: ACTIVITY_TYPES.essay },
      { trigger: 'submitted', verb: 'submitted', activityType: ACTIVITY_TYPES.essay },
    ],
  },

  hotspotQuestion: {
    blockType: 'hotspotQuestion',
    description: 'Hotspot question',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.hotspotQuestion },
      { trigger: 'attempted', verb: 'attempted', activityType: ACTIVITY_TYPES.hotspotQuestion },
      { trigger: 'clicked', verb: 'clicked', activityType: ACTIVITY_TYPES.hotspotQuestion },
      { trigger: 'answered', verb: 'answered', activityType: ACTIVITY_TYPES.hotspotQuestion },
      {
        trigger: 'passed',
        verb: 'passed',
        activityType: ACTIVITY_TYPES.hotspotQuestion,
        resultTemplate: { success: true, completion: true },
      },
      {
        trigger: 'failed',
        verb: 'failed',
        activityType: ACTIVITY_TYPES.hotspotQuestion,
        resultTemplate: { success: false, completion: true },
      },
    ],
  },

  likert: {
    blockType: 'likert',
    description: 'Likert scale question',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.likert },
      { trigger: 'answered', verb: 'answered', activityType: ACTIVITY_TYPES.likert },
      { trigger: 'submitted', verb: 'submitted', activityType: ACTIVITY_TYPES.likert },
    ],
  },

  ranking: {
    blockType: 'ranking',
    description: 'Ranking question',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.ranking },
      { trigger: 'sorted', verb: 'sorted', activityType: ACTIVITY_TYPES.ranking },
      { trigger: 'answered', verb: 'answered', activityType: ACTIVITY_TYPES.ranking },
      { trigger: 'submitted', verb: 'submitted', activityType: ACTIVITY_TYPES.ranking },
    ],
  },

  fileUpload: {
    blockType: 'fileUpload',
    description: 'File upload question',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.fileUpload },
      { trigger: 'uploaded', verb: 'uploaded', activityType: ACTIVITY_TYPES.fileUpload },
      { trigger: 'submitted', verb: 'submitted', activityType: ACTIVITY_TYPES.fileUpload },
    ],
  },

  knowledgeCheck: {
    blockType: 'knowledgeCheck',
    description: 'Knowledge check (informal assessment)',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.knowledgeCheck },
      { trigger: 'attempted', verb: 'attempted', activityType: ACTIVITY_TYPES.knowledgeCheck },
      { trigger: 'answered', verb: 'answered', activityType: ACTIVITY_TYPES.knowledgeCheck },
      {
        trigger: 'passed',
        verb: 'passed',
        activityType: ACTIVITY_TYPES.knowledgeCheck,
        resultTemplate: { success: true },
      },
      {
        trigger: 'failed',
        verb: 'failed',
        activityType: ACTIVITY_TYPES.knowledgeCheck,
        resultTemplate: { success: false },
      },
    ],
  },

  survey: {
    blockType: 'survey',
    description: 'Survey activity',
    events: [
      { trigger: 'started', verb: 'launched', activityType: ACTIVITY_TYPES.survey },
      { trigger: 'answered', verb: 'answered', activityType: ACTIVITY_TYPES.survey },
      { trigger: 'submitted', verb: 'submitted', activityType: ACTIVITY_TYPES.survey },
      {
        trigger: 'completed',
        verb: 'completed',
        activityType: ACTIVITY_TYPES.survey,
        resultTemplate: { completion: true },
      },
    ],
  },

  // ==========================================================================
  // SCENARIO BLOCKS
  // ==========================================================================

  scenario: {
    blockType: 'scenario',
    description: 'Branching scenario',
    events: [
      { trigger: 'started', verb: 'launched', activityType: ACTIVITY_TYPES.scenario },
      { trigger: 'decided', verb: 'decided', activityType: ACTIVITY_TYPES.scenario },
      { trigger: 'progressed', verb: 'progressed', activityType: ACTIVITY_TYPES.scenario },
      {
        trigger: 'completed',
        verb: 'completed',
        activityType: ACTIVITY_TYPES.scenario,
        resultTemplate: { completion: true },
      },
      {
        trigger: 'passed',
        verb: 'passed',
        activityType: ACTIVITY_TYPES.scenario,
        resultTemplate: { success: true, completion: true },
      },
      {
        trigger: 'failed',
        verb: 'failed',
        activityType: ACTIVITY_TYPES.scenario,
        resultTemplate: { success: false, completion: true },
      },
    ],
  },

  dialogue: {
    blockType: 'dialogue',
    description: 'Dialogue content',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.dialogue },
      { trigger: 'progressed', verb: 'progressed', activityType: ACTIVITY_TYPES.dialogue },
      {
        trigger: 'completed',
        verb: 'completed',
        activityType: ACTIVITY_TYPES.dialogue,
        resultTemplate: { completion: true },
      },
    ],
  },

  conversation: {
    blockType: 'conversation',
    description: 'Conversation/chat content',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.conversation },
      { trigger: 'progressed', verb: 'progressed', activityType: ACTIVITY_TYPES.conversation },
      {
        trigger: 'completed',
        verb: 'completed',
        activityType: ACTIVITY_TYPES.conversation,
        resultTemplate: { completion: true },
      },
    ],
  },

  character: {
    blockType: 'character',
    description: 'Character display',
    events: [{ trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.character }],
  },

  // ==========================================================================
  // DATA BLOCKS
  // ==========================================================================

  table: {
    blockType: 'table',
    description: 'Table content',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.table },
      { trigger: 'sorted', verb: 'sorted', activityType: ACTIVITY_TYPES.table },
      { trigger: 'filtered', verb: 'interacted', activityType: ACTIVITY_TYPES.table },
    ],
  },

  chart: {
    blockType: 'chart',
    description: 'Chart/graph visualization',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.chart },
      { trigger: 'hovered', verb: 'hovered', activityType: ACTIVITY_TYPES.chart },
      { trigger: 'interacted', verb: 'interacted', activityType: ACTIVITY_TYPES.chart },
    ],
  },

  stat: {
    blockType: 'stat',
    description: 'Statistics display',
    events: [{ trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.stat }],
  },

  comparison: {
    blockType: 'comparison',
    description: 'Comparison table/chart',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.comparison },
      { trigger: 'interacted', verb: 'interacted', activityType: ACTIVITY_TYPES.comparison },
    ],
  },

  dataCard: {
    blockType: 'dataCard',
    description: 'Data card display',
    events: [{ trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.dataCard }],
  },

  // ==========================================================================
  // SPECIAL BLOCKS
  // ==========================================================================

  testimonial: {
    blockType: 'testimonial',
    description: 'Testimonial content',
    events: [{ trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.testimonial }],
  },

  teamMember: {
    blockType: 'teamMember',
    description: 'Team member profile',
    events: [{ trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.teamMember }],
  },

  feature: {
    blockType: 'feature',
    description: 'Feature list',
    events: [{ trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.feature }],
  },

  pricing: {
    blockType: 'pricing',
    description: 'Pricing table',
    events: [{ trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.comparison }],
  },

  cta: {
    blockType: 'cta',
    description: 'Call-to-action',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.cta },
      { trigger: 'clicked', verb: 'clicked', activityType: ACTIVITY_TYPES.cta },
    ],
  },

  newsletter: {
    blockType: 'newsletter',
    description: 'Newsletter signup',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.interaction },
      { trigger: 'submitted', verb: 'submitted', activityType: ACTIVITY_TYPES.interaction },
    ],
  },

  social: {
    blockType: 'social',
    description: 'Social media links',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.link },
      { trigger: 'clicked', verb: 'clicked', activityType: ACTIVITY_TYPES.link },
    ],
  },

  map: {
    blockType: 'map',
    description: 'Map embed',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.embed },
      { trigger: 'interacted', verb: 'interacted', activityType: ACTIVITY_TYPES.embed },
    ],
  },

  calendar: {
    blockType: 'calendar',
    description: 'Calendar display',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.embed },
      { trigger: 'interacted', verb: 'interacted', activityType: ACTIVITY_TYPES.embed },
    ],
  },

  countdown: {
    blockType: 'countdown',
    description: 'Countdown timer',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.countdown },
      { trigger: 'completed', verb: 'completed', activityType: ACTIVITY_TYPES.countdown },
    ],
  },

  progress: {
    blockType: 'progress',
    description: 'Progress indicator',
    events: [{ trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.progress }],
  },

  codePlayground: {
    blockType: 'codePlayground',
    description: 'Interactive code editor',
    events: [
      { trigger: 'viewed', verb: 'viewed', activityType: ACTIVITY_TYPES.codePlayground },
      { trigger: 'edited', verb: 'edited', activityType: ACTIVITY_TYPES.codePlayground },
      { trigger: 'executed', verb: 'interacted', activityType: ACTIVITY_TYPES.codePlayground },
      {
        trigger: 'passed',
        verb: 'passed',
        activityType: ACTIVITY_TYPES.codePlayground,
        resultTemplate: { success: true, completion: true },
      },
      {
        trigger: 'failed',
        verb: 'failed',
        activityType: ACTIVITY_TYPES.codePlayground,
        resultTemplate: { success: false },
      },
    ],
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the statement template for a block type
 *
 * @param blockType - The content block type
 * @returns Statement template or undefined
 */
export function getBlockTemplate(blockType: string): StatementTemplate | undefined {
  return CONTENT_BLOCK_TEMPLATES[blockType];
}

/**
 * Get the event template for a block type and trigger
 *
 * @param blockType - The content block type
 * @param trigger - The event trigger name
 * @returns Event template or undefined
 */
export function getEventTemplate(blockType: string, trigger: string): EventTemplate | undefined {
  const template = CONTENT_BLOCK_TEMPLATES[blockType];
  return template?.events.find((e) => e.trigger === trigger);
}

/**
 * Get all valid triggers for a block type
 *
 * @param blockType - The content block type
 * @returns Array of valid trigger names
 */
export function getValidTriggers(blockType: string): string[] {
  const template = CONTENT_BLOCK_TEMPLATES[blockType];
  return template?.events.map((e) => e.trigger) ?? [];
}

/**
 * Check if a trigger is valid for a block type
 *
 * @param blockType - The content block type
 * @param trigger - The event trigger to check
 * @returns true if the trigger is valid
 */
export function isValidTrigger(blockType: string, trigger: string): boolean {
  return getValidTriggers(blockType).includes(trigger);
}

/**
 * Get all supported block types
 *
 * @returns Array of supported block type names
 */
export function getSupportedBlockTypes(): string[] {
  return Object.keys(CONTENT_BLOCK_TEMPLATES);
}

/**
 * Check if a block type is supported
 *
 * @param blockType - The block type to check
 * @returns true if the block type has templates
 */
export function isBlockTypeSupported(blockType: string): boolean {
  return blockType in CONTENT_BLOCK_TEMPLATES;
}
