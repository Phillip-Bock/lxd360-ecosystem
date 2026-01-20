'use client';

import { Key, Mail, Settings, Shield } from 'lucide-react';
import { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCanManageRole, useRole } from '@/hooks/use-rbac';
import { getRoleByName, getRolePermissions } from '@/lib/rbac/roles';
import type { RoleName } from '@/lib/rbac/types';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface UserRoleCardProps {
  /** User's unique ID */
  userId: string;
  /** User's display name */
  displayName: string;
  /** User's email address */
  email: string;
  /** User's avatar URL */
  avatarUrl?: string;
  /** User's current role */
  role: RoleName;
  /** Organization name (if applicable) */
  organizationName?: string;
  /** Callback when "Change Role" is clicked */
  onChangeRole?: (userId: string) => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the full permissions list */
  showPermissions?: boolean;
  /** Maximum permissions to show before collapsing */
  maxPermissionsShown?: number;
  /** Compact mode for list views */
  compact?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get initials from a display name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get badge variant based on role level
 */
function getRoleBadgeVariant(level: number): 'default' | 'secondary' | 'success' | 'warning' {
  if (level >= 80) return 'warning';
  if (level >= 50) return 'default';
  if (level >= 30) return 'secondary';
  return 'secondary';
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * UserRoleCard - Display a user's role information
 *
 * @example Basic usage
 * ```tsx
 * <UserRoleCard
 *   userId="user-123"
 *   displayName="John Doe"
 *   email="john@example.com"
 *   role="instructor"
 *   onChangeRole={handleChangeRole}
 * />
 * ```
 *
 * @example Compact mode
 * ```tsx
 * <UserRoleCard
 *   userId="user-123"
 *   displayName="Jane Smith"
 *   email="jane@example.com"
 *   role="admin"
 *   compact
 * />
 * ```
 */
export function UserRoleCard({
  userId,
  displayName,
  email,
  avatarUrl,
  role,
  organizationName,
  onChangeRole,
  className,
  showPermissions = true,
  maxPermissionsShown = 6,
  compact = false,
}: UserRoleCardProps): React.JSX.Element {
  const { loading: roleLoading } = useRole();
  const { canManage, loading: manageLoading } = useCanManageRole(role);

  // Get role details
  const roleDetails = useMemo(() => getRoleByName(role), [role]);
  const permissions = useMemo(() => getRolePermissions(role), [role]);

  // Check if we can change this user's role
  const canChangeRole = !roleLoading && !manageLoading && canManage && onChangeRole;

  // Handle change role click
  const handleChangeRoleClick = () => {
    if (onChangeRole) {
      onChangeRole(userId);
    }
  };

  if (compact) {
    return (
      <div className={cn('flex items-center gap-4 p-4 rounded-lg bg-card/50', className)}>
        <Avatar className="size-10">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
          <AvatarFallback className="bg-lxd-primary/20 text-lxd-primary">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{displayName}</p>
          <p className="text-xs text-muted-foreground truncate">{email}</p>
        </div>

        <Badge variant={getRoleBadgeVariant(roleDetails.level)}>
          <Shield className="size-3 mr-1" aria-hidden="true" />
          {roleDetails.displayName}
          <span className="ml-1 opacity-70">L{roleDetails.level}</span>
        </Badge>

        {canChangeRole && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleChangeRoleClick}
            className="shrink-0"
            aria-label={`Change role for ${displayName}`}
          >
            <Settings className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start gap-4">
          <Avatar className="size-14">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback className="bg-lxd-primary/20 text-lxd-primary text-lg">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <CardTitle className="truncate">{displayName}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Mail className="size-3" aria-hidden="true" />
              <span className="truncate">{email}</span>
            </CardDescription>
            {organizationName && (
              <CardDescription className="text-xs mt-0.5">{organizationName}</CardDescription>
            )}
          </div>

          <Badge variant={getRoleBadgeVariant(roleDetails.level)} className="shrink-0">
            <Shield className="size-3 mr-1" aria-hidden="true" />
            {roleDetails.displayName}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Role Level Indicator */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Role Level</span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-lxd-primary rounded-full transition-all"
                style={{ width: `${roleDetails.level}%` }}
              />
            </div>
            <span className="font-mono text-xs tabular-nums">L{roleDetails.level}</span>
          </div>
        </div>

        {/* Role Description */}
        <p className="text-sm text-muted-foreground">{roleDetails.description}</p>

        {/* Permissions Summary */}
        {showPermissions && permissions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Key className="size-4 text-lxd-primary" aria-hidden="true" />
              <span>Permissions ({permissions.length})</span>
            </div>

            <div className="flex flex-wrap gap-1">
              {permissions.slice(0, maxPermissionsShown).map((perm) => (
                <Badge key={perm} variant="outline" className="text-xs">
                  {perm}
                </Badge>
              ))}
              {permissions.length > maxPermissionsShown && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  +{permissions.length - maxPermissionsShown} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Change Role Button */}
        {canChangeRole && (
          <Button
            type="button"
            variant="outline"
            onClick={handleChangeRoleClick}
            className="w-full"
          >
            <Settings className="size-4 mr-2" aria-hidden="true" />
            Change Role
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default UserRoleCard;
