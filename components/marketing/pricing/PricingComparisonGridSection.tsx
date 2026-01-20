'use client';

/**
 * PricingComparisonGridSection Component
 * ======================================
 * Alternative pricing display with 2x2 grid layout.
 * Adapted from Kloudexa pricing-two/three templates.
 *
 * Features:
 * - Floating badge with blue/purple glow
 * - 2x2 grid of pricing cards
 * - Monthly/Yearly toggle with animations
 * - Hover effects with scale and glow
 */

import { AnimatePresence, motion } from 'framer-motion';
import { Building2, Check, type LucideIcon, Rocket, Sparkles, Users, X } from 'lucide-react';
import { useState } from 'react';

/* =============================================================================
   COMPONENT PROPS
============================================================================= */
interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingTier {
  id: string;
  name: string;
  icon: string;
  description: string;
  monthlyPrice: string | null;
  yearlyPrice: string | null;
  priceLabel?: string;
  features: PricingFeature[];
  ctaText: string;
  ctaLink: string;
  highlight?: boolean;
  badge?: string;
}

interface PricingComparisonGridSectionProps {
  badge?: string;
  headline?: string;
  description?: string;
  tiers?: PricingTier[];
}

/* =============================================================================
   DEFAULT VALUES
============================================================================= */
const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  Users,
  Building2,
  Rocket,
};

