'use client';

import { Award, BookCheck, ChevronRight, Clock, Flame, Target, TrendingUp } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export interface CourseProgress {
  /** Course ID */
  courseId: string;
  /** Course title */
  title: string;
  /** Progress percentage (0-100) */
  progress: number;
  /** Whether course is completed */
  isCompleted: boolean;
}

export interface ProgressStats {
  /** Total number of assigned courses */
  totalCourses: number;
  /** Number of completed courses */
  completedCourses: number;
  /** Number of in-progress courses */
  inProgressCourses: number;
  /** Total time spent learning (in minutes) */
  totalTimeMinutes: number;
  /** Current learning streak (days) */
  streakDays: number;
  /** Skills mastered count */
  skillsMastered: number;
  /** Certificates earned */
  certificatesEarned: number;
}

export interface ProgressOverviewWidgetProps {
  /** Overall learning statistics */
  stats: ProgressStats;
  /** Recent courses with progress */
  recentCourses?: CourseProgress[];
  /** Loading state */
  isLoading?: boolean;
  /** Additional class names */
  className?: string;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}

function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  label,
  sublabel,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  sublabel?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        role="img"
        aria-label={`Progress: ${value}%`}
      >
        <title>Progress: {value}%</title>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-lxd-primary)" />
            <stop offset="100%" stopColor="var(--color-lxd-secondary, #06b6d4)" />
          </linearGradient>
        </defs>
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{label}</span>
        {sublabel && <span className="text-xs text-muted-foreground">{sublabel}</span>}
      </div>
    </div>
  );
}

function StatItem({
  icon: Icon,
  value,
  label,
  colorClass,
}: {
  icon: React.ElementType;
  value: string | number;
  label: string;
  colorClass?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg',
          colorClass ?? 'bg-muted/30 text-muted-foreground',
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-lg font-semibold leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function CourseProgressItem({ course }: { course: CourseProgress }) {
  return (
    <Link
      href={`/learn/course/${course.courseId}`}
      className="flex items-center gap-3 rounded-lg p-2 -mx-2 hover:bg-muted/20 transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate group-hover:text-lxd-primary transition-colors">
          {course.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Progress value={course.progress} className="h-1.5 flex-1" />
          <span className="text-xs text-muted-foreground w-9 text-right">{course.progress}%</span>
        </div>
      </div>
      {course.isCompleted ? (
        <BookCheck className="h-5 w-5 text-emerald-400 shrink-0" />
      ) : (
        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      )}
    </Link>
  );
}

function SkeletonLoader() {
  return (
    <Card variant="glass">
      <CardHeader className="pb-2">
        <div className="h-5 w-32 bg-muted/30 rounded animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <div className="h-28 w-28 rounded-full bg-muted/30 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted/30 animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-4 w-12 bg-muted/30 rounded animate-pulse" />
                <div className="h-3 w-16 bg-muted/30 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * ProgressOverviewWidget - Visual summary of learning progress
 *
 * Displays completed vs assigned courses with circular progress,
 * key stats, and recent course list.
 *
 * @example
 * ```tsx
 * <ProgressOverviewWidget
 *   stats={{
 *     totalCourses: 12,
 *     completedCourses: 5,
 *     inProgressCourses: 3,
 *     totalTimeMinutes: 1250,
 *     streakDays: 7,
 *     skillsMastered: 15,
 *     certificatesEarned: 2,
 *   }}
 *   recentCourses={recentCourses}
 * />
 * ```
 */
export function ProgressOverviewWidget({
  stats,
  recentCourses = [],
  isLoading = false,
  className,
}: ProgressOverviewWidgetProps) {
  if (isLoading) {
    return <SkeletonLoader />;
  }

  const completionPercent =
    stats.totalCourses > 0 ? Math.round((stats.completedCourses / stats.totalCourses) * 100) : 0;

  return (
    <Card variant="glass" className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-5 w-5 text-lxd-primary" />
          Learning Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Circular Progress */}
        <div className="flex justify-center">
          <CircularProgress
            value={completionPercent}
            label={`${completionPercent}%`}
            sublabel="Complete"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatItem
            icon={BookCheck}
            value={`${stats.completedCourses}/${stats.totalCourses}`}
            label="Courses"
            colorClass="bg-emerald-500/10 text-emerald-400"
          />
          <StatItem
            icon={Clock}
            value={formatDuration(stats.totalTimeMinutes)}
            label="Time Spent"
            colorClass="bg-cyan-500/10 text-cyan-400"
          />
          <StatItem
            icon={Flame}
            value={stats.streakDays}
            label="Day Streak"
            colorClass="bg-orange-500/10 text-orange-400"
          />
          <StatItem
            icon={Target}
            value={stats.skillsMastered}
            label="Skills Mastered"
            colorClass="bg-violet-500/10 text-violet-400"
          />
        </div>

        {/* Certificates */}
        {stats.certificatesEarned > 0 && (
          <div className="flex items-center justify-between rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-400" />
              <span className="text-sm font-medium">
                {stats.certificatesEarned} Certificate{stats.certificatesEarned !== 1 ? 's' : ''}{' '}
                Earned
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              href="/learn/achievements"
              className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/20"
            >
              View
            </Button>
          </div>
        )}

        {/* Recent Courses */}
        {recentCourses.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Recent Courses</h4>
            <div className="space-y-1">
              {recentCourses.slice(0, 3).map((course) => (
                <CourseProgressItem key={course.courseId} course={course} />
              ))}
            </div>
            {recentCourses.length > 3 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full mt-2"
                href="/learn/my-learning"
              >
                View All Courses
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
