/**
 * xAPI Export Handler
 *
 * @fileoverview Generates an xAPI-enabled package with TinCan.js wrapper
 * @module lib/export/handlers/xapi
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
import {
  createErrorResult,
  createSuccessResult,
  escapeHtml,
  escapeXml,
  generateFilename,
} from './base';

// ============================================================================
// CONSTANTS
// ============================================================================

const XAPI_MIME_TYPE = 'application/zip';
const XAPI_EXTENSION = 'zip';

const ACTIVITY_TYPES = {
  course: 'http://adlnet.gov/expapi/activities/course',
  module: 'http://adlnet.gov/expapi/activities/module',
  lesson: 'http://adlnet.gov/expapi/activities/lesson',
  assessment: 'http://adlnet.gov/expapi/activities/assessment',
  interaction: 'http://adlnet.gov/expapi/activities/cmi.interaction',
  media: 'http://adlnet.gov/expapi/activities/media',
  video: 'https://w3id.org/xapi/video/activity-type/video',
};

const VERBS = {
  initialized: { id: 'http://adlnet.gov/expapi/verbs/initialized', display: 'initialized' },
  experienced: { id: 'http://adlnet.gov/expapi/verbs/experienced', display: 'experienced' },
  interacted: { id: 'http://adlnet.gov/expapi/verbs/interacted', display: 'interacted' },
  completed: { id: 'http://adlnet.gov/expapi/verbs/completed', display: 'completed' },
  passed: { id: 'http://adlnet.gov/expapi/verbs/passed', display: 'passed' },
  failed: { id: 'http://adlnet.gov/expapi/verbs/failed', display: 'failed' },
  answered: { id: 'http://adlnet.gov/expapi/verbs/answered', display: 'answered' },
  terminated: { id: 'http://adlnet.gov/expapi/verbs/terminated', display: 'terminated' },
  played: { id: 'https://w3id.org/xapi/video/verbs/played', display: 'played' },
  paused: { id: 'https://w3id.org/xapi/video/verbs/paused', display: 'paused' },
};

// ============================================================================
// XAPI EXPORT HANDLER
// ============================================================================

/**
 * xAPI package export handler
 */
