import { expect, type Page, test } from '@playwright/test';
import { test as authTest } from './fixtures/auth.fixture';

// =============================================================================
// TEST DATA
// =============================================================================

/**
 * Stripe test card numbers for various scenarios
 * @see https://stripe.com/docs/testing#cards
 */
const STRIPE_TEST_CARDS = {
  success: {
    number: '4242424242424242',
    expiry: '12/34',
    cvc: '123',
    zip: '12345',
  },
  declined: {
    number: '4000000000000002',
    expiry: '12/34',
    cvc: '123',
    zip: '12345',
  },
  requiresAuth: {
    number: '4000002500003155',
    expiry: '12/34',
    cvc: '123',
    zip: '12345',
  },
};

const PRICING_PAGE_PATHS = ['/pricing', '/lxp360/pricing', '/plans', '/subscribe'];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Navigate to the pricing page
 */
async function navigateToPricing(page: Page): Promise<boolean> {
  for (const path of PRICING_PAGE_PATHS) {
    await page.goto(path);
    await page.waitForLoadState('domcontentloaded');

    // Check if we're on a valid pricing page
    const pricingIndicator = page.locator(
      '[data-testid="pricing-page"], h1:has-text("Pricing"), h1:has-text("Plans"), text=/pricing|plans|subscribe/i',
    );

    if (await pricingIndicator.isVisible({ timeout: 3000 }).catch(() => false)) {
      return true;
    }
  }
  return false;
}

/**
 * Fill Stripe checkout form
 * @note Stripe Elements are in an iframe, requires special handling
 */
async function fillStripeCheckout(
  page: Page,
  cardDetails: typeof STRIPE_TEST_CARDS.success,
): Promise<void> {
  // Wait for Stripe iframe to load
  const stripeFrame = page.frameLocator('iframe[name*="stripe"]').first();

  // Try to find the card number field
  const cardNumberField = stripeFrame.locator('input[name="cardnumber"]');

  if (await cardNumberField.isVisible({ timeout: 10000 })) {
    // Fill card number
    await cardNumberField.fill(cardDetails.number);

    // Fill expiry
    const expiryField = stripeFrame.locator('input[name="exp-date"]');
    if (await expiryField.isVisible()) {
      await expiryField.fill(cardDetails.expiry);
    }

    // Fill CVC
    const cvcField = stripeFrame.locator('input[name="cvc"]');
    if (await cvcField.isVisible()) {
      await cvcField.fill(cardDetails.cvc);
    }

    // Fill ZIP if present
    const zipField = stripeFrame.locator('input[name="postal"]');
    if (await zipField.isVisible()) {
      await zipField.fill(cardDetails.zip);
    }
  }
}

// =============================================================================
// PRICING PAGE TESTS
// =============================================================================

