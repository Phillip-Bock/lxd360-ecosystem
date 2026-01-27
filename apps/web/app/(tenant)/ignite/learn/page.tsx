'use client';

export const dynamic = 'force-dynamic';

import { BookOpen, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { WelcomeCard } from '@/components/ignite/learner';
import {
  AchievementBadges,
  AssignedCourseCard,
  ContinueLearningCard,
  RecentActivity,
  UpcomingDeadlines,
} from '@/components/lms/learner';
import type { Badge } from '@/components/lms/learner/AchievementBadges';
import {
  mockActivities,
  mockAssignedCourses,
  mockBadges,
  mockInProgressCourses,
  mockProgressSummary,
} from '@/lib/mock/learner-dashboard';
import { cn } from '@/lib/utils';
import { useSafeAuth } from '@/providers/SafeAuthProvider';

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
function adaptBadges(learnerBadges: typeof mockBadges): Badge[] {
  return learnerBadges.map((badge) => ({
    id: badge.id,
    name: badge.name,
    description: badge.description,
    iconType: iconToType[badge.icon] ?? 'star',
    tier: rarityToTier[badge.rarity] ?? 'bronze',
    earned: true, // All mockBadges are earned
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
 *
 * TODO(LXD-337): Replace mock data with Firestore queries
 */
export default function LearnDashboardPage() {
  const { user } = useSafeAuth();

  // Get user's display name
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Learner';

  // Get most recently accessed course for continue learning
  const sortedInProgress = [...mockInProgressCourses].sort((a, b) => {
    const aTime = a.lastAccessedAt ? new Date(a.lastAccessedAt).getTime() : 0;
    const bTime = b.lastAccessedAt ? new Date(b.lastAccessedAt).getTime() : 0;
    return bTime - aTime;
  });
  const lastAccessedCourse = sortedInProgress[0];

  // Combine all courses with due dates for deadline widget
  const allCourses = [...mockInProgressCourses, ...mockAssignedCourses];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Welcome Section */}
      <WelcomeCard userName={userName} progressSummary={mockProgressSummary} />

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
        <RecentActivity activities={mockActivities} maxItems={5} />
      </div>

      {/* Assigned Courses Grid */}
      <section className="space-y-4">
        <SectionHeader
          title="Assigned Learning"
          icon={Sparkles}
          count={mockAssignedCourses.length}
          href="/ignite/learn/my-learning"
          linkText="View All"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {mockAssignedCourses.slice(0, 6).map((course) => (
            <AssignedCourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      {/* Achievement Badges */}
      <AchievementBadges badges={adaptBadges(mockBadges)} maxItems={8} />
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
