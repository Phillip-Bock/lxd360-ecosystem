// =============================================================================
// TYPES
// =============================================================================

export type InspirePhase =
  | 'ignite' // Capture attention
  | 'navigate' // Provide roadmap
  | 'scaffold' // Build foundation
  | 'practice' // Active learning
  | 'integrate' // Connect concepts
  | 'reflect' // Metacognition
  | 'extend'; // Transfer learning

export type CognitiveLoadLevel = 'low' | 'medium' | 'high';

export interface ContentBlockDefinition {
  id: string;
  name: string;
  category: BlockCategory;
  description: string;
  icon: string;
  cognitiveLoad: CognitiveLoadLevel;
  suggestedPhases: InspirePhase[];
  estimatedTime: number; // seconds to complete/view
  accessibilityScore: number; // 0-100
  isPremium?: boolean;
  isNew?: boolean;
  keywords: string[];
}

export type BlockCategory =
  | 'text'
  | 'images'
  | 'video'
  | 'audio'
  | 'interactive'
  | 'assessment'
  | 'data'
  | 'layout'
  | 'media'
  | 'social';

export interface BlockCategoryInfo {
  id: BlockCategory;
  name: string;
  icon: string;
  color: string;
  description: string;
}

// =============================================================================
// CATEGORY DEFINITIONS
// =============================================================================

export const BLOCK_CATEGORIES: BlockCategoryInfo[] = [
  {
    id: 'text',
    name: 'Text',
    icon: 'Type',
    color: '#3b82f6',
    description: 'Text-based content blocks',
  },
  {
    id: 'images',
    name: 'Images',
    icon: 'Image',
    color: '#22c55e',
    description: 'Image and visual content',
  },
  {
    id: 'video',
    name: 'Video',
    icon: 'Video',
    color: '#ef4444',
    description: 'Video and motion content',
  },
  {
    id: 'audio',
    name: 'Audio',
    icon: 'Volume2',
    color: '#a855f7',
    description: 'Audio and podcast content',
  },
  {
    id: 'interactive',
    name: 'Interactive',
    icon: 'MousePointer',
    color: '#f59e0b',
    description: 'Interactive learning elements',
  },
  {
    id: 'assessment',
    name: 'Assessment',
    icon: 'CheckCircle',
    color: '#06b6d4',
    description: 'Quiz and assessment blocks',
  },
  {
    id: 'data',
    name: 'Data',
    icon: 'BarChart',
    color: '#84cc16',
    description: 'Charts, tables, and data visualization',
  },
  {
    id: 'layout',
    name: 'Layout',
    icon: 'Layout',
    color: '#8b5cf6',
    description: 'Layout and structure blocks',
  },
  {
    id: 'media',
    name: 'Media',
    icon: 'Cube',
    color: '#ec4899',
    description: '3D, AR, VR and immersive media',
  },
  {
    id: 'social',
    name: 'Social',
    icon: 'Users',
    color: '#14b8a6',
    description: 'Social and collaborative elements',
  },
];

// =============================================================================
// TEXT BLOCKS (12)
// =============================================================================

