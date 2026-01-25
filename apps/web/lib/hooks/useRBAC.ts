/**
 * useRBAC — 4-Persona Role-Based Access Control Hook
 *
 * Integrates with Firebase Auth custom claims to provide:
 * - Persona detection from Firebase custom claims
 * - Route access checking (hard block vs soft gate patterns)
 * - Level-based permission checking
 *
 * @see CLAUDE.md Section 9 for persona definitions
 * @see personas.ts for ROUTE_CONFIG and access patterns
 */

'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/firebase/useAuth';
import { logger } from '@/lib/logger';
import {
  getPersonaFromClaims,
  getRouteConfig,
  PERSONA_CONFIG,
  type Persona,
  type RouteConfig,
  type RouteProtectionPattern,
} from '@/lib/rbac/personas';
import type { PermissionAction, PermissionResource, ProductType, RoleName } from '@/lib/rbac/types';

const log = logger.child({ module: 'useRBAC' });

// ============================================================================
// Types
// ============================================================================

export interface RouteAccess {
  /** Whether the user is allowed to access this route */
  allowed: boolean;
  /** The protection pattern: 'hard' redirects, 'soft' shows upgrade, 'open' is unrestricted */
  pattern: RouteProtectionPattern | 'open';
  /** CTA message for soft-gated routes */
  upgradeCTA?: string;
  /** Minimum level required for this route */
  requiredLevel?: number;
}

