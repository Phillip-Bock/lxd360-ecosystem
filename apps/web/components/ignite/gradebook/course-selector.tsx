'use client';

import { BookOpen } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface Course {
  id: string;
  name: string;
  enrolledCount?: number;
}

export interface CourseSelectorProps {
  /** List of available courses */
  courses: Course[];
  /** Currently selected course ID */
  selectedCourseId: string;
  /** Callback when course selection changes */
  onCourseChange: (courseId: string) => void;
  /** Placeholder text when no course is selected */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Label for accessibility */
  label?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CourseSelector({
  courses,
  selectedCourseId,
  onCourseChange,
  placeholder = 'Select a course',
  className,
  disabled = false,
  label = 'Select course',
}: CourseSelectorProps): React.ReactElement {
  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <span className="sr-only" id="course-selector-label">
        {label}
      </span>
      <Select value={selectedCourseId} onValueChange={onCourseChange} disabled={disabled}>
        <SelectTrigger className="w-full sm:w-64" aria-labelledby="course-selector-label">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-muted-foreground" aria-hidden="true" />
            <SelectValue placeholder={placeholder}>
              {selectedCourse?.name ?? placeholder}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent>
          {courses.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              No courses available
            </div>
          ) : (
            courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                <div className="flex flex-col items-start">
                  <span>{course.name}</span>
                  {course.enrolledCount !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      {course.enrolledCount} learner{course.enrolledCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

export default CourseSelector;
