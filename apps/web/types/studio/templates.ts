// =============================================================================
// BASE TEMPLATE TYPES
// =============================================================================

/**
 * Template type
 */
export type TemplateType = 'lesson' | 'course' | 'slide' | 'block' | 'assessment';

/**
 * Template category
 */
export type TemplateCategory =
  | 'getting-started'
  | 'onboarding'
  | 'compliance'
  | 'product-training'
  | 'soft-skills'
  | 'technical'
  | 'sales'
  | 'customer-service'
  | 'leadership'
  | 'safety'
  | 'diversity'
  | 'wellness'
  | 'custom';

/**
 * Template difficulty level
 */
export type TemplateDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/**
 * Template license type
 */
export type TemplateLicense = 'free' | 'premium' | 'enterprise' | 'custom';

/**
 * Base template interface
 */
export interface Template {
  id: string;
  name: string;
  description: string;
  type: TemplateType;
  category: TemplateCategory;

  // Metadata
  version: string;
  author: TemplateAuthor;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;

  // Classification
  tags: string[];
  difficulty: TemplateDifficulty;
  estimatedDuration?: number; // minutes
  targetAudience?: string[];

  // Visuals
  thumbnail: string;
  previewImages?: string[];
  previewVideo?: string;
  colorScheme?: TemplateColorScheme;

  // Content
  structure: TemplateStructure;
  placeholders: TemplatePlaceholder[];
  defaultContent?: Record<string, unknown>;

  // Licensing
  license: TemplateLicense;
  isPremium: boolean;
  price?: number;

  // Stats
  usageCount: number;
  rating: number;
  reviewCount: number;
  featured: boolean;
}

/**
 * Template author
 */
export interface TemplateAuthor {
  id: string;
  name: string;
  avatar?: string;
  organization?: string;
  verified: boolean;
}

/**
 * Template color scheme
 */
export interface TemplateColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  mutedText: string;
}

/**
 * Template structure
 */
export interface TemplateStructure {
  type: TemplateType;
  sections?: TemplateSectionDefinition[];
  slides?: TemplateSlideDefinition[];
  blocks?: TemplateBlockDefinition[];
  lessons?: TemplateLessonReference[];
}

/**
 * Template section definition
 */
export interface TemplateSectionDefinition {
  id: string;
  name: string;
  description?: string;
  required: boolean;
  order: number;
  slidesMin?: number;
  slidesMax?: number;
  defaultSlides?: TemplateSlideDefinition[];
}

/**
 * Template slide definition
 */
export interface TemplateSlideDefinition {
  id: string;
  name: string;
  layout: string;
  required: boolean;
  order: number;
  blocks: TemplateBlockDefinition[];
  notes?: string;
}

/**
 * Template block definition
 */
export interface TemplateBlockDefinition {
  id: string;
  type: string;
  position: { x: number; y: number; width: number; height: number };
  required: boolean;
  placeholder?: TemplatePlaceholder;
  defaultContent?: Record<string, unknown>;
  constraints?: BlockConstraints;
}

/**
 * Block constraints
 */
export interface BlockConstraints {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  aspectRatio?: string;
  allowedTypes?: string[];
  maxCharacters?: number;
  required?: boolean;
}

/**
 * Template lesson reference (for course templates)
 */
export interface TemplateLessonReference {
  id: string;
  order: number;
  required: boolean;
  templateId?: string;
  placeholder?: TemplatePlaceholder;
}

/**
 * Template placeholder
 */
export interface TemplatePlaceholder {
  id: string;
  name: string;
  description: string;
  type: PlaceholderType;
  required: boolean;
  defaultValue?: string;
  validation?: PlaceholderValidation;
  hint?: string;
  examples?: string[];
}

/**
 * Placeholder type
 */
export type PlaceholderType =
  | 'text'
  | 'richText'
  | 'image'
  | 'video'
  | 'audio'
  | 'file'
  | 'url'
  | 'date'
  | 'number'
  | 'select'
  | 'multiSelect'
  | 'boolean'
  | 'color';

