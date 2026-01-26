'use client';

import { Flame, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LearningStreakProps {
  /** Current consecutive day streak */
  currentStreak: number;
  /** Longest streak ever achieved */
  longestStreak: number;
  /** Array of dates with learning activity in the last 30 days */
  activityDays: Date[];
  /** Additional class names */
  className?: string;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function getDateForOffset(dayOffset: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - (29 - dayOffset));
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * LearningStreak - Displays daily activity streak with calendar heatmap
 *
 * Features:
 * - Current and longest streak display
 * - 30-day activity calendar view
 * - Visual heat indicators for active days
 * - Flame animation for active streaks
 * - Motion-safe animations
 *
 * @example
 * ```tsx
 * <LearningStreak
 *   currentStreak={7}
 *   longestStreak={15}
 *   activityDays={[new Date('2026-01-25'), new Date('2026-01-24'), ...]}
 * />
 * ```
 */
export function LearningStreak({
  currentStreak,
  longestStreak,
  activityDays,
  className,
}: LearningStreakProps): React.JSX.Element {
  const isOnFire = currentStreak >= 3;
  const isNewRecord = currentStreak >= longestStreak && currentStreak > 0;

  // Normalize activity dates for comparison
  const normalizedActivityDays = activityDays.map((date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  });

  // Check if a day offset has activity
  const hasActivity = (dayOffset: number): boolean => {
    const targetDate = getDateForOffset(dayOffset);
    return normalizedActivityDays.some((activityDate) => isSameDay(activityDate, targetDate));
  };

  return (
    <div
      className={cn('rounded-xl border border-border bg-card/60 backdrop-blur-sm p-4', className)}
    >
      {/* Header Stats */}
      <div className="flex items-center justify-between mb-4">
        {/* Current Streak */}
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              isOnFire ? 'bg-orange-500/10 text-orange-500' : 'bg-muted/30 text-muted-foreground',
            )}
          >
            <Flame
              className={cn('h-5 w-5', isOnFire && 'animate-pulse motion-reduce:animate-none')}
            />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground leading-none">{currentStreak}</p>
            <p className="text-xs text-muted-foreground mt-0.5">day streak</p>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              isNewRecord ? 'bg-amber-500/10 text-amber-500' : 'bg-muted/30 text-muted-foreground',
            )}
          >
            <Trophy className="h-5 w-5" />
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground leading-none">{longestStreak}</p>
            <p className="text-xs text-muted-foreground mt-0.5">best streak</p>
          </div>
        </div>
      </div>

      {/* Activity Calendar (Last 30 days) */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Last 30 days</p>
        {/* Screen reader accessible summary */}
        <p className="sr-only">You were active on {activityDays.length} of the last 30 days.</p>
        {/* Visual calendar - decorative */}
        <div className="grid grid-cols-10 gap-1" aria-hidden="true">
          {Array.from({ length: 30 }, (_, i) => {
            const isActive = hasActivity(i);
            const isToday = i === 29;
            const dateLabel = getDateForOffset(i).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={i}
                className={cn(
                  'aspect-square rounded-sm transition-colors duration-200 motion-reduce:transition-none',
                  isActive ? 'bg-lxd-primary shadow-[0_0_4px_rgba(0,86,184,0.3)]' : 'bg-muted/20',
                  isToday && 'ring-1 ring-foreground/30',
                )}
                title={`${dateLabel}${isActive ? ' - Active' : ''}`}
              />
            );
          })}
        </div>

        {/* Day Labels */}
        <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </div>

      {/* Encouragement Message */}
      {currentStreak === 0 && (
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Start learning today to build your streak!
        </p>
      )}
      {isNewRecord && currentStreak > 0 && (
        <p className="text-xs text-amber-500 mt-3 text-center font-medium">
          You&apos;re on your best streak ever!
        </p>
      )}
    </div>
  );
}
