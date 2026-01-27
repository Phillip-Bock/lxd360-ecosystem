'use client';

export const dynamic = 'force-dynamic';

import {
  AlertCircle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  Play,
  RefreshCw,
  Target,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useSafeAuth } from '@/providers/SafeAuthProvider';
import type {
  CompletedCourseRecord,
  LearnerCourse,
  LearnerProgressSummary,
} from '@/types/lms/learner-dashboard';

/** Get Firebase ID token for API authentication */
async function getIdToken(): Promise<string> {
  const { getAuth } = await import('firebase/auth');
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

/** Activity item type from API */
interface ActivityItem {
  id: string;
  type:
    | 'course_started'
    | 'lesson_completed'
    | 'course_completed'
    | 'badge_earned'
    | 'skill_improved';
  title: string;
  courseId?: string;
  courseTitle?: string;
  timestamp: Date;
  metadata?: {
    score?: number;
    progress?: number;
    xpEarned?: number;
    skillName?: string;
    badgeName?: string;
  };
}

/** Dashboard API response shape */
interface DashboardResponse {
  progressSummary: LearnerProgressSummary;
  inProgressCourses: LearnerCourse[];
  assignedCourses: LearnerCourse[];
  completedCourses: CompletedCourseRecord[];
  recentActivity?: ActivityItem[];
}

/** Skill mastery data */
interface SkillMastery {
  name: string;
  mastery: number;
  trend: 'up' | 'stable' | 'down';
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
 * Derive skills mastery from completed courses
 * In production, this would come from a dedicated skills tracking system
 */
function deriveSkillsFromCourses(completedCourses: CompletedCourseRecord[]): SkillMastery[] {
  // Group courses by category and calculate average scores
  const categoryScores = new Map<string, { total: number; count: number }>();

  for (const course of completedCourses) {
    const category = course.category || 'General';
    const score = course.finalScore || 80; // Default score if not available
    const existing = categoryScores.get(category) || { total: 0, count: 0 };
    categoryScores.set(category, {
      total: existing.total + score,
      count: existing.count + 1,
    });
  }

  // Convert to skill mastery array
  const skills: SkillMastery[] = [];
  for (const [name, { total, count }] of categoryScores.entries()) {
    skills.push({
      name,
      mastery: Math.round(total / count),
      trend: 'stable', // Would need historical data for actual trends
    });
  }

  // Sort by mastery descending and limit to top 5
  return skills.sort((a, b) => b.mastery - a.mastery).slice(0, 5);
}

/**
 * Progress Overview page - Track learning journey and skill mastery
 */
export default function ProgressPage() {
  const { user } = useSafeAuth();

  // State for progress data
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressSummary, setProgressSummary] =
    useState<LearnerProgressSummary>(defaultProgressSummary);
  const [completedCourses, setCompletedCourses] = useState<CompletedCourseRecord[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [skills, setSkills] = useState<SkillMastery[]>([]);

  // Calculate derived values
  const hoursLearned = Math.round(progressSummary.totalTimeSpent / 60);
  const weeklyGoalTarget = 5; // Hours per week target (could be configurable)
  const weeklyGoalCompleted = Math.min(Math.round(hoursLearned / 4), weeklyGoalTarget); // Estimate based on recent activity

  // Fetch progress data
  const fetchProgress = useCallback(async () => {
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
        throw new Error(errorData.error || 'Failed to fetch progress data');
      }

      const data: DashboardResponse = await response.json();

      // Parse date strings
      const parseCourseDates = <T extends LearnerCourse>(course: T): T => ({
        ...course,
        completedAt:
          'completedAt' in course && course.completedAt
            ? new Date(course.completedAt as unknown as string)
            : undefined,
      });

      const parseActivityDates = (activity: ActivityItem): ActivityItem => ({
        ...activity,
        timestamp: new Date(activity.timestamp as unknown as string),
      });

      const parsedCompleted = data.completedCourses.map(parseCourseDates);

      setProgressSummary(data.progressSummary);
      setCompletedCourses(parsedCompleted);
      setRecentActivity(data.recentActivity ? data.recentActivity.map(parseActivityDates) : []);
      setSkills(deriveSkillsFromCourses(parsedCompleted));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user, fetchProgress]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">My Progress</h1>
          <p className="text-muted-foreground mt-1">
            Track your learning journey and skill development
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2
            className="w-8 h-8 animate-spin text-[var(--color-lxd-primary)]"
            aria-hidden="true"
          />
          <p className="text-muted-foreground mt-4">Loading your progress...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">My Progress</h1>
          <p className="text-muted-foreground mt-1">
            Track your learning journey and skill development
          </p>
        </div>

        {/* Error message */}
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--color-lxd-error)]/10 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-[var(--color-lxd-error)]" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load progress</h3>
          <p className="text-muted-foreground max-w-sm mb-4">{error}</p>
          <Button type="button" onClick={fetchProgress} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-primary">My Progress</h1>
        <p className="text-muted-foreground mt-1">
          Track your learning journey and skill development
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          icon={BookOpen}
          label="Courses Completed"
          value={progressSummary.completed}
          subtext={`of ${progressSummary.totalAssigned}`}
        />
        <StatCard
          icon={Target}
          label="In Progress"
          value={progressSummary.inProgress}
          subtext="active courses"
        />
        <StatCard icon={Clock} label="Hours Learned" value={hoursLearned} subtext="total time" />
        <StatCard
          icon={Calendar}
          label="Learning Streak"
          value={progressSummary.currentStreak}
          subtext="days"
        />
        <StatCard
          icon={TrendingUp}
          label="Overall Progress"
          value={`${progressSummary.overallProgress}%`}
          subtext="completion"
        />
        <StatCard
          icon={Award}
          label="Total XP"
          value={progressSummary.totalXp.toLocaleString()}
          subtext={`Level ${progressSummary.level}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills Mastery */}
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardHeader>
            <CardTitle className="text-brand-primary">Skills Mastery</CardTitle>
            <CardDescription>Your proficiency levels across different skill areas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {skills.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/20 mb-3">
                  <Target className="h-6 w-6 text-muted-foreground" aria-hidden />
                </div>
                <p className="text-sm text-muted-foreground">No skills tracked yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Complete courses to build your skill profile
                </p>
              </div>
            ) : (
              skills.map((skill) => (
                <div key={skill.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-brand-primary">{skill.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{skill.mastery}%</span>
                      {skill.trend === 'up' && (
                        <TrendingUp className="w-4 h-4 text-green-500" aria-label="Trending up" />
                      )}
                    </div>
                  </div>
                  <Progress value={skill.mastery} className="h-2" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardHeader>
            <CardTitle className="text-brand-primary">Recent Activity</CardTitle>
            <CardDescription>Your latest learning milestones</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/20 mb-3">
                  <BookOpen className="h-6 w-6 text-muted-foreground" aria-hidden />
                </div>
                <p className="text-sm text-muted-foreground">No recent activity</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Start learning to see your progress here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.slice(0, 6).map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Goal Progress */}
      <Card className="bg-lxd-dark-surface border-lxd-dark-border">
        <CardHeader>
          <CardTitle className="text-brand-primary">Weekly Learning Goal</CardTitle>
          <CardDescription>
            {weeklyGoalCompleted} of {weeklyGoalTarget} hours completed this week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={(weeklyGoalCompleted / weeklyGoalTarget) * 100} className="h-4" />
          <p className="text-sm text-muted-foreground mt-2">
            {weeklyGoalTarget - weeklyGoalCompleted} hours remaining to reach your goal
          </p>
        </CardContent>
      </Card>

      {/* Completed Courses Section */}
      {completedCourses.length > 0 && (
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-brand-primary">Completed Courses</CardTitle>
                <CardDescription>
                  {completedCourses.length} course
                  {completedCourses.length !== 1 ? 's' : ''} completed
                </CardDescription>
              </div>
              <Link
                href="/ignite/learn/achievements"
                className="text-sm text-muted-foreground hover:text-lxd-primary transition-colors"
              >
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedCourses.slice(0, 4).map((course) => (
                <div
                  key={course.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-lxd-dark-bg/50"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/20 shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-500" aria-hidden />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-primary truncate">
                      {course.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {course.finalScore && (
                        <span className="text-xs text-muted-foreground">
                          Score: {course.finalScore}%
                        </span>
                      )}
                      {course.completedAt && (
                        <>
                          <span className="text-muted-foreground text-xs">·</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(course.completedAt).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-purple-400 shrink-0">+{course.xpEarned} XP</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subtext: string;
}

function StatCard({ icon: Icon, label, value, subtext }: StatCardProps) {
  return (
    <Card className="bg-lxd-dark-surface border-lxd-dark-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-4 h-4 text-lxd-purple" aria-hidden="true" />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <p className="text-2xl font-bold text-brand-primary">{value}</p>
        <p className="text-xs text-muted-foreground">{subtext}</p>
      </CardContent>
    </Card>
  );
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

function ActivityItem({ activity }: { activity: ActivityItem }) {
  const iconConfig = activityIcons[activity.type];
  const Icon = iconConfig.icon;
  const xp = activity.metadata?.xpEarned;
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
          {activity.title}
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
