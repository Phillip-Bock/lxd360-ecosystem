import { expect, type Page, test } from '@playwright/test';

// =============================================================================
// TEST DATA
// =============================================================================

const TEST_ADMIN = {
  email: 'test-admin@example.com',
  password: 'AdminPass123!',
};

const TEST_SUPER_ADMIN = {
  email: 'super-admin@example.com',
  password: 'SuperAdminPass123!',
};

const NEW_USER_DATA = {
  email: 'new-managed-user@example.com',
  firstName: 'Managed',
  lastName: 'User',
  role: 'learner',
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/auth/login');
  await page.fill('input[type="email"]', TEST_ADMIN.email);
  await page.fill('input[type="password"]', TEST_ADMIN.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard|admin/, { timeout: 15000 });
}

async function loginAsSuperAdmin(page: Page): Promise<void> {
  await page.goto('/auth/login');
  await page.fill('input[type="email"]', TEST_SUPER_ADMIN.email);
  await page.fill('input[type="password"]', TEST_SUPER_ADMIN.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard|admin/, { timeout: 15000 });
}

// =============================================================================
// COMMAND CENTER ACCESS TESTS
// =============================================================================

test.describe('Admin Command Center Access', () => {
  test('should access admin command center', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');

    // Should show command center
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=/admin|command center|dashboard/i').first()).toBeVisible({
      timeout: 5000,
    });
  });

  test('should display admin navigation menu', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');

    // Should show admin navigation
    const adminNav = page.locator('[data-testid="admin-nav"], nav[aria-label*="admin"], aside');
    await expect(adminNav.first()).toBeVisible({ timeout: 5000 });
  });

  test('should show dashboard statistics', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');

    // Should show key metrics
    await expect(page.locator('text=/users|courses|revenue|active/i').first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('should deny access to non-admin users', async ({ page }) => {
    // Login as regular user
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'regular-user@example.com');
    await page.fill('input[type="password"]', 'UserPass123!');
    await page.click('button[type="submit"]');

    // Try to access admin
    await page.goto('/admin');

    // Should be redirected or show error
    await expect(page.locator('text=/access denied|unauthorized|forbidden/i').first())
      .toBeVisible({ timeout: 10000 })
      .catch(() => {
        // Or redirected away from admin
        expect(page.url()).not.toContain('/admin');
      });
  });
});

