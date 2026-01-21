'use client';

/**
 * ShimmerBorderCard Component
 * ===========================
 * Card component with animated shimmer border effect on hover.
 *
 * Border: 2px #550278 (purple)
 * Animation: Rotating gradient shimmer on hover
 *
 * Background colors:
 * - Card background: #00438f (Congress Blue) when no image
 * - Page background: #0f172a (Dark Slate)
 *
 * @example
 * <ShimmerBorderCard>
 *   <h3>Card Title</h3>
 *   <p>Card content here...</p>
 * </ShimmerBorderCard>
 */

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ShimmerBorderCardProps {
  /** Card content */
  children: ReactNode;
  /** Additional CSS classes for the outer container */
  className?: string;
  /** Additional CSS classes for the inner content area */
  contentClassName?: string;
  /** Whether to use the card background color (#00438f) or transparent */
  useCardBackground?: boolean;
  /** Custom max width (default: full width) */
  maxWidth?: string;
}

export function ShimmerBorderCard({
  children,
  className = '',
  contentClassName = '',
  useCardBackground = true,
  maxWidth = 'w-full',
}: ShimmerBorderCardProps) {
  return (
    <div
      className={`group relative ${maxWidth} overflow-hidden rounded-lg p-0.5 transition-all duration-500 hover:scale-[1.01] ${className}`}
      style={{
        backgroundColor: '#550278',
        border: '2px solid #550278',
      }}
    >
      {/* Inner content area */}
      <div
        className={`relative z-10 flex flex-col overflow-hidden rounded-[6px] p-6 transition-colors duration-500 ${contentClassName}`}
        style={{
          backgroundColor: useCardBackground ? '#00438f' : '#0f172a',
        }}
      >
        {children}
      </div>

      {/* Shimmer animation overlay - only visible on hover */}
      <motion.div
        initial={{ rotate: '0deg' }}
        animate={{ rotate: '360deg' }}
        style={{ scale: 1.75 }}
        transition={{
          repeat: Infinity,
          duration: 3.5,
          ease: 'linear',
        }}
        className="absolute inset-0 z-0 bg-linear-to-br from-brand-secondary-hover via-transparent to-brand-secondary-hover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
    </div>
  );
}

/**
 * ShimmerBorderCardWithIcon Component
 * Version with an icon slot at the top
 */
export function ShimmerBorderCardWithIcon({
  icon,
  title,
  description,
  children,
  className = '',
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <ShimmerBorderCard className={className}>
      {icon && (
        <div className="mb-4 flex items-center justify-center">
          <div className="rounded-full border-2 border-brand-secondary-hover bg-surface-page p-4">
            {icon}
          </div>
        </div>
      )}

      <h4 className="relative z-10 mb-4 w-full text-2xl font-bold text-lxd-light-page">{title}</h4>

      {description && <p className="relative z-10 text-muted leading-relaxed">{description}</p>}

      {children}
    </ShimmerBorderCard>
  );
}

/**
 * ShimmerBorderCardGrid Component
 * Wrapper for a grid of shimmer cards
 */
export function ShimmerBorderCardGrid({
  children,
  columns = 3,
  className = '',
}: {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return <div className={`grid gap-6 ${gridCols[columns]} ${className}`}>{children}</div>;
}

export default ShimmerBorderCard;
