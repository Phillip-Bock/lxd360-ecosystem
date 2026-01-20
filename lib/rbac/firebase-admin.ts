/**
 * Server-side RBAC functions using Firebase Admin SDK
 *
 * Provides server-side functions for managing user roles via Firebase
 * Custom Claims. These functions should only be called from:
 * - API routes
 * - Server actions
 * - Cloud Functions
 *
 * NEVER import this file in client components.
 */

import { FieldValue } from 'firebase-admin/firestore';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger';
import {
  canAssignRole,
  getDefaultUserClaims,
  getRolePermissions,
  isEmployeeEmail,
  isValidRoleName,
} from './roles';
import type {
  Permission,
  RoleChangeAudit,
  RoleChangeInput,
  RoleLevel,
  RoleName,
  UserClaims,
} from './types';
import { ROLE_NAME_TO_LEVEL } from './types';

const log = logger.child({ module: 'rbac-admin' });

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Firestore collection for role audit logs
 */
const AUDIT_COLLECTION = 'rbac_audit_logs';

/**
 * Firestore collection for user metadata
 */
const USERS_COLLECTION = 'users';

// ============================================================================
// GET USER ROLE
// ============================================================================

/**
 * Get the current role and claims for a user
 * @param uid - Firebase user ID
 * @returns The user's claims, or null if not found
 */
export async function getUserRole(uid: string): Promise<UserClaims | null> {
  try {
    const user = await adminAuth.getUser(uid);

    if (!user.customClaims) {
      return null;
    }

    const claims = user.customClaims as Partial<UserClaims>;

    // Validate the claims have required fields
    if (!claims.role || !isValidRoleName(claims.role)) {
      return null;
    }

    return {
      role: claims.role,
      roleLevel: claims.roleLevel ?? ROLE_NAME_TO_LEVEL[claims.role],
      tenantId: claims.tenantId ?? null,
      permissions: claims.permissions ?? getRolePermissions(claims.role),
      orgRole: claims.orgRole,
      claimsUpdatedAt: claims.claimsUpdatedAt,
      isEmployee: claims.isEmployee,
    };
  } catch (error) {
    log.error('Failed to get user role', { uid, error });
    return null;
  }
}

// ============================================================================
// SET USER ROLE
// ============================================================================

/**
 * Set the role for a user via Firebase Custom Claims
 * @param uid - Firebase user ID
 * @param role - The role to assign
 * @param tenantId - Organization/tenant ID (optional)
 * @param changedBy - ID of the user making the change (for audit)
 * @returns Success status
 */