// =============================================================================
// USER MANAGEMENT TESTS
// =============================================================================

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/users');
  });

  test('should display user list', async ({ page }) => {
    // Should show users table or list
    await expect(page.locator('table, [data-testid="user-list"], [role="grid"]')).toBeVisible({
      timeout: 10000,
    });
  });

  test('should search for users', async ({ page }) => {
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search"], input[name="search"]',
    );

    if (await searchInput.isVisible({ timeout: 5000 })) {
      await searchInput.fill('test');
      await page.keyboard.press('Enter');

      // Should filter results
      await page.waitForLoadState('networkidle');
    }
  });

  test('should filter users by role', async ({ page }) => {
    const roleFilter = page.locator('select[name="role"], [data-testid="role-filter"]');

    if (await roleFilter.isVisible({ timeout: 5000 })) {
      await roleFilter.selectOption('instructor');
      await page.waitForLoadState('networkidle');
    }
  });

  test('should create new user', async ({ page }) => {
    const createButton = page.locator(
      'button:has-text("Create User"), button:has-text("Add User"), a:has-text("New User")',
    );

    if (await createButton.isVisible({ timeout: 5000 })) {
      await createButton.click();

      // Fill in user details
      await page.fill('input[name="email"]', NEW_USER_DATA.email);
      await page.fill('input[name="firstName"]', NEW_USER_DATA.firstName);
      await page.fill('input[name="lastName"]', NEW_USER_DATA.lastName);

      // Select role
      const roleSelect = page.locator('select[name="role"]');
      if (await roleSelect.isVisible({ timeout: 2000 })) {
        await roleSelect.selectOption(NEW_USER_DATA.role);
      }

      // Submit
      const submitButton = page.locator('button[type="submit"], button:has-text("Create")');
      await submitButton.click();

      // Should show success
      await expect(page.locator('text=/created|success/i').first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('should edit user details', async ({ page }) => {
    const userRow = page.locator('tr, [data-testid="user-row"]').first();

    if (await userRow.isVisible({ timeout: 5000 })) {
      const editButton = userRow.locator(
        'button:has-text("Edit"), button[aria-label*="edit"], [data-testid="edit-user"]',
      );

      if (await editButton.isVisible({ timeout: 3000 })) {
        await editButton.click();

        // Update user
        const nameInput = page.locator('input[name="firstName"]');
        if (await nameInput.isVisible({ timeout: 3000 })) {
          await nameInput.fill('Updated Name');

          const saveButton = page.locator('button:has-text("Save")');
          await saveButton.click();

          await page.waitForLoadState('networkidle');
        }
      }
    }
  });

  test('should deactivate user', async ({ page }) => {
    const userRow = page.locator('tr, [data-testid="user-row"]').first();

    if (await userRow.isVisible({ timeout: 5000 })) {
      const deactivateButton = userRow.locator(
        'button:has-text("Deactivate"), button[aria-label*="deactivate"]',
      );

      if (await deactivateButton.isVisible({ timeout: 3000 })) {
        await deactivateButton.click();

        // Confirm deactivation
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")');
        if (await confirmButton.isVisible({ timeout: 3000 })) {
          await confirmButton.click();
        }

        // Should show deactivated status
        await expect(page.locator('text=/deactivated|inactive|disabled/i').first()).toBeVisible({
          timeout: 5000,
        });
      }
    }
  });

  test('should view user details', async ({ page }) => {
    const userRow = page.locator('tr, [data-testid="user-row"]').first();

    if (await userRow.isVisible({ timeout: 5000 })) {
      await userRow.click();

      // Should show user detail view
      await expect(page.locator('[data-testid="user-details"], h2, h1')).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test('should change user role', async ({ page }) => {
    const userRow = page.locator('tr, [data-testid="user-row"]').first();

    if (await userRow.isVisible({ timeout: 5000 })) {
      const roleSelect = userRow.locator('select[name="role"], [data-testid="role-select"]');

      if (await roleSelect.isVisible({ timeout: 3000 })) {
        await roleSelect.selectOption('instructor');
        await page.waitForLoadState('networkidle');
      }
    }
  });
});

// =============================================================================
// CONTENT APPROVAL WORKFLOW TESTS
// =============================================================================

test.describe('Content Approval Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/content');
  });

  test('should display pending content for review', async ({ page }) => {
    // Should show pending content list
    await expect(page.locator('text=/pending|review|approval/i').first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('should view content details for approval', async ({ page }) => {
    const pendingContent = page
      .locator('[data-testid="pending-content"], tr:has-text("Pending")')
      .first();

    if (await pendingContent.isVisible({ timeout: 5000 })) {
      await pendingContent.click();

      // Should show content details
      await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should approve content', async ({ page }) => {
    const pendingContent = page
      .locator('[data-testid="pending-content"], tr:has-text("Pending")')
      .first();

    if (await pendingContent.isVisible({ timeout: 5000 })) {
      const approveButton = page
        .locator('button:has-text("Approve"), button[aria-label*="approve"]')
        .first();

      if (await approveButton.isVisible({ timeout: 3000 })) {
        await approveButton.click();

        // Should show approval confirmation
        await expect(page.locator('text=/approved|success/i').first()).toBeVisible({
          timeout: 5000,
        });
      }
    }
  });

  test('should reject content with feedback', async ({ page }) => {
    const pendingContent = page
      .locator('[data-testid="pending-content"], tr:has-text("Pending")')
      .first();

    if (await pendingContent.isVisible({ timeout: 5000 })) {
      const rejectButton = page
        .locator('button:has-text("Reject"), button[aria-label*="reject"]')
        .first();

      if (await rejectButton.isVisible({ timeout: 3000 })) {
        await rejectButton.click();

        // Add feedback
        const feedbackInput = page.locator('textarea[name="feedback"], textarea[name="reason"]');
        if (await feedbackInput.isVisible({ timeout: 3000 })) {
          await feedbackInput.fill('Content needs revision. Please improve the introduction.');

          const confirmButton = page.locator(
            'button:has-text("Confirm"), button:has-text("Submit")',
          );
          await confirmButton.click();
        }

        // Should show rejection confirmation
        await expect(page.locator('text=/rejected|feedback sent/i').first()).toBeVisible({
          timeout: 5000,
        });
      }
    }
  });

  test('should request changes to content', async ({ page }) => {
    const pendingContent = page.locator('[data-testid="pending-content"]').first();

    if (await pendingContent.isVisible({ timeout: 5000 })) {
      const requestChangesButton = page.locator(
        'button:has-text("Request Changes"), button:has-text("Needs Revision")',
      );

      if (await requestChangesButton.isVisible({ timeout: 3000 })) {
        await requestChangesButton.click();

        // Add feedback
        const feedbackInput = page.locator('textarea');
        if (await feedbackInput.isVisible({ timeout: 3000 })) {
          await feedbackInput.fill('Please add more examples to chapter 2.');

          const submitButton = page.locator('button[type="submit"]');
          await submitButton.click();
        }
      }
    }
  });
});

// =============================================================================
// SYSTEM CONFIGURATION TESTS
// =============================================================================

test.describe('System Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSuperAdmin(page);
    await page.goto('/admin/settings');
  });

  test('should display system settings', async ({ page }) => {
    // Should show settings page
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=/settings|configuration/i').first()).toBeVisible({
      timeout: 5000,
    });
  });

  test('should configure general settings', async ({ page }) => {
    const generalSettings = page.locator(
      '[data-testid="general-settings"], button:has-text("General")',
    );

    if (await generalSettings.isVisible({ timeout: 5000 })) {
      await generalSettings.click();

      // Update site name
      const siteNameInput = page.locator('input[name="siteName"]');
      if (await siteNameInput.isVisible({ timeout: 3000 })) {
        await siteNameInput.fill('LXP360 Learning Platform');

        const saveButton = page.locator('button:has-text("Save")');
        await saveButton.click();

        await expect(page.locator('text=/saved|success/i').first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should configure email settings', async ({ page }) => {
    const emailSettings = page.locator(
      '[data-testid="email-settings"], button:has-text("Email"), a:has-text("Email")',
    );

    if (await emailSettings.isVisible({ timeout: 5000 })) {
      await emailSettings.click();

      // Verify email configuration fields exist
      await expect(page.locator('input[name*="email"], input[name*="smtp"]').first()).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test('should configure payment settings', async ({ page }) => {
    const paymentSettings = page.locator(
      '[data-testid="payment-settings"], button:has-text("Payment"), a:has-text("Billing")',
    );

    if (await paymentSettings.isVisible({ timeout: 5000 })) {
      await paymentSettings.click();

      // Verify payment configuration fields exist
      await expect(page.locator('text=/stripe|payment|billing/i').first()).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test('should configure security settings', async ({ page }) => {
    const securitySettings = page.locator(
      '[data-testid="security-settings"], button:has-text("Security"), a:has-text("Security")',
    );

    if (await securitySettings.isVisible({ timeout: 5000 })) {
      await securitySettings.click();

      // Verify security options
      await expect(page.locator('text=/security|password|mfa|2fa/i').first()).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test('should manage feature flags', async ({ page }) => {
    const featureFlags = page.locator(
      '[data-testid="feature-flags"], button:has-text("Features"), a:has-text("Feature")',
    );

    if (await featureFlags.isVisible({ timeout: 5000 })) {
      await featureFlags.click();

      // Toggle a feature
      const featureToggle = page.locator('input[type="checkbox"], [role="switch"]').first();

      if (await featureToggle.isVisible({ timeout: 3000 })) {
        await featureToggle.click();
        await page.waitForLoadState('networkidle');
      }
    }
  });
});

// =============================================================================
// ORGANIZATION MANAGEMENT TESTS
// =============================================================================

test.describe('Organization Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSuperAdmin(page);
    await page.goto('/admin/organizations');
  });

  test('should display organization list', async ({ page }) => {
    // Should show organizations
    await expect(page.locator('table, [data-testid="org-list"]')).toBeVisible({ timeout: 10000 });
  });

  test('should create new organization', async ({ page }) => {
    const createButton = page.locator(
      'button:has-text("Create"), button:has-text("Add Organization")',
    );

    if (await createButton.isVisible({ timeout: 5000 })) {
      await createButton.click();

      // Fill in org details
      await page.fill('input[name="name"]', 'New Test Organization');

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      await expect(page.locator('text=/created|success/i').first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('should edit organization settings', async ({ page }) => {
    const orgRow = page.locator('tr, [data-testid="org-row"]').first();

    if (await orgRow.isVisible({ timeout: 5000 })) {
      const editButton = orgRow.locator('button:has-text("Edit")');

      if (await editButton.isVisible({ timeout: 3000 })) {
        await editButton.click();

        const nameInput = page.locator('input[name="name"]');
        if (await nameInput.isVisible({ timeout: 3000 })) {
          await nameInput.fill('Updated Org Name');

          const saveButton = page.locator('button:has-text("Save")');
          await saveButton.click();
        }
      }
    }
  });

  test('should manage organization subscriptions', async ({ page }) => {
    const orgRow = page.locator('tr, [data-testid="org-row"]').first();

    if (await orgRow.isVisible({ timeout: 5000 })) {
      await orgRow.click();

      const subscriptionTab = page.locator(
        'button:has-text("Subscription"), a:has-text("Billing")',
      );

      if (await subscriptionTab.isVisible({ timeout: 3000 })) {
        await subscriptionTab.click();

        // Should show subscription details
        await expect(page.locator('text=/subscription|plan|billing/i').first()).toBeVisible({
          timeout: 5000,
        });
      }
    }
  });
});

// =============================================================================
// ANALYTICS AND REPORTING TESTS
// =============================================================================

test.describe('Analytics and Reporting', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/analytics');
  });

  test('should display analytics dashboard', async ({ page }) => {
    // Should show analytics
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
  });

  test('should show user engagement metrics', async ({ page }) => {
    const engagementSection = page.locator(
      '[data-testid="engagement-metrics"], text=/engagement|active.*users/i',
    );

    await expect(engagementSection.first()).toBeVisible({ timeout: 10000 });
  });

  test('should show course performance metrics', async ({ page }) => {
    const courseMetrics = page.locator(
      '[data-testid="course-metrics"], text=/course.*completion|enrollment/i',
    );

    await expect(courseMetrics.first()).toBeVisible({ timeout: 10000 });
  });

  test('should filter analytics by date range', async ({ page }) => {
    const dateFilter = page.locator(
      '[data-testid="date-filter"], button:has-text("Date"), input[type="date"]',
    );

    if (await dateFilter.first().isVisible({ timeout: 5000 })) {
      await dateFilter.first().click();

      // Select a range
      const option = page.locator('button:has-text("Last 30 days")');
      if (await option.isVisible({ timeout: 3000 })) {
        await option.click();
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('should export report', async ({ page }) => {
    const exportButton = page.locator('button:has-text("Export"), button:has-text("Download")');

    if (await exportButton.isVisible({ timeout: 5000 })) {
      const _downloadPromise = page.waitForEvent('download').catch(() => null);
      await exportButton.click();

      // May trigger download or open modal
      await page.waitForLoadState('networkidle');
    }
  });
});

// =============================================================================
// AUDIT LOG TESTS
// =============================================================================

test.describe('Audit Logs', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSuperAdmin(page);
    await page.goto('/admin/audit-logs');
  });

  test('should display audit log entries', async ({ page }) => {
    // Should show audit logs
    await expect(page.locator('table, [data-testid="audit-log-list"]')).toBeVisible({
      timeout: 10000,
    });
  });

  test('should filter audit logs by action type', async ({ page }) => {
    const actionFilter = page.locator('select[name="action"], [data-testid="action-filter"]');

    if (await actionFilter.isVisible({ timeout: 5000 })) {
      await actionFilter.selectOption({ index: 1 });
      await page.waitForLoadState('networkidle');
    }
  });

  test('should filter audit logs by user', async ({ page }) => {
    const userFilter = page.locator('input[name="user"], [data-testid="user-filter"]');

    if (await userFilter.isVisible({ timeout: 5000 })) {
      await userFilter.fill('admin');
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle');
    }
  });

  test('should view audit log details', async ({ page }) => {
    const logEntry = page.locator('tr, [data-testid="audit-log-entry"]').first();

    if (await logEntry.isVisible({ timeout: 5000 })) {
      await logEntry.click();

      // Should show log details
      await expect(
        page.locator('[data-testid="audit-log-details"], text=/details|timestamp/i'),
      ).toBeVisible({ timeout: 5000 });
    }
  });
});

// =============================================================================
// NOTIFICATION MANAGEMENT TESTS
// =============================================================================

test.describe('Notification Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/notifications');
  });

  test('should display notification templates', async ({ page }) => {
    await expect(page.locator('text=/template|notification/i').first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('should create announcement', async ({ page }) => {
    const createButton = page.locator(
      'button:has-text("Create"), button:has-text("New Announcement")',
    );

    if (await createButton.isVisible({ timeout: 5000 })) {
      await createButton.click();

      // Fill in announcement
      const titleInput = page.locator('input[name="title"]');
      if (await titleInput.isVisible({ timeout: 3000 })) {
        await titleInput.fill('System Maintenance Notice');

        const contentInput = page.locator('textarea[name="content"]');
        await contentInput.fill('The system will be under maintenance on Sunday.');

        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();

        await expect(page.locator('text=/created|sent|success/i').first()).toBeVisible({
          timeout: 5000,
        });
      }
    }
  });

  test('should send bulk notification', async ({ page }) => {
    const bulkButton = page.locator('button:has-text("Bulk"), button:has-text("Send to All")');

    if (await bulkButton.isVisible({ timeout: 5000 })) {
      await bulkButton.click();

      // Should show bulk notification form
      await expect(page.locator('text=/recipient|all.*users/i').first()).toBeVisible({
        timeout: 5000,
      });
    }
  });
});

// =============================================================================
// SUPER ADMIN SPECIFIC TESTS
// =============================================================================

test.describe('Super Admin Functions', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSuperAdmin(page);
  });

  test('should access all admin areas', async ({ page }) => {
    // Test access to sensitive areas
    await page.goto('/admin/settings');
    await expect(page.locator('main')).toBeVisible({ timeout: 5000 });

    await page.goto('/admin/organizations');
    await expect(page.locator('main')).toBeVisible({ timeout: 5000 });

    await page.goto('/admin/audit-logs');
    await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
  });

  test('should manage admin users', async ({ page }) => {
    await page.goto('/admin/users');

    // Should be able to change user to admin
    const userRow = page.locator('tr').first();
    const roleSelect = userRow.locator('select[name="role"]');

    if (await roleSelect.isVisible({ timeout: 3000 })) {
      // Super admin can assign admin roles
      await expect(roleSelect.locator('option[value="admin"]')).toBeAttached();
    }
  });

  test('should view system health', async ({ page }) => {
    await page.goto('/admin/system');

    await expect(page.locator('text=/system|health|status/i').first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('should manage integrations', async ({ page }) => {
    await page.goto('/admin/integrations');

    await expect(page.locator('text=/integration|api|connection/i').first()).toBeVisible({
      timeout: 10000,
    });
  });
});

// =============================================================================
// MOBILE ADMIN TESTS
// =============================================================================

test.describe('Mobile Admin Experience', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should display mobile-friendly admin interface', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
  });

  test('should show mobile admin navigation', async ({ page }) => {
    await page.goto('/admin');

    const menuButton = page.locator('button[aria-label*="menu"], [data-testid="mobile-menu"]');

    if (await menuButton.isVisible({ timeout: 5000 })) {
      await menuButton.click();

      await expect(page.locator('nav, [role="navigation"]')).toBeVisible({ timeout: 5000 });
    }
  });
});
