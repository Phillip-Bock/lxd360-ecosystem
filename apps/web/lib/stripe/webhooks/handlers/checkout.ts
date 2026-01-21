import type Stripe from 'stripe';
import { enqueueEmailTask } from '@/lib/cloud-tasks/client';
import { adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger';
import type { CheckoutSessionMetadata, SubscriptionData, WebhookHandlerResult } from '../types';

const log = logger.child({ module: 'stripe-webhook-checkout' });

// =============================================================================
// FIRESTORE HELPERS
// =============================================================================

/**
 * Create or update subscription record in Firestore
 */
async function upsertSubscription(data: SubscriptionData): Promise<void> {
  const subscriptionRef = adminDb.collection('subscriptions').doc(data.stripeSubscriptionId);
  await subscriptionRef.set(
    {
      ...data,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

/**
 * Update user profile with plan type
 */
async function updateUserPlan(userId: string, planType: string): Promise<void> {
  const profileRef = adminDb.collection('profiles').doc(userId);
  await profileRef.update({
    plan_type: planType,
    updated_at: new Date().toISOString(),
  });
}

/**
 * Get user email from Firestore
 */
async function getUserEmail(userId: string): Promise<string | null> {
  const userDoc = await adminDb.collection('users').doc(userId).get();
  if (!userDoc.exists) return null;
  const data = userDoc.data();
  return data?.email ?? null;
}

/**
 * Get user display name from Firestore
 */
async function getUserDisplayName(userId: string): Promise<string | null> {
  const userDoc = await adminDb.collection('users').doc(userId).get();
  if (!userDoc.exists) return null;
  const data = userDoc.data();
  return data?.displayName ?? null;
}

// =============================================================================
// CHECKOUT HANDLERS
// =============================================================================

/**
 * Handle checkout.session.completed event
 *
 * This is triggered when a customer successfully completes payment.
 * Creates subscription record and grants access.
 */
export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  _event: Stripe.Event,
): Promise<WebhookHandlerResult> {
  const metadata = (session.metadata ?? {}) as CheckoutSessionMetadata;
  const { userId, organizationId, planType } = metadata;

  if (!userId) {
    log.error('No userId in checkout session metadata', { sessionId: session.id });
    return {
      success: false,
      error: 'Missing userId in session metadata',
    };
  }

  if (!session.subscription) {
    log.error('No subscription in checkout session', { sessionId: session.id });
    return {
      success: false,
      error: 'No subscription found in checkout session',
    };
  }

  if (!session.customer) {
    log.error('No customer in checkout session', { sessionId: session.id });
    return {
      success: false,
      error: 'No customer found in checkout session',
    };
  }

  const subscriptionId =
    typeof session.subscription === 'string' ? session.subscription : session.subscription.id;

  const customerId = typeof session.customer === 'string' ? session.customer : session.customer.id;

  log.info('Checkout completed', {
    userId,
    planType,
    subscriptionId,
  });

  // Create subscription record
  await upsertSubscription({
    userId,
    organizationId: organizationId ?? null,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    planType: planType ?? 'professional',
    status: 'active',
    createdAt: new Date().toISOString(),
  });

  // Update user plan
  await updateUserPlan(userId, planType ?? 'professional');

  // Queue welcome email
  const userEmail = await getUserEmail(userId);
  const userName = await getUserDisplayName(userId);

  if (userEmail) {
    await enqueueEmailTask('email:subscription-created', {
      to: userEmail,
      firstName: userName ?? 'Valued Customer',
      planName: planType ?? 'Professional',
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.lxd360.com'}/login`,
    });
  }

  return {
    success: true,
    message: `Checkout completed for user ${userId}`,
    data: {
      userId,
      subscriptionId,
      planType: planType ?? 'professional',
    },
  };
}

/**
 * Handle checkout.session.expired event
 *
 * This is triggered when a checkout session expires before completion.
 */
export async function handleCheckoutExpired(
  session: Stripe.Checkout.Session,
  _event: Stripe.Event,
): Promise<WebhookHandlerResult> {
  const metadata = (session.metadata ?? {}) as CheckoutSessionMetadata;
  const { userId } = metadata;

  log.info('Checkout session expired', {
    sessionId: session.id,
    userId: userId ?? 'unknown',
  });

  // Could trigger an abandoned cart email here
  // For now, just log and acknowledge

  return {
    success: true,
    message: `Checkout session ${session.id} expired`,
    data: {
      sessionId: session.id,
      userId: userId ?? null,
    },
  };
}

/**
 * Handle checkout.session.async_payment_succeeded event
 *
 * This is triggered when an async payment (e.g., bank transfer) succeeds.
 */
export async function handleCheckoutAsyncPaymentSucceeded(
  session: Stripe.Checkout.Session,
  _event: Stripe.Event,
): Promise<WebhookHandlerResult> {
  const metadata = (session.metadata ?? {}) as CheckoutSessionMetadata;
  const { userId, planType } = metadata;

  if (!userId) {
    log.error('No userId in checkout session metadata for async payment', {
      sessionId: session.id,
    });
    return {
      success: false,
      error: 'Missing userId in session metadata',
    };
  }

  log.info('Async payment succeeded', {
    sessionId: session.id,
    userId,
  });

  // Update subscription status to active
  if (session.subscription) {
    const subscriptionId =
      typeof session.subscription === 'string' ? session.subscription : session.subscription.id;

    const subscriptionRef = adminDb.collection('subscriptions').doc(subscriptionId);
    await subscriptionRef.update({
      status: 'active',
      updatedAt: new Date().toISOString(),
    });
  }

  // Update user plan
  await updateUserPlan(userId, planType ?? 'professional');

  return {
    success: true,
    message: `Async payment succeeded for user ${userId}`,
    data: {
      userId,
      sessionId: session.id,
    },
  };
}

/**
 * Handle checkout.session.async_payment_failed event
 *
 * This is triggered when an async payment fails.
 */
export async function handleCheckoutAsyncPaymentFailed(
  session: Stripe.Checkout.Session,
  _event: Stripe.Event,
): Promise<WebhookHandlerResult> {
  const metadata = (session.metadata ?? {}) as CheckoutSessionMetadata;
  const { userId } = metadata;

  log.warn('Async payment failed', {
    sessionId: session.id,
    userId: userId ?? 'unknown',
  });

  // Update subscription status to incomplete
  if (session.subscription) {
    const subscriptionId =
      typeof session.subscription === 'string' ? session.subscription : session.subscription.id;

    const subscriptionRef = adminDb.collection('subscriptions').doc(subscriptionId);
    await subscriptionRef.update({
      status: 'incomplete',
      updatedAt: new Date().toISOString(),
    });
  }

  // Queue payment failed email
  if (userId) {
    const userEmail = await getUserEmail(userId);
    const userName = await getUserDisplayName(userId);

    if (userEmail) {
      await enqueueEmailTask('email:payment-failed', {
        to: userEmail,
        firstName: userName ?? 'Valued Customer',
        updatePaymentUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.lxd360.com'}/settings/billing`,
      });
    }
  }

  return {
    success: true,
    message: `Async payment failed for session ${session.id}`,
    data: {
      sessionId: session.id,
      userId: userId ?? null,
    },
  };
}
