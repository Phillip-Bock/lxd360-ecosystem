// =============================================================================
// Collection Names (Constants)
// =============================================================================

/**
 * Firestore collection names
 * Use these constants instead of hardcoding collection names
 */
export const COLLECTIONS = {
  USERS: 'users',
  ORGANIZATIONS: 'organizations',
  COURSES: 'courses',
  LESSONS: 'lessons',
  MODULES: 'modules',
  ENROLLMENTS: 'enrollments',
  XAPI_STATEMENTS: 'xapi_statements',
  WAITLIST: 'waitlist',
  SUBSCRIPTIONS: 'subscriptions',
  BLOCKS: 'blocks',
  MEDIA: 'media',
  ASSESSMENTS: 'assessments',
  CERTIFICATES: 'certificates',
  AUDIT_LOGS: 'audit_logs',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'settings',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

// =============================================================================
// Base Types
// =============================================================================

/**
 * Base document interface - all Firestore documents extend this
 * Index signature allows for Record<string, unknown> compatibility
 */
export interface BaseDocument {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Soft-deletable document
 */
export interface SoftDeletableDocument extends BaseDocument {
  deletedAt?: string;
  isDeleted?: boolean;
}

// =============================================================================
// User Types
// =============================================================================

/**
 * User roles in the system
 */
export type UserRole =
  | 'super_admin'
  | 'org_admin'
  | 'admin'
  | 'manager'
  | 'instructor'
  | 'learner'
  | 'guest';

/**
 * User document
 */
export interface User extends BaseDocument {
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  organizationId?: string;
  preferences?: UserPreferences;
  lastLoginAt?: string;
  isActive: boolean;
}

/**
 * User preferences
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  language: string;
  timezone?: string;
  accessibility?: AccessibilityPreferences;
}

/**
 * Accessibility preferences
 */
export interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  screenReaderOptimized: boolean;
}

// =============================================================================
// Organization Types
// =============================================================================

/**
 * Organization document
 */
export interface Organization extends BaseDocument {
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  website?: string;
  settings: OrganizationSettings;
  subscription?: SubscriptionInfo;
  memberCount: number;
}

/**
 * Organization settings
 */
export interface OrganizationSettings {
  branding: BrandingSettings;
  features: FeatureFlags;
  security: SecuritySettings;
}

/**
 * Branding settings
 */
export interface BrandingSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  logoUrl?: string;
  faviconUrl?: string;
  customCss?: string;
}

/**
 * Feature flags for organization
 */
export interface FeatureFlags {
  xapi: boolean;
  aiAssistant: boolean;
  customDomain: boolean;
  advancedAnalytics: boolean;
  sso: boolean;
  whiteLabeling: boolean;
}

/**
 * Security settings
 */
export interface SecuritySettings {
  mfaRequired: boolean;
  sessionTimeout: number;
  allowedDomains?: string[];
  ipWhitelist?: string[];
}

/**
 * Subscription information
 */
