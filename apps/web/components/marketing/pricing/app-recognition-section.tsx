'use client';

/**
 * AppRecognitionSection Component
 * ================================
 * Award/recognition section with centered imagery.
 * Adapted from GoSmart features template.
 *
 * Features:
 * - Floating badge with blue/purple glow
 * - Centered app mockup with decorative circles
 * - Check-verified benefits list
 * - Animated entrance effects
 */

import { motion } from 'framer-motion';
import { Award, Check, Star } from 'lucide-react';
import Image from 'next/image';

/* =============================================================================
   COMPONENT PROPS
============================================================================= */
interface Benefit {
  _key?: string;
  text: string;
}

interface AppRecognitionSectionProps {
  badge?: string;
  headline?: string;
  description?: string;
  benefits?: Benefit[];
  image?: string;
  ctaText?: string;
  ctaLink?: string;
}

/* =============================================================================
   DEFAULT VALUES
============================================================================= */
const DEFAULT_BENEFITS: Benefit[] = [
  { text: 'Lorem ipsum dolor sit amet' },
  { text: 'Consectetur adipiscing elit' },
  { text: 'Suspendisse varius enim' },
];

const DEFAULTS = {
  badge: 'Recognition',
  headline: 'Rated the Best in AppStore of 2024',
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
  ctaText: 'Get Started',
  ctaLink: '#',
};

/* =============================================================================
   FLOATING BADGE COMPONENT
============================================================================= */
function FloatingBadge({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="flex justify-center mb-8"
    >
      <span
        className="px-6 py-2 text-sm font-semibold text-brand-primary rounded-[10px] inline-block"
        style={{
          background: 'var(--brand-primary)',
          boxShadow:
            '0 4px 20px color-mix(in srgb, var(--brand-secondary) 40%, transparent), 0 8px 40px color-mix(in srgb, var(--brand-secondary) 20%, transparent)',
        }}
      >
        {text}
      </span>
    </motion.div>
  );
}

/* =============================================================================
   DECORATIVE CIRCLES COMPONENT
============================================================================= */
function DecorativeCircles(): React.JSX.Element {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Outer circle */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute w-[500px] h-[500px] rounded-full border-2 border-brand-primary/20"
      />
      {/* Middle circle */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.2, 0.15] }}
        transition={{ duration: 6, repeat: Infinity, delay: 1 }}
        className="absolute w-[400px] h-[400px] rounded-full border-2 border-brand-secondary/20"
      />
      {/* Inner circle */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.25, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, delay: 2 }}
        className="absolute w-[300px] h-[300px] rounded-full border-2 border-brand-primary/30"
      />
      {/* Glow */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute w-[350px] h-[350px] rounded-full bg-linear-to-r from-blue-500 to-purple-500 blur-3xl"
      />
    </div>
  );
}

/* =============================================================================
   MAIN COMPONENT
============================================================================= */
export function AppRecognitionSection({
  badge,
  headline,
  description,
  benefits,
  image,
  ctaText,
  ctaLink,
}: AppRecognitionSectionProps) {
  const displayBenefits = benefits?.length ? benefits : DEFAULT_BENEFITS;

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-b from-lxd-light-card via-background to-lxd-light-card dark:from-transparent dark:via-transparent dark:to-transparent" />

      {/* Animated Background Orbs */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0], opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 15, repeat: Infinity }}
        className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-brand-primary blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 20, 0], opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 18, repeat: Infinity, delay: 3 }}
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-brand-secondary blur-3xl"
      />

      <div className="relative container mx-auto px-4">
        {/* Floating Badge */}
        <FloatingBadge text={badge || DEFAULTS.badge} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Award Icon */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-16 h-16 rounded-[10px] bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6"
            >
              <Award className="w-8 h-8 text-brand-primary" />
            </motion.div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-lxd-text-dark-heading dark:text-brand-primary mb-4">
              {headline || DEFAULTS.headline}
            </h2>

            {/* Description */}
            <p className="text-lg text-lxd-text-dark-body dark:text-lxd-text-light-muted mb-8 leading-relaxed">
              {description || DEFAULTS.description}
            </p>

            {/* Benefits List */}
            <div className="space-y-4 mb-8">
              {displayBenefits.map((benefit, index) => (
                <motion.div
                  key={benefit._key || index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    className="w-6 h-6 rounded-full bg-linear-to-br from-green-400 to-green-600 flex items-center justify-center shrink-0"
                  >
                    <Check className="w-4 h-4 text-brand-primary" />
                  </motion.div>
                  <span className="text-lxd-text-dark-body dark:text-lxd-text-light-body font-medium">
                    {benefit.text}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.a
              href={ctaLink || DEFAULTS.ctaLink}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-blue-500 to-purple-600 text-brand-primary font-semibold rounded-[10px]"
              style={{
                boxShadow: '0 4px 20px color-mix(in srgb, var(--brand-secondary) 30%, transparent)',
              }}
            >
              {ctaText || DEFAULTS.ctaText}
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                &rarr;
              </motion.span>
            </motion.a>

            {/* Rating Stars */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-2 mt-6"
            >
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-brand-warning fill-current" />
                ))}
              </div>
              <span className="text-sm text-lxd-text-dark-body dark:text-lxd-text-light-muted">
                4.9/5 from 2,000+ reviews
              </span>
            </motion.div>
          </motion.div>

          {/* Right Column - Image with Circles */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex items-center justify-center min-h-[400px]"
          >
            {/* Decorative Circles */}
            <DecorativeCircles />

            {/* App Mockup */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="relative z-10 w-64 h-64 rounded-[10px] overflow-hidden bg-linear-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30"
              style={{
                boxShadow:
                  '0 25px 50px -12px color-mix(in srgb, var(--brand-primary) 25%, transparent)',
              }}
            >
              {image ? (
                <Image src={image} alt="App mockup" fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  >
                    <Award className="w-24 h-24 text-brand-blue/30" />
                  </motion.div>
                </div>
              )}
            </motion.div>

            {/* Floating Badge */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-10 right-10 px-4 py-2 bg-lxd-light-card dark:bg-lxd-dark-card rounded-full shadow-lg flex items-center gap-2 z-20"
            >
              <Award className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-semibold text-lxd-text-dark-heading dark:text-brand-primary">
                #1 Rated
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
