/**
 * HTML5 Export Handler
 *
 * Generates a standalone HTML5 package that can be run without an LMS.
 * Includes responsive navigation, content viewer, and optional media assets.
 *
 * @module lib/services/export/html5
 */

import JSZip from 'jszip';
import type {
  CourseExportData,
  ExportOptions,
  ExportResult,
  LessonExportData,
  ModuleExportData,
} from './types';

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

/**
 * Export a course as a standalone HTML5 package
 *
 * @param course - Course data to export
 * @param options - Export options
 * @returns Export result with ZIP blob
 */
export async function exportHTML5(
  course: CourseExportData,
  options: ExportOptions,
): Promise<ExportResult> {
  const zip = new JSZip();

  // Generate main index.html
  const indexHtml = generateIndexHTML(course);
  zip.file('index.html', indexHtml);

  // Generate CSS
  const styles = generateStyles();
  zip.file('css/styles.css', styles);

  // Generate JavaScript
  const script = generateScript(course);
  zip.file('js/app.js', script);

  // Generate content pages for each lesson
  const contentFolder = zip.folder('content');
  if (contentFolder) {
    for (const module of course.modules) {
      const moduleFolder = contentFolder.folder(sanitizeFilename(module.id));
      if (moduleFolder) {
        for (const lesson of module.lessons) {
          const lessonHtml = generateLessonHTML(lesson, module, course);
          moduleFolder.file(`${sanitizeFilename(lesson.id)}.html`, lessonHtml);
        }
      }
    }
  }

  // Generate navigation data as JSON
  const navData = generateNavigationData(course);
  zip.file('data/navigation.json', JSON.stringify(navData, null, 2));

  // Add media assets if requested
  if (options.includeMedia) {
    const mediaFolder = zip.folder('media');
    if (mediaFolder) {
      for (const module of course.modules) {
        for (const lesson of module.lessons) {
          if (lesson.media) {
            for (const asset of lesson.media) {
              // In a real implementation, this would fetch and add the actual file
              // For now, we create a placeholder
              const placeholder = `/* Media asset: ${asset.filename} */`;
              mediaFolder.file(asset.filename, placeholder);
            }
          }
        }
      }
    }
  }

  // Generate the ZIP
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: options.compressionLevel ?? 6,
    },
  });

  const filename = `${sanitizeFilename(course.title)}_html5.zip`;

  return {
    blob,
    filename,
    mimeType: 'application/zip',
    size: blob.size,
  };
}

// ============================================================================
// HTML GENERATORS
// ============================================================================

/**
 * Generate the main index.html file
 */
function generateIndexHTML(course: CourseExportData): string {
  return `<!DOCTYPE html>
<html lang="${escapeHtml(course.language)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(course.description)}">
  <meta name="author" content="${escapeHtml(course.author?.name ?? 'LXD360')}">
  <title>${escapeHtml(course.title)}</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <div id="app">
    <!-- Header -->
    <header class="header">
      <button type="button" class="menu-toggle" aria-label="Toggle navigation" aria-expanded="false">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M3 12h18M3 6h18M3 18h18"/>
        </svg>
      </button>
      <h1 class="course-title">${escapeHtml(course.title)}</h1>
      <div class="progress-container">
        <div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-fill" style="width: 0%"></div>
        </div>
        <span class="progress-text">0% Complete</span>
      </div>
    </header>

    <!-- Main Layout -->
    <div class="main-layout">
      <!-- Sidebar Navigation -->
      <nav class="sidebar" aria-label="Course navigation">
        <div class="sidebar-header">
          <h2>Course Content</h2>
        </div>
        <div id="nav-tree" class="nav-tree"></div>
      </nav>

      <!-- Content Area -->
      <main class="content-area" role="main">
        <div id="content-frame"></div>

        <!-- Navigation Controls -->
        <div class="nav-controls">
          <button type="button" id="prev-btn" class="nav-btn" disabled>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            <span>Previous</span>
          </button>
          <button type="button" id="next-btn" class="nav-btn">
            <span>Next</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </main>
    </div>
  </div>

  <script src="js/app.js"></script>
</body>
</html>`;
}

