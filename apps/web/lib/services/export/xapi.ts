/**
 * xAPI and cmi5 Export Handler
 *
 * Generates xAPI-enabled content packages that communicate with an LRS.
 * Supports both standalone xAPI and cmi5 (xAPI + LMS) formats.
 *
 * @module lib/services/export/xapi
 */

import JSZip from 'jszip';
import type {
  CourseExportData,
  ExportOptions,
  ExportResult,
  LessonExportData,
  ModuleExportData,
  XAPIExportSettings,
} from './types';
import { getDefaultXAPISettings } from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

const XAPI_VERSION = '1.0.3';
const CMI5_VERSION = '1.0';

// Standard xAPI verb IRIs
const XAPI_VERBS = {
  launched: 'http://adlnet.gov/expapi/verbs/launched',
  initialized: 'http://adlnet.gov/expapi/verbs/initialized',
  completed: 'http://adlnet.gov/expapi/verbs/completed',
  passed: 'http://adlnet.gov/expapi/verbs/passed',
  failed: 'http://adlnet.gov/expapi/verbs/failed',
  terminated: 'http://adlnet.gov/expapi/verbs/terminated',
  experienced: 'http://adlnet.gov/expapi/verbs/experienced',
  progressed: 'http://adlnet.gov/expapi/verbs/progressed',
  scored: 'http://adlnet.gov/expapi/verbs/scored',
};

// ============================================================================
// MAIN EXPORT FUNCTIONS
// ============================================================================

/**
 * Export a course as an xAPI package
 *
 * @param course - Course data to export
 * @param options - Export options
 * @returns Export result with xAPI package ZIP blob
 */
export async function exportXAPI(
  course: CourseExportData,
  options: ExportOptions,
): Promise<ExportResult> {
  const zip = new JSZip();
  const settings = options.xapiSettings ?? getDefaultXAPISettings();

  // Generate xAPI wrapper library
  const xapiLib = generateXAPILibrary(settings);
  zip.file('scripts/xapi.js', xapiLib);

  // Generate main index with xAPI integration
  const indexHtml = generateIndexHTML(course, settings, false);
  zip.file('index.html', indexHtml);

  // Generate CSS
  const styles = generateStyles();
  zip.file('css/styles.css', styles);

  // Generate navigation script
  const script = generateScript(course, settings, false);
  zip.file('js/app.js', script);

  // Generate content pages
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

  // Generate navigation data
  const navData = generateNavigationData(course, settings);
  zip.file('data/navigation.json', JSON.stringify(navData, null, 2));

  // Add media assets if requested
  if (options.includeMedia) {
    const mediaFolder = zip.folder('media');
    if (mediaFolder) {
      for (const module of course.modules) {
        for (const lesson of module.lessons) {
          if (lesson.media) {
            for (const asset of lesson.media) {
              const placeholder = `/* Media: ${asset.filename} */`;
              mediaFolder.file(asset.filename, placeholder);
            }
          }
        }
      }
    }
  }

  // Generate ZIP
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: options.compressionLevel ?? 6,
    },
  });

  const filename = `${sanitizeFilename(course.title)}_xapi.zip`;

  return {
    blob,
    filename,
    mimeType: 'application/zip',
    size: blob.size,
  };
}

/**
 * Export a course as a cmi5 package
 *
 * @param course - Course data to export
 * @param options - Export options
 * @returns Export result with cmi5 package ZIP blob
 */
