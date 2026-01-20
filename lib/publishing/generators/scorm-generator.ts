import type {
  GeneratedFile,
  PackageGenerationResult,
  ScormExportConfig,
  ValidationIssue,
  ValidationResult,
} from '@/types/studio/publishing';
import { BasePackageGenerator } from './base-generator';

// =============================================================================
// SCORM PACKAGE GENERATOR
// =============================================================================

export class ScormPackageGenerator extends BasePackageGenerator<ScormExportConfig> {
  /**
   * Generate the SCORM package.
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

      warnings.push(
        ...validation.issues.filter((i) => i.severity === 'warning').map((i) => i.message),
      );

      // Step 2: Generate manifest
      this.reportProgress(15, 'Generating imsmanifest.xml...');
      files.push(this.generateManifest());

      // Step 3: Generate SCORM API wrapper
      this.reportProgress(30, 'Generating SCORM API wrapper...');
      files.push(this.generateScormWrapper());

      // Step 4: Generate HTML player
      this.reportProgress(45, 'Generating player HTML...');
      files.push(this.generateIndexHtml());

      // Step 5: Generate lesson data
      this.reportProgress(55, 'Generating lesson data...');
      files.push(this.generateLessonData());

      // Step 6: Generate player script
      this.reportProgress(70, 'Generating player script...');
      files.push(this.generatePlayerScript());

      // Step 7: Generate styles
      this.reportProgress(80, 'Generating styles...');
      files.push(this.generatePlayerStyles());

      // Step 8: Generate schema files (for validation)
      this.reportProgress(90, 'Generating schema files...');
      if (this.config.format !== 'scorm_12') {
        files.push(...this.generateSchemaFiles());
      }

      // Step 9: Calculate stats
      this.reportProgress(95, 'Finalizing package...');
      const totalSize = this.calculateTotalSize(files);

      this.reportProgress(100, 'Package generation complete');

      return {
        success: true,
        files,
        warnings,
        manifest: {
          identifier: this.config.manifest.identifier,
          version: this.config.version,
          format: this.config.format,
        },
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
   * Validate the lesson for SCORM export.
   */
  async validate(): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];

    // Check lesson has content
    if (!this.lesson.slides || this.lesson.slides.length === 0) {
      issues.push({
        severity: 'error',
        code: 'SCORM_NO_SLIDES',
        message: 'Lesson must have at least one slide',
      });
    }

    // Check lesson has a title
    if (!this.lesson.title?.trim()) {
      issues.push({
        severity: 'error',
        code: 'SCORM_NO_TITLE',
        message: 'Lesson must have a title',
      });
    }

    // Check manifest identifier
    if (!this.config.manifest.identifier?.trim()) {
      issues.push({
        severity: 'error',
        code: 'SCORM_NO_IDENTIFIER',
        message: 'Manifest identifier is required',
      });
    }

    // Warning if no mastery score
    if (
      this.config.manifest.masteryScore === undefined ||
      this.config.manifest.masteryScore === null
    ) {
      issues.push({
        severity: 'warning',
        code: 'SCORM_NO_MASTERY',
        message: 'No mastery score specified, defaulting to 80%',
        suggestion: 'Set a mastery score in the export configuration',
      });
    }

    // Warning if mastery score is outside valid range
    if (
      this.config.manifest.masteryScore !== undefined &&
      (this.config.manifest.masteryScore < 0 || this.config.manifest.masteryScore > 100)
    ) {
      issues.push({
        severity: 'error',
        code: 'SCORM_INVALID_MASTERY',
        message: 'Mastery score must be between 0 and 100',
      });
    }

    return {
      isValid: !issues.some((i) => i.severity === 'error'),
      issues,
      errorCount: issues.filter((i) => i.severity === 'error').length,
      warningCount: issues.filter((i) => i.severity === 'warning').length,
      infoCount: issues.filter((i) => i.severity === 'info').length,
      validatedAt: new Date().toISOString(),
      format: this.config.format,
    };
  }

  /**
   * Get the package file name.
   */
  getPackageFileName(): string {
    const safeName = this.sanitizeFilename(this.lesson.title);
    const formatSuffix = this.config.format.replace(/_/g, '-');
    return `${safeName}-${formatSuffix}-${this.config.version}.zip`;
  }

  // ----------------------------------------
  // PRIVATE GENERATION METHODS
  // ----------------------------------------

  /**
   * Generate the imsmanifest.xml file.
   */
  private generateManifest(): GeneratedFile {
    if (this.config.format === 'scorm_12') {
      return this.generateScorm12Manifest();
    }
    return this.generateScorm2004Manifest();
  }

  /**
   * Generate SCORM 1.2 manifest.
   */
  private generateScorm12Manifest(): GeneratedFile {
    const { manifest } = this.config;
    const masteryScore = manifest.masteryScore ?? 80;

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${manifest.identifier}" version="1.0"
    xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
    xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                        http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">

    <metadata>
        <schema>ADL SCORM</schema>
        <schemaversion>1.2</schemaversion>
    </metadata>

    <organizations default="org-${manifest.identifier}">
        <organization identifier="org-${manifest.identifier}">
            <title>${this.escapeXml(manifest.title)}</title>
            <item identifier="${manifest.scoIdentifier}" identifierref="resource-1" isvisible="true">
                <title>${this.escapeXml(manifest.title)}</title>
                <adlcp:masteryscore>${masteryScore}</adlcp:masteryscore>
                ${manifest.maxTimeAllowed ? `<adlcp:maxtimeallowed>${manifest.maxTimeAllowed}</adlcp:maxtimeallowed>` : ''}
                ${manifest.timeLimitAction ? `<adlcp:timelimitaction>${manifest.timeLimitAction}</adlcp:timelimitaction>` : ''}
                ${manifest.launchData ? `<adlcp:datafromlms>${this.escapeXml(manifest.launchData)}</adlcp:datafromlms>` : ''}
                ${manifest.prerequisites ? `<adlcp:prerequisites type="aicc_script">${manifest.prerequisites}</adlcp:prerequisites>` : ''}
            </item>
        </organization>
    </organizations>

    <resources>
        <resource identifier="resource-1" type="webcontent" adlcp:scormtype="sco" href="index.html">
            <file href="index.html"/>
            <file href="js/scorm-wrapper.js"/>
            <file href="js/player.js"/>
            <file href="js/lesson-data.js"/>
            <file href="css/player.css"/>
        </resource>
    </resources>
</manifest>`;

    return this.createXmlFile('imsmanifest.xml', xml);
  }

  /**
   * Generate SCORM 2004 manifest.
   */
  private generateScorm2004Manifest(): GeneratedFile {
    const { manifest } = this.config;
    const masteryScore = (manifest.masteryScore ?? 80) / 100;
    const edition = this.config.format === 'scorm_2004_4th' ? '4th' : '3rd';

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${manifest.identifier}" version="1.0"
    xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
    xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p3"
    xmlns:adlseq="http://www.adlnet.org/xsd/adlseq_v1p3"
    xmlns:adlnav="http://www.adlnet.org/xsd/adlnav_v1p3"
    xmlns:imsss="http://www.imsglobal.org/xsd/imsss"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.imsglobal.org/xsd/imscp_v1p1 imscp_v1p1.xsd
                        http://www.adlnet.org/xsd/adlcp_v1p3 adlcp_v1p3.xsd
                        http://www.adlnet.org/xsd/adlseq_v1p3 adlseq_v1p3.xsd
                        http://www.adlnet.org/xsd/adlnav_v1p3 adlnav_v1p3.xsd
                        http://www.imsglobal.org/xsd/imsss imsss_v1p0.xsd">

    <metadata>
        <schema>ADL SCORM</schema>
        <schemaversion>2004 ${edition} Edition</schemaversion>
    </metadata>

    <organizations default="org-${manifest.identifier}">
        <organization identifier="org-${manifest.identifier}" structure="hierarchical">
            <title>${this.escapeXml(manifest.title)}</title>
            <item identifier="${manifest.scoIdentifier}" identifierref="resource-1" isvisible="true">
                <title>${this.escapeXml(manifest.title)}</title>
                <imsss:sequencing>
                    <imsss:deliveryControls tracked="true" completionSetByContent="true" objectiveSetByContent="true"/>
                    <imsss:objectives>
                        <imsss:primaryObjective objectiveID="primary-obj" satisfiedByMeasure="true">
                            <imsss:minNormalizedMeasure>${masteryScore}</imsss:minNormalizedMeasure>
                        </imsss:primaryObjective>
                    </imsss:objectives>
                </imsss:sequencing>
            </item>
            <imsss:sequencing>
                <imsss:controlMode choice="true" flow="true"/>
            </imsss:sequencing>
        </organization>
    </organizations>

    <resources>
        <resource identifier="resource-1" type="webcontent" adlcp:scormType="sco" href="index.html">
            <file href="index.html"/>
            <file href="js/scorm-wrapper.js"/>
            <file href="js/player.js"/>
            <file href="js/lesson-data.js"/>
            <file href="css/player.css"/>
        </resource>
    </resources>
</manifest>`;

    return this.createXmlFile('imsmanifest.xml', xml);
  }

  /**
   * Generate the SCORM API wrapper.
   */
  private generateScormWrapper(): GeneratedFile {
    const isScorm12 = this.config.format === 'scorm_12';

    const script = `/**
 * SCORM API Wrapper
 * Format: ${this.config.format}
 * Generated: ${new Date().toISOString()}
 */

(function(window) {
    'use strict';

    var SCORM = {
        version: '${isScorm12 ? '1.2' : '2004'}',
        API: null,
        initialized: false,
        terminated: false,
        errorCode: 0,

        // Find SCORM API
        findAPI: function(win) {
            var findAttempts = 0;
            var findAttemptLimit = 500;
            var API = null;

            while (!API && win.parent && win.parent !== win && findAttempts < findAttemptLimit) {
                findAttempts++;
                API = ${isScorm12 ? 'win.API' : 'win.API_1484_11'};
                if (!API) {
                    win = win.parent;
                }
            }

            if (!API && win.opener) {
                API = this.findAPI(win.opener);
            }

            return API;
        },

        // Initialize
        init: function() {
            if (this.initialized) return true;

            this.API = this.findAPI(window);

            if (!this.API) {
                console.error('SCORM API not found');
                return false;
            }

            var result = ${isScorm12 ? 'this.API.LMSInitialize("")' : 'this.API.Initialize("")'};
            this.initialized = result === 'true' || result === true;

            if (!this.initialized) {
                this.errorCode = this.getLastError();
                console.error('SCORM Initialize failed:', this.errorCode);
            }

            return this.initialized;
        },

        // Terminate
        terminate: function() {
            if (!this.initialized || this.terminated) return true;

            var result = ${isScorm12 ? 'this.API.LMSFinish("")' : 'this.API.Terminate("")'};
            this.terminated = result === 'true' || result === true;

            if (!this.terminated) {
                this.errorCode = this.getLastError();
                console.error('SCORM Terminate failed:', this.errorCode);
            }

            return this.terminated;
        },

        // Get Value
        getValue: function(element) {
            if (!this.initialized || this.terminated) return '';

            var value = ${isScorm12 ? 'this.API.LMSGetValue(element)' : 'this.API.GetValue(element)'};
            this.errorCode = this.getLastError();

            if (this.errorCode !== 0 && this.errorCode !== '0') {
                console.warn('SCORM GetValue error for', element, ':', this.errorCode);
            }

            return value;
        },

        // Set Value
        setValue: function(element, value) {
            if (!this.initialized || this.terminated) return false;

            var result = ${isScorm12 ? 'this.API.LMSSetValue(element, value)' : 'this.API.SetValue(element, value.toString())'};
            this.errorCode = this.getLastError();

            if (this.errorCode !== 0 && this.errorCode !== '0') {
                console.warn('SCORM SetValue error for', element, ':', this.errorCode);
                return false;
            }

            return result === 'true' || result === true;
        },

        // Commit
        commit: function() {
            if (!this.initialized || this.terminated) return false;

            var result = ${isScorm12 ? 'this.API.LMSCommit("")' : 'this.API.Commit("")'};
            this.errorCode = this.getLastError();

            return result === 'true' || result === true;
        },

        // Get Last Error
        getLastError: function() {
            if (!this.API) return 0;
            return ${isScorm12 ? 'this.API.LMSGetLastError()' : 'this.API.GetLastError()'};
        },

        // Get Error String
        getErrorString: function(errorCode) {
            if (!this.API) return '';
            return ${isScorm12 ? 'this.API.LMSGetErrorString(errorCode)' : 'this.API.GetErrorString(errorCode)'};
        },

        // Helper methods
        setStatus: function(status) {
            ${
              isScorm12
                ? `
            // SCORM 1.2
            this.setValue('cmi.core.lesson_status', status);
            `
                : `
            // SCORM 2004
            if (status === 'completed' || status === 'incomplete') {
                this.setValue('cmi.completion_status', status);
            } else if (status === 'passed' || status === 'failed') {
                this.setValue('cmi.success_status', status);
            }
            `
            }
        },

        setScore: function(score, max, min) {
            ${
              isScorm12
                ? `
            // SCORM 1.2
            this.setValue('cmi.core.score.raw', score);
            if (max !== undefined) this.setValue('cmi.core.score.max', max);
            if (min !== undefined) this.setValue('cmi.core.score.min', min);
            `
                : `
            // SCORM 2004
            this.setValue('cmi.score.raw', score);
            if (max !== undefined) this.setValue('cmi.score.max', max);
            if (min !== undefined) this.setValue('cmi.score.min', min);
            this.setValue('cmi.score.scaled', max > 0 ? score / max : 0);
            `
            }
        },

        setLocation: function(location) {
            ${isScorm12 ? `this.setValue('cmi.core.lesson_location', location);` : `this.setValue('cmi.location', location);`}
        },

        getLocation: function() {
            ${isScorm12 ? `return this.getValue('cmi.core.lesson_location');` : `return this.getValue('cmi.location');`}
        },

        setSessionTime: function(durationMs) {
            var duration = this.formatDuration(durationMs);
            ${isScorm12 ? `this.setValue('cmi.core.session_time', duration);` : `this.setValue('cmi.session_time', duration);`}
        },

        setSuspendData: function(data) {
            ${isScorm12 ? `this.setValue('cmi.suspend_data', data);` : `this.setValue('cmi.suspend_data', data);`}
        },

        getSuspendData: function() {
            ${isScorm12 ? `return this.getValue('cmi.suspend_data');` : `return this.getValue('cmi.suspend_data');`}
        },

        formatDuration: function(ms) {
            ${
              isScorm12
                ? `
            // SCORM 1.2 format: HHHH:MM:SS.SS
            var totalSeconds = ms / 1000;
            var hours = Math.floor(totalSeconds / 3600);
            var minutes = Math.floor((totalSeconds % 3600) / 60);
            var seconds = (totalSeconds % 60).toFixed(2);

            return String(hours).padStart(4, '0') + ':' +
                   String(minutes).padStart(2, '0') + ':' +
                   String(seconds).padStart(5, '0');
            `
                : `
            // SCORM 2004 format: PT#H#M#S
            var totalSeconds = Math.floor(ms / 1000);
            var hours = Math.floor(totalSeconds / 3600);
            var minutes = Math.floor((totalSeconds % 3600) / 60);
            var seconds = totalSeconds % 60;

            var duration = 'PT';
            if (hours > 0) duration += hours + 'H';
            if (minutes > 0) duration += minutes + 'M';
            if (seconds > 0 || duration === 'PT') duration += seconds + 'S';

            return duration;
            `
            }
        }
    };

    window.SCORM = SCORM;

})(window);
`;

    return this.createJsFile('js/scorm-wrapper.js', script);
  }

  /**
   * Generate the main index.html file.
   */
  private generateIndexHtml(): GeneratedFile {
    const html = this.generatePlayerHtml({
      title: this.lesson.title,
      scripts: ['js/scorm-wrapper.js', 'js/lesson-data.js', 'js/player.js'],
      styles: ['css/player.css'],
      bodyContent: `
    <div id="player-container">
        <div id="loading-screen">
            <div class="spinner"></div>
            <p>Loading lesson...</p>
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
        <div id="error-screen" style="display: none;">
            <h2>Error</h2>
            <p id="error-message">Unable to connect to LMS.</p>
            <button onclick="location.reload()">Try Again</button>
        </div>
    </div>`,
    });

    return this.createHtmlFile('index.html', html);
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
      settings: {
        passingScore: this.config.playerSettings.passingScore,
        completionCriteria: this.config.playerSettings.completionCriteria,
        allowBackNavigation: this.config.playerSettings.allowBackNavigation,
      },
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
 * INSPIRE SCORM Player
 * Generated: ${new Date().toISOString()}
 */

(function(window) {
    'use strict';

    var Player = {
        currentSlide: 0,
        startTime: null,
        completedSlides: [],
        score: 0,
        maxScore: 0,

        init: function() {
            var self = this;

            // Initialize SCORM
            if (!window.SCORM.init()) {
                this.showError('Unable to connect to LMS. Please try again.');
                return;
            }

            this.startTime = Date.now();

            // Try to resume from saved location
            var savedLocation = window.SCORM.getLocation();
            var resumeSlide = 0;

            if (savedLocation) {
                resumeSlide = parseInt(savedLocation, 10) || 0;
            }

            // Try to restore state
            var suspendData = window.SCORM.getSuspendData();
            if (suspendData) {
                try {
                    var state = JSON.parse(suspendData);
                    this.completedSlides = state.completedSlides || [];
                    this.score = state.score || 0;
                    this.maxScore = state.maxScore || 0;
                } catch (e) {
                    console.warn('Could not parse suspend data');
                }
            }

            // Setup event handlers
            document.getElementById('btn-prev').addEventListener('click', function() {
                self.prevSlide();
            });
            document.getElementById('btn-next').addEventListener('click', function() {
                self.nextSlide();
            });

            // Keyboard navigation
            document.addEventListener('keydown', function(e) {
                if (e.key === 'ArrowRight' || e.key === 'PageDown') {
                    self.nextSlide();
                } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                    self.prevSlide();
                }
            });

            // Handle unload
            window.addEventListener('beforeunload', function() {
                self.saveProgress();
                window.SCORM.terminate();
            });

            // Show player and render first slide
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('lesson-player').style.display = 'flex';

            this.renderSlide(resumeSlide);
        },

        renderSlide: function(index) {
            var slides = window.LESSON_DATA.slides;
            if (index < 0 || index >= slides.length) return;

            this.currentSlide = index;
            var slide = slides[index];
            var container = document.getElementById('slide-container');

            // Render slide content
            container.innerHTML = this.renderBlocks(slide.blocks);

            // Mark as completed if not already
            if (!this.completedSlides.includes(slide.id)) {
                this.completedSlides.push(slide.id);
            }

            // Update controls and save
            this.updateControls();
            this.saveProgress();
        },

        renderBlocks: function(blocks) {
            var html = '<div class="slide-content">';

            blocks.forEach(function(block) {
                html += '<div class="block block-' + block.type + '">';
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
            if (window.LESSON_DATA.settings.allowBackNavigation && this.currentSlide > 0) {
                this.renderSlide(this.currentSlide - 1);
            }
        },

        updateControls: function() {
            var slides = window.LESSON_DATA.slides;
            var prevBtn = document.getElementById('btn-prev');
            var nextBtn = document.getElementById('btn-next');
            var counter = document.getElementById('slide-counter');
            var progressFill = document.getElementById('progress-fill');

            prevBtn.disabled = !window.LESSON_DATA.settings.allowBackNavigation || this.currentSlide === 0;
            nextBtn.textContent = this.currentSlide === slides.length - 1 ? 'Finish' : 'Next';
            counter.textContent = (this.currentSlide + 1) + ' / ' + slides.length;

            var progress = ((this.currentSlide + 1) / slides.length) * 100;
            progressFill.style.width = progress + '%';
        },

        saveProgress: function() {
            var sessionTime = Date.now() - this.startTime;

            // Save location
            window.SCORM.setLocation(this.currentSlide.toString());

            // Save session time
            window.SCORM.setSessionTime(sessionTime);

            // Save state
            window.SCORM.setSuspendData(JSON.stringify({
                completedSlides: this.completedSlides,
                score: this.score,
                maxScore: this.maxScore
            }));

            // Commit
            window.SCORM.commit();
        },

        completeLesson: function() {
            var settings = window.LESSON_DATA.settings;
            var slides = window.LESSON_DATA.slides;
            var completionPercent = (this.completedSlides.length / slides.length) * 100;
            var passed = completionPercent >= settings.passingScore;

            // Set score
            window.SCORM.setScore(completionPercent, 100, 0);

            // Set status based on criteria
            if (settings.completionCriteria === 'allSlides') {
                var completed = this.completedSlides.length >= slides.length;
                window.SCORM.setStatus(completed ? 'completed' : 'incomplete');
            } else if (settings.completionCriteria === 'passingScore') {
                window.SCORM.setStatus(passed ? 'passed' : 'failed');
            } else {
                window.SCORM.setStatus(passed ? 'passed' : 'completed');
            }

            // Final commit
            window.SCORM.commit();

            alert('Lesson ' + (passed ? 'passed' : 'completed') + '! Score: ' + completionPercent.toFixed(0) + '%');
        },

        showError: function(message) {
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('error-screen').style.display = 'flex';
            document.getElementById('error-message').textContent = message;
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
 * INSPIRE SCORM Player Styles
 * Generated: ${new Date().toISOString()}
 */

:root {
    --primary-color: #0072f5;
    --background-color: #0a0a0a;
    --surface-color: #1a1a1a;
    --text-color: #ffffff;
    --text-muted: #a0a0a0;
    --border-color: #333333;
    --error-color: #ef4444;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

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

/* Loading Screen */
#loading-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--border-color);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Error Screen */
#error-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    padding: 2rem;
}

#error-screen h2 {
    color: var(--error-color);
    margin-bottom: 1rem;
}

#error-screen button {
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
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
    transition: opacity 0.2s;
}

#player-controls button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

#player-controls button:hover:not(:disabled) {
    opacity: 0.9;
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
   * Generate schema files for SCORM 2004.
   */
  private generateSchemaFiles(): GeneratedFile[] {
    // For a production implementation, you would include the actual XSD files
    // For now, we'll create placeholder comments noting they should be included
    return [];
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
