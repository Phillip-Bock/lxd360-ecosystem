import type {
  Animations,
  BorderRadius,
  ButtonTokens,
  CardTokens,
  ColorPalette,
  GlowEffects,
  InputTokens,
  LXD360Theme,
  ScrollbarTokens,
  SemanticColors,
  ShadowScale,
  SliderTokens,
  SpacingScale,
  TabTokens,
  ToggleTokens,
  TransitionDuration,
  TransitionEasing,
  Typography,
  ZIndexScale,
} from './types';

// ============================================================================
// Helper Functions
// ============================================================================

/** Convert HSL values to CSS string */
export function hsl(h: number, s: number, l: number, a?: number): string {
  if (a !== undefined) {
    return `hsl(${h} ${s}% ${l}% / ${a})`;
  }
  return `hsl(${h} ${s}% ${l}%)`;
}

/** Generate 11-shade color scale from base HSL values */
export function generateColorScale(
  baseH: number,
  baseS: number,
  baseL: number,
): Record<string, string> {
  return {
    50: hsl(baseH, baseS, 97),
    100: hsl(baseH, baseS, 94),
    200: hsl(baseH, baseS, 86),
    300: hsl(baseH, baseS, 76),
    400: hsl(baseH, baseS, 62),
    500: hsl(baseH, baseS, baseL), // Base color
    600: hsl(baseH, baseS, 42),
    700: hsl(baseH, baseS, 34),
    800: hsl(baseH, baseS, 26),
    900: hsl(baseH, baseS, 18),
    950: hsl(baseH, baseS, 10),
  };
}

// ============================================================================
// Color Palette - 12 Families × 11 Shades = 132 Colors
// ============================================================================

