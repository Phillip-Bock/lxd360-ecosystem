// ============================================================================
// SYSTEM ROLE (Platform-wide)
// ============================================================================

/**
 * Platform-wide system roles
 * Determines global access level across all organizations
 */
export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest',
} as const;

export type SystemRole = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];

/**
 * System role privilege levels (higher = more access)
 */
export const SYSTEM_ROLE_LEVELS: Record<SystemRole, number> = {
  super_admin: 100,
  admin: 80,
  user: 10,
  guest: 0,
} as const;

/**
 * System role display names
 */
export const SYSTEM_ROLE_DISPLAY_NAMES: Record<SystemRole, string> = {
  super_admin: 'Super Administrator',
  admin: 'Platform Administrator',
  user: 'User',
  guest: 'Guest',
} as const;

// ============================================================================
// ORG ROLE (Per-organization)
// ============================================================================

/**
 * Per-organization roles
 * Determines what a user can do within a specific organization
 */
export const ORG_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MANAGER: 'manager',
  INSTRUCTOR: 'instructor',
  MENTOR: 'mentor',
  LEARNER: 'learner',
  MENTEE: 'mentee',
  SUBSCRIBER: 'subscriber',
} as const;

export type OrgRole = (typeof ORG_ROLES)[keyof typeof ORG_ROLES];

/**
 * Org role privilege levels (higher = more access within org)
 */
export const ORG_ROLE_LEVELS: Record<OrgRole, number> = {
  owner: 100,
  admin: 80,
  manager: 60,
  instructor: 50,
  mentor: 40,
  learner: 30,
  mentee: 20,
  subscriber: 10,
} as const;

/**
 * Org role display names
 */
export const ORG_ROLE_DISPLAY_NAMES: Record<OrgRole, string> = {
  owner: 'Organization Owner',
  admin: 'Organization Admin',
  manager: 'Manager',
  instructor: 'Instructor',
  mentor: 'Mentor',
  learner: 'Learner',
  mentee: 'Mentee',
  subscriber: 'Subscriber',
} as const;

/**
 * Org role descriptions
 */
export const ORG_ROLE_DESCRIPTIONS: Record<OrgRole, string> = {
  owner: 'Full organization control, billing management, can delete organization',
  admin: 'Organization administration, user management, settings',
  manager: 'Team management, reporting, instructor oversight',
  instructor: 'Course creation, content delivery, learner progress tracking',
  mentor: '1:1 guidance, LXD Nexus mentorship capabilities',
  learner: 'Course consumption, assessments, learning activities',
  mentee: 'Receives mentorship, learning guidance',
  subscriber: 'Purchased product access only',
} as const;

// ============================================================================
// DATABASE TABLE TYPES
// ============================================================================

/**
 * User system role record (platform-level)
 * Each user has ONE system role
 */
