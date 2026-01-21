/**
 * Role and Permission Constants
 *
 * @module @inspire/types/constants/roles
 */

// ============================================================================
// ROLE HIERARCHY
// ============================================================================

/**
 * Role hierarchy from lowest to highest privilege.
 * Higher index = more permissions.
 */
export const ROLE_HIERARCHY = [
  'learner',
  'mentee',
  'mentor',
  'instructor',
  'admin',
  'org_admin',
  'super_admin',
] as const;

export type Role = (typeof ROLE_HIERARCHY)[number];

// ============================================================================
// PERMISSIONS
// ============================================================================

export const PERMISSIONS = {
  // Content
  CONTENT_VIEW: 'content:view',
  CONTENT_CREATE: 'content:create',
  CONTENT_EDIT: 'content:edit',
  CONTENT_DELETE: 'content:delete',
  CONTENT_PUBLISH: 'content:publish',

  // Courses
  COURSE_VIEW: 'course:view',
  COURSE_ENROLL: 'course:enroll',
  COURSE_CREATE: 'course:create',
  COURSE_EDIT: 'course:edit',
  COURSE_DELETE: 'course:delete',

  // Users
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',
  USER_IMPERSONATE: 'user:impersonate',

  // Analytics
  ANALYTICS_VIEW_OWN: 'analytics:view_own',
  ANALYTICS_VIEW_TEAM: 'analytics:view_team',
  ANALYTICS_VIEW_ALL: 'analytics:view_all',
  ANALYTICS_EXPORT: 'analytics:export',

  // Administration
  ADMIN_SETTINGS: 'admin:settings',
  ADMIN_BILLING: 'admin:billing',
  ADMIN_BRANDING: 'admin:branding',
  ADMIN_INTEGRATIONS: 'admin:integrations',

  // AI/ML
  AI_VIEW_RECOMMENDATIONS: 'ai:view_recommendations',
  AI_OVERRIDE_RECOMMENDATIONS: 'ai:override_recommendations',
  AI_CONFIGURE: 'ai:configure',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// ============================================================================
// ROLE-PERMISSION MAPPING
// ============================================================================

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  learner: [
    PERMISSIONS.CONTENT_VIEW,
    PERMISSIONS.COURSE_VIEW,
    PERMISSIONS.COURSE_ENROLL,
    PERMISSIONS.ANALYTICS_VIEW_OWN,
    PERMISSIONS.AI_VIEW_RECOMMENDATIONS,
    PERMISSIONS.AI_OVERRIDE_RECOMMENDATIONS,
  ],

  mentee: [
    PERMISSIONS.CONTENT_VIEW,
    PERMISSIONS.COURSE_VIEW,
    PERMISSIONS.COURSE_ENROLL,
    PERMISSIONS.ANALYTICS_VIEW_OWN,
    PERMISSIONS.AI_VIEW_RECOMMENDATIONS,
    PERMISSIONS.AI_OVERRIDE_RECOMMENDATIONS,
  ],

  mentor: [
    PERMISSIONS.CONTENT_VIEW,
    PERMISSIONS.COURSE_VIEW,
    PERMISSIONS.COURSE_ENROLL,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.ANALYTICS_VIEW_OWN,
    PERMISSIONS.ANALYTICS_VIEW_TEAM,
    PERMISSIONS.AI_VIEW_RECOMMENDATIONS,
    PERMISSIONS.AI_OVERRIDE_RECOMMENDATIONS,
  ],

  instructor: [
    PERMISSIONS.CONTENT_VIEW,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.COURSE_VIEW,
    PERMISSIONS.COURSE_ENROLL,
    PERMISSIONS.COURSE_CREATE,
    PERMISSIONS.COURSE_EDIT,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.ANALYTICS_VIEW_OWN,
    PERMISSIONS.ANALYTICS_VIEW_TEAM,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.AI_VIEW_RECOMMENDATIONS,
    PERMISSIONS.AI_OVERRIDE_RECOMMENDATIONS,
  ],

  admin: [
    PERMISSIONS.CONTENT_VIEW,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.CONTENT_PUBLISH,
    PERMISSIONS.COURSE_VIEW,
    PERMISSIONS.COURSE_ENROLL,
    PERMISSIONS.COURSE_CREATE,
    PERMISSIONS.COURSE_EDIT,
    PERMISSIONS.COURSE_DELETE,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.ANALYTICS_VIEW_OWN,
    PERMISSIONS.ANALYTICS_VIEW_TEAM,
    PERMISSIONS.ANALYTICS_VIEW_ALL,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.AI_VIEW_RECOMMENDATIONS,
    PERMISSIONS.AI_OVERRIDE_RECOMMENDATIONS,
    PERMISSIONS.AI_CONFIGURE,
  ],

  org_admin: [...Object.values(PERMISSIONS).filter((p) => p !== PERMISSIONS.USER_IMPERSONATE)],

  super_admin: Object.values(PERMISSIONS),
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if roleA is higher or equal to roleB in the hierarchy.
 */
export function isRoleAtLeast(roleA: Role, roleB: Role): boolean {
  return ROLE_HIERARCHY.indexOf(roleA) >= ROLE_HIERARCHY.indexOf(roleB);
}

/**
 * Get all permissions for a role (including inherited from lower roles).
 */
export function getAllPermissions(role: Role): Permission[] {
  const roleIndex = ROLE_HIERARCHY.indexOf(role);
  const allPermissions = new Set<Permission>();

  for (let i = 0; i <= roleIndex; i++) {
    const r = ROLE_HIERARCHY[i];
    if (r !== undefined) {
      for (const p of ROLE_PERMISSIONS[r]) {
        allPermissions.add(p);
      }
    }
  }

  return Array.from(allPermissions);
}
