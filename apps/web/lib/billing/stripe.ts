import Stripe from 'stripe';
import { logger } from '@/lib/logger';
import type { BillingInterval, Coupon, Price, Product, Subscription } from './types';

const log = logger.child({ module: 'billing-stripe' });

// ============================================================================
// STRIPE CLIENT
// ============================================================================

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    });
  }
  return stripeInstance;
}

// ============================================================================
// CUSTOMER MANAGEMENT
// ============================================================================

/**
 * Get or create a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string,
): Promise<string> {
  try {
    // TODO(LXD-301): Add Firestore customer lookup
    const stripe = getStripe();

    log.warn('getOrCreateStripeCustomer: Database lookup disabled during migration', { userId });

    // Create Stripe customer
    let stripeCustomer: Stripe.Customer;
    try {
      stripeCustomer = await stripe.customers.create({
        email,
        name: name || undefined,
        metadata: {
          firebase_user_id: userId,
        },
      });
    } catch (stripeError) {
      const errorMessage =
        stripeError instanceof Error ? stripeError.message : 'Unknown Stripe error';
      throw new Error(`Failed to create Stripe customer for user ${userId}: ${errorMessage}`);
    }

    // TODO(LXD-301): Save to Firestore

    return stripeCustomer.id;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`getOrCreateStripeCustomer failed: ${errorMessage}`);
  }
}

/**
 * Update Stripe customer details
 */
export async function updateStripeCustomer(
  stripeCustomerId: string,
  data: {
    email?: string;
    name?: string;
    phone?: string;
    address?: Stripe.AddressParam;
  },
): Promise<Stripe.Customer> {
  try {
    const stripe = getStripe();
    return await stripe.customers.update(stripeCustomerId, data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to update Stripe customer ${stripeCustomerId}: ${errorMessage}`);
  }
}

// ============================================================================
// CHECKOUT SESSIONS
// ============================================================================

interface CreateCheckoutOptions {
  customerId: string;
  priceId: string;
  quantity?: number;
  mode: 'subscription' | 'payment';
  successUrl: string;
  cancelUrl: string;
  trialDays?: number;
  couponId?: string;
  metadata?: Record<string, string>;
  lineItems?: Stripe.Checkout.SessionCreateParams.LineItem[];
}

/**
 * Create a Stripe Checkout Session
 */
export async function createCheckoutSession(
  options: CreateCheckoutOptions,
): Promise<Stripe.Checkout.Session> {
  try {
    const stripe = getStripe();

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = options.lineItems || [
      {
        price: options.priceId,
        quantity: options.quantity || 1,
      },
    ];

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: options.customerId,
      mode: options.mode,
      line_items: lineItems,
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
      metadata: options.metadata,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      allow_promotion_codes: !options.couponId, // Allow promo codes if no coupon applied
    };

    // Add subscription-specific options
    if (options.mode === 'subscription') {
      sessionParams.subscription_data = {
        metadata: options.metadata,
      };

      if (options.trialDays && options.trialDays > 0) {
        sessionParams.subscription_data.trial_period_days = options.trialDays;
      }
    }

    // Apply coupon if provided
    if (options.couponId) {
      sessionParams.discounts = [{ coupon: options.couponId }];
    }

    return await stripe.checkout.sessions.create(sessionParams);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(
      `Failed to create checkout session for customer ${options.customerId}: ${errorMessage}`,
    );
  }
}

/**
 * Create a checkout session for purchasing token packages
 */
export async function createTokenPurchaseSession(
  customerId: string,
  priceId: string,
  quantity: number,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>,
): Promise<Stripe.Checkout.Session> {
  return createCheckoutSession({
    customerId,
    priceId,
    quantity,
    mode: 'payment',
    successUrl,
    cancelUrl,
    metadata: {
      ...metadata,
      type: 'token_purchase',
    },
  });
}

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

/**
 * Get a subscription from Stripe
 */
export async function getStripeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  try {
    const stripe = getStripe();
    return await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['default_payment_method', 'latest_invoice'],
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to retrieve subscription ${subscriptionId}: ${errorMessage}`);
  }
}

/**
 * Update a subscription (for upgrades/downgrades)
 */
