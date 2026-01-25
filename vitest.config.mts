/**
 * =============================================================================
 * LXP360-SaaS | Vitest Configuration
 * =============================================================================
 *
 * @fileoverview Configuration for Vitest unit and integration testing
 *
 * @author       LXD360 Development Team
 * @copyright    2024 LXD360 LLC. All rights reserved.
 * @license      Proprietary
 *
 * @created      2024-12-06
 * @version      1.0.0
 *
 * =============================================================================
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],

  test: {
    // Global test configuration
    globals: true,

    // Test environment
    environment: 'jsdom',

    // Setup files to run before each test file
    setupFiles: ['./tests/setup.ts'],

    // Include patterns
    include: [
      'tests/**/*.test.{ts,tsx}',
      'lib/**/__tests__/**/*.test.{ts,tsx}',
      'components/**/__tests__/**/*.test.{ts,tsx}',
      'apps/web/lib/**/__tests__/**/*.test.{ts,tsx}',
      'apps/web/components/**/__tests__/**/*.test.{ts,tsx}',
    ],

    // Exclude patterns
    exclude: ['node_modules', 'dist', '.next', 'tests/e2e/**', '.v2_archive/**'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.{js,ts,mts}',
        '**/types/**',
        '.next/',
        '.v2_archive/**',
      ],
      // Coverage thresholds
      thresholds: {
        statements: 60,
        branches: 60,
        functions: 60,
        lines: 60,
      },
    },

    // Test timeout
    testTimeout: 10000,

    // Hook timeout
    hookTimeout: 10000,

    // Reporter (use 'verbose' by default, 'html' requires @vitest/ui)
    reporters: ['verbose'],

    // Pool options for worker threads
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },

    // Retry failed tests
    retry: process.env.CI ? 2 : 0,

    // Enable watch mode in development
    watch: false,

    // CSS handling
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/components': path.resolve(__dirname, './components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/hooks': path.resolve(__dirname, './hooks'),
      '@/types': path.resolve(__dirname, './types'),
      '@/tests': path.resolve(__dirname, './tests'),
    },
  },
});
