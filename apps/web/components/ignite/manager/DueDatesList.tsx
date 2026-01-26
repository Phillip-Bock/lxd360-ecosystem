'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Calendar, CalendarClock, Clock, User } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DueDateItem } from './types';

export interface DueDatesListProps {
  /** Due date items */
  dueDates: DueDateItem[];
  /** Loading state */
  isLoading?: boolean;
  /** Additional class names */
  className?: string;
}

function formatDueDate(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return `${overdueDays} day${overdueDays !== 1 ? 's' : ''} overdue`;
  }
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  if (diffDays <= 7) return `Due in ${diffDays} days`;
  return date.toLocaleDateString();
}

function getDueDateUrgency(date: Date, isOverdue: boolean): 'critical' | 'urgent' | 'normal' {
  if (isOverdue) return 'critical';

  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 3) return 'urgent';
  return 'normal';
}

const urgencyConfig = {
  critical: {
    icon: AlertTriangle,
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-500',
    badgeVariant: 'destructive' as const,
  },
  urgent: {
    icon: Clock,
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-500',
    badgeVariant: 'warning' as const,
  },
  normal: {
    icon: Calendar,
    bgColor: 'bg-lxd-primary/5',
    borderColor: 'border-border/50',
    textColor: 'text-lxd-primary',
    badgeVariant: 'default' as const,
  },
};

function DueDateListItem({
  item,
  index,
}: {
  item: DueDateItem;
  index: number;
}) {
  const urgency = getDueDateUrgency(item.dueDate, item.isOverdue);
  const config = urgencyConfig[urgency];
  const UrgencyIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        'flex items-center justify-between p-3 rounded-lg border transition-colors',
        config.bgColor,
        config.borderColor,
        'hover:border-lxd-primary/30'
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg shrink-0',
            config.bgColor
          )}
        >
          <UrgencyIcon className={cn('h-4 w-4', config.textColor)} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground truncate">{item.title}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="truncate">{item.courseTitle}</span>
            <span>•</span>
            <Link
              href={`/ignite/learners/${item.learnerId}`}
              className="flex items-center gap-1 hover:text-lxd-primary transition-colors"
            >
              <User className="h-3 w-3" aria-hidden="true" />
              <span className="truncate">{item.learnerName}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-3">
        <Badge variant={config.badgeVariant} className="whitespace-nowrap">
          {formatDueDate(item.dueDate)}
        </Badge>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 mb-3">
        <CalendarClock className="h-6 w-6 text-emerald-500" aria-hidden="true" />
      </div>
      <p className="font-medium text-foreground">All caught up!</p>
      <p className="text-sm text-muted-foreground">No upcoming deadlines to track</p>
    </div>
  );
}

/**
 * DueDatesList - Upcoming deadlines display
 *
 * Shows upcoming due dates for team assignments with urgency indicators:
 * - Critical (red): Overdue items
 * - Urgent (yellow): Due within 3 days
 * - Normal (blue): Due later
 */
export function DueDatesList({
  dueDates,
  isLoading = false,
  className,
}: DueDatesListProps) {
  // Sort by due date (overdue first, then soonest)
  const sortedDueDates = [...dueDates].sort((a, b) => {
    // Overdue items first
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    // Then by date
    return a.dueDate.getTime() - b.dueDate.getTime();
  });

  const overdueCount = dueDates.filter((d) => d.isOverdue).length;
  const upcomingCount = dueDates.filter((d) => !d.isOverdue).length;

  if (isLoading) {
    return (
      <Card className={cn('bg-card/60 backdrop-blur-sm', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-lxd-primary" aria-hidden="true" />
            Upcoming Due Dates
          </CardTitle>
          <CardDescription>Loading deadlines...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            <div className="h-16 bg-muted/30 rounded-lg" />
            <div className="h-16 bg-muted/30 rounded-lg" />
            <div className="h-16 bg-muted/30 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('bg-card/60 backdrop-blur-sm', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-lxd-primary" aria-hidden="true" />
          Upcoming Due Dates
        </CardTitle>
        <CardDescription>
          {overdueCount > 0 && (
            <span className="text-red-500 font-medium">{overdueCount} overdue</span>
          )}
          {overdueCount > 0 && upcomingCount > 0 && <span> • </span>}
          {upcomingCount > 0 && <span>{upcomingCount} upcoming</span>}
          {overdueCount === 0 && upcomingCount === 0 && <span>No deadlines</span>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sortedDueDates.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {sortedDueDates.map((item, index) => (
              <DueDateListItem key={item.id} item={item} index={index} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DueDatesList;