export const colorPalette: ColorPalette = {
  // Primary Blue (LXD360 Brand Blue)
  primary: {
    50: hsl(214, 100, 97),
    100: hsl(214, 95, 93),
    200: hsl(213, 97, 87),
    300: hsl(212, 96, 78),
    400: hsl(213, 94, 68),
    500: hsl(217, 91, 60), // #3B82F6 equivalent
    600: hsl(221, 83, 53),
    700: hsl(224, 76, 48),
    800: hsl(226, 71, 40),
    900: hsl(224, 64, 33),
    950: hsl(226, 57, 21),
  },

  // Secondary Blue (Darker Blue)
  secondary: {
    50: hsl(220, 70, 96),
    100: hsl(220, 70, 92),
    200: hsl(220, 70, 84),
    300: hsl(220, 70, 72),
    400: hsl(220, 70, 58),
    500: hsl(220, 70, 45), // Darker blue
    600: hsl(220, 70, 38),
    700: hsl(220, 70, 30),
    800: hsl(220, 70, 24),
    900: hsl(220, 70, 18),
    950: hsl(220, 70, 10),
  },

  // Black (Neutral Scale)
  black: {
    50: hsl(0, 0, 98),
    100: hsl(0, 0, 96),
    200: hsl(0, 0, 90),
    300: hsl(0, 0, 83),
    400: hsl(0, 0, 64),
    500: hsl(0, 0, 45),
    600: hsl(0, 0, 32),
    700: hsl(0, 0, 25),
    800: hsl(0, 0, 15),
    900: hsl(0, 0, 9),
    950: hsl(0, 0, 4),
  },

  // White (Light Neutral Scale)
  white: {
    50: hsl(0, 0, 100),
    100: hsl(0, 0, 99),
    200: hsl(0, 0, 98),
    300: hsl(0, 0, 96),
    400: hsl(0, 0, 94),
    500: hsl(0, 0, 92),
    600: hsl(0, 0, 88),
    700: hsl(0, 0, 82),
    800: hsl(0, 0, 74),
    900: hsl(0, 0, 62),
    950: hsl(0, 0, 50),
  },

  // Orange (Accent/CTA)
  orange: {
    50: hsl(33, 100, 96),
    100: hsl(34, 100, 92),
    200: hsl(32, 98, 83),
    300: hsl(31, 97, 72),
    400: hsl(27, 96, 61),
    500: hsl(25, 95, 53), // #F97316 equivalent
    600: hsl(21, 90, 48),
    700: hsl(17, 88, 40),
    800: hsl(15, 79, 34),
    900: hsl(15, 75, 28),
    950: hsl(13, 81, 15),
  },

  // Yellow (Warning/Highlight)
  yellow: {
    50: hsl(55, 92, 95),
    100: hsl(55, 97, 88),
    200: hsl(53, 98, 77),
    300: hsl(50, 98, 64),
    400: hsl(48, 96, 53),
    500: hsl(45, 93, 47), // #EAB308 equivalent
    600: hsl(41, 96, 40),
    700: hsl(35, 92, 33),
    800: hsl(32, 81, 29),
    900: hsl(28, 73, 26),
    950: hsl(26, 83, 14),
  },

  // Green (Success)
  green: {
    50: hsl(138, 76, 97),
    100: hsl(141, 84, 93),
    200: hsl(141, 79, 85),
    300: hsl(142, 77, 73),
    400: hsl(142, 69, 58),
    500: hsl(142, 71, 45), // #22C55E equivalent
    600: hsl(142, 76, 36),
    700: hsl(142, 72, 29),
    800: hsl(143, 64, 24),
    900: hsl(144, 61, 20),
    950: hsl(145, 80, 10),
  },

  // Red (Error/Destructive)
  red: {
    50: hsl(0, 86, 97),
    100: hsl(0, 93, 94),
    200: hsl(0, 96, 89),
    300: hsl(0, 94, 82),
    400: hsl(0, 91, 71),
    500: hsl(0, 84, 60), // #EF4444 equivalent
    600: hsl(0, 72, 51),
    700: hsl(0, 74, 42),
    800: hsl(0, 70, 35),
    900: hsl(0, 63, 31),
    950: hsl(0, 75, 15),
  },

  // Purple (Accent)
  purple: {
    50: hsl(270, 100, 98),
    100: hsl(269, 100, 95),
    200: hsl(269, 100, 92),
    300: hsl(269, 97, 85),
    400: hsl(270, 95, 75),
    500: hsl(271, 91, 65), // #A855F7 equivalent
    600: hsl(271, 81, 56),
    700: hsl(272, 72, 47),
    800: hsl(273, 67, 39),
    900: hsl(274, 66, 32),
    950: hsl(274, 87, 21),
  },

  // Magenta (Hyperlinks)
  magenta: {
    50: hsl(330, 100, 98),
    100: hsl(330, 100, 95),
    200: hsl(330, 100, 90),
    300: hsl(330, 96, 82),
    400: hsl(330, 94, 71),
    500: hsl(330, 81, 60), // #EC4899 equivalent
    600: hsl(330, 71, 51),
    700: hsl(330, 75, 42),
    800: hsl(330, 70, 35),
    900: hsl(330, 63, 30),
    950: hsl(330, 80, 17),
  },

  // Pink (Accent)
  pink: {
    50: hsl(350, 100, 98),
    100: hsl(350, 100, 96),
    200: hsl(350, 100, 92),
    300: hsl(350, 96, 84),
    400: hsl(350, 94, 72),
    500: hsl(350, 89, 60), // #F43F5E equivalent
    600: hsl(350, 77, 52),
    700: hsl(350, 74, 43),
    800: hsl(350, 70, 36),
    900: hsl(350, 63, 31),
    950: hsl(350, 80, 17),
  },

  // Brown (Accent)
  brown: {
    50: hsl(30, 50, 96),
    100: hsl(30, 50, 92),
    200: hsl(30, 50, 84),
    300: hsl(30, 50, 72),
    400: hsl(30, 50, 58),
    500: hsl(30, 50, 45),
    600: hsl(30, 50, 38),
    700: hsl(30, 50, 30),
    800: hsl(30, 50, 24),
    900: hsl(30, 50, 18),
    950: hsl(30, 50, 10),
  },
};

// ============================================================================
// Semantic Colors
// ============================================================================

