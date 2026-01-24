import {
  addDoc,
  collection,
  deleteDoc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { requireDb } from '@/lib/firebase/client';
import type {
  CreateLessonInput,
  Lesson,
  LessonFilters,
  PaginatedResponse,
  PaginationOptions,
  UpdateLessonInput,
} from '@/types/firestore/cms';
import { COLLECTIONS, getLessonRef, getLessonsCollection } from '../collections';
import { lessonConverter } from '../converters';
import { updateCourseStats } from './courses';

// =============================================================================
// READ OPERATIONS
// =============================================================================

/**
 * Get a single lesson by ID
 * @param lessonId - The lesson document ID
 * @returns The lesson document or null if not found
 */
export async function getLesson(lessonId: string): Promise<Lesson | null> {
  try {
    const docRef = getLessonRef(lessonId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return docSnap.data();
  } catch (error) {
    console.error('Failed to get lesson:', error);
    throw new Error(`Failed to get lesson: ${lessonId}`);
  }
}

/**
 * Get lessons by course ID (ordered by lesson order)
 * @param courseId - The course ID
 * @returns Ordered list of lessons for the course
 */
export async function getLessonsByCourse(courseId: string): Promise<Lesson[]> {
  try {
    const lessonsRef = getLessonsCollection();
    const q = query(lessonsRef, where('courseId', '==', courseId), orderBy('order', 'asc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error('Failed to get lessons by course:', error);
    throw new Error(`Failed to get lessons for course: ${courseId}`);
  }
}

/**
 * Get lessons by module ID (ordered by lesson order)
 * @param courseId - The course ID
 * @param moduleId - The module ID
 * @returns Ordered list of lessons for the module
 */
export async function getLessonsByModule(courseId: string, moduleId: string): Promise<Lesson[]> {
  try {
    const lessonsRef = getLessonsCollection();
    const q = query(
      lessonsRef,
      where('courseId', '==', courseId),
      where('moduleId', '==', moduleId),
      orderBy('order', 'asc'),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error('Failed to get lessons by module:', error);
    throw new Error(`Failed to get lessons for module: ${moduleId}`);
  }
}

/**
 * Get published lessons for a course
 * @param courseId - The course ID
 * @returns Ordered list of published lessons
 */
export async function getPublishedLessons(courseId: string): Promise<Lesson[]> {
  try {
    const lessonsRef = getLessonsCollection();
    const q = query(
      lessonsRef,
      where('courseId', '==', courseId),
      where('status', '==', 'published'),
      orderBy('order', 'asc'),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error('Failed to get published lessons:', error);
    throw new Error(`Failed to get published lessons for course: ${courseId}`);
  }
}

/**
 * Get previewable lessons for a course (for non-enrolled users)
 * @param courseId - The course ID
 * @returns List of previewable lessons
 */
export async function getPreviewableLessons(courseId: string): Promise<Lesson[]> {
  try {
    const lessonsRef = getLessonsCollection();
    const q = query(
      lessonsRef,
      where('courseId', '==', courseId),
      where('status', '==', 'published'),
      where('isPreviewable', '==', true),
      orderBy('order', 'asc'),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error('Failed to get previewable lessons:', error);
    throw new Error(`Failed to get previewable lessons for course: ${courseId}`);
  }
}

/**
 * Search lessons with filters
 * @param filters - Lesson filters
 * @param options - Pagination options
 * @returns Paginated filtered lessons
 */
export async function searchLessons(
  filters: LessonFilters,
  options: PaginationOptions = { limit: 50 },
): Promise<PaginatedResponse<Lesson>> {
  try {
    const lessonsRef = getLessonsCollection();
    const constraints = [];

    if (filters.courseId) {
      constraints.push(where('courseId', '==', filters.courseId));
    }

    if (filters.moduleId) {
      constraints.push(where('moduleId', '==', filters.moduleId));
    }

    if (filters.contentType) {
      constraints.push(where('contentType', '==', filters.contentType));
    }

    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }

    if (filters.inspireStage) {
      constraints.push(where('inspireStage', '==', filters.inspireStage));
    }

    constraints.push(
      orderBy(options.orderBy ?? 'order', options.orderDirection ?? 'asc'),
      limit(options.limit + 1),
    );

    const q = query(lessonsRef, ...constraints);
    const snapshot = await getDocs(q);
    const lessons = snapshot.docs.map((doc) => doc.data());

    const hasMore = lessons.length > options.limit;
    if (hasMore) {
      lessons.pop();
    }

    return {
      items: lessons,
      hasMore,
      nextCursor: hasMore ? lessons[lessons.length - 1]?.id : undefined,
    };
  } catch (error) {
    console.error('Failed to search lessons:', error);
    throw new Error('Failed to search lessons');
  }
}

/**
 * Get the next lesson in a course
 * @param courseId - The course ID
 * @param currentOrder - The current lesson's order
 * @returns The next lesson or null if at end
 */
export async function getNextLesson(
  courseId: string,
  currentOrder: number,
): Promise<Lesson | null> {
  try {
    const lessonsRef = getLessonsCollection();
    const q = query(
      lessonsRef,
      where('courseId', '==', courseId),
      where('status', '==', 'published'),
      where('order', '>', currentOrder),
      orderBy('order', 'asc'),
      limit(1),
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].data();
  } catch (error) {
    console.error('Failed to get next lesson:', error);
    throw new Error('Failed to get next lesson');
  }
}

/**
 * Get the previous lesson in a course
 * @param courseId - The course ID
 * @param currentOrder - The current lesson's order
 * @returns The previous lesson or null if at start
 */
export async function getPreviousLesson(
  courseId: string,
  currentOrder: number,
): Promise<Lesson | null> {
  try {
    const lessonsRef = getLessonsCollection();
    const q = query(
      lessonsRef,
      where('courseId', '==', courseId),
      where('status', '==', 'published'),
      where('order', '<', currentOrder),
      orderBy('order', 'desc'),
      limit(1),
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].data();
  } catch (error) {
    console.error('Failed to get previous lesson:', error);
    throw new Error('Failed to get previous lesson');
  }
}

// =============================================================================
// WRITE OPERATIONS
// =============================================================================

/**
 * Create a new lesson
 * @param orgId - The organization ID
 * @param userId - The creating user's ID
 * @param input - Lesson creation data
 * @returns The created lesson with ID
 */
export async function createLesson(
  orgId: string,
  userId: string,
  input: CreateLessonInput,
): Promise<Lesson> {
  try {
    // Use raw collection for write (serverTimestamp() returns FieldValue, not Timestamp)
    const lessonsRef = collection(requireDb(), COLLECTIONS.LESSONS);
    const now = serverTimestamp();

    const lessonData = {
      ...input,
      organizationId: orgId,
      cognitiveLoadTarget: input.cognitiveLoadTarget ?? 'medium',
      isPreviewable: input.isPreviewable ?? false,
      isRequired: input.isRequired ?? true,
      status: 'draft' as const,
      xpReward: input.xpReward ?? 10,
      hasTranscript: false,
      hasCaptions: false,
      hasAudioDescription: false,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId,
    };

    const docRef = await addDoc(lessonsRef, lessonData);
    // Use converter for typed read
    const typedDocRef = docRef.withConverter(lessonConverter);
    const created = await getDoc(typedDocRef);

    if (!created.exists()) {
      throw new Error('Failed to retrieve created lesson');
    }

    // Update course lesson count
    const lessons = await getLessonsByCourse(input.courseId);
    const totalDuration = lessons.reduce((sum, l) => sum + l.durationMinutes, 0);
    const totalXp = lessons.reduce((sum, l) => sum + l.xpReward, 0);

    await updateCourseStats(input.courseId, {
      lessonCount: lessons.length,
      durationMinutes: totalDuration,
      xpTotal: totalXp,
    });

    return created.data();
  } catch (error) {
    console.error('Failed to create lesson:', error);
    throw new Error('Failed to create lesson');
  }
}

/**
 * Update an existing lesson
 * @param lessonId - The lesson document ID
 * @param userId - The updating user's ID
 * @param input - Lesson update data
 * @returns The updated lesson
 */
export async function updateLesson(
  lessonId: string,
  userId: string,
  input: UpdateLessonInput,
): Promise<Lesson> {
  try {
    const docRef = getLessonRef(lessonId);

    await updateDoc(docRef, {
      ...input,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    const updated = await getDoc(docRef);
    if (!updated.exists()) {
      throw new Error('Lesson not found after update');
    }

    // Update course stats if duration or XP changed
    if (input.durationMinutes !== undefined || input.xpReward !== undefined) {
      const lesson = updated.data();
      const lessons = await getLessonsByCourse(lesson.courseId);
      const totalDuration = lessons.reduce((sum, l) => sum + l.durationMinutes, 0);
      const totalXp = lessons.reduce((sum, l) => sum + l.xpReward, 0);

      await updateCourseStats(lesson.courseId, {
        durationMinutes: totalDuration,
        xpTotal: totalXp,
      });
    }

    return updated.data();
  } catch (error) {
    console.error('Failed to update lesson:', error);
    throw new Error(`Failed to update lesson: ${lessonId}`);
  }
}

/**
 * Delete a lesson
 * @param lessonId - The lesson document ID
 */
export async function deleteLesson(lessonId: string): Promise<void> {
  try {
    // Get lesson first to update course stats
    const lesson = await getLesson(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    const docRef = getLessonRef(lessonId);
    await deleteDoc(docRef);

    // Update course stats
    const remainingLessons = await getLessonsByCourse(lesson.courseId);
    const totalDuration = remainingLessons.reduce((sum, l) => sum + l.durationMinutes, 0);
    const totalXp = remainingLessons.reduce((sum, l) => sum + l.xpReward, 0);

    await updateCourseStats(lesson.courseId, {
      lessonCount: remainingLessons.length,
      durationMinutes: totalDuration,
      xpTotal: totalXp,
    });
  } catch (error) {
    console.error('Failed to delete lesson:', error);
    throw new Error(`Failed to delete lesson: ${lessonId}`);
  }
}

/**
 * Reorder lessons within a course
 * @param courseId - The course ID
 * @param lessonIds - Array of lesson IDs in new order
 */
export async function reorderLessons(courseId: string, lessonIds: string[]): Promise<void> {
  try {
    const batch = writeBatch(requireDb());

    lessonIds.forEach((lessonId, index) => {
      const docRef = getLessonRef(lessonId);
      batch.update(docRef, {
        order: index,
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  } catch (error) {
    console.error('Failed to reorder lessons:', error);
    throw new Error(`Failed to reorder lessons for course: ${courseId}`);
  }
}

/**
 * Publish a lesson
 * @param lessonId - The lesson document ID
 * @param userId - The publishing user's ID
 * @returns The published lesson
 */
export async function publishLesson(lessonId: string, userId: string): Promise<Lesson> {
  try {
    const docRef = getLessonRef(lessonId);

    await updateDoc(docRef, {
      status: 'published',
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    const published = await getDoc(docRef);
    if (!published.exists()) {
      throw new Error('Lesson not found after publish');
    }

    return published.data();
  } catch (error) {
    console.error('Failed to publish lesson:', error);
    throw new Error(`Failed to publish lesson: ${lessonId}`);
  }
}

/**
 * Unpublish a lesson
 * @param lessonId - The lesson document ID
 * @param userId - The unpublishing user's ID
 * @returns The unpublished lesson
 */
export async function unpublishLesson(lessonId: string, userId: string): Promise<Lesson> {
  try {
    const docRef = getLessonRef(lessonId);

    await updateDoc(docRef, {
      status: 'draft',
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    const unpublished = await getDoc(docRef);
    if (!unpublished.exists()) {
      throw new Error('Lesson not found after unpublish');
    }

    return unpublished.data();
  } catch (error) {
    console.error('Failed to unpublish lesson:', error);
    throw new Error(`Failed to unpublish lesson: ${lessonId}`);
  }
}

/**
 * Duplicate a lesson
 * @param lessonId - The source lesson ID
 * @param userId - The duplicating user's ID
 * @param courseId - Optional target course ID (defaults to same course)
 * @returns The duplicated lesson
 */
export async function duplicateLesson(
  lessonId: string,
  userId: string,
  courseId?: string,
): Promise<Lesson> {
  try {
    const source = await getLesson(lessonId);
    if (!source) {
      throw new Error('Source lesson not found');
    }

    const targetCourseId = courseId ?? source.courseId;

    // Get the highest order in the target course
    const existingLessons = await getLessonsByCourse(targetCourseId);
    const maxOrder = existingLessons.reduce((max, l) => Math.max(max, l.order), -1);

    return createLesson(source.organizationId, userId, {
      courseId: targetCourseId,
      moduleId: source.moduleId,
      moduleName: source.moduleName,
      title: `${source.title} (Copy)`,
      slug: `${source.slug}-copy-${Date.now()}`,
      description: source.description,
      order: maxOrder + 1,
      durationMinutes: source.durationMinutes,
      contentType: source.contentType,
      contentUrl: source.contentUrl,
      thumbnailUrl: source.thumbnailUrl,
      inspireStage: source.inspireStage,
      cognitiveLoadTarget: source.cognitiveLoadTarget,
      isPreviewable: source.isPreviewable,
      isRequired: source.isRequired,
      xpReward: source.xpReward,
    });
  } catch (error) {
    console.error('Failed to duplicate lesson:', error);
    throw new Error(`Failed to duplicate lesson: ${lessonId}`);
  }
}
