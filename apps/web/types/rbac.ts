// ============================================================================
// ROLE DEFINITIONS
// ============================================================================

/**
 * All available roles in the system
 * Ordered by permission level (highest to lowest)
 */
export type Role =
  | 'super_admin' // Level 100: Full platform access
  | 'org_admin' // Level 90: Organization-wide management
  | 'admin' // Level 80: Department/product management
  | 'manager' // Level 60: Team leadership, reporting
  | 'instructor' // Level 50: Course creation, delivery
  | 'mentor' // Level 45: 1:1 guidance, Nexus mentorship
  | 'learner' // Level 40: Course consumption, assessments
  | 'mentee' // Level 35: Receiving mentorship
  | 'subscriber' // Level 20: Purchased product access
  | 'user' // Level 10: Authenticated, minimal access
  | 'guest'; // Level 0: Unauthenticated, public only

/**
 * Role level mapping for permission comparison
 */
export const ROLE_LEVELS: Record<Role, number> = {
  super_admin: 100,
  org_admin: 90,
  admin: 80,
  manager: 60,
  instructor: 50,
  mentor: 45,
  learner: 40,
  mentee: 35,
  subscriber: 20,
  user: 10,
  guest: 0,
} as const;

/**
 * Role scope definitions
 */
export type RoleScope =
  | 'platform' // Platform-wide (super_admin)
  | 'organization' // Organization-wide (org_admin)
  | 'department' // Department-level (admin)
  | 'team' // Team-level (manager)
  | 'content' // Content scope (instructor)
  | 'nexus' // Mentorship scope (mentor, mentee)
  | 'learning' // Learning scope (learner)
  | 'products' // Product access (subscriber)
  | 'basic' // Basic access (user)
  | 'public'; // Public only (guest)

// ============================================================================
// PERMISSION DEFINITIONS
// ============================================================================

/**
 * Resource types that can have permissions
 */
export type Resource =
  | 'courses'
  | 'content'
  | 'users'
  | 'roles'
  | 'analytics'
  | 'reports'
  | 'xapi'
  | 'billing'
  | 'subscription'
  | 'invoices'
  | 'assessments'
  | 'org';

/**
 * Actions that can be performed on resources
 */
export type Action =
  // CRUD operations
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  // Course-specific
  | 'publish'
  | 'enroll'
  | 'upload'
  | 'review'
  // User-specific
  | 'invite'
  | 'impersonate'
  | 'assign'
  // Analytics-specific
  | 'platform'
  | 'organization'
  | 'team'
  | 'course'
  | 'personal'
  | 'generate'
  | 'export'
  | 'query'
  // Billing-specific
  | 'view'
  | 'manage'
  | 'upgrade'
  | 'cancel'
  // Assessment-specific
  | 'take'
  | 'grade'
  | 'view_all'
  // Org-specific
  | 'settings'
  | 'branding'
  | 'integrations'
  | 'sso';

/**
 * Permission string format: "resource:action"
 */
export type Permission = `${Resource}:${Action}`;

/**
 * Permission with optional conditions
 */
export interface PermissionRule {
  /** Permission string */
  permission: Permission;
  /** Condition type */
  condition?: PermissionCondition;
  /** Description for documentation */
  description?: string;
}

/**
 * Conditions that modify permission scope
 */
export type PermissionCondition =
  | 'own_only' // Only resources owned by the user
  | 'enrolled_only' // Only enrolled courses
  | 'organization_only' // Only within user's organization
  | 'team_only' // Only within user's team
  | 'mentee_only' // Only for assigned mentees
  | 'below_own_level'; // Only for roles below user's level

// ============================================================================
// CONTEXT & CHECKING
// ============================================================================

/**
 * Context for permission checks
 */
export interface PermissionContext {
  /** ID of the resource owner (for own_only checks) */
  resourceOwnerId?: string;
  /** Organization ID (for organization_only checks) */
  organizationId?: string;
  /** Team ID (for team_only checks) */
  teamId?: string;
  /** Course ID (for enrollment checks) */
  courseId?: string;
  /** Mentee ID (for mentor checks) */
  menteeId?: string;
  /** Target role (for role assignment checks) */
  targetRole?: Role;
}

/**
 * Result of a permission check
 */
export interface PermissionCheckResult {
  /** Whether the action is allowed */
  allowed: boolean;
  /** Reason for denial (if not allowed) */
  reason?: string;
  /** Any conditions that were applied */
  appliedConditions?: PermissionCondition[];
}

// ============================================================================
// USER ROLE ASSIGNMENT
// ============================================================================

/**
 * User role assignment record
 */
export interface UserRole {
  /** Assignment ID */
  id: string;
  /** User ID */
  userId: string;
  /** Assigned role */
  role: Role;
  /** Organization context (null for platform roles) */
  organizationId: string | null;
  /** Product access array */
  productAccess: string[];
  /** When the role was assigned */
  assignedAt: Date;
  /** Who assigned the role */
  assignedBy: string;
  /** When the role expires (null for permanent) */
  expiresAt: Date | null;
}

