/**
 * Animation Interpolation Engine
 * Handles keyframe interpolation, value computation, and CSS generation
 */

import type {
  AnimatableProperties,
  AnimatableProperty,
  EasingFunction,
  Keyframe,
  ObjectTrack,
  PropertyTrack,
  TimeMs,
} from '@/types/studio/timeline';
import { getEasingFunction } from './easing';

// =============================================================================
// COLOR UTILITIES
// =============================================================================

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface RGBA extends RGB {
  a: number;
}

function hexToRgb(hex: string): RGB | null {
  // Handle shorthand hex (#fff)
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
      })
      .join('')
  );
}

function parseRgba(color: string): RGBA | null {
  // Try rgba() format
  const rgbaMatch = color.match(
    /rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/i,
  );
  if (rgbaMatch) {
    return {
      r: Number.parseInt(rgbaMatch[1], 10),
      g: Number.parseInt(rgbaMatch[2], 10),
      b: Number.parseInt(rgbaMatch[3], 10),
      a: rgbaMatch[4] ? Number.parseFloat(rgbaMatch[4]) : 1,
    };
  }

  // Try hex format
  const rgb = hexToRgb(color);
  if (rgb) {
    return { ...rgb, a: 1 };
  }

  return null;
}

function rgbaToString(rgba: RGBA): string {
  if (rgba.a === 1) {
    return rgbToHex(rgba.r, rgba.g, rgba.b);
  }
  return `rgba(${Math.round(rgba.r)}, ${Math.round(rgba.g)}, ${Math.round(rgba.b)}, ${rgba.a.toFixed(2)})`;
}

// =============================================================================
// VALUE INTERPOLATION
// =============================================================================

/**
 * Interpolate between two values based on progress
 */
export function interpolateValue<T>(
  from: T,
  to: T,
  progress: number, // 0-1, already eased
  property: AnimatableProperty,
): T {
  // Number interpolation
  if (typeof from === 'number' && typeof to === 'number') {
    return (from + (to - from) * progress) as T;
  }

  // Color interpolation (hex/rgba)
  if (
    typeof from === 'string' &&
    typeof to === 'string' &&
    (property.includes('Color') || property === 'color' || property === 'backgroundColor')
  ) {
    return interpolateColor(from, to, progress) as T;
  }

  // String (no interpolation, just switch at 50%)
  if (typeof from === 'string') {
    return progress < 0.5 ? from : to;
  }

  return to;
}

/**
 * Interpolate between two colors
 */
export function interpolateColor(from: string, to: string, progress: number): string {
  const fromRgba = parseRgba(from);
  const toRgba = parseRgba(to);

  if (!fromRgba || !toRgba) return to;

  const r = fromRgba.r + (toRgba.r - fromRgba.r) * progress;
  const g = fromRgba.g + (toRgba.g - fromRgba.g) * progress;
  const b = fromRgba.b + (toRgba.b - fromRgba.b) * progress;
  const a = fromRgba.a + (toRgba.a - fromRgba.a) * progress;

  return rgbaToString({ r, g, b, a });
}

// =============================================================================
// KEYFRAME INTERPOLATION
// =============================================================================

/**
 * Get the interpolated value at a specific time from a list of keyframes
 */
export function getValueAtTime<T>(
  keyframes: Keyframe<T>[],
  time: TimeMs,
  property: AnimatableProperty,
): T | undefined {
  if (keyframes.length === 0) return undefined;

  // Sort keyframes by time
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);

  // Before first keyframe
  if (time <= sorted[0].time) {
    return sorted[0].value;
  }

  // After last keyframe
  if (time >= sorted[sorted.length - 1].time) {
    return sorted[sorted.length - 1].value;
  }

  // Find surrounding keyframes
  let fromKeyframe: Keyframe<T> | undefined;
  let toKeyframe: Keyframe<T> | undefined;

  for (let i = 0; i < sorted.length - 1; i++) {
    if (time >= sorted[i].time && time < sorted[i + 1].time) {
      fromKeyframe = sorted[i];
      toKeyframe = sorted[i + 1];
      break;
    }
  }

  if (!fromKeyframe || !toKeyframe) {
    return sorted[sorted.length - 1].value;
  }

  // Calculate progress
  const duration = toKeyframe.time - fromKeyframe.time;
  const elapsed = time - fromKeyframe.time;
  const linearProgress = duration > 0 ? elapsed / duration : 1;

  // Apply easing (use the "to" keyframe's easing)
  const easingFn = getEasingFunction(toKeyframe.easing);
  const easedProgress = easingFn(linearProgress);

  // Interpolate
  return interpolateValue(fromKeyframe.value, toKeyframe.value, easedProgress, property);
}

/**
 * Find the keyframes surrounding a given time
 */
