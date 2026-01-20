import { z } from 'zod';

// Zod Schema for Course Creation
export const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  instructor: z.string().optional(),
  type: z.enum(['standard', 'micro', 'webinar', 'ilt'], {
    required_error: 'Course type is required',
    invalid_type_error: 'Course type must be one of: standard, micro, webinar, ilt',
  }),
  estimatedDurationMinutes: z.number().optional(),
});

export type CourseType = 'standard' | 'micro' | 'webinar' | 'ilt' | 'e_learning';

export interface CourseData {
  title: string;
  description: string;
  instructor?: string;
  type: CourseType;
  courseType?: CourseType; // Alias for type, for backward compatibility
  estimatedDurationMinutes?: number;
}

export interface ModuleData {
  title: string;
  description?: string;
  orderIndex: number;
}

export interface LessonData {
  title: string;
  description?: string;
  orderIndex: number;
  moduleId?: string;
}
