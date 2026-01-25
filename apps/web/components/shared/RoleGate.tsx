'use client';

import type { ReactNode } from 'react';
import {
  useIsEmployee,
  useMinimumRole,
  usePermission,
  useProductAccess,
} from '@/lib/hooks/useRBAC';
import type { PermissionAction, PermissionResource, ProductType, RoleName } from '@/lib/rbac/types';

// ============================================================================
// TYPES
// ============================================================================

interface RoleGateBaseProps {
  /** Content to show when user has access */
  children: ReactNode;
  /** Content to show when user doesn't have access (default: null) */
  fallback?: ReactNode;
  /** Content to show while loading (default: null) */
  loading?: ReactNode;
  /** If true, shows nothing instead of fallback when access denied */
  hideOnDeny?: boolean;
}

interface RoleGateWithRole extends RoleGateBaseProps {
  /** Minimum required role */
  requiredRole: RoleName;
  requiredPermission?: never;
  requiredProduct?: never;
  requiresEmployee?: never;
}

interface RoleGateWithPermission extends RoleGateBaseProps {
  /** Required permission (action and resource) */
  requiredPermission: {
    action: PermissionAction;
    resource: PermissionResource;
  };
  requiredRole?: never;
  requiredProduct?: never;
  requiresEmployee?: never;
}

interface RoleGateWithProduct extends RoleGateBaseProps {
  /** Required product access */
  requiredProduct: ProductType;
  requiredRole?: never;
  requiredPermission?: never;
  requiresEmployee?: never;
}

interface RoleGateWithEmployee extends RoleGateBaseProps {
  /** Requires @lxd360.com email */
  requiresEmployee: true;
  requiredRole?: never;
  requiredPermission?: never;
  requiredProduct?: never;
}

export type RoleGateProps =
  | RoleGateWithRole
  | RoleGateWithPermission
  | RoleGateWithProduct
  | RoleGateWithEmployee;

// ============================================================================
// DEFAULT FALLBACK COMPONENT
// ============================================================================

/**
 * Default fallback shown when access is denied
 */
function DefaultAccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="text-4xl mb-4">🔒</div>
      <h3 className="text-lg font-semibold text-brand-primary dark:text-brand-primary mb-2">
        Access Denied
      </h3>
      <p className="text-sm text-brand-secondary dark:text-brand-muted">
        You don&apos;t have permission to view this content.
      </p>
    </div>
  );
}

/**
 * Default loading component
 */
function DefaultLoading() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>
  );
}

// ============================================================================
// INTERNAL GATE COMPONENTS
// ============================================================================

/**
 * Gate based on minimum role
 */
function RoleBasedGate({
  requiredRole,
  children,
  fallback,
  loading,
  hideOnDeny,
}: RoleGateWithRole) {
  const { hasMinimum, isLoading, error } = useMinimumRole(requiredRole);

  if (isLoading) {
    return <>{loading ?? <DefaultLoading />}</>;
  }

  if (error || !hasMinimum) {
    if (hideOnDeny) return null;
    return <>{fallback ?? <DefaultAccessDenied />}</>;
  }

  return <>{children}</>;
}

/**
 * Gate based on specific permission
 */
function PermissionBasedGate({
  requiredPermission,
  children,
  fallback,
  loading,
  hideOnDeny,
}: RoleGateWithPermission) {
  const { hasPermission, isLoading, error } = usePermission(
    requiredPermission.action,
    requiredPermission.resource,
  );

  if (isLoading) {
    return <>{loading ?? <DefaultLoading />}</>;
  }

  if (error || !hasPermission) {
    if (hideOnDeny) return null;
    return <>{fallback ?? <DefaultAccessDenied />}</>;
  }

  return <>{children}</>;
}

/**
 * Gate based on product access
 */
function ProductBasedGate({
  requiredProduct,
  children,
  fallback,
  loading,
  hideOnDeny,
}: RoleGateWithProduct) {
  const { hasAccess, isLoading, error } = useProductAccess(requiredProduct);

  if (isLoading) {
    return <>{loading ?? <DefaultLoading />}</>;
  }

  if (error || !hasAccess) {
    if (hideOnDeny) return null;
    return <>{fallback ?? <DefaultAccessDenied />}</>;
  }

  return <>{children}</>;
}

/**
 * Gate based on employee email
 */
