'use client';

import { AlertTriangle, Clock, Mail, MoreVertical, RefreshCw, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface Invitation {
  id: string;
  email: string;
  courseId: string;
  courseTitle: string;
  sentAt: Date;
  expiresAt: Date;
  status: 'pending' | 'expired';
}

interface InvitationsListProps {
  invitations: Invitation[];
  onResend?: (invitationId: string) => void;
  onCancel?: (invitationId: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function InvitationsList({ invitations, onResend, onCancel }: InvitationsListProps) {
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTimeRemaining = (expiresAt: Date): string => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h remaining`;
    return 'Expiring soon';
  };

  const isExpiringSoon = (expiresAt: Date): boolean => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    // Less than 24 hours
    return diff > 0 && diff < 24 * 60 * 60 * 1000;
  };

  const pendingInvitations = invitations.filter((inv) => inv.status === 'pending');
  const expiredInvitations = invitations.filter((inv) => inv.status === 'expired');

  if (invitations.length === 0) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="w-5 h-5" aria-hidden="true" />
            Pending Invitations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Mail className="w-12 h-12 mb-4 opacity-50" aria-hidden="true" />
            <p>No pending invitations</p>
            <p className="text-sm">All invitations have been accepted or cancelled</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="w-5 h-5" aria-hidden="true" />
            Pending Invitations
          </CardTitle>
          <Badge variant="secondary" className="bg-muted">
            {pendingInvitations.length} pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {pendingInvitations.length > 0 && (
          <div className="space-y-2">
            {pendingInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className={cn(
                  'flex items-center gap-4 p-3 rounded-lg border transition-colors',
                  isExpiringSoon(invitation.expiresAt)
                    ? 'border-[var(--color-lxd-caution)]/50 bg-[var(--color-lxd-caution)]/5'
                    : 'border-border hover:border-border/80',
                )}
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-full bg-[var(--color-lxd-primary)]/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[var(--color-lxd-primary)]" aria-hidden="true" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{invitation.email}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    Invited to: {invitation.courseTitle}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-muted-foreground" aria-hidden="true" />
                    <span
                      className={cn(
                        'text-xs',
                        isExpiringSoon(invitation.expiresAt)
                          ? 'text-[var(--color-lxd-caution)]'
                          : 'text-muted-foreground',
                      )}
                    >
                      {getTimeRemaining(invitation.expiresAt)}
                    </span>
                    {isExpiringSoon(invitation.expiresAt) && (
                      <AlertTriangle
                        className="w-3 h-3 text-[var(--color-lxd-caution)]"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                </div>

                {/* Sent date */}
                <div className="hidden sm:block text-right">
                  <p className="text-xs text-muted-foreground">Sent</p>
                  <p className="text-sm text-foreground">{formatDate(invitation.sentAt)}</p>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label={`Actions for invitation to ${invitation.email}`}
                    >
                      <MoreVertical className="size-4" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onResend?.(invitation.id)}>
                      <RefreshCw className="size-4 mr-2" aria-hidden="true" />
                      Resend Invitation
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                      onClick={() => onCancel?.(invitation.id)}
                    >
                      <Trash2 className="size-4 mr-2" aria-hidden="true" />
                      Cancel Invitation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}

        {/* Expired Invitations */}
        {expiredInvitations.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Expired ({expiredInvitations.length})
            </p>
            <div className="space-y-2">
              {expiredInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center gap-4 p-3 rounded-lg border border-border/50 bg-muted/20 opacity-60"
                >
                  <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{invitation.email}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {invitation.courseTitle}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-[var(--color-lxd-error)]/10 text-[var(--color-lxd-error)] border-0"
                  >
                    Expired
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label={`Actions for expired invitation to ${invitation.email}`}
                      >
                        <MoreVertical className="size-4" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onResend?.(invitation.id)}>
                        <RefreshCw className="size-4 mr-2" aria-hidden="true" />
                        Send New Invitation
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        onClick={() => onCancel?.(invitation.id)}
                      >
                        <Trash2 className="size-4 mr-2" aria-hidden="true" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default InvitationsList;
