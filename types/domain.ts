// Shared domain types used across client and server

// ============================================================================
// ROLE CATEGORIES
// ============================================================================
export type RoleCategory =
  | 'internal' // LXD360 Company Internal
  | 'external_team' // External Team (white-label/reseller partners)
  | 'external_client' // External Company Clients (B2B)
  | 'individual'; // Individual Contributors (B2C/freelancers)

// ============================================================================
// LXD360 COMPANY INTERNAL ROLES
// ============================================================================
export type InternalRole =
  | 'super_admin' // Platform owner with full system access (privilege: 1000)
  | 'program_admin' // Manages learning programs across tenants (privilege: 950)
  | 'sales' // Sales team member with CRM and demo access (privilege: 900)
  | 'designer' // Internal learning experience designer (privilege: 700)
  | 'lms_admin' // Internal LMS administration (privilege: 600)
  | 'instructor' // Internal instructor/trainer (privilege: 400)
  | 'learner'; // Internal employee as learner (privilege: 100)

// ============================================================================
// EXTERNAL TEAM ROLES (White-label/Reseller Partners)
// ============================================================================
export type ExternalTeamRole =
  | 'team_admin' // Team organization administrator (privilege: 800)
  | 'team_designer' // Team's learning experience designer (privilege: 700)
  | 'team_lms_admin' // Team's LMS administrator (privilege: 600)
  | 'team_instructor' // Team's instructor (privilege: 400)
  | 'team_learner'; // Team's learner (privilege: 100)

// ============================================================================
// EXTERNAL COMPANY CLIENT ROLES (B2B Clients)
// ============================================================================
export type ExternalClientRole =
  | 'client_admin' // Client organization administrator (privilege: 800)
  | 'client_lms_admin' // Client LMS administrator (privilege: 600)
  | 'client_course_admin' // Client course administrator (privilege: 500)
  | 'client_designer' // Client learning experience designer (privilege: 700)
  | 'client_instructor' // Client instructor/trainer (privilege: 400)
  | 'client_learner'; // Client organization learner (privilege: 100)

// ============================================================================
// INDIVIDUAL CONTRIBUTOR ROLES (B2C/Freelancers)
// ============================================================================
export type IndividualRole =
  | 'individual_designer' // Freelance learning experience designer (privilege: 700)
  | 'individual_lms_admin' // Individual LMS administrator (privilege: 600)
  | 'individual_instructor' // Freelance instructor/trainer (privilege: 400)
  | 'individual_learner'; // Individual learner (B2C) (privilege: 100)

// ============================================================================
// COMBINED USER ROLE TYPE (all roles)
// ============================================================================
export type UserRole = InternalRole | ExternalTeamRole | ExternalClientRole | IndividualRole;

// ============================================================================
// LEGACY ROLES (deprecated, kept for backwards compatibility)
// ============================================================================
export type LegacyRole =
  | 'system_admin' // Replaced by super_admin
  | 'tenant_admin' // Replaced by client_admin
  | 'manager' // Consolidated into admin roles
  | 'lxd'; // Replaced by designer

// Role type that includes legacy roles for migration purposes
export type UserRoleWithLegacy = UserRole | LegacyRole;

export interface UserProfile {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  department?: string;
  job_title?: string;
  employee_id?: string;
  status: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  subscription_tier: string;
  status: string;
  custom_domain?: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  platform_name: string;
  user_limit: number;
  storage_limit_gb: number;
  created_at?: string;
  updated_at?: string;
}

export interface TenantFeatures {
  tenant_id: string;
  has_content_authoring: boolean;
  has_advanced_analytics: boolean;
  has_api_access: boolean;
  has_sso: boolean;
  has_white_label: boolean;
  has_gamification: boolean;
  has_mobile_app: boolean;
  has_scorm_support: boolean;
  has_xapi_tracking: boolean;
  has_certifications: boolean;
  max_courses: number;
  max_content_items: number;
}
