/**
 * LXD360 RBAC Role Definitions
 *
 * This module defines the 4-persona RBAC system as specified in CLAUDE.md v16.
 * The 4 personas (Owner, Editor, Manager, Learner) replace the previous 11-role
 * over-engineering with a simpler, more maintainable system.
 *
 * @see CLAUDE.md Section 9: RBAC System (4 Personas)
 */

// ============================================================================
// ROLE DEFINITIONS
// ============================================================================

/**
 * Role configuration with level and permissions
 *
 * Levels: Higher = more access
 * - owner: 100 (full access)
 * - editor: 70 (content creation)
 * - manager: 50 (user/report management)
 * - learner: 20 (content consumption only)
 */
export const ROLES = {
  owner: {
    level: 100,
    permissions: ['*'],
    label: 'Owner',
    description: 'Full access to all features including billing and user management',
    color: 'var(--color-lxd-primary)',
  },
  editor: {
    level: 70,
    permissions: ['content:*', 'courses:*'],
    label: 'Editor',
    description: 'Can create and edit courses, no access to learner management',
    color: 'var(--color-neural-purple)',
  },
  manager: {
    level: 50,
    permissions: ['users:read', 'reports:*', 'enrollments:*'],
    label: 'Manager',
    description: 'Manages learners and views analytics, no course authoring',
    color: 'var(--color-neural-cyan)',
  },
  learner: {
    level: 20,
    permissions: ['courses:read', 'progress:write'],
    label: 'Learner',
    description: 'Access to learning content only',
    color: 'var(--color-lxd-success)',
  },
} as const;

/**
 * Role name type derived from ROLES keys
 */
export type RoleName = keyof typeof ROLES;

/**
 * Array of all role names for iteration
 */
export const ROLE_NAMES: RoleName[] = ['owner', 'editor', 'manager', 'learner'];

/**
 * Role configuration type
 */
export interface RoleConfig {
  level: number;
  permissions: readonly string[];
  label: string;
  description: string;
  color: string;
}

// ============================================================================
// ROUTE ACCESS BY ROLE
// ============================================================================

/**
 * Routes accessible by each role
 * Used for sidebar filtering and route protection
 */
export const ROLE_ROUTES: Record<RoleName, readonly string[]> = {
  owner: [
    'dashboard',
    'courses',
    'learners',
    'analytics',
    'gradebook',
    'authoring',
    'lrs',
    'settings',
    'billing',
    'learn',
  ],
  editor: ['dashboard', 'courses', 'authoring', 'learn'],
  manager: ['dashboard', 'learners', 'analytics', 'gradebook', 'lrs', 'learn'],
  learner: ['learn'],
} as const;

// ============================================================================
// ROLE UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a string is a valid role name
 */
export function isValidRoleName(role: string): role is RoleName {
  return ROLE_NAMES.includes(role as RoleName);
}

/**
 * Get role configuration by name
 * @throws Error if role name is invalid
 */
export function getRole(roleName: RoleName): RoleConfig {
  return ROLES[roleName];
}

/**
 * Get role configuration by name (safe version)
 * Returns undefined if role is invalid
 */
export function getRoleSafe(roleName: string): RoleConfig | undefined {
  if (isValidRoleName(roleName)) {
    return ROLES[roleName];
  }
  return undefined;
}

/**
 * Get role level by name
 */
export function getRoleLevel(roleName: RoleName): number {
  return ROLES[roleName].level;
}

/**
 * Get role permissions by name
 */
export function getRolePermissions(roleName: RoleName): readonly string[] {
  return ROLES[roleName].permissions;
}

/**
 * Get role label (display name)
 */
export function getRoleLabel(roleName: RoleName): string {
  return ROLES[roleName].label;
}

/**
 * Get routes accessible by a role
 */
export function getRoleRoutes(roleName: RoleName): readonly string[] {
  return ROLE_ROUTES[roleName];
}

/**
 * Check if a role can access a specific route
 */
export function roleCanAccessRoute(roleName: RoleName, route: string): boolean {
  return ROLE_ROUTES[roleName].includes(route);
}

/**
 * Get all roles that can access a specific route
 */
export function getRolesForRoute(route: string): RoleName[] {
  return ROLE_NAMES.filter((role) => ROLE_ROUTES[role].includes(route));
}

// ============================================================================
// ROLE COMPARISON FUNCTIONS
// ============================================================================

/**
 * Check if roleA has higher or equal level than roleB
 */
export function hasHigherOrEqualLevel(roleA: RoleName, roleB: RoleName): boolean {
  return ROLES[roleA].level >= ROLES[roleB].level;
}

/**
 * Check if a role meets minimum level requirement
 */
export function meetsMinimumLevel(roleName: RoleName, minimumLevel: number): boolean {
  return ROLES[roleName].level >= minimumLevel;
}

/**
 * Get the highest role from an array of role names
 */
export function getHighestRole(roles: RoleName[]): RoleName | null {
  if (roles.length === 0) return null;

  return roles.reduce((highest, current) => {
    return ROLES[current].level > ROLES[highest].level ? current : highest;
  });
}

/**
 * Check if a user can assign a role to another user
 * Users can only assign roles at or below their own level
 */
export function canAssignRole(assignerRole: RoleName, targetRole: RoleName): boolean {
  // Owner can assign any role
  if (assignerRole === 'owner') return true;

  // Others can only assign roles below their level
  return ROLES[assignerRole].level > ROLES[targetRole].level;
}

// ============================================================================
// FIREBASE CLAIMS HELPERS
// ============================================================================

/**
 * Custom claims structure for Firebase Auth
 */
export interface RoleClaims {
  role: RoleName;
  level: number;
  tenantId: string | null;
  permissions: string[];
  updatedAt: number;
}

/**
 * Build Firebase custom claims for a role
 */
export function buildRoleClaims(roleName: RoleName, tenantId: string | null = null): RoleClaims {
  const role = ROLES[roleName];
  return {
    role: roleName,
    level: role.level,
    tenantId,
    permissions: [...role.permissions],
    updatedAt: Date.now(),
  };
}

/**
 * Extract role from Firebase claims
 * Falls back to 'learner' for safety (least privilege)
 */
export function getRoleFromClaims(claims: Record<string, unknown>): RoleName {
  const role = claims?.role;
  if (typeof role === 'string' && isValidRoleName(role)) {
    return role;
  }
  return 'learner';
}
