// =============================================================================
// SCORM 1.2 API WRAPPER
// =============================================================================
// Implements the SCORM 1.2 API specification for LMS-to-content communication.
// Provides LMSInitialize, LMSFinish, LMSGetValue, LMSSetValue, LMSCommit,
// LMSGetLastError, LMSGetErrorString, and LMSGetDiagnostic.
// =============================================================================

import type {
  ContentWrapper,
  Scorm12Config,
  Scorm12DataModel,
  Scorm12ErrorCode,
  WrapperError,
  WrapperProgress,
  WrapperResult,
} from '../types';
import { SCORM12_ERROR_CODES } from '../types';

/**
 * SCORM 1.2 Read-only elements.
 */
const READ_ONLY_ELEMENTS = new Set([
  'cmi.core._children',
  'cmi.core.student_id',
  'cmi.core.student_name',
  'cmi.core.credit',
  'cmi.core.entry',
  'cmi.core.total_time',
  'cmi.core.lesson_mode',
  'cmi.launch_data',
  'cmi.comments_from_lms',
  'cmi.student_data._children',
  'cmi.student_data.mastery_score',
  'cmi.student_data.max_time_allowed',
  'cmi.student_data.time_limit_action',
  'cmi.student_preference._children',
  'cmi.interactions._children',
  'cmi.interactions._count',
  'cmi.objectives._children',
  'cmi.objectives._count',
]);

/**
 * SCORM 1.2 Write-only elements.
 */
const WRITE_ONLY_ELEMENTS = new Set(['cmi.core.exit', 'cmi.core.session_time']);

/**
 * SCORM 1.2 error messages.
 */
const ERROR_MESSAGES: Record<Scorm12ErrorCode, string> = {
  [SCORM12_ERROR_CODES.NO_ERROR]: 'No error',
  [SCORM12_ERROR_CODES.GENERAL_EXCEPTION]: 'General exception',
  [SCORM12_ERROR_CODES.INVALID_ARGUMENT]: 'Invalid argument error',
  [SCORM12_ERROR_CODES.ELEMENT_CANNOT_HAVE_CHILDREN]: 'Element cannot have children',
  [SCORM12_ERROR_CODES.ELEMENT_NOT_AN_ARRAY]: 'Element is not an array',
  [SCORM12_ERROR_CODES.NOT_INITIALIZED]: 'Not initialized',
  [SCORM12_ERROR_CODES.NOT_IMPLEMENTED]: 'Not implemented error',
  [SCORM12_ERROR_CODES.INVALID_SET_VALUE]: 'Invalid set value',
  [SCORM12_ERROR_CODES.ELEMENT_IS_READ_ONLY]: 'Element is read only',
  [SCORM12_ERROR_CODES.ELEMENT_IS_WRITE_ONLY]: 'Element is write only',
  [SCORM12_ERROR_CODES.INCORRECT_DATA_TYPE]: 'Incorrect data type',
};

/**
 * Convert time in seconds to SCORM 1.2 timespan format (HH:MM:SS.ss).
 */
