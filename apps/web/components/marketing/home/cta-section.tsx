'use client';

import { motion } from 'framer-motion';
import { GradientShadowButton } from '@/components/ui/gradient-shadow-button';
import styles from './bubble.module.css';

/* =============================================================================
   COMPONENT PROPS
============================================================================= */
interface CTASectionProps {
  badge?: string;
  headline?: string;
  description?: string;
  trustIndicators?: string[];
}

/* =============================================================================
   DEFAULT VALUES
============================================================================= */
const DEFAULTS = {
  badge: 'Transform Your L&D',
  headline: 'Ready to Guarantee Performance\nand Unify Your Stack?',
  description:
    'Stop paying the fragmentation tax. LXP360 is the unified, AI-driven operating system that replaces costly legacy systems and delivers scientifically backed skill mastery. Choose your starting line: launch a pilot today, or engage our experts for a strategic modernization blueprint.',
  trustIndicators: ['14-Day Free Trial', 'No Credit Card Required', 'SDVOSB Certified'],
};

/* =============================================================================
   BUBBLE TEXT COMPONENT
   Wave effect using CSS - characters scale up with neighbors affected
============================================================================= */

interface BubbleTextProps {
  text: string;
  className?: string;
}

function BubbleText({ text, className = '' }: BubbleTextProps): React.JSX.Element {
  return (
    <span className={className}>
      {text.split('').map((char, idx) => (
        <span key={idx} className={styles.hoverText}>
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}

/* =============================================================================
   MAIN COMPONENT
============================================================================= */

export function CTASection({ badge, headline, description, trustIndicators }: CTASectionProps) {
  // Parse headline into parts (split by newline for gradient styling)
  const headlineText = headline || DEFAULTS.headline;
  const headlineParts = headlineText.split('\n');
  const headlineLine1 = headlineParts[0] || '';
  const headlineLine2 = headlineParts[1] || '';

  // Use trust indicators from content service or defaults
  const indicators = trustIndicators?.length ? trustIndicators : DEFAULTS.trustIndicators;
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Gradient Background - Theme-aware (WCAG 2.2 AA) */}
      <div className="absolute inset-0 bg-linear-to-br from-white via-lxd-light-card to-white dark:from-transparent dark:via-transparent dark:to-transparent" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating orbs - slightly more visible in light mode */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-brand-primary/20 dark:bg-brand-primary/10 blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-brand-secondary/20 dark:bg-brand-secondary/10 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-brand-primary/10 dark:bg-brand-primary/5 blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 text-center">
        {/* Badge - WCAG AA: blue-700 on light bg = 4.6:1, blue-400 on dark bg = 4.5:1 */}
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-block mb-6 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-brand-primary/20 text-blue-700 dark:text-brand-cyan text-sm font-semibold"
        >
          {badge || DEFAULTS.badge}
        </motion.span>

        {/* Title with Bubble Text - WCAG AA: gray-900 on light = 21:1, white on dark = 17:1 */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-lxd-text-dark-heading dark:text-brand-primary mb-6 leading-tight"
        >
          <BubbleText text={headlineLine1} />
          {headlineLine2 && (
            <>
              <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                {' '}
                {headlineLine2}
              </span>
            </>
          )}
        </motion.h2>

        {/* Description - WCAG AA: gray-700 on light = 9.6:1, gray-300 on dark = 12:1 */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-lxd-text-dark-body dark:text-lxd-text-light-body max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          {description || DEFAULTS.description}
        </motion.p>

        {/* CTA Buttons - Three gradient shadow buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <GradientShadowButton href="/inspire-studio" variant="primary">
            Create AI-Powered Content Fast
          </GradientShadowButton>
          <GradientShadowButton href="/lxd-ecosystem" variant="secondary">
            Unify Your Entire Tech Stack
          </GradientShadowButton>
          <GradientShadowButton href="/solutions" variant="tertiary">
            Design Your L&D Strategy Blueprint
          </GradientShadowButton>
        </motion.div>

        {/* Trust indicators - dynamic from content service - WCAG AA compliant */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-lxd-text-dark-body dark:text-lxd-text-light-muted"
        >
          {indicators.map((indicator, index) => (
            <div key={index} className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-brand-blue dark:text-brand-cyan"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{indicator}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
