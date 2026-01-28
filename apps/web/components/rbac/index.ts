/**
 * RBAC Components
 *
 * New 4-Persona System (recommended):
 * - RouteGuard: Hard block pattern for security-critical routes
 * - FeatureGate: Soft gate pattern for feature upsell
 * - NavItem: Navigation item with lock indicator
 *
 * Legacy 11-Role System (deprecated):
 * - RoleGate, AdminGate, etc. - Maintained for backwards compatibility
 *
 * @see CLAUDE.md Section 9 for persona definitions
 */

// ============================================================================
// NEW: 4-Persona System Components
// ============================================================================

export { FeatureGate } from './feature-gate';
export { NavItem, NavItemGroup } from './nav-item';
export { RouteGuard } from './route-guard';

// ============================================================================
// LEGACY: 11-Role System Components (Deprecated)
// ============================================================================

export {
  AdminGate,
  AuthenticatedGate,
  EmployeeGate,
  InstructorGate,
  PermissionGate,
  RoleGate,
  SuperAdminGate,
} from './role-gate';
