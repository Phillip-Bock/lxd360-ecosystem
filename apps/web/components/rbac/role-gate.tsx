'use client';

import type { ReactNode } from 'react';
import { useHasMinimumRole, useHasPermission, useRole } from '@/hooks/use-rbac';
import type { Permission, RoleLevel, RoleName } from '@/lib/rbac/types';
import { ROLE_NAME_TO_LEVEL } from '@/lib/rbac/types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Props for the RoleGate component
 */
interface RoleGateProps {
  /**
   * Content to render when access is granted
   */
  children: ReactNode;

  /**
   * Minimum required role name
   * User must have this role or higher
   */
  requiredRole?: RoleName;

  /**
   * Minimum required role level
   * User's role level must be >= this value
   */
  requiredLevel?: RoleLevel;

  /**
   * Required permission
   * User must have this specific permission
   */
  requiredPermission?: Permission;

  /**
   * Content to render when access is denied
   * Defaults to null (nothing rendered)
   */
  fallback?: ReactNode;

  /**
   * Content to render while loading
   * Defaults to null (nothing rendered during load)
   */
  loading?: ReactNode;

  /**
   * Require employee email (@lxd360.com)
   * When true, only LXD360 employees can access
   */
  requireEmployee?: boolean;

  /**
   * Invert the access check
   * When true, renders children only if user does NOT have access
   */
  invert?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * RoleGate - Conditionally render content based on user roles
 *
 * @example Basic role check
 * ```tsx
 * <RoleGate requiredRole="admin">
 *   <AdminPanel />
 * </RoleGate>
 * ```
 *
 * @example With fallback
 * ```tsx
 * <RoleGate
 *   requiredRole="instructor"
 *   fallback={<p>You need instructor access to create courses.</p>}
 * >
 *   <CourseCreator />
 * </RoleGate>
 * ```
 *
 * @example Permission check
 * ```tsx
 * <RoleGate requiredPermission="publish:courses">
 *   <PublishButton />
 * </RoleGate>
 * ```
 *
 * @example Level check
 * ```tsx
 * <RoleGate requiredLevel={80}>
 *   <AdminTools />
 * </RoleGate>
 * ```
 *
 * @example Employee only
 * ```tsx
 * <RoleGate requireEmployee>
 *   <InternalTools />
 * </RoleGate>
 * ```
 *
 * @example Inverted (show to non-admins)
 * ```tsx
 * <RoleGate requiredRole="admin" invert>
 *   <UpgradePrompt />
 * </RoleGate>
 * ```
 */
export function RoleGate({
  children,
  requiredRole,
  requiredLevel,
  requiredPermission,
  fallback = null,
  loading: loadingContent = null,
  requireEmployee = false,
  invert = false,
}: RoleGateProps): ReactNode {
  // Get user role data
  const { level, loading, isEmployee } = useRole();

  // Check role requirement
  const { hasRole, loading: roleLoading } = useHasMinimumRole(requiredRole ?? 'guest');

  // Check permission requirement
  const { hasPermission, loading: permissionLoading } = useHasPermission(
    requiredPermission ?? 'read:own_profile',
  );

  // Handle loading state
  const isLoading = loading || roleLoading || permissionLoading;
  if (isLoading) {
    return loadingContent;
  }

  // Evaluate access conditions
  let hasAccess = true;

  // Check role requirement
  if (requiredRole && !hasRole) {
    hasAccess = false;
  }

  // Check level requirement
  if (requiredLevel !== undefined && level < requiredLevel) {
    hasAccess = false;
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission) {
    hasAccess = false;
  }

  // Check employee requirement
  if (requireEmployee && !isEmployee) {
    hasAccess = false;
  }

  // Apply inversion if requested
  if (invert) {
    hasAccess = !hasAccess;
  }

  // Render based on access
  return hasAccess ? children : fallback;
}

// ============================================================================
// SPECIALIZED COMPONENTS
// ============================================================================

/**
 * AdminGate - Shorthand for admin-only content
 *
 * @example
 * ```tsx
 * <AdminGate fallback={<AccessDenied />}>
 *   <AdminDashboard />
 * </AdminGate>
 * ```
 */
export function AdminGate({
  children,
  fallback = null,
  loading,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  loading?: ReactNode;
}): ReactNode {
  return (
    <RoleGate requiredLevel={ROLE_NAME_TO_LEVEL.admin} fallback={fallback} loading={loading}>
      {children}
    </RoleGate>
  );
}

/**
 * SuperAdminGate - Shorthand for super admin-only content
 *
 * @example
 * ```tsx
 * <SuperAdminGate>
 *   <PlatformControls />
 * </SuperAdminGate>
 * ```
 */
export function SuperAdminGate({
  children,
  fallback = null,
  loading,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  loading?: ReactNode;
}): ReactNode {
  return (
    <RoleGate requiredRole="super_admin" fallback={fallback} loading={loading}>
      {children}
    </RoleGate>
  );
}

/**
 * EmployeeGate - Shorthand for LXD360 employee-only content
 *
 * @example
 * ```tsx
 * <EmployeeGate fallback={<p>Internal tools only</p>}>
 *   <InternalDashboard />
 * </EmployeeGate>
 * ```
 */
export function EmployeeGate({
  children,
  fallback = null,
  loading,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  loading?: ReactNode;
}): ReactNode {
  return (
    <RoleGate requireEmployee fallback={fallback} loading={loading}>
      {children}
    </RoleGate>
  );
}

/**
 * InstructorGate - Shorthand for instructor-and-above content
 *
 * @example
 * ```tsx
 * <InstructorGate>
 *   <CourseEditor />
 * </InstructorGate>
 * ```
 */
export function InstructorGate({
  children,
  fallback = null,
  loading,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  loading?: ReactNode;
}): ReactNode {
  return (
    <RoleGate requiredRole="instructor" fallback={fallback} loading={loading}>
      {children}
    </RoleGate>
  );
}

/**
 * PermissionGate - Shorthand for permission-based access
 *
 * @example
 * ```tsx
 * <PermissionGate permission="publish:courses">
 *   <PublishButton />
 * </PermissionGate>
 * ```
 */
export function PermissionGate({
  permission,
  children,
  fallback = null,
  loading,
}: {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
  loading?: ReactNode;
}): ReactNode {
  return (
    <RoleGate requiredPermission={permission} fallback={fallback} loading={loading}>
      {children}
    </RoleGate>
  );
}

/**
 * AuthenticatedGate - Shorthand for authenticated users only
 *
 * @example
 * ```tsx
 * <AuthenticatedGate fallback={<LoginPrompt />}>
 *   <UserDashboard />
 * </AuthenticatedGate>
 * ```
 */
export function AuthenticatedGate({
  children,
  fallback = null,
  loading,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  loading?: ReactNode;
}): ReactNode {
  return (
    <RoleGate requiredRole="user" fallback={fallback} loading={loading}>
      {children}
    </RoleGate>
  );
}
