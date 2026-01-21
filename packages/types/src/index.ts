/**
 * @inspire/types
 *
 * Shared type definitions for the INSPIRE LRS platform.
 *
 * @module @inspire/types
 */

// ============================================================================
// FIRESTORE SCHEMAS
// ============================================================================

export {
  type AccessibilityPreferences,
  // Learner
  AccessibilityPreferencesSchema,
  type ActiveRecommendation,
  // Recommendation
  ActiveRecommendationSchema,
  type AlternativeActivity,
  AlternativeActivitySchema,
  type CognitiveLoad,
  // Interaction
  CognitiveLoadSchema,
  type FeatureContribution,
  type FeatureContributionDirection,
  FeatureContributionDirectionSchema,
  FeatureContributionSchema,
  type GlassBoxExplanation,
  GlassBoxExplanationSchema,
  type Interaction,
  InteractionSchema,
  type LearnerPreferences,
  LearnerPreferencesSchema,
  type LearnerProfile,
  LearnerProfileSchema,
  type LearnerRole,
  LearnerRoleSchema,
  type MasteryState,
  MasteryStateSchema,
  type OverrideOptions,
  OverrideOptionsSchema,
  type RecommendationStatus,
  RecommendationStatusSchema,
  type RecommendationType,
  RecommendationTypeSchema,
  type Tenant,
  type TenantBranding,
  // Tenant
  TenantBrandingSchema,
  type TenantCompliance,
  TenantComplianceSchema,
  type TenantFeatures,
  TenantFeaturesSchema,
  TenantSchema,
  type TenantSubscriptionTier,
  TenantSubscriptionTierSchema,
} from './firestore';

// ============================================================================
// BIGQUERY SCHEMAS
// ============================================================================

export {
  BIGQUERY_TABLE_SQL,
  type BigQueryXAPIStatement,
  BigQueryXAPIStatementSchema,
} from './bigquery';

// ============================================================================
// CONSTANTS
// ============================================================================

export {
  // Extensions
  CONSENT_TIERS,
  CONTENT_MODALITIES,
  type ConsentTier,
  type ContentModality,
  FUNCTIONAL_STATES,
  type FunctionalState,
  // Roles & Permissions
  getAllPermissions,
  hasPermission,
  INSPIRE_EXTENSIONS,
  type InspireExtensionIRI,
  type InspireExtensionKey,
  isRoleAtLeast,
  PERMISSIONS,
  type Permission,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
  type Role,
} from './constants';
