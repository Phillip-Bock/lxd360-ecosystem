import type { UserRole } from '@/types/domain';

// ============================================================================
// Types
// ============================================================================

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  description?: string;
  role?: UserRole | UserRole[];
  children?: NavItem[];
  badge?: string;
  external?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

// ============================================================================
// Public Navigation (Marketing Site) - (public)/*
// ============================================================================

export const MAIN_NAV: NavItem[] = [
  {
    label: 'Products',
    href: '/products',
    children: [
      { label: 'LXP360', href: '/products/lxp360', description: 'Learning Experience Platform' },
      {
        label: 'INSPIRE Studio',
        href: '/products/inspire-studio',
        description: 'Content Authoring Tool',
      },
      { label: 'LXD Nexus', href: '/products/lxd-nexus', description: 'Professional Community' },
      { label: 'Ecosystem', href: '/products/ecosystem', description: 'Complete Solution' },
    ],
  },
  {
    label: 'Solutions',
    href: '/industries',
    children: [
      { label: 'Healthcare', href: '/industries/healthcare' },
      { label: 'Aerospace', href: '/industries/aerospace' },
      { label: 'Manufacturing', href: '/industries/manufacturing' },
      { label: 'Defense', href: '/industries/defense' },
      { label: 'Enterprise', href: '/industries/enterprise' },
      { label: 'Government', href: '/industries/government' },
    ],
  },
  {
    label: 'Platform',
    href: '/platform',
    children: [
      { label: 'Overview', href: '/platform' },
      { label: 'Features', href: '/features' },
      { label: 'INSPIRE Framework', href: '/platform/inspire' },
      { label: 'Analytics', href: '/platform/analytics' },
      { label: 'Integrations', href: '/platform/integrations' },
    ],
  },
  {
    label: 'Resources',
    href: '/resources',
    children: [
      { label: 'Resource Center', href: '/resources' },
      { label: 'Case Studies', href: '/resources/case-studies' },
      { label: 'Webinars', href: '/resources/webinars' },
      { label: 'Blog', href: '/blog' },
      { label: 'Help Center', href: '/help' },
    ],
  },
  { label: 'Pricing', href: '/pricing' },
  {
    label: 'Company',
    href: '/about',
    children: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Partners', href: '/partners' },
      { label: 'Contact', href: '/contact' },
    ],
  },
];

export const MAIN_NAV_CTA: NavItem[] = [
  { label: 'Sign In', href: '/auth/login' },
  { label: 'Get Demo', href: '/demo' },
];

// ============================================================================
// Internal Navigation (LXD360 Staff) - Archived [LXD-316]
// ============================================================================
// Command Center has been replaced by GCP Console

export const INTERNAL_NAV: NavItem[] = [];

// ============================================================================
// Tenant Navigation (Customer Organizations) - (tenant)/*
// ============================================================================

export const TENANT_NAV: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    label: 'Organization',
    href: '/org-admin',
    icon: 'Briefcase',
    role: ['client_admin', 'team_admin'],
    children: [
      { label: 'Overview', href: '/org-admin' },
      { label: 'Users', href: '/org-admin/users' },
      { label: 'Billing', href: '/org-admin/billing' },
      { label: 'Branding', href: '/org-admin/branding' },
      { label: 'Reports', href: '/org-admin/reports' },
      { label: 'Settings', href: '/org-admin/settings' },
    ],
  },
];

// ============================================================================
// LXP360 Navigation (Learner/Instructor) - (tenant)/lxp360/*
// ============================================================================

export const LXP360_NAV: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/lxp360',
    icon: 'LayoutDashboard',
  },
  {
    label: 'Learner',
    href: '/lxp360/learner',
    icon: 'GraduationCap',
  },
];

// ============================================================================
// INSPIRE Studio Navigation - (tenant)/inspire-studio/*
// ============================================================================

export const INSPIRE_STUDIO_NAV: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/inspire-studio',
    icon: 'LayoutDashboard',
  },
  {
    label: 'Projects',
    href: '/inspire-studio/projects',
    icon: 'FolderOpen',
  },
  {
    label: 'INSPIRE Workflow',
    href: '/inspire-studio/inspire',
    icon: 'Lightbulb',
  },
  {
    label: 'Course Builder',
    href: '/inspire-studio/course-builder',
    icon: 'Edit3',
  },
  {
    label: 'AI Micro-Learning',
    href: '/inspire-studio/ai-micro-learning',
    icon: 'Layout',
  },
  {
    label: 'AI Studio',
    href: '/inspire-studio/ai-studio',
    icon: 'Sparkles',
  },
  {
    label: 'Lesson Editor',
    href: '/inspire-studio/lesson',
    icon: 'FileEdit',
  },
  {
    label: 'Review',
    href: '/inspire-studio/review',
    icon: 'CheckCircle',
  },
  {
    label: 'Settings',
    href: '/inspire-studio/settings',
    icon: 'Settings',
  },
];

// ============================================================================
// Ecosystem Navigation - (tenant)/ecosystem/*
// ============================================================================

export const ECOSYSTEM_NAV: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/ecosystem',
    icon: 'LayoutDashboard',
  },
  {
    label: 'LMS',
    href: '/ecosystem/lms',
    icon: 'BookOpen',
  },
  {
    label: 'LRS',
    href: '/ecosystem/lrs',
    icon: 'Database',
  },
  {
    label: 'Authoring',
    href: '/ecosystem/authoring',
    icon: 'Edit3',
  },
  {
    label: 'Admin',
    href: '/ecosystem/admin',
    icon: 'Settings',
    role: 'lms_admin',
  },
  {
    label: 'Reports',
    href: '/ecosystem/reports',
    icon: 'BarChart2',
    role: 'client_course_admin',
  },
  {
    label: 'Settings',
    href: '/ecosystem/settings',
    icon: 'Settings',
  },
];