/**
 * Placeholder validation
 */
export interface PlaceholderValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  options?: string[];
  min?: number;
  max?: number;
  fileTypes?: string[];
  maxFileSize?: number;
}

// =============================================================================
// TEMPLATE INSTANCE TYPES
// =============================================================================

/**
 * Template instance (when a template is applied)
 */
export interface TemplateInstance {
  id: string;
  templateId: string;
  templateVersion: string;
  createdAt: string;
  createdBy: string;

  // Filled content
  content: Record<string, unknown>;
  placeholderValues: Record<string, unknown>;

  // Customizations
  customizations: TemplateCustomization[];
  colorOverrides?: Partial<TemplateColorScheme>;

  // Status
  status: 'draft' | 'in-progress' | 'complete';
  completionPercentage: number;
}

/**
 * Template customization
 */
export interface TemplateCustomization {
  targetId: string;
  targetType: 'section' | 'slide' | 'block';
  action: 'add' | 'remove' | 'modify' | 'reorder';
  changes: Record<string, unknown>;
}

// =============================================================================
// TEMPLATE GALLERY TYPES
// =============================================================================

/**
 * Template filter options
 */
export interface TemplateFilters {
  type?: TemplateType;
  category?: TemplateCategory[];
  difficulty?: TemplateDifficulty[];
  tags?: string[];
  license?: TemplateLicense[];
  featured?: boolean;
  minRating?: number;
  maxDuration?: number;
  search?: string;
}

/**
 * Template sort options
 */
export type TemplateSortOption = 'featured' | 'newest' | 'popular' | 'rating' | 'name' | 'duration';

/**
 * Template gallery state
 */
export interface TemplateGalleryState {
  templates: Template[];
  filters: TemplateFilters;
  sort: TemplateSortOption;
  page: number;
  pageSize: number;
  totalCount: number;
  loading: boolean;
}

/**
 * Template collection
 */
export interface TemplateCollection {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  templates: string[]; // Template IDs
  createdBy: string;
  isPublic: boolean;
  featured: boolean;
}

// =============================================================================
// TEMPLATE BUILDER TYPES
// =============================================================================

/**
 * Template builder state
 */
export interface TemplateBuilderState {
  template: Partial<Template>;
  isDirty: boolean;
  validationErrors: TemplateValidationError[];
  previewMode: boolean;
  selectedElement?: string;
}

/**
 * Template validation error
 */
export interface TemplateValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Template publish options
 */
export interface TemplatePublishOptions {
  visibility: 'private' | 'organization' | 'public';
  license: TemplateLicense;
  price?: number;
  allowDerivatives: boolean;
  requireAttribution: boolean;
  categories: TemplateCategory[];
  tags: string[];
}

// =============================================================================
// TEMPLATE PREVIEW TYPES
// =============================================================================

/**
 * Template preview state
 */
export interface TemplatePreviewState {
  template: Template;
  activeSlide: number;
  placeholderMode: boolean;
  showGuides: boolean;
  zoomLevel: number;
}

/**
 * Template preview interaction
 */
export interface TemplatePreviewInteraction {
  type: 'click' | 'hover';
  targetId: string;
  targetType: 'section' | 'slide' | 'block' | 'placeholder';
  position: { x: number; y: number };
}

// =============================================================================
// PRESET TEMPLATES
// =============================================================================

/**
 * Built-in template categories with icons and descriptions
 */
export const TEMPLATE_CATEGORY_INFO: Record<
  TemplateCategory,
  { label: string; description: string; icon: string }