export const semanticColors: SemanticColors = {
  // Status colors
  success: colorPalette.green[500],
  successForeground: hsl(0, 0, 100),
  successMuted: colorPalette.green[100],
  warning: colorPalette.yellow[500],
  warningForeground: hsl(0, 0, 0),
  warningMuted: colorPalette.yellow[100],
  error: colorPalette.red[500],
  errorForeground: hsl(0, 0, 100),
  errorMuted: colorPalette.red[100],
  info: colorPalette.primary[500],
  infoForeground: hsl(0, 0, 100),
  infoMuted: colorPalette.primary[100],

  // Surface colors (light mode defaults)
  background: hsl(0, 0, 100),
  foreground: hsl(222, 47, 11),
  card: hsl(0, 0, 100),
  cardForeground: hsl(222, 47, 11),
  popover: hsl(0, 0, 100),
  popoverForeground: hsl(222, 47, 11),
  muted: hsl(210, 40, 96),
  mutedForeground: hsl(215, 16, 47),
  accent: hsl(210, 40, 96),
  accentForeground: hsl(222, 47, 11),

  // Interactive colors
  primaryButton: colorPalette.primary[500],
  primaryButtonForeground: hsl(0, 0, 100),
  secondaryButton: hsl(210, 40, 96),
  secondaryButtonForeground: hsl(222, 47, 11),
  destructiveButton: colorPalette.red[500],
  destructiveButtonForeground: hsl(0, 0, 100),

  // Borders & inputs
  border: hsl(214, 32, 91),
  input: hsl(214, 32, 91),
  ring: colorPalette.primary[500],
};

// ============================================================================
// Typography
// ============================================================================

export const typography: Typography = {
  fontFamily: {
    sans: "'Geist', 'Inter', system-ui, -apple-system, sans-serif",
    serif: "'Source Serif 4', Georgia, serif",
    mono: "'Geist Mono', 'JetBrains Mono', monospace",
    display: "'Geist', 'Inter', system-ui, sans-serif",
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
    '7xl': '4.5rem', // 72px
    '8xl': '6rem', // 96px
    '9xl': '8rem', // 128px
  },

  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
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
};

// ============================================================================
// Spacing Scale (4px base)
// ============================================================================

export const spacing: SpacingScale = {
  0: '0px',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  11: '2.75rem', // 44px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px
  36: '9rem', // 144px
  40: '10rem', // 160px
  44: '11rem', // 176px
  48: '12rem', // 192px
  52: '13rem', // 208px
  56: '14rem', // 224px
  60: '15rem', // 240px
  64: '16rem', // 256px
  72: '18rem', // 288px
  80: '20rem', // 320px
  96: '24rem', // 384px
};

// ============================================================================
// Border Radius
// ============================================================================

export const borderRadius: BorderRadius = {
  none: '0px',
  sm: '0.125rem', // 2px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
};

// ============================================================================
// Shadows
// ============================================================================

export const shadows: ShadowScale = {
  none: 'none',
  '2xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
};

// ============================================================================
// Glow Effects (Futuristic)
// ============================================================================

export const glowEffects: GlowEffects = {
  primary: `0 0 20px ${colorPalette.primary[500]}, 0 0 40px ${hsl(217, 91, 60, 0.3)}`,
  secondary: `0 0 20px ${colorPalette.secondary[500]}, 0 0 40px ${hsl(220, 70, 45, 0.3)}`,
  success: `0 0 20px ${colorPalette.green[500]}, 0 0 40px ${hsl(142, 71, 45, 0.3)}`,
  warning: `0 0 20px ${colorPalette.yellow[500]}, 0 0 40px ${hsl(45, 93, 47, 0.3)}`,
  error: `0 0 20px ${colorPalette.red[500]}, 0 0 40px ${hsl(0, 84, 60, 0.3)}`,
  info: `0 0 20px ${colorPalette.primary[400]}, 0 0 40px ${hsl(213, 94, 68, 0.3)}`,
  neon: `0 0 5px #fff, 0 0 10px #fff, 0 0 20px ${colorPalette.primary[500]}, 0 0 40px ${colorPalette.primary[500]}, 0 0 80px ${colorPalette.primary[500]}`,
  holographic: `0 0 20px ${colorPalette.magenta[500]}, 0 0 40px ${colorPalette.primary[500]}, 0 0 60px ${colorPalette.purple[500]}`,
};