export async function exportCmi5(
  course: CourseExportData,
  options: ExportOptions,
): Promise<ExportResult> {
  const zip = new JSZip();
  const settings = options.xapiSettings ?? getDefaultXAPISettings();

  // Generate cmi5.xml course structure
  const cmi5Xml = generateCmi5XML(course, settings);
  zip.file('cmi5.xml', cmi5Xml);

  // Generate xAPI/cmi5 wrapper library
  const xapiLib = generateXAPILibrary(settings, true);
  zip.file('scripts/xapi.js', xapiLib);

  // Generate main index with cmi5 integration
  const indexHtml = generateIndexHTML(course, settings, true);
  zip.file('index.html', indexHtml);

  // Generate CSS
  const styles = generateStyles();
  zip.file('css/styles.css', styles);

  // Generate navigation script with cmi5 support
  const script = generateScript(course, settings, true);
  zip.file('js/app.js', script);

  // Generate content pages
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

  // Generate navigation data
  const navData = generateNavigationData(course, settings);
  zip.file('data/navigation.json', JSON.stringify(navData, null, 2));

  // Add media assets if requested
  if (options.includeMedia) {
    const mediaFolder = zip.folder('media');
    if (mediaFolder) {
      for (const module of course.modules) {
        for (const lesson of module.lessons) {
          if (lesson.media) {
            for (const asset of lesson.media) {
              const placeholder = `/* Media: ${asset.filename} */`;
              mediaFolder.file(asset.filename, placeholder);
            }
          }
        }
      }
    }
  }

  // Generate ZIP
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: options.compressionLevel ?? 6,
    },
  });

  const filename = `${sanitizeFilename(course.title)}_cmi5.zip`;

  return {
    blob,
    filename,
    mimeType: 'application/zip',
    size: blob.size,
  };
}

// ============================================================================
// GENERATORS
// ============================================================================

/**
 * Generate the xAPI JavaScript library
 */
function generateXAPILibrary(settings: XAPIExportSettings, isCmi5 = false): string {
  return `/**
 * LXD360 xAPI Client Library
 * Version: 1.0.0
 * xAPI Version: ${XAPI_VERSION}
 * ${isCmi5 ? 'cmi5 Version: ' + CMI5_VERSION : ''}
 */
var LXD360_XAPI = (function() {
  'use strict';

  var config = {
    endpoint: '${settings.endpoint ?? ''}',
    activityIdPrefix: '${settings.activityIdPrefix}',
    verboseTracking: ${settings.verboseTracking},
    isCmi5: ${isCmi5}
  };

  var _actor = null;
  var _registration = null;
  var _sessionId = null;
  var _startTime = null;

  /**
   * Initialize the xAPI client
   * For cmi5, reads launch parameters from URL
   */
  function initialize(options) {
    options = options || {};

    ${
      isCmi5
        ? `
    // Parse cmi5 launch parameters from URL
    var params = new URLSearchParams(window.location.search);
    config.endpoint = params.get('endpoint') || config.endpoint;
    config.fetch = params.get('fetch');
    _actor = params.get('actor') ? JSON.parse(decodeURIComponent(params.get('actor'))) : null;
    _registration = params.get('registration');
    `
        : `
    // Standard xAPI configuration
    config.endpoint = options.endpoint || config.endpoint;
    _actor = options.actor || _actor;
    _registration = options.registration || generateUUID();
    `
    }

    _sessionId = generateUUID();
    _startTime = new Date();

    return true;
  }

  /**
   * Send an xAPI statement
   */
  function sendStatement(verb, object, result, context) {
    if (!config.endpoint) {
      console.warn('xAPI endpoint not configured');
      return Promise.resolve(false);
    }

    var statement = {
      id: generateUUID(),
      actor: _actor || {
        mbox: 'mailto:anonymous@lxd360.com',
        name: 'Anonymous Learner'
      },
      verb: {
        id: verb.id || verb,
        display: { 'en-US': verb.display || getVerbDisplay(verb) }
      },
      object: {
        id: config.activityIdPrefix + '/' + (object.id || object),
        definition: {
          type: object.type || 'http://adlnet.gov/expapi/activities/module',
          name: { 'en-US': object.name || object.id || object },
          description: object.description ? { 'en-US': object.description } : undefined
        }
      },
      timestamp: new Date().toISOString()
    };

    if (result) {
      statement.result = result;
    }

    if (_registration || context) {
      statement.context = context || {};
      if (_registration) {
        statement.context.registration = _registration;
      }
    }

    return fetch(config.endpoint + '/statements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Experience-API-Version': '${XAPI_VERSION}'
      },
      body: JSON.stringify(statement)
    }).then(function(response) {
      return response.ok;
    }).catch(function(error) {
      console.error('xAPI send failed:', error);
      return false;
    });
  }

  /**
   * Convenience methods for common verbs
   */
  function launched(activity) {
    return sendStatement('${XAPI_VERBS.launched}', activity);
  }

  function initialized(activity) {
    return sendStatement('${XAPI_VERBS.initialized}', activity);
  }

  function completed(activity, result) {
    return sendStatement('${XAPI_VERBS.completed}', activity, result || { completion: true });
  }

  function passed(activity, score) {
    return sendStatement('${XAPI_VERBS.passed}', activity, {
      success: true,
      score: score ? { scaled: score / 100, raw: score, max: 100, min: 0 } : undefined
    });
  }

  function failed(activity, score) {
    return sendStatement('${XAPI_VERBS.failed}', activity, {
      success: false,
      score: score ? { scaled: score / 100, raw: score, max: 100, min: 0 } : undefined
    });
  }

  function terminated(activity) {
    var duration = _startTime ? formatDuration(new Date() - _startTime) : undefined;
    return sendStatement('${XAPI_VERBS.terminated}', activity, { duration: duration });
  }

  function progressed(activity, progress) {
    return sendStatement('${XAPI_VERBS.progressed}', activity, {
      extensions: {
        'https://lxd360.com/xapi/extensions/progress': progress
      }
    });
  }

  /**
   * Helper functions
   */
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0;
      var v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function formatDuration(ms) {
    var seconds = Math.floor(ms / 1000);
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var secs = seconds % 60;
    return 'PT' + hours + 'H' + minutes + 'M' + secs + 'S';
  }

  function getVerbDisplay(verbId) {
    var displays = {
      '${XAPI_VERBS.launched}': 'launched',
      '${XAPI_VERBS.initialized}': 'initialized',
      '${XAPI_VERBS.completed}': 'completed',
      '${XAPI_VERBS.passed}': 'passed',
      '${XAPI_VERBS.failed}': 'failed',
      '${XAPI_VERBS.terminated}': 'terminated',
      '${XAPI_VERBS.experienced}': 'experienced',
      '${XAPI_VERBS.progressed}': 'progressed'
    };
    return displays[verbId] || 'interacted';
  }

  return {
    initialize: initialize,
    sendStatement: sendStatement,
    launched: launched,
    initialized: initialized,
    completed: completed,
    passed: passed,
    failed: failed,
    terminated: terminated,
    progressed: progressed,
    config: config
  };
})();
`;
}

