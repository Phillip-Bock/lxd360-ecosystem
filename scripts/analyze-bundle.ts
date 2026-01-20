/**
 * =============================================================================
 * LXP360-SaaS | Bundle Analysis Script
 * =============================================================================
 *
 * @fileoverview Bundle size analysis and reporting
 *
 * @description
 * Provides utilities for analyzing and reporting bundle sizes:
 * - Runs webpack bundle analyzer
 * - Generates size reports
 * - Compares against thresholds
 * - Outputs actionable recommendations
 *
 * @usage
 * pnpm analyze        - Run bundle analyzer with visual report
 * pnpm analyze:report - Generate JSON size report
 *
 * =============================================================================
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// ============================================================================
// Configuration
// ============================================================================

/**
 * Bundle size thresholds (in KB)
 * Exceeding these triggers warnings
 */
const SIZE_THRESHOLDS = {
  // Main app bundles
  'main-app': 250,
  page: 150,
  layout: 100,

  // Third-party chunks
  framework: 150,
  commons: 200,

  // First-party chunks
  components: 100,
  lib: 50,

  // Total bundle limits
  'total-first-load-js': 500,
  'total-shared': 300,
} as const;

/**
 * Packages to watch for size issues
 */
const WATCH_PACKAGES = [
  'recharts',
  'framer-motion',
  '@react-three/fiber',
  '@react-three/drei',
  'three',
  'react-pdf',
  'date-fns',
  'lucide-react',
  'firebase',
] as const;

// ============================================================================
// Types
// ============================================================================

interface BundleInfo {
  name: string;
  size: number;
  gzipSize: number;
  parsedSize: number;
}

interface BuildManifest {
  pages: Record<string, string[]>;
  devFiles: string[];
  ampDevFiles: string[];
  polyfillFiles: string[];
  lowPriorityFiles: string[];
  rootMainFiles: string[];
  ampFirstPages: string[];
}

interface SizeReport {
  timestamp: string;
  totalSize: number;
  totalGzipSize: number;
  bundles: BundleInfo[];
  recommendations: string[];
  warnings: string[];
}

// ============================================================================
// Analysis Functions
// ============================================================================

/**
 * Parse Next.js build output directory
 */
function parseBuildOutput(buildDir: string): BundleInfo[] {
  const bundles: BundleInfo[] = [];
  const staticDir = path.join(buildDir, 'static');

  if (!fs.existsSync(staticDir)) {
    console.error('Build directory not found. Run "next build" first.');
    process.exit(1);
  }

  // Parse chunks directory
  const chunksDir = path.join(staticDir, 'chunks');
  if (fs.existsSync(chunksDir)) {
    const files = fs.readdirSync(chunksDir);
    for (const file of files) {
      if (file.endsWith('.js')) {
        const filePath = path.join(chunksDir, file);
        const stats = fs.statSync(filePath);
        bundles.push({
          name: file,
          size: stats.size,
          gzipSize: Math.round(stats.size * 0.3), // Estimate
          parsedSize: stats.size,
        });
      }
    }
  }

  return bundles;
}

/**
 * Analyze bundle sizes against thresholds
 */
function analyzeThresholds(bundles: BundleInfo[]): {
  warnings: string[];
  recommendations: string[];
} {
  const warnings: string[] = [];
  const recommendations: string[] = [];

  const totalSize = bundles.reduce((sum, b) => sum + b.size, 0);
  const totalKB = Math.round(totalSize / 1024);

  // Check total bundle size
  if (totalKB > SIZE_THRESHOLDS['total-first-load-js']) {
    warnings.push(
      `Total JS bundle (${totalKB}KB) exceeds threshold (${SIZE_THRESHOLDS['total-first-load-js']}KB)`,
    );
  }

  // Check individual chunks
  for (const bundle of bundles) {
    const sizeKB = Math.round(bundle.size / 1024);

    // Check for large chunks
    if (sizeKB > 200) {
      warnings.push(`Large chunk detected: ${bundle.name} (${sizeKB}KB)`);
      recommendations.push(`Consider code-splitting ${bundle.name}`);
    }

    // Check for common large packages
    for (const pkg of WATCH_PACKAGES) {
      if (bundle.name.includes(pkg.replace(/[@/]/g, ''))) {
        if (sizeKB > 50) {
          recommendations.push(`${pkg} contributing ${sizeKB}KB - consider lazy loading`);
        }
      }
    }
  }

  // General recommendations based on patterns
  if (bundles.some((b) => b.name.includes('polyfill') && b.size > 50000)) {
    recommendations.push('Consider using browserslist to reduce polyfill size');
  }

  if (bundles.filter((b) => b.size > 100000).length > 5) {
    recommendations.push('Many large chunks detected - review code splitting strategy');
  }

  return { warnings, recommendations };
}

