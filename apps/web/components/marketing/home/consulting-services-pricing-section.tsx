'use client';

/**
 * ConsultingServicesPricingSection Component
 * ==========================================
 * Pricing section for Productized Consulting Services.
 * This is Section 4 (final) of the pricing sections.
 *
 * Design: Sticky scrolling cards that stack on top of each other
 * as user scrolls - each card sticks to the top until the next
 * card pushes it up. Creates a dramatic, premium reveal effect.
 *
 * Services:
 * 1. Vision & Architecture Blueprint - $5,000 (The Essential Starting Point)
 * 2. LXP Implementation Sprint - $3,500 (Fast-Track to Live)
 * 3. Custom XR Simulation Development - From $15,000 (High-Fidelity Learning)
 *
 * Features:
 * - Scroll-based sticky card animations
 * - Alternating card colors for visual rhythm
 * - Premium shadowed CTA buttons
 * - Responsive design
 * - Dark/light mode support
 */

import { motion } from 'framer-motion';
import {
  ClipboardList,
  Compass,
  Glasses,
  type LucideIcon,
  Rocket,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { GradientShadowButton } from '@/components/ui/gradient-shadow-button';

/* =============================================================================
   WHY PRODUCTIZED SERVICES DATA
============================================================================= */

interface WhyCard {
  id: number;
  icon: LucideIcon;
  title: string;
  description: string;
  /** Tailwind color for icon border and glow */
  accentColor: string;
}

const WHY_CARDS: WhyCard[] = [
  {
    id: 1,
    icon: ShieldCheck,
    title: 'Risk Reduction',
    description:
      "Fixed fees and clear deliverables mean you know exactly what you're getting and when. No scope creep, no surprise invoices—just transparent, predictable investment.",
    accentColor: 'violet',
  },
  {
    id: 2,
    icon: Zap,
    title: 'Accelerated Launch',
    description:
      'Bypass internal delays by relying on our expert team for rapid setup and migration. Get your learning platform live in weeks, not months.',
    accentColor: 'blue',
  },
  {
    id: 3,
    icon: ClipboardList,
    title: 'Strategic Alignment',
    description:
      "The Blueprint ensures your L&D strategy is perfectly matched to LXD360's capabilities. Every decision is informed by data, not guesswork.",
    accentColor: 'purple',
  },
];

/* =============================================================================
   SERVICE DATA CONFIGURATION
============================================================================= */

interface ServiceCard {
  id: number;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
  price: string;
  priceNote?: string;
  badge?: string;
  ctaText: string;
  ctaLink: string;
  /** Accent color for frosted glass border glow */
  accentColor: 'violet' | 'blue' | 'purple';
}

const SERVICE_CARDS: ServiceCard[] = [
  {
    id: 1,
    icon: Compass,
    title: 'Vision & Architecture Blueprint',
    subtitle: 'The Essential Starting Point',
    description:
      'Paid Discovery & Strategy: A foundational engagement mapping your organizational needs to the INSPIRE framework. Get a comprehensive "Learning Modernization Roadmap" defining your path to success.',
    price: '$5,000',
    priceNote: '100% Upfront - Fixed Scope',
    badge: 'Start Here',
    ctaText: 'Design Your L&D Strategy Blueprint',
    ctaLink: '/contact',
    accentColor: 'violet',
  },
  {
    id: 2,
    icon: Rocket,
    title: 'LXP Implementation Sprint',
    subtitle: 'Fast-Track to Live',
    description:
      'Rapid Technical Deployment: Setup of LXP360, migration of legacy content (SCORM), and configuration of critical integrations including SSO and HRIS. Get your platform running quickly and correctly.',
    price: '$3,500',
    priceNote: 'Waived for Enterprise contracts >$25k/yr',
    ctaText: 'Design Your L&D Strategy Blueprint',
    ctaLink: '/contact',
    accentColor: 'blue',
  },
  {
    id: 3,
    icon: Glasses,
    title: 'Custom XR Simulation Development',
    subtitle: 'High-Fidelity Learning',
    description:
      "Bespoke, High-Impact Content: Design and build advanced immersive VR/AR experiences using Unity and AutoCAD. Reserved for mission-critical, high-consequence training needs where failure isn't an option.",
    price: 'From $15,000',
    priceNote: 'Per scenario - Custom quote',
    badge: 'Premium',
    ctaText: 'Design Your L&D Strategy Blueprint',
    ctaLink: '/contact',
    accentColor: 'purple',
  },
];

/* =============================================================================
   SHIMMER BORDER CARD COMPONENT
============================================================================= */

interface ShimmerBorderCardProps {
  card: WhyCard;
}

function ShimmerBorderCard({ card }: ShimmerBorderCardProps): React.JSX.Element {
  const Icon = card.icon;

  // Map accent colors to Tailwind classes and gradient colors
  const accentClasses = {
    violet: {
      border: 'border-violet-500',
      text: 'text-violet-500',
      gradient: 'from-violet-200 via-transparent to-violet-200',
    },
    blue: {
      border: 'border-brand-primary',
      text: 'text-brand-blue',
      gradient: 'from-blue-200 via-transparent to-blue-200',
    },
    purple: {
      border: 'border-brand-secondary',
      text: 'text-brand-purple',
      gradient: 'from-purple-200 via-transparent to-purple-200',
    },
  };

  const colors = accentClasses[card.accentColor as keyof typeof accentClasses];

  return (
    <div className="group relative mx-auto w-full overflow-hidden rounded-lg bg-lxd-dark-surface p-0.5 transition-all duration-500 hover:scale-[1.01] hover:bg-lxd-dark-surface/50">
      {/* Card content */}
      <div className="relative z-10 flex flex-col items-center justify-center overflow-hidden rounded-[7px] bg-lxd-dark-card p-8 transition-colors duration-500 group-hover:bg-lxd-dark-surface h-full min-h-[320px]">
        {/* Icon with border */}
        <div
          className={`relative z-10 mb-8 mt-2 rounded-full border-2 ${colors.border} bg-lxd-dark-page p-4`}
        >
          <Icon className={`h-10 w-10 ${colors.text}`} />
        </div>

        {/* Title */}
        <h4 className="relative z-10 mb-4 w-full text-center text-2xl font-bold text-brand-primary">
          {card.title}
        </h4>

        {/* Description */}
        <p className="relative z-10 text-center text-lxd-text-light-muted leading-relaxed">
          {card.description}
        </p>
      </div>

      {/* Rotating shimmer gradient - visible on hover */}
      <motion.div
        initial={{ rotate: '0deg' }}
        animate={{ rotate: '360deg' }}
        style={{ scale: 1.75 }}
        transition={{
          repeat: Infinity,
          duration: 3.5,
          ease: 'linear',
        }}
        className={`absolute inset-0 z-0 bg-linear-to-br ${colors.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
      />
    </div>
  );
}

/* =============================================================================
   STACKING PARALLAX SERVICE CARDS COMPONENT
   - Cards stack on top of each other as user scrolls
   - Scale and Y transforms create roll-over effect
   - Chasing border animation on each card
============================================================================= */

interface ServiceCardContentProps {
  card: ServiceCard;
}

function ServiceCardContent({ card }: ServiceCardContentProps): React.JSX.Element {
  // Map accent colors to conic gradient for chasing border
  const accentColors = {
    violet: { primary: 'var(--brand-secondary)', secondary: '#c4b5fd' },
    blue: { primary: 'var(--lxd-blue-light)', secondary: '#93c5fd' },
    purple: { primary: 'var(--brand-secondary)', secondary: '#d8b4fe' },
  };

  const colors = accentColors[card.accentColor];

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      {/* Outer wrapper for chasing border effect */}
      <div className="group relative overflow-hidden rounded-[10px] p-[2px]">
        {/* Animated chasing border - conic gradient that rotates */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-[-100%]"
          style={{
            background: `conic-gradient(from 0deg, ${colors.primary}, ${colors.secondary}, transparent, transparent, ${colors.primary})`,
          }}
        />

        {/* Solid inner container */}
        <div className="relative rounded-[10px] bg-lxd-dark-card p-6 md:p-8">
          {/* Badge if exists */}
          {card.badge && (
            <div className="absolute top-4 right-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  card.accentColor === 'violet'
                    ? 'bg-brand-secondary/20 text-violet-300'
                    : card.accentColor === 'blue'
                      ? 'bg-brand-primary/20 text-blue-300'
                      : 'bg-brand-secondary/20 text-purple-300'
                }`}
              >
                {card.badge}
              </span>
            </div>
          )}

          {/* Icon */}
          <div
            className={`mb-4 inline-flex p-3 rounded-[10px] ${
              card.accentColor === 'violet'
                ? 'bg-brand-secondary/20'
                : card.accentColor === 'blue'
                  ? 'bg-brand-primary/20'
                  : 'bg-brand-secondary/20'
            }`}
          >
            <card.icon
              className={`h-8 w-8 ${
                card.accentColor === 'violet'
                  ? 'text-brand-purple'
                  : card.accentColor === 'blue'
                    ? 'text-brand-cyan'
                    : 'text-brand-purple'
              }`}
            />
          </div>

          {/* Title */}
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-primary mb-2">
            {card.title}
          </h3>

          {/* Subtitle */}
          <p
            className={`text-lg font-semibold mb-4 ${
              card.accentColor === 'violet'
                ? 'text-brand-purple'
                : card.accentColor === 'blue'
                  ? 'text-brand-cyan'
                  : 'text-brand-purple'
            }`}
          >
            {card.subtitle}
          </p>

          {/* Description */}
          <p className="text-lxd-text-light-body leading-relaxed mb-6 max-w-2xl">
            {card.description}
          </p>

          {/* Price and CTA row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-3xl md:text-4xl font-bold text-brand-primary">
                {card.price}
              </span>
              {card.priceNote && (
                <span className="block text-sm text-lxd-text-light-muted mt-1">
                  {card.priceNote}
                </span>
              )}
            </div>
            <GradientShadowButton href={card.ctaLink} variant="tertiary">
              {card.ctaText}
            </GradientShadowButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function StackingServiceCards(): React.JSX.Element {
  return (
    <div className="relative">
      {/* Card 1 - Vision & Architecture Blueprint - sticks first, lowest z-index */}
      <div className="sticky top-[180px] z-10 flex items-center justify-center pb-4">
        <ServiceCardContent card={SERVICE_CARDS[0]} />
      </div>

      {/* Card 2 - LXP Implementation Sprint - sticks second, middle z-index */}
      <div className="sticky top-[200px] z-20 flex items-center justify-center pb-4">
        <ServiceCardContent card={SERVICE_CARDS[1]} />
      </div>

      {/* Card 3 - Custom XR Simulation Development - sticks last, highest z-index */}
      <div className="sticky top-[220px] z-30 flex items-center justify-center pb-8">
        <ServiceCardContent card={SERVICE_CARDS[2]} />
      </div>
    </div>
  );
}