/**
 * Generate cmi5.xml course structure
 */
function generateCmi5XML(course: CourseExportData, settings: XAPIExportSettings): string {
  const courseId = `${settings.activityIdPrefix}/${course.id}`;

  const xml: string[] = [];

  xml.push('<?xml version="1.0" encoding="UTF-8"?>');
  xml.push(`<courseStructure xmlns="https://w3id.org/xapi/profiles/cmi5/v1/CourseStructure.xsd">`);

  // Course metadata
  xml.push(`  <course id="${escapeXml(courseId)}">`);
  xml.push(
    `    <title><langstring lang="${course.language}">${escapeXml(course.title)}</langstring></title>`,
  );
  if (course.description) {
    xml.push(
      `    <description><langstring lang="${course.language}">${escapeXml(course.description)}</langstring></description>`,
    );
  }
  xml.push('  </course>');

  // Assignable Units (AUs) - lessons
  for (const module of course.modules) {
    xml.push(`  <block id="${settings.activityIdPrefix}/${module.id}">`);
    xml.push(
      `    <title><langstring lang="${course.language}">${escapeXml(module.title)}</langstring></title>`,
    );

    for (const lesson of module.lessons) {
      const auId = `${settings.activityIdPrefix}/${lesson.id}`;
      const launchUrl = `content/${sanitizeFilename(module.id)}/${sanitizeFilename(lesson.id)}.html`;

      xml.push(`    <au id="${escapeXml(auId)}" moveOn="Completed">`);
      xml.push(
        `      <title><langstring lang="${course.language}">${escapeXml(lesson.title)}</langstring></title>`,
      );
      xml.push(`      <url>${escapeXml(launchUrl)}</url>`);
      xml.push('    </au>');
    }

    xml.push('  </block>');
  }

  xml.push('</courseStructure>');

  return xml.join('\n');
}

