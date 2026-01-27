'use client';

import { AlertTriangle, Check, Loader2, X } from 'lucide-react';
import { useCallback, useState } from 'react';
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
import { cn } from '@/lib/utils';
import type { PendingApproval } from '@/types/lms/enrollment';
import {
  REJECTION_REASONS,
  RejectionReasonSelect,
  type RejectionReasonValue,
} from './rejection-reason-select';

// ============================================================================
// TYPES
// ============================================================================

type ModalMode = 'approve' | 'reject' | 'bulk-approve' | 'bulk-reject';

interface ApprovalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: ModalMode;
  approvals: PendingApproval[];
  onConfirm: (data: { approved: boolean; reason?: string }) => Promise<void>;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ApprovalModal({
  open,
  onOpenChange,
  mode,
  approvals,
  onConfirm,
}: ApprovalModalProps) {
  const [rejectionReason, setRejectionReason] = useState<RejectionReasonValue | ''>('');
  const [customReason, setCustomReason] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isApprove = mode === 'approve' || mode === 'bulk-approve';
  const isBulk = mode === 'bulk-approve' || mode === 'bulk-reject';
  const count = approvals.length;

  const resetForm = useCallback(() => {
    setRejectionReason('');
    setCustomReason('');
    setError('');
    setIsSubmitting(false);
  }, []);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const handleConfirm = async () => {
    if (!isApprove) {
      if (!rejectionReason) {
        setError('Please select a rejection reason');
        return;
      }
      if (rejectionReason === 'other' && !customReason.trim()) {
        setError('Please provide a custom reason');
        return;
      }
    }

    setError('');
    setIsSubmitting(true);

    try {
      const reason = isApprove
        ? undefined
        : rejectionReason === 'other'
          ? customReason.trim()
          : REJECTION_REASONS.find((r) => r.value === rejectionReason)?.label || rejectionReason;

      await onConfirm({ approved: isApprove, reason });
      handleOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const singleApproval = approvals[0];
  const learnerName = singleApproval?.enrollment.learnerName || 'Unknown Learner';
  const courseName = singleApproval?.enrollment.courseName || 'Unknown Course';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isApprove ? (
              <>
                <div className="w-8 h-8 rounded-full bg-[var(--color-lxd-success)]/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-[var(--color-lxd-success)]" aria-hidden="true" />
                </div>
                {isBulk ? `Approve ${count} Requests` : 'Approve Enrollment'}
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-[var(--color-lxd-error)]/20 flex items-center justify-center">
                  <X className="w-4 h-4 text-[var(--color-lxd-error)]" aria-hidden="true" />
                </div>
                {isBulk ? `Deny ${count} Requests` : 'Deny Enrollment'}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isApprove
              ? isBulk
                ? `You are about to approve ${count} enrollment requests. The learners will be notified and granted access to their courses.`
                : `Approve ${learnerName}'s request to enroll in "${courseName}".`
              : isBulk
                ? `You are about to deny ${count} enrollment requests. Please select a reason that will be shared with the learners.`
                : `Deny ${learnerName}'s request to enroll in "${courseName}".`}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Show affected enrollments for bulk actions */}
          {isBulk && (
            <div className="mb-4 p-3 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-sm font-medium text-foreground mb-2">
                Affected Enrollments ({count})
              </p>
              <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto">
                {approvals.slice(0, 10).map((a) => (
                  <Badge key={a.enrollment.id} variant="outline" className="text-xs bg-background">
                    {a.enrollment.learnerName || 'Unknown'}
                  </Badge>
                ))}
                {count > 10 && (
                  <Badge variant="outline" className="text-xs bg-muted">
                    +{count - 10} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Rejection reason selector */}
          {!isApprove && (
            <RejectionReasonSelect
              value={rejectionReason}
              onChange={(v) => {
                setRejectionReason(v as RejectionReasonValue);
                setError('');
              }}
              customReason={customReason}
              onCustomReasonChange={(v) => {
                setCustomReason(v);
                setError('');
              }}
              error={error}
            />
          )}

          {/* Approval confirmation */}
          {isApprove && (
            <div className="p-4 rounded-lg bg-[var(--color-lxd-success)]/5 border border-[var(--color-lxd-success)]/20">
              <div className="flex items-start gap-3">
                <Check
                  className="w-5 h-5 text-[var(--color-lxd-success)] mt-0.5 flex-shrink-0"
                  aria-hidden="true"
                />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-1">What happens next:</p>
                  <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Learner(s) will be notified via email</li>
                    <li>Course access will be granted immediately</li>
                    <li>Enrollment will appear in course roster</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Error display */}
          {error && isApprove && (
            <div className="mt-4 p-3 rounded-lg bg-[var(--color-lxd-error)]/10 border border-[var(--color-lxd-error)]/20">
              <div className="flex items-center gap-2 text-[var(--color-lxd-error)]">
                <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={cn(
              isApprove
                ? 'bg-[var(--color-lxd-success)] hover:bg-[var(--color-lxd-success)]/90'
                : 'bg-[var(--color-lxd-error)] hover:bg-[var(--color-lxd-error)]/90',
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                Processing...
              </>
            ) : isApprove ? (
              <>
                <Check className="w-4 h-4 mr-1" aria-hidden="true" />
                {isBulk ? `Approve ${count}` : 'Approve'}
              </>
            ) : (
              <>
                <X className="w-4 h-4 mr-1" aria-hidden="true" />
                {isBulk ? `Deny ${count}` : 'Deny'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ApprovalModal;