export interface SubscriptionInfo {
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

// =============================================================================
// Course Types
// =============================================================================

/**
 * Course status
 */
export type CourseStatus = 'draft' | 'review' | 'published' | 'archived';

/**
 * Course document
 */
export interface Course extends BaseDocument {
  organizationId: string;
  title: string;
  description: string;
  slug: string;
  status: CourseStatus;
  thumbnail?: string;
  instructorId: string;
  settings: CourseSettings;
  metadata: CourseMetadata;
  moduleIds: string[];
  enrollmentCount: number;
  averageRating?: number;
}

/**
 * Course settings
 */
export interface CourseSettings {
  isPublic: boolean;
  requiresEnrollment: boolean;
  allowSelfEnrollment: boolean;
  completionCriteria: 'all_lessons' | 'percentage' | 'assessment';
  completionThreshold?: number;
  certificateEnabled: boolean;
  discussionEnabled: boolean;
}

/**
 * Course metadata
 */
export interface CourseMetadata {
  duration?: number; // minutes
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  tags?: string[];
  objectives?: string[];
  prerequisites?: string[];
  language?: string;
  version?: string;
}

// =============================================================================
// Module Types
// =============================================================================

/**
 * Module document (container for lessons)
 */
export interface Module extends BaseDocument {
  courseId: string;
  title: string;
  description?: string;
  order: number;
  status: 'draft' | 'published';
  lessonIds: string[];
  duration?: number;
}

// =============================================================================
// Lesson Types
// =============================================================================

/**
 * Lesson document
 */
export interface Lesson extends BaseDocument {
  courseId: string;
  moduleId?: string;
  title: string;
  description?: string;
  order: number;
  status: 'draft' | 'published';
  blockIds: string[];
  duration?: number;
  thumbnail?: string;
}

// =============================================================================
// Block Types (Content Blocks)
// =============================================================================

/**
 * Block types supported in the system
 */
export type BlockType =
  | 'text'
  | 'heading'
  | 'image'
  | 'video'
  | 'audio'
  | 'code'
  | 'quiz'
  | 'assessment'
  | 'interactive'
  | 'embed'
  | 'divider'
  | 'accordion'
  | 'tabs'
  | 'callout'
  | 'file'
  | 'hotspot'
  | 'timeline'
  | 'flashcard';

/**
 * Block document
 */
export interface Block extends BaseDocument {
  lessonId: string;
  type: BlockType;
  order: number;
  data: BlockData;
  settings?: BlockSettings;
}

/**
 * Block data - varies by block type
 */
export interface BlockData {
  content?: string;
  src?: string;
  alt?: string;
  caption?: string;
  items?: unknown[];
  [key: string]: unknown;
}

/**
 * Block settings
 */
export interface BlockSettings {
  isRequired?: boolean;
  trackCompletion?: boolean;
  xapiVerb?: string;
  accessibility?: BlockAccessibility;
}

/**
 * Block accessibility settings
 */
export interface BlockAccessibility {
  ariaLabel?: string;
  ariaDescribedBy?: string;
  skipLink?: boolean;
}

// =============================================================================
// Enrollment Types
// =============================================================================

/**
 * Enrollment status
 */
export type EnrollmentStatus = 'enrolled' | 'in_progress' | 'completed' | 'dropped' | 'expired';

/**
 * Enrollment document
 */
export interface Enrollment extends BaseDocument {
  userId: string;
  courseId: string;
  organizationId: string;
  status: EnrollmentStatus;
  progress: number; // 0-100
  startedAt?: string;
  completedAt?: string;
  lastAccessedAt?: string;
  expiresAt?: string;
  completedLessonIds: string[];
  score?: number;
}

// =============================================================================
// xAPI Types
// =============================================================================

/**
 * xAPI Actor
 */
export interface XAPIActor {
  objectType?: 'Agent' | 'Group';
  mbox?: string;
  mbox_sha1sum?: string;
  openid?: string;
  account?: {
    homePage: string;
    name: string;
  };
  name?: string;
}

/**
 * xAPI Verb
 */
export interface XAPIVerb {
  id: string;
  display: Record<string, string>;
}

/**
 * xAPI Object
 */
export interface XAPIObject {
  objectType: 'Activity' | 'Agent' | 'Group' | 'StatementRef' | 'SubStatement';
  id: string;
  definition?: {
    name?: Record<string, string>;
    description?: Record<string, string>;
    type?: string;
    moreInfo?: string;
    extensions?: Record<string, unknown>;
  };
}

/**
 * xAPI Result
 */
export interface XAPIResult {
  score?: {
    scaled?: number;
    raw?: number;
    min?: number;
    max?: number;
  };
  success?: boolean;
  completion?: boolean;
  response?: string;
  duration?: string;
  extensions?: Record<string, unknown>;
}

/**
 * xAPI Context
 */
export interface XAPIContext {
  registration?: string;
  instructor?: XAPIActor;
  team?: XAPIActor;
  contextActivities?: {
    parent?: XAPIObject[];
    grouping?: XAPIObject[];
    category?: XAPIObject[];
    other?: XAPIObject[];
  };
  revision?: string;
  platform?: string;
  language?: string;
  statement?: {
    objectType: 'StatementRef';
    id: string;
  };
  extensions?: Record<string, unknown>;
}

/**
 * xAPI Statement document
 */
export interface XAPIStatement extends BaseDocument {
  organizationId: string;
  actor: XAPIActor;
  verb: XAPIVerb;
  object: XAPIObject;
  result?: XAPIResult;
  context?: XAPIContext;
  timestamp: string;
  stored?: string;
  authority?: XAPIActor;
  version?: string;
}

// =============================================================================
// Waitlist Types
// =============================================================================

/**
 * Waitlist status
 */
export type WaitlistStatus = 'pending' | 'invited' | 'converted' | 'declined';

/**
 * Waitlist entry document
 */
export interface WaitlistEntry extends BaseDocument {
  email: string;
  name?: string;
  company?: string;
  source?: string;
  referrer?: string;
  status: WaitlistStatus;
  invitedAt?: string;
  convertedAt?: string;
  notes?: string;
}

// =============================================================================
// Media Types
// =============================================================================

/**
 * Media type
 */
export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';

/**
 * Media document
 */
export interface Media extends BaseDocument {
  organizationId: string;
  uploaderId: string;
  name: string;
  type: MediaType;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  folder?: string;
  tags?: string[];
  metadata?: MediaMetadata;
}

/**
 * Media metadata
 */
export interface MediaMetadata {
  width?: number;
  height?: number;
  duration?: number;
  alt?: string;
  caption?: string;
}

// =============================================================================
// Certificate Types
// =============================================================================

/**
 * Certificate document
 */
export interface Certificate extends BaseDocument {
  userId: string;
  courseId: string;
  organizationId: string;
  enrollmentId: string;
  certificateNumber: string;
  issuedAt: string;
  expiresAt?: string;
  templateId?: string;
  pdfUrl?: string;
  verificationUrl: string;
}

// =============================================================================
// Audit Log Types
// =============================================================================

/**
 * Audit action types
 */
export type AuditAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'enroll'
  | 'complete'
  | 'export'
  | 'import';

/**
 * Audit log document
 */
export interface AuditLog extends BaseDocument {
  organizationId?: string;
  userId: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

// =============================================================================
// Notification Types
// =============================================================================

/**
 * Notification type
 */
export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'course_update'
  | 'enrollment'
  | 'achievement'
  | 'reminder';

/**
 * Notification document
 */
export interface Notification extends BaseDocument {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  readAt?: string;
}
