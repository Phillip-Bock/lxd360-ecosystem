// ============================================================================
// ROLE CATEGORY TYPES
// ============================================================================

/**
 * Product-based role categories
 */
export type RoleCategory = 'internal' | 'ecosystem' | 'lxp360' | 'inspire' | 'nexus' | 'vip';

// ============================================================================
// INTERNAL ROLES (LXD360 LLC - 10 roles)
// ============================================================================

/**
 * LXD360 LLC internal employee roles
 * Hierarchy levels 1-20
 */
export type InternalRole =
  | 'super_admin_lxd360' // 1: Highest access - full system control
  | 'admin_lxd360' // 5: Internal admin operations
  | 'sales_lxd360' // 10: Sales team access
  | 'legal_federal_lxd360' // 10: Federal compliance legal
  | 'legal_private_lxd360' // 10: Private/commercial legal
  | 'it_compliance_lxd360' // 10: IT and security compliance
  | 'saas_engineer_lxd360' // 10: Engineering team
  | 'finance_lxd360' // 10: Finance and billing
  | 'smart_app_lxd360' // 15: AI/ML application management
  | 'moderator_lxd360'; // 20: Community moderation

// ============================================================================
// ECOSYSTEM ROLES (Full Ecosystem Product - 9 roles)
// ============================================================================

/**
 * LXD Ecosystem product roles
 * Full-featured learning ecosystem with LMS, LRS, and authoring
 * Hierarchy levels 30-100
 */
export type EcosystemRole =
  | 'program_admin_ecosystem' // 30: Program-level administration
  | 'admin_ecosystem' // 35: Tenant administration
  | 'sales_ecosystem' // 40: Tenant sales access
  | 'manager_ecosystem' // 45: Team/department management
  | 'lms_admin_ecosystem' // 50: LMS configuration
  | 'designer_ecosystem' // 55: Content design access
  | 'instructor_ecosystem' // 60: Teaching/facilitation
  | 'reviewer_ecosystem' // 65: Content review/QA
  | 'learner_ecosystem'; // 100: Learning consumption

// ============================================================================
// LXP360 ROLES (LMS/LRS Product - 5 roles)
// ============================================================================

/**
 * LXP360 product roles
 * Learning management and experience platform
 * Hierarchy levels 35-100
 */
export type Lxp360Role =
  | 'admin_lxp360' // 35: LXP360 administration
  | 'manager_lxp360' // 45: Team management
  | 'lms_admin_lxp360' // 50: LMS configuration
  | 'reviewer_lxp360' // 65: Content review
  | 'learner_lxp360'; // 100: Learning consumption

// ============================================================================
// INSPIRE ROLES (Authoring Product - 5 roles)
// ============================================================================

/**
 * INSPIRE Studio product roles
 * Content authoring and course design tool
 * Hierarchy levels 35-65
 */
export type InspireRole =
  | 'admin_inspire' // 35: INSPIRE administration
  | 'sales_inspire' // 40: INSPIRE sales
  | 'manager_inspire' // 45: Project management
  | 'designer_inspire' // 55: Content authoring
  | 'reviewer_inspire'; // 65: Content review/QA

// ============================================================================
// NEXUS ROLES (Community Platform - 4 roles)
// ============================================================================

/**
 * LXD Nexus community roles
 * Mentorship and community platform
 * Hierarchy levels 25-90
 */
export type NexusRole =
  | 'mentor_nexus' // 70: Verified mentors
  | 'mentee_nexus' // 80: Bootcamp participants
  | 'member_nexus' // 90: Community members
  | 'moderator_nexus'; // 25: LXD360 employee moderators

// ============================================================================
// VIP ROLES (VIP Program - 2 roles)
// ============================================================================

/**
 * VIP program roles
 * Early access and prospect management
 * Hierarchy levels 85-95
 */
export type VipRole =
  | 'vip_prospect' // 95: 5000 CLO campaign invitees
  | 'vip_converted'; // 85: Converted to customer

