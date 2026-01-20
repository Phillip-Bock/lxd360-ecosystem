// TODO(LXD-351): Implement full RBAC with Firebase custom claims

'use server';

import { logger } from '@/lib/logger';

const log = logger.child({ module: 'rbac-permissions' });

// ============================================================================
// Types
// ============================================================================

interface RoleActionResult {
  success: boolean;
  error?: string;
}

// ============================================================================
// Role Management Actions
// ============================================================================

/**
 * Assign a role to a user
 * TODO(LXD-351): Implement with Firestore and Firebase custom claims
 */
export async function assignRole(userId: string, roleName: string): Promise<RoleActionResult> {
  log.warn('assignRole: Not implemented - migration in progress', {
    userId,
    roleName,
  });

  // Stub implementation - will be replaced with Firestore logic
  return {
    success: false,
    error: 'Role assignment not yet implemented - migration in progress',
  };
}

/**
 * Remove a role from a user
 * TODO(LXD-351): Implement with Firestore and Firebase custom claims
 */
export async function removeRole(userId: string, roleName: string): Promise<RoleActionResult> {
  log.warn('removeRole: Not implemented - migration in progress', {
    userId,
    roleName,
  });

  // Stub implementation - will be replaced with Firestore logic
  return {
    success: false,
    error: 'Role removal not yet implemented - migration in progress',
  };
}

/**
 * Check if a user has a specific permission
 * TODO(LXD-351): Implement with Firestore
 */
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  log.warn('hasPermission: Not implemented - returning false', {
    userId,
    permission,
  });

  return false;
}

/**
 * Get all roles for a user
 * TODO(LXD-351): Implement with Firestore
 */
export async function getUserRoles(userId: string): Promise<{ roles: string[]; error?: string }> {
  log.warn('getUserRoles: Not implemented - returning empty array', { userId });

  return {
    roles: [],
    error: 'User roles not yet implemented - migration in progress',
  };
}
