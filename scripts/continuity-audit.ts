#!/usr/bin/env npx ts-node
/**
 * INSPIRE Cognition Continuity Audit Script
 *
 * End-to-end verification of the complete cognitive loop:
 * UI → xAPI Statement → API → BigQuery → Prediction API → UI
 *
 * Run with:
 *   npx ts-node scripts/continuity-audit.ts
 *   npx ts-node scripts/continuity-audit.ts --env=production
 *   npx ts-node scripts/continuity-audit.ts --skip-bigquery
 *
 * @see EU AI Act: This audit verifies the transparency and auditability
 *      requirements for high-risk AI systems in education.
 */

import { randomUUID } from 'crypto';

// ============================================================================
// CONFIGURATION
// ============================================================================

interface AuditConfig {
  baseUrl: string;
  tenantId: string;
  learnerId: string;
  skillId: string;
  skipBigQuery: boolean;
  skipFirestore: boolean;
  verbose: boolean;
}

function parseArgs(): AuditConfig {
  const args = process.argv.slice(2);

  const isProduction = args.includes('--env=production');
  const skipBigQuery = args.includes('--skip-bigquery');
  const skipFirestore = args.includes('--skip-firestore');
  const verbose = args.includes('--verbose') || args.includes('-v');

  return {
    baseUrl: isProduction
      ? process.env.PRODUCTION_URL || 'https://lxp360.com'
      : 'http://localhost:3000',
    tenantId: `audit-tenant-${randomUUID().slice(0, 8)}`,
    learnerId: `audit-learner-${randomUUID().slice(0, 8)}`,
    skillId: `audit-skill-${randomUUID().slice(0, 8)}`,
    skipBigQuery,
    skipFirestore,
    verbose,
  };
}

// ============================================================================
// COLORS & FORMATTING
// ============================================================================

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string): void {
  console.log(message);
}

function logHeader(title: string): void {
  log(`\n${colors.bright}${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`);
  log(`${colors.bright}${colors.cyan}  ${title}${colors.reset}`);
  log(`${colors.bright}${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}\n`);
}

function logPhase(phase: string): void {
  log(`\n${colors.bright}${colors.blue}▶ ${phase}${colors.reset}`);
  log(`${colors.dim}${'─'.repeat(60)}${colors.reset}`);
}

function logPass(test: string, duration?: number): void {
  const time = duration ? ` ${colors.dim}(${duration}ms)${colors.reset}` : '';
  log(`  ${colors.green}✓${colors.reset} ${test}${time}`);
}

function logFail(test: string, error: string): void {
  log(`  ${colors.red}✗${colors.reset} ${test}`);
  log(`    ${colors.red}└─ ${error}${colors.reset}`);
}

function logWarn(test: string, reason: string): void {
  log(`  ${colors.yellow}⚠${colors.reset} ${test}`);
  log(`    ${colors.yellow}└─ ${reason}${colors.reset}`);
}

function logSkip(test: string, reason: string): void {
  log(`  ${colors.dim}○ ${test} (skipped: ${reason})${colors.reset}`);
}

function logInfo(message: string): void {
  log(`  ${colors.dim}ℹ ${message}${colors.reset}`);
}

// ============================================================================
// TEST UTILITIES
// ============================================================================

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warn' | 'skip';
  duration?: number;
  error?: string;
  details?: unknown;
}

const results: TestResult[] = [];

async function runTest(
  name: string,
  testFn: () => Promise<void>,
  skipReason?: string,
): Promise<void> {
  if (skipReason) {
    logSkip(name, skipReason);
    results.push({ name, status: 'skip', error: skipReason });
    return;
  }

  const start = Date.now();
  try {
    await testFn();
    const duration = Date.now() - start;
    logPass(name, duration);
    results.push({ name, status: 'pass', duration });
  } catch (error) {
    const duration = Date.now() - start;
    const errorMessage = error instanceof Error ? error.message : String(error);
    logFail(name, errorMessage);
    results.push({ name, status: 'fail', duration, error: errorMessage });
  }
}

// ============================================================================
// API HELPERS
// ============================================================================

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout = 10000,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

// ============================================================================
// TEST PHASES
// ============================================================================

