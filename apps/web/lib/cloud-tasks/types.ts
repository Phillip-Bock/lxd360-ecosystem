// ============================================================================
// QUEUE TYPES
// ============================================================================

/**
 * Available queue names for Cloud Tasks
 */
export type QueueName =
  | 'email-queue'
  | 'video-generation-queue'
  | 'analytics-queue'
  | 'subscription-queue';

/**
 * Retry configuration for queues
 */
export interface RetryConfig {
  /** Maximum number of retry attempts (default: 5) */
  maxAttempts: number;
  /** Minimum backoff duration in seconds (default: 1) */
  minBackoffSeconds: number;
  /** Maximum backoff duration in seconds (default: 60) */
  maxBackoffSeconds: number;
  /** Maximum time a task can be retried in seconds */
  maxDoublings?: number;
}

/**
 * Queue configuration
 */
export interface QueueConfig {
  /** Queue name */
  name: QueueName;
  /** Maximum dispatches per second */
  maxDispatchesPerSecond: number;
  /** Maximum concurrent dispatches */
  maxConcurrentDispatches: number;
  /** Retry configuration */
  retryConfig: RetryConfig;
  /** Queue description */
  description?: string;
}

// ============================================================================
// TASK TYPES
// ============================================================================

/**
 * All supported task types across the application
 */
export type TaskType =
  // Email tasks
  | 'email:send'
  | 'email:batch'
  | 'email:welcome'
  | 'email:password-reset'
  | 'email:verification'
  | 'email:course-enrolled'
  | 'email:certificate-earned'
  | 'email:subscription-created'
  | 'email:payment-failed'
  // Video tasks
  | 'video:generate'
  | 'video:process'
  | 'video:transcode'
  | 'video:thumbnail'
  // Analytics tasks
  | 'analytics:aggregate'
  | 'analytics:export'
  | 'analytics:report'
  | 'analytics:xapi-batch'
  // Subscription tasks
  | 'subscription:webhook'
  | 'subscription:renewal'
  | 'subscription:expiring'
  | 'subscription:sync';

/**
 * Base task payload interface
 */
export interface BaseTaskPayload {
  /** Task type identifier */
  type: TaskType;
  /** Task data */
  data: Record<string, unknown>;
  /** Correlation ID for tracing */
  correlationId?: string;
  /** Timestamp when task was created */
  createdAt?: string;
  /** Scheduled execution time (ISO 8601) */
  scheduledFor?: string;
}

/**
 * Task creation options
 */
export interface TaskOptions {
  /** Task name (for deduplication) */
  taskName?: string;
  /** Schedule time (ISO 8601 or Date) */
  scheduleTime?: Date | string;
  /** Dispatch deadline in seconds */
  dispatchDeadlineSeconds?: number;
  /** HTTP method for the task handler */
  httpMethod?: 'POST' | 'GET' | 'PUT' | 'DELETE';
  /** Custom headers to include */
  headers?: Record<string, string>;
}

/**
 * Task creation result
 */
