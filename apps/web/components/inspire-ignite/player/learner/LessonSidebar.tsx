'use client';

import { motion } from 'framer-motion';
import { Check, Circle, FileText, HelpCircle, Lock, PlayCircle } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'reading' | 'quiz';
  isCompleted: boolean;
  isLocked: boolean;
  isCurrent: boolean;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface LessonSidebarProps {
  modules: Module[];
  onLessonSelect: (lessonId: string) => void;
}

/**
 * LessonSidebar - Course curriculum navigation sidebar
 * Shows modules, lessons, progress, and allows navigation
 */
export function LessonSidebar({ modules, onLessonSelect }: LessonSidebarProps): React.JSX.Element {
  const getLessonIcon = (lesson: Lesson): typeof Lock => {
    if (lesson.isLocked) return Lock;
    if (lesson.isCompleted) return Check;
    if (lesson.type === 'video') return PlayCircle;
    if (lesson.type === 'reading') return FileText;
    if (lesson.type === 'quiz') return HelpCircle;
    return Circle;
  };

  const getLessonIconColor = (lesson: Lesson): string => {
    if (lesson.isLocked) return 'text-muted-foreground';
    if (lesson.isCompleted) return 'text-(--success-600)';
    if (lesson.isCurrent) return 'text-(--primary)';
    return 'text-muted-foreground';
  };

  return (
    <div className="bg-card border-[1.5px]  rounded-[10px] h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-5 border-b  bg-muted/50">
        <h2 className="text-lg font-bold text-foreground">Course Content</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {modules.reduce((sum, m) => sum + m.lessons.length, 0)} lessons
        </p>
      </div>

      {/* Modules List */}
      <div className="flex-1 overflow-y-auto">
        {modules.map((module, moduleIndex) => {
          const totalLessons = module.lessons.length;
          const completedLessons = module.lessons.filter((l) => l.isCompleted).length;
          const progress = (completedLessons / totalLessons) * 100;

          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: moduleIndex * 0.1 }}
              className="border-b  last:border-b-0"
            >
              {/* Module Header */}
              <div className="p-4 bg-muted/30">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground text-sm">
                    Module {moduleIndex + 1}: {module.title}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {completedLessons}/{totalLessons}
                  </span>
                </div>

                {/* Module Progress */}
                <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-(--success-600) rounded-full"
                  />
                </div>
              </div>

              {/* Lessons List */}
              <div className="px-2 py-1">
                {module.lessons.map((lesson, lessonIndex) => {
                  const Icon = getLessonIcon(lesson);
                  const iconColor = getLessonIconColor(lesson);

                  return (
                    <button
                      type="button"
                      key={lesson.id}
                      onClick={() => !lesson.isLocked && onLessonSelect(lesson.id)}
                      disabled={lesson.isLocked}
                      className={`w-full flex items-start gap-3 p-3 rounded-[6px] transition-all text-left ${
                        lesson.isCurrent
                          ? 'bg-(--primary)/10 border-[1.5px] border-(--primary)'
                          : lesson.isLocked
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-muted'
                      }`}
                      aria-label={`${lesson.isCompleted ? 'Completed: ' : ''}${lesson.title}`}
                      aria-current={lesson.isCurrent}
                    >
                      {/* Icon */}
                      <div className="mt-0.5 shrink-0">
                        <Icon className={`w-5 h-5 ${iconColor}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-sm font-medium line-clamp-2 ${
                            lesson.isCurrent
                              ? 'text-(--primary)'
                              : lesson.isCompleted
                                ? 'text-foreground'
                                : 'text-foreground'
                          }`}
                        >
                          {lessonIndex + 1}. {lesson.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                          {lesson.isCompleted && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-(--success-700)">
                              <Check className="w-3 h-3" />
                              Completed
                            </span>
                          )}
                          {lesson.isLocked && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                              <Lock className="w-3 h-3" />
                              Locked
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer - Overall Progress */}
      <div className="p-5 border-t  bg-muted/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Overall Progress</span>
          <span className="text-sm font-bold text-(--primary)">
            {Math.round(
              (modules.reduce((sum, m) => sum + m.lessons.filter((l) => l.isCompleted).length, 0) /
                modules.reduce((sum, m) => sum + m.lessons.length, 0)) *
                100,
            )}
            %
          </span>
        </div>
        <div className="w-full h-2 bg-border rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${
                (modules.reduce(
                  (sum, m) => sum + m.lessons.filter((l) => l.isCompleted).length,
                  0,
                ) /
                  modules.reduce((sum, m) => sum + m.lessons.length, 0)) *
                100
              }%`,
            }}
            transition={{ duration: 0.8 }}
            className="h-full bg-linear-to-r from-(--primary) to-(--secondary) rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
