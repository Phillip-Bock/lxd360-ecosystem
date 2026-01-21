'use client';

/**
 * TransformBusinessSection Component
 * ===================================
 * "Transform Your Business With Intuitive AI Solutions" section
 * Parallax scroll effect with 3 cards that fade/transition on scroll.
 *
 * Features:
 * - Floating badge with blue/purple glow
 * - Sticky scroll container with 3 parallax cards
 * - Cards scroll up and fade as user scrolls
 * - Smooth spring-based animations
 * - 3D perspective effects
 */

import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Link2, Users, Zap } from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';

/* =============================================================================
   COMPONENT PROPS
============================================================================= */
interface TransformCard {
  _key?: string;
  title: string;
  description: string;
  icon: string;
  image?: string;
}

interface TransformBusinessSectionProps {
  badge?: string;
  headline?: string;
  description?: string;
  cards?: TransformCard[];
}

/* =============================================================================
   DEFAULT VALUES
============================================================================= */
const ICON_MAP: Record<string, typeof Zap> = {
  Zap,
  Link2,
  Users,
};

const DEFAULT_CARDS: TransformCard[] = [
  {
    title: 'Build Smarter, Scale Faster',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.',
    icon: 'Zap',
    image: '/placeholder.jpg',
  },
  {
    title: 'Seamless Integration',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.',
    icon: 'Link2',
    image: '/placeholder.jpg',
  },
  {
    title: 'Designed to Empower',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.',
    icon: 'Users',
    image: '/placeholder.jpg',
  },
];

const DEFAULTS = {
  badge: 'Transform Your Business With Intuitive AI Solutions',
  headline: 'Innovative Solutions for\nModern Challenges',
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
   PARALLAX CARD COMPONENT
============================================================================= */
interface ParallaxCardProps {
  card: TransformCard;
  index: number;
  totalCards: number;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
}

function ParallaxCard({
  card,
  index,
  totalCards,
  scrollYProgress,
}: ParallaxCardProps): React.JSX.Element {
  const Icon = ICON_MAP[card.icon] || Zap;

  // Calculate card-specific scroll ranges
  const cardStart = index / totalCards;
  const cardEnd = (index + 1) / totalCards;
  const cardMid = (cardStart + cardEnd) / 2;

  // Smooth spring for transforms
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Card transforms based on scroll position
  const y = useTransform(smoothProgress, [cardStart, cardMid, cardEnd], [100, 0, -100]);

  const opacity = useTransform(
    smoothProgress,
    [cardStart, cardStart + 0.05, cardEnd - 0.05, cardEnd],
    [0, 1, 1, 0],
  );

  const scale = useTransform(smoothProgress, [cardStart, cardMid, cardEnd], [0.9, 1, 0.9]);

  const rotateX = useTransform(smoothProgress, [cardStart, cardMid, cardEnd], [10, 0, -10]);

  return (
    <motion.div
      style={{
        y,
        opacity,
        scale,
        rotateX,
        transformPerspective: 1200,
      }}
      className="absolute inset-0 flex items-center justify-center px-4"
    >
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* Content Side */}
        <div className={`space-y-6 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
          {/* Icon */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-16 h-16 rounded-[10px] bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center"
            style={{
              boxShadow: '0 4px 20px rgba(85, 2, 120, 0.3)',
            }}
          >
            <Icon className="w-8 h-8 text-brand-primary" />
          </motion.div>

          {/* Title */}
          <h3 className="text-3xl md:text-4xl font-bold text-lxd-text-dark-heading dark:text-brand-primary">
            {card.title}
          </h3>

          {/* Description */}
          <p className="text-lg text-lxd-text-dark-body dark:text-lxd-text-light-muted leading-relaxed">
            {card.description}
          </p>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 text-brand-blue dark:text-brand-cyan font-semibold group"
          >
            Learn More
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              &rarr;
            </motion.span>
          </motion.button>
        </div>

        {/* Image Side */}
        <div className={`relative ${index % 2 === 1 ? 'md:order-1' : ''}`}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative aspect-4/3 rounded-[10px] overflow-hidden"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 86, 184, 0.25)',
            }}
          >
            <Image
              src={card.image || '/placeholder.jpg'}
              alt={card.title}
              fill
              className="object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-tr from-blue-500/20 via-transparent to-purple-500/20" />

            {/* Animated Border */}
            <motion.div
              animate={{
                boxShadow: [
                  'inset 0 0 0 2px rgba(0, 86, 184, 0)',
                  'inset 0 0 0 2px rgba(0, 86, 184, 0.3)',
                  'inset 0 0 0 2px rgba(0, 86, 184, 0)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-[10px]"
            />
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            animate={{
              y: [0, -10, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-brand-primary/10 blur-xl"
          />
          <motion.div
            animate={{
              y: [0, 10, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full bg-brand-secondary/10 blur-xl"
          />
        </div>
      </div>
    </motion.div>
  );
}

/* =============================================================================
   MAIN COMPONENT
============================================================================= */
export function TransformBusinessSection({
  badge,
  headline,
  description,
  cards,
}: TransformBusinessSectionProps): React.JSX.Element {
  const containerRef = useRef<HTMLElement>(null);
  const displayCards = cards?.length ? cards : DEFAULT_CARDS;
  const headlineText = headline || DEFAULTS.headline;
  const headlineParts = headlineText.split('\n');

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Height multiplier based on number of cards
  const sectionHeight = `${100 + displayCards.length * 100}vh`;

  return (
    <section ref={containerRef} className="relative" style={{ height: sectionHeight }}>
      {/* Sticky Container */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-linear-to-br from-card via-background to-card dark:from-transparent dark:via-transparent dark:to-transparent" />

        {/* Floating Background Elements */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-primary/20 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 12, repeat: Infinity, delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-brand-secondary/20 blur-3xl"
        />

        {/* Content Container */}
        <div className="relative h-full flex flex-col">
          {/* Header - Fixed at Top */}
          <div className="shrink-0 pt-16 md:pt-24 pb-8">
            <div className="container mx-auto px-4 text-center">
              {/* Floating Badge */}
              <FloatingBadge text={badge || DEFAULTS.badge} />

              {/* Section Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
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
            </div>
          </div>

          {/* Cards Container - Fills Remaining Space */}
          <div className="grow relative">
            {displayCards.map((card, index) => (
              <ParallaxCard
                key={card._key || index}
                card={card}
                index={index}
                totalCards={displayCards.length}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </div>

          {/* Progress Indicator */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-2">
            {displayCards.map((_, index) => {
              const cardStart = index / displayCards.length;
              const cardEnd = (index + 1) / displayCards.length;
              return (
                <ProgressDot
                  key={index}
                  index={index}
                  scrollYProgress={scrollYProgress}
                  start={cardStart}
                  end={cardEnd}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =============================================================================
   PROGRESS DOT COMPONENT
============================================================================= */
interface ProgressDotProps {
  index: number;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
  start: number;
  end: number;
}

function ProgressDot({ scrollYProgress, start, end }: ProgressDotProps): React.JSX.Element {
  const scale = useTransform(scrollYProgress, [start, end], [0.5, 1.2]);
  const opacity = useTransform(scrollYProgress, [start, end], [0.3, 1]);

  return (
    <motion.div
      style={{ scale, opacity }}
      className="w-2 h-2 rounded-full bg-primary transition-all"
    />
  );
}
