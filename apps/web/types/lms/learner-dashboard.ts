/**
 * Learner Dashboard type definitions
 * Types for the learner-facing my-learning dashboard
 */

/**
 * Course status for learner view
 */
export type LearnerCourseStatus = 'not_started' | 'in_progress' | 'completed';

/**
 * Course data as seen by a learner
 */
export interface LearnerCourse {
  /** Unique course identifier */
  id: string;
  /** Course title */
  title: string;
  /** Short description */
  description: string;
  /** Course thumbnail URL */
  thumbnailUrl?: string;
  /** Progress percentage (0-100) */
  progress: number;
  /** Current status */
  status: LearnerCourseStatus;
  /** Due date for assigned courses */
  dueDate?: Date;
  /** Estimated time to complete in minutes */
  estimatedMinutes: number;
  /** Completion timestamp */
  completedAt?: Date;
  /** Total lessons in course */
  totalLessons: number;
  /** Number of completed lessons */
  completedLessons: number;
  /** Last accessed timestamp */
  lastAccessedAt?: Date;
  /** Whether this course is required/assigned */
  isRequired: boolean;
  /** Category/tags for the course */
  category?: string;
  /** XP reward for completion */
  xpReward?: number;
}

/**
 * Learner progress summary
 */
export interface LearnerProgressSummary {
  /** Total assigned courses */
  totalAssigned: number;
  /** Courses in progress */
  inProgress: number;
  /** Completed courses */
  completed: number;
  /** Overall progress percentage */
  overallProgress: number;
  /** Total time spent learning (minutes) */
  totalTimeSpent: number;
  /** Current learning streak (days) */
  currentStreak: number;
  /** XP earned */
  totalXp: number;
  /** Current level */
  level: number;
}

/**
 * AI-recommended course with recommendation reason
 */
export interface RecommendedCourse extends LearnerCourse {
  /** Why this course is recommended */
  recommendationReason: string;
  /** Confidence score for recommendation (0-1) */
  confidenceScore: number;
  /** Skills this course will develop */
  targetSkills: string[];
}

/**
 * Completed course with achievement data
 */
export interface CompletedCourseRecord extends LearnerCourse {
  /** Final score/grade if applicable */
  finalScore?: number;
  /** Certificate ID if issued */
  certificateId?: string;
  /** Badges earned from this course */
  badgesEarned: string[];
  /** XP earned */
  xpEarned: number;
  /** Time spent on course (minutes) */
  timeSpent: number;
}
