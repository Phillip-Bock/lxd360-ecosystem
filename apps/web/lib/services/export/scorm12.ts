/**
 * SCORM 1.2 Export Handler
 *
 * Generates SCORM 1.2 compliant packages for LMS delivery.
 * Includes imsmanifest.xml, API wrapper, and content pages.
 *
 * @module lib/services/export/scorm12
 */

import JSZip from 'jszip';
import { generateAPIWrapper, generateSCOWrapper } from '@/lib/export/scorm';
import type {
  CourseExportData,
  ExportOptions,
  ExportResult,
  LessonExportData,
  ModuleExportData,
  SCORMExportSettings,
} from './types';
import { getDefaultSCORMSettings } from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

const SCORM_12_SCHEMA = {
  schema: 'ADL SCORM',
  schemaversion: '1.2',
  namespace: 'http://www.adlnet.org/xsd/adlcp_rootv1p2',
  imsNamespace: 'http://www.imsproject.org/xsd/imscp_rootv1p1p2',
};

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

/**
 * Export a course as a SCORM 1.2 package
 *
 * @param course - Course data to export
 * @param options - Export options
 * @returns Export result with SCORM package ZIP blob
 */
export async function exportSCORM12(
  course: CourseExportData,
  options: ExportOptions,
): Promise<ExportResult> {
  const zip = new JSZip();
  const settings = options.scormSettings ?? getDefaultSCORMSettings();

  // Generate imsmanifest.xml
  const manifest = generateManifestXML(course, settings);
  zip.file('imsmanifest.xml', manifest);

  // Generate SCORM API wrapper JavaScript
  const apiWrapper = generateAPIWrapper('1.2');
  zip.file('scripts/scorm-api.js', apiWrapper);

  // Generate main SCO wrapper (index.html)
  const scoWrapper = generateSCOWrapper({
    title: course.title,
    entryPoint: 'content/index.html',
    scormVersion: '1.2',
    settings: {
      version: '1.2',
      passingScore: settings.passingScore,
      timeLimit: settings.timeLimit,
      allowReview: settings.allowReview,
      credit: settings.credit,
      launchData: settings.launchData,
    },
    metadata: {
      identifier: course.id,
      title: course.title,
      description: course.description,
      version: course.version,
      language: course.language,
      author: course.author,
    },
  });
  zip.file('index.html', scoWrapper);

  // Generate content pages
  const contentFolder = zip.folder('content');
  if (contentFolder) {
    // Main content index
    const contentIndex = generateContentIndexHTML(course, settings);
    contentFolder.file('index.html', contentIndex);

    // Individual lesson pages
    for (const module of course.modules) {
      const moduleFolder = contentFolder.folder(sanitizeIdentifier(module.id));
      if (moduleFolder) {
        for (const lesson of module.lessons) {
          const lessonHtml = generateLessonHTML(lesson, module, course);
          moduleFolder.file(`${sanitizeIdentifier(lesson.id)}.html`, lessonHtml);
        }
      }
    }
  }

  // Add media assets if requested
  if (options.includeMedia) {
    const mediaFolder = zip.folder('media');
    if (mediaFolder) {
      for (const module of course.modules) {
        for (const lesson of module.lessons) {
          if (lesson.media) {
            for (const asset of lesson.media) {
              // In production, this would fetch and add actual media files
              const placeholder = `/* Media: ${asset.filename} */`;
              mediaFolder.file(asset.filename, placeholder);
            }
          }
        }
      }
    }
  }

  // Generate the ZIP package
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: options.compressionLevel ?? 6,
    },
  });

  const filename = `${sanitizeIdentifier(course.title)}_scorm12.zip`;

  return {
    blob,
    filename,
    mimeType: 'application/zip',
    size: blob.size,
  };
}

// ============================================================================
// MANIFEST GENERATOR
// ============================================================================

