import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'errors-api-errors' });

// =============================================================================
// Types
// =============================================================================

export interface APIErrorJSON {
  error: {
    code: string;
    message: string;
    status: number;
    details?: Record<string, unknown>;
    timestamp: string;
    requestId?: string;
  };
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
  code?: string;
}

// =============================================================================
// Base API Error Class
// =============================================================================

export class APIError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: Date;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string = 'INTERNAL_ERROR',
    status: number = 500,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.timestamp = new Date();
    this.isOperational = true;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(requestId?: string): APIErrorJSON {
    return {
      error: {
        code: this.code,
        message: this.message,
        status: this.status,
        details: this.details,
        timestamp: this.timestamp.toISOString(),
        requestId,
      },
    };
  }

  toResponse(requestId?: string): NextResponse {
    return NextResponse.json(this.toJSON(requestId), { status: this.status });
  }
}

// =============================================================================
// Specific Error Classes
// =============================================================================

/**
 * ValidationError (400)
 * Used for invalid request data, malformed JSON, or failed validation
 */
export class ValidationError extends APIError {
  public readonly validationErrors: ValidationErrorDetail[];

  constructor(message: string = 'Validation failed', errors: ValidationErrorDetail[] = []) {
    super(message, 'VALIDATION_ERROR', 400, { errors });
    this.name = 'ValidationError';
    this.validationErrors = errors;
  }

  static fromZodError(zodError: {
    issues: Array<{ path: (string | number)[]; message: string; code: string }>;
  }): ValidationError {
    const errors: ValidationErrorDetail[] = zodError.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }));
    return new ValidationError('Validation failed', errors);
  }
}

/**
 * AuthenticationError (401)
 * Used when authentication is required but not provided or invalid
 */
export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * AuthorizationError (403)
 * Used when the user is authenticated but doesn't have permission
 */
export class AuthorizationError extends APIError {
  constructor(
    message: string = 'You do not have permission to perform this action',
    requiredPermission?: string,
  ) {
    super(message, 'AUTHORIZATION_ERROR', 403, { requiredPermission });
    this.name = 'AuthorizationError';
  }
}

/**
 * NotFoundError (404)
 * Used when a requested resource doesn't exist
 */
export class NotFoundError extends APIError {
  constructor(resource: string = 'Resource', id?: string) {
    const message = id ? `${resource} with ID "${id}" not found` : `${resource} not found`;
    super(message, 'NOT_FOUND', 404, { resource, id });
    this.name = 'NotFoundError';
  }
}

/**
 * ConflictError (409)
 * Used when there's a conflict with the current state (e.g., duplicate entry)
 */
export class ConflictError extends APIError {
  constructor(message: string = 'Resource already exists', conflictField?: string) {
    super(message, 'CONFLICT', 409, { conflictField });
    this.name = 'ConflictError';
  }
}

/**
 * RateLimitError (429)
 * Used when rate limit is exceeded
 */
export class RateLimitError extends APIError {
  public readonly retryAfter: number;

  constructor(
    message: string = 'Rate limit exceeded. Please try again later.',
    retryAfter: number = 60,
  ) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429, { retryAfter });
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }

  toResponse(requestId?: string): NextResponse {
    const response = super.toResponse(requestId);
    response.headers.set('Retry-After', this.retryAfter.toString());
    return response;
  }
}

/**
 * InternalServerError (500)
 * Used for unexpected server errors
 */
export class InternalServerError extends APIError {
  constructor(message: string = 'An unexpected error occurred') {
    super(message, 'INTERNAL_SERVER_ERROR', 500);
    this.name = 'InternalServerError';
  }
}

/**
 * ServiceUnavailableError (503)
 * Used when the service is temporarily unavailable
 */
export class ServiceUnavailableError extends APIError {
  constructor(message: string = 'Service temporarily unavailable') {
    super(message, 'SERVICE_UNAVAILABLE', 503);
    this.name = 'ServiceUnavailableError';
  }
}

/**
 * BadRequestError (400)
 * Generic bad request error for malformed requests
 */
export class BadRequestError extends APIError {
  constructor(message: string = 'Bad request') {
    super(message, 'BAD_REQUEST', 400);
    this.name = 'BadRequestError';
  }
}

/**
 * PaymentRequiredError (402)
 * Used when payment is required for the action
 */
export class PaymentRequiredError extends APIError {
  constructor(message: string = 'Payment required') {
    super(message, 'PAYMENT_REQUIRED', 402);
    this.name = 'PaymentRequiredError';
  }
}

/**
 * UnprocessableEntityError (422)
 * Used when the request is well-formed but semantically incorrect
 */
export class UnprocessableEntityError extends APIError {
  constructor(message: string = 'Unable to process the request') {
    super(message, 'UNPROCESSABLE_ENTITY', 422);
    this.name = 'UnprocessableEntityError';
  }
}

// =============================================================================
// Error Handler Function
// =============================================================================

export interface HandleAPIErrorOptions {
  /** Request ID for tracking */
  requestId?: string;
  /** Whether to log the error to console */
  log?: boolean;
  /** Additional context for logging */
  context?: Record<string, unknown>;
}

/**
 * Handles errors in API routes and returns appropriate responses
 *
 * @example
 * ```ts
 * export async function GET(request: Request) {
 *   try {
 *     // ... your logic
 *   } catch (error) {
 *     return handleAPIError(error, { requestId: 'abc123' })
 *   }
 * }
 * ```
 */
export function handleAPIError(error: unknown, options: HandleAPIErrorOptions = {}): NextResponse {
  const { requestId, log: logEnabled = true, context } = options;

  // Log error (Cloud Logging will capture this in production)
  if (logEnabled) {
    log.error('API Error', { error, requestId, ...context });
  }

  // Handle known API errors
  if (error instanceof APIError) {
    return error.toResponse(requestId);
  }

  // Handle unknown errors
  const internalError = new InternalServerError(
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : error instanceof Error
        ? error.message
        : 'Unknown error',
  );

  return internalError.toResponse(requestId);
}

// =============================================================================
// Error Type Guards
// =============================================================================

export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function isAuthenticationError(error: unknown): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

export function isAuthorizationError(error: unknown): error is AuthorizationError {
  return error instanceof AuthorizationError;
}

export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError;
}

export function isConflictError(error: unknown): error is ConflictError {
  return error instanceof ConflictError;
}

export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError;
}

// =============================================================================
// Exports
// =============================================================================

const apiErrors = {
  APIError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalServerError,
  ServiceUnavailableError,
  BadRequestError,
  PaymentRequiredError,
  UnprocessableEntityError,
  handleAPIError,
  isAPIError,
  isValidationError,
  isAuthenticationError,
  isAuthorizationError,
  isNotFoundError,
  isConflictError,
  isRateLimitError,
};

export default apiErrors;
