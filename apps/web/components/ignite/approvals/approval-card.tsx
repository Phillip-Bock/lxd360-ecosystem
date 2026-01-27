'use client';

import { BookOpen, Calendar, Check, Clock, FileText, User, X } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { PendingApproval } from '@/types/lms/enrollment';

// ============================================================================
// TYPES
// ============================================================================

interface ApprovalCardProps {
  approval: PendingApproval;
  isSelected: boolean;
  onSelectChange: (selected: boolean) => void;
  onApprove: () => void;
  onReject: () => void;
  isProcessing?: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getWaitingBadge(daysWaiting: number): { className: string; label: string } {
  if (daysWaiting >= 7) {
    return {
      className: 'bg-[var(--color-lxd-error)]/15 text-[var(--color-lxd-error)] border-0',
      label: `${daysWaiting}d waiting`,
    };
  }
  if (daysWaiting >= 3) {
    return {
      className: 'bg-[var(--color-lxd-warning)]/15 text-[var(--color-lxd-warning)] border-0',
      label: `${daysWaiting}d waiting`,
    };
  }
  return {
    className: 'bg-muted/50 text-muted-foreground border-0',
    label: daysWaiting === 0 ? 'Today' : `${daysWaiting}d waiting`,
  };
}

function getSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    self_enroll: 'Self-enrollment',
    manager_assigned: 'Manager assigned',
    admin_assigned: 'Admin assigned',
    recommendation: 'AI recommended',
    compliance: 'Compliance required',
    prerequisite: 'Prerequisite',
  };
  return labels[source] || source;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ApprovalCard({
  approval,
  isSelected,
  onSelectChange,
  onApprove,
  onReject,
  isProcessing = false,
}: ApprovalCardProps) {
  const { enrollment, requestedAt, daysWaiting } = approval;
  const waitingBadge = getWaitingBadge(daysWaiting);

  const learnerInitials =
    enrollment.learnerName
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || '??';

  return (
    <Card
      className={cn(
        'relative transition-all duration-200',
        isSelected && 'ring-2 ring-[var(--color-lxd-primary)] ring-offset-2 ring-offset-background',
        isProcessing && 'opacity-60 pointer-events-none',
      )}
    >
      {/* Selection checkbox */}
      <div className="absolute top-4 left-4 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelectChange(checked === true)}
          aria-label={`Select enrollment request from ${enrollment.learnerName || 'Unknown'}`}
          disabled={isProcessing}
        />
      </div>

      <CardHeader className="pb-3 pt-4 pl-12">
        <div className="flex items-start justify-between gap-4">
          {/* Learner info */}
          <div className="flex items-center gap-3 min-w-0">
            {enrollment.learnerAvatar ? (
              <Image
                src={enrollment.learnerAvatar}
                alt={enrollment.learnerName || 'Learner'}
                width={44}
                height={44}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-[var(--color-lxd-primary)]/20 flex items-center justify-center text-[var(--color-lxd-primary)] font-medium">
                {learnerInitials}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {enrollment.learnerName || 'Unknown Learner'}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {enrollment.learnerEmail || 'No email'}
              </p>
            </div>
          </div>

          {/* Waiting badge */}
          <Badge variant="outline" className={waitingBadge.className}>
            <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
            {waitingBadge.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-4">
        {/* Course info */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-lxd-secondary)]/20 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-[var(--color-lxd-secondary)]" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground truncate">
              {enrollment.courseName || 'Unknown Course'}
            </p>
            <p className="text-xs text-muted-foreground">{getSourceLabel(enrollment.source)}</p>
          </div>
        </div>

        {/* Meta info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" aria-hidden="true" />
            <span>Requested: {formatDate(requestedAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="w-4 h-4" aria-hidden="true" />
            <span>ID: {enrollment.learnerId.slice(0, 8)}...</span>
          </div>
        </div>

        {/* Notes (if any) */}
        {enrollment.notes && (
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-1">
              <FileText className="w-4 h-4" aria-hidden="true" />
              Notes
            </div>
            <p className="text-sm text-muted-foreground">{enrollment.notes}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="flex-1 text-[var(--color-lxd-error)] border-[var(--color-lxd-error)]/30 hover:bg-[var(--color-lxd-error)]/10 hover:border-[var(--color-lxd-error)]/50"
              onClick={onReject}
              disabled={isProcessing}
            >
              <X className="w-4 h-4 mr-1" aria-hidden="true" />
              Deny
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reject this enrollment request</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              className="flex-1 bg-[var(--color-lxd-success)] hover:bg-[var(--color-lxd-success)]/90"
              onClick={onApprove}
              disabled={isProcessing}
            >
              <Check className="w-4 h-4 mr-1" aria-hidden="true" />
              Approve
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Approve this enrollment request</p>
          </TooltipContent>
        </Tooltip>
      </CardFooter>
    </Card>
  );
}

export default ApprovalCard;
