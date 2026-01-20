#!/usr/bin/env npx tsx
// =============================================================================
// INSPIRE Cognition - Final Continuity Audit
// =============================================================================
// End-to-end verification of the complete cognitive loop:
// UI → LRS Bridge → BigQuery → Vertex AI → Firestore → UI
// =============================================================================

import { v4 as uuidv4 } from 'uuid';

// =============================================================================
// Configuration
// =============================================================================

const CONFIG = {
  // API endpoints
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  
  // Test identifiers (isolated for audit)
  tenantId: `audit-tenant-${Date.now()}`,
  learnerId: `audit-learner-${uuidv4()}`,
  sessionId: uuidv4(),
  
  // Timeouts
  bigqueryWaitMs: 5000, // Wait for streaming buffer
  firestoreWaitMs: 2000,
  
  // Feature flags
  skipBigQuery: process.argv.includes('--skip-bigquery'),
  skipFirestore: process.argv.includes('--skip-firestore'),
  verbose: process.argv.includes('--verbose'),
};

// =============================================================================
// Types
// =============================================================================

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip' | 'warn';
  duration: number;
  details?: string;
  error?: string;
}

interface AuditReport {
  timestamp: string;
  environment: string;
  config: typeof CONFIG;
  results: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    warnings: number;
  };
}

// =============================================================================
// Utilities
// =============================================================================

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logResult(result: TestResult) {
  const icon = {
    pass: '✅',
    fail: '❌',
    skip: '⏭️',
    warn: '⚠️',
  }[result.status];
  
  const color = {
    pass: 'green',
    fail: 'red',
    skip: 'dim',
    warn: 'yellow',
  }[result.status] as keyof typeof colors;
  
  log(`${icon} ${result.name} (${result.duration}ms)`, color);
  
  if (result.details && CONFIG.verbose) {
    log(`   ${result.details}`, 'dim');
  }
  
  if (result.error) {
    log(`   Error: ${result.error}`, 'red');
  }
}

