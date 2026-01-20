import type { Timestamp } from 'firebase-admin/firestore';

// =============================================================================
// COMMON TYPES
// =============================================================================

/**
 * Base document fields present on all Firestore documents
 */
export interface FirestoreDocument {
  /** Document ID (auto-generated or custom) */
  id: string;
  /** Organization ID for multi-tenant isolation */
  organizationId: string;
  /** Creation timestamp */
  createdAt: Timestamp;
  /** Last update timestamp */
  updatedAt: Timestamp;
  /** User ID who created the document */
  createdBy: string;
  /** User ID who last updated the document */
  updatedBy: string;
}

/**
 * Content status for publishing workflow
 */
export type ContentStatus = 'draft' | 'review' | 'published' | 'archived';

/**
 * Difficulty levels for learning content
 */
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/**
 * INSPIRE Framework stages for pedagogical structure
 */
export type INSPIREStage =
  | 'ignite'
  | 'navigate'
  | 'scaffold'
  | 'practice'
  | 'integrate'
  | 'reflect'
  | 'extend';

/**
 * Cognitive load levels for content pacing
 */
export type CognitiveLoadLevel = 'low' | 'medium' | 'high';

/**
 * Content types for lessons and blocks
 */
export type ContentType =
  | 'video'
  | 'audio'
  | 'document'
  | 'text'
  | 'interactive'
  | 'scorm'
  | 'xapi'
  | 'simulation';

// =============================================================================
// COURSE TYPES
// =============================================================================

/**
 * Course document stored in Firestore
 */
export interface Course extends FirestoreDocument {
  /** Course title */
  title: string;
  /** URL-friendly slug */
  slug: string;
  /** Full description (supports markdown) */
  description: string;
  /** Short description for listings */
  shortDescription: string;
  /** Thumbnail image URL */
  thumbnailUrl: string;
  /** Cover image URL for course page */
  coverImageUrl?: string;
  /** Preview video URL */
  previewVideoUrl?: string;
  /** Total duration in minutes */
  durationMinutes: number;
  /** Difficulty level */
  difficulty: DifficultyLevel;
  /** Category ID reference */
  categoryId: string;
  /** Category name (denormalized) */
  categoryName: string;
  /** Subcategory ID reference */
  subcategoryId?: string;
  /** Tags for searchability */
  tags: string[];
  /** INSPIRE stages covered */
  inspireStages: INSPIREStage[];
  /** Target cognitive load */
  cognitiveLoadTarget: CognitiveLoadLevel;
  /** Primary instructor ID */
  instructorId: string;
  /** Instructor display name (denormalized) */
  instructorName: string;
  /** Co-instructor IDs */
  coInstructorIds: string[];
  /** Prerequisite course IDs */
  prerequisiteIds: string[];
  /** Publishing status */
  status: ContentStatus;
  /** Version number */
  version: string;
  /** Published timestamp */
  publishedAt?: Timestamp;
  /** Lesson count (denormalized) */
  lessonCount: number;
  /** Module count (denormalized) */
  moduleCount: number;
  /** Assessment count (denormalized) */
  assessmentCount: number;
  /** Average rating (1-5) */
  averageRating: number;
  /** Total reviews */
  reviewCount: number;
  /** Total enrollments */
  enrollmentCount: number;
  /** Completion rate (0-100) */
  completionRate: number;
  /** Language code (ISO 639-1) */
  language: string;
  /** Available caption languages */
  captionLanguages: string[];
  /** XP reward for completion */
  xpTotal: number;
  /** Certificate template ID */
  certificateTemplateId?: string;
  /** Course access type */
  accessType: 'free' | 'enrolled' | 'subscription' | 'purchased';
  /** Price in cents (if applicable) */
  priceInCents?: number;
  /** Sale price in cents */
  salePriceInCents?: number;
  /** Currency code */
  currency: string;
  /** Compliance requirement flag */
  isComplianceRequired: boolean;
  /** Compliance type identifier */
  complianceType?: string;
  /** Regulatory body */
  regulatoryBody?: string;
  /** CEU credits offered */
  ceuCredits?: number;
  /** Recertification period in days */
  recertificationDays?: number;
}

