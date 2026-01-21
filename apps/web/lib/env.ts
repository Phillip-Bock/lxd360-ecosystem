/**
 * Environment Variable Validation
 *
 * This module validates all required environment variables at startup
 * and provides helpful error messages if unknown are missing.
 */

import { logger } from '@/lib/logger';

const log = logger.child({ module: 'env' });

type EnvVar = {
  name: string;
  required: boolean;
  description: string;
  isPublic?: boolean; // NEXT_PUBLIC_ vars are exposed to client
  validate?: (value: string) => boolean;
};

const envVars: EnvVar[] = [
  // Firebase (primary database and auth)
  {
    name: 'NEXT_PUBLIC_FIREBASE_API_KEY',
    required: true,
    description: 'Firebase API key',
    isPublic: true,
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    required: true,
    description: 'Firebase Auth domain',
    isPublic: true,
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    required: true,
    description: 'Firebase project ID',
    isPublic: true,
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    required: false,
    description: 'Firebase Storage bucket',
    isPublic: true,
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    required: false,
    description: 'Firebase Messaging sender ID',
    isPublic: true,
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_APP_ID',
    required: true,
    description: 'Firebase App ID',
    isPublic: true,
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
    required: false,
    description: 'Firebase Analytics measurement ID',
    isPublic: true,
  },
  // Google Cloud & AI Services
  {
    name: 'GOOGLE_CREDENTIALS',
    required: false,
    description:
      'Google Cloud service account JSON (for TTS, Vertex AI). Can be raw JSON or base64 encoded.',
    isPublic: false,
  },
  {
    name: 'GOOGLE_CLOUD_API_KEY',
    required: false,
    description: 'Google Cloud API key (alternative to service account for some APIs)',
    isPublic: false,
  },
  {
    name: 'GEMINI_API_KEY',
    required: false,
    description: 'Google Gemini API key (alternative to service account for Gemini)',
    isPublic: false,
  },
  {
    name: 'ANTHROPIC_API_KEY',
    required: false,
    description: 'Anthropic API key for Claude integration',
    isPublic: false,
  },
  // Revalidation
  {
    name: 'REVALIDATE_SECRET',
    required: false,
    description: 'Secret for on-demand ISR revalidation',
    isPublic: false,
  },
  // Stripe (Payments)
  {
    name: 'STRIPE_SECRET_KEY',
    required: false,
    description: 'Stripe secret API key for server-side operations',
    isPublic: false,
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    required: false,
    description: 'Stripe webhook signing secret for verifying webhook events',
    isPublic: false,
  },
  {
    name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    required: false,
    description: 'Stripe publishable key for client-side operations',
    isPublic: true,
  },
  // Brevo (Email)
  {
    name: 'BREVO_API_KEY',
    required: false,
    description: 'Brevo API key for transactional emails',
    isPublic: false,
  },
  {
    name: 'FROM_EMAIL',
    required: false,
    description: 'Default from email address for transactional emails',
    isPublic: false,
  },
  // Cron Jobs
  {
    name: 'CRON_SECRET',
    required: false,
    description: 'Secret for authenticating cron job requests',
    isPublic: false,
  },
  // App URL
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: false,
    description: 'Public URL of the application (e.g., https://lxd360.com)',
    isPublic: true,
  },
];

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate all environment variables
 */
export function validateEnv(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const envVar of envVars) {
    const value = process.env[envVar.name];

    if (envVar.required && !value) {
      errors.push(
        `Missing required environment variable: ${envVar.name}\n` +
          `  Description: ${envVar.description}\n` +
          `  ${envVar.isPublic ? '⚠️  This is a public variable (NEXT_PUBLIC_*)' : '🔒 This is a server-side only variable'}\n` +
          `  Add it to your .env.local file`,
      );
    } else if (value && envVar.validate && !envVar.validate(value)) {
      errors.push(
        `Invalid value for ${envVar.name}: ${value}\n` + `  Expected format: ${envVar.description}`,
      );
    } else if (!envVar.required && !value) {
      warnings.push(
        `Optional environment variable not set: ${envVar.name}\n` +
          `  Description: ${envVar.description}`,
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get validated environment variable (throws if missing and required)
 */
export function getEnv(name: string, defaultValue?: string): string {
  const value = process.env[name];

  if (!value && defaultValue === undefined) {
    const envVar = envVars.find((v) => v.name === name);
    if (envVar?.required) {
      throw new Error(
        `Missing required environment variable: ${name}\n` +
          `Description: ${envVar.description}\n` +
          `Add it to your .env.local file`,
      );
    }
  }

  return value || defaultValue || '';
}

/**
 * Validate environment variables and throw if invalid
 * Call this at the top of server-side code
 */
export function requireEnv(): void {
  const result = validateEnv();

  if (!result.valid) {
    log.error('Environment variable validation failed', { errors: result.errors });

    if (result.warnings.length > 0) {
      log.warn('Environment variable warnings', { warnings: result.warnings });
    }

    throw new Error('Environment variable validation failed. See errors above.');
  }

  if (result.warnings.length > 0 && process.env.NODE_ENV !== 'production') {
    log.warn('Environment variable warnings', { warnings: result.warnings });
  }
}

// Export individual getters for convenience
export const env = {
  firebase: {
    apiKey: () => getEnv('NEXT_PUBLIC_FIREBASE_API_KEY'),
    authDomain: () => getEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    projectId: () => getEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
    storageBucket: () => getEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: () => getEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
    appId: () => getEnv('NEXT_PUBLIC_FIREBASE_APP_ID'),
    measurementId: () => getEnv('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'),
  },
  google: {
    credentials: () => getEnv('GOOGLE_CREDENTIALS'),
    apiKey: () => getEnv('GOOGLE_CLOUD_API_KEY'),
    geminiApiKey: () => getEnv('GEMINI_API_KEY'),
  },
  apiKeys: {
    googleCloud: () => getEnv('GOOGLE_CLOUD_API_KEY'),
    anthropic: () => getEnv('ANTHROPIC_API_KEY'),
    gemini: () => getEnv('GEMINI_API_KEY'),
  },
  revalidate: {
    secret: () => getEnv('REVALIDATE_SECRET'),
  },
  stripe: {
    secretKey: () => getEnv('STRIPE_SECRET_KEY'),
    webhookSecret: () => getEnv('STRIPE_WEBHOOK_SECRET'),
    publishableKey: () => getEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
  },
  brevo: {
    apiKey: () => getEnv('BREVO_API_KEY'),
  },
  email: {
    from: () => getEnv('FROM_EMAIL', 'billing@lxd360.com'),
  },
  cron: {
    secret: () => getEnv('CRON_SECRET'),
  },
  app: {
    url: () => getEnv('NEXT_PUBLIC_APP_URL', 'https://lxd360.com'),
  },
};