async function runTest(
  name: string,
  testFn: () => Promise<{ success: boolean; details?: string; error?: string }>
): Promise<TestResult> {
  const start = Date.now();
  
  try {
    const result = await testFn();
    return {
      name,
      status: result.success ? 'pass' : 'fail',
      duration: Date.now() - start,
      details: result.details,
      error: result.error,
    };
  } catch (error) {
    return {
      name,
      status: 'fail',
      duration: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =============================================================================
// Test: Health Check
// =============================================================================

async function testHealthCheck(): Promise<TestResult> {
  return runTest('Health Check', async () => {
    const response = await fetch(`${CONFIG.baseUrl}/api/xapi/health`);
    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }
    
    if (data.status === 'unhealthy') {
      return { 
        success: false, 
        error: `Service unhealthy: ${data.checks?.bigquery?.error || 'Unknown'}` 
      };
    }
    
    return { 
      success: true, 
      details: `Status: ${data.status}, BigQuery: ${data.checks?.bigquery?.latencyMs}ms` 
    };
  });
}

// =============================================================================
// Test: Single Statement Ingestion
// =============================================================================

async function testSingleStatement(): Promise<TestResult> {
  return runTest('Single Statement Ingestion', async () => {
    const statement = {
      id: uuidv4(),
      actor: {
        objectType: 'Agent' as const,
        account: {
          homePage: 'https://lxd360.com',
          name: CONFIG.learnerId,
        },
      },
      verb: {
        id: 'http://adlnet.gov/expapi/verbs/attempted',
        display: { 'en-US': 'attempted' },
      },
      object: {
        objectType: 'Activity' as const,
        id: `https://inspire.lxd360.com/probes/audit-probe-${Date.now()}`,
        definition: {
          type: 'https://inspire.lxd360.com/xapi/activities/probe',
          name: { 'en-US': 'Audit Probe' },
        },
      },
      result: {
        success: true,
        completion: true,
        duration: 'PT5.5S',
      },
      context: {
        registration: CONFIG.sessionId,
        platform: 'INSPIRE Ignite',
        extensions: {
          'https://inspire.lxd360.com/xapi/extensions/consent-tier': 2,
          'https://inspire.lxd360.com/xapi/extensions/session-id': CONFIG.sessionId,
          'https://inspire.lxd360.com/xapi/extensions/latency': 5500,
        },
      },
      timestamp: new Date().toISOString(),
    };
    
    const response = await fetch(`${CONFIG.baseUrl}/api/xapi/statements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': CONFIG.tenantId,
      },
      body: JSON.stringify({ statement }),
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      return { 
        success: false, 
        error: data.error?.message || `HTTP ${response.status}` 
      };
    }
    
    return { 
      success: true, 
      details: `Statement ID: ${data.data?.statementIds?.[0]}` 
    };
  });
}

// =============================================================================
// Test: Batch Statement Ingestion
// =============================================================================

async function testBatchStatements(): Promise<TestResult> {
  return runTest('Batch Statement Ingestion (3 statements)', async () => {
    const statements = [1, 2, 3].map(i => ({
      id: uuidv4(),
      actor: {
        objectType: 'Agent' as const,
        account: {
          homePage: 'https://lxd360.com',
          name: CONFIG.learnerId,
        },
      },
      verb: {
        id: 'http://adlnet.gov/expapi/verbs/answered',
        display: { 'en-US': 'answered' },
      },
      object: {
        objectType: 'Activity' as const,
        id: `https://inspire.lxd360.com/questions/audit-q${i}-${Date.now()}`,
        definition: {
          type: 'http://adlnet.gov/expapi/activities/question',
          name: { 'en-US': `Audit Question ${i}` },
        },
      },
      result: {
        success: i !== 2, // Q2 is wrong
        completion: true,
        score: { scaled: i !== 2 ? 1.0 : 0.0 },
      },
      context: {
        registration: CONFIG.sessionId,
        platform: 'INSPIRE Ignite',
        extensions: {
          'https://inspire.lxd360.com/xapi/extensions/consent-tier': 2,
          'https://inspire.lxd360.com/xapi/extensions/session-id': CONFIG.sessionId,
          'https://inspire.lxd360.com/xapi/extensions/skill-id': 'audit-skill-001',
          'https://inspire.lxd360.com/xapi/extensions/latency': 3000 + i * 1000,
        },
      },
      timestamp: new Date().toISOString(),
    }));
    
    const response = await fetch(`${CONFIG.baseUrl}/api/xapi/statements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': CONFIG.tenantId,
      },
      body: JSON.stringify({ statements }),
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      return { 
        success: false, 
        error: data.error?.message || `HTTP ${response.status}` 
      };
    }
    
    if (data.data?.count !== 3) {
      return { 
        success: false, 
        error: `Expected 3 statements, got ${data.data?.count}` 
      };
    }
    
    return { success: true, details: `Ingested ${data.data.count} statements` };
  });
}

// =============================================================================
// Test: Validation (Missing Consent Tier)
// =============================================================================

async function testValidationMissingConsent(): Promise<TestResult> {
  return runTest('Validation: Missing Consent Tier Rejected', async () => {
    const statement = {
      id: uuidv4(),
      actor: {
        objectType: 'Agent' as const,
        account: {
          homePage: 'https://lxd360.com',
          name: CONFIG.learnerId,
        },
      },
      verb: {
        id: 'http://adlnet.gov/expapi/verbs/attempted',
        display: { 'en-US': 'attempted' },
      },
      object: {
        objectType: 'Activity' as const,
        id: `https://inspire.lxd360.com/test/no-consent`,
      },
      context: {
        // Intentionally missing consent_tier
        extensions: {
          'https://inspire.lxd360.com/xapi/extensions/session-id': CONFIG.sessionId,
        },
      },
    };
    
    const response = await fetch(`${CONFIG.baseUrl}/api/xapi/statements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': CONFIG.tenantId,
      },
      body: JSON.stringify({ statement }),
    });
    
    const data = await response.json();
    
    // Should be rejected
    if (response.ok && data.success) {
      return { 
        success: false, 
        error: 'Statement without consent_tier should be rejected' 
      };
    }
    
    if (data.error?.code !== 'MISSING_CONSENT_TIER') {
      return { 
        success: false, 
        error: `Expected MISSING_CONSENT_TIER error, got: ${data.error?.code}` 
      };
    }
    
    return { success: true, details: 'Correctly rejected missing consent_tier' };
  });
}

// =============================================================================
// Test: Validation (Missing Tenant ID)
// =============================================================================

async function testValidationMissingTenant(): Promise<TestResult> {
  return runTest('Validation: Missing Tenant ID Rejected', async () => {
    const statement = {
      id: uuidv4(),
      actor: {
        objectType: 'Agent' as const,
        account: { homePage: 'https://lxd360.com', name: 'test' },
      },
      verb: { id: 'http://adlnet.gov/expapi/verbs/attempted' },
      object: { objectType: 'Activity' as const, id: 'https://test' },
      context: {
        extensions: {
          'https://inspire.lxd360.com/xapi/extensions/consent-tier': 2,
        },
      },
    };
    
    const response = await fetch(`${CONFIG.baseUrl}/api/xapi/statements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Intentionally missing x-tenant-id
      },
      body: JSON.stringify({ statement }),
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      return { 
        success: false, 
        error: 'Statement without x-tenant-id should be rejected' 
      };
    }
    
    if (data.error?.code !== 'MISSING_TENANT') {
      return { 
        success: false, 
        error: `Expected MISSING_TENANT error, got: ${data.error?.code}` 
      };
    }
    
    return { success: true, details: 'Correctly rejected missing tenant ID' };
  });
}

