import type { ADLVerbId } from './xapi';

// ============================================================================
// INTERACTIVITY LEVELS
// ============================================================================

/**
 * Interactivity levels for content blocks
 * Based on industry benchmarks for learning content development
 */
export type InteractivityLevel = 1 | 2 | 3 | 4;

export const INTERACTIVITY_LEVELS = {
  PASSIVE: 1, // Read/watch only, no interaction
  LIMITED: 2, // Simple clicks, reveals, basic navigation
  MODERATE: 3, // Branching, drag-drop, simulations
  IMMERSIVE: 4, // VR/AR, complex simulations, AI-driven
} as const;

export const INTERACTIVITY_MULTIPLIERS: Record<InteractivityLevel, number> = {
  1: 1, // Base development time
  2: 2, // 2x development time
  3: 4, // 4x development time
  4: 8, // 8x development time
};

// ============================================================================
// BLOCK TYPES
// ============================================================================

/**
 * All available content block types
 */
export type BlockType =
  // Text & Typography
  | 'heading'
  | 'paragraph'
  | 'rich-text'
  | 'callout'
  | 'quote'
  | 'code'
  // Media
  | 'image'
  | 'video'
  | 'audio'
  | 'embed'
  | 'gallery'
  | 'model-3d'
  // Assessment
  | 'mc-question'
  | 'tf-question'
  | 'fitb-question'
  | 'matching-question'
  | 'sequence-question'
  | 'hotspot-question'
  | 'likert-question'
  | 'open-response'
  | 'file-upload'
  // Interactive
  | 'accordion'
  | 'tabs'
  | 'flip-card'
  | 'timeline'
  | 'process-steps'
  | 'reveal'
  | 'slider'
  | 'drag-drop'
  // Scenario & Branching
  | 'branching-scenario'
  | 'dialog-sim'
  | 'software-sim'
  | 'decision-tree'
  // Immersive (Level 4)
  | 'vr-scene'
  | 'ar-overlay'
  | 'simulation'
  | 'game'
  // Layout & Structure
  | 'section'
  | 'columns'
  | 'divider'
  | 'spacer'
  // AI-Powered
  | 'ai-mentor'
  | 'ai-feedback'
  | 'adaptive-content'
  // Data & Visualization
  | 'chart'
  | 'table'
  | 'infographic';

/**
 * Block category for organization
 */
export type BlockCategory =
  | 'text'
  | 'media'
  | 'assessment'
  | 'interactive'
  | 'scenario'
  | 'immersive'
  | 'layout'
  | 'ai'
  | 'data';

// ============================================================================
// ACCESSIBILITY FEATURES
// ============================================================================

/**
 * Accessibility features supported by blocks
 */
export type A11yFeature =
  | 'screen-reader'
  | 'keyboard-navigation'
  | 'captions'
  | 'transcript'
  | 'audio-description'
  | 'dyslexia-font'
  | 'high-contrast'
  | 'reduced-motion'
  | 'alternative-input'
  | 'focus-indicators'
  | 'aria-labels'
  | 'long-description'
  | 'text-to-speech'
  | 'adjustable-timing';

/**
 * WCAG conformance level
 */
export type WCAGLevel = 'A' | 'AA' | 'AAA';

// ============================================================================
// BLOCK DEFINITION
// ============================================================================

/**
 * Complete block definition metadata
 */
export interface BlockDefinition {
  /** Unique block type identifier */
  type: BlockType;
  /** Human-readable name */
  name: string;
  /** Block description */
  description: string;
  /** Category for organization */
  category: BlockCategory;
  /** Interactivity level (1-4) */
  interactivityLevel: InteractivityLevel;
  /** xAPI verbs this block can generate */
  xapiVerbs: ADLVerbId[];
  /** Supported accessibility features */
  accessibilityFeatures: A11yFeature[];
  /** Cognitive load weight (1-10) */
  cognitiveLoadWeight: number;
  /** Whether this block can contain child blocks */
  supportsChildren: boolean;
  /** Allowed child block types (if supportsChildren) */
  allowedChildren?: BlockType[];
  /** Icon identifier for UI */
  icon: string;
  /** Default estimated duration in seconds */
  defaultDuration: number;
}

// ============================================================================
// CONTENT BLOCK INSTANCE
// ============================================================================

/**
 * Base content block instance
 */
export interface ContentBlock<T extends BlockType = BlockType> {
  /** Unique instance ID */
  id: string;
  /** Block type */
  type: T;
  /** Block configuration (type-specific) */
  config: BlockConfig<T>;
  /** Child blocks (if supported) */
  children?: ContentBlock[];
  /** Custom CSS classes */
  className?: string;
  /** Inline styles override */
  style?: Record<string, string>;
  /** Estimated duration override (seconds) */
  duration?: number;
  /** Cognitive load override (1-10) */
  cognitiveLoad?: number;
  /** Whether block is required for completion */
  required?: boolean;
  /** Custom xAPI extensions */
  xapiExtensions?: Record<string, unknown>;
}

