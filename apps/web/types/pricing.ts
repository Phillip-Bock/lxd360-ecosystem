// ============================================================================
// ENUMS
// ============================================================================

export type ProductType = 'inspire_studio' | 'lxp360' | 'lxd360_complete';

export type TierLevel =
  | 'free'
  | 'micro'
  | 'starter'
  | 'growth'
  | 'scale'
  | 'professional'
  | 'enterprise';

export type BillingPeriod = 'monthly' | 'quarterly' | 'yearly';

export type AddonCategory =
  | 'ai'
  | 'engagement'
  | 'revenue'
  | 'branding'
  | 'integration'
  | 'security'
  | 'compliance'
  | 'analytics'
  | 'infrastructure'
  | 'support';

export type FeatureCategory =
  | 'core'
  | 'content'
  | 'learning'
  | 'assessment'
  | 'reporting'
  | 'administration'
  | 'integration'
  | 'security'
  | 'support'
  | 'ai'
  | 'compliance'
  | 'branding';

export type DiscountType =
  | 'education'
  | 'nonprofit'
  | 'startup'
  | 'veteran'
  | 'multiyear'
  | 'volume'
  | 'partner'
  | 'promo';

export type VerificationMethod =
  | 'email'
  | 'manual'
  | 'sheerid'
  | 'sam'
  | 'document'
  | 'code'
  | 'automatic';

// ============================================================================
// FEATURE TYPES
// ============================================================================

export interface PricingFeature {
  id: string;
  name: string;
  slug: string;
  description?: string;
  tooltip?: string;
  category?: FeatureCategory;
  icon?: string;
  isHighlight?: boolean;
  isNew?: boolean;
  isBeta?: boolean;
  displayOrder: number;
  comparisonGroup?: string;
}

export interface TierFeature {
  feature: PricingFeature;
  limit?: string;
  included: boolean;
}

// ============================================================================
// PRODUCT TYPES
// ============================================================================

export interface PricingProduct {
  id: string;
  name: string;
  slug: string;
  productType: ProductType;
  tagline?: string;
  description?: string;
  icon?: string;
  color?: string;
  imageUrl?: string;
  features: PricingFeature[];
  tiers: PricingTier[];
  displayOrder: number;
  isActive: boolean;
}

// ============================================================================
// TIER TYPES
// ============================================================================

export interface PricingTier {
  id: string;
  name: string;
  slug: string;
  productId: string;
  tierLevel?: TierLevel;
  description?: string;
  targetAudience?: string;

  // Pricing (in cents)
  priceMonthly?: number;
  priceQuarterly?: number;
  priceYearly?: number;
  isCustomPricing: boolean;
  setupFee?: number;

  // Limits
  authorSeats?: number; // -1 for unlimited
  learnerLimit?: number; // -1 for unlimited
  storageGB?: number;
  monthlyTokens?: number;
  coursesLimit?: number;
  certificatesLimit?: number;

  // Features
  features: TierFeature[];
  highlightFeatures: string[];
  includedAddons: PricingAddon[];

  // Stripe
  stripeProductId?: string;
  stripePriceIdMonthly?: string;
  stripePriceIdQuarterly?: string;
  stripePriceIdYearly?: string;

  // Display
  isPopular: boolean;
  popularBadgeText?: string;
  ctaText: string;
  ctaUrl?: string;
  displayOrder: number;
  isActive: boolean;

  // Trial
  trialDays?: number;
  trialTokenCap?: number;
  requiresCreditCard?: boolean;
}

// ============================================================================
// ADDON TYPES
// ============================================================================

export interface AddonLimits {
  apiCalls?: number;
  storage?: number;
  tokens?: number;
  users?: number;
}

export interface PricingAddon {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: AddonCategory;
  icon?: string;

  // Pricing (in cents)
  priceMonthly: number;
  priceYearly?: number;
  isPerSeat?: boolean;
  isPerLearner?: boolean;

