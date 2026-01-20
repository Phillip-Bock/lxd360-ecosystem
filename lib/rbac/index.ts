/**
 * RBAC Module Exports
 *
 * IMPORTANT: The firebase-admin module is NOT exported here as it contains
 * server-only code. Import it directly when needed in server contexts:
 *
 * ```typescript
 * import { setUserRole, getUserRole } from '@/lib/rbac/firebase-admin';
 * ```
 */

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  Permission,
  PermissionCheckResult,
  PermissionContext,
  Role,
  RoleChangeAudit,
  RoleChangeInput,
  RoleLevel,
  RoleName,
  UserClaims,
  UserClaimsUpdate,
} from './types';

export { ROLE_LEVELS, ROLE_NAME_TO_LEVEL } from './types';

// ============================================================================
// ROLE EXPORTS
// ============================================================================

export {
  // Permission check functions
  canAccessRole,
  canAssignRole,
  canManageUsers,
  canPublishContent,
  // Default values
  DEFAULT_GUEST_ROLE,
  DEFAULT_USER_ROLE,
  // Lookup functions
  getAllRoleNames,
  getAllRoles,
  getDefaultUserClaims,
  getRoleByLevel,
  getRoleByName,
  getRoleDescription,
  getRoleDisplayName,
  getRoleLevel,
  getRolePermissions,
  getRolesAbove,
  getRolesAtOrBelow,
  hasMinimumLevel,
  hasMinimumRole,
  hasPermission,
  isAdminRole,
  // Utility functions
  isEmployeeEmail,
  isValidRoleLevel,
  isValidRoleName,
  // Role definitions
  ROLES,
} from './roles';
