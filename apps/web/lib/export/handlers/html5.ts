/**
 * HTML5 Standalone Export Handler
 *
 * @fileoverview Generates a standalone HTML5 package for offline viewing
 * @module lib/export/handlers/html5
 */

import JSZip from 'jszip';

import type {
  ExportBlockData,
  ExportContext,
  ExportHandler,
  ExportHandlerResult,
  ExportLessonData,
  ExportModuleData,
} from './base';
import { createErrorResult, createSuccessResult, escapeHtml, generateFilename } from './base';

// ============================================================================
// CONSTANTS
// ============================================================================

const HTML5_MIME_TYPE = 'application/zip';
const HTML5_EXTENSION = 'zip';

// ============================================================================
// HTML5 EXPORT HANDLER
// ============================================================================

/**
 * HTML5 standalone export handler
 */
export const html5Handler: ExportHandler = {
  format: 'html5',
  displayName: 'HTML5 Standalone',
  mimeType: HTML5_MIME_TYPE,
  extension: HTML5_EXTENSION,

  async export(context: ExportContext): Promise<ExportHandlerResult> {
    const startTime = Date.now();

    try {
      const { courseData, settings } = context;
      const zip = new JSZip();

      // Generate course structure
      let totalItems = 0;

      // Add index.html (main entry point)
      const indexHtml = generateIndexHtml(courseData);
      zip.file('index.html', indexHtml);
      totalItems++;

      // Add navigation.js
      const navigationJs = generateNavigationScript(courseData);
      zip.file('js/navigation.js', navigationJs);
      totalItems++;

      // Add styles.css
      const stylesCss = generateStyles();
      zip.file('css/styles.css', stylesCss);
      totalItems++;

      // Generate lesson pages
      for (const module of courseData.modules) {
        for (const lesson of module.lessons) {
          const lessonHtml = generateLessonHtml(lesson, module, courseData);
          zip.file(`lessons/${lesson.id}.html`, lessonHtml);
          totalItems++;
        }
      }

      // Add manifest.json for course metadata
      const manifest = generateManifest(courseData, settings);
      zip.file('manifest.json', JSON.stringify(manifest, null, 2));
      totalItems++;

      // Generate ZIP file
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
        filename: generateFilename(courseData.title, HTML5_EXTENSION),
        mimeType: HTML5_MIME_TYPE,
        stats: {
          totalItems,
          totalSize: blob.size,
          duration,
          warnings: 0,
        },
      });
    } catch (error) {
      return createErrorResult({
        error: error instanceof Error ? error.message : 'Unknown error during HTML5 export',
        errorCode: 'HTML5_EXPORT_ERROR',
        duration: Date.now() - startTime,
      });
    }
  },

  validate(context: ExportContext): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!context.courseData) {
      errors.push('Course data is required');
    }

    if (!context.courseData?.title) {
      errors.push('Course title is required');
    }

    if (!context.courseData?.modules?.length) {
      errors.push('Course must have at least one module');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};

// ============================================================================
// HTML GENERATORS
// ============================================================================

/**
 * Generate the main index.html file
 */
