/**
 * Firestore Learner Schema Definitions
 *
 * @module @inspire/types/firestore/learner
 */

import { z } from 'zod';

// ============================================================================
// LEARNER PREFERENCES
// ============================================================================

export const AccessibilityPreferencesSchema = z.object({
  dyslexiaFriendly: z.boolean().default(false),
  seizureSafe: z.boolean().default(false),
  highContrast: z.boolean().default(false),
  reducedMotion: z.boolean().default(false),
  screenReader: z.boolean().default(false),
});

export const LearnerPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  language: z.string().default('en-US'),
  accessibility: AccessibilityPreferencesSchema.default({}),
  modalityPreference: z.enum(['text', 'video', 'audio', 'interactive']).optional(),
});

// ============================================================================
// LEARNER PROFILE
// ============================================================================

export const LearnerRoleSchema = z.enum(['learner', 'mentee', 'mentor', 'instructor']);

export const LearnerProfileSchema = z.object({
  /** User's unique identifier */
  uid: z.string(),
  /** Tenant/organization ID */
  tenantId: z.string(),
  /** Email address */
  email: z.string().email(),
  /** Display name */
  displayName: z.string(),
  /** Role within the organization */
  role: LearnerRoleSchema,
  /** User preferences */
  preferences: LearnerPreferencesSchema.default({}),
  /** Profile creation timestamp (Firestore Timestamp or ISO string) */
  createdAt: z.union([z.string().datetime(), z.date()]),
  /** Last update timestamp */
  updatedAt: z.union([z.string().datetime(), z.date()]),
  /** Last activity timestamp */
  lastActiveAt: z.union([z.string().datetime(), z.date()]),
});

// ============================================================================
// MASTERY STATE (BKT + SM-2)
// ============================================================================

export const MasteryStateSchema = z.object({
  /** Skill identifier */
  skillId: z.string(),
  /** Human-readable skill name */
  skillName: z.string(),

  // BKT (Bayesian Knowledge Tracing) Parameters
  /** Probability of mastery (0-1) */
  pMastery: z.number().min(0).max(1),
  /** Probability of learning per opportunity (0-1) */
  pLearn: z.number().min(0).max(1).default(0.1),
  /** Probability of guessing correctly when not mastered (0-1) */
  pGuess: z.number().min(0).max(1).default(0.2),
  /** Probability of slipping (error when mastered) (0-1) */
  pSlip: z.number().min(0).max(1).default(0.1),

  // Tracking Metrics
  /** Total number of practice opportunities */
  opportunities: z.number().int().min(0),
  /** Number of correct responses */
  correctCount: z.number().int().min(0),
  /** Number of incorrect responses */
  incorrectCount: z.number().int().min(0),

  // SM-2 Spaced Repetition Parameters
  /** Easiness factor for SM-2 algorithm (minimum 1.3) */
  easinessFactor: z.number().min(1.3).default(2.5),
  /** Current interval in days */
  interval: z.number().int().min(0).default(0),
  /** Number of successful repetitions */
  repetitions: z.number().int().min(0).default(0),
  /** Next scheduled review date */
  nextReviewDate: z.union([z.string().datetime(), z.date()]).optional(),

  // Metadata
  /** Last update timestamp */
  lastUpdated: z.union([z.string().datetime(), z.date()]),
  /** ID of the last interaction that updated this state */
  lastInteractionId: z.string().optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type AccessibilityPreferences = z.infer<typeof AccessibilityPreferencesSchema>;
export type LearnerPreferences = z.infer<typeof LearnerPreferencesSchema>;
export type LearnerRole = z.infer<typeof LearnerRoleSchema>;
export type LearnerProfile = z.infer<typeof LearnerProfileSchema>;
export type MasteryState = z.infer<typeof MasteryStateSchema>;
