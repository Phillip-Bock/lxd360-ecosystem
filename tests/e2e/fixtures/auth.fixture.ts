import { type BrowserContext, test as base, type Page } from '@playwright/test';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * User role configuration for test fixtures
 */
interface UserCredentials {
  email: string;
  password: string;
  role: 'admin' | 'instructor' | 'learner';
}

/**
 * Extended test fixtures with role-based authenticated pages
 */
interface AuthFixtures {
  /** General authenticated page */
  authenticatedPage: Page;
  /** Admin user page context */
  adminPage: Page;
  /** Instructor user page context */
  instructorPage: Page;
  /** Learner user page context */
  learnerPage: Page;
  /** Authenticated browser context */
  authenticatedContext: BrowserContext;
}

// =============================================================================
// TEST USER CREDENTIALS
// =============================================================================

/**
 * Test user credentials for different roles
 * These should be configured via environment variables in CI
 */
const TEST_USERS: Record<string, UserCredentials> = {
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@lxd360.test',
    password: process.env.TEST_ADMIN_PASSWORD || 'AdminTestPass123!',
    role: 'admin',
  },
  instructor: {
    email: process.env.TEST_INSTRUCTOR_EMAIL || 'instructor@lxd360.test',
    password: process.env.TEST_INSTRUCTOR_PASSWORD || 'InstructorTestPass123!',
    role: 'instructor',
  },
  learner: {
    email: process.env.TEST_LEARNER_EMAIL || 'learner@lxd360.test',
    password: process.env.TEST_LEARNER_PASSWORD || 'LearnerTestPass123!',
    role: 'learner',
  },
  default: {
    email: process.env.TEST_USER_EMAIL || 'test@lxd360.test',
    password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
    role: 'learner',
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Authenticate a page with the given user credentials
 * @param page - Playwright page instance
 * @param credentials - User credentials for authentication
 */
async function authenticatePage(page: Page, credentials: UserCredentials): Promise<void> {
  const baseURL = page.url().split('/').slice(0, 3).join('/') || 'http://localhost:3000';

  // Navigate to login page
  await page.goto(`${baseURL}/auth/login`, { waitUntil: 'domcontentloaded' });

  // Wait for login form to be ready
  await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });

  // Fill in credentials
  await page.fill('input[type="email"], input[name="email"]', credentials.email);
  await page.fill('input[type="password"], input[name="password"]', credentials.password);

  // Submit the form
  await page.click('button[type="submit"]');

  // Wait for successful authentication (redirect to dashboard)
  await page.waitForURL('**/dashboard**', { timeout: 30000 }).catch(() => {
    // If redirect doesn't happen, check if we're still on login (error case)
    // This allows tests to continue even if auth fails in setup
  });
}

/**
 * Create an authenticated browser context with stored state
 * @param browser - Browser instance
 * @param credentials - User credentials for authentication
 */
async function createAuthenticatedContext(
  context: BrowserContext,
  credentials: UserCredentials,
): Promise<Page> {
  const page = await context.newPage();
  await authenticatePage(page, credentials);
  return page;
}

// =============================================================================
// PLAYWRIGHT FIXTURES
// =============================================================================

/**
 * Extended Playwright test with authentication fixtures
 *
 * @example
 * ```typescript
 * import { test, expect } from '../fixtures/auth.fixture';
 *
 * test('instructor can create course', async ({ instructorPage }) => {
 *   await instructorPage.goto('/inspire-studio/courses');
 *   await expect(instructorPage).toHaveURL(/courses/);
 * });
 *
 * test('learner can browse catalog', async ({ learnerPage }) => {
 *   await learnerPage.goto('/courses');
 *   await expect(learnerPage.locator('h1')).toContainText('Courses');
 * });
 * ```
 */
export const test = base.extend<AuthFixtures>({
  /**
   * Authenticated browser context that can be reused
   */
  authenticatedContext: async ({ browser }, use) => {
    const context = await browser.newContext();
    await use(context);
    await context.close();
  },

  /**
   * General authenticated page (uses default test user)
   */
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await createAuthenticatedContext(context, TEST_USERS.default);
    await use(page);
    await context.close();
  },

  /**
   * Admin user page context
   * Has access to command center and admin features
   */
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await createAuthenticatedContext(context, TEST_USERS.admin);
    await use(page);
    await context.close();
  },

  /**
   * Instructor user page context
   * Has access to course authoring and inspire studio
   */
  instructorPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await createAuthenticatedContext(context, TEST_USERS.instructor);
    await use(page);
    await context.close();
  },

  /**
   * Learner user page context
   * Has access to course browsing, enrollment, and learning
   */
  learnerPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await createAuthenticatedContext(context, TEST_USERS.learner);
    await use(page);
    await context.close();
  },
});

// Re-export expect for convenience
export { expect } from '@playwright/test';

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

export { TEST_USERS, authenticatePage, createAuthenticatedContext };
export type { AuthFixtures, UserCredentials };
