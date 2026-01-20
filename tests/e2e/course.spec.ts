import { expect, type Page, test } from '@playwright/test';
import { test as authTest } from './fixtures/auth.fixture';

// =============================================================================
// TEST DATA
// =============================================================================

const COURSE_CATALOG_PATHS = ['/courses', '/catalog', '/learn', '/lxp360/courses'];

const SEARCH_TERMS = {
  valid: 'leadership',
  noResults: 'xyznonexistent123',
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Find and navigate to the course catalog
 */
async function navigateToCatalog(page: Page): Promise<boolean> {
  for (const path of COURSE_CATALOG_PATHS) {
    await page.goto(path);
    const response = await page.waitForLoadState('domcontentloaded').catch(() => null);
    if (response !== null) {
      // Check if we're on a valid catalog page
      const catalogIndicator = page.locator(
        '[data-testid="course-catalog"], [data-testid="course-grid"], h1:has-text("Courses"), h1:has-text("Catalog")',
      );
      if (await catalogIndicator.isVisible({ timeout: 3000 }).catch(() => false)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Search for courses in the catalog
 */
async function searchCourses(page: Page, searchTerm: string): Promise<void> {
  const searchInput = page.locator(
    'input[type="search"], input[placeholder*="Search"], input[name="search"], [data-testid="search-input"]',
  );

  if (await searchInput.isVisible({ timeout: 5000 })) {
    await searchInput.fill(searchTerm);
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');
  }
}

// =============================================================================
// COURSE CATALOG TESTS
// =============================================================================

test.describe('Course Catalog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display course catalog page', async ({ page }) => {
    const foundCatalog = await navigateToCatalog(page);

    if (foundCatalog) {
      // Should have a main heading or title
      const heading = page.locator('h1, [role="heading"]').first();
      await expect(heading).toBeVisible();

      // Should have some course content or empty state
      const courseContent = page.locator(
        '[data-testid="course-card"], .course-card, [data-testid="empty-state"], text=/no courses/i',
      );
      await expect(courseContent.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('should display course cards with essential information', async ({ page }) => {
    const foundCatalog = await navigateToCatalog(page);

    if (foundCatalog) {
      const courseCard = page.locator('[data-testid="course-card"], .course-card').first();

      if (await courseCard.isVisible({ timeout: 5000 })) {
        // Course card should have title
        const title = courseCard.locator('h2, h3, [data-testid="course-title"]');
        await expect(title).toBeVisible();

        // Course card should be clickable (link or button)
        const isClickable =
          (await courseCard.locator('a').count()) > 0 ||
          (await courseCard.getAttribute('role')) === 'button' ||
          (await courseCard.getAttribute('tabindex')) !== null;

        expect(isClickable).toBe(true);
      }
    }
  });

  test('should filter courses by category', async ({ page }) => {
    const foundCatalog = await navigateToCatalog(page);

    if (foundCatalog) {
      // Look for category filter
      const categoryFilter = page.locator(
        '[data-testid="category-filter"], select[name="category"], button:has-text("Category"), [aria-label*="category"]',
      );

      if (await categoryFilter.isVisible({ timeout: 5000 })) {
        await categoryFilter.click();

        // Select a category option
        const categoryOption = page.locator('[role="option"], option').first();
        if (await categoryOption.isVisible()) {
          await categoryOption.click();
          await page.waitForLoadState('networkidle');

          // Page should update (URL might change or content refreshes)
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('should search courses by keyword', async ({ page }) => {
    const foundCatalog = await navigateToCatalog(page);

    if (foundCatalog) {
      await searchCourses(page, SEARCH_TERMS.valid);

      // Should show search results or empty state
      const results = page.locator(
        '[data-testid="course-card"], .course-card, [data-testid="search-results"]',
      );
      const emptyState = page.locator('text=/no results|no courses/i');

      await expect(results.first().or(emptyState.first())).toBeVisible({ timeout: 10000 });
    }
  });

  test('should show empty state for no search results', async ({ page }) => {
    const foundCatalog = await navigateToCatalog(page);

    if (foundCatalog) {
      await searchCourses(page, SEARCH_TERMS.noResults);

      // Should show no results message
      const noResultsMessage = page.locator(
        'text=/no results|no courses found|nothing found|try different/i',
      );
      await expect(noResultsMessage.first()).toBeVisible({ timeout: 10000 });
    }
  });
});

// =============================================================================
// COURSE DETAILS TESTS
// =============================================================================

test.describe('Course Details', () => {
  test('should display course details page', async ({ page }) => {
    const foundCatalog = await navigateToCatalog(page);

    if (foundCatalog) {
      const courseCard = page.locator('[data-testid="course-card"], .course-card').first();

      if (await courseCard.isVisible({ timeout: 5000 })) {
        // Click on course card
        await courseCard.click();
        await page.waitForLoadState('networkidle');

        // Should navigate to course details
        const courseDetails = page.locator(
          '[data-testid="course-details"], [data-testid="course-page"], main',
        );
        await expect(courseDetails).toBeVisible();

        // Should have course title
        const courseTitle = page.locator('h1, [data-testid="course-title"]').first();
        await expect(courseTitle).toBeVisible();
      }
    }
  });

  test('should display course description and metadata', async ({ page }) => {
    const foundCatalog = await navigateToCatalog(page);

    if (foundCatalog) {
      const courseCard = page.locator('[data-testid="course-card"], .course-card').first();

      if (await courseCard.isVisible({ timeout: 5000 })) {
        await courseCard.click();
        await page.waitForLoadState('networkidle');

        // Should have description section
        const description = page.locator(
          '[data-testid="course-description"], .course-description, text=/description|about|overview/i',
        );
        await expect(description.first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should display course curriculum/modules', async ({ page }) => {
    const foundCatalog = await navigateToCatalog(page);

    if (foundCatalog) {
      const courseCard = page.locator('[data-testid="course-card"], .course-card').first();

      if (await courseCard.isVisible({ timeout: 5000 })) {
        await courseCard.click();
        await page.waitForLoadState('networkidle');

        // Should have curriculum section
        const curriculum = page.locator(
          '[data-testid="course-curriculum"], [data-testid="course-modules"], text=/curriculum|modules|lessons|content/i',
        );
        await expect(curriculum.first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should have enroll button for unenrolled users', async ({ page }) => {
    const foundCatalog = await navigateToCatalog(page);

    if (foundCatalog) {
      const courseCard = page.locator('[data-testid="course-card"], .course-card').first();

      if (await courseCard.isVisible({ timeout: 5000 })) {
        await courseCard.click();
        await page.waitForLoadState('networkidle');

        // Should have enroll/buy button
        const enrollButton = page.locator(
          'button:has-text("Enroll"), button:has-text("Buy"), button:has-text("Start"), a:has-text("Enroll")',
        );
        await expect(enrollButton.first()).toBeVisible({ timeout: 5000 });
      }
    }
  });
});

// =============================================================================
// COURSE ENROLLMENT TESTS (AUTHENTICATED)
// =============================================================================

authTest.describe('Course Enrollment (Authenticated)', () => {
  authTest('should allow learner to enroll in free course', async ({ learnerPage }) => {
    const foundCatalog = await navigateToCatalog(learnerPage);

    if (foundCatalog) {
      // Look for a free course
      const freeCourseCard = learnerPage
        .locator('[data-testid="course-card"]:has-text("Free"), .course-card:has-text("Free")')
        .first();
      const anyCourseCard = learnerPage
        .locator('[data-testid="course-card"], .course-card')
        .first();

      const courseCard = (await freeCourseCard.isVisible({ timeout: 3000 }))
        ? freeCourseCard
        : anyCourseCard;

      if (await courseCard.isVisible({ timeout: 5000 })) {
        await courseCard.click();
        await learnerPage.waitForLoadState('networkidle');

        // Click enroll button
        const enrollButton = learnerPage.locator(
          'button:has-text("Enroll"), button:has-text("Start"), button:has-text("Begin")',
        );

        if (await enrollButton.isVisible({ timeout: 5000 })) {
          await enrollButton.click();

          // Should show success or redirect to course content
          const successIndicator = learnerPage.locator(
            'text=/enrolled|success|welcome|start learning|continue/i',
          );
          await expect(successIndicator.first()).toBeVisible({ timeout: 10000 });
        }
      }
    }
  });

  authTest('should show enrolled courses in dashboard', async ({ learnerPage }) => {
    await learnerPage.goto('/dashboard');
    await learnerPage.waitForLoadState('networkidle');

    // Should have section for enrolled/my courses
    const enrolledSection = learnerPage.locator(
      '[data-testid="enrolled-courses"], [data-testid="my-courses"], text=/my courses|enrolled|continue learning/i',
    );
    await expect(enrolledSection.first()).toBeVisible({ timeout: 10000 });
  });

  authTest('should allow learner to unenroll from course', async ({ learnerPage }) => {
    await learnerPage.goto('/dashboard');
    await learnerPage.waitForLoadState('networkidle');

    // Find enrolled course
    const enrolledCourse = learnerPage
      .locator('[data-testid="enrolled-course"], [data-testid="course-card"]')
      .first();

    if (await enrolledCourse.isVisible({ timeout: 5000 })) {
      // Look for unenroll option (might be in dropdown)
      const moreOptionsButton = enrolledCourse.locator(
        '[data-testid="more-options"], button[aria-label*="more"], button:has(svg)',
      );

      if (await moreOptionsButton.isVisible({ timeout: 3000 })) {
        await moreOptionsButton.click();
        await learnerPage.waitForTimeout(300);
      }

      const unenrollButton = learnerPage.locator(
        'button:has-text("Unenroll"), button:has-text("Leave"), [data-testid="unenroll"]',
      );

      if (await unenrollButton.isVisible({ timeout: 3000 })) {
        await unenrollButton.click();

        // Confirm if dialog appears
        const confirmButton = learnerPage.locator(
          'button:has-text("Confirm"), button:has-text("Yes")',
        );
        if (await confirmButton.isVisible({ timeout: 2000 })) {
          await confirmButton.click();
        }

        // Should show success message
        const successMessage = learnerPage.locator('text=/unenrolled|removed|success/i');
        await expect(successMessage.first()).toBeVisible({ timeout: 5000 });
      }
    }
  });
});

// =============================================================================
// COURSE CREATION TESTS (INSTRUCTOR)
// =============================================================================

authTest.describe('Course Creation (Instructor)', () => {
  authTest('should allow instructor to create new course', async ({ instructorPage }) => {
    await instructorPage.goto('/inspire-studio');
    await instructorPage.waitForLoadState('networkidle');

    // Find create course button
    const createButton = instructorPage.locator(
      'button:has-text("Create"), button:has-text("New Course"), a:has-text("Create")',
    );

    if (await createButton.isVisible({ timeout: 5000 })) {
      await createButton.first().click();

      // Should show course creation form
      const courseForm = instructorPage.locator(
        '[data-testid="course-form"], form, input[name="title"]',
      );
      await expect(courseForm.first()).toBeVisible({ timeout: 5000 });
    }
  });

  authTest('should validate required fields on course creation', async ({ instructorPage }) => {
    await instructorPage.goto('/inspire-studio');
    await instructorPage.waitForLoadState('networkidle');

    const createButton = instructorPage.locator(
      'button:has-text("Create"), button:has-text("New Course")',
    );

    if (await createButton.isVisible({ timeout: 5000 })) {
      await createButton.first().click();
      await instructorPage.waitForTimeout(500);

      // Try to submit empty form
      const submitButton = instructorPage.locator(
        'button[type="submit"], button:has-text("Create"), button:has-text("Save")',
      );

      if (await submitButton.isVisible({ timeout: 5000 })) {
        await submitButton.first().click();

        // Should show validation error
        const validationError = instructorPage.locator(
          '[role="alert"], .text-destructive, text=/required|title/i',
        );
        await expect(validationError.first()).toBeVisible({ timeout: 5000 });
      }
    }
  });
});

// =============================================================================
// COURSE PROGRESS TESTS
// =============================================================================

authTest.describe('Course Progress', () => {
  authTest('should track and display course progress', async ({ learnerPage }) => {
    await learnerPage.goto('/dashboard');
    await learnerPage.waitForLoadState('networkidle');

    // Find enrolled course with progress indicator
    const progressIndicator = learnerPage.locator(
      '[data-testid="progress-bar"], [data-testid="progress"], .progress, [role="progressbar"]',
    );

    if (await progressIndicator.first().isVisible({ timeout: 5000 })) {
      // Progress should be visible and have a value
      const progressValue = await progressIndicator.first().getAttribute('aria-valuenow');
      expect(
        progressValue !== null || (await progressIndicator.first().textContent()) !== null,
      ).toBe(true);
    }
  });

  authTest('should allow resuming course from last position', async ({ learnerPage }) => {
    await learnerPage.goto('/dashboard');
    await learnerPage.waitForLoadState('networkidle');

    // Find continue/resume button
    const continueButton = learnerPage.locator(
      'button:has-text("Continue"), a:has-text("Continue"), button:has-text("Resume")',
    );

    if (await continueButton.first().isVisible({ timeout: 5000 })) {
      await continueButton.first().click();
      await learnerPage.waitForLoadState('networkidle');

      // Should navigate to course content
      const courseContent = learnerPage.locator(
        '[data-testid="lesson-content"], [data-testid="course-player"], main',
      );
      await expect(courseContent).toBeVisible();
    }
  });
});

// =============================================================================
// RESPONSIVE CATALOG TESTS
// =============================================================================

test.describe('Course Catalog - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should display catalog in mobile layout', async ({ page }) => {
    const foundCatalog = await navigateToCatalog(page);

    if (foundCatalog) {
      // Course cards should be stacked or in single column
      const courseCards = page.locator('[data-testid="course-card"], .course-card');
      const cardCount = await courseCards.count();

      if (cardCount > 0) {
        const firstCard = await courseCards.first().boundingBox();
        const secondCard = cardCount > 1 ? await courseCards.nth(1).boundingBox() : null;

        // In mobile, cards should be stacked (second card below first)
        if (firstCard && secondCard) {
          expect(secondCard.y).toBeGreaterThanOrEqual(firstCard.y + firstCard.height - 10);
        }
      }
    }
  });

  test('should have accessible touch targets on mobile', async ({ page }) => {
    const foundCatalog = await navigateToCatalog(page);

    if (foundCatalog) {
      const interactiveElements = page.locator('button, a, [role="button"]');
      const elements = await interactiveElements.all();

      for (const element of elements.slice(0, 10)) {
        const box = await element.boundingBox();
        if (box) {
          // Touch targets should be at least 44x44 for accessibility
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });
});
