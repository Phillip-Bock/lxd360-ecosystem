'use client';

/**
 * InfiniteScaleSection Component
 * ==============================
 * "AI-Powered Databases Built for Infinite Scale" section
 * Adapted from Datalog template with LXD360 branding.
 *
 * Features:
 * - Floating badge with blue/purple glow
 * - Animated headline with gradient text
 * - Staggered entrance animations
 * - Floating background orbs
 * - Parallax scroll effects
 */

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';
import { SectionBadge } from '@/components/marketing/shared/section-badge';

/* =============================================================================
   COMPONENT PROPS
============================================================================= */
interface InfiniteScaleSectionProps {
  badge?: string;
  headline?: string;
  description?: string;
  image?: string;
}

/* =============================================================================
   DEFAULT VALUES
============================================================================= */
const DEFAULTS = {
  badge: 'AI-Powered Databases Built for Infinite Scale',
  headline: 'Unlock the Power of\nIntelligent Data Solutions',
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.',
};

/* =============================================================================
   MAIN COMPONENT
============================================================================= */
export function InfiniteScaleSection({
  badge,
  headline,
  description,
  image,
}: InfiniteScaleSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Parallax transforms
  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.95, 1, 1, 0.95]);

  const headlineText = headline || DEFAULTS.headline;
  const headlineParts = headlineText.split('\n');

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 lg:py-40 overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          style={{ y: y1 }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-brand-primary/20 dark:bg-brand-primary/10 blur-3xl"
        />
        <motion.div
          style={{ y: y2 }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full bg-brand-secondary/20 dark:bg-brand-secondary/10 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-1/2 left-1/3 w-72 h-72 rounded-full bg-brand-primary/10 dark:bg-brand-primary/5 blur-3xl"
        />
      </div>

      {/* Content */}
      <motion.div
        style={{ opacity, scale }}
        className="relative container mx-auto px-4 text-center"
      >
        {/* Section Badge */}
        <div className="inline-block mb-8">
          <SectionBadge>{badge || DEFAULTS.badge}</SectionBadge>
        </div>

        {/* Animated Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
        >
          <span className="text-lxd-text-dark-heading dark:text-brand-primary">
            {headlineParts[0]}
          </span>
          {headlineParts[1] && (
            <>
              <br />
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 via-purple-500 to-blue-600"
              >
                {headlineParts[1]}
              </motion.span>
            </>
          )}
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg md:text-xl text-lxd-text-dark-body dark:text-lxd-text-light-body max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          {description || DEFAULTS.description}
        </motion.p>

        {/* Feature Image with 3D Effect */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 10 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative max-w-4xl mx-auto"
          style={{ perspective: '1000px' }}
        >
          <motion.div
            whileHover={{ scale: 1.02, rotateX: -2 }}
            transition={{ duration: 0.4 }}
            className="relative rounded-[10px] overflow-hidden shadow-2xl shadow-blue-500/20 dark:shadow-blue-500/30"
          >
            <Image
              src={image || '/placeholder.jpg'}
              alt="AI-powered data visualization"
              width={1200}
              height={675}
              className="w-full h-auto object-cover"
              priority
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />

            {/* Animated Border Glow */}
            <motion.div
              animate={{
                boxShadow: [
                  'inset 0 0 0 2px rgba(0, 86, 184, 0)',
                  'inset 0 0 0 2px rgba(0, 86, 184, 0.5)',
                  'inset 0 0 0 2px rgba(0, 86, 184, 0)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-[10px]"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
