import type { Permission, Role, RoleLevel, RoleName, UserClaims } from './types';
import { ROLE_LEVELS, ROLE_NAME_TO_LEVEL } from './types';

// ============================================================================
// ROLE DEFINITIONS
// ============================================================================

/**
 * Complete role definitions with permissions
 * Organized from highest privilege to lowest
 */
export const ROLES: Record<RoleName, Role> = {
  super_admin: {
    name: 'super_admin',
    level: ROLE_LEVELS.SUPER_ADMIN,
    displayName: 'Super Administrator',
    description: 'Full platform access. LXD360 employees only.',
    permissions: [
      'read:own_profile',
      'write:own_profile',
      'read:courses',
      'write:courses',
      'publish:courses',
      'delete:courses',
      'read:learners',
      'write:learners',
      'enroll:learners',
      'read:analytics',
      'read:analytics:personal',
      'read:analytics:team',
      'read:analytics:org',
      'read:analytics:platform',
      'export:analytics',
      'manage:users',
      'manage:roles',
      'invite:users',
      'manage:org',
      'manage:org:settings',
      'manage:org:billing',
      'manage:org:branding',
      'manage:platform',
      'manage:tenants',
      'create:content',
      'review:content',
      'approve:content',
      'mentor:assign',
      'mentor:sessions',
      'take:assessments',
      'grade:assessments',
      'create:assessments',
    ],
  },

  org_admin: {
    name: 'org_admin',
    level: ROLE_LEVELS.ORG_ADMIN,
    displayName: 'Organization Administrator',
    description: 'Full organization control, billing management.',
    permissions: [
      'read:own_profile',
      'write:own_profile',
      'read:courses',
      'write:courses',
      'publish:courses',
      'delete:courses',
      'read:learners',
      'write:learners',
      'enroll:learners',
      'read:analytics',
      'read:analytics:personal',
      'read:analytics:team',
      'read:analytics:org',
      'export:analytics',
      'manage:users',
      'manage:roles',
      'invite:users',
      'manage:org',
      'manage:org:settings',
      'manage:org:billing',
      'manage:org:branding',
      'create:content',
      'review:content',
      'approve:content',
      'mentor:assign',
      'mentor:sessions',
      'take:assessments',
      'grade:assessments',
      'create:assessments',
    ],
  },

  admin: {
    name: 'admin',
    level: ROLE_LEVELS.ADMIN,
    displayName: 'Administrator',
    description: 'Department/product management, user administration.',
    permissions: [
      'read:own_profile',
      'write:own_profile',
      'read:courses',
      'write:courses',
      'publish:courses',
      'read:learners',
      'write:learners',
      'enroll:learners',
      'read:analytics',
      'read:analytics:personal',
      'read:analytics:team',
      'read:analytics:org',
      'export:analytics',
      'manage:users',
      'invite:users',
      'manage:org:settings',
      'create:content',
      'review:content',
      'approve:content',
      'mentor:assign',
      'take:assessments',
      'grade:assessments',
      'create:assessments',
    ],
  },

  manager: {
    name: 'manager',
    level: ROLE_LEVELS.MANAGER,
    displayName: 'Manager',
    description: 'Team leadership, reporting, instructor oversight.',
    permissions: [
      'read:own_profile',
      'write:own_profile',
      'read:courses',
      'read:learners',
      'write:learners',
      'enroll:learners',
      'read:analytics',
      'read:analytics:personal',
      'read:analytics:team',
      'export:analytics',
      'invite:users',
      'create:content',
      'review:content',
      'mentor:assign',
      'take:assessments',
      'grade:assessments',
    ],
  },

  instructor: {
    name: 'instructor',
    level: ROLE_LEVELS.INSTRUCTOR,
    displayName: 'Instructor',
    description: 'Course creation, content delivery, learner progress tracking.',
    permissions: [
      'read:own_profile',
      'write:own_profile',
      'read:courses',
      'write:courses',
      'read:learners',
      'enroll:learners',
      'read:analytics',
      'read:analytics:personal',
      'read:analytics:team',
      'create:content',
      'take:assessments',
      'grade:assessments',
      'create:assessments',
    ],
  },

  mentor: {
    name: 'mentor',
    level: ROLE_LEVELS.MENTOR,
    displayName: 'Mentor',
    description: '1:1 guidance, LXD Nexus mentorship capabilities.',
    permissions: [
      'read:own_profile',
      'write:own_profile',
      'read:courses',
      'read:learners',
      'read:analytics',
      'read:analytics:personal',
      'mentor:sessions',
      'take:assessments',
      'grade:assessments',
    ],
  },

  learner: {
    name: 'learner',
    level: ROLE_LEVELS.LEARNER,
    displayName: 'Learner',
    description: 'Course consumption, assessments, learning activities.',
    permissions: [
      'read:own_profile',
      'write:own_profile',
      'read:courses',
      'read:analytics:personal',
      'take:assessments',
    ],
  },

  mentee: {
    name: 'mentee',
    level: ROLE_LEVELS.MENTEE,
    displayName: 'Mentee',
    description: 'Receiving mentorship, guided learning.',
    permissions: [
      'read:own_profile',
      'write:own_profile',
      'read:courses',
      'read:analytics:personal',
      'take:assessments',
    ],
  },

  subscriber: {
    name: 'subscriber',
    level: ROLE_LEVELS.SUBSCRIBER,
    displayName: 'Subscriber',
    description: 'Purchased product access only.',
    permissions: ['read:own_profile', 'write:own_profile', 'read:courses', 'take:assessments'],
  },

  user: {
    name: 'user',
    level: ROLE_LEVELS.USER,
    displayName: 'User',
    description: 'Authenticated user with minimal access.',
    permissions: ['read:own_profile', 'write:own_profile'],
  },

  guest: {
    name: 'guest',
    level: ROLE_LEVELS.GUEST,
    displayName: 'Guest',
    description: 'Unauthenticated visitor. Public content only.',
    permissions: [],
  },
} as const;

