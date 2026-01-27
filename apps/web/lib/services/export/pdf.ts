/**
 * PDF Export Handler
 *
 * Generates a printable PDF document from course content using @react-pdf/renderer.
 * Includes cover page, table of contents, and formatted content pages.
 *
 * @module lib/services/export/pdf
 */

import type { PageSize } from '@react-pdf/types';
import { createElement } from 'react';
import type { CourseExportData, ExportOptions, ExportResult, PDFExportSettings } from './types';
import { getDefaultPDFSettings } from './types';

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

/**
 * Export a course as a PDF document
 *
 * Uses dynamic import to avoid SSR issues with @react-pdf/renderer
 *
 * @param course - Course data to export
 * @param options - Export options
 * @returns Export result with PDF blob
 */
export async function exportPDF(
  course: CourseExportData,
  options: ExportOptions,
): Promise<ExportResult> {
  const settings = options.pdfSettings ?? getDefaultPDFSettings();

  // Dynamic import to avoid SSR issues
  const { Document, Page, Text, View, Link, StyleSheet, pdf } = await import('@react-pdf/renderer');

  // Create styles
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column' as const,
      backgroundColor: '#ffffff',
      fontFamily: 'Helvetica',
      padding: settings.margins?.top ?? 72,
    },
    coverPage: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      backgroundColor: '#0072f5',
      padding: 40,
    },
    coverTitle: {
      fontSize: 36,
      fontWeight: 'bold' as const,
      color: '#ffffff',
      textAlign: 'center' as const,
      marginBottom: 20,
    },
    coverDescription: {
      fontSize: 14,
      color: '#ffffff',
      textAlign: 'center' as const,
      marginBottom: 40,
    },
    coverMeta: {
      marginTop: 20,
    },
    coverMetaText: {
      fontSize: 12,
      color: '#ffffff',
      textAlign: 'center' as const,
    },
    tocTitle: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      marginBottom: 30,
      color: '#1a1a2e',
    },
    tocModule: {
      marginBottom: 20,
    },
    tocModuleTitle: {
      fontSize: 14,
      fontWeight: 'bold' as const,
      color: '#0072f5',
      marginBottom: 8,
    },
    tocLesson: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      paddingLeft: 16,
      paddingVertical: 4,
    },
    tocLessonTitle: {
      fontSize: 11,
      color: '#4b5563',
    },
    tocLessonPage: {
      fontSize: 11,
      color: '#9ca3af',
    },
    moduleHeader: {
      marginBottom: 20,
    },
    moduleTitle: {
      fontSize: 20,
      fontWeight: 'bold' as const,
      color: '#0072f5',
      marginBottom: 8,
    },
    moduleDescription: {
      fontSize: 11,
      color: '#666666',
    },
    lessonTitle: {
      fontSize: 16,
      fontWeight: 'bold' as const,
      color: '#1a1a2e',
      marginTop: 20,
      marginBottom: 10,
    },
    lessonDescription: {
      fontSize: 11,
      color: '#6b7280',
      marginBottom: 12,
    },
    contentText: {
      fontSize: 11,
      lineHeight: 1.6,
      color: '#374151',
      marginBottom: 8,
    },
    footer: {
      position: 'absolute' as const,
      bottom: 30,
      left: 50,
      right: 50,
      textAlign: 'center' as const,
      fontSize: 9,
      color: '#9ca3af',
    },
  });

  const pageSize = getPageSize(settings.paperSize);

  // Build pages using createElement for TypeScript compatibility
  const pages: React.ReactElement[] = [];

  // Cover Page
  pages.push(
    createElement(
      Page,
      { key: 'cover', size: pageSize, style: styles.page },
      createElement(
        View,
        { style: styles.coverPage },
        createElement(Text, { style: styles.coverTitle }, course.title),
        createElement(Text, { style: styles.coverDescription }, course.description),
        course.author &&
          createElement(
            View,
            { style: styles.coverMeta },
            createElement(Text, { style: styles.coverMetaText }, `By ${course.author.name}`),
          ),
        course.version &&
          createElement(Text, { style: styles.coverMetaText }, `Version ${course.version}`),
      ),
    ),
  );

  // Table of Contents (if enabled)
  if (settings.includeToc) {
    const tocChildren: React.ReactElement[] = [
      createElement(Text, { key: 'toc-title', style: styles.tocTitle }, 'Table of Contents'),
    ];

    let pageNum = 3; // Start after cover and TOC
    for (const module of course.modules) {
      const moduleChildren: React.ReactElement[] = [
        createElement(
          Text,
          { key: `mod-${module.id}`, style: styles.tocModuleTitle },
          module.title,
        ),
      ];

      for (const lesson of module.lessons) {
        moduleChildren.push(
          createElement(
            View,
            { key: `les-${lesson.id}`, style: styles.tocLesson },
            createElement(
              Link,
              { src: `#${lesson.id}` },
              createElement(Text, { style: styles.tocLessonTitle }, lesson.title),
            ),
            createElement(Text, { style: styles.tocLessonPage }, String(pageNum)),
          ),
        );
        pageNum++;
      }

      tocChildren.push(
        createElement(
          View,
          { key: `tocmod-${module.id}`, style: styles.tocModule },
          ...moduleChildren,
        ),
      );
    }

    pages.push(
      createElement(Page, { key: 'toc', size: pageSize, style: styles.page }, ...tocChildren),
    );
  }

  // Content pages - one per module
  for (const module of course.modules) {
    const pageChildren: React.ReactElement[] = [];

    // Module header
    pageChildren.push(
      createElement(
        View,
        { key: `modhead-${module.id}`, style: styles.moduleHeader },
        createElement(Text, { style: styles.moduleTitle }, module.title),
        module.description &&
          createElement(Text, { style: styles.moduleDescription }, module.description),
      ),
    );

    // Lessons
    for (const lesson of module.lessons) {
      pageChildren.push(
        createElement(
          Text,
          { key: `lestitle-${lesson.id}`, style: styles.lessonTitle, id: lesson.id },
          lesson.title,
        ),
      );

      if (lesson.description) {
        pageChildren.push(
          createElement(
            Text,
            { key: `lesdesc-${lesson.id}`, style: styles.lessonDescription },
            lesson.description,
          ),
        );
      }

      // Content blocks
      for (const block of lesson.blocks.sort((a, b) => a.order - b.order)) {
        const plainText = stripHtml(block.content);
        if (plainText) {
          pageChildren.push(
            createElement(Text, { key: `block-${block.id}`, style: styles.contentText }, plainText),
          );
        }
      }
    }

    // Footer
    pageChildren.push(
      createElement(
        Text,
        { key: `footer-${module.id}`, style: styles.footer, fixed: true },
        course.title,
      ),
    );

    pages.push(
      createElement(
        Page,
        { key: `content-${module.id}`, size: pageSize, style: styles.page },
        ...pageChildren,
      ),
    );
  }

  // Create document
  const doc = createElement(
    Document,
    {
      title: course.title,
      author: course.author?.name ?? 'LXD360',
      subject: course.description,
      keywords: course.keywords?.join(', '),
    },
    ...pages,
  );

  // Render to blob
  const blob = await pdf(doc).toBlob();

  const filename = `${sanitizeFilename(course.title)}.pdf`;

  return {
    blob,
    filename,
    mimeType: 'application/pdf',
    size: blob.size,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Strip HTML tags and decode entities
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
}

/**
 * Get page size based on setting
 */
function getPageSize(paperSize: PDFExportSettings['paperSize']): PageSize {
  switch (paperSize) {
    case 'a4':
      return 'A4';
    case 'legal':
      return 'LEGAL';
    default:
      return 'LETTER';
  }
}

/**
 * Sanitize a string for use as a filename
 */
function sanitizeFilename(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