export const TEXT_BLOCKS: ContentBlockDefinition[] = [
  {
    id: 'paragraph',
    name: 'Paragraph',
    category: 'text',
    description: 'Rich text paragraph with formatting',
    icon: 'Type',
    cognitiveLoad: 'low',
    suggestedPhases: ['scaffold', 'navigate'],
    estimatedTime: 30,
    accessibilityScore: 95,
    keywords: ['text', 'paragraph', 'content', 'body'],
  },
  {
    id: 'heading-1',
    name: 'Heading 1',
    category: 'text',
    description: 'Large section heading',
    icon: 'Heading1',
    cognitiveLoad: 'low',
    suggestedPhases: ['ignite', 'navigate'],
    estimatedTime: 5,
    accessibilityScore: 100,
    keywords: ['heading', 'title', 'h1', 'header'],
  },
  {
    id: 'heading-2',
    name: 'Heading 2',
    category: 'text',
    description: 'Subsection heading',
    icon: 'Heading2',
    cognitiveLoad: 'low',
    suggestedPhases: ['scaffold', 'navigate'],
    estimatedTime: 5,
    accessibilityScore: 100,
    keywords: ['heading', 'subtitle', 'h2', 'subheader'],
  },
  {
    id: 'heading-3',
    name: 'Heading 3',
    category: 'text',
    description: 'Tertiary heading',
    icon: 'Heading3',
    cognitiveLoad: 'low',
    suggestedPhases: ['scaffold'],
    estimatedTime: 5,
    accessibilityScore: 100,
    keywords: ['heading', 'h3', 'subsubheader'],
  },
  {
    id: 'heading-4',
    name: 'Heading 4',
    category: 'text',
    description: 'Minor section heading',
    icon: 'Heading4',
    cognitiveLoad: 'low',
    suggestedPhases: ['scaffold'],
    estimatedTime: 5,
    accessibilityScore: 100,
    keywords: ['heading', 'h4'],
  },
  {
    id: 'heading-5',
    name: 'Heading 5',
    category: 'text',
    description: 'Small heading',
    icon: 'Heading5',
    cognitiveLoad: 'low',
    suggestedPhases: ['scaffold'],
    estimatedTime: 5,
    accessibilityScore: 100,
    keywords: ['heading', 'h5'],
  },
  {
    id: 'heading-6',
    name: 'Heading 6',
    category: 'text',
    description: 'Smallest heading',
    icon: 'Heading6',
    cognitiveLoad: 'low',
    suggestedPhases: ['scaffold'],
    estimatedTime: 5,
    accessibilityScore: 100,
    keywords: ['heading', 'h6'],
  },
  {
    id: 'quote',
    name: 'Quote',
    category: 'text',
    description: 'Block quote with attribution',
    icon: 'Quote',
    cognitiveLoad: 'low',
    suggestedPhases: ['ignite', 'reflect'],
    estimatedTime: 15,
    accessibilityScore: 95,
    keywords: ['quote', 'citation', 'blockquote'],
  },
  {
    id: 'callout',
    name: 'Callout',
    category: 'text',
    description: 'Highlighted callout box',
    icon: 'AlertCircle',
    cognitiveLoad: 'low',
    suggestedPhases: ['scaffold', 'navigate'],
    estimatedTime: 20,
    accessibilityScore: 90,
    keywords: ['callout', 'alert', 'highlight', 'info'],
  },
  {
    id: 'code',
    name: 'Code',
    category: 'text',
    description: 'Syntax-highlighted code block',
    icon: 'Code2',
    cognitiveLoad: 'medium',
    suggestedPhases: ['scaffold', 'practice'],
    estimatedTime: 60,
    accessibilityScore: 85,
    keywords: ['code', 'programming', 'syntax'],
  },
  {
    id: 'note',
    name: 'Note',
    category: 'text',
    description: 'Side note or annotation',
    icon: 'StickyNote',
    cognitiveLoad: 'low',
    suggestedPhases: ['scaffold'],
    estimatedTime: 15,
    accessibilityScore: 90,
    keywords: ['note', 'annotation', 'aside'],
  },
  {
    id: 'tip',
    name: 'Tip',
    category: 'text',
    description: 'Helpful tip or suggestion',
    icon: 'Lightbulb',
    cognitiveLoad: 'low',
    suggestedPhases: ['scaffold', 'practice'],
    estimatedTime: 15,
    accessibilityScore: 90,
    keywords: ['tip', 'hint', 'suggestion'],
  },
];

// =============================================================================
// IMAGE BLOCKS (8)
// =============================================================================

export const IMAGE_BLOCKS: ContentBlockDefinition[] = [
  {
    id: 'image-single',
    name: 'Single Image',
    category: 'images',
    description: 'Single image with caption',
    icon: 'Image',
    cognitiveLoad: 'low',
    suggestedPhases: ['ignite', 'scaffold'],
    estimatedTime: 10,
    accessibilityScore: 85,
    keywords: ['image', 'picture', 'photo'],
  },
  {
    id: 'image-gallery',
    name: 'Gallery',
    category: 'images',
    description: 'Multiple images in a grid',
    icon: 'LayoutGrid',
    cognitiveLoad: 'medium',
    suggestedPhases: ['scaffold', 'integrate'],
    estimatedTime: 45,
    accessibilityScore: 80,
    keywords: ['gallery', 'images', 'grid'],
  },
  {
    id: 'image-carousel',
    name: 'Carousel',
    category: 'images',
    description: 'Swipeable image carousel',
    icon: 'GalleryHorizontal',
    cognitiveLoad: 'medium',
    suggestedPhases: ['scaffold'],
    estimatedTime: 60,
    accessibilityScore: 75,
    keywords: ['carousel', 'slider', 'slideshow'],
  },
  {
    id: 'image-comparison',
    name: 'Comparison',
    category: 'images',
    description: 'Side-by-side image comparison',
    icon: 'SplitSquareHorizontal',
    cognitiveLoad: 'medium',
    suggestedPhases: ['scaffold', 'integrate'],
    estimatedTime: 30,
    accessibilityScore: 80,
    keywords: ['comparison', 'before', 'after', 'compare'],
  },
  {
    id: 'image-annotated',
    name: 'Annotated',
    category: 'images',
    description: 'Image with annotations',
    icon: 'ImagePlus',
    cognitiveLoad: 'medium',
    suggestedPhases: ['scaffold'],
    estimatedTime: 45,
    accessibilityScore: 75,
    keywords: ['annotated', 'labeled', 'annotations'],
  },
  {
    id: 'image-hotspot',
    name: 'Hotspot',
    category: 'images',
    description: 'Interactive hotspot image',
    icon: 'Crosshair',
    cognitiveLoad: 'high',
    suggestedPhases: ['practice', 'integrate'],
    estimatedTime: 90,
    accessibilityScore: 70,
    keywords: ['hotspot', 'interactive', 'clickable'],
  },
  {
    id: 'image-before-after',
    name: 'Before/After',
    category: 'images',
    description: 'Before/after slider comparison',
    icon: 'ArrowLeftRight',
    cognitiveLoad: 'medium',
    suggestedPhases: ['scaffold', 'integrate'],
    estimatedTime: 30,
    accessibilityScore: 75,
    keywords: ['before', 'after', 'slider', 'compare'],
  },
  {
    id: 'image-360',
    name: '360° View',
    category: 'images',
    description: '360-degree panoramic image',
    icon: 'Rotate3D',
    cognitiveLoad: 'high',
    suggestedPhases: ['scaffold', 'extend'],
    estimatedTime: 120,
    accessibilityScore: 60,
    isNew: true,
    keywords: ['360', 'panorama', 'panoramic', 'vr'],
  },
];

