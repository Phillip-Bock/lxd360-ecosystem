import {
  COLLECTIONS,
  type Course,
  type CourseMetadata,
  type CourseSettings,
  type CourseStatus,
} from '@/lib/firebase/collections';
import {
  createDocument,
  type DocumentData,
  type DocumentSnapshot,
  deleteDocumentById,
  type FirestoreListResult,
  type FirestorePaginatedResult,
  type FirestoreResult,
  filters,
  getDocumentById,
  getDocumentsList,
  getDocumentsPaginated,
  limitTo,
  sort,
  updateDocumentById,
} from '@/lib/firebase/firestore-client';

// =============================================================================
// Types
// =============================================================================

/**
 * Input for creating a new course
 */
export interface CreateCourseInput {
  organizationId: string;
  title: string;
  description: string;
  instructorId: string;
  thumbnail?: string;
  settings?: Partial<CourseSettings>;
  metadata?: Partial<CourseMetadata>;
}

/**
 * Input for updating a course
 */
export interface UpdateCourseInput {
  title?: string;
  description?: string;
  thumbnail?: string;
  settings?: Partial<CourseSettings>;
  metadata?: Partial<CourseMetadata>;
}

/**
 * Filters for listing courses
 */
export interface CourseFilters {
  organizationId?: string;
  instructorId?: string;
  status?: CourseStatus;
  isPublic?: boolean;
}

// =============================================================================
// Course Operations
// =============================================================================

/**
 * Get a single course by ID
 *
 * @example
 * ```typescript
 * const { data: course, error } = await getCourse('course-123');
 * if (course) {
 *   console.error(course.title);
 * }
 * ```
 */
export async function getCourse(courseId: string): Promise<FirestoreResult<Course>> {
  return getDocumentById<Course>(COLLECTIONS.COURSES, courseId);
}

/**
 * Get courses for an organization
 *
 * @example
 * ```typescript
 * const { data: courses, error } = await getCoursesByOrganization('org-123');
 * courses.forEach(course => console.error(course.title));
 * ```
 */
export async function getCoursesByOrganization(
  organizationId: string,
): Promise<FirestoreListResult<Course>> {
  return getDocumentsList<Course>(COLLECTIONS.COURSES, [
    filters.eq('organizationId', organizationId),
    sort('createdAt', 'desc'),
  ]);
}

/**
 * Get published courses for an organization
 */
export async function getPublishedCourses(
  organizationId: string,
): Promise<FirestoreListResult<Course>> {
  return getDocumentsList<Course>(COLLECTIONS.COURSES, [
    filters.eq('organizationId', organizationId),
    filters.eq('status', 'published'),
    sort('title', 'asc'),
  ]);
}

/**
 * Get courses by instructor
 */
export async function getCoursesByInstructor(
  instructorId: string,
): Promise<FirestoreListResult<Course>> {
  return getDocumentsList<Course>(COLLECTIONS.COURSES, [
    filters.eq('instructorId', instructorId),
    sort('createdAt', 'desc'),
  ]);
}

/**
 * Get courses with filters and pagination
 *
 * @example
 * ```typescript
 * const { data, hasMore, lastDoc } = await getCoursesFiltered(
 *   { organizationId: 'org-123', status: 'published' },
 *   { pageSize: 10 }
 * );
 * ```
 */
export async function getCoursesFiltered(
  courseFilters: CourseFilters,
  options: {
    pageSize?: number;
    lastDocument?: DocumentSnapshot<DocumentData> | null;
  } = {},
): Promise<FirestorePaginatedResult<Course>> {
  const constraints = [];

  if (courseFilters.organizationId) {
    constraints.push(filters.eq('organizationId', courseFilters.organizationId));
  }

  if (courseFilters.instructorId) {
    constraints.push(filters.eq('instructorId', courseFilters.instructorId));
  }

  if (courseFilters.status) {
    constraints.push(filters.eq('status', courseFilters.status));
  }

  if (courseFilters.isPublic !== undefined) {
    constraints.push(filters.eq('settings.isPublic', courseFilters.isPublic));
  }

  constraints.push(sort('createdAt', 'desc'));

  return getDocumentsPaginated<Course>(
    COLLECTIONS.COURSES,
    constraints,
    options.pageSize ?? 20,
    options.lastDocument,
  );
}

/**
 * Search courses by title
 *
 * Note: Firestore doesn't support full-text search natively.
 * For production, consider Algolia or Elasticsearch integration.
 */
export async function searchCourses(
  organizationId: string,
  searchTerm: string,
  maxResults: number = 10,
): Promise<FirestoreListResult<Course>> {
  // Firestore prefix search using >= and < operators
  const endTerm =
    searchTerm.slice(0, -1) + String.fromCharCode(searchTerm.charCodeAt(searchTerm.length - 1) + 1);

  return getDocumentsList<Course>(COLLECTIONS.COURSES, [
    filters.eq('organizationId', organizationId),
    filters.gte('title', searchTerm),
    filters.lt('title', endTerm),
    limitTo(maxResults),
  ]);
}

