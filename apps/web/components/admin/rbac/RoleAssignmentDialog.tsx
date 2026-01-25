'use client';

import { AlertTriangle, Building2, Shield, User } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { logger } from '@/lib/logger';

const log = logger.scope('RoleAssignmentDialog');

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useHasPermission, useRole } from '@/hooks/use-rbac';
import { canAssignRole, getRoleByName } from '@/lib/rbac/roles';
import type { RoleName } from '@/lib/rbac/types';
import { cn } from '@/lib/utils';
import { RoleSelector } from './RoleSelector';

// ============================================================================
// TYPES
// ============================================================================

interface UserData {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  currentRole: RoleName;
  organizationId?: string;
  organizationName?: string;
}

interface OrganizationData {
  id: string;
  name: string;
}

interface RoleAssignmentDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Pre-selected user (if editing a specific user) */
  selectedUser?: UserData;
  /** Available organizations for scoping */
  organizations?: OrganizationData[];
  /** Callback when role assignment is confirmed */
  onAssign: (data: {
    userId: string;
    newRole: RoleName;
    organizationId?: string;
    reason?: string;
  }) => Promise<void>;
  /** Optional list of users for search (for user selection mode) */
  users?: UserData[];
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface ConfirmationStepProps {
  user: UserData;
  newRole: RoleName;
  organizationName?: string;
  reason: string;
  onReasonChange: (reason: string) => void;
}

function ConfirmationStep({
  user,
  newRole,
  organizationName,
  reason,
  onReasonChange,
}: ConfirmationStepProps): React.JSX.Element {
  const currentRoleDetails = getRoleByName(user.currentRole);
  const newRoleDetails = getRoleByName(newRole);
  const isDowngrade = newRoleDetails.level < currentRoleDetails.level;

  return (
    <div className="space-y-4">
      {/* Warning for downgrades */}
      {isDowngrade && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
          <AlertTriangle className="size-5 text-warning shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-warning">Role Downgrade Warning</p>
            <p className="text-sm text-muted-foreground mt-1">
              You are about to reduce this user&apos;s permissions. They will lose access to
              features available at their current role level.
            </p>
          </div>
        </div>
      )}

      {/* Role Change Summary */}
      <div className="rounded-lg border border-border p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.displayName} />}
            <AvatarFallback className="bg-lxd-primary/20 text-lxd-primary">
              {user.displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.displayName}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <Badge variant="outline" className="text-muted-foreground">
            <Shield className="size-3 mr-1" aria-hidden="true" />
            {currentRoleDetails.displayName}
            <span className="ml-1 opacity-70">L{currentRoleDetails.level}</span>
          </Badge>
          <span className="text-muted-foreground">→</span>
          <Badge variant={isDowngrade ? 'warning' : 'success'}>
            <Shield className="size-3 mr-1" aria-hidden="true" />
            {newRoleDetails.displayName}
            <span className="ml-1 opacity-70">L{newRoleDetails.level}</span>
          </Badge>
        </div>

        {organizationName && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="size-4" aria-hidden="true" />
            <span>Organization: {organizationName}</span>
          </div>
        )}
      </div>

      {/* Reason Input */}
      <div className="space-y-2">
        <Label htmlFor="reason">Reason for change (optional)</Label>
        <Input
          id="reason"
          placeholder="e.g., Promoted to team lead"
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          This will be recorded in the audit log for compliance.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * RoleAssignmentDialog - Modal for assigning roles to users
 *
 * @example Basic usage with pre-selected user
 * ```tsx
 * <RoleAssignmentDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   selectedUser={user}
 *   onAssign={handleAssign}
 * />
 * ```
 *
 * @example With user search
 * ```tsx
 * <RoleAssignmentDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   users={usersList}
 *   organizations={orgsList}
 *   onAssign={handleAssign}
 * />
 * ```
 */
