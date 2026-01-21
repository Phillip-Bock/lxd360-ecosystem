// ============================================================================
// Types
// ============================================================================

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface ContrastResult {
  ratio: number;
  level: 'AAA' | 'AA' | 'AA-Large' | 'Fail';
  passesNormalText: boolean;
  passesLargeText: boolean;
  passesUI: boolean;
}

export interface AccessibilityScore {
  overall: number;
  colorContrast: number;
  touchTargets: number;
  focusIndicators: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  issues: AccessibilityIssue[];
}

export interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  category: 'contrast' | 'touch-target' | 'focus' | 'motion' | 'color-only';
  message: string;
  wcagCriteria: string;
  element?: string;
  recommendation: string;
}

export interface TouchTargetResult {
  width: number;
  height: number;
  passes: boolean;
  minimumSize: number;
  recommendation: string;
}

export interface FocusIndicatorResult {
  visible: boolean;
  contrast: number;
  thickness: number;
  passes: boolean;
  issues: string[];
}

// ============================================================================
// Constants
// ============================================================================

/** WCAG 2.1 minimum contrast ratios */
export const WCAG_CONTRAST = {
  /** Normal text (< 18pt or < 14pt bold) */
  AA_NORMAL: 4.5,
  /** Large text (>= 18pt or >= 14pt bold) */
  AA_LARGE: 3.0,
  /** UI components and graphical objects */
  AA_UI: 3.0,
  /** Enhanced - normal text */
  AAA_NORMAL: 7.0,
  /** Enhanced - large text */
  AAA_LARGE: 4.5,
} as const;

/** WCAG 2.2 touch target requirements */
export const WCAG_TOUCH_TARGET = {
  /** Minimum touch target size (Level AA) */
  MINIMUM: 24,
  /** Enhanced touch target size (better UX) */
  ENHANCED: 44,
} as const;

/** Focus indicator requirements */
export const WCAG_FOCUS = {
  /** Minimum contrast for focus indicator */
  MIN_CONTRAST: 3.0,
  /** Minimum thickness in pixels */
  MIN_THICKNESS: 2,
} as const;

// ============================================================================
// Color Conversion Functions
// ============================================================================

/**
 * Parse a color string to RGB values
 */