/**
 * Generate main index HTML
 */
function generateIndexHTML(
  course: CourseExportData,
  _settings: XAPIExportSettings,
  isCmi5: boolean,
): string {
  return `<!DOCTYPE html>
<html lang="${escapeHtml(course.language)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(course.title)}</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <div id="app">
    <header class="header">
      <h1>${escapeHtml(course.title)}</h1>
      <div class="status">
        <span class="xapi-status" id="xapi-status">${isCmi5 ? 'cmi5' : 'xAPI'}: Initializing...</span>
      </div>
    </header>
    <div class="main">
      <nav class="sidebar" id="nav-tree"></nav>
      <main class="content">
        <iframe id="content-frame" title="Content"></iframe>
        <div class="controls">
          <button type="button" id="prev-btn" disabled>Previous</button>
          <span id="progress">0 / 0</span>
          <button type="button" id="next-btn">Next</button>
        </div>
      </main>
    </div>
  </div>
  <script src="scripts/xapi.js"></script>
  <script src="js/app.js"></script>
</body>
</html>`;
}

/**
 * Generate main application script
 */
function generateScript(
  course: CourseExportData,
  settings: XAPIExportSettings,
  isCmi5: boolean,
): string {
  const flatLessons = getFlatLessons(course, settings);

  return `(function() {
  'use strict';

  var lessons = ${JSON.stringify(flatLessons)};
  var current = 0;
  var completed = {};

  function init() {
    // Initialize xAPI
    var success = LXD360_XAPI.initialize();
    document.getElementById('xapi-status').textContent = '${isCmi5 ? 'cmi5' : 'xAPI'}: ' + (success ? 'Ready' : 'Offline');

    // Send launched statement
    LXD360_XAPI.launched({ id: '${course.id}', name: '${escapeJs(course.title)}' });

    buildNav();
    loadLesson(0);
    setupEvents();
  }

  function buildNav() {
    var html = '';
    lessons.forEach(function(l, i) {
      html += '<div class="nav-item" data-idx="' + i + '">' + escapeHtml(l.title) + '</div>';
    });
    document.getElementById('nav-tree').innerHTML = html;
  }

  function loadLesson(idx) {
    if (idx < 0 || idx >= lessons.length) return;
    current = idx;
    document.getElementById('content-frame').src = lessons[idx].path;
    updateUI();

    // Track progression
    LXD360_XAPI.progressed(
      { id: lessons[idx].id, name: lessons[idx].title },
      (idx + 1) / lessons.length
    );
  }

  function updateUI() {
    document.getElementById('prev-btn').disabled = current === 0;
    document.getElementById('next-btn').disabled = current >= lessons.length - 1;
    document.getElementById('progress').textContent = (current + 1) + ' / ' + lessons.length;

    document.querySelectorAll('.nav-item').forEach(function(el, i) {
      el.classList.toggle('active', i === current);
      el.classList.toggle('completed', completed[i] === true);
    });
  }

  function completeLesson(idx) {
    if (completed[idx]) return;
    completed[idx] = true;

    LXD360_XAPI.completed({ id: lessons[idx].id, name: lessons[idx].title });

    // Check if all complete
    if (Object.keys(completed).length >= lessons.length) {
      LXD360_XAPI.passed({ id: '${course.id}', name: '${escapeJs(course.title)}' }, 100);
    }

    updateUI();
  }

  function setupEvents() {
    document.getElementById('prev-btn').onclick = function() { loadLesson(current - 1); };
    document.getElementById('next-btn').onclick = function() {
      completeLesson(current);
      loadLesson(current + 1);
    };
    document.getElementById('nav-tree').onclick = function(e) {
      var item = e.target.closest('.nav-item');
      if (item) {
        completeLesson(current);
        loadLesson(parseInt(item.dataset.idx, 10));
      }
    };

    window.addEventListener('beforeunload', function() {
      LXD360_XAPI.terminated({ id: '${course.id}', name: '${escapeJs(course.title)}' });
    });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();`;
}

