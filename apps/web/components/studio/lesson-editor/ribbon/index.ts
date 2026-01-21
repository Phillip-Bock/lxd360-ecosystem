/**
 * Lesson Editor Ribbon - Office-style ribbon interface
 *
 * Usage:
 * import { LessonRibbon } from "@/components/studio/lesson-editor/ribbon";
 */

// Contextual tab re-exports
export {
  AudioToolsTab,
  ImageToolsTab,
  QuizToolsTab,
  VideoToolsTab,
} from './contextual';
export { LessonRibbon, type LessonRibbonProps } from './lesson-ribbon';
// Tab components (for custom usage)
export {
  AIStudioTab,
  type AIStudioTabProps,
  CLTTab,
  type CLTTabProps,
  DesignTab,
  type DesignTabProps,
  HomeTab,
  type HomeTabProps,
  InsertTab,
  type InsertTabProps,
  InteractionsTab,
  type InteractionsTabProps,
  type LayoutType,
  type PreviewDevice,
  type ReviewStatus,
  ReviewTab,
  type ReviewTabProps,
  type ThemeMode,
} from './tabs';
