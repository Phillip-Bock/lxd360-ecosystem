/**
 * Progress Tracking UI Components
 *
 * Provides visual feedback for learner progress through courses and lessons.
 */

// Completion Certificate
export {
  type CertificateData,
  CompletionCertificate,
  type CompletionCertificateProps,
  type UseCertificateModalReturn,
  useCertificateModal,
} from './completion-certificate';

// Lesson Status
export {
  CompactLessonStatus,
  type CompactLessonStatusProps,
  LessonStatus,
  LessonStatusBadge,
  type LessonStatusBadgeProps,
  type LessonStatusProps,
  type LessonStatusType,
} from './lesson-status';

// Module Progress Card
export {
  type ModuleLessonItem,
  ModuleProgressCard,
  type ModuleProgressCardProps,
  ModuleProgressCardSkeleton,
} from './module-progress-card';

// Progress Bar
export {
  ProgressBar,
  type ProgressBarProps,
  SegmentedProgressBar,
  type SegmentedProgressBarProps,
} from './progress-bar';

// Progress Ring
export {
  MiniProgressRing,
  type MiniProgressRingProps,
  ProgressRing,
  type ProgressRingProps,
} from './progress-ring';
