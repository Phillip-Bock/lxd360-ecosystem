'use client';

import { AlertCircle, CheckCircle, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CompletionBadgeProps {
  /** Completion status of the course */
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  /** Date when the course was completed (for completed status) */
  completedAt?: Date;
  /** Due date for the course */
  dueDate?: Date;
  /** Display size */
  size?: 'sm' | 'md' | 'lg';
  /** Show date text below the badge */
  showDate?: boolean;
  /** Additional class names */
  className?: string;
}

const statusConfig = {
  not_started: {
    icon: Circle,
    label: 'Not Started',
    bgClass: 'bg-muted/20',
    textClass: 'text-muted-foreground',
    borderClass: 'border-muted/30',
  },
  in_progress: {
    icon: Clock,
    label: 'In Progress',
    bgClass: 'bg-lxd-primary/10',
    textClass: 'text-lxd-primary',
    borderClass: 'border-lxd-primary/30',
  },
  completed: {
    icon: CheckCircle,
    label: 'Completed',
    bgClass: 'bg-success/10',
    textClass: 'text-success',
    borderClass: 'border-success/30',
  },
  overdue: {
    icon: AlertCircle,
    label: 'Overdue',
    bgClass: 'bg-error/10',
    textClass: 'text-error',
    borderClass: 'border-error/30',
  },
} as const;

const sizeConfig = {
  sm: {
    badge: 'px-2 py-0.5 text-xs gap-1',
    icon: 'h-3 w-3',
  },
  md: {
    badge: 'px-2.5 py-1 text-sm gap-1.5',
    icon: 'h-4 w-4',
  },
  lg: {
    badge: 'px-3 py-1.5 text-base gap-2',
    icon: 'h-5 w-5',
  },
} as const;

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getDaysRemaining(dueDate: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * CompletionBadge - Visual status indicator for course completion
 *
 * Features:
 * - Four status states with distinct visual styling
 * - Optional date display
 * - Multiple size variants
 * - Accessible with proper ARIA attributes
 *
 * @example
 * ```tsx
 * <CompletionBadge status="completed" completedAt={new Date()} showDate />
 * <CompletionBadge status="overdue" dueDate={new Date('2026-01-15')} />
 * <CompletionBadge status="in_progress" size="lg" />
 * ```
 */
export function CompletionBadge({
  status,
  completedAt,
  dueDate,
  size = 'md',
  showDate = false,
  className,
}: CompletionBadgeProps): React.JSX.Element {
  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];
  const StatusIcon = config.icon;

  // Determine the date text to display
  let dateText: string | null = null;
  if (showDate) {
    if (status === 'completed' && completedAt) {
      dateText = `Completed ${formatDate(completedAt)}`;
    } else if (status === 'overdue' && dueDate) {
      const daysOverdue = Math.abs(getDaysRemaining(dueDate));
      dateText = `${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue`;
    } else if (dueDate && status !== 'completed') {
      const daysRemaining = getDaysRemaining(dueDate);
      if (daysRemaining > 0) {
        dateText = `Due in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`;
      } else if (daysRemaining === 0) {
        dateText = 'Due today';
      }
    }
  }

  return (
    <div className={cn('inline-flex flex-col items-start gap-1', className)}>
      <output
        className={cn(
          'inline-flex items-center rounded-full border font-medium',
          'transition-colors duration-200',
          config.bgClass,
          config.textClass,
          config.borderClass,
          sizeStyles.badge,
        )}
        aria-label={`Status: ${config.label}`}
      >
        <StatusIcon className={sizeStyles.icon} aria-hidden="true" />
        <span>{config.label}</span>
      </output>

      {dateText && <span className="text-xs text-muted-foreground">{dateText}</span>}
    </div>
  );
}
