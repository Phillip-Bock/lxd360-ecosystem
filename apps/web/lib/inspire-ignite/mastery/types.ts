import { z } from 'zod';

/**
 * Learning event for mastery calculation
 */
export const LearningEventSchema = z.object({
  eventId: z.string(),
  timestamp: z.string().datetime(),
  blockId: z.string(),
  blockType: z.string(),

  // Outcome
  success: z.boolean(),
  score: z.number().min(0).max(100).optional(),
  partialCredit: z.number().min(0).max(1).optional(),

  // Timing metrics
  duration: z.number().min(0), // seconds
  expectedDuration: z.number().min(0).optional(),

  // Confidence indicators
  numberOfChanges: z.number().min(0).default(0),
  timeToFirstAction: z.number().min(0).optional(), // seconds

  // Context
  attemptNumber: z.number().min(1).default(1),
  hintsUsed: z.number().min(0).default(0),
});
export type LearningEvent = z.infer<typeof LearningEventSchema>;

/**
 * Mastery Score for a specific skill/competency
 */
export const MasteryScoreSchema = z.object({
  skillId: z.string(),
  skillName: z.string(),

  // Core mastery metric (0-1)
  masteryLevel: z.number().min(0).max(1),

  // Confidence in the mastery estimate
  confidence: z.number().min(0).max(1),

  // Learning velocity (rate of improvement)
  learningVelocity: z.number(),

  // Status
  status: z.enum(['not_started', 'developing', 'approaching', 'proficient', 'mastered']),

  // History
  totalAttempts: z.number().min(0),
  successfulAttempts: z.number().min(0),
  lastAttemptDate: z.string().datetime().optional(),

  // Forgetting curve
  retentionEstimate: z.number().min(0).max(1), // Current estimated retention
  nextReviewDate: z.string().datetime().optional(),
});
export type MasteryScore = z.infer<typeof MasteryScoreSchema>;

/**
 * Spaced repetition parameters
 * Based on SM-2 algorithm (SuperMemo)
 */
export const SpacedRepetitionParamsSchema = z.object({
  easeFactor: z.number().min(1.3).max(2.5).default(2.5),
  interval: z.number().min(1), // days
  repetitions: z.number().min(0).default(0),
  nextReviewDate: z.string().datetime(),
});
export type SpacedRepetitionParams = z.infer<typeof SpacedRepetitionParamsSchema>;

/**
 * Performance quality rating (0-5 scale, SM-2 compatible)
 */
export const QualityRatingSchema = z.number().min(0).max(5);
export type QualityRating = z.infer<typeof QualityRatingSchema>;

/**
 * Learner profile for adaptive recommendations
 */
export const LearnerProfileSchema = z.object({
  learnerId: z.string(),

  // Aggregated metrics
  overallMastery: z.number().min(0).max(1),
  averageLearningVelocity: z.number(),
  totalTimeSpent: z.number().min(0), // minutes

  // Patterns
  preferredSessionLength: z.number().min(0), // minutes
  optimalTimeOfDay: z.enum(['morning', 'midday', 'afternoon', 'evening', 'night']).optional(),
  averageAccuracy: z.number().min(0).max(1),

  // Engagement
  completionRate: z.number().min(0).max(1),
  streakDays: z.number().min(0),
  lastActiveDate: z.string().datetime().optional(),
});
export type LearnerProfile = z.infer<typeof LearnerProfileSchema>;
