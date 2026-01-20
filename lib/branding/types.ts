// ============================================================================
// Color System Types
// ============================================================================

/** HSL color representation for easy manipulation */
export interface HSLColor {
  h: number; // Hue: 0-360
  s: number; // Saturation: 0-100
  l: number; // Lightness: 0-100
  a?: number; // Alpha: 0-1 (optional)
}

/** 10-shade color scale (50-900 + 950) */
export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

/** All 12 color families from LXD360 palette */
export interface ColorPalette {
  primary: ColorScale; // Primary Blue
  secondary: ColorScale; // Secondary Blue
  black: ColorScale; // Neutral Black
  white: ColorScale; // Neutral White
  orange: ColorScale; // Accent Orange
  yellow: ColorScale; // Accent Yellow
  green: ColorScale; // Success Green
  red: ColorScale; // Error Red
  purple: ColorScale; // Accent Purple
  magenta: ColorScale; // Hyperlinks/Magenta
  pink: ColorScale; // Accent Pink
  brown: ColorScale; // Accent Brown
}

/** Semantic color assignments */
export interface SemanticColors {
  // Core semantic
  success: string;
  successForeground: string;
  successMuted: string;
  warning: string;
  warningForeground: string;
  warningMuted: string;
  error: string;
  errorForeground: string;
  errorMuted: string;
  info: string;
  infoForeground: string;
  infoMuted: string;

  // Surface colors
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;

  // Interactive
  primaryButton: string;
  primaryButtonForeground: string;
  secondaryButton: string;
  secondaryButtonForeground: string;
  destructiveButton: string;
  destructiveButtonForeground: string;

  // Borders & inputs
  border: string;
  input: string;
  ring: string;
}

// ============================================================================
// Typography Types
// ============================================================================

export interface FontFamily {
  sans: string;
  serif: string;
  mono: string;
  display: string;
}

export interface FontSize {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
  '7xl': string;
  '8xl': string;
  '9xl': string;
}

export interface FontWeight {
  thin: number;
  extralight: number;
  light: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
  extrabold: number;
  black: number;
}

export interface LineHeight {
  none: number;
  tight: number;
  snug: number;
  normal: number;
  relaxed: number;
  loose: number;
}

export interface LetterSpacing {
  tighter: string;
  tight: string;
  normal: string;
  wide: string;
  wider: string;
  widest: string;
}

export interface Typography {
  fontFamily: FontFamily;
  fontSize: FontSize;
  fontWeight: FontWeight;
  lineHeight: LineHeight;
  letterSpacing: LetterSpacing;
}

// ============================================================================
// Spacing & Layout Types
// ============================================================================

export interface SpacingScale {
  0: string;
  px: string;
  0.5: string;
  1: string;
  1.5: string;
  2: string;
  2.5: string;
  3: string;
  3.5: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
  14: string;
  16: string;
  20: string;
  24: string;
  28: string;
  32: string;
  36: string;
  40: string;
  44: string;
  48: string;
  52: string;
  56: string;
  60: string;
  64: string;
  72: string;
  80: string;
  96: string;
}

export interface BorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

// ============================================================================
// Shadow Types
// ============================================================================

export interface ShadowConfig {
  x: string;
  y: string;
  blur: string;
  spread: string;
  color: string;
  opacity: number;
}

export interface ShadowScale {
  none: string;
  '2xs': string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

export interface GlowEffects {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  neon: string;
  holographic: string;
}

// ============================================================================
// Z-Index Types
// ============================================================================

export interface ZIndexScale {
  hide: number;
  auto: string;
  base: number;
  docked: number;
  dropdown: number;
  sticky: number;
  banner: number;
  overlay: number;
  modal: number;
  popover: number;
  skipNav: number;
  toast: number;
  tooltip: number;
  max: number;
}

// ============================================================================
// Animation Types
// ============================================================================

export interface TransitionDuration {
  75: string;
  100: string;
  150: string;
  200: string;
  300: string;
  500: string;
  700: string;
  1000: string;
}

export interface TransitionEasing {
  linear: string;
  in: string;
  out: string;
  inOut: string;
  bounce: string;
  elastic: string;
}

export interface AnimationPreset {
  name: string;
  keyframes: string;
  duration: string;
  easing: string;
  delay?: string;
  iterationCount?: string;
  direction?: string;
  fillMode?: string;
}

export interface Animations {
  // Marketing animations
  fadeInUp: AnimationPreset;
  fadeInDown: AnimationPreset;
  fadeInLeft: AnimationPreset;
  fadeInRight: AnimationPreset;
  float: AnimationPreset;
  pulse: AnimationPreset;
  glowPulse: AnimationPreset;
  shimmer: AnimationPreset;
  gradient: AnimationPreset;

  // UI animations
  slideIn: AnimationPreset;
  slideOut: AnimationPreset;
  scaleIn: AnimationPreset;
  scaleOut: AnimationPreset;
  spin: AnimationPreset;
  ping: AnimationPreset;
  bounce: AnimationPreset;

