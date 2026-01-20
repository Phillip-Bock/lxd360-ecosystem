import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  // Test directory - include both e2e and accessibility tests
  testDir: './tests',

  // Test file pattern - only match spec files in e2e and accessibility folders
  testMatch: ['e2e/**/*.spec.ts', 'accessibility/**/*.spec.ts'],

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ...(process.env.CI ? [['github'] as const] : []),
  ],

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Take screenshot on failure
    screenshot: 'only-on-failure',

    // Record video on failure
    video: 'on-first-retry',

    // Maximum time each action can take
    actionTimeout: 15000,

    // Maximum time navigation can take
    navigationTimeout: 30000,
  },

  // Global timeout for each test
  timeout: 60000,

  // Expect timeout
  expect: {
    timeout: 10000,
  },

  // Configure projects for major browsers
  projects: [
    // Setup project - runs auth setup before tests
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Desktop browsers
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'tests/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: 'tests/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Mobile browsers
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        storageState: 'tests/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
        storageState: 'tests/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Test against branded browsers.
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Output folder for test artifacts
  outputDir: 'test-results/',

  // Global setup/teardown
  globalSetup: './tests/global-setup.ts',
  globalTeardown: './tests/global-teardown.ts',
});
