import type Stripe from 'stripe';
import { enqueueEmailTask } from '@/lib/cloud-tasks/client';
import { adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger';
import type { PaymentData, StripeInvoiceWithLegacy, WebhookHandlerResult } from '../types';

const log = logger.child({ module: 'stripe-webhook-invoice' });

// =============================================================================
// FIRESTORE HELPERS
// =============================================================================

/**
 * Get subscription by Stripe subscription ID
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
 * Record payment in Firestore
 */
async function recordPayment(data: PaymentData): Promise<string> {
  const docRef = await adminDb.collection('payments').add({
    ...data,
    createdAt: data.createdAt ?? new Date().toISOString(),
  });
  return docRef.id;
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
 * Get subscription ID from invoice (handles both old and new API structures)
 */
function getSubscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  // Try new API structure with parent object
  const parent = invoice.parent as {
    subscription_details?: { subscription?: string | Stripe.Subscription };
  } | null;

  if (parent?.subscription_details?.subscription) {
    const sub = parent.subscription_details.subscription;
    return typeof sub === 'string' ? sub : sub.id;
  }

  // Fallback to legacy structure
  const legacyInvoice = invoice as StripeInvoiceWithLegacy;
  if (legacyInvoice.subscription) {
    return typeof legacyInvoice.subscription === 'string'
      ? legacyInvoice.subscription
      : legacyInvoice.subscription.id;
  }

  return null;
}

/**
 * Get payment intent ID from invoice
 */
function getPaymentIntentIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const inv = invoice as StripeInvoiceWithLegacy;
  if (inv.payment_intent) {
    return typeof inv.payment_intent === 'string' ? inv.payment_intent : inv.payment_intent.id;
  }
  return null;
}

// =============================================================================
// INVOICE HANDLERS
// =============================================================================

/**
 * Handle invoice.created event
 *
 * This is triggered when a new invoice is created.
 */
export async function handleInvoiceCreated(
  invoice: Stripe.Invoice,
  _event: Stripe.Event,
): Promise<WebhookHandlerResult> {
  log.info('Invoice created', {
    invoiceId: invoice.id,
    amount: invoice.amount_due,
    currency: invoice.currency,
  });

  return {
    success: true,
    message: `Invoice ${invoice.id} created`,
    data: {
      invoiceId: invoice.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
    },
  };
}

/**
 * Handle invoice.finalized event
 *
 * This is triggered when an invoice is finalized and ready for payment.
 */
export async function handleInvoiceFinalized(
  invoice: Stripe.Invoice,
  _event: Stripe.Event,
): Promise<WebhookHandlerResult> {
  log.info('Invoice finalized', {
    invoiceId: invoice.id,
    amount: invoice.amount_due,
  });

  return {
    success: true,
    message: `Invoice ${invoice.id} finalized`,
    data: {
      invoiceId: invoice.id,
      amount: invoice.amount_due,
      invoiceUrl: invoice.hosted_invoice_url,
    },
  };
}

/**
 * Handle invoice.paid event
 *
 * This is triggered when an invoice is successfully paid.
 */
