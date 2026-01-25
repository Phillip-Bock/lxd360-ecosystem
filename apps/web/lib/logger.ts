/**
 * Production Logger — GCP Cloud Logging Compatible
 *
 * @description Structured logging for Cloud Run deployment.
 * - Production: Outputs JSON with severity field for GCP Cloud Logging
 * - Development: Outputs human-readable colorized logs
 *
 * @see https://cloud.google.com/logging/docs/structured-logging
 * @version 2.0.0
 */

// =============================================================================
// TYPES
// =============================================================================

/** GCP Cloud Logging severity levels */
type Severity = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

/** Structured log entry for GCP */
interface StructuredLog {
  severity: Severity;
  message: string;
  timestamp: string;
  /** Module or component name */
  module?: string;
  /** Request trace ID for correlation */
  traceId?: string;
  /** Additional structured data */
  data?: Record<string, unknown>;
  /** Error stack trace */
  stack?: string;
  /** Source location */
  sourceLocation?: {
    file?: string;
    line?: number;
    function?: string;
  };
}

/** Logger context for scoped loggers */
interface LoggerContext {
  module?: string;
  traceId?: string;
  [key: string]: unknown;
}

/** Logger interface */
interface Logger {
  debug: (message: string, data?: Record<string, unknown>) => void;
  info: (message: string, data?: Record<string, unknown>) => void;
  warn: (message: string, data?: Record<string, unknown>) => void;
  error: (message: string, error?: unknown, data?: Record<string, unknown>) => void;
  critical: (message: string, error?: unknown, data?: Record<string, unknown>) => void;
  child: (context: LoggerContext) => Logger;
  scope: (moduleName: string) => Logger;
  withTraceId: (traceId: string) => Logger;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const IS_TEST = process.env.NODE_ENV === 'test';
const LOG_LEVEL = process.env.LOG_LEVEL || (IS_PRODUCTION ? 'INFO' : 'DEBUG');

/** Severity level hierarchy (lower = more verbose) */
const SEVERITY_LEVELS: Record<Severity, number> = {
  DEBUG: 0,
  INFO: 1,
  WARNING: 2,
  ERROR: 3,
  CRITICAL: 4,
};

/** ANSI color codes for development output */
const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  bgRed: '\x1b[41m',
  white: '\x1b[37m',
} as const;

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Check if a severity level should be logged based on current LOG_LEVEL
 */
function shouldLog(severity: Severity): boolean {
  if (IS_TEST) return false; // Suppress logs during tests unless explicitly enabled
  const currentLevel = SEVERITY_LEVELS[LOG_LEVEL as Severity] ?? SEVERITY_LEVELS.INFO;
  return SEVERITY_LEVELS[severity] >= currentLevel;
}

/**
 * Format timestamp in ISO 8601 format
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Extract error information safely
 */
function extractErrorInfo(error: unknown): { message: string; stack?: string } {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
    };
  }
  if (typeof error === 'string') {
    return { message: error };
  }
  return { message: String(error) };
}

/**
 * Format log for development (human-readable)
 */
function formatDevLog(
  severity: Severity,
  message: string,
  context?: LoggerContext,
  data?: Record<string, unknown>,
  errorInfo?: { message: string; stack?: string },
): string {
  const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
  const modulePrefix = context?.module ? `[${context.module}] ` : '';
  const tracePrefix = context?.traceId ? `(${context.traceId.slice(0, 8)}) ` : '';

  let color: string;
  let label: string;

  switch (severity) {
    case 'DEBUG':
      color = COLORS.dim;
      label = 'DBG';
      break;
    case 'INFO':
      color = COLORS.blue;
      label = 'INF';
      break;
    case 'WARNING':
      color = COLORS.yellow;
      label = 'WRN';
      break;
    case 'ERROR':
      color = COLORS.red;
      label = 'ERR';
      break;
    case 'CRITICAL':
      color = `${COLORS.bgRed}${COLORS.white}`;
      label = 'CRT';
      break;
  }

  let output = `${COLORS.dim}${timestamp}${COLORS.reset} ${color}${label}${COLORS.reset} ${modulePrefix}${tracePrefix}${message}`;

  if (data && Object.keys(data).length > 0) {
    output += ` ${COLORS.cyan}${JSON.stringify(data)}${COLORS.reset}`;
  }

  if (errorInfo?.stack) {
    output += `\n${COLORS.dim}${errorInfo.stack}${COLORS.reset}`;
  }

  return output;
}

