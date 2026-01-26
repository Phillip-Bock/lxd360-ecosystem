// =============================================================================
// cmi5 WRAPPER
// =============================================================================
// Implements cmi5 (xAPI Profile) for Assignable Unit (AU) communication.
// Provides initialize(), terminate(), passed(), failed(), and completed().
// =============================================================================

import type {
  Cmi5Config,
  ContentWrapper,
  WrapperProgress,
  WrapperResult,
  XApiActivity,
  XApiContext,
  XApiResult,
  XApiStatement,
  XApiVerb,
} from '../types';

/**
 * cmi5 defined verbs.
 */
export const CMI5_VERBS = {
  INITIALIZED: {
    id: 'http://adlnet.gov/expapi/verbs/initialized',
    display: { 'en-US': 'initialized' },
  },
  TERMINATED: {
    id: 'http://adlnet.gov/expapi/verbs/terminated',
    display: { 'en-US': 'terminated' },
  },
  COMPLETED: {
    id: 'http://adlnet.gov/expapi/verbs/completed',
    display: { 'en-US': 'completed' },
  },
  PASSED: {
    id: 'http://adlnet.gov/expapi/verbs/passed',
    display: { 'en-US': 'passed' },
  },
  FAILED: {
    id: 'http://adlnet.gov/expapi/verbs/failed',
    display: { 'en-US': 'failed' },
  },
  ABANDONED: {
    id: 'https://w3id.org/xapi/adl/verbs/abandoned',
    display: { 'en-US': 'abandoned' },
  },
  WAIVED: {
    id: 'https://w3id.org/xapi/adl/verbs/waived',
    display: { 'en-US': 'waived' },
  },
  SATISFIED: {
    id: 'https://w3id.org/xapi/adl/verbs/satisfied',
    display: { 'en-US': 'satisfied' },
  },
} as const;

/**
 * cmi5 context extensions.
 */
const CMI5_CONTEXT_EXTENSIONS = {
  SESSION_ID: 'https://w3id.org/xapi/cmi5/context/extensions/sessionid',
  MASTERY_SCORE: 'https://w3id.org/xapi/cmi5/context/extensions/masteryscore',
  LAUNCH_MODE: 'https://w3id.org/xapi/cmi5/context/extensions/launchmode',
  LAUNCH_URL: 'https://w3id.org/xapi/cmi5/context/extensions/launchurl',
  MOVE_ON: 'https://w3id.org/xapi/cmi5/context/extensions/moveon',
  LAUNCH_PARAMETERS: 'https://w3id.org/xapi/cmi5/context/extensions/launchparameters',
} as const;

/**
 * cmi5 result extensions.
 */
export const CMI5_RESULT_EXTENSIONS = {
  PROGRESS: 'https://w3id.org/xapi/cmi5/result/extensions/progress',
  REASON: 'https://w3id.org/xapi/cmi5/result/extensions/reason',
} as const;

/**
 * cmi5 category activity.
 */
const CMI5_CATEGORY: XApiActivity = {
  objectType: 'Activity',
  id: 'https://w3id.org/xapi/cmi5/context/categories/cmi5',
  definition: {
    type: 'https://w3id.org/xapi/cmi5/activitytype/course',
  },
};

/**
 * cmi5 moveOn criteria.
 */
export type Cmi5MoveOn =
  | 'Passed'
  | 'Completed'
  | 'CompletedAndPassed'
  | 'CompletedOrPassed'
  | 'NotApplicable';

/**
 * cmi5 launch mode.
 */
export type Cmi5LaunchMode = 'Normal' | 'Browse' | 'Review';

/**
 * cmi5 launch data (from fetch URL).
 */
interface Cmi5LaunchData {
  contextTemplate: {
    extensions?: Record<string, unknown>;
    contextActivities?: {
      parent?: XApiActivity[];
      grouping?: XApiActivity[];
    };
  };
  launchMode: Cmi5LaunchMode;
  launchParameters?: string;
  masteryScore?: number;
  moveOn: Cmi5MoveOn;
  returnURL?: string;
  entitlementKey?: {
    courseStructure?: string;
    alternate?: string;
  };
}

/**
 * cmi5 state data.
 */
interface Cmi5StateData {
  location?: string;
  progress?: number;
  suspendData?: string;
  [key: string]: unknown;
}

/**
 * Generate a UUID v4.
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Format duration in ISO 8601 format.
 */
function formatIsoDuration(seconds: number): string {
  if (seconds === 0) return 'PT0S';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.round(seconds % 60);

  let result = 'PT';
  if (hours > 0) result += `${hours}H`;
  if (minutes > 0) result += `${minutes}M`;
  if (secs > 0) result += `${secs}S`;

  return result === 'PT' ? 'PT0S' : result;
}

