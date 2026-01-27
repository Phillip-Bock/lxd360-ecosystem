/**
 * Export Engine - Main Entry Point
 *
 * Unified export service for generating course packages in multiple formats:
 * - SCORM 1.2 / 2004 (LMS delivery)
 * - xAPI / cmi5 (modern tracking)
 * - HTML5 (standalone)
 * - PDF (printable)
 *
 * @module lib/services/export
 *
 * @example
 * ```ts
 * import { exportCourse } from '@/lib/services/export';
 *
 * const result = await exportCourse({
 *   format: 'html5',
 *   courseId: 'course-123',
 *   tenantId: 'tenant-456',
 *   includeMedia: true,
 * });
 *
 * // Download the result
 * const url = URL.createObjectURL(result.blob);
 * const a = document.createElement('a');
 * a.href = url;
 * a.download = result.filename;
 * a.click();
 * ```
 */

import { exportHTML5 } from './html5';
import { exportPDF } from './pdf';
import { exportSCORM12 } from './scorm12';
import { exportSCORM2004 } from './scorm2004';
import type { CourseExportData, ExportFormat, ExportOptions, ExportResult } from './types';
import { exportCmi5, exportXAPI } from './xapi';

// ============================================================================
// RE-EXPORTS
// ============================================================================

// Individual exporters (for direct access)
export { exportHTML5 } from './html5';
export { exportPDF } from './pdf';
export { exportSCORM12 } from './scorm12';
export { exportSCORM2004 } from './scorm2004';
// Types
export type {
  ContentBlockExportData,
  CourseExportData,
  ExportFormat,
  ExportOptions,
  ExportResult,
  LessonExportData,
  MediaAssetExportData,
  ModuleExportData,
  PDFExportSettings,
  SCORMExportSettings,
  SCORMItem,
  SCORMManifestData,
  SCORMOrganization,
  SCORMResource,
  XAPIExportSettings,
} from './types';
// Settings helpers
export {
  getDefaultPDFSettings,
  getDefaultSCORMSettings,
  getDefaultXAPISettings,
} from './types';
export { exportCmi5, exportXAPI } from './xapi';

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

/**
 * Export a course to the specified format
 *
 * This is the main entry point for the export engine. It routes to the
 * appropriate handler based on the format specified in options.
 *
 * @param course - Course data to export
 * @param options - Export options including format and settings
 * @returns Export result containing the blob, filename, and metadata
 *
 * @throws Error if format is not supported
 *
 * @example
 * ```ts
 * // Export as SCORM 1.2
 * const result = await exportCourse(courseData, {
 *   format: 'scorm12',
 *   courseId: 'safety-101',
 *   tenantId: 'acme-corp',
 *   includeMedia: true,
 *   scormSettings: {
 *     passingScore: 80,
 *     timeLimit: 0,
 *     credit: 'credit',
 *     allowReview: true,
 *   },
 * });
 * ```
 */
export async function exportCourse(
  course: CourseExportData,
  options: ExportOptions,
): Promise<ExportResult> {
  switch (options.format) {
    case 'scorm12':
      return exportSCORM12(course, options);

    case 'scorm2004':
      return exportSCORM2004(course, options);

    case 'xapi':
      return exportXAPI(course, options);

    case 'cmi5':
      return exportCmi5(course, options);

    case 'html5':
      return exportHTML5(course, options);

    case 'pdf':
      return exportPDF(course, options);

    default: {
      const exhaustiveCheck: never = options.format;
      throw new Error(`Unsupported export format: ${exhaustiveCheck}`);
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get all supported export formats
 */
export function getSupportedFormats(): ExportFormat[] {
  return ['scorm12', 'scorm2004', 'xapi', 'cmi5', 'html5', 'pdf'];
}

/**
 * Get display information for an export format
 */
export function getFormatInfo(format: ExportFormat): {
  name: string;
  description: string;
  extension: string;
  mimeType: string;
} {
  const info: Record<
    ExportFormat,
    { name: string; description: string; extension: string; mimeType: string }
  > = {
    scorm12: {
      name: 'SCORM 1.2',
      description: 'Compatible with most LMS platforms. Best for basic tracking.',
      extension: 'zip',
      mimeType: 'application/zip',
    },
    scorm2004: {
      name: 'SCORM 2004 4th Edition',
      description: 'Advanced sequencing and navigation. Requires SCORM 2004 support.',
      extension: 'zip',
      mimeType: 'application/zip',
    },
    xapi: {
      name: 'xAPI (Tin Can)',
      description: 'Modern tracking standard. Requires xAPI-compatible LRS.',
      extension: 'zip',
      mimeType: 'application/zip',
    },
    cmi5: {
      name: 'cmi5',
      description: 'Next-generation standard combining xAPI with LMS launch.',
      extension: 'zip',
      mimeType: 'application/zip',
    },
    html5: {
      name: 'HTML5 Standalone',
      description: 'Self-contained web content. No LMS tracking.',
      extension: 'zip',
      mimeType: 'application/zip',
    },
    pdf: {
      name: 'PDF Document',
      description: 'Printable document format. No interactivity.',
      extension: 'pdf',
      mimeType: 'application/pdf',
    },
  };

  return info[format];
}

/**
 * Check if a format requires an LMS/LRS
 */
export function requiresLMS(format: ExportFormat): boolean {
  return ['scorm12', 'scorm2004'].includes(format);
}

/**
 * Check if a format supports xAPI tracking
 */
export function supportsXAPI(format: ExportFormat): boolean {
  return ['xapi', 'cmi5'].includes(format);
}

/**
 * Validate export options
 */
export function validateExportOptions(options: ExportOptions): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!options.courseId) {
    errors.push('Course ID is required');
  }

  if (!options.tenantId) {
    errors.push('Tenant ID is required');
  }

  if (!options.format) {
    errors.push('Export format is required');
  } else if (!getSupportedFormats().includes(options.format)) {
    errors.push(`Unsupported export format: ${options.format}`);
  }

  if (
    options.compressionLevel !== undefined &&
    (options.compressionLevel < 1 || options.compressionLevel > 9)
  ) {
    errors.push('Compression level must be between 1 and 9');
  }

  // Format-specific validations
  if (options.format === 'scorm12' || options.format === 'scorm2004') {
    if (options.scormSettings) {
      if (options.scormSettings.passingScore < 0 || options.scormSettings.passingScore > 100) {
        errors.push('SCORM passing score must be between 0 and 100');
      }
      if (options.scormSettings.timeLimit < 0) {
        errors.push('SCORM time limit cannot be negative');
      }
    }
  }

  if (options.format === 'xapi' || options.format === 'cmi5') {
    if (options.xapiSettings) {
      if (options.xapiSettings.endpoint && !isValidUrl(options.xapiSettings.endpoint)) {
        errors.push('xAPI endpoint must be a valid URL');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Helper to check if a string is a valid URL
 */
function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create a download link for an export result
 *
 * @param result - Export result from exportCourse
 * @returns Object URL that can be used for download
 *
 * @example
 * ```ts
 * const result = await exportCourse(course, options);
 * const downloadUrl = createDownloadUrl(result);
 *
 * // Use in an anchor element
 * const link = document.createElement('a');
 * link.href = downloadUrl;
 * link.download = result.filename;
 * link.click();
 *
 * // Don't forget to revoke when done
 * URL.revokeObjectURL(downloadUrl);
 * ```
 */
export function createDownloadUrl(result: ExportResult): string {
  return URL.createObjectURL(result.blob);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}