export function getSurroundingKeyframes<T>(
  keyframes: Keyframe<T>[],
  time: TimeMs,
): { from: Keyframe<T> | null; to: Keyframe<T> | null } {
  if (keyframes.length === 0) return { from: null, to: null };

  const sorted = [...keyframes].sort((a, b) => a.time - b.time);

  // Before first keyframe
  if (time <= sorted[0].time) {
    return { from: null, to: sorted[0] };
  }

  // After last keyframe
  if (time >= sorted[sorted.length - 1].time) {
    return { from: sorted[sorted.length - 1], to: null };
  }

  // Find surrounding
  for (let i = 0; i < sorted.length - 1; i++) {
    if (time >= sorted[i].time && time < sorted[i + 1].time) {
      return { from: sorted[i], to: sorted[i + 1] };
    }
  }

  return { from: sorted[sorted.length - 1], to: null };
}

// =============================================================================
// OBJECT ANIMATION STATE
// =============================================================================

/**
 * Get all animated property values for an object at a specific time
 */
export function getObjectPropertiesAtTime(
  track: ObjectTrack,
  time: TimeMs,
  baseProperties: Partial<AnimatableProperties> = {},
): Partial<AnimatableProperties> {
  const result: Partial<AnimatableProperties> = { ...baseProperties };

  // Check if object is visible at this time
  if (time < track.startTime || time > track.endTime) {
    return { ...result, opacity: 0 };
  }

  // Get each animated property value
  for (const propertyTrack of track.propertyTracks) {
    if (!propertyTrack.enabled || propertyTrack.keyframes.length === 0) continue;

    const value = getValueAtTime(propertyTrack.keyframes, time, propertyTrack.property);

    if (value !== undefined) {
      // TypeScript needs help here with dynamic property assignment
      (result as Record<string, unknown>)[propertyTrack.property] = value;
    }
  }

  return result;
}

/**
 * Check if object has animations at a specific time
 */
export function isObjectAnimatingAtTime(track: ObjectTrack, time: TimeMs): boolean {
  if (time < track.startTime || time > track.endTime) return false;

  for (const propTrack of track.propertyTracks) {
    if (!propTrack.enabled) continue;

    const sorted = [...propTrack.keyframes].sort((a, b) => a.time - b.time);
    for (let i = 0; i < sorted.length - 1; i++) {
      if (time >= sorted[i].time && time < sorted[i + 1].time) {
        return true;
      }
    }
  }

  return false;
}

// =============================================================================
// CSS TRANSFORM GENERATION
// =============================================================================

/**
 * Convert animated properties to CSS styles
 */
export function propertiesToCSS(props: Partial<AnimatableProperties>): React.CSSProperties {
  const style: React.CSSProperties = {};

  // Build transform string
  const transforms: string[] = [];

  if (props.x !== undefined || props.y !== undefined) {
    transforms.push(`translate(${props.x ?? 0}px, ${props.y ?? 0}px)`);
  }
  if (props.rotation !== undefined) {
    transforms.push(`rotate(${props.rotation}deg)`);
  }
  if (props.scaleX !== undefined || props.scaleY !== undefined) {
    transforms.push(`scale(${props.scaleX ?? 1}, ${props.scaleY ?? 1})`);
  }
  if (props.skewX !== undefined || props.skewY !== undefined) {
    transforms.push(`skew(${props.skewX ?? 0}deg, ${props.skewY ?? 0}deg)`);
  }
  if (props.translateZ !== undefined) {
    transforms.push(`translateZ(${props.translateZ}px)`);
  }
  if (props.rotateX !== undefined) {
    transforms.push(`rotateX(${props.rotateX}deg)`);
  }
  if (props.rotateY !== undefined) {
    transforms.push(`rotateY(${props.rotateY}deg)`);
  }

  if (transforms.length > 0) {
    style.transform = transforms.join(' ');
  }

  // Transform origin
  if (props.anchorX !== undefined || props.anchorY !== undefined) {
    style.transformOrigin = `${props.anchorX ?? 50}% ${props.anchorY ?? 50}%`;
  }

  // Perspective
  if (props.perspective !== undefined) {
    style.perspective = `${props.perspective}px`;
  }

  // Dimensions
  if (props.width !== undefined) style.width = props.width;
  if (props.height !== undefined) style.height = props.height;

  // Appearance
  if (props.opacity !== undefined) style.opacity = props.opacity;
  if (props.backgroundColor !== undefined) style.backgroundColor = props.backgroundColor;
  if (props.color !== undefined) style.color = props.color;

  // Borders
  if (props.borderWidth !== undefined) style.borderWidth = props.borderWidth;
  if (props.borderColor !== undefined) style.borderColor = props.borderColor;
  if (props.borderRadius !== undefined) style.borderRadius = props.borderRadius;

  // Build filter string
  const filters: string[] = [];
  if (props.blur !== undefined && props.blur > 0) filters.push(`blur(${props.blur}px)`);
  if (props.brightness !== undefined && props.brightness !== 1)
    filters.push(`brightness(${props.brightness})`);
  if (props.contrast !== undefined && props.contrast !== 1)
    filters.push(`contrast(${props.contrast})`);
  if (props.saturate !== undefined && props.saturate !== 1)
    filters.push(`saturate(${props.saturate})`);
  if (props.hueRotate !== undefined && props.hueRotate !== 0)
    filters.push(`hue-rotate(${props.hueRotate}deg)`);

  if (filters.length > 0) {
    style.filter = filters.join(' ');
  }

  // Box shadow
  if (
    props.shadowOffsetX !== undefined ||
    props.shadowOffsetY !== undefined ||
    props.shadowBlur !== undefined
  ) {
    style.boxShadow = `${props.shadowOffsetX ?? 0}px ${props.shadowOffsetY ?? 0}px ${props.shadowBlur ?? 0}px ${props.shadowSpread ?? 0}px ${props.shadowColor ?? 'rgba(0,0,0,0.5)'}`;
  }

  // Typography
  if (props.fontSize !== undefined) style.fontSize = props.fontSize;
  if (props.letterSpacing !== undefined) style.letterSpacing = props.letterSpacing;
  if (props.lineHeight !== undefined) style.lineHeight = props.lineHeight;

  // Clip path
  if (
    props.clipTop !== undefined ||
    props.clipRight !== undefined ||
    props.clipBottom !== undefined ||
    props.clipLeft !== undefined
  ) {
    style.clipPath = `inset(${props.clipTop ?? 0}% ${props.clipRight ?? 0}% ${props.clipBottom ?? 0}% ${props.clipLeft ?? 0}%)`;
  }

  return style;
}

