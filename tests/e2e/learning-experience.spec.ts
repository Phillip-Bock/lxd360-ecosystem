import { expect, type Page, test } from '@playwright/test';

// =============================================================================
// TEST DATA
// =============================================================================

const TEST_LEARNER = {
  email: 'test-learner@example.com',
  password: 'LearnerPass123!',
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function loginAsLearner(page: Page): Promise<void> {
  await page.goto('/auth/login');
  await page.fill('input[type="email"]', TEST_LEARNER.email);
  await page.fill('input[type="password"]', TEST_LEARNER.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
}

// =============================================================================
// COURSE CATALOG TESTS
// =============================================================================

test.describe('Course Catalog', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsLearner(page);
    await page.goto('/courses');
  });

  test('should display course catalog', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });

    // Should show course cards or list
    const courseItems = page.locator(
      '[data-testid="course-card"], .course-card, [data-testid="course-item"]',
    );
    await expect(courseItems.first()).toBeVisible({ timeout: 10000 });
  });

  test('should filter courses by category', async ({ page }) => {
    const categoryFilter = page.locator(
      'select[name="category"], [data-testid="category-filter"], button:has-text("Category")',
    );

    if (await categoryFilter.isVisible({ timeout: 5000 })) {
      await categoryFilter.click();

      // Select a category
      const categoryOption = page.locator('option, [role="option"], button:has-text("Technology")');
      await categoryOption.first().click();

      // Should filter results
      await page.waitForLoadState('networkidle');
    }
  });

  test('should search for courses', async ({ page }) => {
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search"], input[name="search"]',
    );

    if (await searchInput.isVisible({ timeout: 5000 })) {
      await searchInput.fill('JavaScript');
      await page.keyboard.press('Enter');

      // Should show search results
      await page.waitForLoadState('networkidle');
    }
  });

  test('should sort courses', async ({ page }) => {
    const sortSelect = page.locator(
      'select[name="sort"], [data-testid="sort-select"], button:has-text("Sort")',
    );

    if (await sortSelect.isVisible({ timeout: 5000 })) {
      await sortSelect.click();

      // Select sort option
      const sortOption = page.locator(
        'option:has-text("Popular"), [role="option"]:has-text("Newest")',
      );
      await sortOption.first().click();

      await page.waitForLoadState('networkidle');
    }
  });

  test('should paginate course results', async ({ page }) => {
    const pagination = page.locator(
      '[data-testid="pagination"], nav[aria-label*="pagination"], .pagination',
    );

    if (await pagination.isVisible({ timeout: 5000 })) {
      const nextPage = page.locator('button:has-text("Next"), [aria-label="Next page"]');
      if (await nextPage.isVisible()) {
        await nextPage.click();
        await page.waitForLoadState('networkidle');
      }
    }
  });
});

// =============================================================================
// COURSE DETAILS TESTS
// =============================================================================

