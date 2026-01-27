/**
 * Export Engine
 *
 * @fileoverview Main export engine for generating course packages in various formats
 * @module lib/export
 *
 * @example
 * ```ts
 * import { exportCourse, exportCourseAsBlob } from '@/lib/export'
 *
 * // Export with course data
 * const result = await exportCourseAsBlob({
 *   format: 'html5',
 *   courseData: courseData,
 *   settings: {
 *     completionCriteria: 'completed',
 *     scoringMethod: 'highest',
 *     includeInteractions: true,
 *   },
 * })
 *
 * if (result.success && result.blob) {
 *   // Download the blob
 *   const url = URL.createObjectURL(result.blob)
 *   // ...
 * }
 * ```
 */

import {
  getHandler,
  handlers,
  type ExportContext,
  type ExportCourseData,
  type ExportHandlerResult,
} from './handlers';
import type { ExportFormat, ExportOptions, ExportResult, ExportSettings } from './types';

// ============================================================================
// RE-EXPORTS
// ============================================================================

// SCORM module exports
export {
  createManifestBuilder,
  generateAPIDetectionScript,
  generateAPIWrapper,
  generateManifestXML,
  generateMinimalSCOWrapper,
  generateSCOWrapper,
  ManifestBuilder,
  type SCOWrapperOptions,
} from './scorm';

// Type exports
export * from './types';

// Handler exports
export {
  cmi5Handler,
  getFormatInfo,
  getHandler,
  handlers,
  hasHandler,
  html5Handler,
  pdfHandler,
  scorm12Handler,
  scorm2004Handler,
  xapiHandler,
  type ExportContext,
  type ExportCourseData,
  type ExportHandler,
  type ExportHandlerResult,
} from './handlers';

// ============================================================================
// MAIN EXPORT FUNCTIONS
// ============================================================================

/**
 * Export options for blob-based export
 */
export interface ExportBlobOptions {
  format: ExportFormat;
  courseData: ExportCourseData;
  settings: ExportSettings;
  includeMedia?: boolean;
}

/**
 * Result of blob-based export
 */
export interface ExportBlobResult {
  success: boolean;
  blob?: Blob;
  filename?: string;
  mimeType?: string;
  error?: string;
  errorCode?: string;
  stats?: ExportResult['stats'];
}

/**
 * Export a course to a Blob using the format handlers
 *
 * This is the primary export function that returns a Blob directly.
 * Use this for client-side downloads or further processing.
 *
 * @param options - Export options with course data
 * @returns Export result with blob
 *
 * @example
 * ```ts
 * const result = await exportCourseAsBlob({
 *   format: 'html5',
 *   courseData: {
 *     id: 'course-123',
 *     title: 'My Course',
 *     description: 'A great course',
 *     // ...
 *   },
 *   settings: {
 *     completionCriteria: 'completed',
 *     scoringMethod: 'highest',
 *     includeInteractions: true,
 *   },
 * })
 *
 * if (result.success && result.blob) {
 *   // Create download link
 *   const url = URL.createObjectURL(result.blob)
 *   const a = document.createElement('a')
 *   a.href = url
 *   a.download = result.filename
 *   a.click()
 * }
 * ```
 */
export async function exportCourseAsBlob(options: ExportBlobOptions): Promise<ExportBlobResult> {
  const { format, courseData, settings, includeMedia = false } = options;

  // Get the handler for the format
  const handler = getHandler(format);

  if (!handler) {
    return {
      success: false,
      error: `Export format "${format}" is not supported`,
      errorCode: 'UNSUPPORTED_FORMAT',
    };
  }

  // Create export context
  const context: ExportContext = {
    courseId: courseData.id,
    courseData,
    settings,
    includeMedia,
  };

  // Validate the context
  const validation = handler.validate(context);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.errors.join('; '),
      errorCode: 'VALIDATION_ERROR',
    };
  }

  // Execute the export
  const result: ExportHandlerResult = await handler.export(context);

  return {
    success: result.success,
    blob: result.blob,
    filename: result.filename,
    mimeType: result.mimeType,
    error: result.error,
    errorCode: result.errorCode,
    stats: result.stats,
  };
}

