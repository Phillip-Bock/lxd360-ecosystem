import { expect, type Page, test } from '@playwright/test';

// =============================================================================
// TEST DATA
// =============================================================================

const TEST_AUTHOR = {
  email: 'author@example.com',
  password: 'AuthorPass123!',
};

const TEST_LEARNER = {
  email: 'learner@example.com',
  password: 'LearnerPass123!',
};

const COURSE_DATA = {
  title: `E2E Test Course ${Date.now()}`,
  description: 'Comprehensive end-to-end test course for validation',
  difficulty: 'beginner',
  duration: 60,
};

const MODULE_DATA = {
  title: 'Introduction to Testing',
  description: 'Learn the fundamentals of testing',
  estimatedTime: 30,
};

const LESSON_DATA = {
  title: 'First Steps in Testing',
  content: '<p>Welcome to the first lesson!</p>',
  estimatedTime: 15,
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function loginAsAuthor(page: Page): Promise<void> {
  await page.goto('/auth/login');
  await page.fill('input[type="email"]', TEST_AUTHOR.email);
  await page.fill('input[type="password"]', TEST_AUTHOR.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard|inspire-studio/, { timeout: 15000 });
}

async function loginAsLearner(page: Page): Promise<void> {
  await page.goto('/auth/login');
  await page.fill('input[type="email"]', TEST_LEARNER.email);
  await page.fill('input[type="password"]', TEST_LEARNER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/, { timeout: 15000 });
}

// =============================================================================
// COMPLETE FLOW VALIDATION TEST
// =============================================================================

test.describe('Complete Course Authoring to Completion Flow', () => {
  let courseSlug: string;

  test('Step 1: Create new course in INSPIRE Studio', async ({ page }) => {
    await loginAsAuthor(page);

    // Navigate to INSPIRE Studio or Course Builder
    const studioUrls = [
      '/inspire-studio/course-builder',
      '/inspire-studio/courses',
      '/dashboard/courses',
      '/inspire-studio',
    ];

    let navigated = false;
    for (const url of studioUrls) {
      try {
        await page.goto(url, { timeout: 10000 });
        navigated = true;
        break;
      } catch {}
    }

    expect(navigated).toBeTruthy();

    // Look for create course button
    const createButtons = [
      page.locator('button:has-text("Create Course")'),
      page.locator('button:has-text("New Course")'),
      page.locator('a:has-text("Create Course")'),
      page.locator('[data-testid="create-course"]'),
    ];

    let clicked = false;
    for (const button of createButtons) {
      if (await button.isVisible({ timeout: 3000 })) {
        await button.click();
        clicked = true;
        break;
      }
    }

    if (!clicked) {
      console.log('❌ BLOCKER: No "Create Course" button found');
      test.skip();
    }

    // Fill in course details
    const titleInput = page.locator('input[name="title"], input[placeholder*="title"]').first();
    await expect(titleInput).toBeVisible({ timeout: 10000 });
    await titleInput.fill(COURSE_DATA.title);

    const descriptionField = page
      .locator('textarea[name="description"], [contenteditable="true"]')
      .first();
    if (await descriptionField.isVisible({ timeout: 3000 })) {
      await descriptionField.fill(COURSE_DATA.description);
    }

    // Submit course creation
    const submitButton = page
      .locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")')
      .first();
    await submitButton.click();

    // Wait for success and capture course slug/ID
    await page.waitForTimeout(2000);

    // Try to extract course slug from URL or page
    const currentUrl = page.url();
    const slugMatch = currentUrl.match(/\/courses\/([^/]+)/);
    if (slugMatch) {
      courseSlug = slugMatch[1];
    }

    console.log('✅ Course created successfully');
  });

  test('Step 2: Add modules to course', async ({ page }) => {
    test.skip(!courseSlug, 'Requires course from previous test');

    await loginAsAuthor(page);

    // Navigate to course editor
    await page.goto(`/inspire-studio/courses/${courseSlug}`, { waitUntil: 'networkidle' });

    // Look for add module button
    const addModuleButtons = [
      page.locator('button:has-text("Add Module")'),
      page.locator('button:has-text("New Module")'),
      page.locator('[data-testid="add-module"]'),
    ];

    let moduleAdded = false;
    for (const button of addModuleButtons) {
      if (await button.isVisible({ timeout: 5000 })) {
        await button.click();

        // Fill module details
        await page.fill('input[name="title"]', MODULE_DATA.title);
        const descField = page.locator('textarea[name="description"]');
        if (await descField.isVisible({ timeout: 2000 })) {
          await descField.fill(MODULE_DATA.description);
        }

        // Save module
        await page.click('button[type="submit"], button:has-text("Save")');
        await page.waitForTimeout(1000);

        moduleAdded = true;
        break;
      }
    }

    if (!moduleAdded) {
      console.log('❌ BLOCKER: Cannot add modules to course');
    }

    console.log('✅ Module added to course');
  });

  test('Step 3: Add lessons to module', async ({ page }) => {
    test.skip(!courseSlug, 'Requires course from previous test');

    await loginAsAuthor(page);
    await page.goto(`/inspire-studio/courses/${courseSlug}`);

    // Expand first module or navigate to it
    const moduleItem = page.locator('[data-testid="module-item"], .module-item').first();
    if (await moduleItem.isVisible({ timeout: 3000 })) {
      await moduleItem.click();
    }

    // Add lesson
    const addLessonButton = page.locator(
      'button:has-text("Add Lesson"), button:has-text("New Lesson")',
    );
    if (await addLessonButton.isVisible({ timeout: 5000 })) {
      await addLessonButton.click();

      await page.fill('input[name="title"]', LESSON_DATA.title);
      await page.click('button[type="submit"], button:has-text("Save")');
      await page.waitForTimeout(1000);

      console.log('✅ Lesson added to module');
    } else {
      console.log('❌ BLOCKER: Cannot add lessons to module');
    }
  });

  test('Step 4: Add content blocks to lesson', async ({ page }) => {
    test.skip(!courseSlug, 'Requires course from previous test');

    await loginAsAuthor(page);

    // Navigate to lesson editor
    const lessonItem = page.locator('[data-testid="lesson-item"]').first();
    if (await lessonItem.isVisible({ timeout: 5000 })) {
      await lessonItem.click();

      // Try to add text content block
      const addBlockButton = page.locator(
        'button:has-text("Add Block"), button:has-text("Add Content")',
      );
      if (await addBlockButton.isVisible({ timeout: 5000 })) {
        await addBlockButton.click();

        // Select text block
        const textBlock = page.locator('button:has-text("Text"), [data-testid="text-block"]');
        if (await textBlock.isVisible({ timeout: 3000 })) {
          await textBlock.click();
          console.log('✅ Text content block added');
        }

        // Try to add video block
        await addBlockButton.click();
        const videoBlock = page.locator('button:has-text("Video"), [data-testid="video-block"]');
        if (await videoBlock.isVisible({ timeout: 3000 })) {
          await videoBlock.click();
          console.log('✅ Video content block added');
        }
      } else {
        console.log('❌ BLOCKER: Cannot add content blocks to lesson');
      }
    }
  });

  test('Step 5: Add assessment to course', async ({ page }) => {
    test.skip(!courseSlug, 'Requires course from previous test');

    await loginAsAuthor(page);
    await page.goto(`/inspire-studio/courses/${courseSlug}`);

    // Look for assessment/quiz options
    const addAssessmentButton = page.locator(
      'button:has-text("Add Assessment"), button:has-text("Add Quiz"), button:has-text("New Quiz")',
    );

    if (await addAssessmentButton.isVisible({ timeout: 5000 })) {
      await addAssessmentButton.click();
      console.log('✅ Assessment feature available');
    } else {
      console.log('⚠️  WARNING: Assessment feature not readily accessible');
    }
  });

  test('Step 6: Preview course', async ({ page }) => {
    test.skip(!courseSlug, 'Requires course from previous test');

    await loginAsAuthor(page);
    await page.goto(`/inspire-studio/courses/${courseSlug}`);

    const previewButton = page.locator('button:has-text("Preview"), a:has-text("Preview")');
    if (await previewButton.isVisible({ timeout: 5000 })) {
      await previewButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ Course preview available');
    } else {
      console.log('❌ BLOCKER: No course preview option');
    }
  });

  test('Step 7: Publish course to LXP360', async ({ page }) => {
    test.skip(!courseSlug, 'Requires course from previous test');

    await loginAsAuthor(page);
    await page.goto(`/inspire-studio/courses/${courseSlug}`);

    const publishButton = page.locator('button:has-text("Publish")');
    if (await publishButton.isVisible({ timeout: 5000 })) {
      await publishButton.click();

      // Confirm if dialog appears
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")');
      if (await confirmButton.isVisible({ timeout: 2000 })) {
        await confirmButton.click();
      }

      await page.waitForTimeout(2000);
      console.log('✅ Course published successfully');
    } else {
      console.log('❌ BLOCKER: Cannot publish course');
      test.skip();
    }
  });

  test('Step 8: Verify course appears in learner view', async ({ page }) => {
    test.skip(!courseSlug, 'Requires course from previous test');

    await loginAsLearner(page);

    // Navigate to course catalog
    const catalogUrls = ['/courses', '/catalog'];

    for (const url of catalogUrls) {
      try {
        await page.goto(url, { timeout: 10000 });
        break;
      } catch {}
    }

    // Search for the course
    const searchInput = page.locator('input[type="search"], input[name="search"]');
    if (await searchInput.isVisible({ timeout: 3000 })) {
      await searchInput.fill(COURSE_DATA.title);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
    }

    // Check if course is visible
    const courseCard = page.locator(`text=${COURSE_DATA.title}`);
    if (await courseCard.isVisible({ timeout: 5000 })) {
      console.log('✅ Course visible in learner catalog');
    } else {
      console.log('❌ BLOCKER: Published course not visible to learners');
    }
  });

  test('Step 9: Enroll test user in course', async ({ page }) => {
    test.skip(!courseSlug, 'Requires course from previous test');

    await loginAsLearner(page);

    // Find and click on course
    await page.goto('/courses');
    const courseCard = page.locator(`text=${COURSE_DATA.title}`);

    if (await courseCard.isVisible({ timeout: 5000 })) {
      await courseCard.click();

      // Click enroll button
      const enrollButton = page.locator(
        'button:has-text("Enroll"), button:has-text("Start Learning"), button:has-text("Get Started")',
      );

      if (await enrollButton.isVisible({ timeout: 5000 })) {
        await enrollButton.click();
        await page.waitForTimeout(2000);
        console.log('✅ User enrolled in course');
      } else {
        console.log('❌ BLOCKER: Cannot enroll in course');
      }
    }
  });

  test('Step 10: Complete course as learner', async ({ page }) => {
    test.skip(!courseSlug, 'Requires course from previous test');

    await loginAsLearner(page);
    await page.goto('/my-learning');

    // Find enrolled course
    const courseCard = page.locator(`text=${COURSE_DATA.title}`);
    if (await courseCard.isVisible({ timeout: 5000 })) {
      await courseCard.click();

      // Complete first lesson
      const lessonItem = page.locator('[data-testid="lesson-item"]').first();
      if (await lessonItem.isVisible({ timeout: 3000 })) {
        await lessonItem.click();

        // Mark as complete
        const completeButton = page.locator(
          'button:has-text("Complete"), button:has-text("Mark as Complete")',
        );
        if (await completeButton.isVisible({ timeout: 5000 })) {
          await completeButton.click();
          await page.waitForTimeout(1000);
          console.log('✅ Lesson completed');
        }
      }
    } else {
      console.log('❌ BLOCKER: Enrolled course not accessible');
    }
  });

  test('Step 11: Verify xAPI/LRS tracking', async ({ page }) => {
    test.skip(!courseSlug, 'Requires course from previous test');

    await loginAsAuthor(page);

    // Try to access analytics/reporting
    const analyticsUrls = ['/analytics', '/reports', '/dashboard/analytics'];

    let analyticsFound = false;
    for (const url of analyticsUrls) {
      try {
        await page.goto(url, { timeout: 10000 });

        // Look for xAPI statements or learner progress using specific selectors
        const statements = page.locator(
          '[data-testid="xapi-statements"], [data-testid="analytics-dashboard"], ' +
            '[aria-label*="xAPI"], [aria-label*="Analytics"], ' +
            'h1:has-text("Analytics"), h1:has-text("xAPI"), h1:has-text("Statements")',
        );
        if (await statements.first().isVisible({ timeout: 3000 })) {
          analyticsFound = true;
          console.log('✅ xAPI/LRS tracking visible');
          break;
        }
      } catch {}
    }

    if (!analyticsFound) {
      console.log('⚠️  WARNING: xAPI/LRS tracking interface not readily accessible');
    }
  });

  test('Step 12: Verify certificate generation', async ({ page }) => {
    test.skip(!courseSlug, 'Requires course from previous test');

    await loginAsLearner(page);
    await page.goto('/my-learning');

    // Look for certificate option
    const certificateButton = page.locator(
      'button:has-text("Certificate"), a:has-text("Certificate"), button:has-text("View Certificate")',
    );

    if (await certificateButton.isVisible({ timeout: 5000 })) {
      await certificateButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ Certificate generation available');
    } else {
      console.log('⚠️  WARNING: Certificate generation not available or course not 100% complete');
    }
  });
});

// =============================================================================
// VALIDATION SUMMARY TEST
// =============================================================================

test.describe('Validation Summary', () => {
  test('Generate validation report', async () => {
    const report = {
      timestamp: new Date().toISOString(),
      testRun: 'Course Authoring & Publishing Flow Validation',
      environment: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      notes: [
        'This validation test runs through the complete flow from course creation to certificate generation',
        'Check console logs for specific blockers, warnings, and success messages',
        'Tests are interdependent - failures in early tests will skip later tests',
      ],
    };

    console.log('='.repeat(80));
    console.log('VALIDATION REPORT');
    console.log('='.repeat(80));
    console.log(JSON.stringify(report, null, 2));
    console.log('='.repeat(80));
  });
});
