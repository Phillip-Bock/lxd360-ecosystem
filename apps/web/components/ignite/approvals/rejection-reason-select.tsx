'use client';

import { AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export const REJECTION_REASONS = [
  { value: 'prerequisites_not_met', label: 'Prerequisites not met' },
  { value: 'capacity_full', label: 'Course capacity is full' },
  { value: 'not_eligible', label: 'Learner not eligible for this course' },
  { value: 'department_mismatch', label: 'Course not relevant to department' },
  { value: 'duplicate_enrollment', label: 'Already enrolled in similar course' },
  { value: 'budget_constraints', label: 'Budget constraints' },
  { value: 'timing_conflict', label: 'Schedule/timing conflict' },
  { value: 'manager_decision', label: 'Manager discretion' },
  { value: 'other', label: 'Other (please specify)' },
] as const;

export type RejectionReasonValue = (typeof REJECTION_REASONS)[number]['value'];

interface RejectionReasonSelectProps {
  value: string;
  onChange: (value: string) => void;
  customReason: string;
  onCustomReasonChange: (value: string) => void;
  error?: string;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function RejectionReasonSelect({
  value,
  onChange,
  customReason,
  onCustomReasonChange,
  error,
  className,
}: RejectionReasonSelectProps) {
  const showCustomInput = value === 'other';
  const selectedReason = REJECTION_REASONS.find((r) => r.value === value);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="space-y-2">
        <Label htmlFor="rejection-reason" className="text-sm font-medium text-foreground">
          Rejection Reason
        </Label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger
            id="rejection-reason"
            className={cn(
              'w-full',
              error && 'border-[var(--color-lxd-error)] focus:ring-[var(--color-lxd-error)]',
            )}
            aria-invalid={!!error}
            aria-describedby={error ? 'rejection-reason-error' : undefined}
          >
            <SelectValue placeholder="Select a reason..." />
          </SelectTrigger>
          <SelectContent>
            {REJECTION_REASONS.map((reason) => (
              <SelectItem key={reason.value} value={reason.value}>
                {reason.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && (
          <p
            id="rejection-reason-error"
            className="text-sm text-[var(--color-lxd-error)] flex items-center gap-1"
          >
            <AlertCircle className="w-4 h-4" aria-hidden="true" />
            {error}
          </p>
        )}
      </div>

      {showCustomInput && (
        <div className="space-y-2">
          <Label htmlFor="custom-reason" className="text-sm font-medium text-foreground">
            Please specify
          </Label>
          <Textarea
            id="custom-reason"
            value={customReason}
            onChange={(e) => onCustomReasonChange(e.target.value)}
            placeholder="Enter the reason for rejection..."
            className="min-h-[80px] resize-none"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">
            {customReason.length}/500 characters
          </p>
        </div>
      )}

      {value && !showCustomInput && selectedReason && (
        <p className="text-sm text-muted-foreground">
          This will inform the learner that their enrollment request was denied due to:{' '}
          <span className="text-foreground">{selectedReason.label.toLowerCase()}</span>
        </p>
      )}
    </div>
  );
}

export default RejectionReasonSelect;
