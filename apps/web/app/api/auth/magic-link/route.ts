/**
 * Magic Link API Route
 *
 * POST /api/auth/magic-link
 * Generates a magic link token and sends it to the user's email.
 *
 * Security features:
 * - Rate limiting (5 requests per email per hour)
 * - Token hash stored, not the token itself
 * - 24-hour token expiry
 * - Audit logging
 *
 * @module app/api/auth/magic-link/route
 */

import { render } from '@react-email/components';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateMagicToken, getTokenExpiryDuration } from '@/lib/auth/magic-token';
import { sendEmail } from '@/lib/email/brevo-client';
import { MagicLinkEmail } from '@/lib/email/react-email/templates/auth/MagicLinkEmail';
import { logger } from '@/lib/logger';

const log = logger.scope('MagicLinkAPI');

// =============================================================================
// Configuration
// =============================================================================

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lxd360.io';

// =============================================================================
// Request Validation
// =============================================================================

const requestSchema = z.object({
  email: z.string().email('Invalid email address'),
  /** Optional destination path for deep linking (e.g., /ignite/courses/abc123) */
  destination: z.string().optional(),
  /** Optional tenant ID for multi-tenant context */
  tenantId: z.string().optional(),
});

// =============================================================================
// Helpers
// =============================================================================

/**
 * Get client IP address from request headers
 */
function getClientIp(req: NextRequest): string | undefined {
  // Check various headers for client IP (in order of precedence)
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for may contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Cloud Run specific header
  const cloudRunIp = req.headers.get('x-cloud-trace-context');
  if (cloudRunIp) {
    return cloudRunIp.split('/')[0];
  }

  return undefined;
}

/**
 * Get user agent from request
 */
function getUserAgent(req: NextRequest): string | undefined {
  return req.headers.get('user-agent') ?? undefined;
}

// =============================================================================
// POST Handler
// =============================================================================

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Parse and validate request body
    const body = await req.json();
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validation.error.errors,
        },
        { status: 400 },
      );
    }

    const { email, destination, tenantId } = validation.data;
    const requestIp = getClientIp(req);
    const userAgent = getUserAgent(req);

    log.info('Magic link requested', { email, ip: requestIp, destination, tenantId });

    // Generate magic token
    const result = await generateMagicToken(email, {
      requestIp,
      userAgent,
      destination,
      tenantId,
    });

    if (!result.success || !result.token) {
      // Return appropriate status based on error code
      const status = result.errorCode === 'RATE_LIMITED' ? 429 : 500;
      return NextResponse.json(
        {
          error: result.error ?? 'Failed to generate magic link',
          code: result.errorCode ?? 'GENERATION_FAILED',
        },
        { status },
      );
    }

    // Build magic link URL
    const magicLinkUrl = `${APP_URL}/magic?token=${encodeURIComponent(result.token)}`;

    // Render email using React Email
    const expiresIn = getTokenExpiryDuration();
    const emailHtml = await render(
      MagicLinkEmail({
        email,
        magicLinkUrl,
        expiresIn,
        destination,
      }),
    );

    // Send email via Brevo
    const emailResult = await sendEmail({
      to: [{ email }],
      subject: 'Sign in to LXD360',
      htmlContent: emailHtml,
      tags: ['magic-link', 'authentication'],
    });

    if (!emailResult.success) {
      log.error('Failed to send magic link email', new Error(emailResult.error), { email });

      return NextResponse.json(
        {
          error: 'Failed to send magic link email. Please try again.',
          code: 'EMAIL_FAILED',
        },
        { status: 500 },
      );
    }

    log.info('Magic link email sent', {
      email,
      tokenHash: result.tokenHash,
      messageId: emailResult.messageId,
    });

    // Return success (don't reveal whether user exists for security)
    return NextResponse.json({
      success: true,
      message: 'If an account exists for this email, a magic link has been sent.',
    });
  } catch (error) {
    log.error('Magic link request failed', error);

    return NextResponse.json(
      {
        error: 'An unexpected error occurred. Please try again.',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 },
    );
  }
}