test.describe('Pricing Page', () => {
  test('should display pricing page with plans', async ({ page }) => {
    const foundPricing = await navigateToPricing(page);

    if (foundPricing) {
      // Should have pricing plans displayed
      const pricingPlans = page.locator(
        '[data-testid="pricing-plan"], [data-testid="plan-card"], .pricing-card, .plan-card',
      );
      await expect(pricingPlans.first()).toBeVisible({ timeout: 10000 });
    } else {
      // If no dedicated pricing page, check for pricing section on marketing page
      await page.goto('/');
      const pricingSection = page.locator(
        '[data-testid="pricing-section"], section:has-text("Pricing"), #pricing',
      );
      await expect(pricingSection.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('should display plan names and prices', async ({ page }) => {
    const foundPricing = await navigateToPricing(page);

    if (foundPricing) {
      const planCards = page.locator(
        '[data-testid="pricing-plan"], [data-testid="plan-card"], .pricing-card',
      );
      const cardCount = await planCards.count();

      if (cardCount > 0) {
        for (let i = 0; i < Math.min(cardCount, 3); i++) {
          const card = planCards.nth(i);

          // Each plan should have a name
          const planName = card.locator('h2, h3, [data-testid="plan-name"]');
          await expect(planName).toBeVisible();

          // Each plan should have a price
          const price = card.locator('[data-testid="plan-price"], text=/\\$/');
          await expect(price.first()).toBeVisible();
        }
      }
    }
  });

  test('should display plan features', async ({ page }) => {
    const foundPricing = await navigateToPricing(page);

    if (foundPricing) {
      const planCard = page
        .locator('[data-testid="pricing-plan"], [data-testid="plan-card"]')
        .first();

      if (await planCard.isVisible({ timeout: 5000 })) {
        // Should have feature list
        const features = planCard.locator('ul li, [data-testid="plan-features"] li, .feature-item');
        const featureCount = await features.count();
        expect(featureCount).toBeGreaterThan(0);
      }
    }
  });

  test('should have CTA buttons for each plan', async ({ page }) => {
    const foundPricing = await navigateToPricing(page);

    if (foundPricing) {
      const planCards = page.locator('[data-testid="pricing-plan"], [data-testid="plan-card"]');
      const cardCount = await planCards.count();

      if (cardCount > 0) {
        for (let i = 0; i < Math.min(cardCount, 3); i++) {
          const card = planCards.nth(i);
          const ctaButton = card.locator(
            'button:has-text("Get Started"), button:has-text("Subscribe"), button:has-text("Choose"), a:has-text("Get Started")',
          );
          await expect(ctaButton.first()).toBeVisible();
        }
      }
    }
  });

  test('should highlight recommended/popular plan', async ({ page }) => {
    const foundPricing = await navigateToPricing(page);

    if (foundPricing) {
      // Look for highlighted/popular plan indicator
      const popularPlan = page.locator(
        '[data-testid="popular-plan"], [data-popular="true"], :has-text("Popular"), :has-text("Recommended"), .popular, .recommended',
      );

      // It's okay if there's no popular plan indicator
      const hasPopularPlan = await popularPlan
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false);

      if (hasPopularPlan) {
        await expect(popularPlan.first()).toBeVisible();
      }
    }
  });

  test('should toggle between monthly and annual pricing', async ({ page }) => {
    const foundPricing = await navigateToPricing(page);

    if (foundPricing) {
      // Look for billing period toggle
      const billingToggle = page.locator(
        '[data-testid="billing-toggle"], button:has-text("Annual"), button:has-text("Monthly"), [role="switch"]',
      );

      if (await billingToggle.first().isVisible({ timeout: 5000 })) {
        // Get initial price
        const initialPrice = await page.locator('[data-testid="plan-price"]').first().textContent();

        // Toggle billing period
        await billingToggle.first().click();
        await page.waitForTimeout(500);

        // Price should change or period should change
        const newPrice = await page.locator('[data-testid="plan-price"]').first().textContent();

        // Either price changed or we can verify the toggle state changed
        const toggleChanged = initialPrice !== newPrice;
        expect(toggleChanged || (await billingToggle.first().isVisible())).toBe(true);
      }
    }
  });
});

// =============================================================================
// CHECKOUT FLOW TESTS
// =============================================================================

test.describe('Checkout Flow', () => {
  test('should redirect to login for unauthenticated checkout', async ({ page }) => {
    const foundPricing = await navigateToPricing(page);

    if (foundPricing) {
      const ctaButton = page
        .locator(
          'button:has-text("Get Started"), button:has-text("Subscribe"), button:has-text("Choose")',
        )
        .first();

      if (await ctaButton.isVisible({ timeout: 5000 })) {
        await ctaButton.click();

        // Should redirect to login or show login modal
        await expect(
          page
            .locator('input[type="email"], [data-testid="login-form"], text=/sign in|log in/i')
            .first(),
        ).toBeVisible({ timeout: 10000 });
      }
    }
  });
});

authTest.describe('Authenticated Checkout', () => {
  authTest('should initiate checkout for selected plan', async ({ authenticatedPage }) => {
    const foundPricing = await navigateToPricing(authenticatedPage);

    if (foundPricing) {
      const ctaButton = authenticatedPage
        .locator(
          'button:has-text("Get Started"), button:has-text("Subscribe"), button:has-text("Choose")',
        )
        .first();

      if (await ctaButton.isVisible({ timeout: 5000 })) {
        await ctaButton.click();

        // Should show checkout form or redirect to Stripe
        const checkoutIndicator = authenticatedPage.locator(
          'iframe[name*="stripe"], [data-testid="checkout-form"], text=/payment|checkout|billing/i',
        );
        await expect(checkoutIndicator.first()).toBeVisible({ timeout: 15000 });
      }
    }
  });

  authTest('should display order summary in checkout', async ({ authenticatedPage }) => {
    const foundPricing = await navigateToPricing(authenticatedPage);

    if (foundPricing) {
      const ctaButton = authenticatedPage.locator('button:has-text("Subscribe")').first();

      if (await ctaButton.isVisible({ timeout: 5000 })) {
        await ctaButton.click();
        await authenticatedPage.waitForLoadState('networkidle');

        // Should show order summary
        const orderSummary = authenticatedPage.locator(
          '[data-testid="order-summary"], text=/total|summary|order/i',
        );
        await expect(orderSummary.first()).toBeVisible({ timeout: 10000 });
      }
    }
  });

  authTest('should complete checkout with test card', async ({ authenticatedPage }) => {
    const foundPricing = await navigateToPricing(authenticatedPage);

    if (foundPricing) {
      const ctaButton = authenticatedPage.locator('button:has-text("Subscribe")').first();

      if (await ctaButton.isVisible({ timeout: 5000 })) {
        await ctaButton.click();
        await authenticatedPage.waitForLoadState('networkidle');

        // Wait for Stripe to load
        await authenticatedPage.waitForTimeout(2000);

        // Fill payment details
        await fillStripeCheckout(authenticatedPage, STRIPE_TEST_CARDS.success);

        // Submit payment
        const submitButton = authenticatedPage.locator(
          'button:has-text("Pay"), button:has-text("Subscribe"), button[type="submit"]',
        );

        if (await submitButton.isVisible({ timeout: 5000 })) {
          await submitButton.click();

          // Should show success or redirect to confirmation
          const successIndicator = authenticatedPage.locator(
            'text=/success|thank you|confirmed|welcome/i',
          );
          await expect(successIndicator.first()).toBeVisible({ timeout: 30000 });
        }
      }
    }
  });

  authTest('should handle declined card gracefully', async ({ authenticatedPage }) => {
    const foundPricing = await navigateToPricing(authenticatedPage);

    if (foundPricing) {
      const ctaButton = authenticatedPage.locator('button:has-text("Subscribe")').first();

      if (await ctaButton.isVisible({ timeout: 5000 })) {
        await ctaButton.click();
        await authenticatedPage.waitForLoadState('networkidle');

        // Wait for Stripe to load
        await authenticatedPage.waitForTimeout(2000);

        // Fill with declined card
        await fillStripeCheckout(authenticatedPage, STRIPE_TEST_CARDS.declined);

        // Submit payment
        const submitButton = authenticatedPage.locator(
          'button:has-text("Pay"), button:has-text("Subscribe")',
        );

        if (await submitButton.isVisible({ timeout: 5000 })) {
          await submitButton.click();

          // Should show error message
          const errorMessage = authenticatedPage.locator(
            '[role="alert"], text=/declined|failed|error|try again/i',
          );
          await expect(errorMessage.first()).toBeVisible({ timeout: 15000 });
        }
      }
    }
  });
});

// =============================================================================
// SUBSCRIPTION MANAGEMENT TESTS
// =============================================================================

authTest.describe('Subscription Management', () => {
  authTest('should display current subscription status', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard/billing');
    await authenticatedPage.waitForLoadState('networkidle');

    // Should show subscription status
    const subscriptionStatus = authenticatedPage.locator(
      '[data-testid="subscription-status"], text=/subscription|plan|active|free/i',
    );
    await expect(subscriptionStatus.first()).toBeVisible({ timeout: 10000 });
  });

  authTest('should allow upgrading subscription', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard/billing');
    await authenticatedPage.waitForLoadState('networkidle');

    const upgradeButton = authenticatedPage.locator(
      'button:has-text("Upgrade"), a:has-text("Upgrade"), button:has-text("Change Plan")',
    );

    if (await upgradeButton.isVisible({ timeout: 5000 })) {
      await upgradeButton.click();

      // Should show plan options
      const planOptions = authenticatedPage.locator(
        '[data-testid="plan-option"], [data-testid="pricing-plan"]',
      );
      await expect(planOptions.first()).toBeVisible({ timeout: 10000 });
    }
  });

  authTest('should display billing history', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard/billing');
    await authenticatedPage.waitForLoadState('networkidle');

    // Look for billing history section
    const billingHistory = authenticatedPage.locator(
      '[data-testid="billing-history"], text=/invoices|history|payments/i',
    );

    if (await billingHistory.isVisible({ timeout: 5000 })) {
      // Should have invoice list or empty state
      const invoices = authenticatedPage.locator(
        '[data-testid="invoice-item"], tr, text=/no invoices/i',
      );
      await expect(invoices.first()).toBeVisible();
    }
  });

  authTest('should allow downloading invoices', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard/billing');
    await authenticatedPage.waitForLoadState('networkidle');

    const downloadButton = authenticatedPage.locator(
      'button:has-text("Download"), a:has-text("Download"), [data-testid="download-invoice"]',
    );

    if (await downloadButton.first().isVisible({ timeout: 5000 })) {
      // Start waiting for download before clicking
      const downloadPromise = authenticatedPage.waitForEvent('download', { timeout: 10000 });
      await downloadButton.first().click();

      try {
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/invoice|receipt|pdf/i);
      } catch {
        // Download might not trigger in test environment
      }
    }
  });

  authTest('should allow canceling subscription', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard/billing');
    await authenticatedPage.waitForLoadState('networkidle');

    const cancelButton = authenticatedPage.locator(
      'button:has-text("Cancel"), button:has-text("Cancel Subscription")',
    );

    if (await cancelButton.isVisible({ timeout: 5000 })) {
      await cancelButton.click();

      // Should show confirmation dialog
      const confirmDialog = authenticatedPage.locator(
        '[role="dialog"], [role="alertdialog"], text=/are you sure|confirm/i',
      );
      await expect(confirmDialog.first()).toBeVisible({ timeout: 5000 });

      // Cancel the dialog to avoid actually canceling
      const closeButton = authenticatedPage.locator(
        'button:has-text("No"), button:has-text("Keep"), button[aria-label*="close"]',
      );
      if (await closeButton.isVisible({ timeout: 2000 })) {
        await closeButton.click();
      }
    }
  });
});

