// =============================================================================
// AICC WRAPPER
// =============================================================================
// Implements AICC HACP (HTTP-based AICC Communication Protocol) for legacy
// CBT content. Provides getParam(), putParam(), and exitAU().
// =============================================================================

import type { AiccConfig, ContentWrapper, WrapperProgress, WrapperResult } from '../types';

/**
 * AICC HACP command types.
 */
type HacpCommand = 'getparam' | 'putparam' | 'exitau' | 'putinteractions' | 'putcomments';

/**
 * AICC lesson status values.
 */
type AiccLessonStatus =
  | 'passed'
  | 'complete'
  | 'failed'
  | 'incomplete'
  | 'browsed'
  | 'not attempted';

/**
 * AICC data model (subset of what HACP supports).
 */
interface AiccDataModel {
  student_id?: string;
  student_name?: string;
  lesson_location?: string;
  credit?: 'credit' | 'no-credit';
  lesson_status?: AiccLessonStatus;
  entry?: 'ab-initio' | 'resume' | '';
  score?: string;
  'score.raw'?: string;
  'score.max'?: string;
  'score.min'?: string;
  total_time?: string;
  session_time?: string;
  exit?: 'time-out' | 'suspend' | 'logout' | '';
  suspend_data?: string;
  lesson_mode?: 'browse' | 'normal' | 'review';
  core_vendor?: string;
  core_lesson?: string;
  mastery_score?: string;
  [key: string]: string | undefined;
}

/**
 * AICC error codes.
 */
const AICC_ERRORS = {
  NO_ERROR: '0',
  GENERAL_ERROR: '1',
  INVALID_ARGUMENT: '2',
  ELEMENT_NOT_FOUND: '3',
  SESSION_NOT_INITIALIZED: '4',
  COMMUNICATION_ERROR: '5',
} as const;

/**
 * AICC error code type.
 */
type AiccErrorCode = (typeof AICC_ERRORS)[keyof typeof AICC_ERRORS];

/**
 * Parse AICC HACP response (name=value pairs separated by newlines).
 */
function parseHacpResponse(response: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = response.split(/[\r\n]+/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('[')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex > 0) {
      const key = trimmed.substring(0, eqIndex).trim().toLowerCase();
      const value = trimmed.substring(eqIndex + 1).trim();
      result[key] = value;
    }
  }

  return result;
}

/**
 * Format AICC HACP request body (name=value pairs).
 */
function formatHacpRequest(data: Record<string, string | undefined>): string {
  const lines: string[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      lines.push(`${key}=${value}`);
    }
  }

  return lines.join('\r\n');
}

/**
 * Convert AICC time (HH:MM:SS or HHHH:MM:SS.SS) to seconds.
 */
