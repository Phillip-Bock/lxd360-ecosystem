import type { ICESLevel, ILAStage } from '@/lib/inspire/types/inspire-types';

// =============================================================================
// SECTION 1: CORE BLOCK TYPES
// =============================================================================

/**
 * Main Block interface - the foundation of all content blocks
 */
export interface Block {
  /** Unique identifier */
  id: string;
  /** Block type - determines rendering and behavior */
  type: BlockType;
  /** Block content - varies by type */
  content: BlockContent;
  /** Block settings - common and type-specific */
  settings: BlockSettings;
  /** Visual styling */
  style: BlockStyle;
  /** Animation configuration */
  animation?: BlockAnimation;
  /** Conditional visibility/behavior */
  conditions?: BlockCondition[];
  /** Order in parent container */
  order: number;
  /** Parent block ID for nesting */
  parentId?: string;
  /** Metadata */
  metadata?: BlockMetadata;
}

/**
 * All available block types organized by category
 */
export type BlockType =
  // Text blocks
  | 'text'
  | 'heading'
  | 'quote'
  | 'code'
  | 'list'
  | 'callout'
  | 'divider'
  // Media blocks
  | 'image'
  | 'imageGallery'
  | 'imageCompare'
  | 'video'
  | 'audio'
  | 'embed'
  | 'iframe'
  | 'file'
  // Layout blocks
  | 'columns'
  | 'container'
  | 'grid'
  | 'spacer'
  | 'card'
  // Interactive blocks
  | 'accordion'
  | 'tabs'
  | 'carousel'
  | 'flipCard'
  | 'timeline'
  | 'process'
  | 'hotspot'
  | 'labeledImage'
  | 'clickReveal'
  | 'sliderReveal'
  | 'sorting'
  | 'matching'
  | 'categorize'
  | 'lightbox'
  // Assessment blocks
  | 'quiz'
  | 'multipleChoice'
  | 'multipleSelect'
  | 'trueFalse'
  | 'fillBlank'
  | 'matchingQuestion'
  | 'ordering'
  | 'shortAnswer'
  | 'essay'
  | 'hotspotQuestion'
  | 'likert'
  | 'ranking'
  | 'fileUpload'
  | 'knowledgeCheck'
  | 'survey'
  // Scenario blocks
  | 'scenario'
  | 'dialogue'
  | 'conversation'
  | 'character'
  // Data blocks
  | 'table'
  | 'chart'
  | 'stat'
  | 'comparison'
  | 'dataCard'
  // Special blocks
  | 'testimonial'
  | 'teamMember'
  | 'feature'
  | 'pricing'
  | 'cta'
  | 'newsletter'
  | 'social'
  | 'map'
  | 'calendar'
  | 'countdown'
  | 'progress'
  | 'codePlayground';

/**
 * Block category for organization in palette
 */
export type BlockCategory =
  | 'text'
  | 'media'
  | 'layout'
  | 'interactive'
  | 'assessment'
  | 'scenario'
  | 'data'
  | 'special';

/**
 * Block content - varies by type
 */
export interface BlockContent {
  [key: string]: unknown;
}

/**
 * Block metadata
 */
export interface BlockMetadata {
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  version?: number;
  lockedBy?: string;
  tags?: string[];
}

// =============================================================================
// SECTION 2: BLOCK SETTINGS
// =============================================================================

/**
 * Common block settings
 */
export interface BlockSettings {
  /** INSPIRE stage alignment */
  inspireStage?: ILAStage;
  /** Cognitive engagement level */
  icesLevel?: ICESLevel;
  /** Cognitive load contribution */
  cognitiveLoad?: {
    intrinsic: number;
    extraneous: number;
    germane: number;
  };
  /** Accessibility settings */
  accessibility?: BlockAccessibility;
  /** Completion criteria */
  completion?: CompletionCriteria;
  /** xAPI tracking configuration */
  xapi?: XAPISettings;
  /** Block-specific settings */
  [key: string]: unknown;
}

/**
 * Block-level accessibility settings
 */
export interface BlockAccessibility {
  /** ARIA label */
  ariaLabel?: string;
  /** ARIA described by */
  ariaDescribedBy?: string;
  /** Role override */
  role?: string;
  /** Tab index */
  tabIndex?: number;
  /** Alt text (for media) */
  altText?: string;
  /** Long description (for complex images) */
  longDescription?: string;
  /** Screen reader only text */
  srOnlyText?: string;
  /** Skip link target */
  skipLinkTarget?: boolean;
}

/**
 * Completion criteria for tracking progress
 */
export interface CompletionCriteria {
  /** Type of completion tracking */
  type: 'view' | 'interact' | 'complete' | 'score' | 'time' | 'custom';
  /** Required value (depends on type) */
  requiredValue?: number;
  /** Custom completion logic ID */
  customLogicId?: string;
  /** Allow marking complete manually */
  allowManualComplete?: boolean;
}

/**
 * xAPI tracking settings
 */
export interface XAPISettings {
  /** Enable xAPI tracking */
  enabled: boolean;
  /** Verb to use */
  verb?: 'viewed' | 'interacted' | 'completed' | 'answered' | 'experienced' | 'custom';
  /** Custom verb IRI */
  customVerbIri?: string;
  /** Additional context */
  context?: Record<string, unknown>;
  /** Generate statement on... */
  generateOn?: 'view' | 'interact' | 'complete' | 'exit';
}

// =============================================================================
// SECTION 3: BLOCK STYLING
// =============================================================================

/**
 * Block style configuration
 */
export interface BlockStyle {
  // Layout
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
  minHeight?: string | number;
  maxWidth?: string | number;
  maxHeight?: string | number;

  // Spacing
  padding?: SpacingValue;
  margin?: SpacingValue;

  // Background
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundGradient?: GradientValue;
  backgroundSize?: 'cover' | 'contain' | 'auto';
  backgroundPosition?: string;
  backgroundRepeat?: 'repeat' | 'no-repeat' | 'repeat-x' | 'repeat-y';
  backgroundBlur?: number;

  // Border
  borderRadius?: string | number;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';

  // Shadow
  boxShadow?: string;
  shadowPreset?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

  // Position
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  zIndex?: number;
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;

  // Display
  display?: 'block' | 'flex' | 'grid' | 'inline' | 'inline-block' | 'none';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  alignItems?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: string | number;

  // Overflow
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowX?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowY?: 'visible' | 'hidden' | 'scroll' | 'auto';

  // Transform
  transform?: string;
  transformOrigin?: string;

  // Opacity
  opacity?: number;

  // Cursor
  cursor?: 'default' | 'pointer' | 'move' | 'text' | 'not-allowed' | 'grab' | 'grabbing';

  // Custom CSS
  customCss?: string;
  customClasses?: string[];
}

/**
 * Spacing value - can be single value or object for each side
 */
export type SpacingValue =
  | string
  | number
  | {
      top?: string | number;
      right?: string | number;
      bottom?: string | number;
      left?: string | number;
    };

/**
 * Gradient value
 */
export interface GradientValue {
  type: 'linear' | 'radial' | 'conic';
  angle?: number;
  stops: Array<{
    color: string;
    position: number;
  }>;
}

// =============================================================================
// SECTION 4: BLOCK ANIMATION
// =============================================================================

/**
 * Block animation configuration
 */
