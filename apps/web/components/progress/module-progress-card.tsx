'use client';

/**
 * ModuleProgressCard - Card showing module progress with lesson list
 *
 * Features:
 * - Module overview with progress ring
 * - Collapsible lesson list with status icons
 * - Time spent and completion stats
 * - Accessible and keyboard navigable
 */

import { ChevronDownIcon, ChevronRightIcon, ClockIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CompactLessonStatus, type LessonStatusType } from './lesson-status';
import { ProgressRing } from './progress-ring';

export interface ModuleLessonItem {
  id: string;
  name: string;
  status: LessonStatusType;
  progress?: number;
  duration?: number; // minutes
  timeSpent?: number; // seconds
}

export interface ModuleProgressCardProps {
  /** Module ID */
  moduleId: string;
  /** Module title */
  title: string;
  /** Module description */
  description?: string;
  /** Overall module progress (0-100) */
  progress: number;
  /** Module status */
  status: 'locked' | 'available' | 'in-progress' | 'completed';
  /** Lessons in this module */
  lessons: ModuleLessonItem[];
  /** Number of completed lessons */
  lessonsCompleted: number;
  /** Total lessons in module */
  lessonsTotal: number;
  /** Total time spent in seconds */
  timeSpent?: number;
  /** Estimated duration in minutes */
  estimatedDuration?: number;
  /** Callback when lesson is clicked */
  onLessonClick?: (lessonId: string) => void;
  /** Callback when module header is clicked */
  onModuleClick?: (moduleId: string) => void;
  /** Initially expanded */
  defaultExpanded?: boolean;
  /** Custom className */
  className?: string;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

function formatTimeSpent(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return formatDuration(minutes);
}

export function ModuleProgressCard({
  moduleId,
  title,
  description,
  progress,
  status,
  lessons,
  lessonsCompleted,
  lessonsTotal,
  timeSpent,
  estimatedDuration,
  onLessonClick,
  onModuleClick,
  defaultExpanded = false,
  className,
}: ModuleProgressCardProps): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const isLocked = status === 'locked';
  const progressColor = status === 'completed' ? 'success' : 'cyan';

  const handleModuleClick = (): void => {
    if (!isLocked) {
      setIsExpanded(!isExpanded);
      onModuleClick?.(moduleId);
    }
  };

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-200',
        isLocked && 'opacity-60',
        className,
      )}
    >
      {/* Module Header */}
      <CardHeader className="p-4">
        <button
          type="button"
          className={cn(
            'flex items-center gap-4 cursor-pointer select-none w-full text-left bg-transparent border-none p-0',
            isLocked && 'cursor-not-allowed',
          )}
          onClick={handleModuleClick}
          disabled={isLocked}
          aria-expanded={isExpanded}
          aria-label={`${title}. ${lessonsCompleted} of ${lessonsTotal} lessons completed. ${isLocked ? 'Module locked.' : ''}`}
        >
          {/* Expand/Collapse Icon */}
          <div className="shrink-0 text-muted-foreground">
            {isLocked ? (
              <div className="h-5 w-5" />
            ) : isExpanded ? (
              <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
            ) : (
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            )}
          </div>

          {/* Progress Ring */}
          <ProgressRing
            progress={progress}
            size="sm"
            color={progressColor}
            showLabel={false}
            ariaLabel={`Module progress: ${Math.round(progress)}%`}
          />

          {/* Module Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{title}</h3>
            {description && <p className="text-xs text-muted-foreground truncate">{description}</p>}
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span>
                {lessonsCompleted}/{lessonsTotal} lessons
              </span>
              {estimatedDuration && (
                <span className="flex items-center gap-1">
                  <ClockIcon className="h-3 w-3" aria-hidden="true" />
                  {formatDuration(estimatedDuration)}
                </span>
              )}
              {timeSpent !== undefined && timeSpent > 0 && (
                <span>{formatTimeSpent(timeSpent)} spent</span>
              )}
            </div>
          </div>

          {/* Progress Percentage */}
          <div className="shrink-0 text-right">
            <span className="text-lg font-bold tabular-nums">{Math.round(progress)}%</span>
          </div>
        </button>
      </CardHeader>

      {/* Lesson List (Collapsible) */}
      {isExpanded && !isLocked && (
        <CardContent className="pt-0 px-4 pb-4">
          <div className="border-t border-border/50 pt-3">
            <ul className="space-y-1" aria-label={`Lessons in ${title}`}>
              {lessons.map((lesson) => (
                <li key={lesson.id}>
                  <Button
                    type="button"
                    variant="ghost"
                    className={cn(
                      'w-full justify-start h-auto py-2 px-3 text-left',
                      lesson.status === 'locked' && 'opacity-50 cursor-not-allowed',
                    )}
                    onClick={() => {
                      if (lesson.status !== 'locked') {
                        onLessonClick?.(lesson.id);
                      }
                    }}
                    disabled={lesson.status === 'locked'}
                    aria-disabled={lesson.status === 'locked'}
                  >
                    <CompactLessonStatus status={lesson.status} className="mr-3 shrink-0" />
                    <span className="flex-1 truncate text-sm">{lesson.name}</span>
                    {lesson.duration && (
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {formatDuration(lesson.duration)}
                      </span>
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

/**
 * Loading skeleton for ModuleProgressCard
 */
export function ModuleProgressCardSkeleton({
  className,
}: {
  className?: string;
}): React.JSX.Element {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="p-4">
        <div className="flex items-center gap-4 animate-pulse">
          <div className="h-5 w-5 bg-muted rounded" />
          <div className="h-12 w-12 bg-muted rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-3 w-48 bg-muted rounded" />
          </div>
          <div className="h-6 w-12 bg-muted rounded" />
        </div>
      </CardHeader>
    </Card>
  );
}