// =============================================================================
// VIDEO BLOCKS (6)
// =============================================================================

export const VIDEO_BLOCKS: ContentBlockDefinition[] = [
  {
    id: 'video-embed',
    name: 'Video Embed',
    category: 'video',
    description: 'Embed video from URL',
    icon: 'Video',
    cognitiveLoad: 'medium',
    suggestedPhases: ['ignite', 'scaffold'],
    estimatedTime: 180,
    accessibilityScore: 80,
    keywords: ['video', 'embed', 'youtube', 'vimeo'],
  },
  {
    id: 'video-upload',
    name: 'Video Upload',
    category: 'video',
    description: 'Upload custom video',
    icon: 'Upload',
    cognitiveLoad: 'medium',
    suggestedPhases: ['scaffold'],
    estimatedTime: 180,
    accessibilityScore: 75,
    keywords: ['video', 'upload', 'custom'],
  },
  {
    id: 'video-interactive',
    name: 'Interactive Video',
    category: 'video',
    description: 'Video with interactive elements',
    icon: 'PlaySquare',
    cognitiveLoad: 'high',
    suggestedPhases: ['practice', 'integrate'],
    estimatedTime: 300,
    accessibilityScore: 70,
    isPremium: true,
    keywords: ['interactive', 'video', 'clickable'],
  },
  {
    id: 'video-quiz',
    name: 'Video Quiz',
    category: 'video',
    description: 'Video with embedded quiz questions',
    icon: 'HelpCircle',
    cognitiveLoad: 'high',
    suggestedPhases: ['practice'],
    estimatedTime: 240,
    accessibilityScore: 70,
    keywords: ['video', 'quiz', 'assessment'],
  },
  {
    id: 'video-transcript',
    name: 'Video + Transcript',
    category: 'video',
    description: 'Video with synced transcript',
    icon: 'FileText',
    cognitiveLoad: 'medium',
    suggestedPhases: ['scaffold'],
    estimatedTime: 180,
    accessibilityScore: 95,
    keywords: ['video', 'transcript', 'captions'],
  },
  {
    id: 'video-branching',
    name: 'Branching Video',
    category: 'video',
    description: 'Choose-your-path video experience',
    icon: 'GitBranch',
    cognitiveLoad: 'high',
    suggestedPhases: ['practice', 'extend'],
    estimatedTime: 420,
    accessibilityScore: 65,
    isPremium: true,
    isNew: true,
    keywords: ['branching', 'interactive', 'choose'],
  },
];

// =============================================================================
// AUDIO BLOCKS (4)
// =============================================================================

