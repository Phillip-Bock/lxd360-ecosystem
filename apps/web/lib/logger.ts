type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDev = process.env.NODE_ENV === 'development';

/**
 * Safe console wrapper for development logging
 */
const devConsole = {
  debug: (message: string, ...args: unknown[]): void => {
    if (isDev && typeof console !== 'undefined' && console.debug) {
      console.debug(message, ...args);
    }
  },
  info: (message: string, ...args: unknown[]): void => {
    if (isDev && typeof console !== 'undefined' && console.info) {
      console.info(message, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]): void => {
    if (isDev && typeof console !== 'undefined' && console.warn) {
      console.warn(message, ...args);
    }
  },
  error: (message: string, ...args: unknown[]): void => {
    if (typeof console !== 'undefined' && console.error) {
      console.error(message, ...args);
    }
  },
};

/**
 * Production-safe logger that only outputs in development mode
 */
export const logger = {
  /**
   * Debug level logging - for detailed debugging information
   * Only outputs in development mode
   */
  debug: (message: string, data?: unknown): void => {
    devConsole.debug(`[DEBUG] ${message}`, data !== undefined ? data : '');
  },

  /**
   * Info level logging - for general information
   * Only outputs in development mode
   */
  info: (message: string, data?: unknown): void => {
    devConsole.info(`[INFO] ${message}`, data !== undefined ? data : '');
  },

  /**
   * Warning level logging - for potential issues
   * Only outputs in development mode
   */
  warn: (message: string, data?: unknown): void => {
    devConsole.warn(`[WARN] ${message}`, data !== undefined ? data : '');
  },

  /**
   * Error level logging - for errors and exceptions
   * Outputs in all modes. Cloud Logging captures console.error in production.
   */
  error: (message: string, error?: unknown): void => {
    devConsole.error(`[ERROR] ${message}`, error || '');
  },

  /**
   * Log with specific level
   */
  log: (level: LogLevel, message: string, data?: unknown): void => {
    switch (level) {
      case 'debug':
        logger.debug(message, data);
        break;
      case 'info':
        logger.info(message, data);
        break;
      case 'warn':
        logger.warn(message, data);
        break;
      case 'error':
        logger.error(message, data);
        break;
    }
  },

  /**
   * Create a scoped logger for a specific component/module
   */
  scope: (componentName: string) => ({
    debug: (message: string, data?: unknown): void =>
      logger.debug(`[${componentName}] ${message}`, data),
    info: (message: string, data?: unknown): void =>
      logger.info(`[${componentName}] ${message}`, data),
    warn: (message: string, data?: unknown): void =>
      logger.warn(`[${componentName}] ${message}`, data),
    error: (message: string, error?: unknown): void =>
      logger.error(`[${componentName}] ${message}`, error),
  }),

  /**
   * Create a child logger with additional context (alias for scope)
   * Compatible with structured logging patterns
   */
  child: (context: { module?: string; [key: string]: unknown }) => ({
    debug: (message: string, data?: unknown): void =>
      logger.debug(`[${context.module || 'App'}] ${message}`, data),
    info: (message: string, data?: unknown): void =>
      logger.info(`[${context.module || 'App'}] ${message}`, data),
    warn: (message: string, data?: unknown): void =>
      logger.warn(`[${context.module || 'App'}] ${message}`, data),
    error: (message: string, data?: unknown): void =>
      logger.error(`[${context.module || 'App'}] ${message}`, data),
  }),
};

export default logger;
