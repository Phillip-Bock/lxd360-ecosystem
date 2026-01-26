// =============================================================================
// SCORM 2004 API WRAPPER
// =============================================================================
// Implements the SCORM 2004 API specification for LMS-to-content communication.
// Supports 2nd, 3rd, and 4th edition detection.
// Provides Initialize, Terminate, GetValue, SetValue, Commit,
// GetLastError, GetErrorString, and GetDiagnostic.
// =============================================================================

import type {
  ContentWrapper,
  Scorm2004Config,
  Scorm2004DataModel,
  Scorm2004Edition,
  Scorm2004ErrorCode,
  WrapperError,
  WrapperProgress,
  WrapperResult,
} from '../types';
import { SCORM2004_ERROR_CODES } from '../types';

/**
 * SCORM 2004 Read-only elements.
 */
const READ_ONLY_ELEMENTS = new Set([
  'cmi._version',
  'cmi.completion_threshold',
  'cmi.credit',
  'cmi.entry',
  'cmi.launch_data',
  'cmi.learner_id',
  'cmi.learner_name',
  'cmi.max_time_allowed',
  'cmi.mode',
  'cmi.scaled_passing_score',
  'cmi.time_limit_action',
  'cmi.total_time',
  'cmi.comments_from_lms._count',
  'cmi.interactions._count',
  'cmi.objectives._count',
  'cmi.comments_from_learner._count',
  'adl.nav.request_valid.choice',
  'adl.nav.request_valid.continue',
  'adl.nav.request_valid.previous',
]);

/**
 * SCORM 2004 Write-only elements.
 */
const WRITE_ONLY_ELEMENTS = new Set(['cmi.exit', 'cmi.session_time', 'adl.nav.request']);

/**
 * SCORM 2004 error messages.
 */
const ERROR_MESSAGES: Record<Scorm2004ErrorCode, string> = {
  [SCORM2004_ERROR_CODES.NO_ERROR]: 'No Error',
  [SCORM2004_ERROR_CODES.GENERAL_EXCEPTION]: 'General Exception',
  [SCORM2004_ERROR_CODES.GENERAL_INITIALIZATION_FAILURE]: 'General Initialization Failure',
  [SCORM2004_ERROR_CODES.ALREADY_INITIALIZED]: 'Already Initialized',
  [SCORM2004_ERROR_CODES.CONTENT_INSTANCE_TERMINATED]: 'Content Instance Terminated',
  [SCORM2004_ERROR_CODES.GENERAL_TERMINATION_FAILURE]: 'General Termination Failure',
  [SCORM2004_ERROR_CODES.TERMINATION_BEFORE_INITIALIZATION]: 'Termination Before Initialization',
  [SCORM2004_ERROR_CODES.TERMINATION_AFTER_TERMINATION]: 'Termination After Termination',
  [SCORM2004_ERROR_CODES.RETRIEVE_DATA_BEFORE_INITIALIZATION]:
    'Retrieve Data Before Initialization',
  [SCORM2004_ERROR_CODES.RETRIEVE_DATA_AFTER_TERMINATION]: 'Retrieve Data After Termination',
  [SCORM2004_ERROR_CODES.STORE_DATA_BEFORE_INITIALIZATION]: 'Store Data Before Initialization',
  [SCORM2004_ERROR_CODES.STORE_DATA_AFTER_TERMINATION]: 'Store Data After Termination',
  [SCORM2004_ERROR_CODES.COMMIT_BEFORE_INITIALIZATION]: 'Commit Before Initialization',
  [SCORM2004_ERROR_CODES.COMMIT_AFTER_TERMINATION]: 'Commit After Termination',
  [SCORM2004_ERROR_CODES.GENERAL_ARGUMENT_ERROR]: 'General Argument Error',
  [SCORM2004_ERROR_CODES.GENERAL_GET_FAILURE]: 'General Get Failure',
  [SCORM2004_ERROR_CODES.GENERAL_SET_FAILURE]: 'General Set Failure',
  [SCORM2004_ERROR_CODES.GENERAL_COMMIT_FAILURE]: 'General Commit Failure',
  [SCORM2004_ERROR_CODES.UNDEFINED_DATA_MODEL_ELEMENT]: 'Undefined Data Model Element',
  [SCORM2004_ERROR_CODES.UNIMPLEMENTED_DATA_MODEL_ELEMENT]: 'Unimplemented Data Model Element',
  [SCORM2004_ERROR_CODES.DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED]:
    'Data Model Element Value Not Initialized',
  [SCORM2004_ERROR_CODES.DATA_MODEL_ELEMENT_IS_READ_ONLY]: 'Data Model Element Is Read Only',
  [SCORM2004_ERROR_CODES.DATA_MODEL_ELEMENT_IS_WRITE_ONLY]: 'Data Model Element Is Write Only',
  [SCORM2004_ERROR_CODES.DATA_MODEL_ELEMENT_TYPE_MISMATCH]: 'Data Model Element Type Mismatch',
  [SCORM2004_ERROR_CODES.DATA_MODEL_ELEMENT_VALUE_OUT_OF_RANGE]:
    'Data Model Element Value Out Of Range',
  [SCORM2004_ERROR_CODES.DATA_MODEL_DEPENDENCY_NOT_ESTABLISHED]:
    'Data Model Dependency Not Established',
};

