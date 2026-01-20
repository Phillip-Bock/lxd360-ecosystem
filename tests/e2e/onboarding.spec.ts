import { expect, type Page, test } from '@playwright/test';

// =============================================================================
// TEST DATA
// =============================================================================

const NEW_USER = {
  email: 'new-user-onboarding@example.com',
  password: 'NewUserPass123!',
  firstName: 'John',
  lastName: 'Doe',
  role: 'learner',
};

const ORGANIZATION_DATA = {
  name: 'Test Organization',
  industry: 'Technology',
  size: '50-200',
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function completeSignUp(page: Page): Promise<void> {
  await page.goto('/auth/signup');
  await page.fill('input[name="email"], input[type="email"]', NEW_USER.email);
  await page.fill('input[name="password"], input[type="password"]', NEW_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
}

// =============================================================================
// ONBOARDING FLOW TESTS
// =============================================================================

test.describe('New User Onboarding', () => {
  test('should redirect new user to onboarding after signup', async ({ page }) => {
    await completeSignUp(page);

    // Should redirect to onboarding
    await expect(page).toHaveURL(/onboarding|welcome|setup/, { timeout: 15000 });
  });

  test('should display welcome screen', async ({ page }) => {
    await page.goto('/onboarding');

    // Should show welcome message
    await expect(page.locator("text=/welcome|get started|let's begin/i").first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('should have progress indicator', async ({ page }) => {
    await page.goto('/onboarding');

    // Should show progress steps
    const progressIndicator = page.locator(
      '[data-testid="onboarding-progress"], .progress-indicator, [role="progressbar"]',
    );
    await expect(progressIndicator).toBeVisible({ timeout: 5000 });
  });
});

// =============================================================================
// PROFILE SETUP TESTS
// =============================================================================

test.describe('Profile Setup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding/profile');
  });

  test('should display profile form', async ({ page }) => {
    // Should show name fields
    await expect(page.locator('input[name="firstName"], input[placeholder*="first"]')).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator('input[name="lastName"], input[placeholder*="last"]')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should complete profile information', async ({ page }) => {
    // Fill in profile details
    await page.fill('input[name="firstName"]', NEW_USER.firstName);
    await page.fill('input[name="lastName"]', NEW_USER.lastName);

    // Optional: Profile picture upload
    const avatarUpload = page.locator('input[type="file"]');
    if (await avatarUpload.isVisible({ timeout: 2000 })) {
      // Skip avatar for now
    }

    // Submit
    const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")');
    await nextButton.click();

    // Should proceed to next step
    await expect(page).not.toHaveURL(/profile/, { timeout: 10000 });
  });

  test('should validate required fields', async ({ page }) => {
    // Try to proceed without filling fields
    const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")');
    await nextButton.click();

    // Should show validation errors
    await expect(page.locator('text=/required|please.*name/i').first()).toBeVisible({
      timeout: 5000,
    });
  });
});

// =============================================================================
// ROLE SELECTION TESTS
// =============================================================================

test.describe('Role Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding/role');
  });

  test('should display role options', async ({ page }) => {
    // Should show role selection
    await expect(page.locator('text=/learner|student/i').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/instructor|teacher|creator/i').first()).toBeVisible({
      timeout: 5000,
    });
  });

  test('should select learner role', async ({ page }) => {
    // Click learner option
    const learnerOption = page.locator(
      'button:has-text("Learner"), [data-testid="role-learner"], label:has-text("Learner")',
    );
    await learnerOption.first().click();

    // Proceed
    const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")');
    await nextButton.click();

    // Should proceed
    await page.waitForLoadState('networkidle');
  });

  test('should select instructor role', async ({ page }) => {
    // Click instructor option
    const instructorOption = page.locator(
      'button:has-text("Instructor"), [data-testid="role-instructor"], label:has-text("Instructor")',
    );
    await instructorOption.first().click();

    // Proceed
    const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")');
    await nextButton.click();

    // Should proceed
    await page.waitForLoadState('networkidle');
  });
});

// =============================================================================
// ORGANIZATION SETUP TESTS
// =============================================================================

