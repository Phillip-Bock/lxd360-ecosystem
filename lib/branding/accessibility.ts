// ============================================================================
// Types
// ============================================================================

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface HSLColor {
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
  score: 'fail' | 'aa-large' | 'aa' | 'aaa';
  recommendation?: string;
}

export interface AccessibilityAudit {
  overallScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  issues: AccessibilityIssue[];
  passed: number;
  failed: number;
  warnings: number;
}

export interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  element: string;
  description: string;
  wcagCriteria: string;
  suggestion?: string;
  contrastRatio?: number;
  requiredRatio?: number;
}

export type ColorBlindnessType =
  | 'normal'
  | 'protanopia'
  | 'deuteranopia'
  | 'tritanopia'
  | 'protanomaly'
  | 'deuteranomaly'
  | 'tritanomaly'
  | 'achromatopsia';

// ============================================================================
// Color Conversion Utilities
// ============================================================================

export function hexToRgb(hex: string): RGBColor {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: Number.parseInt(result[1], 16),
    g: Number.parseInt(result[2], 16),
    b: Number.parseInt(result[3], 16),
  };
}

export function rgbToHex(rgb: RGBColor): string {
  return `#${((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1)}`;
}

export function hslToRgb(h: number, s: number, l: number): RGBColor {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return {
    r: Math.round(255 * f(0)),
    g: Math.round(255 * f(8)),
    b: Math.round(255 * f(4)),
  };
}

