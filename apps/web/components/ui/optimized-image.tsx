/**
 * =============================================================================
 * LXP360-SaaS | Optimized Image Component
 * =============================================================================
 *
 * @fileoverview Performance-optimized image component for Core Web Vitals
 *
 * @description
 * Wrapper around next/image with smart defaults for optimal performance:
 * - Automatic blur placeholder generation
 * - Responsive sizes helper
 * - Priority loading for above-fold images
 * - Lazy loading with intersection observer
 * - WebP/AVIF format support (via Next.js)
 * - Alt text enforcement via TypeScript
 *
 * Performance Impact:
 * - Reduces LCP (Largest Contentful Paint) with proper sizing
 * - Prevents CLS (Cumulative Layout Shift) with aspect ratios
 * - Minimizes bandwidth with modern formats
 *
 * =============================================================================
 */

'use client';

import Image, { type ImageProps } from 'next/image';
import * as React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

/** Common aspect ratios for images */
export type AspectRatio = '1:1' | '4:3' | '3:2' | '16:9' | '21:9' | '2:3' | '3:4' | '9:16' | 'auto';

/** Image quality presets */
export type QualityPreset = 'low' | 'medium' | 'high' | 'max';

/** Responsive breakpoints for sizes */
export interface ResponsiveSize {
  /** Mobile size (default) */
  mobile?: string;
  /** Tablet size (640px+) */
  tablet?: string;
  /** Desktop size (1024px+) */
  desktop?: string;
  /** Large desktop (1280px+) */
  large?: string;
}

export interface OptimizedImageProps extends Omit<ImageProps, 'alt'> {
  /** Alt text is required for accessibility */
  alt: string;
  /** Aspect ratio for the container */
  aspectRatio?: AspectRatio;
  /** Quality preset instead of numeric quality */
  qualityPreset?: QualityPreset;
  /** Responsive sizes helper */
  responsiveSizes?: ResponsiveSize;
  /** Container className */
  containerClassName?: string;
  /** Show skeleton while loading */
  showSkeleton?: boolean;
  /** Fade in animation on load */
  fadeIn?: boolean;
  /** Hero/above-fold image (sets priority) */
  hero?: boolean;
  /** Thumbnail image (reduces quality for performance) */
  thumbnail?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const ASPECT_RATIO_VALUES: Record<AspectRatio, number | null> = {
  '1:1': 1,
  '4:3': 4 / 3,
  '3:2': 3 / 2,
  '16:9': 16 / 9,
  '21:9': 21 / 9,
  '2:3': 2 / 3,
  '3:4': 3 / 4,
  '9:16': 9 / 16,
  auto: null,
};

const QUALITY_PRESETS: Record<QualityPreset, number> = {
  low: 50,
  medium: 75,
  high: 85,
  max: 100,
};

// Default blur placeholder (tiny transparent image)
const DEFAULT_BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PC9zdmc+';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate sizes string from responsive breakpoints
 */
export function generateSizes(responsiveSizes: ResponsiveSize): string {
  const parts: string[] = [];

  if (responsiveSizes.large) {
    parts.push(`(min-width: 1280px) ${responsiveSizes.large}`);
  }
  if (responsiveSizes.desktop) {
    parts.push(`(min-width: 1024px) ${responsiveSizes.desktop}`);
  }
  if (responsiveSizes.tablet) {
    parts.push(`(min-width: 640px) ${responsiveSizes.tablet}`);
  }
  if (responsiveSizes.mobile) {
    parts.push(responsiveSizes.mobile);
  }

  return parts.join(', ') || '100vw';
}

/**
 * Get common responsive sizes for different use cases
 */
export const COMMON_SIZES = {
  /** Full-width hero image */
  fullWidth: {
    mobile: '100vw',
    tablet: '100vw',
    desktop: '100vw',
    large: '100vw',
  },
  /** Half-width image on desktop */
  halfWidth: {
    mobile: '100vw',
    tablet: '50vw',
    desktop: '50vw',
    large: '50vw',
  },
  /** Third-width (e.g., 3-column grid) */
  thirdWidth: {
    mobile: '100vw',
    tablet: '50vw',
    desktop: '33vw',
    large: '33vw',
  },
  /** Quarter-width (e.g., 4-column grid) */
  quarterWidth: {
    mobile: '50vw',
    tablet: '33vw',
    desktop: '25vw',
    large: '25vw',
  },
  /** Card/thumbnail in a list */
  cardThumbnail: {
    mobile: '100vw',
    tablet: '50vw',
    desktop: '300px',
    large: '350px',
  },
  /** Avatar/profile picture */
  avatar: {
    mobile: '64px',
    tablet: '80px',
    desktop: '96px',
    large: '128px',
  },
} as const;

// ============================================================================
// Component
// ============================================================================

export const OptimizedImage = React.forwardRef<HTMLDivElement, OptimizedImageProps>(
  (
    {
      alt,
      src,
      width,
      height,
      aspectRatio = 'auto',
      qualityPreset,
      quality,
      responsiveSizes,
      sizes,
      containerClassName,
      className,
      showSkeleton = true,
      fadeIn = true,
      hero = false,
      thumbnail = false,
      priority,
      placeholder,
      blurDataURL,
      fill,
      ...props
    },
    ref,
  ) => {
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [hasError, setHasError] = React.useState(false);

    // Calculate quality
    const finalQuality = React.useMemo(() => {
      if (quality) return quality;
      if (qualityPreset) return QUALITY_PRESETS[qualityPreset];
      if (thumbnail) return QUALITY_PRESETS.low;
      return QUALITY_PRESETS.high;
    }, [quality, qualityPreset, thumbnail]);

    // Calculate sizes
    const finalSizes = React.useMemo(() => {
      if (sizes) return sizes;
      if (responsiveSizes) return generateSizes(responsiveSizes);
      return undefined;
    }, [sizes, responsiveSizes]);

    // Aspect ratio value
    const aspectRatioValue = ASPECT_RATIO_VALUES[aspectRatio];

    // Priority for hero images
    const finalPriority = priority ?? hero;

    // Placeholder settings
    const finalPlaceholder = placeholder ?? (showSkeleton ? 'blur' : undefined);
    const finalBlurDataURL = blurDataURL ?? DEFAULT_BLUR_DATA_URL;

    // Handle load
    const handleLoad = React.useCallback(() => {
      setIsLoaded(true);
    }, []);

    // Handle error
    const handleError = React.useCallback(() => {
      setHasError(true);
      setIsLoaded(true);
    }, []);

    // If using fill, we need a container with aspect ratio
    const useFill = fill || (aspectRatioValue !== null && !width);

    // Container styles
    const containerStyles = React.useMemo(() => {
      if (!aspectRatioValue) return undefined;
      return {
        aspectRatio: `${aspectRatioValue}`,
      };
    }, [aspectRatioValue]);

    // Error fallback
    if (hasError) {
      return (
        <div
          ref={ref}
          className={cn(
            'flex items-center justify-center bg-muted text-muted-foreground',
            containerClassName,
          )}
          style={containerStyles}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8 opacity-50"
            aria-hidden="true"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          <span className="sr-only">{alt}</span>
        </div>
      );
    }

    const imageElement = (
      <Image
        src={src}
        alt={alt}
        width={useFill ? undefined : width}
        height={useFill ? undefined : height}
        fill={useFill}
        quality={finalQuality}
        sizes={finalSizes}
        priority={finalPriority}
        placeholder={finalPlaceholder}
        blurDataURL={finalPlaceholder === 'blur' ? finalBlurDataURL : undefined}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'object-cover',
          fadeIn && 'transition-opacity duration-300',
          fadeIn && !isLoaded && 'opacity-0',
          fadeIn && isLoaded && 'opacity-100',
          className,
        )}
        {...props}
      />
    );

