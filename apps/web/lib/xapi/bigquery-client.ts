import type { XAPIStatement } from '@/types/xapi';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Configuration for the BigQuery client
 */
export interface BigQueryClientConfig {
  /** Cloud Function URL for xAPI ingestion */
  functionUrl: string;
  /** Organization ID for multi-tenant isolation */
  organizationId: string;
  /** Optional session ID for grouping statements */
  sessionId?: string;
  /** Maximum number of statements per batch */
  maxBatchSize?: number;
  /** Interval in ms between batch flushes */
  flushInterval?: number;
  /** Maximum number of retries for failed requests */
  maxRetries?: number;
  /** Base delay in ms between retries (exponential backoff) */
  retryBaseDelay?: number;
  /** Enable offline queue when network is unavailable */
  enableOfflineQueue?: boolean;
  /** Maximum statements to store offline */
  maxOfflineQueueSize?: number;
  /** Optional authorization token */
  authToken?: string;
}

/**
 * Response from the BigQuery ingestion function
 */
export interface BigQueryIngestionResponse {
  success: boolean;
  data?: {
    statementIds: string[];
    count: number;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
  };
}

/**
 * Queued statement for batching/offline storage
 */
interface QueuedStatement {
  id: string;
  statement: XAPIStatement;
  queuedAt: string;
  attempts: number;
}

/**
 * Result of a batch send operation
 */
export interface BatchSendResult {
  success: boolean;
  sent: number;
  failed: number;
  statementIds: string[];
  errors: Array<{
    message: string;
    statements: number;
  }>;
}

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

const DEFAULT_CONFIG: Required<
  Omit<BigQueryClientConfig, 'functionUrl' | 'organizationId' | 'authToken' | 'sessionId'>
> = {
  maxBatchSize: 50,
  flushInterval: 10000, // 10 seconds
  maxRetries: 3,
  retryBaseDelay: 1000, // 1 second
  enableOfflineQueue: true,
  maxOfflineQueueSize: 500,
};

// =============================================================================
// BIGQUERY CLIENT CLASS
// =============================================================================

/**
 * Client for sending xAPI statements to BigQuery via Cloud Function
 */
