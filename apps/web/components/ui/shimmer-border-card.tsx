'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { brand } from '@/lib/brand';

interface ShimmerBorderCardProps {
  children: ReactNode;
  className?: string;
  /** Override card background color */
  bgColor?: string;
  /** Override border color */
  borderColor?: string;
  /** Padding size */
  padding?: 'sm' | 'md' | 'lg';
}

const paddingSizes = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function ShimmerBorderCard({
  children,
  className = '',
  bgColor = brand.colors.primary, // LXD360 Brand: Card background
  borderColor = brand.colors.secondary, // LXD360 Brand: Shimmer border
  padding = 'lg',
}: ShimmerBorderCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-lg p-0.5 transition-all duration-500 hover:scale-[1.01] ${className}`}
      style={{ backgroundColor: borderColor }} // LXD360 Brand: Shimmer border color
    >
      {/* Card Content Container */}
      <div
        className={`relative z-10 flex flex-col overflow-hidden rounded-[7px] ${paddingSizes[padding]}`}
        style={{ backgroundColor: bgColor }} // LXD360 Brand: Card background
      >
        {children}
      </div>

      {/* Animated Shimmer Effect */}
      <motion.div
        initial={{ rotate: '0deg' }}
        animate={{ rotate: '360deg' }}
        style={{
          scale: 1.75,
          background: `linear-gradient(135deg, ${borderColor} 0%, transparent 40%, transparent 60%, ${borderColor} 100%)`,
        }}
        transition={{ repeat: Infinity, duration: 3.5, ease: 'linear' }}
        className="absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
    </div>
  );
}

export default ShimmerBorderCard;