export function rgbToHsl(r: number, g: number, b: number): HSLColor {
  r /= 255;
  g /= 255;
  b /= 255;
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

export function parseColor(color: string): RGBColor {
  // Handle hex
  if (color.startsWith('#')) {
    return hexToRgb(color);
  }
  // Handle hsl
  if (color.startsWith('hsl')) {
    const match = color.match(/hsl\((\d+)\s+(\d+)%?\s+(\d+)%?/);
    if (match) {
      return hslToRgb(
        Number.parseInt(match[1], 10),
        Number.parseInt(match[2], 10),
        Number.parseInt(match[3], 10),
      );
    }
  }
  // Handle rgb
  if (color.startsWith('rgb')) {
    const match = color.match(/rgb\((\d+),?\s*(\d+),?\s*(\d+)/);
    if (match) {
      return {
        r: Number.parseInt(match[1], 10),
        g: Number.parseInt(match[2], 10),
        b: Number.parseInt(match[3], 10),
      };
    }
  }
  return { r: 0, g: 0, b: 0 };
}

// ============================================================================
// WCAG 2.2 Contrast Calculation
// ============================================================================

function getLuminance(rgb: RGBColor): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = parseColor(color1);
  const rgb2 = parseColor(color2);
  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

export function checkContrast(foreground: string, background: string): ContrastResult {
  const ratio = getContrastRatio(foreground, background);
  const roundedRatio = Math.round(ratio * 100) / 100;

  const result: ContrastResult = {
    ratio: roundedRatio,
    aaLarge: ratio >= 3,
    aa: ratio >= 4.5,
    aaaLarge: ratio >= 4.5,
    aaa: ratio >= 7,
    score: 'fail',
  };

  if (ratio >= 7) {
    result.score = 'aaa';
  } else if (ratio >= 4.5) {
    result.score = 'aa';
  } else if (ratio >= 3) {
    result.score = 'aa-large';
  } else {
    result.score = 'fail';
    result.recommendation = suggestContrastFix(foreground, background);
  }

  return result;
}

// ============================================================================
// Auto-Fix Suggestions
// ============================================================================

function suggestContrastFix(foreground: string, background: string): string {
  const fgRgb = parseColor(foreground);
  const bgRgb = parseColor(background);
  const fgHsl = rgbToHsl(fgRgb.r, fgRgb.g, fgRgb.b);
  const bgHsl = rgbToHsl(bgRgb.r, bgRgb.g, bgRgb.b);

  // Determine if we should lighten or darken
  if (fgHsl.l > bgHsl.l) {
    // Foreground is lighter, try making it even lighter or background darker
    return `Try lightening foreground to L:${Math.min(100, fgHsl.l + 20)}% or darkening background to L:${Math.max(0, bgHsl.l - 15)}%`;
  } else {
    // Foreground is darker, try making it darker or background lighter
    return `Try darkening foreground to L:${Math.max(0, fgHsl.l - 20)}% or lightening background to L:${Math.min(100, bgHsl.l + 15)}%`;
  }
}

// ============================================================================
// Color Blindness Simulation
// ============================================================================

// Color blindness simulation matrices (Brettel et al.)
const colorBlindnessMatrices: Record<ColorBlindnessType, number[][]> = {
  normal: [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ],
  // Protanopia (red-blind)
  protanopia: [
    [0.567, 0.433, 0],
    [0.558, 0.442, 0],
    [0, 0.242, 0.758],
  ],
  // Deuteranopia (green-blind)
  deuteranopia: [
    [0.625, 0.375, 0],
    [0.7, 0.3, 0],
    [0, 0.3, 0.7],
  ],
  // Tritanopia (blue-blind)
  tritanopia: [
    [0.95, 0.05, 0],
    [0, 0.433, 0.567],
    [0, 0.475, 0.525],
  ],
  // Protanomaly (red-weak)
  protanomaly: [
    [0.817, 0.183, 0],
    [0.333, 0.667, 0],
    [0, 0.125, 0.875],
  ],
  // Deuteranomaly (green-weak)
  deuteranomaly: [
    [0.8, 0.2, 0],
    [0.258, 0.742, 0],
    [0, 0.142, 0.858],
  ],
  // Tritanomaly (blue-weak)
  tritanomaly: [
    [0.967, 0.033, 0],
    [0, 0.733, 0.267],
    [0, 0.183, 0.817],
  ],
  // Achromatopsia (total color blindness)
  achromatopsia: [
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
  ],
};

export function simulateColorBlindness(color: string, type: ColorBlindnessType): string {
  const rgb = parseColor(color);
  const matrix = colorBlindnessMatrices[type];

  const newR = Math.round(rgb.r * matrix[0][0] + rgb.g * matrix[0][1] + rgb.b * matrix[0][2]);
  const newG = Math.round(rgb.r * matrix[1][0] + rgb.g * matrix[1][1] + rgb.b * matrix[1][2]);
  const newB = Math.round(rgb.r * matrix[2][0] + rgb.g * matrix[2][1] + rgb.b * matrix[2][2]);

  return rgbToHex({
    r: Math.min(255, Math.max(0, newR)),
    g: Math.min(255, Math.max(0, newG)),
    b: Math.min(255, Math.max(0, newB)),
  });
}

export function simulatePaletteColorBlindness(
  palette: Record<string, string>,
  type: ColorBlindnessType,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(palette)) {
    result[key] = simulateColorBlindness(value, type);
  }
  return result;
}

// ============================================================================
// Comprehensive Accessibility Audit
// ============================================================================

export function auditAccessibility(theme: {
  colors: Record<string, string>;
  textColors: string[];
  backgroundColors: string[];
}): AccessibilityAudit {
  const issues: AccessibilityIssue[] = [];
  let passed = 0;
  let failed = 0;
  let warnings = 0;

  // Check all text/background combinations
  for (const textColor of theme.textColors) {
    for (const bgColor of theme.backgroundColors) {
      const result = checkContrast(theme.colors[textColor], theme.colors[bgColor]);

      if (result.score === 'fail') {
        failed++;
        issues.push({
          type: 'error',
          element: `${textColor} on ${bgColor}`,
          description: `Contrast ratio ${result.ratio}:1 fails WCAG AA`,
          wcagCriteria: '1.4.3 Contrast (Minimum)',
          suggestion: result.recommendation,
          contrastRatio: result.ratio,
          requiredRatio: 4.5,
        });
      } else if (result.score === 'aa-large') {
        warnings++;
        issues.push({
          type: 'warning',
          element: `${textColor} on ${bgColor}`,
          description: `Contrast ratio ${result.ratio}:1 only passes for large text`,
          wcagCriteria: '1.4.3 Contrast (Minimum)',
          contrastRatio: result.ratio,
          requiredRatio: 4.5,
        });
      } else {
        passed++;
      }
    }
  }

  // Calculate overall score
  const total = passed + failed + warnings;
  const score = total > 0 ? Math.round((passed / total) * 100) : 100;

  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';
  else grade = 'F';

  return {
    overallScore: score,
    grade,
    issues,
    passed,
    failed,
    warnings,
  };
}

// ============================================================================
// APCA (Advanced Perceptual Contrast Algorithm) - WCAG 3.0 Preview
// ============================================================================

export function getAPCAContrast(textColor: string, bgColor: string): number {
  const txtRgb = parseColor(textColor);
  const bgRgb = parseColor(bgColor);

  // Convert to Y (luminance)
  const txtY =
    0.2126 * (txtRgb.r / 255) ** 2.4 +
    0.7152 * (txtRgb.g / 255) ** 2.4 +
    0.0722 * (txtRgb.b / 255) ** 2.4;
  const bgY =
    0.2126 * (bgRgb.r / 255) ** 2.4 +
    0.7152 * (bgRgb.g / 255) ** 2.4 +
    0.0722 * (bgRgb.b / 255) ** 2.4;

  // APCA calculation (simplified)
  const Sapc =
    bgY > txtY ? (bgY ** 0.56 - txtY ** 0.57) * 1.14 : (bgY ** 0.65 - txtY ** 0.62) * 1.14;

  return Math.round(Math.abs(Sapc) * 100);
}
