#!/usr/bin/env npx ts-node
/**
 * =============================================================================
 * LXP360-SaaS | Security - Environment Variable Exposure Check
 * =============================================================================
 *
 * @fileoverview Scans codebase for potential secret exposure
 *
 * @usage npx ts-node scripts/security/check-env-exposure.ts
 *
 * @security Run this before each deployment to catch accidental secret leaks
 *
 * =============================================================================
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// ============================================================================
// Configuration
// ============================================================================

// Patterns that indicate sensitive data
const SENSITIVE_PATTERNS = [
  /api[_-]?key/i,
  /secret[_-]?key/i,
  /private[_-]?key/i,
  /password/i,
  /credential/i,
  /auth[_-]?token/i,
  /access[_-]?token/i,
  /refresh[_-]?token/i,
  /bearer/i,
  /jwt/i,
  /session[_-]?secret/i,
  /encryption[_-]?key/i,
  /signing[_-]?key/i,
  /webhook[_-]?secret/i,
  /database[_-]?url/i,
  /connection[_-]?string/i,
];

// NEXT_PUBLIC_ variables that are SAFE to expose (public by design)
const _SAFE_PUBLIC_VARS = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_APP_ENV',
  'NEXT_PUBLIC_GOOGLE_ANALYTICS_ID',
  'NEXT_PUBLIC_POSTHOG_KEY',
];

// Variables that should NEVER be in NEXT_PUBLIC_
const DANGEROUS_IF_PUBLIC = [
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'GOOGLE_CLOUD_PROJECT',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'GOOGLE_API_KEY',
  'BREVO_API_KEY',
  'DATABASE_URL',
  'DIRECT_URL',
  'INNGEST_SIGNING_KEY',
  'INNGEST_EVENT_KEY',
];

// Directories to scan
const SCAN_DIRS = ['app', 'components', 'lib', 'hooks', 'utils', 'pages'];

// File extensions to scan
const SCAN_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];

// Files/directories to skip
const SKIP_PATTERNS = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  '.env',
  '.env.local',
  '.env.example',
];

// ============================================================================
// Types
// ============================================================================

interface SecurityIssue {
  file: string;
  line: number;
  type: 'critical' | 'warning' | 'info';
  message: string;
  code: string;
}

// ============================================================================
// Scanner
// ============================================================================

class EnvSecurityScanner {
  private issues: SecurityIssue[] = [];
  private scannedFiles = 0;

  async scan(): Promise<void> {
    console.log('🔍 Scanning for environment variable security issues...\n');

    for (const dir of SCAN_DIRS) {
      const fullPath = path.join(process.cwd(), dir);
      if (fs.existsSync(fullPath)) {
        await this.scanDirectory(fullPath);
      }
    }

    this.printResults();
  }

  private async scanDirectory(dirPath: string): Promise<void> {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      // Skip excluded patterns
      if (SKIP_PATTERNS.some((pattern) => fullPath.includes(pattern))) {
        continue;
      }

      if (entry.isDirectory()) {
        await this.scanDirectory(fullPath);
      } else if (entry.isFile() && SCAN_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
        await this.scanFile(fullPath);
      }
    }
  }

  private async scanFile(filePath: string): Promise<void> {
    this.scannedFiles++;
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const relativePath = path.relative(process.cwd(), filePath);

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // Check for console.log of process.env
      if (this.checkConsoleLogEnv(line, relativePath, lineNum)) return;

      // Check for dangerous NEXT_PUBLIC_ usage
      this.checkDangerousPublicVars(line, relativePath, lineNum);

      // Check for hardcoded secrets
      this.checkHardcodedSecrets(line, relativePath, lineNum);

      // Check for env var in template literals that might be logged
      this.checkTemplateEnvLeak(line, relativePath, lineNum);
    });
  }

  private checkConsoleLogEnv(line: string, file: string, lineNum: number): boolean {
    // Check for console.log(process.env.XXX) patterns
    const consoleLogEnvMatch = line.match(
      /console\.(log|info|debug|warn|error)\s*\([^)]*process\.env\.(\w+)/i,
    );
    if (consoleLogEnvMatch) {
      const varName = consoleLogEnvMatch[2];
      // Check if it's a sensitive variable
      const isSensitive =
        SENSITIVE_PATTERNS.some((pattern) => pattern.test(varName)) ||
        DANGEROUS_IF_PUBLIC.includes(varName);

      if (isSensitive) {
        this.issues.push({
          file,
          line: lineNum,
          type: 'critical',
          message: `Logging sensitive env var: ${varName}`,
          code: line.trim(),
        });
        return true;
      }
    }
    return false;
  }

  private checkDangerousPublicVars(line: string, file: string, lineNum: number): void {
    // Check for process.env.NEXT_PUBLIC_ with dangerous var names
    const publicEnvMatch = line.match(/process\.env\.NEXT_PUBLIC_(\w+)/g);
    if (publicEnvMatch) {
      for (const match of publicEnvMatch) {
        const varName = match.replace('process.env.', '');
        // Check if someone accidentally exposed a dangerous var
        for (const dangerous of DANGEROUS_IF_PUBLIC) {
          if (varName.includes(dangerous.replace('NEXT_PUBLIC_', ''))) {
            this.issues.push({
              file,
              line: lineNum,
              type: 'critical',
              message: `Potentially dangerous variable exposed as NEXT_PUBLIC_: ${varName}`,
              code: line.trim(),
            });
          }
        }
      }
    }
  }

  private checkHardcodedSecrets(line: string, file: string, lineNum: number): void {
    // Skip comment lines
    if (
      line.trim().startsWith('//') ||
      line.trim().startsWith('*') ||
      line.trim().startsWith('/*')
    ) {
      return;
    }

    // Check for hardcoded API key patterns
    const apiKeyPatterns = [
      /['"`]sk-[a-zA-Z0-9]{20,}['"`]/, // OpenAI-style
      /['"`]sk_live_[a-zA-Z0-9]+['"`]/, // Stripe live key
      /['"`]sk_test_[a-zA-Z0-9]+['"`]/, // Stripe test key
      /['"`]xoxb-[a-zA-Z0-9-]+['"`]/, // Slack bot token
      /['"`]ghp_[a-zA-Z0-9]{36}['"`]/, // GitHub PAT
      /['"`]glpat-[a-zA-Z0-9-]+['"`]/, // GitLab PAT
      /['"`]AKIA[A-Z0-9]{16}['"`]/, // AWS Access Key
    ];

    for (const pattern of apiKeyPatterns) {
      if (pattern.test(line)) {
        this.issues.push({
          file,
          line: lineNum,
          type: 'critical',
          message: 'Potential hardcoded API key detected',
          code: line.trim().substring(0, 100) + (line.length > 100 ? '...' : ''),
        });
        break;
      }
    }

    // Check for password-like assignments
    const passwordPattern =
      /(password|secret|apiKey|api_key|auth_token)\s*[:=]\s*['"`][^'"`]+['"`]/i;
    if (passwordPattern.test(line) && !line.includes('process.env')) {
      this.issues.push({
        file,
        line: lineNum,
        type: 'warning',
        message: 'Potential hardcoded credential',
        code: line.trim().substring(0, 100) + (line.length > 100 ? '...' : ''),
      });
    }
  }

  private checkTemplateEnvLeak(line: string, file: string, lineNum: number): void {
    // Check for env vars in error messages or template strings that might be logged
    const templateEnvMatch = line.match(/`[^`]*\$\{process\.env\.(\w+)\}[^`]*`/g);
    if (templateEnvMatch) {
      for (const match of templateEnvMatch) {
        const varMatch = match.match(/process\.env\.(\w+)/);
        if (varMatch) {
          const varName = varMatch[1];
          const isSensitive =
            SENSITIVE_PATTERNS.some((pattern) => pattern.test(varName)) ||
            DANGEROUS_IF_PUBLIC.includes(varName);

          if (
            isSensitive &&
            (line.includes('error') || line.includes('Error') || line.includes('throw'))
          ) {
            this.issues.push({
              file,
              line: lineNum,
              type: 'warning',
              message: `Sensitive env var in potential error message: ${varName}`,
              code: line.trim().substring(0, 100) + (line.length > 100 ? '...' : ''),
            });
          }
        }
      }
    }
  }

  private printResults(): void {
    console.log(`\n📊 Scanned ${this.scannedFiles} files\n`);

    if (this.issues.length === 0) {
      console.log('✅ No environment variable security issues found!\n');
      return;
    }

    // Sort by severity
    const critical = this.issues.filter((i) => i.type === 'critical');
    const warnings = this.issues.filter((i) => i.type === 'warning');
    const info = this.issues.filter((i) => i.type === 'info');

    console.log(`Found ${this.issues.length} potential issues:\n`);

    if (critical.length > 0) {
      console.log('🚨 CRITICAL ISSUES:');
      console.log('==================');
      for (const issue of critical) {
        console.log(`\n  File: ${issue.file}:${issue.line}`);
        console.log(`  Issue: ${issue.message}`);
        console.log(`  Code: ${issue.code}`);
      }
      console.log('');
    }

    if (warnings.length > 0) {
      console.log('⚠️  WARNINGS:');
      console.log('=============');
      for (const issue of warnings) {
        console.log(`\n  File: ${issue.file}:${issue.line}`);
        console.log(`  Issue: ${issue.message}`);
        console.log(`  Code: ${issue.code}`);
      }
      console.log('');
    }

    if (info.length > 0) {
      console.log('ℹ️  INFO:');
      console.log('=========');
      for (const issue of info) {
        console.log(`\n  File: ${issue.file}:${issue.line}`);
        console.log(`  Issue: ${issue.message}`);
      }
      console.log('');
    }

    // Summary
    console.log('\n📋 SUMMARY:');
    console.log(`   Critical: ${critical.length}`);
    console.log(`   Warnings: ${warnings.length}`);
    console.log(`   Info: ${info.length}`);
    console.log('');

    if (critical.length > 0) {
      console.log('❌ DEPLOYMENT BLOCKED: Fix critical issues before deploying!\n');
      process.exit(1);
    }
  }
}

// ============================================================================
// Entry Point
// ============================================================================

const scanner = new EnvSecurityScanner();
scanner.scan().catch(console.error);
