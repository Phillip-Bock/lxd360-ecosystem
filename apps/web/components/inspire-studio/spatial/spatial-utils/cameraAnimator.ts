'use client';

// =============================================================================
// Camera Animator
// =============================================================================
// Camera animation utilities for guided tours and smooth transitions.
// =============================================================================

import type { CameraAnimation, Vector3 } from '../three-sixty-editor/types';

// =============================================================================
// Easing Functions
// =============================================================================

export type EasingFunction = (t: number) => number;

export const easingFunctions: Record<CameraAnimation['easing'], EasingFunction> = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => t * (2 - t),
  easeInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
};

/**
 * Cubic bezier easing for smooth camera moves
 */
export function cubicBezierEasing(t: number, p1: number, p2: number): number {
  const p0 = 0;
  const p3 = 1;
  const oneMinusT = 1 - t;
  const oneMinusTSquared = oneMinusT * oneMinusT;
  const oneMinusTCubed = oneMinusTSquared * oneMinusT;
  const tSquared = t * t;
  const tCubed = tSquared * t;

  return (
    oneMinusTCubed * p0 +
    3 * oneMinusTSquared * t * p1 +
    3 * oneMinusT * tSquared * p2 +
    tCubed * p3
  );
}

// =============================================================================
// Animation Controller
// =============================================================================

export interface AnimationController {
  isPlaying: boolean;
  progress: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (progress: number) => void;
}

interface AnimationOptions {
  from: Vector3;
  to: Vector3;
  duration: number;
  easing?: CameraAnimation['easing'];
  onUpdate: (position: Vector3) => void;
  onComplete?: () => void;
}

/**
 * Create a camera animation controller
 */
export function createCameraAnimation(options: AnimationOptions): AnimationController {
  const { from, to, duration, easing = 'easeInOut', onUpdate, onComplete } = options;
  const easingFn = easingFunctions[easing];

  let startTime: number | null = null;
  let pausedTime: number | null = null;
  let animationFrame: number | null = null;
  let isPlaying = false;
  let progress = 0;

  function calculatePosition(t: number): Vector3 {
    const easedT = easingFn(t);
    return {
      x: from.x + (to.x - from.x) * easedT,
      y: from.y + (to.y - from.y) * easedT,
      z: from.z + (to.z - from.z) * easedT,
    };
  }

  function animate(timestamp: number): void {
    if (!isPlaying) return;

    if (startTime === null) {
      startTime = timestamp;
    }

    const elapsed = timestamp - startTime;
    progress = Math.min(elapsed / duration, 1);

    const position = calculatePosition(progress);
    onUpdate(position);

    if (progress < 1) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      isPlaying = false;
      onComplete?.();
    }
  }

  return {
    get isPlaying() {
      return isPlaying;
    },
    get progress() {
      return progress;
    },
    start() {
      if (isPlaying) return;
      isPlaying = true;
      startTime = null;
      progress = 0;
      animationFrame = requestAnimationFrame(animate);
    },
    pause() {
      if (!isPlaying) return;
      isPlaying = false;
      pausedTime = performance.now();
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
    },
    resume() {
      if (isPlaying) return;
      isPlaying = true;
      if (pausedTime !== null && startTime !== null) {
        startTime = performance.now() - (pausedTime - startTime);
      }
      pausedTime = null;
      animationFrame = requestAnimationFrame(animate);
    },
    stop() {
      isPlaying = false;
      startTime = null;
      pausedTime = null;
      progress = 0;
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
    },
    seek(seekProgress: number) {
      progress = Math.max(0, Math.min(1, seekProgress));
      const position = calculatePosition(progress);
      onUpdate(position);
      if (startTime !== null) {
        startTime = performance.now() - duration * progress;
      }
    },
  };
}

// =============================================================================
// Tour Animation Sequencer
// =============================================================================

export interface TourStop {
  id: string;
  position: Vector3;
  duration: number;
  dwellTime?: number; // Time to pause at this stop
  narrationSrc?: string;
}

export interface TourSequencer {
  currentStopIndex: number;
  isPlaying: boolean;
  isPaused: boolean;
  play: () => void;
  pause: () => void;
  stop: () => void;
  next: () => void;
  previous: () => void;
  goToStop: (index: number) => void;
}