export const AUDIO_BLOCKS: ContentBlockDefinition[] = [
  {
    id: 'audio-embed',
    name: 'Audio Embed',
    category: 'audio',
    description: 'Embed audio from URL',
    icon: 'Volume2',
    cognitiveLoad: 'low',
    suggestedPhases: ['scaffold'],
    estimatedTime: 120,
    accessibilityScore: 85,
    keywords: ['audio', 'sound', 'embed'],
  },
  {
    id: 'audio-upload',
    name: 'Audio Upload',
    category: 'audio',
    description: 'Upload custom audio file',
    icon: 'Upload',
    cognitiveLoad: 'low',
    suggestedPhases: ['scaffold'],
    estimatedTime: 120,
    accessibilityScore: 80,
    keywords: ['audio', 'upload', 'sound'],
  },
  {
    id: 'audio-podcast',
    name: 'Podcast',
    category: 'audio',
    description: 'Podcast player with chapters',
    icon: 'Podcast',
    cognitiveLoad: 'medium',
    suggestedPhases: ['scaffold', 'extend'],
    estimatedTime: 600,
    accessibilityScore: 80,
    keywords: ['podcast', 'audio', 'episode'],
  },
  {
    id: 'audio-transcript',
    name: 'Audio + Transcript',
    category: 'audio',
    description: 'Audio with synced transcript',
    icon: 'FileAudio',
    cognitiveLoad: 'medium',
    suggestedPhases: ['scaffold'],
    estimatedTime: 180,
    accessibilityScore: 95,
    keywords: ['audio', 'transcript', 'accessible'],
  },
];

// =============================================================================
// INTERACTIVE BLOCKS (15)
// =============================================================================

export const INTERACTIVE_BLOCKS: ContentBlockDefinition[] = [
  {
    id: 'drag-drop',
    name: 'Drag & Drop',
    category: 'interactive',
    description: 'Drag items to targets',
    icon: 'GripVertical',
    cognitiveLoad: 'high',
    suggestedPhases: ['practice'],
    estimatedTime: 90,
    accessibilityScore: 70,
    keywords: ['drag', 'drop', 'interactive'],
  },
  {
    id: 'flip-cards',
    name: 'Flip Cards',
    category: 'interactive',
    description: 'Cards that flip to reveal content',
    icon: 'Layers',
    cognitiveLoad: 'medium',
    suggestedPhases: ['practice', 'scaffold'],
    estimatedTime: 60,
    accessibilityScore: 80,
    keywords: ['flip', 'cards', 'flashcards'],
  },
  {
    id: 'tabs',
    name: 'Tabs',
    category: 'interactive',
    description: 'Tabbed content sections',
    icon: 'PanelTop',
    cognitiveLoad: 'low',
    suggestedPhases: ['scaffold'],
    estimatedTime: 45,
    accessibilityScore: 90,
    keywords: ['tabs', 'sections', 'organize'],
  },
  {
    id: 'accordion',
    name: 'Accordion',
    category: 'interactive',
    description: 'Expandable content sections',
    icon: 'ChevronsUpDown',
    cognitiveLoad: 'low',
    suggestedPhases: ['scaffold'],
    estimatedTime: 45,
    accessibilityScore: 90,
    keywords: ['accordion', 'expand', 'collapse'],
  },
  {
    id: 'timeline',
    name: 'Timeline',
    category: 'interactive',
    description: 'Interactive timeline of events',
    icon: 'Clock',
    cognitiveLoad: 'medium',
    suggestedPhases: ['navigate', 'scaffold'],
    estimatedTime: 90,
    accessibilityScore: 80,
    keywords: ['timeline', 'history', 'chronology'],
  },
  {
    id: 'process',
    name: 'Process',
    category: 'interactive',
    description: 'Step-by-step process visualization',
    icon: 'GitBranch',
    cognitiveLoad: 'medium',
    suggestedPhases: ['navigate', 'scaffold'],
    estimatedTime: 75,
    accessibilityScore: 85,
    keywords: ['process', 'steps', 'workflow'],
  },
  {
    id: 'reveal',
    name: 'Reveal',
    category: 'interactive',
    description: 'Click to reveal hidden content',
    icon: 'MousePointer2',
    cognitiveLoad: 'medium',
    suggestedPhases: ['practice', 'scaffold'],
    estimatedTime: 30,
    accessibilityScore: 80,
    keywords: ['reveal', 'click', 'hidden'],
  },
  {
    id: 'click-learn',
    name: 'Click & Learn',
    category: 'interactive',
    description: 'Clickable elements with details',
    icon: 'TouchpadOff',
    cognitiveLoad: 'medium',
    suggestedPhases: ['practice'],
    estimatedTime: 60,
    accessibilityScore: 75,
    keywords: ['click', 'learn', 'explore'],
  },
  {
    id: 'slider',
    name: 'Slider',
    category: 'interactive',
    description: 'Interactive slider control',
    icon: 'Sliders',
    cognitiveLoad: 'low',
    suggestedPhases: ['practice'],
    estimatedTime: 20,
    accessibilityScore: 80,
    keywords: ['slider', 'range', 'control'],
  },
  {
    id: 'sorting',
    name: 'Sorting',
    category: 'interactive',
    description: 'Sort items in correct order',
    icon: 'ArrowUpDown',
    cognitiveLoad: 'high',
    suggestedPhases: ['practice'],
    estimatedTime: 90,
    accessibilityScore: 70,
    keywords: ['sorting', 'order', 'arrange'],
  },
  {
    id: 'matching',
    name: 'Matching',
    category: 'interactive',
    description: 'Match related items',
    icon: 'Link',
    cognitiveLoad: 'high',
    suggestedPhases: ['practice'],
    estimatedTime: 90,
    accessibilityScore: 70,
    keywords: ['matching', 'pairs', 'connect'],
  },
  {
    id: 'categorizing',
    name: 'Categorizing',
    category: 'interactive',
    description: 'Sort items into categories',
    icon: 'FolderTree',
    cognitiveLoad: 'high',
    suggestedPhases: ['practice', 'integrate'],
    estimatedTime: 120,
    accessibilityScore: 70,
    keywords: ['categorize', 'sort', 'group'],
  },
  {
    id: 'labeling',
    name: 'Labeling',
    category: 'interactive',
    description: 'Label parts of an image',
    icon: 'Tag',
    cognitiveLoad: 'high',
    suggestedPhases: ['practice'],
    estimatedTime: 90,
    accessibilityScore: 70,
    keywords: ['label', 'identify', 'parts'],
  },
  {
    id: 'sequencing',
    name: 'Sequencing',
    category: 'interactive',
    description: 'Arrange items in sequence',
    icon: 'ListOrdered',
    cognitiveLoad: 'high',
    suggestedPhases: ['practice'],
    estimatedTime: 90,
    accessibilityScore: 70,
    keywords: ['sequence', 'order', 'steps'],
  },
  {
    id: 'exploration',
    name: 'Exploration',
    category: 'interactive',
    description: 'Free exploration learning space',
    icon: 'Compass',
    cognitiveLoad: 'high',
    suggestedPhases: ['extend', 'integrate'],
    estimatedTime: 180,
    accessibilityScore: 65,
    isNew: true,
    keywords: ['explore', 'discover', 'sandbox'],
  },
];

