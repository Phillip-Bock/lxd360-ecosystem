/**
 * Theme Configuration - references design-tokens.ts
 *
 * This file provides the THEME object for backwards compatibility.
 * All values are sourced from design-tokens.ts which mirrors globals.css.
 *
 * IMPORTANT: globals.css is the SINGLE SOURCE OF TRUTH
 * Do NOT modify values here - update globals.css and design-tokens.ts instead.
 */

import {
  animation,
  borderRadius,
  breakpointValues,
  colors,
  shadows,
  typography,
} from '../design-tokens';

// =============================================================================
// THEME OBJECT (for backwards compatibility)
// =============================================================================

export const THEME = {
  // Default theme mode
  default: 'dark' as const,

  // Brand colors - sourced from design-tokens
  colors: {
    // Primary brand colors
    primary: colors.brand.primary, // #0056B8
    primaryHover: colors.brand.primaryHover, // #004494
    secondary: colors.lxd.shimmerBorder, // #550278
    secondaryHover: colors.lxd.purpleDark, // #43025F
    accent: '#06B6D4', // Cyan accent

    // Dark theme (DEFAULT)
    dark: {
      background: '#00101A', // Deep navy - main background
      surface: colors.lxd.blueDark700, // #001D3D - Navy surface cards
      surfaceHover: '#002952', // Hover state
      border: '#003566', // Border color
      text: colors.text.dark.primary, // #F5F5F5
      textMuted: colors.text.dark.tertiary, // #94A3B8
    },

    // Light theme (secondary option)
    light: {
      background: colors.surface.light.page, // #F5F5F5
      surface: colors.surface.light.card, // #FFFFFF
      surfaceHover: '#F1F5F9', // Hover state
      border: '#E2E8F0', // Border color
      text: colors.text.light.primary, // #232323
      textMuted: colors.text.light.tertiary, // #737373
    },

    // Semantic colors
    success: colors.semantic.success, // #22C55E
    successLight: colors.semantic.successBg, // Light green
    warning: colors.semantic.warning, // #F59E0B
    warningLight: colors.semantic.warningBg, // Light amber
    error: colors.semantic.error, // #EF4444
    errorLight: colors.semantic.errorBg, // Light red
    info: colors.semantic.info, // #3B82F6
    infoLight: colors.semantic.infoBg, // Light blue
  },

  // Typography - sourced from design-tokens
  fonts: {
    sans: typography.fontFamily.sans,
    mono: typography.fontFamily.mono,
  },

  // Font sizes
  fontSizes: typography.fontSize,

  // Border radius
  radii: {
    none: borderRadius.none,
    sm: '0.25rem', // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    xl: borderRadius.lg, // 12px (LXD brand)
    '2xl': borderRadius.xl, // 16px
    full: borderRadius.full,
  },

  // Shadows - sourced from design-tokens
  shadows: {
    sm: shadows.sm,
    md: shadows.md,
    lg: shadows.lg,
    xl: shadows.xl,
    glow: shadows.primary, // Blue glow
    glowPurple: shadows.secondary, // Purple glow
  },

  // Z-index scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    modal: 1030,
    popover: 1040,
    tooltip: 1050,
    toast: 1060,
  },

  // Breakpoints (pixels)
  breakpoints: breakpointValues,

  // Transitions - sourced from design-tokens
  transitions: {
    fast: `${animation.duration.fast} ease`,
    normal: `${animation.duration.normal} ease`,
    slow: `${animation.duration.slow} ease`,
    verySlow: `${animation.duration.slower} ease`,
  },
} as const;

// =============================================================================
// FLOATING BADGE STYLE (for marketing sections)
// =============================================================================

export const FLOATING_BADGE_STYLE = {
  background: THEME.colors.primary,
  borderRadius: '10px',
  boxShadow: `0 0 20px ${THEME.colors.secondary}`,
  padding: '0.5rem 1rem',
  color: 'white',
  fontWeight: 600,
  fontSize: '0.875rem',
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Theme = typeof THEME;
export type ThemeMode = 'dark' | 'light';
export type ThemeColors = typeof THEME.colors;