/**
 * Generate SCORM 1.2 imsmanifest.xml
 *
 * Template based on ADL SCORM 1.2 specification:
 * ```xml
 * <?xml version="1.0" encoding="UTF-8"?>
 * <manifest identifier="{{courseId}}" version="1.0">
 *   <organizations default="{{courseId}}-org">
 *     <organization identifier="{{courseId}}-org">
 *       <title>{{courseTitle}}</title>
 *       {{#each modules}}
 *       <item identifier="{{id}}">
 *         <title>{{title}}</title>
 *       </item>
 *       {{/each}}
 *     </organization>
 *   </organizations>
 *   <resources>
 *     <resource identifier="res-1" type="webcontent" href="index.html">
 *       <file href="index.html"/>
 *     </resource>
 *   </resources>
 * </manifest>
 * ```
 */
function generateManifestXML(course: CourseExportData, settings: SCORMExportSettings): string {
  const courseId = sanitizeIdentifier(course.id);
  const orgId = `${courseId}_org`;

  const xml: string[] = [];

  // XML Declaration
  xml.push('<?xml version="1.0" encoding="UTF-8"?>');

  // Manifest root element
  xml.push(`<manifest identifier="${courseId}" version="1.0"
  xmlns="${SCORM_12_SCHEMA.imsNamespace}"
  xmlns:adlcp="${SCORM_12_SCHEMA.namespace}"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="${SCORM_12_SCHEMA.imsNamespace} imscp_rootv1p1p2.xsd
    ${SCORM_12_SCHEMA.namespace} adlcp_rootv1p2.xsd">`);

  // Metadata section
  xml.push('  <metadata>');
  xml.push(`    <schema>${SCORM_12_SCHEMA.schema}</schema>`);
  xml.push(`    <schemaversion>${SCORM_12_SCHEMA.schemaversion}</schemaversion>`);

  // LOM metadata
  xml.push('    <lom xmlns="http://ltsc.ieee.org/xsd/LOM">');
  xml.push('      <general>');
  xml.push('        <title>');
  xml.push(`          <string language="${course.language}">${escapeXml(course.title)}</string>`);
  xml.push('        </title>');
  if (course.description) {
    xml.push('        <description>');
    xml.push(
      `          <string language="${course.language}">${escapeXml(course.description)}</string>`,
    );
    xml.push('        </description>');
  }
  if (course.keywords && course.keywords.length > 0) {
    for (const keyword of course.keywords) {
      xml.push('        <keyword>');
      xml.push(`          <string language="${course.language}">${escapeXml(keyword)}</string>`);
      xml.push('        </keyword>');
    }
  }
  xml.push(`        <language>${course.language}</language>`);
  xml.push('      </general>');
  if (course.duration) {
    xml.push('      <technical>');
    xml.push(`        <duration>${escapeXml(course.duration)}</duration>`);
    xml.push('      </technical>');
  }
  xml.push('    </lom>');
  xml.push('  </metadata>');

  // Organizations section
  xml.push(`  <organizations default="${orgId}">`);
  xml.push(`    <organization identifier="${orgId}">`);
  xml.push(`      <title>${escapeXml(course.title)}</title>`);

  // Build course structure from modules and lessons
  for (const module of course.modules.sort((a, b) => a.order - b.order)) {
    const moduleId = sanitizeIdentifier(module.id);

    xml.push(`      <item identifier="${moduleId}">`);
    xml.push(`        <title>${escapeXml(module.title)}</title>`);

    for (const lesson of module.lessons.sort((a, b) => a.order - b.order)) {
      const lessonId = sanitizeIdentifier(lesson.id);
      const resourceRef = `RES_${lessonId}`;

      xml.push(`        <item identifier="${lessonId}" identifierref="${resourceRef}">`);
      xml.push(`          <title>${escapeXml(lesson.title)}</title>`);

      // SCORM 1.2 mastery score
      if (settings.passingScore > 0) {
        xml.push(`          <adlcp:masteryscore>${settings.passingScore}</adlcp:masteryscore>`);
      }

      xml.push('        </item>');
    }

    xml.push('      </item>');
  }

  xml.push('    </organization>');
  xml.push('  </organizations>');

  // Resources section
  xml.push('  <resources>');

  // Main SCO resource
  xml.push(
    '    <resource identifier="RES_MAIN" type="webcontent" adlcp:scormtype="sco" href="index.html">',
  );
  xml.push('      <file href="index.html" />');
  xml.push('      <file href="scripts/scorm-api.js" />');
  xml.push('      <file href="content/index.html" />');
  xml.push('    </resource>');

  // Individual lesson resources
  for (const module of course.modules) {
    for (const lesson of module.lessons) {
      const lessonId = sanitizeIdentifier(lesson.id);
      const moduleId = sanitizeIdentifier(module.id);
      const href = `content/${moduleId}/${lessonId}.html`;

      xml.push(
        `    <resource identifier="RES_${lessonId}" type="webcontent" adlcp:scormtype="sco" href="${href}">`,
      );
      xml.push(`      <file href="${href}" />`);

      // Add media file references
      if (lesson.media) {
        for (const asset of lesson.media) {
          xml.push(`      <file href="media/${escapeXml(asset.filename)}" />`);
        }
      }

      xml.push('    </resource>');
    }
  }

  xml.push('  </resources>');
  xml.push('</manifest>');

  return xml.join('\n');
}

