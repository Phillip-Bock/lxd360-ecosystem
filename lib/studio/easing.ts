/**
 * Easing functions library
 * All functions take t (0-1) and return eased value (0-1)
 */

import type { EasingFunction } from '@/types/studio/timeline';

export type EasingFn = (t: number) => number;

// =============================================================================
// LINEAR
// =============================================================================

export const linear: EasingFn = (t) => t;

// =============================================================================
// QUAD (POWER OF 2)
// =============================================================================

export const easeInQuad: EasingFn = (t) => t * t;
export const easeOutQuad: EasingFn = (t) => t * (2 - t);
export const easeInOutQuad: EasingFn = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

// =============================================================================
// CUBIC (POWER OF 3)
// =============================================================================

export const easeInCubic: EasingFn = (t) => t * t * t;
export const easeOutCubic: EasingFn = (t) => {
  const t1 = t - 1;
  return t1 * t1 * t1 + 1;
};
export const easeInOutCubic: EasingFn = (t) =>
  t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

// =============================================================================
// QUART (POWER OF 4)
// =============================================================================

export const easeInQuart: EasingFn = (t) => t * t * t * t;
export const easeOutQuart: EasingFn = (t) => {
  const t1 = t - 1;
  return 1 - t1 * t1 * t1 * t1;
};
export const easeInOutQuart: EasingFn = (t) => {
  if (t < 0.5) {
    return 8 * t * t * t * t;
  }
  const t1 = t - 1;
  return 1 - 8 * t1 * t1 * t1 * t1;
};

// =============================================================================
// QUINT (POWER OF 5)
// =============================================================================

export const easeInQuint: EasingFn = (t) => t * t * t * t * t;
export const easeOutQuint: EasingFn = (t) => {
  const t1 = t - 1;
  return 1 + t1 * t1 * t1 * t1 * t1;
};
export const easeInOutQuint: EasingFn = (t) => {
  if (t < 0.5) {
    return 16 * t * t * t * t * t;
  }
  const t1 = t - 1;
  return 1 + 16 * t1 * t1 * t1 * t1 * t1;
};

// =============================================================================
// EXPONENTIAL
// =============================================================================

export const easeInExpo: EasingFn = (t) => (t === 0 ? 0 : 2 ** (10 * (t - 1)));
export const easeOutExpo: EasingFn = (t) => (t === 1 ? 1 : 1 - 2 ** (-10 * t));
export const easeInOutExpo: EasingFn = (t) => {
  if (t === 0) return 0;
  if (t === 1) return 1;
  if (t < 0.5) return 2 ** (20 * t - 10) / 2;
  return (2 - 2 ** (-20 * t + 10)) / 2;
};

// =============================================================================
// CIRCULAR
// =============================================================================

export const easeInCirc: EasingFn = (t) => 1 - Math.sqrt(1 - t * t);
export const easeOutCirc: EasingFn = (t) => {
  const t1 = t - 1;
  return Math.sqrt(1 - t1 * t1);
};
export const easeInOutCirc: EasingFn = (t) =>
  t < 0.5
    ? (1 - Math.sqrt(1 - 4 * t * t)) / 2
    : (Math.sqrt(1 - (-2 * t + 2) * (-2 * t + 2)) + 1) / 2;

// =============================================================================
// BACK (OVERSHOOT)
// =============================================================================

const c1 = 1.70158;
const c2 = c1 * 1.525;
const c3 = c1 + 1;

