// ============================================================================
// TYPES
// ============================================================================

interface EnvVarConfig {
  name: string;
  required: boolean;
  category: string;
  description: string;
  pattern?: RegExp;
  patternDescription?: string;
  isUrl?: boolean;
  isSecret?: boolean;
  productionOnly?: boolean;
}

interface EnvCheckResult {
  name: string;
  category: string;
  status: 'pass' | 'fail' | 'warn' | 'missing';
  message: string;
  value?: string; // Masked for secrets
}

interface EnvVerificationReport {
  timestamp: string;
  environment: string;
  results: EnvCheckResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    missing: number;
  };
}

// ============================================================================
// ENVIRONMENT VARIABLE CONFIGURATION
// ============================================================================

const ENV_VARS: EnvVarConfig[] = [
  // Firebase (Client-side)
  {
    name: 'NEXT_PUBLIC_FIREBASE_API_KEY',
    required: true,
    category: 'Firebase',
    description: 'Firebase API key',
    isSecret: false,
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    required: true,
    category: 'Firebase',
    description: 'Firebase auth domain',
    pattern: /^[a-z0-9-]+\.firebaseapp\.com$/,
    patternDescription: '<project-id>.firebaseapp.com',
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    required: true,
    category: 'Firebase',
    description: 'Firebase project ID',
    pattern: /^[a-z0-9-]+$/,
    patternDescription: 'lowercase alphanumeric with dashes',
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    required: false,
    category: 'Firebase',
    description: 'Firebase storage bucket',
    pattern: /^[a-z0-9-]+\.(appspot\.com|firebasestorage\.app)$/,
    patternDescription: '<project-id>.appspot.com or .firebasestorage.app',
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    required: false,
    category: 'Firebase',
    description: 'Firebase Cloud Messaging sender ID',
    pattern: /^[0-9]+$/,
    patternDescription: 'numeric ID',
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_APP_ID',
    required: true,
    category: 'Firebase',
    description: 'Firebase app ID',
    pattern: /^[0-9]+:[0-9]+:web:[a-f0-9]+$/,
    patternDescription: '<sender-id>:<random>:web:<hash>',
  },

  // Firebase (Server-side)
  {
    name: 'GOOGLE_CLOUD_PROJECT',
    required: true,
    category: 'GCP',
    description: 'Google Cloud project ID',
    pattern: /^[a-z0-9-]+$/,
    patternDescription: 'lowercase alphanumeric with dashes',
  },
  {
    name: 'FIREBASE_CLIENT_EMAIL',
    required: true,
    category: 'GCP',
    description: 'Firebase service account email',
    isSecret: true,
    pattern: /^[^@]+@[^@]+\.iam\.gserviceaccount\.com$/,
    patternDescription: 'Service account email format',
  },
  {
    name: 'FIREBASE_PRIVATE_KEY',
    required: true,
    category: 'GCP',
    description: 'Firebase service account private key',
    isSecret: true,
    pattern: /^-----BEGIN PRIVATE KEY-----/,
    patternDescription: 'PEM private key format',
  },

  // Inngest
  {
    name: 'INNGEST_EVENT_KEY',
    required: false,
    category: 'Inngest',
    description: 'Inngest event key',
    isSecret: true,
  },
  {
    name: 'INNGEST_SIGNING_KEY',
    required: true,
    category: 'Inngest',
    description: 'Inngest signing key for verification',
    isSecret: true,
    pattern: /^signkey-/,
    patternDescription: "Starts with 'signkey-'",
  },

  // Stripe
  {
    name: 'STRIPE_SECRET_KEY',
    required: true,
    category: 'Stripe',
    description: 'Stripe secret key',
    isSecret: true,
    pattern: /^sk_(test|live)_[A-Za-z0-9]+$/,
    patternDescription: 'sk_test_* or sk_live_*',
  },
  {
    name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    required: true,
    category: 'Stripe',
    description: 'Stripe publishable key',
    pattern: /^pk_(test|live)_[A-Za-z0-9]+$/,
    patternDescription: 'pk_test_* or pk_live_*',
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    required: true,
    category: 'Stripe',
    description: 'Stripe webhook signing secret',
    isSecret: true,
    pattern: /^whsec_[A-Za-z0-9]+$/,
    patternDescription: "Starts with 'whsec_'",
  },

  // NextAuth
  {
    name: 'NEXTAUTH_SECRET',
    required: true,
    category: 'NextAuth',
    description: 'NextAuth.js secret for JWT signing',
    isSecret: true,
    pattern: /^.{32,}$/,
    patternDescription: 'At least 32 characters',
  },
  {
    name: 'NEXTAUTH_URL',
    required: true,
    category: 'NextAuth',
    description: 'Full URL of the application',
    isUrl: true,
    pattern: /^https?:\/\/.+$/,
    patternDescription: 'Valid URL',
    productionOnly: true,
  },

  // App Config
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: false,
    category: 'App',
    description: 'Public application URL',
    isUrl: true,
  },
  {
    name: 'NODE_ENV',
    required: false,
    category: 'App',
    description: 'Node environment',
    pattern: /^(development|production|test)$/,
    patternDescription: 'development, production, or test',
  },
];

// ============================================================================
// CONSOLE OUTPUT HELPERS
// ============================================================================

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function log(message: string) {
  console.log(message);
}

