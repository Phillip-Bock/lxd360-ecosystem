import { ROLES } from './roles';

// Public routes (no authentication required)
export const PUBLIC_ROUTES = {
  HOME: '/',
  VISION: '/vision',
  CONTACT: '/contact',
  PRICING: '/pricing',
  SOLUTIONS: '/solutions',
  INSPIRE_STUDIO: '/products/inspire-studio',
  LXP360: '/products/lxp360',
  LXD_ECOSYSTEM: '/lxd-ecosystem',
  LXD_NEXUS: '/lxd-nexus',
  BLOG: '/blog',
  VIP: '/vip',
  POLICIES: '/policies',
} as const;

// Auth routes
export const AUTH_ROUTES = {
  LOGIN: '/auth/login',
  SIGN_UP: '/auth/sign-up',
  RESET_PASSWORD: '/auth/reset-password',
  CALLBACK: '/auth/callback',
} as const;

// Dashboard routes mapped by role
export const ROLE_DASHBOARD_PATHS: Record<string, string> = {
  // Internal roles
  [ROLES.SUPER_ADMIN]: '/dashboard/super-admin',
  [ROLES.PROGRAM_ADMIN]: '/dashboard/program-admin',
  [ROLES.SALES]: '/dashboard/sales',
  [ROLES.DESIGNER]: '/inspire-studio',
  [ROLES.LMS_ADMIN]: '/dashboard/lms-admin',
  [ROLES.INSTRUCTOR]: '/dashboard/instructor',
  [ROLES.LEARNER]: '/dashboard/learner',

  // External team roles
  [ROLES.TEAM_ADMIN]: '/dashboard/team-admin',
  [ROLES.TEAM_DESIGNER]: '/dashboard/team-designer',
  [ROLES.TEAM_LMS_ADMIN]: '/dashboard/team-lms-admin',
  [ROLES.TEAM_INSTRUCTOR]: '/dashboard/team-instructor',
  [ROLES.TEAM_LEARNER]: '/dashboard/team-learner',

  // External client roles
  [ROLES.CLIENT_ADMIN]: '/admin',
  [ROLES.CLIENT_LMS_ADMIN]: '/dashboard/client-lms-admin',
  [ROLES.CLIENT_COURSE_ADMIN]: '/dashboard/client-course-admin',
  [ROLES.CLIENT_DESIGNER]: '/dashboard/client-designer',
  [ROLES.CLIENT_INSTRUCTOR]: '/dashboard/client-instructor',
  [ROLES.CLIENT_LEARNER]: '/dashboard/client-learner',

  // Individual roles
  [ROLES.INDIVIDUAL_DESIGNER]: '/dashboard/individual-designer',
  [ROLES.INDIVIDUAL_LMS_ADMIN]: '/dashboard/individual-lms-admin',
  [ROLES.INDIVIDUAL_INSTRUCTOR]: '/dashboard/individual-instructor',
  [ROLES.INDIVIDUAL_LEARNER]: '/dashboard/individual-learner',

  // VIP roles
  [ROLES.VIP]: '/vip-demo',
};

// Protected route prefixes (require authentication)
export const PROTECTED_ROUTE_PREFIXES = [
  '/dashboard',
  '/inspire-studio',
  '/inspire-studio-app', // Legacy - redirects to /inspire-studio
  '/lxp360',
  '/admin',
  '/ecosystem',
  '/vip-demo',
  '/course-creation',
  '/authoring',
  '/lms',
  '/lrs',
  '/lxp',
  '/pm',
  '/ecommerce',
] as const;

// Legacy route mappings (for backwards compatibility redirects)
export const LEGACY_ROUTE_MAPPINGS = {
  '/dashboard/system-admin': '/dashboard/super-admin',
  '/dashboard/tenant-admin': '/admin',
  '/dashboard/manager': '/dashboard/program-admin',
  '/dashboard/lxd': '/inspire-studio',
  '/dashboard/designer': '/inspire-studio',
  '/dashboard/client-admin': '/admin',
  '/inspire-studio-app': '/inspire-studio',
  '/client-admin': '/admin',
  '/waitlist': '/vip',
  '/signin': '/auth/login',
  '/signup': '/auth/sign-up',
} as const;

// API routes
export const API_ROUTES = {
  AUTH_CALLBACK: '/api/auth/callback',
  WEBHOOKS_STRIPE: '/api/webhooks/stripe',
  HEALTH: '/api/health',
} as const;

// Helper function to get dashboard path for a role
export function getDashboardPath(role: string): string {
  return ROLE_DASHBOARD_PATHS[role] || '/dashboard';
}

// Helper function to check if a path is protected
export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

// Helper function to check if a path is a legacy route that needs redirect
export function getLegacyRedirect(pathname: string): string | null {
  for (const [legacy, current] of Object.entries(LEGACY_ROUTE_MAPPINGS)) {
    if (pathname.startsWith(legacy)) {
      return pathname.replace(legacy, current);
    }
  }
  return null;
}
