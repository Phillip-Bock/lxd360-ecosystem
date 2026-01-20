import { expect, type Page, test } from '@playwright/test';

// =============================================================================
// TEST DATA
// =============================================================================

const TEST_USER = {
  email: 'test-e2e@example.com',
  password: 'TestPassword123!',
  name: 'E2E Test User',
};

const INVALID_USER = {
  email: 'invalid@example.com',
  password: 'WrongPassword123!',
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function fillLoginForm(page: Page, email: string, password: string): Promise<void> {
  await page.fill('input[name="email"], input[type="email"]', email);
  await page.fill('input[name="password"], input[type="password"]', password);
}

async function fillSignUpForm(
  page: Page,
  data: { email: string; password: string; name?: string; confirmPassword?: string },
): Promise<void> {
  await page.fill('input[name="email"], input[type="email"]', data.email);
  if (data.name) {
    await page.fill('input[name="name"], input[name="fullName"]', data.name);
  }
  await page.fill('input[name="password"], input[type="password"]', data.password);
  if (data.confirmPassword) {
    await page.fill(
      'input[name="confirmPassword"], input[name="confirm_password"]',
      data.confirmPassword,
    );
  }
}

// =============================================================================
// SIGN IN TESTS
// =============================================================================

test.describe('Sign In', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
  });

  test('should display login form', async ({ page }) => {
    // Check for login form elements
    await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"], input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    // Submit empty form
    await page.click('button[type="submit"]');

    // Should show validation errors
    const errorMessage = page.locator('[role="alert"], .text-destructive, .text-red-500');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
  });

  test('should show error for invalid email format', async ({ page }) => {
    await fillLoginForm(page, 'notanemail', 'password123');
    await page.click('button[type="submit"]');

    // Should show email validation error
    await expect(page.locator('text=/invalid|email|format/i').first()).toBeVisible({
      timeout: 5000,
    });
  });

  test('should show error for wrong credentials', async ({ page }) => {
    await fillLoginForm(page, INVALID_USER.email, INVALID_USER.password);
    await page.click('button[type="submit"]');

    // Wait for error message
    const errorMessage = page.locator('text=/invalid|incorrect|wrong|credentials|password/i');
    await expect(errorMessage.first()).toBeVisible({ timeout: 10000 });
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    await fillLoginForm(page, TEST_USER.email, TEST_USER.password);
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
  });

  test('should have link to forgot password', async ({ page }) => {
    const forgotPasswordLink = page.locator('a[href*="forgot-password"]');
    await expect(forgotPasswordLink).toBeVisible();

    await forgotPasswordLink.click();
    await expect(page).toHaveURL(/forgot-password/);
  });

  test('should have link to sign up', async ({ page }) => {
    const signUpLink = page.locator('a[href*="sign-up"]');
    await expect(signUpLink).toBeVisible();

    await signUpLink.click();
    await expect(page).toHaveURL(/sign-up/);
  });

  test('should preserve return URL after login', async ({ page }) => {
    // Navigate to protected route first
    await page.goto('/dashboard/courses');

    // Should redirect to login
    await expect(page).toHaveURL(/login/);

    // Login
    await fillLoginForm(page, TEST_USER.email, TEST_USER.password);
    await page.click('button[type="submit"]');

    // Should redirect back to original destination
    await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
  });
});

// =============================================================================
// SIGN UP TESTS
// =============================================================================