export async function updateStripeSubscription(
  subscriptionId: string,
  params: {
    priceId?: string;
    quantity?: number;
    prorationBehavior?: Stripe.SubscriptionUpdateParams.ProrationBehavior;
    cancelAtPeriodEnd?: boolean;
  },
): Promise<Stripe.Subscription> {
  try {
    const stripe = getStripe();

    const updateParams: Stripe.SubscriptionUpdateParams = {};

    if (params.cancelAtPeriodEnd !== undefined) {
      updateParams.cancel_at_period_end = params.cancelAtPeriodEnd;
    }

    if (params.priceId || params.quantity) {
      // Get current subscription to find the item to update
      let subscription: Stripe.Subscription;
      try {
        subscription = await stripe.subscriptions.retrieve(subscriptionId);
      } catch (retrieveError) {
        const errorMessage =
          retrieveError instanceof Error ? retrieveError.message : 'Unknown error';
        throw new Error(`Failed to retrieve subscription for update: ${errorMessage}`);
      }

      const itemId = subscription.items.data[0]?.id;

      if (itemId) {
        updateParams.items = [
          {
            id: itemId,
            price: params.priceId,
            quantity: params.quantity,
          },
        ];
        updateParams.proration_behavior = params.prorationBehavior || 'create_prorations';
      }
    }

    return await stripe.subscriptions.update(subscriptionId, updateParams);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to update subscription ${subscriptionId}: ${errorMessage}`);
  }
}

/**
 * Cancel a subscription
 */
export async function cancelStripeSubscription(
  subscriptionId: string,
  cancelImmediately = false,
): Promise<Stripe.Subscription> {
  try {
    const stripe = getStripe();

    if (cancelImmediately) {
      return await stripe.subscriptions.cancel(subscriptionId);
    }

    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to cancel subscription ${subscriptionId}: ${errorMessage}`);
  }
}

/**
 * Resume a canceled subscription
 */
export async function resumeStripeSubscription(
  subscriptionId: string,
): Promise<Stripe.Subscription> {
  try {
    const stripe = getStripe();
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to resume subscription ${subscriptionId}: ${errorMessage}`);
  }
}

/**
 * Add an item to a subscription (for add-ons)
 */
export async function addSubscriptionItem(
  subscriptionId: string,
  priceId: string,
  quantity = 1,
): Promise<Stripe.SubscriptionItem> {
  try {
    const stripe = getStripe();
    return await stripe.subscriptionItems.create({
      subscription: subscriptionId,
      price: priceId,
      quantity,
      proration_behavior: 'create_prorations',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to add item to subscription ${subscriptionId}: ${errorMessage}`);
  }
}

/**
 * Remove an item from a subscription
 */
export async function removeSubscriptionItem(
  itemId: string,
): Promise<Stripe.DeletedSubscriptionItem> {
  try {
    const stripe = getStripe();
    return await stripe.subscriptionItems.del(itemId, {
      proration_behavior: 'create_prorations',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to remove subscription item ${itemId}: ${errorMessage}`);
  }
}

// ============================================================================
// BILLING PORTAL
// ============================================================================

/**
 * Create a Stripe Billing Portal session
 */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string,
): Promise<Stripe.BillingPortal.Session> {
  try {
    const stripe = getStripe();
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(
      `Failed to create billing portal session for customer ${customerId}: ${errorMessage}`,
    );
  }
}

// ============================================================================
// COUPONS & PROMOTIONS
// ============================================================================

/**
 * Create a Stripe coupon
 */
export async function createStripeCoupon(coupon: Coupon): Promise<Stripe.Coupon> {
  try {
    const stripe = getStripe();

    const params: Stripe.CouponCreateParams = {
      id: coupon.code.toLowerCase(),
      name: coupon.internal_name || coupon.code,
      duration: coupon.duration === 'forever' ? 'forever' : coupon.duration,
    };

    if (coupon.type === 'percentage') {
      params.percent_off = coupon.amount;
    } else {
      params.amount_off = coupon.amount;
      params.currency = coupon.currency;
    }

    if (coupon.duration === 'repeating' && coupon.duration_months) {
      params.duration_in_months = coupon.duration_months;
    }

    if (coupon.max_redemptions) {
      params.max_redemptions = coupon.max_redemptions;
    }

    if (coupon.expires_at) {
      params.redeem_by = Math.floor(new Date(coupon.expires_at).getTime() / 1000);
    }

    return await stripe.coupons.create(params);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to create coupon ${coupon.code}: ${errorMessage}`);
  }
}

/**
 * Validate a coupon code
 */
export async function validateStripeCoupon(code: string): Promise<Stripe.Coupon | null> {
  const stripe = getStripe();
  try {
    const coupon = await stripe.coupons.retrieve(code.toLowerCase());
    if (coupon.valid) {
      return coupon;
    }
    return null;
  } catch {
    // Silently ignore - coupon not found or invalid, return null
    return null;
  }
}

/**
 * Delete a Stripe coupon
 */
export async function deleteStripeCoupon(couponId: string): Promise<Stripe.DeletedCoupon> {
  try {
    const stripe = getStripe();
    return await stripe.coupons.del(couponId);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to delete coupon ${couponId}: ${errorMessage}`);
  }
}

// ============================================================================
// PRODUCT & PRICE SYNC
// ============================================================================

/**
 * Sync a product to Stripe
 */
export async function syncProductToStripe(product: Product): Promise<Stripe.Product> {
  try {
    const stripe = getStripe();

    const params: Stripe.ProductCreateParams = {
      name: product.name,
      description: product.description || undefined,
      metadata: {
        firestore_id: product.id,
        product_line: product.product_line,
        tier: product.tier,
      },
    };

    if (product.stripe_product_id) {
      // Update existing product
      return await stripe.products.update(product.stripe_product_id, params);
    }

    // Create new product
    return await stripe.products.create(params);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to sync product ${product.id} to Stripe: ${errorMessage}`);
  }
}