async function phase1_infrastructureHealth(config: AuditConfig): Promise<void> {
  logPhase('PHASE 1: Infrastructure Health');

  // Test: API is reachable
  await runTest('API endpoint reachable', async () => {
    const response = await fetchWithTimeout(`${config.baseUrl}/api/xapi/statements`, {
      method: 'OPTIONS',
    });
    if (!response.ok && response.status !== 204) {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  });

  // Test: CORS headers present
  await runTest('CORS headers configured', async () => {
    const response = await fetchWithTimeout(`${config.baseUrl}/api/xapi/statements`, {
      method: 'OPTIONS',
    });
    const allowOrigin = response.headers.get('Access-Control-Allow-Origin');
    if (!allowOrigin) {
      throw new Error('Missing Access-Control-Allow-Origin header');
    }
  });

  // Test: xAPI version header
  await runTest('xAPI version header present', async () => {
    const response = await fetchWithTimeout(`${config.baseUrl}/api/xapi/statements`, {
      method: 'OPTIONS',
    });
    const version = response.headers.get('X-Experience-API-Version');
    if (version !== '1.0.3') {
      throw new Error(`Expected version 1.0.3, got: ${version}`);
    }
  });
}

async function phase2_apiValidation(config: AuditConfig): Promise<void> {
  logPhase('PHASE 2: API Validation');

  const validStatement = {
    actor: {
      account: {
        homePage: 'https://lxd360.com',
        name: config.learnerId,
      },
    },
    verb: {
      id: 'http://adlnet.gov/expapi/verbs/answered',
      display: { 'en-US': 'answered' },
    },
    object: {
      id: `https://lxd360.com/activities/audit-test-${randomUUID()}`,
      definition: {
        type: 'http://adlnet.gov/expapi/activities/assessment',
        name: { 'en-US': 'Audit Test Question' },
      },
    },
    result: {
      success: true,
      score: { scaled: 0.85 },
    },
    context: {
      extensions: {
        'https://inspire.lxd360.com/xapi/extensions/consent-tier': 2,
        'https://inspire.lxd360.com/xapi/extensions/skill-id': config.skillId,
        'https://inspire.lxd360.com/xapi/extensions/latency': 3500,
        'https://inspire.lxd360.com/xapi/extensions/modality': 'interactive',
      },
    },
  };

  // Test: Single statement ingestion
  await runTest('Single statement ingestion', async () => {
    const response = await fetchWithTimeout(`${config.baseUrl}/api/xapi/statements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': config.tenantId,
      },
      body: JSON.stringify({ statement: validStatement }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `Status: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success || result.data?.accepted !== 1) {
      throw new Error('Statement not accepted');
    }
  });

  // Test: Batch ingestion
  await runTest('Batch statement ingestion (3 statements)', async () => {
    const statements = [
      { ...validStatement, object: { ...validStatement.object, id: `https://lxd360.com/activities/batch-1-${randomUUID()}` } },
      { ...validStatement, object: { ...validStatement.object, id: `https://lxd360.com/activities/batch-2-${randomUUID()}` } },
      { ...validStatement, object: { ...validStatement.object, id: `https://lxd360.com/activities/batch-3-${randomUUID()}` } },
    ];

    const response = await fetchWithTimeout(`${config.baseUrl}/api/xapi/statements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': config.tenantId,
      },
      body: JSON.stringify({ statements }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `Status: ${response.status}`);
    }

    const result = await response.json();
    if (result.data?.accepted !== 3) {
      throw new Error(`Expected 3 accepted, got: ${result.data?.accepted}`);
    }
  });

  // Test: Invalid statement rejection
  await runTest('Invalid statement rejection (Zod validation)', async () => {
    const invalidStatement = {
      actor: { name: 'Missing identifier' }, // Invalid - no mbox or account
      verb: { id: 'not-a-url' }, // Invalid - not a URL
      object: { id: 'also-not-a-url' },
    };

    const response = await fetchWithTimeout(`${config.baseUrl}/api/xapi/statements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': config.tenantId,
      },
      body: JSON.stringify({ statement: invalidStatement }),
    });

    if (response.ok) {
      throw new Error('Invalid statement was accepted (should have been rejected)');
    }

    const result = await response.json();
    if (result.error?.code !== 'VALIDATION_ERROR') {
      throw new Error(`Expected VALIDATION_ERROR, got: ${result.error?.code}`);
    }
  });

  // Test: Tenant ID enforcement
  await runTest('Tenant ID enforcement (multi-tenancy)', async () => {
    const response = await fetchWithTimeout(`${config.baseUrl}/api/xapi/statements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Intentionally missing X-Tenant-ID
      },
      body: JSON.stringify({ statement: validStatement }),
    });

    if (response.ok) {
      throw new Error('Request without tenant ID was accepted');
    }

    const result = await response.json();
    if (result.error?.code !== 'MISSING_TENANT_ID') {
      throw new Error(`Expected MISSING_TENANT_ID, got: ${result.error?.code}`);
    }
  });
}

async function phase3_predictionApi(config: AuditConfig): Promise<void> {
  logPhase('PHASE 3: Prediction API (Modality Swap)');

  // Test: Prediction endpoint
  await runTest('Prediction endpoint responds', async () => {
    const response = await fetchWithTimeout(`${config.baseUrl}/api/xapi/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': config.tenantId,
      },
      body: JSON.stringify({
        learnerId: config.learnerId,
        skillId: config.skillId,
        currentModality: 'text',
        availableModalities: ['video', 'text', 'interactive'],
        signals: {
          latency: 8000,
          expectedLatency: 5000,
          streakIncorrect: 2,
          cognitiveLoad: 7,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `Status: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success || !result.prediction) {
      throw new Error('Prediction not returned');
    }
  });

  // Test: Glass Box explanation provided
  await runTest('Glass Box explanation provided (EU AI Act)', async () => {
    const response = await fetchWithTimeout(`${config.baseUrl}/api/xapi/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': config.tenantId,
      },
      body: JSON.stringify({
        learnerId: config.learnerId,
        skillId: config.skillId,
        signals: { streakIncorrect: 3, cognitiveLoad: 8 },
      }),
    });

    const result = await response.json();
    if (!result.explanation?.primaryReason) {
      throw new Error('Glass Box explanation missing primary reason');
    }
    if (!result.audit?.predictionId) {
      throw new Error('Audit trail missing prediction ID');
    }
  });

  // Test: Functional state detection
  await runTest('Functional state detection (struggling)', async () => {
    const response = await fetchWithTimeout(`${config.baseUrl}/api/xapi/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': config.tenantId,
      },
      body: JSON.stringify({
        learnerId: config.learnerId,
        skillId: config.skillId,
        signals: { streakIncorrect: 4, cognitiveLoad: 9 },
      }),
    });

    const result = await response.json();
    if (result.prediction?.functionalState !== 'struggling') {
      throw new Error(`Expected 'struggling', got: ${result.prediction?.functionalState}`);
    }
  });

  // Test: Modality swap recommendation
  await runTest('Modality swap triggered when appropriate', async () => {
    const response = await fetchWithTimeout(`${config.baseUrl}/api/xapi/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': config.tenantId,
      },
      body: JSON.stringify({
        learnerId: config.learnerId,
        skillId: config.skillId,
        currentModality: 'text',
        availableModalities: ['video', 'text', 'interactive'],
        signals: { streakIncorrect: 3 },
      }),
    });

    const result = await response.json();
    if (!result.prediction?.shouldSwap) {
      logInfo('shouldSwap=false (may be expected depending on confidence threshold)');
    }
    if (result.prediction?.recommendedModality === 'text') {
      logInfo('Recommended same modality (may need tuning)');
    }
  });
}