export interface BlockAnimation {
  /** Entrance animation */
  entrance?: AnimationEffect;
  /** Exit animation */
  exit?: AnimationEffect;
  /** Hover animation */
  hover?: AnimationEffect;
  /** Continuous animation */
  continuous?: AnimationEffect;
  /** Animation trigger */
  trigger?: 'onLoad' | 'onScroll' | 'onClick' | 'onHover' | 'onVisible';
  /** Delay before animation starts (ms) */
  delay?: number;
  /** Animation duration (ms) */
  duration?: number;
  /** Easing function */
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring';
  /** Repeat count (0 = infinite) */
  repeat?: number;
}

/**
 * Animation effect
 */
export interface AnimationEffect {
  /** Animation type */
  type:
    | 'fade'
    | 'slide'
    | 'scale'
    | 'rotate'
    | 'blur'
    | 'bounce'
    | 'shake'
    | 'pulse'
    | 'flip'
    | 'custom';
  /** Direction (for slide) */
  direction?: 'up' | 'down' | 'left' | 'right';
  /** Scale value (for scale) */
  scale?: number;
  /** Rotation degrees (for rotate) */
  degrees?: number;
  /** Blur amount (for blur) */
  blurAmount?: number;
  /** Custom keyframes */
  keyframes?: Record<string, unknown>[];
}

// =============================================================================
// SECTION 5: BLOCK CONDITIONS
// =============================================================================

/**
 * Block condition for conditional visibility/behavior
 */
export interface BlockCondition {
  /** Unique identifier */
  id: string;
  /** Variable to check */
  variable: string;
  /** Comparison operator */
  operator: ConditionOperator;
  /** Value to compare against */
  value: unknown;
  /** Action to take when condition is met */
  action: ConditionAction;
  /** Logical operator to combine with other conditions */
  combineWith?: 'and' | 'or';
}

/**
 * Condition operators
 */
export type ConditionOperator =
  | 'equals'
  | 'notEquals'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterOrEqual'
  | 'lessOrEqual'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'isTrue'
  | 'isFalse'
  | 'matches'; // Regex match

/**
 * Condition action
 */
export type ConditionAction = 'show' | 'hide' | 'enable' | 'disable' | 'addClass' | 'removeClass';

// =============================================================================
// SECTION 6: TEXT BLOCK CONTENT TYPES
// =============================================================================

export interface TextBlockContent extends BlockContent {
  /** Rich text HTML content */
  html: string;
  /** Plain text version */
  plainText?: string;
  /** Text format */
  format?: 'html' | 'markdown' | 'plain';
}

export interface HeadingBlockContent extends BlockContent {
  /** Heading text */
  text: string;
  /** Heading level */
  level: 1 | 2 | 3 | 4 | 5 | 6;
  /** Anchor ID for navigation */
  anchor?: string;
  /** Subtitle */
  subtitle?: string;
}

export interface QuoteBlockContent extends BlockContent {
  /** Quote text */
  text: string;
  /** Attribution */
  author?: string;
  /** Author title/role */
  authorTitle?: string;
  /** Author avatar */
  authorAvatar?: string;
  /** Source citation */
  citation?: string;
  /** Quote style variant */
  variant?: 'default' | 'large' | 'bordered' | 'filled';
}

export interface CodeBlockContent extends BlockContent {
  /** Code string */
  code: string;
  /** Programming language */
  language: string;
  /** Show line numbers */
  showLineNumbers?: boolean;
  /** Highlight specific lines */
  highlightLines?: number[];
  /** Show copy button */
  showCopyButton?: boolean;
  /** Filename to display */
  filename?: string;
  /** Theme */
  theme?: 'dark' | 'light';
}

export interface ListBlockContent extends BlockContent {
  /** List items */
  items: ListItem[];
  /** List type */
  type: 'bullet' | 'numbered' | 'checklist';
  /** Start number for numbered lists */
  startNumber?: number;
}

export interface ListItem {
  id?: string;
  text: string;
  checked?: boolean;
  children?: ListItem[];
}

export interface CalloutBlockContent extends BlockContent {
  /** Callout type */
  type: 'info' | 'success' | 'warning' | 'danger' | 'tip' | 'note' | 'quote';
  /** Title */
  title?: string;
  /** Content (HTML) */
  content: string;
  /** Custom icon */
  icon?: string;
  /** Dismissible */
  dismissible?: boolean;
}

export interface DividerBlockContent extends BlockContent {
  /** Divider style */
  style?: 'solid' | 'dashed' | 'dotted' | 'gradient';
  /** Show icon/text in center */
  centerContent?: string;
  /** Thickness */
  thickness?: number;
  /** Color */
  color?: string;
}

// =============================================================================
// SECTION 7: MEDIA BLOCK CONTENT TYPES
// =============================================================================

export interface ImageBlockContent extends BlockContent {
  /** Image source URL */
  src: string;
  /** Alt text */
  alt: string;
  /** Caption */
  caption?: string;
  /** Credit/attribution */
  credit?: string;
  /** Natural width */
  naturalWidth?: number;
  /** Natural height */
  naturalHeight?: number;
  /** Object fit */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  /** Object position */
  objectPosition?: string;
  /** Enable zoom on click */
  zoomOnClick?: boolean;
  /** Loading strategy */
  loading?: 'eager' | 'lazy';
  /** Blur placeholder data URL */
  blurDataUrl?: string;
}

export interface ImageGalleryBlockContent extends BlockContent {
  /** Gallery images */
  images: ImageBlockContent[];
  /** Layout type */
  layout: 'grid' | 'masonry' | 'carousel' | 'slider';
  /** Columns (for grid/masonry) */
  columns?: number;
  /** Show thumbnails */
  showThumbnails?: boolean;
  /** Auto-play (for carousel/slider) */
  autoPlay?: boolean;
  /** Auto-play interval (ms) */
  autoPlayInterval?: number;
}

export interface ImageCompareBlockContent extends BlockContent {
  /** Before image */
  beforeImage: ImageBlockContent;
  /** After image */
  afterImage: ImageBlockContent;
  /** Before label */
  beforeLabel?: string;
  /** After label */
  afterLabel?: string;
  /** Initial position (0-100) */
  initialPosition?: number;
  /** Slider orientation */
  orientation?: 'horizontal' | 'vertical';
}

export interface VideoBlockContent extends BlockContent {
  /** Video source URL or embed code */
  src: string;
  /** Video type */
  type: 'file' | 'youtube' | 'vimeo' | 'embed';
  /** Poster image */
  poster?: string;
  /** Title */
  title?: string;
  /** Description */
  description?: string;
  /** Captions/subtitles URL */
  captionsUrl?: string;
  /** Transcript */
  transcript?: string;
  /** Auto-play */
  autoPlay?: boolean;
  /** Loop */
  loop?: boolean;
  /** Muted */
  muted?: boolean;
  /** Show controls */
  controls?: boolean;
  /** Start time (seconds) */
  startTime?: number;
  /** End time (seconds) */
  endTime?: number;
  /** Chapter markers */
  chapters?: VideoChapter[];
  /** Interactive hotspots */
  hotspots?: VideoHotspot[];
}

export interface VideoChapter {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
}

export interface VideoHotspot {
  id: string;
  time: number;
  duration: number;
  position: { x: number; y: number };
  content: string;
  action?: 'pause' | 'link' | 'popup';
  actionUrl?: string;
}