// =============================================================================
// ASSESSMENT BLOCKS (12)
// =============================================================================

export const ASSESSMENT_BLOCKS: ContentBlockDefinition[] = [
  {
    id: 'multiple-choice',
    name: 'Multiple Choice',
    category: 'assessment',
    description: 'Single answer question',
    icon: 'CircleDot',
    cognitiveLoad: 'medium',
    suggestedPhases: ['practice', 'reflect'],
    estimatedTime: 45,
    accessibilityScore: 95,
    keywords: ['quiz', 'question', 'multiple', 'choice'],
  },
  {
    id: 'true-false',
    name: 'True/False',
    category: 'assessment',
    description: 'True or false question',
    icon: 'ToggleLeft',
    cognitiveLoad: 'low',
    suggestedPhases: ['practice'],
    estimatedTime: 20,
    accessibilityScore: 95,
    keywords: ['true', 'false', 'quiz'],
  },
  {
    id: 'fill-blank',
    name: 'Fill in Blank',
    category: 'assessment',
    description: 'Complete the sentence',
    icon: 'TextCursorInput',
    cognitiveLoad: 'medium',
    suggestedPhases: ['practice'],
    estimatedTime: 45,
    accessibilityScore: 90,
    keywords: ['fill', 'blank', 'complete'],
  },
  {
    id: 'matching-quiz',
    name: 'Matching',
    category: 'assessment',
    description: 'Match pairs correctly',
    icon: 'Link2',
    cognitiveLoad: 'high',
    suggestedPhases: ['practice'],
    estimatedTime: 90,
    accessibilityScore: 75,
    keywords: ['matching', 'pairs', 'quiz'],
  },
  {
    id: 'ordering-quiz',
    name: 'Ordering',
    category: 'assessment',
    description: 'Put items in correct order',
    icon: 'ListOrdered',
    cognitiveLoad: 'high',
    suggestedPhases: ['practice'],
    estimatedTime: 90,
    accessibilityScore: 75,
    keywords: ['ordering', 'sequence', 'quiz'],
  },
  {
    id: 'hotspot-quiz',
    name: 'Hotspot',
    category: 'assessment',
    description: 'Click correct area on image',
    icon: 'Target',
    cognitiveLoad: 'high',
    suggestedPhases: ['practice'],
    estimatedTime: 60,
    accessibilityScore: 65,
    keywords: ['hotspot', 'click', 'image', 'quiz'],
  },
  {
    id: 'essay',
    name: 'Essay',
    category: 'assessment',
    description: 'Long-form text response',
    icon: 'FileText',
    cognitiveLoad: 'high',
    suggestedPhases: ['reflect', 'extend'],
    estimatedTime: 600,
    accessibilityScore: 90,
    keywords: ['essay', 'writing', 'response'],
  },
  {
    id: 'short-answer',
    name: 'Short Answer',
    category: 'assessment',
    description: 'Brief text response',
    icon: 'MessageSquare',
    cognitiveLoad: 'medium',
    suggestedPhases: ['practice', 'reflect'],
    estimatedTime: 120,
    accessibilityScore: 90,
    keywords: ['short', 'answer', 'text'],
  },
  {
    id: 'likert-scale',
    name: 'Likert Scale',
    category: 'assessment',
    description: 'Rating scale question',
    icon: 'ListChecks',
    cognitiveLoad: 'low',
    suggestedPhases: ['reflect'],
    estimatedTime: 15,
    accessibilityScore: 85,
    keywords: ['likert', 'scale', 'rating', 'survey'],
  },
  {
    id: 'matrix',
    name: 'Matrix',
    category: 'assessment',
    description: 'Grid-based questions',
    icon: 'Grid3X3',
    cognitiveLoad: 'high',
    suggestedPhases: ['reflect'],
    estimatedTime: 120,
    accessibilityScore: 70,
    keywords: ['matrix', 'grid', 'table', 'survey'],
  },
  {
    id: 'ranking',
    name: 'Ranking',
    category: 'assessment',
    description: 'Rank items by preference',
    icon: 'ArrowUp01',
    cognitiveLoad: 'high',
    suggestedPhases: ['reflect', 'practice'],
    estimatedTime: 60,
    accessibilityScore: 75,
    keywords: ['ranking', 'priority', 'order'],
  },
  {
    id: 'scenario',
    name: 'Scenario',
    category: 'assessment',
    description: 'Branching scenario question',
    icon: 'GitFork',
    cognitiveLoad: 'high',
    suggestedPhases: ['practice', 'extend'],
    estimatedTime: 300,
    accessibilityScore: 70,
    isPremium: true,
    keywords: ['scenario', 'branching', 'decision'],
  },
];

