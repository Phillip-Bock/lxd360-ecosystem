'use client';

/**
 * LessonStatus - Icon indicators for lesson completion states
 *
 * Features:
 * - Visual status icons for: not-started, in-progress, completed, locked
 * - Tooltip with status details
 * - Accessible with proper ARIA labels
 */

import {
  CheckCircle2Icon,
  CircleDotIcon,
  CircleIcon,
  LockIcon,
  type LucideIcon,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type LessonStatusType = 'not-started' | 'in-progress' | 'completed' | 'locked';

export interface LessonStatusProps {
  /** Current status of the lesson */
  status: LessonStatusType;
  /** Progress percentage (0-100), shown for in-progress */
  progress?: number;
  /** Time spent in seconds */
  timeSpent?: number;
  /** Completion date */
  completedAt?: string;
  /** Show tooltip with details */
  showTooltip?: boolean;
  /** Icon size */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className */
  className?: string;
  /** Lesson name for accessibility */
  lessonName?: string;
}

interface StatusConfig {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  label: string;
}

const STATUS_CONFIG: Record<LessonStatusType, StatusConfig> = {
  'not-started': {
    icon: CircleIcon,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    label: 'Not started',
  },
  'in-progress': {
    icon: CircleDotIcon,
    color: 'text-warning',
    bgColor: 'bg-warning/20',
    label: 'In progress',
  },
  completed: {
    icon: CheckCircle2Icon,
    color: 'text-success',
    bgColor: 'bg-success/20',
    label: 'Completed',
  },
  locked: {
    icon: LockIcon,
    color: 'text-muted-foreground/60',
    bgColor: 'bg-muted/30',
    label: 'Locked',
  },
};

const SIZE_CONFIG = {
  sm: { icon: 'h-4 w-4', wrapper: 'h-6 w-6' },
  md: { icon: 'h-5 w-5', wrapper: 'h-8 w-8' },
  lg: { icon: 'h-6 w-6', wrapper: 'h-10 w-10' },
} as const;

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function LessonStatus({
  status,
  progress,
  timeSpent,
  completedAt,
  showTooltip = true,
  size = 'md',
  className,
  lessonName,
}: LessonStatusProps): React.JSX.Element {
  const config = STATUS_CONFIG[status];
  const sizeConfig = SIZE_CONFIG[size];
  const Icon = config.icon;

  const ariaLabel = lessonName ? `${lessonName}: ${config.label}` : config.label;

  const iconElement = (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full',
        sizeConfig.wrapper,
        config.bgColor,
        className,
      )}
      role="img"
      aria-label={ariaLabel}
    >
      <Icon className={cn(sizeConfig.icon, config.color)} aria-hidden="true" />
    </div>
  );

  if (!showTooltip) {
    return iconElement;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{iconElement}</TooltipTrigger>
      <TooltipContent>
        <div className="flex flex-col gap-1">
          <span className="font-medium">{config.label}</span>

          {status === 'in-progress' && progress !== undefined && (
            <span className="text-xs text-muted-foreground">Progress: {Math.round(progress)}%</span>
          )}

          {timeSpent !== undefined && timeSpent > 0 && (
            <span className="text-xs text-muted-foreground">
              Time spent: {formatDuration(timeSpent)}
            </span>
          )}

          {status === 'completed' && completedAt && (
            <span className="text-xs text-muted-foreground">
              Completed: {formatDate(completedAt)}
            </span>
          )}

          {status === 'locked' && (
            <span className="text-xs text-muted-foreground">
              Complete previous lessons to unlock
            </span>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Compact lesson status indicator for lists
 */
export interface CompactLessonStatusProps {
  status: LessonStatusType;
  className?: string;
}

export function CompactLessonStatus({
  status,
  className,
}: CompactLessonStatusProps): React.JSX.Element {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return <Icon className={cn('h-4 w-4', config.color, className)} aria-label={config.label} />;
}

/**
 * Status badge variant for lesson status
 */
export interface LessonStatusBadgeProps {
  status: LessonStatusType;
  className?: string;
}

export function LessonStatusBadge({
  status,
  className,
}: LessonStatusBadgeProps): React.JSX.Element {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.bgColor,
        config.color,
        className,
      )}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {config.label}
    </span>
  );
}
