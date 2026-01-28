'use client';

/**
 * PlayerSidebar Component
 * LXD-332: Course outline sidebar showing modules and lessons
 */

import { BookOpen, CheckCircle2, ChevronDown, ChevronRight, Circle, Lock } from 'lucide-react';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type {
  LessonStatus,
  PlayerCourse,
  PlayerLesson,
  PlayerModule,
} from '@/types/player/course-player';

interface PlayerSidebarProps {
  course: PlayerCourse;
  currentLessonId: string;
  onLessonSelect: (lessonId: string) => void;
  isCollapsed?: boolean;
}

function getLessonIcon(status: LessonStatus) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'in_progress':
      return <Circle className="h-4 w-4 text-blue-500 fill-blue-500/20" />;
    case 'locked':
      return <Lock className="h-4 w-4 text-muted-foreground/50" />;
    default:
      return <Circle className="h-4 w-4 text-muted-foreground" />;
  }
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

interface ModuleAccordionProps {
  module: PlayerModule;
  currentLessonId: string;
  onLessonSelect: (lessonId: string) => void;
  defaultOpen?: boolean;
}

function ModuleAccordion({
  module,
  currentLessonId,
  onLessonSelect,
  defaultOpen = false,
}: ModuleAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const completedLessons = module.lessons.filter((l) => l.status === 'completed').length;
  const progress = Math.round((completedLessons / module.lessons.length) * 100);

  return (
    <div className="border-b border-border/50 last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-accent/50 transition-colors',
          module.isLocked && 'opacity-50 cursor-not-allowed',
        )}
        disabled={module.isLocked}
        aria-expanded={isOpen}
        aria-controls={`module-${module.id}-lessons`}
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-sm truncate">{module.title}</span>
            {module.isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Progress value={progress} className="h-1 flex-1" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {completedLessons}/{module.lessons.length}
            </span>
          </div>
        </div>
      </button>

      {isOpen && !module.isLocked && (
        <div id={`module-${module.id}-lessons`} className="pb-2">
          {module.lessons.map((lesson) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              isActive={lesson.id === currentLessonId}
              onSelect={() => onLessonSelect(lesson.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface LessonItemProps {
  lesson: PlayerLesson;
  isActive: boolean;
  onSelect: () => void;
}

function LessonItem({ lesson, isActive, onSelect }: LessonItemProps) {
  const isClickable = lesson.status !== 'locked';

  return (
    <button
      type="button"
      onClick={isClickable ? onSelect : undefined}
      className={cn(
        'flex w-full items-center gap-3 px-4 py-2 pl-10 text-left transition-colors',
        isActive && 'bg-primary/10 border-l-2 border-primary',
        !isActive && isClickable && 'hover:bg-accent/50',
        !isClickable && 'opacity-50 cursor-not-allowed',
      )}
      disabled={!isClickable}
      aria-current={isActive ? 'page' : undefined}
    >
      {getLessonIcon(lesson.status)}
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            'text-sm block truncate',
            isActive && 'font-medium text-primary',
            lesson.status === 'completed' && 'text-muted-foreground',
          )}
        >
          {lesson.title}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatDuration(lesson.duration)}
          {lesson.xpReward > 0 && ` · ${lesson.xpReward} XP`}
        </span>
      </div>
    </button>
  );
}

export function CoursePlayerSidebar({
  course,
  currentLessonId,
  onLessonSelect,
  isCollapsed = false,
}: PlayerSidebarProps) {
  // Find which module contains the current lesson
  const currentModuleId = course.modules.find((m) =>
    m.lessons.some((l) => l.id === currentLessonId),
  )?.id;

  if (isCollapsed) {
    return (
      <div className="w-16 bg-card border-r border-border flex flex-col items-center py-4 gap-2">
        <BookOpen className="h-5 w-5 text-muted-foreground" />
        <div className="text-xs text-muted-foreground text-center">
          {course.completedLessons}/{course.totalLessons}
        </div>
      </div>
    );
  }

  return (
    <aside className="w-72 md:w-80 bg-card border-r border-border flex flex-col h-full">
      {/* Course Header */}
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-sm line-clamp-2">{course.title}</h2>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span>{course.totalLessons} lessons</span>
          <span>{formatDuration(course.totalDuration)}</span>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {Math.round((course.completedLessons / course.totalLessons) * 100)}%
            </span>
          </div>
          <Progress value={(course.completedLessons / course.totalLessons) * 100} className="h-2" />
        </div>
      </div>

      {/* Modules List */}
      <ScrollArea className="flex-1">
        <nav aria-label="Course content">
          {course.modules.map((module) => (
            <ModuleAccordion
              key={module.id}
              module={module}
              currentLessonId={currentLessonId}
              onLessonSelect={onLessonSelect}
              defaultOpen={module.id === currentModuleId}
            />
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