/**
 * Input for creating a new course
 */
export interface CreateCourseInput {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnailUrl?: string;
  difficulty: DifficultyLevel;
  categoryId: string;
  categoryName: string;
  instructorId: string;
  instructorName: string;
  language?: string;
  accessType?: 'free' | 'enrolled' | 'subscription' | 'purchased';
  tags?: string[];
}

/**
 * Input for updating an existing course
 */
export interface UpdateCourseInput {
  title?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  thumbnailUrl?: string;
  coverImageUrl?: string;
  previewVideoUrl?: string;
  difficulty?: DifficultyLevel;
  categoryId?: string;
  categoryName?: string;
  subcategoryId?: string;
  tags?: string[];
  inspireStages?: INSPIREStage[];
  cognitiveLoadTarget?: CognitiveLoadLevel;
  instructorId?: string;
  instructorName?: string;
  coInstructorIds?: string[];
  prerequisiteIds?: string[];
  status?: ContentStatus;
  language?: string;
  captionLanguages?: string[];
  accessType?: 'free' | 'enrolled' | 'subscription' | 'purchased';
  priceInCents?: number;
  salePriceInCents?: number;
  currency?: string;
  isComplianceRequired?: boolean;
  complianceType?: string;
  regulatoryBody?: string;
  ceuCredits?: number;
  recertificationDays?: number;
  certificateTemplateId?: string;
}

// =============================================================================
// LESSON TYPES
// =============================================================================

/**
 * Lesson document stored in Firestore
 */
export interface Lesson extends FirestoreDocument {
  /** Parent course ID */
  courseId: string;
  /** Module ID (for grouping lessons) */
  moduleId?: string;
  /** Module name (denormalized) */
  moduleName?: string;
  /** Lesson title */
  title: string;
  /** URL-friendly slug */
  slug: string;
  /** Lesson description */
  description?: string;
  /** Order within course/module */
  order: number;
  /** Duration in minutes */
  durationMinutes: number;
  /** Primary content type */
  contentType: ContentType;
  /** Content URL (video, document, etc.) */
  contentUrl?: string;
  /** Thumbnail URL */
  thumbnailUrl?: string;
  /** INSPIRE stage for this lesson */
  inspireStage: INSPIREStage;
  /** Target cognitive load */
  cognitiveLoadTarget: CognitiveLoadLevel;
  /** Whether lesson is available for preview */
  isPreviewable: boolean;
  /** Whether lesson is required for completion */
  isRequired: boolean;
  /** Publishing status */
  status: ContentStatus;
  /** XP reward for completion */
  xpReward: number;
  /** Associated assessment ID */
  assessmentId?: string;
  /** SCORM package ID */
  scormPackageId?: string;
  /** xAPI activity ID */
  xapiActivityId?: string;
  /** Has transcript available */
  hasTranscript: boolean;
  /** Has captions available */
  hasCaptions: boolean;
  /** Has audio description available */
  hasAudioDescription: boolean;
  /** Transcript content */
  transcriptContent?: string;
  /** Captions file URL */
  captionsUrl?: string;
}

/**
 * Input for creating a new lesson
 */
export interface CreateLessonInput {
  courseId: string;
  moduleId?: string;
  moduleName?: string;
  title: string;
  slug: string;
  description?: string;
  order: number;
  durationMinutes: number;
  contentType: ContentType;
  contentUrl?: string;
  thumbnailUrl?: string;
  inspireStage: INSPIREStage;
  cognitiveLoadTarget?: CognitiveLoadLevel;
  isPreviewable?: boolean;
  isRequired?: boolean;
  xpReward?: number;
}

