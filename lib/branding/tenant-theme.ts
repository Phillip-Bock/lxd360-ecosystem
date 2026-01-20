import type { Tenant } from '@/types/domain';
import { colors } from '../design-tokens';

// =============================================================================
// DEFAULT COLORS (from design-tokens → globals.css)
// =============================================================================

const DEFAULTS = {
  primary: colors.brand.primary, // #0056B8
  secondary: '#0184CB', // Accessible secondary
  darkBackground: colors.lxd.blueDark700, // #001D3D
  lightBackground: colors.white, // #FFFFFF
} as const;

// =============================================================================
// WCAG CONTRAST HELPERS
// =============================================================================

/**
 * Convert hex to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace('#', '');
  const bigint = parseInt(
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized,
    16,
  );
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

/**
 * Calculate relative luminance per WCAG 2.1
 */
function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const srgb = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

/**
 * Calculate contrast ratio between two colors
 */
function contrastRatio(colorA: string, colorB: string): number {
  const L1 = relativeLuminance(colorA);
  const L2 = relativeLuminance(colorB);
  const light = Math.max(L1, L2);
  const dark = Math.min(L1, L2);
  return (light + 0.05) / (dark + 0.05);
}

// =============================================================================
// ACCESSIBLE COLOR VALIDATION
// =============================================================================

/**
 * Ensure tenant primary/secondary colors meet WCAG AA (4.5:1) contrast
 * against both light and dark backgrounds. Falls back to safe defaults
 * if colors don't pass accessibility checks.
 */
export function getAccessibleTenantColors(
  primary: string,
  secondary: string,
  options: {
    darkBackground?: string;
    lightBackground?: string;
    fallbackPrimary?: string;
    fallbackSecondary?: string;
  } = {},
): { primary: string; secondary: string } {
  const {
    darkBackground = DEFAULTS.darkBackground,
    lightBackground = DEFAULTS.lightBackground,
    fallbackPrimary = DEFAULTS.primary,
    fallbackSecondary = DEFAULTS.secondary,
  } = options;

  const p = primary.trim() || fallbackPrimary;
  const s = secondary.trim() || fallbackSecondary;

  // Check if colors meet WCAG AA (4.5:1) against both backgrounds
  const primaryOk =
    contrastRatio(p, darkBackground) >= 4.5 && contrastRatio(p, lightBackground) >= 4.5;
  const secondaryOk =
    contrastRatio(s, darkBackground) >= 4.5 && contrastRatio(s, lightBackground) >= 4.5;

  return {
    primary: primaryOk ? p : fallbackPrimary,
    secondary: secondaryOk ? s : fallbackSecondary,
  };
}

// =============================================================================
// THEME APPLICATION
// =============================================================================

/**
 * Apply tenant branding to CSS custom properties.
 * Preserves WCAG 2.2 AA contrast by validating colors before applying.
 *
 * Call this in a client layout (e.g. dashboard) once tenant data is available.
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   if (tenant) {
 *     applyTenantTheme(tenant);
 *   }
 * }, [tenant]);
 * ```
 */
export function applyTenantTheme(tenant?: Tenant | null): void {
  if (typeof document === 'undefined' || !tenant) return;

  const root = document.documentElement;

  // Get current values (from globals.css) as fallbacks
  const currentPrimary =
    getComputedStyle(root).getPropertyValue('--brand-primary').trim() || DEFAULTS.primary;
  const currentSecondary =
    getComputedStyle(root).getPropertyValue('--brand-secondary').trim() || DEFAULTS.secondary;

  // Use tenant colors if provided, otherwise keep current
  const rawPrimary = tenant.primary_color || currentPrimary;
  const rawSecondary = tenant.secondary_color || currentSecondary;

  // Validate accessibility
  const { primary, secondary } = getAccessibleTenantColors(rawPrimary, rawSecondary);

  // Apply to CSS variables (defined in globals.css)
  root.style.setProperty('--brand-primary', primary);
  root.style.setProperty('--brand-secondary', secondary);

  // Sidebar colors follow primary for quick white-labeling
  root.style.setProperty('--sidebar-primary', primary);
  root.style.setProperty('--sidebar-primary-foreground', colors.white);

  // Also update the legacy HSL-based --primary if needed
  root.style.setProperty('--primary', primary);
  root.style.setProperty('--secondary', secondary);
}

/**
 * Reset tenant theme to defaults (from globals.css)
 */
export function resetTenantTheme(): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Remove inline styles to fall back to globals.css values
  root.style.removeProperty('--brand-primary');
  root.style.removeProperty('--brand-secondary');
  root.style.removeProperty('--sidebar-primary');
  root.style.removeProperty('--sidebar-primary-foreground');
  root.style.removeProperty('--primary');
  root.style.removeProperty('--secondary');
}

/**
 * Get contrast ratio for a color against a background
 * Useful for dynamically choosing text colors
 */
export function getContrastRatio(foreground: string, background: string): number {
  return contrastRatio(foreground, background);
}

/**
 * Determine if text should be light or dark on a given background
 * Returns 'light' if background is dark, 'dark' if background is light
 */
export function getTextColorForBackground(background: string): 'light' | 'dark' {
  const luminance = relativeLuminance(background);
  return luminance > 0.179 ? 'dark' : 'light';
}
