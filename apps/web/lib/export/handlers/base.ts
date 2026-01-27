/**
 * Export Handler Base Types
 *
 * @fileoverview Base interfaces and types for export format handlers
 * @module lib/export/handlers/base
 */

import type { CourseMetadata, ExportSettings, ExportStats } from '../types';

// ============================================================================
// COURSE DATA TYPES
// ============================================================================

/**
 * Simplified course data structure for export
 */
export interface ExportCourseData {
  id: string;
  title: string;
  description: string;
  version: string;
  language: string;
  metadata: CourseMetadata;
  modules: ExportModuleData[];
  totalDuration: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Module data for export
 */
export interface ExportModuleData {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: ExportLessonData[];
}

/**
 * Lesson data for export
 */
export interface ExportLessonData {
  id: string;
  title: string;
  description?: string;
  order: number;
  duration: number;
  contentType: string;
  blocks: ExportBlockData[];
  resources: ExportResourceData[];
}

/**
 * Content block data for export
 */
export interface ExportBlockData {
  id: string;
  type: string;
  order: number;
  content: Record<string, unknown>;
}

/**
 * Resource data for export
 */
export interface ExportResourceData {
  id: string;
  type: string;
  url: string;
  mimeType: string;
  size?: number;
  filename: string;
}

// ============================================================================
// HANDLER TYPES
// ============================================================================

/**
 * Result from an export handler
 */
export interface ExportHandlerResult {
  success: boolean;
  blob?: Blob;
  filename?: string;
  mimeType?: string;
  error?: string;
  errorCode?: string;
  stats: ExportStats;
}

/**
 * Context passed to export handlers
 */
export interface ExportContext {
  courseId: string;
  courseData: ExportCourseData;
  settings: ExportSettings;
  includeMedia: boolean;
}

/**
 * Export handler interface
 */
export interface ExportHandler {
  readonly format: string;
  readonly displayName: string;
  readonly mimeType: string;
  readonly extension: string;

  export(context: ExportContext): Promise<ExportHandlerResult>;
  validate(context: ExportContext): { valid: boolean; errors: string[] };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a successful export result
 */
export function createSuccessResult(params: {
  blob: Blob;
  filename: string;
  mimeType: string;
  stats: ExportStats;
}): ExportHandlerResult {
  return {
    success: true,
    blob: params.blob,
    filename: params.filename,
    mimeType: params.mimeType,
    stats: params.stats,
  };
}

/**
 * Create an error export result
 */
export function createErrorResult(params: {
  error: string;
  errorCode: string;
  duration: number;
}): ExportHandlerResult {
  return {
    success: false,
    error: params.error,
    errorCode: params.errorCode,
    stats: {
      totalItems: 0,
      totalSize: 0,
      duration: params.duration,
      warnings: 0,
    },
  };
}

/**
 * Generate a safe filename from a title
 */
export function generateFilename(title: string, extension: string): string {
  const safeName = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);

  const timestamp = new Date().toISOString().split('T')[0];
  return `${safeName}-${timestamp}.${extension}`;
}

/**
 * Format duration in ISO 8601 format (PT#H#M#S)
 */
export function formatIsoDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  const secs = Math.floor((minutes * 60) % 60);

  let duration = 'PT';

  if (hours > 0) {
    duration += `${hours}H`;
  }

  if (mins > 0) {
    duration += `${mins}M`;
  }

  if (secs > 0 || duration === 'PT') {
    duration += `${secs}S`;
  }

  return duration;
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Escape XML special characters
 */
export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
