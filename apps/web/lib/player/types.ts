// =============================================================================
// CONTENT FORMAT TYPES
// =============================================================================
// Type definitions for multi-format content detection and player wrappers.
// Supports SCORM 1.2, SCORM 2004, xAPI, cmi5, AICC, HTML5, PDF, and native.
// =============================================================================

/**
 * Supported content formats for the player.
 */
export type ContentFormat =
  | 'scorm_12'
  | 'scorm_2004'
  | 'xapi'
  | 'cmi5'
  | 'aicc'
  | 'html5'
  | 'pdf'
  | 'native';

/**
 * SCORM version identifiers for SCORM 2004 editions.
 */
export type Scorm2004Edition = '2nd' | '3rd' | '4th';

/**
 * Content manifest extracted from package detection.
 */
export interface ContentManifest {
  /** Detected content format */
  format: ContentFormat;
  /** Entry point file path */
  entryPoint: string;
  /** Course/content title */
  title?: string;
  /** Content version */
  version?: string;
  /** SCORM version (1.2 or 2004 edition) */
  scormVersion?: string;
  /** xAPI/cmi5 activity ID */
  activityId?: string;
  /** cmi5 registration ID */
  registrationId?: string;
  /** cmi5 actor (agent) */
  actor?: XApiActor;
  /** LRS endpoint for xAPI/cmi5 */
  lrsEndpoint?: string;
  /** Mastery score threshold */
  masteryScore?: number;
  /** Maximum time allowed */
  maxTimeAllowed?: string;
  /** Time limit action */
  timeLimitAction?: string;
}

/**
 * xAPI Actor (Agent) representation.
 */
export interface XApiActor {
  objectType?: 'Agent' | 'Group';
  name?: string;
  mbox?: string;
  mbox_sha1sum?: string;
  openid?: string;
  account?: {
    homePage: string;
    name: string;
  };
}

/**
 * xAPI Verb representation.
 */
export interface XApiVerb {
  id: string;
  display?: Record<string, string>;
}

/**
 * xAPI Activity (Object) representation.
 */
export interface XApiActivity {
  objectType?: 'Activity';
  id: string;
  definition?: {
    name?: Record<string, string>;
    description?: Record<string, string>;
    type?: string;
    moreInfo?: string;
    interactionType?: string;
    correctResponsesPattern?: string[];
    choices?: Array<{ id: string; description: Record<string, string> }>;
    scale?: Array<{ id: string; description: Record<string, string> }>;
    source?: Array<{ id: string; description: Record<string, string> }>;
    target?: Array<{ id: string; description: Record<string, string> }>;
    steps?: Array<{ id: string; description: Record<string, string> }>;
    extensions?: Record<string, unknown>;
  };
}

/**
 * xAPI Result representation.
 */
export interface XApiResult {
  score?: {
    scaled?: number;
    raw?: number;
    min?: number;
    max?: number;
  };
  success?: boolean;
  completion?: boolean;
  response?: string;
  duration?: string;
  extensions?: Record<string, unknown>;
}

/**
 * xAPI Context representation.
 */
export interface XApiContext {
  registration?: string;
  instructor?: XApiActor;
  team?: XApiActor;
  contextActivities?: {
    parent?: XApiActivity[];
    grouping?: XApiActivity[];
    category?: XApiActivity[];
    other?: XApiActivity[];
  };
  revision?: string;
  platform?: string;
  language?: string;
  statement?: { id: string; objectType: 'StatementRef' };
  extensions?: Record<string, unknown>;
}

/**
 * xAPI Statement representation.
 */
export interface XApiStatement {
  id?: string;
  actor: XApiActor;
  verb: XApiVerb;
  object: XApiActivity;
  result?: XApiResult;
  context?: XApiContext;
  timestamp?: string;
  stored?: string;
  authority?: XApiActor;
  version?: string;
  attachments?: Array<{
    usageType: string;
    display: Record<string, string>;
    contentType: string;
    length: number;
    sha2: string;
    fileUrl?: string;
  }>;
}

// =============================================================================
// WRAPPER CONFIGURATION
// =============================================================================

/**
 * Base configuration for all content wrappers.
 */
