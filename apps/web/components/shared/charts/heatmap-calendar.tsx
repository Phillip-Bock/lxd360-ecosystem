'use client';

import { CalendarDays } from 'lucide-react';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { LearnerActivity } from '@/lib/analytics/types';
import { cn } from '@/lib/core/utils';

export interface HeatmapCalendarProps {
  title?: string;
  description?: string;
  data: LearnerActivity[];
  weeks?: number;
  loading?: boolean;
  className?: string;
}

// Color intensity levels based on activity count
const intensityLevels = [
  { min: 0, max: 0, class: 'bg-muted hover:bg-muted' },
  {
    min: 1,
    max: 2,
    class: 'bg-green-200 dark:bg-green-900 hover:bg-green-300 dark:hover:bg-green-800',
  },
  {
    min: 3,
    max: 5,
    class: 'bg-green-300 dark:bg-green-700 hover:bg-green-400 dark:hover:bg-brand-success',
  },
  {
    min: 6,
    max: 10,
    class: 'bg-green-400 dark:bg-brand-success hover:bg-brand-success dark:hover:bg-brand-success',
  },
  {
    min: 11,
    max: Infinity,
    class: 'bg-brand-success dark:bg-brand-success hover:bg-brand-success dark:hover:bg-green-400',
  },
];

function getIntensityClass(count: number): string {
  const level = intensityLevels.find((l) => count >= l.min && count <= l.max);
  return level?.class || intensityLevels[0].class;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function generateCalendarDays(weeks: number): Date[] {
  const days: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Go back to the start of the week
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  // Calculate start date based on weeks
  const startDate = new Date(startOfWeek);
  startDate.setDate(startOfWeek.getDate() - (weeks - 1) * 7);

  // Generate all days
  const endDate = new Date(startOfWeek);
  endDate.setDate(startOfWeek.getDate() + 6);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  return days;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function HeatmapCalendar({
  title = 'Activity',
  description,
  data,
  weeks = 52,
  loading = false,
  className,
}: HeatmapCalendarProps): React.JSX.Element {
  const activityMap = useMemo(() => {
    const map = new Map<string, LearnerActivity>();
    data.forEach((activity) => {
      map.set(activity.date, activity);
    });
    return map;
  }, [data]);

  const calendarDays = useMemo(() => generateCalendarDays(weeks), [weeks]);

  const groupedByWeek = useMemo(() => {
    const weekGroups: Date[][] = [];
    let currentWeek: Date[] = [];

    calendarDays.forEach((day, index) => {
      currentWeek.push(day);
      if ((index + 1) % 7 === 0 || index === calendarDays.length - 1) {
        weekGroups.push(currentWeek);
        currentWeek = [];
      }
    });

    return weekGroups;
  }, [calendarDays]);

  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    groupedByWeek.forEach((week, weekIndex) => {
      const firstDayOfWeek = week[0];
      const month = firstDayOfWeek.getMonth();

      if (month !== lastMonth) {
        labels.push({ month: MONTHS[month], weekIndex });
        lastMonth = month;
      }
    });

    return labels;
  }, [groupedByWeek]);

  const totalActivity = useMemo(() => {
    return data.reduce((sum, d) => sum + d.statements, 0);
  }, [data]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-lxd-purple" />
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-[120px] w-full bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-lxd-purple" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block">
            {/* Month labels */}
            <div className="flex mb-1 ml-8">
              {monthLabels.map((label, i) => (
                <div
                  key={i}
                  className="text-xs text-muted-foreground"
                  style={{
                    marginLeft:
                      i === 0
                        ? label.weekIndex * 14
                        : (label.weekIndex - (monthLabels[i - 1]?.weekIndex || 0)) * 14 - 14,
                    minWidth: 28,
                  }}
                >
                  {label.month}
                </div>
              ))}
            </div>

            <div className="flex">
              {/* Day of week labels */}
              <div className="flex flex-col mr-2 text-xs text-muted-foreground">
                {DAYS_OF_WEEK.map((day, i) => (
                  <div
                    key={day}
                    className="h-3 leading-3"
                    style={{ visibility: i % 2 === 1 ? 'visible' : 'hidden' }}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <TooltipProvider>
                <div className="flex gap-0.5">
                  {groupedByWeek.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-0.5">
                      {week.map((day) => {
                        const dateStr = formatDate(day);
                        const activity = activityMap.get(dateStr);
                        const count = activity?.statements || 0;

                        return (
                          <Tooltip key={dateStr}>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  'w-3 h-3 rounded-sm cursor-pointer transition-colors',
                                  getIntensityClass(count),
                                )}
                              />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              <p className="font-medium">
                                {count} {count === 1 ? 'activity' : 'activities'}
                              </p>
                              <p className="text-muted-foreground">
                                {day.toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Legend and summary */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {totalActivity.toLocaleString()} activities in the last {weeks} weeks
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Less</span>
            {intensityLevels.map((level, i) => (
              <div key={i} className={cn('w-3 h-3 rounded-sm', level.class)} />
            ))}
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact streak calendar showing recent activity
 */
export interface StreakCalendarProps {
  data: { date: string; active: boolean }[];
  days?: number;
  loading?: boolean;
  className?: string;
}

export function StreakCalendar({
  data,
  days = 14,
  loading = false,
  className,
}: StreakCalendarProps): React.JSX.Element {
  const recentDays = useMemo(() => {
    const result: { date: Date; active: boolean }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dataMap = new Map(data.map((d) => [d.date, d.active]));

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = formatDate(date);
      result.push({
        date,
        active: dataMap.get(dateStr) || false,
      });
    }

    return result;
  }, [data, days]);

  if (loading) {
    return (
      <div className={cn('flex gap-1', className)}>
        {[...Array(days)].map((_, i) => (
          <div key={i} className="w-4 h-4 rounded bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn('flex gap-1', className)}>
        {recentDays.map(({ date, active }) => (
          <Tooltip key={formatDate(date)}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'w-4 h-4 rounded cursor-pointer transition-colors',
                  active
                    ? 'bg-brand-success hover:bg-brand-success'
                    : 'bg-muted hover:bg-muted-foreground/20',
                )}
              />
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <p>
                {date.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              <p className="text-muted-foreground">{active ? 'Active' : 'No activity'}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
