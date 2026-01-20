// Import types we need to use locally
import type {
  ExportFormat as ExportFormatImport,
  SCORMManifest as SCORMManifestImport,
  SCORMVersion as SCORMVersionImport,
} from '@/lib/export/types';

// ============================================================================
// RE-EXPORTS FROM LIB/EXPORT/TYPES
// ============================================================================

export type {
  AssessmentSettings,
  AuthorInfo,
  CompletionCriteria,
  ContentItem,
  ContentItemType,
  ContentResource,
  CourseMetadata,
  ExportError,
  ExportFormat,
  ExportOptions,
  ExportResult,
  ExportSettings,
  ExportStats,
  ManifestMetadata,
  Objective,
  Organization,
  OrganizationItem,
  PackagingOptions,
  Resource,
  ResourceFile,
  RollupRule,
  SCORMManifest,
  SCORMSettings,
  SCORMVersion,
  ScoringMethod,
  SequencingRules,
  XAPISettings,
} from '@/lib/export/types';

export {
  getDefaultSettings,
  isSCORMFormat,
  isXAPIFormat,
} from '@/lib/export/types';

// ============================================================================
// ADDITIONAL EXPORT TYPES
// ============================================================================

/**
 * Export job status
 */
export type ExportJobStatus =
  | 'pending'
  | 'processing'
  | 'packaging'
  | 'uploading'
  | 'completed'
  | 'failed';

/**
 * Export job record
 */
export interface ExportJob {
  /** Unique job identifier */
  id: string;
  /** Course being exported */
  courseId: string;
  /** Export format */
  format: ExportFormatImport;
  /** Current job status */
  status: ExportJobStatus;
  /** Progress percentage (0-100) */
  progress: number;
  /** Status message */
  message?: string;
  /** Error message if failed */
  error?: string;
  /** Job creation timestamp */
  createdAt: string;
  /** Job start timestamp */
  startedAt?: string;
  /** Job completion timestamp */
  completedAt?: string;
  /** Resulting package URL */
  packageUrl?: string;
  /** Package file size in bytes */
  packageSize?: number;
  /** User who initiated the export */
  userId: string;
  /** Tenant ID */
  tenantId: string;
}

/**
 * Export progress event
 */
export interface ExportProgressEvent {
  /** Job ID */
  jobId: string;
  /** Progress percentage (0-100) */
  progress: number;
  /** Current status */
  status: ExportJobStatus;
  /** Status message */
  message: string;
  /** Timestamp */
  timestamp: string;
}

/**
 * SCORM package structure
 */
export interface SCORMPackage {
  /** Package manifest */
  manifest: SCORMManifestImport;
  /** List of files in the package */
  files: SCORMPackageFile[];
  /** Package metadata */
  metadata: {
    /** Total file count */
    fileCount: number;
    /** Total package size in bytes */
    totalSize: number;
    /** SCORM version */
    scormVersion: SCORMVersionImport;
    /** Creation date */
    createdAt: string;
  };
}

/**
 * SCORM package file entry
 */
export interface SCORMPackageFile {
  /** File path within the package */
  path: string;
  /** File content or URL */
  content: string | Uint8Array;
  /** File size in bytes */
  size: number;
  /** MIME type */
  mimeType: string;
  /** Whether this is the main entry point */
  isLaunchFile?: boolean;
}

/**
 * xAPI package structure
 */
export interface XAPIPackage {
  /** Package configuration */
  config: XAPIPackageConfig;
  /** Course content files */
  files: XAPIPackageFile[];
  /** Activity definitions */
  activities: XAPIActivityExport[];
}

/**
 * xAPI package configuration
 */
export interface XAPIPackageConfig {
  /** Activity ID prefix */
  activityIdPrefix: string;
  /** LRS endpoint (if embedded) */
  lrsEndpoint?: string;
  /** LRS authentication */
  lrsAuth?: {
    username: string;
    password: string;
  };
  /** Statement templates */
  enabledStatements: string[];
  /** Custom extensions */
  extensions?: Record<string, unknown>;
}

/**
 * xAPI package file entry
 */
export interface XAPIPackageFile {
  /** File path within the package */
  path: string;
  /** File content */
  content: string | Uint8Array;
  /** File size in bytes */
  size: number;
  /** MIME type */
  mimeType: string;
}

/**
 * xAPI activity export definition
 */
export interface XAPIActivityExport {
  /** Activity ID */
  id: string;
  /** Activity type */
  type: string;
  /** Activity name */
  name: Record<string, string>;
  /** Activity description */
  description?: Record<string, string>;
  /** Tracked events */
  trackedEvents: string[];
  /** Parent activity ID */
  parentId?: string;
  /** Child activity IDs */
  childIds?: string[];
}