export interface WrapperConfigBase {
  /** Tenant ID */
  tenantId: string;
  /** Enrollment ID */
  enrollmentId: string;
  /** Learner ID */
  learnerId: string;
  /** Course ID */
  courseId: string;
  /** Callback for progress updates */
  onProgress?: (progress: WrapperProgress) => void;
  /** Callback for completion */
  onComplete?: (result: WrapperResult) => void;
  /** Callback for errors */
  onError?: (error: WrapperError) => void;
  /** Callback for commit/save requests */
  onCommit?: (data: WrapperCommitData) => Promise<void>;
}

/**
 * SCORM 1.2 specific configuration.
 */
export interface Scorm12Config extends WrapperConfigBase {
  format: 'scorm_12';
  /** Initial CMI data to restore */
  initialData?: Scorm12DataModel;
}

/**
 * SCORM 2004 specific configuration.
 */
export interface Scorm2004Config extends WrapperConfigBase {
  format: 'scorm_2004';
  /** SCORM 2004 edition (2nd, 3rd, 4th) */
  edition?: Scorm2004Edition;
  /** Initial CMI data to restore */
  initialData?: Scorm2004DataModel;
}

/**
 * xAPI specific configuration.
 */
export interface XApiConfig extends WrapperConfigBase {
  format: 'xapi';
  /** LRS endpoint URL */
  lrsEndpoint: string;
  /** LRS authentication */
  lrsAuth: {
    type: 'basic' | 'oauth';
    username?: string;
    password?: string;
    token?: string;
  };
  /** Activity ID */
  activityId: string;
  /** Actor (learner) */
  actor: XApiActor;
}

/**
 * cmi5 specific configuration.
 */
export interface Cmi5Config extends WrapperConfigBase {
  format: 'cmi5';
  /** Fetch URL from launch */
  fetchUrl: string;
  /** Registration ID */
  registrationId: string;
  /** Activity ID */
  activityId: string;
  /** Actor (learner) */
  actor: XApiActor;
  /** LRS endpoint */
  lrsEndpoint: string;
  /** LRS authentication token */
  authToken: string;
}

/**
 * AICC specific configuration.
 */
export interface AiccConfig extends WrapperConfigBase {
  format: 'aicc';
  /** AICC_URL for HACP communication */
  aiccUrl: string;
  /** AICC_SID session ID */
  sessionId: string;
}

/**
 * HTML5 specific configuration.
 */
export interface Html5Config extends WrapperConfigBase {
  format: 'html5';
}

/**
 * PDF specific configuration.
 */
export interface PdfConfig extends WrapperConfigBase {
  format: 'pdf';
}

/**
 * Native (INSPIRE) content configuration.
 */
export interface NativeConfig extends WrapperConfigBase {
  format: 'native';
}

/**
 * Union type for all wrapper configurations.
 */
export type WrapperConfig =
  | Scorm12Config
  | Scorm2004Config
  | XApiConfig
  | Cmi5Config
  | AiccConfig
  | Html5Config
  | PdfConfig
  | NativeConfig;

// =============================================================================
// SCORM 1.2 DATA MODEL
// =============================================================================

/**
 * SCORM 1.2 CMI data model.
 */
export interface Scorm12DataModel {
  'cmi.core.student_id'?: string;
  'cmi.core.student_name'?: string;
  'cmi.core.lesson_location'?: string;
  'cmi.core.credit'?: 'credit' | 'no-credit';
  'cmi.core.lesson_status'?:
    | 'passed'
    | 'completed'
    | 'failed'
    | 'incomplete'
    | 'browsed'
    | 'not attempted';
  'cmi.core.entry'?: 'ab-initio' | 'resume' | '';
  'cmi.core.score.raw'?: number;
  'cmi.core.score.max'?: number;
  'cmi.core.score.min'?: number;
  'cmi.core.total_time'?: string;
  'cmi.core.session_time'?: string;
  'cmi.core.exit'?: 'time-out' | 'suspend' | 'logout' | '';
  'cmi.suspend_data'?: string;
  'cmi.launch_data'?: string;
  'cmi.comments'?: string;
  'cmi.comments_from_lms'?: string;
  'cmi.objectives._count'?: number;
  [key: `cmi.objectives.${number}.id`]: string;
  [key: `cmi.objectives.${number}.score.raw`]: number;
  [key: `cmi.objectives.${number}.score.max`]: number;
  [key: `cmi.objectives.${number}.score.min`]: number;
  [key: `cmi.objectives.${number}.status`]: string;
  'cmi.student_data.mastery_score'?: number;
  'cmi.student_data.max_time_allowed'?: string;
  'cmi.student_data.time_limit_action'?: string;
  'cmi.student_preference.audio'?: number;
  'cmi.student_preference.language'?: string;
  'cmi.student_preference.speed'?: number;
  'cmi.student_preference.text'?: number;
  'cmi.interactions._count'?: number;
  [key: `cmi.interactions.${number}.id`]: string;
  [key: `cmi.interactions.${number}.type`]: string;
  [key: `cmi.interactions.${number}.time`]: string;
  [key: `cmi.interactions.${number}.weighting`]: number;
  [key: `cmi.interactions.${number}.student_response`]: string;
  [key: `cmi.interactions.${number}.correct_responses._count`]: number;
  [key: `cmi.interactions.${number}.result`]: string;
  [key: `cmi.interactions.${number}.latency`]: string;
  [key: string]: string | number | undefined;
}

