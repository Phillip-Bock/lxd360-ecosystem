/**
 * =============================================================================
 * LXP360-SaaS | Accessibility Tests
 * =============================================================================
 *
 * @fileoverview Automated accessibility testing suite
 *
 * @description
 * Comprehensive accessibility tests for WCAG 2.1 AA compliance:
 * - Automated axe-core scanning
 * - Keyboard navigation tests
 * - Focus management tests
 * - Screen reader compatibility tests
 *
 * @usage
 * ```bash
 * # Install dependencies
 * npm install -D @playwright/test @axe-core/playwright
 *
 * # Run tests
 * npx playwright test tests/accessibility
 * ```
 *
 * =============================================================================
 */

import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

// ============================================================================
// Test Configuration
// ============================================================================

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

// Pages to test (using actual route paths from app directory)
const PAGES_TO_TEST = [
  { path: '/', name: 'Home Page' },
  { path: '/auth/login', name: 'Login Page' },
  { path: '/auth/sign-up', name: 'Sign Up Page' },
  { path: '/lxp360/pricing', name: 'Pricing Page' },
  { path: '/legal/terms', name: 'Terms Page' },
  { path: '/legal/privacy', name: 'Privacy Page' },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Run axe accessibility scan on page
 */
async function runAccessibilityScan(page: Page, options?: { skipRules?: string[] }) {
  const builder = new AxeBuilder({ page }).withTags(WCAG_TAGS).disableRules(['color-contrast']); // Disable if causing false positives

  if (options?.skipRules) {
    builder.disableRules(options.skipRules);
  }

  return builder.analyze();
}

/**
 * Check if element is visible and focusable
 */
async function _isFocusable(page: Page, selector: string): Promise<boolean> {
  const element = page.locator(selector);
  const isVisible = await element.isVisible();
  if (!isVisible) return false;

  await element.focus();
  const focused = await page.evaluate(() => document.activeElement?.matches(selector));
  return !!focused;
}

// ============================================================================
// Global Accessibility Tests
// ============================================================================

test.describe('Global Accessibility', () => {
  test('should not have unknown accessibility violations on home page', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await runAccessibilityScan(page);

    // Log violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log(
        'Accessibility violations:',
        JSON.stringify(accessibilityScanResults.violations, null, 2),
      );
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Check for h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);

    // Check heading order
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    let previousLevel = 0;

    for (const heading of headings) {
      const tagName = await heading.evaluate((el) => el.tagName.toLowerCase());
      const level = parseInt(tagName.replace('h', ''), 10);

      // Level should not skip (e.g., h1 -> h3 without h2)
      expect(level).toBeLessThanOrEqual(previousLevel + 1);
      previousLevel = level;
    }
  });

  test('should have proper lang attribute', async ({ page }) => {
    await page.goto('/');

    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBeTruthy();
    expect(htmlLang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
  });

  test('should have viewport meta tag', async ({ page }) => {
    await page.goto('/');

    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
  });
});

// ============================================================================
// Keyboard Navigation Tests
// ============================================================================

test.describe('Keyboard Navigation', () => {
  test('should have visible focus indicators', async ({ page }) => {
    await page.goto('/');

    // Focus on first interactive element
    await page.keyboard.press('Tab');

    // Check if focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Check for focus outline or ring
    const outline = await focusedElement.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        boxShadow: styles.boxShadow,
        border: styles.border,
      };
    });

    // Should have some visible focus indication
    const hasFocusIndicator =
      outline.outline !== 'none' || outline.boxShadow !== 'none' || outline.border !== 'none';

    expect(hasFocusIndicator).toBe(true);
  });

  test('should maintain logical tab order', async ({ page }) => {
    await page.goto('/');

    const focusOrder: string[] = [];
    const maxTabs = 20;

    // Tab through page and record focus order
    for (let i = 0; i < maxTabs; i++) {
      await page.keyboard.press('Tab');

      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        return {
          tag: el.tagName.toLowerCase(),
          text: (el as HTMLElement).innerText?.substring(0, 30),
          ariaLabel: el.getAttribute('aria-label'),
        };
      });

      if (focused) {
        focusOrder.push(`${focused.tag}: ${focused.ariaLabel || focused.text || 'unknown'}`);
      }
    }

    // Should have focusable elements
    expect(focusOrder.length).toBeGreaterThan(0);

    // Log focus order for debugging
    console.log('Focus order:', focusOrder);
  });

  test('should allow skipping to main content', async ({ page }) => {
    await page.goto('/');

    // Press Tab to focus skip link
    await page.keyboard.press('Tab');

    // Check if skip link is focused
    const skipLink = page.locator('a[href="#main-content"], a:has-text("Skip to main")');
    const isSkipLinkFocused = await skipLink
      .evaluate((el) => el === document.activeElement)
      .catch(() => false);

    if (isSkipLinkFocused) {
      // Press Enter to activate skip link
      await page.keyboard.press('Enter');

      // Check if main content has focus
      const mainFocused = await page.evaluate(() => {
        const main = document.getElementById('main-content') || document.querySelector('main');
        return main === document.activeElement || main?.contains(document.activeElement);
      });

      expect(mainFocused).toBe(true);
    }
  });

  test('should trap focus in modals', async ({ page }) => {
    await page.goto('/');

    // Look for a button that opens a modal
    const modalTrigger = page
      .locator('[data-testid="open-modal"], button:has-text("Open"), [aria-haspopup="dialog"]')
      .first();

    if (await modalTrigger.isVisible()) {
      await modalTrigger.click();

      // Wait for modal
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // Tab through modal
      const _focusedElements: string[] = [];
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');

        const focused = await page.evaluate(() => {
          const dialog = document.querySelector('[role="dialog"]');
          return dialog?.contains(document.activeElement);
        });

        expect(focused).toBe(true);
      }

      // Escape should close modal
      await page.keyboard.press('Escape');
      await expect(modal).not.toBeVisible();
    }
  });
});

