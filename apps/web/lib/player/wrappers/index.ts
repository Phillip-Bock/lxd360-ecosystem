// =============================================================================
// CONTENT WRAPPER EXPORTS
// =============================================================================
// Unified export for all content format wrappers with factory function.
// =============================================================================

// Export types
export type {
  AiccConfig,
  Cmi5Config,
  ContentFormat,
  ContentManifest,
  ContentWrapper,
  Html5Config,
  NativeConfig,
  PdfConfig,
  Scorm12Config,
  Scorm12DataModel,
  Scorm2004Config,
  Scorm2004DataModel,
  Scorm2004Edition,
  WrapperCommitData,
  WrapperConfig,
  WrapperConfigBase,
  WrapperError,
  WrapperProgress,
  WrapperResult,
  XApiActivity,
  XApiActor,
  XApiConfig,
  XApiContext,
  XApiResult,
  XApiStatement,
  XApiVerb,
} from '../types';
export { AiccWrapper, createAiccWrapper } from './aicc-wrapper';
export type { Cmi5LaunchMode, Cmi5MoveOn } from './cmi5-wrapper';
export { CMI5_VERBS, Cmi5Wrapper, createCmi5Wrapper } from './cmi5-wrapper';
// Export individual wrappers
export { createScorm12Wrapper, Scorm12ApiWrapper } from './scorm12-api';
export { createScorm2004Wrapper, Scorm2004ApiWrapper } from './scorm2004-api';
export { createXApiWrapper, XAPI_VERBS, XApiWrapper } from './xapi-wrapper';

import type {
  AiccConfig,
  Cmi5Config,
  ContentFormat,
  ContentWrapper,
  Html5Config,
  NativeConfig,
  PdfConfig,
  Scorm12Config,
  Scorm2004Config,
  WrapperConfig,
  WrapperProgress,
  WrapperResult,
  XApiConfig,
} from '../types';
import { createAiccWrapper } from './aicc-wrapper';
import { createCmi5Wrapper } from './cmi5-wrapper';
import { createScorm12Wrapper } from './scorm12-api';
import { createScorm2004Wrapper } from './scorm2004-api';
import { createXApiWrapper } from './xapi-wrapper';

// =============================================================================
// HTML5 WRAPPER (Simple passthrough)
// =============================================================================

/**
 * HTML5 wrapper - Simple passthrough wrapper for HTML5 content.
 * Tracks basic progress but doesn't require API injection.
 */
class Html5Wrapper implements ContentWrapper {
  readonly format = 'html5' as const;

  private config: Html5Config;
  private isInitialized = false;
  private isTerminated = false;
  private sessionStartTime = 0;
  private progress = 0;

  constructor(config: Html5Config) {
    this.config = config;
  }

  async initialize(_iframeWindow: Window): Promise<void> {
    this.isInitialized = true;
    this.sessionStartTime = Date.now();
  }

  async terminate(): Promise<void> {
    if (!this.isInitialized || this.isTerminated) return;

    this.isTerminated = true;

    if (this.config.onComplete) {
      this.config.onComplete(this.getResult());
    }
  }

  getProgress(): WrapperProgress {
    const sessionSeconds = this.isInitialized ? (Date.now() - this.sessionStartTime) / 1000 : 0;

    return {
      percent: this.progress,
      sessionTime: `PT${Math.round(sessionSeconds)}S`,
    };
  }

  getResult(): WrapperResult {
    return {
      status: this.progress >= 100 ? 'completed' : 'incomplete',
      totalTime: `PT${Math.round((Date.now() - this.sessionStartTime) / 1000)}S`,
    };
  }

  isComplete(): boolean {
    return this.progress >= 100;
  }

  async commit(): Promise<void> {
    if (this.config.onCommit) {
      await this.config.onCommit({ format: 'html5' });
    }
  }

  /**
   * Update progress from external source (e.g., scroll tracking).
   */
  updateProgress(percent: number): void {
    this.progress = Math.max(0, Math.min(100, percent));
    if (this.config.onProgress) {
      this.config.onProgress(this.getProgress());
    }
  }

  /**
   * Mark as complete.
   */
  markComplete(): void {
    this.progress = 100;
    if (this.config.onProgress) {
      this.config.onProgress(this.getProgress());
    }
    if (this.config.onComplete) {
      this.config.onComplete(this.getResult());
    }
  }
}

// =============================================================================
// PDF WRAPPER (Simple passthrough)
// =============================================================================

/**
 * PDF wrapper - Simple wrapper for PDF content.
 * Tracks page-based progress.
 */
class PdfWrapper implements ContentWrapper {
  readonly format = 'pdf' as const;

  private config: PdfConfig;
  private isInitialized = false;
  private isTerminated = false;
  private sessionStartTime = 0;
  private currentPage = 1;
  private totalPages = 1;
  private viewedPages = new Set<number>();

  constructor(config: PdfConfig) {
    this.config = config;
  }

  async initialize(_iframeWindow: Window): Promise<void> {
    this.isInitialized = true;
    this.sessionStartTime = Date.now();
  }

  async terminate(): Promise<void> {
    if (!this.isInitialized || this.isTerminated) return;

    this.isTerminated = true;

    if (this.config.onComplete) {
      this.config.onComplete(this.getResult());
    }
  }

  getProgress(): WrapperProgress {
    const sessionSeconds = this.isInitialized ? (Date.now() - this.sessionStartTime) / 1000 : 0;

    const percent =
      this.totalPages > 0 ? Math.round((this.viewedPages.size / this.totalPages) * 100) : 0;

    return {
      percent,
      location: `page:${this.currentPage}/${this.totalPages}`,
      sessionTime: `PT${Math.round(sessionSeconds)}S`,
    };
  }

