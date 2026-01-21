/**
 * LXP360 Feature Flags System
 * Manages features based on subscription tier and add-ons
 */

// ============================================
// Subscription Tiers
// ============================================

export type SubscriptionTier = 'micro' | 'growth' | 'scale' | 'enterprise';
export type SupportLevel = 'community' | 'standard' | 'priority' | 'premium' | 'platinum';

export interface TierLimits {
  maxLearners: number | null; // null = unlimited
  maxCourses: number | null;
  maxStorageGb: number | null;
  maxAdmins: number | null;
  maxInstructors: number | null;
  maxGroups: number | null;
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  micro: {
    maxLearners: 5,
    maxCourses: 10,
    maxStorageGb: 5,
    maxAdmins: 1,
    maxInstructors: 1,
    maxGroups: 2,
  },
  growth: {
    maxLearners: 20,
    maxCourses: 50,
    maxStorageGb: 25,
    maxAdmins: 3,
    maxInstructors: 3,
    maxGroups: 10,
  },
  scale: {
    maxLearners: 100,
    maxCourses: 200,
    maxStorageGb: 100,
    maxAdmins: 10,
    maxInstructors: 10,
    maxGroups: 50,
  },
  enterprise: {
    maxLearners: null,
    maxCourses: null,
    maxStorageGb: 500,
    maxAdmins: null,
    maxInstructors: null,
    maxGroups: null,
  },
};

export const TIER_PRICING: Record<SubscriptionTier, { monthly: number; yearly: number }> = {
  micro: { monthly: 39, yearly: 470 },
  growth: { monthly: 159, yearly: 1910 },
  scale: { monthly: 400, yearly: 4800 },
  enterprise: { monthly: 0, yearly: 0 }, // Custom pricing
};

// ============================================
// Feature Flags Interface
// ============================================

export interface FeatureFlags {
  // Base tier features
  tier: SubscriptionTier;
  limits: TierLimits;
  supportLevel: SupportLevel;

  // Core Features (by tier)
  courseCreation: boolean;
  quizBuilder: boolean;
  basicReporting: boolean;
  certificateGeneration: boolean;
  learnerManagement: boolean;
  scormSupport: boolean;
  xapiSupport: boolean;
  inspireIntegration: boolean;

  // Add-on Features
  socialLearning: boolean; // Discussions, groups, Q&A
  gamification: boolean; // Points, badges, leaderboards
  advancedReporting: boolean; // Custom reports, BigQuery export
  ecommerce: boolean; // Sell courses
  whiteLabel: boolean; // Custom branding
  customDomain: boolean; // Custom domain
  brandedMobileApp: boolean; // App store app
  multiTenancy: boolean; // Multiple client organizations
  ssoSaml: boolean; // Enterprise SSO
  lrsAccess: boolean; // xAPI statement access/export
  apiAccess: boolean; // REST API access
  webhooks: boolean; // Webhook notifications
  hrisIntegration: boolean; // Workday, BambooHR, etc.
  complianceAutomation: boolean; // Auto-assign, tracking
  accessibilityPro: boolean; // WCAG checker, VPATs
  neurodiversityToolkit: boolean; // Learner accessibility controls
  cognitiveInsights: boolean; // Cognitive load analytics
  adaptiveAI: boolean; // ML-based adaptive learning
  aiCoaching: boolean; // AI practice scenarios
  multiLmsDistribution: boolean; // Publish to external LMS
  customBranding: boolean; // Logo, colors, fonts
  advancedAnalytics: boolean; // Dashboards, insights
  skillsFramework: boolean; // Skills management
  learningPaths: boolean; // Learning path builder
  contentLibrary: boolean; // Content repository
  calendarIntegration: boolean; // ILT/webinar scheduling
  notifications: boolean; // Email/push notifications
  bulkOperations: boolean; // Bulk import/export
}

// Helper type to extract only the boolean feature keys
type BooleanFeatureKeys = {
  [K in keyof FeatureFlags]: FeatureFlags[K] extends boolean ? K : never;
}[keyof FeatureFlags];

// ============================================
// Tier-based Feature Configuration
// ============================================

