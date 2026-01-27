'use client';

import { Clock, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { LearnerCourse } from '@/types/lms/learner-dashboard';

export interface ContinueLearningCardProps {
  /** Course to continue */
  course: LearnerCourse;
  /** Loading state */
  isLoading?: boolean;
  /** Additional class names */
  className?: string;
}

function formatLastAccessed(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * ContinueLearningCard - Featured card for resuming last accessed course
 *
 * Features:
 * - Large hero thumbnail with play button overlay
 * - Progress bar with lesson count
 * - Resume button with time estimate
 * - Keyboard accessible
 */
export function ContinueLearningCard({
  course,
  isLoading = false,
  className,
}: ContinueLearningCardProps) {
  if (isLoading) {
    return <ContinueLearningCardSkeleton className={className} />;
  }

  const courseUrl = `/ignite/learn/player/${course.id}/lesson-1`;
  const remainingLessons = course.totalLessons - course.completedLessons;
  const remainingMinutes = Math.round((course.estimatedMinutes * (100 - course.progress)) / 100);

  return (
    <Card
      className={cn(
        'bg-lxd-dark-surface border-lxd-dark-border overflow-hidden',
        'hover:border-lxd-primary/50 hover:shadow-[0_0_30px_rgba(0,114,245,0.15)]',
        'transition-all duration-300 group',
        className,
      )}
    >
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Thumbnail section */}
          <div className="relative w-full md:w-2/5 h-48 md:h-auto overflow-hidden">
            {course.thumbnailUrl ? (
              <Image
                src={course.thumbnailUrl}
                alt={course.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            ) : (
              <div className="w-full h-full min-h-[192px] flex items-center justify-center bg-gradient-to-br from-lxd-primary/20 to-lxd-secondary/20">
                <Play className="w-16 h-16 text-lxd-primary/40" aria-hidden />
              </div>
            )}

            {/* Play overlay */}
            <Link
              href={courseUrl}
              className={cn(
                'absolute inset-0 flex items-center justify-center',
                'bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity',
                'focus:opacity-100 focus:outline-none',
              )}
              aria-label={`Resume ${course.title}`}
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-lxd-primary shadow-lg shadow-lxd-primary/30">
                <Play className="w-8 h-8 text-white ml-1" aria-hidden />
              </div>
            </Link>

            {/* Last accessed badge */}
            {course.lastAccessedAt && (
              <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-xs text-white/80">
                <Clock className="w-3 h-3 inline-block mr-1" aria-hidden />
                {formatLastAccessed(course.lastAccessedAt)}
              </div>
            )}
          </div>

          {/* Content section */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-lxd-primary font-medium uppercase tracking-wider mb-1">
                  Continue Learning
                </p>
                <h3 className="text-xl font-bold text-foreground line-clamp-2 group-hover:text-lxd-primary transition-colors">
                  {course.title}
                </h3>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {course.completedLessons} of {course.totalLessons} lessons
                  </span>
                  <span className="font-semibold text-lxd-primary">{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>
            </div>

            {/* Action button */}
            <div className="mt-4 flex items-center gap-4">
              <Link
                href={courseUrl}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg',
                  'bg-lxd-primary hover:bg-lxd-primary/90 text-white font-semibold',
                  'transition-all focus:outline-none focus:ring-2 focus:ring-lxd-primary focus:ring-offset-2',
                  'focus:ring-offset-lxd-dark-surface shadow-lg shadow-lxd-primary/25',
                )}
              >
                <Play className="w-5 h-5" aria-hidden />
                Resume Course
              </Link>
              <div className="text-sm text-muted-foreground text-right">
                <p className="font-medium text-foreground">{remainingLessons} lessons left</p>
                <p>~{formatDuration(remainingMinutes)} remaining</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * ContinueLearningCardSkeleton - Loading placeholder
 */
export function ContinueLearningCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('bg-lxd-dark-surface border-lxd-dark-border overflow-hidden', className)}>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-2/5 h-48 md:h-auto bg-muted/30 animate-pulse" />
          <div className="flex-1 p-6 space-y-4">
            <div className="space-y-2">
              <div className="h-3 w-24 bg-muted/30 rounded animate-pulse" />
              <div className="h-6 w-3/4 bg-muted/30 rounded animate-pulse" />
            </div>
            <div className="h-4 w-full bg-muted/30 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="h-3 w-24 bg-muted/30 rounded animate-pulse" />
                <div className="h-3 w-10 bg-muted/30 rounded animate-pulse" />
              </div>
              <div className="h-2 w-full bg-muted/30 rounded-full animate-pulse" />
            </div>
            <div className="h-12 w-full bg-muted/30 rounded-lg animate-pulse mt-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