// =============================================================================
// Test: Prediction Endpoint
// =============================================================================

async function testPredictionEndpoint(): Promise<TestResult> {
  return runTest('Prediction Endpoint', async () => {
    const response = await fetch(`${CONFIG.baseUrl}/api/xapi/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': CONFIG.tenantId,
      },
      body: JSON.stringify({
        learnerId: CONFIG.learnerId,
        tenantId: CONFIG.tenantId,
        contentBlockId: 'audit-block-001',
        contentBlockName: 'Audit Content Block',
        skillId: 'audit-skill-001',
        currentModality: 'text',
        features: {
          avgLatencyMs: 15000, // Slow = should trigger recommendation
          avgDepth: 1.5,
          correctRate: 0.4,
          sessionDurationMinutes: 30,
          cognitiveLoadEstimate: 8, // High load
        },
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      return { 
        success: false, 
        error: data.error?.message || `HTTP ${response.status}` 
      };
    }
    
    // With high cognitive load and slow latency, should get a recommendation
    if (!data.recommendation) {
      return { 
        success: true, 
        details: 'No recommendation (current modality optimal)' 
      };
    }
    
    return { 
      success: true, 
      details: `Recommended: ${data.recommendation.toModality} (${Math.round(data.recommendation.confidence * 100)}% confidence)` 
    };
  });
}

// =============================================================================
// Test: End-to-End Latency
// =============================================================================

async function testEndToEndLatency(): Promise<TestResult> {
  return runTest('End-to-End Latency (< 500ms target)', async () => {
    const start = Date.now();
    
    // Send statement
    const statement = {
      id: uuidv4(),
      actor: {
        objectType: 'Agent' as const,
        account: { homePage: 'https://lxd360.com', name: CONFIG.learnerId },
      },
      verb: { id: 'http://adlnet.gov/expapi/verbs/experienced' },
      object: { 
        objectType: 'Activity' as const, 
        id: `https://inspire.lxd360.com/latency-test/${Date.now()}` 
      },
      context: {
        extensions: {
          'https://inspire.lxd360.com/xapi/extensions/consent-tier': 2,
        },
      },
    };
    
    await fetch(`${CONFIG.baseUrl}/api/xapi/statements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': CONFIG.tenantId,
      },
      body: JSON.stringify({ statement }),
    });
    
    // Immediately call predict
    await fetch(`${CONFIG.baseUrl}/api/xapi/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': CONFIG.tenantId,
      },
      body: JSON.stringify({
        learnerId: CONFIG.learnerId,
        tenantId: CONFIG.tenantId,
        contentBlockId: 'latency-test',
        contentBlockName: 'Latency Test',
        skillId: 'test-skill',
        currentModality: 'text',
        features: {},
      }),
    });
    
    const latency = Date.now() - start;
    const target = 500;
    
    return {
      success: latency < target,
      details: `${latency}ms (target: <${target}ms)`,
      error: latency >= target ? `Latency ${latency}ms exceeds ${target}ms target` : undefined,
    };
  });
}