// =============================================================================
// DATA BLOCKS (6)
// =============================================================================

export const DATA_BLOCKS: ContentBlockDefinition[] = [
  {
    id: 'chart',
    name: 'Chart',
    category: 'data',
    description: 'Bar, line, or pie chart',
    icon: 'BarChart3',
    cognitiveLoad: 'medium',
    suggestedPhases: ['scaffold', 'integrate'],
    estimatedTime: 30,
    accessibilityScore: 75,
    keywords: ['chart', 'graph', 'bar', 'line', 'pie'],
  },
  {
    id: 'table',
    name: 'Table',
    category: 'data',
    description: 'Data table with sorting',
    icon: 'Table',
    cognitiveLoad: 'medium',
    suggestedPhases: ['scaffold'],
    estimatedTime: 45,
    accessibilityScore: 85,
    keywords: ['table', 'data', 'grid'],
  },
  {
    id: 'infographic',
    name: 'Infographic',
    category: 'data',
    description: 'Visual data representation',
    icon: 'BarChartBig',
    cognitiveLoad: 'medium',
    suggestedPhases: ['scaffold', 'integrate'],
    estimatedTime: 60,
    accessibilityScore: 70,
    keywords: ['infographic', 'visual', 'data'],
  },
  {
    id: 'stats-counter',
    name: 'Stats Counter',
    category: 'data',
    description: 'Animated number counters',
    icon: 'TrendingUp',
    cognitiveLoad: 'low',
    suggestedPhases: ['ignite', 'integrate'],
    estimatedTime: 15,
    accessibilityScore: 85,
    keywords: ['stats', 'counter', 'numbers', 'animate'],
  },
  {
    id: 'progress',
    name: 'Progress',
    category: 'data',
    description: 'Progress bar or indicator',
    icon: 'Loader',
    cognitiveLoad: 'low',
    suggestedPhases: ['navigate', 'reflect'],
    estimatedTime: 10,
    accessibilityScore: 90,
    keywords: ['progress', 'bar', 'completion'],
  },
  {
    id: 'comparison-data',
    name: 'Comparison',
    category: 'data',
    description: 'Compare data points',
    icon: 'Scale',
    cognitiveLoad: 'medium',
    suggestedPhases: ['scaffold', 'integrate'],
    estimatedTime: 45,
    accessibilityScore: 80,
    keywords: ['comparison', 'compare', 'versus'],
  },
];

// =============================================================================
// LAYOUT BLOCKS (8)
// =============================================================================

