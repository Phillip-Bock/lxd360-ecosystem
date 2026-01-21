/**
 * Firestore Schema Exports
 *
 * @module @inspire/types/firestore
 */

// Interaction Types
export {
  type CognitiveLoad,
  CognitiveLoadSchema,
  type Interaction,
  InteractionSchema,
} from './interaction';
// Learner Types
export {
  type AccessibilityPreferences,
  AccessibilityPreferencesSchema,
  type LearnerPreferences,
  LearnerPreferencesSchema,
  type LearnerProfile,
  LearnerProfileSchema,
  type LearnerRole,
  LearnerRoleSchema,
  type MasteryState,
  MasteryStateSchema,
} from './learner';
// Recommendation Types
export {
  type ActiveRecommendation,
  ActiveRecommendationSchema,
  type AlternativeActivity,
  AlternativeActivitySchema,
  type FeatureContribution,
  type FeatureContributionDirection,
  FeatureContributionDirectionSchema,
  FeatureContributionSchema,
  type GlassBoxExplanation,
  GlassBoxExplanationSchema,
  type OverrideOptions,
  OverrideOptionsSchema,
  type RecommendationStatus,
  RecommendationStatusSchema,
  type RecommendationType,
  RecommendationTypeSchema,
} from './recommendation';
// Tenant Types
export {
  type Tenant,
  type TenantBranding,
  TenantBrandingSchema,
  type TenantCompliance,
  TenantComplianceSchema,
  type TenantFeatures,
  TenantFeaturesSchema,
  TenantSchema,
  type TenantSubscriptionTier,
  TenantSubscriptionTierSchema,
} from './tenant';