// ============================================================================
// ROLE LOOKUP FUNCTIONS
// ============================================================================

/**
 * Get a role definition by its level
 * @param level - The numeric role level
 * @returns The role definition, or undefined if not found
 */
export function getRoleByLevel(level: RoleLevel): Role | undefined {
  const entry = Object.entries(ROLES).find(([, role]) => role.level === level);
  return entry ? entry[1] : undefined;
}

/**
 * Get a role definition by its name
 * @param name - The role name
 * @returns The role definition
 */
export function getRoleByName(name: RoleName): Role {
  return ROLES[name];
}

/**
 * Get the numeric level for a role name
 * @param name - The role name
 * @returns The numeric role level
 */
export function getRoleLevel(name: RoleName): RoleLevel {
  return ROLE_NAME_TO_LEVEL[name];
}

/**
 * Get all role names as an array, ordered by level (highest first)
 * @returns Array of role names
 */
export function getAllRoleNames(): RoleName[] {
  return Object.keys(ROLES) as RoleName[];
}

/**
 * Get all roles as an array, ordered by level (highest first)
 * @returns Array of role definitions
 */
export function getAllRoles(): Role[] {
  return Object.values(ROLES);
}

// ============================================================================
// PERMISSION CHECK FUNCTIONS
// ============================================================================

/**
 * Check if a user has a specific permission
 * @param userClaims - The user's custom claims
 * @param permission - The permission to check
 * @returns True if the user has the permission
 */
export function hasPermission(userClaims: UserClaims, permission: Permission): boolean {
  // Check direct permissions
  if (userClaims.permissions.includes(permission)) {
    return true;
  }

  // Get role-based permissions
  const role = ROLES[userClaims.role];
  return role.permissions.includes(permission);
}

/**
 * Check if a user's role can access a target role's resources
 * A user can access resources of roles at or below their level
 * @param userRole - The user's role name
 * @param targetRole - The target role to check access for
 * @returns True if the user can access the target role's resources
 */
export function canAccessRole(userRole: RoleName, targetRole: RoleName): boolean {
  const userLevel = ROLE_NAME_TO_LEVEL[userRole];
  const targetLevel = ROLE_NAME_TO_LEVEL[targetRole];
  return userLevel >= targetLevel;
}

/**
 * Check if a user can assign a specific role to another user
 * Users can only assign roles below their own level
 * @param assignerRole - The role of the user making the assignment
 * @param targetRole - The role being assigned
 * @returns True if the assignment is allowed
 */
export function canAssignRole(assignerRole: RoleName, targetRole: RoleName): boolean {
  const assignerLevel = ROLE_NAME_TO_LEVEL[assignerRole];
  const targetLevel = ROLE_NAME_TO_LEVEL[targetRole];
  // Can only assign roles BELOW own level (not equal)
  return assignerLevel > targetLevel;
}

