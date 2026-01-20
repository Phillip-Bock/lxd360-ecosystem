'use client';

import {
  BookOpen,
  Briefcase,
  Building,
  Building2,
  Crown,
  GraduationCap,
  Layers,
  Palette,
  Shield,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAllRoleCategories, ROLE_CONFIG, useRole } from '@/providers/RoleContext';
import type { UserRole } from '@/types/domain';

// Icon mapping for dynamic icon rendering
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Crown,
  Briefcase,
  TrendingUp,
  Shield,
  Building2,
  Building,
  GraduationCap,
  Users,
  Palette,
  BookOpen,
  User,
  Layers,
};

// Color mapping for Tailwind classes
const colorMap: Record<string, string> = {
  red: 'bg-brand-error',
  purple: 'bg-brand-secondary',
  green: 'bg-brand-success',
  teal: 'bg-teal-500',
  indigo: 'bg-indigo-500',
  amber: 'bg-brand-warning',
  slate: 'bg-lxd-light-surface',
  orange: 'bg-brand-warning',
  blue: 'bg-brand-primary',
  violet: 'bg-brand-secondary',
};

// Helper to get icon component
const getIcon = (iconName: string, className?: string) => {
  const IconComponent = iconMap[iconName] || User;
  return <IconComponent className={className || 'w-4 h-4'} />;
};

// Helper to get color class
const getColorClass = (color: string): string => {
  return colorMap[color] || 'bg-lxd-light-surface';
};

interface RoleSwitcherProps {
  variant?: 'default' | 'compact' | 'categorized';
  showBadge?: boolean;
  showCategory?: boolean;
}

export function RoleSwitcher({
  variant = 'default',
  showBadge = true,
  showCategory = false,
}: RoleSwitcherProps) {
  const { selectedRole, selectRole, userProfile, getRoleConfig, roleCategory } = useRole();
  const router = useRouter();

  if (!selectedRole) return null;

  const handleRoleChange = (newRole: string) => {
    const role = newRole as UserRole;
    selectRole(role);

    // Navigate to the appropriate dashboard
    const config = ROLE_CONFIG[role];
    const route = config?.route || '/dashboard';
    router.push(route);
  };

  const currentRoleConfig = getRoleConfig(selectedRole);
  const colorClass = getColorClass(currentRoleConfig.color);

  // Categorized variant - shows roles grouped by category
  if (variant === 'categorized') {
    const categories = getAllRoleCategories();

    return (
      <div className="flex flex-col gap-3 p-4 bg-card border rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`${colorClass} p-2 rounded text-brand-primary`}>
              {getIcon(currentRoleConfig.icon)}
            </div>
            <div>
              <p className="text-sm font-medium">Current Role</p>
              {showCategory && roleCategory && (
                <p className="text-xs text-muted-foreground">{currentRoleConfig.label}</p>
              )}
            </div>
          </div>
          {showBadge && (
            <Badge className={`${colorClass} text-brand-primary`}>{currentRoleConfig.label}</Badge>
          )}
        </div>

        <Select value={selectedRole} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[400px]">
            {categories.map(({ category, label, roles }) => (
              <SelectGroup key={category}>
                <SelectLabel className="text-xs font-semibold uppercase text-muted-foreground px-2 py-1.5">
                  {label}
                </SelectLabel>
                {roles.map((role) => {
                  const config = ROLE_CONFIG[role];
                  const isCurrentRole = role === userProfile?.role;
                  const roleColorClass = getColorClass(config.color);
                  return (
                    <SelectItem key={role} value={role}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <div className={`${roleColorClass} p-1 rounded text-brand-primary`}>
                            {getIcon(config.icon)}
                          </div>
                          <span>{config.label}</span>
                        </div>
                        {isCurrentRole && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Your Role
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>

        <p className="text-xs text-muted-foreground">
          Switch roles to test different dashboard views.
          {userProfile?.role && (
            <>
              {' '}
              Your actual role:{' '}
              <strong>{ROLE_CONFIG[userProfile.role as UserRole]?.label || 'Unknown'}</strong>
            </>
          )}
        </p>
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        {showBadge && (
          <Badge className={`${colorClass} text-brand-primary`}>
            {getIcon(currentRoleConfig.icon)}
            <span className="ml-1">{currentRoleConfig.label}</span>
          </Badge>
        )}
        <Select value={selectedRole} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {getAllRoleCategories().map(({ category, label, roles }) => (
              <SelectGroup key={category}>
                <SelectLabel className="text-xs font-semibold uppercase text-muted-foreground">
                  {label}
                </SelectLabel>
                {roles.map((role) => {
                  const config = ROLE_CONFIG[role];
                  const roleColorClass = getColorClass(config.color);
                  return (
                    <SelectItem key={role} value={role}>
                      <div className="flex items-center gap-2">
                        <div className={`${roleColorClass} p-1 rounded text-brand-primary`}>
                          {getIcon(config.icon)}
                        </div>
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Default variant
  return (
    <div className="flex flex-col gap-3 p-4 bg-card border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`${colorClass} p-2 rounded text-brand-primary`}>
            {getIcon(currentRoleConfig.icon)}
          </div>
          <div>
            <p className="text-sm font-medium">Current Role</p>
            <p className="text-xs text-muted-foreground">{userProfile?.full_name || 'User'}</p>
          </div>
        </div>
        {showBadge && (
          <Badge className={`${colorClass} text-brand-primary`}>{currentRoleConfig.label}</Badge>
        )}
      </div>

      <Select value={selectedRole} onValueChange={handleRoleChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {getAllRoleCategories().map(({ category, label, roles }) => (
            <SelectGroup key={category}>
              <SelectLabel className="text-xs font-semibold uppercase text-muted-foreground">
                {label}
              </SelectLabel>
              {roles.map((role) => {
                const config = ROLE_CONFIG[role];
                const isCurrentRole = role === userProfile?.role;
                const roleColorClass = getColorClass(config.color);
                return (
                  <SelectItem key={role} value={role}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <div className={`${roleColorClass} p-1 rounded text-brand-primary`}>
                          {getIcon(config.icon)}
                        </div>
                        <span>{config.label}</span>
                      </div>
                      {isCurrentRole && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Your Role
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>

      <p className="text-xs text-muted-foreground">
        Switch roles to test different dashboard views.
        {userProfile?.role && (
          <>
            {' '}
            Your actual role:{' '}
            <strong>{ROLE_CONFIG[userProfile.role as UserRole]?.label || 'Unknown'}</strong>
          </>
        )}
      </p>
    </div>
  );
}
