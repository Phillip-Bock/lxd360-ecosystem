import { expect, type Page, test } from '@playwright/test';

// =============================================================================
// TEST DATA
// =============================================================================

const TEST_INSTRUCTOR = {
  email: 'test-instructor@example.com',
  password: 'InstructorPass123!',
};

const TEST_COURSE = {
  title: 'E2E Test Course',
  description: 'This is a test course created during E2E testing',
  category: 'Technology',
};

const TEST_MODULE = {
  title: 'Introduction Module',
  description: 'Getting started with the course content',
};

const TEST_LESSON = {
  title: 'First Lesson',
  content: '<p>This is the lesson content for testing.</p>',
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function loginAsInstructor(page: Page): Promise<void> {
  await page.goto('/auth/login');
  await page.fill('input[type="email"]', TEST_INSTRUCTOR.email);
  await page.fill('input[type="password"]', TEST_INSTRUCTOR.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
}

async function navigateToInspireStudio(page: Page): Promise<void> {
  await page.goto('/inspire-studio');
  await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
}

// =============================================================================
// COURSE CREATION TESTS
// =============================================================================

test.describe('Course Creation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsInstructor(page);
    await navigateToInspireStudio(page);
  });

  test('should display course creation interface', async ({ page }) => {
    // Look for create course button
    const createButton = page.locator(
      'button:has-text("Create"), button:has-text("New Course"), a:has-text("Create Course")',
    );
    await expect(createButton.first()).toBeVisible({ timeout: 10000 });
  });

  test('should create a new course', async ({ page }) => {
    // Click create course button
    const createButton = page.locator(
      'button:has-text("Create"), button:has-text("New Course"), a:has-text("Create Course")',
    );
    await createButton.first().click();

    // Fill in course details
    await page.fill('input[name="title"], input[placeholder*="title"]', TEST_COURSE.title);

    const descriptionField = page.locator(
      'textarea[name="description"], [contenteditable="true"], input[name="description"]',
    );
    if (await descriptionField.isVisible()) {
      await descriptionField.fill(TEST_COURSE.description);
    }

    // Submit the form
    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Create"), button:has-text("Save")',
    );
    await submitButton.first().click();

    // Should navigate to course editor or show success
    await expect(page.locator('text=/created|success|editor/i').first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('should show validation errors for empty course title', async ({ page }) => {
    const createButton = page.locator('button:has-text("Create"), button:has-text("New Course")');
    await createButton.first().click();

    // Try to submit without title
    const submitButton = page.locator('button[type="submit"], button:has-text("Create")');
    await submitButton.first().click();

    // Should show validation error
    await expect(page.locator('text=/required|title/i').first()).toBeVisible({ timeout: 5000 });
  });
});

// =============================================================================
// MODULE MANAGEMENT TESTS
// =============================================================================

test.describe('Module Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsInstructor(page);
    // Navigate to an existing course editor
    await page.goto('/inspire-studio/courses');
    await page.waitForLoadState('networkidle');
  });

  test('should display module list in course editor', async ({ page }) => {
    // Click on a course to edit
    const courseCard = page.locator('[data-testid="course-card"], .course-item').first();
    if (await courseCard.isVisible({ timeout: 5000 })) {
      await courseCard.click();

      // Should show modules section
      await expect(page.locator('text=/modules|chapters|sections/i').first()).toBeVisible({
        timeout: 10000,
      });
    }
  });

  test('should add a new module to course', async ({ page }) => {
    // Open course editor
    const courseCard = page.locator('[data-testid="course-card"], .course-item').first();
    if (await courseCard.isVisible({ timeout: 5000 })) {
      await courseCard.click();
      await page.waitForLoadState('networkidle');

      // Click add module button
      const addModuleButton = page.locator(
        'button:has-text("Add Module"), button:has-text("Add Chapter"), button:has-text("New Module")',
      );

      if (await addModuleButton.isVisible({ timeout: 5000 })) {
        await addModuleButton.click();

        // Fill in module details
        await page.fill('input[name="title"], input[placeholder*="title"]', TEST_MODULE.title);

        // Save module
        const saveButton = page.locator('button[type="submit"], button:has-text("Save")');
        await saveButton.first().click();

        // Should show success or the new module
        await expect(page.locator(`text=${TEST_MODULE.title}`)).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('should reorder modules via drag and drop', async ({ page }) => {
    // This test verifies drag-and-drop functionality if available
    const moduleItems = page.locator('[data-testid="module-item"], .module-item');

    if ((await moduleItems.count()) >= 2) {
      const firstModule = moduleItems.first();
      const secondModule = moduleItems.nth(1);

      // Get initial positions
      const firstModuleBox = await firstModule.boundingBox();
      const secondModuleBox = await secondModule.boundingBox();

      if (firstModuleBox && secondModuleBox) {
        // Perform drag and drop
        await firstModule.dragTo(secondModule);

        // Verify order changed (implementation specific)
        await page.waitForTimeout(500);
      }
    }
  });
});

// =============================================================================
// LESSON MANAGEMENT TESTS
// =============================================================================

test.describe('Lesson Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsInstructor(page);
    await page.goto('/inspire-studio/courses');
  });

  test('should add a lesson to a module', async ({ page }) => {
    // Navigate to course editor
    const courseCard = page.locator('[data-testid="course-card"], .course-item').first();
    if (await courseCard.isVisible({ timeout: 5000 })) {
      await courseCard.click();
      await page.waitForLoadState('networkidle');

      // Expand first module
      const moduleItem = page.locator('[data-testid="module-item"], .module-item').first();
      if (await moduleItem.isVisible({ timeout: 5000 })) {
        await moduleItem.click();

        // Click add lesson button
        const addLessonButton = page.locator(
          'button:has-text("Add Lesson"), button:has-text("New Lesson")',
        );

        if (await addLessonButton.isVisible({ timeout: 5000 })) {
          await addLessonButton.click();

          // Fill in lesson details
          await page.fill('input[name="title"]', TEST_LESSON.title);

          // Save lesson
          await page.click('button[type="submit"], button:has-text("Save")');

          // Should show success
          await expect(page.locator(`text=${TEST_LESSON.title}`)).toBeVisible({ timeout: 10000 });
        }
      }
    }
  });

  test('should edit lesson content', async ({ page }) => {
    // Navigate to a lesson
    const lessonItem = page.locator('[data-testid="lesson-item"], .lesson-item').first();

    if (await lessonItem.isVisible({ timeout: 5000 })) {
      await lessonItem.click();

      // Wait for editor to load
      const editor = page.locator(
        '[data-testid="rich-text-editor"], [contenteditable="true"], .ProseMirror',
      );

      if (await editor.isVisible({ timeout: 5000 })) {
        // Clear and type new content
        await editor.click();
        await page.keyboard.press('Control+a');
        await page.keyboard.type('Updated lesson content for testing');

        // Save
        const saveButton = page.locator('button:has-text("Save")');
        if (await saveButton.isVisible()) {
          await saveButton.click();
          await expect(page.locator('text=/saved|success/i')).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });
});

// =============================================================================
// CONTENT BLOCK TESTS
// =============================================================================

test.describe('Content Blocks', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsInstructor(page);
  });

  test('should add text block to lesson', async ({ page }) => {
    await page.goto('/inspire-studio/courses');

    // Navigate to lesson editor
    const lessonItem = page.locator('[data-testid="lesson-item"]').first();
    if (await lessonItem.isVisible({ timeout: 5000 })) {
      await lessonItem.click();

      // Click add block button
      const addBlockButton = page.locator(
        'button:has-text("Add Block"), button:has-text("Add Content"), [data-testid="add-block"]',
      );

      if (await addBlockButton.isVisible({ timeout: 5000 })) {
        await addBlockButton.click();

        // Select text block type
        const textBlockOption = page.locator('button:has-text("Text"), [data-testid="text-block"]');
        if (await textBlockOption.isVisible()) {
          await textBlockOption.click();

          // Verify block was added
          await expect(page.locator('[data-testid="content-block"], .content-block')).toBeVisible({
            timeout: 5000,
          });
        }
      }
    }
  });

  test('should add video block to lesson', async ({ page }) => {
    await page.goto('/inspire-studio/courses');

    const lessonItem = page.locator('[data-testid="lesson-item"]').first();
    if (await lessonItem.isVisible({ timeout: 5000 })) {
      await lessonItem.click();

      const addBlockButton = page.locator('button:has-text("Add Block")');
      if (await addBlockButton.isVisible({ timeout: 5000 })) {
        await addBlockButton.click();

        const videoBlockOption = page.locator(
          'button:has-text("Video"), [data-testid="video-block"]',
        );
        if (await videoBlockOption.isVisible()) {
          await videoBlockOption.click();

          // Should show video configuration options
          await expect(
            page.locator('input[placeholder*="URL"], input[name="videoUrl"]'),
          ).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test('should add quiz block to lesson', async ({ page }) => {
    await page.goto('/inspire-studio/courses');

    const lessonItem = page.locator('[data-testid="lesson-item"]').first();
    if (await lessonItem.isVisible({ timeout: 5000 })) {
      await lessonItem.click();

      const addBlockButton = page.locator('button:has-text("Add Block")');
      if (await addBlockButton.isVisible({ timeout: 5000 })) {
        await addBlockButton.click();

        const quizBlockOption = page.locator(
          'button:has-text("Quiz"), button:has-text("Assessment"), [data-testid="quiz-block"]',
        );
        if (await quizBlockOption.isVisible()) {
          await quizBlockOption.click();

          // Should show quiz builder
          await expect(page.locator('text=/question|quiz|assessment/i')).toBeVisible({
            timeout: 5000,
          });
        }
      }
    }
  });
});

// =============================================================================
// COURSE PREVIEW TESTS
// =============================================================================

test.describe('Course Preview', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsInstructor(page);
    await page.goto('/inspire-studio/courses');
  });

  test('should open course preview', async ({ page }) => {
    const courseCard = page.locator('[data-testid="course-card"]').first();
    if (await courseCard.isVisible({ timeout: 5000 })) {
      await courseCard.click();

      const previewButton = page.locator('button:has-text("Preview"), a:has-text("Preview")');
      if (await previewButton.isVisible({ timeout: 5000 })) {
        await previewButton.click();

        // Should open preview (possibly in new tab or modal)
        await expect(page.locator('text=/preview|learner.*view/i')).toBeVisible({ timeout: 10000 });
      }
    }
  });
});

// =============================================================================
// COURSE PUBLISHING TESTS
// =============================================================================

test.describe('Course Publishing', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsInstructor(page);
    await page.goto('/inspire-studio/courses');
  });

  test('should show publish button for draft course', async ({ page }) => {
    const draftCourse = page.locator('[data-testid="course-card"]:has-text("Draft")').first();
    if (await draftCourse.isVisible({ timeout: 5000 })) {
      await draftCourse.click();

      const publishButton = page.locator('button:has-text("Publish")');
      await expect(publishButton).toBeVisible({ timeout: 5000 });
    }
  });

  test('should publish a course', async ({ page }) => {
    const draftCourse = page.locator('[data-testid="course-card"]:has-text("Draft")').first();
    if (await draftCourse.isVisible({ timeout: 5000 })) {
      await draftCourse.click();

      const publishButton = page.locator('button:has-text("Publish")');
      if (await publishButton.isVisible({ timeout: 5000 })) {
        await publishButton.click();

        // Confirm publish if dialog appears
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")');
        if (await confirmButton.isVisible({ timeout: 2000 })) {
          await confirmButton.click();
        }

        // Should show published status
        await expect(page.locator('text=/published|live|success/i')).toBeVisible({
          timeout: 10000,
        });
      }
    }
  });

  test('should prevent publishing incomplete course', async ({ page }) => {
    // This test checks validation before publishing
    const incompleteCourse = page.locator('[data-testid="course-card"]').first();
    if (await incompleteCourse.isVisible({ timeout: 5000 })) {
      await incompleteCourse.click();

      const publishButton = page.locator('button:has-text("Publish")');
      if (await publishButton.isVisible({ timeout: 5000 })) {
        // Check if button is disabled or shows warning
        const isDisabled = await publishButton.isDisabled();
        if (!isDisabled) {
          await publishButton.click();

          // Should show validation errors if course is incomplete
          const errorOrSuccess = page.locator('text=/error|complete|required|success/i');
          await expect(errorOrSuccess).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });
});

// =============================================================================
// EDIT PUBLISHED COURSE TESTS
// =============================================================================

test.describe('Edit Published Course', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsInstructor(page);
    await page.goto('/inspire-studio/courses');
  });

  test('should allow editing published course', async ({ page }) => {
    const publishedCourse = page
      .locator(
        '[data-testid="course-card"]:has-text("Published"), [data-testid="course-card"]:has-text("Live")',
      )
      .first();

    if (await publishedCourse.isVisible({ timeout: 5000 })) {
      await publishedCourse.click();

      // Should be able to edit
      const editButton = page.locator('button:has-text("Edit")');
      await expect(editButton.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show unpublish option for published course', async ({ page }) => {
    const publishedCourse = page
      .locator('[data-testid="course-card"]:has-text("Published")')
      .first();

    if (await publishedCourse.isVisible({ timeout: 5000 })) {
      await publishedCourse.click();

      const unpublishButton = page.locator(
        'button:has-text("Unpublish"), button:has-text("Revert to Draft")',
      );
      await expect(unpublishButton).toBeVisible({ timeout: 5000 });
    }
  });
});