/**
 * cmi5 wrapper implementation.
 */
export class Cmi5Wrapper implements ContentWrapper {
  readonly format = 'cmi5' as const;

  private config: Cmi5Config;
  private isInitialized = false;
  private isTerminated = false;
  private sessionId: string;
  private sessionStartTime: number = 0;
  private launchData: Cmi5LaunchData | null = null;
  private stateData: Cmi5StateData = {};
  private completionSent = false;
  private successSent = false;
  private lastResult: WrapperResult = { status: 'incomplete' };

  constructor(config: Cmi5Config) {
    this.config = config;
    this.sessionId = generateUUID();
  }

  /**
   * Initialize the wrapper and inject cmi5 helper into iframe window.
   */
  async initialize(iframeWindow: Window): Promise<void> {
    // Fetch launch data
    await this.fetchLaunchData();

    // Create the cmi5 helper object
    const cmi5Helper = this.createCmi5Helper();

    // Inject cmi5 helper into the iframe window
    (iframeWindow as Window & { cmi5: typeof cmi5Helper }).cmi5 = cmi5Helper;

    // Also inject Cmi5 class for compatibility
    (iframeWindow as Window & { Cmi5: typeof Cmi5Wrapper }).Cmi5 = Cmi5Wrapper;

    this.isInitialized = true;
    this.sessionStartTime = Date.now();

    // Send initialized statement (required by cmi5)
    await this.sendCmi5Statement(CMI5_VERBS.INITIALIZED);
  }

