/**
 * Firestore Tenant Schema Definitions
 *
 * @module @inspire/types/firestore/tenant
 */

import { z } from 'zod';

// ============================================================================
// TENANT CONFIGURATION
// ============================================================================

export const TenantBrandingSchema = z.object({
  /** Primary brand color (hex) */
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .default('#0072f5'),
  /** Logo URL */
  logoUrl: z.string().url().optional(),
  /** Favicon URL */
  faviconUrl: z.string().url().optional(),
  /** Custom CSS */
  customCss: z.string().optional(),
});

export const TenantFeaturesSchema = z.object({
  /** Enable AI-powered adaptive learning */
  adaptiveLearning: z.boolean().default(true),
  /** Enable spaced repetition */
  spacedRepetition: z.boolean().default(true),
  /** Enable cognitive load monitoring */
  cognitiveLoadMonitoring: z.boolean().default(true),
  /** Enable Glass Box AI explanations */
  glassBoxExplanations: z.boolean().default(true),
  /** Enable JITAI interventions */
  jitaiInterventions: z.boolean().default(true),
  /** Enable cross-tenant learning (federated) */
  federatedLearning: z.boolean().default(false),
});

export const TenantComplianceSchema = z.object({
  /** Data residency requirement */
  dataResidency: z.enum(['us', 'eu', 'global']).default('us'),
  /** HIPAA compliance required */
  hipaaCompliant: z.boolean().default(false),
  /** GDPR compliance required */
  gdprCompliant: z.boolean().default(false),
  /** FedRAMP compliance required */
  fedRampCompliant: z.boolean().default(false),
  /** Data retention period in days */
  dataRetentionDays: z.number().int().min(365).max(2557).default(2557),
});

export const TenantSubscriptionTierSchema = z.enum([
  'free',
  'starter',
  'professional',
  'enterprise',
  'government',
]);

export const TenantSchema = z.object({
  /** Tenant unique identifier */
  id: z.string(),
  /** Organization name */
  name: z.string().min(1).max(200),
  /** Organization slug (URL-safe identifier) */
  slug: z.string().regex(/^[a-z0-9-]+$/),
  /** Subscription tier */
  subscriptionTier: TenantSubscriptionTierSchema,
  /** Stripe customer ID */
  stripeCustomerId: z.string().optional(),
  /** Stripe subscription ID */
  stripeSubscriptionId: z.string().optional(),
  /** Branding configuration */
  branding: TenantBrandingSchema.default({}),
  /** Feature flags */
  features: TenantFeaturesSchema.default({}),
  /** Compliance settings */
  compliance: TenantComplianceSchema.default({}),
  /** Maximum number of users */
  maxUsers: z.number().int().min(1).default(10),
  /** Current user count */
  userCount: z.number().int().min(0).default(0),
  /** Tenant is active */
  isActive: z.boolean().default(true),
  /** Creation timestamp */
  createdAt: z.union([z.string().datetime(), z.date()]),
  /** Last update timestamp */
  updatedAt: z.union([z.string().datetime(), z.date()]),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type TenantBranding = z.infer<typeof TenantBrandingSchema>;
export type TenantFeatures = z.infer<typeof TenantFeaturesSchema>;
export type TenantCompliance = z.infer<typeof TenantComplianceSchema>;
export type TenantSubscriptionTier = z.infer<typeof TenantSubscriptionTierSchema>;
export type Tenant = z.infer<typeof TenantSchema>;