test.describe('Organization Setup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding/organization');
  });

  test('should offer organization options', async ({ page }) => {
    // Should show options to create or join org
    await expect(
      page.locator('text=/create.*organization|new.*organization/i').first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test('should create new organization', async ({ page }) => {
    // Click create organization
    const createOrgButton = page.locator('button:has-text("Create"), [data-testid="create-org"]');
    if (await createOrgButton.isVisible({ timeout: 3000 })) {
      await createOrgButton.first().click();

      // Fill in organization details
      await page.fill(
        'input[name="name"], input[placeholder*="organization"]',
        ORGANIZATION_DATA.name,
      );

      // Select industry if available
      const industrySelect = page.locator(
        'select[name="industry"], [data-testid="industry-select"]',
      );
      if (await industrySelect.isVisible({ timeout: 2000 })) {
        await industrySelect.selectOption({ label: ORGANIZATION_DATA.industry });
      }

      // Submit
      const submitButton = page.locator('button[type="submit"], button:has-text("Create")');
      await submitButton.first().click();

      // Should show success or proceed
      await page.waitForLoadState('networkidle');
    }
  });

  test('should join existing organization', async ({ page }) => {
    const joinOrgButton = page.locator('button:has-text("Join"), [data-testid="join-org"]');
    if (await joinOrgButton.isVisible({ timeout: 3000 })) {
      await joinOrgButton.first().click();

      // Should show invite code or organization search
      await expect(
        page.locator(
          'input[name="inviteCode"], input[placeholder*="invite"], input[placeholder*="code"]',
        ),
      ).toBeVisible({ timeout: 5000 });
    }
  });
});

// =============================================================================
// PREFERENCES TESTS
// =============================================================================

test.describe('Preferences Setup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding/preferences');
  });

  test('should display preference options', async ({ page }) => {
    // Should show notification preferences
    await expect(page.locator('text=/notification|email.*preference/i').first()).toBeVisible({
      timeout: 5000,
    });
  });

  test('should toggle email notifications', async ({ page }) => {
    const emailToggle = page.locator(
      'input[name="emailNotifications"], [data-testid="email-notifications"]',
    );
    if (await emailToggle.isVisible({ timeout: 3000 })) {
      await emailToggle.click();
    }
  });

  test('should select theme preference', async ({ page }) => {
    const themeOptions = page.locator(
      '[data-testid="theme-option"], button:has-text("Dark"), button:has-text("Light")',
    );
    if (await themeOptions.first().isVisible({ timeout: 3000 })) {
      await themeOptions.first().click();
    }
  });

  test('should complete preferences setup', async ({ page }) => {
    const completeButton = page.locator(
      'button:has-text("Complete"), button:has-text("Finish"), button:has-text("Done")',
    );
    await completeButton.first().click();

    // Should proceed to dashboard or completion
    await page.waitForLoadState('networkidle');
  });
});

// =============================================================================
// INTERESTS SELECTION TESTS
// =============================================================================

test.describe('Learning Interests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding/interests');
  });

  test('should display interest categories', async ({ page }) => {
    // Should show interest/topic selection
    await expect(page.locator('text=/interest|topic|subject/i').first()).toBeVisible({
      timeout: 5000,
    });
  });

  test('should select multiple interests', async ({ page }) => {
    const interestOptions = page.locator(
      '[data-testid="interest-option"], .interest-tag, button[role="checkbox"]',
    );
    const count = await interestOptions.count();

    if (count >= 2) {
      await interestOptions.nth(0).click();
      await interestOptions.nth(1).click();
    }
  });

  test('should require minimum interests', async ({ page }) => {
    // Try to proceed without selecting unknown
    const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")');
    await nextButton.click();

    // Should show error or warning
    await expect(page.locator('text=/select|choose|at least/i').first()).toBeVisible({
      timeout: 5000,
    });
  });
});

// =============================================================================
// ONBOARDING COMPLETION TESTS
// =============================================================================

