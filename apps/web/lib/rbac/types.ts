/**
 * RBAC Types for Firebase Custom Claims
 *
 * Defines the complete type system for Role-Based Access Control using
 * Firebase Custom Claims. This module provides:
 * - Role level constants (0-100)
 * - Role name type definitions
 * - Permission types
 * - Custom claims interface for Firebase Auth
 */

// ============================================================================
// ROLE LEVEL CONSTANTS
// ============================================================================

/**
 * Numeric role levels for permission comparison
 * Higher levels have more privileges
 */
export const ROLE_LEVELS = {
  SUPER_ADMIN: 100,
  ORG_ADMIN: 90,
  ADMIN: 80,
  MANAGER: 60,
  INSTRUCTOR: 50,
  MENTOR: 45,
  LEARNER: 40,
  MENTEE: 35,
  SUBSCRIBER: 20,
  USER: 10,
  GUEST: 0,
} as const;

/**
 * Valid role level values
 */
export type RoleLevel = (typeof ROLE_LEVELS)[keyof typeof ROLE_LEVELS];

// ============================================================================
// ROLE NAME DEFINITIONS
// ============================================================================

/**
 * All available role names in the system
 * Ordered from highest to lowest privilege
 */
export type RoleName =
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
 * Mapping from role name to role level
 */
export const ROLE_NAME_TO_LEVEL: Record<RoleName, RoleLevel> = {
  super_admin: ROLE_LEVELS.SUPER_ADMIN,
  org_admin: ROLE_LEVELS.ORG_ADMIN,
  admin: ROLE_LEVELS.ADMIN,
  manager: ROLE_LEVELS.MANAGER,
  instructor: ROLE_LEVELS.INSTRUCTOR,
  mentor: ROLE_LEVELS.MENTOR,
  learner: ROLE_LEVELS.LEARNER,
  mentee: ROLE_LEVELS.MENTEE,
  subscriber: ROLE_LEVELS.SUBSCRIBER,
  user: ROLE_LEVELS.USER,
  guest: ROLE_LEVELS.GUEST,
} as const;

// ============================================================================
// PERMISSION DEFINITIONS
// ============================================================================

/**
 * Available permissions in the system
 * Format: action:resource or resource:action
 */
export type Permission =
  // Profile permissions
  | 'read:own_profile'
  | 'write:own_profile'
  // Course permissions
  | 'read:courses'
  | 'write:courses'
  | 'publish:courses'
  | 'delete:courses'
  // Learner management
  | 'read:learners'
  | 'write:learners'
  | 'enroll:learners'
  // Analytics permissions
  | 'read:analytics'
  | 'read:analytics:personal'
  | 'read:analytics:team'
  | 'read:analytics:org'
  | 'read:analytics:platform'
  | 'export:analytics'
  // User management
  | 'manage:users'
  | 'manage:roles'
  | 'invite:users'
  // Organization management
  | 'manage:org'
  | 'manage:org:settings'
  | 'manage:org:billing'
  | 'manage:org:branding'
  // Platform administration
  | 'manage:platform'
  | 'manage:tenants'
  // Content management
  | 'create:content'
  | 'review:content'
  | 'approve:content'
  // Mentorship
  | 'mentor:assign'
  | 'mentor:sessions'
  // Assessment
  | 'take:assessments'
  | 'grade:assessments'
  | 'create:assessments';

// ============================================================================
// ROLE INTERFACE
// ============================================================================

/**
 * Complete role definition with metadata
 */
export interface Role {
  /** Unique role name identifier */
  name: RoleName;
  /** Numeric permission level (0-100) */
  level: RoleLevel;
  /** Human-readable display name */
  displayName: string;
  /** Role description */
  description: string;
  /** Permissions granted to this role */
  permissions: Permission[];
}

// ============================================================================
// FIREBASE CUSTOM CLAIMS
// ============================================================================

/**
 * Custom claims stored in Firebase Auth token
 * These are set via Firebase Admin SDK and accessible client-side
 */
