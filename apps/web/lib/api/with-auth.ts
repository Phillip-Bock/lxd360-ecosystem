import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import { adminAuth, verifyIdToken } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger';
import type { Persona } from '@/lib/rbac/personas';

const log = logger.scope('AuthMiddleware');

/**
 * Authenticated user information extracted from token
 */
export interface AuthUser {
  uid: string;
  email: string | undefined;
  tenantId: string;
  persona: Persona;
}

/**
 * Extended request with authenticated user
 */
export interface AuthenticatedRequest extends NextRequest {
  user: AuthUser;
}

/**
 * Route handler type for authenticated routes
 */
type AuthenticatedHandler = (req: AuthenticatedRequest) => Promise<NextResponse>;

/**
 * Higher-order function that wraps API route handlers with authentication
 *
 * Supports both Bearer token and __session cookie authentication.
 * Extracts tenantId and persona from Firebase Custom Claims.
 *
 * @example
 * ```ts
 * async function handler(req: AuthenticatedRequest) {
 *   const { uid, tenantId, persona } = req.user;
 *   return NextResponse.json({ userId: uid });
 * }
 *
 * export const POST = withAuth(handler);
 * ```
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Try Bearer token first (for API clients)
      const authHeader = req.headers.get('authorization');
      let token: string | null = null;

      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else {
        // Fall back to session cookie (for browser)
        token = req.cookies.get('__session')?.value ?? null;
      }

      if (!token) {
        return NextResponse.json({ error: 'Unauthorized', code: 'NO_TOKEN' }, { status: 401 });
      }

      // Verify the token
      const decodedToken = await verifyIdToken(token);

      if (!decodedToken) {
        return NextResponse.json(
          { error: 'Invalid token', code: 'INVALID_TOKEN' },
          { status: 401 },
        );
      }

      // Extract persona and tenantId from custom claims
      const persona = (decodedToken.persona as Persona) || 'learner';
      const tenantId =
        (decodedToken.tenantId as string) ||
        (decodedToken.tenant_id as string) ||
        'default-dev-tenant';

      // Attach user to request
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        tenantId,
        persona,
      };

      return handler(authenticatedReq);
    } catch (error) {
      log.error('Authentication failed', error);
      return NextResponse.json(
        { error: 'Authentication failed', code: 'AUTH_ERROR' },
        { status: 401 },
      );
    }
  };
}

/**
 * Get user from token without wrapping (for existing handlers)
 */
export async function getUserFromRequest(req: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = req.headers.get('authorization');
    let token: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      token = req.cookies.get('__session')?.value ?? null;
    }

    if (!token) return null;

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) return null;

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      tenantId:
        (decodedToken.tenantId as string) ||
        (decodedToken.tenant_id as string) ||
        'default-dev-tenant',
      persona: (decodedToken.persona as Persona) || 'learner',
    };
  } catch {
    return null;
  }
}

/**
 * Set custom claims for a user (for admin use)
 */
export async function setUserClaims(
  uid: string,
  claims: { persona: Persona; tenantId: string },
): Promise<void> {
  await adminAuth.setCustomUserClaims(uid, claims);
}