export interface RBACContext {
  /** Current user's persona (owner, editor, manager, learner) */
  persona: Persona;
  /** Current user's numeric access level (100, 75, 50, 25) */
  level: number;
  /** Whether auth state is still loading */
  loading: boolean;
  /** Check if user has at least the specified level */
  hasLevel: (requiredLevel: number) => boolean;
  /** Get access info for a specific route */
  getRouteAccess: (route: string) => RouteAccess;
  /** Access info for the current route */
  currentRouteAccess: RouteAccess;
  /** Convenience: user is Owner (level >= 100) */
  isOwner: boolean;
  /** Convenience: user is Editor or higher (level >= 75) */
  isEditor: boolean;
  /** Convenience: user is Manager or higher (level >= 50) */
  isManager: boolean;
  /** Convenience: user is Learner or higher (level >= 25) */
  isLearner: boolean;
  /** Whether user is an LXD360 employee (@lxd360.com email) */
  isEmployee: boolean;
  /** Persona display label */
  personaLabel: string;
  /** Persona color for badges */
  personaColor: string;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Primary RBAC hook for the LXD360 platform
 *
 * Usage:
 * ```tsx
 * const { persona, hasLevel, isOwner, currentRouteAccess } = useRBAC();
 *
 * // Check minimum level
 * if (hasLevel(75)) {
 *   // Editor or higher
 * }
 *
 * // Check route access
 * const access = getRouteAccess('/ignite/analytics');
 * if (!access.allowed && access.pattern === 'soft') {
 *   // Show upgrade prompt with access.upgradeCTA
 * }
 * ```
 */
export function useRBAC(): RBACContext {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const [claims, setClaims] = useState<Record<string, unknown> | null>(null);
  const [claimsLoading, setClaimsLoading] = useState(true);

  // Fetch custom claims from Firebase token
  useEffect(() => {
    async function fetchClaims(): Promise<void> {
      if (!user) {
        setClaims(null);
        setClaimsLoading(false);
        return;
      }

      try {
        const tokenResult = await user.getIdTokenResult();
        setClaims(tokenResult.claims as Record<string, unknown>);
        log.debug('Custom claims loaded', {
          uid: user.uid,
          persona: tokenResult.claims.persona,
          role: tokenResult.claims.role,
        });
      } catch (err) {
        log.warn('Failed to get custom claims', { error: err, uid: user.uid });
        setClaims(null);
      } finally {
        setClaimsLoading(false);
      }
    }

    fetchClaims();
  }, [user]);

  return useMemo(() => {
    const loading = authLoading || claimsLoading;

    // Get persona from claims (defaults to 'learner' for safety)
    const persona: Persona = claims ? getPersonaFromClaims(claims) : 'learner';
    const config = PERSONA_CONFIG[persona];
    const level = config.level;

    // Check if user is an LXD360 employee
    const email = user?.email ?? '';
    const isEmployee = email.endsWith('@lxd360.com');

    // Level check helper
    const hasLevel = (requiredLevel: number): boolean => level >= requiredLevel;

    // Route access helper
    const getRouteAccess = (route: string): RouteAccess => {
      const routeConfig: RouteConfig | null = getRouteConfig(route);

      if (!routeConfig) {
        return { allowed: true, pattern: 'open' };
      }

      const allowed = level >= routeConfig.minLevel;

      return {
        allowed,
        pattern: routeConfig.pattern,
        upgradeCTA: routeConfig.upgradeCTA,
        requiredLevel: routeConfig.minLevel,
      };
    };

    // Current route access
    const currentRouteAccess = pathname
      ? getRouteAccess(pathname)
      : { allowed: true, pattern: 'open' as const };

    return {
      persona,
      level,
      loading,
      hasLevel,
      getRouteAccess,
      currentRouteAccess,
      isOwner: level >= 100,
      isEditor: level >= 75,
      isManager: level >= 50,
      isLearner: level >= 25,
      isEmployee,
      personaLabel: config.label,
      personaColor: config.color,
    };
  }, [authLoading, claimsLoading, claims, user, pathname]);
}

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * Check if current user has at least the specified persona level
 */
export function useHasLevel(requiredLevel: number): { hasLevel: boolean; loading: boolean } {
  const { level, loading } = useRBAC();
  return { hasLevel: level >= requiredLevel, loading };
}

/**
 * Get the current user's persona
 */
export function usePersona(): { persona: Persona; loading: boolean } {
  const { persona, loading } = useRBAC();
  return { persona, loading };
}

/**
 * Check if current user can access a specific route
 */
export function useRouteAccess(route: string): { access: RouteAccess; loading: boolean } {
  const { getRouteAccess, loading } = useRBAC();
  return { access: getRouteAccess(route), loading };
}

/**
 * Check if current user is an LXD360 employee
 */
export function useIsEmployee(): { isEmployee: boolean; loading: boolean } {
  const { isEmployee, loading } = useRBAC();
  return { isEmployee, loading };
}

// ============================================================================
// Legacy Compatibility Hooks (Deprecated - use new 4-persona hooks)
// ============================================================================

/**
 * Legacy role name to level mapping
 * @deprecated Use useHasLevel with numeric levels instead
 */
const LEGACY_ROLE_LEVELS: Record<RoleName, number> = {
  super_admin: 100,
  org_admin: 100,
  admin: 100,
  manager: 75,
  instructor: 75,
  mentor: 50,
  learner: 25,
  mentee: 25,
  subscriber: 25,
  user: 25,
  guest: 0,
};

/**
 * @deprecated Use useHasLevel instead
 * Legacy hook for checking minimum role
 */
export function useMinimumRole(requiredRole: RoleName): {
  hasMinimum: boolean;
  isLoading: boolean;
  error: Error | null;
} {
  const { level, loading } = useRBAC();
  const requiredLevel = LEGACY_ROLE_LEVELS[requiredRole] ?? 0;

  return {
    hasMinimum: level >= requiredLevel,
    isLoading: loading,
    error: null,
  };
}

/**
 * @deprecated Use hasLevel check instead
 * Legacy hook for checking specific permissions
 * Now maps to level-based access
 */
export function usePermission(
  _action: PermissionAction,
  _resource: PermissionResource,
): {
  hasPermission: boolean;
  isLoading: boolean;
  error: Error | null;
} {
  const { isManager, loading } = useRBAC();

  // Most permissions require at least Manager level in the new system
  return {
    hasPermission: isManager,
    isLoading: loading,
    error: null,
  };
}

/**
 * @deprecated Use hasLevel check instead
 * Legacy hook for checking product access
 * Now maps to level-based access
 */
export function useProductAccess(_product: ProductType): {
  hasAccess: boolean;
  isLoading: boolean;
  error: Error | null;
} {
  const { isEditor, loading } = useRBAC();

  // Product access typically requires Editor level in the new system
  return {
    hasAccess: isEditor,
    isLoading: loading,
    error: null,
  };
}