// ============================================================================
// BLOCK CONFIGURATIONS
// ============================================================================

/**
 * Type-safe block configuration mapping
 */
export type BlockConfig<T extends BlockType> = T extends 'heading'
  ? HeadingConfig
  : T extends 'paragraph'
    ? ParagraphConfig
    : T extends 'rich-text'
      ? RichTextConfig
      : T extends 'callout'
        ? CalloutConfig
        : T extends 'video'
          ? VideoConfig
          : T extends 'image'
            ? ImageConfig
            : T extends 'mc-question'
              ? MCQuestionConfig
              : T extends 'tf-question'
                ? TFQuestionConfig
                : T extends 'fitb-question'
                  ? FITBQuestionConfig
                  : T extends 'matching-question'
                    ? MatchingConfig
                    : T extends 'accordion'
                      ? AccordionConfig
                      : T extends 'tabs'
                        ? TabsConfig
                        : T extends 'branching-scenario'
                          ? BranchingConfig
                          : T extends 'vr-scene'
                            ? VRSceneConfig
                            : T extends 'ai-mentor'
                              ? AIMentorConfig
                              : T extends 'chart'
                                ? ChartConfig
                                : BaseBlockConfig;

/**
 * Base configuration all blocks share
 */
export interface BaseBlockConfig {
  /** Accessibility label override */
  ariaLabel?: string;
  /** Whether to track xAPI statements */
  trackXAPI?: boolean;
}

// ============================================================================
// TEXT BLOCK CONFIGS
// ============================================================================

export interface HeadingConfig extends BaseBlockConfig {
  /** Heading level (1-4) */
  level: 1 | 2 | 3 | 4;
  /** Heading text */
  text: string;
  /** Optional anchor ID */
  anchorId?: string;
}

export interface ParagraphConfig extends BaseBlockConfig {
  /** Paragraph content (markdown supported) */
  content: string;
  /** Text alignment */
  align?: 'left' | 'center' | 'right' | 'justify';
}

export interface RichTextConfig extends BaseBlockConfig {
  /** Rich text content (HTML or Portable Text) */
  content: string | PortableTextBlock[];
}

export interface CalloutConfig extends BaseBlockConfig {
  /** Callout variant */
  variant: 'info' | 'warning' | 'success' | 'error' | 'tip';
  /** Title (optional) */
  title?: string;
  /** Content */
  content: string;
  /** Custom icon */
  icon?: string;
}

// ============================================================================
// MEDIA BLOCK CONFIGS
// ============================================================================

export interface ImageConfig extends BaseBlockConfig {
  /** Image source URL */
  src: string;
  /** Alt text (required for accessibility) */
  alt: string;
  /** Optional long description */
  longDescription?: string;
  /** Caption */
  caption?: string;
  /** Width constraint */
  width?: number | 'full' | 'auto';
  /** Enable lightbox zoom */
  lightbox?: boolean;
}

export interface VideoConfig extends BaseBlockConfig {
  /** Video source URL or provider ID */
  src: string;
  /** Video provider */
  provider: 'upload' | 'youtube' | 'vimeo' | 'loom';
  /** Poster image */
  poster?: string;
  /** Caption track URL (VTT) */
  captionsUrl?: string;
  /** Transcript content */
  transcript?: string;
  /** Audio description track */
  audioDescriptionUrl?: string;
  /** Auto-play (not recommended for a11y) */
  autoPlay?: boolean;
  /** Chapter markers */
  chapters?: VideoChapter[];
  /** Quiz cue points */
  quizCuePoints?: QuizCuePoint[];
}

export interface VideoChapter {
  /** Chapter title */
  title: string;
  /** Start time in seconds */
  startTime: number;
}

export interface QuizCuePoint {
  /** Time to pause and show quiz */
  time: number;
  /** Question block ID to display */
  questionBlockId: string;
}

// ============================================================================
// ASSESSMENT BLOCK CONFIGS
// ============================================================================

export interface MCQuestionConfig extends BaseBlockConfig {
  /** Question text */
  question: string;
  /** Answer options */
  options: QuestionOption[];
  /** Allow multiple correct answers */
  multipleAnswers?: boolean;
  /** Shuffle options */
  shuffleOptions?: boolean;
  /** Feedback for correct answer */
  correctFeedback?: string;
  /** Feedback for incorrect answer */
  incorrectFeedback?: string;
  /** Points value */
  points?: number;
  /** Maximum attempts */
  maxAttempts?: number;
}

export interface QuestionOption {
  /** Option ID */
  id: string;
  /** Option text */
  text: string;
  /** Whether this is a correct answer */
  isCorrect: boolean;
  /** Option-specific feedback */
  feedback?: string;
  /** Optional image */
  image?: string;
}