test.describe('Sign Up', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/sign-up');
  });

  test('should display sign up form', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.click('button[type="submit"]');

    const errorMessage = page.locator('[role="alert"], .text-destructive, .text-red-500');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
  });

  test('should show error for weak password', async ({ page }) => {
    await fillSignUpForm(page, {
      email: 'newuser@example.com',
      password: '123',
      confirmPassword: '123',
    });
    await page.click('button[type="submit"]');

    // Should show password strength error
    await expect(page.locator('text=/password|weak|short|characters/i').first()).toBeVisible({
      timeout: 5000,
    });
  });

  test('should show error for mismatched passwords', async ({ page }) => {
    await fillSignUpForm(page, {
      email: 'newuser@example.com',
      password: 'ValidPassword123!',
      confirmPassword: 'DifferentPassword456!',
    });
    await page.click('button[type="submit"]');

    // Should show password mismatch error
    await expect(page.locator('text=/match|different|same/i').first()).toBeVisible({
      timeout: 5000,
    });
  });

  test('should show error for existing email', async ({ page }) => {
    await fillSignUpForm(page, {
      email: TEST_USER.email,
      password: 'ValidPassword123!',
      confirmPassword: 'ValidPassword123!',
      name: 'Existing User',
    });
    await page.click('button[type="submit"]');

    // Should show existing user error
    await expect(page.locator('text=/exists|already|registered|account/i').first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('should successfully sign up with valid data', async ({ page }) => {
    const newEmail = `test-${Date.now()}@example.com`;

    await fillSignUpForm(page, {
      email: newEmail,
      password: 'ValidPassword123!',
      confirmPassword: 'ValidPassword123!',
      name: 'New Test User',
    });
    await page.click('button[type="submit"]');

    // Should show success or redirect to verification/dashboard
    await expect(page.locator('text=/verify|confirm|check.*email|dashboard/i').first()).toBeVisible(
      { timeout: 15000 },
    );
  });

  test('should have link to sign in', async ({ page }) => {
    const signInLink = page.locator('a[href*="login"]');
    await expect(signInLink).toBeVisible();

    await signInLink.click();
    await expect(page).toHaveURL(/login/);
  });
});

// =============================================================================
// PASSWORD RESET TESTS
// =============================================================================
// TODO(LXD-316): Re-enable when forgot-password modal is implemented

test.describe
  .skip('Password Reset', () => {
    test.beforeEach(async () => {
      // await page.goto('/auth/forgot-password'); // Route archived
    });

    test('should display forgot password form', async ({ page }) => {
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should show validation error for empty email', async ({ page }) => {
      await page.click('button[type="submit"]');

      const errorMessage = page.locator('[role="alert"], .text-destructive, .text-red-500');
      await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
    });

    test('should show success message for valid email', async ({ page }) => {
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.click('button[type="submit"]');

      // Should show success message
      await expect(
        page.locator('text=/sent|check.*email|reset.*link|instructions/i').first(),
      ).toBeVisible({ timeout: 10000 });
    });

    test('should have link back to login', async ({ page }) => {
      const backToLoginLink = page.locator('a[href*="login"]');
      await expect(backToLoginLink).toBeVisible();

      await backToLoginLink.click();
      await expect(page).toHaveURL(/login/);
    });
  });

// =============================================================================
// SIGN OUT TESTS
// =============================================================================

test.describe('Sign Out', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/auth/login');
    await fillLoginForm(page, TEST_USER.email, TEST_USER.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
  });

  test('should successfully sign out', async ({ page }) => {
    // Find and click logout button
    const logoutButton = page.locator(
      '[data-testid="logout-button"], button:has-text("Logout"), button:has-text("Sign out"), [aria-label*="logout"], [aria-label*="sign out"]',
    );

    // If logout is in a dropdown, open it first
    const userMenu = page.locator(
      '[data-testid="user-menu"], [data-testid="profile-button"], button[aria-haspopup="menu"]',
    );

    if (await userMenu.isVisible()) {
      await userMenu.click();
      await page.waitForTimeout(500);
    }

    await logoutButton.click();

    // Should redirect to home or login
    await expect(page).toHaveURL(/\/$|login/, { timeout: 10000 });
  });

  test('should clear session after logout', async ({ page }) => {
    // Logout
    const userMenu = page.locator('[data-testid="user-menu"]');
    if (await userMenu.isVisible()) {
      await userMenu.click();
    }

    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out")');
    await logoutButton.click();

    // Wait for redirect
    await expect(page).toHaveURL(/\/$|login/, { timeout: 10000 });

    // Try accessing protected route
    await page.goto('/dashboard');

    // Should be redirected to login
    await expect(page).toHaveURL(/login/, { timeout: 10000 });
  });
});

// =============================================================================
// PROTECTED ROUTE TESTS
// =============================================================================

test.describe('Protected Routes', () => {
  test('should redirect unauthenticated user from dashboard', async ({ page }) => {
    // Clear unknown existing session
    await page.context().clearCookies();

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/, { timeout: 10000 });
  });

  test('should redirect unauthenticated user from admin routes', async ({ page }) => {
    await page.context().clearCookies();

    await page.goto('/admin/command-center');
    await expect(page).toHaveURL(/login|403/, { timeout: 10000 });
  });

  test('should redirect unauthenticated user from inspire studio', async ({ page }) => {
    await page.context().clearCookies();

    await page.goto('/inspire-studio');
    await expect(page).toHaveURL(/login/, { timeout: 10000 });
  });
});

// =============================================================================
// ROLE-BASED ACCESS TESTS
// =============================================================================

test.describe('Role-Based Access', () => {
  // Note: These tests require different role users to be set up
  // In a real scenario, you'd have separate test accounts for each role

  test('should show 403 for learner accessing admin route', async ({ page }) => {
    // Login as learner
    await page.goto('/auth/login');
    await fillLoginForm(page, TEST_USER.email, TEST_USER.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });

    // Try to access admin route
    await page.goto('/admin/command-center');

    // Should show 403 or redirect
    const is403 = page.url().includes('403');
    const isRedirected = page.url().includes('dashboard') || page.url().includes('login');

    expect(is403 || isRedirected).toBe(true);
  });

  test('should allow access to appropriate role routes', async ({ page }) => {
    // Login
    await page.goto('/auth/login');
    await fillLoginForm(page, TEST_USER.email, TEST_USER.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });

    // Check that user can access learner routes
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/dashboard/);

    // Should see dashboard content
    await expect(page.locator('main, [role="main"]')).toBeVisible();
  });
});

// =============================================================================
// SESSION PERSISTENCE TESTS
// =============================================================================

test.describe('Session Persistence', () => {
  test('should persist session across page reloads', async ({ page }) => {
    // Login
    await page.goto('/auth/login');
    await fillLoginForm(page, TEST_USER.email, TEST_USER.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });

    // Reload page
    await page.reload();

    // Should still be on dashboard
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should persist session across different routes', async ({ page }) => {
    // Login
    await page.goto('/auth/login');
    await fillLoginForm(page, TEST_USER.email, TEST_USER.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });

    // Navigate to different protected routes
    await page.goto('/dashboard/profile');
    await expect(page).not.toHaveURL(/login/);

    await page.goto('/dashboard/courses');
    await expect(page).not.toHaveURL(/login/);
  });
});
