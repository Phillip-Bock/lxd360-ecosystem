import type { QueueConfig, QueueName } from './types';

// ============================================================================
// QUEUE CONFIGURATIONS
// ============================================================================

/**
 * Email queue configuration
 * Used for transactional emails, notifications, and batch email sending
 */
const emailQueue: QueueConfig = {
  name: 'email-queue',
  maxDispatchesPerSecond: 10,
  maxConcurrentDispatches: 100,
  retryConfig: {
    maxAttempts: 5,
    minBackoffSeconds: 1,
    maxBackoffSeconds: 60,
    maxDoublings: 4,
  },
  description: 'Queue for email sending tasks including transactional and batch emails',
};

/**
 * Video generation queue configuration
 * Used for video processing, transcoding, and thumbnail generation
 */
const videoGenerationQueue: QueueConfig = {
  name: 'video-generation-queue',
  maxDispatchesPerSecond: 2,
  maxConcurrentDispatches: 10,
  retryConfig: {
    maxAttempts: 3,
    minBackoffSeconds: 10,
    maxBackoffSeconds: 300,
    maxDoublings: 3,
  },
  description: 'Queue for video processing tasks including generation, transcoding, and thumbnails',
};

/**
 * Analytics queue configuration
 * Used for xAPI processing, report generation, and data aggregation
 */
const analyticsQueue: QueueConfig = {
  name: 'analytics-queue',
  maxDispatchesPerSecond: 50,
  maxConcurrentDispatches: 200,
  retryConfig: {
    maxAttempts: 5,
    minBackoffSeconds: 2,
    maxBackoffSeconds: 120,
    maxDoublings: 4,
  },
  description: 'Queue for analytics tasks including xAPI processing and report generation',
};

/**
 * Subscription queue configuration
 * Used for Stripe webhook processing and subscription management
 */
const subscriptionQueue: QueueConfig = {
  name: 'subscription-queue',
  maxDispatchesPerSecond: 20,
  maxConcurrentDispatches: 50,
  retryConfig: {
    maxAttempts: 10,
    minBackoffSeconds: 5,
    maxBackoffSeconds: 600,
    maxDoublings: 5,
  },
  description: 'Queue for subscription tasks including Stripe webhooks and billing events',
};

// ============================================================================
// EXPORTED CONFIGURATIONS
// ============================================================================

/**
 * All queue configurations indexed by queue name
 */
export const QUEUES: Record<QueueName, QueueConfig> = {
  'email-queue': emailQueue,
  'video-generation-queue': videoGenerationQueue,
  'analytics-queue': analyticsQueue,
  'subscription-queue': subscriptionQueue,
};

/**
 * Get queue configuration by name
 */
export function getQueueConfig(queueName: QueueName): QueueConfig {
  const config = QUEUES[queueName];
  if (!config) {
    throw new Error(`Unknown queue: ${queueName}`);
  }
  return config;
}

/**
 * Get all queue names
 */
export function getAllQueueNames(): QueueName[] {
  return Object.keys(QUEUES) as QueueName[];
}

/**
 * Validate queue name
 */
export function isValidQueueName(name: string): name is QueueName {
  return name in QUEUES;
}

// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================

/**
 * Cloud Tasks environment configuration
 */
export interface CloudTasksEnvConfig {
  /** GCP Project ID */
  projectId: string;
  /** GCP Region (default: us-central1) */
  location: string;
  /** Base URL for task handlers */
  handlerBaseUrl: string;
  /** Service account email for OIDC authentication */
  serviceAccountEmail?: string;
}

/**
 * Get Cloud Tasks environment configuration
 */
export function getCloudTasksConfig(): CloudTasksEnvConfig {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const location = process.env.CLOUD_TASKS_LOCATION || 'us-central1';
  const handlerBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const serviceAccountEmail = process.env.CLOUD_TASKS_SERVICE_ACCOUNT;

  if (!projectId) {
    throw new Error(
      'Missing GCP project ID. Set GOOGLE_CLOUD_PROJECT or NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable.',
    );
  }

  return {
    projectId,
    location,
    handlerBaseUrl,
    serviceAccountEmail,
  };
}

/**
 * Build the full queue path for Cloud Tasks API
 */
export function buildQueuePath(queueName: QueueName): string {
  const config = getCloudTasksConfig();
  return `projects/${config.projectId}/locations/${config.location}/queues/${queueName}`;
}

/**
 * Build the task handler URL for a queue
 */
export function buildHandlerUrl(queueName: QueueName): string {
  const config = getCloudTasksConfig();
  return `${config.handlerBaseUrl}/api/tasks/${queueName}`;
}