/**
 * Convert seconds to ISO 8601 duration format (P[n]DT[n]H[n]M[n]S).
 */
function formatIso8601Duration(seconds: number): string {
  if (seconds === 0) return 'PT0S';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  let result = 'PT';
  if (hours > 0) result += `${hours}H`;
  if (minutes > 0) result += `${minutes}M`;
  if (secs > 0) result += `${secs.toFixed(2)}S`;

  return result === 'PT' ? 'PT0S' : result;
}

/**
 * Parse ISO 8601 duration format to seconds.
 */
function parseIso8601Duration(duration: string): number {
  if (!duration || duration === 'PT0S') return 0;

  let totalSeconds = 0;
  const dayMatch = duration.match(/(\d+)D/);
  const hourMatch = duration.match(/(\d+)H/);
  const minuteMatch = duration.match(/(\d+)M/);
  const secondMatch = duration.match(/([\d.]+)S/);

  if (dayMatch) totalSeconds += parseInt(dayMatch[1], 10) * 86400;
  if (hourMatch) totalSeconds += parseInt(hourMatch[1], 10) * 3600;
  if (minuteMatch) totalSeconds += parseInt(minuteMatch[1], 10) * 60;
  if (secondMatch) totalSeconds += parseFloat(secondMatch[1]);

  return totalSeconds;
}

/**
 * Add two ISO 8601 duration values.
 */
function addIso8601Durations(duration1: string, duration2: string): string {
  const seconds1 = parseIso8601Duration(duration1);
  const seconds2 = parseIso8601Duration(duration2);
  return formatIso8601Duration(seconds1 + seconds2);
}

/**
 * SCORM 2004 API wrapper implementation.
 */
export class Scorm2004ApiWrapper implements ContentWrapper {
  readonly format = 'scorm_2004' as const;

  private config: Scorm2004Config;
  private edition: Scorm2004Edition;
  private cmiData: Scorm2004DataModel;
  private isInitialized = false;
  private isTerminated = false;
  private lastError: Scorm2004ErrorCode = SCORM2004_ERROR_CODES.NO_ERROR;
  private lastDiagnostic = '';
  private sessionStartTime: number = 0;
  private dirty = false;

  constructor(config: Scorm2004Config) {
    this.config = config;
    this.edition = config.edition ?? '3rd';
    this.cmiData = this.initializeDataModel(config.initialData);
  }