const TIER_FEATURES: Record<SubscriptionTier, Partial<FeatureFlags>> = {
  micro: {
    courseCreation: true,
    quizBuilder: true,
    basicReporting: true,
    certificateGeneration: true,
    learnerManagement: true,
    scormSupport: false,
    xapiSupport: false,
    inspireIntegration: false,
    socialLearning: false,
    gamification: false,
    advancedReporting: false,
    ecommerce: false,
    whiteLabel: false,
    customDomain: false,
    brandedMobileApp: false,
    multiTenancy: false,
    ssoSaml: false,
    lrsAccess: false,
    apiAccess: false,
    webhooks: false,
    hrisIntegration: false,
    complianceAutomation: false,
    accessibilityPro: false,
    neurodiversityToolkit: false,
    cognitiveInsights: false,
    adaptiveAI: false,
    aiCoaching: false,
    multiLmsDistribution: false,
    customBranding: false,
    advancedAnalytics: false,
    skillsFramework: false,
    learningPaths: false,
    contentLibrary: true,
    calendarIntegration: false,
    notifications: true,
    bulkOperations: false,
  },
  growth: {
    courseCreation: true,
    quizBuilder: true,
    basicReporting: true,
    certificateGeneration: true,
    learnerManagement: true,
    scormSupport: true,
    xapiSupport: true,
    inspireIntegration: true,
    socialLearning: true,
    gamification: true,
    advancedReporting: false,
    ecommerce: false,
    whiteLabel: false,
    customDomain: false,
    brandedMobileApp: false,
    multiTenancy: false,
    ssoSaml: false,
    lrsAccess: true,
    apiAccess: false,
    webhooks: false,
    hrisIntegration: false,
    complianceAutomation: true,
    accessibilityPro: false,
    neurodiversityToolkit: true,
    cognitiveInsights: false,
    adaptiveAI: false,
    aiCoaching: false,
    multiLmsDistribution: false,
    customBranding: true,
    advancedAnalytics: false,
    skillsFramework: true,
    learningPaths: true,
    contentLibrary: true,
    calendarIntegration: true,
    notifications: true,
    bulkOperations: true,
  },
  scale: {
    courseCreation: true,
    quizBuilder: true,
    basicReporting: true,
    certificateGeneration: true,
    learnerManagement: true,
    scormSupport: true,
    xapiSupport: true,
    inspireIntegration: true,
    socialLearning: true,
    gamification: true,
    advancedReporting: true,
    ecommerce: false,
    whiteLabel: false,
    customDomain: false,
    brandedMobileApp: false,
    multiTenancy: false,
    ssoSaml: true,
    lrsAccess: true,
    apiAccess: true,
    webhooks: true,
    hrisIntegration: true,
    complianceAutomation: true,
    accessibilityPro: true,
    neurodiversityToolkit: true,
    cognitiveInsights: true,
    adaptiveAI: true,
    aiCoaching: false,
    multiLmsDistribution: false,
    customBranding: true,
    advancedAnalytics: true,
    skillsFramework: true,
    learningPaths: true,
    contentLibrary: true,
    calendarIntegration: true,
    notifications: true,
    bulkOperations: true,
  },
  enterprise: {
    courseCreation: true,
    quizBuilder: true,
    basicReporting: true,
    certificateGeneration: true,
    learnerManagement: true,
    scormSupport: true,
    xapiSupport: true,
    inspireIntegration: true,
    socialLearning: true,
    gamification: true,
    advancedReporting: true,
    ecommerce: true,
    whiteLabel: true,
    customDomain: true,
    brandedMobileApp: true,
    multiTenancy: true,
    ssoSaml: true,
    lrsAccess: true,
    apiAccess: true,
    webhooks: true,
    hrisIntegration: true,
    complianceAutomation: true,
    accessibilityPro: true,
    neurodiversityToolkit: true,
    cognitiveInsights: true,
    adaptiveAI: true,
    aiCoaching: true,
    multiLmsDistribution: true,
    customBranding: true,
    advancedAnalytics: true,
    skillsFramework: true,
    learningPaths: true,
    contentLibrary: true,
    calendarIntegration: true,
    notifications: true,
    bulkOperations: true,
  },
};

const TIER_SUPPORT: Record<SubscriptionTier, SupportLevel> = {
  micro: 'community',
  growth: 'standard',
  scale: 'priority',
  enterprise: 'platinum',
};

// ============================================
// Add-on Definitions
// ============================================

export interface AddOn {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: BooleanFeatureKeys[];
  requiredTier?: SubscriptionTier;
  icon: string;
}