/**
 * Generate HTML for a single lesson
 */
function generateLessonHTML(
  lesson: LessonExportData,
  module: ModuleExportData,
  course: CourseExportData,
): string {
  const blocksHtml = lesson.blocks
    .sort((a, b) => a.order - b.order)
    .map(
      (block) =>
        `<div class="content-block" data-block-type="${escapeHtml(block.type)}">${block.content}</div>`,
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="${escapeHtml(course.language)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(lesson.title)} - ${escapeHtml(course.title)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1a1a2e;
      padding: 24px;
      background: #ffffff;
    }
    .lesson-header {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e5e7eb;
    }
    .breadcrumb {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 8px;
    }
    .lesson-title {
      font-size: 28px;
      font-weight: 700;
      color: #0072f5;
    }
    .lesson-description {
      margin-top: 8px;
      color: #4b5563;
    }
    .content-block {
      margin-bottom: 24px;
    }
    .content-block img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    }
    .content-block h2 { font-size: 24px; margin-bottom: 12px; }
    .content-block h3 { font-size: 20px; margin-bottom: 10px; }
    .content-block p { margin-bottom: 16px; }
    .content-block ul, .content-block ol {
      margin-left: 24px;
      margin-bottom: 16px;
    }
    .content-block li { margin-bottom: 8px; }
  </style>
</head>
<body>
  <article class="lesson-content">
    <header class="lesson-header">
      <div class="breadcrumb">
        <span>${escapeHtml(course.title)}</span> &gt;
        <span>${escapeHtml(module.title)}</span>
      </div>
      <h1 class="lesson-title">${escapeHtml(lesson.title)}</h1>
      ${lesson.description ? `<p class="lesson-description">${escapeHtml(lesson.description)}</p>` : ''}
    </header>
    <div class="lesson-body">
      ${blocksHtml || '<p>No content available for this lesson.</p>'}
    </div>
  </article>
</body>
</html>`;
}

// ============================================================================
// CSS GENERATOR
// ============================================================================

/**
 * Generate the main stylesheet
 */
function generateStyles(): string {
  return `/* LXD360 HTML5 Export - Styles */
:root {
  --color-primary: #0072f5;
  --color-primary-dark: #001d3d;
  --color-secondary: #019ef3;
  --color-success: #237406;
  --color-background: #0a0a0f;
  --color-surface: #1a1a2e;
  --color-text: #ffffff;
  --color-text-muted: rgba(255, 255, 255, 0.7);
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  overflow: hidden;
}

body {
  font-family: var(--font-sans);
  background: var(--color-background);
  color: var(--color-text);
}

#app {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
  background: var(--color-surface);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  color: var(--color-text);
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
}

.menu-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
}

.menu-toggle svg {
  width: 24px;
  height: 24px;
}

.course-title {
  font-size: 18px;
  font-weight: 600;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  width: 200px;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: var(--color-text-muted);
  min-width: 80px;
}

/* Main Layout */
.main-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  width: 280px;
  background: var(--color-surface);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h2 {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.nav-tree {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.nav-module {
  margin-bottom: 4px;
}

.module-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  color: var(--color-text);
  font-weight: 500;
  font-size: 14px;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}

.module-header:hover {
  background: rgba(255, 255, 255, 0.05);
}

.module-header svg {
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
}

.module-header.expanded svg {
  transform: rotate(90deg);
}

.module-lessons {
  display: none;
}

.module-lessons.visible {
  display: block;
}

.lesson-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px 8px 40px;
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 13px;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}

.lesson-link:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
}

.lesson-link.active {
  background: rgba(0, 114, 245, 0.2);
  color: var(--color-primary);
}

.lesson-link.completed::before {
  content: '';
  width: 8px;
  height: 8px;
  background: var(--color-success);
  border-radius: 50%;
}

/* Content Area */
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

