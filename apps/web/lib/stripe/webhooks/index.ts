import type Stripe from 'stripe';
import { adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger';
import {
  handleCheckoutAsyncPaymentFailed,
  handleCheckoutAsyncPaymentSucceeded,
  // Checkout handlers
  handleCheckoutCompleted,
  handleCheckoutExpired,
  // Customer handlers
  handleCustomerCreated,
  handleCustomerDeleted,
  handleCustomerUpdated,
  // Invoice handlers
  handleInvoiceCreated,
  handleInvoiceFinalized,
  handleInvoiceMarkedUncollectible,
  handleInvoicePaid,
  handleInvoicePaymentActionRequired,
  handleInvoicePaymentFailed,
  handleInvoiceUpcoming,
  handleInvoiceVoided,
  handlePaymentIntentFailed,
  handlePaymentIntentSucceeded,
  handlePaymentMethodAttached,
  handlePaymentMethodDetached,
  handlePaymentMethodUpdated,
  // Subscription handlers
  handleSubscriptionCreated,
  handleSubscriptionDeleted,
  handleSubscriptionPaused,
  handleSubscriptionResumed,
  handleSubscriptionUpdated,
  handleTrialWillEnd,
} from './handlers';
import type { StripeWebhookEventType, WebhookContext, WebhookHandlerResult } from './types';

const log = logger.child({ module: 'stripe-webhook-router' });

// =============================================================================
// AUDIT LOGGING
// =============================================================================

/**
 * Record webhook event for audit trail
 */
async function recordWebhookEvent(
  context: WebhookContext,
  result: WebhookHandlerResult,
): Promise<void> {
  try {
    await adminDb.collection('webhook_events').add({
      provider: 'stripe',
      eventId: context.eventId,
      eventType: context.eventType,
      eventCreated: new Date(context.eventCreated * 1000).toISOString(),
      livemode: context.livemode,
      apiVersion: context.apiVersion,
      success: result.success,
      message: result.message,
      error: result.error ?? null,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    // Don't fail the webhook if audit logging fails
    log.error('Failed to record webhook event', { error, context });
  }
}

// =============================================================================
// EVENT ROUTER
// =============================================================================

/**
 * Route a Stripe event to the appropriate handler
 *
 * @param event - The Stripe event to process
 * @returns Promise resolving to the handler result
 *
 * @example
 * ```typescript
 * const result = await routeWebhookEvent(event);
 * if (!result.success) {
 *   console.error('Webhook failed:', result.error);
 * }
 * ```
 */
export async function routeWebhookEvent(event: Stripe.Event): Promise<WebhookHandlerResult> {
  const context: WebhookContext = {
    eventId: event.id,
    eventType: event.type as StripeWebhookEventType,
    eventCreated: event.created,
    livemode: event.livemode,
    apiVersion: event.api_version,
  };

  log.info('Processing webhook event', {
    eventId: event.id,
    eventType: event.type,
    livemode: event.livemode,
  });

  let result: WebhookHandlerResult;

  try {
    switch (event.type) {
      // Checkout events
      case 'checkout.session.completed':
        result = await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, event);
        break;
      case 'checkout.session.expired':
        result = await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session, event);
        break;
      case 'checkout.session.async_payment_succeeded':
        result = await handleCheckoutAsyncPaymentSucceeded(
          event.data.object as Stripe.Checkout.Session,
          event,
        );
        break;
      case 'checkout.session.async_payment_failed':
        result = await handleCheckoutAsyncPaymentFailed(
          event.data.object as Stripe.Checkout.Session,
          event,
        );
        break;

      // Subscription events
      case 'customer.subscription.created':
        result = await handleSubscriptionCreated(event.data.object as Stripe.Subscription, event);
        break;
      case 'customer.subscription.updated':
        result = await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, event);
        break;
      case 'customer.subscription.deleted':
        result = await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, event);
        break;
      case 'customer.subscription.paused':
        result = await handleSubscriptionPaused(event.data.object as Stripe.Subscription, event);
        break;
      case 'customer.subscription.resumed':
        result = await handleSubscriptionResumed(event.data.object as Stripe.Subscription, event);
        break;
      case 'customer.subscription.trial_will_end':
        result = await handleTrialWillEnd(event.data.object as Stripe.Subscription, event);
        break;

      // Invoice events
      case 'invoice.created':
        result = await handleInvoiceCreated(event.data.object as Stripe.Invoice, event);
        break;
      case 'invoice.finalized':
        result = await handleInvoiceFinalized(event.data.object as Stripe.Invoice, event);
        break;
      case 'invoice.paid':
        result = await handleInvoicePaid(event.data.object as Stripe.Invoice, event);
        break;
      case 'invoice.payment_failed':
        result = await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, event);
        break;
      case 'invoice.payment_action_required':
        result = await handleInvoicePaymentActionRequired(
          event.data.object as Stripe.Invoice,
          event,
        );
        break;
      case 'invoice.upcoming':
        result = await handleInvoiceUpcoming(event.data.object as Stripe.Invoice, event);
        break;
      case 'invoice.marked_uncollectible':
        result = await handleInvoiceMarkedUncollectible(event.data.object as Stripe.Invoice, event);
        break;
      case 'invoice.voided':
        result = await handleInvoiceVoided(event.data.object as Stripe.Invoice, event);
        break;

      // Customer events
      case 'customer.created':
        result = await handleCustomerCreated(event.data.object as Stripe.Customer, event);
        break;
      case 'customer.updated':
        result = await handleCustomerUpdated(event.data.object as Stripe.Customer, event);
        break;
      case 'customer.deleted':
        result = await handleCustomerDeleted(event.data.object as Stripe.Customer, event);
        break;

      // Payment intent events
      case 'payment_intent.succeeded':
        result = await handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent,
          event,
        );
        break;
      case 'payment_intent.payment_failed':
        result = await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent, event);
        break;

      // Payment method events
      case 'payment_method.attached':
        result = await handlePaymentMethodAttached(
          event.data.object as Stripe.PaymentMethod,
          event,
        );
        break;
      case 'payment_method.detached':
        result = await handlePaymentMethodDetached(
          event.data.object as Stripe.PaymentMethod,
          event,
        );
        break;
      case 'payment_method.updated':
        result = await handlePaymentMethodUpdated(event.data.object as Stripe.PaymentMethod, event);
        break;

      // Unhandled events
      default:
        log.debug('Unhandled webhook event type', { eventType: event.type });
        result = {
          success: true,
          message: `Event type ${event.type} not handled`,
        };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Webhook handler error', {
      eventType: event.type,
      eventId: event.id,
      error: errorMessage,
    });
    result = {
      success: false,
      error: errorMessage,
    };
  }

  // Record event for audit trail
  await recordWebhookEvent(context, result);

  return result;
}

// =============================================================================
// EXPORTS
// =============================================================================

// Re-export individual handlers for testing
export * from './handlers';
// Re-export types
export type {
  CheckoutSessionMetadata,
  CustomerData,
  PaymentData,
  PaymentStatus,
  StripeWebhookEventType,
  SubscriptionData,
  SubscriptionMetadata,
  SubscriptionStatus,
  WebhookContext,
  WebhookHandlerResult,
} from './types';
// Re-export type guards
export {
  isCheckoutEvent,
  isCustomerEvent,
  isInvoiceEvent,
  isPaymentIntentEvent,
  isSubscriptionEvent,
} from './types';
