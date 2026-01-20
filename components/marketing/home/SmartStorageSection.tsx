'use client';

/**
 * SmartStorageSection Component
 * =============================
 * "Smart Storage" section with 4 capability pillars.
 * Text-based emphasis blocks with animated underlines and hover effects.
 *
 * Features:
 * - Floating badge with blue/purple glow
 * - 4 large text pillars with animated underlines
 * - Staggered entrance animations
 * - Hover reveal animations
 * - Gradient text effects
 */

import { motion } from 'framer-motion';
import { Database, Layers, Search, Users } from 'lucide-react';

/* =============================================================================
   COMPONENT PROPS
============================================================================= */
interface CapabilityPillar {
  _key?: string;
  title: string;
  description: string;
  icon: string;
}

interface SmartStorageSectionProps {
  badge?: string;
  headline?: string;
  description?: string;
  pillars?: CapabilityPillar[];
}

/* =============================================================================
   DEFAULT VALUES
============================================================================= */
const ICON_MAP: Record<string, typeof Database> = {
  Database,
  Search,
  Layers,
  Users,
};

const DEFAULT_PILLARS: CapabilityPillar[] = [
  {
    title: 'Smart Storage',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum.',
    icon: 'Database',
  },
  {
    title: 'Intelligent Queries',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum.',
    icon: 'Search',
  },
  {
    title: 'Adaptive Caching',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum.',
    icon: 'Layers',
  },
  {
    title: 'Collaboration',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum.',
    icon: 'Users',
  },
];

const DEFAULTS = {
  badge: 'Smart Storage',
  headline: 'Powerful Capabilities\nAt Your Fingertips',
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
          boxShadow: '0 4px 20px rgba(85, 2, 120, 0.4), 0 8px 40px rgba(85, 2, 120, 0.2)',
        }}
      >
        {text}
      </span>
    </motion.div>
  );
}

/* =============================================================================
   CAPABILITY PILLAR COMPONENT
============================================================================= */
interface PillarCardProps {
  pillar: CapabilityPillar;
  index: number;
}

function PillarCard({ pillar, index }: PillarCardProps): React.JSX.Element {
  const Icon = ICON_MAP[pillar.icon] || Database;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="group relative"
    >
      {/* Card Container */}
      <motion.div whileHover={{ y: -10 }} className="relative p-8 md:p-10 text-center">
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.15 + 0.2, type: 'spring' }}
          className="mx-auto mb-6"
        >
          <motion.div
            whileHover={{ scale: 1.15, rotate: 10 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="w-20 h-20 mx-auto rounded-[10px] bg-linear-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 flex items-center justify-center border border-brand-primary/20 dark:border-brand-primary/30 group-hover:border-brand-primary/50 transition-colors duration-300"
          >
            <Icon className="w-10 h-10 text-brand-blue dark:text-brand-cyan group-hover:text-brand-blue transition-colors" />
          </motion.div>
        </motion.div>

        {/* Title with Animated Underline */}
        <div className="relative mb-4">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-lxd-text-dark-heading dark:text-brand-primary group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-500">
            {pillar.title}
          </h3>

          {/* Animated Underline */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.15 + 0.4 }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-linear-to-r from-blue-500 to-purple-500 rounded-full origin-center"
          />

          {/* Hover Expand Underline */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            whileHover={{ scaleX: 1, opacity: 1 }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-full h-1 bg-linear-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full origin-center"
          />
        </div>

        {/* Description - Reveals on Hover */}
        <motion.p
          initial={{ opacity: 0.6 }}
          whileHover={{ opacity: 1 }}
          className="text-lxd-text-dark-body dark:text-lxd-text-light-muted text-base leading-relaxed max-w-xs mx-auto"
        >
          {pillar.description}
        </motion.p>

        {/* Hover Background Glow */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 rounded-[10px] -z-10 bg-linear-to-br from-blue-500/5 to-purple-500/5 blur-xl"
        />
      </motion.div>

      {/* Divider Line (except last) */}
      {index < 3 && (
        <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-24 bg-linear-to-b from-transparent via-muted dark:via-secondary to-transparent" />
      )}
    </motion.div>
  );
}

/* =============================================================================
   MAIN COMPONENT
============================================================================= */
export function SmartStorageSection({
  badge,
  headline,
  description,
  pillars,
}: SmartStorageSectionProps) {
  const displayPillars = pillars?.length ? pillars : DEFAULT_PILLARS;
  const headlineText = headline || DEFAULTS.headline;
  const headlineParts = headlineText.split('\n');

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-b from-card via-background to-card dark:from-transparent dark:via-transparent dark:to-transparent" />

        {/* Animated Background Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-brand-primary blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{ duration: 18, repeat: Infinity, delay: 3 }}
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-brand-secondary blur-3xl"
        />
      </div>

      <div className="relative container mx-auto px-4">
        {/* Floating Badge */}
        <FloatingBadge text={badge || DEFAULTS.badge} />

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-16 md:mb-24"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
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
          <p className="text-lg md:text-xl text-lxd-text-dark-body dark:text-lxd-text-light-muted max-w-2xl mx-auto">
            {description || DEFAULTS.description}
          </p>
        </motion.div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0">
          {displayPillars.map((pillar, index) => (
            <PillarCard key={pillar._key || index} pillar={pillar} index={index} />
          ))}
        </div>

        {/* Bottom Decorative Element */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 md:mt-24 mx-auto max-w-3xl h-px bg-linear-to-r from-transparent via-blue-500/50 to-transparent"
        />
      </div>
    </section>
  );
}
