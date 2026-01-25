/**
 * LRS (Learning Record Store) Module
 *
 * Provides resilience patterns for xAPI statement ingestion,
 * including dead letter queue for failed writes.
 */

export {
  clearExhaustedStatements,
  type FailedStatement,
  getQueueStats,
  getStatementsForRetry,
  incrementRetryCount,
  markStatementProcessed,
  processRetryQueue,
  type QueueStats,
  queueFailedStatement,
  sendToLRSWithFallback,
} from './resilience';