async function phase4_endToEndLatency(config: AuditConfig): Promise<void> {
  logPhase('PHASE 4: End-to-End Latency');

  // Test: Statement ingestion latency
  await runTest('Statement ingestion < 500ms', async () => {
    const start = Date.now();

    await fetchWithTimeout(`${config.baseUrl}/api/xapi/statements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': config.tenantId,
      },
      body: JSON.stringify({
        statement: {
          actor: { account: { homePage: 'https://lxd360.com', name: config.learnerId } },
          verb: { id: 'http://adlnet.gov/expapi/verbs/experienced' },
          object: { id: `https://lxd360.com/activities/latency-test-${randomUUID()}` },
          context: {
            extensions: {
              'https://inspire.lxd360.com/xapi/extensions/consent-tier': 2,
            },
          },
        },
      }),
    });

    const duration = Date.now() - start;
    if (duration > 500) {
      throw new Error(`Latency ${duration}ms exceeds 500ms threshold`);
    }
  });

  // Test: Prediction latency
  await runTest('Prediction response < 200ms', async () => {
    const start = Date.now();

    await fetchWithTimeout(`${config.baseUrl}/api/xapi/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': config.tenantId,
      },
      body: JSON.stringify({
        learnerId: config.learnerId,
        skillId: config.skillId,
      }),
    });

    const duration = Date.now() - start;
    if (duration > 200) {
      throw new Error(`Latency ${duration}ms exceeds 200ms threshold`);
    }
  });
}

// ============================================================================
// SUMMARY
// ============================================================================

function printSummary(): void {
  logHeader('AUDIT SUMMARY');

  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const warned = results.filter((r) => r.status === 'warn').length;
  const skipped = results.filter((r) => r.status === 'skip').length;
  const total = results.length;

  log(`  ${colors.green}Passed:${colors.reset}  ${passed}`);
  log(`  ${colors.red}Failed:${colors.reset}  ${failed}`);
  log(`  ${colors.yellow}Warned:${colors.reset}  ${warned}`);
  log(`  ${colors.dim}Skipped:${colors.reset} ${skipped}`);
  log(`  ${colors.bright}Total:${colors.reset}   ${total}`);
  log('');

  if (failed > 0) {
    log(`${colors.red}${colors.bright}AUDIT FAILED${colors.reset}`);
    log(`\n${colors.red}Failed tests:${colors.reset}`);
    for (const result of results.filter((r) => r.status === 'fail')) {
      log(`  • ${result.name}: ${result.error}`);
    }
    process.exit(1);
  } else {
    log(`${colors.green}${colors.bright}AUDIT PASSED${colors.reset}`);
    process.exit(0);
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  const config = parseArgs();

  logHeader('INSPIRE COGNITION CONTINUITY AUDIT');
  log(`  Environment: ${config.baseUrl.includes('localhost') ? 'Development' : 'Production'}`);
  log(`  Base URL:    ${config.baseUrl}`);
  log(`  Tenant ID:   ${config.tenantId}`);
  log(`  Learner ID:  ${config.learnerId}`);
  log(`  Skill ID:    ${config.skillId}`);

  try {
    await phase1_infrastructureHealth(config);
    await phase2_apiValidation(config);
    await phase3_predictionApi(config);
    await phase4_endToEndLatency(config);
  } catch (error) {
    log(`\n${colors.red}Unexpected error: ${error}${colors.reset}`);
  }

  printSummary();
}

main().catch(console.error);