// ============================================================================
// Z-Index Scale
// ============================================================================

export const zIndex: ZIndexScale = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipNav: 1600,
  toast: 1700,
  tooltip: 1800,
  max: 9999,
};

// ============================================================================
// Transition Durations
// ============================================================================

export const transitionDuration: TransitionDuration = {
  75: '75ms',
  100: '100ms',
  150: '150ms',
  200: '200ms',
  300: '300ms',
  500: '500ms',
  700: '700ms',
  1000: '1000ms',
};

// ============================================================================
// Transition Easings
// ============================================================================

export const transitionEasing: TransitionEasing = {
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  elastic: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
};

// ============================================================================
// Animations
// ============================================================================

export const animations: Animations = {
  // Marketing animations
  fadeInUp: {
    name: 'fade-in-up',
    keyframes: `
      @keyframes fade-in-up {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `,
    duration: '600ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fillMode: 'both',
  },
  fadeInDown: {
    name: 'fade-in-down',
    keyframes: `
      @keyframes fade-in-down {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `,
    duration: '600ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fillMode: 'both',
  },
  fadeInLeft: {
    name: 'fade-in-left',
    keyframes: `
      @keyframes fade-in-left {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
      }
    `,
    duration: '600ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fillMode: 'both',
  },
  fadeInRight: {
    name: 'fade-in-right',
    keyframes: `
      @keyframes fade-in-right {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
      }
    `,
    duration: '600ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fillMode: 'both',
  },
  float: {
    name: 'float',
    keyframes: `
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
    `,
    duration: '3s',
    easing: 'ease-in-out',
    iterationCount: 'infinite',
  },
  pulse: {
    name: 'pulse',
    keyframes: `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `,
    duration: '2s',
    easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
    iterationCount: 'infinite',
  },
  glowPulse: {
    name: 'glow-pulse',
    keyframes: `
      @keyframes glow-pulse {
        0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
        50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8), 0 0 60px rgba(59, 130, 246, 0.4); }
      }
    `,
    duration: '2s',
    easing: 'ease-in-out',
    iterationCount: 'infinite',
  },
  shimmer: {
    name: 'shimmer',
    keyframes: `
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `,
    duration: '2s',
    easing: 'linear',
    iterationCount: 'infinite',
  },
  gradient: {
    name: 'gradient',
    keyframes: `
      @keyframes gradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `,
    duration: '6s',
    easing: 'ease',
    iterationCount: 'infinite',
  },

  // UI animations
  slideIn: {
    name: 'slide-in',
    keyframes: `
      @keyframes slide-in {
        from { transform: translateX(-100%); }
        to { transform: translateX(0); }
      }
    `,
    duration: '300ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fillMode: 'both',
  },
  slideOut: {
    name: 'slide-out',
    keyframes: `
      @keyframes slide-out {
        from { transform: translateX(0); }
        to { transform: translateX(100%); }
      }
    `,
    duration: '300ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fillMode: 'both',
  },
  scaleIn: {
    name: 'scale-in',
    keyframes: `
      @keyframes scale-in {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
    `,
    duration: '200ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fillMode: 'both',
  },
  scaleOut: {
    name: 'scale-out',
    keyframes: `
      @keyframes scale-out {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.95); }
      }
    `,
    duration: '200ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fillMode: 'both',
  },
  spin: {
    name: 'spin',
    keyframes: `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `,
    duration: '1s',
    easing: 'linear',
    iterationCount: 'infinite',
  },
  ping: {
    name: 'ping',
    keyframes: `
      @keyframes ping {
        75%, 100% { transform: scale(2); opacity: 0; }
      }
    `,
    duration: '1s',
    easing: 'cubic-bezier(0, 0, 0.2, 1)',
    iterationCount: 'infinite',
  },
  bounce: {
    name: 'bounce',
    keyframes: `
      @keyframes bounce {
        0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
        50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
      }
    `,
    duration: '1s',
    easing: 'ease',
    iterationCount: 'infinite',
  },

  // Futuristic effects
  holographic: {
    name: 'holographic',
    keyframes: `
      @keyframes holographic {
        0% { background-position: 0% 50%; filter: hue-rotate(0deg); }
        50% { background-position: 100% 50%; filter: hue-rotate(180deg); }
        100% { background-position: 0% 50%; filter: hue-rotate(360deg); }
      }
    `,
    duration: '4s',
    easing: 'ease',
    iterationCount: 'infinite',
  },
  neonFlicker: {
    name: 'neon-flicker',
    keyframes: `
      @keyframes neon-flicker {
        0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
          text-shadow: 0 0 4px #fff, 0 0 11px #fff, 0 0 19px #fff, 0 0 40px #3b82f6, 0 0 80px #3b82f6;
        }
        20%, 24%, 55% {
          text-shadow: none;
        }
      }
    `,
    duration: '1.5s',
    easing: 'ease-in-out',
    iterationCount: 'infinite',
  },
  dataStream: {
    name: 'data-stream',
    keyframes: `
      @keyframes data-stream {
        0% { background-position: 0% 0%; }
        100% { background-position: 0% 100%; }
      }
    `,
    duration: '20s',
    easing: 'linear',
    iterationCount: 'infinite',
  },
  particleFloat: {
    name: 'particle-float',
    keyframes: `
      @keyframes particle-float {
        0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateY(-100vh) translateX(20px) rotate(720deg); opacity: 0; }
      }
    `,
    duration: '15s',
    easing: 'linear',
    iterationCount: 'infinite',
  },
  morphGlow: {
    name: 'morph-glow',
    keyframes: `
      @keyframes morph-glow {
        0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
        50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
      }
    `,
    duration: '8s',
    easing: 'ease-in-out',
    iterationCount: 'infinite',
  },
};

