'use client';

/**
 * LXP360PricingSection Component
 * ==============================
 * Pricing section for LXP360 SaaS - the headless learning experience platform.
 * This is Section 2 of the pricing sections (after INSPIRE Studio).
 *
 * Layout Structure:
 * - Section header with title, subtitle, and description
 * - Quarterly/Yearly billing toggle
 * - 4 pricing tiers in horizontal cards
 *
 * Pricing Tiers:
 * 1. LXP Micro (1-5 Learners) - $49/month (Quarterly) / $40.83/month (Yearly)
 * 2. LXP Growth (5-20 Learners) - $199/month (Quarterly) / $165.83/month (Yearly) - MOST POPULAR
 * 3. LXP Scale (21-100 Learners) - $8/learner/month (Yearly Only)
 * 4. LXP Enterprise (100+ Learners) - Contact Sales
 *
 * Features:
 * - Animated price switching on toggle
 * - Highlighted "Most Popular" tier
 * - Feature checklist with icons
 * - Dark/light mode support
 * - Responsive grid layout
 */

import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useState } from 'react';

/* =============================================================================
   PRICING DATA CONFIGURATION
============================================================================= */

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingTier {
  id: string;
  name: string;
  focus: string;
  quarterlyPrice: string | null; // null for "Contact Sales" or yearly-only
  yearlyPrice: string | null;
  priceLabel?: string; // e.g., "/learner/month"
  billedLabel?: string; // e.g., "$490 Billed Annually"
  savingsNote?: string; // e.g., "Save 17%"
  yearlyOnly?: boolean; // true for tiers with no quarterly option
  features: PricingFeature[];
  ctaText: string;
  ctaLink: string;
  highlight?: boolean;
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'micro',
    name: 'LXP Micro',
    focus: '1-5 Learners',
    quarterlyPrice: '40',
    yearlyPrice: '40',
    priceLabel: '/month',
    billedLabel: '$480 Billed Annually',
    savingsNote: '',
    features: [
      { text: '5 Active Learners', included: true },
      { text: '1 Admin Account', included: true },
      { text: 'INSPIRE Content Hosting', included: true },
      { text: 'Basic Completion Reporting', included: true },
      { text: '30-Day xAPI Data Retention', included: true },
      { text: 'White Labeling', included: false },
      { text: 'Adaptive Learning Paths', included: false },
      { text: 'E-Commerce Integration', included: false },
    ],
    ctaText: 'Start Free Trial',
    ctaLink: '#',
  },
  {
    id: 'growth',
    name: 'LXP Growth',
    focus: '5-20 Learners',
    quarterlyPrice: '165',
    yearlyPrice: '165',
    priceLabel: '/month',
    billedLabel: '$1,980 Billed Annually',
    savingsNote: '',
    features: [
      { text: '20 Active Learners', included: true },
      { text: '3 Admin Accounts', included: true },
      { text: 'White Labeling (Domain & Logo)', included: true },
      { text: 'Adaptive Learning Paths', included: true },
      { text: 'E-Commerce (Stripe Integration)', included: true },
      { text: '1-Year xAPI Data Retention', included: true },
      { text: 'Social Learning Features', included: false },
      { text: 'Full LRS Raw Data Access', included: false },
    ],
    ctaText: 'Start Free Trial',
    ctaLink: '#',
    highlight: true,
  },
  {
    id: 'scale',
    name: 'LXP Scale',
    focus: '21-100 Learners',
    quarterlyPrice: null,
    yearlyPrice: '8',
    priceLabel: '/learner/month',
    billedLabel: '$96/learner/year',
    yearlyOnly: true,
    features: [
      { text: 'Everything in Growth', included: true },
      { text: 'AI-Powered Recommendations', included: true },
      { text: 'Social Learning (Discussion Boards)', included: true },
      { text: 'Full LRS Access (Raw Data)', included: true },
      { text: 'HRIS Integrations', included: true },
      { text: 'Team Integrations (Slack, MS Teams)', included: true },
      { text: 'Dedicated Database Instance', included: false },
      { text: '99.9% Uptime SLA', included: false },
    ],
    ctaText: 'Contact Sales',
    ctaLink: '#',
  },
  {
    id: 'enterprise',
    name: 'LXP Enterprise',
    focus: '100+ Learners',
    quarterlyPrice: null,
    yearlyPrice: null,
    features: [
      { text: 'Everything in Scale', included: true },
      { text: 'Volume Tiered Pricing', included: true },
      { text: 'Unlimited Storage & Retention', included: true },
      { text: 'Advanced AI (Skill-Gap Analysis)', included: true },
      { text: '99.9% Uptime SLA', included: true },
      { text: 'Dedicated Isolated Database', included: true },
      { text: 'Custom Integrations', included: true },
      { text: 'Dedicated Success Manager', included: true },
    ],
    ctaText: 'Contact Sales',
    ctaLink: '#',
  },
];

