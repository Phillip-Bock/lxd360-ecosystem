/**
 * SCORM Export Handler
 *
 * @fileoverview Generates SCORM 1.2 and SCORM 2004 packages
 * @module lib/export/handlers/scorm
 */

import JSZip from 'jszip';

import { generateAPIWrapper } from '../scorm/api-wrapper';
import { ManifestBuilder } from '../scorm/manifest-builder';
import { generateSCOWrapper } from '../scorm/sco-wrapper';
import type { ContentItem, SCORMSettings, SCORMVersion } from '../types';
import type { ExportContext, ExportHandler, ExportHandlerResult, ExportLessonData } from './base';
import { createErrorResult, createSuccessResult, escapeHtml, generateFilename } from './base';

// ============================================================================
// CONSTANTS
// ============================================================================

const SCORM_MIME_TYPE = 'application/zip';
const SCORM_EXTENSION = 'zip';

// ============================================================================
// SCORM 1.2 HANDLER
// ============================================================================

/**
 * SCORM 1.2 export handler
 */
export const scorm12Handler: ExportHandler = {
  format: 'scorm-1.2',
  displayName: 'SCORM 1.2',
  mimeType: SCORM_MIME_TYPE,
  extension: SCORM_EXTENSION,

  async export(context: ExportContext): Promise<ExportHandlerResult> {
    return exportSCORMPackage(context, '1.2');
  },

  validate(context: ExportContext): { valid: boolean; errors: string[] } {
    return validateSCORMContext(context);
  },
};

/**
 * SCORM 2004 export handler
 */
export const scorm2004Handler: ExportHandler = {
  format: 'scorm-2004',
  displayName: 'SCORM 2004 4th Edition',
  mimeType: SCORM_MIME_TYPE,
  extension: SCORM_EXTENSION,

  async export(context: ExportContext): Promise<ExportHandlerResult> {
    return exportSCORMPackage(context, '2004-4th');
  },

  validate(context: ExportContext): { valid: boolean; errors: string[] } {
    return validateSCORMContext(context);
  },
};

// ============================================================================
// SCORM PACKAGE GENERATOR
// ============================================================================

/**
 * Generate a complete SCORM package
 */
