'use client';

/**
 * =============================================================================
 * LXP360-SaaS | Optimized Image Component
 * =============================================================================
 *
 * A wrapper around Next.js Image with loading states, blur placeholders,
 * and accessibility features.
 */

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Default blur placeholder data URL (tiny gray rectangle)
 */
const DEFAULT_BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUUyOTNCIi8+PC9zdmc+';

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className,
  containerClassName,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  quality = 85,
  placeholder = 'blur',
  blurDataURL = DEFAULT_BLUR_DATA_URL,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Error fallback
  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          fill && 'absolute inset-0',
          containerClassName,
        )}
        style={!fill ? { width, height } : undefined}
        role="img"
        aria-label={`Image failed to load: ${alt}`}
      >
        <span className="text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div
      className={cn('overflow-hidden', fill && 'relative', containerClassName)}
      style={!fill && width && height ? { width, height } : undefined}
    >
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        sizes={sizes}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        className={cn(
          'duration-500 ease-in-out',
          isLoading ? 'scale-105 blur-md grayscale' : 'scale-100 blur-0 grayscale-0',
          className,
        )}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}

// =============================================================================
// SPECIALIZED VARIANTS
// =============================================================================

interface AvatarImageProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const avatarSizes = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

/**
 * Optimized circular avatar image
 */
export function AvatarImage({ src, alt, size = 'md', className }: AvatarImageProps) {
  const dimension = avatarSizes[size];

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={dimension}
      height={dimension}
      className={cn('rounded-full object-cover', className)}
      priority={false}
      sizes={`${dimension}px`}
      quality={90}
    />
  );
}

interface ThumbnailImageProps {
  src: string;
  alt: string;
  aspectRatio?: '16/9' | '4/3' | '1/1';
  className?: string;
}

/**
 * Optimized thumbnail with aspect ratio container
 */
export function ThumbnailImage({ src, alt, aspectRatio = '16/9', className }: ThumbnailImageProps) {
  const aspectClasses = {
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '1/1': 'aspect-square',
  };

  return (
    <div className={cn(aspectClasses[aspectRatio], 'relative', className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    </div>
  );
}

interface HeroImageProps {
  src: string;
  alt: string;
  className?: string;
}

/**
 * Full-width hero image with priority loading
 */
export function HeroImage({ src, alt, className }: HeroImageProps) {
  return (
    <div className={cn('relative w-full h-[50vh] min-h-[400px]', className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        priority
        className="object-cover"
        sizes="100vw"
        quality={90}
      />
    </div>
  );
}

export default OptimizedImage;
