'use client';

import {
  AlertCircle,
  Check,
  Download,
  FileText,
  Loader2,
  Trash2,
  UserPlus,
  Users,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { cn } from '@/lib/core/utils';
import { logger } from '@/lib/logger';

const log = logger.scope('QuickActions');

// ============================================================================
// TYPES
// ============================================================================

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'destructive' | 'warning';
  requiresConfirmation?: boolean;
}

type ActionStatus = 'idle' | 'loading' | 'success' | 'error';

// ============================================================================
// QUICK ACTIONS COMPONENT
// ============================================================================

export function QuickActions() {
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = React.useState(false);
  const [clearCacheDialogOpen, setClearCacheDialogOpen] = React.useState(false);
  const [actionStatus, setActionStatus] = React.useState<Record<string, ActionStatus>>({});

  // Action handlers
  const handleInviteTeamMember = async (email: string) => {
    setActionStatus((prev) => ({ ...prev, invite: 'loading' }));
    try {
      // In production, call /api/admin/invites with email
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setActionStatus((prev) => ({ ...prev, invite: 'success' }));
      setTimeout(() => {
        setInviteDialogOpen(false);
        setActionStatus((prev) => ({ ...prev, invite: 'idle' }));
      }, 1000);
    } catch (error) {
      log.error(
        'Failed to invite team member',
        error instanceof Error ? error : new Error(String(error)),
        { email },
      );
      setActionStatus((prev) => ({ ...prev, invite: 'error' }));
    }
  };

  const handleToggleMaintenance = async () => {
    setActionStatus((prev) => ({ ...prev, maintenance: 'loading' }));
    try {
      // In production, call /api/admin/maintenance
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setActionStatus((prev) => ({ ...prev, maintenance: 'success' }));
      setMaintenanceDialogOpen(false);
      setTimeout(() => {
        setActionStatus((prev) => ({ ...prev, maintenance: 'idle' }));
      }, 2000);
    } catch {
      // Silently ignore - error state is already set for UI feedback
      setActionStatus((prev) => ({ ...prev, maintenance: 'error' }));
    }
  };

  const handleClearCache = async () => {
    setActionStatus((prev) => ({ ...prev, cache: 'loading' }));
    try {
      // In production, call /api/admin/cache
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setActionStatus((prev) => ({ ...prev, cache: 'success' }));
      setClearCacheDialogOpen(false);
      setTimeout(() => {
        setActionStatus((prev) => ({ ...prev, cache: 'idle' }));
      }, 2000);
    } catch {
      // Silently ignore - error state is already set for UI feedback
      setActionStatus((prev) => ({ ...prev, cache: 'error' }));
    }
  };

  const handleExportUsers = async () => {
    setActionStatus((prev) => ({ ...prev, export: 'loading' }));
    try {
      // In production, call /api/admin/users/export
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate file download
      const blob = new Blob(
        ['"Name","Email","Role","Status"\n"John Doe","john@example.com","admin","active"'],
        { type: 'text/csv' },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      setActionStatus((prev) => ({ ...prev, export: 'success' }));
      setTimeout(() => {
        setActionStatus((prev) => ({ ...prev, export: 'idle' }));
      }, 2000);
    } catch {
      // Silently ignore - error state is already set for UI feedback
      setActionStatus((prev) => ({ ...prev, export: 'error' }));
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'create-user',
      label: 'Create User',
      icon: UserPlus,
      description: 'Add a new user account',
      href: '/admin/users/new',
    },
    {
      id: 'invite',
      label: 'Invite Team Member',
      icon: Users,
      description: 'Send email invitation',
      onClick: () => setInviteDialogOpen(true),
    },
    {
      id: 'maintenance',
      label: 'Maintenance Mode',
      icon: Wrench,
      description: 'Toggle maintenance mode',
      onClick: () => setMaintenanceDialogOpen(true),
      variant: 'warning',
      requiresConfirmation: true,
    },
    {
      id: 'cache',
      label: 'Clear Cache',
      icon: Trash2,
      description: 'Clear system cache',
      onClick: () => setClearCacheDialogOpen(true),
      variant: 'destructive',
      requiresConfirmation: true,
    },
    {
      id: 'export',
      label: 'Export Users',
      icon: Download,
      description: 'Download user list as CSV',
      onClick: handleExportUsers,
    },
    {
      id: 'logs',
      label: 'View Logs',
      icon: FileText,
      description: 'View system logs',
      href: '/admin/logs',
    },
  ];

  const getButtonIcon = (action: QuickAction) => {
    const status = actionStatus[action.id];
    if (status === 'loading') {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    if (status === 'success') {
      return <Check className="h-4 w-4 text-brand-success" />;
    }
    if (status === 'error') {
      return <AlertCircle className="h-4 w-4 text-brand-error" />;
    }
    const Icon = action.icon;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {quickActions.map((action) => {
              const isLoading = actionStatus[action.id] === 'loading';

              if (action.href) {
                return (
                  <Button key={action.id} variant="outline" className="justify-start" asChild>
                    <Link href={action.href}>
                      {getButtonIcon(action)}
                      <span className="ml-2">{action.label}</span>
                    </Link>
                  </Button>
                );
              }

              return (
                <Button
                  key={action.id}
                  variant={
                    action.variant === 'destructive'
                      ? 'outline'
                      : action.variant === 'warning'
                        ? 'outline'
                        : 'outline'
                  }
                  className={cn(
                    'justify-start',
                    action.variant === 'destructive' &&
                      'border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive',
                    action.variant === 'warning' &&
                      'border-brand-warning/30 text-yellow-600 dark:text-brand-warning hover:bg-brand-warning/10 hover:text-yellow-700 dark:hover:text-yellow-300',
                  )}
                  onClick={action.onClick}
                  disabled={isLoading}
                >
                  {getButtonIcon(action)}
                  <span className="ml-2">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Invite Team Member Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>Send an email invitation to join the admin team.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleInviteTeamMember(formData.get('email') as string);
            }}
          >
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="colleague@company.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  name="role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  defaultValue="author"
                >
                  <option value="admin">Admin</option>
                  <option value="author">Author</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={actionStatus.invite === 'loading'}>
                {actionStatus.invite === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : actionStatus.invite === 'success' ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Sent!
                  </>
                ) : (
                  'Send Invitation'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Maintenance Mode Confirmation */}
      <AlertDialog open={maintenanceDialogOpen} onOpenChange={setMaintenanceDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Toggle Maintenance Mode</AlertDialogTitle>
            <AlertDialogDescription>
              This will display a maintenance page to all non-admin users. Are you sure you want to
              proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleMaintenance}
              className="bg-brand-warning hover:bg-yellow-600 text-brand-primary"
            >
              {actionStatus.maintenance === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Enable Maintenance Mode'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Cache Confirmation */}
      <AlertDialog open={clearCacheDialogOpen} onOpenChange={setClearCacheDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear System Cache</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all cached data including API responses, images, and session data.
              This may temporarily slow down the application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearCache}
              className="bg-destructive hover:bg-destructive/90"
            >
              {actionStatus.cache === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Clearing...
                </>
              ) : (
                'Clear Cache'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
