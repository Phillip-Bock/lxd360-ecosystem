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
// ROUTE PROTECTION CONFIGURATION
// ============================================================================

/**
 * Route protection patterns:
 * - 'hard': Security-critical routes that redirect unauthorized users
 * - 'soft': Feature discovery with lock icons and upgrade CTAs for upsell
 */
export type RouteProtectionPattern = 'hard' | 'soft';

export interface RouteConfig {
  /** Minimum persona level required to access this route */
  minLevel: number;
  /** Protection pattern: 'hard' redirects, 'soft' shows upgrade prompt */
  pattern: RouteProtectionPattern;
  /** CTA shown to users who don't have access (soft gate only) */
  upgradeCTA?: string;
}

/**
 * Route protection configuration
 *
 * HARD BLOCK (Security) — Redirect if unauthorized:
 * - Contains sensitive data or actions that must be hidden
 *
 * SOFT GATE (Upsell) — Show with lock icon + upgrade CTA:
 * - Features we want users to discover and upgrade for
 */
export const ROUTE_CONFIG: Record<string, RouteConfig> = {
  // ============================================================================
  // HARD BLOCK - Security critical routes
  // ============================================================================

  /** Owner only - payment information */
  '/settings/billing': { minLevel: 100, pattern: 'hard' },
  '/ignite/billing': { minLevel: 100, pattern: 'hard' },

  /** Owner only - organization settings */
  '/settings/organization': { minLevel: 100, pattern: 'hard' },
  '/ignite/settings': { minLevel: 100, pattern: 'hard' },

  /** Manager+ - user management */
  '/ignite/manage/users': { minLevel: 50, pattern: 'hard' },

  /** Internal - command center */
  '/command-center': { minLevel: 100, pattern: 'hard' },

  // ============================================================================
  // SOFT GATE - Upsell opportunities
  // ============================================================================

  /** Editor+ - content authoring */
  '/inspire-studio': {
    minLevel: 75,
    pattern: 'soft',
    upgradeCTA: 'Upgrade to Editor to create learning content with INSPIRE Studio',
  },
  '/inspire': {
    minLevel: 75,
    pattern: 'soft',
    upgradeCTA: 'Upgrade to Editor to access INSPIRE authoring tools',
  },

  /** Manager+ - analytics and reporting */
  '/ignite/analytics': {
    minLevel: 50,
    pattern: 'soft',
    upgradeCTA: 'Upgrade to Manager for analytics access',
  },

  /** Manager+ - learning record store */
  '/ignite/lrs': {
    minLevel: 50,
    pattern: 'soft',
    upgradeCTA: 'Upgrade to Manager for Learning Record Store access',
  },

  /** Manager+ - reporting */
  '/ignite/manage/reports': {
    minLevel: 50,
    pattern: 'soft',
    upgradeCTA: 'Upgrade to Manager for reporting access',
  },

  /** Manager+ - learner management */
  '/ignite/learners': {
    minLevel: 50,
    pattern: 'soft',
    upgradeCTA: 'Upgrade to Manager for learner management',
  },

  /** Manager+ - gradebook */
  '/ignite/gradebook': {
    minLevel: 50,
    pattern: 'soft',
    upgradeCTA: 'Upgrade to Manager for gradebook access',
  },

  /** Editor+ - course management */
  '/ignite/courses': {
    minLevel: 75,
    pattern: 'soft',
    upgradeCTA: 'Upgrade to Editor for course management',
  },

  /** Editor+ - instructor tools */
  '/ignite/teach': {
    minLevel: 75,
    pattern: 'soft',
    upgradeCTA: 'Upgrade to Editor for instructor tools',
  },
} as const;

/**
 * Get route configuration for a given path
 * Uses longest prefix match to find the most specific config
 */
export function getRouteConfig(pathname: string): RouteConfig | null {
  const matchingRoutes = Object.entries(ROUTE_CONFIG)
    .filter(([path]) => pathname.startsWith(path))
    .sort((a, b) => b[0].length - a[0].length);

  return matchingRoutes.length > 0 ? matchingRoutes[0][1] : null;
}

/**
 * Check if a persona can access a route
 */
export function canAccessRoute(persona: Persona, pathname: string): boolean {
  const config = getRouteConfig(pathname);
  if (!config) return true; // No config = open route

  return PERSONA_CONFIG[persona].level >= config.minLevel;
}

/**
 * Route access result with all details needed for UI rendering
 */
export interface RouteAccessResult {
  /** Whether the persona has access to this route */
  hasAccess: boolean;
  /** Protection pattern: 'hard' (redirect) or 'soft' (lock icon) or null (open) */
  pattern: RouteProtectionPattern | null;
  /** Redirect destination for hard blocks */
  redirectTo: string;
  /** CTA message for soft gates */
  upgradeCTA: string | null;
  /** Minimum level required */
  minLevelRequired: number | null;
  /** User's current level */
  currentLevel: number;
}

/**
 * Get complete route access details for UI rendering
 * Returns all information needed to render RouteGuard or FeatureGate
 */
export function getRouteAccess(persona: Persona, pathname: string): RouteAccessResult {
  const config = getRouteConfig(pathname);
  const currentLevel = PERSONA_CONFIG[persona].level;

  if (!config) {
    return {
      hasAccess: true,
      pattern: null,
      redirectTo: '/ignite/dashboard',
      upgradeCTA: null,
      minLevelRequired: null,
      currentLevel,
    };
  }

  const hasAccess = currentLevel >= config.minLevel;

  return {
    hasAccess,
    pattern: config.pattern,
    redirectTo: '/ignite/dashboard',
    upgradeCTA: config.upgradeCTA ?? null,
    minLevelRequired: config.minLevel,
    currentLevel,
  };
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
