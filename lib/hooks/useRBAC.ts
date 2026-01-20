// TODO(LXD-351): Implement with Firebase custom claims

'use client';

import type { PermissionAction, PermissionResource, ProductType, RoleName } from '@/lib/rbac/types';
import { ROLE_HIERARCHY } from '@/lib/rbac/types';

// ============================================================================
// Types
// ============================================================================

interface MinimumRoleResult {
  hasMinimum: boolean;
  isLoading: boolean;
  error: Error | null;
}

interface PermissionResult {
  hasPermission: boolean;
  isLoading: boolean;
  error: Error | null;
}

interface ProductAccessResult {
  hasAccess: boolean;
  isLoading: boolean;
  error: Error | null;
}

interface EmployeeResult {
  isEmployee: boolean;
  isLoading: boolean;
  error: Error | null;
}

// ============================================================================
// Stub Implementations
// ============================================================================

/**
 * Check if the current user has at least the specified role
 *
 * TODO(LXD-351): Implement with Firebase custom claims
 */
export function useMinimumRole(requiredRole: RoleName): MinimumRoleResult {
  // Stub: Always returns false until Firebase Auth is integrated
  const _hierarchy = ROLE_HIERARCHY[requiredRole];
  return {
    hasMinimum: false,
    isLoading: false,
    error: null,
  };
}

/**
 * Check if the current user has a specific permission
 *
 * TODO(LXD-351): Implement with Firebase custom claims
 */
export function usePermission(
  _action: PermissionAction,
  _resource: PermissionResource,
): PermissionResult {
  // Stub: Always returns false until Firebase Auth is integrated
  return {
    hasPermission: false,
    isLoading: false,
    error: null,
  };
}

/**
 * Check if the current user has access to a specific product
 *
 * TODO(LXD-351): Implement with Firebase custom claims
 */
export function useProductAccess(_product: ProductType): ProductAccessResult {
  // Stub: Always returns false until Firebase Auth is integrated
  return {
    hasAccess: false,
    isLoading: false,
    error: null,
  };
}

/**
 * Check if the current user is an LXD360 employee
 *
 * TODO(LXD-351): Implement with Firebase custom claims
 */
export function useIsEmployee(): EmployeeResult {
  // Stub: Always returns false until Firebase Auth is integrated
  return {
    isEmployee: false,
    isLoading: false,
    error: null,
  };
}
