import {
  INTERNAL_ROLES,
  type InternalRole,
  isValidRole,
  ROLE_CATEGORY_MAP,
  type Role,
  type RoleCategory,
} from './types';

// ============================================================================
// ROLE HIERARCHY
// ============================================================================

/**
 * Numeric hierarchy levels for each role (lower = more access)
 * Range: 1 (super_admin_lxd360) to 100 (learner roles)
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  // Internal roles (1-20)
  super_admin_lxd360: 1,
  admin_lxd360: 5,
  sales_lxd360: 10,
  legal_federal_lxd360: 10,
  legal_private_lxd360: 10,
  it_compliance_lxd360: 10,
  saas_engineer_lxd360: 10,
  finance_lxd360: 10,
  smart_app_lxd360: 15,
  moderator_lxd360: 20,

  // Ecosystem roles (30-100)
  program_admin_ecosystem: 30,
  admin_ecosystem: 35,
  sales_ecosystem: 40,
  manager_ecosystem: 45,
  lms_admin_ecosystem: 50,
  designer_ecosystem: 55,
  instructor_ecosystem: 60,
  reviewer_ecosystem: 65,
  learner_ecosystem: 100,

  // LXP360 roles (35-100)
  admin_lxp360: 35,
  manager_lxp360: 45,
  lms_admin_lxp360: 50,
  reviewer_lxp360: 65,
  learner_lxp360: 100,

  // INSPIRE roles (35-65)
  admin_inspire: 35,
  sales_inspire: 40,
  manager_inspire: 45,
  designer_inspire: 55,
  reviewer_inspire: 65,

  // Nexus roles (25-90)
  moderator_nexus: 25,
  mentor_nexus: 70,
  mentee_nexus: 80,
  member_nexus: 90,

  // VIP roles (85-95)
  vip_converted: 85,
  vip_prospect: 95,
};

// ============================================================================
// PRIVILEGE LEVELS (for database compatibility)
// ============================================================================

/**
 * Privilege levels for database operations (higher = more access)
 * Range: 100 (learner roles) to 1000 (super_admin_lxd360)
 */
export const PRIVILEGE_LEVELS: Record<Role, number> = {
  // Internal roles
  super_admin_lxd360: 1000,
  admin_lxd360: 950,
  sales_lxd360: 900,
  legal_federal_lxd360: 900,
  legal_private_lxd360: 900,
  it_compliance_lxd360: 900,
  saas_engineer_lxd360: 900,
  finance_lxd360: 900,
  smart_app_lxd360: 850,
  moderator_lxd360: 800,

  // Ecosystem roles
  program_admin_ecosystem: 750,
  admin_ecosystem: 700,
  sales_ecosystem: 650,
  manager_ecosystem: 600,
  lms_admin_ecosystem: 550,
  designer_ecosystem: 500,
  instructor_ecosystem: 450,
  reviewer_ecosystem: 400,
  learner_ecosystem: 100,

  // LXP360 roles
  admin_lxp360: 700,
  manager_lxp360: 600,
  lms_admin_lxp360: 550,
  reviewer_lxp360: 400,
  learner_lxp360: 100,

  // INSPIRE roles
  admin_inspire: 700,
  sales_inspire: 650,
  manager_inspire: 600,
  designer_inspire: 500,
  reviewer_inspire: 400,

  // Nexus roles
  moderator_nexus: 800,
  mentor_nexus: 350,
  mentee_nexus: 250,
  member_nexus: 150,

  // VIP roles
  vip_converted: 200,
  vip_prospect: 120,
};

// ============================================================================
// ROLE CHECKING FUNCTIONS
// ============================================================================

/**
 * Check if user has the required role or higher in hierarchy
 * @param userRoles - Array of roles the user has
 * @param requiredRole - The minimum role required
 * @returns true if user has sufficient access
 */
export function hasRequiredRole(userRoles: Role[], requiredRole: Role): boolean {
  const requiredLevel = ROLE_HIERARCHY[requiredRole];
  return userRoles.some((role) => ROLE_HIERARCHY[role] <= requiredLevel);
}

/**
 * Check if user has the exact role
 * @param userRoles - Array of roles the user has
 * @param role - The role to check for
 * @returns true if user has the exact role
 */