function generateIndexHtml(courseData: ExportContext['courseData']): string {
  const moduleList = courseData.modules
    .map((module) => {
      const lessonList = module.lessons
        .map(
          (lesson) =>
            `<li class="lesson-item">
              <a href="lessons/${escapeHtml(lesson.id)}.html" class="lesson-link">
                <span class="lesson-icon">&#128196;</span>
                <span class="lesson-title">${escapeHtml(lesson.title)}</span>
                <span class="lesson-duration">${lesson.duration} min</span>
              </a>
            </li>`,
        )
        .join('\n');

      return `
        <section class="module">
          <h2 class="module-title">${escapeHtml(module.title)}</h2>
          ${module.description ? `<p class="module-description">${escapeHtml(module.description)}</p>` : ''}
          <ul class="lesson-list">
            ${lessonList}
          </ul>
        </section>
      `;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="${escapeHtml(courseData.language || 'en')}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(courseData.description || '')}">
  <title>${escapeHtml(courseData.title)}</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <header class="course-header">
    <div class="container">
      <h1 class="course-title">${escapeHtml(courseData.title)}</h1>
      <p class="course-description">${escapeHtml(courseData.description || '')}</p>
      <div class="course-meta">
        <span class="meta-item">
          <strong>Version:</strong> ${escapeHtml(courseData.version || '1.0')}
        </span>
        <span class="meta-item">
          <strong>Duration:</strong> ${courseData.totalDuration} minutes
        </span>
        <span class="meta-item">
          <strong>Modules:</strong> ${courseData.modules.length}
        </span>
      </div>
    </div>
  </header>

  <main class="course-content">
    <div class="container">
      <nav class="course-navigation" aria-label="Course content">
        ${moduleList}
      </nav>
    </div>
  </main>

  <footer class="course-footer">
    <div class="container">
      <p>Generated by LXD360 INSPIRE Studio</p>
      <p class="copyright">${escapeHtml(courseData.metadata?.copyright || '')}</p>
    </div>
  </footer>

  <script src="js/navigation.js"></script>
</body>
</html>`;
}

/**
 * Generate lesson HTML page
 */
function generateLessonHtml(
  lesson: ExportLessonData,
  module: ExportModuleData,
  courseData: ExportContext['courseData'],
): string {
  const blocksHtml = lesson.blocks
    .sort((a, b) => a.order - b.order)
    .map((block) => renderContentBlock(block))
    .join('\n');

  // Find prev/next lessons for navigation
  const allLessons = courseData.modules.flatMap((m) => m.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return `<!DOCTYPE html>
<html lang="${escapeHtml(courseData.language || 'en')}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(lesson.title)} - ${escapeHtml(courseData.title)}</title>
  <link rel="stylesheet" href="../css/styles.css">
</head>
<body>
  <header class="lesson-header">
    <div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="../index.html" class="breadcrumb-link">Home</a>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-module">${escapeHtml(module.title)}</span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">${escapeHtml(lesson.title)}</span>
      </nav>
      <h1 class="lesson-title">${escapeHtml(lesson.title)}</h1>
      ${lesson.description ? `<p class="lesson-description">${escapeHtml(lesson.description)}</p>` : ''}
      <div class="lesson-meta">
        <span class="meta-item">
          <strong>Duration:</strong> ${lesson.duration} minutes
        </span>
      </div>
    </div>
  </header>

  <main class="lesson-content">
    <div class="container">
      ${blocksHtml}
    </div>
  </main>

  <footer class="lesson-footer">
    <div class="container">
      <nav class="lesson-navigation" aria-label="Lesson navigation">
        ${
          prevLesson
            ? `<a href="${escapeHtml(prevLesson.id)}.html" class="nav-link nav-prev">
            &larr; Previous: ${escapeHtml(prevLesson.title)}
          </a>`
            : '<span class="nav-placeholder"></span>'
        }
        <a href="../index.html" class="nav-link nav-home">
          Course Home
        </a>
        ${
          nextLesson
            ? `<a href="${escapeHtml(nextLesson.id)}.html" class="nav-link nav-next">
            Next: ${escapeHtml(nextLesson.title)} &rarr;
          </a>`
            : '<span class="nav-placeholder"></span>'
        }
      </nav>
    </div>
  </footer>

  <script src="../js/navigation.js"></script>
</body>
</html>`;
}

/**
 * Render a content block to HTML
 */
function renderContentBlock(block: ExportBlockData): string {
  const content = block.content;

  switch (block.type) {
    case 'paragraph':
      return `<div class="block block-paragraph">
        <p>${escapeHtml(String(content.text || ''))}</p>
      </div>`;

    case 'heading': {
      const level = Math.min(6, Math.max(1, Number(content.level) || 2));
      return `<div class="block block-heading">
        <h${level}>${escapeHtml(String(content.text || ''))}</h${level}>
      </div>`;
    }

    case 'image':
      return `<figure class="block block-image">
        <img src="${escapeHtml(String(content.url || ''))}"
             alt="${escapeHtml(String(content.alt || ''))}"
             loading="lazy" />
        ${content.caption ? `<figcaption>${escapeHtml(String(content.caption))}</figcaption>` : ''}
      </figure>`;

    case 'video':
      return `<div class="block block-video">
        <div class="video-container">
          <p class="video-placeholder">Video: ${escapeHtml(String(content.title || 'Video content'))}</p>
          ${content.url ? `<a href="${escapeHtml(String(content.url))}" target="_blank" rel="noopener noreferrer">Open Video</a>` : ''}
        </div>
      </div>`;

    case 'quote':
      return `<blockquote class="block block-quote">
        <p>${escapeHtml(String(content.text || ''))}</p>
        ${content.author ? `<cite>- ${escapeHtml(String(content.author))}</cite>` : ''}
      </blockquote>`;

    case 'list': {
      const items = Array.isArray(content.items) ? content.items : [];
      const listItems = items.map((item) => `<li>${escapeHtml(String(item))}</li>`).join('\n');
      const listTag = content.ordered ? 'ol' : 'ul';
      return `<div class="block block-list">
        <${listTag}>${listItems}</${listTag}>
      </div>`;
    }

    case 'divider':
      return '<hr class="block block-divider" />';

    case 'accordion': {
      const sections = Array.isArray(content.sections) ? content.sections : [];
      const accordionItems = sections
        .map(
          (section: { title?: string; content?: string }, index: number) => `
          <details class="accordion-item">
            <summary class="accordion-title">${escapeHtml(String(section.title || `Section ${index + 1}`))}</summary>
            <div class="accordion-content">${escapeHtml(String(section.content || ''))}</div>
          </details>
        `,
        )
        .join('\n');
      return `<div class="block block-accordion">${accordionItems}</div>`;
    }

    case 'tabs': {
      const tabs = Array.isArray(content.tabs) ? content.tabs : [];
      const tabButtons = tabs
        .map(
          (tab: { title?: string }, index: number) =>
            `<button type="button" class="tab-button${index === 0 ? ' active' : ''}" data-tab="${index}">
            ${escapeHtml(String(tab.title || `Tab ${index + 1}`))}
          </button>`,
        )
        .join('\n');
      const tabPanels = tabs
        .map(
          (tab: { content?: string }, index: number) =>
            `<div class="tab-panel${index === 0 ? ' active' : ''}" data-tab="${index}">
            ${escapeHtml(String(tab.content || ''))}
          </div>`,
        )
        .join('\n');
      return `<div class="block block-tabs">
        <div class="tab-buttons">${tabButtons}</div>
        <div class="tab-panels">${tabPanels}</div>
      </div>`;
    }

    case 'mc-question': {
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
      return `<div class="block block-question block-mc-question">
        <p class="question-text"><strong>${escapeHtml(String(content.question || 'Question'))}</strong></p>
        <div class="choices">${choiceItems}</div>
      </div>`;
    }

    case 'fitb-question':
      return `<div class="block block-question block-fitb-question">
        <p class="question-text"><strong>Fill in the blank:</strong></p>
        <p>${escapeHtml(String(content.template || ''))}</p>
      </div>`;

    default:
      return `<div class="block block-unknown">
        <p>[Content block: ${escapeHtml(block.type)}]</p>
      </div>`;
  }
}

// ============================================================================
// ASSET GENERATORS
// ============================================================================

/**
 * Generate navigation script
 */
function generateNavigationScript(courseData: ExportContext['courseData']): string {
  return `/**
 * LXD360 Course Navigation
 * Generated for: ${courseData.title}
 */
(function() {
  'use strict';

  // Tab functionality
  document.querySelectorAll('.tab-buttons').forEach(function(container) {
    container.addEventListener('click', function(e) {
      var button = e.target.closest('.tab-button');
      if (!button) return;

      var tabIndex = button.dataset.tab;
      var parent = button.closest('.block-tabs');

      // Update buttons
      parent.querySelectorAll('.tab-button').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.tab === tabIndex);
      });

      // Update panels
      parent.querySelectorAll('.tab-panel').forEach(function(panel) {
        panel.classList.toggle('active', panel.dataset.tab === tabIndex);
      });
    });
  });

  // Track progress in localStorage
  var STORAGE_KEY = 'lxd360_progress_' + '${courseData.id}';

  function getProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveProgress(lessonId) {
    var progress = getProgress();
    progress[lessonId] = {
      completed: true,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  // Mark current lesson as visited
  var lessonMatch = window.location.pathname.match(/lessons\\/(.+)\\.html/);
  if (lessonMatch) {
    saveProgress(lessonMatch[1]);
  }

  // Update lesson list with progress indicators
  var progress = getProgress();
  document.querySelectorAll('.lesson-link').forEach(function(link) {
    var href = link.getAttribute('href');
    var match = href && href.match(/lessons\\/(.+)\\.html/);
    if (match && progress[match[1]]) {
      link.classList.add('visited');
    }
  });
})();
`;
}

/**
 * Generate CSS styles
 */
function generateStyles(): string {
  return `/**
 * LXD360 Course Styles
 * Generated by INSPIRE Studio
 */

:root {
  --color-primary: #0072f5;
  --color-primary-dark: #001d3d;
  --color-secondary: #019ef3;
  --color-success: #237406;
  --color-warning: #b58e21;
  --color-error: #cd0a0a;
  --color-text: #1a1a2e;
  --color-text-muted: #666;
  --color-bg: #ffffff;
  --color-bg-alt: #f8f9fa;
  --color-border: #e2e8f0;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --radius: 8px;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  line-height: 1.6;
}

body {
  font-family: var(--font-sans);
  color: var(--color-text);
  background: var(--color-bg);
}

.container {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Header */
.course-header,
.lesson-header {
  background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary));
  color: white;
  padding: 3rem 0;
}

.course-title,
.lesson-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.course-description,
.lesson-description {
  font-size: 1.125rem;
  opacity: 0.9;
  max-width: 600px;
}

.course-meta,
.lesson-meta {
  margin-top: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.meta-item {
  font-size: 0.875rem;
}

/* Breadcrumb */
.breadcrumb {
  font-size: 0.875rem;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.breadcrumb-link {
  color: inherit;
}

.breadcrumb-separator {
  margin: 0 0.5rem;
}

/* Navigation */
.course-navigation {
  padding: 2rem 0;
}

.module {
  margin-bottom: 2rem;
  background: var(--color-bg-alt);
  border-radius: var(--radius);
  padding: 1.5rem;
  border: 1px solid var(--color-border);
}

.module-title {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--color-primary-dark);
}

.module-description {
  color: var(--color-text-muted);
  margin-bottom: 1rem;
}

.lesson-list {
  list-style: none;
}

.lesson-item {
  margin-bottom: 0.5rem;
}

.lesson-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: white;
  border-radius: var(--radius);
  text-decoration: none;
  color: inherit;
  border: 1px solid var(--color-border);
  transition: all 0.2s ease;
}

.lesson-link:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow);
}