export interface AudioBlockContent extends BlockContent {
  /** Audio source URL */
  src: string;
  /** Title */
  title?: string;
  /** Artist/Author */
  artist?: string;
  /** Album/Collection */
  album?: string;
  /** Cover image */
  coverImage?: string;
  /** Waveform data */
  waveformData?: number[];
  /** Transcript */
  transcript?: string;
  /** Auto-play */
  autoPlay?: boolean;
  /** Loop */
  loop?: boolean;
  /** Show waveform */
  showWaveform?: boolean;
  /** Playback speed options */
  playbackSpeeds?: number[];
}

export interface EmbedBlockContent extends BlockContent {
  /** Embed URL or code */
  embedCode: string;
  /** Source type */
  type: 'iframe' | 'oembed' | 'custom';
  /** Provider (youtube, vimeo, twitter, etc.) */
  provider?: string;
  /** Aspect ratio */
  aspectRatio?: '16:9' | '4:3' | '1:1' | '9:16' | 'auto';
  /** Allow fullscreen */
  allowFullscreen?: boolean;
  /** Fallback content */
  fallback?: string;
}

export interface FileBlockContent extends BlockContent {
  /** File URL */
  url: string;
  /** Original filename */
  filename: string;
  /** File size in bytes */
  fileSize: number;
  /** MIME type */
  mimeType: string;
  /** File icon */
  icon?: string;
  /** Download button text */
  downloadText?: string;
  /** Preview available */
  previewAvailable?: boolean;
}

// =============================================================================
// SECTION 8: INTERACTIVE BLOCK CONTENT TYPES
// =============================================================================

export interface AccordionBlockContent extends BlockContent {
  /** Accordion items */
  items: AccordionItem[];
  /** Allow multiple open */
  allowMultiple?: boolean;
  /** Default open items */
  defaultOpen?: string[];
  /** Default expanded items */
  defaultExpanded?: string[];
  /** Icon position */
  iconPosition?: 'left' | 'right';
  /** Visual variant */
  variant?: 'default' | 'bordered' | 'filled' | 'minimal' | 'separated';
  /** Animation */
  animated?: boolean;
}

export interface AccordionItem {
  id: string;
  title: string;
  content: string;
  icon?: string;
  disabled?: boolean;
}

// Alias for backward compatibility
export type AccordionPanel = AccordionItem;

export interface TabsBlockContent extends BlockContent {
  /** Tab items */
  tabs: TabItem[];
  /** Default active tab */
  defaultTab?: string;
  /** Tab orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Tab alignment */
  alignment?: 'start' | 'center' | 'end' | 'stretch';
  /** Tab variant */
  variant?: 'default' | 'pills' | 'underline' | 'enclosed';
}

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  content: string;
  disabled?: boolean;
  badge?: string;
}

// Alias for backward compatibility
export type TabPanel = TabItem;

export interface CarouselBlockContent extends BlockContent {
  /** Carousel slides */
  slides: CarouselSlide[];
  /** Auto-play */
  autoPlay?: boolean;
  /** Auto-play interval (ms) */
  autoPlayInterval?: number;
  /** Show dots */
  showDots?: boolean;
  /** Show arrows */
  showArrows?: boolean;
  /** Loop */
  loop?: boolean;
  /** Slides per view */
  slidesPerView?: number;
  /** Space between slides */
  spaceBetween?: number;
}

export interface CarouselSlide {
  id: string;
  type: 'image' | 'content' | 'video';
  content: ImageBlockContent | string | VideoBlockContent;
  title?: string;
  description?: string;
}

export interface FlipCardBlockContent extends BlockContent {
  /** Flip direction */
  direction?: 'horizontal' | 'vertical';
  /** Flip trigger */
  trigger?: 'click' | 'hover';
  /** Front content */
  frontContent?: string;
  /** Back content */
  backContent?: string;
  /** Front image */
  frontImage?: string;
  /** Back image */
  backImage?: string;
  /** Front color */
  frontColor?: string;
  /** Back color */
  backColor?: string;
  /** Card height */
  height?: number;
  /** Legacy: Flip cards array (for multi-card layouts) */
  cards?: FlipCard[];
  /** Legacy: Layout */
  layout?: 'grid' | 'row' | 'masonry';
  /** Legacy: Columns */
  columns?: number;
}

export interface FlipCard {
  id: string;
  front: {
    content: string;
    backgroundColor?: string;
    backgroundImage?: string;
  };
  back: {
    content: string;
    backgroundColor?: string;
    backgroundImage?: string;
  };
}

export interface TimelineBlockContent extends BlockContent {
  /** Timeline events */
  events: TimelineEvent[];
  /** Timeline layout */
  layout?: 'vertical' | 'vertical-alternating' | 'horizontal';
  /** Orientation (legacy) */
  orientation?: 'vertical' | 'horizontal';
  /** Alternate sides (legacy) */
  alternate?: boolean;
  /** Show connector line */
  showLine?: boolean;
  /** Line color */
  lineColor?: string;
  /** Animated */
  animated?: boolean;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  content: string;
  description?: string;
  icon?: string;
  color?: string;
  image?: string;
  media?: ImageBlockContent | VideoBlockContent;
}

export interface ProcessBlockContent extends BlockContent {
  /** Process steps */
  steps: ProcessStep[];
  /** Orientation */
  orientation?: 'vertical' | 'horizontal';
  /** Show numbers */
  showNumbers?: boolean;
  /** Connector style */
  connectorStyle?: 'arrow' | 'line' | 'dots' | 'none';
  /** Current step (for progress) */
  currentStep?: number;
}

export interface ProcessStep {
  id: string;
  title: string;
  content: string;
  icon?: string;
  color?: string;
  status?: 'pending' | 'active' | 'completed';
}

export interface HotspotBlockContent extends BlockContent {
  /** Base image */
  imageUrl: string;
  /** Image alt text */
  altText?: string;
  /** Hotspots */
  hotspots: Hotspot[];
  /** Hotspot style */
  hotspotStyle?: 'pulse' | 'static' | 'numbered';
}

export interface Hotspot {
  id: string;
  x: number; // Percentage
  y: number; // Percentage
  title?: string;
  label: string;
  content: string;
  icon?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'square' | 'pin';
}

export interface LabeledImageBlockContent extends BlockContent {
  /** Base image */
  imageUrl: string;
  /** Image alt text */
  altText?: string;
  /** Labels */
  labels: ImageLabel[];
  /** Show lines from labels to points */
  showLines?: boolean;
  /** Label position */
  labelPosition?: 'inline' | 'side' | 'tooltip';
}

export interface ImageLabel {
  id: string;
  x: number; // Percentage
  y: number; // Percentage
  text: string;
  description?: string;
  side?: 'left' | 'right' | 'top' | 'bottom' | 'auto';
}

export interface ClickRevealBlockContent extends BlockContent {
  /** Items to reveal */
  items: ClickRevealItem[];
  /** Layout */
  layout?: 'grid' | 'list' | 'masonry';
  /** Columns (for grid) */
  columns?: number;
  /** Reveal animation */
  animation?: 'fade' | 'slide' | 'flip' | 'zoom';
  /** Allow multiple reveals */
  allowMultiple?: boolean;
}

export interface ClickRevealItem {
  id: string;
  triggerContent: string;
  revealContent: string;
  triggerIcon?: string;
  revealed?: boolean;
}

