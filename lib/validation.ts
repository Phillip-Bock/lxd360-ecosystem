import { z } from 'zod';

// Course validation schema
export const courseSchema = z.object({
  title: z
    .string()
    .min(3, 'Course title must be at least 3 characters')
    .max(100, 'Course title must not exceed 100 characters')
    .refine((val) => val.trim() !== 'Course Title', 'Please enter a custom course title'),
  description: z
    .string()
    .min(50, 'Course description must be at least 50 characters')
    .max(1000, 'Course description must not exceed 1000 characters'),
  instructor: z.string().min(1, 'Instructor is required'),
  modules: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().min(1, 'Module title is required'),
        lessons: z
          .array(
            z.object({
              id: z.string(),
              title: z.string().min(1, 'Lesson title is required'),
              type: z.enum(['lesson', 'placeholder']),
            }),
          )
          .refine((lessons) => lessons.filter((l) => l.type === 'lesson').length > 0, {
            message: 'Each module must have at least one lesson',
          }),
        isExpanded: z.boolean(),
      }),
    )
    .min(1, 'Course must have at least one module'),
});

export type CourseFormData = z.infer<typeof courseSchema>;

// Validation error type
export interface ValidationErrors {
  title?: string;
  description?: string;
  instructor?: string;
  modules?: string;
  [key: string]: string | undefined;
}
