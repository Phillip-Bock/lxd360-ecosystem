/**
 * =============================================================================
 * LXP360-SaaS | WCAG 2.1 AA Compliance Tests
 * =============================================================================
 *
 * @fileoverview Automated WCAG 2.1 AA compliance tests using axe-core
 *
 * @description
 * Tests critical pages for Section 508 / WCAG 2.1 AA compliance.
 * Target: Zero critical/serious violations on all tested pages.
 *
 * Target pages:
 * - / (homepage)
 * - /pricing
 * - /auth/login
 * - /auth/signup
 * - /terms
 * - /privacy
 *
 * @usage
 * ```bash
 * npx playwright test tests/accessibility/wcag.spec.ts
 * ```
 *
 * =============================================================================
 */

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Result } from 'axe-core';

// Type for axe-core violations
type AxeViolation = Result;

// ============================================================================
// Configuration
// ============================================================================

/**
 * WCAG 2.1 AA tags to test
 */
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa'];

/**
 * Critical pages for WCAG compliance
 * Using actual route paths from app directory
 */
const TARGET_PAGES = [
  { path: '/', name: 'Homepage' },
  { path: '/lxp360/pricing', name: 'LXP360 Pricing' },
  { path: '/auth/login', name: 'Login' },
  { path: '/auth/sign-up', name: 'Sign Up' },
  { path: '/legal/terms', name: 'Terms' },
  { path: '/legal/privacy', name: 'Privacy' },
];

/**
 * Impact levels considered failures
 */
const FAILURE_IMPACTS = ['critical', 'serious'];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format violations for readable output
 */
function formatViolations(violations: Result[]): string {
  return violations
    .map((v) => {
      const nodeInfo = v.nodes
        .slice(0, 3) // Show max 3 nodes
        .map((n) => `    - ${n.html.substring(0, 80)}...`)
        .join('\n');
      return `[${v.impact?.toUpperCase() ?? 'UNKNOWN'}] ${v.id}: ${v.description}\n${nodeInfo}`;
    })
    .join('\n\n');
}

// ============================================================================
// WCAG 2.1 AA Tests
// ============================================================================

test.describe('WCAG 2.1 AA Compliance', () => {
  // Configure tests to not require auth
  test.use({ storageState: { cookies: [], origins: [] } });

  for (const { path, name } of TARGET_PAGES) {
    test(`${name} (${path}) should have no WCAG 2.1 AA violations`, async ({ page }) => {
      // Navigate to page
      const response = await page.goto(path, { waitUntil: 'networkidle' });

      // Skip if page doesn't exist
      if (response?.status() === 404) {
        test.skip(true, `Page ${path} not found (404)`);
        return;
      }

      // Wait for content to be fully rendered
      await page.waitForLoadState('domcontentloaded');

      // Run axe-core accessibility scan
      const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

      // Filter for critical and serious violations only
      const criticalViolations = results.violations.filter((v: AxeViolation) =>
        FAILURE_IMPACTS.includes(v.impact || ''),
      );

      // Log all violations for debugging (including minor ones)
      if (results.violations.length > 0) {
        console.log(`\n[${name}] All violations found:`);
        console.log(formatViolations(results.violations));
      }

      // Test assertion - only fail on critical/serious
      expect(
        criticalViolations,
        `${name} has ${criticalViolations.length} critical/serious WCAG 2.1 AA violations:\n${formatViolations(criticalViolations)}`,
      ).toHaveLength(0);
    });
  }
});

// ============================================================================
// Page-Specific Tests
// ============================================================================

