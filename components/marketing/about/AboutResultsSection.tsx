'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Users, Zap } from 'lucide-react';
import Image from 'next/image';

/* =============================================================================
   COMPONENT PROPS
============================================================================= */
interface ResultFeature {
  _key?: string;
  title: string;
  description: string;
}

interface ResultCard {
  _key?: string;
  title?: string;
  label?: string; // Alternative to title (from CMS)
  value: string;
  icon: string;
}

interface AboutResultsSectionProps {
  badge?: string;
  headline?: string;
  description?: string;
  features?: ResultFeature[];
  resultCards?: ResultCard[];
  image?: string;
}

/* =============================================================================
   DEFAULT VALUES
============================================================================= */
const DEFAULT_FEATURES: ResultFeature[] = [
  {
    title: 'Boost Your Efficiency',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim.',
  },
  {
    title: 'Maximize Team Productivity',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim.',
  },
];

const DEFAULT_RESULT_CARDS: ResultCard[] = [
  { title: 'Active Users', value: '10K+', icon: 'Users' },
  { title: 'Projects Delivered', value: '500+', icon: 'CheckCircle' },
  { title: 'Time Saved', value: '40%', icon: 'Zap' },
  { title: 'Client Satisfaction', value: '99%', icon: 'CheckCircle' },
];

const DEFAULTS = {
  badge: 'Results',
  headline: 'Effortless Setup for\nMaximum Impact',
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
   RESULT CARD COMPONENT
============================================================================= */
interface ResultCardProps {
  card: ResultCard;
  index: number;
}

function ResultCardComponent({ card, index }: ResultCardProps): React.JSX.Element {
  const ICON_MAP: Record<string, typeof Zap> = { Zap, Users, CheckCircle };
  const Icon = ICON_MAP[card.icon] || CheckCircle;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative p-6 bg-lxd-light-card dark:bg-lxd-dark-page/50 rounded-[10px] border border-lxd-light-border dark:border-lxd-dark-border hover:border-brand-primary/50 transition-all duration-300 text-center"
    >
      {/* Icon */}
      <motion.div
        whileHover={{ rotate: 10 }}
        className="w-12 h-12 mx-auto mb-3 rounded-[10px] bg-linear-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center"
      >
        <Icon className="w-6 h-6 text-brand-blue dark:text-brand-cyan" />
      </motion.div>

      {/* Value */}
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', delay: index * 0.1 + 0.2 }}
        className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-purple-500 mb-1"
      >
        {card.value}
      </motion.div>

      {/* Title/Label */}
      <p className="text-sm text-lxd-text-dark-body dark:text-lxd-text-light-muted">
        {card.title || card.label}
      </p>

      {/* Connecting Line (except last) */}
      {index < 3 && (
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
          className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-linear-to-r from-blue-500 to-purple-500 origin-left"
        />
      )}
    </motion.div>
  );
}

/* =============================================================================
   MAIN COMPONENT
============================================================================= */
export function AboutResultsSection({
  badge,
  headline,
  description,
  features,
  resultCards,
  image,
}: AboutResultsSectionProps): React.JSX.Element {
  const displayFeatures = features?.length ? features : DEFAULT_FEATURES;
  const displayCards = resultCards?.length ? resultCards : DEFAULT_RESULT_CARDS;
  const headlineText = headline || DEFAULTS.headline;
  const headlineParts = headlineText.split('\n');

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--brand-primary) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative container mx-auto px-4">
        {/* Floating Badge */}
        <FloatingBadge text={badge || DEFAULTS.badge} />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
          {/* Left Column - Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
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
              <p className="text-lg text-lxd-text-dark-body dark:text-lxd-text-light-muted mb-8">
                {description || DEFAULTS.description}
              </p>
            </motion.div>

            {/* Features List */}
            <div className="space-y-6">
              {displayFeatures.map((feature, index) => (
                <motion.div
                  key={feature._key || index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="flex gap-4"
                >
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className="shrink-0 w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                  >
                    <CheckCircle className="w-5 h-5 text-brand-primary" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-bold text-lxd-text-dark-heading dark:text-brand-primary mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-lxd-text-dark-body dark:text-lxd-text-light-muted text-sm">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="mt-8 px-8 py-3 bg-linear-to-r from-blue-500 to-purple-600 text-brand-primary font-semibold rounded-[10px] inline-flex items-center gap-2"
              style={{
                boxShadow: '0 4px 20px rgba(85, 2, 120, 0.3)',
              }}
            >
              Get in Touch
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                &rarr;
              </motion.span>
            </motion.button>
          </div>

          {/* Right Column - Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative aspect-square rounded-[10px] overflow-hidden"
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 86, 184, 0.25)',
              }}
            >
              <Image
                src={image || '/placeholder.jpg'}
                alt="Results showcase"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-tr from-blue-500/20 via-transparent to-purple-500/20" />
            </motion.div>

            {/* Floating Decorations */}
            <motion.div
              animate={{ y: [0, -15, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-brand-primary/20 blur-2xl"
            />
            <motion.div
              animate={{ y: [0, 15, 0], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-brand-secondary/20 blur-2xl"
            />
          </motion.div>
        </div>

        {/* Result Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {displayCards.map((card, index) => (
            <ResultCardComponent key={card._key || index} card={card} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
