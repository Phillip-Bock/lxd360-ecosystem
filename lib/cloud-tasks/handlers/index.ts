import type {
  AnalyticsTaskPayload,
  EmailTaskPayload,
  QueueName,
  SubscriptionTaskPayload,
  TaskHandlerResult,
  TaskPayload,
  VideoTaskPayload,
} from '../types';
import { handleAnalyticsTask } from './analytics-handler';
import { handleEmailTask } from './email-handler';
import { handleSubscriptionTask } from './subscription-handler';
import { handleVideoTask } from './video-handler';

// ============================================================================
// EXPORTS
// ============================================================================

export { handleAnalyticsTask } from './analytics-handler';
export { handleEmailTask } from './email-handler';
export { handleSubscriptionTask } from './subscription-handler';
export { handleVideoTask } from './video-handler';

// ============================================================================
// UNIFIED HANDLER
// ============================================================================

/**
 * Routes a task to the appropriate handler based on queue name
 *
 * @param queue - The queue the task came from
 * @param payload - The task payload
 * @returns TaskHandlerResult
 */
export async function routeTaskToHandler(
  queue: QueueName,
  payload: TaskPayload,
): Promise<TaskHandlerResult> {
  switch (queue) {
    case 'email-queue':
      return handleEmailTask(payload as EmailTaskPayload);

    case 'video-generation-queue':
      return handleVideoTask(payload as VideoTaskPayload);

    case 'analytics-queue':
      return handleAnalyticsTask(payload as AnalyticsTaskPayload);

    case 'subscription-queue':
      return handleSubscriptionTask(payload as SubscriptionTaskPayload);

    default:
      return {
        success: false,
        error: `Unknown queue: ${queue}`,
      };
  }
}

/**
 * Handler registry for type-safe handler lookup
 */
export const HANDLER_REGISTRY = {
  'email-queue': handleEmailTask,
  'video-generation-queue': handleVideoTask,
  'analytics-queue': handleAnalyticsTask,
  'subscription-queue': handleSubscriptionTask,
} as const;