// ============================================================================
// COMBINED ROLE TYPE
// ============================================================================

/**
 * All 35 roles in the system
 */
export type Role = InternalRole | EcosystemRole | Lxp360Role | InspireRole | NexusRole | VipRole;

// ============================================================================
// ROLE CONSTANTS
// ============================================================================

/**
 * All internal roles as a constant array
 */
export const INTERNAL_ROLES: InternalRole[] = [
  'super_admin_lxd360',
  'admin_lxd360',
  'sales_lxd360',
  'legal_federal_lxd360',
  'legal_private_lxd360',
  'it_compliance_lxd360',
  'saas_engineer_lxd360',
  'finance_lxd360',
  'smart_app_lxd360',
  'moderator_lxd360',
];

/**
 * All ecosystem roles as a constant array
 */
export const ECOSYSTEM_ROLES: EcosystemRole[] = [
  'program_admin_ecosystem',
  'admin_ecosystem',
  'sales_ecosystem',
  'manager_ecosystem',
  'lms_admin_ecosystem',
  'designer_ecosystem',
  'instructor_ecosystem',
  'reviewer_ecosystem',
  'learner_ecosystem',
];

/**
 * All LXP360 roles as a constant array
 */
export const LXP360_ROLES: Lxp360Role[] = [
  'admin_lxp360',
  'manager_lxp360',
  'lms_admin_lxp360',
  'reviewer_lxp360',
  'learner_lxp360',
];

/**
 * All INSPIRE roles as a constant array
 */
export const INSPIRE_ROLES: InspireRole[] = [
  'admin_inspire',
  'sales_inspire',
  'manager_inspire',
  'designer_inspire',
  'reviewer_inspire',
];

/**
 * All Nexus roles as a constant array
 */
export const NEXUS_ROLES: NexusRole[] = [
  'mentor_nexus',
  'mentee_nexus',
  'member_nexus',
  'moderator_nexus',
];

/**
 * All VIP roles as a constant array
 */
export const VIP_ROLES: VipRole[] = ['vip_prospect', 'vip_converted'];

/**
 * All roles as a constant array (35 total)
 */
export const ALL_ROLES: Role[] = [
  ...INTERNAL_ROLES,
  ...ECOSYSTEM_ROLES,
  ...LXP360_ROLES,
  ...INSPIRE_ROLES,
  ...NEXUS_ROLES,
  ...VIP_ROLES,
];

// ============================================================================
// ROLE CATEGORY MAPPING
// ============================================================================

/**
 * Map of roles to their categories
 */
export const ROLE_CATEGORY_MAP: Record<Role, RoleCategory> = {
  // Internal roles
  super_admin_lxd360: 'internal',
  admin_lxd360: 'internal',
  sales_lxd360: 'internal',
  legal_federal_lxd360: 'internal',
  legal_private_lxd360: 'internal',
  it_compliance_lxd360: 'internal',
  saas_engineer_lxd360: 'internal',
  finance_lxd360: 'internal',
  smart_app_lxd360: 'internal',
  moderator_lxd360: 'internal',

  // Ecosystem roles
  program_admin_ecosystem: 'ecosystem',
  admin_ecosystem: 'ecosystem',
  sales_ecosystem: 'ecosystem',
  manager_ecosystem: 'ecosystem',
  lms_admin_ecosystem: 'ecosystem',
  designer_ecosystem: 'ecosystem',
  instructor_ecosystem: 'ecosystem',
  reviewer_ecosystem: 'ecosystem',
  learner_ecosystem: 'ecosystem',

  // LXP360 roles
  admin_lxp360: 'lxp360',
  manager_lxp360: 'lxp360',
  lms_admin_lxp360: 'lxp360',
  reviewer_lxp360: 'lxp360',
  learner_lxp360: 'lxp360',

  // INSPIRE roles
  admin_inspire: 'inspire',
  sales_inspire: 'inspire',
  manager_inspire: 'inspire',
  designer_inspire: 'inspire',
  reviewer_inspire: 'inspire',

  // Nexus roles
  mentor_nexus: 'nexus',
  mentee_nexus: 'nexus',
  member_nexus: 'nexus',
  moderator_nexus: 'nexus',

  // VIP roles
  vip_prospect: 'vip',
  vip_converted: 'vip',
};