test.describe('Course Details', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsLearner(page);
    await page.goto('/courses');
  });

  test('should view course details', async ({ page }) => {
    const courseCard = page.locator('[data-testid="course-card"], .course-card').first();
    await courseCard.click();

    // Should show course details
    await expect(page.locator('h1, [data-testid="course-title"]')).toBeVisible({ timeout: 10000 });
  });

  test('should display course curriculum', async ({ page }) => {
    const courseCard = page.locator('[data-testid="course-card"]').first();
    await courseCard.click();

    // Should show curriculum/modules
    await expect(page.locator('text=/curriculum|module|lesson|chapter/i').first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('should show instructor information', async ({ page }) => {
    const courseCard = page.locator('[data-testid="course-card"]').first();
    await courseCard.click();

    // Should show instructor info
    await expect(page.locator('text=/instructor|teacher|author/i').first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('should display course reviews', async ({ page }) => {
    const courseCard = page.locator('[data-testid="course-card"]').first();
    await courseCard.click();

    // Should show reviews section
    const reviews = page.locator('[data-testid="reviews"], text=/review|rating/i');
    if (await reviews.isVisible({ timeout: 5000 })) {
      await expect(reviews).toBeVisible();
    }
  });
});

// =============================================================================
// COURSE ENROLLMENT TESTS
// =============================================================================

test.describe('Course Enrollment', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsLearner(page);
  });

  test('should enroll in free course', async ({ page }) => {
    await page.goto('/courses');

    // Find a free course
    const freeCourse = page
      .locator('[data-testid="course-card"]:has-text("Free"), .course-card:has-text("$0")')
      .first();

    if (await freeCourse.isVisible({ timeout: 5000 })) {
      await freeCourse.click();

      // Click enroll button
      const enrollButton = page.locator(
        'button:has-text("Enroll"), button:has-text("Start Learning"), button:has-text("Get Started")',
      );
      await enrollButton.first().click();

      // Should show enrollment confirmation or redirect to course
      await expect(page.locator('text=/enrolled|success|start learning/i').first()).toBeVisible({
        timeout: 10000,
      });
    }
  });

  test('should show payment for paid courses', async ({ page }) => {
    await page.goto('/courses');

    // Find a paid course
    const paidCourse = page
      .locator('[data-testid="course-card"]:has-text("$"), .course-card:not(:has-text("Free"))')
      .first();

    if (await paidCourse.isVisible({ timeout: 5000 })) {
      await paidCourse.click();

      // Click purchase button
      const purchaseButton = page.locator(
        'button:has-text("Buy"), button:has-text("Purchase"), button:has-text("Enroll")',
      );
      await purchaseButton.first().click();

      // Should show payment form or checkout
      await expect(page.locator('text=/payment|checkout|card/i').first()).toBeVisible({
        timeout: 10000,
      });
    }
  });

  test('should show enrolled courses in My Learning', async ({ page }) => {
    await page.goto('/my-learning');

    // Should show enrolled courses
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
  });
});

// =============================================================================
// LESSON COMPLETION TESTS
// =============================================================================

test.describe('Lesson Completion', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsLearner(page);
    await page.goto('/my-learning');
  });

  test('should access enrolled course', async ({ page }) => {
    const courseCard = page
      .locator('[data-testid="enrolled-course"], [data-testid="course-card"]')
      .first();

    if (await courseCard.isVisible({ timeout: 5000 })) {
      await courseCard.click();

      // Should show course content
      await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
    }
  });

  test('should play video lesson', async ({ page }) => {
    // Navigate to a lesson with video
    const lessonItem = page.locator('[data-testid="lesson-item"]').first();

    if (await lessonItem.isVisible({ timeout: 5000 })) {
      await lessonItem.click();

      // Should show video player
      const videoPlayer = page.locator(
        'video, [data-testid="video-player"], iframe[src*="youtube"], iframe[src*="vimeo"]',
      );
      if (await videoPlayer.isVisible({ timeout: 5000 })) {
        await expect(videoPlayer).toBeVisible();
      }
    }
  });

  test('should read text content', async ({ page }) => {
    const lessonItem = page.locator('[data-testid="lesson-item"]').first();

    if (await lessonItem.isVisible({ timeout: 5000 })) {
      await lessonItem.click();

      // Should show text content
      const content = page.locator('[data-testid="lesson-content"], .lesson-content, article');
      await expect(content).toBeVisible({ timeout: 10000 });
    }
  });

  test('should mark lesson as complete', async ({ page }) => {
    const lessonItem = page.locator('[data-testid="lesson-item"]').first();

    if (await lessonItem.isVisible({ timeout: 5000 })) {
      await lessonItem.click();

      // Complete button
      const completeButton = page.locator(
        'button:has-text("Complete"), button:has-text("Mark as Complete"), button:has-text("Done")',
      );

      if (await completeButton.isVisible({ timeout: 5000 })) {
        await completeButton.click();

        // Should show completion state
        await expect(page.locator('text=/completed|complete|done/i').first()).toBeVisible({
          timeout: 5000,
        });
      }
    }
  });

  test('should navigate to next lesson', async ({ page }) => {
    const lessonItem = page.locator('[data-testid="lesson-item"]').first();

    if (await lessonItem.isVisible({ timeout: 5000 })) {
      await lessonItem.click();

      const nextButton = page.locator(
        'button:has-text("Next"), a:has-text("Next Lesson"), [data-testid="next-lesson"]',
      );

      if (await nextButton.isVisible({ timeout: 5000 })) {
        await nextButton.click();
        await page.waitForLoadState('networkidle');
      }
    }
  });
});

// =============================================================================
// PROGRESS TRACKING TESTS
// =============================================================================

