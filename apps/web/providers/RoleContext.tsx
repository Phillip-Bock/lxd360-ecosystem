'use client';

import { onIdTokenChanged, type User } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { requireAuth, requireDb } from '@/lib/firebase/client';
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

// ============================================================================
// Firebase Custom Claims Interface
// ============================================================================
interface FirebaseCustomClaims {
  role?: UserRole;
  tenantId?: string;
  permissions?: string[];
}

// ============================================================================
// Context Types
// ============================================================================
interface RoleContextType {
  user: User | null;
  userProfile: UserProfile | null;
  tenant: Tenant | null;
  tenantFeatures: TenantFeatures | null;
  selectedRole: UserRole | null;
  availableRoles: UserRole[];
  roleCategory: RoleCategory | null;
  loading: boolean;
  isAuthenticated: boolean;
  tenantId: string | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenantFeatures, setTenantFeatures] = useState<TenantFeatures | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // All 22 roles organized by category
  const availableRoles: UserRole[] = Object.keys(ROLE_CONFIG) as UserRole[];

  // Derived state
  const isAuthenticated = user !== null;

  // Get the current role's category
  const roleCategory = useMemo<RoleCategory | null>(() => {
    if (!selectedRole) return null;
    return ROLE_CONFIG[selectedRole]?.category || null;
  }, [selectedRole]);

  // Helper to get role config
  const getRoleConfig = useCallback((role: UserRole): RoleConfig => {
    return ROLE_CONFIG[role];
  }, []);

  // Load user profile from Firestore
  const loadUserProfile = useCallback(
    async (uid: string, userTenantId: string) => {
      try {
        const db = requireDb();
        const learnerRef = doc(db, 'tenants', userTenantId, 'learners', uid);
        const learnerDoc = await getDoc(learnerRef);

        if (learnerDoc.exists()) {
          const data = learnerDoc.data();
          const profile: UserProfile = {
            id: uid,
            tenant_id: userTenantId,
            email: data.email || '',
            full_name: data.displayName || '',
            avatar_url: data.avatarUrl,
            role: data.role || 'learner',
            department: data.department,
            job_title: data.jobTitle,
            employee_id: data.employeeId,
            status: data.status || 'active',
            last_login_at: data.lastActiveAt?.toDate?.()?.toISOString(),
            created_at: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            updated_at: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          };
          setUserProfile(profile);

          // Set selected role from profile if not already set
          if (profile.role && !selectedRole) {
            setSelectedRole(profile.role);
            localStorage.setItem('selectedRole', profile.role);
          }

          logger.info('User profile loaded', { uid, role: profile.role });
        } else {
          logger.warn('User profile not found in Firestore', { uid, tenantId: userTenantId });
        }
      } catch (error) {
        logger.error('Failed to load user profile', { uid, error });
      }
    },
    [selectedRole],
  );

  // Load tenant data from Firestore
  const loadTenant = useCallback(async (loadTenantId: string) => {
    try {
      const db = requireDb();
      const tenantRef = doc(db, 'tenants', loadTenantId);
      const tenantDoc = await getDoc(tenantRef);

      if (tenantDoc.exists()) {
        const data = tenantDoc.data();
        const tenantData: Tenant = {
          id: loadTenantId,
          name: data.name || '',
          subdomain: data.slug || '',
          subscription_tier: data.subscriptionTier || 'free',
          status: data.isActive ? 'active' : 'inactive',
          logo_url: data.branding?.logoUrl,
          primary_color: data.branding?.primaryColor || '#0072f5',
          secondary_color: data.branding?.secondaryColor || '#0072f5',
          platform_name: data.name || 'LXP360',
          user_limit: data.maxUsers || 10,
          storage_limit_gb: 100,
        };
        setTenant(tenantData);

        // Load tenant features
        if (data.features) {
          const features: TenantFeatures = {
            tenant_id: loadTenantId,
            has_content_authoring: true,
            has_advanced_analytics: data.features.adaptiveLearning ?? true,
            has_api_access: true,
            has_sso: false,
            has_white_label: false,
            has_gamification: true,
            has_mobile_app: false,
            has_scorm_support: true,
            has_xapi_tracking: true,
            has_certifications: true,
            max_courses: 100,
            max_content_items: 1000,
          };
          setTenantFeatures(features);
        }

        logger.info('Tenant loaded', { tenantId: loadTenantId, name: tenantData.name });
      } else {
        logger.warn('Tenant not found in Firestore', { tenantId: loadTenantId });
      }
    } catch (error) {
      logger.error('Failed to load tenant', { tenantId: loadTenantId, error });
    }
  }, []);

  // Set up Firebase Auth listener
  useEffect(() => {
    const auth = requireAuth();

    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Get ID token result to access custom claims
          const idTokenResult = await firebaseUser.getIdTokenResult();
          const claims = idTokenResult.claims as FirebaseCustomClaims;

          logger.info('User authenticated', {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: claims.role,
            tenantId: claims.tenantId,
          });

          // Extract role and tenantId from custom claims
          const userRole = claims.role as UserRole | undefined;
          const userTenantId = claims.tenantId;

          if (userRole) {
            setSelectedRole(userRole);
            localStorage.setItem('selectedRole', userRole);
          }

          if (userTenantId) {
            setTenantId(userTenantId);
            // Load tenant and user profile data
            await Promise.all([
              loadTenant(userTenantId),
              loadUserProfile(firebaseUser.uid, userTenantId),
            ]);
          } else {
            logger.warn('User has no tenantId in claims', { uid: firebaseUser.uid });
          }
        } catch (error) {
          logger.error('Failed to process user claims', { error });
        }
      } else {
        // User signed out - reset state
        setUserProfile(null);
        setTenant(null);
        setTenantFeatures(null);
        setTenantId(null);

        // In development, maintain the selected role from localStorage
        const savedRole = localStorage.getItem('selectedRole');
        if (savedRole && availableRoles.includes(savedRole as UserRole)) {
          setSelectedRole(savedRole as UserRole);
        } else {
          setSelectedRole('designer');
          localStorage.setItem('selectedRole', 'designer');
        }

        // Set development tenant for unauthenticated users
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
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [availableRoles, loadTenant, loadUserProfile]);

  // Subscribe to real-time profile updates when authenticated
  useEffect(() => {
    if (!user || !tenantId) return;

    const db = requireDb();
    const learnerRef = doc(db, 'tenants', tenantId, 'learners', user.uid);

    const unsubscribe = onSnapshot(
      learnerRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setUserProfile((prev) => ({
            ...prev,
            id: user.uid,
            tenant_id: tenantId,
            email: data.email || prev?.email || '',
            full_name: data.displayName || prev?.full_name || '',
            avatar_url: data.avatarUrl,
            role: data.role || prev?.role || 'learner',
            department: data.department,
            job_title: data.jobTitle,
            employee_id: data.employeeId,
            status: data.status || 'active',
            last_login_at: data.lastActiveAt?.toDate?.()?.toISOString(),
            created_at:
              data.createdAt?.toDate?.()?.toISOString() ||
              prev?.created_at ||
              new Date().toISOString(),
            updated_at: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          }));

          // Update role if changed
          if (data.role && data.role !== selectedRole) {
            setSelectedRole(data.role);
            localStorage.setItem('selectedRole', data.role);
          }
        }
      },
      (error) => {
        logger.error('Firestore profile subscription error', { error });
      },
    );

    return () => unsubscribe();
  }, [user, tenantId, selectedRole]);

  const refreshProfile = async () => {
    if (user && tenantId) {
      await loadUserProfile(user.uid, tenantId);
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
        isAuthenticated,
        tenantId,
        selectRole,
        refreshProfile,
        getRoleConfig,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};