/**
 * cmi5 package structure
 */
export interface CMI5Package {
  /** Course structure */
  courseStructure: CMI5CourseStructure;
  /** Assignable units */
  assignableUnits: CMI5AssignableUnit[];
  /** Package files */
  files: XAPIPackageFile[];
}

/**
 * cmi5 course structure
 */
export interface CMI5CourseStructure {
  /** Course ID */
  id: string;
  /** Course title */
  title: Record<string, string>;
  /** Course description */
  description?: Record<string, string>;
  /** Root block containing all AUs */
  block: CMI5Block;
}

/**
 * cmi5 block (container for AUs or other blocks)
 */
export interface CMI5Block {
  /** Block ID */
  id: string;
  /** Block title */
  title: Record<string, string>;
  /** Nested blocks */
  blocks?: CMI5Block[];
  /** Assignable unit references */
  auIds?: string[];
}

/**
 * cmi5 assignable unit
 */
export interface CMI5AssignableUnit {
  /** AU ID */
  id: string;
  /** AU title */
  title: Record<string, string>;
  /** AU description */
  description?: Record<string, string>;
  /** Launch URL */
  url: string;
  /** Activity type */
  activityType?: string;
  /** Mastery score (0-1) */
  masteryScore?: number;
  /** Move on criteria */
  moveOn: 'Passed' | 'Completed' | 'CompletedAndPassed' | 'CompletedOrPassed' | 'NotApplicable';
  /** Launch method */
  launchMethod: 'AnyWindow' | 'OwnWindow';
  /** Launch parameters */
  launchParameters?: string;
}

/**
 * HTML5 export package
 */
export interface HTML5Package {
  /** Entry point file */
  entryPoint: string;
  /** Package files */
  files: XAPIPackageFile[];
  /** Asset manifest */
  assets: HTML5Asset[];
  /** Build configuration */
  config: HTML5BuildConfig;
}

/**
 * HTML5 asset entry
 */
export interface HTML5Asset {
  /** Asset path */
  path: string;
  /** Original URL */
  originalUrl: string;
  /** Asset type */
  type: 'image' | 'video' | 'audio' | 'font' | 'stylesheet' | 'script' | 'other';
  /** File size in bytes */
  size: number;
  /** Cache strategy */
  cache: 'immutable' | 'revalidate' | 'no-cache';
}

/**
 * HTML5 build configuration
 */
export interface HTML5BuildConfig {
  /** Minify JavaScript */
  minifyJs: boolean;
  /** Minify CSS */
  minifyCss: boolean;
  /** Inline small assets */
  inlineAssets: boolean;
  /** Inline asset size threshold (bytes) */
  inlineThreshold: number;
  /** Generate service worker for offline */
  offlineSupport: boolean;
  /** Target browsers */
  browserTargets: string[];
}

/**
 * PDF export options
 */
export interface PDFExportOptions {
  /** Page size */
  pageSize: 'a4' | 'letter' | 'legal';
  /** Page orientation */
  orientation: 'portrait' | 'landscape';
  /** Include table of contents */
  includeTOC: boolean;
  /** Include page numbers */
  includePageNumbers: boolean;
  /** Header content */
  header?: string;
  /** Footer content */
  footer?: string;
  /** Page margins (mm) */
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

/**
 * PDF export result
 */
export interface PDFExportResult {
  /** Success flag */
  success: boolean;
  /** PDF file URL */
  fileUrl?: string;
  /** PDF file size in bytes */
  fileSize?: number;
  /** Page count */
  pageCount?: number;
  /** Error message if failed */
  error?: string;
}

// ============================================================================
// EXPORT FORMAT UTILITIES
// ============================================================================

/**
 * Check if a format supports xAPI tracking
 */
export function supportsXAPITracking(format: ExportFormatImport): boolean {
  return format === 'xapi' || format === 'cmi5' || format === 'scorm-2004';
}

/**
 * Check if a format produces a downloadable package
 */
export function isDownloadablePackage(format: ExportFormatImport): boolean {
  return format !== 'pdf';
}

/**
 * Get file extension for export format
 */
export function getExportExtension(format: ExportFormatImport): string {
  switch (format) {
    case 'pdf':
      return '.pdf';
    case 'html5':
      return '.zip';
    default:
      return '.zip';
  }
}

/**
 * Get MIME type for export format
 */
export function getExportMimeType(format: ExportFormatImport): string {
  switch (format) {
    case 'pdf':
      return 'application/pdf';
    default:
      return 'application/zip';
  }
}
