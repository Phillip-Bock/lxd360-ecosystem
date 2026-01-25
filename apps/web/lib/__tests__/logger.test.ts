import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Must mock before import
vi.mock('process', () => ({
  env: {
    NODE_ENV: 'development',
    LOG_LEVEL: 'DEBUG',
  },
}));

describe('Logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should export logger with all methods', async () => {
    const { logger } = await import('../logger');

    expect(logger).toBeDefined();
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.critical).toBe('function');
    expect(typeof logger.child).toBe('function');
    expect(typeof logger.scope).toBe('function');
    expect(typeof logger.withTraceId).toBe('function');
  });

  it('should create scoped logger', async () => {
    const { logger } = await import('../logger');
    const scopedLogger = logger.scope('TestModule');

    expect(scopedLogger).toBeDefined();
    expect(typeof scopedLogger.info).toBe('function');
  });

  it('should create child logger with context', async () => {
    const { logger } = await import('../logger');
    const childLogger = logger.child({ module: 'TestModule', traceId: 'abc123' });

    expect(childLogger).toBeDefined();
    expect(typeof childLogger.info).toBe('function');
  });
});