// =============================================================================
// SCORM 2004 DATA MODEL
// =============================================================================

/**
 * SCORM 2004 CMI data model.
 */
export interface Scorm2004DataModel {
  'cmi._version'?: string;
  'cmi.completion_status'?: 'completed' | 'incomplete' | 'not attempted' | 'unknown';
  'cmi.completion_threshold'?: number;
  'cmi.credit'?: 'credit' | 'no-credit';
  'cmi.entry'?: 'ab-initio' | 'resume' | '';
  'cmi.exit'?: 'time-out' | 'suspend' | 'logout' | 'normal' | '';
  'cmi.launch_data'?: string;
  'cmi.learner_id'?: string;
  'cmi.learner_name'?: string;
  'cmi.learner_preference.audio_level'?: number;
  'cmi.learner_preference.language'?: string;
  'cmi.learner_preference.delivery_speed'?: number;
  'cmi.learner_preference.audio_captioning'?: -1 | 0 | 1;
  'cmi.location'?: string;
  'cmi.max_time_allowed'?: string;
  'cmi.mode'?: 'browse' | 'normal' | 'review';
  'cmi.progress_measure'?: number;
  'cmi.scaled_passing_score'?: number;
  'cmi.score.scaled'?: number;
  'cmi.score.raw'?: number;
  'cmi.score.min'?: number;
  'cmi.score.max'?: number;
  'cmi.session_time'?: string;
  'cmi.success_status'?: 'passed' | 'failed' | 'unknown';
  'cmi.suspend_data'?: string;
  'cmi.time_limit_action'?:
    | 'exit,message'
    | 'exit,no message'
    | 'continue,message'
    | 'continue,no message';
  'cmi.total_time'?: string;
  'cmi.objectives._count'?: number;
  'cmi.interactions._count'?: number;
  'cmi.comments_from_learner._count'?: number;
  'cmi.comments_from_lms._count'?: number;
  [key: string]: string | number | undefined;
}

// =============================================================================
// WRAPPER RESULT TYPES
// =============================================================================

/**
 * Progress update from wrapper.
 */
export interface WrapperProgress {
  /** Progress percentage (0-100) */
  percent: number;
  /** Current location/bookmark */
  location?: string;
  /** Suspend data */
  suspendData?: string;
  /** Session time in ISO 8601 duration format */
  sessionTime?: string;
  /** Total time in ISO 8601 duration format */
  totalTime?: string;
}

/**
 * Completion result from wrapper.
 */
export interface WrapperResult {
  /** Completion status */
  status: 'completed' | 'passed' | 'failed' | 'incomplete';
  /** Success status */
  success?: boolean;
  /** Score information */
  score?: {
    scaled?: number;
    raw?: number;
    min?: number;
    max?: number;
  };
  /** Total time spent */
  totalTime?: string;
  /** Final location/bookmark */
  location?: string;
  /** Final suspend data */
  suspendData?: string;
}

/**
 * Error from wrapper.
 */
export interface WrapperError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Diagnostic information */
  diagnostic?: string;
}

/**
 * Data to commit/persist.
 */