#content-frame {
  flex: 1;
  background: #ffffff;
  border-radius: 8px 8px 0 0;
  margin: 16px 16px 0;
  overflow: hidden;
}

#content-frame iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* Navigation Controls */
.nav-controls {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--color-surface);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.nav-btn:hover:not(:disabled) {
  background: var(--color-secondary);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-btn svg {
  width: 16px;
  height: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .menu-toggle {
    display: block;
  }

  .sidebar {
    position: fixed;
    left: -280px;
    top: 0;
    bottom: 0;
    z-index: 100;
    transition: left 0.3s ease;
  }

  .sidebar.open {
    left: 0;
  }

  .progress-container {
    display: none;
  }

  #content-frame {
    margin: 8px;
    border-radius: 8px;
  }
}
`;
}

// ============================================================================
// JAVASCRIPT GENERATOR
// ============================================================================

/**
 * Generate the main application JavaScript
 */
function generateScript(course: CourseExportData): string {
  const flatLessons = getFlatLessons(course);

  return `// LXD360 HTML5 Export - Application
(function() {
  'use strict';

  // Navigation data
  var navigation = ${JSON.stringify(generateNavigationData(course))};
  var flatLessons = ${JSON.stringify(flatLessons)};
  var currentIndex = 0;
  var completed = {};

  // DOM Elements
  var navTree = document.getElementById('nav-tree');
  var contentFrame = document.getElementById('content-frame');
  var prevBtn = document.getElementById('prev-btn');
  var nextBtn = document.getElementById('next-btn');
  var menuToggle = document.querySelector('.menu-toggle');
  var sidebar = document.querySelector('.sidebar');
  var progressFill = document.querySelector('.progress-fill');
  var progressText = document.querySelector('.progress-text');

  // Initialize
  function init() {
    buildNavTree();
    loadLesson(0);
    setupEventListeners();
    loadProgress();
  }

  // Build navigation tree
  function buildNavTree() {
    var html = '';
    navigation.modules.forEach(function(module, moduleIndex) {
      html += '<div class="nav-module">';
      html += '<button type="button" class="module-header" data-module="' + moduleIndex + '">';
      html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>';
      html += '<span>' + escapeHtml(module.title) + '</span>';
      html += '</button>';
      html += '<div class="module-lessons" data-module-lessons="' + moduleIndex + '">';
      module.lessons.forEach(function(lesson, lessonIndex) {
        var globalIndex = getGlobalIndex(moduleIndex, lessonIndex);
        html += '<button type="button" class="lesson-link" data-lesson="' + globalIndex + '">';
        html += escapeHtml(lesson.title);
        html += '</button>';
      });
      html += '</div></div>';
    });
    navTree.innerHTML = html;
  }

  // Get global lesson index
  function getGlobalIndex(moduleIndex, lessonIndex) {
    var index = 0;
    for (var i = 0; i < moduleIndex; i++) {
      index += navigation.modules[i].lessons.length;
    }
    return index + lessonIndex;
  }

  // Load a lesson by index
  function loadLesson(index) {
    if (index < 0 || index >= flatLessons.length) return;

    currentIndex = index;
    var lesson = flatLessons[index];

    // Create iframe
    var iframe = document.createElement('iframe');
    iframe.src = lesson.path;
    iframe.title = lesson.title;
    contentFrame.innerHTML = '';
    contentFrame.appendChild(iframe);

    // Update navigation state
    updateNavState();
    markCompleted(index);
    saveProgress();
  }

  // Update navigation button states
  function updateNavState() {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= flatLessons.length - 1;

    // Update active lesson in nav tree
    document.querySelectorAll('.lesson-link').forEach(function(link, i) {
      link.classList.toggle('active', i === currentIndex);
      link.classList.toggle('completed', completed[i] === true);
    });

    // Expand parent module
    var moduleIndex = getModuleIndex(currentIndex);
    document.querySelectorAll('.module-lessons').forEach(function(el, i) {
      el.classList.toggle('visible', i === moduleIndex);
    });
    document.querySelectorAll('.module-header').forEach(function(el, i) {
      el.classList.toggle('expanded', i === moduleIndex);
    });
  }

  // Get module index for a global lesson index
  function getModuleIndex(globalIndex) {
    var count = 0;
    for (var i = 0; i < navigation.modules.length; i++) {
      count += navigation.modules[i].lessons.length;
      if (globalIndex < count) return i;
    }
    return navigation.modules.length - 1;
  }

  // Mark lesson as completed
  function markCompleted(index) {
    completed[index] = true;
    updateProgress();
  }

  // Update progress display
  function updateProgress() {
    var total = flatLessons.length;
    var done = Object.keys(completed).length;
    var percent = Math.round((done / total) * 100);
    progressFill.style.width = percent + '%';
    progressText.textContent = percent + '% Complete';
  }

  // Save progress to localStorage
  function saveProgress() {
    try {
      localStorage.setItem('lxd360_progress_' + navigation.courseId, JSON.stringify({
        currentIndex: currentIndex,
        completed: completed
      }));
    } catch (e) {}
  }

  // Load progress from localStorage
  function loadProgress() {
    try {
      var data = localStorage.getItem('lxd360_progress_' + navigation.courseId);
      if (data) {
        var parsed = JSON.parse(data);
        completed = parsed.completed || {};
        if (parsed.currentIndex > 0) {
          loadLesson(parsed.currentIndex);
        }
      }
    } catch (e) {}
    updateProgress();
  }

  // Setup event listeners
  function setupEventListeners() {
    prevBtn.addEventListener('click', function() {
      loadLesson(currentIndex - 1);
    });

    nextBtn.addEventListener('click', function() {
      loadLesson(currentIndex + 1);
    });

    menuToggle.addEventListener('click', function() {
      sidebar.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', sidebar.classList.contains('open'));
    });

    navTree.addEventListener('click', function(e) {
      var moduleHeader = e.target.closest('.module-header');
      var lessonLink = e.target.closest('.lesson-link');

      if (moduleHeader) {
        var moduleIndex = parseInt(moduleHeader.dataset.module, 10);
        var lessonsEl = document.querySelector('[data-module-lessons="' + moduleIndex + '"]');
        lessonsEl.classList.toggle('visible');
        moduleHeader.classList.toggle('expanded');
      }

      if (lessonLink) {
        var lessonIndex = parseInt(lessonLink.dataset.lesson, 10);
        loadLesson(lessonIndex);
        sidebar.classList.remove('open');
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft' && !prevBtn.disabled) {
        loadLesson(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && !nextBtn.disabled) {
        loadLesson(currentIndex + 1);
      }
    });
  }

  // Escape HTML
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Start the app
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
`;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate navigation data structure
 */
function generateNavigationData(course: CourseExportData): {
  courseId: string;
  courseTitle: string;
  modules: Array<{
    id: string;
    title: string;
    lessons: Array<{
      id: string;
      title: string;
      path: string;
    }>;
  }>;
} {
  return {
    courseId: course.id,
    courseTitle: course.title,
    modules: course.modules.map((module) => ({
      id: module.id,
      title: module.title,
      lessons: module.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        path: `content/${sanitizeFilename(module.id)}/${sanitizeFilename(lesson.id)}.html`,
      })),
    })),
  };
}

/**
 * Get flat list of all lessons with paths
 */
function getFlatLessons(course: CourseExportData): Array<{
  id: string;
  title: string;
  path: string;
  moduleId: string;
}> {
  const lessons: Array<{
    id: string;
    title: string;
    path: string;
    moduleId: string;
  }> = [];

  for (const module of course.modules) {
    for (const lesson of module.lessons) {
      lessons.push({
        id: lesson.id,
        title: lesson.title,
        path: `content/${sanitizeFilename(module.id)}/${sanitizeFilename(lesson.id)}.html`,
        moduleId: module.id,
      });
    }
  }

  return lessons;
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

/**
 * Escape HTML entities
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