export const AVAILABLE_ADDONS: AddOn[] = [
  {
    id: 'addon-social',
    name: 'Social Learning',
    description: 'Discussion forums, learning groups, Q&A, and expert mentorship',
    monthlyPrice: 49,
    yearlyPrice: 490,
    features: ['socialLearning'],
    requiredTier: 'micro',
    icon: 'Users',
  },
  {
    id: 'addon-gamification',
    name: 'Gamification',
    description: 'Points, badges, leaderboards, and rewards marketplace',
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: ['gamification'],
    requiredTier: 'micro',
    icon: 'Trophy',
  },
  {
    id: 'addon-reporting',
    name: 'Advanced Reporting',
    description: 'Custom report builder, scheduled reports, and BigQuery export',
    monthlyPrice: 79,
    yearlyPrice: 790,
    features: ['advancedReporting', 'advancedAnalytics'],
    requiredTier: 'growth',
    icon: 'BarChart2',
  },
  {
    id: 'addon-ecommerce',
    name: 'E-Commerce',
    description: 'Sell courses, subscriptions, coupons, and affiliate program',
    monthlyPrice: 99,
    yearlyPrice: 990,
    features: ['ecommerce'],
    requiredTier: 'scale',
    icon: 'ShoppingCart',
  },
  {
    id: 'addon-whitelabel',
    name: 'White Label',
    description: 'Custom branding, domain, email templates, and mobile app',
    monthlyPrice: 199,
    yearlyPrice: 1990,
    features: ['whiteLabel', 'customDomain', 'brandedMobileApp'],
    requiredTier: 'scale',
    icon: 'Palette',
  },
  {
    id: 'addon-ai',
    name: 'AI Coaching',
    description: 'AI-powered coaching, practice scenarios, and adaptive learning',
    monthlyPrice: 149,
    yearlyPrice: 1490,
    features: ['aiCoaching', 'adaptiveAI', 'cognitiveInsights'],
    requiredTier: 'growth',
    icon: 'Brain',
  },
  {
    id: 'addon-accessibility',
    name: 'Accessibility Pro',
    description: 'WCAG checker, VPAT reports, and neurodiversity toolkit',
    monthlyPrice: 59,
    yearlyPrice: 590,
    features: ['accessibilityPro', 'neurodiversityToolkit'],
    requiredTier: 'growth',
    icon: 'Accessibility',
  },
  {
    id: 'addon-api',
    name: 'API Access',
    description: 'REST API, webhooks, and third-party integrations',
    monthlyPrice: 99,
    yearlyPrice: 990,
    features: ['apiAccess', 'webhooks'],
    requiredTier: 'growth',
    icon: 'Code',
  },
  {
    id: 'addon-hris',
    name: 'HRIS Integration',
    description: 'Workday, BambooHR, ADP, and other HR system integrations',
    monthlyPrice: 149,
    yearlyPrice: 1490,
    features: ['hrisIntegration'],
    requiredTier: 'scale',
    icon: 'Users2',
  },
  {
    id: 'addon-multitenant',
    name: 'Multi-Tenancy',
    description: 'Manage multiple client organizations from one account',
    monthlyPrice: 299,
    yearlyPrice: 2990,
    features: ['multiTenancy'],
    requiredTier: 'enterprise',
    icon: 'Building2',
  },
];

// ============================================
// Feature Flags Store
// ============================================

interface FeatureFlagsStore {
  tier: SubscriptionTier;
  addons: string[];
  overrides: Partial<FeatureFlags>;
}

// Default store - would be loaded from user's subscription in production
let featureFlagsStore: FeatureFlagsStore = {
  tier: 'growth', // Default tier for demo
  addons: ['addon-social', 'addon-gamification'], // Demo add-ons
  overrides: {},
};

// ============================================
// Feature Flags Functions
// ============================================

/**
 * Get the current feature flags based on subscription and add-ons
 */
export function getFeatureFlags(): FeatureFlags {
  const { tier, addons, overrides } = featureFlagsStore;

  // Start with tier-based features
  const tierFeatures = TIER_FEATURES[tier];
  const limits = TIER_LIMITS[tier];
  const supportLevel = TIER_SUPPORT[tier];

  // Base feature flags
  const flags: FeatureFlags = {
    tier,
    limits,
    supportLevel,
    ...tierFeatures,
  } as FeatureFlags;

  // Apply add-on features
  addons.forEach((addonId) => {
    const addon = AVAILABLE_ADDONS.find((a) => a.id === addonId);
    if (addon) {
      addon.features.forEach((feature) => {
        flags[feature] = true;
      });
    }
  });

  // Apply overrides (for testing/admin purposes)
  Object.assign(flags, overrides);

  return flags;
}

