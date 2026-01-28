'use client';

import { Award, BookOpen, CheckCircle, ChevronRight, Clock, Star, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type React from 'react';
import { cn } from '@/lib/utils';
import type { LearningPath, LearningPathEnrollment } from '@/types/lms';
import { ProgressBar } from '../progress/progress-bar';

interface LearningPathCardProps {
  path: LearningPath;
  enrollment?: LearningPathEnrollment | null;
  variant?: 'default' | 'compact' | 'horizontal';
  onClick?: () => void;
  className?: string;
}

export function LearningPathCard({
  path,
  enrollment,
  variant = 'default',
  onClick,
  className,
}: LearningPathCardProps): React.JSX.Element {
  const isEnrolled = !!enrollment;
  const isCompleted = enrollment?.status === 'completed';
  const progress = enrollment?.progress || 0;

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

  const compactContent = (
    <>
      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-linear-to-br from-[var(--studio-accent)]/20 to-[var(--lxd-purple-light)]/20 flex items-center justify-center">
        {path.thumbnail ? (
          <Image src={path.thumbnail} alt={path.title} fill className="object-cover" />
        ) : (
          <Award className="w-8 h-8 text-[var(--studio-accent)]" />
        )}
        {isCompleted && (
          <div className="absolute inset-0 bg-brand-success/20 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-brand-success" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-brand-primary truncate group-hover:text-[var(--studio-accent)]">
          {path.title}
        </h4>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {path.totalCourses} courses
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />~{path.estimatedWeeks} weeks
          </span>
        </div>
        {isEnrolled && !isCompleted && <ProgressBar value={progress} size="sm" className="mt-2" />}
      </div>
      <ChevronRight className="w-5 h-5 text-brand-muted group-hover:text-[var(--studio-accent)]" />
    </>
  );

  const compactClassName = cn(
    'group flex items-center gap-4 p-3 rounded-xl',
    'bg-[var(--studio-bg)] border border-[var(--lxd-dark-surface-alt)]/50',
    'hover:border-[var(--studio-accent)]/50 hover:bg-studio-bg',
    'transition-all duration-200 text-left w-full',
    className,
  );

  if (variant === 'compact') {
    if (onClick) {
      return (
        <button type="button" onClick={onClick} className={compactClassName}>
          {compactContent}
        </button>
      );
    }
    return (
      <Link href={`/lms/learning-paths/${path.id}`} className={compactClassName}>
        {compactContent}
      </Link>
    );
  }

  const horizontalContent = (
    <>
      {/* Path visual */}
      <div className="relative w-48 h-32 rounded-xl overflow-hidden shrink-0">
        {path.coverImage || path.thumbnail ? (
          <Image
            src={path.coverImage || path.thumbnail}
            alt={path.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-[var(--studio-accent)]/30 to-[var(--lxd-purple-light)]/30 flex items-center justify-center">
            <Award className="w-12 h-12 text-[var(--studio-accent)]" />
          </div>
        )}
        {isCompleted && (
          <div className="absolute inset-0 bg-brand-success/20 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-brand-success" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                'px-2 py-0.5 text-xs font-medium rounded-full border capitalize',
                path.difficulty === 'beginner' &&
                  'text-brand-success bg-brand-success/10 border-emerald-500/20',
                path.difficulty === 'intermediate' &&
                  'text-brand-warning bg-brand-warning/10 border-amber-500/20',
                path.difficulty === 'advanced' &&
                  'text-brand-error bg-brand-error/10 border-brand-error/20',
              )}
            >
              {path.difficulty}
            </span>
            {path.isRequired && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-brand-error/10 text-brand-error border border-brand-error/20">
                Required
              </span>
            )}
            {path.certificationId && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-brand-warning/10 text-brand-warning border border-amber-500/20">
                Certification
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-brand-primary group-hover:text-[var(--studio-accent)] transition-colors">
            {path.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{path.shortDescription}</p>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {path.totalCourses} courses
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDuration(path.totalDuration)}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-brand-warning" />
              {path.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {path.enrollmentCount.toLocaleString()}
            </span>
          </div>
          {isEnrolled && !isCompleted && (
            <div className="w-32">
              <ProgressBar value={progress} size="sm" showLabel />
            </div>
          )}
        </div>
      </div>
    </>
  );

  const horizontalClassName = cn(
    'group flex gap-5 p-5 rounded-2xl',
    'bg-[var(--studio-bg)] border border-[var(--lxd-dark-surface-alt)]/50',
    'hover:border-[var(--studio-accent)]/50 hover:bg-studio-bg',
    'transition-all duration-200 text-left w-full',
    className,
  );

  if (variant === 'horizontal') {
    if (onClick) {
      return (
        <button type="button" onClick={onClick} className={horizontalClassName}>
          {horizontalContent}
        </button>
      );
    }
    return (
      <Link href={`/lms/learning-paths/${path.id}`} className={horizontalClassName}>
        {horizontalContent}
      </Link>
    );
  }

  // Default variant
  const defaultContent = (
    <>
      {/* Path visual */}
      <div className="relative aspect-[16/9] overflow-hidden">
        {path.coverImage || path.thumbnail ? (
          <Image
            src={path.coverImage || path.thumbnail}
            alt={path.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-[var(--studio-accent)]/30 to-[var(--lxd-purple-light)]/30 flex items-center justify-center">
            <Award className="w-16 h-16 text-[var(--studio-accent)]" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <div className="flex flex-col gap-2">
            {path.isRequired && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-brand-error/90 text-brand-primary">
                Required
              </span>
            )}
            {path.certificationId && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-brand-warning/90 text-brand-primary">
                Certification
              </span>
            )}
          </div>
          <span
            className={cn(
              'px-2 py-1 text-xs font-medium rounded-full capitalize',
              path.difficulty === 'beginner' && 'bg-brand-success/90 text-brand-primary',
              path.difficulty === 'intermediate' && 'bg-brand-warning/90 text-brand-primary',
              path.difficulty === 'advanced' && 'bg-brand-error/90 text-brand-primary',
            )}
          >
            {path.difficulty}
          </span>
        </div>

        {/* Progress overlay */}
        {isEnrolled && !isCompleted && (
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
      <div className="flex flex-col flex-1 p-4">
        <h3 className="text-base font-semibold text-brand-primary group-hover:text-[var(--studio-accent)] transition-colors line-clamp-2">
          {path.title}
        </h3>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{path.shortDescription}</p>

        {/* Skills */}
        {path.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {path.skills.slice(0, 3).map((skill) => (
              <span
                key={skill.skillId}
                className="px-2 py-0.5 text-[10px] rounded-full bg-[var(--studio-accent)]/10 text-[var(--studio-accent)] border border-[var(--studio-accent)]/20"
              >
                {skill.skillName}
              </span>
            ))}
            {path.skills.length > 3 && (
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-muted/10 text-muted-foreground">
                +{path.skills.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mt-auto pt-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            {path.totalCourses}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />~{path.estimatedWeeks}w
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 text-brand-warning fill-amber-400" />
            {path.rating.toFixed(1)}
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <Users className="w-4 h-4" />
            {path.enrollmentCount.toLocaleString()}
          </span>
        </div>
      </div>
    </>
  );

  const defaultClassName = cn(
    'group flex flex-col rounded-2xl overflow-hidden',
    'bg-[var(--studio-bg)] border border-[var(--lxd-dark-surface-alt)]/50',
    'hover:border-[var(--studio-accent)]/50 hover:bg-studio-bg',
    'transition-all duration-200 text-left',
    className,
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={defaultClassName}>
        {defaultContent}
      </button>
    );
  }

  return (
    <Link href={`/lms/learning-paths/${path.id}`} className={defaultClassName}>
      {defaultContent}
    </Link>
  );
}

export default LearningPathCard;
