/**
 * =============================================================================
 * LXP360-SaaS | Prefetching Utilities
 * =============================================================================
 *
 * @fileoverview Client-side prefetching utilities for performance
 *
 * @description
 * Provides utilities for prefetching routes and data:
 * - Route prefetching on hover
 * - Data prefetching utilities
 * - Intersection observer hook for lazy loading
 *
 * =============================================================================
 */

'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'performance-prefetch' });

// ============================================================================
// Types
// ============================================================================

export interface PrefetchOptions {
  /** Delay before prefetching (ms) */
  delay?: number;
  /** Whether to prefetch on hover */
  onHover?: boolean;
  /** Whether to prefetch on focus */
  onFocus?: boolean;
  /** Whether to prefetch when in viewport */
  onVisible?: boolean;
}

export interface IntersectionOptions {
  /** Root element for intersection */
  root?: Element | null;
  /** Root margin */
  rootMargin?: string;
  /** Intersection threshold */
  threshold?: number | number[];
  /** Trigger only once */
  triggerOnce?: boolean;
  /** Delay before triggering */
  delay?: number;
}

// ============================================================================
// Route Prefetching
// ============================================================================

/**
 * Hook for prefetching routes on hover/focus
 */
export function usePrefetch(href: string, options: PrefetchOptions = {}) {
  const router = useRouter();
  const { delay = 100, onHover = true, onFocus = true } = options;

  const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  const prefetch = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      router.prefetch(href);
    }, delay);
  }, [router, href, delay]);

  const cancel = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    onMouseEnter: onHover ? prefetch : undefined,
    onMouseLeave: onHover ? cancel : undefined,
    onFocus: onFocus ? prefetch : undefined,
    onBlur: onFocus ? cancel : undefined,
  };
}

/**
 * Prefetch multiple routes
 */
export function usePrefetchRoutes(routes: string[]) {
  const router = useRouter();

  React.useEffect(() => {
    // Prefetch after initial render with idle callback
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => {
        for (const route of routes) {
          router.prefetch(route);
        }
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        for (const route of routes) {
          router.prefetch(route);
        }
      }, 1000);
    }
  }, [router, routes]);
}

// ============================================================================
// Intersection Observer Hook
// ============================================================================

/**
 * Hook for detecting when an element is in the viewport
 */
export function useIntersectionObserver(
  options: IntersectionOptions = {},
): [React.RefCallback<Element>, boolean, IntersectionObserverEntry | undefined] {
  const {
    root = null,
    rootMargin = '0px',
    threshold = 0,
    triggerOnce = false,
    delay = 0,
  } = options;

  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const [entry, setEntry] = React.useState<IntersectionObserverEntry>();
  const observerRef = React.useRef<IntersectionObserver | undefined>(undefined);
  const elementRef = React.useRef<Element | undefined>(undefined);
  const hasTriggeredRef = React.useRef(false);

  const setRef = React.useCallback(
    (element: Element | null) => {
      // Disconnect previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!element) {
        elementRef.current = undefined;
        return;
      }

      elementRef.current = element;

      // Don't observe if already triggered (for triggerOnce)
      if (triggerOnce && hasTriggeredRef.current) {
        return;
      }

      // Create new observer
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const [observedEntry] = entries;

          if (delay > 0 && observedEntry.isIntersecting) {
            setTimeout(() => {
              setEntry(observedEntry);
              setIsIntersecting(observedEntry.isIntersecting);

              if (observedEntry.isIntersecting && triggerOnce) {
                hasTriggeredRef.current = true;
                observerRef.current?.disconnect();
              }
            }, delay);
          } else {
            setEntry(observedEntry);
            setIsIntersecting(observedEntry.isIntersecting);

            if (observedEntry.isIntersecting && triggerOnce) {
              hasTriggeredRef.current = true;
              observerRef.current?.disconnect();
            }
          }
        },
        { root, rootMargin, threshold },
      );

      observerRef.current.observe(element);
    },
    [root, rootMargin, threshold, triggerOnce, delay],
  );

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return [setRef, isIntersecting, entry];
}

/**
 * Hook for lazy loading content when visible
 */
export function useLazyLoad<T>(
  loader: () => Promise<T>,
  options: IntersectionOptions = {},
): [React.RefCallback<Element>, T | null, boolean, Error | null] {
  const [ref, isVisible] = useIntersectionObserver({
    ...options,
    triggerOnce: true,
  });

  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (isVisible && !data && !loading) {
      setLoading(true);
      loader()
        .then((result) => {
          setData(result);
          setError(null);
        })
        .catch((err) => {
          setError(err instanceof Error ? err : new Error(String(err)));
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isVisible, data, loading, loader]);

  return [ref, data, loading, error];
}

// ============================================================================
// Data Prefetching
// ============================================================================

/**
 * Prefetch data on hover
 */
export function usePrefetchData<T>(
  fetcher: () => Promise<T>,
  options: { delay?: number } = {},
): {
  data: T | null;
  prefetch: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
} {
  const { delay = 100 } = options;
  const [data, setData] = React.useState<T | null>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);
  const fetchedRef = React.useRef(false);

  const prefetch = React.useCallback(() => {
    if (fetchedRef.current) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        const result = await fetcher();
        setData(result);
        fetchedRef.current = true;
      } catch (error) {
        log.error('Prefetch error', { error });
      }
    }, delay);
  }, [fetcher, delay]);

  const cancel = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    data,
    prefetch,
    onMouseEnter: prefetch,
    onMouseLeave: cancel,
  };
}

// ============================================================================
// Image Prefetching
// ============================================================================

/**
 * Prefetch images when in viewport
 */
export function usePrefetchImages(
  urls: string[],
  options: IntersectionOptions = {},
): React.RefCallback<Element> {
  const [ref, isVisible] = useIntersectionObserver({
    ...options,
    triggerOnce: true,
    rootMargin: '200px', // Start loading before fully visible
  });

  React.useEffect(() => {
    if (isVisible) {
      urls.forEach((url) => {
        const img = new Image();
        img.src = url;
      });
    }
  }, [isVisible, urls]);

  return ref;
}

// ============================================================================
// Exports
// ============================================================================
// Types are already exported inline above
