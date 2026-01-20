// INSPIRE Framework Stages
export type INSPIREStage =
  | 'ignite'
  | 'navigate'
  | 'scaffold'
  | 'practice'
  | 'integrate'
  | 'reflect'
  | 'extend';

export interface INSPIREStageInfo {
  id: INSPIREStage;
  name: string;
  description: string;
  icon: string;
  color: string;
  tips: string[];
}

export const INSPIRE_STAGES: INSPIREStageInfo[] = [
  {
    id: 'ignite',
    name: 'Ignite',
    description: 'Capture attention, spark curiosity',
    icon: 'Flame',
    color: '#f97316',
    tips: [
      'Start with a thought-provoking question',
      'Use surprising statistics or facts',
      'Share a relevant story or scenario',
      'Create cognitive dissonance',
    ],
  },
  {
    id: 'navigate',
    name: 'Navigate',
    description: 'Provide roadmap, set expectations',
    icon: 'Compass',
    color: '#3b82f6',
    tips: [
      'Clearly state learning objectives',
      'Show the course structure overview',
      'Explain what learners will be able to do',
      'Set time expectations',
    ],
  },
  {
    id: 'scaffold',
    name: 'Scaffold',
    description: 'Build foundation, connect prior knowledge',
    icon: 'Layers',
    color: '#a855f7',
    tips: [
      'Activate prior knowledge',
      'Present concepts in logical sequence',
      'Use analogies and metaphors',
      'Chunk information appropriately',
    ],
  },
  {
    id: 'practice',
    name: 'Practice',
    description: 'Active learning, hands-on application',
    icon: 'Target',
    color: '#22c55e',
    tips: [
      'Provide immediate feedback',
      'Include varied practice activities',
      'Allow safe failure',
      'Increase complexity gradually',
    ],
  },
  {
    id: 'integrate',
    name: 'Integrate',
    description: 'Connect concepts, synthesize learning',
    icon: 'Puzzle',
    color: '#06b6d4',
    tips: [
      'Connect to real-world applications',
      'Show relationships between concepts',
      'Use case studies and scenarios',
      'Encourage cross-domain thinking',
    ],
  },
  {
    id: 'reflect',
    name: 'Reflect',
    description: 'Metacognition, self-assessment',
    icon: 'Eye',
    color: '#ec4899',
    tips: [
      'Prompt self-evaluation',
      'Ask reflection questions',
      'Review key takeaways',
      'Identify knowledge gaps',
    ],
  },
  {
    id: 'extend',
    name: 'Extend',
    description: 'Transfer, apply beyond course',
    icon: 'Rocket',
    color: '#f59e0b',
    tips: [
      'Provide action planning tools',
      'Suggest further resources',
      'Set post-course challenges',
      'Create accountability structures',
    ],
  },
];

// Course Types
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  status: CourseStatus;
  modules: Module[];
  settings: CourseSettings;
  metadata: CourseMetadata;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  projectId?: string;
}

export type CourseStatus = 'draft' | 'review' | 'published' | 'archived';

export interface CourseSettings {
  completionCriteria: 'all' | 'percentage' | 'required';
  completionPercentage?: number;
  passingScore?: number;
  allowRetakes: boolean;
  maxRetakes?: number;
  shuffleModules: boolean;
  showProgress: boolean;
  enforceSequence: boolean;
  timeLimit?: number;
  expirationDays?: number;
}

export interface CourseMetadata {
  category?: string;
  tags: string[];
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  language: string;
  version: string;
  author: string;
  seoTitle?: string;
  seoDescription?: string;
}

// Module Types
export interface Module {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  lessons: Lesson[];
  inspireStage?: INSPIREStage;
  order: number;
  duration: number;
  isRequired: boolean;
  prerequisites: string[];
}

// Lesson Types
export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  type: LessonType;
  blocks: ContentBlock[];
  inspireStage?: INSPIREStage;
  cognitiveLoad: number;
  duration: number;
  order: number;
  completionCriteria: CompletionCriteria;
  isRequired: boolean;
  prerequisites: string[];
}

export type LessonType = 'content' | 'video' | 'quiz' | 'interactive' | 'scorm' | 'assignment';

export interface CompletionCriteria {
  type: 'view' | 'time' | 'quiz' | 'interaction' | 'manual';
  threshold?: number;
  minScore?: number;
  requiredInteractions?: string[];
}

// Content Block Types
export interface ContentBlock {
  id: string;
  type: BlockType;
  content: Record<string, unknown>;
  settings: BlockSettings;
  order: number;
  inspireStage?: INSPIREStage;
}

