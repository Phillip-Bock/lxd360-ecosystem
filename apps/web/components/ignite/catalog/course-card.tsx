'use client';

import { BookOpen, CheckCircle2, Clock, GraduationCap, Star, Users } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DifficultyLevel } from '@/types/lms/course';

export interface CatalogCourse {
  /** Unique course ID */
  id: string;
  /** Course title */
  title: string;
  /** Course description */
  description: string;
  /** Short description for cards */
  shortDescription?: string;
  /** Thumbnail URL */
  thumbnail?: string;
  /** Course category */
  category: string;
  /** Difficulty level */
  difficulty: DifficultyLevel;
  /** Duration in minutes */
  duration: number;
  /** Number of lessons */
  lessonCount: number;
  /** Average rating (0-5) */
  rating: number;
  /** Number of enrollments */
  enrollmentCount: number;
  /** Instructor name */
  instructor: string;
  /** Skills taught */
  skills?: string[];
  /** Whether the course is required (compliance) */
  isRequired?: boolean;
  /** Whether the course is free */
  isFree?: boolean;
  /** Price if not free */
  price?: number;
  /** Whether user is already enrolled */
  isEnrolled?: boolean;
}

export interface CatalogCourseCardProps {
  /** Course data */
  course: CatalogCourse;
  /** Card variant */
  variant?: 'grid' | 'list';
  /** Callback when enroll button is clicked */
  onEnroll?: (courseId: string) => void;
  /** Whether enrollment is in progress */
  isEnrolling?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Format duration from minutes to human readable string
 */
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Get difficulty badge variant
 */
function getDifficultyVariant(
  difficulty: DifficultyLevel,
): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (difficulty) {
    case 'beginner':
      return 'secondary';
    case 'intermediate':
      return 'default';
    case 'advanced':
      return 'outline';
    case 'expert':
      return 'destructive';
    default:
      return 'secondary';
  }
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * CatalogCourseCard - Course tile for the course catalog
 *
 * Features:
 * - Grid and list view variants
 * - Course thumbnail with placeholder
 * - Difficulty and category badges
 * - Rating and enrollment stats
 * - Enroll button with loading state
 * - Already enrolled indicator
 * - Keyboard accessible
 */
export function CatalogCourseCard({
  course,
  variant = 'grid',
  onEnroll,
  isEnrolling = false,
  className,
}: CatalogCourseCardProps): React.ReactElement {
  function handleEnrollClick(): void {
    if (onEnroll && !course.isEnrolled) {
      onEnroll(course.id);
    }
  }

  if (variant === 'list') {
    return (
      <Card
        className={cn(
          'bg-card border-border hover:border-lxd-primary/50 transition-all duration-200 group',
          className,
        )}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Thumbnail */}
          <div className="relative w-full sm:w-48 h-32 sm:h-auto shrink-0 overflow-hidden rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none bg-muted/20">
            {course.thumbnail ? (
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 192px"
              />
            ) : (
              <div className="w-full h-full min-h-[8rem] flex items-center justify-center bg-gradient-to-br from-lxd-primary/20 to-lxd-secondary/20">
                <BookOpen className="w-10 h-10 text-lxd-primary/50" aria-hidden="true" />
              </div>
            )}
          </div>

          <div className="flex-1 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {course.category}
                  </Badge>
                  <Badge variant={getDifficultyVariant(course.difficulty)} className="text-xs">
                    {capitalize(course.difficulty)}
                  </Badge>
                  {course.isRequired && (
                    <Badge variant="warning" className="text-xs">
                      Required
                    </Badge>
                  )}
                  {course.isEnrolled && (
                    <Badge variant="success" className="text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" aria-hidden="true" />
                      Enrolled
                    </Badge>
                  )}
                </div>

                {/* Title and description */}
                <h3 className="font-semibold text-foreground group-hover:text-lxd-primary transition-colors line-clamp-1">
                  {course.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {course.shortDescription || course.description}
                </p>

                {/* Instructor */}
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                  <GraduationCap className="w-4 h-4" aria-hidden="true" />
                  {course.instructor}
                </p>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                    {formatDuration(course.duration)}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" aria-hidden="true" />
                    {course.lessonCount} lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" aria-hidden="true" />
                    <span className="text-foreground">{course.rating.toFixed(1)}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" aria-hidden="true" />
                    {course.enrollmentCount.toLocaleString()} enrolled
                  </span>
                </div>
              </div>

              {/* Enroll button */}
              <div className="shrink-0">
                {course.isEnrolled ? (
                  <Button variant="outline" disabled>
                    <CheckCircle2 className="w-4 h-4 mr-2" aria-hidden="true" />
                    Enrolled
                  </Button>
                ) : (
                  <Button onClick={handleEnrollClick} loading={isEnrolling} disabled={isEnrolling}>
                    {course.isFree || !course.price ? 'Enroll Free' : `Enroll - $${course.price}`}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Grid variant (default)
  return (
    <Card
      className={cn(
        'bg-card border-border overflow-hidden',
        'hover:border-lxd-primary/50 hover:shadow-[0_0_20px_rgba(0,114,245,0.1)]',
        'transition-all duration-200 group',
        className,
      )}
    >
      {/* Thumbnail */}
      <div className="relative h-40 overflow-hidden bg-muted/20">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-lxd-primary/20 to-lxd-secondary/20">
            <BookOpen className="w-12 h-12 text-lxd-primary/40" aria-hidden="true" />
          </div>
        )}

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {course.isRequired && (
            <Badge variant="warning" className="text-xs">
              Required
            </Badge>
          )}
          {course.isFree && (
            <Badge variant="success" className="text-xs">
              Free
            </Badge>
          )}
        </div>

        {/* Enrolled badge */}
        {course.isEnrolled && (
          <div className="absolute top-3 right-3">
            <Badge variant="success" className="text-xs">
              <CheckCircle2 className="w-3 h-3 mr-1" aria-hidden="true" />
              Enrolled
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        {/* Category and difficulty */}
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-xs">
            {course.category}
          </Badge>
          <Badge variant={getDifficultyVariant(course.difficulty)} className="text-xs">
            {capitalize(course.difficulty)}
          </Badge>
        </div>

        <CardTitle className="text-foreground group-hover:text-lxd-primary transition-colors line-clamp-1">
          {course.title}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {course.shortDescription || course.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Meta info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" aria-hidden="true" />
            {formatDuration(course.duration)}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            {course.lessonCount} lessons
          </span>
        </div>

        {/* Rating and enrollments */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" aria-hidden="true" />
            <span className="text-foreground font-medium">{course.rating.toFixed(1)}</span>
          </div>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Users className="w-4 h-4" aria-hidden="true" />
            {course.enrollmentCount.toLocaleString()} enrolled
          </span>
        </div>

        {/* Instructor */}
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <GraduationCap className="w-4 h-4" aria-hidden="true" />
          {course.instructor}
        </p>

        {/* Enroll button */}
        {course.isEnrolled ? (
          <Button variant="outline" className="w-full" disabled>
            <CheckCircle2 className="w-4 h-4 mr-2" aria-hidden="true" />
            Already Enrolled
          </Button>
        ) : (
          <Button className="w-full" onClick={handleEnrollClick} loading={isEnrolling}>
            {course.isFree || !course.price ? 'Enroll Free' : `Enroll - $${course.price}`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * CatalogCourseCardSkeleton - Loading placeholder for CatalogCourseCard
 */
export function CatalogCourseCardSkeleton({
  variant = 'grid',
}: {
  variant?: 'grid' | 'list';
}): React.ReactElement {
  if (variant === 'list') {
    return (
      <Card className="bg-card border-border">
        <div className="flex flex-col sm:flex-row">
          <div className="w-full sm:w-48 h-32 sm:h-auto bg-muted/30 animate-pulse rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none" />
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex gap-2">
                  <div className="h-5 w-20 bg-muted/30 rounded animate-pulse" />
                  <div className="h-5 w-24 bg-muted/30 rounded animate-pulse" />
                </div>
                <div className="h-5 w-3/4 bg-muted/30 rounded animate-pulse" />
                <div className="h-4 w-full bg-muted/30 rounded animate-pulse" />
                <div className="h-4 w-32 bg-muted/30 rounded animate-pulse" />
                <div className="flex gap-4">
                  <div className="h-4 w-16 bg-muted/30 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-muted/30 rounded animate-pulse" />
                  <div className="h-4 w-12 bg-muted/30 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-10 w-28 bg-muted/30 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="h-40 bg-muted/30 animate-pulse" />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="h-5 w-20 bg-muted/30 rounded animate-pulse" />
          <div className="h-5 w-24 bg-muted/30 rounded animate-pulse" />
        </div>
        <div className="h-5 w-3/4 bg-muted/30 rounded animate-pulse" />
        <div className="h-4 w-full bg-muted/30 rounded animate-pulse mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <div className="h-4 w-16 bg-muted/30 rounded animate-pulse" />
          <div className="h-4 w-20 bg-muted/30 rounded animate-pulse" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-12 bg-muted/30 rounded animate-pulse" />
          <div className="h-4 w-24 bg-muted/30 rounded animate-pulse" />
        </div>
        <div className="h-4 w-32 bg-muted/30 rounded animate-pulse" />
        <div className="h-10 w-full bg-muted/30 rounded-lg animate-pulse" />
      </CardContent>
    </Card>
  );
}