export interface SliderRevealBlockContent extends BlockContent {
  /** Content at slider start (0%) */
  startContent: string;
  /** Content at slider end (100%) */
  endContent: string;
  /** Initial slider position (0-100) */
  initialPosition?: number;
  /** Show position label */
  showLabel?: boolean;
  /** Start label */
  startLabel?: string;
  /** End label */
  endLabel?: string;
}

export interface SortingBlockContent extends BlockContent {
  /** Items to sort */
  items: SortingItem[];
  /** Correct order (item IDs) */
  correctOrder: string[];
  /** Feedback */
  feedback?: {
    correct: string;
    incorrect: string;
    partial?: string;
  };
  /** Allow retry */
  allowRetry?: boolean;
  /** Show correct answer on failure */
  showCorrectAnswer?: boolean;
}

export interface SortingItem {
  id: string;
  content: string;
  media?: ImageBlockContent;
}

export interface MatchingBlockContent extends BlockContent {
  /** Pairs to match */
  pairs: MatchingPair[];
  /** Feedback */
  feedback?: {
    correct: string;
    incorrect: string;
    partial?: string;
  };
  /** Allow retry */
  allowRetry?: boolean;
  /** Shuffle items */
  shuffle?: boolean;
}

export interface MatchingPair {
  id: string;
  left: {
    content: string;
    media?: ImageBlockContent;
  };
  right: {
    content: string;
    media?: ImageBlockContent;
  };
}

export interface CategorizeBlockContent extends BlockContent {
  /** Categories */
  categories: Category[];
  /** Items to categorize */
  items: CategorizeItem[];
  /** Feedback */
  feedback?: {
    correct: string;
    incorrect: string;
    partial?: string;
  };
  /** Allow retry */
  allowRetry?: boolean;
  /** Shuffle items */
  shuffle?: boolean;
}

export interface Category {
  id: string;
  title: string;
  description?: string;
  color?: string;
}

export interface CategorizeItem {
  id: string;
  content: string;
  correctCategoryId: string;
  media?: ImageBlockContent;
}

export interface LightboxBlockContent extends BlockContent {
  /** Content to display in lightbox */
  content: string;
  /** Trigger content */
  triggerContent: string;
  /** Trigger type */
  triggerType?: 'text' | 'button' | 'image' | 'icon';
  /** Lightbox size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Show close button */
  showCloseButton?: boolean;
  /** Close on backdrop click */
  closeOnBackdrop?: boolean;
}

// =============================================================================
// SECTION 9: ASSESSMENT BLOCK CONTENT TYPES
// =============================================================================

export interface QuizBlockContent extends BlockContent {
  /** Quiz title */
  title?: string;
  /** Quiz description */
  description?: string;
  /** Questions */
  questions: QuestionContent[];
  /** Quiz settings */
  settings?: QuizSettings;
  /** Passing score percentage */
  passingScore?: number;
  /** Show feedback immediately */
  showFeedback?: boolean;
  /** Allow retry */
  allowRetry?: boolean;
  /** Shuffle questions */
  shuffleQuestions?: boolean;
  /** Shuffle options */
  shuffleOptions?: boolean;
  /** Show correct answers */
  showCorrectAnswers?: boolean;
}

export interface QuizSettings {
  /** Passing score percentage */
  passingScore: number;
  /** Show feedback immediately */
  showFeedback: 'immediate' | 'end' | 'never';
  /** Allow retry */
  allowRetry: boolean;
  /** Max retries (0 = unlimited) */
  maxRetries?: number;
  /** Shuffle questions */
  shuffleQuestions: boolean;
  /** Shuffle options */
  shuffleOptions: boolean;
  /** Time limit (seconds, 0 = none) */
  timeLimit?: number;
  /** Show score at end */
  showScore: boolean;
  /** Show correct answers */
  showCorrectAnswers: boolean;
  /** Question pool size (if shuffling) */
  poolSize?: number;
  /** Bank ID to pull questions from */
  questionBankId?: string;
}

export interface QuestionContent {
  id: string;
  type: QuestionType;
  question: string;
  questionMedia?: ImageBlockContent | VideoBlockContent;
  options?: QuestionOption[];
  correctAnswer?: unknown;
  correctAnswers?: string[];
  acceptedAnswers?: string[];
  feedback?: {
    correct: string;
    incorrect: string;
  };
  points: number;
  hint?: string;
  explanation?: string;
  required?: boolean;
  timeLimit?: number;
  bloomsLevel?: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  difficulty?: 'easy' | 'medium' | 'hard';
}

// Alias for backward compatibility
export type QuizQuestion = QuestionContent;

export type QuestionType =
  | 'multipleChoice'
  | 'multiple-choice'
  | 'multipleSelect'
  | 'multiple-select'
  | 'trueFalse'
  | 'true-false'
  | 'fillBlank'
  | 'fill-blank'
  | 'matching'
  | 'ordering'
  | 'shortAnswer'
  | 'short-answer'
  | 'essay'
  | 'hotspot'
  | 'likert'
  | 'ranking'
  | 'fileUpload';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  feedback?: string;
  media?: ImageBlockContent;
}

export interface MultipleChoiceContent extends QuestionContent {
  type: 'multipleChoice';
  options: QuestionOption[];
  correctAnswerId: string;
}

export interface MultipleSelectContent extends QuestionContent {
  type: 'multipleSelect';
  options: QuestionOption[];
  correctAnswerIds: string[];
  /** Minimum selections required */
  minSelections?: number;
  /** Maximum selections allowed */
  maxSelections?: number;
}

export interface TrueFalseContent extends QuestionContent {
  type: 'trueFalse';
  correctAnswer: boolean;
  trueLabel?: string;
  falseLabel?: string;
}

export interface FillBlankContent extends QuestionContent {
  type: 'fillBlank';
  /** Text with blanks marked as {{blank_id}} */
  textWithBlanks: string;
  blanks: FillBlank[];
  /** Case sensitive comparison */
  caseSensitive?: boolean;
}

export interface FillBlank {
  id: string;
  correctAnswers: string[]; // Multiple acceptable answers
  placeholder?: string;
}

export interface MatchingQuestionContent extends QuestionContent {
  type: 'matching';
  pairs: MatchingPair[];
}

export interface OrderingContent extends QuestionContent {
  type: 'ordering';
  items: SortingItem[];
  correctOrder: string[];
}

export interface ShortAnswerContent extends QuestionContent {
  type: 'shortAnswer';
  correctAnswers?: string[];
  minLength?: number;
  maxLength?: number;
  caseSensitive?: boolean;
  /** Use AI to grade */
  aiGrading?: boolean;
  /** Keywords to look for */
  keywords?: string[];
}

export interface EssayContent extends QuestionContent {
  type: 'essay';
  minWords?: number;
  maxWords?: number;
  /** Rubric for grading */
  rubric?: RubricItem[];
  /** Use AI to grade */
  aiGrading?: boolean;
}

export interface RubricItem {
  id: string;
  criterion: string;
  maxPoints: number;
  levels: {
    points: number;
    description: string;
  }[];
}

export interface HotspotQuestionContent extends QuestionContent {
  type: 'hotspot';
  imageUrl: string;
  altText?: string;
  /** Correct regions (as percentages) */
  correctRegions: HotspotRegion[];
  /** Tolerance in pixels */
  tolerance?: number;
}