/**
 * Export a course to the specified format
 *
 * This function is for backwards compatibility with the existing API.
 * It returns an ExportResult with a packageUrl (when storage is configured)
 * or provides the raw blob data through stats.
 *
 * For new code, prefer using `exportCourseAsBlob` instead.
 *
 * @param options - Export options
 * @returns Export result
 *
 * @deprecated Use exportCourseAsBlob for new implementations
 */
export async function exportCourse(options: ExportOptions): Promise<ExportResult> {
  const startTime = Date.now();

  // Validate options first
  const validation = validateExportOptions(options);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.errors.join('; '),
      errorDetails: {
        code: 'VALIDATION_ERROR',
        message: validation.errors.join('; '),
      },
    };
  }

  // Get the handler
  const handler = getHandler(options.format);

  if (!handler) {
    return {
      success: false,
      error: `Export format "${options.format}" is not supported`,
      errorDetails: {
        code: 'UNSUPPORTED_FORMAT',
        message: `The format "${options.format}" is not implemented`,
      },
    };
  }

  // Note: This function requires courseData to be fetched externally
  // For now, return a helpful error if courseData is not provided
  // In production, this would fetch from Firestore using options.courseId
  return {
    success: false,
    error: 'Course data must be fetched and provided. Use exportCourseAsBlob instead.',
    errorDetails: {
      code: 'COURSE_DATA_REQUIRED',
      message:
        'The exportCourse function requires course data to be fetched. Use exportCourseAsBlob with courseData parameter.',
      details: {
        courseId: options.courseId,
        format: options.format,
        suggestion: 'Use exportCourseAsBlob({ format, courseData, settings }) instead',
      },
    },
    stats: {
      totalItems: 0,
      totalSize: 0,
      duration: Date.now() - startTime,
      warnings: 0,
    },
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get supported export formats
 */
export function getSupportedFormats(): ExportFormat[] {
  return Object.keys(handlers) as ExportFormat[];
}

/**
 * Check if a format is currently implemented
 */
export function isFormatImplemented(format: ExportFormat): boolean {
  return format in handlers;
}

/**
 * Get format display name
 */
export function getFormatDisplayName(format: ExportFormat): string {
  const handler = getHandler(format);
  return handler?.displayName ?? format;
}

/**
 * Get format description
 */
export function getFormatDescription(format: ExportFormat): string {
  const descriptions: Record<ExportFormat, string> = {
    'scorm-1.2': 'Compatible with most LMS platforms. Best for basic tracking.',
    'scorm-2004': 'Advanced sequencing and navigation. Requires SCORM 2004 support.',
    xapi: 'Modern tracking standard. Requires xAPI-compatible LRS.',
    cmi5: 'Next-generation standard combining xAPI with LMS launch.',
    html5: 'Standalone web content. No LMS tracking.',
    pdf: 'Printable document format. No interactivity.',
  };
  return descriptions[format];
}

/**
 * Get format file extension
 */
export function getFormatExtension(format: ExportFormat): string {
  const handler = getHandler(format);
  return handler?.extension ?? 'zip';
}

/**
 * Get format MIME type
 */
export function getFormatMimeType(format: ExportFormat): string {
  const handler = getHandler(format);
  return handler?.mimeType ?? 'application/octet-stream';
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

  if (!options.format) {
    errors.push('Export format is required');
  } else if (!getSupportedFormats().includes(options.format)) {
    errors.push(`Invalid export format: ${options.format}`);
  }

  if (!options.settings) {
    errors.push('Export settings are required');
  } else {
    if (!options.settings.completionCriteria) {
      errors.push('Completion criteria is required');
    }
    if (!options.settings.scoringMethod) {
      errors.push('Scoring method is required');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create a download link for an exported blob
 *
 * @param blob - The exported blob
 * @param filename - The filename for download
 * @returns Object URL for the blob (remember to revoke when done)
 */
export function createDownloadUrl(blob: Blob, _filename: string): string {
  return URL.createObjectURL(blob);
}

/**
 * Trigger a download for an exported blob
 *
 * @param blob - The exported blob
 * @param filename - The filename for download
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