export interface WrapperCommitData {
  /** Content format */
  format: ContentFormat;
  /** CMI data model (for SCORM) */
  cmiData?: Scorm12DataModel | Scorm2004DataModel;
  /** xAPI statements to send */
  statements?: XApiStatement[];
  /** State data (for xAPI/cmi5) */
  stateData?: Record<string, unknown>;
}

// =============================================================================
// WRAPPER INTERFACE
// =============================================================================

/**
 * Content wrapper interface - implemented by all format-specific wrappers.
 */
export interface ContentWrapper {
  /** Content format this wrapper handles */
  readonly format: ContentFormat;

  /**
   * Initialize the wrapper and inject API into iframe window.
   * @param iframeWindow - The iframe's window object
   * @returns Promise that resolves when initialization is complete
   */
  initialize(iframeWindow: Window): Promise<void>;

  /**
   * Terminate the wrapper and clean up resources.
   * @returns Promise that resolves when termination is complete
   */
  terminate(): Promise<void>;

  /**
   * Get current progress from the wrapper.
   * @returns Current progress state
   */
  getProgress(): WrapperProgress;

  /**
   * Get current result/status from the wrapper.
   * @returns Current result state
   */
  getResult(): WrapperResult;

  /**
   * Check if content has been completed.
   * @returns True if content is completed
   */
  isComplete(): boolean;

  /**
   * Force a commit/save of current state.
   * @returns Promise that resolves when commit is complete
   */
  commit(): Promise<void>;
}

// =============================================================================
// SCORM ERROR CODES
// =============================================================================

/**
 * SCORM 1.2 error codes.
 */
export const SCORM12_ERROR_CODES = {
  NO_ERROR: '0',
  GENERAL_EXCEPTION: '101',
  INVALID_ARGUMENT: '201',
  ELEMENT_CANNOT_HAVE_CHILDREN: '202',
  ELEMENT_NOT_AN_ARRAY: '203',
  NOT_INITIALIZED: '301',
  NOT_IMPLEMENTED: '401',
  INVALID_SET_VALUE: '402',
  ELEMENT_IS_READ_ONLY: '403',
  ELEMENT_IS_WRITE_ONLY: '404',
  INCORRECT_DATA_TYPE: '405',
} as const;

/**
 * SCORM 2004 error codes.
 */
export const SCORM2004_ERROR_CODES = {
  NO_ERROR: '0',
  GENERAL_EXCEPTION: '101',
  GENERAL_INITIALIZATION_FAILURE: '102',
  ALREADY_INITIALIZED: '103',
  CONTENT_INSTANCE_TERMINATED: '104',
  GENERAL_TERMINATION_FAILURE: '111',
  TERMINATION_BEFORE_INITIALIZATION: '112',
  TERMINATION_AFTER_TERMINATION: '113',
  RETRIEVE_DATA_BEFORE_INITIALIZATION: '122',
  RETRIEVE_DATA_AFTER_TERMINATION: '123',
  STORE_DATA_BEFORE_INITIALIZATION: '132',
  STORE_DATA_AFTER_TERMINATION: '133',
  COMMIT_BEFORE_INITIALIZATION: '142',
  COMMIT_AFTER_TERMINATION: '143',
  GENERAL_ARGUMENT_ERROR: '201',
  GENERAL_GET_FAILURE: '301',
  GENERAL_SET_FAILURE: '351',
  GENERAL_COMMIT_FAILURE: '391',
  UNDEFINED_DATA_MODEL_ELEMENT: '401',
  UNIMPLEMENTED_DATA_MODEL_ELEMENT: '402',
  DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED: '403',
  DATA_MODEL_ELEMENT_IS_READ_ONLY: '404',
  DATA_MODEL_ELEMENT_IS_WRITE_ONLY: '405',
  DATA_MODEL_ELEMENT_TYPE_MISMATCH: '406',
  DATA_MODEL_ELEMENT_VALUE_OUT_OF_RANGE: '407',
  DATA_MODEL_DEPENDENCY_NOT_ESTABLISHED: '408',
} as const;

/**
 * SCORM 1.2 error code type.
 */
export type Scorm12ErrorCode = (typeof SCORM12_ERROR_CODES)[keyof typeof SCORM12_ERROR_CODES];

/**
 * SCORM 2004 error code type.
 */
export type Scorm2004ErrorCode = (typeof SCORM2004_ERROR_CODES)[keyof typeof SCORM2004_ERROR_CODES];
