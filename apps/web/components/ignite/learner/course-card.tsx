'use client';

import { AlertCircle, Calendar, CheckCircle2, Clock, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { LearnerCourse } from '@/types/lms/learner-dashboard';
import { ProgressRing } from './progress-ring';

export interface CourseCardProps {
  /** Course data */
  course: LearnerCourse;
  /** Card variant */
  variant?: 'default' | 'compact' | 'completed';
  /** Additional class names */
  className?: string;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function formatDueDate(date: Date): { text: string; isOverdue: boolean; isDueSoon: boolean } {
  const now = new Date();
  const dueDate = new Date(date);
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `${Math.abs(diffDays)} days overdue`, isOverdue: true, isDueSoon: false };
  }
  if (diffDays === 0) {
    return { text: 'Due today', isOverdue: false, isDueSoon: true };
  }
  if (diffDays <= 7) {
    return {
      text: `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`,
      isOverdue: false,
      isDueSoon: true,
    };
  }
  return {
    text: dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    isOverdue: false,
    isDueSoon: false,
  };
}

function formatCompletedDate(date: Date): string {
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * CourseCard - Course tile with progress bar for learner dashboard
 *
 * Features:
 * - Thumbnail with play overlay
 * - Progress bar or completion indicator
 * - Due date warnings
 * - Responsive layout
 * - Keyboard accessible
 */
export function CourseCard({ course, variant = 'default', className }: CourseCardProps) {
  const isCompleted = course.status === 'completed';
  const isNotStarted = course.status === 'not_started';
  const dueInfo = course.dueDate ? formatDueDate(course.dueDate) : null;

  const courseUrl = `/ignite/learn/player/${course.id}/lesson-1`;

  if (variant === 'compact') {
    return (
      <Card
        className={cn(
          'bg-lxd-dark-surface border-lxd-dark-border',
          'hover:border-lxd-primary/50 transition-all duration-200 group',
          className,
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Progress ring */}
            <ProgressRing
              progress={course.progress}
              size={48}
              strokeWidth={4}
              variant={isCompleted ? 'success' : course.progress >= 50 ? 'primary' : 'warning'}
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground truncate group-hover:text-lxd-primary transition-colors">
                {course.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {course.completedLessons}/{course.totalLessons} lessons
              </p>
            </div>

            {/* Action */}
            <Link
              href={courseUrl}
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full',
                'bg-lxd-primary/10 text-lxd-primary',
                'hover:bg-lxd-primary hover:text-white transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-lxd-primary focus:ring-offset-2 focus:ring-offset-lxd-dark-surface',
              )}
              aria-label={`${isNotStarted ? 'Start' : 'Continue'} ${course.title}`}
            >
              <Play className="w-4 h-4" aria-hidden />
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'completed') {
    return (
      <Card
        className={cn(
          'bg-lxd-dark-surface border-lxd-dark-border',
          'hover:border-lxd-success/50 transition-all duration-200 group',
          className,
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Thumbnail */}
            <div className="relative w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-muted/20">
              {course.thumbnailUrl ? (
                <Image
                  src={course.thumbnailUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-lxd-primary/20 to-lxd-secondary/20">
                  <CheckCircle2 className="w-6 h-6 text-lxd-success" aria-hidden />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-foreground line-clamp-1 group-hover:text-lxd-success transition-colors">
                  {course.title}
                </h3>
                <Badge variant="success" className="shrink-0">
                  <CheckCircle2 className="w-3 h-3 mr-1" aria-hidden />
                  Complete
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {course.completedAt && `Completed ${formatCompletedDate(course.completedAt)}`}
              </p>
              {course.xpReward && (
                <p className="text-xs text-purple-400 mt-1">+{course.xpReward} XP earned</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card
      className={cn(
        'bg-lxd-dark-surface border-lxd-dark-border overflow-hidden',
        'hover:border-lxd-primary/50 hover:shadow-[0_0_20px_rgba(0,114,245,0.1)]',
        'transition-all duration-200 group',
        className,
      )}
    >
      {/* Thumbnail */}
      <div className="relative h-36 overflow-hidden bg-muted/20">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-lxd-primary/20 to-lxd-secondary/20">
            <Play className="w-12 h-12 text-lxd-primary/40" aria-hidden />
          </div>
        )}

        {/* Play overlay */}
        <Link
          href={courseUrl}
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
          aria-label={`${isNotStarted ? 'Start' : 'Continue'} ${course.title}`}
        >
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm">
            <Play className="w-6 h-6 text-white" aria-hidden />
          </div>
        </Link>

        {/* Status badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {course.isRequired && (
            <Badge variant="warning" className="text-xs">
              Required
            </Badge>
          )}
          {isNotStarted && (
            <Badge variant="secondary" className="text-xs">
              New
            </Badge>
          )}
        </div>

        {/* Due date badge */}
        {dueInfo && (
          <div className="absolute top-3 right-3">
            <Badge
              variant={
                dueInfo.isOverdue ? 'destructive' : dueInfo.isDueSoon ? 'warning' : 'outline'
              }
              className="text-xs"
            >
              {dueInfo.isOverdue && <AlertCircle className="w-3 h-3 mr-1" aria-hidden />}
              <Calendar className="w-3 h-3 mr-1" aria-hidden />
              {dueInfo.text}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Title and description */}
        <div>
          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-lxd-primary transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{course.description}</p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {course.completedLessons}/{course.totalLessons} lessons
            </span>
            <span className="font-medium text-foreground">{course.progress}%</span>
          </div>
          <Progress value={course.progress} className="h-2" />
        </div>

        {/* Meta info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" aria-hidden />
            {formatDuration(course.estimatedMinutes)}
          </span>
          {course.category && <span>{course.category}</span>}
        </div>

        {/* Action button */}
        <Link
          href={courseUrl}
          className={cn(
            'flex items-center justify-center gap-2 w-full py-2.5 rounded-lg',
            'bg-lxd-primary hover:bg-lxd-primary/90 text-white font-medium',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-lxd-primary focus:ring-offset-2',
            'focus:ring-offset-lxd-dark-surface',
          )}
        >
          <Play className="w-4 h-4" aria-hidden />
          {isNotStarted ? 'Start Course' : 'Continue'}
        </Link>
      </CardContent>
    </Card>
  );
}

/**
 * CourseCardSkeleton - Loading placeholder for CourseCard
 */
export function CourseCardSkeleton({
  variant = 'default',
}: {
  variant?: 'default' | 'compact' | 'completed';
}) {
  if (variant === 'compact') {
    return (
      <Card className="bg-lxd-dark-surface border-lxd-dark-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-muted/30 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-muted/30 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-muted/30 rounded animate-pulse" />
            </div>
            <div className="w-10 h-10 rounded-full bg-muted/30 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'completed') {
    return (
      <Card className="bg-lxd-dark-surface border-lxd-dark-border">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="w-20 h-14 rounded-lg bg-muted/30 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-muted/30 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-muted/30 rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-lxd-dark-surface border-lxd-dark-border overflow-hidden">
      <div className="h-36 bg-muted/30 animate-pulse" />
      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="h-5 w-3/4 bg-muted/30 rounded animate-pulse" />
          <div className="h-4 w-full bg-muted/30 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-2 w-full bg-muted/30 rounded-full animate-pulse" />
          <div className="flex justify-between">
            <div className="h-3 w-20 bg-muted/30 rounded animate-pulse" />
            <div className="h-3 w-10 bg-muted/30 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-10 w-full bg-muted/30 rounded-lg animate-pulse" />
      </CardContent>
    </Card>
  );
}