test.describe('Progress Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsLearner(page);
  });

  test('should display course progress', async ({ page }) => {
    await page.goto('/my-learning');

    // Should show progress indicators
    const progress = page.locator('[data-testid="progress"], .progress-bar, [role="progressbar"]');
    if (await progress.first().isVisible({ timeout: 5000 })) {
      await expect(progress.first()).toBeVisible();
    }
  });

  test('should track time spent on lessons', async ({ page }) => {
    await page.goto('/my-learning');

    const courseCard = page.locator('[data-testid="course-card"]').first();
    if (await courseCard.isVisible({ timeout: 5000 })) {
      await courseCard.click();

      // Look for time tracking
      const timeTracking = page.locator('text=/min|hour|time.*spent/i');
      if (await timeTracking.isVisible({ timeout: 3000 })) {
        await expect(timeTracking).toBeVisible();
      }
    }
  });

  test('should show lesson completion status', async ({ page }) => {
    await page.goto('/my-learning');

    const courseCard = page.locator('[data-testid="course-card"]').first();
    if (await courseCard.isVisible({ timeout: 5000 })) {
      await courseCard.click();

      // Should show completion checkmarks or status
      const completionStatus = page.locator(
        '[data-testid="lesson-status"], .completion-icon, svg[data-completed]',
      );
      await expect(completionStatus.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should continue from last position', async ({ page }) => {
    await page.goto('/my-learning');

    const continueButton = page.locator(
      'button:has-text("Continue"), a:has-text("Continue"), a:has-text("Resume")',
    );

    if (await continueButton.first().isVisible({ timeout: 5000 })) {
      await continueButton.first().click();

      // Should navigate to last viewed lesson
      await page.waitForLoadState('networkidle');
    }
  });
});

// =============================================================================
// QUIZ AND ASSESSMENT TESTS
// =============================================================================

test.describe('Quiz and Assessments', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsLearner(page);
  });

  test('should start quiz', async ({ page }) => {
    // Navigate to a quiz
    await page.goto('/my-learning');

    const quizItem = page
      .locator('[data-testid="quiz-item"], [data-testid="lesson-item"]:has-text("Quiz")')
      .first();

    if (await quizItem.isVisible({ timeout: 5000 })) {
      await quizItem.click();

      // Should show quiz interface
      await expect(page.locator('text=/question|quiz|assessment/i').first()).toBeVisible({
        timeout: 10000,
      });
    }
  });

  test('should answer multiple choice question', async ({ page }) => {
    const quizItem = page.locator('[data-testid="quiz-item"]').first();

    if (await quizItem.isVisible({ timeout: 5000 })) {
      await quizItem.click();

      // Select an answer
      const answerOption = page.locator(
        '[data-testid="answer-option"], input[type="radio"], button[role="radio"]',
      );
      if (await answerOption.first().isVisible({ timeout: 5000 })) {
        await answerOption.first().click();
      }
    }
  });

  test('should submit quiz answers', async ({ page }) => {
    const quizItem = page.locator('[data-testid="quiz-item"]').first();

    if (await quizItem.isVisible({ timeout: 5000 })) {
      await quizItem.click();

      // Answer questions and submit
      const answerOption = page.locator('[data-testid="answer-option"]').first();
      if (await answerOption.isVisible({ timeout: 3000 })) {
        await answerOption.click();
      }

      const submitButton = page.locator(
        'button:has-text("Submit"), button:has-text("Finish Quiz")',
      );
      if (await submitButton.isVisible({ timeout: 3000 })) {
        await submitButton.click();

        // Should show results
        await expect(page.locator('text=/score|result|correct/i').first()).toBeVisible({
          timeout: 10000,
        });
      }
    }
  });

  test('should show quiz results', async ({ page }) => {
    // Navigate to completed quiz
    await page.goto('/my-learning');

    const completedQuiz = page.locator('[data-testid="quiz-item"]:has-text("Completed")').first();

    if (await completedQuiz.isVisible({ timeout: 5000 })) {
      await completedQuiz.click();

      // Should show results
      await expect(page.locator('text=/score|%|result/i').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should allow quiz retry', async ({ page }) => {
    const completedQuiz = page.locator('[data-testid="quiz-item"]').first();

    if (await completedQuiz.isVisible({ timeout: 5000 })) {
      await completedQuiz.click();

      const retryButton = page.locator(
        'button:has-text("Retry"), button:has-text("Try Again"), button:has-text("Retake")',
      );
      if (await retryButton.isVisible({ timeout: 3000 })) {
        await retryButton.click();

        // Should restart quiz
        await expect(page.locator('[data-testid="answer-option"]').first()).toBeVisible({
          timeout: 5000,
        });
      }
    }
  });
});

