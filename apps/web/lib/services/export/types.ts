/**
 * Export Engine Types
 *
 * This module defines the core types for the LXD360 export engine,
 * supporting SCORM 1.2, SCORM 2004, xAPI, cmi5, HTML5, and PDF exports.
 *
 * @module lib/services/export/types
 */

// ============================================================================
// EXPORT FORMAT
// ============================================================================

/**
 * Supported export formats
 */
export type ExportFormat = 'scorm12' | 'scorm2004' | 'xapi' | 'cmi5' | 'html5' | 'pdf';

// ============================================================================
// EXPORT OPTIONS
// ============================================================================

/**
 * Options for exporting a course
 */
export interface ExportOptions {
  /** Export format to use */
  format: ExportFormat;
  /** Course ID to export */
  courseId: string;
  /** Tenant ID for multi-tenant context */
  tenantId: string;
  /** Whether to include media assets in the export */
  includeMedia: boolean;
  /** ZIP compression level (1-9, default 6) */
  compressionLevel?: number;
  /** SCORM-specific settings */
  scormSettings?: SCORMExportSettings;
  /** xAPI-specific settings */
  xapiSettings?: XAPIExportSettings;
  /** PDF-specific settings */
  pdfSettings?: PDFExportSettings;
}

/**
 * SCORM export settings
 */
export interface SCORMExportSettings {
  /** Passing score (0-100) */
  passingScore: number;
  /** Time limit in minutes (0 = unlimited) */
  timeLimit: number;
  /** Credit mode */
  credit: 'credit' | 'no-credit';
  /** Allow review after completion */
  allowReview: boolean;
  /** Launch data to pass to content */
  launchData?: string;
}

/**
 * xAPI export settings
 */
export interface XAPIExportSettings {
  /** LRS endpoint URL */
  endpoint?: string;
  /** Activity ID prefix */
  activityIdPrefix: string;
  /** Include verbose tracking */
  verboseTracking: boolean;
}

/**
 * PDF export settings
 */
export interface PDFExportSettings {
  /** Paper size */
  paperSize: 'letter' | 'a4' | 'legal';
  /** Include table of contents */
  includeToc: boolean;
  /** Include images */
  includeImages: boolean;
  /** Page margins in points */
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// ============================================================================
// EXPORT RESULT
// ============================================================================

/**
 * Result of an export operation
 */
export interface ExportResult {
  /** The exported content as a Blob */
  blob: Blob;
  /** Suggested filename for download */
  filename: string;
  /** MIME type of the export */
  mimeType: string;
  /** Size of the export in bytes */
  size: number;
}

// ============================================================================
// COURSE DATA (For Export)
// ============================================================================

/**
 * Course data structure for export
 */
export interface CourseExportData {
  /** Course ID */
  id: string;
  /** Course title */
  title: string;
  /** Course description */
  description: string;
  /** Course version */
  version: string;
  /** Primary language (ISO 639-1) */
  language: string;
  /** Duration in ISO 8601 format */
  duration?: string;
  /** Author information */
  author?: {
    name: string;
    email?: string;
    organization?: string;
  };
  /** Copyright information */
  copyright?: string;
  /** Keywords/tags */
  keywords?: string[];
  /** Modules in the course */
  modules: ModuleExportData[];
}

/**
 * Module data for export
 */
export interface ModuleExportData {
  /** Module ID */
  id: string;
  /** Module title */
  title: string;
  /** Module description */
  description?: string;
  /** Order within the course */
  order: number;
  /** Lessons in the module */
  lessons: LessonExportData[];
}

/**
 * Lesson data for export
 */
export interface LessonExportData {
  /** Lesson ID */
  id: string;
  /** Lesson title */
  title: string;
  /** Lesson description */
  description?: string;
  /** Order within the module */
  order: number;
  /** Content blocks */
  blocks: ContentBlockExportData[];
  /** Associated media assets */
  media?: MediaAssetExportData[];
}

/**
 * Content block data for export
 */
export interface ContentBlockExportData {
  /** Block ID */
  id: string;
  /** Block type */
  type: string;
  /** Block content (HTML or structured data) */
  content: string;
  /** Order within the lesson */
  order: number;
}

/**
 * Media asset data for export
 */
export interface MediaAssetExportData {
  /** Asset ID */
  id: string;
  /** Asset URL */
  url: string;
  /** MIME type */
  mimeType: string;
  /** Filename */
  filename: string;
  /** File size in bytes */
  size?: number;
}

// ============================================================================
// SCORM MANIFEST TYPES
// ============================================================================

/**
 * SCORM manifest data structure
 */
export interface SCORMManifestData {
  /** Manifest identifier */
  identifier: string;
  /** Course metadata */
  metadata: {
    schema: string;
    schemaversion: string;
    title: string;
    description?: string;
    language?: string;
    keywords?: string[];
  };
  /** Organization structure */
  organizations: SCORMOrganization[];
  /** Resource definitions */
  resources: SCORMResource[];
}

/**
 * SCORM organization (course hierarchy)
 */
export interface SCORMOrganization {
  /** Organization identifier */
  identifier: string;
  /** Organization title */
  title: string;
  /** Items (modules/lessons) */
  items: SCORMItem[];
}

/**
 * SCORM item (module or lesson)
 */
export interface SCORMItem {
  /** Item identifier */
  identifier: string;
  /** Item title */
  title: string;
  /** Reference to resource (for leaf items) */
  identifierref?: string;
  /** Child items */
  items?: SCORMItem[];
  /** Mastery score (SCORM 2004) */
  masteryScore?: number;
}

/**
 * SCORM resource
 */
export interface SCORMResource {
  /** Resource identifier */
  identifier: string;
  /** Resource type */
  type: 'webcontent' | 'asset';
  /** SCORM type */
  scormType: 'sco' | 'asset';
  /** Entry point href */
  href: string;
  /** Files in this resource */
  files: Array<{ href: string }>;
}

// ============================================================================
// DEFAULT SETTINGS
// ============================================================================

/**
 * Get default SCORM export settings
 */
export function getDefaultSCORMSettings(): SCORMExportSettings {
  return {
    passingScore: 80,
    timeLimit: 0,
    credit: 'credit',
    allowReview: true,
  };
}

/**
 * Get default xAPI export settings
 */
export function getDefaultXAPISettings(): XAPIExportSettings {
  return {
    activityIdPrefix: 'https://lxd360.com/xapi/activities',
    verboseTracking: true,
  };
}

/**
 * Get default PDF export settings
 */
export function getDefaultPDFSettings(): PDFExportSettings {
  return {
    paperSize: 'letter',
    includeToc: true,
    includeImages: true,
    margins: {
      top: 72,
      right: 72,
      bottom: 72,
      left: 72,
    },
  };
}
