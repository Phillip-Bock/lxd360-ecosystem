import type {
  AccordionConfig,
  AccordionContent,
  BlockConfigMap,
  BlockContentMap,
  BlockDefinition,
  BlockInstance,
  FITBQuestionConfig,
  FITBQuestionContent,
  FlipCardConfig,
  FlipCardContent,
  ImageConfig,
  ImageContent,
  ListConfig,
  ListContent,
  MCQuestionConfig,
  MCQuestionContent,
  ParagraphConfig,
  ParagraphContent,
  QuoteConfig,
  QuoteContent,
  StarterBlockType,
  TabsConfig,
  TabsContent,
  VideoConfig,
  VideoContent,
} from '@/types/blocks';

import { BLOCK_A11Y_REQUIREMENTS, BLOCK_COGNITIVE_WEIGHTS, BLOCK_XAPI_VERBS } from '@/types/blocks';

// =============================================================================
// HEROICON MAPPINGS
// =============================================================================

/**
 * Heroicon names for each block type.
 * @see https://heroicons.com/
 */
export const BLOCK_ICONS: Record<StarterBlockType, string> = {
  paragraph: 'Bars3BottomLeftIcon',
  image: 'PhotoIcon',
  video: 'PlayCircleIcon',
  quote: 'ChatBubbleBottomCenterTextIcon',
  list: 'ListBulletIcon',
  'mc-question': 'QuestionMarkCircleIcon',
  'fitb-question': 'PencilSquareIcon',
  accordion: 'ChevronDownIcon',
  tabs: 'RectangleGroupIcon',
  'flip-card': 'ArrowPathRoundedSquareIcon',
} as const;

// =============================================================================
// BLOCK DEFINITIONS
// =============================================================================

/**
 * Complete block definitions for all Starter 10 blocks.
 */
export const BLOCK_DEFINITIONS: Record<StarterBlockType, BlockDefinition> = {
  paragraph: {
    type: 'paragraph',
    category: 'text',
    interactivityLevel: 1,
    xapiVerbs: BLOCK_XAPI_VERBS.paragraph,
    label: 'Paragraph',
    description: 'Basic text content with markdown support',
    icon: BLOCK_ICONS.paragraph,
    cognitiveLoadWeight: BLOCK_COGNITIVE_WEIGHTS.paragraph,
    a11yRequirements: BLOCK_A11Y_REQUIREMENTS.paragraph,
    defaultDuration: 30,
  },
  image: {
    type: 'image',
    category: 'media',
    interactivityLevel: 1,
    xapiVerbs: BLOCK_XAPI_VERBS.image,
    label: 'Image',
    description: 'Single image with caption and alt text',
    icon: BLOCK_ICONS.image,
    cognitiveLoadWeight: BLOCK_COGNITIVE_WEIGHTS.image,
    a11yRequirements: BLOCK_A11Y_REQUIREMENTS.image,
    defaultDuration: 15,
  },
  video: {
    type: 'video',
    category: 'media',
    interactivityLevel: 2,
    xapiVerbs: BLOCK_XAPI_VERBS.video,
    label: 'Video',
    description: 'Video player with controls and captions',
    icon: BLOCK_ICONS.video,
    cognitiveLoadWeight: BLOCK_COGNITIVE_WEIGHTS.video,
    a11yRequirements: BLOCK_A11Y_REQUIREMENTS.video,
    defaultDuration: 120,
  },
  quote: {
    type: 'quote',
    category: 'text',
    interactivityLevel: 1,
    xapiVerbs: BLOCK_XAPI_VERBS.quote,
    label: 'Quote',
    description: 'Blockquote with attribution',
    icon: BLOCK_ICONS.quote,
    cognitiveLoadWeight: BLOCK_COGNITIVE_WEIGHTS.quote,
    a11yRequirements: BLOCK_A11Y_REQUIREMENTS.quote,
    defaultDuration: 20,
  },
  list: {
    type: 'list',
    category: 'text',
    interactivityLevel: 1,
    xapiVerbs: BLOCK_XAPI_VERBS.list,
    label: 'List',
    description: 'Bulleted, numbered, or checklist',
    icon: BLOCK_ICONS.list,
    cognitiveLoadWeight: BLOCK_COGNITIVE_WEIGHTS.list,
    a11yRequirements: BLOCK_A11Y_REQUIREMENTS.list,
    defaultDuration: 30,
  },
  'mc-question': {
    type: 'mc-question',
    category: 'assessment',
    interactivityLevel: 2,
    xapiVerbs: BLOCK_XAPI_VERBS['mc-question'],
    label: 'Multiple Choice',
    description: 'Multiple choice question with feedback',
    icon: BLOCK_ICONS['mc-question'],
    cognitiveLoadWeight: BLOCK_COGNITIVE_WEIGHTS['mc-question'],
    a11yRequirements: BLOCK_A11Y_REQUIREMENTS['mc-question'],
    defaultDuration: 60,
  },
  'fitb-question': {
    type: 'fitb-question',
    category: 'assessment',
    interactivityLevel: 2,
    xapiVerbs: BLOCK_XAPI_VERBS['fitb-question'],
    label: 'Fill in the Blank',
    description: 'Text with blanks for learner input',
    icon: BLOCK_ICONS['fitb-question'],
    cognitiveLoadWeight: BLOCK_COGNITIVE_WEIGHTS['fitb-question'],
    a11yRequirements: BLOCK_A11Y_REQUIREMENTS['fitb-question'],
    defaultDuration: 90,
  },
  accordion: {
    type: 'accordion',
    category: 'interactive',
    interactivityLevel: 2,
    xapiVerbs: BLOCK_XAPI_VERBS.accordion,
    label: 'Accordion',
    description: 'Expandable content sections',
    icon: BLOCK_ICONS.accordion,
    cognitiveLoadWeight: BLOCK_COGNITIVE_WEIGHTS.accordion,
    a11yRequirements: BLOCK_A11Y_REQUIREMENTS.accordion,
    defaultDuration: 45,
  },
  tabs: {
    type: 'tabs',
    category: 'interactive',
    interactivityLevel: 2,
    xapiVerbs: BLOCK_XAPI_VERBS.tabs,
    label: 'Tabs',
    description: 'Tabbed content panels',
    icon: BLOCK_ICONS.tabs,
    cognitiveLoadWeight: BLOCK_COGNITIVE_WEIGHTS.tabs,
    a11yRequirements: BLOCK_A11Y_REQUIREMENTS.tabs,
    defaultDuration: 45,
  },
  'flip-card': {
    type: 'flip-card',
    category: 'interactive',
    interactivityLevel: 2,
    xapiVerbs: BLOCK_XAPI_VERBS['flip-card'],
    label: 'Flip Card',
    description: 'Click-to-reveal two-sided card',
    icon: BLOCK_ICONS['flip-card'],
    cognitiveLoadWeight: BLOCK_COGNITIVE_WEIGHTS['flip-card'],
    a11yRequirements: BLOCK_A11Y_REQUIREMENTS['flip-card'],
    defaultDuration: 30,
  },
} as const;