export function hasRole(userRoles: Role[], role: Role): boolean {
  return userRoles.includes(role);
}

/**
 * Check if user has unknown of the specified roles
 * @param userRoles - Array of roles the user has
 * @param allowedRoles - Array of allowed roles
 * @returns true if user has unknown of the allowed roles
 */
export function hasAnyRole(userRoles: Role[], allowedRoles: Role[]): boolean {
  return userRoles.some((role) => allowedRoles.includes(role));
}

/**
 * Check if user has all of the specified roles
 * @param userRoles - Array of roles the user has
 * @param requiredRoles - Array of required roles
 * @returns true if user has all required roles
 */
export function hasAllRoles(userRoles: Role[], requiredRoles: Role[]): boolean {
  return requiredRoles.every((role) => userRoles.includes(role));
}

// ============================================================================
// SUPER ADMIN FUNCTIONS
// ============================================================================

/**
 * Check if user is the super admin (super_admin_lxd360)
 * @param userRoles - Array of roles the user has
 * @returns true if user is super admin
 */
export function isSuperAdmin(userRoles: Role[]): boolean {
  return userRoles.includes('super_admin_lxd360');
}

/**
 * Check if user is unknown LXD360 admin (super_admin or admin_lxd360)
 * @param userRoles - Array of roles the user has
 * @returns true if user is an LXD360 admin
 */
export function isLxd360Admin(userRoles: Role[]): boolean {
  return userRoles.includes('super_admin_lxd360') || userRoles.includes('admin_lxd360');
}

// ============================================================================
// INTERNAL USER FUNCTIONS
// ============================================================================

/**
 * Check if user is an internal LXD360 employee
 * @param userRoles - Array of roles the user has
 * @returns true if user has unknown internal role
 */
export function isInternalUser(userRoles: Role[]): boolean {
  return userRoles.some((role) => INTERNAL_ROLES.includes(role as InternalRole));
}

/**
 * Check if user is an internal user by checking role category
 * @param userRoles - Array of roles the user has
 * @returns true if unknown role is in the 'internal' category
 */
export function isInternalByCategory(userRoles: Role[]): boolean {
  return userRoles.some((role) => ROLE_CATEGORY_MAP[role] === 'internal');
}

// ============================================================================
// PRODUCT CATEGORY FUNCTIONS
// ============================================================================

/**
 * Get all product categories the user has access to
 * @param userRoles - Array of roles the user has
 * @returns Array of unique product categories
 */
export function getUserProductCategories(userRoles: Role[]): RoleCategory[] {
  const categories = new Set<RoleCategory>();
  for (const role of userRoles) {
    categories.add(ROLE_CATEGORY_MAP[role]);
  }
  return Array.from(categories);
}

/**
 * Check if user has access to a specific product category
 * @param userRoles - Array of roles the user has
 * @param category - The product category to check
 * @returns true if user has access to the category
 */
export function hasProductCategoryAccess(userRoles: Role[], category: RoleCategory): boolean {
  // Internal users have access to all categories
  if (isInternalUser(userRoles)) {
    return true;
  }
  return userRoles.some((role) => ROLE_CATEGORY_MAP[role] === category);
}

/**
 * Check if user can access ecosystem product
 */
export function canAccessEcosystem(userRoles: Role[]): boolean {
  return hasProductCategoryAccess(userRoles, 'ecosystem');
}

/**
 * Check if user can access LXP360 product
 */
export function canAccessLxp360(userRoles: Role[]): boolean {
  return hasProductCategoryAccess(userRoles, 'lxp360');
}

/**
 * Check if user can access INSPIRE Studio product
 */
export function canAccessInspire(userRoles: Role[]): boolean {
  return hasProductCategoryAccess(userRoles, 'inspire');
}

/**
 * Check if user can access LXD Nexus
 */
export function canAccessNexus(userRoles: Role[]): boolean {
  return hasProductCategoryAccess(userRoles, 'nexus');
}

/**
 * Check if user is in VIP program
 */
export function isVipUser(userRoles: Role[]): boolean {
  return hasProductCategoryAccess(userRoles, 'vip');
}

// ============================================================================
// HIERARCHY COMPARISON FUNCTIONS
// ============================================================================

