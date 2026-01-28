'use client';

/**
 * =============================================================================
 * SectionBadge Component
 * =============================================================================
 *
 * Standardized floating badge for section titles.
 * Uses CSS variables from globals.css for consistent branding.
 *
 * Colors (from globals.css):
 * - Background: var(--brand-primary) - #0056B8 (Blue)
 * - Glow: var(--brand-secondary) - #BA23FB / #550278 (Purple)
 *
 * No icons - text only as per specification.
 *
 * @example
 * <SectionBadge>Implementation Packages</SectionBadge>
 * <SectionBadge animate={false}>Static Badge</SectionBadge>
 */

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface SectionBadgeProps {
  /** Badge text content */
  children: ReactNode;
  /** Whether to animate on scroll (default: true) */
  animate?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function SectionBadge({ children, animate = true, className = '' }: SectionBadgeProps) {
  const badgeClasses = `
    inline-block
    mb-4
    px-4
    py-1.5
    rounded-full
    text-sm
    font-semibold
    text-white
    bg-[var(--brand-primary)]
    ${className}
  `;

  // Shadow uses CSS color-mix for opacity with brand colors
  const badgeStyle = {
    boxShadow:
      '0 0 20px color-mix(in srgb, var(--brand-secondary) 50%, transparent), 0 0 40px color-mix(in srgb, var(--brand-secondary) 30%, transparent)',
  };

  if (animate) {
    return (
      <motion.span
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={badgeClasses}
        style={badgeStyle}
      >
        {children}
      </motion.span>
    );
  }

  return (
    <span className={badgeClasses} style={badgeStyle}>
      {children}
    </span>
  );
}

/**
 * SectionHeader Component
 * Combines SectionBadge with title and optional description
 */
export function SectionHeader({
  badge,
  title,
  description,
  centered = true,
  className = '',
}: {
  badge: string;
  title: string;
  description?: string;
  centered?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`mb-12 ${centered ? 'text-center' : ''} ${className}`}
    >
      <SectionBadge>{badge}</SectionBadge>

      <h2 className="text-3xl md:text-4xl font-bold text-(--text-primary) mb-4">{title}</h2>

      {description && (
        <p className="text-(--text-muted) max-w-2xl mx-auto leading-relaxed">{description}</p>
      )}
    </motion.div>
  );
}

/**
 * SectionWrapper Component
 * Full section wrapper with standardized background and padding
 */
export function SectionWrapper({
  children,
  className = '',
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`py-16 md:py-24 bg-(--surface-page) ${className}`}>
      <div className="container mx-auto px-4">{children}</div>
    </section>
  );
}

export default SectionBadge;