> = {
  'getting-started': {
    label: 'Getting Started',
    description: 'Introduction and basics templates',
    icon: 'Rocket',
  },
  onboarding: {
    label: 'Onboarding',
    description: 'Employee onboarding and orientation',
    icon: 'UserPlus',
  },
  compliance: {
    label: 'Compliance',
    description: 'Regulatory and compliance training',
    icon: 'Shield',
  },
  'product-training': {
    label: 'Product Training',
    description: 'Product knowledge and features',
    icon: 'Package',
  },
  'soft-skills': {
    label: 'Soft Skills',
    description: 'Communication and interpersonal skills',
    icon: 'Users',
  },
  technical: {
    label: 'Technical',
    description: 'Technical and IT training',
    icon: 'Code',
  },
  sales: {
    label: 'Sales',
    description: 'Sales methodology and techniques',
    icon: 'TrendingUp',
  },
  'customer-service': {
    label: 'Customer Service',
    description: 'Customer support and satisfaction',
    icon: 'HeadphonesIcon',
  },
  leadership: {
    label: 'Leadership',
    description: 'Management and leadership development',
    icon: 'Crown',
  },
  safety: {
    label: 'Safety',
    description: 'Workplace safety and procedures',
    icon: 'HardHat',
  },
  diversity: {
    label: 'Diversity & Inclusion',
    description: 'DEI awareness and training',
    icon: 'Heart',
  },
  wellness: {
    label: 'Wellness',
    description: 'Health and wellness programs',
    icon: 'Activity',
  },
  custom: {
    label: 'Custom',
    description: 'Custom templates',
    icon: 'Sparkles',
  },
};

/**
 * Default color schemes
 */
export const DEFAULT_COLOR_SCHEMES: Record<string, TemplateColorScheme> = {
  professional: {
    primary: '#0072f5',
    secondary: '#7828c8',
    accent: '#f5a623',
    background: '#ffffff',
    surface: '#f4f4f5',
    text: '#18181b',
    mutedText: '#71717a',
  },
  modern: {
    primary: '#06b6d4',
    secondary: '#8b5cf6',
    accent: '#f43f5e',
    background: '#fafafa',
    surface: '#f4f4f5',
    text: '#09090b',
    mutedText: '#71717a',
  },
  dark: {
    primary: '#3b82f6',
    secondary: '#a855f7',
    accent: '#22c55e',
    background: '#09090b',
    surface: '#18181b',
    text: '#fafafa',
    mutedText: '#a1a1aa',
  },
  warm: {
    primary: '#ea580c',
    secondary: '#dc2626',
    accent: '#facc15',
    background: '#fffbeb',
    surface: '#fef3c7',
    text: '#451a03',
    mutedText: '#92400e',
  },
  nature: {
    primary: '#16a34a',
    secondary: '#059669',
    accent: '#84cc16',
    background: '#f0fdf4',
    surface: '#dcfce7',
    text: '#14532d',
    mutedText: '#166534',
  },
};

/**
 * Template layout presets
 */
export const LAYOUT_PRESETS = {
  titleSlide: {
    name: 'Title Slide',
    description: 'Full-screen title with optional subtitle',
    blocks: ['title', 'subtitle', 'background'],
  },
  contentWithImage: {
    name: 'Content + Image',
    description: 'Text content with accompanying image',
    blocks: ['heading', 'content', 'image'],
  },
  twoColumn: {
    name: 'Two Column',
    description: 'Side-by-side content layout',
    blocks: ['heading', 'leftColumn', 'rightColumn'],
  },
  bulletPoints: {
    name: 'Bullet Points',
    description: 'Key points with icons',
    blocks: ['heading', 'bulletList'],
  },
  videoPlayer: {
    name: 'Video Slide',
    description: 'Full-width video player',
    blocks: ['heading', 'video', 'caption'],
  },
  interactive: {
    name: 'Interactive',
    description: 'Interactive element focus',
    blocks: ['heading', 'instructions', 'interactiveArea'],
  },
  assessment: {
    name: 'Assessment',
    description: 'Quiz or assessment layout',
    blocks: ['question', 'options', 'feedback'],
  },
  summary: {
    name: 'Summary',
    description: 'Key takeaways layout',
    blocks: ['heading', 'keyPoints', 'nextSteps'],
  },
};
