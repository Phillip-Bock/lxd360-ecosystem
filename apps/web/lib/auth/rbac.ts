/**
 * LXD360 RBAC System — Main Entry Point
 *
 * This module provides the unified RBAC (Role-Based Access Control) system
 * using the 4-persona model defined in CLAUDE.md v16.
 *
 * The 4 personas:
 * - Owner: Full access (level 100) — billing, settings, everything
 * - Editor: Content creation (level 70) — courses, authoring
 * - Manager: User/report management (level 50) — learners, analytics, gradebook
 * - Learner: Content consumption (level 20) — learning only
 *
 * @example
 * ```ts
 * import { hasPermission, canAccessRoute, ROLES } from '@/lib/auth/rbac';
 *
 * // Check if user can manage courses
 * if (hasPermission(userRole, 'courses:create')) {
 *   // Allow course creation
 * }
 *
 * // Check if user can access a route
 * if (canAccessRoute(userRole, '/ignite/billing')) {
 *   // Show billing page
 * }
 * ```
 *
 * @see CLAUDE.md Section 9 for full RBAC documentation
 */

// ============================================================================
// RE-EXPORTS FROM ROLE DEFINITIONS
// ============================================================================

export {
  // Claims helpers
  buildRoleClaims,
  canAssignRole,
  getHighestRole,
  getRole,
  getRoleFromClaims,
  getRoleLabel,
  getRoleLevel,
  getRolePermissions,
  getRoleRoutes,
  getRoleSafe,
  getRolesForRoute,
  // Role comparison
  hasHigherOrEqualLevel,
  // Role utilities
  isValidRoleName,
  meetsMinimumLevel,
  ROLE_NAMES,
  ROLE_ROUTES,
  // Constants
  ROLES,
  type RoleClaims,
  type RoleConfig,
  // Types
  type RoleName,
  roleCanAccessRoute,
} from './roles';

// ============================================================================
// RE-EXPORTS FROM PERMISSIONS
// ============================================================================

export {
  // Route access
  canAccessRoute,
  canAccessRouteFromClaims,
  canManageBilling,
  // API permission guards
  canManageCourses,
  canManageEnrollments,
  canManageSettings,
  canManageUsers,
  canViewCourses,
  canViewReports,
  getExpandedPermissions,
  getRouteAccess,
  getRouteConfig,
  hasAllPermissions,
  hasAnyPermission,
  // Permission checking
  hasPermission,
  // Claims-based checking
  hasPermissionFromClaims,
  isEditorOrAbove,
  isLearnerOrAbove,
  isManagerOrAbove,
  isOwner,
  PERMISSION_ACTIONS,
  // Constants
  PERMISSION_NAMESPACES,
  type Permission,
  type PermissionAction,
  // Types
  type PermissionNamespace,
  PROTECTED_ROUTES,
  type RouteAccessResult,
  type RouteConfig,
  // Role requirement utilities
  requireRole,
} from './permissions';

// ============================================================================
// UNIFIED RBAC UTILITIES
// ============================================================================

import { canAccessRoute as checkRouteAccess, hasPermission } from './permissions';
import { getRoleLevel, getRolePermissions, isValidRoleName, ROLES, type RoleName } from './roles';

/**
 * Complete user authorization context
 */
export interface AuthorizationContext {
  role: RoleName;
  level: number;
  permissions: readonly string[];
  tenantId: string | null;
}

/**
 * Create authorization context from role name and tenant
 */
export function createAuthorizationContext(
  roleName: RoleName,
  tenantId: string | null = null,
): AuthorizationContext {
  return {
    role: roleName,
    level: getRoleLevel(roleName),
    permissions: getRolePermissions(roleName),
    tenantId,
  };
}

/**
 * Authorization check result with details
 */
export interface AuthorizationResult {
  authorized: boolean;
  reason: string;
  requiredLevel?: number;
  requiredPermission?: string;
}

/**
 * Check if user is authorized for a permission
 */
export function checkPermissionAuthorization(
  context: AuthorizationContext,
  permission: string,
): AuthorizationResult {
  const authorized = hasPermission(context.role, permission);
  return {
    authorized,
    reason: authorized
      ? 'Permission granted'
      : `Role '${context.role}' does not have permission '${permission}'`,
    requiredPermission: permission,
  };
}

/**
 * Check if user is authorized for a route
 */
export function checkRouteAuthorization(
  context: AuthorizationContext,
  route: string,
): AuthorizationResult {
  const authorized = checkRouteAccess(context.role, route);
  return {
    authorized,
    reason: authorized
      ? 'Route access granted'
      : `Role '${context.role}' cannot access route '${route}'`,
  };
}

/**
 * Check if user is authorized for a minimum role level
 */
export function checkLevelAuthorization(
  context: AuthorizationContext,
  minimumLevel: number,
): AuthorizationResult {
  const authorized = context.level >= minimumLevel;
  return {
    authorized,
    reason: authorized
      ? 'Level requirement met'
      : `Role level ${context.level} is below required level ${minimumLevel}`,
    requiredLevel: minimumLevel,
  };
}

// ============================================================================
// ROUTE GUARD HELPERS
// ============================================================================

/**
 * Options for route guard
 */
export interface RouteGuardOptions {
  /** Minimum role required */
  minimumRole?: RoleName;
  /** Specific permission required */
  requiredPermission?: string;
  /** Redirect path for unauthorized users */
  redirectTo?: string;
}

/**
 * Route guard result
 */
export interface RouteGuardResult {
  allowed: boolean;
  redirectTo: string | null;
  reason: string;
}

/**
 * Check route guard for a user role
 */
export function checkRouteGuard(
  userRole: RoleName | undefined,
  options: RouteGuardOptions,
): RouteGuardResult {
  const defaultRedirect = '/ignite/dashboard';

  // No role = not authenticated
  if (!userRole || !isValidRoleName(userRole)) {
    return {
      allowed: false,
      redirectTo: '/login',
      reason: 'User is not authenticated',
    };
  }

  // Check minimum role
  if (options.minimumRole) {
    const requiredLevel = ROLES[options.minimumRole].level;
    const userLevel = ROLES[userRole].level;

    if (userLevel < requiredLevel) {
      return {
        allowed: false,
        redirectTo: options.redirectTo ?? defaultRedirect,
        reason: `Required role: ${options.minimumRole} (level ${requiredLevel}), user has: ${userRole} (level ${userLevel})`,
      };
    }
  }

  // Check specific permission
  if (options.requiredPermission) {
    if (!hasPermission(userRole, options.requiredPermission)) {
      return {
        allowed: false,
        redirectTo: options.redirectTo ?? defaultRedirect,
        reason: `Missing permission: ${options.requiredPermission}`,
      };
    }
  }

  return {
    allowed: true,
    redirectTo: null,
    reason: 'Access granted',
  };
}

// ============================================================================
// LEGACY SYSTEM RE-EXPORTS (for backward compatibility)
// ============================================================================

/**
 * Legacy types re-exported for backward compatibility
 * @deprecated Use the new 4-persona system instead
 */
export * as legacy from './rbac-legacy';

/**
 * Legacy function re-exports for backward compatibility with existing API routes.
 * These functions are from the old 35-role system.
 * @deprecated Migrate to the new 4-persona system
 */
export { canManageContent, validateRoles } from './rbac-legacy';
