// =============================================================================
// xAPI WRAPPER
// =============================================================================
// Implements xAPI 1.0.3 communication for learning content.
// Provides sendStatement(), getState(), setState(), and getActivityProfile().
// =============================================================================

import type {
  ContentWrapper,
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

/**
 * Standard xAPI verbs.
 */
export const XAPI_VERBS = {
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
  ATTEMPTED: {
    id: 'http://adlnet.gov/expapi/verbs/attempted',
    display: { 'en-US': 'attempted' },
  },
  EXPERIENCED: {
    id: 'http://adlnet.gov/expapi/verbs/experienced',
    display: { 'en-US': 'experienced' },
  },
  ANSWERED: {
    id: 'http://adlnet.gov/expapi/verbs/answered',
    display: { 'en-US': 'answered' },
  },
  SUSPENDED: {
    id: 'http://adlnet.gov/expapi/verbs/suspended',
    display: { 'en-US': 'suspended' },
  },
  RESUMED: {
    id: 'http://adlnet.gov/expapi/verbs/resumed',
    display: { 'en-US': 'resumed' },
  },
  PROGRESSED: {
    id: 'http://adlnet.gov/expapi/verbs/progressed',
    display: { 'en-US': 'progressed' },
  },
} as const;

/**
 * Generate a UUID v4.
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
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
 * State data stored for the activity.
 */
interface XApiStateData {
  location?: string;
  progress?: number;
  suspendData?: string;
  totalTime?: number;
  [key: string]: unknown;
}

/**
 * xAPI wrapper implementation.
 */
export class XApiWrapper implements ContentWrapper {
  readonly format = 'xapi' as const;

  private config: XApiConfig;
  private isInitialized = false;
  private isTerminated = false;
  private sessionStartTime: number = 0;
  private stateData: XApiStateData = {};
  private pendingStatements: XApiStatement[] = [];
  private lastResult: WrapperResult = { status: 'incomplete' };

  constructor(config: XApiConfig) {
    this.config = config;
  }

  /**
   * Initialize the wrapper and inject xAPI helper into iframe window.
   */
  async initialize(iframeWindow: Window): Promise<void> {
    // Create the xAPI helper object
    const xapiHelper = this.createXApiHelper();

    // Inject xAPI helper into the iframe window
    (iframeWindow as Window & { xAPI: typeof xapiHelper }).xAPI = xapiHelper;
    (iframeWindow as Window & { ADL: { XAPIWrapper: typeof xapiHelper } }).ADL = {
      XAPIWrapper: xapiHelper,
    };

    // Also set up TinCan.js compatibility
    (iframeWindow as Window & { TinCan: { LRS: unknown; Statement: unknown } }).TinCan = {
      LRS: this.createTinCanLRS(),
      Statement: XApiWrapper.createStatementClass(),
    };

    this.isInitialized = true;
    this.sessionStartTime = Date.now();

    // Send initialized statement
    await this.sendStatement(XAPI_VERBS.INITIALIZED);
  }

  /**
   * Create the xAPI helper object for content.
   */
  private createXApiHelper() {
    return {
      sendStatement: (
        verb: XApiVerb | string,
        result?: XApiResult,
        context?: XApiContext,
        object?: XApiActivity,
      ) => this.sendStatementFromContent(verb, result, context, object),
      getState: (stateId: string) => this.getState(stateId),
      setState: (stateId: string, value: unknown) => this.setState(stateId, value),
      deleteState: (stateId: string) => this.deleteState(stateId),
      getActivityProfile: (profileId: string) => this.getActivityProfile(profileId),
      setActivityProfile: (profileId: string, value: unknown) =>
        this.setActivityProfile(profileId, value),
      getActivityState: () => this.getAllState(),
      actor: this.config.actor,
      activityId: this.config.activityId,
      endpoint: this.config.lrsEndpoint,
    };
  }

  /**
   * Create TinCan.js LRS compatibility object.
   */
  private createTinCanLRS() {
    const self = this;
    return class LRS {
      endpoint = self.config.lrsEndpoint;
      actor = self.config.actor;

      saveStatement(
        statement: XApiStatement,
        callback?: (error: Error | null, result: unknown) => void,
      ): void {
        self
          .sendStatementDirect(statement)
          .then(() => callback?.(null, { success: true }))
          .catch((error: Error) => callback?.(error, null));
      }

      retrieveState(
        stateId: string,
        callback?: (error: Error | null, result: unknown) => void,
      ): void {
        const value = self.stateData[stateId];
        callback?.(null, value);
      }

      saveState(
        stateId: string,
        value: unknown,
        callback?: (error: Error | null, result: unknown) => void,
      ): void {
        self
          .setState(stateId, value)
          .then(() => callback?.(null, { success: true }))
          .catch((error: Error) => callback?.(error, null));
      }
    };
  }

  /**
   * Create TinCan.js Statement class compatibility.
   */
  private static createStatementClass() {
    return class Statement implements XApiStatement {
      id?: string;
      actor: XApiActor;
      verb: XApiVerb;
      object: XApiActivity;
      result?: XApiResult;
      context?: XApiContext;
      timestamp?: string;

      constructor(params: Partial<XApiStatement>) {
        this.id = params.id ?? generateUUID();
        this.actor = params.actor ?? { name: 'Unknown' };
        this.verb = params.verb ?? { id: '', display: {} };
        this.object = params.object ?? { id: '' };
        this.result = params.result;
        this.context = params.context;
        this.timestamp = params.timestamp ?? new Date().toISOString();
      }
    };
  }

  /**
   * Send a statement from content (via injected helper).
   */
  private async sendStatementFromContent(
    verb: XApiVerb | string,
    result?: XApiResult,
    context?: XApiContext,
    object?: XApiActivity,
  ): Promise<string> {
    const resolvedVerb: XApiVerb =
      typeof verb === 'string'
        ? { id: verb, display: { 'en-US': verb.split('/').pop() ?? verb } }
        : verb;

    const statement = this.buildStatement(resolvedVerb, result, context, object);
    return this.sendStatementDirect(statement);
  }

  /**
   * Send a statement with a standard verb.
   */
  async sendStatement(verb: XApiVerb, result?: XApiResult, context?: XApiContext): Promise<string> {
    const statement = this.buildStatement(verb, result, context);
    return this.sendStatementDirect(statement);
  }

  /**
   * Send a statement directly to LRS.
   */
  private async sendStatementDirect(statement: XApiStatement): Promise<string> {
    // Ensure statement has an ID
    const statementWithId: XApiStatement = {
      ...statement,
      id: statement.id ?? generateUUID(),
      timestamp: statement.timestamp ?? new Date().toISOString(),
    };

    // Update internal result tracking based on verb
    this.updateResultFromStatement(statementWithId);

    // Notify commit handler
    if (this.config.onCommit) {
      await this.config.onCommit({
        format: 'xapi',
        statements: [statementWithId],
      });
    }

    // Store in pending queue for batch sending
    this.pendingStatements.push(statementWithId);

    // Send to LRS
    try {
      await this.sendToLRS(statementWithId);
    } catch (error) {
      // Store for later retry
      if (this.config.onError) {
        this.config.onError({
          code: 'LRS_ERROR',
          message: 'Failed to send statement to LRS',
          diagnostic: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return statementWithId.id ?? '';
  }

  /**
   * Build a statement with the configured actor and activity.
   */
  private buildStatement(
    verb: XApiVerb,
    result?: XApiResult,
    context?: XApiContext,
    object?: XApiActivity,
  ): XApiStatement {
    return {
      id: generateUUID(),
      actor: this.config.actor,
      verb,
      object: object ?? {
        objectType: 'Activity',
        id: this.config.activityId,
      },
      result,
      context: {
        ...context,
        registration: context?.registration ?? this.config.enrollmentId,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Send statement to LRS.
   */
  private async sendToLRS(statement: XApiStatement): Promise<void> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Experience-API-Version': '1.0.3',
    };

    // Add authentication
    if (this.config.lrsAuth.type === 'basic') {
      const credentials = btoa(`${this.config.lrsAuth.username}:${this.config.lrsAuth.password}`);
      headers.Authorization = `Basic ${credentials}`;
    } else if (this.config.lrsAuth.token) {
      headers.Authorization = `Bearer ${this.config.lrsAuth.token}`;
    }

    const response = await fetch(`${this.config.lrsEndpoint}/statements`, {
      method: 'POST',
      headers,
      body: JSON.stringify(statement),
    });

    if (!response.ok) {
      throw new Error(`LRS returned ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Update internal result tracking based on statement verb.
   */
  private updateResultFromStatement(statement: XApiStatement): void {
    const verbId = statement.verb.id;

    if (verbId === XAPI_VERBS.COMPLETED.id) {
      this.lastResult = {
        ...this.lastResult,
        status: 'completed',
      };
      this.notifyProgress();
    } else if (verbId === XAPI_VERBS.PASSED.id) {
      this.lastResult = {
        status: 'passed',
        success: true,
        score: statement.result?.score,
      };
      this.notifyCompletion();
    } else if (verbId === XAPI_VERBS.FAILED.id) {
      this.lastResult = {
        status: 'failed',
        success: false,
        score: statement.result?.score,
      };
      this.notifyCompletion();
    } else if (
      verbId === XAPI_VERBS.PROGRESSED.id &&
      statement.result?.score?.scaled !== undefined
    ) {
      this.stateData.progress = statement.result.score.scaled * 100;
      this.notifyProgress();
    }
  }

  /**
   * Get state from the state API.
   */
  async getState(stateId: string): Promise<unknown> {
    // First check local cache
    if (this.stateData[stateId] !== undefined) {
      return this.stateData[stateId];
    }

    // Try to fetch from LRS
    try {
      const headers: HeadersInit = {
        'X-Experience-API-Version': '1.0.3',
      };

      if (this.config.lrsAuth.type === 'basic') {
        const credentials = btoa(`${this.config.lrsAuth.username}:${this.config.lrsAuth.password}`);
        headers.Authorization = `Basic ${credentials}`;
      } else if (this.config.lrsAuth.token) {
        headers.Authorization = `Bearer ${this.config.lrsAuth.token}`;
      }

      const params = new URLSearchParams({
        activityId: this.config.activityId,
        agent: JSON.stringify(this.config.actor),
        stateId,
      });

      const response = await fetch(`${this.config.lrsEndpoint}/activities/state?${params}`, {
        headers,
      });

      if (response.ok) {
        const value = await response.json();
        this.stateData[stateId] = value;
        return value;
      }
    } catch {
      // Silently fail - return undefined
    }

    return undefined;
  }

  /**
   * Set state in the state API.
   */
  async setState(stateId: string, value: unknown): Promise<void> {
    this.stateData[stateId] = value;

    // Persist to LRS
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'X-Experience-API-Version': '1.0.3',
      };

      if (this.config.lrsAuth.type === 'basic') {
        const credentials = btoa(`${this.config.lrsAuth.username}:${this.config.lrsAuth.password}`);
        headers.Authorization = `Basic ${credentials}`;
      } else if (this.config.lrsAuth.token) {
        headers.Authorization = `Bearer ${this.config.lrsAuth.token}`;
      }

      const params = new URLSearchParams({
        activityId: this.config.activityId,
        agent: JSON.stringify(this.config.actor),
        stateId,
      });

      await fetch(`${this.config.lrsEndpoint}/activities/state?${params}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(value),
      });
    } catch {
      // Store for later sync
    }

    // Notify progress if relevant state changed
    if (stateId === 'progress' || stateId === 'location' || stateId === 'suspendData') {
      this.notifyProgress();
    }
  }

  /**
   * Delete state from the state API.
   */
  async deleteState(stateId: string): Promise<void> {
    delete this.stateData[stateId];

    try {
      const headers: HeadersInit = {
        'X-Experience-API-Version': '1.0.3',
      };

      if (this.config.lrsAuth.type === 'basic') {
        const credentials = btoa(`${this.config.lrsAuth.username}:${this.config.lrsAuth.password}`);
        headers.Authorization = `Basic ${credentials}`;
      } else if (this.config.lrsAuth.token) {
        headers.Authorization = `Bearer ${this.config.lrsAuth.token}`;
      }

      const params = new URLSearchParams({
        activityId: this.config.activityId,
        agent: JSON.stringify(this.config.actor),
        stateId,
      });

      await fetch(`${this.config.lrsEndpoint}/activities/state?${params}`, {
        method: 'DELETE',
        headers,
      });
    } catch {
      // Silently fail
    }
  }

  /**
   * Get all state data.
   */
  getAllState(): XApiStateData {
    return { ...this.stateData };
  }

  /**
   * Get activity profile.
   */
  async getActivityProfile(profileId: string): Promise<unknown> {
    try {
      const headers: HeadersInit = {
        'X-Experience-API-Version': '1.0.3',
      };

      if (this.config.lrsAuth.type === 'basic') {
        const credentials = btoa(`${this.config.lrsAuth.username}:${this.config.lrsAuth.password}`);
        headers.Authorization = `Basic ${credentials}`;
      } else if (this.config.lrsAuth.token) {
        headers.Authorization = `Bearer ${this.config.lrsAuth.token}`;
      }

      const params = new URLSearchParams({
        activityId: this.config.activityId,
        profileId,
      });

      const response = await fetch(`${this.config.lrsEndpoint}/activities/profile?${params}`, {
        headers,
      });

      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Silently fail
    }

    return undefined;
  }

  /**
   * Set activity profile.
   */
  async setActivityProfile(profileId: string, value: unknown): Promise<void> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'X-Experience-API-Version': '1.0.3',
      };

      if (this.config.lrsAuth.type === 'basic') {
        const credentials = btoa(`${this.config.lrsAuth.username}:${this.config.lrsAuth.password}`);
        headers.Authorization = `Basic ${credentials}`;
      } else if (this.config.lrsAuth.token) {
        headers.Authorization = `Bearer ${this.config.lrsAuth.token}`;
      }

      const params = new URLSearchParams({
        activityId: this.config.activityId,
        profileId,
      });

      await fetch(`${this.config.lrsEndpoint}/activities/profile?${params}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(value),
      });
    } catch {
      // Silently fail
    }
  }

  /**
   * Terminate the wrapper.
   */
  async terminate(): Promise<void> {
    if (!this.isInitialized || this.isTerminated) return;

    // Calculate session duration
    const sessionSeconds = (Date.now() - this.sessionStartTime) / 1000;
    const duration = formatIsoDuration(sessionSeconds);

    // Send terminated statement
    await this.sendStatement(XAPI_VERBS.TERMINATED, {
      duration,
    });

    this.isTerminated = true;

    // Final commit
    if (this.config.onCommit) {
      await this.config.onCommit({
        format: 'xapi',
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
    const percent = typeof this.stateData.progress === 'number' ? this.stateData.progress : 0;

    const sessionSeconds = this.isInitialized ? (Date.now() - this.sessionStartTime) / 1000 : 0;

    return {
      percent,
      location: this.stateData.location as string | undefined,
      suspendData: this.stateData.suspendData as string | undefined,
      sessionTime: formatIsoDuration(sessionSeconds),
      totalTime: this.stateData.totalTime
        ? formatIsoDuration(this.stateData.totalTime as number)
        : undefined,
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
   * Check if content is complete.
   */
  isComplete(): boolean {
    return this.lastResult.status === 'completed' || this.lastResult.status === 'passed';
  }

  /**
   * Force a commit.
   */
  async commit(): Promise<void> {
    if (this.config.onCommit) {
      await this.config.onCommit({
        format: 'xapi',
        statements: [...this.pendingStatements],
        stateData: { ...this.stateData },
      });
      this.pendingStatements = [];
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
 * Create an xAPI wrapper.
 */
export function createXApiWrapper(config: XApiConfig): XApiWrapper {
  return new XApiWrapper(config);
}
