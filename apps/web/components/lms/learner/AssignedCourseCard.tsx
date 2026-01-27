'use client';

import { AlertCircle, Calendar, Clock, Play } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LearnerCourse } from '@/types/lms/learner-dashboard';

export interface AssignedCourseCardProps {
  /** Course data */
  course: LearnerCourse;
  /** Additional class names */
  className?: string;
}

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
}

const variantColors = {
  primary: { stroke: 'var(--color-lxd-primary)', glow: 'rgba(0, 114, 245, 0.4)' },
  success: { stroke: 'var(--color-lxd-success)', glow: 'rgba(35, 116, 6, 0.4)' },
  warning: { stroke: 'var(--color-lxd-warning)', glow: 'rgba(167, 93, 32, 0.4)' },
  danger: { stroke: 'var(--color-lxd-error)', glow: 'rgba(205, 10, 10, 0.4)' },
};

function ProgressRing({
  progress,
  size = 56,
  strokeWidth = 4,
  variant = 'primary',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const offset = circumference - (clampedProgress / 100) * circumference;
  const colorConfig = variantColors[variant];
  const accessibleLabel = `Progress: ${Math.round(clampedProgress)}%`;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        role="img"
        aria-label={accessibleLabel}
      >
        <title>{accessibleLabel}</title>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorConfig.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.5s ease-out',
            filter: `drop-shadow(0 0 4px ${colorConfig.glow})`,
          }}
        />
      </svg>
      <span
        className="absolute font-mono font-bold text-foreground"
        style={{ fontSize: size * 0.22 }}
        aria-hidden
      >
        {Math.round(clampedProgress)}%
      </span>
    </div>
  );
}

function formatDueDate(date: Date): { text: string; isOverdue: boolean; isDueSoon: boolean } {
  const now = new Date();
  const dueDate = new Date(date);
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `${Math.abs(diffDays)} days overdue`, isOverdue: true, isDueSoon: false };
  }
  if (diffDays === 0) {
    return { text: 'Due today', isOverdue: false, isDueSoon: true };
  }
  if (diffDays <= 7) {
    return {
      text: `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`,
      isOverdue: false,
      isDueSoon: true,
    };
  }
  return {
    text: dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    isOverdue: false,
    isDueSoon: false,
  };
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * AssignedCourseCard - Card with progress ring for assigned courses grid
 *
 * Features:
 * - Prominent progress ring
 * - Thumbnail with play overlay
 * - Due date badges with urgency styling
 * - Required badge for mandatory courses
 */
export function AssignedCourseCard({ course, className }: AssignedCourseCardProps) {
  const courseUrl = `/ignite/learn/player/${course.id}/lesson-1`;
  const isNotStarted = course.status === 'not_started';
  const isCompleted = course.status === 'completed';
  const dueInfo = course.dueDate ? formatDueDate(course.dueDate) : null;

  const progressVariant = isCompleted
    ? 'success'
    : dueInfo?.isOverdue
      ? 'danger'
      : course.progress >= 50
        ? 'primary'
        : 'warning';

  return (
    <Card
      className={cn(
        'bg-lxd-dark-surface border-lxd-dark-border overflow-hidden',
        'hover:border-lxd-primary/50 hover:shadow-[0_0_20px_rgba(0,114,245,0.1)]',
        'transition-all duration-200 group',
        className,
      )}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Progress ring */}
          <div className="shrink-0">
            <ProgressRing
              progress={course.progress}
              size={64}
              strokeWidth={5}
              variant={progressVariant}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-lxd-primary transition-colors">
                {course.title}
              </h3>
              {course.isRequired && (
                <Badge variant="warning" className="shrink-0 text-xs">
                  Required
                </Badge>
              )}
            </div>

            {/* Due date */}
            {dueInfo && (
              <div
                className={cn(
                  'flex items-center gap-1 text-xs',
                  dueInfo.isOverdue
                    ? 'text-red-500'
                    : dueInfo.isDueSoon
                      ? 'text-amber-500'
                      : 'text-muted-foreground',
                )}
              >
                {dueInfo.isOverdue && <AlertCircle className="w-3 h-3" aria-hidden />}
                <Calendar className="w-3 h-3" aria-hidden />
                <span>{dueInfo.text}</span>
              </div>
            )}

            {/* Meta info */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>
                {course.completedLessons}/{course.totalLessons} lessons
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" aria-hidden />
                {formatDuration(course.estimatedMinutes)}
              </span>
            </div>
          </div>
        </div>

        {/* Action button */}
        <Link
          href={courseUrl}
          className={cn(
            'flex items-center justify-center gap-2 w-full mt-4 py-2.5 rounded-lg',
            'bg-lxd-primary/10 hover:bg-lxd-primary text-lxd-primary hover:text-white',
            'font-medium transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-lxd-primary focus:ring-offset-2',
            'focus:ring-offset-lxd-dark-surface',
          )}
        >
          <Play className="w-4 h-4" aria-hidden />
          {isNotStarted ? 'Start Course' : 'Continue'}
        </Link>
      </CardContent>
    </Card>
  );
}

/**
 * AssignedCourseCardSkeleton - Loading placeholder
 */
export function AssignedCourseCardSkeleton() {
  return (
    <Card className="bg-lxd-dark-surface border-lxd-dark-border">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-full bg-muted/30 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-3/4 bg-muted/30 rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-muted/30 rounded animate-pulse" />
            <div className="h-3 w-1/3 bg-muted/30 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-10 w-full mt-4 bg-muted/30 rounded-lg animate-pulse" />
      </CardContent>
    </Card>
  );
}