export const easeInBack: EasingFn = (t) => c3 * t * t * t - c1 * t * t;
export const easeOutBack: EasingFn = (t) => 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
export const easeInOutBack: EasingFn = (t) =>
  t < 0.5
    ? ((2 * t) ** 2 * ((c2 + 1) * 2 * t - c2)) / 2
    : ((2 * t - 2) ** 2 * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;

// =============================================================================
// ELASTIC
// =============================================================================

const c4 = (2 * Math.PI) / 3;
const c5 = (2 * Math.PI) / 4.5;

export const easeInElastic: EasingFn = (t) => {
  if (t === 0) return 0;
  if (t === 1) return 1;
  return -(2 ** (10 * t - 10)) * Math.sin((t * 10 - 10.75) * c4);
};
export const easeOutElastic: EasingFn = (t) => {
  if (t === 0) return 0;
  if (t === 1) return 1;
  return 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};
export const easeInOutElastic: EasingFn = (t) => {
  if (t === 0) return 0;
  if (t === 1) return 1;
  if (t < 0.5) return -(2 ** (20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2;
  return (2 ** (-20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
};

// =============================================================================
// BOUNCE
// =============================================================================

export const easeOutBounce: EasingFn = (t) => {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) {
    const t1 = t - 1.5 / d1;
    return n1 * t1 * t1 + 0.75;
  }
  if (t < 2.5 / d1) {
    const t1 = t - 2.25 / d1;
    return n1 * t1 * t1 + 0.9375;
  }
  const t1 = t - 2.625 / d1;
  return n1 * t1 * t1 + 0.984375;
};

export const easeInBounce: EasingFn = (t) => 1 - easeOutBounce(1 - t);
export const easeInOutBounce: EasingFn = (t) =>
  t < 0.5 ? (1 - easeOutBounce(1 - 2 * t)) / 2 : (1 + easeOutBounce(2 * t - 1)) / 2;

// =============================================================================
// SPRING (PHYSICS-BASED)
// =============================================================================

export function createSpring(
  stiffness: number = 100,
  damping: number = 10,
  mass: number = 1,
): EasingFn {
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));

  return (t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;

    if (zeta < 1) {
      // Underdamped
      const wd = w0 * Math.sqrt(1 - zeta * zeta);
      return (
        1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t))
      );
    } else if (zeta === 1) {
      // Critically damped
      return 1 - (1 + w0 * t) * Math.exp(-w0 * t);
    } else {
      // Overdamped
      const sqrtDiff = Math.sqrt(zeta * zeta - 1);
      const s1 = -w0 * (zeta + sqrtDiff);
      const s2 = -w0 * (zeta - sqrtDiff);
      return 1 - (s2 * Math.exp(s1 * t) - s1 * Math.exp(s2 * t)) / (s2 - s1);
    }
  };
}

// Default spring with balanced feel
export const spring: EasingFn = createSpring(100, 10, 1);

// =============================================================================
// CUBIC BEZIER
// =============================================================================

export function createCubicBezier(x1: number, y1: number, x2: number, y2: number): EasingFn {
  // Newton-Raphson iteration for finding t given x
  const NEWTON_ITERATIONS = 4;
  const NEWTON_MIN_SLOPE = 0.001;

  const ax = 3 * x1 - 3 * x2 + 1;
  const bx = 3 * x2 - 6 * x1;
  const cx = 3 * x1;

  const ay = 3 * y1 - 3 * y2 + 1;
  const by = 3 * y2 - 6 * y1;
  const cy = 3 * y1;

  const sampleCurveX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleCurveY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleCurveDerivativeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  const solveCurveX = (x: number) => {
    let t = x;
    for (let i = 0; i < NEWTON_ITERATIONS; i++) {
      const slope = sampleCurveDerivativeX(t);
      if (Math.abs(slope) < NEWTON_MIN_SLOPE) break;
      t -= (sampleCurveX(t) - x) / slope;
    }
    return t;
  };

  return (x: number) => {
    if (x === 0 || x === 1) return x;
    return sampleCurveY(solveCurveX(x));
  };
}

// =============================================================================
// EASING REGISTRY
// =============================================================================