export interface HotspotRegion {
  id: string;
  shape: 'circle' | 'rectangle' | 'polygon';
  x: number;
  y: number;
  width?: number; // For rectangle
  height?: number; // For rectangle
  radius?: number; // For circle
  points?: { x: number; y: number }[]; // For polygon
}

export interface LikertContent extends QuestionContent {
  type: 'likert';
  scale: LikertScale;
  statements: LikertStatement[];
}

export interface LikertScale {
  min: number;
  max: number;
  labels: string[]; // e.g., ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]
}

export interface LikertStatement {
  id: string;
  text: string;
}

export interface RankingContent extends QuestionContent {
  type: 'ranking';
  items: SortingItem[];
  correctRanking?: string[]; // If there's a correct answer
}

export interface FileUploadContent extends QuestionContent {
  type: 'fileUpload';
  acceptedFileTypes: string[]; // e.g., [".pdf", ".doc", ".docx"]
  maxFileSize: number; // In bytes
  maxFiles?: number;
  instructions?: string;
}

export interface KnowledgeCheckContent extends BlockContent {
  question?: QuestionContent | string;
  type?: QuestionType;
  options?: QuestionOption[];
  correctAnswer?: unknown;
  correctAnswers?: string[];
  feedback?: {
    correct?: string;
    incorrect?: string;
  };
  hint?: string;
  style?: string;
  allowRetry?: boolean;
  showAnswer?: boolean;
  informal?: boolean;
}

// Alias for backward compatibility
export type KnowledgeCheckBlockContent = KnowledgeCheckContent;

export interface SurveyBlockContent extends BlockContent {
  title?: string;
  description?: string;
  questions: QuestionContent[];
  anonymous?: boolean;
  thankYouMessage?: string;
}

// =============================================================================
// SECTION 10: SCENARIO BLOCK CONTENT TYPES (CRITICAL FEATURE)
// =============================================================================

export interface ScenarioBlockContent extends BlockContent {
  /** Scenario title */
  title: string;
  /** Description */
  description?: string;
  /** Scenario configuration */
  scenario: ScenarioConfig;
}

export interface ScenarioConfig {
  /** All nodes in the scenario */
  nodes: ScenarioNode[];
  /** Connections between nodes */
  connections: ScenarioConnection[];
  /** Variables for tracking */
  variables: ScenarioVariable[];
  /** Scenario settings */
  settings: ScenarioSettings;
  /** Characters used in scenario */
  characters?: ScenarioCharacter[];
  /** Scenario title */
  title?: string;
}

export interface ScenarioNode {
  id: string;
  type: ScenarioNodeType;
  position: { x: number; y: number };
  data: ScenarioNodeData;
}

export type ScenarioNodeType =
  | 'start'
  | 'end'
  | 'content'
  | 'decision'
  | 'dialogue'
  | 'question'
  | 'feedback'
  | 'variable'
  | 'condition'
  | 'random'
  | 'timer'
  | 'media'
  | 'custom';

export interface ScenarioNodeData {
  label?: string;
  title?: string;
  content?: string;
  // Decision node
  options?: DecisionOption[];
  // Dialogue node
  characterId?: string;
  text?: string;
  emotion?: CharacterEmotion;
  // Question node
  question?: QuestionContent | string;
  points?: number;
  // Feedback node
  feedbackType?: 'info' | 'success' | 'warning' | 'error';
  // Variable node
  variable?: string;
  operation?: 'set' | 'increment' | 'decrement' | 'toggle';
  value?: unknown;
  // Condition node
  conditions?: NodeCondition[];
  defaultTarget?: string;
  // Timer node
  duration?: number;
  timeoutTarget?: string;
  showTimer?: boolean;
  // Random node
  paths?: RandomPath[];
  // Media node
  mediaType?: 'image' | 'video' | 'audio';
  src?: string;
  // End node
  endType?: 'complete' | 'fail' | 'restart' | 'redirect';
  redirectUrl?: string;
  score?: number;
}

export interface DecisionOption {
  id: string;
  text: string;
  targetNodeId?: string;
  feedback?: string;
  points?: number;
  setVariables?: { variable: string; value: unknown }[];
}

export interface NodeCondition {
  id: string;
  variable: string;
  operator: ConditionOperator;
  value: unknown;
  targetNodeId: string;
}

export interface RandomPath {
  id: string;
  weight: number; // Percentage (0-100)
  targetNodeId: string;
}

export interface ScenarioConnection {
  id: string;
  from: string;
  to: string;
  label?: string;
  condition?: NodeCondition;
  optionId?: string; // For decision nodes
}

export interface ScenarioVariable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  defaultValue: unknown;
  description?: string;
}

export interface ScenarioSettings {
  /** Allow restart */
  allowRestart: boolean;
  /** Show progress */
  showProgress: boolean;
  /** Track analytics */
  trackAnalytics: boolean;
  /** Auto-save progress */
  autoSave: boolean;
  /** Timed responses */
  enableTimer: boolean;
  /** Default time per decision (seconds) */
  defaultTimeLimit?: number;
  /** Background music */
  backgroundMusic?: string;
  /** Overall theme */
  theme?: 'default' | 'dark' | 'light' | 'custom';
}

export interface ScenarioCharacter {
  id: string;
  name: string;
  avatar: string;
  description?: string;
  emotions: Record<CharacterEmotion, string>; // Emotion -> avatar URL
  voiceId?: string; // For TTS
}

export type CharacterEmotion =
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'angry'
  | 'surprised'
  | 'confused'
  | 'thinking'
  | 'excited';

// =============================================================================
// SECTION 11: CHARACTER & DIALOGUE BLOCKS
// =============================================================================

export interface CharacterBlockContent extends BlockContent {
  /** Character name */
  name?: string;
  /** Character role */
  role?: string;
  /** Character avatar URL */
  avatar?: string;
  /** Character mood */
  mood?: string;
  /** Avatar size */
  size?: string;
  /** Avatar shape */
  shape?: string;
  /** Background color */
  backgroundColor?: string;
  /** Show name tag */
  showName?: boolean;
  /** Animated */
  animated?: boolean;
  /** Legacy: Character object */
  character?: ScenarioCharacter;
  /** Legacy: Speech text */
  speech?: string;
  /** Legacy: Emotion */
  emotion?: CharacterEmotion;
  /** Legacy: Speech bubble style */
  bubbleStyle?: 'speech' | 'thought' | 'shout' | 'whisper';
  /** Legacy: Position */
  position?: 'left' | 'right' | 'center';
}

export interface DialogueBlockContent extends BlockContent {
  /** Dialogue text */
  text: string;
  /** Speaker name */
  speaker: string;
  /** Speaker avatar URL */
  speakerAvatar?: string;
  /** Speaker position */
  position: 'left' | 'right' | 'center';
  /** Bubble style */
  style: 'speech' | 'thought' | 'narration' | 'whisper' | 'shout';
  /** Enable typewriter effect */
  typewriterEffect?: boolean;
  /** Typewriter speed in milliseconds */
  typewriterSpeed?: number;
  /** Audio URL */
  audioUrl?: string;
  /** Auto-play audio */
  autoPlay?: boolean;
}

export interface DialogueEntry {
  id: string;
  characterId: string;
  text: string;
  emotion?: CharacterEmotion;
  audio?: string;
}