export const xapiHandler: ExportHandler = {
  format: 'xapi',
  displayName: 'xAPI Package',
  mimeType: XAPI_MIME_TYPE,
  extension: XAPI_EXTENSION,

  async export(context: ExportContext): Promise<ExportHandlerResult> {
    const startTime = Date.now();

    try {
      const { courseData, settings } = context;
      const zip = new JSZip();

      let totalItems = 0;

      // Get xAPI settings
      const xapiSettings = settings.xapi ?? {
        activityIdPrefix: 'https://lxd360.com/xapi/activities',
        verboseTracking: true,
      };

      // Add tincan.xml (xAPI package descriptor)
      const tincanXml = generateTincanXml(courseData, xapiSettings);
      zip.file('tincan.xml', tincanXml);
      totalItems++;

      // Add xAPI wrapper script
      const xapiWrapper = generateXAPIWrapper(xapiSettings);
      zip.file('js/xapi-wrapper.js', xapiWrapper);
      totalItems++;

      // Add statement templates
      const templates = generateStatementTemplates(courseData, xapiSettings);
      zip.file('js/statement-templates.js', templates);
      totalItems++;

      // Add index.html (main entry point)
      const indexHtml = generateXAPIIndexHtml(courseData, xapiSettings);
      zip.file('index.html', indexHtml);
      totalItems++;

      // Add styles
      const styles = generateXAPIStyles();
      zip.file('css/styles.css', styles);
      totalItems++;

      // Add navigation script
      const navigation = generateXAPINavigation(courseData, xapiSettings);
      zip.file('js/navigation.js', navigation);
      totalItems++;

      // Generate lesson pages
      for (const module of courseData.modules) {
        for (const lesson of module.lessons) {
          const lessonHtml = generateXAPILessonHtml(lesson, module, courseData, xapiSettings);
          zip.file(`lessons/${lesson.id}.html`, lessonHtml);
          totalItems++;
        }
      }

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
        filename: generateFilename(`${courseData.title}-xapi`, XAPI_EXTENSION),
        mimeType: XAPI_MIME_TYPE,
        stats: {
          totalItems,
          totalSize: blob.size,
          duration,
          warnings: 0,
        },
      });
    } catch (error) {
      return createErrorResult({
        error: error instanceof Error ? error.message : 'Unknown error during xAPI export',
        errorCode: 'XAPI_EXPORT_ERROR',
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
// XML GENERATORS
// ============================================================================

interface XAPISettings {
  activityIdPrefix: string;
  verboseTracking: boolean;
  endpoint?: string;
  extensions?: Record<string, unknown>;
}

/**
 * Generate tincan.xml package descriptor
 */
function generateTincanXml(
  courseData: ExportContext['courseData'],
  settings: XAPISettings,
): string {
  const activityId = `${settings.activityIdPrefix}/course/${courseData.id}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<tincan xmlns="http://projecttincan.com/tincan.xsd">
  <activities>
    <activity id="${escapeXml(activityId)}" type="${ACTIVITY_TYPES.course}">
      <name>${escapeXml(courseData.title)}</name>
      <description lang="${courseData.language || 'en'}">${escapeXml(courseData.description || '')}</description>
      <launch lang="${courseData.language || 'en'}">index.html</launch>
    </activity>
  </activities>
</tincan>`;
}

// ============================================================================
// JAVASCRIPT GENERATORS
// ============================================================================

/**
 * Generate xAPI wrapper script
 */
function generateXAPIWrapper(settings: XAPISettings): string {
  return `/**
 * LXD360 xAPI Wrapper
 * Provides a simplified interface for sending xAPI statements
 */
var LXD360_XAPI = (function() {
  'use strict';

  var _config = {
    endpoint: null,
    auth: null,
    actor: null,
    activityIdPrefix: '${settings.activityIdPrefix}'
  };

  var _initialized = false;
  var _sessionStart = null;
  var _statementQueue = [];

  /**
   * Initialize xAPI connection
   */
  function initialize(callback) {
    // Parse launch parameters from query string or postMessage
    var params = parseLaunchParams();

    if (params.endpoint) {
      _config.endpoint = params.endpoint;
      _config.auth = params.auth;
      _config.actor = params.actor;
      _initialized = true;
      _sessionStart = new Date();

      // Send initialized statement
      sendStatement({
        verb: VERBS.initialized,
        object: getCurrentActivity()
      }, function() {
        // Flush queued statements
        while (_statementQueue.length > 0) {
          var stmt = _statementQueue.shift();
          sendStatement(stmt.statement, stmt.callback);
        }
        if (callback) callback(true);
      });
    } else {
      console.warn('LXD360_XAPI: No LRS configuration found. Running in offline mode.');
      _initialized = false;
      if (callback) callback(false);
    }
  }

  /**
   * Parse launch parameters
   */
  function parseLaunchParams() {
    var params = {};
    var query = window.location.search.substring(1);
    var pairs = query.split('&');

    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split('=');
      params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }

    // Try to parse actor from JSON
    if (params.actor) {
      try {
        params.actor = JSON.parse(params.actor);
      } catch (e) {
        params.actor = null;
      }
    }

    return params;
  }

  /**
   * Get current activity definition
   */
  function getCurrentActivity() {
    return {
      id: _config.activityIdPrefix + '/course/' + COURSE_ID,
      definition: {
        type: '${ACTIVITY_TYPES.course}',
        name: { 'en-US': COURSE_TITLE }
      }
    };
  }

  /**
   * Create a statement
   */
  function createStatement(params) {
    var statement = {
      actor: _config.actor || {
        objectType: 'Agent',
        name: 'Anonymous Learner',
        account: {
          homePage: 'https://lxd360.com',
          name: 'anonymous'
        }
      },
      verb: {
        id: params.verb.id,
        display: { 'en-US': params.verb.display }
      },
      object: params.object,
      timestamp: new Date().toISOString()
    };

    if (params.result) {
      statement.result = params.result;
    }

    if (params.context) {
      statement.context = params.context;
    }

    return statement;
  }

  /**
   * Send a statement to the LRS
   */
  function sendStatement(params, callback) {
    var statement = createStatement(params);

    if (!_initialized) {
      // Queue statement for later (offline mode)
      _statementQueue.push({ statement: params, callback: callback });
      if (callback) callback(null, statement);
      return;
    }

    // Send to LRS
    var xhr = new XMLHttpRequest();
    xhr.open('POST', _config.endpoint + '/statements', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-Experience-API-Version', '1.0.3');

    if (_config.auth) {
      xhr.setRequestHeader('Authorization', _config.auth);
    }

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          if (callback) callback(null, statement);
        } else {
          // Statement send failed
          if (callback) callback(new Error('Failed to send statement'), null);
        }
      }
    };

    xhr.send(JSON.stringify(statement));
  }

  /**
   * Track content experienced
   */
  function experienced(activityId, name, type, duration) {
    sendStatement({
      verb: VERBS.experienced,
      object: {
        id: activityId,
        definition: {
          type: type || '${ACTIVITY_TYPES.media}',
          name: { 'en-US': name }
        }
      },
      result: duration ? {
        duration: formatDuration(duration)
      } : undefined
    });
  }

  /**
   * Track completion
   */
  function completed(activityId, name, type, score, duration) {
    var result = {
      completion: true
    };

    if (score !== undefined) {
      result.score = {
        scaled: score / 100,
        raw: score,
        min: 0,
        max: 100
      };
    }

    if (duration) {
      result.duration = formatDuration(duration);
    }

    sendStatement({
      verb: VERBS.completed,
      object: {
        id: activityId,
        definition: {
          type: type || '${ACTIVITY_TYPES.lesson}',
          name: { 'en-US': name }
        }
      },
      result: result
    });
  }

  /**
   * Track pass/fail
   */
  function passedOrFailed(passed, activityId, name, score) {
    sendStatement({
      verb: passed ? VERBS.passed : VERBS.failed,
      object: {
        id: activityId,
        definition: {
          type: '${ACTIVITY_TYPES.assessment}',
          name: { 'en-US': name }
        }
      },
      result: {
        success: passed,
        score: {
          scaled: score / 100,
          raw: score,
          min: 0,
          max: 100
        }
      }
    });
  }

  /**
   * Track answered
   */
  function answered(activityId, name, response, correct, score) {
    sendStatement({
      verb: VERBS.answered,
      object: {
        id: activityId,
        definition: {
          type: '${ACTIVITY_TYPES.interaction}',
          name: { 'en-US': name }
        }
      },
      result: {
        response: response,
        success: correct,
        score: score !== undefined ? {
          scaled: score / 100,
          raw: score,
          min: 0,
          max: 100
        } : undefined
      }
    });
  }

  /**
   * Terminate session
   */
  function terminate(callback) {
    if (!_sessionStart) {
      if (callback) callback();
      return;
    }

    var duration = (new Date() - _sessionStart) / 1000;

    sendStatement({
      verb: VERBS.terminated,
      object: getCurrentActivity(),
      result: {
        duration: formatDuration(duration)
      }
    }, callback);
  }

  /**
   * Format duration as ISO 8601
   */
  function formatDuration(seconds) {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var secs = Math.floor(seconds % 60);

    var result = 'PT';
    if (hours > 0) result += hours + 'H';
    if (minutes > 0) result += minutes + 'M';
    if (secs > 0 || result === 'PT') result += secs + 'S';

    return result;
  }

  // Verb definitions
  var VERBS = ${JSON.stringify(VERBS, null, 2)};

  // Public API
  return {
    initialize: initialize,
    sendStatement: sendStatement,
    experienced: experienced,
    completed: completed,
    passedOrFailed: passedOrFailed,
    answered: answered,
    terminate: terminate,
    VERBS: VERBS
  };
})();
`;
}

/**
 * Generate statement templates
 */
function generateStatementTemplates(
  courseData: ExportContext['courseData'],
  settings: XAPISettings,
): string {
  const courseActivity = {
    id: `${settings.activityIdPrefix}/course/${courseData.id}`,
    definition: {
      type: ACTIVITY_TYPES.course,
      name: { 'en-US': courseData.title },
      description: { 'en-US': courseData.description || '' },
    },
  };

  const moduleActivities = courseData.modules.map((module) => ({
    id: `${settings.activityIdPrefix}/module/${module.id}`,
    definition: {
      type: ACTIVITY_TYPES.module,
      name: { 'en-US': module.title },
      description: { 'en-US': module.description || '' },
    },
  }));

  const lessonActivities = courseData.modules.flatMap((module) =>
    module.lessons.map((lesson) => ({
      id: `${settings.activityIdPrefix}/lesson/${lesson.id}`,
      moduleId: module.id,
      definition: {
        type: ACTIVITY_TYPES.lesson,
        name: { 'en-US': lesson.title },
        description: { 'en-US': lesson.description || '' },
      },
    })),
  );

  return `/**
 * xAPI Statement Templates
 * Generated for: ${courseData.title}
 */

var COURSE_ID = '${courseData.id}';
var COURSE_TITLE = '${courseData.title.replace(/'/g, "\\'")}';
var ACTIVITY_PREFIX = '${settings.activityIdPrefix}';

var COURSE_ACTIVITY = ${JSON.stringify(courseActivity, null, 2)};

var MODULE_ACTIVITIES = ${JSON.stringify(moduleActivities, null, 2)};

var LESSON_ACTIVITIES = ${JSON.stringify(lessonActivities, null, 2)};

/**
 * Get activity definition for a lesson
 */
function getLessonActivity(lessonId) {
  for (var i = 0; i < LESSON_ACTIVITIES.length; i++) {
    if (LESSON_ACTIVITIES[i].id.indexOf(lessonId) !== -1) {
      return LESSON_ACTIVITIES[i];
    }
  }
  return null;
}

/**
 * Get activity definition for a module
 */
function getModuleActivity(moduleId) {
  for (var i = 0; i < MODULE_ACTIVITIES.length; i++) {
    if (MODULE_ACTIVITIES[i].id.indexOf(moduleId) !== -1) {
      return MODULE_ACTIVITIES[i];
    }
  }
  return null;
}
`;
}

/**
 * Generate xAPI-enabled navigation script
 */
function generateXAPINavigation(
  courseData: ExportContext['courseData'],
  _settings: XAPISettings,
): string {
  return `/**
 * LXD360 xAPI Navigation
 * Tracks learner progress using xAPI
 */
(function() {
  'use strict';

  var lessonStartTime = null;
  var currentLessonId = null;

  // Initialize xAPI on page load
  document.addEventListener('DOMContentLoaded', function() {
    LXD360_XAPI.initialize(function() {
      // Track current lesson after initialization
      trackCurrentLesson();
    });
  });

  // Track lesson on unload
  window.addEventListener('beforeunload', function() {
    if (currentLessonId && lessonStartTime) {
      var duration = (new Date() - lessonStartTime) / 1000;
      LXD360_XAPI.experienced(
        ACTIVITY_PREFIX + '/lesson/' + currentLessonId,
        document.title,
        '${ACTIVITY_TYPES.lesson}',
        duration
      );
    }
    LXD360_XAPI.terminate();
  });

  function trackCurrentLesson() {
    var match = window.location.pathname.match(/lessons\\/(.+)\\.html/);
    if (match) {
      currentLessonId = match[1];
      lessonStartTime = new Date();

      // Save to localStorage for progress tracking
      var progress = getProgress();
      progress[currentLessonId] = {
        started: lessonStartTime.toISOString(),
        completed: false
      };
      saveProgress(progress);
    }
  }

  // Progress tracking helpers
  var STORAGE_KEY = 'lxd360_xapi_progress_${courseData.id}';

  function getProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveProgress(progress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  // Expose for content interaction
  window.trackInteraction = function(blockId, type, data) {
    if (!currentLessonId) return;

    LXD360_XAPI.sendStatement({
      verb: LXD360_XAPI.VERBS.interacted,
      object: {
        id: ACTIVITY_PREFIX + '/block/' + blockId,
        definition: {
          type: '${ACTIVITY_TYPES.interaction}',
          name: { 'en-US': type + ' interaction' }
        }
      },
      context: {
        contextActivities: {
          parent: [{
            id: ACTIVITY_PREFIX + '/lesson/' + currentLessonId
          }]
        },
        extensions: data ? {
          'https://lxd360.com/xapi/extensions/interaction-data': data
        } : undefined
      }
    });
  };

  window.trackAnswer = function(questionId, questionText, response, correct, score) {
    LXD360_XAPI.answered(
      ACTIVITY_PREFIX + '/question/' + questionId,
      questionText,
      response,
      correct,
      score
    );
  };

  window.markLessonComplete = function() {
    if (!currentLessonId || !lessonStartTime) return;

    var duration = (new Date() - lessonStartTime) / 1000;

    LXD360_XAPI.completed(
      ACTIVITY_PREFIX + '/lesson/' + currentLessonId,
      document.title,
      '${ACTIVITY_TYPES.lesson}',
      null,
      duration
    );

    // Update local progress
    var progress = getProgress();
    progress[currentLessonId].completed = true;
    progress[currentLessonId].completedAt = new Date().toISOString();
    saveProgress(progress);
  };
})();
`;
}

// ============================================================================
// HTML GENERATORS
// ============================================================================

/**
 * Generate xAPI-enabled index.html
 */
function generateXAPIIndexHtml(
  courseData: ExportContext['courseData'],
  _settings: XAPISettings,
): string {
  const moduleList = courseData.modules
    .map((module) => {
      const lessonList = module.lessons
        .map(
          (lesson) =>
            `<li class="lesson-item">
              <a href="lessons/${escapeHtml(lesson.id)}.html" class="lesson-link" data-lesson-id="${escapeHtml(lesson.id)}">
                <span class="lesson-icon">&#128196;</span>
                <span class="lesson-title">${escapeHtml(lesson.title)}</span>
                <span class="lesson-duration">${lesson.duration} min</span>
                <span class="lesson-status"></span>
              </a>
            </li>`,
        )
        .join('\n');

      return `
        <section class="module" data-module-id="${escapeHtml(module.id)}">
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
      <div class="xapi-status" id="xapi-status">
        <span class="status-indicator offline"></span>
        <span class="status-text">Connecting...</span>
      </div>
      <h1 class="course-title">${escapeHtml(courseData.title)}</h1>
      <p class="course-description">${escapeHtml(courseData.description || '')}</p>
      <div class="course-meta">
        <span class="meta-item"><strong>Duration:</strong> ${courseData.totalDuration} min</span>
        <span class="meta-item"><strong>Modules:</strong> ${courseData.modules.length}</span>
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
      <p>Powered by LXD360 INSPIRE Studio</p>
      <p>xAPI 1.0.3 Compatible</p>
    </div>
  </footer>

  <script src="js/statement-templates.js"></script>
  <script src="js/xapi-wrapper.js"></script>
  <script src="js/navigation.js"></script>
  <script>
    // Update xAPI status indicator
    document.addEventListener('DOMContentLoaded', function() {
      var statusEl = document.getElementById('xapi-status');
      LXD360_XAPI.initialize(function(success) {
        var indicator = statusEl.querySelector('.status-indicator');
        var text = statusEl.querySelector('.status-text');
        if (success) {
          indicator.className = 'status-indicator online';
          text.textContent = 'Connected to LRS';
        } else {
          indicator.className = 'status-indicator offline';
          text.textContent = 'Offline Mode';
        }
      });
    });
  </script>
</body>
</html>`;
}

/**
 * Generate xAPI-enabled lesson HTML
 */
function generateXAPILessonHtml(
  lesson: ExportLessonData,
  module: ExportModuleData,
  courseData: ExportContext['courseData'],
  settings: XAPISettings,
): string {
  const blocksHtml = lesson.blocks
    .sort((a, b) => a.order - b.order)
    .map((block) => renderXAPIBlock(block, settings))
    .join('\n');

  // Find prev/next lessons
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
<body data-lesson-id="${escapeHtml(lesson.id)}" data-module-id="${escapeHtml(module.id)}">
  <header class="lesson-header">
    <div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="../index.html">Home</a> /
        <span>${escapeHtml(module.title)}</span> /
        <span>${escapeHtml(lesson.title)}</span>
      </nav>
      <h1 class="lesson-title">${escapeHtml(lesson.title)}</h1>
      ${lesson.description ? `<p class="lesson-description">${escapeHtml(lesson.description)}</p>` : ''}
    </div>
  </header>

  <main class="lesson-content">
    <div class="container">
      ${blocksHtml}

      <div class="lesson-actions">
        <button type="button" class="btn btn-primary" onclick="markLessonComplete()">
          Mark as Complete
        </button>
      </div>
    </div>
  </main>

  <footer class="lesson-footer">
    <div class="container">
      <nav class="lesson-navigation" aria-label="Lesson navigation">
        ${prevLesson ? `<a href="${escapeHtml(prevLesson.id)}.html" class="nav-link nav-prev">&larr; Previous</a>` : '<span></span>'}
        <a href="../index.html" class="nav-link nav-home">Course Home</a>
        ${nextLesson ? `<a href="${escapeHtml(nextLesson.id)}.html" class="nav-link nav-next">Next &rarr;</a>` : '<span></span>'}
      </nav>
    </div>
  </footer>

  <script src="../js/statement-templates.js"></script>
  <script src="../js/xapi-wrapper.js"></script>
  <script src="../js/navigation.js"></script>
</body>
</html>`;
}

/**
 * Render content block with xAPI tracking
 */
function renderXAPIBlock(block: ExportBlockData, _settings: XAPISettings): string {
  const content = block.content;
  const blockId = block.id;

  switch (block.type) {
    case 'paragraph':
      return `<div class="block block-paragraph" data-block-id="${blockId}">
        <p>${escapeHtml(String(content.text || ''))}</p>
      </div>`;

    case 'accordion': {
      const sections = Array.isArray(content.sections) ? content.sections : [];
      const accordionItems = sections
        .map(
          (section: { title?: string; content?: string }, index: number) => `
          <details class="accordion-item" onclick="trackInteraction('${blockId}', 'accordion', { section: ${index} })">
            <summary class="accordion-title">${escapeHtml(String(section.title || `Section ${index + 1}`))}</summary>
            <div class="accordion-content">${escapeHtml(String(section.content || ''))}</div>
          </details>
        `,
        )
        .join('\n');
      return `<div class="block block-accordion" data-block-id="${blockId}">${accordionItems}</div>`;
    }

    case 'mc-question': {
      const choices = Array.isArray(content.choices) ? content.choices : [];
      const correctIds = choices
        .filter((c: { correct?: boolean }) => c.correct)
        .map((c: { id?: string }) => c.id);

      const choiceItems = choices
        .map(
          (choice: { id?: string; text?: string }) =>
            `<label class="choice-item">
            <input type="radio" name="q-${blockId}" value="${escapeHtml(String(choice.id || ''))}"
              onchange="handleAnswer('${blockId}', '${escapeHtml(String(content.question || ''))}', this.value, ${JSON.stringify(correctIds)})" />
            <span>${escapeHtml(String(choice.text || ''))}</span>
          </label>`,
        )
        .join('\n');

      return `<div class="block block-question block-mc-question" data-block-id="${blockId}">
        <p class="question-text"><strong>${escapeHtml(String(content.question || 'Question'))}</strong></p>
        <div class="choices">${choiceItems}</div>
        <div class="feedback" id="feedback-${blockId}"></div>
      </div>
      <script>
        function handleAnswer(blockId, questionText, answer, correctIds) {
          var correct = correctIds.indexOf(answer) !== -1;
          var score = correct ? 100 : 0;
          trackAnswer(blockId, questionText, answer, correct, score);
          var feedbackEl = document.getElementById('feedback-' + blockId);
          feedbackEl.className = 'feedback ' + (correct ? 'correct' : 'incorrect');
          feedbackEl.textContent = correct ? 'Correct!' : 'Incorrect. Try again.';
        }
      </script>`;
    }

    default:
      // Default rendering without special tracking
      return `<div class="block block-${block.type}" data-block-id="${blockId}">
        ${renderDefaultBlock(block)}
      </div>`;
  }
}

/**
 * Render default block content
 */
function renderDefaultBlock(block: ExportBlockData): string {
  const content = block.content;

  switch (block.type) {
    case 'heading': {
      const level = Math.min(6, Math.max(1, Number(content.level) || 2));
      return `<h${level}>${escapeHtml(String(content.text || ''))}</h${level}>`;
    }

    case 'image':
      return `<figure>
        <img src="${escapeHtml(String(content.url || ''))}" alt="${escapeHtml(String(content.alt || ''))}" loading="lazy" />
        ${content.caption ? `<figcaption>${escapeHtml(String(content.caption))}</figcaption>` : ''}
      </figure>`;

    case 'video':
      return `<div class="video-container">
        <p>[Video: ${escapeHtml(String(content.title || 'Video content'))}]</p>
      </div>`;

    case 'quote':
      return `<blockquote>
        <p>${escapeHtml(String(content.text || ''))}</p>
        ${content.author ? `<cite>- ${escapeHtml(String(content.author))}</cite>` : ''}
      </blockquote>`;

    case 'list': {
      const items = Array.isArray(content.items) ? content.items : [];
      const listItems = items.map((item) => `<li>${escapeHtml(String(item))}</li>`).join('');
      return content.ordered ? `<ol>${listItems}</ol>` : `<ul>${listItems}</ul>`;
    }

    case 'divider':
      return '<hr />';

    default:
      return `<p>[${escapeHtml(block.type)}]</p>`;
  }
}

// ============================================================================
// STYLE GENERATOR
// ============================================================================

/**
 * Generate xAPI package styles
 */
function generateXAPIStyles(): string {
  return `/* LXD360 xAPI Package Styles */
:root {
  --color-primary: #0072f5;
  --color-primary-dark: #001d3d;
  --color-success: #237406;
  --color-error: #cd0a0a;
  --color-bg: #ffffff;
  --color-bg-alt: #f8f9fa;
  --color-text: #1a1a2e;
  --color-border: #e2e8f0;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 16px; line-height: 1.6; }
body { font-family: var(--font-sans); color: var(--color-text); background: var(--color-bg); }
.container { max-width: 960px; margin: 0 auto; padding: 0 1.5rem; }

.course-header, .lesson-header {
  background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary));
  color: white;
  padding: 2rem 0;
}

.xapi-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  margin-bottom: 1rem;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #666;
}

.status-indicator.online { background: #4caf50; }
.status-indicator.offline { background: #ff9800; }

.course-title, .lesson-title { font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; }
.course-description, .lesson-description { opacity: 0.9; }
.course-meta { margin-top: 1rem; display: flex; gap: 1.5rem; font-size: 0.875rem; }

.breadcrumb { font-size: 0.875rem; margin-bottom: 1rem; opacity: 0.9; }
.breadcrumb a { color: inherit; }

.course-navigation { padding: 2rem 0; }
.module { margin-bottom: 1.5rem; background: var(--color-bg-alt); border-radius: 8px; padding: 1.5rem; border: 1px solid var(--color-border); }
.module-title { font-size: 1.25rem; margin-bottom: 0.5rem; color: var(--color-primary-dark); }
.lesson-list { list-style: none; }
.lesson-item { margin-bottom: 0.5rem; }
.lesson-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: white;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  border: 1px solid var(--color-border);
  transition: all 0.2s;
}
.lesson-link:hover { border-color: var(--color-primary); }
.lesson-title { flex: 1; }
.lesson-duration { font-size: 0.875rem; color: #666; }
.lesson-status { width: 8px; height: 8px; border-radius: 50%; }

.lesson-content { padding: 2rem 0; }
.block { margin-bottom: 1.5rem; }

.block-question {
  background: var(--color-bg-alt);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
}

.choice-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0; cursor: pointer; }

.feedback { margin-top: 1rem; padding: 0.75rem; border-radius: 4px; font-weight: 600; }
.feedback.correct { background: #e8f5e9; color: var(--color-success); }
.feedback.incorrect { background: #ffebee; color: var(--color-error); }

.accordion-item { border: 1px solid var(--color-border); border-radius: 8px; margin-bottom: 0.5rem; }
.accordion-title { padding: 1rem; cursor: pointer; font-weight: 600; }
.accordion-content { padding: 0 1rem 1rem; }

.lesson-actions { margin-top: 2rem; text-align: center; }
.btn { padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; transition: all 0.2s; }
.btn-primary { background: var(--color-primary); color: white; }
.btn-primary:hover { background: var(--color-primary-dark); }

.lesson-footer { background: var(--color-bg-alt); padding: 1.5rem 0; border-top: 1px solid var(--color-border); }
.lesson-navigation { display: flex; justify-content: space-between; align-items: center; }
.nav-link { padding: 0.5rem 1rem; background: white; border-radius: 8px; text-decoration: none; color: inherit; border: 1px solid var(--color-border); }
.nav-home { background: var(--color-primary); color: white; border-color: var(--color-primary); }

.course-footer { background: var(--color-bg-alt); padding: 1.5rem 0; text-align: center; font-size: 0.875rem; color: #666; }
`;
}

export default xapiHandler;
