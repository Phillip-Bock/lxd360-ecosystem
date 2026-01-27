/**
 * Magic Link Validation API Route
 *
 * POST /api/auth/magic-link/validate
 * Validates a magic link token and returns a Firebase custom token for sign-in.
 *
 * @module app/api/auth/magic-link/validate/route
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateMagicToken } from '@/lib/auth/magic-token';
import { logger } from '@/lib/logger';

const log = logger.scope('MagicLinkValidateAPI');

// =============================================================================
// Request Validation
// =============================================================================

const requestSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

// =============================================================================
// Helpers
// =============================================================================

/**
 * Get client IP address from request headers
 */
function getClientIp(req: NextRequest): string | undefined {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
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

    const { token } = validation.data;
    const requestIp = getClientIp(req);
    const userAgent = getUserAgent(req);

    log.info('Magic link validation requested', { ip: requestIp });

    // Validate token
    const result = await validateMagicToken(token, {
      requestIp,
      userAgent,
    });

    if (!result.success) {
      // Return appropriate status based on error code
      let status = 400;
      if (result.errorCode === 'EXPIRED_TOKEN') {
        status = 410; // Gone
      } else if (result.errorCode === 'ALREADY_USED') {
        status = 409; // Conflict
      }

      return NextResponse.json(
        {
          error: result.error,
          code: result.errorCode,
        },
        { status },
      );
    }

    log.info('Magic link validated successfully', {
      email: result.email,
      uid: result.uid,
      destination: result.destination,
      tenantId: result.tenantId,
    });

    // Return custom token for client-side Firebase sign-in
    return NextResponse.json({
      success: true,
      customToken: result.customToken,
      email: result.email,
      destination: result.destination,
      tenantId: result.tenantId,
    });
  } catch (error) {
    log.error('Magic link validation failed', error);

    return NextResponse.json(
      {
        error: 'An unexpected error occurred. Please try again.',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 },
    );
  }
}