export interface ConversationBlockContent extends BlockContent {
  /** Messages */
  messages: ConversationMessage[];
  /** Speakers */
  speakers?: ConversationSpeaker[];
  /** Chat style */
  style?: 'imessage' | 'slack' | 'whatsapp' | 'generic';
  /** Show timestamps */
  showTimestamps?: boolean;
  /** Animated typing */
  animatedTyping?: boolean;
  /** Auto-play messages */
  autoPlay?: boolean;
  /** Play interval in milliseconds */
  playInterval?: number;
}

export interface ConversationSpeaker {
  id: string;
  name: string;
  color: string;
  avatar?: string;
}

export interface ConversationMessage {
  id: string;
  speakerId: string;
  text: string;
  timestamp?: string;
  reactions?: string[];
  attachments?: FileBlockContent[];
}

// =============================================================================
// SECTION 12: DATA BLOCK CONTENT TYPES
// =============================================================================

export interface TableBlockContent extends BlockContent {
  /** Table caption */
  caption?: string;
  /** Headers */
  headers: TableHeader[];
  /** Rows */
  rows: TableRow[];
  /** Enable sorting */
  sortable?: boolean;
  /** Enable filtering */
  filterable?: boolean;
  /** Enable pagination */
  pagination?: boolean;
  /** Rows per page */
  rowsPerPage?: number;
  /** Striped rows */
  striped?: boolean;
  /** Hoverable rows */
  hoverable?: boolean;
  /** Bordered */
  bordered?: boolean;
}

export interface TableHeader {
  id: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableRow {
  id: string;
  cells: TableCell[];
}

export interface TableCell {
  headerId: string;
  value: string | number;
  format?: 'text' | 'number' | 'currency' | 'percent' | 'date';
  link?: string;
}

export interface ChartBlockContent extends BlockContent {
  /** Chart type */
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'area' | 'radar' | 'scatter';
  /** Chart title */
  title?: string;
  /** Chart data */
  data: ChartData;
  /** Chart options */
  options?: ChartOptions;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  showTooltips?: boolean;
  animationDuration?: number;
}

export interface StatBlockContent extends BlockContent {
  /** Statistics */
  stats: Stat[];
  /** Layout */
  layout?: 'row' | 'grid' | 'cards';
  /** Columns (for grid) */
  columns?: number;
  /** Animated count up */
  animateValue?: boolean;
}

export interface Stat {
  id: string;
  value: string | number;
  label: string;
  prefix?: string;
  suffix?: string;
  icon?: string;
  color?: string;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period?: string;
  };
}

export interface ComparisonBlockContent extends BlockContent {
  /** Items to compare */
  items: ComparisonItem[];
  /** Features to compare */
  features: ComparisonFeature[];
  /** Highlight best */
  highlightBest?: boolean;
}

export interface ComparisonItem {
  id: string;
  name: string;
  description?: string;
  image?: string;
  highlighted?: boolean;
}

export interface ComparisonFeature {
  id: string;
  name: string;
  values: Record<string, string | number | boolean>;
}

export interface DataCardBlockContent extends BlockContent {
  /** Cards */
  cards: DataCard[];
  /** Layout */
  layout?: 'grid' | 'list' | 'carousel';
  /** Columns (for grid) */
  columns?: number;
}

export interface DataCard {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  image?: string;
  color?: string;
  progress?: number;
  trend?: 'up' | 'down' | 'stable';
}

// =============================================================================
// SECTION 13: SPECIAL BLOCK CONTENT TYPES
// =============================================================================

export interface TestimonialBlockContent extends BlockContent {
  /** Testimonial text */
  quote: string;
  /** Author name */
  author: string;
  /** Author title/role */
  title?: string;
  /** Author company */
  company?: string;
  /** Author avatar */
  avatar?: string;
  /** Rating (1-5) */
  rating?: number;
  /** Variant */
  variant?: 'card' | 'minimal' | 'featured';
}

export interface TeamMemberBlockContent extends BlockContent {
  /** Name */
  name: string;
  /** Role/Title */
  role: string;
  /** Photo */
  photo?: string;
  /** Bio */
  bio?: string;
  /** Contact links */
  links?: {
    type: 'email' | 'phone' | 'linkedin' | 'twitter' | 'website';
    url: string;
  }[];
}

export interface FeatureBlockContent extends BlockContent {
  /** Features */
  features: Feature[];
  /** Layout */
  layout?: 'grid' | 'list' | 'alternating';
  /** Columns (for grid) */
  columns?: number;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon?: string;
  image?: string;
  link?: string;
}

export interface CTABlockContent extends BlockContent {
  /** Headline */
  headline: string;
  /** Description */
  description?: string;
  /** Primary button */
  primaryButton: {
    text: string;
    url: string;
    variant?: 'solid' | 'outline' | 'ghost';
  };
  /** Secondary button */
  secondaryButton?: {
    text: string;
    url: string;
    variant?: 'solid' | 'outline' | 'ghost';
  };
  /** Background style */
  background?: 'solid' | 'gradient' | 'image';
  /** Background image */
  backgroundImage?: string;
}

export interface CountdownBlockContent extends BlockContent {
  /** Target date/time */
  targetDate: string;
  /** Format */
  format?: 'days' | 'full' | 'minimal';
  /** Show labels */
  showLabels?: boolean;
  /** Action on complete */
  onComplete?: 'hide' | 'message' | 'redirect';
  /** Completion message */
  completionMessage?: string;
  /** Redirect URL */
  redirectUrl?: string;
}

export interface ProgressBlockContent extends BlockContent {
  /** Progress type */
  type: 'linear' | 'circular' | 'steps';
  /** Current value */
  value: number;
  /** Max value */
  max: number;
  /** Show label */
  showLabel?: boolean;
  /** Label format */
  labelFormat?: 'percent' | 'value' | 'custom';
  /** Custom label */
  customLabel?: string;
  /** Color */
  color?: string;
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  /** Animated */
  animated?: boolean;
  /** Steps (for step type) */
  steps?: ProgressStep[];
}

export interface ProgressStep {
  id: string;
  label: string;
  completed: boolean;
}

export interface CodePlaygroundBlockContent extends BlockContent {
  /** Initial code */
  initialCode: string;
  /** Language */
  language: 'javascript' | 'typescript' | 'python' | 'html' | 'css';
  /** Read only */
  readOnly?: boolean;
  /** Show console */
  showConsole?: boolean;
  /** Show preview (for HTML/CSS) */
  showPreview?: boolean;
  /** Run on load */
  runOnLoad?: boolean;
  /** Expected output (for validation) */
  expectedOutput?: string;
  /** Hints */
  hints?: string[];
  /** Solution */
  solution?: string;
}

// =============================================================================
// SECTION 14: LAYOUT BLOCK CONTENT TYPES
// =============================================================================

export interface ColumnsBlockContent extends BlockContent {
  /** Column configuration */
  columns: ColumnConfig[];
  /** Gap between columns */
  gap?: string | number;
  /** Vertical alignment */
  verticalAlign?: 'top' | 'center' | 'bottom' | 'stretch';
  /** Stack on mobile */
  stackOnMobile?: boolean;
  /** Reverse on mobile */
  reverseOnMobile?: boolean;
}

export interface ColumnConfig {
  id: string;
  width: string | number;
  blocks: string[]; // Block IDs
  style?: Partial<BlockStyle>;
}

