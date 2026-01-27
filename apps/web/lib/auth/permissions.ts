/**
 * LXD360 Permission Checking Utilities
 *
 * This module provides utilities for checking user permissions based on
 * the 4-persona RBAC system. Permissions use a namespace:action format
 * with wildcard support.
 *
 * Permission Format: namespace:action
 * - namespace:* — All actions in namespace
 * - * — All permissions (owner only)
 *
 * @see lib/auth/roles.ts for role definitions
 */

import { isValidRoleName, meetsMinimumLevel, ROLES, type RoleName } from './roles';

// ============================================================================
// PERMISSION DEFINITIONS
// ============================================================================

/**
 * All permission namespaces in the system
 */
export const PERMISSION_NAMESPACES = [
  'content',
  'courses',
  'users',
  'reports',
  'enrollments',
  'progress',
  'billing',
  'settings',
  'analytics',
] as const;

export type PermissionNamespace = (typeof PERMISSION_NAMESPACES)[number];

/**
 * All permission actions
 */
export const PERMISSION_ACTIONS = ['create', 'read', 'update', 'delete', 'write', '*'] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

/**
 * Standard permission format
 */
export type Permission = `${PermissionNamespace}:${PermissionAction}` | '*';

// ============================================================================
// PERMISSION CHECKING
// ============================================================================

/**
 * Check if a user role has a specific permission
 *
 * Supports wildcard matching:
 * - '*' matches all permissions
 * - 'namespace:*' matches all actions in namespace
 * - 'namespace:action' matches specific permission
 *
 * @param userRole - The user's role name
 * @param requiredPermission - The permission to check for
 * @returns true if the user has the permission
 *
 * @example
 * hasPermission('owner', 'content:create') // true (owner has '*')
 * hasPermission('editor', 'content:create') // true (editor has 'content:*')
 * hasPermission('learner', 'content:create') // false
 */
