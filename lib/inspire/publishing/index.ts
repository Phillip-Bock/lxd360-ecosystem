/**
 * INSPIRE Publishing Module
 *
 * Bridge between INSPIRE Studio and Ignite LMS for publishing courses.
 *
 * @module lib/inspire/publishing
 */

export {
  type CourseBlock,
  type CourseManifest,
  type CourseMetadata,
  getPublishHistory,
  type PublishOptions,
  type PublishResult,
  publishToIgnite,
  unpublishCourse,
  type ValidationResult,
  validateManifest,
} from './publishToIgnite';
