'use server';

import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';
import {
  type CourseData,
  createCourseSchema,
  type LessonData,
  type ModuleData,
} from './courses.types';

const log = logger.child({ module: 'actions-courses' });

type CourseResult =
  | { error: string; validationErrors?: unknown[] }
  | { courseId: string; type: string; data: unknown };

// TODO(LXD-297): Implement with Firestore
export async function createCourse(data: CourseData): Promise<CourseResult> {
  let courseType = data.courseType || data.type;

  if (courseType === 'e_learning') {
    courseType = 'standard';
  }

  const normalizedData = {
    ...data,
    type: courseType,
  };

  const validationResult = createCourseSchema.safeParse(normalizedData);

  if (!validationResult.success) {
    return {
      error: validationResult.error.errors[0]?.message || 'Invalid course data',
      validationErrors: validationResult.error.errors,
    };
  }

  log.warn('createCourse: Database not configured - returning mock error', { title: data.title });
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/lxd');
  return { error: 'Database not configured - migration in progress' };
}

// TODO(LXD-297): Implement with Firestore
export async function updateCourse(courseId: string, _data: Partial<CourseData>) {
  log.warn('updateCourse: Database not configured', { courseId });
  revalidatePath('/course-creation');
  return { error: 'Database not configured - migration in progress' };
}

// TODO(LXD-297): Implement with Firestore
export async function createModule(
  courseId: string,
  _data: ModuleData,
): Promise<{
  error?: string;
  data?: { id: string };
}> {
  log.warn('createModule: Database not configured', { courseId });
  revalidatePath('/course-creation');
  return { error: 'Database not configured - migration in progress' };
}

// TODO(LXD-297): Implement with Firestore
export async function updateModule(moduleId: string, _data: Partial<ModuleData>) {
  log.warn('updateModule: Database not configured', { moduleId });
  revalidatePath('/course-creation');
  return { error: 'Database not configured - migration in progress' };
}

// TODO(LXD-297): Implement with Firestore
export async function createLesson(courseId: string, _data: LessonData) {
  log.warn('createLesson: Database not configured', { courseId });
  revalidatePath('/course-creation');
  return { error: 'Database not configured - migration in progress' };
}

// TODO(LXD-297): Implement with Firestore
export async function updateLesson(lessonId: string, _data: Partial<LessonData>) {
  log.warn('updateLesson: Database not configured', { lessonId });
  revalidatePath('/course-creation');
  return { error: 'Database not configured - migration in progress' };
}

// TODO(LXD-297): Implement with Firestore
export async function getCourse(courseId: string): Promise<{
  error?: string;
  data?: {
    id: string;
    title: string;
    description?: string;
    modules?: Array<{
      id: string;
      title: string;
      lessons: Array<{ id: string; title: string }>;
    }>;
  };
}> {
  log.warn('getCourse: Database not configured', { courseId });
  return { error: 'Database not configured - migration in progress' };
}

// TODO(LXD-297): Implement with Firestore
export async function getUserCourses() {
  log.warn('getUserCourses: Database not configured - returning empty array');
  return { error: 'Database not configured - migration in progress', data: [] };
}

// TODO(LXD-297): Implement with Firestore
export async function publishCourse(courseId: string) {
  log.warn('publishCourse: Database not configured', { courseId });
  revalidatePath('/dashboard');
  revalidatePath('/course-creation');
  return { error: 'Database not configured - migration in progress' };
}

// TODO(LXD-297): Implement with Firestore
export async function deleteCourse(courseId: string) {
  log.warn('deleteCourse: Database not configured', { courseId });
  revalidatePath('/admin');
  revalidatePath('/dashboard');
  return { error: 'Database not configured - migration in progress' };
}

// TODO(LXD-297): Implement with Firestore
export async function deleteModule(moduleId: string) {
  log.warn('deleteModule: Database not configured', { moduleId });
  revalidatePath('/admin');
  revalidatePath('/course-creation');
  return { error: 'Database not configured - migration in progress' };
}

// TODO(LXD-297): Implement with Firestore
export async function deleteLesson(lessonId: string) {
  log.warn('deleteLesson: Database not configured', { lessonId });
  revalidatePath('/admin');
  revalidatePath('/course-creation');
  return { error: 'Database not configured - migration in progress' };
}