    // Wrap in container for fill mode or aspect ratio
    if (useFill || aspectRatioValue !== null) {
      return (
        <div
          ref={ref}
          className={cn('relative overflow-hidden', containerClassName)}
          style={containerStyles}
        >
          {imageElement}
        </div>
      );
    }

    return imageElement;
  },
);

OptimizedImage.displayName = 'OptimizedImage';

// ============================================================================
// Specialized Image Components
// ============================================================================

/**
 * Hero image - full width, high priority, above fold
 */
export function HeroImage({
  className,
  containerClassName,
  ...props
}: Omit<OptimizedImageProps, 'hero' | 'priority'>) {
  return (
    <OptimizedImage
      hero
      priority
      aspectRatio="16:9"
      responsiveSizes={COMMON_SIZES.fullWidth}
      qualityPreset="high"
      containerClassName={cn('w-full', containerClassName)}
      className={className}
      {...props}
    />
  );
}

/**
 * Card thumbnail - optimized for card layouts
 */
export function CardImage({
  className,
  containerClassName,
  aspectRatio = '16:9',
  ...props
}: Omit<OptimizedImageProps, 'thumbnail'>) {
  return (
    <OptimizedImage
      thumbnail
      aspectRatio={aspectRatio}
      responsiveSizes={COMMON_SIZES.cardThumbnail}
      qualityPreset="medium"
      containerClassName={cn('w-full', containerClassName)}
      className={className}
      {...props}
    />
  );
}

/**
 * Avatar image - circular, small, cached
 */
export function AvatarImage({
  className,
  containerClassName,
  size = 40,
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height' | 'aspectRatio'> & { size?: number }) {
  return (
    <OptimizedImage
      width={size}
      height={size}
      aspectRatio="1:1"
      qualityPreset="medium"
      containerClassName={cn('rounded-full', containerClassName)}
      className={cn('rounded-full', className)}
      {...props}
    />
  );
}

/**
 * Background image - full container, decorative
 */
export function BackgroundImage({
  className,
  containerClassName,
  decorative = true,
  alt,
  ...props
}: OptimizedImageProps & { decorative?: boolean }) {
  return (
    <OptimizedImage
      fill
      alt={decorative ? '' : alt}
      qualityPreset="high"
      containerClassName={cn('absolute inset-0 -z-10', containerClassName)}
      className={cn('object-cover', className)}
      aria-hidden={decorative}
      {...props}
    />
  );
}

// ============================================================================
// Exports
// ============================================================================

export default OptimizedImage;