export interface UserSystemRole {
  id: string;
  user_id: string;
  system_role: SystemRole;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

/**
 * Organization member record (org-level)
 * Users can have different roles in different organizations
 */
export interface OrganizationMember {
  id: string;
  user_id: string;
  organization_id: string;
  org_role: OrgRole;
  invited_by: string | null;
  invited_at: string | null;
  joined_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Feature flag record
 * Per-organization feature flags from subscription tier
 */
export interface FeatureFlag {
  id: string;
  organization_id: string;
  flag_name: string;
  enabled: boolean;
  config: Record<string, unknown>;
  source: FeatureFlagSource;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

/**
 * Feature flag source
 */
export type FeatureFlagSource = 'manual' | 'subscription' | 'trial' | 'override';

/**
 * Feature flag definition (master list)
 */
export interface FeatureFlagDefinition {
  id: string;
  flag_name: string;
  display_name: string;
  description: string | null;
  category: string;
  default_enabled: boolean;
  tier_required: SubscriptionTier;
  created_at: string;
}

/**
 * Subscription tiers
 */
export type SubscriptionTier = 'starter' | 'professional' | 'enterprise';

// ============================================================================
// INSERT/UPDATE TYPES
// ============================================================================

export type UserSystemRoleInsert = Omit<UserSystemRole, 'id' | 'created_at' | 'updated_at'>;
export type UserSystemRoleUpdate = Partial<Omit<UserSystemRole, 'id' | 'user_id' | 'created_at'>>;

export type OrganizationMemberInsert = Omit<
  OrganizationMember,
  'id' | 'created_at' | 'updated_at' | 'joined_at'
>;
export type OrganizationMemberUpdate = Partial<
  Omit<OrganizationMember, 'id' | 'user_id' | 'organization_id' | 'created_at'>
>;

export type FeatureFlagInsert = Omit<FeatureFlag, 'id' | 'created_at' | 'updated_at'>;
export type FeatureFlagUpdate = Partial<
  Omit<FeatureFlag, 'id' | 'organization_id' | 'flag_name' | 'created_at'>
>;

// ============================================================================
// USER CONTEXT TYPES
// ============================================================================

/**
 * Complete user RBAC context
 * Used by hooks and components to determine access
 */
export interface UserRBACContext {
  /** User's platform-wide system role */
  systemRole: SystemRole;
  /** User's organization memberships with roles */
  orgMemberships: OrganizationMembership[];
  /** Currently selected organization (if any) */
  currentOrgId: string | null;
  /** Current org role (if in an org context) */
  currentOrgRole: OrgRole | null;
  /** Feature flags for current org */
  currentOrgFeatures: string[];
}

/**
 * Organization membership with expanded info
 */
export interface OrganizationMembership {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  role: OrgRole;
  joinedAt: string;
  isActive: boolean;
}

// ============================================================================
// PERMISSION CHECK TYPES
// ============================================================================

/**
 * Result of a permission check
 */
export interface RBACCheckResult {
  allowed: boolean;
  reason?: RBACDenialReason;
  message?: string;
  systemRole?: SystemRole;
  orgRole?: OrgRole;
  requiredSystemRole?: SystemRole;
  requiredOrgRole?: OrgRole;
}

/**
 * Reasons for access denial
 */
export type RBACDenialReason =
  | 'not_authenticated'
  | 'insufficient_system_role'
  | 'insufficient_org_role'
  | 'not_org_member'
  | 'feature_disabled'
  | 'org_inactive'
  | 'membership_inactive';

// ============================================================================
// FEATURE FLAG NAMES
// ============================================================================

/**
 * Known feature flag names
 */
export const FEATURE_FLAGS = {
  // Products
  INSPIRE_STUDIO: 'inspire_studio',
  LXP360_LMS: 'lxp360_lms',
  LXD_NEXUS: 'lxd_nexus',
  // AI Features
  AI_MENTOR: 'ai_mentor',
  AI_FEEDBACK: 'ai_feedback',
  ADAPTIVE_CONTENT: 'adaptive_content',
  // Export
  SCORM_EXPORT: 'scorm_export',
  // Analytics
  XAPI_ANALYTICS: 'xapi_analytics',
  ADVANCED_REPORTING: 'advanced_reporting',
  // Branding
  CUSTOM_BRANDING: 'custom_branding',
  // Security
  SSO_SAML: 'sso_saml',
  SSO_OAUTH: 'sso_oauth',
  // Integrations
  API_ACCESS: 'api_access',
  WEBHOOKS: 'webhooks',
  // Admin
  BULK_IMPORT: 'bulk_import',
  // Content
  VR_CONTENT: 'vr_content',
  AR_CONTENT: 'ar_content',
  SIMULATIONS: 'simulations',
} as const;

export type FeatureFlagName = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a system role meets the minimum required level
 */
export function hasMinimumSystemRole(userRole: SystemRole, requiredRole: SystemRole): boolean {
  return SYSTEM_ROLE_LEVELS[userRole] >= SYSTEM_ROLE_LEVELS[requiredRole];
}

/**
 * Check if an org role meets the minimum required level
 */
export function hasMinimumOrgRole(userRole: OrgRole, requiredRole: OrgRole): boolean {
  return ORG_ROLE_LEVELS[userRole] >= ORG_ROLE_LEVELS[requiredRole];
}

/**
 * Check if a string is a valid system role
 */
export function isValidSystemRole(role: string): role is SystemRole {
  return Object.values(SYSTEM_ROLES).includes(role as SystemRole);
}

/**
 * Check if a string is a valid org role
 */
export function isValidOrgRole(role: string): role is OrgRole {
  return Object.values(ORG_ROLES).includes(role as OrgRole);
}

/**
 * Get display name for system role
 */
export function getSystemRoleDisplayName(role: SystemRole): string {
  return SYSTEM_ROLE_DISPLAY_NAMES[role];
}

/**
 * Get display name for org role
 */
export function getOrgRoleDisplayName(role: OrgRole): string {
  return ORG_ROLE_DISPLAY_NAMES[role];
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(systemRole: SystemRole): boolean {
  return systemRole === SYSTEM_ROLES.SUPER_ADMIN;
}

/**
 * Check if user is org owner
 */
export function isOrgOwner(orgRole: OrgRole): boolean {
  return orgRole === ORG_ROLES.OWNER;
}

/**
 * Check if user is org admin or higher
 */
export function isOrgAdmin(orgRole: OrgRole): boolean {
  return hasMinimumOrgRole(orgRole, ORG_ROLES.ADMIN);
}
