/**
 * =============================================================================
 * LXP360-SaaS | Stripe Configuration
 * =============================================================================
 *
 * Server-side Stripe configuration with plans and pricing definitions.
 */

import Stripe from 'stripe';

// =============================================================================
// STRIPE CLIENT
// =============================================================================

let stripeInstance: Stripe | null = null;

/**
 * Get the Stripe client instance (lazy initialization to avoid build-time errors)
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    });
  }
  return stripeInstance;
}

/**
 * @deprecated Use getStripe() function instead for lazy initialization
 */
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  : (null as unknown as Stripe);

// =============================================================================
// PLAN DEFINITIONS
// =============================================================================

export const PLANS = {
  free: {
    name: 'Free',
    description: 'For individuals getting started',
    priceId: null,
    monthlyPrice: 0,
    annualPrice: 0,
    features: ['3 courses', '100 learners', 'Basic analytics', 'Email support'],
    limits: {
      courses: 3,
      learners: 100,
      storage: 1024 * 1024 * 100, // 100MB
      apiCalls: 1000,
    },
  },
  professional: {
    name: 'Professional',
    description: 'For growing teams',
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID || null,
    monthlyPrice: 49,
    annualPrice: 470, // ~20% discount
    features: [
      'Unlimited courses',
      '1,000 learners',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
      'API access',
      'Webhooks',
      'SSO (Google, Microsoft)',
    ],
    limits: {
      courses: -1, // unlimited
      learners: 1000,
      storage: 1024 * 1024 * 1024 * 10, // 10GB
      apiCalls: 50000,
    },
  },
  enterprise: {
    name: 'Enterprise',
    description: 'For large organizations',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || null,
    monthlyPrice: null, // Custom pricing
    annualPrice: null,
    features: [
      'Unlimited everything',
      'Dedicated support',
      'SSO/SAML integration',
      'Custom integrations',
      'SLA guarantee (99.9% uptime)',
      'On-premise option',
      'Advanced security (SOC 2)',
      'Custom contracts',
      'Dedicated success manager',
    ],
    limits: {
      courses: -1,
      learners: -1,
      storage: -1,
      apiCalls: -1,
    },
  },
} as const;

export type PlanType = keyof typeof PLANS;
export type Plan = (typeof PLANS)[PlanType];

// =============================================================================
// SUBSCRIPTION STATUS
// =============================================================================

export const SUBSCRIPTION_STATUS = {
  active: 'active',
  past_due: 'past_due',
  unpaid: 'unpaid',
  canceled: 'canceled',
  incomplete: 'incomplete',
  incomplete_expired: 'incomplete_expired',
  trialing: 'trialing',
  paused: 'paused',
} as const;

export type SubscriptionStatus = keyof typeof SUBSCRIPTION_STATUS;

// =============================================================================
// TRIAL CONFIGURATION
// =============================================================================

export const TRIAL_DAYS = 14;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get plan by price ID
 */
export function getPlanByPriceId(priceId: string): PlanType | null {
  for (const [planType, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) {
      return planType as PlanType;
    }
  }
  return null;
}

/**
 * Check if a plan is paid
 */
export function isPaidPlan(planType: PlanType): boolean {
  return planType !== 'free';
}

/**
 * Format price for display
 */
export function formatPrice(amount: number | null, currency = 'usd'): string {
  if (amount === null) return 'Contact Sales';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get human-readable limit display
 */
export function formatLimit(limit: number): string {
  if (limit === -1) return 'Unlimited';
  if (limit >= 1024 * 1024 * 1024) {
    return `${Math.round(limit / (1024 * 1024 * 1024))}GB`;
  }
  if (limit >= 1024 * 1024) {
    return `${Math.round(limit / (1024 * 1024))}MB`;
  }
  return limit.toLocaleString();
}