/* =============================================================================
   BILLING TOGGLE COMPONENT
============================================================================= */

interface BillingToggleProps {
  selected: 'quarterly' | 'yearly';
  setSelected: (value: 'quarterly' | 'yearly') => void;
}

function BillingToggle({ selected, setSelected }: BillingToggleProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-3 mt-6">
      {/* Savings badge - positioned outside toggle */}
      <span className="rounded-full bg-brand-primary px-3 py-1 text-xs font-semibold text-brand-primary">
        Save 17% with Yearly
      </span>

      {/* Toggle container */}
      <div className="relative flex w-fit items-center rounded-full bg-lxd-light-surface dark:bg-lxd-dark-card p-1">
        {/* Quarterly button */}
        <button
          type="button"
          onClick={() => setSelected('quarterly')}
          className="relative z-10 px-5 py-2 text-sm font-medium transition-colors"
        >
          <span
            className={
              selected === 'quarterly'
                ? 'text-lxd-text-dark-heading'
                : 'text-lxd-text-dark-body dark:text-lxd-text-light-muted'
            }
          >
            Quarterly
          </span>
        </button>

        {/* Yearly button */}
        <button
          type="button"
          onClick={() => setSelected('yearly')}
          className="relative z-10 px-5 py-2 text-sm font-medium transition-colors"
        >
          <span
            className={
              selected === 'yearly'
                ? 'text-lxd-text-dark-heading'
                : 'text-lxd-text-dark-body dark:text-lxd-text-light-muted'
            }
          >
            Yearly
          </span>
        </button>

        {/* Animated background pill */}
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`absolute inset-y-1 z-0 rounded-full bg-lxd-light-card dark:bg-lxd-dark-surface shadow-md ${
            selected === 'yearly' ? 'left-[calc(50%-4px)]' : 'left-1'
          }`}
          style={{ width: 'calc(50% - 4px)' }}
        />
      </div>
    </div>
  );
}

/* =============================================================================
   FEATURE LIST ITEM COMPONENT
============================================================================= */

interface FeatureItemProps {
  text: string;
  included: boolean;
}

function FeatureItem({ text, included }: FeatureItemProps): React.JSX.Element {
  return (
    // WCAG: Using aria-hidden on icons and improved contrast for disabled features
    <div className="flex items-center gap-3 text-sm md:text-base">
      {included ? (
        <Check className="h-5 w-5 shrink-0 text-brand-purple" aria-hidden="true" />
      ) : (
        <X
          className="h-5 w-5 shrink-0 text-lxd-text-dark-muted dark:text-lxd-text-dark-muted"
          aria-hidden="true"
        />
      )}
      <span
        className={
          included
            ? 'text-lxd-text-dark dark:text-lxd-text-light'
            : 'text-lxd-text-dark-muted dark:text-lxd-text-dark-muted'
        }
      >
        {text}
      </span>
    </div>
  );
}

/* =============================================================================
   PRICING CARD COMPONENT
============================================================================= */

interface PricingCardProps {
  tier: PricingTier;
  billingPeriod: 'quarterly' | 'yearly';
}