export const LAYOUT_BLOCKS: ContentBlockDefinition[] = [
  {
    id: 'columns',
    name: 'Columns',
    category: 'layout',
    description: 'Multi-column layout',
    icon: 'Columns',
    cognitiveLoad: 'low',
    suggestedPhases: ['scaffold'],
    estimatedTime: 0,
    accessibilityScore: 90,
    keywords: ['columns', 'layout', 'side'],
  },
  {
    id: 'cards',
    name: 'Cards',
    category: 'layout',
    description: 'Content cards layout',
    icon: 'LayoutPanelTop',
    cognitiveLoad: 'low',
    suggestedPhases: ['scaffold'],
    estimatedTime: 0,
    accessibilityScore: 90,
    keywords: ['cards', 'layout', 'grid'],
  },
  {
    id: 'grid',
    name: 'Grid',
    category: 'layout',
    description: 'Flexible grid layout',
    icon: 'LayoutGrid',
    cognitiveLoad: 'low',
    suggestedPhases: ['scaffold'],
    estimatedTime: 0,
    accessibilityScore: 90,
    keywords: ['grid', 'layout', 'flexible'],
  },
  {
    id: 'masonry',
    name: 'Masonry',
    category: 'layout',
    description: 'Pinterest-style layout',
    icon: 'LayoutDashboard',
    cognitiveLoad: 'low',
    suggestedPhases: ['scaffold'],
    estimatedTime: 0,
    accessibilityScore: 80,
    keywords: ['masonry', 'pinterest', 'layout'],
  },
  {
    id: 'feature-box',
    name: 'Feature Box',
    category: 'layout',
    description: 'Highlighted feature section',
    icon: 'Star',
    cognitiveLoad: 'low',
    suggestedPhases: ['ignite', 'scaffold'],
    estimatedTime: 0,
    accessibilityScore: 90,
    keywords: ['feature', 'highlight', 'callout'],
  },
  {
    id: 'hero',
    name: 'Hero',
    category: 'layout',
    description: 'Large hero section',
    icon: 'ImageUp',
    cognitiveLoad: 'low',
    suggestedPhases: ['ignite'],
    estimatedTime: 0,
    accessibilityScore: 85,
    keywords: ['hero', 'banner', 'header'],
  },
  {
    id: 'section',
    name: 'Section',
    category: 'layout',
    description: 'Content section container',
    icon: 'Square',
    cognitiveLoad: 'low',
    suggestedPhases: ['scaffold'],
    estimatedTime: 0,
    accessibilityScore: 95,
    keywords: ['section', 'container', 'group'],
  },
  {
    id: 'divider',
    name: 'Divider',
    category: 'layout',
    description: 'Visual section divider',
    icon: 'Minus',
    cognitiveLoad: 'low',
    suggestedPhases: ['scaffold'],
    estimatedTime: 0,
    accessibilityScore: 100,
    keywords: ['divider', 'separator', 'line'],
  },
];

// =============================================================================
// MEDIA BLOCKS (6)
// =============================================================================

export const MEDIA_BLOCKS: ContentBlockDefinition[] = [
  {
    id: '3d-model',
    name: '3D Model',
    category: 'media',
    description: 'Interactive 3D model viewer',
    icon: 'Box',
    cognitiveLoad: 'high',
    suggestedPhases: ['scaffold', 'extend'],
    estimatedTime: 180,
    accessibilityScore: 50,
    isPremium: true,
    keywords: ['3d', 'model', 'viewer', 'interactive'],
  },
  {
    id: 'animation',
    name: 'Animation',
    category: 'media',
    description: 'Animated illustration',
    icon: 'Film',
    cognitiveLoad: 'medium',
    suggestedPhases: ['ignite', 'scaffold'],
    estimatedTime: 30,
    accessibilityScore: 70,
    keywords: ['animation', 'motion', 'lottie'],
  },
  {
    id: 'ar-experience',
    name: 'AR Experience',
    category: 'media',
    description: 'Augmented reality content',
    icon: 'Smartphone',
    cognitiveLoad: 'high',
    suggestedPhases: ['extend', 'practice'],
    estimatedTime: 300,
    accessibilityScore: 40,
    isPremium: true,
    isNew: true,
    keywords: ['ar', 'augmented', 'reality'],
  },
  {
    id: 'vr-scene',
    name: 'VR Scene',
    category: 'media',
    description: 'Virtual reality environment',
    icon: 'Headset',
    cognitiveLoad: 'high',
    suggestedPhases: ['extend'],
    estimatedTime: 600,
    accessibilityScore: 35,
    isPremium: true,
    isNew: true,
    keywords: ['vr', 'virtual', 'reality', 'immersive'],
  },
  {
    id: 'simulation',
    name: 'Simulation',
    category: 'media',
    description: 'Interactive simulation',
    icon: 'Cog',
    cognitiveLoad: 'high',
    suggestedPhases: ['practice', 'extend'],
    estimatedTime: 420,
    accessibilityScore: 60,
    isPremium: true,
    keywords: ['simulation', 'interactive', 'hands-on'],
  },
  {
    id: 'game',
    name: 'Game',
    category: 'media',
    description: 'Learning game or gamification',
    icon: 'Gamepad2',
    cognitiveLoad: 'high',
    suggestedPhases: ['practice', 'extend'],
    estimatedTime: 300,
    accessibilityScore: 55,
    isPremium: true,
    keywords: ['game', 'gamification', 'play'],
  },
];

