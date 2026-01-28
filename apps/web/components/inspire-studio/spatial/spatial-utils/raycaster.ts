'use client';

// =============================================================================
// Raycaster Utilities
// =============================================================================
// Click position calculation for hotspot placement on a 360° sphere.
// =============================================================================

import type { Vector3 } from '../three-sixty-editor/types';

/**
 * Convert screen coordinates to spherical position on the panorama sphere
 *
 * @param screenX - X position in pixels from left
 * @param screenY - Y position in pixels from top
 * @param containerWidth - Container width in pixels
 * @param containerHeight - Container height in pixels
 * @param sphereRadius - Radius of the panorama sphere (default 500)
 * @returns Vector3 position on the sphere surface
 */
export function screenToSpherePosition(
  screenX: number,
  screenY: number,
  containerWidth: number,
  containerHeight: number,
  sphereRadius: number = 500,
): Vector3 {
  // Convert to normalized device coordinates (-1 to 1)
  const ndcX = (screenX / containerWidth) * 2 - 1;
  const ndcY = -(screenY / containerHeight) * 2 + 1;

  // Convert to spherical coordinates
  // Horizontal angle (phi) maps to longitude
  const phi = ndcX * Math.PI;

  // Vertical angle (theta) maps to latitude
  const theta = (ndcY * Math.PI) / 2;

  // Convert spherical to cartesian (inside-out sphere)
  const x = sphereRadius * Math.cos(theta) * Math.sin(phi);
  const y = sphereRadius * Math.sin(theta);
  const z = sphereRadius * Math.cos(theta) * Math.cos(phi);

  return { x, y, z };
}

/**
 * Convert sphere position back to screen coordinates
 *
 * @param position - Vector3 position on the sphere
 * @param containerWidth - Container width in pixels
 * @param containerHeight - Container height in pixels
 * @param sphereRadius - Radius of the panorama sphere
 * @returns Screen coordinates { x, y }
 */
export function spherePositionToScreen(
  position: Vector3,
  containerWidth: number,
  containerHeight: number,
  _sphereRadius: number = 500,
): { x: number; y: number } {
  // Calculate spherical coordinates from cartesian
  const r = Math.sqrt(position.x ** 2 + position.y ** 2 + position.z ** 2);
  const normalizedY = position.y / r;
  const theta = Math.asin(normalizedY);
  const phi = Math.atan2(position.x, position.z);

  // Convert to screen coordinates
  const ndcX = phi / Math.PI;
  const ndcY = (theta * 2) / Math.PI;

  const screenX = ((ndcX + 1) / 2) * containerWidth;
  const screenY = ((1 - ndcY) / 2) * containerHeight;

  return { x: screenX, y: screenY };
}

/**
 * Calculate distance between two Vector3 positions
 */
export function calculateDistance(a: Vector3, b: Vector3): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dz = b.z - a.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Normalize a Vector3 to unit length
 */
export function normalizeVector(v: Vector3): Vector3 {
  const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  if (length === 0) return { x: 0, y: 0, z: 0 };

  return {
    x: v.x / length,
    y: v.y / length,
    z: v.z / length,
  };
}

/**
 * Lerp between two Vector3 positions
 */
export function lerpVector(a: Vector3, b: Vector3, t: number): Vector3 {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  };
}

/**
 * Convert cartesian position to spherical angles (for camera rotation)
 */
export function cartesianToSpherical(position: Vector3): { phi: number; theta: number } {
  const r = Math.sqrt(position.x ** 2 + position.y ** 2 + position.z ** 2);
  if (r === 0) return { phi: 0, theta: 0 };

  const phi = Math.atan2(position.x, position.z);
  const theta = Math.asin(position.y / r);

  return { phi, theta };
}

/**
 * Convert spherical angles to cartesian position
 */
export function sphericalToCartesian(phi: number, theta: number, radius: number = 500): Vector3 {
  return {
    x: radius * Math.cos(theta) * Math.sin(phi),
    y: radius * Math.sin(theta),
    z: radius * Math.cos(theta) * Math.cos(phi),
  };
}

/**
 * Check if a position is within the camera's field of view
 */
export function isInFieldOfView(
  position: Vector3,
  cameraDirection: Vector3,
  fovRadians: number,
): boolean {
  const normalizedPos = normalizeVector(position);
  const normalizedDir = normalizeVector(cameraDirection);

  // Dot product gives cos(angle)
  const dotProduct =
    normalizedPos.x * normalizedDir.x +
    normalizedPos.y * normalizedDir.y +
    normalizedPos.z * normalizedDir.z;

  // Position is in FOV if angle is less than half FOV
  return dotProduct > Math.cos(fovRadians / 2);
}

/**
 * Find the nearest hotspot position to a click
 */
export function findNearestPosition(
  clickPosition: Vector3,
  positions: Vector3[],
  maxDistance: number = 50,
): { index: number; distance: number } | null {
  let nearestIndex = -1;
  let nearestDistance = Infinity;

  for (let i = 0; i < positions.length; i++) {
    const distance = calculateDistance(clickPosition, positions[i]);
    if (distance < nearestDistance && distance <= maxDistance) {
      nearestDistance = distance;
      nearestIndex = i;
    }
  }

  if (nearestIndex === -1) return null;

  return { index: nearestIndex, distance: nearestDistance };
}