export async function setUserRole(
  uid: string,
  role: RoleName,
  tenantId: string | null = null,
  changedBy?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate role
    if (!isValidRoleName(role)) {
      return { success: false, error: `Invalid role: ${role}` };
    }

    // Get user to check email for employee status
    const user = await adminAuth.getUser(uid);
    const isEmployee = user.email ? isEmployeeEmail(user.email) : false;

    // Get previous claims for audit
    const previousClaims = await getUserRole(uid);
    const previousRole = previousClaims?.role ?? 'user';

    // Build new claims
    const newClaims: UserClaims = {
      role,
      roleLevel: ROLE_NAME_TO_LEVEL[role],
      tenantId,
      permissions: getRolePermissions(role),
      isEmployee,
      claimsUpdatedAt: Date.now(),
    };

    // Set custom claims
    await adminAuth.setCustomUserClaims(uid, newClaims);

    // Update user document in Firestore
    const userRef = adminDb.collection(USERS_COLLECTION).doc(uid);
    await userRef.set(
      {
        role,
        roleLevel: ROLE_NAME_TO_LEVEL[role],
        tenantId,
        isEmployee,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    // Log audit record
    await logRoleChange({
      userId: uid,
      previousRole,
      newRole: role,
      changedBy: changedBy ?? 'system',
      organizationId: tenantId ?? undefined,
    });

    log.info('User role updated', { uid, role, tenantId });
    return { success: true };
  } catch (error) {
    log.error('Failed to set user role', { uid, role, error });
    return { success: false, error: 'Failed to update user role' };
  }
}

// ============================================================================
// PROMOTE / DEMOTE USER
// ============================================================================

/**
 * Promote a user to a higher role
 * @param input - Role change input
 * @param promoterUid - UID of the user performing the promotion
 * @returns Success status
 */
export async function promoteUser(
  input: RoleChangeInput,
  promoterUid: string,
): Promise<{ success: boolean; error?: string }> {
  const { userId, newRole, organizationId, reason } = input;

  try {
    // Get promoter's role
    const promoterClaims = await getUserRole(promoterUid);
    if (!promoterClaims) {
      return { success: false, error: 'Promoter not found or has no role' };
    }

    // Check if promoter can assign this role
    if (!canAssignRole(promoterClaims.role, newRole)) {
      return {
        success: false,
        error: `Cannot promote to ${newRole}. You can only assign roles below your level.`,
      };
    }

    // Get current role
    const currentClaims = await getUserRole(userId);
    const currentRole = currentClaims?.role ?? 'user';

    // Verify this is actually a promotion
    if (ROLE_NAME_TO_LEVEL[newRole] <= ROLE_NAME_TO_LEVEL[currentRole]) {
      return {
        success: false,
        error: `This is not a promotion. Current role (${currentRole}) is equal or higher than ${newRole}.`,
      };
    }

    // Set the new role
    const result = await setUserRole(userId, newRole, organizationId ?? null, promoterUid);

    if (result.success && reason) {
      // Log the reason separately if provided
      await logRoleChange({
        userId,
        previousRole: currentRole,
        newRole,
        changedBy: promoterUid,
        organizationId,
        reason,
      });
    }

    return result;
  } catch (error) {
    log.error('Failed to promote user', { userId, newRole, error });
    return { success: false, error: 'Failed to promote user' };
  }
}

/**
 * Demote a user to a lower role
 * @param input - Role change input
 * @param demoterUid - UID of the user performing the demotion
 * @returns Success status
 */
export async function demoteUser(
  input: RoleChangeInput,
  demoterUid: string,
): Promise<{ success: boolean; error?: string }> {
  const { userId, newRole, organizationId, reason } = input;

  try {
    // Get demoter's role
    const demoterClaims = await getUserRole(demoterUid);
    if (!demoterClaims) {
      return { success: false, error: 'Demoter not found or has no role' };
    }

    // Get current role
    const currentClaims = await getUserRole(userId);
    const currentRole = currentClaims?.role ?? 'user';

    // Check if demoter can manage this user (must be higher than current role)
    if (ROLE_NAME_TO_LEVEL[demoterClaims.role] <= ROLE_NAME_TO_LEVEL[currentRole]) {
      return {
        success: false,
        error: `Cannot demote user. Your role must be higher than their current role (${currentRole}).`,
      };
    }

    // Verify this is actually a demotion
    if (ROLE_NAME_TO_LEVEL[newRole] >= ROLE_NAME_TO_LEVEL[currentRole]) {
      return {
        success: false,
        error: `This is not a demotion. New role (${newRole}) is equal or higher than current role (${currentRole}).`,
      };
    }

    // Set the new role
    const result = await setUserRole(userId, newRole, organizationId ?? null, demoterUid);

    if (result.success && reason) {
      // Log the reason separately if provided
      await logRoleChange({
        userId,
        previousRole: currentRole,
        newRole,
        changedBy: demoterUid,
        organizationId,
        reason,
      });
    }

    return result;
  } catch (error) {
    log.error('Failed to demote user', { userId, newRole, error });
    return { success: false, error: 'Failed to demote user' };
  }
}

// ============================================================================
// INITIALIZE NEW USER
// ============================================================================

/**
 * Initialize a new user with default claims
 * Called after user registration
 * @param uid - Firebase user ID
 * @param email - User's email address
 * @param tenantId - Organization/tenant ID (optional)
 * @returns Success status
 */
export async function initializeNewUser(
  uid: string,
  email: string,
  tenantId?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if user already has claims
    const existingClaims = await getUserRole(uid);
    if (existingClaims) {
      log.info('User already has claims, skipping initialization', { uid });
      return { success: true };
    }

    // Get default claims
    const defaultClaims = getDefaultUserClaims({ email, tenantId });

    // Set custom claims
    await adminAuth.setCustomUserClaims(uid, defaultClaims);

    // Create user document in Firestore
    const userRef = adminDb.collection(USERS_COLLECTION).doc(uid);
    await userRef.set(
      {
        uid,
        email,
        role: defaultClaims.role,
        roleLevel: defaultClaims.roleLevel,
        tenantId: defaultClaims.tenantId,
        isEmployee: defaultClaims.isEmployee,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    log.info('New user initialized', { uid, email, role: defaultClaims.role });
    return { success: true };
  } catch (error) {
    log.error('Failed to initialize new user', { uid, email, error });
    return { success: false, error: 'Failed to initialize user' };
  }
}

// ============================================================================
// PERMISSION MANAGEMENT
// ============================================================================

/**
 * Add additional permissions to a user beyond their role
 * @param uid - Firebase user ID
 * @param permissions - Permissions to add
 * @returns Success status
 */
export async function addUserPermissions(
  uid: string,
  permissions: Permission[],
): Promise<{ success: boolean; error?: string }> {
  try {
    const currentClaims = await getUserRole(uid);
    if (!currentClaims) {
      return { success: false, error: 'User not found or has no claims' };
    }

    // Combine existing permissions with new ones (deduplicated)
    const allPermissions = [...new Set([...currentClaims.permissions, ...permissions])];

    // Update claims
    const newClaims: UserClaims = {
      ...currentClaims,
      permissions: allPermissions,
      claimsUpdatedAt: Date.now(),
    };

    await adminAuth.setCustomUserClaims(uid, newClaims);

    log.info('User permissions added', { uid, addedPermissions: permissions });
    return { success: true };
  } catch (error) {
    log.error('Failed to add user permissions', { uid, permissions, error });
    return { success: false, error: 'Failed to add permissions' };
  }
}

/**
 * Remove specific permissions from a user
 * @param uid - Firebase user ID
 * @param permissions - Permissions to remove
 * @returns Success status
 */
export async function removeUserPermissions(
  uid: string,
  permissions: Permission[],
): Promise<{ success: boolean; error?: string }> {
  try {
    const currentClaims = await getUserRole(uid);
    if (!currentClaims) {
      return { success: false, error: 'User not found or has no claims' };
    }

    // Remove specified permissions
    const remainingPermissions = currentClaims.permissions.filter((p) => !permissions.includes(p));

    // Update claims
    const newClaims: UserClaims = {
      ...currentClaims,
      permissions: remainingPermissions,
      claimsUpdatedAt: Date.now(),
    };

    await adminAuth.setCustomUserClaims(uid, newClaims);

    log.info('User permissions removed', { uid, removedPermissions: permissions });
    return { success: true };
  } catch (error) {
    log.error('Failed to remove user permissions', { uid, permissions, error });
    return { success: false, error: 'Failed to remove permissions' };
  }
}

// ============================================================================
// VERIFY PERMISSIONS
// ============================================================================

/**
 * Verify a user has a specific permission (server-side check)
 * @param uid - Firebase user ID
 * @param permission - Permission to check
 * @returns True if the user has the permission
 */
export async function verifyPermission(uid: string, permission: Permission): Promise<boolean> {
  try {
    const claims = await getUserRole(uid);
    if (!claims) {
      return false;
    }
    return claims.permissions.includes(permission);
  } catch (error) {
    log.error('Failed to verify permission', { uid, permission, error });
    return false;
  }
}

/**
 * Verify a user has at least the minimum required role
 * @param uid - Firebase user ID
 * @param requiredRole - Minimum required role
 * @returns True if the user meets the requirement
 */
export async function verifyMinimumRole(uid: string, requiredRole: RoleName): Promise<boolean> {
  try {
    const claims = await getUserRole(uid);
    if (!claims) {
      return false;
    }
    const requiredLevel = ROLE_NAME_TO_LEVEL[requiredRole];
    return claims.roleLevel >= requiredLevel;
  } catch (error) {
    log.error('Failed to verify minimum role', { uid, requiredRole, error });
    return false;
  }
}

/**
 * Verify a user has at least the minimum required role level
 * @param uid - Firebase user ID
 * @param requiredLevel - Minimum required level
 * @returns True if the user meets the requirement
 */
export async function verifyMinimumLevel(uid: string, requiredLevel: RoleLevel): Promise<boolean> {
  try {
    const claims = await getUserRole(uid);
    if (!claims) {
      return false;
    }
    return claims.roleLevel >= requiredLevel;
  } catch (error) {
    log.error('Failed to verify minimum level', { uid, requiredLevel, error });
    return false;
  }
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

/**
 * Log a role change to Firestore for audit purposes
 * @param audit - Audit record data
 */
async function logRoleChange(audit: Omit<RoleChangeAudit, 'id' | 'changedAt'>): Promise<void> {
  try {
    const auditRef = adminDb.collection(AUDIT_COLLECTION).doc();
    await auditRef.set({
      id: auditRef.id,
      ...audit,
      changedAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    // Log but don't throw - audit failure shouldn't block role changes
    log.error('Failed to log role change audit', { audit, error });
  }
}

/**
 * Get role change history for a user
 * @param userId - User ID to get history for
 * @param limit - Maximum number of records to return
 * @returns Array of audit records
 */
export async function getRoleChangeHistory(userId: string, limit = 50): Promise<RoleChangeAudit[]> {
  try {
    const snapshot = await adminDb
      .collection(AUDIT_COLLECTION)
      .where('userId', '==', userId)
      .orderBy('changedAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        previousRole: data.previousRole,
        newRole: data.newRole,
        changedBy: data.changedBy,
        changedAt: data.changedAt?.toDate() ?? new Date(),
        reason: data.reason,
        organizationId: data.organizationId,
      } as RoleChangeAudit;
    });
  } catch (error) {
    log.error('Failed to get role change history', { userId, error });
    return [];
  }
}
