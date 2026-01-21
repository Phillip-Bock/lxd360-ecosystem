/**
 * Design Tokens - BRIDGE TO globals.css
 *
 * This file provides TypeScript constants that MIRROR the CSS variables in
 * app/globals.css. The HEX values here must match globals.css exactly.
 *
 * IMPORTANT: globals.css is the SINGLE SOURCE OF TRUTH
 * If you need to change a color, change it in globals.css first,
 * then update this file to match.
 *
 * For CSS/Tailwind: Use CSS variables directly (var(--brand-primary))
 * For JS/React inline styles: Import from this file
 *
 * @usage
 *   // For CSS variables in className (preferred):
 *   className="bg-(--brand-primary) text-(--text-primary)"
 *
 *   // For inline styles in JS/React:
 *   import { tokens } from '@/lib/design-tokens';
 *   style={{ backgroundColor: tokens.colors.brand.primary }}
 *
 * =============================================================================
 */

// =============================================================================
// CSS VARIABLE NAMES (for use in className with var())
// =============================================================================

/**
 * CSS Variable references for use in Tailwind arbitrary values
 * Usage: className="bg-(--brand-primary)"
 */
export const cssVars = {
  // Brand colors
  brandPrimary: 'var(--brand-primary)',
  brandPrimaryHover: 'var(--brand-primary-hover)',
  brandPrimaryActive: 'var(--brand-primary-active)',
  brandPrimaryMuted: 'var(--brand-primary-muted)',
  brandSecondary: 'var(--brand-secondary)',
  brandSecondaryHover: 'var(--brand-secondary-hover)',
  brandSecondaryActive: 'var(--brand-secondary-active)',
  brandSecondaryMuted: 'var(--brand-secondary-muted)',
  brandAccent: 'var(--brand-accent)',
  brandAccentHover: 'var(--brand-accent-hover)',
  brandAccentMuted: 'var(--brand-accent-muted)',

  // Semantic colors
  colorSuccess: 'var(--color-success)',
  colorSuccessBg: 'var(--color-success-bg)',
  colorSuccessBorder: 'var(--color-success-border)',
  colorWarning: 'var(--color-warning)',
  colorWarningBg: 'var(--color-warning-bg)',
  colorWarningBorder: 'var(--color-warning-border)',
  colorError: 'var(--color-error)',
  colorErrorBg: 'var(--color-error-bg)',
  colorErrorBorder: 'var(--color-error-border)',
  colorInfo: 'var(--color-info)',
  colorInfoBg: 'var(--color-info-bg)',
  colorInfoBorder: 'var(--color-info-border)',

  // Surface colors
  surfacePage: 'var(--surface-page)',
  surfaceCard: 'var(--surface-card)',
  surfaceCardHover: 'var(--surface-card-hover)',
  surfaceSidebar: 'var(--surface-sidebar)',
  surfaceSidebarHover: 'var(--surface-sidebar-hover)',
  surfaceSidebarActive: 'var(--surface-sidebar-active)',
  surfaceHeader: 'var(--surface-header)',
  surfaceFooter: 'var(--surface-footer)',
  surfacePopover: 'var(--surface-popover)',
  surfaceInput: 'var(--surface-input)',
  surfaceInputDisabled: 'var(--surface-input-disabled)',

  // Text colors
  textPrimary: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  textTertiary: 'var(--text-tertiary)',
  textMuted: 'var(--text-muted)',
  textInverse: 'var(--text-inverse)',
  textLink: 'var(--text-link)',
  textLinkHover: 'var(--text-link-hover)',

  // Border colors
  borderDefault: 'var(--border-default)',
  borderStrong: 'var(--border-strong)',
  borderSubtle: 'var(--border-subtle)',
  borderFocus: 'var(--border-focus)',
  borderInput: 'var(--border-input)',
  borderInputHover: 'var(--border-input-hover)',
  borderInputFocus: 'var(--border-input-focus)',
  borderInputError: 'var(--border-input-error)',

  // Shadows
  shadowSm: 'var(--shadow-sm)',
  shadowMd: 'var(--shadow-md)',
  shadowLg: 'var(--shadow-lg)',
  shadowXl: 'var(--shadow-xl)',
  shadowPrimary: 'var(--shadow-primary)',
  shadowSecondary: 'var(--shadow-secondary)',
} as const;

