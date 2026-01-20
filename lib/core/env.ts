// ============================================================================
// Environment Types
// ============================================================================

export type Environment = 'development' | 'production' | 'test';

// ============================================================================
// Environment Detection
// ============================================================================

/**
 * Get the current environment
 */
export function getEnvironment(): Environment {
  const env = process.env.NODE_ENV;
  if (env === 'production') return 'production';
  if (env === 'test') return 'test';
  return 'development';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getEnvironment() === 'development';
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getEnvironment() === 'production';
}

/**
 * Check if running in test environment
 */
export function isTest(): boolean {
  return getEnvironment() === 'test';
}

/**
 * Check if running on the server
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Check if running on the client
 */
export function isClient(): boolean {
  return typeof window !== 'undefined';
}

// ============================================================================
// Environment Variable Access
// ============================================================================

/**
 * Get a required environment variable
 * @throws Error if the variable is not defined
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Get an optional environment variable with a default value
 */
export function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

// ============================================================================
// App Configuration
// ============================================================================

/**
 * Application environment configuration
 */
export const APP_ENV = {
  /** Current environment */
  environment: getEnvironment(),

  /** Is development mode */
  isDev: isDevelopment(),

  /** Is production mode */
  isProd: isProduction(),

  /** Is test mode */
  isTest: isTest(),

  /** Application URL */
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',

  /** Application environment label */
  appEnv: process.env.NEXT_PUBLIC_APP_ENV ?? 'development',
} as const;
