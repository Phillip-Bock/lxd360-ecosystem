'use client';

import { onIdTokenChanged, type User } from 'firebase/auth';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { requireAuth } from '@/lib/firebase/client';
import {
  hasMinimumRole as checkMinimumRole,
  hasPermission as checkPermission,
  DEFAULT_GUEST_ROLE,
  getRolePermissions,
  isAdminRole,
} from '@/lib/rbac/roles';
import type { Permission, RoleLevel, RoleName, UserClaims } from '@/lib/rbac/types';
import { ROLE_NAME_TO_LEVEL } from '@/lib/rbac/types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Return type for useRole hook
 */
interface UseRoleReturn {
  /** Current role name */
  role: RoleName;
  /** Current role level */
  level: RoleLevel;
  /** Whether role data is still loading */
  loading: boolean;
  /** Error if role fetch failed */
  error: Error | null;
  /** Full user claims object */
  claims: UserClaims | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether user is an admin or higher */
  isAdmin: boolean;
  /** Whether user is a super admin */
  isSuperAdmin: boolean;
  /** Whether user is an LXD360 employee */
  isEmployee: boolean;
  /** Refresh claims from Firebase */
  refreshClaims: () => Promise<void>;
}

/**
 * Return type for useHasPermission hook
 */
interface UseHasPermissionReturn {
  /** Whether user has the permission */
  hasPermission: boolean;
  /** Whether permission check is still loading */
  loading: boolean;
}

/**
 * Return type for useCanAccess hook
 */
interface UseCanAccessReturn {
  /** Whether user can access the resource */
  canAccess: boolean;
  /** Whether access check is still loading */
  loading: boolean;
}

// ============================================================================
// MAIN ROLE HOOK
// ============================================================================

/**
 * Hook to get the current user's role and claims
 *
 * @example
 * ```tsx
 * function AdminPanel() {
 *   const { role, level, loading, isAdmin, isSuperAdmin } = useRole();
 *
 *   if (loading) return <Spinner />;
 *   if (!isAdmin) return <AccessDenied />;
 *
 *   return <div>Welcome, {role}</div>;
 * }
 * ```
 */