export interface ContainerBlockContent extends BlockContent {
  /** Nested child blocks */
  children?: Block[];
  /** Background color */
  backgroundColor?: string;
  /** Background image URL */
  backgroundImage?: string;
  /** Background size */
  backgroundSize?: 'cover' | 'contain' | 'auto';
  /** Background position */
  backgroundPosition?: string;
  /** Padding */
  padding?: string;
  /** Border radius */
  borderRadius?: string;
  /** Border width */
  borderWidth?: number;
  /** Border color */
  borderColor?: string;
  /** Max width */
  maxWidth?: string;
  /** Text alignment */
  textAlign?: 'left' | 'center' | 'right';
}

export interface GridBlockContent extends BlockContent {
  /** Grid items */
  items: string[]; // Block IDs
  /** Columns */
  columns?: number | 'auto-fit' | 'auto-fill';
  /** Min column width */
  minColumnWidth?: string;
  /** Gap */
  gap?: string | number;
  /** Row gap */
  rowGap?: string | number;
  /** Column gap */
  columnGap?: string | number;
}

export interface SpacerBlockContent extends BlockContent {
  /** Height */
  height: string | number;
  /** Mobile height */
  mobileHeight?: string | number;
  /** Show divider */
  showDivider?: boolean;
}

export interface CardBlockContent extends BlockContent {
  /** Card header image */
  image?: ImageBlockContent;
  /** Card title */
  title?: string;
  /** Card subtitle */
  subtitle?: string;
  /** Card description */
  description?: string;
  /** Card content (HTML) */
  content?: string;
  /** Footer content */
  footer?: string;
  /** Media URL (alternative to image) */
  mediaUrl?: string;
  /** Media alt text */
  mediaAlt?: string;
  /** Link */
  link?: string;
  /** Link target */
  linkTarget?: '_self' | '_blank' | '_parent' | '_top';
  /** Card variant */
  variant?: 'default' | 'outlined' | 'elevated' | 'flat' | 'interactive' | 'filled';
  /** Clickable */
  clickable?: boolean;
  /** Nested blocks */
  blocks?: string[]; // Block IDs
  /** Children (alias for blocks) */
  children?: string[];
}

// =============================================================================
// SECTION 15: BLOCK REGISTRATION & METADATA
// =============================================================================

/**
 * Block registration information
 */
export interface BlockRegistration {
  type: BlockType;
  category: BlockCategory;
  name: string;
  description: string;
  icon: string;
  preview?: string;
  defaultContent: BlockContent;
  defaultSettings?: Partial<BlockSettings>;
  defaultStyle?: Partial<BlockStyle>;
  component: string;
  propertiesComponent?: string;
  /** Is this block available */
  available: boolean;
  /** Premium only */
  premium?: boolean;
  /** Beta feature */
  beta?: boolean;
  /** Tags for search */
  tags?: string[];
}

/**
 * Block palette configuration
 */
export interface BlockPaletteConfig {
  categories: {
    id: BlockCategory;
    name: string;
    icon: string;
    description?: string;
  }[];
  blocks: BlockRegistration[];
}

// =============================================================================
// SECTION 16: BLOCK STATE & EVENTS
// =============================================================================

/**
 * Block state for learner progress
 */
export interface BlockState {
  blockId: string;
  viewed: boolean;
  viewedAt?: string;
  interacted: boolean;
  interactedAt?: string;
  completed: boolean;
  completedAt?: string;
  score?: number;
  maxScore?: number;
  attempts?: number;
  timeSpent?: number;
  customData?: Record<string, unknown>;
}

/**
 * Block event
 */
export interface BlockEvent {
  type:
    | 'view'
    | 'interact'
    | 'complete'
    | 'score'
    | 'error'
    | 'timeout'
    | 'hint'
    | 'retry'
    | 'skip'
    | 'custom';
  blockId: string;
  blockType: BlockType;
  timestamp: string;
  data?: Record<string, unknown>;
}

// =============================================================================
// SECTION 17: UTILITY TYPES
// =============================================================================

/**
 * Deep partial for nested objects
 */
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * Block update payload
 */
export type BlockUpdate = DeepPartial<Block>;

/**
 * Block render mode
 */
export type BlockRenderMode = 'edit' | 'preview' | 'learner' | 'print';

/**
 * Block selection state
 */
export interface BlockSelection {
  blockId: string;
  selected: boolean;
  focused: boolean;
  editing: boolean;
}

/**
 * Block clipboard data
 */
export interface BlockClipboard {
  blocks: Block[];
  copiedAt: string;
  sourcePageId?: string;
}

/**
 * Drag and drop data
 */
export interface BlockDragData {
  blockId: string;
  blockType: BlockType;
  sourceContainerId?: string;
  sourceIndex?: number;
}

// =============================================================================
// SECTION 18: STARTER 10 BLOCK TYPES
// =============================================================================

/**
 * The Starter 10 block types - the essential content blocks for course creation
 */
export type StarterBlockType =
  | 'paragraph'
  | 'image'
  | 'video'
  | 'quote'
  | 'list'
  | 'mc-question'
  | 'fitb-question'
  | 'accordion'
  | 'tabs'
  | 'flip-card';

/**
 * Block definition for registry
 */
export interface BlockDefinition {
  type: StarterBlockType;
  category: 'text' | 'media' | 'assessment' | 'interactive';
  interactivityLevel: 1 | 2 | 3 | 4;
  xapiVerbs: string[];
  label: string;
  description: string;
  icon: string;
  cognitiveLoadWeight: number;
  a11yRequirements: string[];
  defaultDuration: number;
}

/**
 * Block instance in the course store
 */
export interface BlockInstance<T extends StarterBlockType = StarterBlockType> {
  id: string;
  type: T;
  content: BlockContentMap[T];
  config: BlockConfigMap[T];
  order: number;
  createdAt: string;
  updatedAt: string;
  parentId?: string;
  className?: string;
  style?: Record<string, string>;
  duration?: number;
  cognitiveLoad?: number;
}

// =============================================================================
// STARTER 10 CONTENT TYPES
// =============================================================================

export interface ParagraphContent {
  text: string;
}

export interface ImageContent {
  src: string;
  alt: string;
  caption?: string;
  /** Image width for next/image */
  width?: number;
  /** Image height for next/image */
  height?: number;
}

export interface VideoContent {
  src: string;
  provider: 'upload' | 'youtube' | 'vimeo' | 'loom';
  title: string;
  /** Poster image URL for native video player */
  poster?: string;
  captions: Array<{ src: string; language: string; label: string; default?: boolean }>;
}

export interface QuoteContent {
  text: string;
  attribution?: string;
  source?: string;
}

export interface ListContent {
  listType: 'bullet' | 'number' | 'check';
  items: ListItem[];
}

/** Multiple choice answer option */
export interface MCChoice {
  id: string;
  text: string;
  correct: boolean;
}

export interface MCQuestionContent {
  question: string;
  choices: MCChoice[];
  multipleAnswer: boolean;
  feedback: {
    correct: string;
    incorrect: string;
    partial?: string;
  };
}

/** Fill in the blank answer slot */
export interface FITBBlank {
  id: string;
  acceptedAnswers: string[];
  placeholder?: string;
  hint?: string;
}

