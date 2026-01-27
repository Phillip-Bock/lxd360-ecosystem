'use client';

export const dynamic = 'force-dynamic';

import { AlertCircle, BookOpen, ChevronRight, RefreshCw, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { WelcomeCard } from '@/components/ignite/learner';
import type { ActivityItem, Badge } from '@/components/lms/learner';
import {
  AchievementBadges,
  AssignedCourseCard,
  AssignedCourseCardSkeleton,
  ContinueLearningCard,
  ContinueLearningCardSkeleton,
  RecentActivity,
  RecentActivitySkeleton,
  UpcomingDeadlines,
  UpcomingDeadlinesSkeleton,
} from '@/components/lms/learner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSafeAuth } from '@/providers/SafeAuthProvider';
import type {
  CompletedCourseRecord,
  LearnerBadge,
  LearnerCourse,
  LearnerProgressSummary,
  RecommendedCourse,
} from '@/types/lms/learner-dashboard';

/** Get Firebase ID token for API authentication */
async function getIdToken(): Promise<string> {
  const { getAuth } = await import('firebase/auth');
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

/** Dashboard API response shape */
interface DashboardResponse {
  progressSummary: LearnerProgressSummary;
  inProgressCourses: LearnerCourse[];
  assignedCourses: LearnerCourse[];
  recommendedCourses: RecommendedCourse[];
  completedCourses: CompletedCourseRecord[];
  badges?: LearnerBadge[];
  recentActivity?: ActivityItem[];
}

/** Default empty progress summary */
const defaultProgressSummary: LearnerProgressSummary = {
  totalAssigned: 0,
  inProgress: 0,
  completed: 0,
  overallProgress: 0,
  totalTimeSpent: 0,
  currentStreak: 0,
  totalXp: 0,
  level: 1,
};

/**
 * Map rarity to tier for badge display
 */
const rarityToTier: Record<string, Badge['tier']> = {
  common: 'bronze',
  rare: 'silver',
  epic: 'gold',
  legendary: 'platinum',
};

/**
 * Map icon string to iconType for badge display
 */
const iconToType: Record<string, Badge['iconType']> = {
  star: 'star',
  trophy: 'trophy',
  shield: 'award',
  flame: 'zap',
  zap: 'zap',
  'book-open': 'star',
  target: 'award',
  crown: 'trophy',
};

/**
 * Convert LearnerBadge to Badge format expected by AchievementBadges component
 */
function adaptBadges(learnerBadges: LearnerBadge[]): Badge[] {
  return learnerBadges.map((badge) => ({
    id: badge.id,
    name: badge.name,
    description: badge.description,
    iconType: iconToType[badge.icon] ?? 'star',
    tier: rarityToTier[badge.rarity] ?? 'bronze',
    earned: true,
    earnedAt: badge.earnedAt,
    xpReward: badge.xpReward,
  }));
}

/**
 * Learner Dashboard - Main learning hub
 *
 * Features:
 * - Continue Learning card (last accessed course)
 * - Assigned courses grid with progress rings
 * - Upcoming deadlines widget
 * - Recent activity feed
 * - Achievement badges
 */
export default function LearnDashboardPage() {
  const { user } = useSafeAuth();

  // State for dashboard data
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressSummary, setProgressSummary] =
    useState<LearnerProgressSummary>(defaultProgressSummary);
  const [inProgressCourses, setInProgressCourses] = useState<LearnerCourse[]>([]);
  const [assignedCourses, setAssignedCourses] = useState<LearnerCourse[]>([]);
  const [completedCourses, setCompletedCourses] = useState<CompletedCourseRecord[]>([]);
  const [badges, setBadges] = useState<LearnerBadge[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  // Get user's display name
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Learner';

  // Fetch dashboard data
  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await getIdToken();
      const response = await fetch('/api/ignite/learner/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch dashboard data');
      }

      const data: DashboardResponse = await response.json();

      // Convert date strings back to Date objects
      const parseCourseDates = <T extends LearnerCourse>(course: T): T => ({
        ...course,
        dueDate: course.dueDate ? new Date(course.dueDate as unknown as string) : undefined,
        lastAccessedAt: course.lastAccessedAt
          ? new Date(course.lastAccessedAt as unknown as string)
          : undefined,
        completedAt:
          'completedAt' in course && course.completedAt
            ? new Date(course.completedAt as unknown as string)
            : undefined,
      });

      const parseBadgeDates = (badge: LearnerBadge): LearnerBadge => ({
        ...badge,
        earnedAt: new Date(badge.earnedAt as unknown as string),
      });

      const parseActivityDates = (activity: ActivityItem): ActivityItem => ({
        ...activity,
        timestamp: new Date(activity.timestamp as unknown as string),
      });

      setProgressSummary(data.progressSummary);
      setInProgressCourses(data.inProgressCourses.map(parseCourseDates));
      setAssignedCourses(data.assignedCourses.map(parseCourseDates));
      setCompletedCourses(data.completedCourses.map(parseCourseDates));
      setBadges(data.badges ? data.badges.map(parseBadgeDates) : []);
      setRecentActivity(data.recentActivity ? data.recentActivity.map(parseActivityDates) : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    if (user) {
      fetchDashboard();
    }
  }, [user, fetchDashboard]);

  // Get most recently accessed course for continue learning
  const sortedInProgress = [...inProgressCourses].sort((a, b) => {
    const aTime = a.lastAccessedAt ? new Date(a.lastAccessedAt).getTime() : 0;
    const bTime = b.lastAccessedAt ? new Date(b.lastAccessedAt).getTime() : 0;
    return bTime - aTime;
  });
  const lastAccessedCourse = sortedInProgress[0];

  // Combine all courses with due dates for deadline widget
  const allCourses = [...inProgressCourses, ...assignedCourses];

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        {/* Welcome Section Skeleton */}
        <div className="rounded-xl bg-lxd-dark-surface border border-lxd-dark-border p-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-muted/30" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-48 bg-muted/30 rounded" />
              <div className="h-4 w-64 bg-muted/30 rounded" />
            </div>
          </div>
        </div>

        {/* Continue Learning Skeleton */}
        <section className="space-y-4">
          <SectionHeader
            title="Continue Learning"
            icon={BookOpen}
            href="/ignite/learn/my-learning"
            linkText="View All Courses"
          />
          <ContinueLearningCardSkeleton />
        </section>

        {/* Two-column layout for widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UpcomingDeadlinesSkeleton maxItems={4} />
          <RecentActivitySkeleton maxItems={5} />
        </div>

        {/* Assigned Courses Skeleton */}
        <section className="space-y-4">
          <SectionHeader title="Assigned Learning" icon={Sparkles} />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <AssignedCourseCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--color-lxd-error)]/10 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-[var(--color-lxd-error)]" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load dashboard</h3>
          <p className="text-muted-foreground max-w-sm mb-4">{error}</p>
          <Button type="button" onClick={fetchDashboard} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Welcome Section */}
      <WelcomeCard userName={userName} progressSummary={progressSummary} />

      {/* Continue Learning - Hero card */}
      {lastAccessedCourse && (
        <section className="space-y-4">
          <SectionHeader
            title="Continue Learning"
            icon={BookOpen}
            href="/ignite/learn/my-learning"
            linkText="View All Courses"
          />
          <ContinueLearningCard course={lastAccessedCourse} />
        </section>
      )}

      {/* Two-column layout for widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <UpcomingDeadlines courses={allCourses} maxItems={4} />

        {/* Recent Activity */}
        <RecentActivity activities={recentActivity} maxItems={5} />
      </div>

      {/* Assigned Courses Grid */}
      {assignedCourses.length > 0 && (
        <section className="space-y-4">
          <SectionHeader
            title="Assigned Learning"
            icon={Sparkles}
            count={assignedCourses.length}
            href="/ignite/learn/my-learning"
            linkText="View All"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {assignedCourses.slice(0, 6).map((course) => (
              <AssignedCourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      {/* Achievement Badges */}
      {badges.length > 0 && <AchievementBadges badges={adaptBadges(badges)} maxItems={8} />}

      {/* Empty state when no data */}
      {inProgressCourses.length === 0 &&
        assignedCourses.length === 0 &&
        completedCourses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-lxd-primary/10 mb-4">
              <BookOpen className="h-8 w-8 text-lxd-primary" aria-hidden />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Welcome to Your Learning Hub
            </h3>
            <p className="text-muted-foreground max-w-sm mb-4">
              You don't have any courses assigned yet. Browse the catalog to start your learning
              journey!
            </p>
            <Link
              href="/ignite/learn/catalog"
              className={cn(
                'inline-flex items-center gap-2 px-6 py-3 rounded-lg',
                'bg-lxd-primary hover:bg-lxd-primary/90 text-white font-semibold',
                'transition-all focus:outline-none focus:ring-2 focus:ring-lxd-primary focus:ring-offset-2',
              )}
            >
              Browse Course Catalog
              <ChevronRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
        )}
    </div>
  );
}

/**
 * Section header component for dashboard sections
 */
interface SectionHeaderProps {
  title: string;
  icon?: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  count?: number;
  href?: string;
  linkText?: string;
}

function SectionHeader({
  title,
  icon: Icon,
  count,
  href,
  linkText = 'View All',
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {Icon && (
          <div className="p-1.5 rounded-md bg-lxd-primary/10">
            <Icon className="w-4 h-4 text-lxd-primary" aria-hidden />
          </div>
        )}
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {typeof count === 'number' && count > 0 && (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-lxd-primary/20 text-lxd-primary">
            {count}
          </span>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className={cn(
            'flex items-center gap-1 text-sm text-muted-foreground',
            'hover:text-lxd-primary transition-colors',
            'focus:outline-none focus:text-lxd-primary',
          )}
        >
          {linkText}
          <ChevronRight className="w-4 h-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}