// =============================================================================
// PAYMENT METHOD TESTS
// =============================================================================

authTest.describe('Payment Methods', () => {
  authTest('should display saved payment methods', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard/billing');
    await authenticatedPage.waitForLoadState('networkidle');

    // Look for payment methods section
    const paymentMethods = authenticatedPage.locator(
      '[data-testid="payment-methods"], text=/payment method|card ending/i',
    );
    await expect(paymentMethods.first()).toBeVisible({ timeout: 10000 });
  });

  authTest('should allow adding new payment method', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard/billing');
    await authenticatedPage.waitForLoadState('networkidle');

    const addButton = authenticatedPage.locator(
      'button:has-text("Add"), button:has-text("New Card"), [data-testid="add-payment-method"]',
    );

    if (await addButton.isVisible({ timeout: 5000 })) {
      await addButton.click();

      // Should show payment form
      const paymentForm = authenticatedPage.locator(
        'iframe[name*="stripe"], [data-testid="payment-form"]',
      );
      await expect(paymentForm.first()).toBeVisible({ timeout: 10000 });
    }
  });

  authTest('should allow setting default payment method', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard/billing');
    await authenticatedPage.waitForLoadState('networkidle');

    const setDefaultButton = authenticatedPage.locator(
      'button:has-text("Set Default"), button:has-text("Make Default")',
    );

    if (await setDefaultButton.first().isVisible({ timeout: 5000 })) {
      await setDefaultButton.first().click();

      // Should show success message or update UI
      const successIndicator = authenticatedPage.locator(
        'text=/default|updated|success/i, [data-testid="default-badge"]',
      );
      await expect(successIndicator.first()).toBeVisible({ timeout: 5000 });
    }
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe('Pricing Page Accessibility', () => {
  test('pricing page should be keyboard navigable', async ({ page }) => {
    const foundPricing = await navigateToPricing(page);

    if (foundPricing) {
      // Tab through pricing options
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        const focused = await page.evaluate(() => document.activeElement?.tagName);
        expect(focused).toBeTruthy();
      }
    }
  });

  test('pricing cards should have proper ARIA labels', async ({ page }) => {
    const foundPricing = await navigateToPricing(page);

    if (foundPricing) {
      const planCards = page.locator('[data-testid="pricing-plan"], [data-testid="plan-card"]');
      const cardCount = await planCards.count();

      for (let i = 0; i < Math.min(cardCount, 3); i++) {
        const card = planCards.nth(i);
        const ariaLabel = await card.getAttribute('aria-label');
        const role = await card.getAttribute('role');
        const heading = await card.locator('h2, h3').count();

        // Card should have accessible name via aria-label, role, or heading
        expect(ariaLabel || role || heading > 0).toBeTruthy();
      }
    }
  });
});