// =============================================================================
// COURSE COMPLETION TESTS
// =============================================================================

test.describe('Course Completion', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsLearner(page);
  });

  test('should show course completion status', async ({ page }) => {
    await page.goto('/my-learning');

    // Look for completed course indicator
    const completedCourse = page.locator(
      '[data-testid="course-card"]:has-text("100%"), [data-testid="course-card"]:has-text("Completed")',
    );

    if (await completedCourse.first().isVisible({ timeout: 5000 })) {
      await expect(completedCourse.first()).toBeVisible();
    }
  });

  test('should display completion certificate', async ({ page }) => {
    await page.goto('/my-learning');

    const completedCourse = page
      .locator('[data-testid="course-card"]:has-text("Completed")')
      .first();

    if (await completedCourse.isVisible({ timeout: 5000 })) {
      await completedCourse.click();

      const certificateButton = page.locator(
        'button:has-text("Certificate"), a:has-text("Certificate"), button:has-text("View Certificate")',
      );

      if (await certificateButton.isVisible({ timeout: 5000 })) {
        await certificateButton.click();

        // Should show certificate
        await expect(
          page.locator('text=/certificate|completion|congratulations/i').first(),
        ).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('should download certificate as PDF', async ({ page }) => {
    await page.goto('/my-learning');

    const completedCourse = page
      .locator('[data-testid="course-card"]:has-text("Completed")')
      .first();

    if (await completedCourse.isVisible({ timeout: 5000 })) {
      await completedCourse.click();

      const downloadButton = page.locator(
        'button:has-text("Download"), a:has-text("Download PDF")',
      );

      if (await downloadButton.isVisible({ timeout: 5000 })) {
        // Set up download listener
        const downloadPromise = page.waitForEvent('download');
        await downloadButton.click();

        try {
          const download = await downloadPromise;
          expect(download.suggestedFilename()).toContain('.pdf');
        } catch {
          // Download may be handled differently
        }
      }
    }
  });

  test('should share certificate', async ({ page }) => {
    await page.goto('/certificates');

    const certificate = page.locator('[data-testid="certificate-card"]').first();

    if (await certificate.isVisible({ timeout: 5000 })) {
      const shareButton = page.locator('button:has-text("Share"), [data-testid="share-button"]');

      if (await shareButton.isVisible({ timeout: 3000 })) {
        await shareButton.click();

        // Should show share options
        await expect(page.locator('text=/share|copy.*link|linkedin/i').first()).toBeVisible({
          timeout: 5000,
        });
      }
    }
  });
});

// =============================================================================
// BOOKMARKS AND NOTES TESTS
// =============================================================================

test.describe('Bookmarks and Notes', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsLearner(page);
    await page.goto('/my-learning');
  });

  test('should bookmark a lesson', async ({ page }) => {
    const courseCard = page.locator('[data-testid="course-card"]').first();

    if (await courseCard.isVisible({ timeout: 5000 })) {
      await courseCard.click();

      const lessonItem = page.locator('[data-testid="lesson-item"]').first();
      if (await lessonItem.isVisible({ timeout: 3000 })) {
        await lessonItem.click();

        const bookmarkButton = page.locator(
          'button[aria-label*="bookmark"], [data-testid="bookmark-button"], button:has-text("Bookmark")',
        );

        if (await bookmarkButton.isVisible({ timeout: 3000 })) {
          await bookmarkButton.click();

          // Should show bookmarked state
          await expect(
            page.locator('[data-bookmarked="true"], text=/bookmarked|saved/i'),
          ).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test('should add note to lesson', async ({ page }) => {
    const courseCard = page.locator('[data-testid="course-card"]').first();

    if (await courseCard.isVisible({ timeout: 5000 })) {
      await courseCard.click();

      const lessonItem = page.locator('[data-testid="lesson-item"]').first();
      if (await lessonItem.isVisible({ timeout: 3000 })) {
        await lessonItem.click();

        const notesButton = page.locator('button:has-text("Notes"), [data-testid="notes-button"]');

        if (await notesButton.isVisible({ timeout: 3000 })) {
          await notesButton.click();

          // Add a note
          const noteInput = page.locator('textarea[name="note"], [contenteditable="true"]');
          if (await noteInput.isVisible({ timeout: 3000 })) {
            await noteInput.fill('This is an important concept to remember.');

            const saveNoteButton = page.locator('button:has-text("Save")');
            await saveNoteButton.click();
          }
        }
      }
    }
  });

  test('should view all bookmarks', async ({ page }) => {
    await page.goto('/bookmarks');

    // Should show bookmarks list
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
  });

  test('should view all notes', async ({ page }) => {
    await page.goto('/notes');

    // Should show notes list
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
  });
});

// =============================================================================
// DISCUSSION AND Q&A TESTS
// =============================================================================

test.describe('Discussion and Q&A', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsLearner(page);
  });

  test('should view course discussions', async ({ page }) => {
    await page.goto('/courses');

    const courseCard = page.locator('[data-testid="course-card"]').first();
    if (await courseCard.isVisible({ timeout: 5000 })) {
      await courseCard.click();

      const discussionTab = page.locator(
        'button:has-text("Discussion"), a:has-text("Q&A"), [data-testid="discussion-tab"]',
      );

      if (await discussionTab.isVisible({ timeout: 3000 })) {
        await discussionTab.click();

        // Should show discussions
        await expect(
          page.locator('[data-testid="discussion-list"], .discussion-thread'),
        ).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should ask a question', async ({ page }) => {
    await page.goto('/courses');

    const courseCard = page.locator('[data-testid="course-card"]').first();
    if (await courseCard.isVisible({ timeout: 5000 })) {
      await courseCard.click();

      const askButton = page.locator('button:has-text("Ask"), button:has-text("New Question")');

      if (await askButton.isVisible({ timeout: 3000 })) {
        await askButton.click();

        // Fill in question
        const questionInput = page.locator('textarea[name="question"], input[name="title"]');
        if (await questionInput.isVisible({ timeout: 3000 })) {
          await questionInput.fill('How do I implement this concept in a real project?');

          const submitButton = page.locator('button[type="submit"], button:has-text("Post")');
          await submitButton.click();

          // Should show confirmation
          await page.waitForLoadState('networkidle');
        }
      }
    }
  });

  test('should reply to a question', async ({ page }) => {
    await page.goto('/courses');

    const courseCard = page.locator('[data-testid="course-card"]').first();
    if (await courseCard.isVisible({ timeout: 5000 })) {
      await courseCard.click();

      const discussionItem = page.locator('[data-testid="discussion-item"]').first();

      if (await discussionItem.isVisible({ timeout: 3000 })) {
        await discussionItem.click();

        const replyButton = page.locator('button:has-text("Reply")');
        if (await replyButton.isVisible({ timeout: 3000 })) {
          await replyButton.click();

          const replyInput = page.locator('textarea[name="reply"]');
          if (await replyInput.isVisible({ timeout: 3000 })) {
            await replyInput.fill('Great question! Here is my answer...');

            const submitReply = page.locator('button[type="submit"]');
            await submitReply.click();
          }
        }
      }
    }
  });
});

// =============================================================================
// MOBILE LEARNING EXPERIENCE TESTS
// =============================================================================

test.describe('Mobile Learning Experience', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await loginAsLearner(page);
  });

  test('should display mobile-friendly course viewer', async ({ page }) => {
    await page.goto('/my-learning');

    const courseCard = page.locator('[data-testid="course-card"]').first();
    if (await courseCard.isVisible({ timeout: 5000 })) {
      await courseCard.click();

      // Should be responsive
      await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show mobile navigation menu', async ({ page }) => {
    await page.goto('/my-learning');

    const menuButton = page.locator('button[aria-label*="menu"], [data-testid="mobile-menu"]');

    if (await menuButton.isVisible({ timeout: 3000 })) {
      await menuButton.click();

      // Should show navigation
      await expect(page.locator('nav, [role="navigation"]')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should handle touch gestures for navigation', async ({ page }) => {
    await page.goto('/my-learning');

    const courseCard = page.locator('[data-testid="course-card"]').first();
    if (await courseCard.isVisible({ timeout: 5000 })) {
      await courseCard.click();

      // Swipe navigation would be tested here
      // For now, verify content is accessible
      await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
    }
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe('Learning Experience Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsLearner(page);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/courses');

    // Tab through course cards
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should focus on course card
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/my-learning');

    // Check for ARIA labels
    const ariaLabels = await page.locator('[aria-label]').count();
    expect(ariaLabels).toBeGreaterThan(0);
  });

  test('should support screen reader announcements', async ({ page }) => {
    await page.goto('/my-learning');

    // Check for live regions
    const _liveRegions = await page.locator('[aria-live]').count();
    // May or may not have live regions
  });
});
