'use client';

// TODO(LXD-301): Replace with Firebase Auth user type
type User = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { logger } from '@/lib/logger';
import type { RoleCategory, Tenant, TenantFeatures, UserProfile, UserRole } from '@/types/domain';

// ============================================================================
// ROLE CONFIGURATION
// ============================================================================
export interface RoleConfig {
  label: string;
  icon: string;
  color: string;
  route: string;
  category: RoleCategory;
  privilegeLevel: number;
}

// Complete role configuration for all 22 roles
export const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
  // LXD360 Company Internal roles
  super_admin: {
    label: 'Super Admin',
    icon: 'Crown',
    color: 'red',
    route: '/dashboard/super-admin',
    category: 'internal',
    privilegeLevel: 1000,
  },
  program_admin: {
    label: 'Program Admin',
    icon: 'Briefcase',
    color: 'purple',
    route: '/dashboard/program-admin',
    category: 'internal',
    privilegeLevel: 950,
  },
  sales: {
    label: 'Sales',
    icon: 'TrendingUp',
    color: 'green',
    route: '/dashboard/sales',
    category: 'internal',
    privilegeLevel: 900,
  },
  designer: {
    label: 'Designer',
    icon: 'Palette',
    color: 'teal',
    route: '/inspire-studio',
    category: 'internal',
    privilegeLevel: 700,
  },
  lms_admin: {
    label: 'LMS Admin',
    icon: 'GraduationCap',
    color: 'indigo',
    route: '/dashboard/lms-admin',
    category: 'internal',
    privilegeLevel: 600,
  },
  instructor: {
    label: 'Instructor',
    icon: 'BookOpen',
    color: 'amber',
    route: '/dashboard/instructor',
    category: 'internal',
    privilegeLevel: 400,
  },
  learner: {
    label: 'Learner',
    icon: 'User',
    color: 'slate',
    route: '/dashboard/learner',
    category: 'internal',
    privilegeLevel: 100,
  },
  // External Team roles
  team_admin: {
    label: 'Team Admin',
    icon: 'Building2',
    color: 'orange',
    route: '/dashboard/team-admin',
    category: 'external_team',
    privilegeLevel: 800,
  },
  team_designer: {
    label: 'Team Designer',
    icon: 'Palette',
    color: 'teal',
    route: '/dashboard/team-designer',
    category: 'external_team',
    privilegeLevel: 700,
  },
  team_lms_admin: {
    label: 'Team LMS Admin',
    icon: 'GraduationCap',
    color: 'indigo',
    route: '/dashboard/team-lms-admin',
    category: 'external_team',
    privilegeLevel: 600,
  },
  team_instructor: {
    label: 'Team Instructor',
    icon: 'BookOpen',
    color: 'amber',
    route: '/dashboard/team-instructor',
    category: 'external_team',
    privilegeLevel: 400,
  },
  team_learner: {
    label: 'Team Learner',
    icon: 'User',
    color: 'slate',
    route: '/dashboard/team-learner',
    category: 'external_team',
    privilegeLevel: 100,
  },
  // External Client roles
  client_admin: {
    label: 'Client Admin',
    icon: 'Building',
    color: 'blue',
    route: '/admin',
    category: 'external_client',
    privilegeLevel: 800,
  },
  client_lms_admin: {
    label: 'Client LMS Admin',
    icon: 'GraduationCap',
    color: 'indigo',
    route: '/dashboard/client-lms-admin',
    category: 'external_client',
    privilegeLevel: 600,
  },
  client_course_admin: {
    label: 'Client Course Admin',
    icon: 'Layers',
    color: 'violet',
    route: '/dashboard/client-course-admin',
    category: 'external_client',
    privilegeLevel: 500,
  },
  client_designer: {
    label: 'Client Designer',
    icon: 'Palette',
    color: 'teal',
    route: '/dashboard/client-designer',
    category: 'external_client',
    privilegeLevel: 700,
  },
  client_instructor: {
    label: 'Client Instructor',
    icon: 'BookOpen',
    color: 'amber',
    route: '/dashboard/client-instructor',
    category: 'external_client',
    privilegeLevel: 400,
  },
  client_learner: {
    label: 'Client Learner',
    icon: 'User',
    color: 'slate',
    route: '/dashboard/client-learner',
    category: 'external_client',
    privilegeLevel: 100,
  },
  // Individual roles
  individual_designer: {
    label: 'Individual Designer',
    icon: 'Palette',
    color: 'teal',
    route: '/dashboard/individual-designer',
    category: 'individual',
    privilegeLevel: 700,
  },
  individual_lms_admin: {
    label: 'Individual LMS Admin',
    icon: 'GraduationCap',
    color: 'indigo',
    route: '/dashboard/individual-lms-admin',
    category: 'individual',
    privilegeLevel: 600,
  },
  individual_instructor: {
    label: 'Individual Instructor',
    icon: 'BookOpen',
    color: 'amber',
    route: '/dashboard/individual-instructor',
    category: 'individual',
    privilegeLevel: 400,
  },
  individual_learner: {
    label: 'Individual Learner',
    icon: 'User',
    color: 'slate',
    route: '/dashboard/individual-learner',
    category: 'individual',
    privilegeLevel: 100,
  },
};

