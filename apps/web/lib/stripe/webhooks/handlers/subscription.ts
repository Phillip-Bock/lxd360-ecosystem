import type Stripe from 'stripe';
import { enqueueEmailTask } from '@/lib/cloud-tasks/client';
import { adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger';
import { getPlanByPriceId } from '@/lib/stripe/config';
import type {
  StripeSubscriptionWithPeriod,
  SubscriptionMetadata,
  SubscriptionStatus,
  WebhookHandlerResult,
} from '../types';

const log = logger.child({ module: 'stripe-webhook-subscription' });

// =============================================================================
// FIRESTORE HELPERS
// =============================================================================

/**
 * Get subscription by Stripe ID from Firestore
 */
async function getSubscriptionByStripeId(
  stripeSubscriptionId: string,
): Promise<{ id: string; userId: string } | null> {
  const snapshot = await adminDb
    .collection('subscriptions')
    .where('stripeSubscriptionId', '==', stripeSubscriptionId)
    .limit(1)
    .get();

  if (snapshot.empty) {
    // Try with snake_case field name for backwards compatibility
    const snakeCaseSnapshot = await adminDb
      .collection('subscriptions')
      .where('stripe_subscription_id', '==', stripeSubscriptionId)
      .limit(1)
      .get();

    if (snakeCaseSnapshot.empty) return null;
    const doc = snakeCaseSnapshot.docs[0];
    const data = doc.data();
    return { id: doc.id, userId: data.user_id ?? data.userId };
  }

  const doc = snapshot.docs[0];
  const data = doc.data();
  return { id: doc.id, userId: data.userId ?? data.user_id };
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

/**
 * Convert Stripe subscription status to our internal status
 */
function mapSubscriptionStatus(stripeStatus: Stripe.Subscription.Status): SubscriptionStatus {
  const statusMap: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
    active: 'active',
    past_due: 'past_due',
    unpaid: 'unpaid',
    canceled: 'canceled',
    incomplete: 'incomplete',
    incomplete_expired: 'incomplete_expired',
    trialing: 'trialing',
    paused: 'paused',
  };
  return statusMap[stripeStatus] ?? 'incomplete';
}

// =============================================================================
// SUBSCRIPTION HANDLERS
// =============================================================================

/**
 * Handle customer.subscription.created event
 *
 * This is triggered when a new subscription is created.
 */
export async function handleSubscriptionCreated(
  subscription: Stripe.Subscription,
  _event: Stripe.Event,
): Promise<WebhookHandlerResult> {
  const metadata = (subscription.metadata ?? {}) as SubscriptionMetadata;
  const { userId, organizationId, planType } = metadata;

  log.info('Subscription created', {
    subscriptionId: subscription.id,
    status: subscription.status,
    userId: userId ?? 'unknown',
  });

  // Determine plan type from price ID if not in metadata
  const priceId = subscription.items.data[0]?.price.id;
  const detectedPlanType = priceId ? getPlanByPriceId(priceId) : null;
  const finalPlanType = planType ?? detectedPlanType ?? 'professional';

  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

  const sub = subscription as StripeSubscriptionWithPeriod;

  // Create subscription record
  const subscriptionRef = adminDb.collection('subscriptions').doc(subscription.id);
  await subscriptionRef.set({
    userId: userId ?? null,
    organizationId: organizationId ?? null,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    planType: finalPlanType,
    status: mapSubscriptionStatus(subscription.status),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    currentPeriodStart: sub.current_period_start
      ? new Date(sub.current_period_start * 1000).toISOString()
      : null,
    currentPeriodEnd: sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null,
    trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return {
    success: true,
    message: `Subscription ${subscription.id} created`,
    data: {
      subscriptionId: subscription.id,
      status: subscription.status,
      planType: finalPlanType,
    },
  };
}

/**
 * Handle customer.subscription.updated event
 *
 * This is triggered when a subscription is updated (plan change, status change, etc.)
 */
export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  _event: Stripe.Event,
): Promise<WebhookHandlerResult> {
  log.info('Subscription updated', {
    subscriptionId: subscription.id,
    status: subscription.status,
  });

  const existingSub = await getSubscriptionByStripeId(subscription.id);
  if (!existingSub) {
    log.warn('Subscription not found for update, creating new record', {
      subscriptionId: subscription.id,
    });
    // Create it if it doesn't exist
    return handleSubscriptionCreated(subscription, _event);
  }

  const sub = subscription as StripeSubscriptionWithPeriod;
  const priceId = subscription.items.data[0]?.price.id;
  const planType = priceId ? getPlanByPriceId(priceId) : null;

  const subscriptionRef = adminDb.collection('subscriptions').doc(subscription.id);
  const updateData: Record<string, unknown> = {
    status: mapSubscriptionStatus(subscription.status),
    stripePriceId: priceId,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    canceledAt: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    updatedAt: new Date().toISOString(),
  };

  if (planType) {
    updateData.planType = planType;
  }

  if (sub.current_period_start) {
    updateData.currentPeriodStart = new Date(sub.current_period_start * 1000).toISOString();
  }
  if (sub.current_period_end) {
    updateData.currentPeriodEnd = new Date(sub.current_period_end * 1000).toISOString();
  }

  await subscriptionRef.update(updateData);

  // Update user plan if status is active and we have a user
  if (subscription.status === 'active' && existingSub.userId && planType) {
    await updateUserPlan(existingSub.userId, planType);
  }

  return {
    success: true,
    message: `Subscription ${subscription.id} updated`,
    data: {
      subscriptionId: subscription.id,
      status: subscription.status,
    },
  };
}

/**
 * Handle customer.subscription.deleted event
 *
 * This is triggered when a subscription is canceled/deleted.
 */
export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  _event: Stripe.Event,
): Promise<WebhookHandlerResult> {
  const metadata = (subscription.metadata ?? {}) as SubscriptionMetadata;
  const { userId: metadataUserId } = metadata;

  log.info('Subscription deleted', { subscriptionId: subscription.id });

  const existingSub = await getSubscriptionByStripeId(subscription.id);
  const userId = metadataUserId ?? existingSub?.userId;

  // Update subscription status
  const subscriptionRef = adminDb.collection('subscriptions').doc(subscription.id);
  await subscriptionRef.update({
    status: 'canceled',
    canceledAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Downgrade user to free plan
  if (userId) {
    await updateUserPlan(userId, 'free');

    // Send cancellation email
    const userEmail = await getUserEmail(userId);
    const userName = await getUserDisplayName(userId);

    if (userEmail) {
      await enqueueEmailTask('email:send', {
        to: userEmail,
        template: 'subscription-canceled',
        templateData: {
          firstName: userName ?? 'Valued Customer',
          reactivateUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.lxd360.com'}/pricing`,
        },
      });
    }
  }

  return {
    success: true,
    message: `Subscription ${subscription.id} deleted`,
    data: {
      subscriptionId: subscription.id,
      userId: userId ?? null,
    },
  };
}

/**
 * Handle customer.subscription.paused event
 *
 * This is triggered when a subscription is paused.
 */
export async function handleSubscriptionPaused(
  subscription: Stripe.Subscription,
  _event: Stripe.Event,
): Promise<WebhookHandlerResult> {
  log.info('Subscription paused', { subscriptionId: subscription.id });

  const subscriptionRef = adminDb.collection('subscriptions').doc(subscription.id);
  await subscriptionRef.update({
    status: 'paused',
    updatedAt: new Date().toISOString(),
  });

  return {
    success: true,
    message: `Subscription ${subscription.id} paused`,
    data: {
      subscriptionId: subscription.id,
    },
  };
}

/**
 * Handle customer.subscription.resumed event
 *
 * This is triggered when a paused subscription is resumed.
 */
export async function handleSubscriptionResumed(
  subscription: Stripe.Subscription,
  _event: Stripe.Event,
): Promise<WebhookHandlerResult> {
  log.info('Subscription resumed', { subscriptionId: subscription.id });

  const sub = subscription as StripeSubscriptionWithPeriod;
  const priceId = subscription.items.data[0]?.price.id;

  const subscriptionRef = adminDb.collection('subscriptions').doc(subscription.id);
  await subscriptionRef.update({
    status: mapSubscriptionStatus(subscription.status),
    stripePriceId: priceId,
    currentPeriodStart: sub.current_period_start
      ? new Date(sub.current_period_start * 1000).toISOString()
      : null,
    currentPeriodEnd: sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null,
    updatedAt: new Date().toISOString(),
  });

  // Update user plan
  const existingSub = await getSubscriptionByStripeId(subscription.id);
  if (existingSub?.userId) {
    const planType = priceId ? getPlanByPriceId(priceId) : 'professional';
    await updateUserPlan(existingSub.userId, planType ?? 'professional');
  }

  return {
    success: true,
    message: `Subscription ${subscription.id} resumed`,
    data: {
      subscriptionId: subscription.id,
      status: subscription.status,
    },
  };
}

/**
 * Handle customer.subscription.trial_will_end event
 *
 * This is triggered 3 days before a trial ends.
 */
export async function handleTrialWillEnd(
  subscription: Stripe.Subscription,
  _event: Stripe.Event,
): Promise<WebhookHandlerResult> {
  const metadata = (subscription.metadata ?? {}) as SubscriptionMetadata;
  const { userId: metadataUserId } = metadata;

  log.info('Trial will end', {
    subscriptionId: subscription.id,
    trialEnd: subscription.trial_end,
  });

  const existingSub = await getSubscriptionByStripeId(subscription.id);
  const userId = metadataUserId ?? existingSub?.userId;

  if (userId) {
    const userEmail = await getUserEmail(userId);
    const userName = await getUserDisplayName(userId);

    if (userEmail && subscription.trial_end) {
      const trialEndDate = new Date(subscription.trial_end * 1000);

      await enqueueEmailTask('email:send', {
        to: userEmail,
        template: 'trial-ending',
        templateData: {
          firstName: userName ?? 'Valued Customer',
          trialEndDate: trialEndDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          upgradeUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.lxd360.com'}/settings/billing`,
        },
      });
    }
  }

  return {
    success: true,
    message: `Trial will end notification sent for subscription ${subscription.id}`,
    data: {
      subscriptionId: subscription.id,
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
      userId: userId ?? null,
    },
  };
}
