'use client';

/**
 * StreamlineWorkflowSection Component
 * ====================================
 * "Streamline Your Workflow With Our AI Platform" section
 * 4 bento-style cards with hover animations and staggered entrance.
 *
 * Features:
 * - Floating badge with blue/purple glow
 * - 4 animated bento cards
 * - 3D tilt effect on hover
 * - Staggered entrance animations
 * - Icon animations on hover
 */

import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { BarChart3, Brain, type LucideIcon, Rocket, Shield } from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';
import { SectionBadge } from '@/components/marketing/shared/section-badge';

/* =============================================================================
   COMPONENT PROPS
============================================================================= */
interface WorkflowCard {
  _key?: string;
  title: string;
  description: string;
  icon: string;
  image?: string;
}

interface StreamlineWorkflowSectionProps {
  badge?: string;
  headline?: string;
  description?: string;
  cards?: WorkflowCard[];
}

/* =============================================================================
   DEFAULT VALUES
============================================================================= */
const ICON_MAP: Record<string, LucideIcon> = {
  Brain,
  Shield,
  Rocket,
  BarChart3,
};

const DEFAULT_CARDS: WorkflowCard[] = [
  {
    title: 'Collaborative Intelligence',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
    icon: 'Brain',
    image: '/placeholder.jpg',
  },
  {
    title: 'User Authentication',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
    icon: 'Shield',
    image: '/placeholder.jpg',
  },
  {
    title: 'Easy Deployment',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
    icon: 'Rocket',
    image: '/placeholder.jpg',
  },
  {
    title: 'Visitor Insights',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
    icon: 'BarChart3',
    image: '/placeholder.jpg',
  },
];

const DEFAULTS = {
  badge: 'Streamline Your Workflow With Our AI Platform',
  headline: 'Powerful Features for\nModern Learning',
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
};

/* =============================================================================
   TILT CARD COMPONENT
   Interactive 3D tilt effect on mouse hover
============================================================================= */
const ROTATION_RANGE = 20;
const HALF_ROTATION_RANGE = ROTATION_RANGE / 2;

interface TiltCardProps {
  card: WorkflowCard;
  index: number;
}

function TiltCard({ card, index }: TiltCardProps): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x, { stiffness: 200, damping: 20 });
  const ySpring = useSpring(y, { stiffness: 200, damping: 20 });
  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

  const Icon = ICON_MAP[card.icon] || Brain;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * ROTATION_RANGE;
    const mouseY = (e.clientY - rect.top) * ROTATION_RANGE;
    const rX = (mouseY / rect.height - HALF_ROTATION_RANGE) * -1;
    const rY = mouseX / rect.width - HALF_ROTATION_RANGE;
    x.set(rX);
    y.set(rY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        transform,
      }}
      className="group relative bg-card dark:bg-background/50 rounded-[10px] overflow-hidden border border-border hover:border-brand-primary/50 transition-colors duration-300"
    >
      {/* Card Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={card.image || '/placeholder.jpg'}
          alt={card.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />

        {/* Animated Icon */}
        <motion.div style={{ transform: 'translateZ(30px)' }} className="absolute bottom-4 left-4">
          <motion.div
            whileHover={{ scale: 1.2, rotate: 10 }}
            className="w-12 h-12 rounded-[10px] bg-brand-primary/90 backdrop-blur-xs flex items-center justify-center"
            style={{
              boxShadow: '0 4px 15px rgba(85, 2, 120, 0.3)',
            }}
          >
            <Icon className="w-6 h-6 text-brand-primary" />
          </motion.div>
        </motion.div>
      </div>

      {/* Card Content */}
      <div style={{ transform: 'translateZ(20px)' }} className="p-6">
        <h3 className="text-xl font-bold text-lxd-text-dark-heading dark:text-brand-primary mb-2 group-hover:text-brand-blue dark:group-hover:text-brand-cyan transition-colors">
          {card.title}
        </h3>
        <p className="text-lxd-text-dark-body dark:text-lxd-text-light-muted text-sm leading-relaxed">
          {card.description}
        </p>
      </div>

      {/* Hover Glow Effect */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 rounded-[10px] pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 30px rgba(0, 86, 184, 0.1), 0 0 30px rgba(85, 2, 120, 0.1)',
        }}
      />
    </motion.div>
  );
}

/* =============================================================================
   MAIN COMPONENT
============================================================================= */
export function StreamlineWorkflowSection({
  badge,
  headline,
  description,
  cards,
}: StreamlineWorkflowSectionProps) {
  const displayCards = cards?.length ? cards : DEFAULT_CARDS;
  const headlineText = headline || DEFAULTS.headline;
  const headlineParts = headlineText.split('\n');

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-blue-50/30 to-transparent dark:via-blue-950/10" />

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

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayCards.map((card, index) => (
            <TiltCard key={card._key || index} card={card} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
