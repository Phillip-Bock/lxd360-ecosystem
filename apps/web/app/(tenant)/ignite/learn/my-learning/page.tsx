'use client';

export const dynamic = 'force-dynamic';

import { AlertCircle, Award, BookMarked, Loader2, Play, RefreshCw, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  CourseCard,
  CourseCardSkeleton,
  LearningSection,
  WelcomeCard,
} from '@/components/ignite/learner';
import { Button } from '@/components/ui/button';
import { useSafeAuth } from '@/providers/SafeAuthProvider';
import type {
  CompletedCourseRecord,
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
 * My Learning Dashboard - Learner's personal learning hub
 *
 * Sections:
 * - Welcome Card with progress summary
 * - Continue Learning (in-progress courses)
 * - Assigned Learning (required courses not started)
 * - Recommended (AI suggestions)
 * - Completed (achievement history)
 */
export default function MyLearningPage() {
  const { user } = useSafeAuth();

  // State for dashboard data
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressSummary, setProgressSummary] =
    useState<LearnerProgressSummary>(defaultProgressSummary);
  const [inProgressCourses, setInProgressCourses] = useState<LearnerCourse[]>([]);
  const [assignedCourses, setAssignedCourses] = useState<LearnerCourse[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<RecommendedCourse[]>([]);
  const [completedCourses, setCompletedCourses] = useState<CompletedCourseRecord[]>([]);

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
      // JSON responses contain ISO date strings that need to be parsed
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

      setProgressSummary(data.progressSummary);
      setInProgressCourses(data.inProgressCourses.map(parseCourseDates));
      setAssignedCourses(data.assignedCourses.map(parseCourseDates));
      setRecommendedCourses(data.recommendedCourses.map(parseCourseDates));
      setCompletedCourses(data.completedCourses.map(parseCourseDates));
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

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2
            className="w-8 h-8 animate-spin text-[var(--color-lxd-primary)]"
            aria-hidden="true"
          />
          <p className="text-muted-foreground mt-4">Loading your learning dashboard...</p>
        </div>
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