/**
 * Check if a user has at least the minimum required role level
 * @param userRole - The user's role name
 * @param requiredRole - The minimum required role
 * @returns True if the user meets the minimum role requirement
 */
export function hasMinimumRole(userRole: RoleName, requiredRole: RoleName): boolean {
  return canAccessRole(userRole, requiredRole);
}

/**
 * Check if a user has at least the minimum required role level (by level number)
 * @param userLevel - The user's role level
 * @param requiredLevel - The minimum required level
 * @returns True if the user meets the minimum level requirement
 */
export function hasMinimumLevel(userLevel: RoleLevel, requiredLevel: RoleLevel): boolean {
  return userLevel >= requiredLevel;
}

// ============================================================================
// ROLE UTILITY FUNCTIONS
// ============================================================================

/**
 * Get all roles at or below a given role level
 * @param role - The reference role
 * @returns Array of role names at or below the given role
 */
export function getRolesAtOrBelow(role: RoleName): RoleName[] {
  const level = ROLE_NAME_TO_LEVEL[role];
  return getAllRoleNames().filter((name) => ROLE_NAME_TO_LEVEL[name] <= level);
}

/**
 * Get all roles above a given role level
 * @param role - The reference role
 * @returns Array of role names above the given role
 */
export function getRolesAbove(role: RoleName): RoleName[] {
  const level = ROLE_NAME_TO_LEVEL[role];
  return getAllRoleNames().filter((name) => ROLE_NAME_TO_LEVEL[name] > level);
}

/**
 * Get the display name for a role
 * @param role - The role name
 * @returns The human-readable display name
 */
export function getRoleDisplayName(role: RoleName): string {
  return ROLES[role].displayName;
}

/**
 * Get the description for a role
 * @param role - The role name
 * @returns The role description
 */
export function getRoleDescription(role: RoleName): string {
  return ROLES[role].description;
}

/**
 * Get all permissions for a role
 * @param role - The role name
 * @returns Array of permissions granted to the role
 */
export function getRolePermissions(role: RoleName): Permission[] {
  return [...ROLES[role].permissions];
}

/**
 * Check if a role is an administrative role (admin level or higher)
 * @param role - The role name
 * @returns True if the role is administrative
 */
export function isAdminRole(role: RoleName): boolean {
  return ROLE_NAME_TO_LEVEL[role] >= ROLE_LEVELS.ADMIN;
}

/**
 * Check if a role can manage users
 * @param role - The role name
 * @returns True if the role can manage users
 */
export function canManageUsers(role: RoleName): boolean {
  return ROLES[role].permissions.includes('manage:users');
}

/**
 * Check if a role can publish content
 * @param role - The role name
 * @returns True if the role can publish content
 */
export function canPublishContent(role: RoleName): boolean {
  return ROLES[role].permissions.includes('publish:courses');
}

/**
 * Type guard to check if a string is a valid role name
 * @param value - The string to check
 * @returns True if the value is a valid role name
 */
export function isValidRoleName(value: string): value is RoleName {
  return value in ROLES;
}

/**
 * Type guard to check if a number is a valid role level
 * @param value - The number to check
 * @returns True if the value is a valid role level
 */
export function isValidRoleLevel(value: number): value is RoleLevel {
  return Object.values(ROLE_LEVELS).includes(value as RoleLevel);
}

/**
 * Check if an email belongs to an LXD360 employee
 * @param email - The email address to check
 * @returns True if the email is an @lxd360.com address
 */
export function isEmployeeEmail(email: string): boolean {
  return email.toLowerCase().endsWith('@lxd360.com');
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/**
 * Default role for new authenticated users
 */
export const DEFAULT_USER_ROLE: RoleName = 'user';

/**
 * Default role for unauthenticated visitors
 */
export const DEFAULT_GUEST_ROLE: RoleName = 'guest';

/**
 * Get default claims for a new user
 * @param options - Optional configuration
 * @returns Default user claims
 */
export function getDefaultUserClaims(options?: { email?: string; tenantId?: string }): UserClaims {
  const role = DEFAULT_USER_ROLE;
  const isEmployee = options?.email ? isEmployeeEmail(options.email) : false;

  return {
    role,
    roleLevel: ROLE_NAME_TO_LEVEL[role],
    tenantId: options?.tenantId ?? null,
    permissions: getRolePermissions(role),
    isEmployee,
  };
}