  // Availability
  applicableProductIds: string[];
  minimumTier?: TierLevel | 'all';
  includedInTierIds: string[];
  requiredAddonIds: string[];
  incompatibleAddonIds: string[];

  // Features
  features: string[];
  limits?: AddonLimits;

  // Stripe
  stripeProductId?: string;
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;

  // Display
  displayOrder: number;
  isActive: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  comingSoon?: boolean;
}

// ============================================================================
// DISCOUNT TYPES
// ============================================================================

export interface PricingDiscount {
  id: string;
  name: string;
  slug: string;
  description?: string;
  discountType: DiscountType;
  icon?: string;

  // Terms
  discountPercent: number;
  discountAmount?: number; // Fixed amount in cents
  applicableProductIds: string[];
  applicableTierIds: string[];
  excludedAddonIds: string[];
  minimumCommitment?: 'none' | 'monthly' | 'quarterly' | 'annual' | '2year' | '3year';
  isStackable: boolean;
  maxUses?: number;
  usesPerCustomer?: number;

  // Verification
  eligibility: string[];
  verificationMethod?: VerificationMethod;
  allowedDomains?: string[];
  verificationUrl?: string;
  requiredDocuments?: string[];

  // Stripe
  stripeCouponId?: string;
  stripePromotionCodeId?: string;
  promoCode?: string;

  // Dates
  startsAt?: string;
  expiresAt?: string;

  // Display
  displayOrder: number;
  isActive: boolean;
  showOnPricingPage: boolean;
  ctaText: string;
  ctaUrl?: string;
}

// ============================================================================
// TESTIMONIAL TYPES
// ============================================================================

export interface PricingTestimonial {
  id: string;
  quote: string;
  author: string;
  role?: string;
  company?: string;
  companyLogoUrl?: string;
  avatarUrl?: string;
  productId?: string;
  tierId?: string;
  metrics?: {
    roiPercent?: number;
    timeSaved?: number;
    costSavings?: number;
    completionRate?: number;
  };
  rating?: number;
  videoUrl?: string;
  caseStudyUrl?: string;
  displayOrder: number;
  isActive: boolean;
  showOnPricingPage: boolean;
}

// ============================================================================
// CHECKOUT TYPES
// ============================================================================

export interface CheckoutItem {
  type: 'tier' | 'addon';
  id: string;
  name: string;
  priceId: string;
  quantity: number;
  unitAmount: number; // In cents
}

