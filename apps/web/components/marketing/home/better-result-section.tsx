'use client';

/**
 * BetterResultSection Component
 * =============================
 * "Get Better Result With Stunning Features" section
 * 6-card feature grid with icons and hover animations.
 *
 * Features:
 * - Floating badge with blue/purple glow
 * - 6-card grid with icon animations
 * - Staggered entrance animations
 * - Gradient hover effects
 * - Pulse animation on icons
 */

import { motion } from 'framer-motion';
import { Bell, GitBranch, Link2, type LucideIcon, Rocket, Shield, TrendingUp } from 'lucide-react';
import { SectionBadge } from '@/components/marketing/shared/section-badge';

/* =============================================================================
   COMPONENT PROPS
============================================================================= */
interface FeatureItem {
  _key?: string;
  title: string;
  description: string;
  icon: string;
}

interface BetterResultSectionProps {
  badge?: string;
  headline?: string;
  description?: string;
  features?: FeatureItem[];
}

/* =============================================================================
   DEFAULT VALUES
============================================================================= */
const ICON_MAP: Record<string, LucideIcon> = {
  Shield,
  TrendingUp,
  Link2,
  GitBranch,
  Bell,
  Rocket,
};

const DEFAULT_FEATURES: FeatureItem[] = [
  {
    title: 'Data Security',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim.',
    icon: 'Shield',
  },
  {
    title: 'Auto Scaling',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim.',
    icon: 'TrendingUp',
  },
  {
    title: 'Cross Integration',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim.',
    icon: 'Link2',
  },
  {
    title: 'Version Control',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim.',
    icon: 'GitBranch',
  },
  {
    title: 'Real-time Alerts',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim.',
    icon: 'Bell',
  },
  {
    title: 'Easy Deployment',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim.',
    icon: 'Rocket',
  },
];

const DEFAULTS = {
  badge: 'Get Better Result With Stunning Features',
  headline: 'Everything You Need to\nSucceed',
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
};

/* =============================================================================
   FEATURE CARD COMPONENT
============================================================================= */
interface FeatureCardProps {
  feature: FeatureItem;
  index: number;
}

function FeatureCard({ feature, index }: FeatureCardProps): React.JSX.Element {
  const Icon = ICON_MAP[feature.icon] || Shield;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative p-6 bg-card dark:bg-background/50 rounded-[10px] border border-border hover:border-brand-primary/50 transition-all duration-300"
    >
      {/* Icon Container with Pulse Animation */}
      <motion.div whileHover={{ scale: 1.1 }} className="relative w-14 h-14 mb-4">
        {/* Pulse Ring */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileHover={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 rounded-[10px] bg-brand-primary/30"
        />

        {/* Icon Background */}
        <div className="relative w-full h-full rounded-[10px] flex items-center justify-center bg-linear-to-br from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-500 shadow-[0_4px_15px_rgba(85,2,120,0.2)]">
          <Icon className="w-7 h-7 text-brand-primary" />
        </div>
      </motion.div>

      {/* Title */}
      <h3 className="text-xl font-bold text-lxd-text-dark-heading dark:text-brand-primary mb-2 group-hover:text-brand-blue dark:group-hover:text-brand-cyan transition-colors duration-300">
        {feature.title}
      </h3>

      {/* Description */}
      <p className="text-lxd-text-dark-body dark:text-lxd-text-light-muted text-sm leading-relaxed">
        {feature.description}
      </p>

      {/* Hover Gradient Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 rounded-[10px] pointer-events-none bg-linear-to-br from-blue-500/5 to-purple-500/5"
      />

      {/* Bottom Accent Line */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-blue-500 to-purple-500 rounded-b-[10px] origin-left"
      />
    </motion.div>
  );
}

/* =============================================================================
   MAIN COMPONENT
============================================================================= */
export function BetterResultSection({
  badge,
  headline,
  description,
  features,
}: BetterResultSectionProps) {
  const displayFeatures = features?.length ? features : DEFAULT_FEATURES;
  const headlineText = headline || DEFAULTS.headline;
  const headlineParts = headlineText.split('\n');

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-purple-50/20 to-transparent dark:via-purple-950/10" />
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--brand-primary) 1px, transparent 1px),
              linear-gradient(to bottom, var(--brand-primary) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative container mx-auto px-4">
        {/* Section Badge */}
        <div className="flex justify-center mb-8">
          <SectionBadge>{badge || DEFAULTS.badge}</SectionBadge>
        </div>

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="text-lxd-text-dark-heading dark:text-brand-primary">
              {headlineParts[0]}
            </span>
            {headlineParts[1] && (
              <>
                <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-purple-500">
                  {headlineParts[1]}
                </span>
              </>
            )}
          </h2>
          <p className="text-lg text-lxd-text-dark-body dark:text-lxd-text-light-muted max-w-2xl mx-auto">
            {description || DEFAULTS.description}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayFeatures.map((feature, index) => (
            <FeatureCard key={feature._key || index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