// ============================================================================
// DISPLAY NAMES
// ============================================================================

/**
 * Human-readable display names for all roles
 */
export const ROLE_DISPLAY_NAMES: Record<Role, string> = {
  // Internal roles
  super_admin_lxd360: 'Super Admin',
  admin_lxd360: 'LXD360 Admin',
  sales_lxd360: 'Sales',
  legal_federal_lxd360: 'Federal Legal',
  legal_private_lxd360: 'Private Legal',
  it_compliance_lxd360: 'IT Compliance',
  saas_engineer_lxd360: 'SaaS Engineer',
  finance_lxd360: 'Finance',
  smart_app_lxd360: 'Smart App Admin',
  moderator_lxd360: 'Moderator',

  // Ecosystem roles
  program_admin_ecosystem: 'Program Admin',
  admin_ecosystem: 'Ecosystem Admin',
  sales_ecosystem: 'Ecosystem Sales',
  manager_ecosystem: 'Ecosystem Manager',
  lms_admin_ecosystem: 'Ecosystem LMS Admin',
  designer_ecosystem: 'Ecosystem Designer',
  instructor_ecosystem: 'Ecosystem Instructor',
  reviewer_ecosystem: 'Ecosystem Reviewer',
  learner_ecosystem: 'Ecosystem Learner',

  // LXP360 roles
  admin_lxp360: 'LXP360 Admin',
  manager_lxp360: 'LXP360 Manager',
  lms_admin_lxp360: 'LXP360 LMS Admin',
  reviewer_lxp360: 'LXP360 Reviewer',
  learner_lxp360: 'LXP360 Learner',

  // INSPIRE roles
  admin_inspire: 'INSPIRE Admin',
  sales_inspire: 'INSPIRE Sales',
  manager_inspire: 'INSPIRE Manager',
  designer_inspire: 'INSPIRE Designer',
  reviewer_inspire: 'INSPIRE Reviewer',

  // Nexus roles
  mentor_nexus: 'Nexus Mentor',
  mentee_nexus: 'Nexus Mentee',
  member_nexus: 'Nexus Member',
  moderator_nexus: 'Nexus Moderator',

  // VIP roles
  vip_prospect: 'VIP Prospect',
  vip_converted: 'VIP Customer',
};

/**
 * Human-readable display names for role categories
 */
export const ROLE_CATEGORY_DISPLAY_NAMES: Record<RoleCategory, string> = {
  internal: 'LXD360 Internal',
  ecosystem: 'LXD Ecosystem',
  lxp360: 'LXP360',
  inspire: 'INSPIRE Studio',
  nexus: 'LXD Nexus',
  vip: 'VIP Program',
};

// ============================================================================
// ROLE DESCRIPTIONS
// ============================================================================

/**
 * Detailed descriptions for all roles
 */