  // Futuristic effects
  holographic: AnimationPreset;
  neonFlicker: AnimationPreset;
  dataStream: AnimationPreset;
  particleFloat: AnimationPreset;
  morphGlow: AnimationPreset;
}

// ============================================================================
// Component Token Types
// ============================================================================

/** Button component tokens */
export interface ButtonTokens {
  // Size variants
  sizes: {
    xs: { height: string; paddingX: string; fontSize: string; iconSize: string };
    sm: { height: string; paddingX: string; fontSize: string; iconSize: string };
    md: { height: string; paddingX: string; fontSize: string; iconSize: string };
    lg: { height: string; paddingX: string; fontSize: string; iconSize: string };
    xl: { height: string; paddingX: string; fontSize: string; iconSize: string };
  };

  // Border radius
  radius: string;

  // Font weight
  fontWeight: number;

  // Border width
  borderWidth: string;

  // Shadow
  shadow: string;
  shadowHover: string;
  shadowActive: string;

  // Transition
  transition: string;

  // States
  states: {
    default: { scale: number; brightness: number };
    hover: { scale: number; brightness: number };
    active: { scale: number; brightness: number };
    disabled: { opacity: number };
  };
}

/** Card component tokens */
export interface CardTokens {
  padding: {
    sm: string;
    md: string;
    lg: string;
  };
  radius: string;
  shadow: string;
  shadowHover: string;
  borderWidth: string;
  borderColor: string;
  background: string;
  backgroundHover: string;
}

/** Input component tokens */
export interface InputTokens {
  sizes: {
    sm: { height: string; paddingX: string; fontSize: string };
    md: { height: string; paddingX: string; fontSize: string };
    lg: { height: string; paddingX: string; fontSize: string };
  };
  radius: string;
  borderWidth: string;
  shadow: string;
  shadowFocus: string;
  transition: string;
  states: {
    default: { borderColor: string; background: string };
    hover: { borderColor: string; background: string };
    focus: { borderColor: string; background: string; ringWidth: string; ringColor: string };
    error: { borderColor: string; ringColor: string };
    disabled: { opacity: number; background: string };
  };
}

/** Toggle/Switch component tokens */
export interface ToggleTokens {
  sizes: {
    sm: { width: string; height: string; thumbSize: string };
    md: { width: string; height: string; thumbSize: string };
    lg: { width: string; height: string; thumbSize: string };
  };
  radius: string;
  transition: string;
  colors: {
    trackOff: string;
    trackOn: string;
    thumb: string;
    thumbShadow: string;
  };
}

/** Tab component tokens */
export interface TabTokens {
  height: string;
  paddingX: string;
  gap: string;
  borderWidth: string;
  radius: string;
  transition: string;
  states: {
    default: { color: string; background: string };
    hover: { color: string; background: string };
    active: { color: string; background: string; borderColor: string };
  };
}

/** Slider/Knob component tokens (for neumorphic controls) */
export interface SliderTokens {
  track: {
    height: string;
    radius: string;
    background: string;
    backgroundFilled: string;
  };
  thumb: {
    size: string;
    radius: string;
    background: string;
    shadow: string;
    shadowActive: string;
    border: string;
  };
  knob: {
    size: string;
    radius: string;
    background: string;
    shadowOuter: string;
    shadowInner: string;
    indicator: {
      width: string;
      height: string;
      color: string;
    };
  };
}

/** Scrollbar tokens */
export interface ScrollbarTokens {
  width: string;
  radius: string;
  track: string;
  thumb: string;
  thumbHover: string;
}

// ============================================================================
// Complete Theme Type
// ============================================================================

export interface LXD360Theme {
  // Meta
  name: string;
  version: string;
  description: string;
  author: string;

  // Color system
  colors: ColorPalette;
  semantic: SemanticColors;

  // Typography
  typography: Typography;

  // Spacing & layout
  spacing: SpacingScale;
  borderRadius: BorderRadius;

  // Effects
  shadows: ShadowScale;
  glows: GlowEffects;
  zIndex: ZIndexScale;

  // Motion
  transitionDuration: TransitionDuration;
  transitionEasing: TransitionEasing;
  animations: Animations;

  // Component tokens
  button: ButtonTokens;
  card: CardTokens;
  input: InputTokens;
  toggle: ToggleTokens;
  tab: TabTokens;
  slider: SliderTokens;
  scrollbar: ScrollbarTokens;
}

/** Tenant-specific theme overrides */
export interface TenantThemeConfig {
  tenantId: string;
  tenantName: string;
  createdAt: string;
  updatedAt: string;
  theme: Partial<LXD360Theme>;
}

/** Export format options */
export type ExportFormat = 'css' | 'tsx' | 'json' | 'tailwind';

/** Theme export configuration */
export interface ThemeExportConfig {
  format: ExportFormat;
  includeAnimations: boolean;
  includeComponents: boolean;
  minify: boolean;
  prefix?: string;
}
