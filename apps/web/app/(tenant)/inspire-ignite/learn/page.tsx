'use client';

export const dynamic = 'force-dynamic';

import { BookOpen, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { WelcomeCard } from '@/components/ignite/learner';
import {
  AchievementBadges,
  AssignedCourseCard,
  ContinueLearningCard,
  RecentActivity,
  UpcomingDeadlines,
} from '@/components/lms/learner';
import type { Badge } from '@/components/lms/learner/achievement-badges';
import type { ActivityItem } from '@/components/lms/learner/recent-activity';
import { cn } from '@/lib/utils';
import { useSafeAuth } from '@/providers/SafeAuthProvider';
import type {
  LearnerBadge,
  LearnerCourse,
  LearnerProgressSummary,
} from '@/types/lms/learner-dashboard';

/**
 * API response shape for learner dashboard
 */
interface LearnerDashboardResponse {
  progressSummary: LearnerProgressSummary;
  inProgressCourses: LearnerCourse[];
  assignedCourses: LearnerCourse[];
  badges: LearnerBadge[];
  activities: ActivityItem[];
}

/**
 * Default empty progress summary for loading/empty states
 */
const emptyProgressSummary: LearnerProgressSummary = {
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
    earnedAt: new Date(badge.earnedAt),
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
 *
 * Connected to Firestore via /api/ignite/learner/dashboard
 */
export default function LearnDashboardPage() {
  const { user } = useSafeAuth();

  // State for dashboard data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressSummary, setProgressSummary] =
    useState<LearnerProgressSummary>(emptyProgressSummary);
  const [inProgressCourses, setInProgressCourses] = useState<LearnerCourse[]>([]);
  const [assignedCourses, setAssignedCourses] = useState<LearnerCourse[]>([]);
  const [badges, setBadges] = useState<LearnerBadge[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Get user's display name
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Learner';

  // Fetch dashboard data from API
  const fetchDashboardData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/ignite/learner/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch dashboard: ${response.status}`);
      }

      const data: LearnerDashboardResponse = await response.json();

      // Convert date strings back to Date objects for courses
      const parseCourseDates = (course: LearnerCourse): LearnerCourse => ({
        ...course,
        dueDate: course.dueDate ? new Date(course.dueDate) : undefined,
        completedAt: course.completedAt ? new Date(course.completedAt) : undefined,
        lastAccessedAt: course.lastAccessedAt ? new Date(course.lastAccessedAt) : undefined,
      });

      // Convert date strings for activities
      const parseActivityDates = (activity: ActivityItem): ActivityItem => ({
        ...activity,
        timestamp: new Date(activity.timestamp),
      });

      // Convert date strings for badges
      const parseBadgeDates = (badge: LearnerBadge): LearnerBadge => ({
        ...badge,
        earnedAt: new Date(badge.earnedAt),
      });

      setProgressSummary(data.progressSummary);
      setInProgressCourses(data.inProgressCourses.map(parseCourseDates));
      setAssignedCourses(data.assignedCourses.map(parseCourseDates));
      setBadges(data.badges.map(parseBadgeDates));
      setActivities(data.activities.map(parseActivityDates));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch data on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  // Get most recently accessed course for continue learning
  const sortedInProgress = [...inProgressCourses].sort((a, b) => {
    const aTime = a.lastAccessedAt ? new Date(a.lastAccessedAt).getTime() : 0;
    const bTime = b.lastAccessedAt ? new Date(b.lastAccessedAt).getTime() : 0;
    return bTime - aTime;
  });
  const lastAccessedCourse = sortedInProgress[0];

  // Combine all courses with due dates for deadline widget
  const allCourses = [...inProgressCourses, ...assignedCourses];

  // Show error state
  if (error && !loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 mb-4">
            <BookOpen className="h-8 w-8 text-red-500" aria-hidden />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Unable to Load Dashboard</h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">{error}</p>
          <button
            type="button"
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-lxd-primary text-white rounded-md hover:bg-lxd-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Welcome Section */}
      <WelcomeCard userName={userName} progressSummary={progressSummary} isLoading={loading} />

      {/* Continue Learning - Hero card */}
      {!loading && lastAccessedCourse && (
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
        <UpcomingDeadlines courses={allCourses} maxItems={4} isLoading={loading} />

        {/* Recent Activity */}
        <RecentActivity activities={activities} maxItems={5} isLoading={loading} />
      </div>

      {/* Assigned Courses Grid */}
      {!loading && assignedCourses.length > 0 && (
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

      {/* Empty state when no courses assigned */}
      {!loading && assignedCourses.length === 0 && inProgressCourses.length === 0 && (
        <section className="space-y-4">
          <SectionHeader title="Your Learning" icon={Sparkles} />
          <div className="flex flex-col items-center justify-center py-12 text-center bg-lxd-dark-surface rounded-lg border border-lxd-dark-border">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-lxd-primary/20 mb-4">
              <BookOpen className="h-8 w-8 text-lxd-primary" aria-hidden />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Courses Assigned Yet</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              You don't have any courses assigned. Check back soon or explore the course catalog to
              find learning opportunities.
            </p>
          </div>
        </section>
      )}

      {/* Achievement Badges */}
      <AchievementBadges badges={adaptBadges(badges)} maxItems={8} isLoading={loading} />
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