.lesson-link.visited {
  background: #f0fff0;
  border-color: var(--color-success);
}

.lesson-icon {
  font-size: 1.25rem;
}

.lesson-title {
  flex: 1;
  font-size: 1rem;
}

.lesson-duration {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

/* Content */
.lesson-content {
  padding: 2rem 0;
}

.block {
  margin-bottom: 1.5rem;
}

.block-paragraph p,
.block-list ul,
.block-list ol {
  line-height: 1.8;
}

.block-heading h1,
.block-heading h2,
.block-heading h3,
.block-heading h4,
.block-heading h5,
.block-heading h6 {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: var(--color-primary-dark);
}

.block-image {
  margin: 2rem 0;
}

.block-image img {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.block-image figcaption {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  text-align: center;
}

.block-quote {
  border-left: 4px solid var(--color-primary);
  padding-left: 1.5rem;
  font-style: italic;
  color: var(--color-text-muted);
  margin: 1.5rem 0;
}

.block-quote cite {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.block-divider {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 2rem 0;
}

/* Accordion */
.accordion-item {
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  margin-bottom: 0.5rem;
  overflow: hidden;
}

.accordion-title {
  padding: 1rem 1.25rem;
  background: var(--color-bg-alt);
  cursor: pointer;
  font-weight: 600;
}

.accordion-content {
  padding: 1rem 1.25rem;
}

/* Tabs */
.tab-buttons {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 1rem;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-button.active {
  border-bottom-color: var(--color-primary);
  color: var(--color-primary);
}

.tab-panel {
  display: none;
}

.tab-panel.active {
  display: block;
}

/* Questions */
.block-question {
  background: var(--color-bg-alt);
  border-radius: var(--radius);
  padding: 1.5rem;
  border: 1px solid var(--color-border);
}

.question-text {
  margin-bottom: 1rem;
}

.choice-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  cursor: pointer;
}

/* Footer */
.course-footer,
.lesson-footer {
  background: var(--color-bg-alt);
  padding: 2rem 0;
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  border-top: 1px solid var(--color-border);
}

.lesson-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.nav-link {
  padding: 0.75rem 1.5rem;
  background: white;
  border-radius: var(--radius);
  text-decoration: none;
  color: var(--color-text);
  border: 1px solid var(--color-border);
  transition: all 0.2s;
}

.nav-link:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.nav-home {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.nav-home:hover {
  background: var(--color-primary-dark);
  color: white;
}

.nav-placeholder {
  flex: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .course-title,
  .lesson-title {
    font-size: 1.75rem;
  }

  .lesson-navigation {
    flex-direction: column;
  }

  .nav-link {
    width: 100%;
    text-align: center;
  }
}
`;
}

/**
 * Generate manifest.json
 */
function generateManifest(
  courseData: ExportContext['courseData'],
  settings: ExportContext['settings'],
): Record<string, unknown> {
  return {
    '@context': 'https://lxd360.com/schemas/course-manifest',
    '@type': 'Course',
    identifier: courseData.id,
    title: courseData.title,
    description: courseData.description,
    version: courseData.version,
    language: courseData.language,
    duration: courseData.totalDuration,
    metadata: courseData.metadata,
    exportSettings: {
      format: 'html5',
      completionCriteria: settings.completionCriteria,
      scoringMethod: settings.scoringMethod,
    },
    structure: {
      moduleCount: courseData.modules.length,
      lessonCount: courseData.modules.reduce((acc, m) => acc + m.lessons.length, 0),
    },
    generatedAt: new Date().toISOString(),
    generator: 'LXD360 INSPIRE Studio',
  };
}

export default html5Handler;
