'use client';

/**
 * UseCasesSection Component
 * =========================
 * "Practical Use Cases That Drive Results" section
 * Tabbed interface with 5 use cases and animated transitions.
 *
 * Features:
 * - Floating badge with blue/purple glow
 * - 5 animated tabs with icons
 * - Content transitions on tab change
 * - Image reveals with parallax
 * - Hover effects on tabs
 */

import { AnimatePresence, motion } from 'framer-motion';
import { Heart, type LucideIcon, Package, Settings, Shield, Users } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

/* =============================================================================
   COMPONENT PROPS
============================================================================= */
interface UseCase {
  _key?: string;
  title: string;
  description: string;
  icon: string;
  image?: string;
}

interface UseCasesSectionProps {
  badge?: string;
  headline?: string;
  description?: string;
  useCases?: UseCase[];
}

/* =============================================================================
   DEFAULT VALUES
============================================================================= */
const ICON_MAP: Record<string, LucideIcon> = {
  Shield,
  Users,
  Settings,
  Heart,
  Package,
};

const DEFAULT_USE_CASES: UseCase[] = [
  {
    title: 'Fraud Detection',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet.',
    icon: 'Shield',
    image: '/placeholder.jpg',
  },
  {
    title: 'Customer Insights',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet.',
    icon: 'Users',
    image: '/placeholder.jpg',
  },
  {
    title: 'Predictive Maintenance',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet.',
    icon: 'Settings',
    image: '/placeholder.jpg',
  },
  {
    title: 'Healthcare Analytics',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet.',
    icon: 'Heart',
    image: '/placeholder.jpg',
  },
  {
    title: 'Supply Chain',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet.',
    icon: 'Package',
    image: '/placeholder.jpg',
  },
];

const DEFAULTS = {
  badge: 'Practical Use Cases That Drive Results',
  headline: 'Real-World Applications\nThat Deliver',
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
   TAB BUTTON COMPONENT
============================================================================= */
interface TabButtonProps {
  useCase: UseCase;
  isActive: boolean;
  onClick: () => void;
  index: number;
}

function TabButton({ useCase, isActive, onClick, index }: TabButtonProps): React.JSX.Element {
  const Icon = ICON_MAP[useCase.icon] || Shield;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      onClick={onClick}
      className={`
        relative flex items-center gap-3 px-5 py-3 rounded-[10px] font-medium
        transition-all duration-300 whitespace-nowrap
        ${
          isActive
            ? 'text-brand-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-card dark:hover:bg-secondary'
        }
      `}
    >
      {/* Active Background */}
      {isActive && (
        <motion.div
          layoutId="activeTabBg"
          className="absolute inset-0 rounded-[10px]"
          style={{
            background:
              'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)',
            boxShadow: '0 4px 20px rgba(85, 2, 120, 0.4)',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}

      {/* Icon */}
      <motion.div
        animate={isActive ? { rotate: [0, 10, -10, 0] } : {}}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <Icon className="w-5 h-5" />
      </motion.div>

      {/* Title */}
      <span className="relative z-10">{useCase.title}</span>
    </motion.button>
  );
}

/* =============================================================================
   CONTENT PANEL COMPONENT
============================================================================= */
interface ContentPanelProps {
  useCase: UseCase;
}

function ContentPanel({ useCase }: ContentPanelProps): React.JSX.Element {
  const Icon = ICON_MAP[useCase.icon] || Shield;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center"
    >
      {/* Content Side */}
      <div className="space-y-6">
        {/* Icon Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="w-16 h-16 rounded-[10px] bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center"
          style={{
            boxShadow: '0 4px 20px rgba(85, 2, 120, 0.3)',
          }}
        >
          <Icon className="w-8 h-8 text-brand-primary" />
        </motion.div>

        {/* Title */}
        <motion.h3
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="text-3xl md:text-4xl font-bold text-lxd-text-dark-heading dark:text-brand-primary"
        >
          {useCase.title}
        </motion.h3>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-lxd-text-dark-body dark:text-lxd-text-light-muted leading-relaxed"
        >
          {useCase.description}
        </motion.p>

        {/* Learn More Link */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          whileHover={{ x: 5 }}
          className="inline-flex items-center gap-2 text-brand-blue dark:text-brand-cyan font-semibold group"
        >
          Explore This Use Case
          <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            &rarr;
          </motion.span>
        </motion.button>
      </div>

      {/* Image Side */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative"
        style={{ perspective: '1000px' }}
      >
        <motion.div
          whileHover={{ scale: 1.02, rotateY: -2 }}
          className="relative aspect-[4/3] rounded-[10px] overflow-hidden"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 86, 184, 0.25)',
          }}
        >
          <Image
            src={useCase.image || '/placeholder.jpg'}
            alt={useCase.title}
            fill
            className="object-cover"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-tr from-blue-500/10 via-transparent to-purple-500/10" />

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
            y: [0, -15, 0],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-brand-primary/20 blur-2xl"
        />
        <motion.div
          animate={{
            y: [0, 15, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute -bottom-6 -left-6 w-40 h-40 rounded-full bg-brand-secondary/20 blur-2xl"
        />
      </motion.div>
    </motion.div>
  );
}

/* =============================================================================
   MAIN COMPONENT
============================================================================= */
export function UseCasesSection({ badge, headline, description, useCases }: UseCasesSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const displayUseCases = useCases?.length ? useCases : DEFAULT_USE_CASES;
  const headlineText = headline || DEFAULTS.headline;
  const headlineParts = headlineText.split('\n');

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-blue-50/30 to-transparent dark:via-blue-950/10" />
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
          className="text-center mb-12"
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

        {/* Tabs Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {displayUseCases.map((useCase, index) => (
            <TabButton
              key={useCase._key || index}
              useCase={useCase}
              isActive={activeIndex === index}
              onClick={() => setActiveIndex(index)}
              index={index}
            />
          ))}
        </div>

        {/* Content Panel */}
        <div className="bg-card dark:bg-background/50 rounded-[10px] p-8 md:p-12 border border-border">
          <AnimatePresence mode="wait">
            <ContentPanel key={activeIndex} useCase={displayUseCases[activeIndex]} />
          </AnimatePresence>
        </div>

        {/* Tab Progress Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {displayUseCases.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                activeIndex === index
                  ? 'w-8 bg-linear-to-r from-blue-500 to-purple-500'
                  : 'bg-muted hover:bg-secondary'
              }`}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