// ============================================================================
// Component Tokens
// ============================================================================

export const buttonTokens: ButtonTokens = {
  sizes: {
    xs: { height: '1.75rem', paddingX: '0.5rem', fontSize: '0.75rem', iconSize: '0.875rem' },
    sm: { height: '2rem', paddingX: '0.75rem', fontSize: '0.875rem', iconSize: '1rem' },
    md: { height: '2.5rem', paddingX: '1rem', fontSize: '0.875rem', iconSize: '1.125rem' },
    lg: { height: '2.75rem', paddingX: '1.5rem', fontSize: '1rem', iconSize: '1.25rem' },
    xl: { height: '3rem', paddingX: '2rem', fontSize: '1.125rem', iconSize: '1.5rem' },
  },
  radius: borderRadius.lg,
  fontWeight: 500,
  borderWidth: '1px',
  shadow: shadows.sm,
  shadowHover: shadows.md,
  shadowActive: shadows['2xs'],
  transition: `all ${transitionDuration[200]} ${transitionEasing.inOut}`,
  states: {
    default: { scale: 1, brightness: 1 },
    hover: { scale: 1.02, brightness: 1.05 },
    active: { scale: 0.98, brightness: 0.95 },
    disabled: { opacity: 0.5 },
  },
};

export const cardTokens: CardTokens = {
  padding: {
    sm: spacing[4],
    md: spacing[6],
    lg: spacing[8],
  },
  radius: borderRadius.xl,
  shadow: shadows.md,
  shadowHover: shadows.lg,
  borderWidth: '1px',
  borderColor: semanticColors.border,
  background: semanticColors.card,
  backgroundHover: hsl(210, 40, 98),
};

export const inputTokens: InputTokens = {
  sizes: {
    sm: { height: '2rem', paddingX: '0.75rem', fontSize: '0.875rem' },
    md: { height: '2.5rem', paddingX: '1rem', fontSize: '0.875rem' },
    lg: { height: '3rem', paddingX: '1.25rem', fontSize: '1rem' },
  },
  radius: borderRadius.lg,
  borderWidth: '1px',
  shadow: 'none',
  shadowFocus: `0 0 0 2px ${hsl(217, 91, 60, 0.2)}`,
  transition: `all ${transitionDuration[150]} ${transitionEasing.inOut}`,
  states: {
    default: { borderColor: semanticColors.border, background: semanticColors.background },
    hover: { borderColor: colorPalette.black[400], background: semanticColors.background },
    focus: {
      borderColor: colorPalette.primary[500],
      background: semanticColors.background,
      ringWidth: '2px',
      ringColor: hsl(217, 91, 60, 0.2),
    },
    error: { borderColor: colorPalette.red[500], ringColor: hsl(0, 84, 60, 0.2) },
    disabled: { opacity: 0.5, background: hsl(210, 40, 96) },
  },
};

