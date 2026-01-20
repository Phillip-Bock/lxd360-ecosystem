import type {
  GeneratedFile,
  PackageGenerationResult,
  ValidationIssue,
  ValidationResult,
  XAPIExportConfig,
} from '@/types/studio/publishing';
import { BasePackageGenerator } from './base-generator';

// =============================================================================
// XAPI PACKAGE GENERATOR
// =============================================================================

export class XAPIPackageGenerator extends BasePackageGenerator<XAPIExportConfig> {
  /**
   * Generate the xAPI package.
   */
  async generate(): Promise<PackageGenerationResult> {
    const startTime = Date.now();
    const files: GeneratedFile[] = [];
    const warnings: string[] = [];

    try {
      // Step 1: Validate
      this.reportProgress(5, 'Validating lesson data...');
      const validation = await this.validate();
      if (!validation.isValid) {
        return {
          success: false,
          files: [],
          warnings: validation.issues.filter((i) => i.severity === 'warning').map((i) => i.message),
          error: validation.issues
            .filter((i) => i.severity === 'error')
            .map((i) => i.message)
            .join('; '),
          stats: {
            totalFiles: 0,
            totalSizeBeforeOptimization: 0,
            totalSizeAfterOptimization: 0,
            generationDurationMs: Date.now() - startTime,
          },
        };
      }

      // Add warnings from validation
      warnings.push(
        ...validation.issues.filter((i) => i.severity === 'warning').map((i) => i.message),
      );

      // Step 2: Generate HTML player
      this.reportProgress(20, 'Generating player HTML...');
      files.push(this.generateIndexHtml());

      // Step 3: Generate xAPI wrapper
      this.reportProgress(35, 'Generating xAPI wrapper...');
      files.push(this.generateXAPIWrapper());

      // Step 4: Generate lesson data
      this.reportProgress(50, 'Generating lesson data...');
      files.push(this.generateLessonData());

      // Step 5: Generate player scripts
      this.reportProgress(65, 'Generating player scripts...');
      files.push(this.generatePlayerScript());

      // Step 6: Generate styles
      this.reportProgress(75, 'Generating styles...');
      files.push(this.generatePlayerStyles());

      // Step 7: Generate configuration
      this.reportProgress(85, 'Generating configuration...');
      files.push(this.generateConfig());

      // Step 8: Generate tincan.xml
      this.reportProgress(90, 'Generating tincan.xml...');
      files.push(this.generateTinCanXml());

      // Step 9: Calculate stats
      this.reportProgress(95, 'Finalizing package...');
      const totalSize = this.calculateTotalSize(files);

      this.reportProgress(100, 'Package generation complete');

      return {
        success: true,
        files,
        warnings,
        stats: {
          totalFiles: files.length,
          totalSizeBeforeOptimization: totalSize,
          totalSizeAfterOptimization: totalSize,
          generationDurationMs: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        files: [],
        warnings,
        error: error instanceof Error ? error.message : 'Unknown error',
        stats: {
          totalFiles: 0,
          totalSizeBeforeOptimization: 0,
          totalSizeAfterOptimization: 0,
          generationDurationMs: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * Validate the lesson for xAPI export.
   */
  async validate(): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];

    // Check lesson has content
    if (!this.lesson.slides || this.lesson.slides.length === 0) {
      issues.push({
        severity: 'error',
        code: 'XAPI_NO_SLIDES',
        message: 'Lesson must have at least one slide',
      });
    }

    // Check lesson has a title
    if (!this.lesson.title?.trim()) {
      issues.push({
        severity: 'error',
        code: 'XAPI_NO_TITLE',
        message: 'Lesson must have a title',
      });
    }

    // Check LRS configuration if not prompting
    if (!this.config.lrs.promptForConfig) {
      if (!this.config.lrs.endpoint) {
        issues.push({
          severity: 'error',
          code: 'XAPI_NO_LRS_ENDPOINT',
          message: 'LRS endpoint is required when not prompting for configuration',
        });
      }
    }

    // Warning if no activity ID base
    if (!this.config.lrs.activityIdBase) {
      issues.push({
        severity: 'warning',
        code: 'XAPI_NO_ACTIVITY_BASE',
        message: 'No activity ID base specified, using default',
        suggestion: 'Set a custom activity ID base for better organization',
      });
    }

    return {
      isValid: !issues.some((i) => i.severity === 'error'),
      issues,
      errorCount: issues.filter((i) => i.severity === 'error').length,
      warningCount: issues.filter((i) => i.severity === 'warning').length,
      infoCount: issues.filter((i) => i.severity === 'info').length,
      validatedAt: new Date().toISOString(),
      format: 'xapi',
    };
  }

  /**
   * Get the package file name.
   */
  getPackageFileName(): string {
    const safeName = this.sanitizeFilename(this.lesson.title);
    return `${safeName}-xapi-${this.config.version}.zip`;
  }

  // ----------------------------------------
  // PRIVATE GENERATION METHODS
  // ----------------------------------------

  /**
   * Generate the main index.html file.
   */
  private generateIndexHtml(): GeneratedFile {
    const html = this.generatePlayerHtml({
      title: this.lesson.title,
      scripts: ['js/xapi-wrapper.js', 'js/player.js', 'js/lesson-data.js'],
      styles: ['css/player.css'],
      bodyContent: `
    <div id="player-container">
        <div id="lrs-config-dialog" style="display: none;">
            <div class="dialog-content">
                <h2>Configure LRS Connection</h2>
                <form id="lrs-config-form">
                    <div class="form-group">
                        <label for="lrs-endpoint">LRS Endpoint URL:</label>
                        <input type="url" id="lrs-endpoint" required placeholder="https://lrs.example.com/xapi">
                    </div>
                    <div class="form-group">
                        <label for="lrs-auth">Authorization Header:</label>
                        <input type="text" id="lrs-auth" placeholder="Basic or Bearer token">
                    </div>
                    <div class="form-group">
                        <label for="actor-name">Your Name:</label>
                        <input type="text" id="actor-name" required placeholder="John Doe">
                    </div>
                    <div class="form-group">
                        <label for="actor-email">Your Email:</label>
                        <input type="email" id="actor-email" required placeholder="john@example.com">
                    </div>
                    <button type="submit" class="btn-primary">Start Lesson</button>
                </form>
            </div>
        </div>
        <div id="lesson-player" style="display: none;">
            <div id="slide-container"></div>
            <div id="player-controls">
                <button id="btn-prev" disabled>Previous</button>
                <span id="slide-counter">1 / 1</span>
                <button id="btn-next">Next</button>
            </div>
            <div id="progress-bar">
                <div id="progress-fill"></div>
            </div>
        </div>
    </div>`,
    });

    return this.createHtmlFile('index.html', html);
  }

  /**
   * Generate the xAPI wrapper script.
   */
  private generateXAPIWrapper(): GeneratedFile {
    const { lrs, statements } = this.config;
    const activityBase = lrs.activityIdBase || 'https://inspire.lxd360.com/activities';

    const script = `/**
 * xAPI Wrapper for INSPIRE Studio
 * Generated: ${new Date().toISOString()}
 */

(function(window) {
    'use strict';

    // Configuration
    var CONFIG = {
        activityIdBase: '${activityBase}',
        batchSize: ${statements.batchSize},
        promptForConfig: ${lrs.promptForConfig},
        defaultEndpoint: '${lrs.endpoint || ''}',
        defaultAuth: '${lrs.auth || ''}',
        trackSlides: ${statements.trackSlides},
        trackInteractions: ${statements.trackInteractions},
        trackMedia: ${statements.trackMedia}
    };

    // State
    var state = {
        initialized: false,
        endpoint: '',
        auth: '',
        actor: null,
        registration: generateUUID(),
        sessionId: generateUUID(),
        queue: [],
        isFlushing: false
    };

    // UUID Generator
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0;
            var v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Initialize xAPI
    function initialize(config) {
        state.endpoint = config.endpoint || CONFIG.defaultEndpoint;
        state.auth = config.auth || CONFIG.defaultAuth;
        state.actor = config.actor;
        state.initialized = true;

        // Send initialized statement
        sendStatement(createStatement('initialized'));

        return state;
    }

    // Create statement
    function createStatement(verb, object, result, context) {
        var stmt = {
            id: generateUUID(),
            timestamp: new Date().toISOString(),
            actor: state.actor,
            verb: getVerb(verb),
            object: object || getLessonObject(),
            context: context || getBaseContext()
        };

        if (result) {
            stmt.result = result;
        }

        return stmt;
    }

    // Get verb object
    function getVerb(verb) {
        var verbs = {
            initialized: { id: 'http://adlnet.gov/expapi/verbs/initialized', display: { 'en-US': 'initialized' } },
            launched: { id: 'http://adlnet.gov/expapi/verbs/launched', display: { 'en-US': 'launched' } },
            completed: { id: 'http://adlnet.gov/expapi/verbs/completed', display: { 'en-US': 'completed' } },
            passed: { id: 'http://adlnet.gov/expapi/verbs/passed', display: { 'en-US': 'passed' } },
            failed: { id: 'http://adlnet.gov/expapi/verbs/failed', display: { 'en-US': 'failed' } },
            terminated: { id: 'http://adlnet.gov/expapi/verbs/terminated', display: { 'en-US': 'terminated' } },
            progressed: { id: 'http://adlnet.gov/expapi/verbs/progressed', display: { 'en-US': 'progressed' } },
            experienced: { id: 'http://adlnet.gov/expapi/verbs/experienced', display: { 'en-US': 'experienced' } },
            answered: { id: 'http://adlnet.gov/expapi/verbs/answered', display: { 'en-US': 'answered' } },
            interacted: { id: 'http://adlnet.gov/expapi/verbs/interacted', display: { 'en-US': 'interacted' } }
        };
        return verbs[verb] || { id: 'http://adlnet.gov/expapi/verbs/' + verb, display: { 'en-US': verb } };
    }

    // Get lesson object
    function getLessonObject() {
        return {
            id: CONFIG.activityIdBase + '/lesson/${this.lesson.id}',
            definition: {
                type: 'http://adlnet.gov/expapi/activities/lesson',
                name: { 'en-US': '${this.escapeJs(this.lesson.title)}' },
                description: { 'en-US': '${this.escapeJs(this.lesson.description || '')}' }
            }
        };
    }

    // Get slide object
    function getSlideObject(slideId, slideName, slideIndex) {
        return {
            id: CONFIG.activityIdBase + '/lesson/${this.lesson.id}/slide/' + slideId,
            definition: {
                type: 'http://adlnet.gov/expapi/activities/module',
                name: { 'en-US': slideName },
                extensions: {
                    'https://lxd360.com/xapi/extensions/slideIndex': slideIndex
                }
            }
        };
    }

    // Get base context
    function getBaseContext() {
        return {
            registration: state.registration,
            extensions: {
                'https://lxd360.com/xapi/extensions/sessionId': state.sessionId
            }
        };
    }

    // Queue statement
    function queueStatement(statement) {
        state.queue.push(statement);

        if (state.queue.length >= CONFIG.batchSize) {
            flushQueue();
        }
    }

    // Send statement immediately
    function sendStatement(statement) {
        if (!state.initialized || !state.endpoint) {
            queueStatement(statement);
            return Promise.resolve({ success: false, reason: 'not initialized' });
        }

        return postStatements([statement]);
    }

    // Post statements to LRS
    function postStatements(statements) {
        return fetch(state.endpoint + '/statements', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Experience-API-Version': '1.0.3',
                'Authorization': state.auth
            },
            body: JSON.stringify(statements)
        })
        .then(function(response) {
            if (!response.ok) {
                throw new Error('LRS returned ' + response.status);
            }
            return response.json();
        })
        .then(function(data) {
            return { success: true, ids: data };
        })
        .catch(function(error) {
            console.error('xAPI send error:', error);
            return { success: false, error: error.message };
        });
    }

    // Flush queue
    function flushQueue() {
        if (state.isFlushing || state.queue.length === 0 || !state.initialized) {
            return Promise.resolve();
        }

        state.isFlushing = true;
        var batch = state.queue.splice(0, CONFIG.batchSize);

        return postStatements(batch)
            .finally(function() {
                state.isFlushing = false;
            });
    }

    // Track slide view
    function trackSlideViewed(slideId, slideName, slideIndex) {
        if (!CONFIG.trackSlides) return;

        var stmt = createStatement(
            'experienced',
            getSlideObject(slideId, slideName, slideIndex)
        );
        queueStatement(stmt);
    }

    // Track slide completed
    function trackSlideCompleted(slideId, slideName, slideIndex, duration) {
        if (!CONFIG.trackSlides) return;

        var stmt = createStatement(
            'completed',
            getSlideObject(slideId, slideName, slideIndex),
            { duration: formatDuration(duration), completion: true }
        );
        queueStatement(stmt);
    }

    // Track lesson completed
    function trackLessonCompleted(score, maxScore, passed, duration) {
        var stmt = createStatement(
            passed ? 'passed' : 'completed',
            getLessonObject(),
            {
                score: {
                    raw: score,
                    max: maxScore,
                    scaled: maxScore > 0 ? score / maxScore : 0
                },
                success: passed,
                completion: true,
                duration: formatDuration(duration)
            }
        );
        return sendStatement(stmt);
    }

    // Track lesson terminated
    function trackLessonTerminated(duration) {
        var stmt = createStatement(
            'terminated',
            getLessonObject(),
            { duration: formatDuration(duration) }
        );
        return sendStatement(stmt);
    }

    // Format duration to ISO 8601
    function formatDuration(ms) {
        var seconds = Math.floor(ms / 1000);
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds % 3600) / 60);
        var secs = seconds % 60;

        var duration = 'PT';
        if (hours > 0) duration += hours + 'H';
        if (minutes > 0) duration += minutes + 'M';
        if (secs > 0 || duration === 'PT') duration += secs + 'S';

        return duration;
    }

    // Escape JavaScript strings
    function escapeJs(str) {
        return str.replace(/[\\\\']/g, '\\\\$&').replace(/\\n/g, '\\\\n');
    }

    // Export API
    window.XAPI = {
        initialize: initialize,
        createStatement: createStatement,
        sendStatement: sendStatement,
        queueStatement: queueStatement,
        flushQueue: flushQueue,
        trackSlideViewed: trackSlideViewed,
        trackSlideCompleted: trackSlideCompleted,
        trackLessonCompleted: trackLessonCompleted,
        trackLessonTerminated: trackLessonTerminated,
        getState: function() { return state; },
        CONFIG: CONFIG
    };

})(window);
`;

    return this.createJsFile('js/xapi-wrapper.js', script);
  }

  /**
   * Generate the lesson data file.
   */
  private generateLessonData(): GeneratedFile {
    const lessonData = {
      id: this.lesson.id,
      title: this.lesson.title,
      description: this.lesson.description,
      version: this.lesson.version,
      slides: this.lesson.slides.map((slide) => ({
        id: slide.id,
        title: slide.title,
        index: slide.index,
        blocks: slide.blocks,
        duration: slide.duration,
      })),
      metadata: this.lesson.metadata,
    };

    const script = `/**
 * Lesson Data
 * Generated: ${new Date().toISOString()}
 */
window.LESSON_DATA = ${JSON.stringify(lessonData, null, 2)};
`;

    return this.createJsFile('js/lesson-data.js', script);
  }

  /**
   * Generate the player script.
   */
  private generatePlayerScript(): GeneratedFile {
    const script = `/**
 * INSPIRE Player
 * Generated: ${new Date().toISOString()}
 */

(function(window) {
    'use strict';

    var Player = {
        currentSlide: 0,
        startTime: null,
        slideStartTime: null,
        completedSlides: [],

        init: function() {
            var self = this;

            // Check if we need LRS config
            if (window.XAPI.CONFIG.promptForConfig) {
                this.showConfigDialog();
            } else {
                this.startLesson({
                    endpoint: window.XAPI.CONFIG.defaultEndpoint,
                    auth: window.XAPI.CONFIG.defaultAuth,
                    actor: this.getActorFromUrl() || this.createAnonymousActor()
                });
            }

            // Setup controls
            document.getElementById('btn-prev').addEventListener('click', function() {
                self.prevSlide();
            });
            document.getElementById('btn-next').addEventListener('click', function() {
                self.nextSlide();
            });

            // Setup keyboard navigation
            document.addEventListener('keydown', function(e) {
                if (e.key === 'ArrowRight' || e.key === 'PageDown') {
                    self.nextSlide();
                } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                    self.prevSlide();
                }
            });

            // Handle page unload
            window.addEventListener('beforeunload', function() {
                var duration = Date.now() - self.startTime;
                window.XAPI.trackLessonTerminated(duration);
                window.XAPI.flushQueue();
            });
        },

        showConfigDialog: function() {
            var self = this;
            var dialog = document.getElementById('lrs-config-dialog');
            var form = document.getElementById('lrs-config-form');

            dialog.style.display = 'flex';

            form.addEventListener('submit', function(e) {
                e.preventDefault();

                var config = {
                    endpoint: document.getElementById('lrs-endpoint').value,
                    auth: document.getElementById('lrs-auth').value,
                    actor: {
                        objectType: 'Agent',
                        name: document.getElementById('actor-name').value,
                        mbox: 'mailto:' + document.getElementById('actor-email').value
                    }
                };

                dialog.style.display = 'none';
                self.startLesson(config);
            });
        },

        startLesson: function(config) {
            window.XAPI.initialize(config);

            this.startTime = Date.now();
            document.getElementById('lesson-player').style.display = 'block';

            this.renderSlide(0);
        },

        renderSlide: function(index) {
            var slides = window.LESSON_DATA.slides;
            if (index < 0 || index >= slides.length) return;

            // Track previous slide completion
            if (this.slideStartTime !== null && this.currentSlide !== index) {
                var prevSlide = slides[this.currentSlide];
                var slideDuration = Date.now() - this.slideStartTime;

                if (!this.completedSlides.includes(prevSlide.id)) {
                    window.XAPI.trackSlideCompleted(
                        prevSlide.id,
                        prevSlide.title,
                        prevSlide.index,
                        slideDuration
                    );
                    this.completedSlides.push(prevSlide.id);
                }
            }

            this.currentSlide = index;
            this.slideStartTime = Date.now();

            var slide = slides[index];
            var container = document.getElementById('slide-container');

            // Render slide content
            container.innerHTML = this.renderBlocks(slide.blocks);

            // Track slide view
            window.XAPI.trackSlideViewed(slide.id, slide.title, slide.index);

            // Update controls
            this.updateControls();
        },

        renderBlocks: function(blocks) {
            var html = '<div class="slide-content">';

            blocks.forEach(function(block) {
                html += '<div class="block block-' + block.type + '" data-block-id="' + block.id + '">';
                html += Player.renderBlock(block);
                html += '</div>';
            });

            html += '</div>';
            return html;
        },

        renderBlock: function(block) {
            switch (block.type) {
                case 'text':
                    return '<div class="text-block">' + (block.content.html || '') + '</div>';
                case 'heading':
                    var level = block.config.level || 2;
                    return '<h' + level + '>' + (block.content.text || '') + '</h' + level + '>';
                case 'image':
                    return '<img src="' + (block.content.src || '') + '" alt="' + (block.content.alt || '') + '">';
                default:
                    return '<p>[' + block.type + ' block]</p>';
            }
        },

        nextSlide: function() {
            var slides = window.LESSON_DATA.slides;
            if (this.currentSlide < slides.length - 1) {
                this.renderSlide(this.currentSlide + 1);
            } else {
                this.completeLesson();
            }
        },

        prevSlide: function() {
            if (this.currentSlide > 0) {
                this.renderSlide(this.currentSlide - 1);
            }
        },

        updateControls: function() {
            var slides = window.LESSON_DATA.slides;
            var prevBtn = document.getElementById('btn-prev');
            var nextBtn = document.getElementById('btn-next');
            var counter = document.getElementById('slide-counter');
            var progressFill = document.getElementById('progress-fill');

            prevBtn.disabled = this.currentSlide === 0;
            nextBtn.textContent = this.currentSlide === slides.length - 1 ? 'Finish' : 'Next';
            counter.textContent = (this.currentSlide + 1) + ' / ' + slides.length;

            var progress = ((this.currentSlide + 1) / slides.length) * 100;
            progressFill.style.width = progress + '%';
        },

        completeLesson: function() {
            var duration = Date.now() - this.startTime;
            var score = this.completedSlides.length;
            var maxScore = window.LESSON_DATA.slides.length;
            var passed = score >= maxScore * 0.8;

            window.XAPI.trackLessonCompleted(score, maxScore, passed, duration);
            window.XAPI.flushQueue();

            alert('Lesson completed! Score: ' + score + '/' + maxScore);
        },

        getActorFromUrl: function() {
            var params = new URLSearchParams(window.location.search);
            var name = params.get('actor_name');
            var email = params.get('actor_email');

            if (name && email) {
                return {
                    objectType: 'Agent',
                    name: name,
                    mbox: 'mailto:' + email
                };
            }
            return null;
        },

        createAnonymousActor: function() {
            return {
                objectType: 'Agent',
                name: 'Anonymous Learner',
                account: {
                    homePage: window.location.origin,
                    name: 'anonymous-' + Date.now()
                }
            };
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            Player.init();
        });
    } else {
        Player.init();
    }

    window.Player = Player;

})(window);
`;

    return this.createJsFile('js/player.js', script);
  }

  /**
   * Generate player styles.
   */
  private generatePlayerStyles(): GeneratedFile {
    const css = `/**
 * INSPIRE Player Styles
 * Generated: ${new Date().toISOString()}
 */

:root {
    --primary-color: #0072f5;
    --background-color: #0a0a0a;
    --surface-color: #1a1a1a;
    --text-color: #ffffff;
    --text-muted: #a0a0a0;
    --border-color: #333333;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: var(--background-color);
    color: var(--text-color);
}

#player-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
}

/* LRS Config Dialog */
#lrs-config-dialog {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.dialog-content {
    background: var(--surface-color);
    padding: 2rem;
    border-radius: 8px;
    width: 100%;
    max-width: 400px;
}

.dialog-content h2 {
    margin-bottom: 1.5rem;
    font-size: 1.25rem;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-muted);
}

.form-group input {
    width: 100%;
    padding: 0.75rem;
    background: var(--background-color);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    color: var(--text-color);
    font-size: 1rem;
}

.form-group input:focus {
    outline: none;
    border-color: var(--primary-color);
}

.btn-primary {
    width: 100%;
    padding: 0.75rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    margin-top: 1rem;
}

.btn-primary:hover {
    opacity: 0.9;
}

/* Lesson Player */
#lesson-player {
    display: flex;
    flex-direction: column;
    height: 100%;
}

#slide-container {
    flex: 1;
    overflow-y: auto;
    padding: 2rem;
}

.slide-content {
    max-width: 800px;
    margin: 0 auto;
}

.block {
    margin-bottom: 1.5rem;
}

.text-block {
    line-height: 1.6;
}

.text-block p {
    margin-bottom: 1rem;
}

.block img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
}

/* Player Controls */
#player-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--surface-color);
    border-top: 1px solid var(--border-color);
}

#player-controls button {
    padding: 0.5rem 1.5rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
}

#player-controls button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

#slide-counter {
    color: var(--text-muted);
    font-size: 0.875rem;
    min-width: 60px;
    text-align: center;
}

/* Progress Bar */
#progress-bar {
    height: 4px;
    background: var(--border-color);
}

#progress-fill {
    height: 100%;
    background: var(--primary-color);
    width: 0;
    transition: width 0.3s ease;
}
`;

    return this.createCssFile('css/player.css', css);
  }

  /**
   * Generate configuration file.
   */
  private generateConfig(): GeneratedFile {
    return this.createJsonFile('config.json', {
      format: 'xapi',
      version: this.config.version,
      generatedAt: new Date().toISOString(),
      lesson: {
        id: this.lesson.id,
        title: this.lesson.title,
        version: this.lesson.version,
      },
      lrs: {
        activityIdBase: this.config.lrs.activityIdBase,
        promptForConfig: this.config.lrs.promptForConfig,
      },
      tracking: {
        trackSlides: this.config.statements.trackSlides,
        trackInteractions: this.config.statements.trackInteractions,
        trackMedia: this.config.statements.trackMedia,
      },
    });
  }

  /**
   * Generate tincan.xml manifest.
   */
  private generateTinCanXml(): GeneratedFile {
    const activityBase = this.config.lrs.activityIdBase || 'https://inspire.lxd360.com/activities';

    const xml = `<?xml version="1.0" encoding="utf-8"?>
<tincan xmlns="http://projecttincan.com/tincan.xsd">
    <activities>
        <activity id="${activityBase}/lesson/${this.lesson.id}" type="http://adlnet.gov/expapi/activities/lesson">
            <name lang="en-US">${this.escapeXml(this.lesson.title)}</name>
            <description lang="en-US">${this.escapeXml(this.lesson.description || '')}</description>
            <launch lang="en-US">index.html</launch>
        </activity>
    </activities>
</tincan>`;

    return this.createXmlFile('tincan.xml', xml);
  }

  // ----------------------------------------
  // UTILITY METHODS
  // ----------------------------------------

  /**
   * Escape JavaScript string.
   */
  private escapeJs(str: string): string {
    return str.replace(/[\\'"]/g, '\\$&').replace(/\n/g, '\\n');
  }

  /**
   * Escape XML special characters.
   */
  private escapeXml(str: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&apos;',
    };
    return str.replace(/[&<>"']/g, (char) => map[char] || char);
  }
}
