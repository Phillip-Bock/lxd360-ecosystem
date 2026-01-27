/**
 * Export Handlers Index
 *
 * @fileoverview Exports all format handlers and provides a handler registry
 * @module lib/export/handlers
 */

// Re-export types
export type {
  ExportBlockData,
  ExportContext,
  ExportCourseData,
  ExportHandler,
  ExportHandlerResult,
  ExportLessonData,
  ExportModuleData,
  ExportResourceData,
} from './base';

// Re-export utilities
export {
  createErrorResult,
  createSuccessResult,
  escapeHtml,
  escapeXml,
  formatIsoDuration,
  generateFilename,
} from './base';

// Import handlers
import { cmi5Handler } from './cmi5';
import { html5Handler } from './html5';
import { pdfHandler } from './pdf';
import { scorm12Handler, scorm2004Handler } from './scorm';
import { xapiHandler } from './xapi';

// Re-export individual handlers
export { cmi5Handler } from './cmi5';
export { html5Handler } from './html5';
export { pdfHandler } from './pdf';
export { scorm12Handler, scorm2004Handler } from './scorm';
export { xapiHandler } from './xapi';

// ============================================================================
// HANDLER REGISTRY
// ============================================================================

import type { ExportFormat } from '../types';
import type { ExportHandler } from './base';

/**
 * Registry of all export format handlers
 */
export const handlers: Record<ExportFormat, ExportHandler> = {
  'scorm-1.2': scorm12Handler,
  'scorm-2004': scorm2004Handler,
  xapi: xapiHandler,
  cmi5: cmi5Handler,
  html5: html5Handler,
  pdf: pdfHandler,
};

/**
 * Get handler for a specific format
 */
export function getHandler(format: ExportFormat): ExportHandler | undefined {
  return handlers[format];
}

/**
 * Check if a format has a handler
 */
export function hasHandler(format: ExportFormat): boolean {
  return format in handlers;
}

/**
 * Get all available format handlers
 */
export function getAllHandlers(): ExportHandler[] {
  return Object.values(handlers);
}

/**
 * Get format information for all handlers
 */
export function getFormatInfo(): Array<{
  format: ExportFormat;
  displayName: string;
  mimeType: string;
  extension: string;
}> {
  return Object.entries(handlers).map(([format, handler]) => ({
    format: format as ExportFormat,
    displayName: handler.displayName,
    mimeType: handler.mimeType,
    extension: handler.extension,
  }));
}
