'use client';

import { ChevronDown, ChevronRight, Clock } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { LessonIndicator, type LessonState } from './LessonIndicator';
import { ProgressBar } from './ProgressBar';

export interface ModuleLesson {
  id: string;
  title: string;
  duration?: number; // in minutes
  state: LessonState;
}

export interface ModuleCardProps {
  /** Module title */
  title: string;
  /** Module description */
  description?: string;
  /** Module number/order */
  moduleNumber?: number;
  /** List of lessons in this module */
  lessons: ModuleLesson[];
  /** Whether the module is expanded to show lessons */
  defaultExpanded?: boolean;
  /** Callback when a lesson is clicked */
  onLessonClick?: (lessonId: string) => void;
  /** Color theme */
  color?: 'cyan' | 'purple' | 'green';
  /** Additional CSS classes */
  className?: string;
}

export function ModuleCard({
  title,
  description,
  moduleNumber,
  lessons,
  defaultExpanded = false,
  onLessonClick,
  color = 'cyan',
  className,
}: ModuleCardProps): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const completedLessons = lessons.filter((l) => l.state === 'completed').length;
  const totalLessons = lessons.length;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const totalDuration = lessons.reduce((acc, lesson) => acc + (lesson.duration ?? 0), 0);
  const completedDuration = lessons
    .filter((l) => l.state === 'completed')
    .reduce((acc, lesson) => acc + (lesson.duration ?? 0), 0);
  const remainingDuration = totalDuration - completedDuration;

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const isCompleted = completedLessons === totalLessons && totalLessons > 0;

  return (
    <div
      className={cn(
        'rounded-xl border bg-card overflow-hidden',
        'transition-all duration-200 motion-reduce:transition-none',
        isCompleted && 'border-[var(--color-lxd-success)]/30',
        className,
      )}
    >
      {/* Module Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center gap-4 p-4 text-left',
          'hover:bg-muted/30 transition-colors motion-reduce:transition-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        )}
        aria-expanded={isExpanded}
        aria-controls={`module-lessons-${moduleNumber ?? title}`}
      >
        {/* Expand/Collapse Icon */}
        <div className="shrink-0 text-muted-foreground">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5" aria-hidden="true" />
          ) : (
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          )}
        </div>

        {/* Module Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {moduleNumber !== undefined && (
              <span className="text-xs font-medium text-muted-foreground">
                Module {moduleNumber}
              </span>
            )}
            {isCompleted && (
              <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-[var(--color-lxd-success)]/10 text-[var(--color-lxd-success)]">
                Completed
              </span>
            )}
          </div>
          <h3 className="font-semibold text-foreground truncate">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{description}</p>
          )}
        </div>

        {/* Progress & Duration */}
        <div className="shrink-0 flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {completedLessons}/{totalLessons} lessons
            </span>
            {remainingDuration > 0 && (
              <>
                <span className="text-muted/50">•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  {formatDuration(remainingDuration)} left
                </span>
              </>
            )}
          </div>
          <div className="w-32">
            <ProgressBar
              value={progressPercentage}
              size="sm"
              color={isCompleted ? 'green' : color}
            />
          </div>
        </div>
      </button>

      {/* Lessons List */}
      {isExpanded && (
        <ul
          id={`module-lessons-${moduleNumber ?? title}`}
          className="border-t border-border/50 list-none m-0 p-0"
          aria-label={`Lessons in ${title}`}
        >
          {lessons.map((lesson, index) => (
            <li
              key={lesson.id}
              className={cn(
                'flex items-center gap-3 px-4 py-3',
                'border-b border-border/30 last:border-b-0',
                lesson.state !== 'locked' && onLessonClick && 'cursor-pointer',
                lesson.state !== 'locked' &&
                  onLessonClick &&
                  'hover:bg-muted/20 transition-colors motion-reduce:transition-none',
                lesson.state === 'current' && 'bg-muted/10',
              )}
              onClick={() => {
                if (lesson.state !== 'locked' && onLessonClick) {
                  onLessonClick(lesson.id);
                }
              }}
              onKeyDown={(e) => {
                if (
                  (e.key === 'Enter' || e.key === ' ') &&
                  lesson.state !== 'locked' &&
                  onLessonClick
                ) {
                  e.preventDefault();
                  onLessonClick(lesson.id);
                }
              }}
              tabIndex={lesson.state !== 'locked' && onLessonClick ? 0 : -1}
            >
              <LessonIndicator
                state={lesson.state}
                lessonNumber={index + 1}
                size="sm"
                color={color}
              />
              <div className="flex-1 min-w-0">
                <span
                  className={cn(
                    'text-sm',
                    lesson.state === 'locked' && 'text-muted-foreground/50',
                    lesson.state === 'completed' && 'text-muted-foreground',
                    lesson.state === 'current' && 'font-medium text-foreground',
                    lesson.state === 'available' && 'text-foreground',
                  )}
                >
                  {lesson.title}
                </span>
              </div>
              {lesson.duration !== undefined && (
                <span
                  className={cn(
                    'text-xs shrink-0',
                    lesson.state === 'locked'
                      ? 'text-muted-foreground/30'
                      : 'text-muted-foreground',
                  )}
                >
                  {formatDuration(lesson.duration)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ModuleCard;