  /**
   * Initialize the CMI data model with defaults and initial data.
   */
  private initializeDataModel(initialData?: Scorm2004DataModel): Scorm2004DataModel {
    const defaults: Scorm2004DataModel = {
      'cmi._version': '1.0',
      'cmi.completion_status': 'unknown',
      'cmi.completion_threshold': undefined,
      'cmi.credit': 'credit',
      'cmi.entry': initialData ? 'resume' : 'ab-initio',
      'cmi.exit': '',
      'cmi.launch_data': '',
      'cmi.learner_id': this.config.learnerId,
      'cmi.learner_name': '',
      'cmi.learner_preference.audio_level': 1,
      'cmi.learner_preference.language': '',
      'cmi.learner_preference.delivery_speed': 1,
      'cmi.learner_preference.audio_captioning': 0,
      'cmi.location': '',
      'cmi.max_time_allowed': '',
      'cmi.mode': 'normal',
      'cmi.progress_measure': undefined,
      'cmi.scaled_passing_score': undefined,
      'cmi.score.scaled': undefined,
      'cmi.score.raw': undefined,
      'cmi.score.min': undefined,
      'cmi.score.max': undefined,
      'cmi.session_time': 'PT0S',
      'cmi.success_status': 'unknown',
      'cmi.suspend_data': '',
      'cmi.time_limit_action': 'continue,no message',
      'cmi.total_time': 'PT0S',
      'cmi.objectives._count': 0,
      'cmi.interactions._count': 0,
      'cmi.comments_from_learner._count': 0,
      'cmi.comments_from_lms._count': 0,
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
    // SCORM 2004 expects the API at window.API_1484_11
    (iframeWindow as Window & { API_1484_11: typeof api }).API_1484_11 = api;

    // Also try parent frames for nested content
    try {
      let win: Window | null = iframeWindow;
      while (win && win !== win.parent) {
        (win as Window & { API_1484_11: typeof api }).API_1484_11 = api;
        win = win.parent;
      }
    } catch {
      // Cross-origin access denied - this is expected
    }
  }

  /**
   * Create the SCORM 2004 API object.
   */
  private createApiObject() {
    return {
      Initialize: (param: string) => this.Initialize(param),
      Terminate: (param: string) => this.Terminate(param),
      GetValue: (element: string) => this.GetValue(element),
      SetValue: (element: string, value: string) => this.SetValue(element, value),
      Commit: (param: string) => this.Commit(param),
      GetLastError: () => this.GetLastError(),
      GetErrorString: (errorCode: string) => this.GetErrorString(errorCode),
      GetDiagnostic: (param: string) => this.GetDiagnostic(param),
    };
  }

  /**
   * Initialize - Initialize communication with LMS.
   */
  private Initialize(param: string): string {
    this.lastDiagnostic = '';

    if (param !== '') {
      this.setError(
        SCORM2004_ERROR_CODES.GENERAL_ARGUMENT_ERROR,
        'Initialize expects empty string parameter',
      );
      return 'false';
    }

    if (this.isInitialized && !this.isTerminated) {
      this.setError(SCORM2004_ERROR_CODES.ALREADY_INITIALIZED, 'Already initialized');
      return 'false';
    }

    if (this.isTerminated) {
      this.setError(
        SCORM2004_ERROR_CODES.CONTENT_INSTANCE_TERMINATED,
        'Content instance terminated',
      );
      return 'false';
    }

    this.isInitialized = true;
    this.sessionStartTime = Date.now();
    this.clearError();

    return 'true';
  }

  /**
   * Terminate - Terminate communication with LMS.
   */
  private Terminate(param: string): string {
    this.lastDiagnostic = '';

    if (param !== '') {
      this.setError(
        SCORM2004_ERROR_CODES.GENERAL_ARGUMENT_ERROR,
        'Terminate expects empty string parameter',
      );
      return 'false';
    }

    if (!this.isInitialized) {
      this.setError(
        SCORM2004_ERROR_CODES.TERMINATION_BEFORE_INITIALIZATION,
        'Termination before initialization',
      );
      return 'false';
    }

    if (this.isTerminated) {
      this.setError(
        SCORM2004_ERROR_CODES.TERMINATION_AFTER_TERMINATION,
        'Termination after termination',
      );
      return 'false';
    }

    // Calculate and set session time
    const sessionSeconds = (Date.now() - this.sessionStartTime) / 1000;
    this.cmiData['cmi.session_time'] = formatIso8601Duration(sessionSeconds);

    // Update total time
    const currentTotal = this.cmiData['cmi.total_time'] ?? 'PT0S';
    this.cmiData['cmi.total_time'] = addIso8601Durations(
      currentTotal,
      this.cmiData['cmi.session_time'] ?? 'PT0S',
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
   * GetValue - Get a value from the CMI data model.
   */
  private GetValue(element: string): string {
    this.lastDiagnostic = '';

    if (!this.isInitialized) {
      this.setError(
        SCORM2004_ERROR_CODES.RETRIEVE_DATA_BEFORE_INITIALIZATION,
        'Retrieve data before initialization',
      );
      return '';
    }

    if (this.isTerminated) {
      this.setError(
        SCORM2004_ERROR_CODES.RETRIEVE_DATA_AFTER_TERMINATION,
        'Retrieve data after termination',
      );
      return '';
    }

    if (!element) {
      this.setError(SCORM2004_ERROR_CODES.GENERAL_ARGUMENT_ERROR, 'Element cannot be empty');
      return '';
    }

    // Check for write-only elements
    if (WRITE_ONLY_ELEMENTS.has(element)) {
      this.setError(
        SCORM2004_ERROR_CODES.DATA_MODEL_ELEMENT_IS_WRITE_ONLY,
        `Element ${element} is write only`,
      );
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
      // Check if element is valid but not initialized
      if (this.isValidElement(element)) {
        this.setError(
          SCORM2004_ERROR_CODES.DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED,
          `Element ${element} value not initialized`,
        );
      } else {
        this.setError(
          SCORM2004_ERROR_CODES.UNDEFINED_DATA_MODEL_ELEMENT,
          `Element ${element} not defined`,
        );
      }
      return '';
    }

    this.clearError();
    return String(value);
  }

  /**
   * SetValue - Set a value in the CMI data model.
   */
  private SetValue(element: string, value: string): string {
    this.lastDiagnostic = '';

    if (!this.isInitialized) {
      this.setError(
        SCORM2004_ERROR_CODES.STORE_DATA_BEFORE_INITIALIZATION,
        'Store data before initialization',
      );
      return 'false';
    }

    if (this.isTerminated) {
      this.setError(
        SCORM2004_ERROR_CODES.STORE_DATA_AFTER_TERMINATION,
        'Store data after termination',
      );
      return 'false';
    }

    if (!element) {
      this.setError(SCORM2004_ERROR_CODES.GENERAL_ARGUMENT_ERROR, 'Element cannot be empty');
      return 'false';
    }

    // Check for read-only elements
    if (READ_ONLY_ELEMENTS.has(element)) {
      this.setError(
        SCORM2004_ERROR_CODES.DATA_MODEL_ELEMENT_IS_READ_ONLY,
        `Element ${element} is read only`,
      );
      return 'false';
    }

    // Validate and set the value
    const validationResult = this.validateValue(element, value);
    if (!validationResult.valid) {
      this.setError(
        validationResult.errorCode ?? SCORM2004_ERROR_CODES.GENERAL_SET_FAILURE,
        validationResult.message ?? 'Invalid value',
      );
      return 'false';
    }

    // Handle array elements
    if (this.isArrayElement(element)) {
      this.handleArrayElement(element, value);
    } else {
      // Convert numeric values
      if (this.isNumericElement(element)) {
        this.cmiData[element] = parseFloat(value);
      } else {
        this.cmiData[element] = value;
      }
    }

    this.dirty = true;
    this.clearError();

    // Notify progress updates for key elements
    if (
      element === 'cmi.completion_status' ||
      element === 'cmi.success_status' ||
      element === 'cmi.score.scaled' ||
      element === 'cmi.progress_measure' ||
      element === 'cmi.location'
    ) {
      this.notifyProgress();
    }

    return 'true';
  }

  /**
   * Commit - Commit data to the LMS.
   */
  private Commit(param: string): string {
    this.lastDiagnostic = '';

    if (param !== '') {
      this.setError(
        SCORM2004_ERROR_CODES.GENERAL_ARGUMENT_ERROR,
        'Commit expects empty string parameter',
      );
      return 'false';
    }

    if (!this.isInitialized) {
      this.setError(
        SCORM2004_ERROR_CODES.COMMIT_BEFORE_INITIALIZATION,
        'Commit before initialization',
      );
      return 'false';
    }

    if (this.isTerminated) {
      this.setError(SCORM2004_ERROR_CODES.COMMIT_AFTER_TERMINATION, 'Commit after termination');
      return 'false';
    }

    this.commitData();
    this.clearError();

    return 'true';
  }

  /**
   * GetLastError - Get the last error code.
   */
  private GetLastError(): string {
    return this.lastError;
  }

  /**
   * GetErrorString - Get error string for error code.
   */
  private GetErrorString(errorCode: string): string {
    const code = errorCode as Scorm2004ErrorCode;
    return ERROR_MESSAGES[code] ?? 'Unknown error';
  }

  /**
   * GetDiagnostic - Get diagnostic information.
   */
  private GetDiagnostic(param: string): string {
    if (param === '') {
      return this.lastDiagnostic;
    }
    // If param is an error code, return additional info
    const code = param as Scorm2004ErrorCode;
    if (ERROR_MESSAGES[code]) {
      return `${ERROR_MESSAGES[code]}. ${this.lastDiagnostic}`;
    }
    return this.lastDiagnostic;
  }

  /**
   * Terminate the wrapper.
   */
  async terminate(): Promise<void> {
    if (this.isInitialized && !this.isTerminated) {
      this.Terminate('');
    }
  }

  /**
   * Get current progress.
   */
  getProgress(): WrapperProgress {
    // Calculate progress from progress_measure or completion_status
    let percent = 0;
    const progressMeasure = this.cmiData['cmi.progress_measure'];
    const completionStatus = this.cmiData['cmi.completion_status'];

    if (progressMeasure !== undefined) {
      percent = Math.round(Number(progressMeasure) * 100);
    } else if (completionStatus === 'completed') {
      percent = 100;
    } else if (completionStatus === 'incomplete') {
      // Estimate from scaled score
      const scaledScore = this.cmiData['cmi.score.scaled'];
      if (scaledScore !== undefined) {
        percent = Math.round(Number(scaledScore) * 100);
      } else {
        percent = 50;
      }
    }

    return {
      percent,
      location: this.cmiData['cmi.location'] as string | undefined,
      suspendData: this.cmiData['cmi.suspend_data'] as string | undefined,
      sessionTime: this.cmiData['cmi.session_time'] as string | undefined,
      totalTime: this.cmiData['cmi.total_time'] as string | undefined,
    };
  }

  /**
   * Get current result.
   */
  getResult(): WrapperResult {
    const completionStatus = this.cmiData['cmi.completion_status'] ?? 'unknown';
    const successStatus = this.cmiData['cmi.success_status'] ?? 'unknown';

    let resultStatus: WrapperResult['status'] = 'incomplete';
    let success: boolean | undefined;

    // Determine result based on both statuses
    if (successStatus === 'passed') {
      resultStatus = 'passed';
      success = true;
    } else if (successStatus === 'failed') {
      resultStatus = 'failed';
      success = false;
    } else if (completionStatus === 'completed') {
      resultStatus = 'completed';
    } else {
      resultStatus = 'incomplete';
    }

    return {
      status: resultStatus,
      success,
      score: {
        scaled: this.cmiData['cmi.score.scaled'] as number | undefined,
        raw: this.cmiData['cmi.score.raw'] as number | undefined,
        min: this.cmiData['cmi.score.min'] as number | undefined,
        max: this.cmiData['cmi.score.max'] as number | undefined,
      },
      totalTime: this.cmiData['cmi.total_time'] as string | undefined,
      location: this.cmiData['cmi.location'] as string | undefined,
      suspendData: this.cmiData['cmi.suspend_data'] as string | undefined,
    };
  }

  /**
   * Check if content is complete.
   */
  isComplete(): boolean {
    const completionStatus = this.cmiData['cmi.completion_status'];
    const successStatus = this.cmiData['cmi.success_status'];
    return completionStatus === 'completed' || successStatus === 'passed';
  }

  /**
   * Force a commit.
   */
  async commit(): Promise<void> {
    this.commitData();
  }

  /**
   * Get the SCORM 2004 edition.
   */
  getEdition(): Scorm2004Edition {
    return this.edition;
  }

  // ==========================================================================
  // PRIVATE HELPERS
  // ==========================================================================

  private setError(code: Scorm2004ErrorCode, diagnostic: string): void {
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
    this.lastError = SCORM2004_ERROR_CODES.NO_ERROR;
    this.lastDiagnostic = '';
  }

  private getChildren(element: string): string {
    const base = element.replace('._children', '');

    switch (base) {
      case 'cmi':
        return '_version,comments_from_learner,comments_from_lms,completion_status,completion_threshold,credit,entry,exit,interactions,launch_data,learner_id,learner_name,learner_preference,location,max_time_allowed,mode,objectives,progress_measure,scaled_passing_score,score,session_time,success_status,suspend_data,time_limit_action,total_time';
      case 'cmi.learner_preference':
        return 'audio_level,language,delivery_speed,audio_captioning';
      case 'cmi.score':
        return 'scaled,raw,min,max';
      case 'cmi.objectives':
        return 'id,score,success_status,completion_status,description';
      case 'cmi.interactions':
        return 'id,type,objectives,timestamp,correct_responses,weighting,learner_response,result,latency,description';
      case 'cmi.comments_from_learner':
      case 'cmi.comments_from_lms':
        return 'comment,location,timestamp';
      case 'adl.nav':
        return 'request,request_valid';
      default:
        this.setError(
          SCORM2004_ERROR_CODES.UNDEFINED_DATA_MODEL_ELEMENT,
          `Children not defined for ${base}`,
        );
        return '';
    }
  }

  private getCount(element: string): string {
    const base = element.replace('._count', '');
    const countKey = `${base}._count`;
    const count = this.cmiData[countKey];
    return count !== undefined ? String(count) : '0';
  }

  private isValidElement(element: string): boolean {
    // Check if it's a known CMI element pattern
    const patterns = [
      /^cmi\.score\./,
      /^cmi\.learner_preference\./,
      /^cmi\.objectives\.\d+\./,
      /^cmi\.interactions\.\d+\./,
      /^cmi\.comments_from_learner\.\d+\./,
      /^cmi\.comments_from_lms\.\d+\./,
      /^adl\.nav\./,
    ];

    return patterns.some((pattern) => pattern.test(element));
  }

  private isArrayElement(element: string): boolean {
    return /\.(objectives|interactions|comments_from_learner|comments_from_lms)\.\d+\./.test(
      element,
    );
  }

  private isNumericElement(element: string): boolean {
    const numericElements = [
      'cmi.score.scaled',
      'cmi.score.raw',
      'cmi.score.min',
      'cmi.score.max',
      'cmi.progress_measure',
      'cmi.learner_preference.audio_level',
      'cmi.learner_preference.delivery_speed',
      'cmi.learner_preference.audio_captioning',
    ];
    return numericElements.includes(element) || /\.score\.(scaled|raw|min|max)$/.test(element);
  }

  private handleArrayElement(element: string, value: string): void {
    // Extract array type and index
    const objectivesMatch = element.match(/cmi\.objectives\.(\d+)\./);
    const interactionsMatch = element.match(/cmi\.interactions\.(\d+)\./);
    const learnerCommentsMatch = element.match(/cmi\.comments_from_learner\.(\d+)\./);

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

    if (learnerCommentsMatch) {
      const index = parseInt(learnerCommentsMatch[1], 10);
      const currentCount = (this.cmiData['cmi.comments_from_learner._count'] as number) ?? 0;
      if (index >= currentCount) {
        this.cmiData['cmi.comments_from_learner._count'] = index + 1;
      }
    }

    // Store the value (convert to number if applicable)
    if (this.isNumericElement(element)) {
      this.cmiData[element] = parseFloat(value);
    } else {
      this.cmiData[element] = value;
    }
  }

  private validateValue(
    element: string,
    value: string,
  ): { valid: boolean; errorCode?: Scorm2004ErrorCode; message?: string } {
    // Validate completion_status
    if (element === 'cmi.completion_status') {
      const validStatuses = ['completed', 'incomplete', 'not attempted', 'unknown'];
      if (!validStatuses.includes(value)) {
        return {
          valid: false,
          errorCode: SCORM2004_ERROR_CODES.DATA_MODEL_ELEMENT_TYPE_MISMATCH,
          message: `Invalid completion_status: ${value}`,
        };
      }
    }

    // Validate success_status
    if (element === 'cmi.success_status') {
      const validStatuses = ['passed', 'failed', 'unknown'];
      if (!validStatuses.includes(value)) {
        return {
          valid: false,
          errorCode: SCORM2004_ERROR_CODES.DATA_MODEL_ELEMENT_TYPE_MISMATCH,
          message: `Invalid success_status: ${value}`,
        };
      }
    }

    // Validate scaled score (must be between -1 and 1)
    if (element === 'cmi.score.scaled' || /\.score\.scaled$/.test(element)) {
      const numValue = parseFloat(value);
      if (Number.isNaN(numValue) || numValue < -1 || numValue > 1) {
        return {
          valid: false,
          errorCode: SCORM2004_ERROR_CODES.DATA_MODEL_ELEMENT_VALUE_OUT_OF_RANGE,
          message: 'Scaled score must be between -1 and 1',
        };
      }
    }

    // Validate progress_measure (must be between 0 and 1)
    if (element === 'cmi.progress_measure') {
      const numValue = parseFloat(value);
      if (Number.isNaN(numValue) || numValue < 0 || numValue > 1) {
        return {
          valid: false,
          errorCode: SCORM2004_ERROR_CODES.DATA_MODEL_ELEMENT_VALUE_OUT_OF_RANGE,
          message: 'Progress measure must be between 0 and 1',
        };
      }
    }

    // Validate exit
    if (element === 'cmi.exit') {
      const validExits = ['time-out', 'suspend', 'logout', 'normal', ''];
      if (!validExits.includes(value)) {
        return {
          valid: false,
          errorCode: SCORM2004_ERROR_CODES.DATA_MODEL_ELEMENT_TYPE_MISMATCH,
          message: `Invalid exit: ${value}`,
        };
      }
    }

    // Validate session_time format (ISO 8601 duration)
    if (element === 'cmi.session_time') {
      if (!/^P(\d+D)?(T(\d+H)?(\d+M)?([\d.]+S)?)?$/.test(value) && value !== 'PT0S') {
        return {
          valid: false,
          errorCode: SCORM2004_ERROR_CODES.DATA_MODEL_ELEMENT_TYPE_MISMATCH,
          message: 'Invalid duration format. Expected ISO 8601 duration (e.g., PT1H30M)',
        };
      }
    }

    // Validate audio_captioning
    if (element === 'cmi.learner_preference.audio_captioning') {
      const numValue = parseInt(value, 10);
      if (numValue !== -1 && numValue !== 0 && numValue !== 1) {
        return {
          valid: false,
          errorCode: SCORM2004_ERROR_CODES.DATA_MODEL_ELEMENT_VALUE_OUT_OF_RANGE,
          message: 'Audio captioning must be -1, 0, or 1',
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
          format: 'scorm_2004',
          cmiData: { ...this.cmiData },
        })
        .catch((error) => {
          if (this.config.onError) {
            this.config.onError({
              code: SCORM2004_ERROR_CODES.GENERAL_COMMIT_FAILURE,
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
 * Create a SCORM 2004 API wrapper.
 */
export function createScorm2004Wrapper(config: Scorm2004Config): Scorm2004ApiWrapper {
  return new Scorm2004ApiWrapper(config);
}