/**
 * Get the hierarchy level for a role
 * @param role - The role to get the level for
 * @returns The hierarchy level (lower = more access)
 */
export function getRoleHierarchyLevel(role: Role): number {
  return ROLE_HIERARCHY[role];
}

/**
 * Get the privilege level for a role
 * @param role - The role to get the level for
 * @returns The privilege level (higher = more access)
 */
export function getRolePrivilegeLevel(role: Role): number {
  return PRIVILEGE_LEVELS[role];
}

/**
 * Get the highest privilege role from an array of roles
 * @param userRoles - Array of roles
 * @returns The role with the highest privilege (lowest hierarchy level)
 */
export function getHighestRole(userRoles: Role[]): Role | null {
  if (userRoles.length === 0) return null;

  return userRoles.reduce((highest, current) => {
    return ROLE_HIERARCHY[current] < ROLE_HIERARCHY[highest] ? current : highest;
  });
}

/**
 * Compare two roles
 * @param role1 - First role
 * @param role2 - Second role
 * @returns negative if role1 > role2, positive if role1 < role2, 0 if equal
 */
export function compareRoles(role1: Role, role2: Role): number {
  return ROLE_HIERARCHY[role1] - ROLE_HIERARCHY[role2];
}

/**
 * Check if role1 has higher or equal privilege than role2
 * @param role1 - Role to check
 * @param role2 - Role to compare against
 * @returns true if role1 has higher or equal privilege
 */
export function hasHigherOrEqualPrivilege(role1: Role, role2: Role): boolean {
  return ROLE_HIERARCHY[role1] <= ROLE_HIERARCHY[role2];
}

// ============================================================================
// ROLE FILTERING FUNCTIONS
// ============================================================================

/**
 * Filter roles by category
 * @param userRoles - Array of roles
 * @param category - Category to filter by
 * @returns Array of roles in the specified category
 */
export function filterRolesByCategory(userRoles: Role[], category: RoleCategory): Role[] {
  return userRoles.filter((role) => ROLE_CATEGORY_MAP[role] === category);
}

/**
 * Get roles that are at or above a certain hierarchy level
 * @param userRoles - Array of roles
 * @param maxLevel - Maximum hierarchy level (inclusive)
 * @returns Array of roles at or above the level
 */
export function getRolesAtOrAboveLevel(userRoles: Role[], maxLevel: number): Role[] {
  return userRoles.filter((role) => ROLE_HIERARCHY[role] <= maxLevel);
}

/**
 * Get admin-level roles from user roles
 * @param userRoles - Array of roles
 * @returns Array of admin-level roles (hierarchy level <= 35)
 */
export function getAdminRoles(userRoles: Role[]): Role[] {
  return getRolesAtOrAboveLevel(userRoles, 35);
}

/**
 * Get manager-level roles from user roles
 * @param userRoles - Array of roles
 * @returns Array of manager-level roles (hierarchy level <= 50)
 */
export function getManagerRoles(userRoles: Role[]): Role[] {
  return getRolesAtOrAboveLevel(userRoles, 50);
}

// ============================================================================
// ROLE VALIDATION
// ============================================================================

/**
 * Validate and filter an array of role strings
 * @param roles - Array of strings to validate
 * @returns Array of valid Role types
 */
export function validateRoles(roles: string[]): Role[] {
  return roles.filter(isValidRole) as Role[];
}

/**
 * Safely get role hierarchy level (returns Infinity for invalid roles)
 * @param role - Role string to check
 * @returns Hierarchy level or Infinity if invalid
 */
export function safeGetHierarchyLevel(role: string): number {
  if (isValidRole(role)) {
    return ROLE_HIERARCHY[role as Role];
  }
  return Infinity;
}

// ============================================================================
// ROLE CAPABILITY CHECKS
// ============================================================================

/**
 * Check if user can manage other users
 * @param userRoles - Array of roles the user has
 * @returns true if user can manage users
 */
export function canManageUsers(userRoles: Role[]): boolean {
  // Roles that can manage users (hierarchy level <= 35)
  return userRoles.some((role) => ROLE_HIERARCHY[role] <= 35);
}

/**
 * Check if user can manage content
 * @param userRoles - Array of roles the user has
 * @returns true if user can manage content
 */
