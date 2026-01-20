import { getAccessToken } from '@/lib/google/auth';
import { buildHandlerUrl, buildQueuePath, getCloudTasksConfig } from './queues';
import type {
  BaseTaskPayload,
  QueueName,
  TaskOptions,
  TaskPayload,
  TaskResult,
  TaskType,
} from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

const CLOUD_TASKS_API_BASE = 'https://cloudtasks.googleapis.com/v2';
const CLOUD_TASKS_SCOPE = 'https://www.googleapis.com/auth/cloud-tasks';

// ============================================================================
// TASK CREATION
// ============================================================================

/**
 * Creates a Cloud Tasks HTTP task payload for the API
 */
function createHttpTaskPayload(
  queueName: QueueName,
  payload: BaseTaskPayload,
  options?: TaskOptions,
): Record<string, unknown> {
  const config = getCloudTasksConfig();
  const handlerUrl = buildHandlerUrl(queueName);

  // Create task body
  const taskBody = {
    ...payload,
    createdAt: payload.createdAt ?? new Date().toISOString(),
    correlationId: payload.correlationId ?? crypto.randomUUID(),
  };

  const httpRequest: Record<string, unknown> = {
    url: handlerUrl,
    httpMethod: options?.httpMethod ?? 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Cloud-Tasks-Source': 'lxp360-saas',
      ...options?.headers,
    },
    body: Buffer.from(JSON.stringify(taskBody)).toString('base64'),
  };

  // Add OIDC token if service account is configured
  if (config.serviceAccountEmail) {
    httpRequest.oidcToken = {
      serviceAccountEmail: config.serviceAccountEmail,
      audience: handlerUrl,
    };
  }

  const task: Record<string, unknown> = {
    httpRequest,
  };

  // Add schedule time if specified
  if (options?.scheduleTime) {
    const scheduleDate =
      options.scheduleTime instanceof Date ? options.scheduleTime : new Date(options.scheduleTime);
    task.scheduleTime = scheduleDate.toISOString();
  }

  // Add dispatch deadline if specified
  if (options?.dispatchDeadlineSeconds) {
    task.dispatchDeadline = `${options.dispatchDeadlineSeconds}s`;
  }

  // Add task name for deduplication if specified
  if (options?.taskName) {
    const queuePath = buildQueuePath(queueName);
    task.name = `${queuePath}/tasks/${options.taskName}`;
  }

  return task;
}

/**
 * Enqueues a task to a specific Cloud Tasks queue
 *
 * @param queue - The queue to enqueue the task to
 * @param payload - The task payload
 * @param options - Optional task configuration
 * @returns TaskResult with the created task name
 *
 * @example
 * ```typescript
 * const result = await enqueueTask('email-queue', {
 *   type: 'email:welcome',
 *   data: {
 *     to: 'user@example.com',
 *     firstName: 'John',
 *     loginUrl: 'https://app.lxd360.com/login',
 *   },
 * });
 * ```
 */
