import type Stripe from 'stripe';

// =============================================================================
// WEBHOOK EVENT TYPES
// =============================================================================

/**
 * Supported Stripe webhook event types
 */
export type StripeWebhookEventType =
  // Checkout events
  | 'checkout.session.completed'
  | 'checkout.session.expired'
  | 'checkout.session.async_payment_succeeded'
  | 'checkout.session.async_payment_failed'
  // Subscription events
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'customer.subscription.paused'
  | 'customer.subscription.resumed'
  | 'customer.subscription.trial_will_end'
  | 'customer.subscription.pending_update_applied'
  | 'customer.subscription.pending_update_expired'
  // Invoice events
  | 'invoice.created'
  | 'invoice.finalized'
  | 'invoice.paid'
  | 'invoice.payment_failed'
  | 'invoice.payment_action_required'
  | 'invoice.upcoming'
  | 'invoice.marked_uncollectible'
  | 'invoice.voided'
  // Customer events
  | 'customer.created'
  | 'customer.updated'
  | 'customer.deleted'
  // Payment intent events
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed'
  | 'payment_intent.canceled'
  | 'payment_intent.requires_action'
  // Payment method events
  | 'payment_method.attached'
  | 'payment_method.detached'
  | 'payment_method.updated';

// =============================================================================
// HANDLER RESULT TYPE
// =============================================================================

/**
 * Result of a webhook handler execution
 */
export interface WebhookHandlerResult {
  /** Whether the handler executed successfully */
  success: boolean;
  /** Human-readable message about the result */
  message?: string;
  /** Additional data returned by the handler */
  data?: Record<string, unknown>;
  /** Error message if the handler failed */
  error?: string;
}

// =============================================================================
// HANDLER FUNCTION TYPES
// =============================================================================

/**
 * Generic webhook handler function signature
 */
export type WebhookHandler<T = unknown> = (
  data: T,
  event: Stripe.Event,
) => Promise<WebhookHandlerResult>;

/**
 * Checkout session handler
 */
export type CheckoutSessionHandler = WebhookHandler<Stripe.Checkout.Session>;

/**
 * Subscription handler
 */
export type SubscriptionHandler = WebhookHandler<Stripe.Subscription>;

/**
 * Invoice handler
 */
export type InvoiceHandler = WebhookHandler<Stripe.Invoice>;

/**
 * Customer handler
 */
export type CustomerHandler = WebhookHandler<Stripe.Customer>;

/**
 * Payment intent handler
 */
export type PaymentIntentHandler = WebhookHandler<Stripe.PaymentIntent>;

// =============================================================================
// FIRESTORE DATA TYPES
// =============================================================================

/**
 * Subscription data structure for Firestore
 */
export interface SubscriptionData {
  /** Firebase user ID */
  userId: string;
  /** Organization ID (optional) */
  organizationId?: string | null;
  /** Stripe customer ID */
  stripeCustomerId: string;
  /** Stripe subscription ID */
  stripeSubscriptionId: string;
  /** Stripe price ID */
  stripePriceId?: string;
  /** Plan type (free, professional, enterprise) */
  planType: string;
  /** Subscription status */
  status: SubscriptionStatus;
  /** Whether subscription cancels at period end */
  cancelAtPeriodEnd?: boolean;
  /** When subscription was canceled */
  canceledAt?: string | null;
  /** Current billing period start */
  currentPeriodStart?: string;
  /** Current billing period end */
  currentPeriodEnd?: string;
  /** Trial end date */
  trialEnd?: string | null;
  /** When record was created */
  createdAt?: string;
  /** When record was last updated */
  updatedAt?: string;
}

/**
 * Subscription status values
 */
export type SubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'unpaid'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'paused';

/**
 * Payment record data structure for Firestore
 */
