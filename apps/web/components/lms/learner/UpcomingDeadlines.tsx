'use client';

import { AlertCircle, Calendar, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LearnerCourse } from '@/types/lms/learner-dashboard';

export interface UpcomingDeadlinesProps {
  /** Courses with due dates */
  courses: LearnerCourse[];
  /** Maximum items to display */
  maxItems?: number;
  /** Loading state */
  isLoading?: boolean;
  /** Additional class names */
  className?: string;
}

interface DeadlineInfo {
  course: LearnerCourse;
  daysUntilDue: number;
  isOverdue: boolean;
  isDueSoon: boolean;
  formattedDate: string;
}

function getDeadlineInfo(course: LearnerCourse): DeadlineInfo | null {
  if (!course.dueDate) return null;

  const now = new Date();
  const dueDate = new Date(course.dueDate);
  const diffMs = dueDate.getTime() - now.getTime();
  const daysUntilDue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let formattedDate: string;
  if (daysUntilDue < 0) {
    formattedDate = `${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''} overdue`;
  } else if (daysUntilDue === 0) {
    formattedDate = 'Due today';
  } else if (daysUntilDue === 1) {
    formattedDate = 'Due tomorrow';
  } else if (daysUntilDue <= 7) {
    formattedDate = `Due in ${daysUntilDue} days`;
  } else {
    formattedDate = dueDate.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  return {
    course,
    daysUntilDue,
    isOverdue: daysUntilDue < 0,
    isDueSoon: daysUntilDue >= 0 && daysUntilDue <= 3,
    formattedDate,
  };
}

function DeadlineItem({ deadline }: { deadline: DeadlineInfo }) {
  const { course, isOverdue, isDueSoon, formattedDate } = deadline;
  const courseUrl = `/ignite/learn/player/${course.id}/lesson-1`;

  return (
    <Link
      href={courseUrl}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg',
        'bg-lxd-dark-bg/50 hover:bg-lxd-dark-bg transition-colors',
        'group focus:outline-none focus:ring-2 focus:ring-lxd-primary',
      )}
    >
      {/* Status indicator */}
      <div
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-full shrink-0',
          isOverdue
            ? 'bg-red-500/20 text-red-500'
            : isDueSoon
              ? 'bg-amber-500/20 text-amber-500'
              : 'bg-lxd-primary/20 text-lxd-primary',
        )}
      >
        {isOverdue ? (
          <AlertCircle className="w-5 h-5" aria-hidden />
        ) : (
          <Calendar className="w-5 h-5" aria-hidden />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground truncate group-hover:text-lxd-primary transition-colors">
          {course.title}
        </h4>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className={cn(
              'text-sm',
              isOverdue ? 'text-red-500' : isDueSoon ? 'text-amber-500' : 'text-muted-foreground',
            )}
          >
            {formattedDate}
          </span>
          <span className="text-muted-foreground text-sm">·</span>
          <span className="text-sm text-muted-foreground">{course.progress}% complete</span>
        </div>
      </div>

      {/* Urgency badge */}
      {(isOverdue || isDueSoon) && (
        <Badge variant={isOverdue ? 'destructive' : 'warning'} className="shrink-0">
          {isOverdue ? 'Overdue' : 'Due Soon'}
        </Badge>
      )}

      <ChevronRight
        className="w-4 h-4 text-muted-foreground group-hover:text-lxd-primary transition-colors shrink-0"
        aria-hidden
      />
    </Link>
  );
}

/**
 * UpcomingDeadlines - List of courses with approaching due dates
 *
 * Features:
 * - Sorted by urgency (overdue first, then soonest)
 * - Visual urgency indicators
 * - Quick navigation to courses
 * - Empty state handling
 */
export function UpcomingDeadlines({
  courses,
  maxItems = 5,
  isLoading = false,
  className,
}: UpcomingDeadlinesProps) {
  if (isLoading) {
    return <UpcomingDeadlinesSkeleton className={className} maxItems={maxItems} />;
  }

  // Get courses with due dates and sort by urgency
  const deadlines = courses
    .map(getDeadlineInfo)
    .filter((d): d is DeadlineInfo => d !== null)
    .sort((a, b) => {
      // Overdue first, then by days until due
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      return a.daysUntilDue - b.daysUntilDue;
    })
    .slice(0, maxItems);

  if (deadlines.length === 0) {
    return (
      <Card className={cn('bg-lxd-dark-surface border-lxd-dark-border', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-lxd-primary" aria-hidden />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/20 mb-3">
              <Calendar className="h-6 w-6 text-muted-foreground" aria-hidden />
            </div>
            <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const overdueCount = deadlines.filter((d) => d.isOverdue).length;
  const dueSoonCount = deadlines.filter((d) => d.isDueSoon && !d.isOverdue).length;

  return (
    <Card className={cn('bg-lxd-dark-surface border-lxd-dark-border', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-lxd-primary" aria-hidden />
            Upcoming Deadlines
          </CardTitle>
          <div className="flex items-center gap-2">
            {overdueCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {overdueCount} overdue
              </Badge>
            )}
            {dueSoonCount > 0 && (
              <Badge variant="warning" className="text-xs">
                {dueSoonCount} due soon
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {deadlines.map((deadline) => (
          <DeadlineItem key={deadline.course.id} deadline={deadline} />
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * UpcomingDeadlinesSkeleton - Loading placeholder
 */
export function UpcomingDeadlinesSkeleton({
  className,
  maxItems = 5,
}: {
  className?: string;
  maxItems?: number;
}) {
  return (
    <Card className={cn('bg-lxd-dark-surface border-lxd-dark-border', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-muted/30 animate-pulse" />
          <div className="h-5 w-40 bg-muted/30 rounded animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: Math.min(maxItems, 3) }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-lxd-dark-bg/50">
            <div className="w-10 h-10 rounded-full bg-muted/30 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-muted/30 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-muted/30 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