function formatScorm12Time(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toFixed(2).padStart(5, '0')}`;
}

/**
 * Parse SCORM 1.2 timespan format to seconds.
 */
function parseScorm12Time(timeString: string): number {
  const parts = timeString.split(':');
  if (parts.length !== 3) return 0;

  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  const seconds = parseFloat(parts[2]) || 0;

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Add two SCORM 1.2 time values.
 */
function addScorm12Times(time1: string, time2: string): string {
  const seconds1 = parseScorm12Time(time1);
  const seconds2 = parseScorm12Time(time2);
  return formatScorm12Time(seconds1 + seconds2);
}

/**
 * SCORM 1.2 API wrapper implementation.
 */
export class Scorm12ApiWrapper implements ContentWrapper {
  readonly format = 'scorm_12' as const;

  private config: Scorm12Config;
  private cmiData: Scorm12DataModel;
  private isInitialized = false;
  private isTerminated = false;
  private lastError: Scorm12ErrorCode = SCORM12_ERROR_CODES.NO_ERROR;
  private lastDiagnostic = '';
  private sessionStartTime: number = 0;
  private dirty = false;

  constructor(config: Scorm12Config) {
    this.config = config;
    this.cmiData = this.initializeDataModel(config.initialData);
  }

  /**
   * Initialize the CMI data model with defaults and initial data.
   */
  private initializeDataModel(initialData?: Scorm12DataModel): Scorm12DataModel {
    const defaults: Scorm12DataModel = {
      'cmi.core.student_id': this.config.learnerId,
      'cmi.core.student_name': '',
      'cmi.core.lesson_location': '',
      'cmi.core.credit': 'credit',
      'cmi.core.lesson_status': 'not attempted',
      'cmi.core.entry': initialData ? 'resume' : 'ab-initio',
      'cmi.core.score.raw': undefined,
      'cmi.core.score.max': 100,
      'cmi.core.score.min': 0,
      'cmi.core.total_time': '00:00:00',
      'cmi.core.session_time': '00:00:00',
      'cmi.core.exit': '',
      'cmi.suspend_data': '',
      'cmi.launch_data': '',
      'cmi.comments': '',
      'cmi.comments_from_lms': '',
      'cmi.objectives._count': 0,
      'cmi.interactions._count': 0,
    };

    return { ...defaults, ...initialData };
  }

  /**
   * Initialize the wrapper and inject API into iframe window.
   */
  async initialize(iframeWindow: Window): Promise<void> {
    // Create the API object
    const api = this.createApiObject();

    // Inject API into the iframe window
    // SCORM 1.2 expects the API at window.API
    (iframeWindow as Window & { API: typeof api }).API = api;

    // Also try parent frames for nested content
    try {
      let win: Window | null = iframeWindow;
      while (win && win !== win.parent) {
        (win as Window & { API: typeof api }).API = api;
        win = win.parent;
      }
    } catch {
      // Cross-origin access denied - this is expected
    }
  }

  /**
   * Create the SCORM 1.2 API object.
   */
  private createApiObject() {
    return {
      LMSInitialize: (param: string) => this.LMSInitialize(param),
      LMSFinish: (param: string) => this.LMSFinish(param),
      LMSGetValue: (element: string) => this.LMSGetValue(element),
      LMSSetValue: (element: string, value: string) => this.LMSSetValue(element, value),
      LMSCommit: (param: string) => this.LMSCommit(param),
      LMSGetLastError: () => this.LMSGetLastError(),
      LMSGetErrorString: (errorCode: string) => this.LMSGetErrorString(errorCode),
      LMSGetDiagnostic: (param: string) => this.LMSGetDiagnostic(param),
    };
  }

  /**
   * LMSInitialize - Initialize communication with LMS.
   */
  private LMSInitialize(param: string): string {
    this.lastDiagnostic = '';

    if (param !== '') {
      this.setError(
        SCORM12_ERROR_CODES.INVALID_ARGUMENT,
        'LMSInitialize expects empty string parameter',
      );
      return 'false';
    }

    if (this.isInitialized) {
      this.setError(SCORM12_ERROR_CODES.GENERAL_EXCEPTION, 'Already initialized');
      return 'false';
    }

    if (this.isTerminated) {
      this.setError(SCORM12_ERROR_CODES.GENERAL_EXCEPTION, 'Session already terminated');
      return 'false';
    }

    this.isInitialized = true;
    this.sessionStartTime = Date.now();
    this.clearError();

    return 'true';
  }

  /**
   * LMSFinish - Terminate communication with LMS.
   */
  private LMSFinish(param: string): string {
    this.lastDiagnostic = '';

    if (param !== '') {
      this.setError(
        SCORM12_ERROR_CODES.INVALID_ARGUMENT,
        'LMSFinish expects empty string parameter',
      );
      return 'false';
    }

    if (!this.isInitialized) {
      this.setError(SCORM12_ERROR_CODES.NOT_INITIALIZED, 'Not initialized');
      return 'false';
    }

    if (this.isTerminated) {
      this.setError(SCORM12_ERROR_CODES.GENERAL_EXCEPTION, 'Already terminated');
      return 'false';
    }

    // Calculate and set session time
    const sessionSeconds = (Date.now() - this.sessionStartTime) / 1000;
    this.cmiData['cmi.core.session_time'] = formatScorm12Time(sessionSeconds);

    // Update total time
    const currentTotal = this.cmiData['cmi.core.total_time'] ?? '00:00:00';
    this.cmiData['cmi.core.total_time'] = addScorm12Times(
      currentTotal,
      this.cmiData['cmi.core.session_time'] ?? '00:00:00',
    );

    // Auto-commit if dirty
    if (this.dirty) {
      this.commitData();
    }

    // Notify completion
    const result = this.getResult();
    if (this.config.onComplete) {
      this.config.onComplete(result);
    }

    this.isTerminated = true;
    this.clearError();

    return 'true';
  }

  /**
   * LMSGetValue - Get a value from the CMI data model.
   */
  private LMSGetValue(element: string): string {
    this.lastDiagnostic = '';

    if (!this.isInitialized) {
      this.setError(SCORM12_ERROR_CODES.NOT_INITIALIZED, 'Not initialized');
      return '';
    }

    if (this.isTerminated) {
      this.setError(SCORM12_ERROR_CODES.GENERAL_EXCEPTION, 'Session terminated');
      return '';
    }

    if (!element) {
      this.setError(SCORM12_ERROR_CODES.INVALID_ARGUMENT, 'Element cannot be empty');
      return '';
    }

    // Check for write-only elements
    if (WRITE_ONLY_ELEMENTS.has(element)) {
      this.setError(SCORM12_ERROR_CODES.ELEMENT_IS_WRITE_ONLY, `Element ${element} is write only`);
      return '';
    }

    // Handle _children requests
    if (element.endsWith('._children')) {
      return this.getChildren(element);
    }

    // Handle _count requests
    if (element.endsWith('._count')) {
      return this.getCount(element);
    }

    // Get the value
    const value = this.cmiData[element];
    if (value === undefined) {
      this.setError(SCORM12_ERROR_CODES.NOT_IMPLEMENTED, `Element ${element} not implemented`);
      return '';
    }

    this.clearError();
    return String(value);
  }

  /**
   * LMSSetValue - Set a value in the CMI data model.
   */
  private LMSSetValue(element: string, value: string): string {
    this.lastDiagnostic = '';

    if (!this.isInitialized) {
      this.setError(SCORM12_ERROR_CODES.NOT_INITIALIZED, 'Not initialized');
      return 'false';
    }

    if (this.isTerminated) {
      this.setError(SCORM12_ERROR_CODES.GENERAL_EXCEPTION, 'Session terminated');
      return 'false';
    }

    if (!element) {
      this.setError(SCORM12_ERROR_CODES.INVALID_ARGUMENT, 'Element cannot be empty');
      return 'false';
    }

    // Check for read-only elements
    if (READ_ONLY_ELEMENTS.has(element)) {
      this.setError(SCORM12_ERROR_CODES.ELEMENT_IS_READ_ONLY, `Element ${element} is read only`);
      return 'false';
    }

    // Validate and set the value
    const validationResult = this.validateValue(element, value);
    if (!validationResult.valid) {
      this.setError(
        validationResult.errorCode ?? SCORM12_ERROR_CODES.INVALID_SET_VALUE,
        validationResult.message ?? 'Invalid value',
      );
      return 'false';
    }

    // Handle array elements
    if (this.isArrayElement(element)) {
      this.handleArrayElement(element, value);
    } else {
      this.cmiData[element] = value;
    }

    this.dirty = true;
    this.clearError();

    // Notify progress updates for key elements
    if (
      element === 'cmi.core.lesson_status' ||
      element === 'cmi.core.score.raw' ||
      element === 'cmi.core.lesson_location'
    ) {
      this.notifyProgress();
    }

    return 'true';
  }

  /**
   * LMSCommit - Commit data to the LMS.
   */
  private LMSCommit(param: string): string {
    this.lastDiagnostic = '';

    if (param !== '') {
      this.setError(
        SCORM12_ERROR_CODES.INVALID_ARGUMENT,
        'LMSCommit expects empty string parameter',
      );
      return 'false';
    }

    if (!this.isInitialized) {
      this.setError(SCORM12_ERROR_CODES.NOT_INITIALIZED, 'Not initialized');
      return 'false';
    }

    if (this.isTerminated) {
      this.setError(SCORM12_ERROR_CODES.GENERAL_EXCEPTION, 'Session terminated');
      return 'false';
    }

    this.commitData();
    this.clearError();

    return 'true';
  }

  /**
   * LMSGetLastError - Get the last error code.
   */
  private LMSGetLastError(): string {
    return this.lastError;
  }

  /**
   * LMSGetErrorString - Get error string for error code.
   */
  private LMSGetErrorString(errorCode: string): string {
    const code = errorCode as Scorm12ErrorCode;
    return ERROR_MESSAGES[code] ?? 'Unknown error';
  }

  /**
   * LMSGetDiagnostic - Get diagnostic information.
   */
  private LMSGetDiagnostic(param: string): string {
    if (param === '') {
      return this.lastDiagnostic;
    }
    // If param is an error code, return the error string
    const code = param as Scorm12ErrorCode;
    if (ERROR_MESSAGES[code]) {
      return ERROR_MESSAGES[code];
    }
    return this.lastDiagnostic;
  }

  /**
   * Terminate the wrapper.
   */
  async terminate(): Promise<void> {
    if (this.isInitialized && !this.isTerminated) {
      this.LMSFinish('');
    }
  }

  /**
   * Get current progress.
   */
  getProgress(): WrapperProgress {
    // Calculate progress percentage from lesson_status
    let percent = 0;
    const status = this.cmiData['cmi.core.lesson_status'];
    if (status === 'completed' || status === 'passed') {
      percent = 100;
    } else if (status === 'incomplete' || status === 'browsed') {
      // Try to estimate from score or location
      const scoreRaw = this.cmiData['cmi.core.score.raw'];
      if (scoreRaw !== undefined) {
        const scoreMax = this.cmiData['cmi.core.score.max'] ?? 100;
        percent = Math.min(100, Math.round((Number(scoreRaw) / Number(scoreMax)) * 100));
      } else {
        percent = 50; // Default to 50% for incomplete
      }
    }

    return {
      percent,
      location: this.cmiData['cmi.core.lesson_location'],
      suspendData: this.cmiData['cmi.suspend_data'],
      sessionTime: this.cmiData['cmi.core.session_time'],
      totalTime: this.cmiData['cmi.core.total_time'],
    };
  }

  /**
   * Get current result.
   */
  getResult(): WrapperResult {
    const status = this.cmiData['cmi.core.lesson_status'] ?? 'not attempted';

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
      case 'completed':
        resultStatus = 'completed';
        break;
      default:
        resultStatus = 'incomplete';
        break;
    }

    return {
      status: resultStatus,
      success,
      score: {
        raw: this.cmiData['cmi.core.score.raw'] as number | undefined,
        min: this.cmiData['cmi.core.score.min'] as number | undefined,
        max: this.cmiData['cmi.core.score.max'] as number | undefined,
      },
      totalTime: this.cmiData['cmi.core.total_time'],
      location: this.cmiData['cmi.core.lesson_location'],
      suspendData: this.cmiData['cmi.suspend_data'],
    };
  }

  /**
   * Check if content is complete.
   */
  isComplete(): boolean {
    const status = this.cmiData['cmi.core.lesson_status'];
    return status === 'completed' || status === 'passed';
  }

  /**
   * Force a commit.
   */
  async commit(): Promise<void> {
    this.commitData();
  }

  // ==========================================================================
  // PRIVATE HELPERS
  // ==========================================================================

  private setError(code: Scorm12ErrorCode, diagnostic: string): void {
    this.lastError = code;
    this.lastDiagnostic = diagnostic;

    if (this.config.onError) {
      const error: WrapperError = {
        code,
        message: ERROR_MESSAGES[code] ?? 'Unknown error',
        diagnostic,
      };
      this.config.onError(error);
    }
  }

  private clearError(): void {
    this.lastError = SCORM12_ERROR_CODES.NO_ERROR;
    this.lastDiagnostic = '';
  }

  private getChildren(element: string): string {
    const base = element.replace('._children', '');

    switch (base) {
      case 'cmi.core':
        return 'student_id,student_name,lesson_location,credit,lesson_status,entry,score,total_time,exit,session_time';
      case 'cmi.core.score':
        return 'raw,max,min';
      case 'cmi.student_data':
        return 'mastery_score,max_time_allowed,time_limit_action';
      case 'cmi.student_preference':
        return 'audio,language,speed,text';
      case 'cmi.objectives':
        return 'id,score,status';
      case 'cmi.interactions':
        return 'id,objectives,time,type,correct_responses,weighting,student_response,result,latency';
      default:
        this.setError(SCORM12_ERROR_CODES.NOT_IMPLEMENTED, `Children not implemented for ${base}`);
        return '';
    }
  }

  private getCount(element: string): string {
    const base = element.replace('._count', '');
    const countKey = `${base}._count`;
    const count = this.cmiData[countKey];
    return count !== undefined ? String(count) : '0';
  }

  private isArrayElement(element: string): boolean {
    return /\.(objectives|interactions)\.\d+\./.test(element);
  }

  private handleArrayElement(element: string, value: string): void {
    // Extract array type and index
    const objectivesMatch = element.match(/cmi\.objectives\.(\d+)\./);
    const interactionsMatch = element.match(/cmi\.interactions\.(\d+)\./);

    if (objectivesMatch) {
      const index = parseInt(objectivesMatch[1], 10);
      const currentCount = (this.cmiData['cmi.objectives._count'] as number) ?? 0;
      if (index >= currentCount) {
        this.cmiData['cmi.objectives._count'] = index + 1;
      }
    }

    if (interactionsMatch) {
      const index = parseInt(interactionsMatch[1], 10);
      const currentCount = (this.cmiData['cmi.interactions._count'] as number) ?? 0;
      if (index >= currentCount) {
        this.cmiData['cmi.interactions._count'] = index + 1;
      }
    }

    this.cmiData[element] = value;
  }

  private validateValue(
    element: string,
    value: string,
  ): { valid: boolean; errorCode?: Scorm12ErrorCode; message?: string } {
    // Validate lesson_status
    if (element === 'cmi.core.lesson_status') {
      const validStatuses = [
        'passed',
        'completed',
        'failed',
        'incomplete',
        'browsed',
        'not attempted',
      ];
      if (!validStatuses.includes(value)) {
        return {
          valid: false,
          errorCode: SCORM12_ERROR_CODES.INVALID_SET_VALUE,
          message: `Invalid lesson_status: ${value}`,
        };
      }
    }

    // Validate score values
    if (element.includes('.score.')) {
      const numValue = parseFloat(value);
      if (Number.isNaN(numValue)) {
        return {
          valid: false,
          errorCode: SCORM12_ERROR_CODES.INCORRECT_DATA_TYPE,
          message: 'Score must be a number',
        };
      }
    }

    // Validate credit
    if (element === 'cmi.core.credit') {
      if (value !== 'credit' && value !== 'no-credit') {
        return {
          valid: false,
          errorCode: SCORM12_ERROR_CODES.INVALID_SET_VALUE,
          message: 'Credit must be "credit" or "no-credit"',
        };
      }
    }

    // Validate exit
    if (element === 'cmi.core.exit') {
      const validExits = ['time-out', 'suspend', 'logout', ''];
      if (!validExits.includes(value)) {
        return {
          valid: false,
          errorCode: SCORM12_ERROR_CODES.INVALID_SET_VALUE,
          message: `Invalid exit: ${value}`,
        };
      }
    }

    // Validate session_time format
    if (element === 'cmi.core.session_time') {
      if (!/^\d{2,}:\d{2}:\d{2}(\.\d+)?$/.test(value)) {
        return {
          valid: false,
          errorCode: SCORM12_ERROR_CODES.INCORRECT_DATA_TYPE,
          message: 'Invalid time format. Expected HH:MM:SS.ss',
        };
      }
    }

    return { valid: true };
  }

  private commitData(): void {
    this.dirty = false;

    if (this.config.onCommit) {
      this.config
        .onCommit({
          format: 'scorm_12',
          cmiData: { ...this.cmiData },
        })
        .catch((error) => {
          if (this.config.onError) {
            this.config.onError({
              code: SCORM12_ERROR_CODES.GENERAL_EXCEPTION,
              message: 'Commit failed',
              diagnostic: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        });
    }
  }

  private notifyProgress(): void {
    if (this.config.onProgress) {
      this.config.onProgress(this.getProgress());
    }
  }
}

/**
 * Create a SCORM 1.2 API wrapper.
 */
export function createScorm12Wrapper(config: Scorm12Config): Scorm12ApiWrapper {
  return new Scorm12ApiWrapper(config);
}