export interface CheckoutSession {
  items: CheckoutItem[];
  billingPeriod: BillingPeriod;
  subtotal: number;
  discount?: {
    code: string;
    amount: number;
    percent?: number;
  };
  total: number;
  trialDays?: number;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

export interface CheckoutRequest {
  tierId: string;
  addonIds?: string[];
  billingPeriod: BillingPeriod;
  couponCode?: string;
  trialDays?: number;
}

export interface CheckoutResponse {
  url: string;
  sessionId: string;
}

// ============================================================================
// PRICING PAGE TYPES
// ============================================================================

export interface PricingPageData {
  products: PricingProduct[];
  addons: PricingAddon[];
  discounts: PricingDiscount[];
  testimonials: PricingTestimonial[];
}

export interface ProductPricingPageData {
  product: PricingProduct;
  relatedAddons: PricingAddon[];
  testimonials: PricingTestimonial[];
  discounts: PricingDiscount[];
}

// ============================================================================
// ROI CALCULATOR TYPES
// ============================================================================

export interface ROIInputs {
  learners: number;
  coursesPerYear: number;
  avgCourseLength: number; // minutes
  currentLMSCost: number;
  hrlyWage: number;
  currentCompletionRate: number;
  travelTrainingPercent: number;
  avgTravelCost: number;
}

export interface ROIResults {
  hoursSaved: number;
  timeSavingsValue: number;
  completionImprovement: number;
  travelSavings: number;
  lxp360Cost: number;
  lmsSavings: number;
  totalSavings: number;
  roi: number;
}

// ============================================================================
// COMPARISON TABLE TYPES
// ============================================================================

export interface ComparisonFeatureRow {
  feature: PricingFeature;
  values: Record<string, string | boolean>;
}

export interface ComparisonTable {
  product: PricingProduct;
  tiers: PricingTier[];
  featureGroups: {
    name: string;
    features: ComparisonFeatureRow[];
  }[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type PriceFormatter = (
  amount: number,
  options?: {
    showCents?: boolean;
    currency?: string;
  },
) => string;

export type BillingPeriodLabel = {
  [K in BillingPeriod]: {
    short: string;
    long: string;
    perUnit: string;
  };
};

export const BILLING_PERIOD_LABELS: BillingPeriodLabel = {
  monthly: { short: 'mo', long: 'Monthly', perUnit: '/month' },
  quarterly: { short: 'qtr', long: 'Quarterly', perUnit: '/quarter' },
  yearly: { short: 'yr', long: 'Yearly', perUnit: '/year' },
};

export const ADDON_CATEGORY_LABELS: Record<AddonCategory, string> = {
  ai: 'AI & Adaptive Learning',
  engagement: 'Engagement & Gamification',
  revenue: 'E-Commerce & Revenue',
  branding: 'Branding & White Label',
  integration: 'Integrations',
  security: 'Security & SSO',
  compliance: 'Accessibility & Compliance',
  analytics: 'Analytics & Insights',
  infrastructure: 'Infrastructure',
  support: 'Support',
};

export const TIER_LEVEL_ORDER: TierLevel[] = [
  'free',
  'micro',
  'starter',
  'growth',
  'scale',
  'professional',
  'enterprise',
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format price in cents to display string
 */
export function formatPrice(cents: number, showCents = false): string {
  const dollars = cents / 100;
  return showCents ? `$${dollars.toFixed(2)}` : `$${Math.round(dollars).toLocaleString()}`;
}

/**
 * Calculate monthly equivalent for different billing periods
 */
export function getMonthlyEquivalent(price: number, period: BillingPeriod): number {
  switch (period) {
    case 'quarterly':
      return Math.round(price / 3);
    case 'yearly':
      return Math.round(price / 12);
    default:
      return price;
  }
}

/**
 * Calculate savings percentage for yearly vs monthly
 */
export function calculateSavings(monthlyPrice: number, yearlyPrice: number): number {
  const monthlyAnnual = monthlyPrice * 12;
  if (monthlyAnnual === 0) return 0;
  return Math.round(((monthlyAnnual - yearlyPrice) / monthlyAnnual) * 100);
}

/**
 * Get price for a tier based on billing period
 */
export function getTierPrice(tier: PricingTier, period: BillingPeriod): number | null {
  if (tier.isCustomPricing) return null;
  switch (period) {
    case 'monthly':
      return tier.priceMonthly ?? null;
    case 'quarterly':
      return tier.priceQuarterly ?? null;
    case 'yearly':
      return tier.priceYearly ?? null;
  }
}

/**
 * Get Stripe price ID for a tier based on billing period
 */
export function getStripePriceId(tier: PricingTier, period: BillingPeriod): string | undefined {
  switch (period) {
    case 'monthly':
      return tier.stripePriceIdMonthly;
    case 'quarterly':
      return tier.stripePriceIdQuarterly;
    case 'yearly':
      return tier.stripePriceIdYearly;
  }
}

/**
 * Check if a tier is higher than another
 */
export function isTierHigher(tier1: TierLevel, tier2: TierLevel): boolean {
  return TIER_LEVEL_ORDER.indexOf(tier1) > TIER_LEVEL_ORDER.indexOf(tier2);
}

/**
 * Format limit display (-1 means unlimited)
 */
export function formatLimit(value: number | undefined): string {
  if (value === undefined) return '-';
  if (value === -1) return 'Unlimited';
  return value.toLocaleString();
}
