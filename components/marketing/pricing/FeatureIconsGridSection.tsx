'use client';

/**
 * FeatureIconsGridSection Component
 * ==================================
 * Scrolling icon grid with feature highlights.
 * Adapted from GoSmart features template.
 *
 * Features:
 * - Floating badge with blue/purple glow
 * - Animated scrolling icon rows
 * - Feature cards with hover effects
 * - Staggered entrance animations
 */

import { motion } from 'framer-motion';
import {
  Award,
  BarChart3,
  Brain,
  Database,
  Globe,
  Layers,
  type LucideIcon,
  Rocket,
  Shield,
  Sparkles,
  Target,
  Users,
  Zap,
} from 'lucide-react';

/* =============================================================================
   COMPONENT PROPS
============================================================================= */
interface FeatureCard {
  _key?: string;
  title: string;
  description: string;
  icon: string;
  color?: string;
}

interface FeatureIconsGridSectionProps {
  badge?: string;
  headline?: string;
  description?: string;
  features?: FeatureCard[];
}

/* =============================================================================
   ICON MAP
============================================================================= */
const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  Brain,
  BarChart3,
  Shield,
  Zap,
  Users,
  Database,
  Globe,
  Layers,
  Target,
  Rocket,
  Award,
};

/* =============================================================================
   DEFAULT VALUES
============================================================================= */
const DEFAULT_ICONS = [
  Sparkles,
  Brain,
  BarChart3,
  Shield,
  Zap,
  Users,
  Database,
  Globe,
  Layers,
  Target,
  Rocket,
  Award,
];

const DEFAULT_FEATURES: FeatureCard[] = [
  {
    title: 'Advanced Analytics',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim.',
    icon: 'BarChart3',
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Smart Integrations',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim.',
    icon: 'Layers',
    color: 'from-purple-500 to-purple-600',
  },
  {
    title: 'Enterprise Security',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim.',
    icon: 'Shield',
    color: 'from-green-500 to-green-600',
  },
  {
    title: 'AI-Powered Insights',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim.',
    icon: 'Brain',
    color: 'from-orange-500 to-orange-600',
  },
];

const DEFAULTS = {
  badge: 'Features',
  headline: 'Amazing Features That Keep On Giving',
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
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
   SCROLLING ICONS ROW COMPONENT
============================================================================= */
function ScrollingIconsRow({
  direction = 'left',
  speed = 30,
}: {
  direction?: 'left' | 'right';
  speed?: number;
}) {
  const icons = [...DEFAULT_ICONS, ...DEFAULT_ICONS, ...DEFAULT_ICONS];

  return (
    <div className="relative overflow-hidden py-4">
      <motion.div
        animate={{
          x:
            direction === 'left'
              ? [0, -50 * DEFAULT_ICONS.length]
              : [-50 * DEFAULT_ICONS.length, 0],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="flex gap-6"
      >
        {icons.map((Icon, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.2, rotate: 10 }}
            className="w-12 h-12 rounded-[10px] bg-linear-to-br from-lxd-light-card to-lxd-light-card dark:from-lxd-dark-card dark:to-lxd-dark-page flex items-center justify-center shrink-0 border border-lxd-light-border dark:border-lxd-dark-border"
          >
            <Icon className="w-6 h-6 text-brand-blue dark:text-brand-cyan" />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

/* =============================================================================
   FEATURE CARD COMPONENT
============================================================================= */
function FeatureCardComponent({ feature, index }: { feature: FeatureCard; index: number }) {
  const Icon = ICON_MAP[feature.icon] || Sparkles;
  const gradientColor = feature.color || 'from-blue-500 to-purple-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      whileHover={{ y: -5 }}
      className="group relative bg-lxd-light-card dark:bg-lxd-dark-page/50 rounded-[10px] p-8 border border-lxd-light-border dark:border-lxd-dark-border hover:border-brand-primary/50 transition-all duration-300"
    >
      {/* Neon Background Tile (visible on hover) */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 rounded-[10px] overflow-hidden pointer-events-none"
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: `linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 20%, transparent), color-mix(in srgb, var(--brand-secondary) 20%, transparent))`,
          }}
        />
      </motion.div>

      {/* Icon */}
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className={`w-14 h-14 rounded-[10px] mb-6 flex items-center justify-center bg-linear-to-br ${gradientColor}`}
      >
        <Icon className="w-7 h-7 text-brand-primary" />
      </motion.div>

      {/* Title */}
      <h3 className="text-xl font-bold text-lxd-text-dark-heading dark:text-brand-primary mb-3 group-hover:text-brand-blue dark:group-hover:text-brand-cyan transition-colors">
        {feature.title}
      </h3>

      {/* Description */}
      <p className="text-lxd-text-dark-body dark:text-lxd-text-light-muted text-sm leading-relaxed mb-4">
        {feature.description}
      </p>

      {/* Learn More Link */}
      <motion.button
        type="button"
        whileHover={{ x: 5 }}
        className="inline-flex items-center gap-2 text-brand-blue dark:text-brand-cyan font-semibold text-sm bg-transparent border-none cursor-pointer"
      >
        Keep on reading
        <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          &rarr;
        </motion.span>
      </motion.button>

      {/* Background Glow */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 -z-10 blur-xl bg-linear-to-r from-blue-500/10 to-purple-500/10 rounded-[10px]"
      />
    </motion.div>
  );
}

/* =============================================================================
   MAIN COMPONENT
============================================================================= */
export function FeatureIconsGridSection({
  badge,
  headline,
  description,
  features,
}: FeatureIconsGridSectionProps) {
  const displayFeatures = features?.length ? features : DEFAULT_FEATURES;

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-b from-lxd-light-card via-background to-lxd-light-card dark:from-transparent dark:via-transparent dark:to-transparent" />

      {/* Animated Background Orbs */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.02, 0.05, 0.02] }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-brand-primary blur-3xl"
      />

      <div className="relative container mx-auto px-4">
        {/* Floating Badge */}
        <FloatingBadge text={badge || DEFAULTS.badge} />

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-lxd-text-dark-heading dark:text-brand-primary mb-4">
            {headline || DEFAULTS.headline}
          </h2>
          <p className="text-lg text-lxd-text-dark-body dark:text-lxd-text-light-muted max-w-2xl mx-auto">
            {description || DEFAULTS.description}
          </p>
        </motion.div>

        {/* Scrolling Icons Rows */}
        <div className="mb-16 -mx-4 overflow-hidden">
          <ScrollingIconsRow direction="left" speed={40} />
          <ScrollingIconsRow direction="right" speed={35} />
          <ScrollingIconsRow direction="left" speed={45} />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {displayFeatures.map((feature, index) => (
            <FeatureCardComponent key={feature._key || index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
