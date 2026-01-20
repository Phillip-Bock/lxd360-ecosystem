'use client';

import type { LucideIcon } from 'lucide-react';
import { Briefcase, Crown, GraduationCap, Shield, User, UserCheck, Users } from 'lucide-react';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRole } from '@/hooks/use-rbac';
import { getAllRoles } from '@/lib/rbac/roles';
import type { Role, RoleName } from '@/lib/rbac/types';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface RoleHierarchyTreeProps {
  /** Highlight a specific role (defaults to current user's role) */
  highlightRole?: RoleName;
  /** Whether to show role descriptions */
  showDescriptions?: boolean;
  /** Whether to show permission counts */
  showPermissionCounts?: boolean;
  /** Whether to show in horizontal layout */
  horizontal?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Callback when a role is clicked */
  onRoleClick?: (role: RoleName) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Icons for each role
 */
const ROLE_ICONS: Record<RoleName, LucideIcon> = {
  super_admin: Crown,
  org_admin: Shield,
  admin: Shield,
  manager: Briefcase,
  instructor: GraduationCap,
  mentor: UserCheck,
  learner: GraduationCap,
  mentee: User,
  subscriber: Users,
  user: User,
  guest: User,
};

/**
 * Colors for role levels
 */
function getRoleLevelColors(level: number): { bg: string; text: string; border: string } {
  if (level >= 80) {
    return {
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      border: 'border-red-500/30',
    };
  }
  if (level >= 50) {
    return {
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-400',
      border: 'border-yellow-500/30',
    };
  }
  if (level >= 30) {
    return {
      bg: 'bg-green-500/10',
      text: 'text-green-400',
      border: 'border-green-500/30',
    };
  }
  return {
    bg: 'bg-gray-500/10',
    text: 'text-gray-400',
    border: 'border-gray-500/30',
  };
}

/**
 * Get the category label for a role level
 */
function getRoleCategory(level: number): string {
  if (level >= 80) return 'Platform Administration';
  if (level >= 50) return 'Organization & Teaching';
  if (level >= 30) return 'Learning & Mentorship';
  return 'Access Levels';
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface RoleNodeProps {
  role: Role;
  isCurrentRole: boolean;
  isHighlighted: boolean;
  showDescription: boolean;
  showPermissionCount: boolean;
  compact: boolean;
  onClick?: () => void;
}

function RoleNode({
  role,
  isCurrentRole,
  isHighlighted,
  showDescription,
  showPermissionCount,
  compact,
  onClick,
}: RoleNodeProps): React.JSX.Element {
  const Icon = ROLE_ICONS[role.name];
  const colors = getRoleLevelColors(role.level);

  const isClickable = !!onClick;

  const containerClassName = cn(
    'relative flex items-start gap-3 p-3 rounded-lg border transition-all text-left w-full',
    colors.border,
    isHighlighted && 'ring-2 ring-lxd-primary ring-offset-2 ring-offset-background',
    isCurrentRole && 'bg-lxd-primary/10 border-lxd-primary',
    !isHighlighted && !isCurrentRole && colors.bg,
    isClickable && 'cursor-pointer hover:border-lxd-primary/50',
  );

  const content = (
    <>
      {/* Level Indicator */}
      <div
        className={cn(
          'flex items-center justify-center size-10 rounded-lg shrink-0',
          isCurrentRole ? 'bg-lxd-primary/20' : colors.bg,
        )}
      >
        <Icon
          className={cn('size-5', isCurrentRole ? 'text-lxd-primary' : colors.text)}
          aria-hidden="true"
        />
      </div>

      {/* Role Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn('font-medium', compact && 'text-sm')}>{role.displayName}</span>
          <Badge variant="outline" className={cn('text-xs font-mono', colors.text)}>
            L{role.level}
          </Badge>
          {isCurrentRole && (
            <Badge variant="default" className="text-xs">
              You
            </Badge>
          )}
        </div>

        {!compact && showDescription && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{role.description}</p>
        )}

        {showPermissionCount && (
          <p className="text-xs text-muted-foreground mt-1">
            {role.permissions.length} permissions
          </p>
        )}
      </div>
    </>
  );

  if (isClickable) {
    return (
      <button
        type="button"
        className={containerClassName}
        onClick={onClick}
        aria-label={`Select ${role.displayName} role, level ${role.level}`}
      >
        {content}
      </button>
    );
  }

  return <div className={containerClassName}>{content}</div>;
}

interface CategoryGroupProps {
  category: string;
  roles: Role[];
  currentRole: RoleName;
  highlightRole?: RoleName;
  showDescriptions: boolean;
  showPermissionCounts: boolean;
  compact: boolean;
  onRoleClick?: (role: RoleName) => void;
}

function CategoryGroup({
  category,
  roles,
  currentRole,
  highlightRole,
  showDescriptions,
  showPermissionCounts,
  compact,
  onRoleClick,
}: CategoryGroupProps): React.JSX.Element {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground px-1">{category}</h3>
      <div className={cn('space-y-2', compact && 'space-y-1')}>
        {roles.map((role) => (
          <RoleNode
            key={role.name}
            role={role}
            isCurrentRole={role.name === currentRole}
            isHighlighted={role.name === highlightRole}
            showDescription={showDescriptions}
            showPermissionCount={showPermissionCounts}
            compact={compact}
            onClick={onRoleClick ? () => onRoleClick(role.name) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * RoleHierarchyTree - Visual display of the role hierarchy
 *
 * @example Basic usage
 * ```tsx
 * <RoleHierarchyTree />
 * ```
 *
 * @example With descriptions and clickable roles
 * ```tsx
 * <RoleHierarchyTree
 *   showDescriptions
 *   showPermissionCounts
 *   onRoleClick={(role) => handleRoleClick(role)}
 * />
 * ```
 *
 * @example Compact horizontal layout
 * ```tsx
 * <RoleHierarchyTree
 *   compact
 *   horizontal
 * />
 * ```
 */
export function RoleHierarchyTree({
  highlightRole,
  showDescriptions = false,
  showPermissionCounts = false,
  horizontal = false,
  compact = false,
  className,
  onRoleClick,
}: RoleHierarchyTreeProps): React.JSX.Element {
  const { role: currentUserRole, loading } = useRole();

  // Get all roles sorted by level (highest first)
  const allRoles = useMemo(() => {
    return getAllRoles().sort((a, b) => b.level - a.level);
  }, []);

  // Group roles by category
  const rolesByCategory = useMemo(() => {
    const categories = new Map<string, Role[]>();

    for (const role of allRoles) {
      const category = getRoleCategory(role.level);
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)?.push(role);
    }

    return categories;
  }, [allRoles]);

  // Determine which role to highlight
  const effectiveHighlightRole = highlightRole ?? (loading ? undefined : currentUserRole);

  if (horizontal) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-5 text-lxd-primary" aria-hidden="true" />
            Role Hierarchy
          </CardTitle>
          <CardDescription>
            Visual representation of the 11-role permission hierarchy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {allRoles.map((role, index) => (
              <div key={role.name} className="flex items-center gap-2 shrink-0">
                <RoleNode
                  role={role}
                  isCurrentRole={role.name === currentUserRole}
                  isHighlighted={role.name === effectiveHighlightRole}
                  showDescription={false}
                  showPermissionCount={showPermissionCounts}
                  compact
                  onClick={onRoleClick ? () => onRoleClick(role.name) : undefined}
                />
                {index < allRoles.length - 1 && (
                  <div className="w-8 h-0.5 bg-border shrink-0" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Shield className="size-5 text-lxd-primary" aria-hidden="true" />
          Role Hierarchy
        </CardTitle>
        <CardDescription>
          The 11-role permission hierarchy from highest to lowest access
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={cn('space-y-6', compact && 'space-y-4')}>
          {Array.from(rolesByCategory.entries()).map(([category, roles]) => (
            <CategoryGroup
              key={category}
              category={category}
              roles={roles}
              currentRole={currentUserRole}
              highlightRole={effectiveHighlightRole}
              showDescriptions={showDescriptions}
              showPermissionCounts={showPermissionCounts}
              compact={compact}
              onRoleClick={onRoleClick}
            />
          ))}
        </div>

        {/* Level Scale */}
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-sm font-medium mb-3">Level Scale</p>
          <div className="relative h-4 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-linear-to-r from-gray-500 via-green-500 via-yellow-500 to-red-500"
              style={{ width: '100%' }}
            />
            {/* Current user indicator */}
            {!loading && (
              <span
                role="img"
                aria-label={`Your level: ${allRoles.find((r) => r.name === currentUserRole)?.level ?? 0}`}
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-lxd-primary rounded-full shadow-sm"
                style={{ left: `${allRoles.find((r) => r.name === currentUserRole)?.level ?? 0}%` }}
              />
            )}
          </div>
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>0 (Guest)</span>
            <span>50 (Instructor)</span>
            <span>100 (Super Admin)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RoleHierarchyTree;