export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  // Internal roles
  super_admin_lxd360: 'Highest access - full system control. Only phillip@lxd360.com.',
  admin_lxd360: 'Internal admin operations for LXD360 LLC.',
  sales_lxd360: 'Sales team access with CRM and demo capabilities.',
  legal_federal_lxd360: 'Federal compliance and legal operations.',
  legal_private_lxd360: 'Private/commercial legal operations.',
  it_compliance_lxd360: 'IT security and compliance management.',
  saas_engineer_lxd360: 'Engineering team with deployment access.',
  finance_lxd360: 'Finance, billing, and accounting operations.',
  smart_app_lxd360: 'AI/ML application management and monitoring.',
  moderator_lxd360: 'Community moderation for LXD Nexus.',

  // Ecosystem roles
  program_admin_ecosystem: 'Program-level administration across tenants.',
  admin_ecosystem: 'Tenant administration for the full ecosystem.',
  sales_ecosystem: 'Sales access within tenant ecosystem.',
  manager_ecosystem: 'Team/department management in ecosystem.',
  lms_admin_ecosystem: 'LMS configuration and course management.',
  designer_ecosystem: 'Content design and authoring access.',
  instructor_ecosystem: 'Teaching and facilitation capabilities.',
  reviewer_ecosystem: 'Content review and quality assurance.',
  learner_ecosystem: 'Learning content consumption.',

  // LXP360 roles
  admin_lxp360: 'LXP360 product administration.',
  manager_lxp360: 'Team management in LXP360.',
  lms_admin_lxp360: 'LMS configuration in LXP360.',
  reviewer_lxp360: 'Content review in LXP360.',
  learner_lxp360: 'Learning consumption in LXP360.',

  // INSPIRE roles
  admin_inspire: 'INSPIRE Studio administration.',
  sales_inspire: 'INSPIRE Studio sales access.',
  manager_inspire: 'Project management in INSPIRE Studio.',
  designer_inspire: 'Content authoring in INSPIRE Studio.',
  reviewer_inspire: 'Content review/QA in INSPIRE Studio.',

  // Nexus roles
  mentor_nexus: 'Verified mentor in LXD Nexus community.',
  mentee_nexus: 'Bootcamp participant in LXD Nexus.',
  member_nexus: 'Community member in LXD Nexus.',
  moderator_nexus: 'LXD360 employee moderator for Nexus.',

  // VIP roles
  vip_prospect: '5000 CLO campaign invitee with early access.',
  vip_converted: 'Converted VIP prospect to paying customer.',
};

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if a string is a valid Role
 */
export function isValidRole(role: string): role is Role {
  return ALL_ROLES.includes(role as Role);
}

/**
 * Check if a string is a valid RoleCategory
 */
export function isValidRoleCategory(category: string): category is RoleCategory {
  return ['internal', 'ecosystem', 'lxp360', 'inspire', 'nexus', 'vip'].includes(category);
}

/**
 * Check if a role is an internal LXD360 role
 */
export function isInternalRole(role: Role): role is InternalRole {
  return INTERNAL_ROLES.includes(role as InternalRole);
}

/**
 * Check if a role is an ecosystem role
 */
export function isEcosystemRole(role: Role): role is EcosystemRole {
  return ECOSYSTEM_ROLES.includes(role as EcosystemRole);
}

/**
 * Check if a role is an LXP360 role
 */
export function isLxp360Role(role: Role): role is Lxp360Role {
  return LXP360_ROLES.includes(role as Lxp360Role);
}

/**
 * Check if a role is an INSPIRE role
 */
export function isInspireRole(role: Role): role is InspireRole {
  return INSPIRE_ROLES.includes(role as InspireRole);
}

/**
 * Check if a role is a Nexus role
 */
export function isNexusRole(role: Role): role is NexusRole {
  return NEXUS_ROLES.includes(role as NexusRole);
}

/**
 * Check if a role is a VIP role
 */
export function isVipRole(role: Role): role is VipRole {
  return VIP_ROLES.includes(role as VipRole);
}

/**
 * Get the category for a role
 */
export function getRoleCategory(role: Role): RoleCategory {
  return ROLE_CATEGORY_MAP[role];
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Role tier based on hierarchy level
 */
export type RoleTier = 'super_admin' | 'admin' | 'manager' | 'staff' | 'user';

/**
 * Get role tier from hierarchy level
 */
export function getRoleTier(hierarchyLevel: number): RoleTier {
  if (hierarchyLevel <= 10) return 'super_admin';
  if (hierarchyLevel <= 30) return 'admin';
  if (hierarchyLevel <= 50) return 'manager';
  if (hierarchyLevel <= 70) return 'staff';
  return 'user';
}
