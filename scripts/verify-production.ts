import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// ============================================================================
// TYPES
// ============================================================================

interface VerificationModule {
  name: string;
  script: string;
  description: string;
  critical: boolean;
}

interface ModuleResult {
  name: string;
  status: 'pass' | 'fail' | 'warn' | 'error';
  duration: number;
  output: string;
  exitCode: number | null;
}

interface ProductionVerificationReport {
  timestamp: string;
  environment: string;
  version: string;
  modules: ModuleResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    errors: number;
  };
  recommendation: 'ready' | 'not_ready' | 'review_required';
}

// ============================================================================
// VERIFICATION MODULES
// ============================================================================

const VERIFICATION_MODULES: VerificationModule[] = [
  {
    name: 'Environment Variables',
    script: 'scripts/verify-env.ts',
    description: 'Validates all required environment variables',
    critical: true,
  },
  {
    name: 'External Services',
    script: 'scripts/verify-services.ts',
    description: 'Checks connectivity to Firebase, Firestore, Stripe, Inngest, etc.',
    critical: true,
  },
  {
    name: 'Database',
    script: 'scripts/verify-database.ts',
    description: 'Verifies Firestore collections, security rules, and indexes',
    critical: true,
  },
  {
    name: 'API Endpoints',
    script: 'scripts/verify-api.ts',
    description: 'Tests API endpoints for proper responses',
    critical: false,
  },
  {
    name: 'Email System',
    script: 'scripts/verify-email.ts',
    description: 'Verifies email service configuration',
    critical: true,
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
  magenta: '\x1b[35m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
};

function log(message: string) {
  console.log(message);
}

function logBanner() {
  console.log(`
${colors.cyan}╔══════════════════════════════════════════════════════════════╗
║                                                                ║
║   ${colors.bold}LXP360-SaaS Production Verification${colors.reset}${colors.cyan}                        ║
║                                                                ║
║   Pre-launch readiness check for production deployment         ║
║                                                                ║
╚══════════════════════════════════════════════════════════════╝${colors.reset}
`);
}

function logHeader(title: string) {
  console.log(`\n${colors.cyan}${'═'.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}  ${title}${colors.reset}`);
  console.log(`${colors.cyan}${'═'.repeat(60)}${colors.reset}\n`);
}

function logModuleStart(module: VerificationModule) {
  const criticalBadge = module.critical ? `${colors.red}[CRITICAL]${colors.reset} ` : '';
  console.log(
    `\n${colors.blue}▶${colors.reset} ${criticalBadge}${colors.bold}${module.name}${colors.reset}`,
  );
  console.log(`  ${colors.dim}${module.description}${colors.reset}`);
  console.log(`  ${colors.dim}Running: ${module.script}${colors.reset}\n`);
}

function logModuleResult(result: ModuleResult) {
  const icon =
    result.status === 'pass'
      ? `${colors.green}✓${colors.reset}`
      : result.status === 'fail'
        ? `${colors.red}✗${colors.reset}`
        : result.status === 'warn'
          ? `${colors.yellow}⚠${colors.reset}`
          : `${colors.red}⚠${colors.reset}`;

  const statusColor =
    result.status === 'pass'
      ? colors.green
      : result.status === 'fail' || result.status === 'error'
        ? colors.red
        : colors.yellow;

  console.log(`\n${icon} ${colors.bold}${result.name}${colors.reset}`);
  console.log(`  Status: ${statusColor}${result.status.toUpperCase()}${colors.reset}`);
  console.log(`  Duration: ${result.duration}ms`);
  if (result.status === 'error') {
    console.log(`  ${colors.red}Error: Check script output above${colors.reset}`);
  }
}

// ============================================================================
// SCRIPT EXECUTION
// ============================================================================

/**
 * Run a verification script and capture its output
 */
async function runVerificationScript(module: VerificationModule): Promise<ModuleResult> {
  const startTime = Date.now();

  return new Promise((resolve) => {
    const scriptPath = join(process.cwd(), module.script);

    const child = spawn('npx', ['ts-node', scriptPath], {
      cwd: process.cwd(),
      env: process.env,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let output = '';
    let hasFailure = false;
    let hasWarning = false;

    child.stdout?.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);

      // Check for failure/warning indicators
      if (text.includes('FAILED') || text.includes('✗')) {
        hasFailure = true;
      }
      if (text.includes('warning') || text.includes('⚠')) {
        hasWarning = true;
      }
    });

    child.stderr?.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stderr.write(text);
    });

    child.on('close', (exitCode) => {
      const duration = Date.now() - startTime;

      let status: ModuleResult['status'];
      if (exitCode !== 0 || hasFailure) {
        status = 'fail';
      } else if (hasWarning) {
        status = 'warn';
      } else {
        status = 'pass';
      }

      resolve({
        name: module.name,
        status,
        duration,
        output,
        exitCode,
      });
    });

    child.on('error', (error) => {
      const duration = Date.now() - startTime;
      resolve({
        name: module.name,
        status: 'error',
        duration,
        output: error.message,
        exitCode: null,
      });
    });

    // Timeout after 60 seconds
    setTimeout(() => {
      child.kill();
      const duration = Date.now() - startTime;
      resolve({
        name: module.name,
        status: 'error',
        duration,
        output: 'Script timed out after 60 seconds',
        exitCode: null,
      });
    }, 60000);
  });
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

/**
 * Generate and save verification report
 */
