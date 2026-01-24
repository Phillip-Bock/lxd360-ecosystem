import { NextResponse } from 'next/server';
import { canAccess, PERSONA_CONFIG, type Persona } from '@/lib/rbac/personas';
import type { AuthenticatedRequest } from './with-auth';

/**
 * Route handler type for authenticated routes
 */
type AuthenticatedHandler = (req: AuthenticatedRequest) => Promise<NextResponse>;

/**
 * Guard that checks if user's persona has sufficient access level
 *
 * @example
 * ```ts
 * // Only owners and editors can access this endpoint
 * export const POST = withAuth(withRoleGuard('editor', handler));
 * ```
 */
export function withRoleGuard(minPersona: Persona, handler: AuthenticatedHandler) {
  return async (req: AuthenticatedRequest): Promise<NextResponse> => {
    const userPersona = req.user.persona;
    const userLevel = PERSONA_CONFIG[userPersona]?.level ?? 0;
    const requiredLevel = PERSONA_CONFIG[minPersona]?.level ?? 100;

    if (userLevel < requiredLevel) {
      return NextResponse.json(
        {
          error: 'Insufficient permissions',
          code: 'FORBIDDEN',
          required: minPersona,
          current: userPersona,
        },
        { status: 403 },
      );
    }

    return handler(req);
  };
}

/**
 * Guard that checks if user can access a specific route area
 *
 * Uses the route-based permissions defined in PERSONA_CONFIG.
 *
 * @example
 * ```ts
 * // Only personas with 'authoring' permission can access
 * export const POST = withAuth(withRouteAccess('authoring', handler));
 * ```
 */
export function withRouteAccess(route: string, handler: AuthenticatedHandler) {
  return async (req: AuthenticatedRequest): Promise<NextResponse> => {
    const userPersona = req.user.persona;

    if (!canAccess(userPersona, route)) {
      return NextResponse.json(
        {
          error: 'Access denied to this feature',
          code: 'ROUTE_FORBIDDEN',
          route,
          persona: userPersona,
        },
        { status: 403 },
      );
    }

    return handler(req);
  };
}

/**
 * Guard that ensures user belongs to the specified tenant
 *
 * @example
 * ```ts
 * // Ensure user can only access their own tenant's data
 * export const GET = withAuth(withTenantGuard(handler));
 * ```
 */
export function withTenantGuard(handler: AuthenticatedHandler) {
  return async (req: AuthenticatedRequest): Promise<NextResponse> => {
    const { tenantId } = req.user;

    // Extract tenant from URL or body
    const url = new URL(req.url);
    const urlTenantId = url.searchParams.get('tenantId');

    // If a tenant is specified in the request, ensure it matches user's tenant
    if (urlTenantId && urlTenantId !== tenantId) {
      return NextResponse.json(
        {
          error: 'Access denied to this tenant',
          code: 'TENANT_MISMATCH',
        },
        { status: 403 },
      );
    }

    return handler(req);
  };
}