/**
 * Format log for production (GCP structured JSON)
 */
function formatProductionLog(
  severity: Severity,
  message: string,
  context?: LoggerContext,
  data?: Record<string, unknown>,
  errorInfo?: { message: string; stack?: string },
): string {
  const entry: StructuredLog = {
    severity,
    message: errorInfo ? `${message}: ${errorInfo.message}` : message,
    timestamp: getTimestamp(),
  };

  if (context?.module) {
    entry.module = context.module;
  }

  if (context?.traceId) {
    entry.traceId = context.traceId;
  }

  if (data && Object.keys(data).length > 0) {
    entry.data = data;
  }

  if (errorInfo?.stack) {
    entry.stack = errorInfo.stack;
  }

  return JSON.stringify(entry);
}

/**
 * Write log to appropriate output
 */
function writeLog(
  severity: Severity,
  message: string,
  context?: LoggerContext,
  data?: Record<string, unknown>,
  error?: unknown,
): void {
  if (!shouldLog(severity)) return;

  const errorInfo = error ? extractErrorInfo(error) : undefined;

  const output = IS_PRODUCTION
    ? formatProductionLog(severity, message, context, data, errorInfo)
    : formatDevLog(severity, message, context, data, errorInfo);

  // Use appropriate console method for severity
  switch (severity) {
    case 'DEBUG':
    case 'INFO':
      console.log(output);
      break;
    case 'WARNING':
      console.warn(output);
      break;
    case 'ERROR':
    case 'CRITICAL':
      console.error(output);
      break;
  }
}

// =============================================================================
// LOGGER FACTORY
// =============================================================================

/**
 * Create a logger instance with optional context
 */
function createLogger(context?: LoggerContext): Logger {
  return {
    debug(message: string, data?: Record<string, unknown>): void {
      writeLog('DEBUG', message, context, data);
    },

    info(message: string, data?: Record<string, unknown>): void {
      writeLog('INFO', message, context, data);
    },

    warn(message: string, data?: Record<string, unknown>): void {
      writeLog('WARNING', message, context, data);
    },

    error(message: string, error?: unknown, data?: Record<string, unknown>): void {
      writeLog('ERROR', message, context, data, error);
    },

    critical(message: string, error?: unknown, data?: Record<string, unknown>): void {
      writeLog('CRITICAL', message, context, data, error);
    },

    /**
     * Create a child logger with additional context
     * @example
     * const log = logger.child({ module: 'AuthService', traceId: req.traceId });
     * log.info('User logged in', { userId: '123' });
     */
    child(additionalContext: LoggerContext): Logger {
      return createLogger({ ...context, ...additionalContext });
    },

    /**
     * Create a scoped logger for a specific module
     * @example
     * const log = logger.scope('PaymentService');
     * log.info('Processing payment');
     */
    scope(moduleName: string): Logger {
      return createLogger({ ...context, module: moduleName });
    },

    /**
     * Create a logger with trace ID for request correlation
     * @example
     * const log = logger.withTraceId(request.headers['x-trace-id']);
     * log.info('Handling request');
     */
    withTraceId(traceId: string): Logger {
      return createLogger({ ...context, traceId });
    },
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

/**
 * Default logger instance
 *
 * @example
 * // Basic usage
 * logger.info('Server started', { port: 3000 });
 *
 * // With error
 * logger.error('Database connection failed', error, { host: 'localhost' });
 *
 * // Scoped logger
 * const log = logger.scope('UserService');
 * log.info('Creating user', { email: 'user@example.com' });
 *
 * // With trace ID for request correlation
 * const reqLog = logger.withTraceId(traceId);
 * reqLog.info('Processing request');
 */
export const logger = createLogger();

/**
 * Create a new logger instance with custom context
 */
export { createLogger };

/**
 * Export types for external use
 */
export type { Logger, LoggerContext, Severity, StructuredLog };

export default logger;