export async function enqueueTask(
  queue: QueueName,
  payload: TaskPayload,
  options?: TaskOptions,
): Promise<TaskResult> {
  try {
    const accessToken = await getAccessToken([CLOUD_TASKS_SCOPE]);
    const queuePath = buildQueuePath(queue);
    const task = createHttpTaskPayload(queue, payload, options);

    const response = await fetch(`${CLOUD_TASKS_API_BASE}/${queuePath}/tasks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ task }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloud Tasks API error:', errorText);
      return {
        name: '',
        httpStatus: response.status,
        success: false,
        error: `Cloud Tasks API error: ${response.status} - ${errorText}`,
      };
    }

    const result = (await response.json()) as { name: string };

    return {
      name: result.name,
      httpStatus: response.status,
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to enqueue task:', errorMessage);
    return {
      name: '',
      httpStatus: 500,
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Schedules a task to run at a specific time
 *
 * @param queue - The queue to enqueue the task to
 * @param payload - The task payload
 * @param executeAt - When to execute the task
 * @param options - Optional additional task configuration
 * @returns TaskResult with the created task name
 *
 * @example
 * ```typescript
 * // Schedule email to send in 1 hour
 * const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
 * const result = await scheduleTask(
 *   'email-queue',
 *   {
 *     type: 'email:password-reset',
 *     data: { to: 'user@example.com', firstName: 'John', resetUrl: '...' },
 *   },
 *   oneHourFromNow
 * );
 * ```
 */
export async function scheduleTask(
  queue: QueueName,
  payload: TaskPayload,
  executeAt: Date,
  options?: Omit<TaskOptions, 'scheduleTime'>,
): Promise<TaskResult> {
  return enqueueTask(queue, payload, {
    ...options,
    scheduleTime: executeAt,
  });
}

/**
 * Enqueues a task with automatic queue selection based on task type
 *
 * @param payload - The task payload (queue is determined from type)
 * @param options - Optional task configuration
 * @returns TaskResult with the created task name
 *
 * @example
 * ```typescript
 * // Queue is automatically selected based on task type
 * const result = await enqueueTaskAuto({
 *   type: 'video:generate',
 *   data: { projectId: '123', sceneId: '456', outputFormat: 'mp4', quality: 'high', userId: 'user-1' },
 * });
 * ```
 */
export async function enqueueTaskAuto(
  payload: TaskPayload,
  options?: TaskOptions,
): Promise<TaskResult> {
  // Import here to avoid circular dependency
  const { getQueueForTaskType: getQueue } = await import('./types');
  const queue = getQueue(payload.type);
  return enqueueTask(queue, payload, options);
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Enqueues multiple tasks to the same queue
 *
 * @param queue - The queue to enqueue tasks to
 * @param tasks - Array of task payloads with optional per-task options
 * @returns Array of TaskResults
 *
 * @example
 * ```typescript
 * const results = await enqueueBatch('email-queue', [
 *   { payload: { type: 'email:welcome', data: {...} } },
 *   { payload: { type: 'email:verification', data: {...} } },
 * ]);
 * ```
 */
export async function enqueueBatch(
  queue: QueueName,
  tasks: Array<{ payload: TaskPayload; options?: TaskOptions }>,
): Promise<TaskResult[]> {
  // Process tasks in parallel with a concurrency limit
  const BATCH_SIZE = 10;
  const results: TaskResult[] = [];

  for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
    const batch = tasks.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(({ payload, options }) => enqueueTask(queue, payload, options)),
    );
    results.push(...batchResults);
  }

  return results;
}

// ============================================================================
// TASK HELPERS
// ============================================================================

/**
 * Creates a unique task name for deduplication
 *
 * @param prefix - Task name prefix
 * @param identifiers - Unique identifiers to include
 * @returns Unique task name
 */
export function createTaskName(prefix: string, ...identifiers: string[]): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  const idPart = identifiers.join('-');
  return `${prefix}-${idPart}-${timestamp}-${random}`;
}

/**
 * Creates a correlation ID for tracing related tasks
 */
export function createCorrelationId(): string {
  return crypto.randomUUID();
}

// ============================================================================
// TYPED TASK CREATORS
// ============================================================================

/**
 * Type-safe email task enqueue helper
 */
export async function enqueueEmailTask(
  type: Extract<TaskType, `email:${string}`>,
  data: Record<string, unknown>,
  options?: TaskOptions,
): Promise<TaskResult> {
  return enqueueTask(
    'email-queue',
    {
      type,
      data,
    } as TaskPayload,
    options,
  );
}

/**
 * Type-safe video task enqueue helper
 */
export async function enqueueVideoTask(
  type: Extract<TaskType, `video:${string}`>,
  data: Record<string, unknown>,
  options?: TaskOptions,
): Promise<TaskResult> {
  return enqueueTask(
    'video-generation-queue',
    {
      type,
      data,
    } as TaskPayload,
    options,
  );
}

/**
 * Type-safe analytics task enqueue helper
 */
export async function enqueueAnalyticsTask(
  type: Extract<TaskType, `analytics:${string}`>,
  data: Record<string, unknown>,
  options?: TaskOptions,
): Promise<TaskResult> {
  return enqueueTask(
    'analytics-queue',
    {
      type,
      data,
    } as TaskPayload,
    options,
  );
}

/**
 * Type-safe subscription task enqueue helper
 */
export async function enqueueSubscriptionTask(
  type: Extract<TaskType, `subscription:${string}`>,
  data: Record<string, unknown>,
  options?: TaskOptions,
): Promise<TaskResult> {
  return enqueueTask(
    'subscription-queue',
    {
      type,
      data,
    } as TaskPayload,
    options,
  );
}