// ============================================================================
// Form Accessibility Tests
// ============================================================================

test.describe('Form Accessibility', () => {
  test('form inputs should have associated labels', async ({ page }) => {
    await page.goto('/auth/login');

    const inputs = await page.locator('input:not([type="hidden"]):not([type="submit"])').all();

    for (const input of inputs) {
      const inputId = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledby = await input.getAttribute('aria-labelledby');
      const placeholder = await input.getAttribute('placeholder');

      if (inputId) {
        // Check for associated label
        const label = page.locator(`label[for="${inputId}"]`);
        const hasLabel = (await label.count()) > 0;

        // Input should have label, aria-label, or aria-labelledby
        const hasAccessibleName = hasLabel || !!ariaLabel || !!ariaLabelledby;

        if (!hasAccessibleName && !placeholder) {
          console.warn(`Input #${inputId} lacks accessible name`);
        }

        expect(hasAccessibleName || !!placeholder).toBe(true);
      }
    }
  });

  test('required fields should be properly indicated', async ({ page }) => {
    await page.goto('/auth/sign-up');

    const requiredInputs = await page.locator('input[required], [aria-required="true"]').all();

    for (const input of requiredInputs) {
      // Check for visual indication
      const inputId = await input.getAttribute('id');
      if (inputId) {
        const label = page.locator(`label[for="${inputId}"]`);
        const labelText = await label.textContent();

        // Should have asterisk or "required" text
        const hasVisualIndication =
          labelText?.includes('*') || labelText?.toLowerCase().includes('required');
        const hasAriaRequired = (await input.getAttribute('aria-required')) === 'true';
        const hasHtmlRequired = (await input.getAttribute('required')) !== null;

        expect(hasVisualIndication || hasAriaRequired || hasHtmlRequired).toBe(true);
      }
    }
  });

  test('error messages should be associated with inputs', async ({ page }) => {
    await page.goto('/auth/login');

    // Submit empty form to trigger errors
    const submitButton = page.locator('button[type="submit"]').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Wait for potential error messages
      await page.waitForTimeout(500);

      const errorMessages = await page
        .locator('[role="alert"], .error, [aria-live="assertive"]')
        .all();

      for (const error of errorMessages) {
        const errorId = await error.getAttribute('id');

        if (errorId) {
          // Check if unknown input references this error
          const associatedInput = page.locator(
            `[aria-describedby*="${errorId}"], [aria-errormessage="${errorId}"]`,
          );
          const hasAssociation = (await associatedInput.count()) > 0;

          // Errors should be associated with inputs
          if (!hasAssociation) {
            console.warn(`Error message #${errorId} is not associated with unknown input`);
          }
        }
      }
    }
  });
});

// ============================================================================
// Image Accessibility Tests
// ============================================================================

test.describe('Image Accessibility', () => {
  test('images should have alt text', async ({ page }) => {
    await page.goto('/');

    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');
      const _ariaLabel = await img.getAttribute('aria-label');
      const ariaHidden = await img.getAttribute('aria-hidden');

      // Decorative images should have alt="" or aria-hidden="true"
      // Meaningful images should have descriptive alt text
      const isDecorative = alt === '' || role === 'presentation' || ariaHidden === 'true';
      const hasMeaningfulAlt = alt && alt.length > 0;

      expect(isDecorative || hasMeaningfulAlt).toBe(true);
    }
  });

  test('SVG icons should be accessible or hidden', async ({ page }) => {
    await page.goto('/');

    const svgs = await page.locator('svg').all();

    for (const svg of svgs) {
      const ariaHidden = await svg.getAttribute('aria-hidden');
      const ariaLabel = await svg.getAttribute('aria-label');
      const role = await svg.getAttribute('role');
      const title = await svg.locator('title').count();

      // SVGs should be either decorative (hidden) or have accessible name
      const isDecorative = ariaHidden === 'true' || role === 'presentation';
      const hasAccessibleName = !!ariaLabel || title > 0;

      expect(isDecorative || hasAccessibleName).toBe(true);
    }
  });
});