// Category labels for display
export const ROLE_CATEGORY_LABELS: Record<RoleCategory, string> = {
  internal: 'LXD360 Company Internal',
  external_team: 'External Team',
  external_client: 'External Company Clients',
  individual: 'Individual Contributors',
};

// Get roles by category
export const getRolesByCategory = (category: RoleCategory): UserRole[] => {
  return (Object.entries(ROLE_CONFIG) as [UserRole, RoleConfig][])
    .filter(([, config]) => config.category === category)
    .sort((a, b) => b[1].privilegeLevel - a[1].privilegeLevel)
    .map(([role]) => role);
};

// Get all categories with their roles
export const getAllRoleCategories = (): {
  category: RoleCategory;
  label: string;
  roles: UserRole[];
}[] => {
  return [
    {
      category: 'internal',
      label: ROLE_CATEGORY_LABELS.internal,
      roles: getRolesByCategory('internal'),
    },
    {
      category: 'external_team',
      label: ROLE_CATEGORY_LABELS.external_team,
      roles: getRolesByCategory('external_team'),
    },
    {
      category: 'external_client',
      label: ROLE_CATEGORY_LABELS.external_client,
      roles: getRolesByCategory('external_client'),
    },
    {
      category: 'individual',
      label: ROLE_CATEGORY_LABELS.individual,
      roles: getRolesByCategory('individual'),
    },
  ];
};

interface RoleContextType {
  user: User | null;
  userProfile: UserProfile | null;
  tenant: Tenant | null;
  tenantFeatures: TenantFeatures | null;
  selectedRole: UserRole | null;
  availableRoles: UserRole[];
  roleCategory: RoleCategory | null;
  loading: boolean;
  selectRole: (role: UserRole) => void;
  refreshProfile: () => Promise<void>;
  getRoleConfig: (role: UserRole) => RoleConfig;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

interface RoleProviderProps {
  children: ReactNode;
}

export const RoleProvider = ({ children }: RoleProviderProps) => {
  const [user, _setUser] = useState<User | null>(null);
  const [userProfile, _setUserProfile] = useState<UserProfile | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  // TODO(LXD-301): setTenantFeatures will be used after Firestore migration
  const [tenantFeatures, _setTenantFeatures] = useState<TenantFeatures | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // All 22 roles organized by category
  const availableRoles: UserRole[] = Object.keys(ROLE_CONFIG) as UserRole[];

  // Get the current role's category
  const roleCategory = useMemo<RoleCategory | null>(() => {
    if (!selectedRole) return null;
    return ROLE_CONFIG[selectedRole]?.category || null;
  }, [selectedRole]);

  // Helper to get role config
  const getRoleConfig = useCallback((role: UserRole): RoleConfig => {
    return ROLE_CONFIG[role];
  }, []);

  // TODO(LXD-301): Implement Firestore profile loading
  const loadUserProfile = useCallback(async (_userId: string) => {
    logger.info('loadUserProfile temporarily disabled during Firebase migration');
  }, []);

  // TODO(LXD-301): Implement Firebase Auth session check
  const checkAuth = useCallback(async () => {
    try {
      // DEVELOPMENT MODE: Set mock tenant data when not authenticated
      setTenant({
        id: 'dev-tenant',
        name: 'Development Organization',
        subdomain: 'dev',
        subscription_tier: 'enterprise',
        status: 'active',
        logo_url: '',
        primary_color: 'var(--brand-primary)',
        secondary_color: 'var(--brand-secondary)',
        platform_name: 'LXP360',
        user_limit: 1000,
        storage_limit_gb: 100,
      });
    } catch (error) {
      logger.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load saved role from localStorage
    const savedRole = localStorage.getItem('selectedRole');
    if (savedRole && availableRoles.includes(savedRole as UserRole)) {
      setSelectedRole(savedRole as UserRole);
    } else {
      // DEVELOPMENT MODE: Default to 'designer' role if no role selected (replaces 'lxd')
      setSelectedRole('designer');
      localStorage.setItem('selectedRole', 'designer');
    }

    // Check initial auth state
    checkAuth();

    // TODO(LXD-301): Implement Firebase onAuthStateChanged listener
  }, [availableRoles, checkAuth]);

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  const selectRole = (role: UserRole) => {
    setSelectedRole(role);
    localStorage.setItem('selectedRole', role);
  };

  return (
    <RoleContext.Provider
      value={{
        user,
        userProfile,
        tenant,
        tenantFeatures,
        selectedRole,
        availableRoles,
        roleCategory,
        loading,
        selectRole,
        refreshProfile,
        getRoleConfig,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};
