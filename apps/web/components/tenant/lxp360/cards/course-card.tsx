'use client';

import { Award, BookOpen, CheckCircle, Clock, Play, Star, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/core/utils';
import type { Course } from '@/types/lms';
import { ProgressBar } from '../progress/progress-bar';

interface CourseCardProps {
  course: Course;
  progress?: number;
  isEnrolled?: boolean;
  isCompleted?: boolean;
  isRequired?: boolean;
  showProgress?: boolean;
  variant?: 'default' | 'compact' | 'featured' | 'horizontal';
  onClick?: () => void;
  className?: string;
}

export function CourseCard({
  course,
  progress = 0,
  isEnrolled = false,
  isCompleted = false,
  isRequired = false,
  showProgress = true,
  variant = 'default',
  onClick,
  className,
}: CourseCardProps) {
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-brand-success bg-brand-success/10 border-emerald-500/20';
      case 'intermediate':
        return 'text-brand-warning bg-brand-warning/10 border-amber-500/20';
      case 'advanced':
        return 'text-orange-400 bg-brand-warning/10 border-orange-500/20';
      case 'expert':
        return 'text-brand-error bg-brand-error/10 border-brand-error/20';
      default:
        return 'text-muted-foreground bg-muted/10 border-border';
    }
  };

  const courseHref = `/lms/catalog/${course.id}`;

  if (variant === 'compact') {
    const compactClassName = cn(
      'group flex items-center gap-4 p-3 rounded-xl',
      'bg-(--lxd-blue-dark-700) border border-(--lxd-blue-dark-700)/50',
      'hover:border-(--lxd-blue-light)/50 hover:bg-(--lxd-blue-dark-700)',
      'transition-all duration-200 text-left w-full',
      className,
    );

    const compactContent = (
      <>
        <div className="relative w-20 h-14 rounded-lg overflow-hidden shrink-0">
          <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
          {isCompleted && (
            <div className="absolute inset-0 bg-brand-success/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-brand-success" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-brand-primary truncate group-hover:text-(--lxd-blue-light)">
            {course.title}
          </h4>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(course.duration)}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-brand-warning" />
              {course.rating.toFixed(1)}
            </span>
          </div>
          {showProgress && isEnrolled && !isCompleted && progress > 0 && (
            <ProgressBar value={progress} size="sm" className="mt-2" />
          )}
        </div>
        {isRequired && (
          <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-brand-error/10 text-brand-error border border-brand-error/20">
            Required
          </span>
        )}
      </>
    );

    return onClick ? (
      <button type="button" onClick={onClick} className={compactClassName}>
        {compactContent}
      </button>
    ) : (
      <Link href={courseHref} className={compactClassName}>
        {compactContent}
      </Link>
    );
  }

  if (variant === 'horizontal') {
    const horizontalClassName = cn(
      'group flex gap-5 p-4 rounded-2xl',
      'bg-(--lxd-blue-dark-700) border border-(--lxd-blue-dark-700)/50',
      'hover:border-(--lxd-blue-light)/50 hover:bg-(--lxd-blue-dark-700)',
      'transition-all duration-200 text-left w-full',
      className,
    );

    const horizontalContent = (
      <>
        <div className="relative w-48 h-32 rounded-xl overflow-hidden shrink-0">
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {isEnrolled && !isCompleted && (
            <div className="absolute bottom-2 left-2 right-2">
              <ProgressBar value={progress} size="sm" showLabel />
            </div>
          )}
          {isCompleted && (
            <div className="absolute inset-0 bg-brand-success/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-brand-success" />
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-(--lxd-blue-light)">{course.category.name}</span>
              {isRequired && (
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-brand-error/10 text-brand-error border border-brand-error/20">
                  Required
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-brand-primary group-hover:text-(--lxd-blue-light) transition-colors line-clamp-2">
              {course.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {course.shortDescription}
            </p>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDuration(course.duration)}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {course.lessonCount} lessons
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-brand-warning" />
                {course.rating.toFixed(1)} ({course.reviewCount})
              </span>
            </div>
            <span
              className={cn(
                'px-2 py-0.5 text-xs font-medium rounded-full border capitalize',
                getDifficultyColor(course.difficulty),
              )}
            >
              {course.difficulty}
            </span>
          </div>
        </div>
      </>
    );

    return onClick ? (
      <button type="button" onClick={onClick} className={horizontalClassName}>
        {horizontalContent}
      </button>
    ) : (
      <Link href={courseHref} className={horizontalClassName}>
        {horizontalContent}
      </Link>
    );
  }

  // Default and featured variants
  const defaultClassName = cn(
    'group flex flex-col rounded-2xl overflow-hidden',
    'bg-(--lxd-blue-dark-700) border border-(--lxd-blue-dark-700)/50',
    'hover:border-(--lxd-blue-light)/50 hover:bg-(--lxd-blue-dark-700)',
    'transition-all duration-200 text-left',
    variant === 'featured' && 'md:flex-row',
    className,
  );

  const defaultContent = (
    <>
      {/* Thumbnail */}
      <div
        className={cn(
          'relative overflow-hidden',
          variant === 'featured' ? 'md:w-2/5 aspect-video md:aspect-auto' : 'aspect-video',
        )}
      >
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Overlay badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <div className="flex flex-col gap-2">
            {isRequired && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-brand-error/90 text-brand-primary">
                Required
              </span>
            )}
            {course.isFree && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-brand-success/90 text-brand-primary">
                Free
              </span>
            )}
          </div>
          {course.certificateTemplateId && (
            <div className="p-1.5 rounded-full bg-black/50 backdrop-blur-xs">
              <Award className="w-4 h-4 text-brand-warning" />
            </div>
          )}
        </div>
        {/* Play button overlay */}
        {!isEnrolled && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="p-3 rounded-full bg-(--lxd-blue-light) text-brand-primary">
              <Play className="w-6 h-6 fill-current" />
            </div>
          </div>
        )}
        {/* Progress overlay */}
        {isEnrolled && !isCompleted && showProgress && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-linear-to-t from-black/80 to-transparent">
            <ProgressBar value={progress} size="sm" showLabel />
          </div>
        )}
        {/* Completed overlay */}
        {isCompleted && (
          <div className="absolute inset-0 bg-brand-success/20 flex items-center justify-center">
            <div className="p-3 rounded-full bg-brand-success/90">
              <CheckCircle className="w-8 h-8 text-brand-primary" />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={cn('flex flex-col flex-1 p-4', variant === 'featured' && 'md:p-6')}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-(--lxd-blue-light)">{course.category.name}</span>
          <span className="text-brand-muted">•</span>
          <span
            className={cn(
              'px-2 py-0.5 text-[10px] font-medium rounded-full border capitalize',
              getDifficultyColor(course.difficulty),
            )}
          >
            {course.difficulty}
          </span>
        </div>

        <h3
          className={cn(
            'font-semibold text-brand-primary group-hover:text-(--lxd-blue-light) transition-colors',
            variant === 'featured' ? 'text-xl line-clamp-2' : 'text-base line-clamp-2',
          )}
        >
          {course.title}
        </h3>

        {variant === 'featured' && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {course.shortDescription}
          </p>
        )}

        <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
          <Image
            src={course.instructor.avatar || '/default-avatar.png'}
            alt={course.instructor.name}
            width={24}
            height={24}
            className="rounded-full"
          />
          <span className="truncate">{course.instructor.name}</span>
        </div>

        <div className="flex items-center gap-4 mt-auto pt-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatDuration(course.duration)}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            {course.lessonCount}
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 text-brand-warning fill-amber-400" />
            {course.rating.toFixed(1)}
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <Users className="w-4 h-4" />
            {course.enrollmentCount.toLocaleString()}
          </span>
        </div>

        {/* Price */}
        {!isEnrolled && !course.isFree && course.price && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-(--lxd-blue-dark-700)/50">
            {course.salePrice ? (
              <>
                <span className="text-lg font-bold text-brand-primary">${course.salePrice}</span>
                <span className="text-sm text-muted-foreground line-through">${course.price}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-brand-primary">${course.price}</span>
            )}
          </div>
        )}
      </div>
    </>
  );

  return onClick ? (
    <button type="button" onClick={onClick} className={defaultClassName}>
      {defaultContent}
    </button>
  ) : (
    <Link href={courseHref} className={defaultClassName}>
      {defaultContent}
    </Link>
  );
}

export default CourseCard;