export function RoleAssignmentDialog({
  open,
  onOpenChange,
  selectedUser,
  organizations = [],
  onAssign,
  users = [],
}: RoleAssignmentDialogProps): React.JSX.Element {
  const { role: currentUserRole, loading: roleLoading } = useRole();
  const { hasPermission: canManageRoles, loading: permissionLoading } =
    useHasPermission('manage:roles');

  // Dialog state
  const [step, setStep] = useState<'select' | 'confirm'>('select');
  const [user, setUser] = useState<UserData | undefined>(selectedUser);
  const [newRole, setNewRole] = useState<RoleName | undefined>();
  const [organizationId, setOrganizationId] = useState<string | undefined>(
    selectedUser?.organizationId,
  );
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (u) => u.displayName.toLowerCase().includes(query) || u.email.toLowerCase().includes(query),
    );
  }, [users, searchQuery]);

  // Get organization name
  const selectedOrgName = useMemo(() => {
    if (!organizationId) return undefined;
    return organizations.find((o) => o.id === organizationId)?.name;
  }, [organizationId, organizations]);

  // Reset dialog state when closed
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setStep('select');
        setUser(selectedUser);
        setNewRole(undefined);
        setOrganizationId(selectedUser?.organizationId);
        setReason('');
        setSearchQuery('');
      }
      onOpenChange(open);
    },
    [onOpenChange, selectedUser],
  );

  // Handle user selection
  const handleUserSelect = useCallback(
    (userId: string) => {
      const selected = users.find((u) => u.id === userId);
      if (selected) {
        setUser(selected);
        setOrganizationId(selected.organizationId);
      }
    },
    [users],
  );

  // Handle moving to confirmation step
  const handleContinue = useCallback(() => {
    if (user && newRole) {
      setStep('confirm');
    }
  }, [user, newRole]);

  // Handle final submission
  const handleSubmit = useCallback(async () => {
    if (!user || !newRole) return;

    setIsSubmitting(true);
    try {
      await onAssign({
        userId: user.id,
        newRole,
        organizationId,
        reason: reason.trim() || undefined,
      });
      handleOpenChange(false);
    } catch (error) {
      log.error('Failed to assign role', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsSubmitting(false);
    }
  }, [user, newRole, organizationId, reason, onAssign, handleOpenChange]);

  // Check if current selection is valid
  const canProceed = useMemo(() => {
    if (!user || !newRole) return false;
    if (newRole === user.currentRole) return false;
    return canAssignRole(currentUserRole, newRole);
  }, [user, newRole, currentUserRole]);

  const isLoading = roleLoading || permissionLoading;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="size-5 text-lxd-primary" aria-hidden="true" />
            {step === 'select' ? 'Assign Role' : 'Confirm Role Change'}
          </DialogTitle>
          <DialogDescription>
            {step === 'select'
              ? 'Select a user and choose their new role.'
              : 'Review the role change before confirming.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === 'select' ? (
            <div className="space-y-4">
              {/* User Selection */}
              {!selectedUser && users.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="user-search">User</Label>
                  <div className="space-y-2">
                    <Input
                      id="user-search"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="mb-2"
                    />
                    {filteredUsers.length > 0 ? (
                      <Select value={user?.id} onValueChange={handleUserSelect}>
                        <SelectTrigger aria-label="Select user">
                          <SelectValue placeholder="Select a user" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredUsers.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              <span className="flex items-center gap-2">
                                <User className="size-4" aria-hidden="true" />
                                <span>{u.displayName}</span>
                                <span className="text-muted-foreground">({u.email})</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-muted-foreground py-2">No users found</p>
                    )}
                  </div>
                </div>
              )}

              {/* Show selected user info */}
              {user && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border">
                  <Avatar className="size-10">
                    {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.displayName} />}
                    <AvatarFallback className="bg-lxd-primary/20 text-lxd-primary">
                      {user.displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{user.displayName}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant="outline">
                    <Shield className="size-3 mr-1" aria-hidden="true" />
                    {getRoleByName(user.currentRole).displayName}
                  </Badge>
                </div>
              )}

              {/* Role Selection */}
              {user && (
                <div className="space-y-2">
                  <Label htmlFor="new-role">New Role</Label>
                  <RoleSelector
                    value={newRole}
                    onValueChange={setNewRole}
                    placeholder="Select new role"
                    filter="assignable"
                    showLevels
                  />
                  {newRole && newRole === user.currentRole && (
                    <p className="text-sm text-warning">
                      This is the user&apos;s current role. Please select a different role.
                    </p>
                  )}
                </div>
              )}

              {/* Organization Selection */}
              {user && organizations.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization Scope (optional)</Label>
                  <Select value={organizationId} onValueChange={setOrganizationId}>
                    <SelectTrigger id="organization" aria-label="Select organization">
                      <SelectValue placeholder="Platform-wide" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Platform-wide</SelectItem>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          <span className="flex items-center gap-2">
                            <Building2 className="size-4" aria-hidden="true" />
                            {org.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          ) : (
            user &&
            newRole && (
              <ConfirmationStep
                user={user}
                newRole={newRole}
                organizationName={selectedOrgName}
                reason={reason}
                onReasonChange={setReason}
              />
            )
          )}
        </div>

        <DialogFooter>
          {step === 'select' ? (
            <>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleContinue}
                disabled={!canProceed || isLoading || !canManageRoles}
              >
                Continue
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={() => setStep('select')}>
                Back
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || isLoading}
                className={cn(
                  newRole &&
                    user &&
                    getRoleByName(newRole).level < getRoleByName(user.currentRole).level &&
                    'bg-warning hover:bg-warning/90',
                )}
              >
                {isSubmitting ? 'Assigning...' : 'Confirm Assignment'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RoleAssignmentDialog;