export async function handleInvoicePaid(
  invoice: Stripe.Invoice,
  _event: Stripe.Event,
): Promise<WebhookHandlerResult> {
  const subscriptionId = getSubscriptionIdFromInvoice(invoice);
  if (!subscriptionId) {
    log.info('Invoice paid but no subscription (one-time payment)', {
      invoiceId: invoice.id,
    });
    return {
      success: true,
      message: `Invoice ${invoice.id} paid (no subscription)`,
      data: { invoiceId: invoice.id },
    };
  }

  log.info('Invoice paid', {
    invoiceId: invoice.id,
    subscriptionId,
  });

  const subscription = await getSubscriptionByStripeId(subscriptionId);
  if (!subscription) {
    log.warn('Subscription not found for paid invoice', {
      invoiceId: invoice.id,
      subscriptionId,
    });
    return {
      success: true,
      message: `Invoice ${invoice.id} paid but subscription not found`,
      data: { invoiceId: invoice.id, subscriptionId },
    };
  }

  const paymentIntentId = getPaymentIntentIdFromInvoice(invoice);

  // Record payment
  const paymentId = await recordPayment({
    subscriptionId: subscription.id,
    userId: subscription.userId,
    stripeInvoiceId: invoice.id,
    stripePaymentIntentId: paymentIntentId,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    status: 'succeeded',
    description: invoice.description ?? 'Subscription payment',
    receiptUrl: invoice.hosted_invoice_url ?? null,
    invoicePdf: invoice.invoice_pdf ?? null,
  });

  // Send receipt email
  const userEmail = await getUserEmail(subscription.userId);
  const userName = await getUserDisplayName(subscription.userId);

  if (userEmail) {
    await enqueueEmailTask('email:send', {
      to: userEmail,
      template: 'payment-receipt',
      templateData: {
        firstName: userName ?? 'Valued Customer',
        amount: (invoice.amount_paid / 100).toFixed(2),
        currency: invoice.currency.toUpperCase(),
        receiptUrl: invoice.hosted_invoice_url ?? undefined,
        invoicePdf: invoice.invoice_pdf ?? undefined,
      },
    });
  }

  return {
    success: true,
    message: `Invoice ${invoice.id} paid and recorded`,
    data: {
      invoiceId: invoice.id,
      paymentId,
      userId: subscription.userId,
    },
  };
}

/**
 * Handle invoice.payment_failed event
 *
 * This is triggered when a payment for an invoice fails.
 */
export async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
  _event: Stripe.Event,
): Promise<WebhookHandlerResult> {
  log.warn('Invoice payment failed', {
    invoiceId: invoice.id,
    attemptCount: invoice.attempt_count,
  });

  const subscriptionId = getSubscriptionIdFromInvoice(invoice);
  if (!subscriptionId) {
    return {
      success: true,
      message: `Invoice ${invoice.id} payment failed (no subscription)`,
      data: { invoiceId: invoice.id },
    };
  }

  const subscription = await getSubscriptionByStripeId(subscriptionId);
  if (!subscription) {
    return {
      success: true,
      message: `Invoice ${invoice.id} payment failed but subscription not found`,
      data: { invoiceId: invoice.id },
    };
  }

  const paymentIntentId = getPaymentIntentIdFromInvoice(invoice);

  // Record failed payment
  await recordPayment({
    subscriptionId: subscription.id,
    userId: subscription.userId,
    stripeInvoiceId: invoice.id,
    stripePaymentIntentId: paymentIntentId,
    amount: invoice.amount_due,
    currency: invoice.currency,
    status: 'failed',
    description: 'Payment failed',
  });

  // Send payment failed email
  const userEmail = await getUserEmail(subscription.userId);
  const userName = await getUserDisplayName(subscription.userId);

  if (userEmail) {
    await enqueueEmailTask('email:payment-failed', {
      to: userEmail,
      firstName: userName ?? 'Valued Customer',
      amount: (invoice.amount_due / 100).toFixed(2),
      currency: invoice.currency.toUpperCase(),
      updatePaymentUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.lxd360.com'}/settings/billing`,
      attemptCount: invoice.attempt_count,
    });
  }

  return {
    success: true,
    message: `Invoice ${invoice.id} payment failed notification sent`,
    data: {
      invoiceId: invoice.id,
      userId: subscription.userId,
      attemptCount: invoice.attempt_count,
    },
  };
}

/**
 * Handle invoice.payment_action_required event
 *
 * This is triggered when a payment requires customer action (e.g., 3D Secure).
 */
