import type Stripe from 'stripe';
import { adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger';
import type { CustomerData, WebhookHandlerResult } from '../types';

const log = logger.child({ module: 'stripe-webhook-customer' });

// =============================================================================
// FIRESTORE HELPERS
// =============================================================================

/**
 * Get user by Stripe customer ID
 */
async function getUserByStripeCustomerId(
  stripeCustomerId: string,
): Promise<{ id: string; email: string } | null> {
  // Check in users collection for stripeCustomerId
  const usersSnapshot = await adminDb
    .collection('users')
    .where('stripeCustomerId', '==', stripeCustomerId)
    .limit(1)
    .get();

  if (!usersSnapshot.empty) {
    const doc = usersSnapshot.docs[0];
    const data = doc.data();
    return { id: doc.id, email: data.email };
  }

  // Check in customers collection
  const customerDoc = await adminDb.collection('customers').doc(stripeCustomerId).get();
  if (customerDoc.exists) {
    const data = customerDoc.data();
    if (data?.userId) {
      return { id: data.userId, email: data.email };
    }
  }

  return null;
}

/**
 * Upsert customer data in Firestore
 */
async function upsertCustomer(data: CustomerData): Promise<void> {
  const customerRef = adminDb.collection('customers').doc(data.stripeCustomerId);
  await customerRef.set(
    {
      ...data,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

/**
 * Link Stripe customer to Firebase user
 */
async function linkCustomerToUser(stripeCustomerId: string, userId: string): Promise<void> {
  const userRef = adminDb.collection('users').doc(userId);
  await userRef.update({
    stripeCustomerId,
    updatedAt: new Date().toISOString(),
  });
}

// =============================================================================
// CUSTOMER HANDLERS
// =============================================================================

/**
 * Handle customer.created event
 *
 * This is triggered when a new customer is created in Stripe.
 */
export async function handleCustomerCreated(
  customer: Stripe.Customer,
  _event: Stripe.Event,
): Promise<WebhookHandlerResult> {
  log.info('Customer created', {
    customerId: customer.id,
    email: customer.email,
  });

  // Store customer record
  await upsertCustomer({
    stripeCustomerId: customer.id,
    userId: customer.metadata?.userId ?? null,
    email: customer.email ?? '',
    name: customer.name ?? null,
    phone: customer.phone ?? null,
    defaultPaymentMethodId:
      typeof customer.invoice_settings?.default_payment_method === 'string'
        ? customer.invoice_settings.default_payment_method
        : (customer.invoice_settings?.default_payment_method?.id ?? null),
    metadata: customer.metadata ?? undefined,
    createdAt: new Date().toISOString(),
  });

  // If userId in metadata, link to user
  if (customer.metadata?.userId) {
    await linkCustomerToUser(customer.id, customer.metadata.userId);
  }

  return {
    success: true,
    message: `Customer ${customer.id} created`,
    data: {
      customerId: customer.id,
      email: customer.email,
      userId: customer.metadata?.userId ?? null,
    },
  };
}

/**
 * Handle customer.updated event
 *
 * This is triggered when customer data is updated.
 */
export async function handleCustomerUpdated(
  customer: Stripe.Customer,
  _event: Stripe.Event,
): Promise<WebhookHandlerResult> {
  log.info('Customer updated', {
    customerId: customer.id,
    email: customer.email,
  });

  // Update customer record
  await upsertCustomer({
    stripeCustomerId: customer.id,
    userId: customer.metadata?.userId ?? null,
    email: customer.email ?? '',
    name: customer.name ?? null,
    phone: customer.phone ?? null,
    defaultPaymentMethodId:
      typeof customer.invoice_settings?.default_payment_method === 'string'
        ? customer.invoice_settings.default_payment_method
        : (customer.invoice_settings?.default_payment_method?.id ?? null),
    metadata: customer.metadata ?? undefined,
  });

  // Sync email to user if linked
  const user = await getUserByStripeCustomerId(customer.id);
  if (user && customer.email && customer.email !== user.email) {
    log.info('Customer email changed, consider updating user record', {
      customerId: customer.id,
      oldEmail: user.email,
      newEmail: customer.email,
    });
    // Note: We don't auto-update user email as it's tied to authentication
  }

  return {
    success: true,
    message: `Customer ${customer.id} updated`,
    data: {
      customerId: customer.id,
      email: customer.email,
    },
  };
}

/**
 * Handle customer.deleted event
 *
 * This is triggered when a customer is deleted in Stripe.
 */
export async function handleCustomerDeleted(
  customer: Stripe.Customer,
  _event: Stripe.Event,
): Promise<WebhookHandlerResult> {
  log.info('Customer deleted', {
    customerId: customer.id,
  });

  // Mark customer record as deleted
  const customerRef = adminDb.collection('customers').doc(customer.id);
  const customerDoc = await customerRef.get();

  if (customerDoc.exists) {
    await customerRef.update({
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Remove Stripe customer ID from user if linked
  const user = await getUserByStripeCustomerId(customer.id);
  if (user) {
    const userRef = adminDb.collection('users').doc(user.id);
    await userRef.update({
      stripeCustomerId: null,
      updatedAt: new Date().toISOString(),
    });
  }

  return {
    success: true,
    message: `Customer ${customer.id} deleted`,
    data: {
      customerId: customer.id,
      userId: user?.id ?? null,
    },
  };
}

// =============================================================================
// PAYMENT INTENT HANDLERS
// =============================================================================

/**
 * Handle payment_intent.succeeded event
 *
 * This is triggered when a payment intent succeeds.
 */
export async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  _event: Stripe.Event,
): Promise<WebhookHandlerResult> {
  log.info('Payment intent succeeded', {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
  });

  // Most payment intent handling is done via invoice.paid
  // This is for tracking one-time payments that aren't tied to invoices

  return {
    success: true,
    message: `Payment intent ${paymentIntent.id} succeeded`,
    data: {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    },
  };
}

/**
 * Handle payment_intent.payment_failed event
 *
 * This is triggered when a payment intent fails.
 */
export async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent,
  _event: Stripe.Event,
): Promise<WebhookHandlerResult> {
  log.warn('Payment intent failed', {
    paymentIntentId: paymentIntent.id,
    error: paymentIntent.last_payment_error?.message,
  });

  // Most payment failure handling is done via invoice.payment_failed
  // This is for tracking one-time payment failures

  return {
    success: true,
    message: `Payment intent ${paymentIntent.id} failed`,
    data: {
      paymentIntentId: paymentIntent.id,
      error: paymentIntent.last_payment_error?.message ?? null,
    },
  };
}

// =============================================================================
// PAYMENT METHOD HANDLERS
// =============================================================================

/**
 * Handle payment_method.attached event
 *
 * This is triggered when a payment method is attached to a customer.
 */
export async function handlePaymentMethodAttached(
  paymentMethod: Stripe.PaymentMethod,
  _event: Stripe.Event,
): Promise<WebhookHandlerResult> {
  const customerId =
    typeof paymentMethod.customer === 'string'
      ? paymentMethod.customer
      : paymentMethod.customer?.id;

  log.info('Payment method attached', {
    paymentMethodId: paymentMethod.id,
    customerId,
    type: paymentMethod.type,
  });

  if (customerId) {
    // Update customer's payment methods list
    const customerRef = adminDb.collection('customers').doc(customerId);
    const customerDoc = await customerRef.get();

    if (customerDoc.exists) {
      const paymentMethods = customerDoc.data()?.paymentMethods ?? [];
      if (!paymentMethods.includes(paymentMethod.id)) {
        await customerRef.update({
          paymentMethods: [...paymentMethods, paymentMethod.id],
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }

  return {
    success: true,
    message: `Payment method ${paymentMethod.id} attached`,
    data: {
      paymentMethodId: paymentMethod.id,
      customerId: customerId ?? null,
      type: paymentMethod.type,
    },
  };
}

/**
 * Handle payment_method.detached event
 *
 * This is triggered when a payment method is detached from a customer.
 */
export async function handlePaymentMethodDetached(
  paymentMethod: Stripe.PaymentMethod,
  _event: Stripe.Event,
): Promise<WebhookHandlerResult> {
  // Note: When detached, customer is null
  const paymentMethodId = paymentMethod.id;

  log.info('Payment method detached', {
    paymentMethodId,
    type: paymentMethod.type,
  });

  // We could search for customers with this payment method and remove it
  // but that's expensive. Instead, we handle stale payment methods during retrieval.

  return {
    success: true,
    message: `Payment method ${paymentMethodId} detached`,
    data: {
      paymentMethodId,
      type: paymentMethod.type,
    },
  };
}

/**
 * Handle payment_method.updated event
 *
 * This is triggered when a payment method is updated.
 */
export async function handlePaymentMethodUpdated(
  paymentMethod: Stripe.PaymentMethod,
  _event: Stripe.Event,
): Promise<WebhookHandlerResult> {
  const customerId =
    typeof paymentMethod.customer === 'string'
      ? paymentMethod.customer
      : paymentMethod.customer?.id;

  log.info('Payment method updated', {
    paymentMethodId: paymentMethod.id,
    customerId,
  });

  return {
    success: true,
    message: `Payment method ${paymentMethod.id} updated`,
    data: {
      paymentMethodId: paymentMethod.id,
      customerId: customerId ?? null,
    },
  };
}