export const toggleTokens: ToggleTokens = {
  sizes: {
    sm: { width: '2rem', height: '1rem', thumbSize: '0.75rem' },
    md: { width: '2.75rem', height: '1.5rem', thumbSize: '1.25rem' },
    lg: { width: '3.5rem', height: '2rem', thumbSize: '1.75rem' },
  },
  radius: borderRadius.full,
  transition: `all ${transitionDuration[200]} ${transitionEasing.inOut}`,
  colors: {
    trackOff: colorPalette.black[200],
    trackOn: colorPalette.primary[500],
    thumb: hsl(0, 0, 100),
    thumbShadow: shadows.sm,
  },
};

export const tabTokens: TabTokens = {
  height: '2.5rem',
  paddingX: '1rem',
  gap: '0.5rem',
  borderWidth: '2px',
  radius: borderRadius.lg,
  transition: `all ${transitionDuration[150]} ${transitionEasing.inOut}`,
  states: {
    default: { color: semanticColors.mutedForeground, background: 'transparent' },
    hover: { color: semanticColors.foreground, background: hsl(210, 40, 96) },
    active: {
      color: colorPalette.primary[600],
      background: hsl(214, 100, 97),
      borderColor: colorPalette.primary[500],
    },
  },
};

export const sliderTokens: SliderTokens = {
  track: {
    height: '0.5rem',
    radius: borderRadius.full,
    background: colorPalette.black[200],
    backgroundFilled: colorPalette.primary[500],
  },
  thumb: {
    size: '1.25rem',
    radius: borderRadius.full,
    background: hsl(0, 0, 100),
    shadow: shadows.md,
    shadowActive: shadows.lg,
    border: `2px solid ${colorPalette.primary[500]}`,
  },
  knob: {
    size: '4rem',
    radius: borderRadius.full,
    background: `linear-gradient(145deg, ${hsl(0, 0, 96)}, ${hsl(0, 0, 88)})`,
    shadowOuter: `8px 8px 16px ${hsl(0, 0, 80)}, -8px -8px 16px ${hsl(0, 0, 100)}`,
    shadowInner: `inset 4px 4px 8px ${hsl(0, 0, 80)}, inset -4px -4px 8px ${hsl(0, 0, 100)}`,
    indicator: {
      width: '4px',
      height: '0.75rem',
      color: colorPalette.primary[500],
    },
  },
};

export const scrollbarTokens: ScrollbarTokens = {
  width: '8px',
  radius: borderRadius.full,
  track: hsl(0, 0, 96),
  thumb: colorPalette.black[300],
  thumbHover: colorPalette.black[400],
};

// ============================================================================
// Complete Default Theme
// ============================================================================

export const defaultTheme: LXD360Theme = {
  name: 'LXD360 Default',
  version: '1.0.0',
  description: 'Default LXD360 design system theme',
  author: 'LXD360 Development Team',

  colors: colorPalette,
  semantic: semanticColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  glows: glowEffects,
  zIndex,
  transitionDuration,
  transitionEasing,
  animations,
  button: buttonTokens,
  card: cardTokens,
  input: inputTokens,
  toggle: toggleTokens,
  tab: tabTokens,
  slider: sliderTokens,
  scrollbar: scrollbarTokens,
};

// ============================================================================
// Export Utilities
// ============================================================================

export function getThemeCSS(theme: LXD360Theme = defaultTheme): string {
  return `/* LXD360 Theme: ${theme.name} v${theme.version} */`;
}

export function mergeTheme(base: LXD360Theme, overrides: Partial<LXD360Theme>): LXD360Theme {
  return {
    ...base,
    ...overrides,
    colors: { ...base.colors, ...overrides.colors },
    semantic: { ...base.semantic, ...overrides.semantic },
  };
}