export interface PaymentData {
  /** Subscription ID (document ID) */
  subscriptionId: string;
  /** Firebase user ID */
  userId: string;
  /** Stripe invoice ID */
  stripeInvoiceId: string;
  /** Stripe payment intent ID */
  stripePaymentIntentId: string | null;
  /** Payment amount in cents */
  amount: number;
  /** Currency code (e.g., 'usd') */
  currency: string;
  /** Payment status */
  status: PaymentStatus;
  /** Description of the payment */
  description: string;
  /** URL to the hosted invoice receipt */
  receiptUrl?: string | null;
  /** URL to the invoice PDF */
  invoicePdf?: string | null;
  /** When payment was created */
  createdAt?: string;
}

/**
 * Payment status values
 */
export type PaymentStatus =
  | 'succeeded'
  | 'failed'
  | 'pending'
  | 'refunded'
  | 'partially_refunded'
  | 'canceled';

/**
 * Customer data structure for Firestore
 */
export interface CustomerData {
  /** Stripe customer ID */
  stripeCustomerId: string;
  /** Firebase user ID (if linked) */
  userId?: string | null;
  /** Customer email */
  email: string;
  /** Customer name */
  name?: string | null;
  /** Customer phone */
  phone?: string | null;
  /** Default payment method ID */
  defaultPaymentMethodId?: string | null;
  /** Customer metadata */
  metadata?: Record<string, string>;
  /** When record was created */
  createdAt?: string;
  /** When record was last updated */
  updatedAt?: string;
}

// =============================================================================
// WEBHOOK METADATA TYPES
// =============================================================================

/**
 * Expected metadata on checkout sessions
 */
export interface CheckoutSessionMetadata {
  /** Firebase user ID */
  userId?: string;
  /** Organization ID */
  organizationId?: string;
  /** Plan type being purchased */
  planType?: string;
  /** Referring user ID (for referral tracking) */
  referrerId?: string;
}

/**
 * Expected metadata on subscriptions
 */
export interface SubscriptionMetadata {
  /** Firebase user ID */
  userId?: string;
  /** Organization ID */
  organizationId?: string;
  /** Plan type */
  planType?: string;
}

// =============================================================================
// HELPER TYPES
// =============================================================================

/**
 * Extended Invoice type for webhook payloads that may include legacy fields
 */
export type StripeInvoiceWithLegacy = Stripe.Invoice & {
  payment_intent?: string | Stripe.PaymentIntent | null;
  subscription?: string | Stripe.Subscription | null;
};

/**
 * Extended Subscription type with period fields
 */
export type StripeSubscriptionWithPeriod = Stripe.Subscription & {
  current_period_start?: number;
  current_period_end?: number;
};

// =============================================================================
// EVENT HANDLER MAP TYPE
// =============================================================================

/**
 * Map of event types to their handlers
 */
export type WebhookHandlerMap = {
  [K in StripeWebhookEventType]?: WebhookHandler;
};

/**
 * Webhook processing context
 */
export interface WebhookContext {
  /** Stripe event ID */
  eventId: string;
  /** Event type */
  eventType: StripeWebhookEventType;
  /** When the event was created (Unix timestamp) */
  eventCreated: number;
  /** Whether this is a livemode event */
  livemode: boolean;
  /** API version used */
  apiVersion: string | null;
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Check if an event type is a checkout event
 */
export function isCheckoutEvent(type: string): type is StripeWebhookEventType {
  return type.startsWith('checkout.session.');
}

/**
 * Check if an event type is a subscription event
 */
export function isSubscriptionEvent(type: string): type is StripeWebhookEventType {
  return type.startsWith('customer.subscription.');
}

/**
 * Check if an event type is an invoice event
 */
export function isInvoiceEvent(type: string): type is StripeWebhookEventType {
  return type.startsWith('invoice.');
}

/**
 * Check if an event type is a customer event
 */
export function isCustomerEvent(type: string): type is StripeWebhookEventType {
  return type.startsWith('customer.') && !type.startsWith('customer.subscription.');
}

/**
 * Check if an event type is a payment intent event
 */
export function isPaymentIntentEvent(type: string): type is StripeWebhookEventType {
  return type.startsWith('payment_intent.');
}