function logHeader(title: string) {
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}  ${title}${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

function maskValue(value: string): string {
  if (value.length <= 8) {
    return '*'.repeat(value.length);
  }
  return value.substring(0, 4) + '*'.repeat(value.length - 8) + value.slice(-4);
}

function logResult(result: EnvCheckResult) {
  const icon =
    result.status === 'pass'
      ? `${colors.green}✓${colors.reset}`
      : result.status === 'fail'
        ? `${colors.red}✗${colors.reset}`
        : result.status === 'warn'
          ? `${colors.yellow}⚠${colors.reset}`
          : `${colors.red}○${colors.reset}`;

  const statusColor =
    result.status === 'pass'
      ? colors.green
      : result.status === 'fail' || result.status === 'missing'
        ? colors.red
        : colors.yellow;

  console.log(`  ${icon} ${result.name}`);
  console.log(`    ${statusColor}${result.message}${colors.reset}`);
  if (result.value) {
    console.log(`    ${colors.dim}Value: ${result.value}${colors.reset}`);
  }
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

function validateEnvVar(config: EnvVarConfig): EnvCheckResult {
  const value = process.env[config.name];
  const isProd = process.env.NODE_ENV === 'production';

  // Check if missing
  if (!value) {
    if (config.required) {
      return {
        name: config.name,
        category: config.category,
        status: 'missing',
        message: `Required variable is not set - ${config.description}`,
      };
    }
    return {
      name: config.name,
      category: config.category,
      status: 'warn',
      message: `Optional variable is not set - ${config.description}`,
    };
  }

  // Check production-only requirements
  if (config.productionOnly && isProd && !value) {
    return {
      name: config.name,
      category: config.category,
      status: 'fail',
      message: `Required in production but not set`,
    };
  }

  // Validate URL format
  if (config.isUrl) {
    try {
      new URL(value);
    } catch {
      return {
        name: config.name,
        category: config.category,
        status: 'fail',
        message: `Invalid URL format`,
        value: config.isSecret ? maskValue(value) : value,
      };
    }
  }

  // Validate pattern
  if (config.pattern && !config.pattern.test(value)) {
    return {
      name: config.name,
      category: config.category,
      status: 'fail',
      message: `Invalid format. Expected: ${config.patternDescription}`,
      value: config.isSecret ? maskValue(value) : value,
    };
  }

  // Check for development/production mismatch
  if (config.name === 'STRIPE_SECRET_KEY' && isProd) {
    if (value.startsWith('sk_test_')) {
      return {
        name: config.name,
        category: config.category,
        status: 'warn',
        message: `Using test key in production environment`,
        value: maskValue(value),
      };
    }
  }

  if (config.name === 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY' && isProd) {
    if (value.startsWith('pk_test_')) {
      return {
        name: config.name,
        category: config.category,
        status: 'warn',
        message: `Using test key in production environment`,
        value: value,
      };
    }
  }

  return {
    name: config.name,
    category: config.category,
    status: 'pass',
    message: config.description,
    value: config.isSecret ? maskValue(value) : value,
  };
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main(): Promise<EnvVerificationReport> {
  logHeader('LXP360 Environment Variable Verification');

  log(`${colors.blue}Environment: ${process.env.NODE_ENV || 'development'}${colors.reset}`);
  log(`${colors.blue}Timestamp: ${new Date().toISOString()}${colors.reset}\n`);

  const results: EnvCheckResult[] = [];

  // Group by category
  const categories = [...new Set(ENV_VARS.map((v) => v.category))];

  for (const category of categories) {
    log(`\n${colors.cyan}${category}${colors.reset}`);
    log('-'.repeat(40));

    const categoryVars = ENV_VARS.filter((v) => v.category === category);

    for (const varConfig of categoryVars) {
      const result = validateEnvVar(varConfig);
      results.push(result);
      logResult(result);
    }
  }

  // Generate summary
  const summary = {
    total: results.length,
    passed: results.filter((r) => r.status === 'pass').length,
    failed: results.filter((r) => r.status === 'fail').length,
    warnings: results.filter((r) => r.status === 'warn').length,
    missing: results.filter((r) => r.status === 'missing').length,
  };

  // Print summary
  logHeader('Summary');
  log(`  Total Variables: ${summary.total}`);
  log(`  ${colors.green}Passed: ${summary.passed}${colors.reset}`);
  log(`  ${colors.red}Failed: ${summary.failed}${colors.reset}`);
  log(`  ${colors.yellow}Warnings: ${summary.warnings}${colors.reset}`);
  log(`  ${colors.red}Missing: ${summary.missing}${colors.reset}`);

  const report: EnvVerificationReport = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    results,
    summary,
  };

  // Print missing/failed vars for easy copy
  const criticalIssues = results.filter((r) => r.status === 'fail' || r.status === 'missing');

  if (criticalIssues.length > 0) {
    logHeader('Critical Issues');
    for (const issue of criticalIssues) {
      log(`  ${colors.red}${issue.name}${colors.reset}: ${issue.message}`);
    }
  }

  // Exit with error if critical issues
  if (summary.failed > 0 || summary.missing > 0) {
    log(`\n${colors.red}Environment verification FAILED${colors.reset}`);
    process.exitCode = 1;
  } else if (summary.warnings > 0) {
    log(`\n${colors.yellow}Environment verification PASSED with warnings${colors.reset}`);
  } else {
    log(`\n${colors.green}Environment verification PASSED${colors.reset}`);
  }

  return report;
}

// Run if executed directly
main().catch(console.error);

export { main as verifyEnv };
export type { EnvCheckResult, EnvVerificationReport };
