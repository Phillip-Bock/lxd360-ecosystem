/**
 * =============================================================================
 * LXP360-SaaS | Stripe Checkout
 * =============================================================================
 *
 * Enhanced Stripe checkout for the new pricing system with products, tiers, and add-ons
 */

import type Stripe from 'stripe';
import { getStripe } from '@/lib/billing/stripe';
import type { BillingPeriod } from '@/types/pricing';

// ============================================================================
// TYPES
// ============================================================================

export interface CreatePricingCheckoutParams {
  /** Stripe customer ID (if exists) */
  customerId?: string;
  /** Customer email (used if no customerId) */
  customerEmail: string;
  /** Main plan price ID from Stripe */
  priceId: string;
  /** Add-on price IDs from Stripe */
  addonPriceIds?: string[];
  /** Number of trial days */
  trialDays?: number;
  /** Coupon code to apply */
  couponId?: string;
  /** Success redirect URL */
  successUrl: string;
  /** Cancel redirect URL */
  cancelUrl: string;
  /** Custom metadata */
  metadata?: Record<string, string>;
  /** Allow promotion codes at checkout */
  allowPromotionCodes?: boolean;
  /** Collect tax IDs */
  collectTaxId?: boolean;
}

export interface CheckoutSessionResult {
  url: string;
  sessionId: string;
}

export interface CreatePortalSessionParams {
  customerId: string;
  returnUrl: string;
}

// ============================================================================
// CHECKOUT SESSION
// ============================================================================

/**
 * Create a Stripe Checkout session for subscription
 */
export async function createPricingCheckout({
  customerId,
  customerEmail,
  priceId,
  addonPriceIds = [],
  trialDays,
  couponId,
  successUrl,
  cancelUrl,
  metadata = {},
  allowPromotionCodes = true,
  collectTaxId = true,
}: CreatePricingCheckoutParams): Promise<CheckoutSessionResult> {
  const stripe = getStripe();

  // Build line items
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    { price: priceId, quantity: 1 },
    ...addonPriceIds.map((id) => ({ price: id, quantity: 1 })),
  ];

  // Build subscription data
  const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData = {
    metadata: {
      ...metadata,
      created_via: 'pricing_page',
    },
  };

  // Add trial if specified
  if (trialDays && trialDays > 0) {
    subscriptionData.trial_period_days = trialDays;
  }

  // Build session params
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: subscriptionData,
    billing_address_collection: 'required',
    allow_promotion_codes: allowPromotionCodes && !couponId,
    metadata,
  };

  // Add customer or email
  if (customerId) {
    sessionParams.customer = customerId;
  } else {
    sessionParams.customer_email = customerEmail;
  }

  // Add coupon if provided
  if (couponId) {
    sessionParams.discounts = [{ coupon: couponId }];
  }

  // Add tax ID collection
  if (collectTaxId) {
    sessionParams.tax_id_collection = { enabled: true };
  }

  // Create session
  const session = await stripe.checkout.sessions.create(sessionParams);

  if (!session.url) {
    throw new Error('Failed to create checkout session URL');
  }

  return {
    url: session.url,
    sessionId: session.id,
  };
}

/**
 * Create a Stripe Customer Portal session
 */
export async function createPortalSession({
  customerId,
  returnUrl,
}: CreatePortalSessionParams): Promise<string> {
  const stripe = getStripe();

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session.url;
}

// ============================================================================
// PRICE HELPERS
// ============================================================================

/**
 * Get Stripe price by ID
 */
export async function getPrice(priceId: string): Promise<Stripe.Price> {
  const stripe = getStripe();
  return stripe.prices.retrieve(priceId);
}

/**
 * Get multiple Stripe prices
 */
export async function getPrices(priceIds: string[]): Promise<Stripe.Price[]> {
  const stripe = getStripe();
  const prices = await Promise.all(priceIds.map((id) => stripe.prices.retrieve(id)));
  return prices;
}

/**
 * Calculate total from prices
 */
export function calculateTotal(prices: Stripe.Price[], period: BillingPeriod): number {
  return prices.reduce((total, price) => {
    if (!price.unit_amount) return total;

    // Handle different intervals
    const interval = price.recurring?.interval;
    if (interval === 'month' && period === 'yearly') {
      return total + price.unit_amount * 12;
    }
    if (interval === 'year' && period === 'monthly') {
      return total + Math.round(price.unit_amount / 12);
    }

    return total + price.unit_amount;
  }, 0);
}

// ============================================================================
// COUPON HELPERS
// ============================================================================

/**
 * Validate a coupon code
 */
export async function validateCoupon(couponCode: string): Promise<{
  valid: boolean;
  coupon?: Stripe.Coupon;
  error?: string;
}> {
  const stripe = getStripe();

  try {
    // First try to find promotion code
    const promotionCodes = await stripe.promotionCodes.list({
      code: couponCode,
      active: true,
      limit: 1,
    });

    if (promotionCodes.data.length > 0) {
      const promo = promotionCodes.data[0];
      const promoCoupon = promo.promotion.coupon;
      const couponId = typeof promoCoupon === 'string' ? promoCoupon : promoCoupon?.id;

      if (!couponId) {
        return {
          valid: false,
          error: 'Invalid promotion code',
        };
      }

      const coupon = await stripe.coupons.retrieve(couponId);

      return {
        valid: true,
        coupon,
      };
    }

    // Try direct coupon lookup
    const coupon = await stripe.coupons.retrieve(couponCode);

    if (!coupon.valid) {
      return {
        valid: false,
        error: 'This coupon has expired',
      };
    }

    return {
      valid: true,
      coupon,
    };
  } catch {
    // Silently ignore - coupon validation failed
    return {
      valid: false,
      error: 'Invalid coupon code',
    };
  }
}

/**
 * Calculate discount amount from coupon
 */
export function calculateDiscount(coupon: Stripe.Coupon, subtotal: number): number {
  if (coupon.percent_off) {
    return Math.round((subtotal * coupon.percent_off) / 100);
  }
  if (coupon.amount_off) {
    return Math.min(coupon.amount_off, subtotal);
  }
  return 0;
}
