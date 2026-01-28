'use client';

import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  HelpCircle,
  Lock,
  type LucideIcon,
  PlayCircle,
  Target,
} from 'lucide-react';
import { useState } from 'react';
import { ProgressBar } from '@/components/tenant/lxp360/progress/progress-bar';
import { cn } from '@/lib/core/utils';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'quiz' | 'reading' | 'activity';
  isCompleted: boolean;
  isLocked: boolean;
  isCurrent?: boolean;
}

interface Module {
  id: string;
  title: string;
  duration: string;
  lessonsCount: number;
  completedCount: number;
  isLocked: boolean;
  lessons: Lesson[];
}

interface LessonSidebarProps {
  courseTitle: string;
  courseProgress: number;
  modules: Module[];
  currentLessonId?: string;
  onLessonSelect?: (lessonId: string) => void;
  className?: string;
}

const lessonTypeIcons: Record<string, LucideIcon> = {
  video: PlayCircle,
  quiz: HelpCircle,
  reading: FileText,
  activity: Target,
};

export function LessonSidebar({
  courseTitle,
  courseProgress,
  modules,
  currentLessonId,
  onLessonSelect,
  className,
}: LessonSidebarProps) {
  // Track which modules are expanded
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => {
    // Auto-expand module containing current lesson
    const moduleWithCurrentLesson = modules.find((m) =>
      m.lessons.some((l) => l.id === currentLessonId),
    );
    return moduleWithCurrentLesson
      ? new Set([moduleWithCurrentLesson.id])
      : new Set([modules[0]?.id].filter(Boolean));
  });

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  return (
    <div
      className={cn(
        'bg-studio-bg border-l border-studio-surface/50 flex flex-col h-full',
        className,
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-studio-surface/50">
        <h2 className="font-semibold text-brand-primary text-sm line-clamp-2">{courseTitle}</h2>
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Course Progress</span>
            <span>{Math.round(courseProgress)}%</span>
          </div>
          <ProgressBar value={courseProgress} size="sm" variant="gradient" />
        </div>
      </div>

      {/* Module list */}
      <div className="flex-1 overflow-y-auto">
        {modules.map((module, moduleIndex) => {
          const isExpanded = expandedModules.has(module.id);
          const moduleProgress =
            module.lessonsCount > 0 ? (module.completedCount / module.lessonsCount) * 100 : 0;

          return (
            <div key={module.id} className="border-b border-studio-surface/30">
              {/* Module header */}
              <button
                type="button"
                onClick={() => toggleModule(module.id)}
                className="w-full flex items-start gap-3 p-4 hover:bg-studio-surface/20 transition-colors text-left"
                disabled={module.isLocked}
              >
                <div
                  className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold mt-0.5',
                    moduleProgress === 100
                      ? 'bg-brand-success/20 text-brand-success'
                      : module.isLocked
                        ? 'bg-muted/20 text-muted-foreground'
                        : 'bg-(--lxd-blue-light)/20 text-(--lxd-blue-light)',
                  )}
                >
                  {moduleProgress === 100 ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : module.isLocked ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    moduleIndex + 1
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className={cn(
                      'text-sm font-medium line-clamp-2',
                      module.isLocked ? 'text-muted-foreground' : 'text-brand-primary',
                    )}
                  >
                    {module.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>
                      {module.completedCount}/{module.lessonsCount} lessons
                    </span>
                    <span>•</span>
                    <span>{module.duration}</span>
                  </div>
                </div>

                {!module.isLocked &&
                  (isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  ))}
              </button>

              {/* Lessons list */}
              {isExpanded && !module.isLocked && (
                <div className="bg-studio-bg-dark">
                  {module.lessons.map((lesson) => {
                    const Icon = lessonTypeIcons[lesson.type] || FileText;
                    const isCurrent = lesson.id === currentLessonId;

                    return (
                      <button
                        type="button"
                        key={lesson.id}
                        onClick={() => !lesson.isLocked && onLessonSelect?.(lesson.id)}
                        disabled={lesson.isLocked}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                          isCurrent
                            ? 'bg-(--lxd-blue-light)/10 border-l-2 border-(--lxd-blue-light)'
                            : lesson.isLocked
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-studio-surface/20',
                        )}
                      >
                        <div
                          className={cn(
                            'w-6 h-6 rounded flex items-center justify-center shrink-0',
                            lesson.isCompleted
                              ? 'bg-brand-success/20 text-brand-success'
                              : isCurrent
                                ? 'bg-(--lxd-blue-light)/20 text-(--lxd-blue-light)'
                                : 'bg-studio-surface/30 text-muted-foreground',
                          )}
                        >
                          {lesson.isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : lesson.isLocked ? (
                            <Lock className="w-3 h-3" />
                          ) : (
                            <Icon className="w-3.5 h-3.5" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              'text-sm line-clamp-1',
                              isCurrent
                                ? 'text-(--lxd-blue-light) font-medium'
                                : lesson.isCompleted
                                  ? 'text-muted-foreground'
                                  : 'text-brand-primary',
                            )}
                          >
                            {lesson.title}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
