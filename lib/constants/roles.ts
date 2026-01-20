export const USER_CATEGORIES = {
  INTERNAL: 'internal',
  EXTERNAL_TEAM: 'external-team',
  EXTERNAL_CLIENT: 'external-client',
  INDIVIDUAL: 'individual',
  VIP: 'vip',
} as const;

export const ROLES = {
  // Internal roles (LXD360 Company)
  SUPER_ADMIN: 'super_admin',
  PROGRAM_ADMIN: 'program_admin',
  SALES: 'sales',
  DESIGNER: 'designer',
  LMS_ADMIN: 'lms_admin',
  INSTRUCTOR: 'instructor',
  LEARNER: 'learner',

  // External team roles (White-label partners)
  TEAM_ADMIN: 'team_admin',
  TEAM_DESIGNER: 'team_designer',
  TEAM_LMS_ADMIN: 'team_lms_admin',
  TEAM_INSTRUCTOR: 'team_instructor',
  TEAM_LEARNER: 'team_learner',

  // External client roles (B2B enterprise)
  CLIENT_ADMIN: 'client_admin',
  CLIENT_LMS_ADMIN: 'client_lms_admin',
  CLIENT_COURSE_ADMIN: 'client_course_admin',
  CLIENT_DESIGNER: 'client_designer',
  CLIENT_INSTRUCTOR: 'client_instructor',
  CLIENT_LEARNER: 'client_learner',

  // Individual roles (B2C/Freelancers)
  INDIVIDUAL_DESIGNER: 'individual_designer',
  INDIVIDUAL_LMS_ADMIN: 'individual_lms_admin',
  INDIVIDUAL_INSTRUCTOR: 'individual_instructor',
  INDIVIDUAL_LEARNER: 'individual_learner',

  // VIP roles (Early access members)
  VIP: 'vip',
} as const;

export const ROLE_CATEGORY_MAP: Record<string, string> = {
  [ROLES.SUPER_ADMIN]: USER_CATEGORIES.INTERNAL,
  [ROLES.PROGRAM_ADMIN]: USER_CATEGORIES.INTERNAL,
  [ROLES.SALES]: USER_CATEGORIES.INTERNAL,
  [ROLES.DESIGNER]: USER_CATEGORIES.INTERNAL,
  [ROLES.LMS_ADMIN]: USER_CATEGORIES.INTERNAL,
  [ROLES.INSTRUCTOR]: USER_CATEGORIES.INTERNAL,
  [ROLES.LEARNER]: USER_CATEGORIES.INTERNAL,

  [ROLES.TEAM_ADMIN]: USER_CATEGORIES.EXTERNAL_TEAM,
  [ROLES.TEAM_DESIGNER]: USER_CATEGORIES.EXTERNAL_TEAM,
  [ROLES.TEAM_LMS_ADMIN]: USER_CATEGORIES.EXTERNAL_TEAM,
  [ROLES.TEAM_INSTRUCTOR]: USER_CATEGORIES.EXTERNAL_TEAM,
  [ROLES.TEAM_LEARNER]: USER_CATEGORIES.EXTERNAL_TEAM,

  [ROLES.CLIENT_ADMIN]: USER_CATEGORIES.EXTERNAL_CLIENT,
  [ROLES.CLIENT_LMS_ADMIN]: USER_CATEGORIES.EXTERNAL_CLIENT,
  [ROLES.CLIENT_COURSE_ADMIN]: USER_CATEGORIES.EXTERNAL_CLIENT,
  [ROLES.CLIENT_DESIGNER]: USER_CATEGORIES.EXTERNAL_CLIENT,
  [ROLES.CLIENT_INSTRUCTOR]: USER_CATEGORIES.EXTERNAL_CLIENT,
  [ROLES.CLIENT_LEARNER]: USER_CATEGORIES.EXTERNAL_CLIENT,

  [ROLES.INDIVIDUAL_DESIGNER]: USER_CATEGORIES.INDIVIDUAL,
  [ROLES.INDIVIDUAL_LMS_ADMIN]: USER_CATEGORIES.INDIVIDUAL,
  [ROLES.INDIVIDUAL_INSTRUCTOR]: USER_CATEGORIES.INDIVIDUAL,
  [ROLES.INDIVIDUAL_LEARNER]: USER_CATEGORIES.INDIVIDUAL,

  [ROLES.VIP]: USER_CATEGORIES.VIP,
};

export const ROLE_DISPLAY_NAMES: Record<string, string> = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.PROGRAM_ADMIN]: 'Program Admin',
  [ROLES.SALES]: 'Sales',
  [ROLES.DESIGNER]: 'Designer',
  [ROLES.LMS_ADMIN]: 'LMS Admin',
  [ROLES.INSTRUCTOR]: 'Instructor',
  [ROLES.LEARNER]: 'Learner',

  [ROLES.TEAM_ADMIN]: 'Team Admin',
  [ROLES.TEAM_DESIGNER]: 'Team Designer',
  [ROLES.TEAM_LMS_ADMIN]: 'Team LMS Admin',
  [ROLES.TEAM_INSTRUCTOR]: 'Team Instructor',
  [ROLES.TEAM_LEARNER]: 'Team Learner',

  [ROLES.CLIENT_ADMIN]: 'Client Admin',
  [ROLES.CLIENT_LMS_ADMIN]: 'Client LMS Admin',
  [ROLES.CLIENT_COURSE_ADMIN]: 'Course Admin',
  [ROLES.CLIENT_DESIGNER]: 'Client Designer',
  [ROLES.CLIENT_INSTRUCTOR]: 'Client Instructor',
  [ROLES.CLIENT_LEARNER]: 'Client Learner',

  [ROLES.INDIVIDUAL_DESIGNER]: 'Freelance Designer',
  [ROLES.INDIVIDUAL_LMS_ADMIN]: 'Freelance LMS Admin',
  [ROLES.INDIVIDUAL_INSTRUCTOR]: 'Freelance Instructor',
  [ROLES.INDIVIDUAL_LEARNER]: 'Individual Learner',

  [ROLES.VIP]: 'VIP Member',
};

export type UserCategory = (typeof USER_CATEGORIES)[keyof typeof USER_CATEGORIES];
export type Role = (typeof ROLES)[keyof typeof ROLES];