// =============================================================================
// HEX VALUES (for inline JS/React styles)
// These MUST match the values in app/globals.css
// =============================================================================

export const colors = {
  // ═══════════════════════════════════════════════════════════════════════════
  // BRAND COLORS
  // ═══════════════════════════════════════════════════════════════════════════
  brand: {
    // Primary (LXD Blue)
    primary: '#0056B8',
    primaryHover: '#004494',
    primaryActive: '#003570',
    primaryMuted: '#E6F0FA',

    // Secondary (LXD Purple)
    secondary: '#BA23FB',
    secondaryHover: '#9B1DD4',
    secondaryActive: '#7D17AB',
    secondaryMuted: '#F8E8FE',

    // Accent (Teal/Green)
    accent: '#10B981',
    accentHover: '#0D9668',
    accentMuted: '#E6F7F2',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LXD BRAND SPECIFIC (from @theme in globals.css)
  // ═══════════════════════════════════════════════════════════════════════════
  lxd: {
    // Primary Blues
    blue: '#0056B8',
    blueLight: '#479DFF',
    blueDark: '#004494',
    blueBright: '#00D4FF',

    // Accent Purples
    purple: '#BA23FB',
    purpleDark: '#43025F',
    purpleLight: '#D580FF',

    // Dark Theme Backgrounds
    darkPage: '#0F172A',
    darkCard: '#0056B8',
    darkSurface: '#1E293B',
    darkBorder: '#43025F',

    // Light Theme Backgrounds
    lightPage: '#F5F5F5',
    lightCard: '#EBF8FF',
    lightSurface: '#479DFF',
    lightBorder: '#BA23FB',

    // Card-specific
    cardBg: '#00438f',
    shimmerBorder: '#550278',
    accentBlue: '#479DFF',
    accentPurple: '#BA23FB',

    // Blue dark scale (for gradients)
    blueDark600: '#002D5F',
    blueDark700: '#001D3D',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SEMANTIC COLORS
  // ═══════════════════════════════════════════════════════════════════════════
  semantic: {
    success: '#22C55E',
    successBg: '#F0FDF4',
    successBorder: '#86EFAC',
    successDark: '#059669',

    warning: '#F59E0B',
    warningBg: '#FFFBEB',
    warningBorder: '#FCD34D',
    warningDark: '#D97706',

    error: '#EF4444',
    errorBg: '#FEF2F2',
    errorBorder: '#FCA5A5',
    errorDark: '#B91C1C',

    info: '#3B82F6',
    infoBg: '#EFF6FF',
    infoBorder: '#93C5FD',
    infoDark: '#1D4ED8',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SURFACE COLORS - LIGHT MODE (default in globals.css :root)
  // ═══════════════════════════════════════════════════════════════════════════
  surface: {
    light: {
      page: '#F5F5F5',
      card: '#FFFFFF',
      cardHover: '#FAFAFA',
      sidebar: '#FFFFFF',
      sidebarHover: '#F5F5F5',
      sidebarActive: '#E6F0FA',
      header: '#FFFFFF',
      footer: '#FFFFFF',
      popover: '#FFFFFF',
      input: '#FFFFFF',
      inputDisabled: '#F5F5F5',
    },
    dark: {
      page: '#0F172A',
      card: '#1E293B',
      cardHover: '#334155',
      sidebar: '#1E293B',
      sidebarHover: '#334155',
      sidebarActive: '#1E3A5F',
      header: '#0F172A',
      footer: '#0F172A',
      popover: '#1E293B',
      input: '#1E293B',
      inputDisabled: '#0F172A',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TEXT COLORS
  // ═══════════════════════════════════════════════════════════════════════════
  text: {
    light: {
      primary: '#232323',
      secondary: '#525252',
      tertiary: '#737373',
      muted: '#A3A3A3',
      placeholder: '#707070',
    },
    dark: {
      primary: '#F5F5F5',
      secondary: '#CBD5E1',
      tertiary: '#94A3B8',
      muted: '#64748B',
      placeholder: '#475569',
    },
    // LXD Brand text colors (WCAG 2.2 AA compliant)
    lxdDark: {
      heading: '#FFFFFF',
      body: '#E0E0E0',
      secondary: '#EBEBEB',
      muted: '#D6D6D6',
      tertiary: '#CCCCCC',
    },
    lxdLight: {
      heading: '#232323',
      body: '#3D3D3D',
      secondary: '#5C5C5C',
      muted: '#666666',
      placeholder: '#707070',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BORDER COLORS
  // ═══════════════════════════════════════════════════════════════════════════
  border: {
    light: {
      default: '#E5E5E5',
      strong: '#A3A3A3',
      subtle: '#F0F0F0',
      input: '#D4D4D4',
      inputHover: '#A3A3A3',
      focus: '#3B82F6',
    },
    dark: {
      default: '#334155',
      strong: '#475569',
      subtle: '#1E293B',
      input: '#475569',
      inputHover: '#64748B',
      focus: '#60A5FA',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GRAY SCALE (for legacy support)
  // ═══════════════════════════════════════════════════════════════════════════
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SPECIAL COLORS
  // ═══════════════════════════════════════════════════════════════════════════
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const typography = {
  fontFamily: {
    sans: '"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    heading: '"Plus Jakarta Sans", "Inter", ui-sans-serif, system-ui, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  },

  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// =============================================================================
// SPACING (matches globals.css --spacing-*)
// =============================================================================

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

// =============================================================================
// BORDER RADIUS (matches globals.css --radius-*)
// =============================================================================

export const borderRadius = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px', // LXD Brand standard
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
} as const;

// LXD Brand Standard radius
export const LXD_RADIUS = borderRadius.lg;

// =============================================================================
// SHADOWS (matches globals.css --shadow-*)
// =============================================================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',

  // Brand shadows (using brand colors)
  primary: '0 4px 14px 0 rgba(0, 86, 184, 0.25)', // Blue glow
  secondary: '0 4px 14px 0 rgba(186, 35, 251, 0.25)', // Purple glow

  // LXD Card shadows
  lxdCardLight: '0 4px 6px -1px rgba(186, 35, 251, 0.2), 0 2px 4px -1px rgba(186, 35, 251, 0.1)',
  lxdCardDark: '0 4px 6px -1px rgba(67, 2, 95, 0.3), 0 2px 4px -1px rgba(67, 2, 95, 0.2)',
} as const;

// =============================================================================
// Z-INDEX (matches globals.css --z-*)
// =============================================================================

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 10,
  sticky: 20,
  sidebar: 30,
  header: 40,
  overlay: 50,
  modal: 60,
  popover: 70,
  toast: 80,
  max: 9999,
} as const;

// =============================================================================
// ANIMATIONS (matches globals.css)
// =============================================================================

export const animation = {
  duration: {
    fastest: '75ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
    slowest: '700ms',
  },

  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

// =============================================================================
// BREAKPOINTS
// =============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const breakpointValues = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// =============================================================================
// GRADIENTS (using brand colors)
// =============================================================================

export const gradients = {
  // Primary gradients
  primaryToDark: `linear-gradient(135deg, ${colors.brand.primary} 0%, ${colors.brand.primaryHover} 100%)`,
  primaryToSecondary: `linear-gradient(135deg, ${colors.brand.primary} 0%, ${colors.brand.secondary} 100%)`,

  // Button gradients
  buttonPrimary: `linear-gradient(135deg, ${colors.brand.primary} 0%, ${colors.brand.primaryHover} 100%)`,
  buttonSecondary: `linear-gradient(135deg, ${colors.brand.secondary} 0%, ${colors.brand.secondaryHover} 100%)`,

  // Background gradients
  darkHero: `linear-gradient(to right, ${colors.surface.dark.page}, ${colors.surface.dark.card}, ${colors.surface.dark.page})`,
  lightHero: `linear-gradient(to right, ${colors.surface.light.page}, ${colors.white}, ${colors.surface.light.page})`,

  // Overlay gradients
  fadeToBlack: 'linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.8))',
  fadeToWhite: 'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.9))',

  // Shimmer gradient for borders
  shimmer: `linear-gradient(135deg, ${colors.lxd.blue}, ${colors.lxd.purple}, ${colors.lxd.blue})`,
} as const;

// =============================================================================
// UNIFIED TOKENS EXPORT
// =============================================================================

export const tokens = {
  cssVars,
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  animation,
  breakpoints,
  breakpointValues,
  gradients,
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type CssVars = typeof cssVars;
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;
export type ZIndex = typeof zIndex;
export type Animation = typeof animation;
export type Breakpoints = typeof breakpoints;
export type Gradients = typeof gradients;
export type DesignTokens = typeof tokens;

// Default export
export default tokens;