// =============================================================================
// DEFAULT CONTENT FACTORIES
// =============================================================================

/**
 * Factory functions that create default content for each block type.
 */
export const DEFAULT_CONTENT_FACTORIES: {
  [K in StarterBlockType]: () => BlockContentMap[K];
} = {
  paragraph: (): ParagraphContent => ({
    text: 'Enter your text here...',
  }),

  image: (): ImageContent => ({
    src: '',
    alt: 'Describe the image for accessibility',
    caption: '',
  }),

  video: (): VideoContent => ({
    src: '',
    provider: 'upload',
    title: 'Video title',
    captions: [],
  }),

  quote: (): QuoteContent => ({
    text: 'Enter quote text...',
    attribution: '',
    source: '',
  }),

  list: (): ListContent => ({
    listType: 'bullet',
    items: [{ text: 'First item' }, { text: 'Second item' }, { text: 'Third item' }],
  }),

  'mc-question': (): MCQuestionContent => ({
    question: 'Enter your question here...',
    choices: [
      { id: 'choice-1', text: 'Option A', correct: true },
      { id: 'choice-2', text: 'Option B', correct: false },
      { id: 'choice-3', text: 'Option C', correct: false },
      { id: 'choice-4', text: 'Option D', correct: false },
    ],
    multipleAnswer: false,
    feedback: {
      correct: 'Correct! Well done.',
      incorrect: 'Not quite. Try again.',
    },
  }),

  'fitb-question': (): FITBQuestionContent => ({
    template: 'The capital of France is {{capital}}.',
    blanks: [
      {
        id: 'capital',
        acceptedAnswers: ['Paris', 'paris'],
        placeholder: 'Enter city name',
        hint: 'Think about the Eiffel Tower...',
      },
    ],
    feedback: {
      correct: 'Correct! Paris is the capital of France.',
      incorrect: 'Not quite. The capital of France is Paris.',
    },
  }),

  accordion: (): AccordionContent => ({
    panels: [
      {
        id: 'panel-1',
        title: 'Section 1',
        content: 'Content for section 1...',
        defaultExpanded: true,
      },
      {
        id: 'panel-2',
        title: 'Section 2',
        content: 'Content for section 2...',
      },
      {
        id: 'panel-3',
        title: 'Section 3',
        content: 'Content for section 3...',
      },
    ],
  }),

  tabs: (): TabsContent => ({
    tabs: [
      { id: 'tab-1', label: 'Tab 1', content: 'Content for tab 1...' },
      { id: 'tab-2', label: 'Tab 2', content: 'Content for tab 2...' },
      { id: 'tab-3', label: 'Tab 3', content: 'Content for tab 3...' },
    ],
    defaultTabId: 'tab-1',
  }),

  'flip-card': (): FlipCardContent => ({
    front: {
      title: 'Front',
      content: 'Click to reveal the answer...',
    },
    back: {
      title: 'Back',
      content: 'Here is the answer!',
    },
  }),
};