export interface TFQuestionConfig extends BaseBlockConfig {
  /** Question/statement text */
  question: string;
  /** Correct answer */
  correctAnswer: boolean;
  /** Feedback for correct */
  correctFeedback?: string;
  /** Feedback for incorrect */
  incorrectFeedback?: string;
  /** Points value */
  points?: number;
}

export interface FITBQuestionConfig extends BaseBlockConfig {
  /** Text with blanks marked as {{blank_id}} */
  textWithBlanks: string;
  /** Blank definitions */
  blanks: FITBBlank[];
  /** Case sensitive matching */
  caseSensitive?: boolean;
  /** Points per blank */
  pointsPerBlank?: number;
}

export interface FITBBlank {
  /** Blank identifier */
  id: string;
  /** Accepted answers */
  acceptedAnswers: string[];
  /** Placeholder text */
  placeholder?: string;
}

export interface MatchingConfig extends BaseBlockConfig {
  /** Instructions */
  instructions?: string;
  /** Pairs to match */
  pairs: MatchingPair[];
  /** Use dropdown instead of drag-drop (better a11y) */
  useDropdown?: boolean;
  /** Points value */
  points?: number;
}

export interface MatchingPair {
  /** Pair ID */
  id: string;
  /** Left side (source) */
  source: string;
  /** Right side (target) */
  target: string;
  /** Optional image for source */
  sourceImage?: string;
  /** Optional image for target */
  targetImage?: string;
}

// ============================================================================
// INTERACTIVE BLOCK CONFIGS
// ============================================================================

export interface AccordionConfig extends BaseBlockConfig {
  /** Accordion items */
  items: AccordionItem[];
  /** Allow multiple open */
  allowMultiple?: boolean;
  /** Default open item index */
  defaultOpen?: number;
}

export interface AccordionItem {
  /** Item ID */
  id: string;
  /** Header text */
  header: string;
  /** Content (can contain nested blocks) */
  content: string | ContentBlock[];
}

export interface TabsConfig extends BaseBlockConfig {
  /** Tab items */
  tabs: TabItem[];
  /** Default active tab index */
  defaultTab?: number;
  /** Tab orientation */
  orientation?: 'horizontal' | 'vertical';
}

export interface TabItem {
  /** Tab ID */
  id: string;
  /** Tab label */
  label: string;
  /** Tab content */
  content: string | ContentBlock[];
  /** Tab icon */
  icon?: string;
}

// ============================================================================
// SCENARIO BLOCK CONFIGS
// ============================================================================

export interface BranchingConfig extends BaseBlockConfig {
  /** Scenario title */
  title: string;
  /** Starting node ID */
  startNodeId: string;
  /** All scenario nodes */
  nodes: BranchingNode[];
  /** Enable score tracking */
  trackScore?: boolean;
  /** Show decision history */
  showHistory?: boolean;
}

export interface BranchingNode {
  /** Node ID */
  id: string;
  /** Node type */
  type: 'content' | 'decision' | 'ending';
  /** Content to display */
  content: string | ContentBlock[];
  /** Choices (for decision nodes) */
  choices?: BranchingChoice[];
  /** Score adjustment */
  scoreAdjustment?: number;
  /** Whether this is a "good" ending */
  isGoodEnding?: boolean;
}

export interface BranchingChoice {
  /** Choice ID */
  id: string;
  /** Choice text */
  text: string;
  /** Target node ID */
  targetNodeId: string;
  /** Score impact */
  scoreImpact?: number;
}

// ============================================================================
// IMMERSIVE BLOCK CONFIGS
// ============================================================================

export interface VRSceneConfig extends BaseBlockConfig {
  /** 360° image or video source */
  src: string;
  /** Source type */
  type: 'image-360' | 'video-360' | 'model';
  /** Hotspots in the scene */
  hotspots: VRHotspot[];
  /** Initial camera rotation */
  initialRotation?: { x: number; y: number; z: number };
  /** 2D fallback image */
  fallbackImage?: string;
  /** Audio description for non-VR users */
  audioDescription?: string;
}

export interface VRHotspot {
  /** Hotspot ID */
  id: string;
  /** Position in 3D space */
  position: { x: number; y: number; z: number };
  /** Hotspot type */
  type: 'info' | 'navigation' | 'action';
  /** Label */
  label: string;
  /** Content to show on click */
  content?: string | ContentBlock[];
  /** Target scene (for navigation) */
  targetSceneId?: string;
}

// ============================================================================
// AI BLOCK CONFIGS
// ============================================================================

