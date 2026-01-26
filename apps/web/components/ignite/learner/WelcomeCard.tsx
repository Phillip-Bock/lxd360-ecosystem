'use client';

import { Flame, Sparkles, Target, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LearnerProgressSummary } from '@/types/lms/learner-dashboard';
import { ProgressRing } from './ProgressRing';

export interface WelcomeCardProps {
  /** Learner's display name */
  userName: string;
  /** Progress summary data */
  progressSummary: LearnerProgressSummary;
  /** Loading state */
  isLoading?: boolean;
  /** Additional class names */
  className?: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function StatBadge({
  icon: Icon,
  value,
  label,
  colorClass,
}: {
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  value: number | string;
  label: string;
  colorClass: string;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-lxd-dark-surface/50">
      <div className={cn('p-1.5 rounded-md', colorClass)}>
        <Icon className="w-4 h-4" aria-hidden />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <Card className="bg-lxd-dark-surface border-lxd-dark-border overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Text skeleton */}
          <div className="flex-1 space-y-3">
            <div className="h-6 w-48 bg-muted/30 rounded animate-pulse" />
            <div className="h-8 w-64 bg-muted/30 rounded animate-pulse" />
            <div className="h-4 w-80 bg-muted/30 rounded animate-pulse" />
          </div>
          {/* Stats skeleton */}
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 w-28 bg-muted/30 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * WelcomeCard - Greeting component with progress summary
 *
 * Displays personalized greeting and key learning metrics.
 * Shows overall progress ring and stats badges.
 */
export function WelcomeCard({
  userName,
  progressSummary,
  isLoading = false,
  className,
}: WelcomeCardProps) {
  if (isLoading) {
    return <SkeletonLoader />;
  }

  const greeting = getGreeting();

  return (
    <Card
      className={cn(
        'bg-gradient-to-br from-lxd-dark-surface to-lxd-dark-surface/80',
        'border-lxd-dark-border overflow-hidden relative',
        className,
      )}
    >
      {/* Subtle gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-lxd-primary/5 via-transparent to-lxd-secondary/5 pointer-events-none" />

      <CardContent className="p-6 relative">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Greeting and progress ring */}
          <div className="flex items-center gap-5 flex-1">
            <ProgressRing
              progress={progressSummary.overallProgress}
              size={80}
              strokeWidth={6}
              variant={
                progressSummary.overallProgress >= 75
                  ? 'success'
                  : progressSummary.overallProgress >= 50
                    ? 'primary'
                    : 'warning'
              }
            />

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{greeting},</p>
              <h2 className="text-2xl font-bold text-brand-primary">{userName}</h2>
              <p className="text-sm text-muted-foreground">
                {progressSummary.inProgress > 0 ? (
                  <>
                    You have{' '}
                    <span className="text-lxd-primary font-medium">
                      {progressSummary.inProgress}
                    </span>{' '}
                    course{progressSummary.inProgress !== 1 ? 's' : ''} in progress
                  </>
                ) : progressSummary.totalAssigned > 0 ? (
                  <>Ready to start your learning journey</>
                ) : (
                  <>Explore courses to begin learning</>
                )}
              </p>
            </div>
          </div>

          {/* Stats badges */}
          <div className="flex flex-wrap gap-3">
            <StatBadge
              icon={Target}
              value={`${progressSummary.completed}/${progressSummary.totalAssigned}`}
              label="Completed"
              colorClass="bg-lxd-primary/20 text-lxd-primary"
            />
            <StatBadge
              icon={Flame}
              value={progressSummary.currentStreak}
              label="Day Streak"
              colorClass="bg-orange-500/20 text-orange-500"
            />
            <StatBadge
              icon={Sparkles}
              value={progressSummary.totalXp.toLocaleString()}
              label="Total XP"
              colorClass="bg-purple-500/20 text-purple-500"
            />
            <StatBadge
              icon={Trophy}
              value={`Lv.${progressSummary.level}`}
              label="Level"
              colorClass="bg-amber-500/20 text-amber-500"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
