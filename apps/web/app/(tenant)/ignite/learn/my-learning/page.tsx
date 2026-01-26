'use client';

export const dynamic = 'force-dynamic';

import { Award, BookMarked, CheckCircle2, Play, Sparkles } from 'lucide-react';
import {
  CourseCard,
  CourseCardSkeleton,
  LearningSection,
  WelcomeCard,
} from '@/components/ignite/learner';
import {
  mockAssignedCourses,
  mockCompletedCourses,
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
 * - Continue Learning (in-progress courses)
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

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Welcome Section */}
      <WelcomeCard userName={userName} progressSummary={mockProgressSummary} />

      {/* Continue Learning (in-progress courses) */}
      <LearningSection
        title="Continue Learning"
        icon={Play}
        itemCount={inProgressCourses.length}
        viewAllHref="/ignite/learn/progress"
        viewAllText="View Progress"
        emptyMessage="You haven't started any courses yet. Browse the catalog to begin learning!"
        isEmpty={inProgressCourses.length === 0}
        columns={2}
        skeleton={<CourseCardSkeleton />}
      >
        {inProgressCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </LearningSection>

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