/* =============================================================================
   MAIN COMPONENT
============================================================================= */

export function ConsultingServicesPricingSection(): React.JSX.Element {
  return (
    <section className="relative bg-lxd-dark-page">
      {/* =========================================================================
          SECTION HEADER + SHIMMER CARDS (Consolidated)
      ========================================================================= */}
      <div className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {/* Header content - centered */}
          <div className="text-center mb-8">
            {/* Main Title - Consulting Services */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 text-brand-primary">
              Consulting Services
            </h2>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-500 mb-6">
              Accelerate Your LXD Roadmap
            </p>

            {/* Consolidated Description */}
            <p className="text-lxd-text-light-muted text-lg leading-relaxed max-w-4xl mx-auto">
              Move beyond speculation and toward clear execution. Our fixed-scope, strategic
              services are carefully designed to{' '}
              <span className="text-brand-cyan font-semibold">de-risk your investment</span> in
              digital learning initiatives. By adopting a productized approach instead of
              traditional, unpredictable consulting, we deliver greater clarity, accelerated speed,
              and measurable outcomes. We help you transform complex business requirements into a
              clear, actionable implementation roadmap for the LXD360 Ecosystem.
            </p>
          </div>

          {/* Shimmer Border Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {WHY_CARDS.map((card) => (
              <ShimmerBorderCard key={card.id} card={card} />
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================================
          STACKING PARALLAX SERVICE CARDS
      ========================================================================= */}
      <div className="bg-lxd-dark-page">
        <StackingServiceCards />
      </div>
    </section>
  );
}