export function canManageContent(userRoles: Role[]): boolean {
  // Designers, instructors, and above can manage content
  const contentRoles: Role[] = [
    'super_admin_lxd360',
    'admin_lxd360',
    'designer_ecosystem',
    'designer_inspire',
    'instructor_ecosystem',
    'lms_admin_ecosystem',
    'lms_admin_lxp360',
  ];
  return hasAnyRole(userRoles, contentRoles) || isInternalUser(userRoles);
}

/**
 * Check if user can view analytics
 * @param userRoles - Array of roles the user has
 * @returns true if user can view analytics
 */
export function canViewAnalytics(userRoles: Role[]): boolean {
  // Managers and above can view analytics
  return userRoles.some((role) => ROLE_HIERARCHY[role] <= 50);
}

/**
 * Check if user can moderate community content
 * @param userRoles - Array of roles the user has
 * @returns true if user can moderate
 */
export function canModerate(userRoles: Role[]): boolean {
  const moderatorRoles: Role[] = [
    'super_admin_lxd360',
    'admin_lxd360',
    'moderator_lxd360',
    'moderator_nexus',
  ];
  return hasAnyRole(userRoles, moderatorRoles);
}

// ============================================================================
// DASHBOARD ROUTING
// ============================================================================

/**
 * Dashboard routes for each role
 */
export const ROLE_DASHBOARD_ROUTES: Record<Role, string> = {
  // Internal roles
  super_admin_lxd360: '/dashboard/super-admin',
  admin_lxd360: '/dashboard/admin',
  sales_lxd360: '/dashboard/sales',
  legal_federal_lxd360: '/dashboard/legal/federal',
  legal_private_lxd360: '/dashboard/legal/private',
  it_compliance_lxd360: '/dashboard/it-compliance',
  saas_engineer_lxd360: '/dashboard/engineering',
  finance_lxd360: '/dashboard/finance',
  smart_app_lxd360: '/dashboard/smart-app',
  moderator_lxd360: '/dashboard/moderator',

  // Ecosystem roles
  program_admin_ecosystem: '/dashboard/program-admin',
  admin_ecosystem: '/dashboard/ecosystem-admin',
  sales_ecosystem: '/dashboard/ecosystem-sales',
  manager_ecosystem: '/dashboard/ecosystem-manager',
  lms_admin_ecosystem: '/dashboard/ecosystem-lms-admin',
  designer_ecosystem: '/dashboard/ecosystem-designer',
  instructor_ecosystem: '/dashboard/ecosystem-instructor',
  reviewer_ecosystem: '/dashboard/ecosystem-reviewer',
  learner_ecosystem: '/dashboard/ecosystem-learner',

  // LXP360 roles
  admin_lxp360: '/dashboard/lxp360-admin',
  manager_lxp360: '/dashboard/lxp360-manager',
  lms_admin_lxp360: '/dashboard/lxp360-lms-admin',
  reviewer_lxp360: '/dashboard/lxp360-reviewer',
  learner_lxp360: '/dashboard/lxp360-learner',

  // INSPIRE roles
  admin_inspire: '/dashboard/inspire-admin',
  sales_inspire: '/dashboard/inspire-sales',
  manager_inspire: '/dashboard/inspire-manager',
  designer_inspire: '/dashboard/inspire-designer',
  reviewer_inspire: '/dashboard/inspire-reviewer',

  // Nexus roles
  mentor_nexus: '/dashboard/nexus-mentor',
  mentee_nexus: '/dashboard/nexus-mentee',
  member_nexus: '/dashboard/nexus-member',
  moderator_nexus: '/dashboard/nexus-moderator',

  // VIP roles
  vip_prospect: '/dashboard/vip',
  vip_converted: '/dashboard/vip-customer',
};

/**
 * Get the appropriate dashboard route for a user
 * @param userRoles - Array of roles the user has
 * @returns The dashboard route for the highest privilege role
 */
export function getDashboardRoute(userRoles: Role[]): string {
  const highestRole = getHighestRole(userRoles);
  if (highestRole) {
    return ROLE_DASHBOARD_ROUTES[highestRole];
  }
  return '/dashboard'; // Default fallback
}