export function hasPermission(userRole: RoleName, requiredPermission: string): boolean {
  const roleConfig = ROLES[userRole];
  // Cast to string[] to allow includes() checks with string arguments
  const permissions = roleConfig.permissions as readonly string[];

  // Check for wildcard (owner has full access)
  if (permissions.includes('*')) {
    return true;
  }

  // Check for exact match
  if (permissions.includes(requiredPermission)) {
    return true;
  }

  // Check for namespace wildcard match (e.g., 'content:*' matches 'content:create')
  const [namespace] = requiredPermission.split(':');
  const namespaceWildcard = `${namespace}:*`;
  if (permissions.includes(namespaceWildcard)) {
    return true;
  }

  return false;
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(userRole: RoleName, requiredPermissions: string[]): boolean {
  return requiredPermissions.every((permission) => hasPermission(userRole, permission));
}

/**
 * Check if a user has at least one of the specified permissions
 */
export function hasAnyPermission(userRole: RoleName, requiredPermissions: string[]): boolean {
  return requiredPermissions.some((permission) => hasPermission(userRole, permission));
}

/**
 * Get all permissions that a role has (expanded from wildcards)
 */
export function getExpandedPermissions(userRole: RoleName): string[] {
  const roleConfig = ROLES[userRole];
  // Cast to string[] to allow includes() and iteration with string types
  const permissions = roleConfig.permissions as readonly string[];

  // If role has full wildcard, return special marker
  if (permissions.includes('*')) {
    return ['*'];
  }

  const expanded: string[] = [];

  for (const permission of permissions) {
    if (permission.endsWith(':*')) {
      // Expand namespace wildcard to all actions
      const namespace = permission.slice(0, -2);
      for (const action of PERMISSION_ACTIONS.filter((a) => a !== '*')) {
        expanded.push(`${namespace}:${action}`);
      }
    } else {
      expanded.push(permission);
    }
  }

  return expanded;
}

// ============================================================================
// ROUTE ACCESS CHECKING
// ============================================================================

/**
 * Route protection configuration
 */
export interface RouteConfig {
  /** Minimum role level required */
  minLevel: number;
  /** Protection pattern: 'hard' redirects, 'soft' shows upgrade prompt */
  pattern: 'hard' | 'soft';
  /** CTA message for soft gates */
  upgradeCTA?: string;
}

/**
 * Protected routes configuration
 */
export const PROTECTED_ROUTES: Record<string, RouteConfig> = {
  // Hard blocks (security-critical)
  '/ignite/billing': { minLevel: 100, pattern: 'hard' },
  '/ignite/settings': { minLevel: 100, pattern: 'hard' },
  '/settings/billing': { minLevel: 100, pattern: 'hard' },
  '/settings/organization': { minLevel: 100, pattern: 'hard' },

  // Soft gates (feature discovery)
  '/inspire': {
    minLevel: 70,
    pattern: 'soft',
    upgradeCTA: 'Upgrade to Editor to access INSPIRE authoring tools',
  },
  '/ignite/courses': {
    minLevel: 70,
    pattern: 'soft',
    upgradeCTA: 'Upgrade to Editor for course management',
  },
  '/ignite/analytics': {
    minLevel: 50,
    pattern: 'soft',
    upgradeCTA: 'Upgrade to Manager for analytics access',
  },
  '/ignite/learners': {
    minLevel: 50,
    pattern: 'soft',
    upgradeCTA: 'Upgrade to Manager for learner management',
  },
  '/ignite/gradebook': {
    minLevel: 50,
    pattern: 'soft',
    upgradeCTA: 'Upgrade to Manager for gradebook access',
  },
};

/**
 * Check if a user role can access a specific route
 *
 * @param userRole - The user's role name
 * @param route - The route path to check
 * @returns true if the user can access the route
 *
 * @example
 * canAccessRoute('owner', '/ignite/billing') // true
 * canAccessRoute('learner', '/ignite/billing') // false
 * canAccessRoute('editor', '/ignite/courses') // true
 */
export function canAccessRoute(userRole: RoleName, route: string): boolean {
  const config = getRouteConfig(route);

  // No config = open route
  if (!config) {
    return true;
  }

  return meetsMinimumLevel(userRole, config.minLevel);
}

/**
 * Get route configuration for a path
 * Uses longest prefix match
 */
export function getRouteConfig(pathname: string): RouteConfig | null {
  const matchingRoutes = Object.entries(PROTECTED_ROUTES)
    .filter(([path]) => pathname.startsWith(path))
    .sort((a, b) => b[0].length - a[0].length);

  return matchingRoutes.length > 0 ? matchingRoutes[0][1] : null;
}

/**
 * Route access result with full details for UI rendering
 */
export interface RouteAccessResult {
  hasAccess: boolean;
  pattern: 'hard' | 'soft' | null;
  redirectTo: string;
  upgradeCTA: string | null;
  minLevelRequired: number | null;
  currentLevel: number;
}

/**
 * Get complete route access details for UI rendering
 */
export function getRouteAccess(userRole: RoleName, pathname: string): RouteAccessResult {
  const config = getRouteConfig(pathname);
  const currentLevel = ROLES[userRole].level;

  if (!config) {
    return {
      hasAccess: true,
      pattern: null,
      redirectTo: '/ignite/dashboard',
      upgradeCTA: null,
      minLevelRequired: null,
      currentLevel,
    };
  }

  const hasAccess = currentLevel >= config.minLevel;

  return {
    hasAccess,
    pattern: config.pattern,
    redirectTo: '/ignite/dashboard',
    upgradeCTA: config.upgradeCTA ?? null,
    minLevelRequired: config.minLevel,
    currentLevel,
  };
}

// ============================================================================
// ROLE REQUIREMENT UTILITIES
// ============================================================================

/**
 * Create a role requirement checker
 * Useful for creating reusable guards
 *
 * @param minimumRole - The minimum role required
 * @returns A function that checks if a role meets the requirement
 *
 * @example
 * const requireEditor = requireRole('editor');
 * requireEditor('owner') // true
 * requireEditor('manager') // false
 */
export function requireRole(minimumRole: RoleName): (userRole: RoleName) => boolean {
  const minimumLevel = ROLES[minimumRole].level;
  return (userRole: RoleName) => ROLES[userRole].level >= minimumLevel;
}

/**
 * Pre-built role checkers for common requirements
 */
export const isOwner = requireRole('owner');
export const isEditorOrAbove = requireRole('editor');
export const isManagerOrAbove = requireRole('manager');
export const isLearnerOrAbove = requireRole('learner'); // Always true for valid roles

// ============================================================================
// PERMISSION GUARDS FOR API ROUTES
// ============================================================================

/**
 * Check if role can manage courses (create, edit, delete)
 */
export function canManageCourses(userRole: RoleName): boolean {
  return hasPermission(userRole, 'courses:create') || hasPermission(userRole, 'courses:*');
}

/**
 * Check if role can view courses (admin view, not learner consumption)
 */
export function canViewCourses(userRole: RoleName): boolean {
  return hasPermission(userRole, 'courses:read') || hasPermission(userRole, 'courses:*');
}

/**
 * Check if role can manage users
 */
export function canManageUsers(userRole: RoleName): boolean {
  return hasPermission(userRole, 'users:write') || hasPermission(userRole, '*');
}

/**
 * Check if role can view reports
 */
export function canViewReports(userRole: RoleName): boolean {
  return hasPermission(userRole, 'reports:read') || hasPermission(userRole, 'reports:*');
}

/**
 * Check if role can manage enrollments
 */
export function canManageEnrollments(userRole: RoleName): boolean {
  return hasPermission(userRole, 'enrollments:write') || hasPermission(userRole, 'enrollments:*');
}

/**
 * Check if role can manage billing
 */
export function canManageBilling(userRole: RoleName): boolean {
  return hasPermission(userRole, 'billing:*') || hasPermission(userRole, '*');
}

/**
 * Check if role can manage settings
 */
export function canManageSettings(userRole: RoleName): boolean {
  return hasPermission(userRole, 'settings:*') || hasPermission(userRole, '*');
}

// ============================================================================
// CLAIMS-BASED PERMISSION CHECKING
// ============================================================================

/**
 * Check permission from Firebase claims object
 * Safe for use with potentially unvalidated claims
 */
export function hasPermissionFromClaims(
  claims: Record<string, unknown>,
  requiredPermission: string,
): boolean {
  const role = claims?.role;
  if (typeof role !== 'string' || !isValidRoleName(role)) {
    return false;
  }
  return hasPermission(role, requiredPermission);
}

/**
 * Check route access from Firebase claims object
 */
export function canAccessRouteFromClaims(claims: Record<string, unknown>, route: string): boolean {
  const role = claims?.role;
  if (typeof role !== 'string' || !isValidRoleName(role)) {
    return false;
  }
  return canAccessRoute(role, route);
}