// =============================================================================
// ANIMATION COMPUTATION
// =============================================================================

/**
 * Compute all object styles at a specific time
 */
export function computeAllObjectStyles(
  objectTracks: ObjectTrack[],
  time: TimeMs,
  baseStyles: Map<string, Partial<AnimatableProperties>> = new Map(),
): Map<string, React.CSSProperties> {
  const result = new Map<string, React.CSSProperties>();

  for (const track of objectTracks) {
    if (!track.visible) continue;

    const baseProps = baseStyles.get(track.objectId) || {};
    const animatedProps = getObjectPropertiesAtTime(track, time, baseProps);
    const cssStyles = propertiesToCSS(animatedProps);

    result.set(track.objectId, cssStyles);
  }

  return result;
}

// =============================================================================
// KEYFRAME UTILITIES
// =============================================================================

/**
 * Create a keyframe at the current time with current property value
 */
export function createKeyframe<T>(
  time: TimeMs,
  value: T,
  easing: EasingFunction = 'ease-out',
): Omit<Keyframe<T>, 'id'> {
  return {
    time,
    value,
    easing,
  };
}

/**
 * Sort keyframes by time
 */
export function sortKeyframes<T>(keyframes: Keyframe<T>[]): Keyframe<T>[] {
  return [...keyframes].sort((a, b) => a.time - b.time);
}

/**
 * Find keyframe at or near a specific time
 */
export function findKeyframeAtTime<T>(
  keyframes: Keyframe<T>[],
  time: TimeMs,
  tolerance: TimeMs = 50,
): Keyframe<T> | undefined {
  return keyframes.find((kf) => Math.abs(kf.time - time) <= tolerance);
}

/**
 * Get the duration of animation for a property track
 */
export function getPropertyTrackDuration(track: PropertyTrack): TimeMs {
  if (track.keyframes.length < 2) return 0;

  const sorted = sortKeyframes(track.keyframes);
  return sorted[sorted.length - 1].time - sorted[0].time;
}

/**
 * Get the time range covered by keyframes
 */
export function getKeyframeTimeRange(track: PropertyTrack): { start: TimeMs; end: TimeMs } | null {
  if (track.keyframes.length === 0) return null;

  const sorted = sortKeyframes(track.keyframes);
  return {
    start: sorted[0].time,
    end: sorted[sorted.length - 1].time,
  };
}

// =============================================================================
// PROPERTY DEFAULTS
// =============================================================================

export const DEFAULT_PROPERTY_VALUES: Partial<AnimatableProperties> = {
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
  skewX: 0,
  skewY: 0,
  anchorX: 50,
  anchorY: 50,
  opacity: 1,
  blur: 0,
  brightness: 1,
  contrast: 1,
  saturate: 1,
  hueRotate: 0,
  backgroundColor: 'transparent',
  borderColor: 'transparent',
  color: '#ffffff',
  borderWidth: 0,
  borderRadius: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowBlur: 0,
  shadowSpread: 0,
  shadowColor: 'rgba(0,0,0,0.5)',
  fontSize: 16,
  letterSpacing: 0,
  lineHeight: 1.5,
  clipTop: 0,
  clipRight: 0,
  clipBottom: 0,
  clipLeft: 0,
  rotateX: 0,
  rotateY: 0,
  perspective: 1000,
  translateZ: 0,
};

/**
 * Get default value for a property
 */
export function getDefaultPropertyValue(property: AnimatableProperty): number | string {
  return DEFAULT_PROPERTY_VALUES[property] ?? 0;
}
