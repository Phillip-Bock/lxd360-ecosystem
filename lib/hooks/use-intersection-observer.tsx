'use client';

import { type RefObject, useEffect, useRef, useState } from 'react';

export interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
  /** Alias for freezeOnceVisible for API compatibility */
  triggerOnce?: boolean;
}

export interface UseIntersectionObserverReturn {
  ref: RefObject<HTMLDivElement | null>;
  isIntersecting: boolean;
  isVisible: boolean;
  hasBeenVisible: boolean;
  entry?: IntersectionObserverEntry;
}

/**
 * Hook to observe intersection of an element with the viewport
 * @param options - IntersectionObserver options plus freezeOnceVisible/triggerOnce flags
 * @returns Object containing ref to attach and intersection state
 */
export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = '0px',
  freezeOnceVisible = false,
  triggerOnce = false,
}: UseIntersectionObserverOptions = {}): UseIntersectionObserverReturn {
  const ref = useRef<HTMLDivElement>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  // Support both freezeOnceVisible and triggerOnce
  const shouldFreeze = freezeOnceVisible || triggerOnce;
  const frozen = hasBeenVisible && shouldFreeze;

  useEffect(() => {
    const node = ref.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen || !node) return;

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(([observerEntry]) => {
      setEntry(observerEntry);
      if (observerEntry.isIntersecting && !hasBeenVisible) {
        setHasBeenVisible(true);
      }
    }, observerParams);

    observer.observe(node);

    return () => observer.disconnect();
  }, [threshold, root, rootMargin, frozen, hasBeenVisible]);

  const isIntersecting = entry?.isIntersecting ?? false;

  return {
    ref,
    isIntersecting,
    isVisible: isIntersecting,
    hasBeenVisible,
    entry,
  };
}

export default useIntersectionObserver;
