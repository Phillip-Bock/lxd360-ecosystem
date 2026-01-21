'use server';

import {
  hasPermission as checkPermission,
  isRoleAtLeast,
  type Permission,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
  type Role,
} from '@inspire/types';
import { FieldValue } from 'firebase-admin/firestore';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'rbac-permissions' });

// ============================================================================
// Types
// ============================================================================

interface RoleActionResult {
  success: boolean;
  error?: string;
}

interface UserRoleData {
  uid: string;
  tenantId: string;
  role: Role;
  permissions: Permission[];
  assignedAt: Date | string;
  assignedBy: string;
}

// ============================================================================
// Firebase Custom Claims Structure
// ============================================================================

interface CustomClaims {
  role: Role;
  tenantId: string;
  permissions?: Permission[];
}

// ============================================================================
// Role Management Actions
// ============================================================================

/**
 * Assign a role to a user by setting Firebase custom claims and updating Firestore
 */
export async function assignRole(
  userId: string,
  roleName: string,
  tenantId: string,
  assignedBy: string,
): Promise<RoleActionResult> {
  try {
    // Validate role name
    if (!ROLE_HIERARCHY.includes(roleName as Role)) {
      return {
        success: false,
        error: `Invalid role: ${roleName}. Valid roles: ${ROLE_HIERARCHY.join(', ')}`,
      };
    }

    const role = roleName as Role;

    // Get permissions for this role
    const permissions = ROLE_PERMISSIONS[role] || [];

    // Set Firebase custom claims
    const customClaims: CustomClaims = {
      role,
      tenantId,
      permissions,
    };

    await adminAuth.setCustomUserClaims(userId, customClaims);

    // Also store in Firestore for querying
    const userRoleRef = adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('userRoles')
      .doc(userId);

    const roleData: UserRoleData = {
      uid: userId,
      tenantId,
      role,
      permissions,
      assignedAt: FieldValue.serverTimestamp() as unknown as Date,
      assignedBy,
    };

    await userRoleRef.set(roleData, { merge: true });

    // Update the learner profile role if it exists
    const learnerRef = adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('learners')
      .doc(userId);
    const learnerDoc = await learnerRef.get();

    if (learnerDoc.exists) {
      await learnerRef.update({
        role,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    log.info('Role assigned successfully', { userId, role, tenantId });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to assign role', { userId, roleName, tenantId, error: errorMessage });
    return {
      success: false,
      error: `Failed to assign role: ${errorMessage}`,
    };
  }
}

/**
 * Remove a role from a user (reverts to learner role)
 */
export async function removeRole(
  userId: string,
  _roleName: string,
  tenantId: string,
): Promise<RoleActionResult> {
  try {
    // Revert to learner role (minimum role)
    const defaultRole: Role = 'learner';
    const permissions = ROLE_PERMISSIONS[defaultRole];

    const customClaims: CustomClaims = {
      role: defaultRole,
      tenantId,
      permissions,
    };

    await adminAuth.setCustomUserClaims(userId, customClaims);

    // Update Firestore
    const userRoleRef = adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('userRoles')
      .doc(userId);

    await userRoleRef.update({
      role: defaultRole,
      permissions,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Update learner profile
    const learnerRef = adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('learners')
      .doc(userId);
    const learnerDoc = await learnerRef.get();

    if (learnerDoc.exists) {
      await learnerRef.update({
        role: defaultRole,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    log.info('Role removed, reverted to learner', { userId, tenantId });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to remove role', { userId, tenantId, error: errorMessage });
    return {
      success: false,
      error: `Failed to remove role: ${errorMessage}`,
    };
  }
}

/**
 * Check if a user has a specific permission
 * Uses Firebase custom claims for fast verification
 */
export async function hasPermission(userId: string, permission: Permission): Promise<boolean> {
  try {
    const userRecord = await adminAuth.getUser(userId);
    const claims = userRecord.customClaims as CustomClaims | undefined;

    if (!claims?.role) {
      log.warn('User has no role claims', { userId });
      return false;
    }

    // Check if the user's role has the permission
    return checkPermission(claims.role, permission);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to check permission', { userId, permission, error: errorMessage });
    return false;
  }
}

/**
 * Check if user has required role level
 */
export async function hasRoleAtLeast(userId: string, requiredRole: Role): Promise<boolean> {
  try {
    const userRecord = await adminAuth.getUser(userId);
    const claims = userRecord.customClaims as CustomClaims | undefined;

    if (!claims?.role) {
      log.warn('User has no role claims', { userId });
      return false;
    }

    return isRoleAtLeast(claims.role, requiredRole);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to check role level', { userId, requiredRole, error: errorMessage });
    return false;
  }
}

/**
 * Get user's current role from Firebase custom claims
 */
export async function getUserRole(
  userId: string,
): Promise<{ role: Role | null; tenantId: string | null }> {
  try {
    const userRecord = await adminAuth.getUser(userId);
    const claims = userRecord.customClaims as CustomClaims | undefined;

    return {
      role: claims?.role || null,
      tenantId: claims?.tenantId || null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to get user role', { userId, error: errorMessage });
    return { role: null, tenantId: null };
  }
}

/**
 * Get all roles for a user (currently single-role, returns array for future multi-role support)
 */
export async function getUserRoles(userId: string): Promise<{ roles: Role[]; error?: string }> {
  try {
    const userRecord = await adminAuth.getUser(userId);
    const claims = userRecord.customClaims as CustomClaims | undefined;

    if (!claims?.role) {
      return { roles: [] };
    }

    return { roles: [claims.role] };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to get user roles', { userId, error: errorMessage });
    return {
      roles: [],
      error: `Failed to get user roles: ${errorMessage}`,
    };
  }
}

/**
 * Verify user has access to a specific tenant
 */
export async function verifyTenantAccess(userId: string, tenantId: string): Promise<boolean> {
  try {
    const userRecord = await adminAuth.getUser(userId);
    const claims = userRecord.customClaims as CustomClaims | undefined;

    if (!claims?.tenantId) {
      log.warn('User has no tenant claim', { userId });
      return false;
    }

    // Super admins can access any tenant
    if (claims.role === 'super_admin') {
      return true;
    }

    return claims.tenantId === tenantId;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to verify tenant access', { userId, tenantId, error: errorMessage });
    return false;
  }
}

/**
 * Get all users with a specific role in a tenant
 */
export async function getUsersByRole(
  tenantId: string,
  role: Role,
): Promise<{ users: UserRoleData[]; error?: string }> {
  try {
    const userRolesRef = adminDb.collection('tenants').doc(tenantId).collection('userRoles');

    const snapshot = await userRolesRef.where('role', '==', role).get();

    const users: UserRoleData[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        uid: data.uid,
        tenantId: data.tenantId,
        role: data.role,
        permissions: data.permissions || [],
        assignedAt: data.assignedAt?.toDate?.() || data.assignedAt,
        assignedBy: data.assignedBy,
      };
    });

    return { users };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to get users by role', { tenantId, role, error: errorMessage });
    return {
      users: [],
      error: `Failed to get users by role: ${errorMessage}`,
    };
  }
}

// Note: Types and constants (PERMISSIONS, ROLE_HIERARCHY, ROLE_PERMISSIONS) are available
// directly from '@inspire/types'. We cannot re-export them here because this is a 'use server' file.
