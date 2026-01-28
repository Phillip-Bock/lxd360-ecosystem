'use client';

import { Clock, Play, Target } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { LearnerCourse } from '@/types/lms/learner-dashboard';

export interface ContinueLearningWidgetProps {
  /** The course to continue (most recently accessed) */
  course: LearnerCourse | null;
  /** Additional class names */
  className?: string;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * ContinueLearningWidget - Hero-style card showing last accessed course
 *
 * Features:
 * - Large thumbnail with gradient overlay
 * - Progress bar and lessons count
 * - Prominent "Resume" button
 * - Time since last access
 */
export function ContinueLearningWidget({ course, className }: ContinueLearningWidgetProps) {
  if (!course) {
    return (
      <Card className={cn('bg-lxd-dark-surface border-lxd-dark-border overflow-hidden', className)}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
              <Play className="w-8 h-8 text-muted-foreground" aria-hidden />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Start Your Learning Journey
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Browse the course catalog to find your first course and begin learning
            </p>
            <Link
              href="/ignite/learn/catalog"
              className={cn(
                'mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg',
                'bg-lxd-primary hover:bg-lxd-primary/90 text-white font-medium',
                'transition-colors focus:outline-none focus:ring-2 focus:ring-lxd-primary focus:ring-offset-2',
              )}
            >
              Browse Catalog
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const courseUrl = `/ignite/learn/player/${course.id}/lesson-1`;
  const remainingLessons = course.totalLessons - course.completedLessons;
  const remainingTime = Math.round((course.estimatedMinutes * (100 - course.progress)) / 100);

  return (
    <Card
      className={cn(
        'bg-lxd-dark-surface border-lxd-dark-border overflow-hidden',
        'hover:border-lxd-primary/50 hover:shadow-[0_0_30px_rgba(0,114,245,0.15)]',
        'transition-all duration-300 group',
        className,
      )}
    >
      <div className="relative">
        {/* Background thumbnail with gradient overlay */}
        <div className="relative h-48 sm:h-56 overflow-hidden">
          {course.thumbnailUrl ? (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-lxd-primary/30 to-lxd-secondary/30" />
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-lxd-dark-surface via-lxd-dark-surface/60 to-transparent" />
        </div>

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          {/* Last accessed badge */}
          {course.lastAccessedAt && (
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-black/50 backdrop-blur-sm text-white/90">
                <Clock className="w-3 h-3" aria-hidden />
                {formatTimeAgo(course.lastAccessedAt)}
              </span>
            </div>
          )}

          {/* Course info */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-lxd-primary uppercase tracking-wider mb-1">
                Continue Learning
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-white line-clamp-2">
                {course.title}
              </h3>
              <p className="text-sm text-white/70 line-clamp-2 mt-1">{course.description}</p>
            </div>

            {/* Progress section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">
                  {course.completedLessons}/{course.totalLessons} lessons completed
                </span>
                <span className="font-semibold text-white">{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="h-2" />
            </div>

            {/* Action row */}
            <div className="flex items-center justify-between gap-4">
              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-white/70">
                <span className="flex items-center gap-1.5">
                  <Target className="w-4 h-4" aria-hidden />
                  {remainingLessons} lessons left
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" aria-hidden />~{formatDuration(remainingTime)}{' '}
                  remaining
                </span>
              </div>

              {/* Resume button */}
              <Link
                href={courseUrl}
                className={cn(
                  'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg',
                  'bg-lxd-primary hover:bg-lxd-primary/90 text-white font-semibold',
                  'transition-all duration-200 shadow-lg shadow-lxd-primary/25',
                  'focus:outline-none focus:ring-2 focus:ring-lxd-primary focus:ring-offset-2',
                  'focus:ring-offset-lxd-dark-surface',
                  'group-hover:shadow-lxd-primary/40',
                )}
              >
                <Play className="w-4 h-4" aria-hidden />
                Resume
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * ContinueLearningWidgetSkeleton - Loading placeholder
 */
export function ContinueLearningWidgetSkeleton() {
  return (
    <Card className="bg-lxd-dark-surface border-lxd-dark-border overflow-hidden">
      <div className="relative h-48 sm:h-56 bg-muted/20 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-lxd-dark-surface via-lxd-dark-surface/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-3 w-24 bg-muted/30 rounded animate-pulse" />
              <div className="h-7 w-3/4 bg-muted/30 rounded animate-pulse" />
              <div className="h-4 w-full bg-muted/30 rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full bg-muted/30 rounded-full animate-pulse" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <div className="h-4 w-24 bg-muted/30 rounded animate-pulse" />
                <div className="h-4 w-24 bg-muted/30 rounded animate-pulse" />
              </div>
              <div className="h-10 w-24 bg-muted/30 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