/**
 * Input for updating an existing lesson
 */
export interface UpdateLessonInput {
  moduleId?: string;
  moduleName?: string;
  title?: string;
  slug?: string;
  description?: string;
  order?: number;
  durationMinutes?: number;
  contentType?: ContentType;
  contentUrl?: string;
  thumbnailUrl?: string;
  inspireStage?: INSPIREStage;
  cognitiveLoadTarget?: CognitiveLoadLevel;
  isPreviewable?: boolean;
  isRequired?: boolean;
  status?: ContentStatus;
  xpReward?: number;
  assessmentId?: string;
  scormPackageId?: string;
  xapiActivityId?: string;
  hasTranscript?: boolean;
  hasCaptions?: boolean;
  hasAudioDescription?: boolean;
  transcriptContent?: string;
  captionsUrl?: string;
}

// =============================================================================
// CONTENT BLOCK TYPES
// =============================================================================

/**
 * Content block types for lesson content
 */
export type ContentBlockType =
  | 'text'
  | 'heading'
  | 'image'
  | 'video'
  | 'audio'
  | 'embed'
  | 'callout'
  | 'quote'
  | 'code'
  | 'divider'
  | 'accordion'
  | 'tabs'
  | 'gallery'
  | 'quiz'
  | 'interactive';

/**
 * Content block document stored in Firestore
 */
export interface ContentBlock extends FirestoreDocument {
  /** Parent lesson ID */
  lessonId: string;
  /** Block type */
  type: ContentBlockType;
  /** Order within lesson */
  order: number;
  /** Block-specific content data */
  content: ContentBlockData;
  /** Custom CSS classes */
  className?: string;
  /** Inline styles */
  styles?: Record<string, string>;
  /** Estimated duration in seconds */
  durationSeconds?: number;
  /** Cognitive load weight (1-10) */
  cognitiveLoadWeight?: number;
  /** Whether block is required for completion */
  isRequired: boolean;
  /** Accessibility label */
  ariaLabel?: string;
  /** Publishing status */
  status: ContentStatus;
}

/**
 * Union type for content block data based on type
 */
export type ContentBlockData =
  | TextBlockData
  | HeadingBlockData
  | ImageBlockData
  | VideoBlockData
  | AudioBlockData
  | EmbedBlockData
  | CalloutBlockData
  | QuoteBlockData
  | CodeBlockData
  | DividerBlockData
  | AccordionBlockData
  | TabsBlockData
  | GalleryBlockData
  | QuizBlockData
  | InteractiveBlockData;

export interface TextBlockData {
  type: 'text';
  content: string;
  align?: 'left' | 'center' | 'right' | 'justify';
}

export interface HeadingBlockData {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  anchorId?: string;
}

export interface ImageBlockData {
  type: 'image';
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  longDescription?: string;
}

export interface VideoBlockData {
  type: 'video';
  src: string;
  provider: 'upload' | 'youtube' | 'vimeo' | 'bunny' | 'cloudflare';
  posterUrl?: string;
  captionsUrl?: string;
  transcript?: string;
  durationSeconds?: number;
}

export interface AudioBlockData {
  type: 'audio';
  src: string;
  transcript?: string;
  durationSeconds?: number;
}

export interface EmbedBlockData {
  type: 'embed';
  url: string;
  embedType: 'iframe' | 'oembed' | 'custom';
  width?: number;
  height?: number;
}

export interface CalloutBlockData {
  type: 'callout';
  variant: 'info' | 'warning' | 'success' | 'error' | 'tip';
  title?: string;
  content: string;
}

export interface QuoteBlockData {
  type: 'quote';
  text: string;
  author?: string;
  source?: string;
}