export interface TaskResult {
  /** Task name (full resource path) */
  name: string;
  /** HTTP status code */
  httpStatus: number;
  /** Whether the task was created successfully */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

// ============================================================================
// EMAIL TASK PAYLOADS
// ============================================================================

/**
 * Email send task payload
 */
export interface EmailSendPayload extends BaseTaskPayload {
  type: 'email:send';
  data: {
    to: string;
    template: string;
    templateData: Record<string, unknown>;
    replyTo?: string;
  };
}

/**
 * Email batch task payload
 */
export interface EmailBatchPayload extends BaseTaskPayload {
  type: 'email:batch';
  data: {
    emails: Array<{
      to: string;
      template: string;
      templateData: Record<string, unknown>;
    }>;
  };
}

/**
 * Welcome email task payload
 */
export interface EmailWelcomePayload extends BaseTaskPayload {
  type: 'email:welcome';
  data: {
    to: string;
    firstName: string;
    loginUrl: string;
  };
}

/**
 * Password reset email task payload
 */
export interface EmailPasswordResetPayload extends BaseTaskPayload {
  type: 'email:password-reset';
  data: {
    to: string;
    firstName: string;
    resetUrl: string;
    expiresAt: string;
  };
}

/**
 * Verification email task payload
 */
export interface EmailVerificationPayload extends BaseTaskPayload {
  type: 'email:verification';
  data: {
    to: string;
    firstName: string;
    verifyUrl: string;
  };
}

/**
 * Course enrolled email task payload
 */
export interface EmailCourseEnrolledPayload extends BaseTaskPayload {
  type: 'email:course-enrolled';
  data: {
    to: string;
    firstName: string;
    courseName: string;
    courseUrl: string;
  };
}

/**
 * Certificate earned email task payload
 */
export interface EmailCertificateEarnedPayload extends BaseTaskPayload {
  type: 'email:certificate-earned';
  data: {
    to: string;
    firstName: string;
    courseName: string;
    certificateUrl: string;
  };
}

// ============================================================================
// VIDEO TASK PAYLOADS
// ============================================================================

/**
 * Video generation task payload
 */
export interface VideoGeneratePayload extends BaseTaskPayload {
  type: 'video:generate';
  data: {
    projectId: string;
    sceneId: string;
    outputFormat: 'mp4' | 'webm';
    quality: 'low' | 'medium' | 'high' | '4k';
    userId: string;
  };
}

/**
 * Video processing task payload
 */
export interface VideoProcessPayload extends BaseTaskPayload {
  type: 'video:process';
  data: {
    sourceUrl: string;
    outputPath: string;
    operations: Array<{
      type: 'trim' | 'resize' | 'compress' | 'watermark';
      params: Record<string, unknown>;
    }>;
  };
}

/**
 * Video transcode task payload
 */
export interface VideoTranscodePayload extends BaseTaskPayload {
  type: 'video:transcode';
  data: {
    sourceUrl: string;
    outputFormats: Array<'mp4' | 'webm' | 'hls'>;
    resolutions: Array<'360p' | '480p' | '720p' | '1080p' | '4k'>;
  };
}

/**
 * Video thumbnail task payload
 */
export interface VideoThumbnailPayload extends BaseTaskPayload {
  type: 'video:thumbnail';
  data: {
    videoUrl: string;
    timestamps: number[];
    outputPath: string;
  };
}

// ============================================================================
// ANALYTICS TASK PAYLOADS
// ============================================================================

/**
 * Analytics aggregation task payload
 */
export interface AnalyticsAggregatePayload extends BaseTaskPayload {
  type: 'analytics:aggregate';
  data: {
    organizationId: string;
    dateRange: {
      start: string;
      end: string;
    };
    metrics: string[];
  };
}

/**
 * Analytics export task payload
 */
export interface AnalyticsExportPayload extends BaseTaskPayload {
  type: 'analytics:export';
  data: {
    reportId: string;
    format: 'csv' | 'xlsx' | 'pdf';
    filters: Record<string, unknown>;
    requestedBy: string;
  };
}

/**
 * Analytics report generation task payload
 */
export interface AnalyticsReportPayload extends BaseTaskPayload {
  type: 'analytics:report';
  data: {
    reportType: 'course' | 'learner' | 'organization' | 'compliance';
    parameters: Record<string, unknown>;
    requestedBy: string;
  };
}

/**
 * xAPI batch processing task payload
 */
export interface AnalyticsXAPIBatchPayload extends BaseTaskPayload {
  type: 'analytics:xapi-batch';
  data: {
    statements: Array<{
      id: string;
      actor: Record<string, unknown>;
      verb: Record<string, unknown>;
      object: Record<string, unknown>;
      timestamp: string;
    }>;
    organizationId: string;
  };
}

// ============================================================================
// SUBSCRIPTION TASK PAYLOADS
// ============================================================================

/**
 * Subscription webhook task payload
 */
export interface SubscriptionWebhookPayload extends BaseTaskPayload {
  type: 'subscription:webhook';
  data: {
    eventType: string;
    stripeEventId: string;
    payload: Record<string, unknown>;
  };
}

/**
 * Subscription renewal task payload
 */
export interface SubscriptionRenewalPayload extends BaseTaskPayload {
  type: 'subscription:renewal';
  data: {
    subscriptionId: string;
    customerId: string;
    planId: string;
    renewalDate: string;
  };
}

/**
 * Subscription expiring task payload
 */
export interface SubscriptionExpiringPayload extends BaseTaskPayload {
  type: 'subscription:expiring';
  data: {
    subscriptionId: string;
    customerId: string;
    userId: string;
    expirationDate: string;
    daysUntilExpiry: number;
  };
}

/**
 * Subscription sync task payload
 */
export interface SubscriptionSyncPayload extends BaseTaskPayload {
  type: 'subscription:sync';
  data: {
    stripeSubscriptionId: string;
    action: 'create' | 'update' | 'cancel';
  };
}

// ============================================================================
// UNION TYPES
// ============================================================================

/**
 * All email task payloads
 */
export type EmailTaskPayload =
  | EmailSendPayload
  | EmailBatchPayload
  | EmailWelcomePayload
  | EmailPasswordResetPayload
  | EmailVerificationPayload
  | EmailCourseEnrolledPayload
  | EmailCertificateEarnedPayload;

/**
 * All video task payloads
 */
export type VideoTaskPayload =
  | VideoGeneratePayload
  | VideoProcessPayload
  | VideoTranscodePayload
  | VideoThumbnailPayload;

/**
 * All analytics task payloads
 */
export type AnalyticsTaskPayload =
  | AnalyticsAggregatePayload
  | AnalyticsExportPayload
  | AnalyticsReportPayload
  | AnalyticsXAPIBatchPayload;

/**
 * All subscription task payloads
 */
export type SubscriptionTaskPayload =
  | SubscriptionWebhookPayload
  | SubscriptionRenewalPayload
  | SubscriptionExpiringPayload
  | SubscriptionSyncPayload;

/**
 * All task payloads
 */
export type TaskPayload =
  | EmailTaskPayload
  | VideoTaskPayload
  | AnalyticsTaskPayload
  | SubscriptionTaskPayload;

// ============================================================================
// HANDLER TYPES
// ============================================================================

/**
 * Task handler function signature
 */
export type TaskHandler<T extends BaseTaskPayload = BaseTaskPayload> = (
  payload: T,
) => Promise<TaskHandlerResult>;

/**
 * Task handler result
 */
export interface TaskHandlerResult {
  success: boolean;
  message?: string;
  data?: Record<string, unknown>;
  error?: string;
}

/**
 * Cloud Tasks HTTP request headers
 */
export interface CloudTasksHeaders {
  'X-CloudTasks-TaskName'?: string;
  'X-CloudTasks-TaskRetryCount'?: string;
  'X-CloudTasks-TaskExecutionCount'?: string;
  'X-CloudTasks-TaskETA'?: string;
  'X-CloudTasks-QueueName'?: string;
}

/**
 * Parsed Cloud Tasks request context
 */
export interface TaskContext {
  /** Task name (unique identifier) */
  taskName: string;
  /** Number of times this task has been retried */
  retryCount: number;
  /** Total execution attempts */
  executionCount: number;
  /** Estimated time of arrival (scheduled time) */
  scheduledTime: string | null;
  /** Queue name */
  queueName: string;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if a task type is an email task
 */
export function isEmailTask(type: TaskType): boolean {
  return type.startsWith('email:');
}

/**
 * Check if a task type is a video task
 */
export function isVideoTask(type: TaskType): boolean {
  return type.startsWith('video:');
}

/**
 * Check if a task type is an analytics task
 */
export function isAnalyticsTask(type: TaskType): boolean {
  return type.startsWith('analytics:');
}

/**
 * Check if a task type is a subscription task
 */
export function isSubscriptionTask(type: TaskType): boolean {
  return type.startsWith('subscription:');
}

/**
 * Get queue name for a task type
 */
export function getQueueForTaskType(type: TaskType): QueueName {
  if (isEmailTask(type)) return 'email-queue';
  if (isVideoTask(type)) return 'video-generation-queue';
  if (isAnalyticsTask(type)) return 'analytics-queue';
  if (isSubscriptionTask(type)) return 'subscription-queue';

  // Default to analytics queue for unknown types
  return 'analytics-queue';
}