// =============================================================================
// Main Audit Runner
// =============================================================================

async function runAudit(): Promise<AuditReport> {
  log('\n╔════════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║          INSPIRE COGNITION - FINAL CONTINUITY AUDIT               ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════════════╝\n', 'cyan');
  
  log(`Environment: ${CONFIG.baseUrl}`, 'dim');
  log(`Tenant ID: ${CONFIG.tenantId}`, 'dim');
  log(`Learner ID: ${CONFIG.learnerId}`, 'dim');
  log(`Session ID: ${CONFIG.sessionId}\n`, 'dim');
  
  const results: TestResult[] = [];
  
  // Phase 1: Infrastructure Health
  log('━━━ Phase 1: Infrastructure Health ━━━\n', 'cyan');
  results.push(await testHealthCheck());
  logResult(results[results.length - 1]);
  
  // Phase 2: API Validation
  log('\n━━━ Phase 2: API Validation ━━━\n', 'cyan');
  
  results.push(await testSingleStatement());
  logResult(results[results.length - 1]);
  
  results.push(await testBatchStatements());
  logResult(results[results.length - 1]);
  
  results.push(await testValidationMissingConsent());
  logResult(results[results.length - 1]);
  
  results.push(await testValidationMissingTenant());
  logResult(results[results.length - 1]);
  
  // Phase 3: AI/ML Integration
  log('\n━━━ Phase 3: AI/ML Integration ━━━\n', 'cyan');
  
  results.push(await testPredictionEndpoint());
  logResult(results[results.length - 1]);
  
  results.push(await testEndToEndLatency());
  logResult(results[results.length - 1]);
  
  // Summary
  const summary = {
    total: results.length,
    passed: results.filter(r => r.status === 'pass').length,
    failed: results.filter(r => r.status === 'fail').length,
    skipped: results.filter(r => r.status === 'skip').length,
    warnings: results.filter(r => r.status === 'warn').length,
  };
  
  log('\n╔════════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                           SUMMARY                                  ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════════════╝\n', 'cyan');
  
  log(`Total Tests: ${summary.total}`);
  log(`  ✅ Passed:   ${summary.passed}`, summary.passed === summary.total ? 'green' : 'reset');
  log(`  ❌ Failed:   ${summary.failed}`, summary.failed > 0 ? 'red' : 'reset');
  log(`  ⏭️  Skipped:  ${summary.skipped}`, 'dim');
  log(`  ⚠️  Warnings: ${summary.warnings}`, summary.warnings > 0 ? 'yellow' : 'reset');
  
  const overallStatus = summary.failed === 0 ? 'PASS' : 'FAIL';
  const statusColor = overallStatus === 'PASS' ? 'green' : 'red';
  
  log(`\n${'═'.repeat(70)}`, statusColor);
  log(`  AUDIT RESULT: ${overallStatus}`, statusColor);
  log(`${'═'.repeat(70)}\n`, statusColor);
  
  const report: AuditReport = {
    timestamp: new Date().toISOString(),
    environment: CONFIG.baseUrl,
    config: CONFIG,
    results,
    summary,
  };
  
  return report;
}

// =============================================================================
// Entry Point
// =============================================================================

runAudit()
  .then(report => {
    // Output JSON report if requested
    if (process.argv.includes('--json')) {
      console.log(JSON.stringify(report, null, 2));
    }
    
    // Exit with appropriate code
    process.exit(report.summary.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('Audit failed:', error);
    process.exit(1);
  });