export interface CodeBlockData {
  type: 'code';
  code: string;
  language: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export interface DividerBlockData {
  type: 'divider';
  style?: 'solid' | 'dashed' | 'dotted';
}

export interface AccordionBlockData {
  type: 'accordion';
  items: Array<{
    id: string;
    header: string;
    content: string;
  }>;
  allowMultiple?: boolean;
}

export interface TabsBlockData {
  type: 'tabs';
  tabs: Array<{
    id: string;
    label: string;
    content: string;
  }>;
}

export interface GalleryBlockData {
  type: 'gallery';
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  layout: 'grid' | 'carousel' | 'masonry';
}

export interface QuizBlockData {
  type: 'quiz';
  assessmentId: string;
  showInline: boolean;
}

export interface InteractiveBlockData {
  type: 'interactive';
  interactiveType: 'h5p' | 'storyline' | 'captivate' | 'custom';
  embedUrl: string;
  width?: number;
  height?: number;
}

/**
 * Input for creating a new content block
 */
export interface CreateContentBlockInput {
  lessonId: string;
  type: ContentBlockType;
  order: number;
  content: ContentBlockData;
  className?: string;
  styles?: Record<string, string>;
  durationSeconds?: number;
  cognitiveLoadWeight?: number;
  isRequired?: boolean;
  ariaLabel?: string;
}

/**
 * Input for updating an existing content block
 */
export interface UpdateContentBlockInput {
  type?: ContentBlockType;
  order?: number;
  content?: ContentBlockData;
  className?: string;
  styles?: Record<string, string>;
  durationSeconds?: number;
  cognitiveLoadWeight?: number;
  isRequired?: boolean;
  ariaLabel?: string;
  status?: ContentStatus;
}

// =============================================================================
// ASSESSMENT TYPES
// =============================================================================

/**
 * Assessment types
 */
export type AssessmentType = 'quiz' | 'exam' | 'survey' | 'self-assessment' | 'knowledge-check';

/**
 * Assessment document stored in Firestore
 */
export interface Assessment extends FirestoreDocument {
  /** Assessment title */
  title: string;
  /** URL-friendly slug */
  slug: string;
  /** Description */
  description?: string;
  /** Assessment type */
  assessmentType: AssessmentType;
  /** Associated course ID (optional) */
  courseId?: string;
  /** Associated lesson ID (optional) */
  lessonId?: string;
  /** Question IDs in order */
  questionIds: string[];
  /** Total points possible */
  totalPoints: number;
  /** Passing score percentage (0-100) */
  passingScore: number;
  /** Time limit in minutes (0 = unlimited) */
  timeLimitMinutes: number;
  /** Maximum attempts allowed (0 = unlimited) */
  maxAttempts: number;
  /** Shuffle questions */
  shuffleQuestions: boolean;
  /** Shuffle answer options */
  shuffleOptions: boolean;
  /** Show correct answers after completion */
  showCorrectAnswers: boolean;
  /** Show score after completion */
  showScore: boolean;
  /** Publishing status */
  status: ContentStatus;
  /** Allow review after completion */
  allowReview: boolean;
}

// =============================================================================
// MEDIA ASSET TYPES
// =============================================================================

/**
 * Media asset types
 */
export type MediaAssetType = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';

/**
 * Media asset document stored in Firestore
 */
export interface MediaAsset extends FirestoreDocument {
  /** Original filename */
  filename: string;
  /** Asset type */
  assetType: MediaAssetType;
  /** MIME type */
  mimeType: string;
  /** File size in bytes */
  sizeBytes: number;
  /** Cloud Storage URL */
  storageUrl: string;
  /** Public CDN URL */
  cdnUrl?: string;
  /** Alt text for accessibility */
  altText?: string;
  /** Title/caption */
  title?: string;
  /** Description */
  description?: string;
  /** Tags for organization */
  tags: string[];
  /** Folder path for organization */
  folderPath: string;
  /** Image width (if applicable) */
  width?: number;
  /** Image height (if applicable) */
  height?: number;
  /** Duration in seconds (for audio/video) */
  durationSeconds?: number;
  /** Thumbnail URL (for video) */
  thumbnailUrl?: string;
}

// =============================================================================
// USER PROGRESS TYPES
// =============================================================================

/**
 * User progress document for tracking completion
 */
export interface UserProgress extends FirestoreDocument {
  /** User ID */
  userId: string;
  /** Course ID */
  courseId: string;
  /** Lesson ID */
  lessonId?: string;
  /** Progress percentage (0-100) */
  progressPercent: number;
  /** Completion status */
  status: 'not_started' | 'in_progress' | 'completed';
  /** Started timestamp */
  startedAt?: Timestamp;
  /** Completed timestamp */
  completedAt?: Timestamp;
  /** Last accessed timestamp */
  lastAccessedAt: Timestamp;
  /** Time spent in seconds */
  timeSpentSeconds: number;
  /** Last position (video timestamp, page number, etc.) */
  lastPosition?: number;
  /** Assessment scores by assessment ID */
  assessmentScores?: Record<string, number>;
  /** XP earned */
  xpEarned: number;
}

// =============================================================================
// ORGANIZATION TYPES
// =============================================================================

/**
 * Organization document for multi-tenant support
 */
export interface Organization {
  /** Document ID */
  id: string;
  /** Organization name */
  name: string;
  /** URL-friendly slug */
  slug: string;
  /** Logo URL */
  logoUrl?: string;
  /** Primary contact email */
  contactEmail: string;
  /** Subscription plan */
  subscriptionPlan: 'free' | 'starter' | 'professional' | 'enterprise';
  /** Stripe customer ID */
  stripeCustomerId?: string;
  /** Subscription status */
  subscriptionStatus: 'active' | 'past_due' | 'canceled' | 'trialing';
  /** Max users allowed */
  maxUsers: number;
  /** Max storage in bytes */
  maxStorageBytes: number;
  /** Custom domain */
  customDomain?: string;
  /** Branding settings */
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  };
  /** Feature flags */
  features: {
    xapiEnabled: boolean;
    scormEnabled: boolean;
    customBranding: boolean;
    ssoEnabled: boolean;
    apiAccess: boolean;
  };
  /** Creation timestamp */
  createdAt: Timestamp;
  /** Last update timestamp */
  updatedAt: Timestamp;
}

