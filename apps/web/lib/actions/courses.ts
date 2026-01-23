'use server';

import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger';
import { verifyTenantAccess } from '@/lib/rbac/permissions';
import {
  type Course,
  type CourseData,
  type CourseType,
  createCourseSchema,
  type LessonData,
  type ModuleData,
} from './courses.types';

const log = logger.child({ module: 'actions-courses' });

// ============================================================================
// Types
// ============================================================================

interface CourseDocument {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  type: CourseType;
  instructor?: string;
  estimatedDurationMinutes?: number;
  status: 'draft' | 'published' | 'archived' | 'processing';
  createdBy: string;
  createdAt: FirebaseFirestore.Timestamp | FieldValue;
  updatedAt: FirebaseFirestore.Timestamp | FieldValue;
  publishedAt?: FirebaseFirestore.Timestamp;
  // SCORM-specific fields
  packageUrl?: string;
  scormVersion?: '1.2' | '2004';
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  xapiWrapperStatus?: 'pending' | 'injected' | 'failed';
}

interface ModuleDocument {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  orderIndex: number;
  createdAt: FirebaseFirestore.Timestamp | FieldValue;
  updatedAt: FirebaseFirestore.Timestamp | FieldValue;
}

interface LessonDocument {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  description?: string;
  orderIndex: number;
  createdAt: FirebaseFirestore.Timestamp | FieldValue;
  updatedAt: FirebaseFirestore.Timestamp | FieldValue;
}

type CourseResult =
  | { error: string; validationErrors?: unknown[] }
  | { courseId: string; type: string; data: CourseDocument };

type ActionResult<T = unknown> = { error: string } | { data: T };

// ============================================================================
// Auth Helper
// ============================================================================

async function getAuthenticatedUser(): Promise<{ uid: string; tenantId: string } | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;

    if (!sessionCookie) {
      log.warn('No session cookie found');
      return null;
    }

    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const tenantId = decodedToken.tenantId as string | undefined;

    if (!tenantId) {
      log.warn('User has no tenantId in token', { uid: decodedToken.uid });
      return null;
    }

    return { uid: decodedToken.uid, tenantId };
  } catch (error) {
    log.error('Failed to verify session', { error });
    return null;
  }
}

// ============================================================================
// Course Actions
// ============================================================================

/**
 * Create a new course in the tenant's collection
 */
