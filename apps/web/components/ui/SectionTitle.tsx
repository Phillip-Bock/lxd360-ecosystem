'use client';

import { motion } from 'framer-motion';

interface SectionTitleProps {
  /** Small text above the main title */
  eyebrow?: string;
  /** Main section heading */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Text alignment */
  align?: 'left' | 'center';
  /** Animation on scroll */
  animate?: boolean;
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  animate = true,
}: SectionTitleProps) {
  const alignmentClasses = align === 'center' ? 'text-center' : 'text-left';
  const subtitleAlignment = align === 'center' ? 'mx-auto' : '';

  const content = (
    <div className={`mb-12 ${alignmentClasses}`}>
      {/* Eyebrow - Brand Secondary (Purple) */}
      {eyebrow && (
        <span className="text-sm font-semibold uppercase tracking-wider mb-2 block text-(--brand-secondary)">
          {eyebrow}
        </span>
      )}

      {/* Main Title - Primary text color (adapts to theme) */}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-(--text-primary)">
        {title}
      </h2>

      {/* Subtitle - Muted text color (adapts to theme) */}
      {subtitle && (
        <p className={`text-lg md:text-xl max-w-3xl text-(--text-muted) ${subtitleAlignment}`}>
          {subtitle}
        </p>
      )}
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}

export default SectionTitle;