export const easingFunctions: Record<string, EasingFn> = {
  linear,
  ease: createCubicBezier(0.25, 0.1, 0.25, 1),
  'ease-in': createCubicBezier(0.42, 0, 1, 1),
  'ease-out': createCubicBezier(0, 0, 0.58, 1),
  'ease-in-out': createCubicBezier(0.42, 0, 0.58, 1),
  'ease-in-quad': easeInQuad,
  'ease-out-quad': easeOutQuad,
  'ease-in-out-quad': easeInOutQuad,
  'ease-in-cubic': easeInCubic,
  'ease-out-cubic': easeOutCubic,
  'ease-in-out-cubic': easeInOutCubic,
  'ease-in-quart': easeInQuart,
  'ease-out-quart': easeOutQuart,
  'ease-in-out-quart': easeInOutQuart,
  'ease-in-quint': easeInQuint,
  'ease-out-quint': easeOutQuint,
  'ease-in-out-quint': easeInOutQuint,
  'ease-in-expo': easeInExpo,
  'ease-out-expo': easeOutExpo,
  'ease-in-out-expo': easeInOutExpo,
  'ease-in-circ': easeInCirc,
  'ease-out-circ': easeOutCirc,
  'ease-in-out-circ': easeInOutCirc,
  'ease-in-back': easeInBack,
  'ease-out-back': easeOutBack,
  'ease-in-out-back': easeInOutBack,
  'ease-in-elastic': easeInElastic,
  'ease-out-elastic': easeOutElastic,
  'ease-in-out-elastic': easeInOutElastic,
  'ease-out-bounce': easeOutBounce,
  'ease-in-bounce': easeInBounce,
  'ease-in-out-bounce': easeInOutBounce,
  spring,
};

// =============================================================================
// MAIN EXPORT: GET EASING FUNCTION
// =============================================================================

export function getEasingFunction(easing: EasingFunction): EasingFn {
  if (typeof easing === 'string') {
    return easingFunctions[easing] || linear;
  }
  if (typeof easing === 'object' && easing.type === 'cubic-bezier') {
    return createCubicBezier(...easing.values);
  }
  if (typeof easing === 'object' && easing.type === 'spring') {
    return createSpring(easing.stiffness, easing.damping, easing.mass);
  }
  return linear;
}

// =============================================================================
// UTILITY: GENERATE EASING PREVIEW DATA
// =============================================================================

export function generateEasingPreview(
  easing: EasingFunction,
  points: number = 50,
): Array<{ x: number; y: number }> {
  const easingFn = getEasingFunction(easing);
  const data: Array<{ x: number; y: number }> = [];

  for (let i = 0; i <= points; i++) {
    const t = i / points;
    data.push({ x: t, y: easingFn(t) });
  }

  return data;
}

// =============================================================================
// UTILITY: CSS EASING STRING
// =============================================================================

export function easingToCSS(easing: EasingFunction): string {
  if (typeof easing === 'string') {
    // Map our easing names to CSS cubic-bezier equivalents
    const cssMap: Record<string, string> = {
      linear: 'linear',
      ease: 'ease',
      'ease-in': 'ease-in',
      'ease-out': 'ease-out',
      'ease-in-out': 'ease-in-out',
      'ease-in-quad': 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
      'ease-out-quad': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      'ease-in-out-quad': 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
      'ease-in-cubic': 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
      'ease-out-cubic': 'cubic-bezier(0.215, 0.61, 0.355, 1)',
      'ease-in-out-cubic': 'cubic-bezier(0.645, 0.045, 0.355, 1)',
      'ease-in-quart': 'cubic-bezier(0.895, 0.03, 0.685, 0.22)',
      'ease-out-quart': 'cubic-bezier(0.165, 0.84, 0.44, 1)',
      'ease-in-out-quart': 'cubic-bezier(0.77, 0, 0.175, 1)',
      'ease-in-quint': 'cubic-bezier(0.755, 0.05, 0.855, 0.06)',
      'ease-out-quint': 'cubic-bezier(0.23, 1, 0.32, 1)',
      'ease-in-out-quint': 'cubic-bezier(0.86, 0, 0.07, 1)',
      'ease-in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
      'ease-out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      'ease-in-out-expo': 'cubic-bezier(1, 0, 0, 1)',
      'ease-in-circ': 'cubic-bezier(0.6, 0.04, 0.98, 0.335)',
      'ease-out-circ': 'cubic-bezier(0.075, 0.82, 0.165, 1)',
      'ease-in-out-circ': 'cubic-bezier(0.785, 0.135, 0.15, 0.86)',
      'ease-in-back': 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
      'ease-out-back': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      'ease-in-out-back': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    };
    return cssMap[easing] || 'ease';
  }
  if (typeof easing === 'object' && easing.type === 'cubic-bezier') {
    return `cubic-bezier(${easing.values.join(', ')})`;
  }
  // Spring and elastic don't have CSS equivalents, fall back to ease
  return 'ease';
}