// =============================================================================
// DEFAULT CONFIG FACTORIES
// =============================================================================

/**
 * Factory functions that create default config for each block type.
 */
export const DEFAULT_CONFIG_FACTORIES: {
  [K in StarterBlockType]: () => BlockConfigMap[K];
} = {
  paragraph: (): ParagraphConfig => ({
    alignment: 'left',
    size: 'normal',
    enableTTS: false,
    enableDyslexiaFont: false,
  }),

  image: (): ImageConfig => ({
    sizing: 'contain',
    borderRadius: 'medium',
    enableZoom: true,
    captionPosition: 'below',
    lazyLoad: true,
  }),

  video: (): VideoConfig => ({
    autoplay: false,
    loop: false,
    controls: true,
    muted: false,
    playbackSpeeds: [0.5, 0.75, 1, 1.25, 1.5, 2],
    required: false,
    requiredWatchPercentage: 80,
  }),

  quote: (): QuoteConfig => ({
    variant: 'default',
    showQuoteMarks: true,
    attributionPosition: 'below',
  }),

  list: (): ListConfig => ({
    markerStyle: 'disc',
    spacing: 'normal',
    animate: false,
    interactive: false,
  }),

  'mc-question': (): MCQuestionConfig => ({
    shuffleChoices: false,
    maxAttempts: 3,
    showCorrectAnswer: true,
    points: 10,
    partialCredit: false,
    timeLimit: 0,
    immediateFeedback: true,
  }),

  'fitb-question': (): FITBQuestionConfig => ({
    caseSensitive: false,
    trimWhitespace: true,
    maxAttempts: 3,
    showCorrectAnswers: true,
    points: 10,
    pointsPerBlank: 0,
    showHints: true,
    timeLimit: 0,
  }),

  accordion: (): AccordionConfig => ({
    allowMultiple: false,
    variant: 'default',
    iconPosition: 'right',
    trackInteractions: true,
  }),

  tabs: (): TabsConfig => ({
    orientation: 'horizontal',
    variant: 'default',
    alignment: 'start',
    trackInteractions: true,
  }),

  'flip-card': (): FlipCardConfig => ({
    flipDirection: 'horizontal',
    flipTrigger: 'click',
    aspectRatio: '4:3',
    animationDuration: 600,
    trackInteractions: true,
  }),
};

// =============================================================================
// REGISTRY CLASS
// =============================================================================

/**
 * Block Registry - Central access point for block metadata and factories.
 */
export class BlockRegistry {
  private static instance: BlockRegistry;

  private constructor() {}

  /**
   * Get singleton instance of BlockRegistry.
   */
  static getInstance(): BlockRegistry {
    if (!BlockRegistry.instance) {
      BlockRegistry.instance = new BlockRegistry();
    }
    return BlockRegistry.instance;
  }

  /**
   * Get block definition by type.
   */
  getDefinition(type: StarterBlockType): BlockDefinition {
    return BLOCK_DEFINITIONS[type];
  }

  /**
   * Get all block definitions.
   */
  getAllDefinitions(): BlockDefinition[] {
    return Object.values(BLOCK_DEFINITIONS);
  }

  /**
   * Get block definitions filtered by category.
   */
  getByCategory(category: BlockDefinition['category']): BlockDefinition[] {
    return this.getAllDefinitions().filter((def) => def.category === category);
  }

