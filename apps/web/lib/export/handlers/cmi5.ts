/**
 * cmi5 Export Handler
 *
 * @fileoverview Generates a cmi5-compliant package
 * @module lib/export/handlers/cmi5
 *
 * cmi5 is the next-generation standard combining xAPI with LMS launch.
 * It provides standardized launch mechanisms and reporting requirements.
 */

import JSZip from 'jszip';

import type { ExportContext, ExportHandler, ExportHandlerResult, ExportLessonData } from './base';
import { createErrorResult, createSuccessResult, escapeHtml, escapeXml, generateFilename } from './base';

// ============================================================================
// CONSTANTS
// ============================================================================

const CMI5_MIME_TYPE = 'application/zip';
const CMI5_EXTENSION = 'zip';

// cmi5 defined verbs
const CMI5_VERBS = {
  launched: { id: 'http://adlnet.gov/expapi/verbs/launched', display: 'launched' },
  initialized: { id: 'http://adlnet.gov/expapi/verbs/initialized', display: 'initialized' },
  completed: { id: 'http://adlnet.gov/expapi/verbs/completed', display: 'completed' },
  passed: { id: 'http://adlnet.gov/expapi/verbs/passed', display: 'passed' },
  failed: { id: 'http://adlnet.gov/expapi/verbs/failed', display: 'failed' },
  abandoned: { id: 'https://w3id.org/xapi/adl/verbs/abandoned', display: 'abandoned' },
  waived: { id: 'https://w3id.org/xapi/adl/verbs/waived', display: 'waived' },
  terminated: { id: 'http://adlnet.gov/expapi/verbs/terminated', display: 'terminated' },
  satisfied: { id: 'https://w3id.org/xapi/adl/verbs/satisfied', display: 'satisfied' },
};

// ============================================================================
// CMI5 EXPORT HANDLER
// ============================================================================

/**
 * cmi5 package export handler
 */
