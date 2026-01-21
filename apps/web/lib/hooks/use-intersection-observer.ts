'use client';

import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  /** Intersection threshold (0-1) */
  threshold?: number | number[];
  /** Root element for intersection */
  root?: Element | null;
  /** Root margin (CSS-like syntax) */
  rootMargin?: string;
  /** Stop observing after first intersection */
  freezeOnceVisible?: boolean;
  /** Only trigger once */
  triggerOnce?: boolean;
}

interface UseIntersectionObserverReturn {
  /** Ref to attach to observed element */
  ref: RefObject<Element | null>;
  /** IntersectionObserverEntry if available */
  entry: IntersectionObserverEntry | undefined;
  /** Whether element is currently visible */
  isVisible: boolean;
  /** Whether element has ever been visible */
  hasBeenVisible: boolean;
}

/**
 * Hook to observe element visibility using IntersectionObserver
 *
 * @example
 * function LazyComponent() {
 *   const { ref, isVisible } = useIntersectionObserver({
 *     threshold: 0.1,
 *     triggerOnce: true,
 *   })
 *
 *   return (
 *     <div ref={ref}>
 *       {isVisible ? <ActualContent /> : <Placeholder />}
 *     </div>
 *   )
 * }
 */
export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = '0px',
  freezeOnceVisible = false,
  triggerOnce = false,
}: UseIntersectionObserverOptions = {}): UseIntersectionObserverReturn {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const elementRef = useRef<Element>(null);
  const frozen = useRef(false);

  const isVisible = entry?.isIntersecting ?? false;

  useEffect(() => {
    const node = elementRef.current;
    const hasIOSupport = typeof window !== 'undefined' && !!window.IntersectionObserver;

    if (!hasIOSupport || frozen.current || !node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);

        if (entry.isIntersecting) {
          setHasBeenVisible(true);

          if (freezeOnceVisible || triggerOnce) {
            frozen.current = true;
            observer.unobserve(node);
          }
        }
      },
      { threshold, root, rootMargin },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, freezeOnceVisible, triggerOnce]);

  return {
    ref: elementRef,
    entry,
    isVisible,
    hasBeenVisible,
  };
}

/**
 * Hook variant that accepts a ref instead of returning one
 *
 * @example
 * const myRef = useRef<HTMLDivElement>(null)
 * const { isVisible } = useIntersectionObserverRef(myRef, { threshold: 0.5 })
 */
export function useIntersectionObserverRef<T extends Element>(
  ref: RefObject<T>,
  options: UseIntersectionObserverOptions = {},
): Omit<UseIntersectionObserverReturn, 'ref'> {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false,
    triggerOnce = false,
  } = options;

  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const frozen = useRef(false);

  const isVisible = entry?.isIntersecting ?? false;

  useEffect(() => {
    const node = ref.current;
    const hasIOSupport = typeof window !== 'undefined' && !!window.IntersectionObserver;

    if (!hasIOSupport || frozen.current || !node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);

        if (entry.isIntersecting) {
          setHasBeenVisible(true);

          if (freezeOnceVisible || triggerOnce) {
            frozen.current = true;
            observer.unobserve(node);
          }
        }
      },
      { threshold, root, rootMargin },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [ref, threshold, root, rootMargin, freezeOnceVisible, triggerOnce]);

  return { entry, isVisible, hasBeenVisible };
}

/**
 * Hook for observing multiple elements
 *
 * @example
 * const { observe, entries } = useIntersectionObserverMany({ threshold: 0.1 })
 *
 * items.map((item, i) => (
 *   <div key={i} ref={(el) => el && observe(el, `item-${i}`)}>
 *     {entries.get(`item-${i}`)?.isIntersecting ? <Content /> : <Skeleton />}
 *   </div>
 * ))
 */
export function useIntersectionObserverMany(
  options: Omit<UseIntersectionObserverOptions, 'freezeOnceVisible'> = {},
) {
  const { threshold = 0, root = null, rootMargin = '0px' } = options;

  const [entries, setEntries] = useState<Map<string, IntersectionObserverEntry>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef<Map<string, Element>>(new Map());

  // Create observer
  useEffect(() => {
    const hasIOSupport = typeof window !== 'undefined' && !!window.IntersectionObserver;
    if (!hasIOSupport) return;

    observerRef.current = new IntersectionObserver(
      (observerEntries) => {
        setEntries((prev) => {
          const next = new Map(prev);
          observerEntries.forEach((entry) => {
            const key = Array.from(elementsRef.current.entries()).find(
              ([, el]) => el === entry.target,
            )?.[0];
            if (key) {
              next.set(key, entry);
            }
          });
          return next;
        });
      },
      { threshold, root, rootMargin },
    );

    // Observe existing elements
    elementsRef.current.forEach((element) => {
      observerRef.current?.observe(element);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [threshold, root, rootMargin]);

  const observe = useCallback((element: Element, key: string) => {
    if (elementsRef.current.has(key)) {
      // Already observing
      return;
    }
    elementsRef.current.set(key, element);
    observerRef.current?.observe(element);
  }, []);

  const unobserve = useCallback((key: string) => {
    const element = elementsRef.current.get(key);
    if (element) {
      observerRef.current?.unobserve(element);
      elementsRef.current.delete(key);
      setEntries((prev) => {
        const next = new Map(prev);
        next.delete(key);
        return next;
      });
    }
  }, []);

  return { observe, unobserve, entries };
}

export default useIntersectionObserver;