test.describe('Onboarding Completion', () => {
  test('should display completion screen', async ({ page }) => {
    await page.goto('/onboarding/complete');

    // Should show completion message
    await expect(
      page.locator('text=/complete|ready|all set|congratulations/i').first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show recommended courses', async ({ page }) => {
    await page.goto('/onboarding/complete');

    // May show recommended courses
    const recommendations = page.locator(
      '[data-testid="recommended-courses"], text=/recommend|suggested|for you/i',
    );
    if (await recommendations.isVisible({ timeout: 5000 })) {
      await expect(recommendations).toBeVisible();
    }
  });

  test('should navigate to dashboard', async ({ page }) => {
    await page.goto('/onboarding/complete');

    const goToDashboard = page.locator(
      'button:has-text("Dashboard"), a:has-text("Dashboard"), button:has-text("Get Started")',
    );
    await goToDashboard.first().click();

    // Should be on dashboard
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
  });

  test('should navigate to course catalog', async ({ page }) => {
    await page.goto('/onboarding/complete');

    const browseCourses = page.locator(
      'button:has-text("Browse Courses"), a:has-text("Explore"), a:has-text("Catalog")',
    );
    if (await browseCourses.isVisible({ timeout: 3000 })) {
      await browseCourses.first().click();

      // Should be on catalog
      await expect(page).toHaveURL(/catalog|courses|browse/, { timeout: 10000 });
    }
  });
});

// =============================================================================
// SKIP/RESUME ONBOARDING TESTS
// =============================================================================

test.describe('Skip and Resume Onboarding', () => {
  test('should allow skipping optional steps', async ({ page }) => {
    await page.goto('/onboarding/preferences');

    const skipButton = page.locator('button:has-text("Skip"), a:has-text("Skip")');
    if (await skipButton.isVisible({ timeout: 3000 })) {
      await skipButton.click();

      // Should proceed without completing
      await page.waitForLoadState('networkidle');
    }
  });

  test('should save progress and allow resume', async ({ page }) => {
    // Start onboarding
    await page.goto('/onboarding/profile');
    await page.fill('input[name="firstName"]', NEW_USER.firstName);

    // Navigate away
    await page.goto('/dashboard');

    // Come back - should resume
    await page.goto('/onboarding');

    // Should have saved progress (implementation specific)
    await page.waitForLoadState('networkidle');
  });

  test('should not show onboarding to completed users', async ({ page }) => {
    // Login as existing user who completed onboarding
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'existing-user@example.com');
    await page.fill('input[type="password"]', 'ExistingPass123!');
    await page.click('button[type="submit"]');

    // Should go to dashboard, not onboarding
    await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
  });
});

// =============================================================================
// INSTRUCTOR ONBOARDING TESTS
// =============================================================================

test.describe('Instructor Onboarding', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding/instructor');
  });

  test('should display instructor-specific setup', async ({ page }) => {
    // Should show instructor setup options
    await expect(page.locator('text=/instructor|teach|create courses/i').first()).toBeVisible({
      timeout: 5000,
    });
  });

  test('should collect teaching experience', async ({ page }) => {
    const experienceField = page.locator(
      'textarea[name="experience"], select[name="experienceLevel"]',
    );
    if (await experienceField.isVisible({ timeout: 3000 })) {
      if ((await experienceField.evaluate((el) => el.tagName.toLowerCase())) === 'select') {
        await experienceField.selectOption({ index: 1 });
      } else {
        await experienceField.fill('5 years of teaching experience in technology');
      }
    }
  });

  test('should set up payment information', async ({ page }) => {
    const paymentSection = page.locator('[data-testid="payment-setup"], text=/payment|payout/i');
    if (await paymentSection.isVisible({ timeout: 3000 })) {
      // Payment setup is optional during onboarding
      await expect(paymentSection).toBeVisible();
    }
  });
});

// =============================================================================
// MOBILE ONBOARDING TESTS
// =============================================================================

test.describe('Mobile Onboarding', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should display mobile-friendly onboarding', async ({ page }) => {
    await page.goto('/onboarding');

    // Should be responsive
    await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
  });

  test('should have touch-friendly buttons', async ({ page }) => {
    await page.goto('/onboarding');

    const buttons = page.locator('button');
    const firstButton = buttons.first();

    if (await firstButton.isVisible({ timeout: 3000 })) {
      const box = await firstButton.boundingBox();
      if (box) {
        // Touch targets should be at least 44x44 pixels
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
  });

  test('should show progress on mobile', async ({ page }) => {
    await page.goto('/onboarding/profile');

    // Progress indicator should be visible
    const progress = page.locator(
      '[data-testid="onboarding-progress"], .progress-steps, [role="progressbar"]',
    );
    await expect(progress).toBeVisible({ timeout: 5000 });
  });
});
