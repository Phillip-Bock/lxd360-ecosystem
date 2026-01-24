/**
 * 4-Persona RBAC System
 *
 * This replaces the over-engineered 11-role system with a simple 4-persona model.
 * Each persona has clearly defined access levels and route permissions.
 */

export type Persona = 'owner' | 'editor' | 'manager' | 'learner';

export interface PersonaConfig {
  label: string;
  level: number;
  routes: readonly string[];
  color: string;
  description: string;
}

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
    routes: ['dashboard', 'learners', 'analytics', 'gradebook'],
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
 * Falls back to 'learner' if no role is set
 */
export function getPersonaFromClaims(claims: Record<string, unknown>): Persona {
  const role = claims?.role;

  if (role === 'owner') return 'owner';
  if (role === 'editor') return 'editor';
  if (role === 'manager') return 'manager';

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