export type BlockType =
  | 'text'
  | 'heading'
  | 'image'
  | 'video'
  | 'audio'
  | 'embed'
  | 'code'
  | 'quote'
  | 'callout'
  | 'divider'
  | 'accordion'
  | 'tabs'
  | 'carousel'
  | 'timeline'
  | 'flashcard'
  | 'hotspot'
  | 'matching'
  | 'sorting'
  | 'dialogue'
  | 'scenario'
  | 'quiz'
  | 'custom'
  | 'multiple-choice'
  | 'true-false'
  | 'fill-blank'
  | 'short-answer'
  | 'essay'
  | 'file-upload';

export interface BlockSettings {
  width?: 'full' | 'wide' | 'medium' | 'narrow';
  alignment?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  animation?: string;
  accessibility?: AccessibilitySettings;
}

export interface AccessibilitySettings {
  altText?: string;
  ariaLabel?: string;
  role?: string;
  tabIndex?: number;
}

// Project Management Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  courses: string[];
  team: TeamMember[];
  tasks: Task[];
  milestones: Milestone[];
  status: ProjectStatus;
  startDate: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'active' | 'completed' | 'on-hold' | 'cancelled';

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: TeamRole;
  permissions: Permission[];
  joinedAt: string;
}

export type TeamRole = 'owner' | 'admin' | 'editor' | 'reviewer' | 'viewer';

export type Permission =
  | 'create'
  | 'edit'
  | 'delete'
  | 'publish'
  | 'manage-team'
  | 'manage-settings'
  | 'export'
  | 'review'
  | 'comment'
  | 'approve';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  assignee?: TeamMember;
  dueDate?: string;
  tags: string[];
  courseId?: string;
  lessonId?: string;
  attachments: Attachment[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  tasks: string[];
  completedAt?: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: TeamMember;
  createdAt: string;
  updatedAt?: string;
  parentId?: string;
  replies?: Comment[];
}

// AI Features Types
export interface AITokenUsage {
  used: number;
  limit: number;
  resetDate: string;
  breakdown: {
    content: number;
    image: number;
    voice: number;
    video: number;
    quiz: number;
    translation: number;
  };
}

export interface AIGenerationRequest {
  type: 'content' | 'image' | 'voice' | 'video' | 'quiz' | 'translation';
  prompt: string;
  context?: string;
  options?: Record<string, unknown>;
}

export interface AIGenerationResponse {
  success: boolean;
  result?: unknown;
  tokensUsed: number;
  error?: string;
}

// Export Types
export type ExportFormat = 'scorm-1.2' | 'scorm-2004' | 'xapi' | 'cmi5' | 'html5' | 'pdf';

export interface ExportSettings {
  format: ExportFormat;
  version?: string;
  lms?: {
    completionTracking: boolean;
    scoreTracking: boolean;
    timeTracking: boolean;
  };
  packaging?: {
    compressionLevel: 'none' | 'low' | 'medium' | 'high';
    includeSource: boolean;
  };
}

export interface ExportJob {
  id: string;
  courseId: string;
  format: ExportFormat;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  downloadUrl?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

// Review Types
export interface Review {
  id: string;
  courseId: string;
  reviewerId: string;
  reviewer: TeamMember;
  status: ReviewStatus;
  comments: ReviewComment[];
  checklist: ReviewChecklist;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type ReviewStatus = 'pending' | 'in-progress' | 'approved' | 'needs-changes' | 'rejected';

export interface ReviewComment {
  id: string;
  reviewId: string;
  blockId?: string;
  lessonId?: string;
  content: string;
  type: 'suggestion' | 'issue' | 'praise' | 'question';
  priority: 'low' | 'medium' | 'high';
  resolved: boolean;
  createdAt: string;
}

export interface ReviewChecklist {
  items: ReviewChecklistItem[];
  completedCount: number;
  totalCount: number;
}

export interface ReviewChecklistItem {
  id: string;
  label: string;
  category: 'content' | 'accessibility' | 'technical' | 'design';
  completed: boolean;
  notes?: string;
}

// Template Types
export interface Template {
  id: string;
  name: string;
  description: string;
  type: 'course' | 'module' | 'lesson' | 'block';
  thumbnail?: string;
  category: string;
  tags: string[];
  content: unknown;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  usageCount: number;
}

// Activity Types
export interface Activity {
  id: string;
  type: ActivityType;
  actorId: string;
  actor: TeamMember;
  projectId?: string;
  courseId?: string;
  lessonId?: string;
  taskId?: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type ActivityType =
  | 'course-created'
  | 'course-updated'
  | 'course-published'
  | 'course-archived'
  | 'lesson-created'
  | 'lesson-updated'
  | 'lesson-deleted'
  | 'task-created'
  | 'task-completed'
  | 'task-assigned'
  | 'review-requested'
  | 'review-completed'
  | 'review-comment'
  | 'team-member-added'
  | 'team-member-removed'
  | 'export-completed'
  | 'export-failed';