/**
 * Create a new course
 *
 * @example
 * ```typescript
 * const { data: course, error } = await createCourse({
 *   organizationId: 'org-123',
 *   title: 'Introduction to TypeScript',
 *   description: 'Learn TypeScript fundamentals',
 *   instructorId: 'user-456',
 * });
 * ```
 */
export async function createCourse(input: CreateCourseInput): Promise<FirestoreResult<Course>> {
  const slug = generateSlug(input.title);

  const defaultSettings: CourseSettings = {
    isPublic: false,
    requiresEnrollment: true,
    allowSelfEnrollment: false,
    completionCriteria: 'all_lessons',
    certificateEnabled: false,
    discussionEnabled: false,
    ...input.settings,
  };

  const defaultMetadata: CourseMetadata = {
    difficulty: 'beginner',
    tags: [],
    objectives: [],
    prerequisites: [],
    ...input.metadata,
  };

  const courseData = {
    organizationId: input.organizationId,
    title: input.title,
    description: input.description,
    slug,
    status: 'draft' as const,
    thumbnail: input.thumbnail,
    instructorId: input.instructorId,
    settings: defaultSettings,
    metadata: defaultMetadata,
    moduleIds: [] as string[],
    enrollmentCount: 0,
  };

  return createDocument(COLLECTIONS.COURSES, courseData) as unknown as Promise<
    FirestoreResult<Course>
  >;
}

/**
 * Update a course
 *
 * @example
 * ```typescript
 * const { data, error } = await updateCourse('course-123', {
 *   title: 'Updated Title',
 *   settings: { isPublic: true },
 * });
 * ```
 */
export async function updateCourse(
  courseId: string,
  updates: UpdateCourseInput,
): Promise<FirestoreResult<Course>> {
  // Build update object
  const updateData: Record<string, unknown> = {};

  if (updates.title !== undefined) {
    updateData.title = updates.title;
    updateData.slug = generateSlug(updates.title);
  }

  if (updates.description !== undefined) {
    updateData.description = updates.description;
  }

  if (updates.thumbnail !== undefined) {
    updateData.thumbnail = updates.thumbnail;
  }

  if (updates.settings !== undefined) {
    updateData.settings = updates.settings;
  }

  if (updates.metadata !== undefined) {
    updateData.metadata = updates.metadata;
  }

  return updateDocumentById(COLLECTIONS.COURSES, courseId, updateData) as unknown as Promise<
    FirestoreResult<Course>
  >;
}

/**
 * Delete a course
 *
 * @example
 * ```typescript
 * const { error } = await deleteCourse('course-123');
 * if (!error) {
 *   console.error('Course deleted');
 * }
 * ```
 */
export async function deleteCourse(courseId: string): Promise<{ error: Error | null }> {
  return deleteDocumentById(COLLECTIONS.COURSES, courseId);
}

// =============================================================================
// Status Operations
// =============================================================================

/**
 * Publish a course (change status to published)
 */
export async function publishCourse(courseId: string): Promise<FirestoreResult<Course>> {
  return updateDocumentById<Course>(COLLECTIONS.COURSES, courseId, {
    status: 'published',
  });
}

/**
 * Archive a course
 */
export async function archiveCourse(courseId: string): Promise<FirestoreResult<Course>> {
  return updateDocumentById<Course>(COLLECTIONS.COURSES, courseId, {
    status: 'archived',
  });
}

/**
 * Submit a course for review
 */
export async function submitForReview(courseId: string): Promise<FirestoreResult<Course>> {
  return updateDocumentById<Course>(COLLECTIONS.COURSES, courseId, {
    status: 'review',
  });
}

/**
 * Revert course to draft
 */
export async function revertToDraft(courseId: string): Promise<FirestoreResult<Course>> {
  return updateDocumentById<Course>(COLLECTIONS.COURSES, courseId, {
    status: 'draft',
  });
}

// =============================================================================
// Enrollment Operations
// =============================================================================

/**
 * Increment enrollment count
 */
export async function incrementEnrollmentCount(courseId: string): Promise<FirestoreResult<Course>> {
  const { data: course, error } = await getCourse(courseId);

  if (error || !course) {
    return { data: null, error: error ?? new Error('Course not found') };
  }

  return updateDocumentById<Course>(COLLECTIONS.COURSES, courseId, {
    enrollmentCount: course.enrollmentCount + 1,
  });
}

/**
 * Decrement enrollment count
 */
export async function decrementEnrollmentCount(courseId: string): Promise<FirestoreResult<Course>> {
  const { data: course, error } = await getCourse(courseId);

  if (error || !course) {
    return { data: null, error: error ?? new Error('Course not found') };
  }

  return updateDocumentById<Course>(COLLECTIONS.COURSES, courseId, {
    enrollmentCount: Math.max(0, course.enrollmentCount - 1),
  });
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Generate a URL-friendly slug from a title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
}