export interface FITBQuestionContent {
  template: string;
  blanks: FITBBlank[];
  feedback: {
    correct: string;
    incorrect: string;
    partial?: string;
  };
}

export interface AccordionContent {
  panels: Array<{
    id: string;
    title: string;
    content: string;
    defaultExpanded?: boolean;
  }>;
}

export interface TabsContent {
  tabs: Array<{
    id: string;
    label: string;
    content: string;
  }>;
  defaultTabId?: string;
}

export interface FlipCardSide {
  title?: string;
  content: string;
  backgroundColor?: string;
  image?: {
    src: string;
    alt: string;
  };
}

export interface FlipCardContent {
  front: FlipCardSide;
  back: FlipCardSide;
}

// =============================================================================
// STARTER 10 CONFIG TYPES
// =============================================================================

export interface ParagraphConfig {
  alignment: 'left' | 'center' | 'right' | 'justify';
  size: 'small' | 'normal' | 'large';
  enableTTS: boolean;
  enableDyslexiaFont: boolean;
}

/** Image block sizing options */
export type ImageSizing = 'cover' | 'contain' | 'fill' | 'full-width' | 'original';

/** Image block border radius options */
export type ImageBorderRadius = 'none' | 'small' | 'medium' | 'large' | 'full';

export interface ImageConfig {
  sizing?: ImageSizing;
  borderRadius?: ImageBorderRadius;
  enableZoom: boolean;
  captionPosition: 'above' | 'below' | 'overlay';
  lazyLoad: boolean;
}

export interface VideoConfig {
  autoplay: boolean;
  loop: boolean;
  controls: boolean;
  muted: boolean;
  playbackSpeeds: number[];
  required: boolean;
  requiredWatchPercentage: number;
}

/** Quote block variant types */
export type QuoteVariant = 'default' | 'large' | 'bordered' | 'filled' | 'highlighted' | 'minimal';

export interface QuoteConfig {
  variant?: QuoteVariant;
  showQuoteMarks: boolean;
  attributionPosition: 'below' | 'inline';
}

export interface ListConfig {
  markerStyle?: 'disc' | 'circle' | 'square' | 'decimal' | 'alpha' | 'roman';
  spacing?: 'compact' | 'normal' | 'relaxed';
  animate?: boolean;
  interactive?: boolean;
}

export interface MCQuestionConfig {
  shuffleChoices: boolean;
  maxAttempts: number;
  showCorrectAnswer: boolean;
  points: number;
  partialCredit: boolean;
  timeLimit: number;
  immediateFeedback: boolean;
}

export interface FITBQuestionConfig {
  caseSensitive: boolean;
  trimWhitespace: boolean;
  maxAttempts: number;
  showCorrectAnswers: boolean;
  points: number;
  pointsPerBlank: number;
  showHints: boolean;
  timeLimit: number;
}

/** Accordion block variant types */
export type AccordionVariant = 'default' | 'bordered' | 'filled' | 'minimal' | 'separated';

export interface AccordionConfig {
  allowMultiple: boolean;
  variant?: AccordionVariant;
  iconPosition: 'left' | 'right';
  trackInteractions: boolean;
}

export interface TabsConfig {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'underline' | 'underlined' | 'enclosed' | 'boxed';
  alignment?: 'start' | 'center' | 'end' | 'stretch';
  trackInteractions?: boolean;
}

export interface FlipCardConfig {
  flipDirection?: 'horizontal' | 'vertical';
  flipTrigger?: 'click' | 'hover';
  aspectRatio?: '1:1' | '4:3' | '16:9' | '3:4' | 'auto';
  animationDuration?: number;
  trackInteractions?: boolean;
}

// =============================================================================
// BLOCK CONTENT & CONFIG MAPS
// =============================================================================

/**
 * Map of block types to their content structure
 */
export interface BlockContentMap {
  paragraph: ParagraphContent;
  image: ImageContent;
  video: VideoContent;
  quote: QuoteContent;
  list: ListContent;
  'mc-question': MCQuestionContent;
  'fitb-question': FITBQuestionContent;
  accordion: AccordionContent;
  tabs: TabsContent;
  'flip-card': FlipCardContent;
}

/**
 * Map of block types to their configuration structure
 */
export interface BlockConfigMap {
  paragraph: ParagraphConfig;
  image: ImageConfig;
  video: VideoConfig;
  quote: QuoteConfig;
  list: ListConfig;
  'mc-question': MCQuestionConfig;
  'fitb-question': FITBQuestionConfig;
  accordion: AccordionConfig;
  tabs: TabsConfig;
  'flip-card': FlipCardConfig;
}

// =============================================================================
// BLOCK CONSTANTS
// =============================================================================

/**
 * Cognitive load weights for each block type (1-10 scale)
 */
export const BLOCK_COGNITIVE_WEIGHTS: Record<StarterBlockType, number> = {
  paragraph: 2,
  image: 3,
  video: 5,
  quote: 2,
  list: 3,
  'mc-question': 6,
  'fitb-question': 7,
  accordion: 4,
  tabs: 4,
  'flip-card': 5,
};

/**
 * xAPI verbs for each block type
 */
export const BLOCK_XAPI_VERBS: Record<StarterBlockType, string[]> = {
  paragraph: ['http://adlnet.gov/expapi/verbs/experienced'],
  image: ['http://adlnet.gov/expapi/verbs/experienced'],
  video: [
    'http://adlnet.gov/expapi/verbs/played',
    'http://adlnet.gov/expapi/verbs/paused',
    'http://adlnet.gov/expapi/verbs/completed',
  ],
  quote: ['http://adlnet.gov/expapi/verbs/experienced'],
  list: ['http://adlnet.gov/expapi/verbs/experienced'],
  'mc-question': [
    'http://adlnet.gov/expapi/verbs/answered',
    'http://adlnet.gov/expapi/verbs/passed',
    'http://adlnet.gov/expapi/verbs/failed',
  ],
  'fitb-question': [
    'http://adlnet.gov/expapi/verbs/answered',
    'http://adlnet.gov/expapi/verbs/passed',
    'http://adlnet.gov/expapi/verbs/failed',
  ],
  accordion: ['http://adlnet.gov/expapi/verbs/interacted'],
  tabs: ['http://adlnet.gov/expapi/verbs/interacted'],
  'flip-card': ['http://adlnet.gov/expapi/verbs/interacted'],
};

/**
 * Accessibility requirements for each block type
 */
export const BLOCK_A11Y_REQUIREMENTS: Record<StarterBlockType, string[]> = {
  paragraph: ['screen-reader', 'text-to-speech', 'dyslexia-font'],
  image: ['alt-text', 'long-description', 'screen-reader'],
  video: ['captions', 'transcript', 'audio-description', 'keyboard-navigation'],
  quote: ['screen-reader', 'aria-labels'],
  list: ['screen-reader', 'keyboard-navigation'],
  'mc-question': ['keyboard-navigation', 'screen-reader', 'focus-indicators', 'aria-labels'],
  'fitb-question': ['keyboard-navigation', 'screen-reader', 'focus-indicators', 'aria-labels'],
  accordion: ['keyboard-navigation', 'aria-expanded', 'focus-indicators'],
  tabs: ['keyboard-navigation', 'aria-selected', 'focus-indicators'],
  'flip-card': ['keyboard-navigation', 'aria-labels', 'focus-indicators', 'reduced-motion'],
};
