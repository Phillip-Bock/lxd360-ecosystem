/**
 * LXP360 LMS Type Definitions
 * Complete type system for the Learning Experience Platform
 */

export * from './achievement';
export * from './analytics';
export * from './compliance';
export * from './course';
export * from './ecommerce';
export * from './enrollment';
export * from './learner';
export * from './lesson';
export * from './lrs';
// Export progress types explicitly, excluding deprecated enrollment types
// that are superseded by ./enrollment.ts
// Legacy enrollment types from progress.ts (deprecated)
export type {
  CertificationRecord,
  CourseProgress,
  Enrollment as LegacyEnrollment,
  EnrollmentSource as LegacyEnrollmentSource,
  EnrollmentStatus as LegacyEnrollmentStatus,
  LearningGoal,
  LearningSession,
  LearningStreak,
  LessonProgress,
  ModuleProgress,
  QuizProgressSummary,
  RecentlyViewed,
  SavedCourse,
  StreakDay,
  Transcript,
  TranscriptEntry,
} from './progress';
export * from './quiz';
export * from './skill';
export * from './social';