  getResult(): WrapperResult {
    const progress = this.getProgress();
    return {
      status: progress.percent >= 100 ? 'completed' : 'incomplete',
      location: progress.location,
      totalTime: `PT${Math.round((Date.now() - this.sessionStartTime) / 1000)}S`,
    };
  }

  isComplete(): boolean {
    return this.viewedPages.size >= this.totalPages;
  }

  async commit(): Promise<void> {
    if (this.config.onCommit) {
      await this.config.onCommit({ format: 'pdf' });
    }
  }

  /**
   * Set total pages (called when PDF loads).
   */
  setTotalPages(total: number): void {
    this.totalPages = total;
  }

  /**
   * Update current page and mark as viewed.
   */
  setCurrentPage(page: number): void {
    this.currentPage = page;
    this.viewedPages.add(page);

    if (this.config.onProgress) {
      this.config.onProgress(this.getProgress());
    }

    if (this.isComplete() && this.config.onComplete) {
      this.config.onComplete(this.getResult());
    }
  }
}

// =============================================================================
// NATIVE WRAPPER (INSPIRE content)
// =============================================================================

/**
 * Native wrapper - Wrapper for INSPIRE native content.
 * Communicates directly with the player state machine.
 */
class NativeWrapper implements ContentWrapper {
  readonly format = 'native' as const;

  private config: NativeConfig;
  private isInitialized = false;
  private isTerminated = false;
  private sessionStartTime = 0;
  private progress = 0;
  private location = '';
  private suspendData = '';
  private isCompleted = false;

  constructor(config: NativeConfig) {
    this.config = config;
  }

  async initialize(_iframeWindow: Window): Promise<void> {
    this.isInitialized = true;
    this.sessionStartTime = Date.now();
  }

  async terminate(): Promise<void> {
    if (!this.isInitialized || this.isTerminated) return;

    this.isTerminated = true;

    if (this.config.onCommit) {
      await this.config.onCommit({
        format: 'native',
        stateData: {
          progress: this.progress,
          location: this.location,
          suspendData: this.suspendData,
        },
      });
    }

    if (this.config.onComplete) {
      this.config.onComplete(this.getResult());
    }
  }

  getProgress(): WrapperProgress {
    const sessionSeconds = this.isInitialized ? (Date.now() - this.sessionStartTime) / 1000 : 0;

    return {
      percent: this.progress,
      location: this.location || undefined,
      suspendData: this.suspendData || undefined,
      sessionTime: `PT${Math.round(sessionSeconds)}S`,
    };
  }

  getResult(): WrapperResult {
    return {
      status: this.isCompleted ? 'completed' : 'incomplete',
      location: this.location || undefined,
      suspendData: this.suspendData || undefined,
      totalTime: `PT${Math.round((Date.now() - this.sessionStartTime) / 1000)}S`,
    };
  }

  isComplete(): boolean {
    return this.isCompleted;
  }

  async commit(): Promise<void> {
    if (this.config.onCommit) {
      await this.config.onCommit({
        format: 'native',
        stateData: {
          progress: this.progress,
          location: this.location,
          suspendData: this.suspendData,
        },
      });
    }
  }

  /**
   * Update progress.
   */
  updateProgress(percent: number): void {
    this.progress = Math.max(0, Math.min(100, percent));
    if (this.config.onProgress) {
      this.config.onProgress(this.getProgress());
    }
  }

  /**
   * Set location/bookmark.
   */
  setLocation(location: string): void {
    this.location = location;
  }

  /**
   * Set suspend data.
   */
  setSuspendData(data: string): void {
    this.suspendData = data;
  }

  /**
   * Mark as complete.
   */
  markComplete(): void {
    this.isCompleted = true;
    this.progress = 100;

    if (this.config.onProgress) {
      this.config.onProgress(this.getProgress());
    }
    if (this.config.onComplete) {
      this.config.onComplete(this.getResult());
    }
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a content wrapper for the specified format.
 * @param format - Content format
 * @param config - Wrapper configuration
 * @returns Content wrapper instance
 */
export function createWrapper(format: ContentFormat, config: WrapperConfig): ContentWrapper {
  switch (format) {
    case 'scorm_12':
      return createScorm12Wrapper(config as Scorm12Config);

    case 'scorm_2004':
      return createScorm2004Wrapper(config as Scorm2004Config);

    case 'xapi':
      return createXApiWrapper(config as XApiConfig);

    case 'cmi5':
      return createCmi5Wrapper(config as Cmi5Config);

    case 'aicc':
      return createAiccWrapper(config as AiccConfig);

    case 'html5':
      return new Html5Wrapper(config as Html5Config);

    case 'pdf':
      return new PdfWrapper(config as PdfConfig);

    case 'native':
      return new NativeWrapper(config as NativeConfig);

    default: {
      // Exhaustive check - if we get here, we've missed a format
      const exhaustiveCheck: never = format;
      throw new Error(`Unsupported content format: ${exhaustiveCheck}`);
    }
  }
}

/**
 * Type guard to check if wrapper is HTML5 wrapper.
 */
export function isHtml5Wrapper(wrapper: ContentWrapper): wrapper is Html5Wrapper {
  return wrapper.format === 'html5';
}

/**
 * Type guard to check if wrapper is PDF wrapper.
 */
export function isPdfWrapper(wrapper: ContentWrapper): wrapper is PdfWrapper {
  return wrapper.format === 'pdf';
}

/**
 * Type guard to check if wrapper is Native wrapper.
 */
export function isNativeWrapper(wrapper: ContentWrapper): wrapper is NativeWrapper {
  return wrapper.format === 'native';
}

// Export the wrapper classes for direct usage
export { Html5Wrapper, PdfWrapper, NativeWrapper };
