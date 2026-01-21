import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { logger } from '@/lib/logger';
import { getStripe } from '@/lib/stripe/config';
import { routeWebhookEvent } from '@/lib/stripe/webhooks';

const log = logger.child({ module: 'api-webhooks-stripe' });

// =============================================================================
// WEBHOOK HANDLER
// =============================================================================

/**
 * POST /api/webhooks/stripe
 *
 * Handles incoming Stripe webhook events.
 *
 * @param request - The incoming request
 * @returns JSON response with processing result
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  // Validate signature header
  if (!signature) {
    log.error('Missing stripe-signature header');
    return NextResponse.json(
      {
        success: false,
        error: { code: 'MISSING_SIGNATURE', message: 'No stripe-signature header' },
      },
      { status: 400 },
    );
  }

  // Validate webhook secret
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    log.error('STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      {
        success: false,
        error: { code: 'CONFIG_ERROR', message: 'Webhook secret not configured' },
      },
      { status: 500 },
    );
  }

  // Construct and verify the event
  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log.error('Webhook signature verification failed', { error: message });
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INVALID_SIGNATURE', message: 'Webhook signature verification failed' },
      },
      { status: 400 },
    );
  }

  // Route to appropriate handler
  try {
    const result = await routeWebhookEvent(event);

    if (!result.success) {
      log.warn('Webhook handler returned failure', {
        eventType: event.type,
        eventId: event.id,
        error: result.error,
      });

      // Return 200 to acknowledge receipt even if handler failed
      // This prevents Stripe from retrying unless it's a transient error
      return NextResponse.json({
        success: false,
        received: true,
        error: result.error,
      });
    }

    log.info('Webhook processed successfully', {
      eventType: event.type,
      eventId: event.id,
    });

    return NextResponse.json({
      success: true,
      received: true,
      message: result.message,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.error('Webhook handler threw exception', {
      eventType: event.type,
      eventId: event.id,
      error: message,
    });

    // Return 500 to trigger Stripe retry for transient errors
    return NextResponse.json(
      {
        success: false,
        error: { code: 'HANDLER_ERROR', message },
      },
      { status: 500 },
    );
  }
}

// =============================================================================
// ROUTE CONFIG
// =============================================================================

/**
 * Route segment config
 * - runtime: 'edge' is not supported because we need Node.js crypto for signature verification
 * - dynamic: 'force-dynamic' ensures the route is never cached
 */
export const dynamic = 'force-dynamic';