function parseAiccTime(timeString: string): number {
  if (!timeString) return 0;

  const parts = timeString.split(':');
  if (parts.length < 3) return 0;

  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  const seconds = parseFloat(parts[2]) || 0;

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Convert seconds to AICC time format (HH:MM:SS).
 */
function formatAiccTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Add two AICC time values.
 */
function addAiccTimes(time1: string, time2: string): string {
  const seconds1 = parseAiccTime(time1);
  const seconds2 = parseAiccTime(time2);
  return formatAiccTime(seconds1 + seconds2);
}

/**
 * AICC HACP wrapper implementation.
 */
export class AiccWrapper implements ContentWrapper {
  readonly format = 'aicc' as const;

  private config: AiccConfig;
  private isInitialized = false;
  private isTerminated = false;
  private sessionStartTime: number = 0;
  private data: AiccDataModel = {};
  private dirty = false;
  private lastError: AiccErrorCode = AICC_ERRORS.NO_ERROR;

  constructor(config: AiccConfig) {
    this.config = config;
  }

  /**
   * Initialize the wrapper and inject AICC helper into iframe window.
   */
  async initialize(iframeWindow: Window): Promise<void> {
    // Fetch initial data from AICC server
    await this.fetchInitialData();

    // Create the AICC helper object
    const aiccHelper = this.createAiccHelper();

    // Inject AICC helper into the iframe window
    // AICC content typically looks for these methods
    (iframeWindow as Window & { AICC: typeof aiccHelper }).AICC = aiccHelper;

    // Also provide legacy API compatibility
    (iframeWindow as Window & { CMI: typeof aiccHelper }).CMI = aiccHelper;

    this.isInitialized = true;
    this.sessionStartTime = Date.now();
  }

  /**
   * Fetch initial data using HACP getParam.
   */
  private async fetchInitialData(): Promise<void> {
    try {
      const response = await this.sendHacpRequest('getparam', {});

      if (response) {
        // Parse response and populate data model
        const params = parseHacpResponse(response);

        // Map AICC params to our data model
        this.data = {
          student_id: params.student_id,
          student_name: params.student_name,
          lesson_location: params.lesson_location,
          credit: params.credit as 'credit' | 'no-credit',
          lesson_status: (params.lesson_status ?? 'not attempted') as AiccLessonStatus,
          entry: this.determineEntry(params),
          'score.raw': params.score,
          total_time: params.time || '00:00:00',
          suspend_data: params.suspend_data,
          lesson_mode: (params.lesson_mode ?? 'normal') as 'browse' | 'normal' | 'review',
          mastery_score: params.mastery_score,
        };
      }
    } catch (error) {
      // Use defaults if fetch fails
      this.data = {
        student_id: this.config.learnerId,
        lesson_status: 'not attempted',
        entry: 'ab-initio',
        total_time: '00:00:00',
      };

      if (this.config.onError) {
        this.config.onError({
          code: AICC_ERRORS.COMMUNICATION_ERROR,
          message: 'Failed to fetch AICC data',
          diagnostic: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  /**
   * Determine entry type based on existing data.
   */
  private determineEntry(params: Record<string, string>): 'ab-initio' | 'resume' | '' {
    if (params.lesson_location || params.suspend_data) {
      return 'resume';
    }
    return 'ab-initio';
  }

  /**
   * Create the AICC helper object for content.
   */
  private createAiccHelper() {
    return {
      // Core HACP methods
      getParam: (element: string) => this.getParam(element),
      putParam: (element: string, value: string) => this.putParam(element, value),
      exitAU: () => this.exitAU(),

      // Batch operations
      getAllParams: () => ({ ...this.data }),
      putAllParams: (params: Record<string, string>) => this.putAllParams(params),

      // Status methods
      getLastError: () => this.lastError,
      isInitialized: () => this.isInitialized,
    };
  }

  /**
   * Get a parameter value (HACP GetParam).
   */
  getParam(element: string): string {
    if (!this.isInitialized) {
      this.lastError = AICC_ERRORS.SESSION_NOT_INITIALIZED;
      return '';
    }

    const key = element
      .toLowerCase()
      .replace(/^cmi\.core\./, '')
      .replace(/^cmi\./, '');
    const value = this.data[key];

    if (value === undefined) {
      this.lastError = AICC_ERRORS.ELEMENT_NOT_FOUND;
      return '';
    }

    this.lastError = AICC_ERRORS.NO_ERROR;
    return value;
  }

  /**
   * Set a parameter value (HACP PutParam).
   */
  putParam(element: string, value: string): boolean {
    if (!this.isInitialized) {
      this.lastError = AICC_ERRORS.SESSION_NOT_INITIALIZED;
      return false;
    }

    if (!element) {
      this.lastError = AICC_ERRORS.INVALID_ARGUMENT;
      return false;
    }

    const key = element
      .toLowerCase()
      .replace(/^cmi\.core\./, '')
      .replace(/^cmi\./, '');

    // Validate and set the value
    if (this.validateParam(key, value)) {
      this.data[key] = value;
      this.dirty = true;
      this.lastError = AICC_ERRORS.NO_ERROR;

      // Notify progress updates for key elements
      if (key === 'lesson_status' || key === 'score' || key === 'lesson_location') {
        this.notifyProgress();
      }

      return true;
    }

    return false;
  }

  /**
   * Set multiple parameters at once.
   */
  putAllParams(params: Record<string, string>): boolean {
    let success = true;

    for (const [key, value] of Object.entries(params)) {
      if (!this.putParam(key, value)) {
        success = false;
      }
    }

    return success;
  }

  /**
   * Validate a parameter value.
   */
  private validateParam(key: string, value: string): boolean {
    // Validate lesson_status
    if (key === 'lesson_status') {
      const validStatuses = [
        'passed',
        'complete',
        'failed',
        'incomplete',
        'browsed',
        'not attempted',
      ];
      if (!validStatuses.includes(value.toLowerCase())) {
        this.lastError = AICC_ERRORS.INVALID_ARGUMENT;
        return false;
      }
    }

    // Validate score (should be numeric)
    if (key === 'score' || key === 'score.raw') {
      const numValue = parseFloat(value);
      if (Number.isNaN(numValue)) {
        this.lastError = AICC_ERRORS.INVALID_ARGUMENT;
        return false;
      }
    }

    // Validate time format
    if (key === 'session_time' || key === 'total_time') {
      if (!/^\d{2,}:\d{2}:\d{2}/.test(value)) {
        this.lastError = AICC_ERRORS.INVALID_ARGUMENT;
        return false;
      }
    }

    return true;
  }

  /**
   * Exit AU (commit and terminate).
   */
  async exitAU(): Promise<boolean> {
    if (!this.isInitialized || this.isTerminated) {
      this.lastError = AICC_ERRORS.SESSION_NOT_INITIALIZED;
      return false;
    }

    // Calculate session time
    const sessionSeconds = (Date.now() - this.sessionStartTime) / 1000;
    this.data.session_time = formatAiccTime(sessionSeconds);

    // Update total time
    const currentTotal = this.data.total_time ?? '00:00:00';
    this.data.total_time = addAiccTimes(currentTotal, this.data.session_time);

    // Send final data to server
    await this.commitToServer();

    // Notify completion
    const result = this.getResult();
    if (this.config.onComplete) {
      this.config.onComplete(result);
    }

    this.isTerminated = true;
    this.lastError = AICC_ERRORS.NO_ERROR;

    return true;
  }

  /**
   * Commit data to AICC server.
   */
  private async commitToServer(): Promise<void> {
    if (!this.dirty) return;

    try {
      // Build HACP putparam data
      const putData: Record<string, string | undefined> = {
        lesson_location: this.data.lesson_location,
        lesson_status: this.data.lesson_status,
        score: this.data['score.raw'] ?? this.data.score,
        time: this.data.session_time,
        suspend_data: this.data.suspend_data,
      };

      // Add exit if set
      if (this.data.exit) {
        putData.exit = this.data.exit;
      }

      await this.sendHacpRequest('putparam', putData);

      this.dirty = false;

      // Notify commit handler
      if (this.config.onCommit) {
        await this.config.onCommit({
          format: 'aicc',
          cmiData: this.data,
        });
      }
    } catch (error) {
      if (this.config.onError) {
        this.config.onError({
          code: AICC_ERRORS.COMMUNICATION_ERROR,
          message: 'Failed to commit AICC data',
          diagnostic: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  /**
   * Send HACP request to server.
   */
  private async sendHacpRequest(
    command: HacpCommand,
    data: Record<string, string | undefined>,
  ): Promise<string> {
    const formData = new URLSearchParams();
    formData.append('command', command);
    formData.append('session_id', this.config.sessionId);
    formData.append('aicc_data', formatHacpRequest(data));

    const response = await fetch(this.config.aiccUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new Error(`AICC server returned ${response.status}`);
    }

    return response.text();
  }

  /**
   * Terminate the wrapper.
   */
  async terminate(): Promise<void> {
    if (this.isInitialized && !this.isTerminated) {
      await this.exitAU();
    }
  }

  /**
   * Get current progress.
   */
  getProgress(): WrapperProgress {
    // Calculate progress from lesson_status
    let percent = 0;
    const status = this.data.lesson_status;

    if (status === 'complete' || status === 'passed') {
      percent = 100;
    } else if (status === 'incomplete' || status === 'browsed') {
      // Estimate from score or default to 50%
      const scoreRaw = this.data['score.raw'] ?? this.data.score;
      if (scoreRaw) {
        const scoreMax = parseFloat(this.data['score.max'] ?? '100');
        percent = Math.min(100, Math.round((parseFloat(scoreRaw) / scoreMax) * 100));
      } else {
        percent = 50;
      }
    }

    return {
      percent,
      location: this.data.lesson_location,
      suspendData: this.data.suspend_data,
      sessionTime: this.data.session_time,
      totalTime: this.data.total_time,
    };
  }

  /**
   * Get current result.
   */
  getResult(): WrapperResult {
    const status = this.data.lesson_status ?? 'not attempted';

    let resultStatus: WrapperResult['status'] = 'incomplete';
    let success: boolean | undefined;

    switch (status) {
      case 'passed':
        resultStatus = 'passed';
        success = true;
        break;
      case 'failed':
        resultStatus = 'failed';
        success = false;
        break;
      case 'complete':
        resultStatus = 'completed';
        break;
      default:
        resultStatus = 'incomplete';
        break;
    }

    const scoreRaw = this.data['score.raw'] ?? this.data.score;

    return {
      status: resultStatus,
      success,
      score: scoreRaw
        ? {
            raw: parseFloat(scoreRaw),
            min: this.data['score.min'] ? parseFloat(this.data['score.min']) : undefined,
            max: this.data['score.max'] ? parseFloat(this.data['score.max']) : undefined,
          }
        : undefined,
      totalTime: this.data.total_time,
      location: this.data.lesson_location,
      suspendData: this.data.suspend_data,
    };
  }

  /**
   * Check if content is complete.
   */
  isComplete(): boolean {
    const status = this.data.lesson_status;
    return status === 'complete' || status === 'passed';
  }

  /**
   * Force a commit.
   */
  async commit(): Promise<void> {
    await this.commitToServer();
  }

  // ==========================================================================
  // PRIVATE HELPERS
  // ==========================================================================

  private notifyProgress(): void {
    if (this.config.onProgress) {
      this.config.onProgress(this.getProgress());
    }
  }
}

/**
 * Create an AICC wrapper.
 */
export function createAiccWrapper(config: AiccConfig): AiccWrapper {
  return new AiccWrapper(config);
}
