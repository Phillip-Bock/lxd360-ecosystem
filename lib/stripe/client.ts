/**
 * =============================================================================
 * LXP360-SaaS | Stripe Client
 * =============================================================================
 *
 * Client-side Stripe utilities using @stripe/stripe-js.
 */

import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'stripe-client' });

// =============================================================================
// STRIPE PROMISE
// =============================================================================

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get the Stripe instance (singleton pattern)
 * Only loads Stripe once and caches the promise
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      log.warn('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
      return Promise.resolve(null);
    }

    stripePromise = loadStripe(publishableKey);
  }

  // stripePromise is guaranteed to be non-null here
  return stripePromise as Promise<Stripe | null>;
}

// =============================================================================
// CHECKOUT HELPERS
// =============================================================================

/**
 * Redirect to Stripe Checkout
 * Uses the redirectToCheckout method from Stripe.js
 */
export async function redirectToCheckout(sessionId: string): Promise<void> {
  const stripe = await getStripe();

  if (!stripe) {
    throw new Error('Stripe failed to load');
  }

  // Use type assertion for the checkout method
  const result = await (
    stripe as unknown as {
      redirectToCheckout: (options: {
        sessionId: string;
      }) => Promise<{ error?: { message: string } }>;
    }
  ).redirectToCheckout({ sessionId });

  if (result.error) {
    throw new Error(result.error.message);
  }
}

/**
 * Create checkout session and redirect
 */
export async function createCheckoutAndRedirect(
  planType: 'professional' | 'enterprise',
  organizationId?: string,
): Promise<void> {
  const response = await fetch('/api/billing/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planType, organizationId }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to create checkout session');
  }

  const { url } = await response.json();

  if (url) {
    window.location.href = url;
  }
}

/**
 * Redirect to Customer Portal
 */
export async function redirectToCustomerPortal(): Promise<void> {
  const response = await fetch('/api/billing/portal', {
    method: 'POST',
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to create portal session');
  }

  const { url } = await response.json();

  if (url) {
    window.location.href = url;
  }
}

// =============================================================================
// SUBSCRIPTION HELPERS
// =============================================================================

export interface SubscriptionData {
  subscription: {
    id: string;
    status: string;
    plan_type: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
    stripe_customer_id: string;
    trial_end?: string | null;
  } | null;
  plan: string;
  invoices: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    date: number;
    invoicePdf: string | null;
    hostedUrl: string | null;
  }>;
  upcomingInvoice: {
    amount: number;
    currency: string;
    dueDate: number | null;
  } | null;
}

/**
 * Fetch current subscription data
 */
export async function getSubscriptionData(): Promise<SubscriptionData> {
  const response = await fetch('/api/billing/subscription');

  if (!response.ok) {
    throw new Error('Failed to fetch subscription data');
  }

  return response.json();
}

/**
 * Cancel subscription (at period end)
 */
export async function cancelSubscription(): Promise<void> {
  const response = await fetch('/api/billing/subscription', {
    method: 'DELETE',
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to cancel subscription');
  }
}

/**
 * Resume canceled subscription
 */
export async function resumeSubscription(): Promise<void> {
  const response = await fetch('/api/billing/subscription', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'resume' }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to resume subscription');
  }
}