export async function createCourse(data: CourseData, tenantId?: string): Promise<CourseResult> {
  // Normalize course type
  let courseType = data.courseType || data.type;
  if (courseType === 'e_learning') {
    courseType = 'standard';
  }

  const normalizedData = {
    ...data,
    type: courseType,
  };

  // Validate input
  const validationResult = createCourseSchema.safeParse(normalizedData);
  if (!validationResult.success) {
    return {
      error: validationResult.error.errors[0]?.message || 'Invalid course data',
      validationErrors: validationResult.error.errors,
    };
  }

  try {
    // Get authenticated user
    const authUser = await getAuthenticatedUser();
    const effectiveTenantId = tenantId || authUser?.tenantId;

    if (!effectiveTenantId) {
      return { error: 'Unauthorized: No tenant context' };
    }

    // Verify tenant access if user is authenticated
    if (authUser && authUser.tenantId !== effectiveTenantId) {
      const hasAccess = await verifyTenantAccess(authUser.uid, effectiveTenantId);
      if (!hasAccess) {
        return { error: 'Unauthorized: Access denied to this tenant' };
      }
    }

    // Create course document
    const coursesRef = adminDb.collection('tenants').doc(effectiveTenantId).collection('courses');
    const courseRef = coursesRef.doc();

    // SCORM courses start in 'processing' status until the package is validated
    const isScormCourse = validationResult.data.type === 'scorm';
    const initialStatus = isScormCourse ? 'processing' : 'draft';

    const courseDoc: CourseDocument = {
      id: courseRef.id,
      tenantId: effectiveTenantId,
      title: validationResult.data.title,
      description: validationResult.data.description,
      type: validationResult.data.type as CourseType,
      instructor: validationResult.data.instructor,
      estimatedDurationMinutes: validationResult.data.estimatedDurationMinutes,
      status: initialStatus,
      createdBy: authUser?.uid || 'system',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      // SCORM-specific fields
      ...(validationResult.data.packageUrl && { packageUrl: validationResult.data.packageUrl }),
      ...(validationResult.data.scormVersion && {
        scormVersion: validationResult.data.scormVersion,
      }),
      // Processing metadata for SCORM
      ...(isScormCourse && {
        processingStatus: 'pending',
        xapiWrapperStatus: 'pending',
      }),
    };

    await courseRef.set(courseDoc);

    log.info('Course created', {
      courseId: courseRef.id,
      tenantId: effectiveTenantId,
      title: data.title,
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/lxd');
    revalidatePath('/inspire-studio');

    return {
      courseId: courseRef.id,
      type: courseDoc.type,
      data: courseDoc,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to create course', { error: errorMessage, title: data.title });
    return { error: `Failed to create course: ${errorMessage}` };
  }
}

/**
 * Update an existing course
 */
export async function updateCourse(
  courseId: string,
  data: Partial<CourseData>,
  tenantId?: string,
): Promise<ActionResult<CourseDocument>> {
  try {
    const authUser = await getAuthenticatedUser();
    const effectiveTenantId = tenantId || authUser?.tenantId;

    if (!effectiveTenantId) {
      return { error: 'Unauthorized: No tenant context' };
    }

    const courseRef = adminDb
      .collection('tenants')
      .doc(effectiveTenantId)
      .collection('courses')
      .doc(courseId);

    const courseDoc = await courseRef.get();
    if (!courseDoc.exists) {
      return { error: 'Course not found' };
    }

    const updateData: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.instructor !== undefined) updateData.instructor = data.instructor;
    if (data.estimatedDurationMinutes !== undefined) {
      updateData.estimatedDurationMinutes = data.estimatedDurationMinutes;
    }
    if (data.type !== undefined) {
      updateData.type = data.type === 'e_learning' ? 'standard' : data.type;
    }

    await courseRef.update(updateData);

    const updatedDoc = await courseRef.get();
    const updatedData = updatedDoc.data() as CourseDocument;

    log.info('Course updated', { courseId, tenantId: effectiveTenantId });

    revalidatePath('/course-creation');
    revalidatePath('/inspire-studio');

    return { data: updatedData };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to update course', { courseId, error: errorMessage });
    return { error: `Failed to update course: ${errorMessage}` };
  }
}

/**
 * Get a single course by ID
 */
export async function getCourse(
  courseId: string,
  tenantId?: string,
): Promise<
  ActionResult<{
    id: string;
    title: string;
    description?: string;
    type: CourseType;
    status: string;
    modules?: Array<{
      id: string;
      title: string;
      lessons: Array<{ id: string; title: string }>;
    }>;
  }>
> {
  try {
    const authUser = await getAuthenticatedUser();
    const effectiveTenantId = tenantId || authUser?.tenantId;

    if (!effectiveTenantId) {
      return { error: 'Unauthorized: No tenant context' };
    }

    const courseRef = adminDb
      .collection('tenants')
      .doc(effectiveTenantId)
      .collection('courses')
      .doc(courseId);

    const courseDoc = await courseRef.get();
    if (!courseDoc.exists) {
      return { error: 'Course not found' };
    }

    const courseData = courseDoc.data() as CourseDocument;

    // Fetch modules
    const modulesSnapshot = await courseRef.collection('modules').orderBy('orderIndex').get();

    const modules = await Promise.all(
      modulesSnapshot.docs.map(async (moduleDoc) => {
        const moduleData = moduleDoc.data() as ModuleDocument;

        // Fetch lessons for this module
        const lessonsSnapshot = await moduleDoc.ref
          .collection('lessons')
          .orderBy('orderIndex')
          .get();

        const lessons = lessonsSnapshot.docs.map((lessonDoc) => {
          const lessonData = lessonDoc.data() as LessonDocument;
          return {
            id: lessonData.id,
            title: lessonData.title,
          };
        });

        return {
          id: moduleData.id,
          title: moduleData.title,
          lessons,
        };
      }),
    );

    return {
      data: {
        id: courseData.id,
        title: courseData.title,
        description: courseData.description,
        type: courseData.type,
        status: courseData.status,
        modules,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to get course', { courseId, error: errorMessage });
    return { error: `Failed to get course: ${errorMessage}` };
  }
}

/**
 * Get all courses for the current user's tenant
 */
export async function getUserCourses(tenantId?: string): Promise<ActionResult<Course[]>> {
  try {
    const authUser = await getAuthenticatedUser();
    const effectiveTenantId = tenantId || authUser?.tenantId;

    if (!effectiveTenantId) {
      return { error: 'Unauthorized: No tenant context' };
    }

    const coursesSnapshot = await adminDb
      .collection('tenants')
      .doc(effectiveTenantId)
      .collection('courses')
      .orderBy('createdAt', 'desc')
      .get();

    const courses: Course[] = coursesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        tenantId: data.tenantId,
        title: data.title,
        description: data.description,
        type: data.type,
        instructor: data.instructor,
        estimatedDurationMinutes: data.estimatedDurationMinutes,
        status: data.status,
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate?.()?.toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
        publishedAt: data.publishedAt?.toDate?.()?.toISOString(),
        packageUrl: data.packageUrl,
        scormVersion: data.scormVersion,
        enrolledCount: data.enrolledCount,
        completedCount: data.completedCount,
        avgRating: data.avgRating,
      };
    });

    log.info('Fetched user courses', { tenantId: effectiveTenantId, count: courses.length });

    return { data: courses };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to get user courses', { error: errorMessage });
    return { error: `Failed to get courses: ${errorMessage}` };
  }
}

/**
 * Create a module within a course
 */
export async function createModule(
  courseId: string,
  data: ModuleData,
  tenantId?: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const authUser = await getAuthenticatedUser();
    const effectiveTenantId = tenantId || authUser?.tenantId;

    if (!effectiveTenantId) {
      return { error: 'Unauthorized: No tenant context' };
    }

    const courseRef = adminDb
      .collection('tenants')
      .doc(effectiveTenantId)
      .collection('courses')
      .doc(courseId);

    const courseDoc = await courseRef.get();
    if (!courseDoc.exists) {
      return { error: 'Course not found' };
    }

    const moduleRef = courseRef.collection('modules').doc();

    const moduleDoc: ModuleDocument = {
      id: moduleRef.id,
      courseId,
      title: data.title,
      description: data.description,
      orderIndex: data.orderIndex,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await moduleRef.set(moduleDoc);

    log.info('Module created', { moduleId: moduleRef.id, courseId });

    revalidatePath('/course-creation');

    return { data: { id: moduleRef.id } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to create module', { courseId, error: errorMessage });
    return { error: `Failed to create module: ${errorMessage}` };
  }
}

/**
 * Update a module
 */
export async function updateModule(
  moduleId: string,
  data: Partial<ModuleData>,
  courseId?: string,
  tenantId?: string,
): Promise<ActionResult<ModuleDocument>> {
  try {
    const authUser = await getAuthenticatedUser();
    const effectiveTenantId = tenantId || authUser?.tenantId;

    if (!effectiveTenantId || !courseId) {
      return { error: 'Unauthorized: Missing tenant or course context' };
    }

    const moduleRef = adminDb
      .collection('tenants')
      .doc(effectiveTenantId)
      .collection('courses')
      .doc(courseId)
      .collection('modules')
      .doc(moduleId);

    const moduleDoc = await moduleRef.get();
    if (!moduleDoc.exists) {
      return { error: 'Module not found' };
    }

    const updateData: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.orderIndex !== undefined) updateData.orderIndex = data.orderIndex;

    await moduleRef.update(updateData);

    const updatedDoc = await moduleRef.get();

    log.info('Module updated', { moduleId, courseId });

    revalidatePath('/course-creation');

    return { data: updatedDoc.data() as ModuleDocument };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to update module', { moduleId, error: errorMessage });
    return { error: `Failed to update module: ${errorMessage}` };
  }
}

/**
 * Create a lesson within a module
 */
export async function createLesson(
  courseId: string,
  data: LessonData,
  tenantId?: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const authUser = await getAuthenticatedUser();
    const effectiveTenantId = tenantId || authUser?.tenantId;

    if (!effectiveTenantId) {
      return { error: 'Unauthorized: No tenant context' };
    }

    if (!data.moduleId) {
      return { error: 'Module ID is required' };
    }

    const moduleRef = adminDb
      .collection('tenants')
      .doc(effectiveTenantId)
      .collection('courses')
      .doc(courseId)
      .collection('modules')
      .doc(data.moduleId);

    const moduleDoc = await moduleRef.get();
    if (!moduleDoc.exists) {
      return { error: 'Module not found' };
    }

    const lessonRef = moduleRef.collection('lessons').doc();

    const lessonDoc: LessonDocument = {
      id: lessonRef.id,
      courseId,
      moduleId: data.moduleId,
      title: data.title,
      description: data.description,
      orderIndex: data.orderIndex,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await lessonRef.set(lessonDoc);

    log.info('Lesson created', { lessonId: lessonRef.id, moduleId: data.moduleId, courseId });

    revalidatePath('/course-creation');

    return { data: { id: lessonRef.id } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to create lesson', { courseId, error: errorMessage });
    return { error: `Failed to create lesson: ${errorMessage}` };
  }
}

/**
 * Update a lesson
 */
export async function updateLesson(
  lessonId: string,
  data: Partial<LessonData>,
  courseId?: string,
  moduleId?: string,
  tenantId?: string,
): Promise<ActionResult<LessonDocument>> {
  try {
    const authUser = await getAuthenticatedUser();
    const effectiveTenantId = tenantId || authUser?.tenantId;

    if (!effectiveTenantId || !courseId || !moduleId) {
      return { error: 'Unauthorized: Missing tenant, course, or module context' };
    }

    const lessonRef = adminDb
      .collection('tenants')
      .doc(effectiveTenantId)
      .collection('courses')
      .doc(courseId)
      .collection('modules')
      .doc(moduleId)
      .collection('lessons')
      .doc(lessonId);

    const lessonDoc = await lessonRef.get();
    if (!lessonDoc.exists) {
      return { error: 'Lesson not found' };
    }

    const updateData: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.orderIndex !== undefined) updateData.orderIndex = data.orderIndex;

    await lessonRef.update(updateData);

    const updatedDoc = await lessonRef.get();

    log.info('Lesson updated', { lessonId, moduleId, courseId });

    revalidatePath('/course-creation');

    return { data: updatedDoc.data() as LessonDocument };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to update lesson', { lessonId, error: errorMessage });
    return { error: `Failed to update lesson: ${errorMessage}` };
  }
}

/**
 * Publish a course (change status from draft to published)
 */
export async function publishCourse(
  courseId: string,
  tenantId?: string,
): Promise<ActionResult<{ published: boolean }>> {
  try {
    const authUser = await getAuthenticatedUser();
    const effectiveTenantId = tenantId || authUser?.tenantId;

    if (!effectiveTenantId) {
      return { error: 'Unauthorized: No tenant context' };
    }

    const courseRef = adminDb
      .collection('tenants')
      .doc(effectiveTenantId)
      .collection('courses')
      .doc(courseId);

    const courseDoc = await courseRef.get();
    if (!courseDoc.exists) {
      return { error: 'Course not found' };
    }

    await courseRef.update({
      status: 'published',
      publishedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    log.info('Course published', { courseId, tenantId: effectiveTenantId });

    revalidatePath('/dashboard');
    revalidatePath('/course-creation');
    revalidatePath('/inspire-studio');

    return { data: { published: true } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to publish course', { courseId, error: errorMessage });
    return { error: `Failed to publish course: ${errorMessage}` };
  }
}

/**
 * Delete a course and all its modules/lessons
 */
export async function deleteCourse(
  courseId: string,
  tenantId?: string,
): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    const authUser = await getAuthenticatedUser();
    const effectiveTenantId = tenantId || authUser?.tenantId;

    if (!effectiveTenantId) {
      return { error: 'Unauthorized: No tenant context' };
    }

    const courseRef = adminDb
      .collection('tenants')
      .doc(effectiveTenantId)
      .collection('courses')
      .doc(courseId);

    const courseDoc = await courseRef.get();
    if (!courseDoc.exists) {
      return { error: 'Course not found' };
    }

    // Delete all modules and their lessons (cascading delete)
    const modulesSnapshot = await courseRef.collection('modules').get();
    const batch = adminDb.batch();

    for (const moduleDoc of modulesSnapshot.docs) {
      const lessonsSnapshot = await moduleDoc.ref.collection('lessons').get();
      for (const lessonDoc of lessonsSnapshot.docs) {
        batch.delete(lessonDoc.ref);
      }
      batch.delete(moduleDoc.ref);
    }

    batch.delete(courseRef);
    await batch.commit();

    log.info('Course deleted', { courseId, tenantId: effectiveTenantId });

    revalidatePath('/admin');
    revalidatePath('/dashboard');
    revalidatePath('/inspire-studio');

    return { data: { deleted: true } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to delete course', { courseId, error: errorMessage });
    return { error: `Failed to delete course: ${errorMessage}` };
  }
}

/**
 * Delete a module and all its lessons
 */
export async function deleteModule(
  moduleId: string,
  courseId?: string,
  tenantId?: string,
): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    const authUser = await getAuthenticatedUser();
    const effectiveTenantId = tenantId || authUser?.tenantId;

    if (!effectiveTenantId || !courseId) {
      return { error: 'Unauthorized: Missing tenant or course context' };
    }

    const moduleRef = adminDb
      .collection('tenants')
      .doc(effectiveTenantId)
      .collection('courses')
      .doc(courseId)
      .collection('modules')
      .doc(moduleId);

    const moduleDoc = await moduleRef.get();
    if (!moduleDoc.exists) {
      return { error: 'Module not found' };
    }

    // Delete all lessons in the module
    const lessonsSnapshot = await moduleRef.collection('lessons').get();
    const batch = adminDb.batch();

    for (const lessonDoc of lessonsSnapshot.docs) {
      batch.delete(lessonDoc.ref);
    }

    batch.delete(moduleRef);
    await batch.commit();

    log.info('Module deleted', { moduleId, courseId });

    revalidatePath('/admin');
    revalidatePath('/course-creation');

    return { data: { deleted: true } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to delete module', { moduleId, error: errorMessage });
    return { error: `Failed to delete module: ${errorMessage}` };
  }
}

/**
 * Delete a lesson
 */
export async function deleteLesson(
  lessonId: string,
  courseId?: string,
  moduleId?: string,
  tenantId?: string,
): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    const authUser = await getAuthenticatedUser();
    const effectiveTenantId = tenantId || authUser?.tenantId;

    if (!effectiveTenantId || !courseId || !moduleId) {
      return { error: 'Unauthorized: Missing tenant, course, or module context' };
    }

    const lessonRef = adminDb
      .collection('tenants')
      .doc(effectiveTenantId)
      .collection('courses')
      .doc(courseId)
      .collection('modules')
      .doc(moduleId)
      .collection('lessons')
      .doc(lessonId);

    const lessonDoc = await lessonRef.get();
    if (!lessonDoc.exists) {
      return { error: 'Lesson not found' };
    }

    await lessonRef.delete();

    log.info('Lesson deleted', { lessonId, moduleId, courseId });

    revalidatePath('/admin');
    revalidatePath('/course-creation');

    return { data: { deleted: true } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to delete lesson', { lessonId, error: errorMessage });
    return { error: `Failed to delete lesson: ${errorMessage}` };
  }
}