// ============================================================================
// CONTENT GENERATORS
// ============================================================================

/**
 * Generate the main content index page with SCORM tracking
 */
function generateContentIndexHTML(course: CourseExportData, settings: SCORMExportSettings): string {
  const navigation = generateNavigationData(course);

  return `<!DOCTYPE html>
<html lang="${escapeHtml(course.language)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(course.title)}</title>
  <style>
    ${getContentStyles()}
  </style>
</head>
<body>
  <div id="app">
    <header class="header">
      <h1>${escapeHtml(course.title)}</h1>
      <div class="progress">
        <span id="progress-text">0% Complete</span>
      </div>
    </header>

    <div class="main">
      <nav class="sidebar" aria-label="Course navigation">
        <h2>Contents</h2>
        <div id="nav-tree"></div>
      </nav>

      <main class="content">
        <iframe id="content-frame" title="Lesson content"></iframe>
        <div class="controls">
          <button type="button" id="prev-btn" disabled>Previous</button>
          <button type="button" id="next-btn">Next</button>
        </div>
      </main>
    </div>
  </div>

  <script>
    ${getContentScript(navigation, settings)}
  </script>
</body>
</html>`;
}

/**
 * Generate individual lesson page
 */
function generateLessonHTML(
  lesson: LessonExportData,
  module: ModuleExportData,
  course: CourseExportData,
): string {
  const blocksHtml = lesson.blocks
    .sort((a, b) => a.order - b.order)
    .map(
      (block) => `<div class="block" data-type="${escapeHtml(block.type)}">${block.content}</div>`,
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="${escapeHtml(course.language)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(lesson.title)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 24px;
      background: #fff;
    }
    .breadcrumb { font-size: 12px; color: #666; margin-bottom: 8px; }
    h1 { font-size: 24px; color: #0072f5; margin-bottom: 16px; }
    .description { color: #666; margin-bottom: 24px; }
    .block { margin-bottom: 20px; }
    .block img { max-width: 100%; height: auto; border-radius: 4px; }
    .block h2 { font-size: 20px; margin-bottom: 12px; }
    .block h3 { font-size: 16px; margin-bottom: 8px; }
    .block p { margin-bottom: 12px; }
    .block ul, .block ol { margin-left: 24px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="breadcrumb">${escapeHtml(course.title)} &gt; ${escapeHtml(module.title)}</div>
  <h1>${escapeHtml(lesson.title)}</h1>
  ${lesson.description ? `<p class="description">${escapeHtml(lesson.description)}</p>` : ''}
  <div class="content">
    ${blocksHtml || '<p>No content available.</p>'}
  </div>
</body>
</html>`;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate navigation data structure
 */
function generateNavigationData(course: CourseExportData): {
  courseId: string;
  modules: Array<{
    id: string;
    title: string;
    lessons: Array<{ id: string; title: string; path: string }>;
  }>;
} {
  return {
    courseId: course.id,
    modules: course.modules.map((module) => ({
      id: module.id,
      title: module.title,
      lessons: module.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        path: `${sanitizeIdentifier(module.id)}/${sanitizeIdentifier(lesson.id)}.html`,
      })),
    })),
  };
}

/**
 * Get content page styles
 */
function getContentStyles(): string {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: sans-serif; height: 100vh; overflow: hidden; }
    #app { display: flex; flex-direction: column; height: 100%; }
    .header { padding: 16px; background: #0072f5; color: #fff; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { font-size: 18px; }
    .main { display: flex; flex: 1; overflow: hidden; }
    .sidebar { width: 250px; background: #f5f5f5; padding: 16px; overflow-y: auto; }
    .sidebar h2 { font-size: 14px; margin-bottom: 12px; color: #666; }
    .content { flex: 1; display: flex; flex-direction: column; }
    #content-frame { flex: 1; border: none; }
    .controls { padding: 12px; background: #eee; display: flex; gap: 12px; justify-content: center; }
    .controls button { padding: 8px 16px; cursor: pointer; }
    .controls button:disabled { opacity: 0.5; cursor: not-allowed; }
    .nav-item { padding: 8px; cursor: pointer; border-radius: 4px; margin-bottom: 4px; }
    .nav-item:hover { background: #ddd; }
    .nav-item.active { background: #0072f5; color: #fff; }
  `;
}

/**
 * Get content page JavaScript with SCORM tracking
 */
function getContentScript(
  navigation: ReturnType<typeof generateNavigationData>,
  _settings: SCORMExportSettings,
): string {
  return `
    (function() {
      var nav = ${JSON.stringify(navigation)};
      var lessons = [];
      nav.modules.forEach(function(m) { m.lessons.forEach(function(l) { lessons.push(l); }); });
      var current = 0;
      var completed = {};
      var scorm = null;

      function initSCORM() {
        if (typeof parent.LXP360_SCORM !== 'undefined') {
          scorm = parent.LXP360_SCORM;
        }
      }

      function loadLesson(idx) {
        if (idx < 0 || idx >= lessons.length) return;
        current = idx;
        document.getElementById('content-frame').src = lessons[idx].path;
        updateUI();
        markCompleted(idx);
        updateSCORM();
      }

      function updateUI() {
        document.getElementById('prev-btn').disabled = current === 0;
        document.getElementById('next-btn').disabled = current >= lessons.length - 1;
        var pct = Math.round(Object.keys(completed).length / lessons.length * 100);
        document.getElementById('progress-text').textContent = pct + '% Complete';
        document.querySelectorAll('.nav-item').forEach(function(el, i) {
          el.classList.toggle('active', i === current);
        });
      }

      function markCompleted(idx) { completed[idx] = true; }

      function updateSCORM() {
        if (!scorm) return;
        var pct = Object.keys(completed).length / lessons.length;
        scorm.setLocation(lessons[current].id);
        scorm.setSuspendData(JSON.stringify({ current: current, completed: completed }));
        if (pct >= 1) {
          scorm.setScore(100);
          scorm.setStatus('completed');
        }
      }

      function buildNav() {
        var html = '';
        lessons.forEach(function(l, i) {
          html += '<div class="nav-item" data-idx="' + i + '">' + l.title + '</div>';
        });
        document.getElementById('nav-tree').innerHTML = html;
      }

      document.getElementById('prev-btn').onclick = function() { loadLesson(current - 1); };
      document.getElementById('next-btn').onclick = function() { loadLesson(current + 1); };
      document.getElementById('nav-tree').onclick = function(e) {
        var item = e.target.closest('.nav-item');
        if (item) loadLesson(parseInt(item.dataset.idx, 10));
      };

      initSCORM();
      buildNav();
      loadLesson(0);
    })();
  `;
}

/**
 * Sanitize a string for use as a SCORM identifier
 */
function sanitizeIdentifier(str: string): string {
  return str.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/^([^a-zA-Z])/, 'ID_$1');
}

/**
 * Escape XML entities
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
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
