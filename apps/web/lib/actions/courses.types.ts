import { z } from 'zod';

// Zod Schema for Course Creation
export const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  instructor: z.string().optional(),
  type: z.enum(['standard', 'micro', 'webinar', 'ilt', 'scorm'], {
    required_error: 'Course type is required',
    invalid_type_error: 'Course type must be one of: standard, micro, webinar, ilt, scorm',
  }),
  estimatedDurationMinutes: z.number().optional(),
  // SCORM-specific fields
  packageUrl: z.string().url().optional(),
  scormVersion: z.enum(['1.2', '2004']).optional(),
});

export type CourseType = 'standard' | 'micro' | 'webinar' | 'ilt' | 'e_learning' | 'scorm';

export interface CourseData {
  title: string;
  description: string;
  instructor?: string;
  type: CourseType;
  courseType?: CourseType; // Alias for type, for backward compatibility
  estimatedDurationMinutes?: number;
  // SCORM-specific fields
  packageUrl?: string;
  scormVersion?: '1.2' | '2004';
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

/**
 * Course document as returned from Firestore
 */
export interface Course {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  type: CourseType;
  instructor?: string;
  estimatedDurationMinutes?: number;
  status: 'draft' | 'published' | 'archived' | 'processing';
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  // SCORM-specific fields
  packageUrl?: string;
  scormVersion?: '1.2' | '2004';
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  xapiWrapperStatus?: 'pending' | 'injected' | 'failed';
  // Stats (computed/denormalized)
  enrolledCount?: number;
  completedCount?: number;
  avgRating?: number;
}