export async function handleInvoicePaymentActionRequired(
  invoice: Stripe.Invoice,
  _event: Stripe.Event,
): Promise<WebhookHandlerResult> {
  log.info('Invoice payment action required', {
    invoiceId: invoice.id,
  });

  const subscriptionId = getSubscriptionIdFromInvoice(invoice);
  if (!subscriptionId) {
    return {
      success: true,
      message: `Invoice ${invoice.id} requires action (no subscription)`,
      data: { invoiceId: invoice.id },
    };
  }

  const subscription = await getSubscriptionByStripeId(subscriptionId);
  if (!subscription) {
    return {
      success: true,
      message: `Invoice ${invoice.id} requires action but subscription not found`,
      data: { invoiceId: invoice.id },
    };
  }

  // Send action required email
  const userEmail = await getUserEmail(subscription.userId);
  const userName = await getUserDisplayName(subscription.userId);

  if (userEmail) {
    await enqueueEmailTask('email:send', {
      to: userEmail,
      template: 'payment-action-required',
      templateData: {
        firstName: userName ?? 'Valued Customer',
        actionUrl: invoice.hosted_invoice_url ?? undefined,
      },
    });
  }

  return {
    success: true,
    message: `Invoice ${invoice.id} action required notification sent`,
    data: {
      invoiceId: invoice.id,
      actionUrl: invoice.hosted_invoice_url,
    },
  };
}

/**
 * Handle invoice.upcoming event
 *
 * This is triggered ~3 days before a subscription renewal.
 */
export async function handleInvoiceUpcoming(
  invoice: Stripe.Invoice,
  _event: Stripe.Event,
): Promise<WebhookHandlerResult> {
  log.info('Upcoming invoice', {
    invoiceId: invoice.id,
    amount: invoice.amount_due,
  });

  const subscriptionId = getSubscriptionIdFromInvoice(invoice);
  if (!subscriptionId) {
    return {
      success: true,
      message: 'Upcoming invoice notification (no subscription)',
      data: { amount: invoice.amount_due },
    };
  }

  const subscription = await getSubscriptionByStripeId(subscriptionId);
  if (!subscription) {
    return {
      success: true,
      message: 'Upcoming invoice but subscription not found',
      data: { subscriptionId },
    };
  }

  // Send upcoming payment reminder
  const userEmail = await getUserEmail(subscription.userId);
  const userName = await getUserDisplayName(subscription.userId);

  if (userEmail) {
    const dueDate = invoice.due_date
      ? new Date(invoice.due_date * 1000).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'soon';

    await enqueueEmailTask('email:send', {
      to: userEmail,
      template: 'upcoming-payment',
      templateData: {
        firstName: userName ?? 'Valued Customer',
        amount: (invoice.amount_due / 100).toFixed(2),
        currency: invoice.currency.toUpperCase(),
        dueDate,
        billingUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.lxd360.com'}/settings/billing`,
      },
    });
  }

  return {
    success: true,
    message: 'Upcoming invoice notification sent',
    data: {
      userId: subscription.userId,
      amount: invoice.amount_due,
    },
  };
}

/**
 * Handle invoice.marked_uncollectible event
 *
 * This is triggered when an invoice is marked as uncollectible.
 */
export async function handleInvoiceMarkedUncollectible(
  invoice: Stripe.Invoice,
  _event: Stripe.Event,
): Promise<WebhookHandlerResult> {
  log.warn('Invoice marked uncollectible', {
    invoiceId: invoice.id,
    amount: invoice.amount_due,
  });

  const subscriptionId = getSubscriptionIdFromInvoice(invoice);
  if (!subscriptionId) {
    return {
      success: true,
      message: `Invoice ${invoice.id} marked uncollectible`,
      data: { invoiceId: invoice.id },
    };
  }

  const subscription = await getSubscriptionByStripeId(subscriptionId);
  if (subscription) {
    // Update subscription status
    const subscriptionRef = adminDb.collection('subscriptions').doc(subscription.id);
    await subscriptionRef.update({
      status: 'unpaid',
      updatedAt: new Date().toISOString(),
    });
  }

  return {
    success: true,
    message: `Invoice ${invoice.id} marked uncollectible`,
    data: {
      invoiceId: invoice.id,
      subscriptionId,
    },
  };
}

/**
 * Handle invoice.voided event
 *
 * This is triggered when an invoice is voided.
 */
export async function handleInvoiceVoided(
  invoice: Stripe.Invoice,
  _event: Stripe.Event,
): Promise<WebhookHandlerResult> {
  log.info('Invoice voided', {
    invoiceId: invoice.id,
  });

  return {
    success: true,
    message: `Invoice ${invoice.id} voided`,
    data: {
      invoiceId: invoice.id,
    },
  };
}