async function generateReport(results: ModuleResult[]): Promise<ProductionVerificationReport> {
  const summary = {
    total: results.length,
    passed: results.filter((r) => r.status === 'pass').length,
    failed: results.filter((r) => r.status === 'fail').length,
    warnings: results.filter((r) => r.status === 'warn').length,
    errors: results.filter((r) => r.status === 'error').length,
  };

  // Check if critical modules failed
  const criticalModules = VERIFICATION_MODULES.filter((m) => m.critical);
  const criticalResults = results.filter((r) => criticalModules.some((m) => m.name === r.name));
  const criticalFailures = criticalResults.filter(
    (r) => r.status === 'fail' || r.status === 'error',
  );

  let recommendation: ProductionVerificationReport['recommendation'];
  if (criticalFailures.length > 0) {
    recommendation = 'not_ready';
  } else if (summary.warnings > 0) {
    recommendation = 'review_required';
  } else {
    recommendation = 'ready';
  }

  const report: ProductionVerificationReport = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    modules: results,
    summary,
    recommendation,
  };

  // Save report to file
  const reportsDir = join(process.cwd(), 'reports');
  try {
    await mkdir(reportsDir, { recursive: true });
    const reportPath = join(
      reportsDir,
      `verification-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
    );
    await writeFile(reportPath, JSON.stringify(report, null, 2));
    log(`\n${colors.dim}Report saved to: ${reportPath}${colors.reset}`);
  } catch (_error) {
    // Non-critical, continue
  }

  return report;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main(): Promise<ProductionVerificationReport> {
  const startTime = Date.now();

  logBanner();

  log(`${colors.blue}Environment: ${process.env.NODE_ENV || 'development'}${colors.reset}`);
  log(`${colors.blue}Timestamp: ${new Date().toISOString()}${colors.reset}`);
  log(`${colors.blue}Running ${VERIFICATION_MODULES.length} verification modules${colors.reset}`);

  const results: ModuleResult[] = [];

  // Run each verification module
  for (const verificationModule of VERIFICATION_MODULES) {
    logModuleStart(verificationModule);
    const result = await runVerificationScript(verificationModule);
    results.push(result);
    logModuleResult(result);
  }

  // Generate report
  const report = await generateReport(results);

  // Print summary
  logHeader('Verification Summary');

  log(`  Total Modules: ${report.summary.total}`);
  log(`  ${colors.green}Passed: ${report.summary.passed}${colors.reset}`);
  log(`  ${colors.red}Failed: ${report.summary.failed}${colors.reset}`);
  log(`  ${colors.yellow}Warnings: ${report.summary.warnings}${colors.reset}`);
  if (report.summary.errors > 0) {
    log(`  ${colors.red}Errors: ${report.summary.errors}${colors.reset}`);
  }

  const totalDuration = Date.now() - startTime;
  log(`\n  Total Duration: ${(totalDuration / 1000).toFixed(1)}s`);

  // Print recommendation
  logHeader('Production Readiness');

  if (report.recommendation === 'ready') {
    log(`  ${colors.green}${colors.bold}✓ READY FOR PRODUCTION${colors.reset}`);
    log(
      `  ${colors.green}All critical checks passed. You may proceed with deployment.${colors.reset}`,
    );
  } else if (report.recommendation === 'review_required') {
    log(`  ${colors.yellow}${colors.bold}⚠ REVIEW REQUIRED${colors.reset}`);
    log(`  ${colors.yellow}Some warnings were found. Review before deploying.${colors.reset}`);

    // List warnings
    const warningModules = results.filter((r) => r.status === 'warn');
    if (warningModules.length > 0) {
      log(`\n  ${colors.yellow}Modules with warnings:${colors.reset}`);
      for (const mod of warningModules) {
        log(`    - ${mod.name}`);
      }
    }
  } else {
    log(`  ${colors.red}${colors.bold}✗ NOT READY FOR PRODUCTION${colors.reset}`);
    log(`  ${colors.red}Critical checks failed. Fix issues before deploying.${colors.reset}`);

    // List failures
    const failedModules = results.filter((r) => r.status === 'fail' || r.status === 'error');
    if (failedModules.length > 0) {
      log(`\n  ${colors.red}Failed modules:${colors.reset}`);
      for (const mod of failedModules) {
        const isCritical = VERIFICATION_MODULES.find((m) => m.name === mod.name)?.critical;
        const badge = isCritical ? `${colors.red}[CRITICAL]${colors.reset} ` : '';
        log(`    - ${badge}${mod.name}`);
      }
    }
  }

  // Print next steps
  logHeader('Next Steps');

  if (report.recommendation === 'ready') {
    log(`  1. Run final manual tests`);
    log(`  2. Review the pre-launch checklist: docs/launch/pre-launch-checklist.md`);
    log(`  3. Deploy to production`);
    log(`  4. Monitor error rates after launch`);
  } else if (report.recommendation === 'review_required') {
    log(`  1. Review warnings in the output above`);
    log(`  2. Address unknown non-critical issues`);
    log(`  3. Re-run verification: pnpm run verify`);
    log(`  4. Proceed with caution if warnings are acceptable`);
  } else {
    log(`  1. Review failures in the output above`);
    log(`  2. Check configuration docs: docs/launch/production-config.md`);
    log(`  3. Fix critical issues`);
    log(`  4. Re-run verification: pnpm run verify`);
  }

  // Set exit code
  if (report.recommendation === 'not_ready') {
    process.exitCode = 1;
  }

  // Print footer
  console.log(`
${colors.cyan}══════════════════════════════════════════════════════════════${colors.reset}
${colors.dim}  LXP360-SaaS Production Verification Complete
  Report: reports/verification-*.json
  Documentation: docs/launch/
${colors.reset}${colors.cyan}══════════════════════════════════════════════════════════════${colors.reset}
`);

  return report;
}

// Run if executed directly
main().catch((error) => {
  console.error(`${colors.red}Verification failed:${colors.reset}`, error);
  process.exitCode = 1;
});

export { main as verifyProduction };
export type { ProductionVerificationReport };
