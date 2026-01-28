'use client';

import { motion, useInView } from 'framer-motion';
import { Brain, type LucideIcon, Shield, Smartphone } from 'lucide-react';
import { useRef } from 'react';

/* =============================================================================
   COMPONENT PROPS
============================================================================= */
interface FeatureIcon {
  _key?: string;
  icon: string;
  label?: string;
}

interface FeatureCard {
  _key?: string;
  title: string;
  description: string;
  icon?: string; // Optional - single icon
  icons?: FeatureIcon[]; // Optional - array of icons for rotation
}

interface AboutFeaturesSectionProps {
  badge?: string;
  headline?: string;
  description?: string;
  features?: FeatureCard[];
}

/* =============================================================================
   DEFAULT VALUES
============================================================================= */
const ICON_MAP: Record<string, LucideIcon> = {
  Shield,
  Brain,
  Smartphone,
};

const DEFAULT_FEATURES: FeatureCard[] = [
  {
    title: 'Cybersecurity & Protection',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
    icon: 'Shield',
  },
  {
    title: 'AI & Machine Learning',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
    icon: 'Brain',
  },
  {
    title: 'Mobile App Solutions',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
    icon: 'Smartphone',
  },
];

const DEFAULTS = {
  badge: 'Features',
  headline: 'Powerful Features for\nModern Teams',
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
};

/* =============================================================================
   FLOATING BADGE COMPONENT
============================================================================= */
function FloatingBadge({ text }: { text: string }): React.JSX.Element {
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
          boxShadow: '0 4px 20px rgba(85, 2, 120, 0.4), 0 8px 40px rgba(85, 2, 120, 0.2)',
        }}
      >
        {text}
      </span>
    </motion.div>
  );
}

/* =============================================================================
   ROTATING ICONS COMPONENT
============================================================================= */
function RotatingIcons(): React.JSX.Element {
  const icons = [Shield, Brain, Smartphone, Shield, Brain, Smartphone];

  return (
    <div className="relative h-12 overflow-hidden">
      <motion.div
        animate={{ x: [0, -50 * icons.length] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="flex gap-8 absolute"
      >
        {[...icons, ...icons].map((Icon, index) => (
          <div
            key={index}
            className="w-10 h-10 rounded-lg bg-lxd-light-card dark:bg-lxd-dark-card flex items-center justify-center shrink-0"
          >
            <Icon className="w-5 h-5 text-brand-blue" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* =============================================================================
   FEATURE CARD COMPONENT
============================================================================= */
interface FeatureCardProps {
  feature: FeatureCard;
  index: number;
}

function FeatureCardComponent({ feature, index }: FeatureCardProps): React.JSX.Element {
  // Get icon from either single icon or first icon in array
  const iconName = feature.icon || feature.icons?.[0]?.icon || 'Shield';
  const Icon = ICON_MAP[iconName] || Shield;
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="group relative"
    >
      {/* Card with Gradient Border on Hover */}
      <div className="relative p-[2px] rounded-[10px] overflow-hidden">
        {/* Animated Gradient Border */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-linear-to-r from-blue-500 via-purple-500 to-blue-500 rounded-[10px]"
          style={{ backgroundSize: '200% 100%' }}
        />

        {/* Card Content */}
        <div className="relative bg-lxd-light-card dark:bg-lxd-dark-page rounded-[10px] p-8">
          {/* Icon */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-16 h-16 mb-6 rounded-[10px] bg-linear-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 flex items-center justify-center border border-brand-primary/20"
          >
            <Icon className="w-8 h-8 text-brand-blue dark:text-brand-cyan" />
          </motion.div>

          {/* Title */}
          <h3 className="text-xl font-bold text-lxd-text-dark-heading dark:text-brand-primary mb-3 group-hover:text-brand-blue dark:group-hover:text-brand-cyan transition-colors">
            {feature.title}
          </h3>

          {/* Description */}
          <p className="text-lxd-text-dark-body dark:text-lxd-text-light-muted text-sm leading-relaxed mb-6">
            {feature.description}
          </p>

          {/* Rotating Icons Row */}
          <div className="mb-6 border-t border-b border-lxd-light-border dark:border-lxd-dark-border py-4">
            <RotatingIcons />
          </div>

          {/* Learn More Link */}
          <motion.button
            whileHover={{ x: 5 }}
            className="inline-flex items-center gap-2 text-brand-blue dark:text-brand-cyan font-semibold text-sm"
          >
            Discover More
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              &rarr;
            </motion.span>
          </motion.button>
        </div>
      </div>

      {/* Background Glow */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 -z-10 blur-xl bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-[10px]"
      />
    </motion.div>
  );
}

/* =============================================================================
   MAIN COMPONENT
============================================================================= */
export function AboutFeaturesSection({
  badge,
  headline,
  description,
  features,
}: AboutFeaturesSectionProps): React.JSX.Element {
  const displayFeatures = features?.length ? features : DEFAULT_FEATURES;
  const headlineText = headline || DEFAULTS.headline;
  const headlineParts = headlineText.split('\n');

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-b from-lxd-light-card via-white to-lxd-light-card dark:from-transparent dark:via-transparent dark:to-transparent" />

      {/* Animated Background Orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 15, repeat: Infinity }}
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-brand-primary blur-3xl"
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 18, repeat: Infinity, delay: 3 }}
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-brand-secondary blur-3xl"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayFeatures.map((feature, index) => (
            <FeatureCardComponent key={feature._key || index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
