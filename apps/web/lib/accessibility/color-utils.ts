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
  aa: boolean;
  aaLarge: boolean;
  aaa: boolean;
  aaaLarge: boolean;
}

export type ColorBlindnessType = 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

// ============================================================================
// Color Parsing
// ============================================================================

/**
 * Parse a color string into RGB values
 */
export function parseColor(color: string): RGB | null {
  // Handle hex colors
  const hexMatch = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (hexMatch) {
    return {
      r: parseInt(hexMatch[1], 16),
      g: parseInt(hexMatch[2], 16),
      b: parseInt(hexMatch[3], 16),
    };
  }

  // Handle short hex
  const shortHexMatch = color.match(/^#?([a-f\d])([a-f\d])([a-f\d])$/i);
  if (shortHexMatch) {
    return {
      r: parseInt(shortHexMatch[1] + shortHexMatch[1], 16),
      g: parseInt(shortHexMatch[2] + shortHexMatch[2], 16),
      b: parseInt(shortHexMatch[3] + shortHexMatch[3], 16),
    };
  }

  // Handle rgb()
  const rgbMatch = color.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }

  // Handle rgba()
  const rgbaMatch = color.match(/^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)$/i);
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1], 10),
      g: parseInt(rgbaMatch[2], 10),
      b: parseInt(rgbaMatch[3], 10),
    };
  }

  return null;
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number): string => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
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
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

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
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// ============================================================================
// Luminance & Contrast
// ============================================================================

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 formula
 */