/**
 * Generate lesson HTML page
 */
function generateLessonHTML(
  lesson: LessonExportData,
  module: ModuleExportData,
  course: CourseExportData,
): string {
  const blocksHtml = lesson.blocks
    .sort((a, b) => a.order - b.order)
    .map((block) => `<div class="block">${block.content}</div>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="${escapeHtml(course.language)}">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(lesson.title)}</title>
  <style>
    body { font-family: sans-serif; padding: 24px; line-height: 1.6; }
    h1 { color: #0072f5; }
    .block { margin-bottom: 20px; }
    .block img { max-width: 100%; }
  </style>
</head>
<body>
  <p style="color: #666; font-size: 12px;">${escapeHtml(course.title)} &gt; ${escapeHtml(module.title)}</p>
  <h1>${escapeHtml(lesson.title)}</h1>
  ${lesson.description ? `<p style="color: #666;">${escapeHtml(lesson.description)}</p>` : ''}
  ${blocksHtml || '<p>No content.</p>'}
</body>
</html>`;
}

/**
 * Generate CSS styles
 */
function generateStyles(): string {
  return `
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: sans-serif; height: 100vh; }
#app { display: flex; flex-direction: column; height: 100%; }
.header { background: #0072f5; color: #fff; padding: 16px; display: flex; justify-content: space-between; align-items: center; }
.main { display: flex; flex: 1; overflow: hidden; }
.sidebar { width: 240px; background: #f5f5f5; padding: 16px; overflow-y: auto; }
.nav-item { padding: 8px; cursor: pointer; border-radius: 4px; margin-bottom: 4px; }
.nav-item:hover { background: #ddd; }
.nav-item.active { background: #0072f5; color: #fff; }
.nav-item.completed { border-left: 3px solid #237406; }
.content { flex: 1; display: flex; flex-direction: column; }
#content-frame { flex: 1; border: none; background: #fff; }
.controls { background: #eee; padding: 12px; display: flex; gap: 12px; justify-content: center; align-items: center; }
.controls button { padding: 8px 16px; cursor: pointer; }
.controls button:disabled { opacity: 0.5; }
.xapi-status { font-size: 12px; opacity: 0.8; }
`;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate navigation data
 */
function generateNavigationData(
  course: CourseExportData,
  settings: XAPIExportSettings,
): {
  courseId: string;
  activityIdPrefix: string;
  modules: Array<{
    id: string;
    title: string;
    lessons: Array<{ id: string; title: string; path: string }>;
  }>;
} {
  return {
    courseId: course.id,
    activityIdPrefix: settings.activityIdPrefix,
    modules: course.modules.map((m) => ({
      id: m.id,
      title: m.title,
      lessons: m.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        path: `content/${sanitizeFilename(m.id)}/${sanitizeFilename(l.id)}.html`,
      })),
    })),
  };
}

/**
 * Get flat list of lessons
 */
function getFlatLessons(
  course: CourseExportData,
  settings: XAPIExportSettings,
): Array<{ id: string; title: string; path: string; activityId: string }> {
  const lessons: Array<{ id: string; title: string; path: string; activityId: string }> = [];

  for (const module of course.modules) {
    for (const lesson of module.lessons) {
      lessons.push({
        id: lesson.id,
        title: lesson.title,
        path: `content/${sanitizeFilename(module.id)}/${sanitizeFilename(lesson.id)}.html`,
        activityId: `${settings.activityIdPrefix}/${lesson.id}`,
      });
    }
  }

  return lessons;
}

/**
 * Sanitize filename
 */
function sanitizeFilename(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Escape HTML
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Escape JavaScript string
 */
function escapeJs(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
}

/**
 * Escape XML
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
