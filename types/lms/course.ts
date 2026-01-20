/**
 * Course-related type definitions for LXP360 LMS
 */

// INSPIRE Framework stages
export type INSPIREStage =
  | 'ignite' // Spark curiosity and emotional engagement
  | 'navigate' // Orient learners to objectives and structure
  | 'scaffold' // Build foundational knowledge progressively
  | 'practice' // Apply learning through exercises
  | 'integrate' // Connect new learning to existing knowledge
  | 'reflect' // Process and consolidate learning
  | 'extend'; // Transfer to real-world application

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type CourseStatus = 'draft' | 'review' | 'published' | 'archived';
export type ContentType =
  | 'video'
  | 'scorm'
  | 'xapi'
  | 'document'
  | 'interactive'
  | 'text'
  | 'audio'
  | 'simulation';
export type CognitiveLoadLevel = 'low' | 'medium' | 'high';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string;
  children?: Category[];
  courseCount: number;
}

export interface Instructor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  title?: string;
  bio?: string;
  expertise: string[];
  rating: number;
  courseCount: number;
  studentCount: number;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

export interface CourseSkill {
  skillId: string;
  skillName: string;
  levelGained: number; // 1-100
  category: string;
}

export interface CoursePrerequisite {
  courseId: string;
  courseTitle: string;
  isRequired: boolean;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  duration: number; // minutes
  lessons: Lesson[];
  isLocked: boolean;
  unlockDate?: string;
  completionRequirement: 'all' | 'percentage';
  completionPercentage?: number;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  order: number;
  duration: number; // minutes
  contentType: ContentType;
  contentUrl?: string;
  contentData?: Record<string, unknown>;
  thumbnail?: string;
  inspireStage: INSPIREStage;
  cognitiveLoadTarget: CognitiveLoadLevel;
  isPreviewable: boolean;
  isRequired: boolean;
  xpReward: number;
  // For SCORM/xAPI
  scormPackageId?: string;
  xapiActivityId?: string;
  // For assessments
  assessmentId?: string;
  // Resources
  resources: LessonResource[];
  // Accessibility
  hasTranscript: boolean;
  hasCaptions: boolean;
  hasAudioDescription: boolean;
}

export interface LessonResource {
  id: string;
  title: string;
  type: 'pdf' | 'doc' | 'link' | 'download' | 'video' | 'audio';
  url: string;
  size?: number; // bytes
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  coverImage?: string;
  previewVideo?: string;
  duration: number; // total minutes
  difficulty: DifficultyLevel;
  category: Category;
  subcategory?: Category;
  tags: string[];
  skills: CourseSkill[];
  modules: Module[];
  instructor: Instructor;
  coInstructors?: Instructor[];
  prerequisites: CoursePrerequisite[];
  // Stats
  rating: number;
  reviewCount: number;
  enrollmentCount: number;
  completionRate: number;
  lessonCount: number;
  quizCount: number;
  // Compliance
  isRequired: boolean;
  complianceType?: string;
  complianceCode?: string;
  regulatoryBody?: string;
  dueDate?: string;
  recertificationPeriod?: number; // days
  // Pricing (e-commerce)
  isFree: boolean;
  price?: number;
  salePrice?: number;
  currency: string;
  // INSPIRE Framework
  inspireStages: INSPIREStage[];
  cognitiveLoadTarget: CognitiveLoadLevel;
  // Gamification
  xpTotal: number;
  badgeIds: string[];
  certificateTemplateId?: string;
  // Metadata
  language: string;
  captions: string[];
  creditsOffered?: number;
  ceuCredits?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  status: CourseStatus;
  version: string;
  // Access control
  accessType: 'free' | 'enrolled' | 'subscription' | 'purchased';
  groupIds?: string[];
  roleIds?: string[];
}

export interface CourseReview {
  id: string;
  courseId: string;
  learnerId: string;
  learnerName: string;
  learnerAvatar?: string;
  rating: number;
  title?: string;
  content: string;
  helpful: number;
  reported: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseFilters {
  search?: string;
  categories?: string[];
  difficulty?: DifficultyLevel[];
  duration?: {
    min?: number;
    max?: number;
  };
  rating?: number;
  skills?: string[];
  instructors?: string[];
  language?: string[];
  isFree?: boolean;
  isRequired?: boolean;
  hasCredits?: boolean;
  inspireStages?: INSPIREStage[];
  sortBy?: 'popular' | 'newest' | 'rating' | 'title' | 'duration';
  sortOrder?: 'asc' | 'desc';
}

export interface EnrollmentSettings {
  autoEnroll: boolean;
  approvalRequired: boolean;
  capacity?: number;
  waitlistEnabled: boolean;
  selfEnrollment: boolean;
  enrollmentDeadline?: string;
  accessDuration?: number; // days
}