test.describe('Page-Specific Accessibility Requirements', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Homepage should have exactly one h1 heading', async ({ page }) => {
    await page.goto('/');
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('Homepage should have proper document title', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('Homepage should have lang attribute', async ({ page }) => {
    await page.goto('/');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
    expect(lang).toMatch(/^[a-z]{2}/);
  });

  test('Login form inputs should have associated labels', async ({ page }) => {
    const response = await page.goto('/auth/login');
    if (response?.status() === 404) {
      test.skip(true, 'Login page not found');
      return;
    }

    const inputs = await page.locator('input[type="email"], input[type="password"]').all();

    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');

      // Input should have either label, aria-label, or aria-labelledby
      let hasLabel = false;
      if (id) {
        hasLabel = (await page.locator(`label[for="${id}"]`).count()) > 0;
      }

      const hasAccessibleName = hasLabel || !!ariaLabel || !!ariaLabelledBy;
      expect(hasAccessibleName, `Input ${id || 'unknown'} should have accessible name`).toBe(true);
    }
  });

  test('Signup form inputs should have associated labels', async ({ page }) => {
    const response = await page.goto('/auth/sign-up');
    if (response?.status() === 404) {
      test.skip(true, 'Signup page not found');
      return;
    }

    const inputs = await page.locator('input:not([type="hidden"]):not([type="submit"])').all();

    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');

      let hasLabel = false;
      if (id) {
        hasLabel = (await page.locator(`label[for="${id}"]`).count()) > 0;
      }

      const hasAccessibleName = hasLabel || !!ariaLabel || !!ariaLabelledBy;
      expect(hasAccessibleName, `Input ${id || 'unknown'} should have accessible name`).toBe(true);
    }
  });

  test('Images should have alt attributes', async ({ page }) => {
    await page.goto('/');
    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const ariaHidden = await img.getAttribute('aria-hidden');
      const role = await img.getAttribute('role');

      // Image should have alt (can be empty for decorative) or be explicitly hidden
      const hasAlt = alt !== null;
      const isHidden = ariaHidden === 'true' || role === 'presentation';

      expect(hasAlt || isHidden, 'Image should have alt attribute or be explicitly hidden').toBe(
        true,
      );
    }
  });

  test('Interactive elements should be keyboard accessible', async ({ page }) => {
    await page.goto('/');

    // Tab to first interactive element
    await page.keyboard.press('Tab');

    // Should have visible focus
    const focusedElement = page.locator(':focus');
    const isVisible = await focusedElement.isVisible().catch(() => false);

    expect(isVisible).toBe(true);
  });

  test('Links should have discernible text', async ({ page }) => {
    await page.goto('/');
    const links = await page.locator('a').all();

    for (const link of links) {
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const ariaLabelledBy = await link.getAttribute('aria-labelledby');
      const title = await link.getAttribute('title');

      // Link should have text content or accessible name
      const hasText = text && text.trim().length > 0;
      const hasAccessibleName = !!ariaLabel || !!ariaLabelledBy || !!title;

      // Also check for child elements with accessible names
      const hasChildContent =
        (await link.locator('img[alt], svg[aria-label], [aria-hidden="false"]').count()) > 0;

      expect(
        hasText || hasAccessibleName || hasChildContent,
        `Link should have discernible text: ${await link.getAttribute('href')}`,
      ).toBe(true);
    }
  });
});

// ============================================================================
// Color Contrast Tests
// ============================================================================

test.describe('Color Contrast', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Homepage should meet color contrast requirements', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();

    // Filter for failures only (not "incomplete" which are uncertain)
    const failures = results.violations.filter((v: AxeViolation) => v.id === 'color-contrast');

    // Log details for debugging
    if (failures.length > 0) {
      console.log('\nColor contrast failures:');
      console.log(formatViolations(failures));
    }

    expect(failures).toHaveLength(0);
  });
});

// ============================================================================
// Mobile Accessibility Tests
// ============================================================================

test.describe('Mobile Accessibility', () => {
  test.use({
    viewport: { width: 375, height: 667 },
    storageState: { cookies: [], origins: [] },
  });

  test('Mobile homepage should have no WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

    const criticalViolations = results.violations.filter((v: AxeViolation) =>
      FAILURE_IMPACTS.includes(v.impact || ''),
    );

    expect(criticalViolations).toHaveLength(0);
  });

  test('Touch targets should be adequately sized', async ({ page }) => {
    await page.goto('/');

    const buttons = await page.locator('button, a, [role="button"]').all();
    const smallTargets: string[] = [];

    for (const button of buttons.slice(0, 20)) {
      // Check first 20
      const box = await button.boundingBox();
      if (box && (box.width < 44 || box.height < 44)) {
        const text = await button.textContent();
        smallTargets.push(`${text?.substring(0, 20)}: ${box.width}x${box.height}`);
      }
    }

    // Log warnings but don't fail (WCAG 2.5.5 is AAA, not AA)
    if (smallTargets.length > 0) {
      console.log('\nSmall touch targets (< 44x44px):');
      for (const t of smallTargets) {
        console.log(`  - ${t}`);
      }
    }
  });
});
