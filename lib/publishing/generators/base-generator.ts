import type {
  ExportConfig,
  GeneratedFile,
  PackageGenerationResult,
  ValidationResult,
} from '@/types/studio/publishing';

// =============================================================================
// LESSON DATA TYPE (Simplified for generation)
// =============================================================================

/**
 * Lesson data structure for package generation.
 * This is a simplified version of the full lesson type.
 */
export interface LessonData {
  id: string;
  title: string;
  description?: string;
  version: string;
  slides: SlideData[];
  assets: AssetData[];
  metadata: {
    author?: string;
    organization?: string;
    duration?: number;
    language?: string;
    keywords?: string[];
  };
}

export interface SlideData {
  id: string;
  title: string;
  index: number;
  blocks: BlockData[];
  notes?: string;
  duration?: number;
}

export interface BlockData {
  id: string;
  type: string;
  content: unknown;
  config: unknown;
}

export interface AssetData {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  localPath?: string;
}

// =============================================================================
// PROGRESS CALLBACK TYPE
// =============================================================================

export type ProgressCallback = (progress: number, step: string) => void;

// =============================================================================
// BASE GENERATOR CLASS
// =============================================================================

/**
 * Abstract base class for package generators.
 */
export abstract class BasePackageGenerator<T extends ExportConfig = ExportConfig> {
  protected config: T;
  protected lesson: LessonData;
  protected onProgress?: ProgressCallback;

  constructor(config: T, lesson: LessonData, onProgress?: ProgressCallback) {
    this.config = config;
    this.lesson = lesson;
    this.onProgress = onProgress;
  }

  /**
   * Generate the package.
   */
  abstract generate(): Promise<PackageGenerationResult>;

  /**
   * Validate the lesson for this export format.
   */
  abstract validate(): Promise<ValidationResult>;

  /**
   * Get the package file name.
   */
  abstract getPackageFileName(): string;

  // ----------------------------------------
  // PROTECTED HELPER METHODS
  // ----------------------------------------

  /**
   * Report progress.
   */
  protected reportProgress(progress: number, step: string): void {
    this.onProgress?.(progress, step);
  }

  /**
   * Generate a unique identifier.
   */
  protected generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Sanitize a string for use in filenames.
   */
  protected sanitizeFilename(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }

  /**
   * Convert duration in milliseconds to ISO 8601 duration format.
   */
  protected msToIsoDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let duration = 'PT';
    if (hours > 0) duration += `${hours}H`;
    if (minutes > 0) duration += `${minutes}M`;
    if (seconds > 0 || duration === 'PT') duration += `${seconds}S`;

    return duration;
  }

  /**
   * Create a text file entry.
   */
  protected createTextFile(path: string, content: string, mimeType = 'text/plain'): GeneratedFile {
    return {
      path,
      content,
      mimeType,
      isBinary: false,
    };
  }

  /**
   * Create a JSON file entry.
   */
  protected createJsonFile(path: string, data: unknown): GeneratedFile {
    return {
      path,
      content: JSON.stringify(data, null, 2),
      mimeType: 'application/json',
      isBinary: false,
    };
  }

  /**
   * Create an HTML file entry.
   */
  protected createHtmlFile(path: string, content: string): GeneratedFile {
    return {
      path,
      content,
      mimeType: 'text/html',
      isBinary: false,
    };
  }

  /**
   * Create a JavaScript file entry.
   */
  protected createJsFile(path: string, content: string): GeneratedFile {
    return {
      path,
      content,
      mimeType: 'application/javascript',
      isBinary: false,
    };
  }

  /**
   * Create a CSS file entry.
   */
  protected createCssFile(path: string, content: string): GeneratedFile {
    return {
      path,
      content,
      mimeType: 'text/css',
      isBinary: false,
    };
  }

  /**
   * Create an XML file entry.
   */
  protected createXmlFile(path: string, content: string): GeneratedFile {
    return {
      path,
      content,
      mimeType: 'application/xml',
      isBinary: false,
    };
  }

  /**
   * Generate basic HTML player wrapper.
   */
  protected generatePlayerHtml(options: {
    title: string;
    scripts: string[];
    styles: string[];
    bodyContent: string;
  }): string {
    const { title, scripts, styles, bodyContent } = options;

    const scriptTags = scripts.map((src) => `<script src="${src}"></script>`).join('\n    ');

    const styleTags = styles.map((href) => `<link rel="stylesheet" href="${href}">`).join('\n    ');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHtml(title)}</title>
    ${styleTags}
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; overflow: hidden; }
        #player-container { width: 100%; height: 100%; }
    </style>
</head>
<body>
    ${bodyContent}
    ${scriptTags}
</body>
</html>`;
  }

  /**
   * Escape HTML special characters.
   */
  protected escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (char) => map[char] || char);
  }

  /**
   * Calculate total file size.
   */
  protected calculateTotalSize(files: GeneratedFile[]): number {
    return files.reduce((total, file) => {
      if (typeof file.content === 'string') {
        return total + new Blob([file.content]).size;
      }
      return total + (file.content as ArrayBuffer).byteLength;
    }, 0);
  }
}
