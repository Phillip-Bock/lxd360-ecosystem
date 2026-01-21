'use client';

import { Shield } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRole } from '@/hooks/use-rbac';
import { canAssignRole, getAllRoles } from '@/lib/rbac/roles';
import type { Role, RoleName } from '@/lib/rbac/types';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface RoleSelectorProps {
  /** Currently selected role */
  value?: RoleName;
  /** Callback when role selection changes */
  onValueChange: (role: RoleName) => void;
  /** Placeholder text when no role is selected */
  placeholder?: string;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show role levels */
  showLevels?: boolean;
  /** Whether to show role descriptions as tooltips */
  showDescriptions?: boolean;
  /** Filter to only show certain role categories */
  filter?: 'all' | 'admin' | 'learner' | 'assignable';
  /** Size variant */
  size?: 'sm' | 'default';
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the appropriate badge color based on role level
 */
function getRoleLevelColor(level: number): string {
  if (level >= 80) return 'text-red-400';
  if (level >= 50) return 'text-yellow-400';
  if (level >= 30) return 'text-green-400';
  return 'text-gray-400';
}

/**
 * Group roles by category for better organization
 */
function groupRoles(roles: Role[]): Map<string, Role[]> {
  const groups = new Map<string, Role[]>();

  groups.set(
    'Platform',
    roles.filter((r) => r.level >= 80),
  );
  groups.set(
    'Organization',
    roles.filter((r) => r.level >= 50 && r.level < 80),
  );
  groups.set(
    'Learning',
    roles.filter((r) => r.level >= 35 && r.level < 50),
  );
  groups.set(
    'Access',
    roles.filter((r) => r.level < 35),
  );

  return groups;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * RoleSelector - Dropdown for choosing a role
 *
 * @example Basic usage
 * ```tsx
 * <RoleSelector
 *   value={selectedRole}
 *   onValueChange={setSelectedRole}
 * />
 * ```
 *
 * @example With filtering
 * ```tsx
 * <RoleSelector
 *   value={role}
 *   onValueChange={setRole}
 *   filter="assignable"
 *   showLevels
 * />
 * ```
 */
export function RoleSelector({
  value,
  onValueChange,
  placeholder = 'Select a role',
  disabled = false,
  className,
  showLevels = true,
  filter = 'all',
  size = 'default',
}: RoleSelectorProps): React.JSX.Element {
  const { role: currentUserRole, loading } = useRole();

  // Get all roles and filter based on prop
  const filteredRoles = useMemo(() => {
    let roles = getAllRoles();

    switch (filter) {
      case 'admin':
        roles = roles.filter((r) => r.level >= 80);
        break;
      case 'learner':
        roles = roles.filter((r) => r.level >= 35 && r.level < 50);
        break;
      case 'assignable':
        roles = roles.filter((r) => canAssignRole(currentUserRole, r.name));
        break;
      default:
        break;
    }

    return roles;
  }, [currentUserRole, filter]);

  // Group roles for display
  const groupedRoles = useMemo(() => groupRoles(filteredRoles), [filteredRoles]);

  // Check if a role can be assigned by current user
  const canSelectRole = useCallback(
    (targetRole: RoleName): boolean => {
      if (loading) return false;
      return canAssignRole(currentUserRole, targetRole);
    },
    [currentUserRole, loading],
  );

  // Handle role selection
  const handleValueChange = useCallback(
    (newValue: string) => {
      onValueChange(newValue as RoleName);
    },
    [onValueChange],
  );

  return (
    <Select value={value} onValueChange={handleValueChange} disabled={disabled || loading}>
      <SelectTrigger className={cn('w-full', className)} size={size} aria-label="Select a role">
        <SelectValue placeholder={placeholder}>
          {value && (
            <span className="flex items-center gap-2">
              <Shield className="size-4 text-lxd-primary" aria-hidden="true" />
              <span>{filteredRoles.find((r) => r.name === value)?.displayName ?? value}</span>
              {showLevels && (
                <span
                  className={cn(
                    'text-xs',
                    getRoleLevelColor(filteredRoles.find((r) => r.name === value)?.level ?? 0),
                  )}
                >
                  L{filteredRoles.find((r) => r.name === value)?.level ?? 0}
                </span>
              )}
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Array.from(groupedRoles.entries()).map(([groupName, roles], groupIndex) => {
          if (roles.length === 0) return null;

          return (
            <SelectGroup key={groupName}>
              <SelectLabel className="flex items-center gap-2 text-muted-foreground">
                <span>{groupName}</span>
                <span className="h-px flex-1 bg-border" />
              </SelectLabel>
              {roles.map((role) => {
                const isDisabled = !canSelectRole(role.name);

                return (
                  <SelectItem
                    key={role.name}
                    value={role.name}
                    disabled={isDisabled}
                    className={cn(isDisabled && 'opacity-50 cursor-not-allowed')}
                  >
                    <span className="flex items-center gap-3 w-full">
                      <Shield
                        className={cn('size-4', isDisabled ? 'text-muted' : 'text-lxd-primary')}
                        aria-hidden="true"
                      />
                      <span className="flex-1">{role.displayName}</span>
                      {showLevels && (
                        <span
                          className={cn(
                            'text-xs font-mono tabular-nums',
                            isDisabled ? 'text-muted' : getRoleLevelColor(role.level),
                          )}
                        >
                          L{role.level}
                        </span>
                      )}
                    </span>
                  </SelectItem>
                );
              })}
              {groupIndex < groupedRoles.size - 1 && <SelectSeparator />}
            </SelectGroup>
          );
        })}
      </SelectContent>
    </Select>
  );
}

export default RoleSelector;