export function getRelativeLuminance(rgb: RGB): number {
  const sRGB = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
  const linear = sRGB.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1 and 21
 */
export function getContrastRatio(color1: string | RGB, color2: string | RGB): number {
  const rgb1 = typeof color1 === 'string' ? parseColor(color1) : color1;
  const rgb2 = typeof color2 === 'string' ? parseColor(color2) : color2;

  if (!rgb1 || !rgb2) return 1;

  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color combination meets WCAG requirements
 */
export function checkContrast(foreground: string | RGB, background: string | RGB): ContrastResult {
  const ratio = getContrastRatio(foreground, background);

  return {
    ratio: Math.round(ratio * 100) / 100,
    aa: ratio >= 4.5, // Normal text AA
    aaLarge: ratio >= 3, // Large text AA
    aaa: ratio >= 7, // Normal text AAA
    aaaLarge: ratio >= 4.5, // Large text AAA
  };
}

/**
 * Get a readable text color (black or white) for a background
 */
export function getReadableTextColor(backgroundColor: string | RGB): string {
  const rgb = typeof backgroundColor === 'string' ? parseColor(backgroundColor) : backgroundColor;

  if (!rgb) return '#000000';

  const luminance = getRelativeLuminance(rgb);

  // Use white text if background is dark, black if light
  return luminance > 0.179 ? '#000000' : '#ffffff';
}

// ============================================================================
// Color Adjustment
// ============================================================================

/**
 * Adjust color lightness to meet contrast requirements
 */
export function adjustForContrast(
  foreground: string | RGB,
  background: string | RGB,
  targetRatio: number = 4.5,
): string {
  const fgRgb = typeof foreground === 'string' ? parseColor(foreground) : foreground;
  const bgRgb = typeof background === 'string' ? parseColor(background) : background;

  if (!fgRgb || !bgRgb)
    return typeof foreground === 'string' ? foreground : rgbToHex(foreground as RGB);

  let currentRatio = getContrastRatio(fgRgb, bgRgb);

  if (currentRatio >= targetRatio) {
    return rgbToHex(fgRgb);
  }

  const bgLuminance = getRelativeLuminance(bgRgb);
  const fgHsl = rgbToHsl(fgRgb);

  // Determine if we should lighten or darken
  const shouldDarken = bgLuminance > 0.5;

  // Binary search for the right lightness
  let minL = shouldDarken ? 0 : fgHsl.l;
  let maxL = shouldDarken ? fgHsl.l : 100;
  let bestL = fgHsl.l;

  for (let i = 0; i < 20; i++) {
    const midL = (minL + maxL) / 2;
    const testRgb = hslToRgb({ ...fgHsl, l: midL });
    currentRatio = getContrastRatio(testRgb, bgRgb);

    if (currentRatio >= targetRatio) {
      bestL = midL;
      if (shouldDarken) {
        minL = midL;
      } else {
        maxL = midL;
      }
    } else {
      if (shouldDarken) {
        maxL = midL;
      } else {
        minL = midL;
      }
    }
  }

  return rgbToHex(hslToRgb({ ...fgHsl, l: bestL }));
}

/**
 * Generate accessible color variations
 */
export function generateAccessiblePalette(baseColor: string | RGB, count: number = 5): string[] {
  const rgb = typeof baseColor === 'string' ? parseColor(baseColor) : baseColor;
  if (!rgb) return [];

  const hsl = rgbToHsl(rgb);
  const palette: string[] = [];

  // Generate variations with different lightness values
  const step = 100 / (count + 1);

  for (let i = 1; i <= count; i++) {
    const l = Math.max(10, Math.min(90, step * i));
    palette.push(rgbToHex(hslToRgb({ ...hsl, l })));
  }

  return palette;
}

// ============================================================================
// Color Blindness Simulation
// ============================================================================

/**
 * Simulate how a color appears to people with color blindness
 */
export function simulateColorBlindness(color: string | RGB, type: ColorBlindnessType): string {
  const rgb = typeof color === 'string' ? parseColor(color) : color;
  if (!rgb) return typeof color === 'string' ? color : rgbToHex(color as RGB);

  // Color blindness simulation matrices
  const matrices: Record<ColorBlindnessType, number[][]> = {
    // Red-blind
    protanopia: [
      [0.567, 0.433, 0],
      [0.558, 0.442, 0],
      [0, 0.242, 0.758],
    ],
    // Green-blind
    deuteranopia: [
      [0.625, 0.375, 0],
      [0.7, 0.3, 0],
      [0, 0.3, 0.7],
    ],
    // Blue-blind
    tritanopia: [
      [0.95, 0.05, 0],
      [0, 0.433, 0.567],
      [0, 0.475, 0.525],
    ],
    // Complete color blindness
    achromatopsia: [
      [0.299, 0.587, 0.114],
      [0.299, 0.587, 0.114],
      [0.299, 0.587, 0.114],
    ],
  };

  const matrix = matrices[type];
  const r = rgb.r;
  const g = rgb.g;
  const b = rgb.b;

  return rgbToHex({
    r: matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b,
    g: matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b,
    b: matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b,
  });
}

// ============================================================================
// High Contrast Mode Detection
// ============================================================================

/**
 * Check if high contrast mode is enabled
 */
export function isHighContrastMode(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for forced-colors media query
  return window.matchMedia('(forced-colors: active)').matches;
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if user prefers dark color scheme
 */
export function prefersDarkMode(): boolean {
  if (typeof window === 'undefined') return false;

  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Listen for accessibility preference changes
 */
export function onPreferenceChange(
  preference: 'high-contrast' | 'reduced-motion' | 'color-scheme',
  callback: (enabled: boolean) => void,
): () => void {
  if (typeof window === 'undefined') return () => {};

  const mediaQueries: Record<string, string> = {
    'high-contrast': '(forced-colors: active)',
    'reduced-motion': '(prefers-reduced-motion: reduce)',
    'color-scheme': '(prefers-color-scheme: dark)',
  };

  const mq = window.matchMedia(mediaQueries[preference]);

  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches);
  };

  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}

// ============================================================================
// CSS Variables
// ============================================================================

/**
 * Get computed CSS variable value
 */
export function getCssVariable(name: string): string {
  if (typeof window === 'undefined') return '';

  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Set CSS variable
 */
export function setCssVariable(name: string, value: string): void {
  if (typeof document === 'undefined') return;

  document.documentElement.style.setProperty(name, value);
}

// ============================================================================
// Focus Visible Utilities
// ============================================================================

/**
 * Generate focus ring CSS properties
 */
export function getFocusRingStyles(
  options: {
    color?: string;
    width?: number;
    offset?: number;
    style?: 'solid' | 'dotted' | 'dashed';
  } = {},
): Record<string, string> {
  const { color = '#2563eb', width = 2, offset = 2, style = 'solid' } = options;

  return {
    outline: `${width}px ${style} ${color}`,
    outlineOffset: `${offset}px`,
  };
}

// ============================================================================
// Exports
// ============================================================================

export const contrastRatios = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3,
  AAA_NORMAL: 7,
  AAA_LARGE: 4.5,
  UI_COMPONENT: 3,
} as const;