/**
 * Sync a price to Stripe
 */
export async function syncPriceToStripe(
  price: Price,
  stripeProductId: string,
): Promise<Stripe.Price> {
  try {
    const stripe = getStripe();

    // Convert our interval to Stripe's
    const stripeInterval = price.interval === 'quarterly' ? 'month' : 'year';
    const intervalCount = price.interval === 'quarterly' ? 3 : 1;

    const params: Stripe.PriceCreateParams = {
      product: stripeProductId,
      currency: price.currency,
      unit_amount: price.amount,
      nickname: price.nickname || undefined,
      metadata: {
        firestore_id: price.id,
      },
    };

    if (price.interval !== 'one_time') {
      params.recurring = {
        interval: stripeInterval,
        interval_count: intervalCount,
      };
    }

    // Note: Stripe prices are immutable, so we always create new ones
    // and archive old ones if needed
    if (price.stripe_price_id) {
      // Archive old price
      try {
        await stripe.prices.update(price.stripe_price_id, { active: false });
      } catch (error) {
        log.error('Failed to archive old price, continuing with new price creation', {
          priceId: price.stripe_price_id,
          error,
        });
      }
    }

    return await stripe.prices.create(params);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to sync price ${price.id} to Stripe: ${errorMessage}`);
  }
}

// ============================================================================
// INVOICES
// ============================================================================

/**
 * Get an invoice from Stripe
 */
export async function getStripeInvoice(invoiceId: string): Promise<Stripe.Invoice> {
  try {
    const stripe = getStripe();
    return await stripe.invoices.retrieve(invoiceId);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to retrieve invoice ${invoiceId}: ${errorMessage}`);
  }
}

/**
 * Get upcoming invoice preview
 */
export async function getUpcomingInvoice(
  customerId: string,
  subscriptionId?: string,
): Promise<Stripe.UpcomingInvoice> {
  try {
    const stripe = getStripe();
    return await stripe.invoices.createPreview({
      customer: customerId,
      subscription: subscriptionId,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to get upcoming invoice for customer ${customerId}: ${errorMessage}`);
  }
}

/**
 * Finalize and pay an invoice
 */
export async function payInvoice(invoiceId: string): Promise<Stripe.Invoice> {
  try {
    const stripe = getStripe();
    return await stripe.invoices.pay(invoiceId);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to pay invoice ${invoiceId}: ${errorMessage}`);
  }
}

// ============================================================================
// PAYMENT METHODS
// ============================================================================

/**
 * List payment methods for a customer
 */
export async function listPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
  try {
    const stripe = getStripe();
    const methods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    return methods.data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to list payment methods for customer ${customerId}: ${errorMessage}`);
  }
}

/**
 * Set default payment method
 */
export async function setDefaultPaymentMethod(
  customerId: string,
  paymentMethodId: string,
): Promise<Stripe.Customer> {
  try {
    const stripe = getStripe();
    return await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(
      `Failed to set default payment method for customer ${customerId}: ${errorMessage}`,
    );
  }
}

/**
 * Detach a payment method
 */
export async function detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
  try {
    const stripe = getStripe();
    return await stripe.paymentMethods.detach(paymentMethodId);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to detach payment method ${paymentMethodId}: ${errorMessage}`);
  }
}

// ============================================================================
// WEBHOOK SIGNATURE VERIFICATION
// ============================================================================

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert Stripe subscription status to our status
 */
export function mapStripeSubscriptionStatus(
  stripeStatus: Stripe.Subscription.Status,
): Subscription['status'] {
  const statusMap: Record<string, Subscription['status']> = {
    trialing: 'trialing',
    active: 'active',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'unpaid',
    paused: 'paused',
    incomplete: 'past_due',
    incomplete_expired: 'canceled',
  };
  return statusMap[stripeStatus] || 'active';
}

/**
 * Convert our billing interval to Stripe interval
 */
export function toStripeInterval(
  interval: BillingInterval,
): { interval: 'month' | 'year'; interval_count: number } | null {
  switch (interval) {
    case 'quarterly':
      return { interval: 'month', interval_count: 3 };
    case 'yearly':
      return { interval: 'year', interval_count: 1 };
    case 'one_time':
      return null;
    default:
      return null;
  }
}
