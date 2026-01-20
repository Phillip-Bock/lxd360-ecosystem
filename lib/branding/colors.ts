import { colors, gradients } from '../design-tokens';

// =============================================================================
// PRIMARY BLUES - Re-exported from design-tokens
// =============================================================================

export const OXFORD_BLUE = colors.lxd.blueDark700; // #001D3D - Deep navy
export const BERKELEY_BLUE = colors.lxd.blueDark600; // #002D5F - Mid navy (approximated)
export const POLYNESIAN_BLUE = colors.lxd.cardBg; // #00438F - Professional blue
export const SAPPHIRE = colors.brand.primary; // #0056B8 - Primary blue
export const BRANDEIS_BLUE = '#0072F5'; // Vibrant blue - highlights
export const AZURE = '#1F87FF'; // Light blue - hover states
export const DODGER_BLUE = colors.lxd.blueLight; // #479DFF - Lightest blue

// =============================================================================
// ACCENT COLORS
// =============================================================================

export const MAGENTA_PRIMARY = '#7103A0'; // Purple magenta
export const MAGENTA_BRIGHT = '#EF06C8'; // Hot pink
export const CYAN = '#019EF3'; // Cyan blue
export const LXD_PURPLE = colors.brand.secondary; // #BA23FB - LXD Purple
export const LXD_PURPLE_DARK = colors.lxd.purpleDark; // #43025F - Dark purple

// =============================================================================
// NEUTRALS
// =============================================================================

export const WHITE = colors.white; // #FFFFFF
export const OFF_WHITE = colors.surface.light.page; // #F5F5F5
export const DARK_TEXT = colors.text.light.primary; // #232323
export const BLACK = colors.black; // #000000

// =============================================================================
// SEMANTIC COLORS - Re-exported from design-tokens
// =============================================================================

export const SUCCESS = colors.semantic.success; // #22C55E
export const SUCCESS_LIGHT = colors.semantic.successBg; // #F0FDF4
export const SUCCESS_DARK = colors.semantic.successDark; // #059669

export const WARNING = colors.semantic.warning; // #F59E0B
export const WARNING_LIGHT = colors.semantic.warningBg; // #FFFBEB
export const WARNING_DARK = colors.semantic.warningDark; // #D97706

export const ERROR = colors.semantic.error; // #EF4444
export const ERROR_LIGHT = colors.semantic.errorBg; // #FEF2F2
export const ERROR_DARK = colors.semantic.errorDark; // #B91C1C

export const INFO = colors.semantic.info; // #3B82F6
export const INFO_LIGHT = colors.semantic.infoBg; // #EFF6FF
export const INFO_DARK = colors.semantic.infoDark; // #1D4ED8

// =============================================================================
// GRADIENTS - Re-exported from design-tokens
// =============================================================================

export const GRADIENT_PRIMARY = gradients.primaryToDark;
export const GRADIENT_ACCENT = gradients.buttonSecondary;
export const GRADIENT_HERO = gradients.darkHero;

// =============================================================================
// TAILWIND CLASS MAPPINGS
// =============================================================================

export const TAILWIND_COLORS = {
  'oxford-blue': OXFORD_BLUE,
  'berkeley-blue': BERKELEY_BLUE,
  'polynesian-blue': POLYNESIAN_BLUE,
  sapphire: SAPPHIRE,
  'brandeis-blue': BRANDEIS_BLUE,
  azure: AZURE,
  'dodger-blue': DODGER_BLUE,
  'magenta-primary': MAGENTA_PRIMARY,
  'magenta-bright': MAGENTA_BRIGHT,
  cyan: CYAN,
  'lxd-purple': LXD_PURPLE,
} as const;

// =============================================================================
// COLOR REPLACEMENT MAP
// Maps off-brand colors to approved brand colors
// =============================================================================

export const COLOR_REPLACEMENTS: Record<string, string> = {
  // Blues
  '#0056B8': SAPPHIRE,
  '#0072F5': BRANDEIS_BLUE,
  '#1F87FF': AZURE,
  '#479DFF': DODGER_BLUE,
  '#00438F': POLYNESIAN_BLUE,
  '#019EF3': CYAN,

  // Purples/Magentas
  '#7103A0': MAGENTA_PRIMARY,
  '#EF06C8': MAGENTA_BRIGHT,
  '#BA23FB': LXD_PURPLE,
  '#43025F': LXD_PURPLE_DARK,

  // Greens
  '#10B981': SUCCESS,
  '#22C55E': SUCCESS,
  '#059669': SUCCESS_DARK,

  // Oranges/Yellows
  '#F59E0B': WARNING,
  '#D97706': WARNING_DARK,

  // Reds
  '#EF4444': ERROR,
  '#B91C1C': ERROR_DARK,

  // Grays - using design-tokens gray scale
  '#F5F5F5': OFF_WHITE,
  '#E5E7EB': colors.gray[200],
  '#D1D5DB': colors.gray[300],
  '#6B7280': colors.gray[500],
  '#9CA3AF': colors.gray[400],
  '#4B5563': colors.gray[600],
  '#1F2937': colors.gray[800],

  // Near-black
  '#001D3D': OXFORD_BLUE,
  '#000000': BLACK,

  // Pure white
  '#FFFFFF': WHITE,

  // Light backgrounds
  '#F0F9FF': '#F0F9FF',
  '#DBEAFE': '#DBEAFE',
  '#E0F2FE': INFO_LIGHT,
  '#ECFDF5': SUCCESS_LIGHT,
  '#FEF3C7': WARNING_LIGHT,
  '#FEE2E2': ERROR_LIGHT,
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get the brand-approved replacement for a color
 */
export function getBrandColor(color: string): string {
  const upperColor = color.toUpperCase();
  return COLOR_REPLACEMENTS[upperColor] || color;
}

/**
 * Check if a color is brand-approved
 */
export function isBrandColor(color: string): boolean {
  const upperColor = color.toUpperCase();
  const brandColors = [
    OXFORD_BLUE,
    BERKELEY_BLUE,
    POLYNESIAN_BLUE,
    SAPPHIRE,
    BRANDEIS_BLUE,
    AZURE,
    DODGER_BLUE,
    MAGENTA_PRIMARY,
    MAGENTA_BRIGHT,
    CYAN,
    WHITE,
    OFF_WHITE,
    DARK_TEXT,
    BLACK,
    LXD_PURPLE,
    LXD_PURPLE_DARK,
  ].map((c) => c.toUpperCase());
  return brandColors.includes(upperColor);
}

/**
 * Convert hex to rgba with opacity
 */
export function hexToRgba(hex: string, opacity: number): string {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.substring(0, 2), 16);
  const g = parseInt(normalized.substring(2, 4), 16);
  const b = parseInt(normalized.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
