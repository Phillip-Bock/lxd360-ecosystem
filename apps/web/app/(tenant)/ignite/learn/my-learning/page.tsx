'use client';

export const dynamic = 'force-dynamic';

import { Award, BookMarked, CheckCircle2, Play, Sparkles } from 'lucide-react';
import {
  AchievementBadges,
  ContinueLearningWidget,
  CourseCard,
  CourseCardSkeleton,
  DeadlinesWidget,
  LearningSection,
  WelcomeCard,
} from '@/components/ignite/learner';
import {
  mockAssignedCourses,
  mockBadges,
  mockCompletedCourses,
  mockDeadlines,
  mockInProgressCourses,
  mockProgressSummary,
  mockRecommendedCourses,
} from '@/lib/mock/learner-dashboard';
import { useSafeAuth } from '@/providers/SafeAuthProvider';

/**
 * My Learning Dashboard - Learner's personal learning hub
 *
 * Sections:
 * - Welcome Card with progress summary
 * - Continue Learning widget (hero card for last accessed course)
 * - Sidebar: Deadlines + Achievements
 * - Assigned Learning (required courses not started)
 * - Recommended (AI suggestions placeholder)
 * - Completed (achievement history)
 *
 * TODO(LXD-337): Replace mock data with Firestore queries
 */
export default function MyLearningPage() {
  const { user } = useSafeAuth();

  // Get user's display name
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Learner';

  // Filter courses by status
  const inProgressCourses = mockInProgressCourses;
  const assignedCourses = mockAssignedCourses;
  const recommendedCourses = mockRecommendedCourses;
  const completedCourses = mockCompletedCourses;

  // Get the most recently accessed course for Continue Learning widget
  const lastAccessedCourse =
    inProgressCourses.length > 0
      ? [...inProgressCourses].sort((a, b) => {
          const aDate = a.lastAccessedAt ? new Date(a.lastAccessedAt).getTime() : 0;
          const bDate = b.lastAccessedAt ? new Date(b.lastAccessedAt).getTime() : 0;
          return bDate - aDate;
        })[0]
      : null;

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Welcome Section */}
      <WelcomeCard userName={userName} progressSummary={mockProgressSummary} />

      {/* Main content area with sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Continue Learning Widget (hero card) */}
          <ContinueLearningWidget course={lastAccessedCourse} />

          {/* In-progress courses (compact view) */}
          {inProgressCourses.length > 1 && (
            <LearningSection
              title="In Progress"
              icon={Play}
              itemCount={inProgressCourses.length}
              viewAllHref="/ignite/learn/progress"
              viewAllText="View Progress"
              emptyMessage="You haven't started any courses yet."
              isEmpty={inProgressCourses.length === 0}
              columns={2}
              skeleton={<CourseCardSkeleton variant="compact" />}
            >
              {inProgressCourses
                .filter((c) => c.id !== lastAccessedCourse?.id)
                .slice(0, 4)
                .map((course) => (
                  <CourseCard key={course.id} course={course} variant="compact" />
                ))}
            </LearningSection>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <DeadlinesWidget deadlines={mockDeadlines} maxItems={4} />

          {/* Achievement Badges */}
          <AchievementBadges badges={mockBadges} maxItems={6} />
        </div>
      </div>

      {/* Assigned Learning (required courses) */}
      <LearningSection
        title="Assigned Learning"
        icon={BookMarked}
        itemCount={assignedCourses.length}
        viewAllHref="/ignite/learn/catalog?filter=assigned"
        emptyMessage="No courses have been assigned to you yet."
        isEmpty={assignedCourses.length === 0}
        columns={3}
        skeleton={<CourseCardSkeleton />}
      >
        {assignedCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </LearningSection>

      {/* Recommended (AI suggestions) */}
      <LearningSection
        title="Recommended for You"
        icon={Sparkles}
        itemCount={recommendedCourses.length}
        viewAllHref="/ignite/learn/catalog?filter=recommended"
        viewAllText="Browse More"
        emptyMessage="Complete more courses to get personalized recommendations."
        isEmpty={recommendedCourses.length === 0}
        columns={3}
        skeleton={<CourseCardSkeleton />}
      >
        {recommendedCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </LearningSection>

      {/* Completed (achievement history) */}
      <LearningSection
        title="Completed"
        icon={Award}
        itemCount={completedCourses.length}
        viewAllHref="/ignite/learn/achievements"
        viewAllText="View Achievements"
        emptyMessage="Complete your first course to see it here!"
        emptyIcon={CheckCircle2}
        isEmpty={completedCourses.length === 0}
        columns={2}
        skeleton={<CourseCardSkeleton variant="completed" />}
      >
        {completedCourses.map((course) => (
          <CourseCard key={course.id} course={course} variant="completed" />
        ))}
      </LearningSection>
    </div>
  );
}
