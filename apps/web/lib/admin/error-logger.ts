import { logger } from '@/lib/logger';
// Error Logger Utility
// Use this to log errors throughout the app
import { createErrorLog } from './data';
import type { ErrorSeverity } from './types';

const log = logger.child({ module: 'admin-error-logger' });

interface LogErrorOptions {
  error: Error | unknown;
  context?: {
    userId?: string;
    tenantId?: string;
    requestUrl?: string;
    requestMethod?: string;
    requestBody?: Record<string, unknown>;
  };
  severity?: ErrorSeverity;
  service?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

// Extract error info from various error types
function extractErrorInfo(error: unknown): {
  type: string;
  message: string;
  stack?: string;
  code?: string;
} {
  if (error instanceof Error) {
    const errorWithCode = error as Error & { code?: string };
    return {
      type: error.name || 'Error',
      message: error.message,
      stack: error.stack,
      code: errorWithCode.code,
    };
  }

  if (typeof error === 'string') {
    return {
      type: 'StringError',
      message: error,
    };
  }

  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, unknown>;
    return {
      type: String(obj.name || obj.type || 'UnknownError'),
      message: String(obj.message || obj.error || JSON.stringify(error)),
      code: obj.code ? String(obj.code) : undefined,
    };
  }

  return {
    type: 'UnknownError',
    message: 'An unknown error occurred',
  };
}

// Determine severity based on error type
function determineSeverity(errorInfo: ReturnType<typeof extractErrorInfo>): ErrorSeverity {
  const { type, message, code } = errorInfo;

  // Critical errors
  if (
    type.includes('Fatal') ||
    message.toLowerCase().includes('fatal') ||
    code === 'ECONNREFUSED' ||
    message.includes('database')
  ) {
    return 'critical';
  }

  // Warnings
  if (type === 'ValidationError' || type === 'TypeError' || message.includes('deprecated')) {
    return 'warning';
  }

  return 'error';
}

/**
 * Log an error to the database
 * Use this for errors that should be tracked and reviewed
 */
export async function logError(options: LogErrorOptions): Promise<void> {
  try {
    const errorInfo = extractErrorInfo(options.error);
    const severity = options.severity || determineSeverity(errorInfo);

    await createErrorLog({
      error_type: errorInfo.type,
      error_message: errorInfo.message,
      error_stack: errorInfo.stack,
      error_code: errorInfo.code,
      user_id: options.context?.userId,
      tenant_id: options.context?.tenantId,
      request_url: options.context?.requestUrl,
      request_method: options.context?.requestMethod,
      request_body: options.context?.requestBody,
      environment: process.env.NODE_ENV || 'development',
      service: options.service || 'web',
      version: process.env.APP_VERSION,
      severity,
      tags: options.tags,
      metadata: {
        ...options.metadata,
        originalError: options.error instanceof Error ? undefined : options.error,
      },
    });
  } catch (logError) {
    // If we can't log to the database, at least log to structured logger
    log.error('Failed to log error to database', { error: logError, originalError: options.error });
  }
}

/**
 * Wrapper for API route handlers that automatically logs errors
 */
export function withErrorLogging<T extends (...args: unknown[]) => Promise<Response>>(
  handler: T,
  options?: {
    service?: string;
    tags?: string[];
  },
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      const request = args[0] as Request;

      await logError({
        error,
        context: {
          requestUrl: request?.url,
          requestMethod: request?.method,
        },
        service: options?.service || 'api',
        tags: options?.tags,
      });

      throw error;
    }
  }) as T;
}

/**
 * Log client-side errors
 * Call this from a global error handler
 */
export async function logClientError(
  error: Error,
  errorInfo?: { componentStack?: string },
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    await fetch('/api/admin/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error_type: error.name,
        error_message: error.message,
        error_stack: error.stack,
        service: 'client',
        severity: 'error',
        metadata: {
          ...metadata,
          componentStack: errorInfo?.componentStack,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
        },
      }),
    });
  } catch (logError) {
    log.error('Failed to log client error', { error: logError });
  }
}
