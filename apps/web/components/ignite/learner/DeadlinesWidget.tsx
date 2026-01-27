'use client';

import { AlertTriangle, Calendar, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { LearnerDeadline } from '@/types/lms/learner-dashboard';

export interface DeadlinesWidgetProps {
  /** List of upcoming deadlines */
  deadlines: LearnerDeadline[];
  /** Maximum deadlines to show */
  maxItems?: number;
  /** Additional class names */
  className?: string;
}

interface DeadlineStatus {
  label: string;
  variant: 'destructive' | 'warning' | 'default';
  isOverdue: boolean;
  isDueSoon: boolean;
}

function getDeadlineStatus(dueDate: Date): DeadlineStatus {
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`,
      variant: 'destructive',
      isOverdue: true,
      isDueSoon: false,
    };
  }

  if (diffDays === 0) {
    return {
      label: 'Due today',
      variant: 'warning',
      isOverdue: false,
      isDueSoon: true,
    };
  }

  if (diffDays === 1) {
    return {
      label: 'Due tomorrow',
      variant: 'warning',
      isOverdue: false,
      isDueSoon: true,
    };
  }

  if (diffDays <= 7) {
    return {
      label: `Due in ${diffDays} days`,
      variant: 'warning',
      isOverdue: false,
      isDueSoon: true,
    };
  }

  return {
    label: due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    variant: 'default',
    isOverdue: false,
    isDueSoon: false,
  };
}

function formatFullDate(date: Date): string {
  return new Date(date).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * DeadlinesWidget - Shows upcoming course deadlines
 *
 * Features:
 * - Sorted by urgency (overdue first, then soon)
 * - Color-coded status badges
 * - Progress indicator per course
 * - Quick link to course
 */
export function DeadlinesWidget({ deadlines, maxItems = 5, className }: DeadlinesWidgetProps) {
  // Sort by due date (most urgent first)
  const sortedDeadlines = [...deadlines]
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, maxItems);

  const hasOverdue = sortedDeadlines.some((d) => getDeadlineStatus(d.dueDate).isOverdue);

  return (
    <Card
      className={cn(
        'bg-lxd-dark-surface border-lxd-dark-border',
        hasOverdue && 'border-l-4 border-l-red-500',
        className,
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Calendar className="w-5 h-5 text-lxd-primary" aria-hidden />
          Upcoming Deadlines
          {sortedDeadlines.length > 0 && (
            <Badge variant="secondary" className="ml-auto text-xs">
              {sortedDeadlines.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {sortedDeadlines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-lxd-success/10 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-lxd-success" aria-hidden />
            </div>
            <p className="text-sm font-medium text-foreground">All caught up!</p>
            <p className="text-xs text-muted-foreground mt-1">No upcoming deadlines</p>
          </div>
        ) : (
          <ul className="space-y-3" aria-label="Upcoming course deadlines">
            {sortedDeadlines.map((deadline) => {
              const status = getDeadlineStatus(deadline.dueDate);
              const courseUrl = `/ignite/learn/player/${deadline.courseId}/lesson-1`;

              return (
                <li key={deadline.courseId}>
                  <Link
                    href={courseUrl}
                    className={cn(
                      'block p-3 rounded-lg',
                      'bg-lxd-dark-bg/50 hover:bg-lxd-dark-bg',
                      'border border-transparent',
                      status.isOverdue && 'border-red-500/30 bg-red-500/5',
                      status.isDueSoon &&
                        !status.isOverdue &&
                        'border-yellow-500/30 bg-yellow-500/5',
                      'transition-colors group',
                      'focus:outline-none focus:ring-2 focus:ring-lxd-primary focus:ring-offset-2',
                      'focus:ring-offset-lxd-dark-surface',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground truncate group-hover:text-lxd-primary transition-colors">
                          {deadline.courseTitle}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" aria-hidden />
                          <span className="text-xs text-muted-foreground">
                            {formatFullDate(deadline.dueDate)}
                          </span>
                        </div>
                      </div>

                      <Badge variant={status.variant} className="text-xs shrink-0">
                        {status.isOverdue && <AlertTriangle className="w-3 h-3 mr-1" aria-hidden />}
                        {status.label}
                      </Badge>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium text-foreground">{deadline.progress}%</span>
                      </div>
                      <Progress value={deadline.progress} className="h-1.5" />
                    </div>

                    {deadline.isRequired && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          Required
                        </Badge>
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * DeadlinesWidgetSkeleton - Loading placeholder
 */
export function DeadlinesWidgetSkeleton() {
  return (
    <Card className="bg-lxd-dark-surface border-lxd-dark-border">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-muted/30 animate-pulse" />
          <div className="h-5 w-40 bg-muted/30 rounded animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-3 rounded-lg bg-lxd-dark-bg/50">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-muted/30 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-muted/30 rounded animate-pulse" />
              </div>
              <div className="h-5 w-20 bg-muted/30 rounded-full animate-pulse" />
            </div>
            <div className="h-1.5 w-full bg-muted/30 rounded-full animate-pulse mt-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