export interface UserClaims {
  /** User's primary role */
  role: RoleName;
  /** Numeric role level for quick comparisons */
  roleLevel: RoleLevel;
  /** Organization/tenant ID (null for platform-level users) */
  tenantId: string | null;
  /** Granted permissions (computed from role + overrides) */
  permissions: Permission[];
  /** Organization-specific role (if different from primary) */
  orgRole?: RoleName;
  /** Timestamp when claims were last updated */
  claimsUpdatedAt?: number;
  /** Whether this is an LXD360 employee (@lxd360.com) */
  isEmployee?: boolean;
}

/**
 * Partial claims for updates
 */
export type UserClaimsUpdate = Partial<Omit<UserClaims, 'claimsUpdatedAt'>>;

// ============================================================================
// PERMISSION ACTION & RESOURCE TYPES
// ============================================================================

/**
 * Available permission actions
 */
export type PermissionAction =
  | 'read'
  | 'write'
  | 'create'
  | 'delete'
  | 'publish'
  | 'enroll'
  | 'manage'
  | 'export'
  | 'invite'
  | 'review'
  | 'approve'
  | 'assign'
  | 'take'
  | 'grade';

/**
 * Available permission resources
 */
export type PermissionResource =
  | 'own_profile'
  | 'courses'
  | 'learners'
  | 'analytics'
  | 'analytics:personal'
  | 'analytics:team'
  | 'analytics:org'
  | 'analytics:platform'
  | 'users'
  | 'roles'
  | 'org'
  | 'org:settings'
  | 'org:billing'
  | 'org:branding'
  | 'platform'
  | 'tenants'
  | 'content'
  | 'mentor'
  | 'mentor:sessions'
  | 'assessments';

/**
 * Available product types for access control
 */
export type ProductType =
  | 'inspire-studio'
  | 'lxp360'
  | 'nexus'
  | 'command-center'
  | 'analytics'
  | 'video-studio'
  | 'ai-assistant';

// ============================================================================
// ROLE HIERARCHY
// ============================================================================

/**
 * Role hierarchy for permission inheritance
 * Maps each role to its numeric level for comparison
 */
export const ROLE_HIERARCHY: Record<RoleName, number> = {
  super_admin: ROLE_LEVELS.SUPER_ADMIN,
  org_admin: ROLE_LEVELS.ORG_ADMIN,
  admin: ROLE_LEVELS.ADMIN,
  manager: ROLE_LEVELS.MANAGER,
  instructor: ROLE_LEVELS.INSTRUCTOR,
  mentor: ROLE_LEVELS.MENTOR,
  learner: ROLE_LEVELS.LEARNER,
  mentee: ROLE_LEVELS.MENTEE,
  subscriber: ROLE_LEVELS.SUBSCRIBER,
  user: ROLE_LEVELS.USER,
  guest: ROLE_LEVELS.GUEST,
} as const;

// ============================================================================
// CONTEXT TYPES
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
  targetRole?: RoleName;
}

/**
 * Result of a permission check
 */
export interface PermissionCheckResult {
  /** Whether the action is allowed */
  allowed: boolean;
  /** Reason for denial (if not allowed) */
  reason?: string;
  /** The user's role at time of check */
  userRole?: RoleName;
  /** The required role or permission */
  required?: RoleName | Permission;
}

// ============================================================================
// ROLE CHANGE TYPES
// ============================================================================

/**
 * Audit record for role changes
 */
export interface RoleChangeAudit {
  /** Unique audit ID */
  id: string;
  /** User whose role changed */
  userId: string;
  /** Previous role */
  previousRole: RoleName;
  /** New role */
  newRole: RoleName;
  /** Who made the change */
  changedBy: string;
  /** When the change occurred */
  changedAt: Date;
  /** Reason for the change */
  reason?: string;
  /** Organization context */
  organizationId?: string;
}

/**
 * Input for role change operations
 */
export interface RoleChangeInput {
  /** User to update */
  userId: string;
  /** New role to assign */
  newRole: RoleName;
  /** Organization context (required for org-level roles) */
  organizationId?: string;
  /** Reason for the change */
  reason?: string;
}