export function parseColor(color: string): RGB | null {
  // Handle hex colors
  if (color.startsWith('#')) {
    return hexToRgb(color);
  }

  // Handle rgb/rgba
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }

  // Handle hsl/hsla
  const hslMatch = color.match(/hsla?\((\d+),?\s*(\d+)%?,?\s*(\d+)%?/);
  if (hslMatch) {
    return hslToRgb({
      h: parseInt(hslMatch[1], 10),
      s: parseInt(hslMatch[2], 10),
      l: parseInt(hslMatch[3], 10),
    });
  }

  return null;
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    // Handle shorthand hex (#abc -> #aabbcc)
    const short = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
    if (short) {
      return {
        r: parseInt(short[1] + short[1], 16),
        g: parseInt(short[2] + short[2], 16),
        b: parseInt(short[3] + short[3], 16),
      };
    }
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  if (s === 0) {
    const gray = Math.round(l * 255);
    return { r: gray, g: gray, b: gray };
  }

  const hue2rgb = (p: number, q: number, t: number): number => {
    let tNorm = t;
    if (tNorm < 0) tNorm += 1;
    if (tNorm > 1) tNorm -= 1;
    if (tNorm < 1 / 6) return p + (q - p) * 6 * tNorm;
    if (tNorm < 1 / 2) return q;
    if (tNorm < 2 / 3) return p + (q - p) * (2 / 3 - tNorm) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    case b:
      h = ((r - g) / d + 4) / 6;
      break;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to hex
 */
export function hslToHex(hsl: HSL): string {
  return rgbToHex(hslToRgb(hsl));
}

// ============================================================================
// Luminance & Contrast Functions
// ============================================================================

/**
 * Calculate relative luminance per WCAG 2.1
 * @see https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
export function getRelativeLuminance(rgb: RGB): number {
  const sRGB = [rgb.r, rgb.g, rgb.b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

/**
 * Calculate contrast ratio between two colors
 * @see https://www.w3.org/WAI/GL/wiki/Contrast_ratio
 */
export function getContrastRatio(color1: RGB, color2: RGB): number {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Calculate contrast ratio from color strings
 */
export function getContrastFromStrings(foreground: string, background: string): number {
  const fg = parseColor(foreground);
  const bg = parseColor(background);
  if (!fg || !bg) return 0;
  return getContrastRatio(fg, bg);
}

/**
 * Check contrast compliance and return detailed result
 */
export function checkContrast(foreground: string, background: string): ContrastResult {
  const ratio = getContrastFromStrings(foreground, background);

  let level: ContrastResult['level'] = 'Fail';
  if (ratio >= WCAG_CONTRAST.AAA_NORMAL) {
    level = 'AAA';
  } else if (ratio >= WCAG_CONTRAST.AA_NORMAL) {
    level = 'AA';
  } else if (ratio >= WCAG_CONTRAST.AA_LARGE) {
    level = 'AA-Large';
  }

  return {
    ratio,
    level,
    passesNormalText: ratio >= WCAG_CONTRAST.AA_NORMAL,
    passesLargeText: ratio >= WCAG_CONTRAST.AA_LARGE,
    passesUI: ratio >= WCAG_CONTRAST.AA_UI,
  };
}

/**
 * Find a color with sufficient contrast
 */
export function findAccessibleColor(
  targetColor: HSL,
  backgroundColor: string,
  minContrast: number = WCAG_CONTRAST.AA_NORMAL,
): HSL {
  const bg = parseColor(backgroundColor);
  if (!bg) return targetColor;

  const bgLuminance = getRelativeLuminance(bg);
  const shouldDarken = bgLuminance < 0.5;

  let currentColor = { ...targetColor };
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const rgb = hslToRgb(currentColor);
    const ratio = getContrastRatio(rgb, bg);

    if (ratio >= minContrast) {
      return currentColor;
    }

    // Adjust lightness
    if (shouldDarken) {
      currentColor = { ...currentColor, l: Math.max(0, currentColor.l - 2) };
    } else {
      currentColor = { ...currentColor, l: Math.min(100, currentColor.l + 2) };
    }

    attempts++;
  }

  // If we couldn't find a match, return black or white
  return shouldDarken ? { h: 0, s: 0, l: 0 } : { h: 0, s: 0, l: 100 };
}

// ============================================================================
// Touch Target Validation
// ============================================================================

/**
 * Validate touch target size per WCAG 2.2
 */
export function validateTouchTarget(
  width: number,
  height: number,
  enhanced: boolean = false,
): TouchTargetResult {
  const minimumSize = enhanced ? WCAG_TOUCH_TARGET.ENHANCED : WCAG_TOUCH_TARGET.MINIMUM;
  const passes = width >= minimumSize && height >= minimumSize;

  let recommendation = '';
  if (!passes) {
    const widthDiff = Math.max(0, minimumSize - width);
    const heightDiff = Math.max(0, minimumSize - height);
    recommendation = `Increase size by ${widthDiff}px width and ${heightDiff}px height to meet ${enhanced ? 'enhanced (44px)' : 'minimum (24px)'} requirements.`;
  }

  return {
    width,
    height,
    passes,
    minimumSize,
    recommendation,
  };
}

// ============================================================================
// Focus Indicator Validation
// ============================================================================

/**
 * Validate focus indicator per WCAG 2.2
 */
export function validateFocusIndicator(
  focusColor: string,
  backgroundColor: string,
  thickness: number = 2,
): FocusIndicatorResult {
  const contrast = getContrastFromStrings(focusColor, backgroundColor);
  const issues: string[] = [];

  if (contrast < WCAG_FOCUS.MIN_CONTRAST) {
    issues.push(`Focus indicator contrast (${contrast.toFixed(2)}:1) is below minimum 3:1 ratio.`);
  }

  if (thickness < WCAG_FOCUS.MIN_THICKNESS) {
    issues.push(`Focus indicator thickness (${thickness}px) is below minimum 2px.`);
  }

  return {
    visible: true,
    contrast,
    thickness,
    passes: contrast >= WCAG_FOCUS.MIN_CONTRAST && thickness >= WCAG_FOCUS.MIN_THICKNESS,
    issues,
  };
}

// ============================================================================
// Accessibility Scoring
// ============================================================================

/**
 * Calculate overall accessibility score
 */
export function calculateAccessibilityScore(
  contrastResults: ContrastResult[],
  touchTargetResults: TouchTargetResult[],
  focusResults: FocusIndicatorResult[],
): AccessibilityScore {
  const issues: AccessibilityIssue[] = [];

  // Calculate contrast score
  const passingContrasts = contrastResults.filter((r) => r.passesNormalText).length;
  const colorContrast =
    contrastResults.length > 0 ? (passingContrasts / contrastResults.length) * 100 : 100;

  // Add contrast issues
  contrastResults.forEach((result, index) => {
    if (!result.passesNormalText) {
      issues.push({
        type: result.passesLargeText ? 'warning' : 'error',
        category: 'contrast',
        message: `Color pair ${index + 1} has insufficient contrast (${result.ratio.toFixed(2)}:1)`,
        wcagCriteria: '1.4.3 Contrast (Minimum)',
        recommendation: `Increase contrast ratio to at least 4.5:1 for normal text or 3:1 for large text.`,
      });
    }
  });

  // Calculate touch target score
  const passingTargets = touchTargetResults.filter((r) => r.passes).length;
  const touchTargets =
    touchTargetResults.length > 0 ? (passingTargets / touchTargetResults.length) * 100 : 100;

  // Add touch target issues
  touchTargetResults.forEach((result) => {
    if (!result.passes) {
      issues.push({
        type: 'error',
        category: 'touch-target',
        message: `Touch target is ${result.width}x${result.height}px, below ${result.minimumSize}px minimum`,
        wcagCriteria: '2.5.8 Target Size (Minimum)',
        recommendation: result.recommendation,
      });
    }
  });

  // Calculate focus indicator score
  const passingFocus = focusResults.filter((r) => r.passes).length;
  const focusIndicators =
    focusResults.length > 0 ? (passingFocus / focusResults.length) * 100 : 100;

  // Add focus issues
  focusResults.forEach((result) => {
    result.issues.forEach((issue) => {
      issues.push({
        type: 'warning',
        category: 'focus',
        message: issue,
        wcagCriteria: '2.4.7 Focus Visible',
        recommendation:
          'Ensure focus indicators have at least 3:1 contrast and 2px minimum thickness.',
      });
    });
  });

  // Calculate overall score
  const overall = colorContrast * 0.5 + touchTargets * 0.25 + focusIndicators * 0.25;

  // Determine grade
  let grade: AccessibilityScore['grade'] = 'F';
  if (overall >= 90) grade = 'A';
  else if (overall >= 80) grade = 'B';
  else if (overall >= 70) grade = 'C';
  else if (overall >= 60) grade = 'D';

  return {
    overall,
    colorContrast,
    touchTargets,
    focusIndicators,
    grade,
    issues,
  };
}

// ============================================================================
// Gradient Contrast Analysis
// ============================================================================

/**
 * Analyze contrast for gradient backgrounds
 */
export function analyzeGradientContrast(
  foregroundColor: string,
  gradientColors: string[],
): { minContrast: number; maxContrast: number; worstColor: string; passes: boolean } {
  let minContrast = Infinity;
  let maxContrast = 0;
  let worstColor = gradientColors[0];

  gradientColors.forEach((bgColor) => {
    const contrast = getContrastFromStrings(foregroundColor, bgColor);
    if (contrast < minContrast) {
      minContrast = contrast;
      worstColor = bgColor;
    }
    if (contrast > maxContrast) {
      maxContrast = contrast;
    }
  });

  return {
    minContrast,
    maxContrast,
    worstColor,
    passes: minContrast >= WCAG_CONTRAST.AA_NORMAL,
  };
}

// ============================================================================
// Color Blindness Simulation
// ============================================================================

type ColorBlindnessType = 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

/**
 * Simulate how a color appears with color blindness
 */
export function simulateColorBlindness(rgb: RGB, type: ColorBlindnessType): RGB {
  const { r, g, b } = rgb;

  switch (type) {
    case 'protanopia': // Red-blind
      return {
        r: Math.round(0.567 * r + 0.433 * g),
        g: Math.round(0.558 * r + 0.442 * g),
        b: Math.round(0.242 * g + 0.758 * b),
      };
    case 'deuteranopia': // Green-blind
      return {
        r: Math.round(0.625 * r + 0.375 * g),
        g: Math.round(0.7 * r + 0.3 * g),
        b: Math.round(0.3 * g + 0.7 * b),
      };
    case 'tritanopia': // Blue-blind
      return {
        r: Math.round(0.95 * r + 0.05 * g),
        g: Math.round(0.433 * g + 0.567 * b),
        b: Math.round(0.475 * g + 0.525 * b),
      };
    case 'achromatopsia': {
      // Complete color blindness
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      return { r: gray, g: gray, b: gray };
    }
    default:
      return rgb;
  }
}

// ============================================================================
// Utility Exports
// ============================================================================

export const WCAGUtils = {
  parseColor,
  hexToRgb,
  rgbToHex,
  hslToRgb,
  rgbToHsl,
  hslToHex,
  getRelativeLuminance,
  getContrastRatio,
  getContrastFromStrings,
  checkContrast,
  findAccessibleColor,
  validateTouchTarget,
  validateFocusIndicator,
  calculateAccessibilityScore,
  analyzeGradientContrast,
  simulateColorBlindness,
  WCAG_CONTRAST,
  WCAG_TOUCH_TARGET,
  WCAG_FOCUS,
};
