import { isValidQueueName, routeTaskToHandler } from '@/lib/cloud-tasks';
import type { QueueName, TaskContext, TaskPayload } from '@/lib/cloud-tasks/types';
import { logger } from '@/lib/logger';

const log = logger.scope('CloudTasks');

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Extract Cloud Tasks context from request headers
 */
function extractTaskContext(headers: Headers): TaskContext {
  return {
    taskName: headers.get('X-CloudTasks-TaskName') ?? '',
    retryCount: Number.parseInt(headers.get('X-CloudTasks-TaskRetryCount') ?? '0', 10),
    executionCount: Number.parseInt(headers.get('X-CloudTasks-TaskExecutionCount') ?? '0', 10),
    scheduledTime: headers.get('X-CloudTasks-TaskETA'),
    queueName: headers.get('X-CloudTasks-QueueName') ?? '',
  };
}

/**
 * Verify that the request came from Cloud Tasks
 *
 * In production, this should verify OIDC tokens.
 * For development, we check for Cloud Tasks headers.
 */
function verifyCloudTasksRequest(headers: Headers): boolean {
  // In development, allow requests without Cloud Tasks headers for testing
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // In production, verify Cloud Tasks headers exist
  const hasCloudTasksHeaders = headers.has('X-CloudTasks-TaskName');

  // TODO(LXD-247): Add OIDC token verification for production
  // const authHeader = headers.get('Authorization');
  // if (authHeader?.startsWith('Bearer ')) {
  //   const token = authHeader.slice(7);
  //   // Verify token with Google
  // }

  return hasCloudTasksHeaders;
}

// ============================================================================
// ROUTE HANDLER
// ============================================================================

/**
 * POST handler for Cloud Tasks
 *
 * @param request - The incoming request
 * @param params - Route parameters including queue name
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ queue: string }> },
): Promise<Response> {
  const startTime = Date.now();
  const { queue } = await params;

  // Validate queue name
  if (!isValidQueueName(queue)) {
    log.error('Invalid queue name', { queue });
    return Response.json(
      {
        success: false,
        error: { code: 'INVALID_QUEUE', message: `Invalid queue name: ${queue}` },
        meta: { timestamp: new Date().toISOString() },
      },
      { status: 400 },
    );
  }

  // Verify request authenticity
  if (!verifyCloudTasksRequest(request.headers)) {
    log.error('Unauthorized request - missing Cloud Tasks headers');
    return Response.json(
      {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Request not from Cloud Tasks' },
        meta: { timestamp: new Date().toISOString() },
      },
      { status: 401 },
    );
  }

  // Extract task context from headers
  const taskContext = extractTaskContext(request.headers);

  try {
    // Parse request body
    const payload = (await request.json()) as TaskPayload;

    // Log task execution start
    log.info('Processing task', { type: payload.type, queue, attempt: taskContext.retryCount + 1 });

    // Route to appropriate handler
    const result = await routeTaskToHandler(queue as QueueName, payload);

    const duration = Date.now() - startTime;

    if (result.success) {
      log.info('Task completed successfully', { type: payload.type, duration });
      return Response.json(
        {
          success: true,
          data: result.data,
          meta: {
            timestamp: new Date().toISOString(),
            duration,
            taskName: taskContext.taskName,
            retryCount: taskContext.retryCount,
          },
        },
        { status: 200 },
      );
    }

    // Task handler returned failure
    log.error('Task failed', { type: payload.type, error: result.error });
    return Response.json(
      {
        success: false,
        error: {
          code: 'HANDLER_ERROR',
          message: result.error ?? 'Task handler returned failure',
        },
        meta: {
          timestamp: new Date().toISOString(),
          duration,
          taskName: taskContext.taskName,
          retryCount: taskContext.retryCount,
        },
      },
      { status: 500 },
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    log.error('Task execution error', { queue, error: errorMessage });

    // Return 500 to trigger Cloud Tasks retry
    return Response.json(
      {
        success: false,
        error: { code: 'EXECUTION_ERROR', message: errorMessage },
        meta: {
          timestamp: new Date().toISOString(),
          duration,
          taskName: taskContext.taskName,
          retryCount: taskContext.retryCount,
        },
      },
      { status: 500 },
    );
  }
}

/**
 * GET handler for health checks
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ queue: string }> },
): Promise<Response> {
  const { queue } = await params;

  if (!isValidQueueName(queue)) {
    return Response.json(
      {
        success: false,
        error: { code: 'INVALID_QUEUE', message: `Invalid queue name: ${queue}` },
      },
      { status: 400 },
    );
  }

  return Response.json({
    success: true,
    data: {
      queue,
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  });
}
