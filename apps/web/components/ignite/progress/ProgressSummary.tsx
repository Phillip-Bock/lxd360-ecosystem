'use client';

import { BookCheck, Clock, GraduationCap, PlayCircle, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressRing } from './ProgressRing';

export interface ProgressSummaryProps {
  /** Total number of assigned courses */
  totalCourses: number;
  /** Number of completed courses */
  completedCourses: number;
  /** Number of courses currently in progress */
  inProgressCourses: number;
  /** Total learning time in minutes */
  totalTime: number;
  /** Average assessment score (0-100) */
  averageScore: number;
  /** Additional class names */
  className?: string;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}

interface StatItemProps {
  icon: React.ElementType;
  value: string | number;
  label: string;
  colorClass?: string;
}

function StatItem({ icon: Icon, value, label, colorClass }: StatItemProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg',
          colorClass ?? 'bg-muted/30 text-muted-foreground',
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-lg font-semibold leading-none text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

/**
 * ProgressSummary - Aggregate learning progress overview
 *
 * Features:
 * - Visual completion percentage ring
 * - Course statistics grid
 * - Time spent tracking
 * - Average score display
 * - Responsive layout
 *
 * @example
 * ```tsx
 * <ProgressSummary
 *   totalCourses={12}
 *   completedCourses={5}
 *   inProgressCourses={3}
 *   totalTime={1250}
 *   averageScore={85}
 * />
 * ```
 */
export function ProgressSummary({
  totalCourses,
  completedCourses,
  inProgressCourses,
  totalTime,
  averageScore,
  className,
}: ProgressSummaryProps): React.JSX.Element {
  const completionPercent =
    totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;
  const notStartedCourses = totalCourses - completedCourses - inProgressCourses;

  // Determine score variant
  const getScoreVariant = (): 'success' | 'default' | 'warning' | 'danger' => {
    if (averageScore >= 80) return 'success';
    if (averageScore >= 60) return 'default';
    if (averageScore >= 40) return 'warning';
    return 'danger';
  };

  return (
    <div
      className={cn('rounded-xl border border-border bg-card/60 backdrop-blur-sm p-6', className)}
    >
      {/* Header with Progress Ring */}
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
        {/* Completion Ring */}
        <div className="flex flex-col items-center">
          <ProgressRing
            value={completionPercent}
            size={100}
            strokeWidth={8}
            variant={completionPercent === 100 ? 'success' : 'default'}
          >
            <div className="text-center">
              <span className="text-2xl font-bold text-foreground">{completionPercent}%</span>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Complete</p>
            </div>
          </ProgressRing>
        </div>

        {/* Course Breakdown */}
        <div className="flex-1 grid grid-cols-3 gap-4 text-center sm:text-left">
          <div>
            <p className="text-2xl font-bold text-success">{completedCourses}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-lxd-primary">{inProgressCourses}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-muted-foreground">{notStartedCourses}</p>
            <p className="text-xs text-muted-foreground">Not Started</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border mb-6" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatItem
          icon={GraduationCap}
          value={totalCourses}
          label="Total Courses"
          colorClass="bg-lxd-primary/10 text-lxd-primary"
        />
        <StatItem
          icon={Clock}
          value={formatDuration(totalTime)}
          label="Time Spent"
          colorClass="bg-cyan-500/10 text-cyan-500"
        />
        <StatItem
          icon={BookCheck}
          value={completedCourses}
          label="Completed"
          colorClass="bg-success/10 text-success"
        />
        <StatItem
          icon={Trophy}
          value={`${Math.round(averageScore)}%`}
          label="Avg. Score"
          colorClass={cn(
            getScoreVariant() === 'success' && 'bg-success/10 text-success',
            getScoreVariant() === 'default' && 'bg-lxd-primary/10 text-lxd-primary',
            getScoreVariant() === 'warning' && 'bg-warning/10 text-warning',
            getScoreVariant() === 'danger' && 'bg-error/10 text-error',
          )}
        />
      </div>

      {/* Progress Message */}
      {completionPercent === 100 && (
        <div className="mt-6 rounded-lg bg-success/10 border border-success/20 p-3 text-center">
          <p className="text-sm font-medium text-success">
            Congratulations! You&apos;ve completed all assigned courses.
          </p>
        </div>
      )}
      {completionPercent > 0 && completionPercent < 100 && inProgressCourses > 0 && (
        <div className="mt-6 rounded-lg bg-lxd-primary/10 border border-lxd-primary/20 p-3 text-center">
          <p className="text-sm text-lxd-primary">
            <PlayCircle className="inline h-4 w-4 mr-1 -mt-0.5" />
            Keep going! You have {inProgressCourses} course{inProgressCourses !== 1 ? 's' : ''} in
            progress.
          </p>
        </div>
      )}
    </div>
  );
}
