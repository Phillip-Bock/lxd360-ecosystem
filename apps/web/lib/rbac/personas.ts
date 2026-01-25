/**
 * 4-Persona RBAC System — SINGLE SOURCE OF TRUTH
 *
 * CV-007: This is the authoritative RBAC system for LXD360.
 * All route protection, API guards, and permission checks should use this module.
 *
 * This replaces the over-engineered 11-role system with a simple 4-persona model.
 * Each persona has clearly defined access levels and route permissions.
 *
 * MIGRATION NOTE: The legacy 'role' claim is still supported for backwards
 * compatibility but should be migrated to 'persona' claim in Firebase.
 * Target deprecation: Q2 2026
 */

export type Persona = 'owner' | 'editor' | 'manager' | 'learner';

export interface PersonaConfig {
  label: string;
  level: number;
  routes: readonly string[];
  color: string;
  description: string;
}

/**
 * Persona configuration - defines access levels and permissions
 */
export const PERSONA_CONFIG: Record<Persona, PersonaConfig> = {
  owner: {
    label: 'Owner',
    level: 100,
    routes: [
      'dashboard',
      'courses',
      'learners',
      'analytics',
      'gradebook',
      'authoring',
      'lrs',
      'settings',
      'billing',
    ],
    color: 'var(--color-lxd-primary)',
    description: 'Full access to all features including billing and user management',
  },
  editor: {
    label: 'Editor',
    level: 75,
    routes: ['dashboard', 'courses', 'authoring'],
    color: 'var(--color-neural-purple)',
    description: 'Can create and edit courses, no access to learner management',
  },
  manager: {
    label: 'Manager',
    level: 50,
    routes: ['dashboard', 'learners', 'analytics', 'gradebook', 'lrs'],
    color: 'var(--color-neural-cyan)',
    description: 'Manages learners and views analytics, no course authoring',
  },
  learner: {
    label: 'Learner',
    level: 25,
    routes: ['learn'],
    color: 'var(--color-lxd-success)',
    description: 'Access to learning content only',
  },
} as const;

/**
 * Check if a persona can access a specific route
 */
export function canAccess(persona: Persona, route: string): boolean {
  const config = PERSONA_CONFIG[persona];
  return config.routes.includes(route);
}

/**
 * Get persona from Firebase custom claims
 * Checks for 'persona' claim first, then legacy 'role' claim.
 * Falls back to 'learner' if no claim is set (secure default).
 *
 * @deprecated The 'role' fallback will be removed in Q2 2026.
 *             Migrate all users to 'persona' custom claim.
 */
export function getPersonaFromClaims(claims: Record<string, unknown>): Persona {
  // Primary: Check 'persona' custom claim (NEW - preferred)
  const persona = claims?.persona;
  if (persona === 'owner') return 'owner';
  if (persona === 'editor') return 'editor';
  if (persona === 'manager') return 'manager';
  if (persona === 'learner') return 'learner';

  // DEPRECATED: Fallback to legacy 'role' custom claim
  // Remove this block after migration is complete
  const role = claims?.role;
  if (role === 'owner') return 'owner';
  if (role === 'editor') return 'editor';
  if (role === 'manager') return 'manager';

  // Secure default: unknown users get learner (least privilege)
  return 'learner';
}

/**
 * Check if a persona has at least a certain access level
 */
export function hasMinimumLevel(persona: Persona, minimumLevel: number): boolean {
  return PERSONA_CONFIG[persona].level >= minimumLevel;
}

/**
 * Get all personas that can access a specific route
 */
export function getPersonasForRoute(route: string): Persona[] {
  return (Object.keys(PERSONA_CONFIG) as Persona[]).filter((persona) =>
    PERSONA_CONFIG[persona].routes.includes(route),
  );
}

// ============================================================================
// API PERMISSION HELPERS (CV-007: Unified RBAC for API routes)
// ============================================================================

/**
 * Check if persona can manage courses (create, edit, delete)
 * Used by: POST/PUT/DELETE /api/ignite/courses
 */
export function canManageCourses(persona: Persona): boolean {
  return persona === 'owner' || persona === 'editor';
}

/**
 * Check if persona can view admin course list
 * Used by: GET /api/ignite/courses
 */
export function canViewCourses(persona: Persona): boolean {
  return persona !== 'learner';
}

/**
 * Check if persona can manage learners (enroll, unenroll, grade)
 * Used by: /api/ignite/learners, /api/ignite/gradebook
 */
export function canManageLearners(persona: Persona): boolean {
  return persona === 'owner' || persona === 'manager';
}

/**
 * Check if persona can view analytics
 * Used by: /api/ignite/analytics
 */
export function canViewAnalytics(persona: Persona): boolean {
  return persona === 'owner' || persona === 'manager';
}

/**
 * Check if persona can manage tenant settings
 * Used by: /api/ignite/settings, /api/tenant/*
 */
export function canManageSettings(persona: Persona): boolean {
  return persona === 'owner';
}

/**
 * Check if persona can manage billing
 * Used by: /api/stripe/*, /api/billing/*
 */
export function canManageBilling(persona: Persona): boolean {
  return persona === 'owner';
}

/**
 * Extract persona from decoded Firebase token (for API routes)
 * This is a convenience function for server-side token verification.
 */
export function getPersonaFromToken(decodedToken: { persona?: string; role?: string }): Persona {
  return getPersonaFromClaims(decodedToken as Record<string, unknown>);
}
