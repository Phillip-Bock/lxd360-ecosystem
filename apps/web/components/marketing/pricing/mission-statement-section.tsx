'use client';

/**
 * MissionStatementSection Component
 * ==================================
 * Mission/values section with centered content.
 * Adapted from GoSmart features template.
 *
 * Features:
 * - Floating badge with blue/purple glow
 * - Centered user imagery with concentric circles
 * - Check-verified benefits
 * - Animated entrance effects
 */

import { motion } from 'framer-motion';
import { Check, Users } from 'lucide-react';

/* =============================================================================
   COMPONENT PROPS
============================================================================= */
interface MissionBenefit {
  _key?: string;
  text: string;
}

interface MissionStatementSectionProps {
  badge?: string;
  headline?: string;
  description?: string;
  benefits?: MissionBenefit[];
  ctaText?: string;
  ctaLink?: string;
}

/* =============================================================================
   DEFAULT VALUES
============================================================================= */
const DEFAULT_BENEFITS: MissionBenefit[] = [
  { text: 'Lorem ipsum dolor sit amet' },
  { text: 'Consectetur adipiscing elit' },
  { text: 'Suspendisse varius enim' },
];

const DEFAULTS = {
  badge: 'Our Mission',
  headline: 'You in the Center of Investments',
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus mi quis viverra ornare.',
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
   CONCENTRIC CIRCLES COMPONENT
============================================================================= */
function ConcentricCircles(): React.JSX.Element {
  return (
    <div className="relative flex items-center justify-center w-full h-[400px]">
      {/* Outer neon circle */}
      <motion.div
        animate={{ scale: [1, 1.02, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute w-[350px] h-[350px] rounded-full"
        style={{
          background:
            'linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 10%, transparent), color-mix(in srgb, var(--brand-secondary) 10%, transparent))',
          border: '2px solid color-mix(in srgb, var(--brand-primary) 20%, transparent)',
        }}
      />
      {/* Middle neon circle */}
      <motion.div
        animate={{ scale: [1, 1.03, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
        className="absolute w-[280px] h-[280px] rounded-full"
        style={{
          background:
            'linear-gradient(135deg, color-mix(in srgb, var(--brand-secondary) 10%, transparent), color-mix(in srgb, var(--brand-primary) 10%, transparent))',
          border: '2px solid color-mix(in srgb, var(--brand-secondary) 20%, transparent)',
        }}
      />
      {/* Inner circle with icon */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
        className="absolute w-[200px] h-[200px] rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center"
        style={{
          boxShadow: '0 20px 60px color-mix(in srgb, var(--brand-secondary) 40%, transparent)',
        }}
      >
        <Users className="w-20 h-20 text-brand-primary" />
      </motion.div>

      {/* Floating dots */}
      {[...Array(6)].map((_, i) => {
        const angle = (i * 60 * Math.PI) / 180;
        const radius = 180;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
            }}
            className="absolute w-3 h-3 rounded-full bg-brand-primary"
            style={{
              left: `calc(50% + ${x}px - 6px)`,
              top: `calc(50% + ${y}px - 6px)`,
            }}
          />
        );
      })}
    </div>
  );
}

/* =============================================================================
   MAIN COMPONENT
============================================================================= */
export function MissionStatementSection({
  badge,
  headline,
  description,
  benefits,
  ctaText,
  ctaLink,
}: MissionStatementSectionProps) {
  const displayBenefits = benefits?.length ? benefits : DEFAULT_BENEFITS;

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-b from-lxd-light-card via-background to-lxd-light-card dark:from-transparent dark:via-transparent dark:to-transparent" />

      {/* Animated Background Orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.02, 0.05, 0.02] }}
        transition={{ duration: 18, repeat: Infinity }}
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-brand-primary blur-3xl"
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.02, 0.05, 0.02] }}
        transition={{ duration: 22, repeat: Infinity, delay: 4 }}
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-brand-secondary blur-3xl"
      />

      <div className="relative container mx-auto px-4">
        {/* Floating Badge */}
        <FloatingBadge text={badge || DEFAULTS.badge} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left Column - Concentric Circles */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <ConcentricCircles />
          </motion.div>

          {/* Right Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-lxd-text-dark-heading dark:text-brand-primary mb-6">
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
                  initial={{ opacity: 0, x: 20 }}
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
          </motion.div>
        </div>
      </div>
    </section>
  );
}