// =============================================================================
// HELPER TYPES
// =============================================================================

/**
 * Pagination options for list queries
 */
export interface PaginationOptions {
  /** Number of items per page */
  limit: number;
  /** Cursor for pagination (last document ID) */
  cursor?: string;
  /** Sort field */
  orderBy?: string;
  /** Sort direction */
  orderDirection?: 'asc' | 'desc';
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  /** Items in current page */
  items: T[];
  /** Total count (if available) */
  totalCount?: number;
  /** Next page cursor */
  nextCursor?: string;
  /** Whether more items exist */
  hasMore: boolean;
}

/**
 * Filter options for courses
 */
export interface CourseFilters {
  /** Search query */
  search?: string;
  /** Category IDs */
  categoryIds?: string[];
  /** Difficulty levels */
  difficulties?: DifficultyLevel[];
  /** Content status */
  status?: ContentStatus;
  /** Instructor IDs */
  instructorIds?: string[];
  /** Tags */
  tags?: string[];
  /** INSPIRE stages */
  inspireStages?: INSPIREStage[];
  /** Access type */
  accessType?: 'free' | 'enrolled' | 'subscription' | 'purchased';
  /** Only compliance required */
  complianceOnly?: boolean;
}

/**
 * Filter options for lessons
 */
export interface LessonFilters {
  /** Course ID */
  courseId?: string;
  /** Module ID */
  moduleId?: string;
  /** Content type */
  contentType?: ContentType;
  /** Content status */
  status?: ContentStatus;
  /** INSPIRE stage */
  inspireStage?: INSPIREStage;
}