function EmployeeBasedGate({
  children,
  fallback,
  loading: loadingContent,
  hideOnDeny,
}: RoleGateWithEmployee) {
  const { isEmployee, loading } = useIsEmployee();

  if (loading) {
    return <>{loadingContent ?? <DefaultLoading />}</>;
  }

  if (!isEmployee) {
    if (hideOnDeny) return null;
    return <>{fallback ?? <DefaultAccessDenied />}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * RoleGate - A wrapper component for role-based access control
 *
 * @description
 * Use this component to conditionally render content based on the user's
 * role, permissions, product access, or employee status.
 *
 * @example
 * ```tsx
 * // Gate by role
 * <RoleGate requiredRole="instructor">
 *   <InstructorDashboard />
 * </RoleGate>
 *
 * // Gate by permission
 * <RoleGate requiredPermission={{ action: 'create', resource: 'courses' }}>
 *   <CreateCourseButton />
 * </RoleGate>
 *
 * // Gate by product
 * <RoleGate requiredProduct="inspire-studio">
 *   <InspireStudioLink />
 * </RoleGate>
 *
 * // Gate by employee status
 * <RoleGate requiresEmployee>
 *   <ConsultationDashboard />
 * </RoleGate>
 *
 * // With custom fallback
 * <RoleGate requiredRole="admin" fallback={<UpgradePrompt />}>
 *   <AdminPanel />
 * </RoleGate>
 *
 * // Hide completely when denied
 * <RoleGate requiredRole="manager" hideOnDeny>
 *   <ManagerOnlyButton />
 * </RoleGate>
 * ```
 */
export function RoleGate(props: RoleGateProps) {
  if ('requiredRole' in props && props.requiredRole) {
    return <RoleBasedGate {...props} />;
  }

  if ('requiredPermission' in props && props.requiredPermission) {
    return <PermissionBasedGate {...props} />;
  }

  if ('requiredProduct' in props && props.requiredProduct) {
    return <ProductBasedGate {...props} />;
  }

  if ('requiresEmployee' in props && props.requiresEmployee) {
    return <EmployeeBasedGate {...props} />;
  }

  // If no gate condition specified, render children
  // This should never be reached with proper typing, but we handle it gracefully
  const { children } = props as RoleGateBaseProps;
  return <>{children}</>;
}

// ============================================================================
// CONVENIENCE COMPONENTS
// ============================================================================

/**
 * AdminGate - Shorthand for RoleGate with admin role
 */
export function AdminGate({
  children,
  fallback,
  loading,
  hideOnDeny,
}: Omit<RoleGateBaseProps, 'requiredRole'>) {
  return (
    <RoleGate requiredRole="admin" fallback={fallback} loading={loading} hideOnDeny={hideOnDeny}>
      {children}
    </RoleGate>
  );
}

/**
 * SuperAdminGate - Shorthand for RoleGate with super_admin role
 */
export function SuperAdminGate({
  children,
  fallback,
  loading,
  hideOnDeny,
}: Omit<RoleGateBaseProps, 'requiredRole'>) {
  return (
    <RoleGate
      requiredRole="super_admin"
      fallback={fallback}
      loading={loading}
      hideOnDeny={hideOnDeny}
    >
      {children}
    </RoleGate>
  );
}

/**
 * InstructorGate - Shorthand for RoleGate with instructor role
 */
export function InstructorGate({
  children,
  fallback,
  loading,
  hideOnDeny,
}: Omit<RoleGateBaseProps, 'requiredRole'>) {
  return (
    <RoleGate
      requiredRole="instructor"
      fallback={fallback}
      loading={loading}
      hideOnDeny={hideOnDeny}
    >
      {children}
    </RoleGate>
  );
}

/**
 * LearnerGate - Shorthand for RoleGate with learner role
 */
export function LearnerGate({
  children,
  fallback,
  loading,
  hideOnDeny,
}: Omit<RoleGateBaseProps, 'requiredRole'>) {
  return (
    <RoleGate requiredRole="learner" fallback={fallback} loading={loading} hideOnDeny={hideOnDeny}>
      {children}
    </RoleGate>
  );
}

/**
 * EmployeeGate - Shorthand for RoleGate requiring employee email
 */
export function EmployeeGate({
  children,
  fallback,
  loading,
  hideOnDeny,
}: Omit<RoleGateBaseProps, 'requiresEmployee'>) {
  return (
    <RoleGate requiresEmployee fallback={fallback} loading={loading} hideOnDeny={hideOnDeny}>
      {children}
    </RoleGate>
  );
}

/**
 * AuthenticatedGate - Shows content only to authenticated users
 */
export function AuthenticatedGate({
  children,
  fallback,
  loading,
  hideOnDeny,
}: Omit<RoleGateBaseProps, 'requiredRole'>) {
  return (
    <RoleGate requiredRole="user" fallback={fallback} loading={loading} hideOnDeny={hideOnDeny}>
      {children}
    </RoleGate>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export { DefaultAccessDenied, DefaultLoading };
export default RoleGate;
