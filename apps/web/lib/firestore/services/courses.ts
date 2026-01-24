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
  startAfter,
  updateDoc,
  where,
} from 'firebase/firestore';
import { requireDb } from '@/lib/firebase/client';
import type {
  Course,
  CourseFilters,
  CreateCourseInput,
  PaginatedResponse,
  PaginationOptions,
  UpdateCourseInput,
} from '@/types/firestore/cms';
import { COLLECTIONS, getCourseRef, getCoursesCollection } from '../collections';
import { courseConverter } from '../converters';

// =============================================================================
// READ OPERATIONS
// =============================================================================

/**
 * Get a single course by ID
 * @param courseId - The course document ID
 * @returns The course document or null if not found
 */
export async function getCourse(courseId: string): Promise<Course | null> {
  try {
    const docRef = getCourseRef(courseId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return docSnap.data();
  } catch (error) {
    console.error('Failed to get course:', error);
    throw new Error(`Failed to get course: ${courseId}`);
  }
}

/**
 * Get courses by organization ID
 * @param orgId - The organization ID
 * @param options - Pagination options
 * @returns Paginated list of courses
 */
export async function getCoursesByOrg(
  orgId: string,
  options: PaginationOptions = { limit: 20 },
): Promise<PaginatedResponse<Course>> {
  try {
    const coursesRef = getCoursesCollection();
    let q = query(
      coursesRef,
      where('organizationId', '==', orgId),
      orderBy(options.orderBy ?? 'createdAt', options.orderDirection ?? 'desc'),
      limit(options.limit + 1), // Fetch one extra to determine if there are more
    );

    if (options.cursor) {
      const cursorDoc = await getDoc(getCourseRef(options.cursor));
      if (cursorDoc.exists()) {
        q = query(q, startAfter(cursorDoc));
      }
    }

    const snapshot = await getDocs(q);
    const courses = snapshot.docs.map((doc) => doc.data());

    const hasMore = courses.length > options.limit;
    if (hasMore) {
      courses.pop(); // Remove the extra item
    }

    return {
      items: courses,
      hasMore,
      nextCursor: hasMore ? courses[courses.length - 1]?.id : undefined,
    };
  } catch (error) {
    console.error('Failed to get courses by org:', error);
    throw new Error(`Failed to get courses for organization: ${orgId}`);
  }
}

/**
 * Get published courses by organization
 * @param orgId - The organization ID
 * @param options - Pagination options
 * @returns Paginated list of published courses
 */
export async function getPublishedCourses(
  orgId: string,
  options: PaginationOptions = { limit: 20 },
): Promise<PaginatedResponse<Course>> {
  try {
    const coursesRef = getCoursesCollection();
    let q = query(
      coursesRef,
      where('organizationId', '==', orgId),
      where('status', '==', 'published'),
      orderBy(options.orderBy ?? 'publishedAt', options.orderDirection ?? 'desc'),
      limit(options.limit + 1),
    );

    if (options.cursor) {
      const cursorDoc = await getDoc(getCourseRef(options.cursor));
      if (cursorDoc.exists()) {
        q = query(q, startAfter(cursorDoc));
      }
    }

    const snapshot = await getDocs(q);
    const courses = snapshot.docs.map((doc) => doc.data());

    const hasMore = courses.length > options.limit;
    if (hasMore) {
      courses.pop();
    }

    return {
      items: courses,
      hasMore,
      nextCursor: hasMore ? courses[courses.length - 1]?.id : undefined,
    };
  } catch (error) {
    console.error('Failed to get published courses:', error);
    throw new Error(`Failed to get published courses for organization: ${orgId}`);
  }
}

/**
 * Get courses by category
 * @param orgId - The organization ID
 * @param categoryId - The category ID
 * @param options - Pagination options
 * @returns Paginated list of courses in category
 */
export async function getCoursesByCategory(
  orgId: string,
  categoryId: string,
  options: PaginationOptions = { limit: 20 },
): Promise<PaginatedResponse<Course>> {
  try {
    const coursesRef = getCoursesCollection();
    const q = query(
      coursesRef,
      where('organizationId', '==', orgId),
      where('categoryId', '==', categoryId),
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc'),
      limit(options.limit + 1),
    );

    const snapshot = await getDocs(q);
    const courses = snapshot.docs.map((doc) => doc.data());

    const hasMore = courses.length > options.limit;
    if (hasMore) {
      courses.pop();
    }

    return {
      items: courses,
      hasMore,
      nextCursor: hasMore ? courses[courses.length - 1]?.id : undefined,
    };
  } catch (error) {
    console.error('Failed to get courses by category:', error);
    throw new Error(`Failed to get courses for category: ${categoryId}`);
  }
}

/**
 * Get courses by instructor
 * @param orgId - The organization ID
 * @param instructorId - The instructor user ID
 * @returns List of courses by instructor
 */
export async function getCoursesByInstructor(
  orgId: string,
  instructorId: string,
): Promise<Course[]> {
  try {
    const coursesRef = getCoursesCollection();
    const q = query(
      coursesRef,
      where('organizationId', '==', orgId),
      where('instructorId', '==', instructorId),
      orderBy('createdAt', 'desc'),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error('Failed to get courses by instructor:', error);
    throw new Error(`Failed to get courses for instructor: ${instructorId}`);
  }
}

/**
 * Search courses with filters
 * @param orgId - The organization ID
 * @param filters - Course filters
 * @param options - Pagination options
 * @returns Paginated filtered courses
 */
export async function searchCourses(
  orgId: string,
  filters: CourseFilters,
  options: PaginationOptions = { limit: 20 },
): Promise<PaginatedResponse<Course>> {
  try {
    const coursesRef = getCoursesCollection();
    const whereConstraints = [where('organizationId', '==', orgId)];

    if (filters.status) {
      whereConstraints.push(where('status', '==', filters.status));
    }

    if (filters.categoryIds && filters.categoryIds.length > 0) {
      whereConstraints.push(where('categoryId', 'in', filters.categoryIds));
    }

    if (filters.difficulties && filters.difficulties.length > 0) {
      whereConstraints.push(where('difficulty', 'in', filters.difficulties));
    }

    if (filters.accessType) {
      whereConstraints.push(where('accessType', '==', filters.accessType));
    }

    if (filters.complianceOnly) {
      whereConstraints.push(where('isComplianceRequired', '==', true));
    }

    const q = query(
      coursesRef,
      ...whereConstraints,
      orderBy(options.orderBy ?? 'createdAt', options.orderDirection ?? 'desc'),
      limit(options.limit + 1),
    );
    const snapshot = await getDocs(q);
    const courses = snapshot.docs.map((doc) => doc.data());

    const hasMore = courses.length > options.limit;
    if (hasMore) {
      courses.pop();
    }

    return {
      items: courses,
      hasMore,
      nextCursor: hasMore ? courses[courses.length - 1]?.id : undefined,
    };
  } catch (error) {
    console.error('Failed to search courses:', error);
    throw new Error('Failed to search courses');
  }
}

// =============================================================================
// WRITE OPERATIONS
// =============================================================================

/**
 * Create a new course
 * @param orgId - The organization ID
 * @param userId - The creating user's ID
 * @param input - Course creation data
 * @returns The created course with ID
 */
export async function createCourse(
  orgId: string,
  userId: string,
  input: CreateCourseInput,
): Promise<Course> {
  try {
    // Use raw collection for write (serverTimestamp() returns FieldValue, not Timestamp)
    const coursesRef = collection(requireDb(), COLLECTIONS.COURSES);
    const now = serverTimestamp();

    const courseData = {
      ...input,
      organizationId: orgId,
      thumbnailUrl: input.thumbnailUrl ?? '',
      durationMinutes: 0,
      inspireStages: [],
      cognitiveLoadTarget: 'medium' as const,
      coInstructorIds: [],
      prerequisiteIds: [],
      status: 'draft' as const,
      version: '1.0.0',
      lessonCount: 0,
      moduleCount: 0,
      assessmentCount: 0,
      averageRating: 0,
      reviewCount: 0,
      enrollmentCount: 0,
      completionRate: 0,
      language: input.language ?? 'en',
      captionLanguages: [],
      xpTotal: 0,
      accessType: input.accessType ?? 'free',
      currency: 'USD',
      isComplianceRequired: false,
      tags: input.tags ?? [],
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId,
    };

    const docRef = await addDoc(coursesRef, courseData);
    // Use converter for typed read
    const typedDocRef = docRef.withConverter(courseConverter);
    const created = await getDoc(typedDocRef);

    if (!created.exists()) {
      throw new Error('Failed to retrieve created course');
    }

    return created.data();
  } catch (error) {
    console.error('Failed to create course:', error);
    throw new Error('Failed to create course');
  }
}

/**
 * Update an existing course
 * @param courseId - The course document ID
 * @param userId - The updating user's ID
 * @param input - Course update data
 * @returns The updated course
 */
export async function updateCourse(
  courseId: string,
  userId: string,
  input: UpdateCourseInput,
): Promise<Course> {
  try {
    const docRef = getCourseRef(courseId);

    await updateDoc(docRef, {
      ...input,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    const updated = await getDoc(docRef);
    if (!updated.exists()) {
      throw new Error('Course not found after update');
    }

    return updated.data();
  } catch (error) {
    console.error('Failed to update course:', error);
    throw new Error(`Failed to update course: ${courseId}`);
  }
}

/**
 * Delete a course
 * @param courseId - The course document ID
 */
export async function deleteCourse(courseId: string): Promise<void> {
  try {
    const docRef = getCourseRef(courseId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Failed to delete course:', error);
    throw new Error(`Failed to delete course: ${courseId}`);
  }
}

/**
 * Publish a course (change status to published)
 * @param courseId - The course document ID
 * @param userId - The publishing user's ID
 * @returns The published course
 */
export async function publishCourse(courseId: string, userId: string): Promise<Course> {
  try {
    const docRef = getCourseRef(courseId);

    await updateDoc(docRef, {
      status: 'published',
      publishedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    const published = await getDoc(docRef);
    if (!published.exists()) {
      throw new Error('Course not found after publish');
    }

    return published.data();
  } catch (error) {
    console.error('Failed to publish course:', error);
    throw new Error(`Failed to publish course: ${courseId}`);
  }
}

/**
 * Unpublish a course (change status to draft)
 * @param courseId - The course document ID
 * @param userId - The unpublishing user's ID
 * @returns The unpublished course
 */
export async function unpublishCourse(courseId: string, userId: string): Promise<Course> {
  try {
    const docRef = getCourseRef(courseId);

    await updateDoc(docRef, {
      status: 'draft',
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    const unpublished = await getDoc(docRef);
    if (!unpublished.exists()) {
      throw new Error('Course not found after unpublish');
    }

    return unpublished.data();
  } catch (error) {
    console.error('Failed to unpublish course:', error);
    throw new Error(`Failed to unpublish course: ${courseId}`);
  }
}

/**
 * Archive a course
 * @param courseId - The course document ID
 * @param userId - The archiving user's ID
 * @returns The archived course
 */
export async function archiveCourse(courseId: string, userId: string): Promise<Course> {
  try {
    const docRef = getCourseRef(courseId);

    await updateDoc(docRef, {
      status: 'archived',
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    const archived = await getDoc(docRef);
    if (!archived.exists()) {
      throw new Error('Course not found after archive');
    }

    return archived.data();
  } catch (error) {
    console.error('Failed to archive course:', error);
    throw new Error(`Failed to archive course: ${courseId}`);
  }
}

/**
 * Increment course enrollment count
 * @param courseId - The course document ID
 */
export async function incrementEnrollmentCount(courseId: string): Promise<void> {
  try {
    const docRef = getCourseRef(courseId);
    const course = await getDoc(docRef);

    if (!course.exists()) {
      throw new Error('Course not found');
    }

    const currentCount = course.data().enrollmentCount ?? 0;

    await updateDoc(docRef, {
      enrollmentCount: currentCount + 1,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to increment enrollment count:', error);
    throw new Error(`Failed to increment enrollment count: ${courseId}`);
  }
}

/**
 * Update course statistics (lesson count, duration, etc.)
 * @param courseId - The course document ID
 * @param stats - Statistics to update
 */
export async function updateCourseStats(
  courseId: string,
  stats: {
    lessonCount?: number;
    moduleCount?: number;
    assessmentCount?: number;
    durationMinutes?: number;
    xpTotal?: number;
  },
): Promise<void> {
  try {
    const docRef = getCourseRef(courseId);

    await updateDoc(docRef, {
      ...stats,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to update course stats:', error);
    throw new Error(`Failed to update course stats: ${courseId}`);
  }
}
