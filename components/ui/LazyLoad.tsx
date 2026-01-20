'use client';

/**
 * =============================================================================
 * LXP360-SaaS | LazyLoad Component
 * =============================================================================
 *
 * Lazy loading wrapper using Intersection Observer.
 * Only renders children when they become visible.
 */

import Image from 'next/image';
import type { ReactNode } from 'react';
import { useIntersectionObserver } from '@/lib/hooks/use-intersection-observer';
import { Skeleton } from './skeleton-loaders';

interface LazyLoadProps {
  /** Content to render when visible */
  children: ReactNode;
  /** Placeholder while loading */
  placeholder?: ReactNode;
  /** Root margin for early loading */
  rootMargin?: string;
  /** Intersection threshold */
  threshold?: number;
  /** Minimum height to prevent layout shift */
  minHeight?: string | number;
  /** Additional className */
  className?: string;
  /** Whether to keep content mounted after first view */
  keepMounted?: boolean;
  /** Callback when content becomes visible */
  onVisible?: () => void;
}

/**
 * Lazy load wrapper - only renders children when in viewport
 *
 * @example
 * <LazyLoad placeholder={<CourseCardSkeleton />} minHeight={200}>
 *   <HeavyComponent />
 * </LazyLoad>
 */
export function LazyLoad({
  children,
  placeholder,
  rootMargin = '200px',
  threshold = 0,
  minHeight,
  className,
  keepMounted = true,
  onVisible,
}: LazyLoadProps) {
  const { ref, isVisible, hasBeenVisible } = useIntersectionObserver({
    rootMargin,
    threshold,
    triggerOnce: keepMounted,
  });

  // Call onVisible callback
  if ((isVisible || hasBeenVisible) && onVisible) {
    onVisible();
  }

  const shouldRender = keepMounted ? hasBeenVisible : isVisible;

  // Default placeholder - wrap Skeleton in a div for minHeight
  const defaultPlaceholder = (
    <div style={{ minHeight: minHeight || '100px' }}>
      <Skeleton className="w-full h-full" />
    </div>
  );

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={className} style={{ minHeight }}>
      {shouldRender ? children : placeholder || defaultPlaceholder}
    </div>
  );
}

/**
 * Lazy load image with blur-up effect
 */
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholder?: string;
}

export function LazyImage({ src, alt, className, width, height, placeholder }: LazyImageProps) {
  const { ref, hasBeenVisible } = useIntersectionObserver({
    rootMargin: '100px',
    triggerOnce: true,
  });

  const shouldLoad = hasBeenVisible;

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={className}
      style={{ width, height, position: 'relative' }}
    >
      {shouldLoad ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          loading="lazy"
          sizes={width ? `${width}px` : '100vw'}
          unoptimized
        />
      ) : (
        <div
          className="w-full h-full animate-pulse bg-muted"
          style={{
            backgroundImage: placeholder ? `url(${placeholder})` : undefined,
            backgroundSize: 'cover',
          }}
        />
      )}
    </div>
  );
}

/**
 * Lazy load section with fade-in animation
 */
interface LazyFadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function LazyFadeIn({ children, className, delay = 0 }: LazyFadeInProps) {
  const { ref, hasBeenVisible } = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={className}
      style={{
        opacity: hasBeenVisible ? 1 : 0,
        transform: hasBeenVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Lazy load list items with staggered animation
 */
interface LazyStaggerListProps {
  children: ReactNode[];
  className?: string;
  itemClassName?: string;
  staggerDelay?: number;
}

export function LazyStaggerList({
  children,
  className,
  itemClassName,
  staggerDelay = 100,
}: LazyStaggerListProps) {
  const { ref, hasBeenVisible } = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={itemClassName}
          style={{
            opacity: hasBeenVisible ? 1 : 0,
            transform: hasBeenVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: `opacity 0.4s ease ${index * staggerDelay}ms, transform 0.4s ease ${index * staggerDelay}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

export default LazyLoad;