export function useRole(): UseRoleReturn {
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<UserClaims | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Extract claims from ID token
  const extractClaims = useCallback(async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      setClaims(null);
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // Get the ID token result which includes custom claims
      const tokenResult = await firebaseUser.getIdTokenResult(true);
      const customClaims = tokenResult.claims;

      // Parse claims
      const roleName = (customClaims.role as RoleName) || DEFAULT_GUEST_ROLE;
      const parsedClaims: UserClaims = {
        role: roleName,
        roleLevel: (customClaims.roleLevel as RoleLevel) ?? ROLE_NAME_TO_LEVEL[roleName],
        tenantId: (customClaims.tenantId as string) ?? null,
        permissions: (customClaims.permissions as Permission[]) ?? getRolePermissions(roleName),
        orgRole: customClaims.orgRole as RoleName | undefined,
        claimsUpdatedAt: customClaims.claimsUpdatedAt as number | undefined,
        isEmployee: (customClaims.isEmployee as boolean) ?? false,
      };

      setClaims(parsedClaims);
      setUser(firebaseUser);
      setError(null);
    } catch (err) {
      const parseError = err instanceof Error ? err : new Error('Failed to parse claims');
      setError(parseError);
      setClaims(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen for auth state and token changes
  useEffect(() => {
    const auth = requireAuth();
    const unsubscribe = onIdTokenChanged(auth, (firebaseUser) => {
      extractClaims(firebaseUser);
    });

    return () => unsubscribe();
  }, [extractClaims]);

  // Refresh claims manually
  const refreshClaims = useCallback(async () => {
    if (user) {
      setLoading(true);
      await extractClaims(user);
    }
  }, [user, extractClaims]);

  // Compute derived values
  const role = claims?.role ?? DEFAULT_GUEST_ROLE;
  const level = claims?.roleLevel ?? ROLE_NAME_TO_LEVEL[role];
  const isAuthenticated = !!user && !!claims;
  const isAdmin = isAdminRole(role);
  const isSuperAdmin = role === 'super_admin';
  const isEmployee = claims?.isEmployee ?? false;

  return {
    role,
    level,
    loading,
    error,
    claims,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    isEmployee,
    refreshClaims,
  };
}

// ============================================================================
// PERMISSION HOOKS
// ============================================================================

/**
 * Hook to check if the current user has a specific permission
 *
 * @param permission - The permission to check
 * @returns Object with hasPermission boolean and loading state
 *
 * @example
 * ```tsx
 * function PublishButton() {
 *   const { hasPermission, loading } = useHasPermission('publish:courses');
 *
 *   if (loading) return <Spinner />;
 *   if (!hasPermission) return null;
 *
 *   return <button type="button">Publish</button>;
 * }
 * ```
 */
export function useHasPermission(permission: Permission): UseHasPermissionReturn {
  const { claims, loading } = useRole();

  const hasPermission = useMemo(() => {
    if (!claims) return false;
    return checkPermission(claims, permission);
  }, [claims, permission]);

  return { hasPermission, loading };
}

/**
 * Hook to check if the current user can access a resource requiring a minimum role
 *
 * @param requiredLevel - The minimum role level required
 * @returns Object with canAccess boolean and loading state
 *
 * @example
 * ```tsx
 * function AdminSection() {
 *   const { canAccess, loading } = useCanAccess(80); // Admin level
 *
 *   if (loading) return <Spinner />;
 *   if (!canAccess) return <AccessDenied />;
 *
 *   return <AdminContent />;
 * }
 * ```
 */
export function useCanAccess(requiredLevel: RoleLevel): UseCanAccessReturn {
  const { level, loading } = useRole();

  const canAccess = level >= requiredLevel;

  return { canAccess, loading };
}

/**
 * Hook to check if the current user has at least the minimum required role
 *
 * @param requiredRole - The minimum role name required
 * @returns Object with hasRole boolean and loading state
 *
 * @example
 * ```tsx
 * function InstructorTools() {
 *   const { hasRole, loading } = useHasMinimumRole('instructor');
 *
 *   if (loading) return <Spinner />;
 *   if (!hasRole) return null;
 *
 *   return <CourseCreator />;
 * }
 * ```
 */
export function useHasMinimumRole(requiredRole: RoleName): {
  hasRole: boolean;
  loading: boolean;
} {
  const { role, loading } = useRole();

  const hasRole = checkMinimumRole(role, requiredRole);

  return { hasRole, loading };
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook to get multiple permission checks at once
 *
 * @param permissions - Array of permissions to check
 * @returns Object with permission results and loading state
 *
 * @example
 * ```tsx
 * function ContentActions() {
 *   const { results, loading, hasAll, hasAny } = usePermissions([
 *     'write:courses',
 *     'publish:courses',
 *     'delete:courses',
 *   ]);
 *
 *   if (loading) return <Spinner />;
 *
 *   return (
 *     <div>
 *       {results['write:courses'] && <EditButton />}
 *       {results['publish:courses'] && <PublishButton />}
 *       {results['delete:courses'] && <DeleteButton />}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePermissions(permissions: Permission[]): {
  results: Record<Permission, boolean>;
  loading: boolean;
  hasAll: boolean;
  hasAny: boolean;
} {
  const { claims, loading } = useRole();

  const results = useMemo(() => {
    const permissionResults: Record<string, boolean> = {};

    for (const permission of permissions) {
      permissionResults[permission] = claims ? checkPermission(claims, permission) : false;
    }

    return permissionResults as Record<Permission, boolean>;
  }, [claims, permissions]);

  const hasAll = useMemo(() => {
    return permissions.every((p) => results[p]);
  }, [permissions, results]);

  const hasAny = useMemo(() => {
    return permissions.some((p) => results[p]);
  }, [permissions, results]);

  return { results, loading, hasAll, hasAny };
}

/**
 * Hook to check if user can manage another user's role
 *
 * @param targetRole - The role of the user to manage
 * @returns Object with canManage boolean and loading state
 *
 * @example
 * ```tsx
 * function UserRoleEditor({ userRole }: { userRole: RoleName }) {
 *   const { canManage, loading } = useCanManageRole(userRole);
 *
 *   if (loading) return <Spinner />;
 *   if (!canManage) return <p>Cannot edit this user's role</p>;
 *
 *   return <RoleSelector />;
 * }
 * ```
 */
export function useCanManageRole(targetRole: RoleName): {
  canManage: boolean;
  loading: boolean;
} {
  const { level, loading } = useRole();

  const targetLevel = ROLE_NAME_TO_LEVEL[targetRole];
  const canManage = level > targetLevel;

  return { canManage, loading };
}

/**
 * Hook to get the current tenant/organization context
 *
 * @returns Object with tenantId and loading state
 *
 * @example
 * ```tsx
 * function OrgSettings() {
 *   const { tenantId, loading } = useTenant();
 *
 *   if (loading) return <Spinner />;
 *   if (!tenantId) return <NoOrgSelected />;
 *
 *   return <OrgSettingsPanel orgId={tenantId} />;
 * }
 * ```
 */
export function useTenant(): {
  tenantId: string | null;
  loading: boolean;
} {
  const { claims, loading } = useRole();

  return {
    tenantId: claims?.tenantId ?? null,
    loading,
  };
}