export const cmi5Handler: ExportHandler = {
  format: 'cmi5',
  displayName: 'cmi5',
  mimeType: CMI5_MIME_TYPE,
  extension: CMI5_EXTENSION,

  async export(context: ExportContext): Promise<ExportHandlerResult> {
    const startTime = Date.now();

    try {
      const { courseData, settings } = context;
      const zip = new JSZip();

      let totalItems = 0;

      // Get xAPI settings (cmi5 uses xAPI)
      const xapiSettings = settings.xapi ?? {
        activityIdPrefix: 'https://lxd360.com/xapi/activities',
        verboseTracking: true,
      };

      // Add cmi5.xml course structure
      const cmi5Xml = generateCmi5Xml(courseData, xapiSettings);
      zip.file('cmi5.xml', cmi5Xml);
      totalItems++;

      // Add cmi5 AU wrapper script
      const auWrapper = generateAUWrapper(xapiSettings);
      zip.file('shared/js/cmi5-au.js', auWrapper);
      totalItems++;

      // Add styles
      const styles = generateCmi5Styles();
      zip.file('shared/css/styles.css', styles);
      totalItems++;

      // Generate AU (Assignable Unit) pages for each lesson
      for (const module of courseData.modules) {
        for (const lesson of module.lessons) {
          const auHtml = generateAUHtml(lesson, module.title, courseData, xapiSettings);
          zip.file(`au/${lesson.id}/index.html`, auHtml);
          totalItems++;
        }
      }

      // Add readme
      const readme = generateCmi5Readme(courseData);
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
        filename: generateFilename(`${courseData.title}-cmi5`, CMI5_EXTENSION),
        mimeType: CMI5_MIME_TYPE,
        stats: {
          totalItems,
          totalSize: blob.size,
          duration,
          warnings: 0,
        },
      });
    } catch (error) {
      return createErrorResult({
        error: error instanceof Error ? error.message : 'Unknown error during cmi5 export',
        errorCode: 'CMI5_EXPORT_ERROR',
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
 * Generate cmi5.xml course structure
 */
function generateCmi5Xml(
  courseData: ExportContext['courseData'],
  settings: XAPISettings,
): string {
  const courseId = `${settings.activityIdPrefix}/course/${courseData.id}`;

  // Build AU entries
  const auEntries = courseData.modules.flatMap((module) =>
    module.lessons.map((lesson) => {
      const auId = `${settings.activityIdPrefix}/au/${lesson.id}`;
      return `
      <au id="${escapeXml(auId)}">
        <title>
          <langstring lang="${courseData.language || 'en'}">${escapeXml(lesson.title)}</langstring>
        </title>
        <description>
          <langstring lang="${courseData.language || 'en'}">${escapeXml(lesson.description || '')}</langstring>
        </description>
        <url>au/${escapeXml(lesson.id)}/index.html</url>
        <launchMethod>AnyWindow</launchMethod>
        <moveOn>CompletedOrPassed</moveOn>
        <masteryScore>0.8</masteryScore>
      </au>`;
    }),
  ).join('\n');

  // Build block entries for course structure
  const blockEntries = courseData.modules
    .map((module) => {
      const blockId = `${settings.activityIdPrefix}/block/${module.id}`;
      const auRefs = module.lessons
        .map(
          (lesson) => `
        <au idref="${settings.activityIdPrefix}/au/${lesson.id}" />`,
        )
        .join('');

      return `
      <block id="${escapeXml(blockId)}">
        <title>
          <langstring lang="${courseData.language || 'en'}">${escapeXml(module.title)}</langstring>
        </title>
        <description>
          <langstring lang="${courseData.language || 'en'}">${escapeXml(module.description || '')}</langstring>
        </description>
        ${auRefs}
      </block>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<courseStructure xmlns="https://w3id.org/xapi/profiles/cmi5/v1/CourseStructure.xsd">
  <course id="${escapeXml(courseId)}">
    <title>
      <langstring lang="${courseData.language || 'en'}">${escapeXml(courseData.title)}</langstring>
    </title>
    <description>
      <langstring lang="${courseData.language || 'en'}">${escapeXml(courseData.description || '')}</langstring>
    </description>
  </course>

  ${auEntries}

  ${blockEntries}
</courseStructure>`;
}

// ============================================================================
// JAVASCRIPT GENERATORS
// ============================================================================

/**
 * Generate cmi5 AU (Assignable Unit) wrapper script
 */
function generateAUWrapper(_settings: XAPISettings): string {
  return `/**
 * LXD360 cmi5 AU Wrapper
 * Handles cmi5 launch, session management, and statement sending
 */
var Cmi5 = (function() {
  'use strict';

  var _config = {
    endpoint: null,
    fetch: null,
    actor: null,
    registration: null,
    activityId: null,
    contextTemplate: null
  };

  var _initialized = false;
  var _sessionStart = null;

  // cmi5 defined verbs
  var VERBS = ${JSON.stringify(CMI5_VERBS, null, 2)};

  /**
   * Initialize cmi5 session
   * Parses launch parameters and sends initialized statement
   */
  function initialize(callback) {
    // Parse launch URL parameters
    var params = new URLSearchParams(window.location.search);

    _config.endpoint = params.get('endpoint');
    _config.fetch = params.get('fetch');
    _config.actor = params.get('actor');
    _config.registration = params.get('registration');
    _config.activityId = params.get('activityId');

    if (!_config.endpoint || !_config.fetch) {
      console.warn('Cmi5: Missing required launch parameters. Running in demo mode.');
      if (callback) callback(false);
      return;
    }

    // Fetch auth token
    fetchAuthToken(function(success) {
      if (success) {
        _initialized = true;
        _sessionStart = new Date();

        // Send initialized statement
        sendDefinedStatement('initialized', null, function() {
          if (callback) callback(true);
        });
      } else {
        if (callback) callback(false);
      }
    });
  }

  /**
   * Fetch auth token from LMS
   */
  function fetchAuthToken(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', _config.fetch, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            var data = JSON.parse(xhr.responseText);
            _config.authToken = data['auth-token'];
            if (callback) callback(true);
          } catch (e) {
            console.error('Cmi5: Failed to parse auth token');
            if (callback) callback(false);
          }
        } else {
          console.error('Cmi5: Failed to fetch auth token');
          if (callback) callback(false);
        }
      }
    };

    xhr.send();
  }

  /**
   * Send a cmi5 defined statement
   */
  function sendDefinedStatement(verbKey, result, callback) {
    if (!_initialized && verbKey !== 'initialized') {
      console.warn('Cmi5: Not initialized');
      if (callback) callback(false);
      return;
    }

    var verb = VERBS[verbKey];
    if (!verb) {
      console.error('Cmi5: Unknown verb:', verbKey);
      if (callback) callback(false);
      return;
    }

    var statement = {
      actor: JSON.parse(_config.actor || '{}'),
      verb: {
        id: verb.id,
        display: { 'en-US': verb.display }
      },
      object: {
        id: _config.activityId,
        objectType: 'Activity'
      },
      context: {
        registration: _config.registration,
        contextActivities: {
          category: [{
            id: 'https://w3id.org/xapi/cmi5/context/categories/cmi5'
          }]
        },
        extensions: {
          'https://w3id.org/xapi/cmi5/context/extensions/sessionid': generateSessionId()
        }
      },
      timestamp: new Date().toISOString()
    };

    if (result) {
      statement.result = result;
    }

    sendStatement(statement, callback);
  }

  /**
   * Send statement to LRS
   */
  function sendStatement(statement, callback) {
    if (!_config.endpoint || !_config.authToken) {
      console.log('Cmi5: Statement (offline):', statement.verb.display['en-US']);
      if (callback) callback(true);
      return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open('POST', _config.endpoint + '/statements', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Basic ' + _config.authToken);
    xhr.setRequestHeader('X-Experience-API-Version', '1.0.3');

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          if (callback) callback(true);
        } else {
          console.error('Cmi5: Failed to send statement:', xhr.status);
          if (callback) callback(false);
        }
      }
    };

    xhr.send(JSON.stringify(statement));
  }

  /**
   * Complete the AU (passed)
   */
  function complete(score, callback) {
    var result = {
      completion: true,
      success: true,
      duration: formatDuration((new Date() - _sessionStart) / 1000)
    };

    if (score !== undefined) {
      result.score = {
        scaled: score / 100,
        raw: score,
        min: 0,
        max: 100
      };
    }

    sendDefinedStatement('completed', result, function() {
      sendDefinedStatement('passed', result, callback);
    });
  }

  /**
   * Fail the AU
   */
  function fail(score, callback) {
    var result = {
      completion: true,
      success: false,
      duration: formatDuration((new Date() - _sessionStart) / 1000)
    };

    if (score !== undefined) {
      result.score = {
        scaled: score / 100,
        raw: score,
        min: 0,
        max: 100
      };
    }

    sendDefinedStatement('failed', result, callback);
  }

  /**
   * Terminate the session
   */
  function terminate(callback) {
    var result = {
      duration: formatDuration((new Date() - _sessionStart) / 1000)
    };

    sendDefinedStatement('terminated', result, callback);
  }

  /**
   * Generate session ID
   */
  function generateSessionId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0;
      var v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
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

  // Public API
  return {
    initialize: initialize,
    complete: complete,
    fail: fail,
    terminate: terminate,
    sendStatement: sendStatement,
    VERBS: VERBS
  };
})();
`;
}

// ============================================================================
// HTML GENERATORS
// ============================================================================

/**
 * Generate AU (Assignable Unit) HTML page
 */
function generateAUHtml(
  lesson: ExportLessonData,
  moduleTitle: string,
  courseData: ExportContext['courseData'],
  _settings: XAPISettings,
): string {
  const blocksHtml = lesson.blocks
    .sort((a, b) => a.order - b.order)
    .map((block) => renderCmi5Block(block))
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
      <div class="cmi5-status" id="cmi5-status">
        <span class="status-indicator"></span>
        <span class="status-text">Initializing...</span>
      </div>
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
        <div class="progress-info">
          <span id="progress-text">Scroll to complete</span>
        </div>
        <button type="button" class="btn btn-primary" id="btn-complete" disabled>
          Complete Lesson
        </button>
      </div>
    </div>
  </footer>

  <script src="../../shared/js/cmi5-au.js"></script>
  <script>
    (function() {
      'use strict';

      var statusEl = document.getElementById('cmi5-status');
      var progressEl = document.getElementById('progress-text');
      var completeBtn = document.getElementById('btn-complete');
      var scrollProgress = 0;

      // Initialize cmi5
      Cmi5.initialize(function(success) {
        var indicator = statusEl.querySelector('.status-indicator');
        var text = statusEl.querySelector('.status-text');

        if (success) {
          indicator.classList.add('connected');
          text.textContent = 'Session Active';
        } else {
          indicator.classList.add('demo');
          text.textContent = 'Demo Mode';
        }
      });

      // Track scroll progress
      window.addEventListener('scroll', function() {
        var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollHeight > 0) {
          scrollProgress = Math.round((window.scrollY / scrollHeight) * 100);
          progressEl.textContent = scrollProgress + '% viewed';

          if (scrollProgress >= 90) {
            completeBtn.disabled = false;
          }
        }
      });

      // Complete button handler
      completeBtn.addEventListener('click', function() {
        completeBtn.disabled = true;
        completeBtn.textContent = 'Completing...';

        Cmi5.complete(100, function(success) {
          if (success) {
            completeBtn.textContent = 'Completed!';
            completeBtn.classList.add('completed');
          } else {
            completeBtn.textContent = 'Error - Try Again';
            completeBtn.disabled = false;
          }
        });
      });

      // Handle page unload
      window.addEventListener('beforeunload', function() {
        Cmi5.terminate();
      });
    })();
  </script>
</body>
</html>`;
}

/**
 * Render content block for cmi5
 */
function renderCmi5Block(block: ExportContext['courseData']['modules'][0]['lessons'][0]['blocks'][0]): string {
  const content = block.content;

  switch (block.type) {
    case 'paragraph':
      return `<div class="block"><p>${escapeHtml(String(content.text || ''))}</p></div>`;

    case 'heading':
      const level = Math.min(6, Math.max(1, Number(content.level) || 2));
      return `<div class="block"><h${level}>${escapeHtml(String(content.text || ''))}</h${level}></div>`;

    case 'image':
      return `<figure class="block block-image">
        <img src="${escapeHtml(String(content.url || ''))}" alt="${escapeHtml(String(content.alt || ''))}" loading="lazy" />
        ${content.caption ? `<figcaption>${escapeHtml(String(content.caption))}</figcaption>` : ''}
      </figure>`;

    case 'quote':
      return `<blockquote class="block">
        <p>${escapeHtml(String(content.text || ''))}</p>
        ${content.author ? `<cite>- ${escapeHtml(String(content.author))}</cite>` : ''}
      </blockquote>`;

    case 'list':
      const items = Array.isArray(content.items) ? content.items : [];
      const listItems = items.map((item) => `<li>${escapeHtml(String(item))}</li>`).join('');
      return `<div class="block">${content.ordered ? `<ol>${listItems}</ol>` : `<ul>${listItems}</ul>`}</div>`;

    case 'divider':
      return '<hr class="block" />';

    default:
      return `<div class="block"><p>[${escapeHtml(block.type)} content]</p></div>`;
  }
}

// ============================================================================
// STYLE GENERATOR
// ============================================================================

/**
 * Generate cmi5 package styles
 */
function generateCmi5Styles(): string {
  return `/* LXD360 cmi5 Package Styles */
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
body { font-family: var(--font-sans); color: var(--color-text); background: var(--color-bg); padding-bottom: 80px; }
.container { max-width: 800px; margin: 0 auto; padding: 0 1.5rem; }

.lesson-header {
  background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary));
  color: white;
  padding: 2rem 0;
}

.cmi5-status {
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

.status-indicator.connected { background: #4caf50; }
.status-indicator.demo { background: #ff9800; }

.breadcrumb { font-size: 0.875rem; opacity: 0.8; margin-bottom: 0.5rem; }
.lesson-title { font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; }
.lesson-description { opacity: 0.9; }

.lesson-content { padding: 2rem 0; }

.block { margin-bottom: 1.5rem; }
.block p { line-height: 1.8; }
.block h1, .block h2, .block h3 { color: var(--color-primary-dark); margin-top: 1.5rem; }
.block-image { text-align: center; margin: 2rem 0; }
.block-image img { max-width: 100%; border-radius: 8px; }
.block-image figcaption { font-size: 0.875rem; color: #666; margin-top: 0.5rem; }
.block blockquote { border-left: 4px solid var(--color-primary); padding-left: 1rem; font-style: italic; color: #666; }
.block blockquote cite { display: block; margin-top: 0.5rem; font-size: 0.875rem; }
.block ul, .block ol { padding-left: 1.5rem; }

.lesson-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid var(--color-border);
  padding: 1rem;
}

.progress-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 800px;
  margin: 0 auto;
}

.progress-info { color: #666; }

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
`;
}

/**
 * Generate cmi5 package readme
 */
function generateCmi5Readme(courseData: ExportContext['courseData']): string {
  return `LXD360 cmi5 Package
===================

Course: ${courseData.title}
Version: ${courseData.version || '1.0'}
Generated: ${new Date().toISOString()}

About cmi5
----------
cmi5 is the next-generation e-learning standard that combines the flexibility of
xAPI with the interoperability of traditional SCORM. It provides:

- Standardized launch mechanism
- Required xAPI statement structure
- Interoperability between LMS platforms
- Detailed learner analytics via xAPI

Package Contents
----------------
- cmi5.xml: Course structure definition
- au/: Assignable Units (lesson content)
- shared/: Shared resources (scripts, styles)

Installation
------------
1. Upload this package to a cmi5-compliant LMS
2. The LMS will parse cmi5.xml and register the course
3. Assign the course to learners

Requirements
------------
- cmi5-compliant LMS (LMS must support the cmi5 launch mechanism)
- xAPI LRS for statement storage

Technical Notes
---------------
- Each lesson is an Assignable Unit (AU)
- AUs use CompletedOrPassed move-on criteria
- Mastery score is set to 80%

Support
-------
For technical support, contact support@lxd360.com

Generated by LXD360 INSPIRE Studio
`;
}

export default cmi5Handler;
