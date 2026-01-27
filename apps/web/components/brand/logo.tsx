'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * LXD360 Logo Component
 *
 * Provides consistent logo rendering across the application with three variants:
 * - full: Complete logo with icon and wordmark
 * - icon: Icon only for small spaces (favicons, mobile nav)
 * - wordmark: Text only without icon
 *
 * @example
 * ```tsx
 * <Logo variant="full" className="h-8" />
 * <Logo variant="icon" className="w-8 h-8" />
 * <Logo variant="wordmark" className="h-6" />
 * ```
 */

interface LogoProps {
  variant: 'full' | 'icon' | 'wordmark';
  className?: string;
}

/**
 * Full Logo SVG - Icon with LXD360 text
 */
function FullLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="LXD360 Logo"
    >
      <title>LXD360</title>
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00CED1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      {/* Neural Icon */}
      <circle cx="25" cy="25" r="20" fill="url(#logo-gradient)" opacity="0.2" />
      <circle cx="25" cy="25" r="15" fill="url(#logo-gradient)" opacity="0.4" />
      <circle cx="25" cy="25" r="8" fill="url(#logo-gradient)" />
      {/* Neural connections */}
      <circle cx="25" cy="8" r="3" fill="#00CED1" />
      <circle cx="42" cy="25" r="3" fill="#8B5CF6" />
      <circle cx="25" cy="42" r="3" fill="#00CED1" />
      <circle cx="8" cy="25" r="3" fill="#8B5CF6" />
      {/* LXD360 Text */}
      <text
        x="55"
        y="33"
        fontFamily="Inter, sans-serif"
        fontSize="24"
        fontWeight="700"
        fill="currentColor"
      >
        LXD360
      </text>
    </svg>
  );
}

/**
 * Icon Only SVG - Neural brain icon
 */
function IconLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="LXD360 Icon"
    >
      <title>LXD360 Icon</title>
      <defs>
        <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00CED1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      {/* Outer glow ring */}
      <circle
        cx="25"
        cy="25"
        r="23"
        stroke="url(#icon-gradient)"
        strokeWidth="2"
        fill="none"
        opacity="0.3"
      />
      {/* Neural rings */}
      <circle cx="25" cy="25" r="18" fill="url(#icon-gradient)" opacity="0.15" />
      <circle cx="25" cy="25" r="12" fill="url(#icon-gradient)" opacity="0.3" />
      <circle cx="25" cy="25" r="6" fill="url(#icon-gradient)" />
      {/* Neural nodes */}
      <circle cx="25" cy="5" r="3" fill="#00CED1" />
      <circle cx="45" cy="25" r="3" fill="#8B5CF6" />
      <circle cx="25" cy="45" r="3" fill="#00CED1" />
      <circle cx="5" cy="25" r="3" fill="#8B5CF6" />
      {/* Diagonal nodes */}
      <circle cx="39" cy="11" r="2" fill="#00CED1" opacity="0.7" />
      <circle cx="39" cy="39" r="2" fill="#8B5CF6" opacity="0.7" />
      <circle cx="11" cy="39" r="2" fill="#00CED1" opacity="0.7" />
      <circle cx="11" cy="11" r="2" fill="#8B5CF6" opacity="0.7" />
    </svg>
  );
}

/**
 * Wordmark Only SVG - LXD360 text
 */
function WordmarkLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="LXD360"
    >
      <title>LXD360</title>
      <defs>
        <linearGradient id="wordmark-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00CED1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <text
        x="0"
        y="22"
        fontFamily="Inter, sans-serif"
        fontSize="20"
        fontWeight="700"
        fill="url(#wordmark-gradient)"
      >
        LXD360
      </text>
    </svg>
  );
}

/**
 * Logo Component
 *
 * Renders the LXD360 logo in one of three variants:
 * - full: Complete logo with icon and text (default for headers)
 * - icon: Icon only for small spaces (mobile nav, favicons)
 * - wordmark: Text only without icon
 */
export function Logo({ variant, className }: LogoProps) {
  switch (variant) {
    case 'full':
      return <FullLogo className={cn('h-10 w-auto', className)} />;
    case 'icon':
      return <IconLogo className={cn('h-10 w-10', className)} />;
    case 'wordmark':
      return <WordmarkLogo className={cn('h-6 w-auto', className)} />;
    default:
      return <FullLogo className={cn('h-10 w-auto', className)} />;
  }
}

/**
 * LogoImage Component
 *
 * Alternative component using next/image for PNG/SVG files.
 * Use this when you need optimized image loading or have custom logo files.
 */
interface LogoImageProps {
  variant: 'full' | 'icon';
  className?: string;
  width?: number;
  height?: number;
}

export function LogoImage({ variant, className, width, height }: LogoImageProps) {
  const src = variant === 'full' ? '/images/logo/lxd360-full.svg' : '/images/logo/lxd360-icon.svg';
  const defaultWidth = variant === 'full' ? 200 : 50;
  const defaultHeight = variant === 'full' ? 50 : 50;

  return (
    <Image
      src={src}
      alt="LXD360"
      width={width ?? defaultWidth}
      height={height ?? defaultHeight}
      className={className}
      priority
    />
  );
}

export type { LogoProps, LogoImageProps };