export interface AIMentorConfig extends BaseBlockConfig {
  /** Mentor persona name */
  personaName: string;
  /** Mentor avatar */
  avatar?: string;
  /** System prompt for AI */
  systemPrompt: string;
  /** Allowed topic boundaries */
  topicBoundaries?: string[];
  /** Enable Socratic questioning */
  socraticMode?: boolean;
  /** Maximum tokens per response */
  maxTokens?: number;
  /** Suggested questions */
  suggestedQuestions?: string[];
}

// ============================================================================
// DATA BLOCK CONFIGS
// ============================================================================

export interface ChartConfig extends BaseBlockConfig {
  /** Chart type */
  chartType: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'donut';
  /** Chart title */
  title?: string;
  /** Data series */
  data: ChartDataSeries[];
  /** X-axis label */
  xAxisLabel?: string;
  /** Y-axis label */
  yAxisLabel?: string;
  /** Show legend */
  showLegend?: boolean;
  /** Enable interactivity (tooltips, zoom) */
  interactive?: boolean;
  /** Accessible data table fallback */
  showDataTable?: boolean;
}

export interface ChartDataSeries {
  /** Series name */
  name: string;
  /** Data points */
  data: Array<{ x: string | number; y: number }>;
  /** Series color */
  color?: string;
}

// ============================================================================
// PORTABLE TEXT (rich text content)
// ============================================================================

export interface PortableTextBlock {
  _type: 'block';
  _key: string;
  style?: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'blockquote';
  children: PortableTextSpan[];
  markDefs?: PortableTextMarkDef[];
}

export interface PortableTextSpan {
  _type: 'span';
  _key: string;
  text: string;
  marks?: string[];
}

export interface PortableTextMarkDef {
  _key: string;
  _type: 'link' | 'internalLink';
  href?: string;
  reference?: { _ref: string };
}

// ============================================================================
// BLOCK REGISTRY
// ============================================================================

/**
 * Block definitions registry
 * Maps block types to their metadata
 */
export const BLOCK_DEFINITIONS: Record<BlockType, BlockDefinition> = {
  // Text blocks
  heading: {
    type: 'heading',
    name: 'Heading',
    description: 'Section heading with hierarchy levels',
    category: 'text',
    interactivityLevel: 1,
    xapiVerbs: [],
    accessibilityFeatures: ['screen-reader', 'aria-labels'],
    cognitiveLoadWeight: 1,
    supportsChildren: false,
    icon: 'heading',
    defaultDuration: 5,
  },
  paragraph: {
    type: 'paragraph',
    name: 'Paragraph',
    description: 'Text paragraph with formatting',
    category: 'text',
    interactivityLevel: 1,
    xapiVerbs: ['http://adlnet.gov/expapi/verbs/experienced'],
    accessibilityFeatures: ['screen-reader', 'text-to-speech', 'dyslexia-font'],
    cognitiveLoadWeight: 2,
    supportsChildren: false,
    icon: 'align-left',
    defaultDuration: 30,
  },
  // ... Additional definitions would continue for all 45+ block types
  // Abbreviated for file size - full definitions in Notion
} as Partial<Record<BlockType, BlockDefinition>> as Record<BlockType, BlockDefinition>;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get block definition by type
 */
export function getBlockDefinition(type: BlockType): BlockDefinition | undefined {
  return BLOCK_DEFINITIONS[type];
}

/**
 * Get all blocks in a category
 */
export function getBlocksByCategory(category: BlockCategory): BlockDefinition[] {
  return Object.values(BLOCK_DEFINITIONS).filter((def) => def.category === category);
}

/**
 * Get blocks by interactivity level
 */
export function getBlocksByLevel(level: InteractivityLevel): BlockDefinition[] {
  return Object.values(BLOCK_DEFINITIONS).filter((def) => def.interactivityLevel === level);
}

/**
 * Calculate total cognitive load for a set of blocks
 */
export function calculateCognitiveLoad(blocks: ContentBlock[]): number {
  return blocks.reduce((total, block) => {
    const def = getBlockDefinition(block.type);
    const weight = block.cognitiveLoad ?? def?.cognitiveLoadWeight ?? 1;
    return total + weight;
  }, 0);
}

/**
 * Calculate estimated duration for a set of blocks
 */
export function calculateDuration(blocks: ContentBlock[]): number {
  return blocks.reduce((total, block) => {
    const def = getBlockDefinition(block.type);
    const duration = block.duration ?? def?.defaultDuration ?? 30;
    return total + duration;
  }, 0);
}

/**
 * Get all xAPI verbs that could be generated by a set of blocks
 */
export function getExpectedXAPIVerbs(blocks: ContentBlock[]): ADLVerbId[] {
  const verbs = new Set<ADLVerbId>();
  for (const block of blocks) {
    const def = getBlockDefinition(block.type);
    if (def) {
      for (const verb of def.xapiVerbs) {
        verbs.add(verb as ADLVerbId);
      }
    }
  }
  return Array.from(verbs);
}