/**
 * Check if a specific feature is enabled
 */
export function hasFeature(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return !!flags[feature];
}

/**
 * Check if multiple features are all enabled
 */
export function hasAllFeatures(features: (keyof FeatureFlags)[]): boolean {
  const flags = getFeatureFlags();
  return features.every((f) => !!flags[f]);
}

/**
 * Check if unknown of the specified features are enabled
 */
export function hasAnyFeature(features: (keyof FeatureFlags)[]): boolean {
  const flags = getFeatureFlags();
  return features.some((f) => !!flags[f]);
}

/**
 * Get the current tier limits
 */
export function getTierLimits(): TierLimits {
  return TIER_LIMITS[featureFlagsStore.tier];
}

/**
 * Check if a limit is reached
 */
export function isLimitReached(metric: keyof TierLimits, currentValue: number): boolean {
  const limits = getTierLimits();
  const limit = limits[metric];
  if (limit === null) return false; // Unlimited
  return currentValue >= limit;
}

/**
 * Get available add-ons for the current tier
 */
export function getAvailableAddons(): AddOn[] {
  const { tier } = featureFlagsStore;
  const tierIndex = ['micro', 'growth', 'scale', 'enterprise'].indexOf(tier);

  return AVAILABLE_ADDONS.filter((addon) => {
    if (!addon.requiredTier) return true;
    const requiredIndex = ['micro', 'growth', 'scale', 'enterprise'].indexOf(addon.requiredTier);
    return tierIndex >= requiredIndex;
  });
}

/**
 * Check if an add-on is active
 */
export function hasAddOn(addonId: string): boolean {
  return featureFlagsStore.addons.includes(addonId);
}

// ============================================
// Feature Flag Setters (Admin/Testing)
// ============================================

/**
 * Set the subscription tier (admin use)
 */
export function setTier(tier: SubscriptionTier): void {
  featureFlagsStore.tier = tier;
}

/**
 * Add an add-on
 */
export function addAddOn(addonId: string): void {
  if (!featureFlagsStore.addons.includes(addonId)) {
    featureFlagsStore.addons.push(addonId);
  }
}

/**
 * Remove an add-on
 */
export function removeAddOn(addonId: string): void {
  featureFlagsStore.addons = featureFlagsStore.addons.filter((id) => id !== addonId);
}

/**
 * Set feature override (for testing)
 */
export function setFeatureOverride(feature: BooleanFeatureKeys, value: boolean): void {
  featureFlagsStore.overrides[feature] = value;
}

/**
 * Clear all overrides
 */
export function clearOverrides(): void {
  featureFlagsStore.overrides = {};
}

/**
 * Reset to default state
 */
export function resetFeatureFlags(): void {
  featureFlagsStore = {
    tier: 'growth',
    addons: ['addon-social', 'addon-gamification'],
    overrides: {},
  };
}

// ============================================
// React Hook (for components)
// ============================================

import { useCallback, useEffect, useState } from 'react';

/**
 * React hook for accessing feature flags
 */
export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags>(getFeatureFlags());

  // Update flags when store changes
  useEffect(() => {
    setFlags(getFeatureFlags());
  }, []);

  const checkFeature = useCallback(
    (feature: keyof FeatureFlags) => {
      return !!flags[feature];
    },
    [flags],
  );

  const checkLimit = useCallback(
    (metric: keyof TierLimits, current: number) => {
      const limit = flags.limits[metric];
      if (limit === null) return { isReached: false, remaining: Infinity };
      return {
        isReached: current >= limit,
        remaining: Math.max(0, limit - current),
      };
    },
    [flags],
  );

  return {
    flags,
    hasFeature: checkFeature,
    checkLimit,
    tier: flags.tier,
    limits: flags.limits,
  };
}

// ============================================
// Feature Gate Component Types
// ============================================

export interface FeatureGateProps {
  feature: keyof FeatureFlags | (keyof FeatureFlags)[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

// ============================================
// Exports
// ============================================

const featureFlags = {
  getFeatureFlags,
  hasFeature,
  hasAllFeatures,
  hasAnyFeature,
  getTierLimits,
  isLimitReached,
  getAvailableAddons,
  hasAddOn,
  setTier,
  addAddOn,
  removeAddOn,
  setFeatureOverride,
  clearOverrides,
  resetFeatureFlags,
  useFeatureFlags,
  TIER_LIMITS,
  TIER_PRICING,
  AVAILABLE_ADDONS,
};

export default featureFlags;