// ============================================================================
// Nexus Navigation (Community) - (community)/nexus/*
// ============================================================================

export const NEXUS_NAV: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/nexus',
    icon: 'LayoutDashboard',
  },
  {
    label: 'Feed',
    href: '/nexus/feed',
    icon: 'Activity',
  },
  {
    label: 'Community',
    href: '/nexus/community',
    icon: 'Users',
  },
  {
    label: 'Members',
    href: '/nexus/members',
    icon: 'Users',
  },
  {
    label: 'Mentorship',
    href: '/nexus/mentorship',
    icon: 'GraduationCap',
    children: [
      { label: 'Overview', href: '/nexus/mentorship' },
      { label: 'Find Mentor', href: '/nexus/mentorship/find-mentor' },
      { label: 'Find Mentee', href: '/nexus/mentorship/find-mentee' },
      { label: 'Sessions', href: '/nexus/mentorship/sessions' },
      { label: 'Progress', href: '/nexus/mentorship/progress' },
    ],
  },
  {
    label: 'Portfolio',
    href: '/nexus/portfolio',
    icon: 'Briefcase',
    children: [
      { label: 'Builder', href: '/nexus/portfolio/builder' },
      { label: 'Preview', href: '/nexus/portfolio/preview' },
      { label: 'Publish', href: '/nexus/portfolio/publish' },
    ],
  },
  {
    label: 'Bootcamp',
    href: '/nexus/bootcamp',
    icon: 'Rocket',
    children: [
      { label: 'Curriculum', href: '/nexus/bootcamp/curriculum' },
      { label: 'Assignments', href: '/nexus/bootcamp/assignments' },
      { label: 'Graduation', href: '/nexus/bootcamp/graduation' },
    ],
  },
  {
    label: 'Messages',
    href: '/nexus/messages',
    icon: 'Mail',
  },
  {
    label: 'Profile',
    href: '/nexus/profile',
    icon: 'User',
  },
  {
    label: 'Settings',
    href: '/nexus/settings',
    icon: 'Settings',
  },
];

// ============================================================================
// VIP Navigation - (community)/vip/*
// ============================================================================

export const VIP_NAV: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/vip',
    icon: 'Star',
  },
  {
    label: 'Demo',
    href: '/vip/demo',
    icon: 'Play',
    children: [
      { label: 'LXP360', href: '/vip/demo/lxp360' },
      { label: 'INSPIRE Studio', href: '/vip/demo/inspire-studio' },
      { label: 'AR Showcase', href: '/vip/demo/ar-showcase' },
    ],
  },
  {
    label: 'Schedule',
    href: '/vip/schedule',
    icon: 'Calendar',
  },
  {
    label: 'Resources',
    href: '/vip/resources',
    icon: 'FileText',
  },
  {
    label: 'Convert',
    href: '/vip/convert',
    icon: 'ArrowRight',
  },
];

// ============================================================================
// Footer Navigation
// ============================================================================

export const FOOTER_NAV: NavSection[] = [
  {
    title: 'Products',
    items: [
      { label: 'LXP360', href: '/products/lxp360' },
      { label: 'INSPIRE Studio', href: '/products/inspire-studio' },
      { label: 'LXD Nexus', href: '/products/lxd-nexus' },
      { label: 'Ecosystem', href: '/products/ecosystem' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'Solutions',
    items: [
      { label: 'Healthcare', href: '/industries/healthcare' },
      { label: 'Enterprise', href: '/industries/enterprise' },
      { label: 'Government', href: '/industries/government' },
      { label: 'Use Cases', href: '/use-cases' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { label: 'Blog', href: '/blog' },
      { label: 'Case Studies', href: '/resources/case-studies' },
      { label: 'Help Center', href: '/help' },
      { label: 'Support', href: '/support' },
      { label: 'Status', href: '/status' },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'About', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
      { label: 'Partners', href: '/partners' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Security', href: '/security' },
      { label: 'Compliance', href: '/compliance' },
    ],
  },
];

// ============================================================================
// Role-based Dashboard Routes
// ============================================================================

/**
 * Maps user roles to their default dashboard route
 * Used for /dashboard redirect logic
 */
export const ROLE_DASHBOARD_ROUTES: Record<string, string> = {
  // LXD360 Internal Staff (Command Center archived - use GCP Console)
  super_admin: '/dashboard',
  admin_lxd360: '/dashboard',
  sales_lxd360: '/dashboard',
  finance_lxd360: '/dashboard',
  saas_engineer_lxd360: '/dashboard',
  legal_federal_lxd360: '/dashboard',
  legal_private_lxd360: '/dashboard',
  it_compliance_lxd360: '/dashboard',
  moderator_lxd360: '/nexus',

  // Tenant Admins
  org_admin: '/org-admin',
  admin: '/org-admin',
  program_admin: '/org-admin',

  // Product Users
  manager: '/lxp360/learner',
  instructor: '/lxp360/learner',
  learner: '/lxp360/learner',
  designer: '/inspire-studio',

  // Community
  mentor: '/nexus',
  mentee: '/nexus',

  // VIP
  vip_prospect: '/vip',
  vip_converted: '/vip',

  // Default
  user: '/lxp360/learner',
  subscriber: '/lxp360/learner',
  guest: '/',
};

/**
 * Get the dashboard route for a given role
 */
export function getDashboardRoute(role: string): string {
  return ROLE_DASHBOARD_ROUTES[role] || '/lxp360/learner';
}
