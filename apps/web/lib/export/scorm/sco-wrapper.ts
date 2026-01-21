import type { CourseMetadata, SCORMSettings, SCORMVersion } from '../types';
import { generateAPIWrapper } from './api-wrapper';

// ============================================================================
// TYPES
// ============================================================================

export interface SCOWrapperOptions {
  /** SCO title */
  title: string;
  /** Entry point HTML file path */
  entryPoint: string;
  /** SCORM version */
  scormVersion: SCORMVersion;
  /** SCORM settings */
  settings: SCORMSettings;
  /** Course metadata */
  metadata?: CourseMetadata;
  /** Additional CSS styles */
  customStyles?: string;
  /** Additional JavaScript */
  customScripts?: string;
}

// ============================================================================
// WRAPPER GENERATOR
// ============================================================================

/**
 * Generate the SCO wrapper HTML page
 *
 * @param options - SCO wrapper options
 * @returns Complete HTML string for the SCO wrapper
 */
export function generateSCOWrapper(options: SCOWrapperOptions): string {
  const {
    title,
    entryPoint,
    scormVersion,
    settings,
    metadata,
    customStyles = '',
    customScripts = '',
  } = options;

  const apiWrapper = generateAPIWrapper(scormVersion);
  const is2004 = scormVersion.startsWith('2004');

  return `<!DOCTYPE html>
<html lang="${metadata?.language || 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(title)}</title>

  <!-- Metadata -->
  <meta name="description" content="${escapeHtml(metadata?.description || '')}">
  <meta name="author" content="${escapeHtml(metadata?.author?.name || 'LXP360')}">

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #0a0a0f;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    #loading {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
      color: #ffffff;
      z-index: 1000;
    }

    #loading.hidden {
      display: none;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 3px solid rgba(0, 212, 255, 0.2);
      border-top-color: #00d4ff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-text {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
    }

    #error {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
      color: #ffffff;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 1001;
    }

    #error.visible {
      display: flex;
    }

    .error-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(244, 67, 54, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }

    .error-icon svg {
      width: 32px;
      height: 32px;
      color: #f44336;
    }

    .error-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .error-message {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      text-align: center;
      max-width: 400px;
    }

    #content-frame {
      width: 100%;
      height: 100%;
      border: none;
      display: none;
    }

    #content-frame.visible {
      display: block;
    }

    ${customStyles}
  </style>
</head>
<body>
  <!-- Loading screen -->
  <div id="loading">
    <div class="spinner"></div>
    <div class="loading-text">Initializing learning content...</div>
  </div>

  <!-- Error screen -->
  <div id="error">
    <div class="error-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    </div>
    <div class="error-title">Unable to Initialize</div>
    <div class="error-message" id="error-message">
      This content must be launched from a Learning Management System (LMS).
    </div>
  </div>

  <!-- Content frame -->
  <iframe id="content-frame" src="about:blank"></iframe>

  <!-- SCORM API Wrapper -->
  <script>
${apiWrapper}
  </script>

  <!-- SCO Initialization -->
  <script>
    (function() {
      'use strict';

      var loadingEl = document.getElementById('loading');
      var errorEl = document.getElementById('error');
      var errorMsgEl = document.getElementById('error-message');
      var frameEl = document.getElementById('content-frame');

      var config = {
        entryPoint: '${escapeJs(entryPoint)}',
        scormVersion: '${scormVersion}',
        passingScore: ${settings.passingScore},
        timeLimit: ${settings.timeLimit},
        credit: '${settings.credit}'
      };

      function showError(message) {
        errorMsgEl.textContent = message;
        loadingEl.classList.add('hidden');
        errorEl.classList.add('visible');
      }

      function showContent() {
        loadingEl.classList.add('hidden');
        frameEl.classList.add('visible');
        frameEl.src = config.entryPoint;
      }

      function initialize() {
        // Find SCORM API
        var api = LXP360_SCORM.findAPI(window);

        if (!api) {
          showError('SCORM API not found. Please launch this content from your LMS.');
          return;
        }

        // Store API reference
        window.SCORM_API = api;

        // Initialize communication
        var success = LXP360_SCORM.initialize();

        if (!success) {
          var errorCode = LXP360_SCORM.getLastError();
          showError('Failed to initialize SCORM session. Error: ' + errorCode);
          return;
        }

        // Set initial values
        ${
          is2004
            ? `
        LXP360_SCORM.setValue('cmi.completion_status', 'incomplete');
        LXP360_SCORM.setValue('cmi.success_status', 'unknown');
        LXP360_SCORM.setValue('cmi.score.min', '0');
        LXP360_SCORM.setValue('cmi.score.max', '100');
        `
            : `
        LXP360_SCORM.setValue('cmi.core.lesson_status', 'incomplete');
        LXP360_SCORM.setValue('cmi.core.score.min', '0');
        LXP360_SCORM.setValue('cmi.core.score.max', '100');
        `
        }

        // Commit initial state
        LXP360_SCORM.commit();

        // Expose API to content frame
        window.LXP360_SCORM = LXP360_SCORM;

        // Show content
        showContent();

        // Set up unload handler
        window.addEventListener('beforeunload', function() {
          LXP360_SCORM.terminate();
        });
      }

      // Wait for DOM and initialize
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
      } else {
        initialize();
      }
    })();
  </script>

  ${customScripts}
</body>
</html>`;
}

/**
 * Generate a minimal SCO wrapper for direct embedding
 */
export function generateMinimalSCOWrapper(options: {
  title: string;
  entryPoint: string;
  scormVersion: SCORMVersion;
}): string {
  const { title, entryPoint, scormVersion } = options;
  const apiWrapper = generateAPIWrapper(scormVersion);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <style>
    html, body, iframe {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      border: none;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <script>${apiWrapper}</script>
  <script>
    (function() {
      var api = LXP360_SCORM.findAPI(window);
      if (api) {
        LXP360_SCORM.initialize();
        window.addEventListener('beforeunload', function() {
          LXP360_SCORM.terminate();
        });
      }
    })();
  </script>
  <iframe src="${escapeHtml(entryPoint)}"></iframe>
</body>
</html>`;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeJs(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}