function PricingCard({ tier, billingPeriod }: PricingCardProps): React.JSX.Element {
  // Determine price based on billing period
  const isYearlyOnly = tier.yearlyOnly;
  const isContactSales = tier.quarterlyPrice === null && tier.yearlyPrice === null;

  // For yearly-only tiers, always show yearly price
  // For contact sales, show nothing
  // Otherwise, show based on toggle
  let price: string | null;
  let showYearlyOnlyBadge = false;

  if (isContactSales) {
    price = null;
  } else if (isYearlyOnly) {
    price = tier.yearlyPrice;
    showYearlyOnlyBadge = billingPeriod === 'quarterly';
  } else {
    price = billingPeriod === 'quarterly' ? tier.quarterlyPrice : tier.yearlyPrice;
  }

  return (
    <div
      className={`relative flex flex-col rounded-[10px] p-6 md:p-8 transition-all duration-300 ${
        tier.highlight
          ? 'bg-lxd-light-card dark:bg-lxd-dark-card border-2 border-brand-secondary shadow-xl shadow-purple-500/20'
          : 'bg-lxd-light-card dark:bg-lxd-dark-page border border-lxd-light-border dark:border-lxd-dark-border'
      }`}
      style={{
        boxShadow: tier.highlight ? '0px 8px 0px rgb(168, 85, 247)' : undefined,
      }}
    >
      {/* Most Popular badge */}
      {tier.highlight && (
        <span className="absolute -top-3 right-4 rounded-full bg-brand-secondary px-3 py-1 text-xs font-semibold text-brand-primary">
          Most Popular
        </span>
      )}

      {/* Yearly Only badge for Scale tier when quarterly is selected */}
      {showYearlyOnlyBadge && (
        <span className="absolute -top-3 right-4 rounded-full bg-brand-secondary px-3 py-1 text-xs font-semibold text-brand-primary">
          Yearly Only
        </span>
      )}

      {/* Tier name and focus */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-lxd-text-dark-heading dark:text-brand-primary mb-1">
          {tier.name}
        </h3>
        <p className="text-sm text-lxd-text-dark-body dark:text-lxd-text-light-muted">
          {tier.focus}
        </p>
      </div>

      {/* Price display */}
      <div className="mb-6 flex items-baseline gap-2">
        {isContactSales ? (
          <span className="text-3xl md:text-4xl font-bold text-lxd-text-dark-heading dark:text-brand-primary">
            Contact Sales
          </span>
        ) : (
          <>
            <span className="text-lxd-text-dark-body dark:text-lxd-text-light-muted">$</span>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={price}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-4xl md:text-5xl font-bold text-lxd-text-dark-heading dark:text-brand-primary"
              >
                {price}
              </motion.span>
            </AnimatePresence>
            <div className="flex flex-col text-sm text-lxd-text-dark-body dark:text-lxd-text-light-muted">
              <span>{tier.priceLabel}</span>
              {billingPeriod === 'yearly' && tier.billedLabel && !isYearlyOnly && (
                <span className="text-xs">({tier.billedLabel})</span>
              )}
              {isYearlyOnly && tier.billedLabel && (
                <span className="text-xs">({tier.billedLabel})</span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Savings note */}
      {tier.savingsNote && billingPeriod === 'yearly' && !isYearlyOnly && (
        <p className="mb-4 text-xs text-brand-blue dark:text-brand-cyan font-semibold">
          {tier.savingsNote} (~$98/year)
        </p>
      )}

      {/* Feature list */}
      <div className="mb-8 grow space-y-3">
        {tier.features.map((feature, index) => (
          <FeatureItem key={index} text={feature.text} included={feature.included} />
        ))}
      </div>

      {/* CTA Button */}
      <button
        type="button"
        className={`btn-glow w-full rounded-[10px] py-3 px-6 font-semibold transition-all duration-300 hover:-translate-y-0.5 ${
          tier.highlight
            ? 'bg-brand-secondary hover:bg-brand-secondary-hover text-brand-primary shadow-lg hover:shadow-xl hover:shadow-purple-500/40'
            : 'bg-lxd-dark-page dark:bg-lxd-light-card hover:bg-lxd-dark-card dark:hover:bg-lxd-light-card text-brand-primary dark:text-lxd-text-dark-heading'
        }`}
      >
        {tier.ctaText}
      </button>
    </div>
  );
}

/* =============================================================================
   MAIN COMPONENT
============================================================================= */

export function LXP360PricingSection(): React.JSX.Element {
  const [billingPeriod, setBillingPeriod] = useState<'quarterly' | 'yearly'>('yearly');

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* =========================================================================
            SECTION HEADER
        ========================================================================= */}
        <div className="text-center mb-8 max-w-4xl mx-auto">
          {/* Product badge */}
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-brand-purple text-sm font-semibold">
            LXP360 SaaS
          </span>

          {/* Title - WCAG AA compliant gradient text */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-lxd-text-dark-heading dark:text-brand-primary">
              Decouple Your Learning Experience{' '}
            </span>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-purple-700 dark:from-purple-400 dark:to-purple-500">
              from Your Data.
            </span>
          </h2>

          {/* Description */}
          <p className="text-lxd-text-dark-body dark:text-lxd-text-light-muted text-lg leading-relaxed">
            Traditional LMS platforms are rigid, expensive, and trap your most valuable asset: your
            learning data. LXP360 is the{' '}
            <span className="text-brand-purple font-semibold">headless solution</span> that empowers
            you to deliver customized, adaptive learning experiences while giving you full,
            unrestricted access to the raw xAPI data that drives organizational performance.
          </p>
        </div>

        {/* =========================================================================
            BILLING TOGGLE
        ========================================================================= */}
        <BillingToggle selected={billingPeriod} setSelected={setBillingPeriod} />

        {/* =========================================================================
            PRICING CARDS GRID
        ========================================================================= */}
        <div className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {PRICING_TIERS.map((tier) => (
            <PricingCard key={tier.id} tier={tier} billingPeriod={billingPeriod} />
          ))}
        </div>

        {/* =========================================================================
            ADDITIONAL INFO
        ========================================================================= */}
        <div className="mt-12 text-center">
          <p className="text-sm text-lxd-text-dark-muted dark:text-lxd-text-dark-muted">
            All plans include a 14-day free trial. Start small with a micro-cohort or scale to
            thousands.
          </p>
          <p className="text-xs text-lxd-text-light-muted dark:text-lxd-text-dark-body mt-2">
            Note: LXP Micro is LXP360-branded. White labeling available in Growth tier and above.
          </p>
        </div>
      </div>
    </section>
  );
}
