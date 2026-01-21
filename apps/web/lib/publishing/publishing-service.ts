import type {
  ExportConfig,
  ExportFormat,
  PackageGenerationResult,
  PublishingJob,
  PublishingStatus,
  ScormExportConfig,
  ValidationResult,
  XAPIExportConfig,
} from '@/types/studio/publishing';
import {
  type LessonData,
  type ProgressCallback,
  ScormPackageGenerator,
  XAPIPackageGenerator,
} from './generators';

// =============================================================================
// PUBLISHING SERVICE
// =============================================================================

/**
 * Callbacks for publishing events.
 */
export interface PublishingCallbacks {
  onProgress?: (progress: number, step: string) => void;
  onStatusChange?: (status: PublishingStatus) => void;
  onComplete?: (result: PackageGenerationResult) => void;
  onError?: (error: string) => void;
}

/**
 * Publishing service for generating lesson packages.
 */
export class PublishingService {
  private jobs: Map<string, PublishingJob> = new Map();

  /**
   * Start a new publishing job.
   */
  async publish(
    config: ExportConfig,
    lesson: LessonData,
    callbacks?: PublishingCallbacks,
  ): Promise<PublishingJob> {
    const job: PublishingJob = {
      id: this.generateJobId(),
      config,
      status: 'pending',
      progress: 0,
      currentStep: 'Initializing...',
      startedAt: new Date().toISOString(),
      warnings: [],
      downloadCount: 0,
    };

    this.jobs.set(job.id, job);

    // Start async generation
    this.executeJob(job, lesson, callbacks);

    return job;
  }