export class BigQueryXAPIClient {
  private config: Required<Omit<BigQueryClientConfig, 'authToken' | 'sessionId'>> & {
    authToken?: string;
    sessionId?: string;
  };
  private queue: QueuedStatement[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private isFlushing = false;
  private isOnline = true;
  private listeners: Set<(status: ClientStatus) => void> = new Set();

  constructor(config: BigQueryClientConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    this.setupOnlineListener();
    this.loadOfflineQueue();
    this.startAutoFlush();
  }

  // ===========================================================================
  // PUBLIC API
  // ===========================================================================

  /**
   * Send a single xAPI statement to BigQuery
   */
  async sendStatement(statement: XAPIStatement): Promise<BigQueryIngestionResponse> {
    return this.sendStatements([statement]);
  }

  /**
   * Send multiple xAPI statements to BigQuery
   */
  async sendStatements(statements: XAPIStatement[]): Promise<BigQueryIngestionResponse> {
    if (!this.isOnline) {
      // Queue for later when offline
      this.queueStatements(statements);
      return {
        success: false,
        error: {
          code: 'OFFLINE',
          message: 'Statements queued for later - device is offline',
        },
      };
    }

    try {
      const response = await this.postStatements(statements);
      return response;
    } catch (error) {
      // Queue on failure
      this.queueStatements(statements);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network request failed',
        },
      };
    }
  }

  /**
   * Queue statements for batch sending
   */
  queueStatement(statement: XAPIStatement): void {
    this.queueStatements([statement]);
  }

  /**
   * Queue multiple statements for batch sending
   */
  queueStatements(statements: XAPIStatement[]): void {
    const now = new Date().toISOString();

    for (const statement of statements) {
      const queued: QueuedStatement = {
        id: statement.id || this.generateUUID(),
        statement,
        queuedAt: now,
        attempts: 0,
      };
      this.queue.push(queued);
    }

    // Trim queue if too large
    if (this.queue.length > this.config.maxOfflineQueueSize) {
      this.queue = this.queue.slice(-this.config.maxOfflineQueueSize);
    }

    this.saveOfflineQueue();
    this.notifyListeners();
  }

  /**
   * Flush all queued statements to BigQuery
   */
  async flush(): Promise<BatchSendResult> {
    if (this.isFlushing || !this.isOnline || this.queue.length === 0) {
      return {
        success: true,
        sent: 0,
        failed: 0,
        statementIds: [],
        errors: [],
      };
    }

    this.isFlushing = true;
    let totalSent = 0;
    let totalFailed = 0;
    const allStatementIds: string[] = [];
    const allErrors: BatchSendResult['errors'] = [];

    try {
      // Process in batches
      while (this.queue.length > 0 && this.isOnline) {
        const batch = this.queue.splice(0, this.config.maxBatchSize);
        const statements = batch.map((q) => q.statement);

        try {
          const response = await this.postStatements(statements);

          if (response.success && response.data) {
            totalSent += response.data.count;
            allStatementIds.push(...response.data.statementIds);
          } else {
            // Retry logic
            const retryable = batch.filter((item) => {
              item.attempts++;
              return item.attempts < this.config.maxRetries;
            });

            // Put retryable items back
            this.queue.unshift(...retryable);

            // Count failures
            const failed = batch.length - retryable.length;
            totalFailed += failed;

            if (failed > 0) {
              allErrors.push({
                message: response.error?.message || 'Unknown error',
                statements: failed,
              });
            }
          }
        } catch (error) {
          // Network error - put all back for retry
          const retryable = batch.filter((item) => {
            item.attempts++;
            return item.attempts < this.config.maxRetries;
          });

          this.queue.unshift(...retryable);

          const failed = batch.length - retryable.length;
          totalFailed += failed;

          if (failed > 0) {
            allErrors.push({
              message: error instanceof Error ? error.message : 'Network error',
              statements: failed,
            });
          }

          // Stop processing on network error
          break;
        }

        // Small delay between batches to avoid overwhelming the function
        if (this.queue.length > 0) {
          await this.delay(100);
        }
      }
    } finally {
      this.isFlushing = false;
      this.saveOfflineQueue();
      this.notifyListeners();
    }

    return {
      success: totalFailed === 0,
      sent: totalSent,
      failed: totalFailed,
      statementIds: allStatementIds,
      errors: allErrors,
    };
  }

  /**
   * Get current client status
   */
  getStatus(): ClientStatus {
    return {
      queueLength: this.queue.length,
      isOnline: this.isOnline,
      isFlushing: this.isFlushing,
      organizationId: this.config.organizationId,
      sessionId: this.config.sessionId,
    };
  }

  /**
   * Subscribe to status changes
   */
  onStatusChange(callback: (status: ClientStatus) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Clear all queued statements
   */
  clearQueue(): void {
    this.queue = [];
    this.saveOfflineQueue();
    this.notifyListeners();
  }

  /**
   * Update session ID
   */
  setSessionId(sessionId: string): void {
    this.config.sessionId = sessionId;
    this.notifyListeners();
  }

  /**
   * Test connectivity to the Cloud Function
   */
  async ping(): Promise<boolean> {
    try {
      const response = await fetch(this.config.functionUrl, {
        method: 'OPTIONS',
      });
      return response.ok || response.status === 204;
    } catch {
      return false;
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }

    this.listeners.clear();
  }

  // ===========================================================================
  // PRIVATE METHODS
  // ===========================================================================

  /**
   * Send statements to the Cloud Function
   */
  private async postStatements(statements: XAPIStatement[]): Promise<BigQueryIngestionResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.authToken) {
      headers.Authorization = `Bearer ${this.config.authToken}`;
    }

    const body = {
      statements,
      organizationId: this.config.organizationId,
      sessionId: this.config.sessionId,
    };

    let lastError: Error | null = null;

    // Retry with exponential backoff
    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        const response = await fetch(this.config.functionUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        });

        const data: BigQueryIngestionResponse = await response.json();

        if (response.ok && data.success) {
          return data;
        }

        // Non-retryable error (4xx)
        if (response.status >= 400 && response.status < 500) {
          return data;
        }

        // Server error - retry
        lastError = new Error(data.error?.message || `HTTP ${response.status}`);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
      }

      // Wait before retry
      if (attempt < this.config.maxRetries - 1) {
        await this.delay(this.config.retryBaseDelay * 2 ** attempt);
      }
    }

    throw lastError || new Error('Failed after retries');
  }

  /**
   * Setup online/offline listener
   */
  private setupOnlineListener(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    this.isOnline = navigator.onLine;
  }

  private handleOnline = (): void => {
    this.isOnline = true;
    this.notifyListeners();
    // Auto-flush when coming back online
    this.flush();
  };

  private handleOffline = (): void => {
    this.isOnline = false;
    this.notifyListeners();
  };

  /**
   * Start auto-flush timer
   */
  private startAutoFlush(): void {
    if (this.config.flushInterval > 0) {
      this.flushTimer = setInterval(() => {
        this.flush();
      }, this.config.flushInterval);
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveOfflineQueue(): void {
    if (!this.config.enableOfflineQueue || typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem('xapi_bigquery_queue', JSON.stringify(this.queue));
    } catch {
      // localStorage full or unavailable
    }
  }

  /**
   * Load queue from localStorage
   */
  private loadOfflineQueue(): void {
    if (!this.config.enableOfflineQueue || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const saved = localStorage.getItem('xapi_bigquery_queue');
      if (saved) {
        this.queue = JSON.parse(saved);
      }
    } catch {
      this.queue = [];
    }
  }

  /**
   * Notify all status listeners
   */
  private notifyListeners(): void {
    const status = this.getStatus();
    for (const callback of this.listeners) {
      callback(status);
    }
  }

  /**
   * Generate a UUID v4
   */
  private generateUUID(): string {
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
   * Promise-based delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// =============================================================================
// STATUS TYPE
// =============================================================================

/**
 * Client status information
 */
export interface ClientStatus {
  queueLength: number;
  isOnline: boolean;
  isFlushing: boolean;
  organizationId: string;
  sessionId?: string;
}

// =============================================================================
// SINGLETON MANAGEMENT
// =============================================================================

let defaultClient: BigQueryXAPIClient | null = null;

/**
 * Initialize the default BigQuery client
 */
export function initializeBigQueryClient(config: BigQueryClientConfig): BigQueryXAPIClient {
  if (defaultClient) {
    defaultClient.destroy();
  }

  defaultClient = new BigQueryXAPIClient(config);
  return defaultClient;
}

/**
 * Get the default BigQuery client
 * @throws Error if not initialized
 */
export function getBigQueryClient(): BigQueryXAPIClient {
  if (!defaultClient) {
    throw new Error('BigQuery client not initialized. Call initializeBigQueryClient first.');
  }
  return defaultClient;
}

/**
 * Check if BigQuery client is initialized
 */
export function hasBigQueryClient(): boolean {
  return defaultClient !== null;
}

/**
 * Send a statement using the default client
 */
export async function sendStatementToBigQuery(
  statement: XAPIStatement,
): Promise<BigQueryIngestionResponse> {
  const client = getBigQueryClient();
  return client.sendStatement(statement);
}

/**
 * Send multiple statements using the default client
 */
export async function sendStatementsToBigQuery(
  statements: XAPIStatement[],
): Promise<BigQueryIngestionResponse> {
  const client = getBigQueryClient();
  return client.sendStatements(statements);
}

/**
 * Queue a statement for batch sending using the default client
 */
export function queueStatementForBigQuery(statement: XAPIStatement): void {
  const client = getBigQueryClient();
  client.queueStatement(statement);
}

/**
 * Flush queued statements using the default client
 */
export async function flushBigQueryQueue(): Promise<BatchSendResult> {
  const client = getBigQueryClient();
  return client.flush();
}
