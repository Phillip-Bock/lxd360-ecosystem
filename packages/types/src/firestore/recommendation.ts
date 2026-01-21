/**
 * Firestore Recommendation Schema Definitions
 *
 * Active recommendations are stored per learner for real-time
 * adaptive content delivery via Modality Swapper and JITAI.
 *
 * @module @inspire/types/firestore/recommendation
 */

import { z } from 'zod';

// ============================================================================
// GLASS BOX EXPLANATION (EU AI Act Compliance)
// ============================================================================

export const FeatureContributionDirectionSchema = z.enum(['supports', 'opposes']);

export const FeatureContributionSchema = z.object({
  /** Factor name (e.g., "Recent incorrect answers") */
  factor: z.string(),
  /** Factor value (e.g., "3 in last 5 attempts") */
  value: z.string(),
  /** Weight of this factor in the decision (-1 to 1) */
  weight: z.number().min(-1).max(1),
  /** Whether this factor supports or opposes the recommendation */
  direction: FeatureContributionDirectionSchema,
});

export const GlassBoxExplanationSchema = z.object({
  /** Short human-readable explanation */
  shortExplanation: z.string(),
  /** Detailed feature contributions for transparency */
  featureContributions: z.array(FeatureContributionSchema),
  /** AI model version that generated this recommendation */
  modelVersion: z.string(),
  /** When the explanation was generated */
  generatedAt: z.union([z.string().datetime(), z.date()]),
});

// ============================================================================
// OVERRIDE OPTIONS (Learner Agency)
// ============================================================================

export const AlternativeActivitySchema = z.object({
  /** Alternative activity ID */
  activityId: z.string(),
  /** Alternative activity name */
  activityName: z.string(),
  /** Suggested modality for this alternative */
  modality: z.string(),
});

export const OverrideOptionsSchema = z.object({
  /** Learner can skip this recommendation */
  canSkip: z.boolean(),
  /** Learner can adjust difficulty */
  canAdjustDifficulty: z.boolean(),
  /** Learner can change modality */
  canChangeModality: z.boolean(),
  /** Alternative activities the learner can choose */
  alternatives: z.array(AlternativeActivitySchema),
});

// ============================================================================
// ACTIVE RECOMMENDATION
// ============================================================================

export const RecommendationTypeSchema = z.enum(['modality', 'content', 'intervention', 'review']);

export const RecommendationStatusSchema = z.enum(['active', 'accepted', 'overridden', 'expired']);

export const ActiveRecommendationSchema = z.object({
  /** Recommendation UUID */
  id: z.string().uuid(),
  /** Type of recommendation */
  type: RecommendationTypeSchema,

  // Recommendation Details
  /** Recommended activity ID */
  targetActivityId: z.string(),
  /** Recommended activity name */
  targetActivityName: z.string(),
  /** Suggested content modality */
  suggestedModality: z.string().optional(),
  /** AI confidence in this recommendation (0-1) */
  confidence: z.number().min(0).max(1),

  // Glass Box Explanation (EU AI Act)
  /** Explainable AI transparency data */
  explanation: GlassBoxExplanationSchema,

  // Learner Override Options
  /** Options for learner to override AI recommendation */
  overrideOptions: OverrideOptionsSchema,

  // Status Tracking
  /** Current status of this recommendation */
  status: RecommendationStatusSchema,
  /** When the learner overrode this recommendation */
  overriddenAt: z.union([z.string().datetime(), z.date()]).optional(),
  /** Learner's reason for override */
  overrideReason: z.string().optional(),

  // Metadata
  /** When this recommendation was created */
  createdAt: z.union([z.string().datetime(), z.date()]),
  /** When this recommendation expires */
  expiresAt: z.union([z.string().datetime(), z.date()]),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type FeatureContributionDirection = z.infer<typeof FeatureContributionDirectionSchema>;
export type FeatureContribution = z.infer<typeof FeatureContributionSchema>;
export type GlassBoxExplanation = z.infer<typeof GlassBoxExplanationSchema>;
export type AlternativeActivity = z.infer<typeof AlternativeActivitySchema>;
export type OverrideOptions = z.infer<typeof OverrideOptionsSchema>;
export type RecommendationType = z.infer<typeof RecommendationTypeSchema>;
export type RecommendationStatus = z.infer<typeof RecommendationStatusSchema>;
export type ActiveRecommendation = z.infer<typeof ActiveRecommendationSchema>;