  /**
   * Get block definitions filtered by interactivity level.
   */
  getByInteractivityLevel(level: 1 | 2 | 3 | 4): BlockDefinition[] {
    return this.getAllDefinitions().filter((def) => def.interactivityLevel === level);
  }

  /**
   * Get default content for a block type.
   */
  getDefaultContent<T extends StarterBlockType>(type: T): BlockContentMap[T] {
    return DEFAULT_CONTENT_FACTORIES[type]();
  }

  /**
   * Get default config for a block type.
   */
  getDefaultConfig<T extends StarterBlockType>(type: T): BlockConfigMap[T] {
    return DEFAULT_CONFIG_FACTORIES[type]();
  }

  /**
   * Create a new block instance with defaults.
   */
  createBlock<T extends StarterBlockType>(
    type: T,
    overrides?: {
      content?: Partial<BlockContentMap[T]>;
      config?: Partial<BlockConfigMap[T]>;
    },
  ): Omit<BlockInstance, 'id' | 'order'> {
    const defaultContent = this.getDefaultContent(type);
    const defaultConfig = this.getDefaultConfig(type);

    return {
      type,
      content: {
        ...defaultContent,
        ...(overrides?.content ?? {}),
      },
      config: {
        ...defaultConfig,
        ...(overrides?.config ?? {}),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Get the icon name for a block type.
   */
  getIcon(type: StarterBlockType): string {
    return BLOCK_ICONS[type];
  }

  /**
   * Get cognitive load weight for a block type.
   */
  getCognitiveWeight(type: StarterBlockType): number {
    return BLOCK_COGNITIVE_WEIGHTS[type];
  }

  /**
   * Calculate total cognitive load for a list of blocks.
   */
  calculateTotalCognitiveLoad(blocks: BlockInstance[]): number {
    return blocks.reduce((total, block) => {
      return total + this.getCognitiveWeight(block.type);
    }, 0);
  }

  /**
   * Get estimated duration for a block type.
   */
  getEstimatedDuration(type: StarterBlockType): number {
    return BLOCK_DEFINITIONS[type].defaultDuration;
  }

  /**
   * Calculate total estimated duration for a list of blocks (in seconds).
   */
  calculateTotalDuration(blocks: BlockInstance[]): number {
    return blocks.reduce((total, block) => {
      return total + this.getEstimatedDuration(block.type);
    }, 0);
  }

  /**
   * Check if a block type is an assessment.
   */
  isAssessment(type: StarterBlockType): boolean {
    return BLOCK_DEFINITIONS[type].category === 'assessment';
  }

  /**
   * Get all assessment block types.
   */
  getAssessmentTypes(): StarterBlockType[] {
    return (Object.keys(BLOCK_DEFINITIONS) as StarterBlockType[]).filter((type) =>
      this.isAssessment(type),
    );
  }

  /**
   * Validate that block content meets minimum requirements.
   */
  validateContent(type: StarterBlockType, content: unknown): boolean {
    if (!content || typeof content !== 'object') {
      return false;
    }

    switch (type) {
      case 'paragraph':
        return 'text' in content;
      case 'image':
        return 'src' in content && 'alt' in content;
      case 'video':
        return 'src' in content && 'provider' in content && 'title' in content;
      case 'quote':
        return 'text' in content;
      case 'list':
        return 'listType' in content && 'items' in content;
      case 'mc-question':
        return 'question' in content && 'choices' in content;
      case 'fitb-question':
        return 'template' in content && 'blanks' in content;
      case 'accordion':
        return 'panels' in content;
      case 'tabs':
        return 'tabs' in content;
      case 'flip-card':
        return 'front' in content && 'back' in content;
      default:
        return false;
    }
  }
}

/**
 * Singleton instance export for convenience.
 */
export const blockRegistry = BlockRegistry.getInstance();

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Generate a unique block ID.
 */
export function generateBlockId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Clone a block with a new ID.
 */
export function cloneBlock(block: BlockInstance): BlockInstance {
  return {
    ...block,
    id: generateBlockId(),
    content: JSON.parse(JSON.stringify(block.content)),
    config: JSON.parse(JSON.stringify(block.config)),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Get sorted block definitions for palette display.
 */
export function getSortedBlocksForPalette(): BlockDefinition[] {
  const order: StarterBlockType[] = [
    'paragraph',
    'image',
    'video',
    'quote',
    'list',
    'mc-question',
    'fitb-question',
    'accordion',
    'tabs',
    'flip-card',
  ];

  return order.map((type) => BLOCK_DEFINITIONS[type]);
}
