import { colors } from './design-tokens';

// =============================================================================
// BRAND COLORS - Re-export from design-tokens for convenience
// =============================================================================

export const brand = {
  colors: {
    // Backgrounds
    pageBg: colors.lxd.darkPage, // #0F172A
    cardBg: colors.lxd.cardBg, // #00438f
    shimmerBorder: colors.lxd.shimmerBorder, // #550278

    // Accents
    accentPurple: colors.lxd.purple, // #BA23FB
    accentBlue: colors.lxd.blueLight, // #479DFF

    // Primary/Secondary
    primary: colors.brand.primary, // #0056B8
    primaryHover: colors.brand.primaryHover, // #004494
    secondary: colors.brand.secondary, // #BA23FB
    secondaryHover: colors.brand.secondaryHover, // #9B1DD4

    // WCAG 2.2 AA Compliant Text (on dark backgrounds)
    text: {
      white: colors.text.lxdDark.heading, // #FFFFFF
      primary: colors.text.dark.primary, // #F5F5F5
      body: colors.text.lxdDark.body, // #E0E0E0
      secondary: colors.text.lxdDark.muted, // #D6D6D6
      muted: '#B8B8B8', // For backwards compat
    },
  },
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type BrandColors = typeof brand.colors;
export type TextColors = typeof brand.colors.text;

// =============================================================================
// CSS CUSTOM PROPERTIES STRING
// Note: These are already defined in globals.css - this is for reference only
// =============================================================================

export const brandCSSVars = `
  /* Brand colors - already defined in globals.css */
  --brand-page-bg: ${colors.lxd.darkPage};
  --brand-card-bg: ${colors.lxd.cardBg};
  --brand-shimmer: ${colors.lxd.shimmerBorder};
  --brand-accent-purple: ${colors.lxd.purple};
  --brand-accent-blue: ${colors.lxd.blueLight};
  --brand-text-white: ${colors.text.lxdDark.heading};
  --brand-text-primary: ${colors.text.dark.primary};
  --brand-text-body: ${colors.text.lxdDark.body};
  --brand-text-secondary: ${colors.text.lxdDark.secondary};
  --brand-text-muted: ${colors.text.lxdDark.muted};
`;

// =============================================================================
// STYLE OBJECTS (for inline React styles)
// =============================================================================

export const brandStyles = {
  pageBg: { backgroundColor: brand.colors.pageBg },
  cardBg: { backgroundColor: brand.colors.cardBg },
  shimmerBorder: { backgroundColor: brand.colors.shimmerBorder },
  heading: { color: brand.colors.text.white },
  body: { color: brand.colors.text.body },
  secondary: { color: brand.colors.text.secondary },
  muted: { color: brand.colors.text.muted },
} as const;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get a brand color by name with optional opacity
 * Usage: getBrandColor('primary', 0.5) => 'rgba(0, 86, 184, 0.5)'
 */
export function getBrandColor(colorName: keyof typeof brand.colors, opacity?: number): string {
  const colorValue = brand.colors[colorName];

  if (typeof colorValue === 'object') {
    return colorValue.white; // Default to white for text object
  }

  if (opacity !== undefined && typeof colorValue === 'string') {
    // Convert hex to rgba
    const hex = colorValue.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  return colorValue;
}

/**
 * Get CSS variable reference for use in className
 * Usage: getCssVar('brand-primary') => 'var(--brand-primary)'
 */
export function getCssVar(varName: string): string {
  return `var(--${varName})`;
}