async function exportSCORMPackage(
  context: ExportContext,
  version: SCORMVersion,
): Promise<ExportHandlerResult> {
  const startTime = Date.now();

  try {
    const { courseData, settings } = context;
    const zip = new JSZip();

    let totalItems = 0;
    const warnings: string[] = [];

    // Prepare SCORM settings
    const scormSettings: SCORMSettings = settings.scorm ?? {
      version,
      passingScore: 80,
      timeLimit: 0,
      allowReview: true,
      credit: 'credit',
    };

    // Convert course data to content items for manifest
    const contentItems = convertToContentItems(courseData);

    // Generate manifest
    const manifestBuilder = new ManifestBuilder(version);
    const manifest = manifestBuilder.buildManifest(courseData.metadata, contentItems);
    const manifestXml = manifestBuilder.generateXML(manifest);
    zip.file('imsmanifest.xml', manifestXml);
    totalItems++;

    // Add SCORM API wrapper
    const apiWrapper = generateAPIWrapper(version);
    zip.file('shared/scripts/scorm-api.js', apiWrapper);
    totalItems++;

    // Add shared styles
    const styles = generateSCORMStyles();
    zip.file('shared/css/styles.css', styles);
    totalItems++;

    // Generate SCO pages for each lesson
    for (const module of courseData.modules) {
      for (const lesson of module.lessons) {
        // Create SCO wrapper (launcher page)
        const scoWrapper = generateSCOWrapper({
          title: lesson.title,
          entryPoint: 'content.html',
          scormVersion: version,
          settings: scormSettings,
          metadata: courseData.metadata,
        });
        zip.file(`content/${lesson.id}/index.html`, scoWrapper);
        totalItems++;

        // Create content page
        const contentHtml = generateLessonContent(lesson, module.title, courseData, version);
        zip.file(`content/${lesson.id}/content.html`, contentHtml);
        totalItems++;
      }
    }

    // Add schema files for validation (optional but recommended)
    if (version === '1.2') {
      zip.file('shared/schemas/adlcp_rootv1p2.xsd', SCORM_12_SCHEMA_PLACEHOLDER);
      zip.file('shared/schemas/imscp_rootv1p1p2.xsd', IMS_CP_SCHEMA_PLACEHOLDER);
    } else {
      zip.file('shared/schemas/adlcp_v1p3.xsd', SCORM_2004_SCHEMA_PLACEHOLDER);
      zip.file('shared/schemas/imscp_v1p1.xsd', IMS_CP_2004_SCHEMA_PLACEHOLDER);
    }

    // Add a readme
    const readme = generateReadme(courseData, version, scormSettings);
    zip.file('README.txt', readme);
    totalItems++;

    // Generate ZIP
    const blob = await zip.generateAsync({
      type: 'blob',
      compression: settings.packaging?.compress ? 'DEFLATE' : 'STORE',
      compressionOptions: {
        level: settings.packaging?.compressionLevel ?? 6,
      },
    });

    const duration = Date.now() - startTime;

    return createSuccessResult({
      blob,
      filename: generateFilename(`${courseData.title}-scorm-${version}`, SCORM_EXTENSION),
      mimeType: SCORM_MIME_TYPE,
      stats: {
        totalItems,
        totalSize: blob.size,
        duration,
        warnings: warnings.length,
        warningMessages: warnings.length > 0 ? warnings : undefined,
      },
    });
  } catch (error) {
    return createErrorResult({
      error: error instanceof Error ? error.message : 'Unknown error during SCORM export',
      errorCode: 'SCORM_EXPORT_ERROR',
      duration: Date.now() - startTime,
    });
  }
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate SCORM export context
 */
function validateSCORMContext(context: ExportContext): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!context.courseData) {
    errors.push('Course data is required');
  }

  if (!context.courseData?.title) {
    errors.push('Course title is required');
  }

  if (!context.courseData?.id) {
    errors.push('Course ID is required');
  }

  if (!context.courseData?.modules?.length) {
    errors.push('Course must have at least one module');
  }

  // Check for lessons
  const hasLessons = context.courseData?.modules?.some((m) => m.lessons?.length > 0);
  if (!hasLessons) {
    errors.push('Course must have at least one lesson');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// CONTENT GENERATORS
// ============================================================================

/**
 * Convert course data to ContentItem format for manifest
 */
function convertToContentItems(courseData: ExportContext['courseData']): ContentItem[] {
  const items: ContentItem[] = [];
  let order = 0;

  for (const module of courseData.modules) {
    // Add module as container
    const moduleItem: ContentItem = {
      id: module.id,
      type: 'module',
      title: module.title,
      description: module.description,
      order: order++,
      resources: [],
    };
    items.push(moduleItem);

    // Add lessons under module
    for (const lesson of module.lessons) {
      const lessonItem: ContentItem = {
        id: lesson.id,
        type: 'lesson',
        title: lesson.title,
        description: lesson.description,
        duration: `PT${lesson.duration}M`,
        order: order++,
        parentId: module.id,
        resources: lesson.resources.map((r) => ({
          id: r.id,
          type: r.type as 'html' | 'video' | 'audio' | 'image' | 'document' | 'data',
          url: r.url,
          mimeType: r.mimeType,
          size: r.size,
        })),
      };
      items.push(lessonItem);
    }
  }

  return items;
}

/**
 * Generate lesson content HTML
 */
function generateLessonContent(
  lesson: ExportLessonData,
  moduleTitle: string,
  courseData: ExportContext['courseData'],
  _version: SCORMVersion,
): string {
  const blocksHtml = lesson.blocks
    .sort((a, b) => a.order - b.order)
    .map((block) => renderSCORMBlock(block))
    .join('\n');

  return `<!DOCTYPE html>
<html lang="${escapeHtml(courseData.language || 'en')}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(lesson.title)}</title>
  <link rel="stylesheet" href="../../shared/css/styles.css">
</head>
<body>
  <header class="lesson-header">
    <div class="container">
      <p class="breadcrumb">${escapeHtml(courseData.title)} / ${escapeHtml(moduleTitle)}</p>
      <h1 class="lesson-title">${escapeHtml(lesson.title)}</h1>
      ${lesson.description ? `<p class="lesson-description">${escapeHtml(lesson.description)}</p>` : ''}
    </div>
  </header>

  <main class="lesson-content">
    <div class="container">
      ${blocksHtml}
    </div>
  </main>

  <footer class="lesson-footer">
    <div class="container">
      <div class="progress-controls">
        <button type="button" class="btn btn-secondary" id="btn-prev" disabled>Previous</button>
        <div class="progress-indicator">
          <span id="progress-text">0%</span>
        </div>
        <button type="button" class="btn btn-primary" id="btn-complete">Mark Complete</button>
      </div>
    </div>
  </footer>

  <script>
    (function() {
      'use strict';

      var startTime = new Date();
      var scrollProgress = 0;

      // Access parent SCORM API
      var api = parent.LXP360_SCORM;

      // Track scroll progress
      window.addEventListener('scroll', function() {
        var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollHeight > 0) {
          scrollProgress = Math.round((window.scrollY / scrollHeight) * 100);
          document.getElementById('progress-text').textContent = scrollProgress + '%';

          // Auto-complete at 90% scroll
          if (scrollProgress >= 90) {
            enableComplete();
          }
        }
      });

      function enableComplete() {
        var btn = document.getElementById('btn-complete');
        btn.disabled = false;
        btn.classList.add('enabled');
      }

      // Complete button handler
      document.getElementById('btn-complete').addEventListener('click', function() {
        var duration = Math.round((new Date() - startTime) / 1000);

        if (api) {
          api.setStatus('completed');
          api.setSessionTime(duration);
          api.setLocation('end');
          api.setSuspendData(JSON.stringify({
            completed: true,
            timestamp: new Date().toISOString()
          }));
        }

        this.textContent = 'Completed!';
        this.disabled = true;
        this.classList.add('completed');
      });

      // Restore state
      if (api) {
        var suspendData = api.getSuspendData();
        if (suspendData) {
          try {
            var data = JSON.parse(suspendData);
            if (data.completed) {
              document.getElementById('btn-complete').textContent = 'Already Completed';
              document.getElementById('btn-complete').disabled = true;
            }
          } catch (e) {}
        }
      }
    })();
  </script>
</body>
</html>`;
}

/**
 * Render content block for SCORM
 */
function renderSCORMBlock(block: ExportContext['courseData']['modules'][0]['lessons'][0]['blocks'][0]): string {
  const content = block.content;

  switch (block.type) {
    case 'paragraph':
      return `<div class="block block-paragraph">
        <p>${escapeHtml(String(content.text || ''))}</p>
      </div>`;

    case 'heading':
      const level = Math.min(6, Math.max(1, Number(content.level) || 2));
      return `<div class="block block-heading">
        <h${level}>${escapeHtml(String(content.text || ''))}</h${level}>
      </div>`;

    case 'image':
      return `<figure class="block block-image">
        <img src="${escapeHtml(String(content.url || ''))}" alt="${escapeHtml(String(content.alt || ''))}" loading="lazy" />
        ${content.caption ? `<figcaption>${escapeHtml(String(content.caption))}</figcaption>` : ''}
      </figure>`;

    case 'video':
      return `<div class="block block-video">
        <p class="video-notice">[Video: ${escapeHtml(String(content.title || 'Video content'))}]</p>
      </div>`;

    case 'quote':
      return `<blockquote class="block block-quote">
        <p>${escapeHtml(String(content.text || ''))}</p>
        ${content.author ? `<cite>- ${escapeHtml(String(content.author))}</cite>` : ''}
      </blockquote>`;

    case 'list':
      const items = Array.isArray(content.items) ? content.items : [];
      const listItems = items.map((item) => `<li>${escapeHtml(String(item))}</li>`).join('\n');
      const listTag = content.ordered ? 'ol' : 'ul';
      return `<div class="block block-list">
        <${listTag}>${listItems}</${listTag}>
      </div>`;

    case 'divider':
      return '<hr class="block block-divider" />';

    case 'mc-question':
      const choices = Array.isArray(content.choices) ? content.choices : [];
      const choiceItems = choices
        .map(
          (choice: { id?: string; text?: string }) =>
            `<label class="choice-item">
            <input type="radio" name="q-${block.id}" value="${escapeHtml(String(choice.id || ''))}" />
            <span>${escapeHtml(String(choice.text || ''))}</span>
          </label>`,
        )
        .join('\n');
      return `<div class="block block-question">
        <p class="question-text"><strong>${escapeHtml(String(content.question || 'Question'))}</strong></p>
        <div class="choices">${choiceItems}</div>
      </div>`;

    default:
      return `<div class="block block-${block.type}">
        <p>[${escapeHtml(block.type)} content]</p>
      </div>`;
  }
}

/**
 * Generate SCORM package styles
 */
function generateSCORMStyles(): string {
  return `/* LXD360 SCORM Package Styles */
:root {
  --color-primary: #0072f5;
  --color-primary-dark: #001d3d;
  --color-success: #237406;
  --color-bg: #ffffff;
  --color-bg-alt: #f8f9fa;
  --color-text: #1a1a2e;
  --color-border: #e2e8f0;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 16px; line-height: 1.6; }
body { font-family: var(--font-sans); color: var(--color-text); background: var(--color-bg); }
.container { max-width: 800px; margin: 0 auto; padding: 0 1.5rem; }

.lesson-header {
  background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary));
  color: white;
  padding: 2rem 0;
}

.breadcrumb { font-size: 0.875rem; opacity: 0.8; margin-bottom: 0.5rem; }
.lesson-title { font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; }
.lesson-description { opacity: 0.9; }

.lesson-content { padding: 2rem 0; min-height: 60vh; }

.block { margin-bottom: 1.5rem; }
.block-paragraph p { line-height: 1.8; }
.block-heading h1, .block-heading h2, .block-heading h3 { color: var(--color-primary-dark); margin-top: 1.5rem; }
.block-image { text-align: center; margin: 2rem 0; }
.block-image img { max-width: 100%; border-radius: 8px; }
.block-image figcaption { font-size: 0.875rem; color: #666; margin-top: 0.5rem; }
.block-quote { border-left: 4px solid var(--color-primary); padding-left: 1rem; font-style: italic; color: #666; }
.block-quote cite { display: block; margin-top: 0.5rem; font-size: 0.875rem; }
.block-list ul, .block-list ol { padding-left: 1.5rem; }
.block-divider { border: none; border-top: 1px solid var(--color-border); margin: 2rem 0; }
.block-video { background: var(--color-bg-alt); padding: 2rem; text-align: center; border-radius: 8px; }
.block-question { background: var(--color-bg-alt); padding: 1.5rem; border-radius: 8px; }
.question-text { margin-bottom: 1rem; }
.choice-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0; cursor: pointer; }

.lesson-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid var(--color-border);
  padding: 1rem;
}

.progress-controls { display: flex; justify-content: space-between; align-items: center; max-width: 800px; margin: 0 auto; }
.progress-indicator { font-weight: 600; color: var(--color-primary); }

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary { background: var(--color-primary); color: white; }
.btn-primary:hover:not(:disabled) { background: var(--color-primary-dark); }
.btn-primary.completed { background: var(--color-success); }
.btn-secondary { background: var(--color-bg-alt); color: var(--color-text); border: 1px solid var(--color-border); }
`;
}

/**
 * Generate README file
 */
function generateReadme(
  courseData: ExportContext['courseData'],
  version: SCORMVersion,
  settings: SCORMSettings,
): string {
  return `LXD360 SCORM Package
====================

Course: ${courseData.title}
Version: ${courseData.version || '1.0'}
SCORM Version: ${version}
Generated: ${new Date().toISOString()}

Contents
--------
- imsmanifest.xml: SCORM manifest file
- content/: Course content files
- shared/: Shared resources (scripts, styles)

Settings
--------
- Passing Score: ${settings.passingScore}%
- Time Limit: ${settings.timeLimit > 0 ? settings.timeLimit + ' minutes' : 'Unlimited'}
- Credit Mode: ${settings.credit}
- Allow Review: ${settings.allowReview ? 'Yes' : 'No'}

Installation
------------
1. Upload this ZIP file to your LMS
2. The LMS should automatically extract and register the content
3. Assign the course to learners

Technical Notes
---------------
- This package was generated by LXD360 INSPIRE Studio
- SCORM API wrapper is included in shared/scripts/
- All content is self-contained

Support
-------
For technical support, contact support@lxd360.com

Copyright: ${courseData.metadata?.copyright || new Date().getFullYear() + ' All Rights Reserved'}
`;
}

// ============================================================================
// SCHEMA PLACEHOLDERS
// ============================================================================

const SCORM_12_SCHEMA_PLACEHOLDER = `<?xml version="1.0" encoding="UTF-8"?>
<!-- SCORM 1.2 ADL Schema placeholder -->
<!-- Full schema available at: https://adlnet.gov/resources/scorm-1-2 -->
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xs:annotation>
    <xs:documentation>SCORM 1.2 Schema Reference</xs:documentation>
  </xs:annotation>
</xs:schema>`;

const IMS_CP_SCHEMA_PLACEHOLDER = `<?xml version="1.0" encoding="UTF-8"?>
<!-- IMS Content Packaging Schema placeholder -->
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xs:annotation>
    <xs:documentation>IMS CP Schema Reference</xs:documentation>
  </xs:annotation>
</xs:schema>`;

const SCORM_2004_SCHEMA_PLACEHOLDER = `<?xml version="1.0" encoding="UTF-8"?>
<!-- SCORM 2004 ADL Schema placeholder -->
<!-- Full schema available at: https://adlnet.gov/resources/scorm-2004-4th-edition -->
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xs:annotation>
    <xs:documentation>SCORM 2004 Schema Reference</xs:documentation>
  </xs:annotation>
</xs:schema>`;

const IMS_CP_2004_SCHEMA_PLACEHOLDER = `<?xml version="1.0" encoding="UTF-8"?>
<!-- IMS Content Packaging 1.1 Schema placeholder -->
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xs:annotation>
    <xs:documentation>IMS CP 1.1 Schema Reference</xs:documentation>
  </xs:annotation>
</xs:schema>`;

// Handlers are exported inline above