interface TourSequencerOptions {
  stops: TourStop[];
  onPositionUpdate: (position: Vector3) => void;
  onStopReached: (stop: TourStop, index: number) => void;
  onTourComplete: () => void;
  autoAdvance?: boolean;
}

/**
 * Create a tour animation sequencer
 */
export function createTourSequencer(options: TourSequencerOptions): TourSequencer {
  const { stops, onPositionUpdate, onStopReached, onTourComplete, autoAdvance = true } = options;

  let currentStopIndex = 0;
  let isPlaying = false;
  let isPaused = false;
  let currentAnimation: AnimationController | null = null;
  let dwellTimeout: NodeJS.Timeout | null = null;

  function clearDwellTimeout(): void {
    if (dwellTimeout) {
      clearTimeout(dwellTimeout);
      dwellTimeout = null;
    }
  }

  function animateToStop(index: number): void {
    if (index < 0 || index >= stops.length) return;

    const fromStop = stops[currentStopIndex];
    const toStop = stops[index];

    currentAnimation = createCameraAnimation({
      from: fromStop.position,
      to: toStop.position,
      duration: toStop.duration,
      easing: 'easeInOut',
      onUpdate: onPositionUpdate,
      onComplete: () => {
        currentStopIndex = index;
        onStopReached(toStop, index);

        if (autoAdvance && index < stops.length - 1) {
          const dwellTime = toStop.dwellTime ?? 3000;
          dwellTimeout = setTimeout(() => {
            if (isPlaying && !isPaused) {
              animateToStop(index + 1);
            }
          }, dwellTime);
        } else if (index === stops.length - 1) {
          isPlaying = false;
          onTourComplete();
        }
      },
    });

    currentAnimation.start();
  }

  return {
    get currentStopIndex() {
      return currentStopIndex;
    },
    get isPlaying() {
      return isPlaying;
    },
    get isPaused() {
      return isPaused;
    },
    play() {
      if (isPlaying && !isPaused) return;

      if (isPaused && currentAnimation) {
        isPaused = false;
        currentAnimation.resume();
      } else {
        isPlaying = true;
        isPaused = false;
        if (currentStopIndex === 0) {
          onStopReached(stops[0], 0);
          if (stops.length > 1) {
            const dwellTime = stops[0].dwellTime ?? 3000;
            dwellTimeout = setTimeout(() => {
              animateToStop(1);
            }, dwellTime);
          }
        } else {
          animateToStop(currentStopIndex);
        }
      }
    },
    pause() {
      if (!isPlaying || isPaused) return;
      isPaused = true;
      clearDwellTimeout();
      currentAnimation?.pause();
    },
    stop() {
      isPlaying = false;
      isPaused = false;
      clearDwellTimeout();
      currentAnimation?.stop();
      currentStopIndex = 0;
      if (stops.length > 0) {
        onPositionUpdate(stops[0].position);
      }
    },
    next() {
      if (currentStopIndex < stops.length - 1) {
        clearDwellTimeout();
        animateToStop(currentStopIndex + 1);
      }
    },
    previous() {
      if (currentStopIndex > 0) {
        clearDwellTimeout();
        animateToStop(currentStopIndex - 1);
      }
    },
    goToStop(index: number) {
      if (index >= 0 && index < stops.length && index !== currentStopIndex) {
        clearDwellTimeout();
        animateToStop(index);
      }
    },
  };
}

// =============================================================================
// Smooth Look-At
// =============================================================================

/**
 * Calculate rotation angles to look at a target position
 */
export function calculateLookAtRotation(target: Vector3): { phi: number; theta: number } {
  const r = Math.sqrt(target.x ** 2 + target.y ** 2 + target.z ** 2);
  if (r === 0) return { phi: 0, theta: 0 };

  const phi = Math.atan2(target.x, target.z);
  const theta = Math.asin(target.y / r);

  return { phi, theta };
}

/**
 * Interpolate between two rotations (for smooth camera look)
 */
export function lerpRotation(
  from: { phi: number; theta: number },
  to: { phi: number; theta: number },
  t: number,
): { phi: number; theta: number } {
  // Handle phi wrapping around -PI to PI
  let deltaPhi = to.phi - from.phi;
  if (deltaPhi > Math.PI) deltaPhi -= 2 * Math.PI;
  if (deltaPhi < -Math.PI) deltaPhi += 2 * Math.PI;

  return {
    phi: from.phi + deltaPhi * t,
    theta: from.theta + (to.theta - from.theta) * t,
  };
}