// =============================================================================
// SOCIAL BLOCKS (6)
// =============================================================================

export const SOCIAL_BLOCKS: ContentBlockDefinition[] = [
  {
    id: 'discussion',
    name: 'Discussion',
    category: 'social',
    description: 'Discussion forum section',
    icon: 'MessageSquare',
    cognitiveLoad: 'medium',
    suggestedPhases: ['reflect', 'integrate'],
    estimatedTime: 300,
    accessibilityScore: 90,
    keywords: ['discussion', 'forum', 'comments'],
  },
  {
    id: 'comment',
    name: 'Comment',
    category: 'social',
    description: 'Comment section',
    icon: 'MessageCircle',
    cognitiveLoad: 'low',
    suggestedPhases: ['reflect'],
    estimatedTime: 60,
    accessibilityScore: 90,
    keywords: ['comment', 'feedback', 'note'],
  },
  {
    id: 'reaction',
    name: 'Reaction',
    category: 'social',
    description: 'Emoji reaction collector',
    icon: 'Smile',
    cognitiveLoad: 'low',
    suggestedPhases: ['reflect'],
    estimatedTime: 5,
    accessibilityScore: 85,
    keywords: ['reaction', 'emoji', 'feedback'],
  },
  {
    id: 'poll',
    name: 'Poll',
    category: 'social',
    description: 'Quick poll or vote',
    icon: 'BarChart2',
    cognitiveLoad: 'low',
    suggestedPhases: ['ignite', 'reflect'],
    estimatedTime: 15,
    accessibilityScore: 90,
    keywords: ['poll', 'vote', 'survey'],
  },
  {
    id: 'peer-review',
    name: 'Peer Review',
    category: 'social',
    description: 'Peer review assignment',
    icon: 'Users2',
    cognitiveLoad: 'high',
    suggestedPhases: ['reflect', 'integrate'],
    estimatedTime: 600,
    accessibilityScore: 85,
    keywords: ['peer', 'review', 'feedback'],
  },
  {
    id: 'collaboration',
    name: 'Collaboration',
    category: 'social',
    description: 'Collaborative workspace',
    icon: 'UserPlus',
    cognitiveLoad: 'high',
    suggestedPhases: ['integrate', 'extend'],
    estimatedTime: 900,
    accessibilityScore: 75,
    isNew: true,
    keywords: ['collaboration', 'team', 'group'],
  },
];

// =============================================================================
// ALL BLOCKS COMBINED
// =============================================================================

export const ALL_BLOCKS: ContentBlockDefinition[] = [
  ...TEXT_BLOCKS,
  ...IMAGE_BLOCKS,
  ...VIDEO_BLOCKS,
  ...AUDIO_BLOCKS,
  ...INTERACTIVE_BLOCKS,
  ...DATA_BLOCKS,
  ...LAYOUT_BLOCKS,
  ...MEDIA_BLOCKS,
  ...SOCIAL_BLOCKS,
  ...ASSESSMENT_BLOCKS,
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getBlocksByCategory(category: BlockCategory): ContentBlockDefinition[] {
  return ALL_BLOCKS.filter((block) => block.category === category);
}

export function getBlockById(id: string): ContentBlockDefinition | undefined {
  return ALL_BLOCKS.find((block) => block.id === id);
}

export function searchBlocks(query: string): ContentBlockDefinition[] {
  const lowerQuery = query.toLowerCase();
  return ALL_BLOCKS.filter(
    (block) =>
      block.name.toLowerCase().includes(lowerQuery) ||
      block.description.toLowerCase().includes(lowerQuery) ||
      block.keywords.some((keyword) => keyword.includes(lowerQuery)),
  );
}

export function getBlocksByPhase(phase: InspirePhase): ContentBlockDefinition[] {
  return ALL_BLOCKS.filter((block) => block.suggestedPhases.includes(phase));
}

export function getPremiumBlocks(): ContentBlockDefinition[] {
  return ALL_BLOCKS.filter((block) => block.isPremium);
}

export function getNewBlocks(): ContentBlockDefinition[] {
  return ALL_BLOCKS.filter((block) => block.isNew);
}

// Legacy export for backwards compatibility
export const contentBlocksData = ALL_BLOCKS.map((block) => ({
  id: block.id,
  name: block.name,
  category: block.category,
  icon: block.icon,
  description: block.description,
}));

export default ALL_BLOCKS;