/**
 * Generate optimization recommendations
 */
function generateRecommendations(_bundles: BundleInfo[]): string[] {
  const recommendations: string[] = [];

  // Check for tree-shaking opportunities
  recommendations.push('Ensure barrel files (index.ts) use named exports');
  recommendations.push('Use dynamic imports for heavy components (3D, Charts, PDF)');
  recommendations.push('Review lucide-react imports - use specific icon imports');
  recommendations.push('Consider using @next/bundle-analyzer for visual analysis');

  return recommendations;
}

/**
 * Generate full size report
 */
function generateReport(buildDir: string): SizeReport {
  const bundles = parseBuildOutput(buildDir);
  const { warnings, recommendations } = analyzeThresholds(bundles);
  const additionalRecs = generateRecommendations(bundles);

  const totalSize = bundles.reduce((sum, b) => sum + b.size, 0);
  const totalGzipSize = bundles.reduce((sum, b) => sum + b.gzipSize, 0);

  return {
    timestamp: new Date().toISOString(),
    totalSize,
    totalGzipSize,
    bundles: bundles.sort((a, b) => b.size - a.size),
    warnings,
    recommendations: [...recommendations, ...additionalRecs],
  };
}

// ============================================================================
// Output Functions
// ============================================================================

/**
 * Print report to console
 */
function printReport(report: SizeReport): void {
  console.log(`\n${'='.repeat(60)}`);
  console.log('BUNDLE SIZE ANALYSIS REPORT');
  console.log(`${'='.repeat(60)}\n`);

  console.log(`Generated: ${report.timestamp}`);
  console.log(`Total Size: ${formatBytes(report.totalSize)}`);
  console.log(`Gzipped: ${formatBytes(report.totalGzipSize)} (estimated)\n`);

  // Warnings
  if (report.warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    report.warnings.forEach((w) => console.log(`   - ${w}`));
    console.log();
  }

  // Top 10 largest bundles
  console.log('📦 LARGEST BUNDLES:');
  report.bundles.slice(0, 10).forEach((bundle, i) => {
    console.log(`   ${i + 1}. ${bundle.name}: ${formatBytes(bundle.size)}`);
  });
  console.log();

  // Recommendations
  if (report.recommendations.length > 0) {
    console.log('💡 RECOMMENDATIONS:');
    report.recommendations.forEach((r) => console.log(`   - ${r}`));
    console.log();
  }

  console.log(`${'='.repeat(60)}\n`);
}

/**
 * Save report to JSON file
 */
function saveReport(report: SizeReport, outputPath: string): void {
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  console.log(`Report saved to: ${outputPath}`);
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ============================================================================
// CLI
// ============================================================================

function main(): void {
  const args = process.argv.slice(2);
  const buildDir = path.join(process.cwd(), '.next');

  if (!fs.existsSync(buildDir)) {
    console.error('❌ Build directory not found.');
    console.error('   Run "pnpm build" first, then run this analysis.');
    process.exit(1);
  }

  const report = generateReport(buildDir);

  if (args.includes('--json')) {
    const outputPath = path.join(process.cwd(), 'bundle-report.json');
    saveReport(report, outputPath);
  }

  printReport(report);

  // Exit with error code if warnings exist
  if (report.warnings.length > 0 && args.includes('--strict')) {
    process.exit(1);
  }
}

// Run if executed directly
main();

export { generateReport, printReport, saveReport, SIZE_THRESHOLDS };
export type { BundleInfo, SizeReport };
