// ============================================================================
// CLIENT EXPORTS
// ============================================================================

export {
  createCorrelationId,
  createTaskName,
  enqueueAnalyticsTask,
  enqueueBatch,
  enqueueEmailTask,
  enqueueSubscriptionTask,
  enqueueTask,
  enqueueTaskAuto,
  enqueueVideoTask,
  scheduleTask,
} from './client';

// ============================================================================
// QUEUE EXPORTS
// ============================================================================

export type { CloudTasksEnvConfig } from './queues';
export {
  buildHandlerUrl,
  buildQueuePath,
  getAllQueueNames,
  getCloudTasksConfig,
  getQueueConfig,
  isValidQueueName,
  QUEUES,
} from './queues';

// ============================================================================
// HANDLER EXPORTS
// ============================================================================

export {
  HANDLER_REGISTRY,
  handleAnalyticsTask,
  handleEmailTask,
  handleSubscriptionTask,
  handleVideoTask,
  routeTaskToHandler,
} from './handlers';

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  // Analytics types
  AnalyticsAggregatePayload,
  AnalyticsExportPayload,
  AnalyticsReportPayload,
  AnalyticsTaskPayload,
  AnalyticsXAPIBatchPayload,
  // Base types
  BaseTaskPayload,
  // Handler types
  CloudTasksHeaders,
  // Email types
  EmailBatchPayload,
  EmailCertificateEarnedPayload,
  EmailCourseEnrolledPayload,
  EmailPasswordResetPayload,
  EmailSendPayload,
  EmailTaskPayload,
  EmailVerificationPayload,
  EmailWelcomePayload,
  QueueConfig,
  QueueName,
  RetryConfig,
  // Subscription types
  SubscriptionExpiringPayload,
  SubscriptionRenewalPayload,
  SubscriptionSyncPayload,
  SubscriptionTaskPayload,
  SubscriptionWebhookPayload,
  TaskContext,
  TaskHandler,
  TaskHandlerResult,
  TaskOptions,
  TaskPayload,
  TaskResult,
  TaskType,
  // Video types
  VideoGeneratePayload,
  VideoProcessPayload,
  VideoTaskPayload,
  VideoThumbnailPayload,
  VideoTranscodePayload,
} from './types';

export {
  getQueueForTaskType,
  isAnalyticsTask,
  isEmailTask,
  isSubscriptionTask,
  isVideoTask,
} from './types';