  /**
   * Fetch launch data from the fetch URL.
   */
  private async fetchLaunchData(): Promise<void> {
    try {
      const response = await fetch(this.config.fetchUrl, {
        headers: {
          Authorization: `Bearer ${this.config.authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch launch data: ${response.status}`);
      }

      this.launchData = await response.json();
    } catch (error) {
      // Use defaults if fetch fails
      this.launchData = {
        contextTemplate: {},
        launchMode: 'Normal',
        moveOn: 'CompletedOrPassed',
      };

      if (this.config.onError) {
        this.config.onError({
          code: 'FETCH_ERROR',
          message: 'Failed to fetch cmi5 launch data',
          diagnostic: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  /**
   * Create the cmi5 helper object for content.
   */
  private createCmi5Helper() {
    return {
      // Core methods
      initialize: () => this.initializeFromContent(),
      terminate: () => this.terminateFromContent(),
      passed: (score?: number) => this.passed(score),
      failed: (score?: number) => this.failed(score),
      completed: () => this.completed(),

      // State methods
      getState: (stateId: string) => this.getState(stateId),
      setState: (stateId: string, value: unknown) => this.setState(stateId, value),
      deleteState: (stateId: string) => this.deleteState(stateId),

      // Progress
      setProgress: (progress: number) => this.setProgress(progress),
      getProgress: () => this.stateData.progress ?? 0,

      // Getters
      getLaunchData: () => this.launchData,
      getLaunchMode: () => this.launchData?.launchMode ?? 'Normal',
      getMoveOn: () => this.launchData?.moveOn ?? 'CompletedOrPassed',
      getMasteryScore: () => this.launchData?.masteryScore,
      getReturnURL: () => this.launchData?.returnURL,
      getLaunchParameters: () => this.launchData?.launchParameters,

      // Configuration
      actor: this.config.actor,
      activityId: this.config.activityId,
      registration: this.config.registrationId,
      endpoint: this.config.lrsEndpoint,

      // Status checks
      isInitialized: () => this.isInitialized,
      isTerminated: () => this.isTerminated,
      isCompleted: () => this.completionSent,
      isPassed: () => this.lastResult.status === 'passed',
      isFailed: () => this.lastResult.status === 'failed',
    };
  }

  /**
   * Initialize from content (returns already initialized state).
   */
  private initializeFromContent(): boolean {
    return this.isInitialized;
  }

  /**
   * Terminate from content.
   */
  private async terminateFromContent(): Promise<boolean> {
    if (!this.isInitialized || this.isTerminated) return false;
    await this.terminate();
    return true;
  }

  /**
   * Send passed statement.
   */
  async passed(score?: number): Promise<void> {
    if (this.successSent) return;

    const result: XApiResult = {
      success: true,
      duration: formatIsoDuration((Date.now() - this.sessionStartTime) / 1000),
    };

    if (score !== undefined) {
      const masteryScore = this.launchData?.masteryScore;
      result.score = {
        scaled: score,
      };

      // Check against mastery score
      if (masteryScore !== undefined && score < masteryScore) {
        // Score doesn't meet mastery - send failed instead
        await this.failed(score);
        return;
      }
    }

    await this.sendCmi5Statement(CMI5_VERBS.PASSED, result);
    this.successSent = true;
    this.lastResult = {
      status: 'passed',
      success: true,
      score: result.score,
    };

    this.notifyCompletion();
  }

  /**
   * Send failed statement.
   */
  async failed(score?: number): Promise<void> {
    if (this.successSent) return;

    const result: XApiResult = {
      success: false,
      duration: formatIsoDuration((Date.now() - this.sessionStartTime) / 1000),
    };

    if (score !== undefined) {
      result.score = {
        scaled: score,
      };
    }

    await this.sendCmi5Statement(CMI5_VERBS.FAILED, result);
    this.successSent = true;
    this.lastResult = {
      status: 'failed',
      success: false,
      score: result.score,
    };

    this.notifyCompletion();
  }

  /**
   * Send completed statement.
   */
  async completed(): Promise<void> {
    if (this.completionSent) return;

    const result: XApiResult = {
      completion: true,
      duration: formatIsoDuration((Date.now() - this.sessionStartTime) / 1000),
    };

    await this.sendCmi5Statement(CMI5_VERBS.COMPLETED, result);
    this.completionSent = true;

    if (this.lastResult.status !== 'passed' && this.lastResult.status !== 'failed') {
      this.lastResult = {
        ...this.lastResult,
        status: 'completed',
      };
    }

    this.notifyProgress();
  }

  /**
   * Set progress (0-1).
   */
  async setProgress(progress: number): Promise<void> {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    this.stateData.progress = clampedProgress * 100;

    // Store in state API
    await this.setState('progress', clampedProgress);

    this.notifyProgress();
  }

  /**
   * Get state from the state API.
   */
  async getState(stateId: string): Promise<unknown> {
    if (this.stateData[stateId] !== undefined) {
      return this.stateData[stateId];
    }

    try {
      const params = new URLSearchParams({
        activityId: this.config.activityId,
        agent: JSON.stringify(this.config.actor),
        registration: this.config.registrationId,
        stateId,
      });

      const response = await fetch(`${this.config.lrsEndpoint}/activities/state?${params}`, {
        headers: {
          Authorization: `Bearer ${this.config.authToken}`,
          'X-Experience-API-Version': '1.0.3',
        },
      });

      if (response.ok) {
        const value = await response.json();
        this.stateData[stateId] = value;
        return value;
      }
    } catch {
      // Silently fail
    }

    return undefined;
  }

  /**
   * Set state in the state API.
   */
  async setState(stateId: string, value: unknown): Promise<void> {
    this.stateData[stateId] = value;

    try {
      const params = new URLSearchParams({
        activityId: this.config.activityId,
        agent: JSON.stringify(this.config.actor),
        registration: this.config.registrationId,
        stateId,
      });

      await fetch(`${this.config.lrsEndpoint}/activities/state?${params}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.authToken}`,
          'X-Experience-API-Version': '1.0.3',
        },
        body: JSON.stringify(value),
      });
    } catch {
      // Store for later sync
    }
  }

  /**
   * Delete state from the state API.
   */
  async deleteState(stateId: string): Promise<void> {
    delete this.stateData[stateId];

    try {
      const params = new URLSearchParams({
        activityId: this.config.activityId,
        agent: JSON.stringify(this.config.actor),
        registration: this.config.registrationId,
        stateId,
      });

      await fetch(`${this.config.lrsEndpoint}/activities/state?${params}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.config.authToken}`,
          'X-Experience-API-Version': '1.0.3',
        },
      });
    } catch {
      // Silently fail
    }
  }

  /**
   * Send a cmi5-compliant statement.
   */
  private async sendCmi5Statement(verb: XApiVerb, result?: XApiResult): Promise<void> {
    const statement = this.buildCmi5Statement(verb, result);

    // Notify commit handler
    if (this.config.onCommit) {
      await this.config.onCommit({
        format: 'cmi5',
        statements: [statement],
      });
    }

    // Send to LRS
    try {
      const response = await fetch(`${this.config.lrsEndpoint}/statements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.authToken}`,
          'X-Experience-API-Version': '1.0.3',
        },
        body: JSON.stringify(statement),
      });

      if (!response.ok) {
        throw new Error(`LRS returned ${response.status}`);
      }
    } catch (error) {
      if (this.config.onError) {
        this.config.onError({
          code: 'LRS_ERROR',
          message: 'Failed to send cmi5 statement',
          diagnostic: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  /**
   * Build a cmi5-compliant statement.
   */
  private buildCmi5Statement(verb: XApiVerb, result?: XApiResult): XApiStatement {
    // Build context with cmi5 requirements
    const context: XApiContext = {
      registration: this.config.registrationId,
      contextActivities: {
        category: [CMI5_CATEGORY],
        ...(this.launchData?.contextTemplate?.contextActivities ?? {}),
      },
      extensions: {
        [CMI5_CONTEXT_EXTENSIONS.SESSION_ID]: this.sessionId,
        ...(this.launchData?.contextTemplate?.extensions ?? {}),
      },
    };

    // Add mastery score to context if available
    if (this.launchData?.masteryScore !== undefined && context.extensions) {
      context.extensions[CMI5_CONTEXT_EXTENSIONS.MASTERY_SCORE] = this.launchData.masteryScore;
    }

    // Add launch mode
    if (this.launchData?.launchMode && context.extensions) {
      context.extensions[CMI5_CONTEXT_EXTENSIONS.LAUNCH_MODE] = this.launchData.launchMode;
    }

    // Add move on criteria
    if (this.launchData?.moveOn && context.extensions) {
      context.extensions[CMI5_CONTEXT_EXTENSIONS.MOVE_ON] = this.launchData.moveOn;
    }

    return {
      id: generateUUID(),
      actor: this.config.actor,
      verb,
      object: {
        objectType: 'Activity',
        id: this.config.activityId,
      },
      result,
      context,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Terminate the wrapper.
   */
  async terminate(): Promise<void> {
    if (!this.isInitialized || this.isTerminated) return;

    // Calculate session duration
    const sessionSeconds = (Date.now() - this.sessionStartTime) / 1000;

    // Send terminated statement (required by cmi5)
    await this.sendCmi5Statement(CMI5_VERBS.TERMINATED, {
      duration: formatIsoDuration(sessionSeconds),
    });

    this.isTerminated = true;

    // Final commit
    if (this.config.onCommit) {
      await this.config.onCommit({
        format: 'cmi5',
        stateData: this.stateData,
      });
    }

    // Notify completion
    if (this.config.onComplete) {
      this.config.onComplete(this.getResult());
    }
  }

  /**
   * Get current progress.
   */
  getProgress(): WrapperProgress {
    const percent = this.stateData.progress ?? 0;
    const sessionSeconds = this.isInitialized ? (Date.now() - this.sessionStartTime) / 1000 : 0;

    return {
      percent,
      location: this.stateData.location as string | undefined,
      suspendData: this.stateData.suspendData as string | undefined,
      sessionTime: formatIsoDuration(sessionSeconds),
    };
  }

  /**
   * Get current result.
   */
  getResult(): WrapperResult {
    const sessionSeconds = this.isInitialized ? (Date.now() - this.sessionStartTime) / 1000 : 0;

    return {
      ...this.lastResult,
      totalTime: formatIsoDuration(sessionSeconds),
      location: this.stateData.location as string | undefined,
      suspendData: this.stateData.suspendData as string | undefined,
    };
  }

  /**
   * Check if content is complete based on moveOn criteria.
   */
  isComplete(): boolean {
    const moveOn = this.launchData?.moveOn ?? 'CompletedOrPassed';

    switch (moveOn) {
      case 'Passed':
        return this.lastResult.status === 'passed';
      case 'Completed':
        return this.completionSent;
      case 'CompletedAndPassed':
        return this.completionSent && this.lastResult.status === 'passed';
      case 'CompletedOrPassed':
        return this.completionSent || this.lastResult.status === 'passed';
      case 'NotApplicable':
        return true;
      default:
        return this.completionSent || this.lastResult.status === 'passed';
    }
  }

  /**
   * Force a commit.
   */
  async commit(): Promise<void> {
    if (this.config.onCommit) {
      await this.config.onCommit({
        format: 'cmi5',
        stateData: { ...this.stateData },
      });
    }
  }

  // ==========================================================================
  // PRIVATE HELPERS
  // ==========================================================================

  private notifyProgress(): void {
    if (this.config.onProgress) {
      this.config.onProgress(this.getProgress());
    }
  }

  private notifyCompletion(): void {
    if (this.config.onComplete) {
      this.config.onComplete(this.getResult());
    }
  }
}

/**
 * Create a cmi5 wrapper.
 */
export function createCmi5Wrapper(config: Cmi5Config): Cmi5Wrapper {
  return new Cmi5Wrapper(config);
}
