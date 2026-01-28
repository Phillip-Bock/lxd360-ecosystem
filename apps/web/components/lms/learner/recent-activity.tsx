'use client';

import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Play,
  Target,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface ActivityItem {
  /** Unique activity ID */
  id: string;
  /** Activity type */
  type:
    | 'course_started'
    | 'lesson_completed'
    | 'course_completed'
    | 'badge_earned'
    | 'skill_improved';
  /** Activity title/description */
  title: string;
  /** Related course ID (if applicable) */
  courseId?: string;
  /** Related course title (if applicable) */
  courseTitle?: string;
  /** Timestamp */
  timestamp: Date;
  /** Additional metadata */
  metadata?: {
    score?: number;
    progress?: number;
    xpEarned?: number;
    skillName?: string;
    badgeName?: string;
  };
}

export interface RecentActivityProps {
  /** Activity items */
  activities: ActivityItem[];
  /** Maximum items to display */
  maxItems?: number;
  /** Loading state */
  isLoading?: boolean;
  /** Additional class names */
  className?: string;
}

const activityIcons = {
  course_started: { icon: Play, color: 'bg-blue-500/20 text-blue-500' },
  lesson_completed: { icon: BookOpen, color: 'bg-green-500/20 text-green-500' },
  course_completed: { icon: CheckCircle2, color: 'bg-emerald-500/20 text-emerald-500' },
  badge_earned: { icon: Award, color: 'bg-purple-500/20 text-purple-500' },
  skill_improved: { icon: TrendingUp, color: 'bg-amber-500/20 text-amber-500' },
};

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getActivityDescription(activity: ActivityItem): string {
  switch (activity.type) {
    case 'course_started':
      return `Started "${activity.courseTitle || activity.title}"`;
    case 'lesson_completed':
      return activity.courseTitle
        ? `Completed lesson in "${activity.courseTitle}"`
        : `Completed: ${activity.title}`;
    case 'course_completed':
      return `Completed "${activity.courseTitle || activity.title}"${activity.metadata?.score ? ` with ${activity.metadata.score}%` : ''}`;
    case 'badge_earned':
      return `Earned ${activity.metadata?.badgeName || activity.title}`;
    case 'skill_improved':
      return `Improved ${activity.metadata?.skillName || 'skill'} mastery`;
    default:
      return activity.title;
  }
}

function getActivityXp(activity: ActivityItem): number | null {
  return activity.metadata?.xpEarned ?? null;
}

function ActivityListItem({ activity }: { activity: ActivityItem }) {
  const iconConfig = activityIcons[activity.type];
  const Icon = iconConfig.icon;
  const description = getActivityDescription(activity);
  const xp = getActivityXp(activity);
  const courseUrl = activity.courseId ? `/ignite/learn/player/${activity.courseId}/lesson-1` : null;

  const content = (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg',
        'bg-lxd-dark-bg/50 transition-colors',
        courseUrl && 'hover:bg-lxd-dark-bg group cursor-pointer',
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center w-9 h-9 rounded-full shrink-0',
          iconConfig.color,
        )}
      >
        <Icon className="w-4 h-4" aria-hidden />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium text-foreground line-clamp-2',
            courseUrl && 'group-hover:text-lxd-primary transition-colors',
          )}
        >
          {description}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(activity.timestamp)}
          </span>
          {xp && (
            <>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-xs text-purple-400">+{xp} XP</span>
            </>
          )}
        </div>
      </div>

      {courseUrl && (
        <ChevronRight
          className="w-4 h-4 text-muted-foreground group-hover:text-lxd-primary transition-colors shrink-0 mt-0.5"
          aria-hidden
        />
      )}
    </div>
  );

  if (courseUrl) {
    return (
      <Link
        href={courseUrl}
        className="block focus:outline-none focus:ring-2 focus:ring-lxd-primary rounded-lg"
      >
        {content}
      </Link>
    );
  }

  return content;
}

/**
 * RecentActivity - Activity feed showing learning milestones
 *
 * Features:
 * - Multiple activity types with distinct icons
 * - Relative timestamps
 * - XP earned display
 * - Links to related courses
 * - Empty state handling
 */
export function RecentActivity({
  activities,
  maxItems = 5,
  isLoading = false,
  className,
}: RecentActivityProps) {
  if (isLoading) {
    return <RecentActivitySkeleton className={className} maxItems={maxItems} />;
  }

  const displayActivities = activities.slice(0, maxItems);

  if (displayActivities.length === 0) {
    return (
      <Card className={cn('bg-lxd-dark-surface border-lxd-dark-border', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-5 h-5 text-lxd-primary" aria-hidden />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/20 mb-3">
              <BookOpen className="h-6 w-6 text-muted-foreground" aria-hidden />
            </div>
            <p className="text-sm text-muted-foreground">No recent activity</p>
            <p className="text-xs text-muted-foreground mt-1">
              Start learning to see your progress here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('bg-lxd-dark-surface border-lxd-dark-border', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-5 h-5 text-lxd-primary" aria-hidden />
            Recent Activity
          </CardTitle>
          {activities.length > maxItems && (
            <Link
              href="/ignite/learn/progress"
              className="text-sm text-muted-foreground hover:text-lxd-primary transition-colors flex items-center gap-1"
            >
              View All
              <ChevronRight className="w-4 h-4" aria-hidden />
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {displayActivities.map((activity) => (
          <ActivityListItem key={activity.id} activity={activity} />
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * RecentActivitySkeleton - Loading placeholder
 */
export function RecentActivitySkeleton({
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
          <div className="h-5 w-32 bg-muted/30 rounded animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: Math.min(maxItems, 4) }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-lxd-dark-bg/50">
            <div className="w-9 h-9 rounded-full bg-muted/30 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-muted/30 rounded animate-pulse" />
              <div className="h-3 w-1/3 bg-muted/30 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