/**
 * Temporary role elevation
 */
export interface TemporaryElevation {
  /** User ID */
  userId: string;
  /** Elevated role */
  elevatedRole: Role;
  /** Original role */
  originalRole: Role;
  /** Reason for elevation */
  reason: string;
  /** Who granted the elevation */
  grantedBy: string;
  /** When elevation was granted */
  grantedAt: Date;
  /** When elevation expires */
  expiresAt: Date;
}

// ============================================================================
// ROUTE PROTECTION
// ============================================================================

/**
 * Route protection configuration
 */
export interface RouteProtection {
  /** Minimum required role */
  role: Role;
  /** Require @lxd360.com email */
  requireEmployeeEmail?: boolean;
  /** Require specific permission */
  requirePermission?: Permission;
  /** Check enrollment status */
  checkEnrollment?: boolean;
  /** Custom condition function name */
  customCondition?: string;
}

/**
 * Route protection map
 */
export type RouteProtectionMap = Record<string, RouteProtection>;

/**
 * Default route protections for the platform
 */
export const DEFAULT_ROUTE_PROTECTIONS: RouteProtectionMap = {
  // Command Center
  '/dashboard/monitoring': {
    role: 'super_admin',
    requireEmployeeEmail: true,
  },
  '/dashboard/admin/*': { role: 'org_admin' },
  '/dashboard/engineering/*': {
    role: 'super_admin',
    requireEmployeeEmail: true,
  },
  '/dashboard/finance/*': {
    role: 'org_admin',
    requirePermission: 'billing:view',
  },
  '/dashboard/tenants/*': { role: 'super_admin' },
  '/dashboard/users/*': { role: 'admin' },
  '/dashboard/branding/*': { role: 'org_admin' },

  // Products
  '/inspire-studio/*': { role: 'instructor' },
  '/inspire-studio/publish': {
    role: 'admin',
    requirePermission: 'courses:publish',
  },
  '/lxp360/learn/*': {
    role: 'learner',
    checkEnrollment: true,
  },
  '/lxp360/admin/*': { role: 'admin' },
  '/nexus/mentor/*': { role: 'mentor' },
  '/nexus/mentee/*': { role: 'mentee' },
  '/analytics/*': { role: 'manager' },

  // Internal
  '/consultation/*': {
    role: 'super_admin',
    requireEmployeeEmail: true,
  },
  '/internal/*': {
    role: 'super_admin',
    requireEmployeeEmail: true,
  },
  '/api/admin/*': { role: 'super_admin' },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a role meets the minimum required role level
 */
export function hasMinimumRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[requiredRole];
}

/**
 * Check if a user can assign a specific role
 * Users can only assign roles below their own level
 */
export function canAssignRole(assignerRole: Role, targetRole: Role): boolean {
  return ROLE_LEVELS[assignerRole] > ROLE_LEVELS[targetRole];
}

/**
 * Check if an email is an LXD360 employee email
 */
export function isEmployeeEmail(email: string): boolean {
  return email.toLowerCase().endsWith('@lxd360.com');
}

/**
 * Get all roles at or below a given level
 */
export function getRolesAtOrBelow(role: Role): Role[] {
  const level = ROLE_LEVELS[role];
  return (Object.entries(ROLE_LEVELS) as [Role, number][])
    .filter((entry) => entry[1] <= level)
    .map((entry) => entry[0]);
}

/**
 * Get the display name for a role
 */
export function getRoleDisplayName(role: Role): string {
  const displayNames: Record<Role, string> = {
    super_admin: 'Super Administrator',
    org_admin: 'Organization Administrator',
    admin: 'Administrator',
    manager: 'Manager',
    instructor: 'Instructor',
    mentor: 'Mentor',
    learner: 'Learner',
    mentee: 'Mentee',
    subscriber: 'Subscriber',
    user: 'User',
    guest: 'Guest',
  };
  return displayNames[role];
}

/**
 * Type guard to check if a string is a valid role
 */
export function isValidRole(value: string): value is Role {
  return Object.keys(ROLE_LEVELS).includes(value);
}

// ============================================================================
// PERMISSION MATRICES (for reference)
// ============================================================================

/**
 * Roles that can create courses
 */
export const COURSE_CREATE_ROLES: Role[] = ['super_admin', 'org_admin', 'admin', 'instructor'];

/**
 * Roles that can manage users
 */
export const USER_MANAGEMENT_ROLES: Role[] = ['super_admin', 'org_admin', 'admin'];

/**
 * Roles that can access billing
 */
export const BILLING_ROLES: Role[] = ['super_admin', 'org_admin'];

/**
 * Roles that can publish content
 */
export const PUBLISH_ROLES: Role[] = ['super_admin', 'org_admin', 'admin'];

/**
 * Roles that can take assessments
 */
export const ASSESSMENT_TAKER_ROLES: Role[] = [
  'super_admin',
  'org_admin',
  'admin',
  'manager',
  'instructor',
  'mentor',
  'learner',
  'mentee',
  'subscriber',
];