  /**
   * Get a job by ID.
   */
  getJob(jobId: string): PublishingJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Cancel a running job.
   */
  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job || job.status === 'completed' || job.status === 'failed') {
      return false;
    }

    job.status = 'cancelled';
    job.completedAt = new Date().toISOString();
    return true;
  }

  /**
   * Validate a lesson for a specific export format.
   */
  async validate(config: ExportConfig, lesson: LessonData): Promise<ValidationResult> {
    const generator = this.createGenerator(config, lesson);
    return generator.validate();
  }

  /**
   * Get the expected file name for a package.
   */
  getPackageFileName(config: ExportConfig, lesson: LessonData): string {
    const generator = this.createGenerator(config, lesson);
    return generator.getPackageFileName();
  }

  // ----------------------------------------
  // PRIVATE METHODS
  // ----------------------------------------

  /**
   * Execute a publishing job.
   */
  private async executeJob(
    job: PublishingJob,
    lesson: LessonData,
    callbacks?: PublishingCallbacks,
  ): Promise<void> {
    const updateProgress: ProgressCallback = (progress, step) => {
      job.progress = progress;
      job.currentStep = step;
      callbacks?.onProgress?.(progress, step);
    };

    const updateStatus = (status: PublishingStatus) => {
      job.status = status;
      callbacks?.onStatusChange?.(status);
    };

    try {
      // Step 1: Validate
      updateStatus('validating');
      updateProgress(5, 'Validating lesson...');

      const validation = await this.validate(job.config, lesson);
      if (!validation.isValid) {
        job.status = 'failed';
        job.error = validation.issues
          .filter((i) => i.severity === 'error')
          .map((i) => i.message)
          .join('; ');
        job.completedAt = new Date().toISOString();
        callbacks?.onError?.(job.error);
        return;
      }

      // Add warnings
      job.warnings.push(
        ...validation.issues.filter((i) => i.severity === 'warning').map((i) => i.message),
      );

      // Step 2: Generate
      updateStatus('generating');
      updateProgress(15, 'Generating package...');

      const generator = this.createGenerator(job.config, lesson, updateProgress);
      const result = await generator.generate();

      if (!result.success) {
        job.status = 'failed';
        job.error = result.error;
        job.completedAt = new Date().toISOString();
        callbacks?.onError?.(result.error || 'Generation failed');
        return;
      }

      // Add any generation warnings
      job.warnings.push(...result.warnings);

      // Step 3: Optimize (if needed)
      if (this.shouldOptimize(job.config)) {
        updateStatus('optimizing');
        updateProgress(70, 'Optimizing package...');
        // Optimization would happen here
      }

      // Step 4: Package into ZIP
      updateStatus('packaging');
      updateProgress(85, 'Creating ZIP archive...');

      const packageData = await this.createZipPackage(result);

      // Step 5: Upload/Store
      updateStatus('uploading');
      updateProgress(95, 'Finalizing...');

      // In a real implementation, this would upload to storage
      // For now, we'll create a blob URL
      const blob = new Blob([packageData], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);

      job.outputUrl = url;
      job.outputSize = packageData.byteLength;

      // Complete
      updateStatus('completed');
      updateProgress(100, 'Complete');
      job.completedAt = new Date().toISOString();

      callbacks?.onComplete?.(result);
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.completedAt = new Date().toISOString();
      callbacks?.onError?.(job.error);
    }
  }

  /**
   * Create the appropriate generator for the export format.
   */
  private createGenerator(config: ExportConfig, lesson: LessonData, onProgress?: ProgressCallback) {
    switch (config.format) {
      case 'scorm_12':
      case 'scorm_2004_3rd':
      case 'scorm_2004_4th':
        return new ScormPackageGenerator(config as ScormExportConfig, lesson, onProgress);

      case 'xapi':
        return new XAPIPackageGenerator(config as XAPIExportConfig, lesson, onProgress);

      case 'cmi5':
        // For now, fall back to xAPI generator with cmi5 adaptations
        throw new Error('cmi5 export not yet implemented');

      case 'html5':
        // Would use HTML5PackageGenerator
        throw new Error('HTML5 export not yet implemented');

      case 'pdf':
        throw new Error('PDF export not yet implemented');

      case 'video':
        throw new Error('Video export not yet implemented');

      default: {
        const _exhaustiveCheck: never = config;
        throw new Error(`Unsupported export format: ${(_exhaustiveCheck as ExportConfig).format}`);
      }
    }
  }

  /**
   * Check if optimization should be applied.
   */
  private shouldOptimize(config: ExportConfig): boolean {
    if ('optimization' in config) {
      const opt = config.optimization;
      return opt.compressImages || opt.minifyJs || opt.minifyCss;
    }
    return false;
  }

  /**
   * Create a ZIP package from generated files.
   */
  private async createZipPackage(result: PackageGenerationResult): Promise<ArrayBuffer> {
    // Use JSZip to create the archive
    // Note: JSZip would need to be installed as a dependency
    // For now, we'll create a simple implementation

    // In a real implementation:
    // const zip = new JSZip();
    // for (const file of result.files) {
    //   zip.file(file.path, file.content);
    // }
    // return zip.generateAsync({ type: 'arraybuffer' });

    // Placeholder - in production, use JSZip
    const encoder = new TextEncoder();
    const combinedContent = result.files
      .map((f) => (typeof f.content === 'string' ? f.content : '[binary content]'))
      .join('\n');

    return encoder.encode(combinedContent).buffer;
  }

  /**
   * Generate a unique job ID.
   */
  private generateJobId(): string {
    return `pub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let serviceInstance: PublishingService | null = null;

/**
 * Get the publishing service singleton.
 */
export function getPublishingService(): PublishingService {
  if (!serviceInstance) {
    serviceInstance = new PublishingService();
  }
  return serviceInstance;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Create default export configuration for a format.
 */
export function createDefaultConfig(format: ExportFormat, lesson: LessonData): ExportConfig {
  const baseConfig = {
    id: `export_${Date.now()}`,
    lessonId: lesson.id,
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    createdBy: 'system',
  };

  switch (format) {
    case 'scorm_12':
    case 'scorm_2004_3rd':
    case 'scorm_2004_4th':
      return {
        ...baseConfig,
        format,
        manifest: {
          identifier: `course_${lesson.id}`,
          title: lesson.title,
          description: lesson.description,
          scoIdentifier: 'SCO001',
          masteryScore: 80,
        },
        playerSettings: {
          autoAdvance: false,
          allowBackNavigation: true,
          showNavigation: true,
          showProgress: true,
          enableKeyboardNav: true,
          completionCriteria: 'allSlides',
          passingScore: 80,
        },
        optimization: {
          compressImages: true,
          imageQuality: 85,
          minifyJs: true,
          minifyCss: true,
          includeSourceMaps: false,
        },
      } as ScormExportConfig;

    case 'xapi':
      return {
        ...baseConfig,
        format: 'xapi',
        lrs: {
          promptForConfig: true,
          activityIdBase: 'https://inspire.lxd360.com/activities',
        },
        statements: {
          includeExtendedVerbs: true,
          trackSlides: true,
          trackInteractions: true,
          trackMedia: true,
          batchSize: 10,
        },
        playerSettings: {
          autoAdvance: false,
          allowBackNavigation: true,
          showNavigation: true,
          showProgress: true,
          enableKeyboardNav: true,
          completionCriteria: 'allSlides',
          passingScore: 80,
        },
        optimization: {
          compressImages: true,
          imageQuality: 85,
          minifyJs: true,
          minifyCss: true,
          includeSourceMaps: false,
        },
      } as XAPIExportConfig;

    default:
      throw new Error(`Cannot create default config for format: ${format}`);
  }
}

/**
 * Estimate package size based on lesson content.
 */
export function estimatePackageSize(lesson: LessonData): {
  estimatedBytes: number;
  breakdown: {
    html: number;
    scripts: number;
    styles: number;
    assets: number;
  };
} {
  // Base player size (HTML, JS, CSS)
  const baseSize = 50 * 1024; // ~50KB for player code

  // Estimate content size
  const contentSize = JSON.stringify(lesson.slides).length;

  // Asset size
  const assetSize = lesson.assets.reduce((sum, asset) => sum + asset.size, 0);

  return {
    estimatedBytes: baseSize + contentSize + assetSize,
    breakdown: {
      html: 10 * 1024,
      scripts: 30 * 1024,
      styles: 10 * 1024,
      assets: assetSize,
    },
  };
}
