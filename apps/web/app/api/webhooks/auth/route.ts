import crypto from 'node:crypto';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'api-webhooks-auth' });

// =============================================================================
// TYPES
// =============================================================================

/** Auth event types */
type AuthEventType =
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'user.signed_in'
  | 'user.signed_out';

/** Auth webhook payload structure */
interface AuthWebhookPayload {
  type: AuthEventType;
  table: string;
  record: {
    id: string;
    email?: string;
    email_confirmed_at?: string | null;
    phone?: string;
    created_at: string;
    updated_at?: string;
    last_sign_in_at?: string;
    raw_app_meta_data?: Record<string, unknown>;
    raw_user_meta_data?: Record<string, unknown>;
  };
  old_record?: {
    id: string;
    email?: string;
    email_confirmed_at?: string | null;
  };
}

/** Audit log entry type */
interface AuditLogEntry {
  actor_id: string;
  action: string;
  target_user_id?: string | null;
  resource?: string | null;
  result: 'success' | 'denied' | 'error';
  metadata?: Record<string, unknown>;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

// =============================================================================
// AUDIT LOGGING
// =============================================================================

/**
 * Insert audit log entry to Firestore
 * TODO(LXD-301): Add index for efficient querying
 */
async function insertAuditLog(data: AuditLogEntry): Promise<void> {
  try {
    await adminDb.collection('audit_logs').add(data);
  } catch (error) {
    log.error('Failed to insert audit log', { error, data });
  }
}

// =============================================================================
// WEBHOOK SIGNATURE VERIFICATION
// =============================================================================

/**
 * Verify the webhook signature
 * Uses HMAC SHA-256 for signature verification
 */
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature || !secret) {
    return false;
  }

  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}

// =============================================================================
// EVENT HANDLERS
// =============================================================================

/**
 * Handle new user creation
 */
async function handleUserCreated(record: AuthWebhookPayload['record']): Promise<void> {
  log.info('User created', { userId: record.id, email: record.email });

  await insertAuditLog({
    actor_id: record.id,
    action: 'user_created',
    resource: 'auth.users',
    result: 'success',
    metadata: {
      email: record.email,
      provider: record.raw_app_meta_data?.provider || 'email',
      created_at: record.created_at,
    },
    created_at: new Date().toISOString(),
  });

  // TODO(LXD-301): Send welcome email
  // TODO(LXD-301): Create default user preferences in Firestore
}

/**
 * Handle user profile updates
 */
async function handleUserUpdated(
  record: AuthWebhookPayload['record'],
  oldRecord: AuthWebhookPayload['old_record'],
): Promise<void> {
  log.info('User updated', { userId: record.id });

  const emailJustConfirmed = !oldRecord?.email_confirmed_at && record.email_confirmed_at;

  await insertAuditLog({
    actor_id: record.id,
    action: emailJustConfirmed ? 'email_confirmed' : 'user_updated',
    resource: 'auth.users',
    result: 'success',
    metadata: {
      email: record.email,
      email_confirmed: !!record.email_confirmed_at,
      updated_at: record.updated_at,
    },
    created_at: new Date().toISOString(),
  });
}

/**
 * Handle user deletion
 */
async function handleUserDeleted(record: AuthWebhookPayload['record']): Promise<void> {
  log.info('User deleted', { userId: record.id });

  await insertAuditLog({
    actor_id: 'system',
    action: 'user_deleted',
    resource: 'auth.users',
    result: 'success',
    metadata: {
      deleted_user_id: record.id,
      deleted_at: new Date().toISOString(),
    },
    created_at: new Date().toISOString(),
  });

  // TODO(LXD-301): Clean up user data from Firestore (GDPR compliance)
}

/**
 * Handle user sign-in events
 */
async function handleUserSignedIn(record: AuthWebhookPayload['record']): Promise<void> {
  log.info('User signed in', { userId: record.id, email: record.email });

  await insertAuditLog({
    actor_id: record.id,
    action: 'user_signed_in',
    resource: 'auth.sessions',
    result: 'success',
    metadata: {
      email: record.email,
      provider: record.raw_app_meta_data?.provider || 'email',
      last_sign_in_at: record.last_sign_in_at,
    },
    created_at: new Date().toISOString(),
  });
}

/**
 * Handle user sign-out events
 */
async function handleUserSignedOut(record: AuthWebhookPayload['record']): Promise<void> {
  log.info('User signed out', { userId: record.id });

  await insertAuditLog({
    actor_id: record.id,
    action: 'user_signed_out',
    resource: 'auth.sessions',
    result: 'success',
    metadata: {
      email: record.email,
      signed_out_at: new Date().toISOString(),
    },
    created_at: new Date().toISOString(),
  });
}

// =============================================================================
// WEBHOOK ROUTE HANDLER
// =============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  const webhookSecret = process.env.AUTH_WEBHOOK_SECRET;

  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-webhook-signature');

    if (webhookSecret) {
      if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
        log.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const payload: AuthWebhookPayload = JSON.parse(rawBody);

    if (!payload.type || !payload.record?.id) {
      log.error('Invalid payload structure');
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    log.info('Received event', { eventType: payload.type });

    switch (payload.type) {
      case 'user.created':
        await handleUserCreated(payload.record);
        break;
      case 'user.updated':
        await handleUserUpdated(payload.record, payload.old_record);
        break;
      case 'user.deleted':
        await handleUserDeleted(payload.record);
        break;
      case 'user.signed_in':
        await handleUserSignedIn(payload.record);
        break;
      case 'user.signed_out':
        await handleUserSignedOut(payload.record);
        break;
      default:
        log.debug('Unknown event type', { eventType: payload.type });
    }

    return NextResponse.json({ received: true, event: payload.type });
  } catch (error) {
    log.error('Error processing webhook', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
