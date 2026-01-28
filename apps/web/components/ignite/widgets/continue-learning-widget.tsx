'use client';

import { BookOpen, Clock, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export interface LastSessionData {
  /** Course ID */
  courseId: string;
  /** Course title */
  courseTitle: string;
  /** Current lesson ID */
  lessonId: string;
  /** Current lesson title */
  lessonTitle: string;
  /** Module name */
  moduleName?: string;
  /** Course thumbnail URL */
  thumbnailUrl?: string;
  /** Progress percentage (0-100) */
  progressPercent: number;
  /** Time spent in minutes */
  timeSpentMinutes: number;
  /** Estimated time remaining in minutes */
  estimatedRemainingMinutes?: number;
  /** Last accessed timestamp */
  lastAccessedAt: Date | string;
}

export interface ContinueLearningWidgetProps {
  /** Last session data from Firestore */
  session: LastSessionData | null;
  /** Loading state */
  isLoading?: boolean;
  /** Tenant ID for routing */
  tenantId?: string;
  /** Additional class names */
  className?: string;
}

function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return then.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function SkeletonLoader() {
  return (
    <Card variant="glass" className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Thumbnail skeleton */}
          <div className="relative h-40 sm:h-auto sm:w-48 bg-muted/30 animate-pulse" />

          {/* Content skeleton */}
          <div className="flex flex-1 flex-col justify-between p-4 space-y-4">
            <div className="space-y-2">
              <div className="h-3 w-24 bg-muted/30 rounded animate-pulse" />
              <div className="h-5 w-full bg-muted/30 rounded animate-pulse" />
              <div className="h-4 w-48 bg-muted/30 rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full bg-muted/30 rounded-full animate-pulse" />
              <div className="flex justify-between">
                <div className="h-3 w-16 bg-muted/30 rounded animate-pulse" />
                <div className="h-3 w-20 bg-muted/30 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card variant="glass" className="overflow-hidden">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-lxd-primary/10 mb-4">
          <BookOpen className="h-8 w-8 text-lxd-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Start Your Learning Journey</h3>
        <p className="text-sm text-muted-foreground max-w-xs mb-6">
          Explore our course catalog to find content that matches your learning goals.
        </p>
        <Button type="button" variant="cta" href="/learn/catalog">
          Browse Courses
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * ContinueLearningWidget - Shows the last accessed course with a Resume button
 *
 * Fetches last session from Firestore: tenants/{id}/learners/{uid}/profile
 * Displays course thumbnail, progress, and quick resume action.
 *
 * @example
 * ```tsx
 * <ContinueLearningWidget
 *   session={lastSession}
 *   isLoading={isLoading}
 *   tenantId="tenant-123"
 * />
 * ```
 */
export function ContinueLearningWidget({
  session,
  isLoading = false,
  tenantId,
  className,
}: ContinueLearningWidgetProps) {
  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (!session) {
    return <EmptyState />;
  }

  const resumeUrl = tenantId
    ? `/learn/player/${session.courseId}/${session.lessonId}`
    : `/learn/player/${session.courseId}/${session.lessonId}`;

  return (
    <Card variant="glass" className={cn('overflow-hidden group', className)}>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Course Thumbnail */}
          <div className="relative h-40 sm:h-auto sm:w-48 shrink-0 overflow-hidden bg-muted/20">
            {session.thumbnailUrl ? (
              <Image
                src={session.thumbnailUrl}
                alt={session.courseTitle}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, 192px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-lxd-primary/20 to-lxd-secondary/20">
                <BookOpen className="h-12 w-12 text-lxd-primary/60" />
              </div>
            )}

            {/* Play overlay on hover */}
            <Link
              href={resumeUrl}
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <PlayCircle className="h-8 w-8 text-white" />
              </div>
            </Link>
          </div>

          {/* Course Info */}
          <div className="flex flex-1 flex-col justify-between p-4">
            <div className="space-y-1.5">
              {/* Module badge */}
              {session.moduleName && (
                <span className="inline-flex items-center gap-1 text-xs text-lxd-primary font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-lxd-primary" />
                  {session.moduleName}
                </span>
              )}

              {/* Course Title */}
              <h3 className="text-lg font-semibold line-clamp-1 group-hover:text-lxd-primary transition-colors">
                {session.courseTitle}
              </h3>

              {/* Current Lesson */}
              <p className="text-sm text-muted-foreground line-clamp-1">{session.lessonTitle}</p>

              {/* Time info */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTimeAgo(session.lastAccessedAt)}
                </span>
                {session.estimatedRemainingMinutes && (
                  <span className="flex items-center gap-1">
                    ~{formatDuration(session.estimatedRemainingMinutes)} left
                  </span>
                )}
              </div>
            </div>

            {/* Progress & Resume */}
            <div className="space-y-3 mt-4">
              <div className="space-y-1.5">
                <Progress value={session.progressPercent} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{session.progressPercent}% complete</span>
                  <span>{formatDuration(session.timeSpentMinutes)} studied</span>
                </div>
              </div>

              <Button type="button" variant="primary" className="w-full sm:w-auto" href={resumeUrl}>
                <PlayCircle className="h-4 w-4 mr-2" />
                Resume Learning
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
