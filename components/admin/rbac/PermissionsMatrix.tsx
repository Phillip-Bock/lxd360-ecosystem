'use client';

import { Check, Key, Shield, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getAllRoles } from '@/lib/rbac/roles';
import type { Permission, Role, RoleName } from '@/lib/rbac/types';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface PermissionsMatrixProps {
  /** Filter to show only certain permission categories */
  permissionFilter?: 'all' | 'profile' | 'courses' | 'users' | 'org' | 'platform' | 'content';
  /** Filter to show only certain role categories */
  roleFilter?: 'all' | 'admin' | 'learning' | 'access';
  /** Whether to show the filter controls */
  showFilters?: boolean;
  /** Highlight a specific role column */
  highlightRole?: RoleName;
  /** Additional CSS classes */
  className?: string;
  /** Compact mode (fewer visible roles) */
  compact?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Permission categories for grouping and filtering
 */
const PERMISSION_CATEGORIES = {
  profile: ['read:own_profile', 'write:own_profile'],
  courses: ['read:courses', 'write:courses', 'publish:courses', 'delete:courses'],
  learners: ['read:learners', 'write:learners', 'enroll:learners'],
  analytics: [
    'read:analytics',
    'read:analytics:personal',
    'read:analytics:team',
    'read:analytics:org',
    'read:analytics:platform',
    'export:analytics',
  ],
  users: ['manage:users', 'manage:roles', 'invite:users'],
  org: ['manage:org', 'manage:org:settings', 'manage:org:billing', 'manage:org:branding'],
  platform: ['manage:platform', 'manage:tenants'],
  content: ['create:content', 'review:content', 'approve:content'],
  mentorship: ['mentor:assign', 'mentor:sessions'],
  assessments: ['take:assessments', 'grade:assessments', 'create:assessments'],
} as const;

/**
 * Get category for a permission
 */
function getPermissionCategory(permission: Permission): string {
  for (const [category, permissions] of Object.entries(PERMISSION_CATEGORIES)) {
    if ((permissions as readonly string[]).includes(permission)) {
      return category;
    }
  }
  return 'other';
}

/**
 * Get all unique permissions from all roles
 */
function getAllPermissions(): Permission[] {
  const permissionSet = new Set<Permission>();
  const allRoles = getAllRoles();

  for (const role of allRoles) {
    for (const permission of role.permissions) {
      permissionSet.add(permission);
    }
  }

  return Array.from(permissionSet).sort((a, b) => {
    const catA = getPermissionCategory(a);
    const catB = getPermissionCategory(b);
    if (catA !== catB) return catA.localeCompare(catB);
    return a.localeCompare(b);
  });
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface PermissionCellProps {
  hasPermission: boolean;
  isHighlighted: boolean;
}

function PermissionCell({ hasPermission, isHighlighted }: PermissionCellProps): React.JSX.Element {
  return (
    <TableCell
      className={cn(
        'text-center',
        isHighlighted && 'bg-lxd-primary/5',
        hasPermission ? 'text-success' : 'text-muted',
      )}
    >
      {hasPermission ? (
        <Check className="size-4 mx-auto" aria-label="Permission granted" />
      ) : (
        <X className="size-4 mx-auto opacity-30" aria-label="Permission not granted" />
      )}
    </TableCell>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * PermissionsMatrix - Grid showing role→permission mappings
 *
 * @example Basic usage
 * ```tsx
 * <PermissionsMatrix />
 * ```
 *
 * @example With filters and highlighting
 * ```tsx
 * <PermissionsMatrix
 *   showFilters
 *   highlightRole="admin"
 *   permissionFilter="users"
 * />
 * ```
 */
export function PermissionsMatrix({
  permissionFilter: initialPermFilter = 'all',
  roleFilter: initialRoleFilter = 'all',
  showFilters = true,
  highlightRole,
  className,
  compact = false,
}: PermissionsMatrixProps): React.JSX.Element {
  const [permissionFilter, setPermissionFilter] = useState(initialPermFilter);
  const [roleFilter, setRoleFilter] = useState(initialRoleFilter);

  // Get all roles
  const allRoles = useMemo(() => getAllRoles(), []);

  // Filter roles based on category
  const filteredRoles = useMemo(() => {
    let roles = allRoles;

    switch (roleFilter) {
      case 'admin':
        roles = roles.filter((r) => r.level >= 80);
        break;
      case 'learning':
        roles = roles.filter((r) => r.level >= 35 && r.level < 80);
        break;
      case 'access':
        roles = roles.filter((r) => r.level < 35);
        break;
      default:
        break;
    }

    if (compact) {
      // In compact mode, show only key roles
      roles = roles.filter((r) =>
        ['super_admin', 'org_admin', 'admin', 'instructor', 'learner', 'user'].includes(r.name),
      );
    }

    return roles;
  }, [allRoles, roleFilter, compact]);

  // Get all permissions and filter
  const allPermissions = useMemo(() => getAllPermissions(), []);

  const filteredPermissions = useMemo(() => {
    if (permissionFilter === 'all') return allPermissions;

    return allPermissions.filter((p) => {
      const category = getPermissionCategory(p);
      return category === permissionFilter;
    });
  }, [allPermissions, permissionFilter]);

  // Group permissions by category for display
  const groupedPermissions = useMemo(() => {
    const groups = new Map<string, Permission[]>();

    for (const permission of filteredPermissions) {
      const category = getPermissionCategory(permission);
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)?.push(permission);
    }

    return groups;
  }, [filteredPermissions]);

  // Create a lookup for role permissions
  const rolePermissionMap = useMemo(() => {
    const map = new Map<RoleName, Set<Permission>>();

    for (const role of allRoles) {
      map.set(role.name, new Set(role.permissions));
    }

    return map;
  }, [allRoles]);

  // Check if a role has a permission
  const hasPermission = (role: Role, permission: Permission): boolean => {
    return rolePermissionMap.get(role.name)?.has(permission) ?? false;
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="size-5 text-lxd-primary" aria-hidden="true" />
              Permissions Matrix
            </CardTitle>
            <CardDescription className="mt-1">
              Overview of permissions granted to each role
            </CardDescription>
          </div>

          {showFilters && (
            <div className="flex items-center gap-2">
              <Select
                value={permissionFilter}
                onValueChange={(v) => setPermissionFilter(v as typeof permissionFilter)}
              >
                <SelectTrigger className="w-32" aria-label="Filter permissions">
                  <SelectValue placeholder="Permissions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="profile">Profile</SelectItem>
                  <SelectItem value="courses">Courses</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                  <SelectItem value="org">Organization</SelectItem>
                  <SelectItem value="platform">Platform</SelectItem>
                  <SelectItem value="content">Content</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={roleFilter}
                onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}
              >
                <SelectTrigger className="w-28" aria-label="Filter roles">
                  <SelectValue placeholder="Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="access">Access</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48 sticky left-0 bg-card z-10">Permission</TableHead>
                {filteredRoles.map((role) => (
                  <TableHead
                    key={role.name}
                    className={cn(
                      'text-center min-w-20',
                      highlightRole === role.name && 'bg-lxd-primary/10',
                    )}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Shield className="size-4 text-lxd-primary" aria-hidden="true" />
                      <span className="text-xs font-medium truncate max-w-16">
                        {role.displayName.split(' ')[0]}
                      </span>
                      <Badge variant="outline" className="text-[10px] px-1 py-0">
                        L{role.level}
                      </Badge>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {Array.from(groupedPermissions.entries()).map(([category, permissions]) => (
                <>
                  {/* Category Header */}
                  <TableRow key={`category-${category}`} className="bg-muted/30">
                    <TableCell
                      colSpan={filteredRoles.length + 1}
                      className="py-2 font-medium capitalize sticky left-0 bg-muted/30"
                    >
                      {category}
                    </TableCell>
                  </TableRow>

                  {/* Permissions in Category */}
                  {permissions.map((permission) => (
                    <TableRow key={permission}>
                      <TableCell className="font-mono text-xs sticky left-0 bg-card z-10">
                        {permission}
                      </TableCell>
                      {filteredRoles.map((role) => (
                        <PermissionCell
                          key={`${role.name}-${permission}`}
                          hasPermission={hasPermission(role, permission)}
                          isHighlighted={highlightRole === role.name}
                        />
                      ))}
                    </TableRow>
                  ))}
                </>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 p-4 border-t border-border bg-muted/20">
          <div className="flex items-center gap-2 text-sm">
            <Check className="size-4 text-success" aria-hidden="true" />
            <span>Permission granted</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <X className="size-4 opacity-30" aria-hidden="true" />
            <span>Permission not granted</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PermissionsMatrix;