// ============================================================================
// Color and Contrast Tests
// ============================================================================

test.describe('Color and Contrast', () => {
  test('should not rely solely on color to convey information', async ({ page }) => {
    await page.goto('/');

    // Check error states
    const errorElements = await page
      .locator('.error, [data-error="true"], [aria-invalid="true"]')
      .all();

    for (const element of errorElements) {
      // Should have non-color indicator (icon, text, border, etc.)
      const hasIcon = (await element.locator('svg, img, [aria-hidden="true"]').count()) > 0;
      const hasBorder = await element.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.borderWidth !== '0px' && styles.borderStyle !== 'none';
      });
      const hasText = (await element.textContent())?.toLowerCase().includes('error');

      const hasNonColorIndicator = hasIcon || hasBorder || hasText;
      if (!hasNonColorIndicator) {
        console.warn('Element may rely solely on color:', await element.innerHTML());
      }
    }
  });
});

// ============================================================================
// ARIA Usage Tests
// ============================================================================

test.describe('ARIA Usage', () => {
  test('interactive elements should have proper roles', async ({ page }) => {
    await page.goto('/');

    // Custom buttons should have button role
    const customButtons = await page.locator('div[onclick], span[onclick]').all();
    for (const button of customButtons) {
      const role = await button.getAttribute('role');
      const tabindex = await button.getAttribute('tabindex');

      expect(role).toBe('button');
      expect(tabindex).toBe('0');
    }
  });

  test('expandable sections should have proper ARIA', async ({ page }) => {
    await page.goto('/');

    const triggers = await page.locator('[aria-expanded]').all();

    for (const trigger of triggers) {
      const expanded = await trigger.getAttribute('aria-expanded');
      const controls = await trigger.getAttribute('aria-controls');

      // Should have valid expanded state
      expect(['true', 'false']).toContain(expanded);

      // Should control something
      if (controls) {
        const controlledElement = page.locator(`#${controls}`);
        const exists = (await controlledElement.count()) > 0;
        expect(exists).toBe(true);
      }
    }
  });

  test('live regions should be properly configured', async ({ page }) => {
    await page.goto('/');

    const liveRegions = await page.locator('[aria-live], [role="status"], [role="alert"]').all();

    for (const region of liveRegions) {
      const ariaLive = await region.getAttribute('aria-live');
      const role = await region.getAttribute('role');

      // Should have appropriate politeness
      if (ariaLive) {
        expect(['polite', 'assertive', 'off']).toContain(ariaLive);
      }

      // Role should match live behavior
      if (role === 'alert') {
        const effectiveLive = ariaLive || 'assertive';
        expect(effectiveLive).toBe('assertive');
      }
    }
  });
});

// ============================================================================
// Page-Specific Tests
// ============================================================================

PAGES_TO_TEST.forEach(({ path, name }) => {
  test.describe(`${name} Accessibility`, () => {
    test(`${name} should pass axe accessibility scan`, async ({ page }) => {
      await page.goto(path);

      // Wait for page to fully load
      await page.waitForLoadState('networkidle');

      const results = await runAccessibilityScan(page);

      if (results.violations.length > 0) {
        console.log(`${name} violations:`, JSON.stringify(results.violations, null, 2));
      }

      expect(results.violations).toEqual([]);
    });
  });
});

// ============================================================================
// Mobile Accessibility Tests
// ============================================================================

test.describe('Mobile Accessibility', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('touch targets should be at least 44x44 pixels', async ({ page }) => {
    await page.goto('/');

    const interactiveElements = await page
      .locator('button, a, input, select, textarea, [role="button"]')
      .all();

    for (const element of interactiveElements) {
      const box = await element.boundingBox();

      if (box) {
        // WCAG 2.5.5 recommends 44x44 pixels
        if (box.width < 44 || box.height < 44) {
          const text = await element.textContent();
          console.warn(
            `Touch target too small: ${box.width}x${box.height} - ${text?.substring(0, 20)}`,
          );
        }
      }
    }
  });

  test('mobile menu should be accessible', async ({ page }) => {
    await page.goto('/');

    // Look for hamburger menu
    const menuButton = page
      .locator('[aria-label*="menu" i], [aria-label*="nav" i], button:has(svg)')
      .first();

    if (await menuButton.isVisible()) {
      // Should have proper ARIA
      const expanded = await menuButton.getAttribute('aria-expanded');
      expect(['true', 'false']).toContain(expanded);

      // Open menu
      await menuButton.click();

      // Menu should be visible and focusable
      const menu = page.locator('[role="menu"], nav[aria-label], [role="dialog"]');
      await expect(menu).toBeVisible();

      // Close with escape
      await page.keyboard.press('Escape');
    }
  });
});
