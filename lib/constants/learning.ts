/**
 * Pagination defaults
 */
export const PAGINATION = {
  /** Default items per page */
  DEFAULT_PAGE_SIZE: 20,
  /** Maximum items per page */
  MAX_PAGE_SIZE: 100,
  /** Items per page for admin lists */
  ADMIN_PAGE_SIZE: 50,
  /** Items per page for learner dashboards */
  LEARNER_PAGE_SIZE: 10,
} as const;

/**
 * Spaced repetition algorithm constants
 * Based on SM-2 algorithm with modifications
 */
export const SPACED_REPETITION = {
  /** Maximum reviews per day per user */
  MAX_DAILY_REVIEWS: 20,
  /** Days between reviews for mastery */
  MASTERY_INTERVAL_DAYS: 21,
  /** Consecutive correct answers for mastery */
  MASTERY_CONSECUTIVE: 3,
  /** Initial interval after first correct answer (days) */
  INITIAL_INTERVAL: 1,
  /** Ease factor increment for correct answer */
  EASE_INCREMENT: 0.1,
  /** Ease factor decrement for wrong answer */
  EASE_DECREMENT: 0.2,
  /** Minimum ease factor */
  MIN_EASE: 1.3,
  /** Maximum ease factor */
  MAX_EASE: 2.5,
  /** Default ease factor */
  DEFAULT_EASE: 2.5,
} as const;

/**
 * Engagement scoring weights
 */
export const ENGAGEMENT_WEIGHTS = {
  /** Base engagement score */
  BASE_SCORE: 50,
  /** Points per meaningful interaction */
  INTERACTION_MULTIPLIER: 10,
  /** Penalty per tab switch */
  TAB_SWITCH_PENALTY: 5,
  /** Maximum possible score */
  MAX_SCORE: 100,
  /** Minimum score before intervention */
  INTERVENTION_THRESHOLD: 30,
} as const;

/**
 * Course completion thresholds
 */
export const COMPLETION = {
  /** Minimum score for passing */
  PASS_SCORE: 70,
  /** Score for distinction */
  DISTINCTION_SCORE: 90,
  /** Required progress percentage */
  REQUIRED_PROGRESS: 80,
  /** Maximum attempts per assessment */
  MAX_ASSESSMENT_ATTEMPTS: 3,
} as const;

/**
 * Content block limits
 */
export const CONTENT_LIMITS = {
  /** Max blocks per lesson */
  BLOCKS_PER_LESSON: 50,
  /** Max lessons per module */
  LESSONS_PER_MODULE: 20,
  /** Max modules per course */
  MODULES_PER_COURSE: 20,
  /** Max file upload size (50MB) */
  MAX_FILE_SIZE_BYTES: 50 * 1024 * 1024,
  /** Max video duration for auto-transcription (30 min) */
  MAX_AUTO_TRANSCRIBE_SECONDS: 30 * 60,
} as const;
