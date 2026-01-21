'use client';

import { Star, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/core/utils';

export interface CourseData {
  id: number | string;
  title: string;
  completions: number;
  rating: number;
  trend: number;
}

const defaultCourses: CourseData[] = [
  { id: 1, title: 'HIPAA Fundamentals', completions: 847, rating: 4.8, trend: 12 },
  { id: 2, title: 'Cybersecurity Essentials', completions: 623, rating: 4.7, trend: 8 },
  { id: 3, title: 'Leadership Development', completions: 512, rating: 4.9, trend: 15 },
  { id: 4, title: 'Compliance 101', completions: 489, rating: 4.6, trend: -3 },
  { id: 5, title: 'Safety Protocols', completions: 445, rating: 4.8, trend: 22 },
];

interface TopCoursesWidgetProps {
  courses?: CourseData[];
  maxItems?: number;
  className?: string;
}

export function TopCoursesWidget({
  courses = defaultCourses,
  maxItems = 5,
  className,
}: TopCoursesWidgetProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {courses.slice(0, maxItems).map((course, index) => (
        <div
          key={course.id}
          className="flex items-center gap-3 p-2 bg-studio-bg rounded-lg hover:bg-studio-bg transition-colors group cursor-pointer"
        >
          {/* Rank */}
          <div className="w-6 h-6 rounded-md bg-brand-accent/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-brand-cyan">{index + 1}</span>
          </div>

          {/* Course Info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-brand-primary truncate group-hover:text-brand-cyan transition-colors">
              {course.title}
            </h4>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-brand-muted">
                {course.completions.toLocaleString()} completions
              </span>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-brand-warning fill-amber-400" />
                <span className="text-xs text-brand-muted">{course.rating}</span>
              </div>
            </div>
          </div>

          {/* Trend */}
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium',
              course.trend >= 0 ? 'text-brand-success' : 'text-brand-error',
            )}
          >
            {course.trend >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{Math.abs(course.trend)}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}
