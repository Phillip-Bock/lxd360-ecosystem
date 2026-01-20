import {
  type CollectionReference,
  collection,
  type DocumentReference,
  doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type {
  Assessment,
  ContentBlock,
  Course,
  Lesson,
  MediaAsset,
  Organization,
  UserProgress,
} from '@/types/firestore/cms';
import {
  assessmentConverter,
  contentBlockConverter,
  courseConverter,
  lessonConverter,
  mediaAssetConverter,
  organizationConverter,
  userProgressConverter,
} from './converters';

// =============================================================================
// COLLECTION NAMES
// =============================================================================

/**
 * Firestore collection names as constants
 */
export const COLLECTIONS = {
  COURSES: 'courses',
  LESSONS: 'lessons',
  CONTENT_BLOCKS: 'content_blocks',
  ASSESSMENTS: 'assessments',
  MEDIA_ASSETS: 'media_assets',
  USER_PROGRESS: 'user_progress',
  ORGANIZATIONS: 'organizations',
} as const;

// =============================================================================
// TYPED COLLECTION REFERENCES
// =============================================================================

/**
 * Get typed courses collection reference
 */
export function getCoursesCollection(): CollectionReference<Course> {
  return collection(db, COLLECTIONS.COURSES).withConverter(courseConverter);
}

/**
 * Get typed course document reference
 * @param courseId - The course document ID
 */
export function getCourseRef(courseId: string): DocumentReference<Course> {
  return doc(db, COLLECTIONS.COURSES, courseId).withConverter(courseConverter);
}

/**
 * Get typed lessons collection reference
 */
export function getLessonsCollection(): CollectionReference<Lesson> {
  return collection(db, COLLECTIONS.LESSONS).withConverter(lessonConverter);
}

/**
 * Get typed lesson document reference
 * @param lessonId - The lesson document ID
 */
export function getLessonRef(lessonId: string): DocumentReference<Lesson> {
  return doc(db, COLLECTIONS.LESSONS, lessonId).withConverter(lessonConverter);
}

/**
 * Get typed content blocks collection reference
 */
export function getContentBlocksCollection(): CollectionReference<ContentBlock> {
  return collection(db, COLLECTIONS.CONTENT_BLOCKS).withConverter(contentBlockConverter);
}

/**
 * Get typed content block document reference
 * @param blockId - The content block document ID
 */
export function getContentBlockRef(blockId: string): DocumentReference<ContentBlock> {
  return doc(db, COLLECTIONS.CONTENT_BLOCKS, blockId).withConverter(contentBlockConverter);
}

/**
 * Get typed assessments collection reference
 */
export function getAssessmentsCollection(): CollectionReference<Assessment> {
  return collection(db, COLLECTIONS.ASSESSMENTS).withConverter(assessmentConverter);
}

/**
 * Get typed assessment document reference
 * @param assessmentId - The assessment document ID
 */
export function getAssessmentRef(assessmentId: string): DocumentReference<Assessment> {
  return doc(db, COLLECTIONS.ASSESSMENTS, assessmentId).withConverter(assessmentConverter);
}

/**
 * Get typed media assets collection reference
 */
export function getMediaAssetsCollection(): CollectionReference<MediaAsset> {
  return collection(db, COLLECTIONS.MEDIA_ASSETS).withConverter(mediaAssetConverter);
}

/**
 * Get typed media asset document reference
 * @param assetId - The media asset document ID
 */
export function getMediaAssetRef(assetId: string): DocumentReference<MediaAsset> {
  return doc(db, COLLECTIONS.MEDIA_ASSETS, assetId).withConverter(mediaAssetConverter);
}

/**
 * Get typed user progress collection reference
 */
export function getUserProgressCollection(): CollectionReference<UserProgress> {
  return collection(db, COLLECTIONS.USER_PROGRESS).withConverter(userProgressConverter);
}

/**
 * Get typed user progress document reference
 * @param progressId - The user progress document ID
 */
export function getUserProgressRef(progressId: string): DocumentReference<UserProgress> {
  return doc(db, COLLECTIONS.USER_PROGRESS, progressId).withConverter(userProgressConverter);
}

/**
 * Get typed organizations collection reference
 */
export function getOrganizationsCollection(): CollectionReference<Organization> {
  return collection(db, COLLECTIONS.ORGANIZATIONS).withConverter(organizationConverter);
}

/**
 * Get typed organization document reference
 * @param organizationId - The organization document ID
 */
export function getOrganizationRef(organizationId: string): DocumentReference<Organization> {
  return doc(db, COLLECTIONS.ORGANIZATIONS, organizationId).withConverter(organizationConverter);
}

// =============================================================================
// ORGANIZATION-SCOPED COLLECTIONS
// =============================================================================

/**
 * Get typed courses collection scoped to an organization
 * @param organizationId - The organization ID
 */
export function getOrgCoursesCollection(organizationId: string): CollectionReference<Course> {
  return collection(
    db,
    COLLECTIONS.ORGANIZATIONS,
    organizationId,
    COLLECTIONS.COURSES,
  ).withConverter(courseConverter);
}

/**
 * Get typed course reference within an organization
 * @param organizationId - The organization ID
 * @param courseId - The course document ID
 */
export function getOrgCourseRef(
  organizationId: string,
  courseId: string,
): DocumentReference<Course> {
  return doc(
    db,
    COLLECTIONS.ORGANIZATIONS,
    organizationId,
    COLLECTIONS.COURSES,
    courseId,
  ).withConverter(courseConverter);
}

/**
 * Get typed lessons collection scoped to an organization
 * @param organizationId - The organization ID
 */
export function getOrgLessonsCollection(organizationId: string): CollectionReference<Lesson> {
  return collection(
    db,
    COLLECTIONS.ORGANIZATIONS,
    organizationId,
    COLLECTIONS.LESSONS,
  ).withConverter(lessonConverter);
}

/**
 * Get typed lesson reference within an organization
 * @param organizationId - The organization ID
 * @param lessonId - The lesson document ID
 */
export function getOrgLessonRef(
  organizationId: string,
  lessonId: string,
): DocumentReference<Lesson> {
  return doc(
    db,
    COLLECTIONS.ORGANIZATIONS,
    organizationId,
    COLLECTIONS.LESSONS,
    lessonId,
  ).withConverter(lessonConverter);
}
