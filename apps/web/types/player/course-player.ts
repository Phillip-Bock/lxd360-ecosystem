/**
 * Course Player Types
 * LXD-332: Types for the course player component
 */

import type { BlockInstance } from '@/types/blocks';

/**
 * Lesson status in the player
 */
export type LessonStatus = 'locked' | 'available' | 'in_progress' | 'completed';

/**
 * Lesson in the course player
 */
export interface PlayerLesson {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  order: number;
  duration: number; // minutes
  status: LessonStatus;
  blocks: BlockInstance[];
  isRequired: boolean;
  xpReward: number;
}

/**
 * Module in the course player
 */
export interface PlayerModule {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  lessons: PlayerLesson[];
  isLocked: boolean;
  completionPercentage: number;
}

/**
 * Course data for the player
 */
export interface PlayerCourse {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  modules: PlayerModule[];
  totalLessons: number;
  completedLessons: number;
  totalDuration: number;
  xpTotal: number;
}

/**
 * Learner's progress in a course
 */
export interface CourseProgress {
  courseId: string;
  learnerId: string;
  completedLessonIds: string[];
  currentLessonId?: string;
  currentModuleId?: string;
  progress: number; // 0-100
  xpEarned: number;
  startedAt: string;
  lastAccessedAt: string;
  completedAt?: string;
}

/**
 * Bookmark for a lesson position
 */
export interface LessonBookmark {
  id: string;
  lessonId: string;
  courseId: string;
  learnerId: string;
  title: string;
  blockId?: string;
  position?: number;
  createdAt: string;
}

/**
 * Player navigation state
 */
export interface PlayerNavigation {
  currentModuleIndex: number;
  currentLessonIndex: number;
  hasPrevious: boolean;
  hasNext: boolean;
  previousLesson?: { moduleId: string; lessonId: string };
  nextLesson?: { moduleId: string; lessonId: string };
}

/**
 * Player UI state
 */
export interface PlayerUIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  isFullscreen: boolean;
  showBookmarkDialog: boolean;
}

/**
 * Course player state
 */
export interface CoursePlayerState {
  course: PlayerCourse | null;
  currentLesson: PlayerLesson | null;
  progress: CourseProgress | null;
  bookmarks: LessonBookmark[];
  navigation: PlayerNavigation | null;
  ui: PlayerUIState;
  loading: boolean;
  error: string | null;
}

/**
 * Course player actions
 */
export interface CoursePlayerActions {
  loadCourse: (courseId: string) => Promise<void>;
  navigateToLesson: (lessonId: string) => void;
  markLessonComplete: () => Promise<void>;
  goToNextLesson: () => void;
  goToPreviousLesson: () => void;
  addBookmark: (title: string, blockId?: string) => Promise<void>;
  removeBookmark: (bookmarkId: string) => Promise<void>;
  toggleSidebar: () => void;
  toggleSidebarCollapse: () => void;
  toggleFullscreen: () => void;
}