const DEFAULT_TIERS: PricingTier[] = [
  {
    id: 'standard',
    name: 'Standard',
    icon: 'Sparkles',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    monthlyPrice: '59',
    yearlyPrice: '49',
    priceLabel: '/month',
    features: [
      { text: 'Lorem ipsum dolor sit', included: true },
      { text: 'Consectetur adipiscing', included: true },
      { text: 'Suspendisse varius enim', included: true },
      { text: 'Elementum tristique', included: true },
      { text: 'Duis cursus mi quis', included: false },
      { text: 'Viverra ornare', included: false },
    ],
    ctaText: 'Get Started Now',
    ctaLink: '#',
  },
  {
    id: 'premium',
    name: 'Premium',
    icon: 'Rocket',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    monthlyPrice: '129',
    yearlyPrice: '99',
    priceLabel: '/month',
    features: [
      { text: 'Lorem ipsum dolor sit', included: true },
      { text: 'Consectetur adipiscing', included: true },
      { text: 'Suspendisse varius enim', included: true },
      { text: 'Elementum tristique', included: true },
      { text: 'Duis cursus mi quis', included: true },
      { text: 'Viverra ornare', included: true },
    ],
    ctaText: 'Get Started Now',
    ctaLink: '#',
    highlight: true,
    badge: 'Popular',
  },
  {
    id: 'team',
    name: 'Team',
    icon: 'Users',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    monthlyPrice: '199',
    yearlyPrice: '159',
    priceLabel: '/seat/month',
    features: [
      { text: 'Everything in Premium', included: true },
      { text: 'Team collaboration', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Priority support', included: true },
      { text: 'Custom integrations', included: false },
      { text: 'Dedicated manager', included: false },
    ],
    ctaText: 'Start Free Trial',
    ctaLink: '#',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: 'Building2',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    monthlyPrice: null,
    yearlyPrice: null,
    features: [
      { text: 'Everything in Team', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'Dedicated manager', included: true },
      { text: 'SLA guarantee', included: true },
      { text: 'On-premise option', included: true },
      { text: 'Custom training', included: true },
    ],
    ctaText: 'Contact Sales',
    ctaLink: '#',
    badge: 'Custom',
  },
];

const DEFAULTS = {
  badge: 'Pricing Plans',
  headline: 'Choose Your Perfect Plan',
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
        className="px-6 py-2 text-sm font-semibold text-brand-primary rounded-md inline-block bg-(--brand-primary)"
        style={{
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
   PRICING CARD COMPONENT
============================================================================= */
interface PricingCardProps {
  tier: PricingTier;
  billingPeriod: 'monthly' | 'yearly';
  index: number;
}

function PricingCard({ tier, billingPeriod, index }: PricingCardProps): React.JSX.Element {
  const price = billingPeriod === 'monthly' ? tier.monthlyPrice : tier.yearlyPrice;
  const isContactSales = price === null;
  const Icon = ICON_MAP[tier.icon] || Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`relative flex flex-col rounded-md p-8 transition-all duration-300 ${
        tier.highlight
          ? 'bg-lxd-light-card dark:bg-lxd-dark-card border-2 border-(--brand-primary) shadow-2xl'
          : 'bg-lxd-light-card dark:bg-lxd-dark-page/50 border border-lxd-light-border dark:border-lxd-dark-border'
      }`}
      style={
        tier.highlight
          ? {
              boxShadow:
                '0 25px 50px -12px color-mix(in srgb, var(--brand-primary) 25%, transparent)',
            }
          : undefined
      }
    >
      {/* Badge */}
      {tier.badge && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`absolute -top-3 right-6 rounded-full px-4 py-1 text-xs font-bold text-brand-primary ${
            tier.highlight
              ? 'bg-linear-to-r from-(--brand-primary) to-(--brand-secondary)'
              : 'bg-lxd-dark-surface'
          }`}
        >
          {tier.badge}
        </motion.span>
      )}

      {/* Icon */}
      <motion.div
        whileHover={{ rotate: 10, scale: 1.1 }}
        className={`w-14 h-14 rounded-md mb-4 flex items-center justify-center ${
          tier.highlight
            ? 'bg-linear-to-br from-(--brand-primary) to-(--brand-secondary)'
            : 'bg-lxd-light-card dark:bg-lxd-dark-card'
        }`}
      >
        <Icon
          className={`w-7 h-7 ${tier.highlight ? 'text-brand-primary' : 'text-(--brand-primary)'}`}
        />
      </motion.div>

      {/* Name & Description */}
      <h3 className="text-xl font-bold text-lxd-text-dark-heading dark:text-brand-primary mb-2">
        {tier.name}
      </h3>
      <p className="text-lxd-text-dark-body dark:text-lxd-text-light-muted text-sm mb-6">
        {tier.description}
      </p>

      {/* Price */}
      <div className="mb-6">
        {isContactSales ? (
          <span className="text-3xl font-bold text-lxd-text-dark-heading dark:text-brand-primary">
            Custom
          </span>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-lxd-text-dark-muted">$</span>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={price}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-4xl font-bold text-lxd-text-dark-heading dark:text-brand-primary"
              >
                {price}
              </motion.span>
            </AnimatePresence>
            <span className="text-lxd-text-dark-muted dark:text-lxd-text-light-muted text-sm">
              {tier.priceLabel}
            </span>
          </div>
        )}
        {billingPeriod === 'yearly' && !isContactSales && (
          <p className="text-sm text-green-600 dark:text-brand-success mt-1">
            Billed annually (Save 20%)
          </p>
        )}
      </div>

      {/* CTA Button */}
      <motion.a
        href={tier.ctaLink}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full py-3.5 px-6 rounded-md font-semibold text-center mb-6 block transition-all ${
          tier.highlight
            ? 'bg-linear-to-r from-(--brand-primary) to-(--brand-secondary) text-brand-primary'
            : 'bg-lxd-dark-page dark:bg-lxd-light-card text-brand-primary dark:text-lxd-text-dark-heading hover:bg-lxd-dark-card dark:hover:bg-lxd-light-card'
        }`}
        style={
          tier.highlight
            ? {
                boxShadow: '0 4px 20px color-mix(in srgb, var(--brand-secondary) 30%, transparent)',
              }
            : undefined
        }
      >
        {tier.ctaText}
      </motion.a>

      {/* Features */}
      <div className="space-y-3 grow">
        {tier.features.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 + idx * 0.05 }}
            className="flex items-start gap-3"
          >
            {feature.included ? (
              <Check className="w-5 h-5 text-brand-success shrink-0 mt-0.5" />
            ) : (
              <X className="w-5 h-5 text-lxd-text-light-body dark:text-lxd-text-dark-body shrink-0 mt-0.5" />
            )}
            <span
              className={`text-sm ${
                feature.included
                  ? 'text-lxd-text-dark-body dark:text-lxd-text-light-body'
                  : 'text-lxd-text-light-muted dark:text-lxd-text-dark-body'
              }`}
            >
              {feature.text}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Hover Glow */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 -z-10 blur-xl rounded-[10px]"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 86, 184, 0.1), rgba(85, 2, 120, 0.1))',
        }}
      />
    </motion.div>
  );
}

/* =============================================================================
   MAIN COMPONENT
============================================================================= */
export function PricingComparisonGridSection({
  badge,
  headline,
  description,
  tiers,
}: PricingComparisonGridSectionProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const displayTiers = tiers?.length ? tiers : DEFAULT_TIERS;

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-b from-lxd-light-card via-background to-lxd-light-card dark:from-transparent dark:via-transparent dark:to-transparent" />

      {/* Animated Background Orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 15, repeat: Infinity }}
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-brand-primary blur-3xl"
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 18, repeat: Infinity, delay: 3 }}
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-brand-secondary blur-3xl"
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

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-4 mb-12"
        >
          <span className="rounded-full bg-green-100 dark:bg-green-900/30 px-4 py-1.5 text-sm font-semibold text-green-700 dark:text-brand-success">
            Save 20% with yearly billing
          </span>
          <div className="relative flex items-center rounded-full bg-lxd-light-card dark:bg-lxd-dark-card p-1">
            <button
              type="button"
              onClick={() => setBillingPeriod('monthly')}
              className={`relative z-10 px-6 py-2.5 text-sm font-medium rounded-full transition-colors ${
                billingPeriod === 'monthly'
                  ? 'text-lxd-text-dark-heading dark:text-brand-primary'
                  : 'text-lxd-text-dark-muted'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod('yearly')}
              className={`relative z-10 px-6 py-2.5 text-sm font-medium rounded-full transition-colors ${
                billingPeriod === 'yearly'
                  ? 'text-lxd-text-dark-heading dark:text-brand-primary'
                  : 'text-lxd-text-dark-muted'
              }`}
            >
              Yearly
            </button>
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute inset-y-1 z-0 rounded-full bg-lxd-light-card dark:bg-lxd-dark-surface shadow-md"
              style={{
                left: billingPeriod === 'yearly' ? 'calc(50% - 2px)' : '4px',
                width: 'calc(50% - 4px)',
              }}
            />
          </div>
        </motion.div>

        {/* Pricing Grid - 2x2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {displayTiers.map((tier, index) => (
            <PricingCard key={tier.id} tier={tier} billingPeriod={billingPeriod} index={index} />
          ))}
        </div>

        {/* Additional Info */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-lxd-text-dark-muted dark:text-lxd-text-dark-muted text-sm mt-12"
        >
          All prices in USD. Taxes may apply based on your location.
        </motion.p>
      </div>
    </section>
  );
}
