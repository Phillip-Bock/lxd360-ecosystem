'use client';

import { Crown, Edit3, ShieldCheck, User, Users } from 'lucide-react';
import { useCallback, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { canAssignRole, ROLE_NAMES, ROLES, type RoleName } from '@/lib/auth/roles';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface UserData {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  currentRole: RoleName;
}

interface RoleAssignmentProps {
  /** User to assign role to */
  user: UserData;
  /** Current user's role (for permission checking) */
  currentUserRole: RoleName;
  /** Tenant ID for scoping */
  tenantId?: string;
  /** Callback when role is assigned */
  onAssign: (uid: string, role: RoleName, tenantId?: string) => Promise<void>;
  /** Optional className */
  className?: string;
}

// ============================================================================
// ROLE ICON COMPONENT
// ============================================================================

function RoleIcon({
  role,
  className,
  style,
}: {
  role: RoleName;
  className?: string;
  style?: React.CSSProperties;
}): React.JSX.Element {
  const iconProps = {
    className: cn('size-4', className),
    'aria-hidden': true as const,
    style,
  };

  switch (role) {
    case 'owner':
      return <Crown {...iconProps} />;
    case 'editor':
      return <Edit3 {...iconProps} />;
    case 'manager':
      return <Users {...iconProps} />;
    case 'learner':
      return <User {...iconProps} />;
    default:
      return <ShieldCheck {...iconProps} />;
  }
}

// ============================================================================
// ROLE BADGE COMPONENT
// ============================================================================

function RoleBadge({ role }: { role: RoleName }): React.JSX.Element {
  const roleConfig = ROLES[role];

  return (
    <Badge
      variant="outline"
      className="gap-1"
      style={{ borderColor: roleConfig.color, color: roleConfig.color }}
    >
      <RoleIcon role={role} className="size-3" />
      {roleConfig.label}
    </Badge>
  );
}

// ============================================================================
// ROLE OPTION COMPONENT
// ============================================================================

interface RoleOptionProps {
  role: RoleName;
  disabled?: boolean;
}

function RoleOption({ role, disabled }: RoleOptionProps): React.JSX.Element {
  const roleConfig = ROLES[role];

  return (
    <div className={cn('flex items-center gap-3', disabled && 'opacity-50')}>
      <div
        className="flex size-8 items-center justify-center rounded-full"
        style={{ backgroundColor: `${roleConfig.color}20` }}
      >
        <RoleIcon role={role} style={{ color: roleConfig.color }} />
      </div>
      <div className="flex-1">
        <div className="font-medium">{roleConfig.label}</div>
        <div className="text-xs text-muted-foreground">
          Level {roleConfig.level} &middot; {roleConfig.description}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * RoleAssignment - Component for assigning roles to users
 *
 * Uses the 4-persona RBAC system (Owner, Editor, Manager, Learner).
 * Only shows roles that the current user can assign.
 *
 * @example
 * ```tsx
 * <RoleAssignment
 *   user={selectedUser}
 *   currentUserRole="owner"
 *   tenantId="tenant-123"
 *   onAssign={handleRoleAssign}
 * />
 * ```
 */
export function RoleAssignment({
  user,
  currentUserRole,
  tenantId,
  onAssign,
  className,
}: RoleAssignmentProps): React.JSX.Element {
  const [selectedRole, setSelectedRole] = useState<RoleName | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get assignable roles for current user
  const assignableRoles = ROLE_NAMES.filter((role) => canAssignRole(currentUserRole, role));

  // Handle role assignment
  const handleAssign = useCallback(async () => {
    if (!selectedRole || selectedRole === user.currentRole) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onAssign(user.uid, selectedRole, tenantId);
      setSelectedRole(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign role');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedRole, user, tenantId, onAssign]);

  const canSubmit = selectedRole && selectedRole !== user.currentRole && !isSubmitting;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-[var(--color-lxd-primary)]" aria-hidden="true" />
          Assign Role
        </CardTitle>
        <CardDescription>Change the user&apos;s role and permissions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Info */}
        <div className="flex items-center gap-4 rounded-lg border p-4">
          <Avatar className="size-12">
            {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName} />}
            <AvatarFallback className="bg-[var(--color-lxd-primary)]/20 text-[var(--color-lxd-primary)]">
              {user.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-medium">{user.displayName}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
          <RoleBadge role={user.currentRole} />
        </div>

        {/* Role Selection */}
        <div className="space-y-2">
          <Label htmlFor="role-select">New Role</Label>
          <Select
            value={selectedRole}
            onValueChange={(value) => setSelectedRole(value as RoleName)}
          >
            <SelectTrigger id="role-select" aria-label="Select new role">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {ROLE_NAMES.map((role) => {
                const isAssignable = assignableRoles.includes(role);
                const isCurrent = role === user.currentRole;

                return (
                  <SelectItem key={role} value={role} disabled={!isAssignable || isCurrent}>
                    <RoleOption role={role} disabled={!isAssignable || isCurrent} />
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {selectedRole === user.currentRole && (
            <p className="text-sm text-muted-foreground">This is the user&apos;s current role.</p>
          )}

          {selectedRole && selectedRole !== user.currentRole && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Changing role from</span>
              <RoleBadge role={user.currentRole} />
              <span className="text-muted-foreground">to</span>
              <RoleBadge role={selectedRole} />
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setSelectedRole(undefined)}
            disabled={!selectedRole || isSubmitting}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleAssign} disabled={!canSubmit}>
            {isSubmitting ? 'Assigning...' : 'Assign Role'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default RoleAssignment;
