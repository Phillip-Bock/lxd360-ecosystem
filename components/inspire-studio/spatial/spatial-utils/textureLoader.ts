'use client';

// =============================================================================
// Texture Loader Utilities
// =============================================================================
// Async texture loading for 360° panoramic images with caching and error handling.
// =============================================================================

import type { Texture } from 'three';

// Cache for loaded textures
const textureCache = new Map<string, Texture>();

// Loading state tracker
const loadingPromises = new Map<string, Promise<Texture>>();

/**
 * Load a panoramic texture with caching
 */
export async function loadPanoramaTexture(url: string): Promise<Texture> {
  // Return cached texture if available
  const cachedTexture = textureCache.get(url);
  if (cachedTexture) {
    return cachedTexture;
  }

  // Return existing loading promise if in progress
  const existingPromise = loadingPromises.get(url);
  if (existingPromise) {
    return existingPromise;
  }

  // Create new loading promise
  const loadPromise = new Promise<Texture>((resolve, reject) => {
    // Dynamic import to avoid SSR issues
    import('three').then(({ TextureLoader }) => {
      const loader = new TextureLoader();

      loader.load(
        url,
        (texture) => {
          textureCache.set(url, texture);
          loadingPromises.delete(url);
          resolve(texture);
        },
        undefined,
        (error) => {
          loadingPromises.delete(url);
          reject(new Error(`Failed to load texture: ${url} - ${error}`));
        },
      );
    });
  });

  loadingPromises.set(url, loadPromise);
  return loadPromise;
}

/**
 * Preload multiple textures
 */
export async function preloadTextures(urls: string[]): Promise<Map<string, Texture>> {
  const results = new Map<string, Texture>();

  await Promise.all(
    urls.map(async (url) => {
      try {
        const texture = await loadPanoramaTexture(url);
        results.set(url, texture);
      } catch (error) {
        console.error(`Failed to preload texture: ${url}`, error);
      }
    }),
  );

  return results;
}

/**
 * Clear texture from cache
 */
export function clearTextureCache(url?: string): void {
  if (url) {
    const texture = textureCache.get(url);
    if (texture) {
      texture.dispose();
      textureCache.delete(url);
    }
  } else {
    // Clear all
    for (const texture of textureCache.values()) {
      texture.dispose();
    }
    textureCache.clear();
  }
}

/**
 * Get texture loading progress (0-1)
 */
export function getTextureLoadProgress(urls: string[]): number {
  if (urls.length === 0) return 1;

  const loadedCount = urls.filter((url) => textureCache.has(url)).length;
  return loadedCount / urls.length;
}

/**
 * Check if texture is loaded
 */
export function isTextureLoaded(url: string): boolean {
  return textureCache.has(url);
}

/**
 * Get cached texture (returns null if not cached)
 */
export function getCachedTexture(url: string): Texture | null {
  return textureCache.get(url) ?? null;
}
