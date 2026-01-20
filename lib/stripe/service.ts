/**
 * Stripe Service
 * TODO(LXD-301): Implement with Firestore
 */

import type Stripe from 'stripe';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'stripe-service' });

/**
 * Sync subscription data from Stripe to Firestore
 * TODO(LXD-301): Implement Firestore persistence
 */
export async function syncSubscriptionFromStripe(subscription: Stripe.Subscription): Promise<void> {
  log.info('syncSubscriptionFromStripe called - migration in progress', {
    subscriptionId: subscription.id,
    status: subscription.status,
  });
}
