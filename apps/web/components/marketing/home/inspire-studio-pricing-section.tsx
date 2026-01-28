'use client';

/**
 * InspireStudioPricingSection Component
 * =====================================
 * Pricing section for INSPIRE Studio - the AI Authoring Tool.
 * This is the PLG (Product-Led Growth) entry point for LXD360.
 *
 * Layout Structure:
 * - Section header with title and description
 * - Monthly/Annual billing toggle
 * - 3 pricing tiers in horizontal cards
 *
 * Pricing Tiers:
 * 1. Creator - $99/month (Annual) - Freelancer & Solo ID
 * 2. Team - $119/seat/month (Annual) - Small L&D Teams (Min 3 Seats)
 * 3. Enterprise - Contact Sales - Large Corporations & Government
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
  quarterlyPrice: string | null; // null for "Contact Sales"
  yearlyPrice: string | null;
  priceLabel?: string; // e.g., "/seat/month"
  minSeats?: number;
  features: PricingFeature[];
  ctaText: string;
  ctaLink: string;
  highlight?: boolean;
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'creator',
    name: 'Creator',
    focus: 'Freelancer & Solo ID',
    quarterlyPrice: '129',
    yearlyPrice: '99',
    priceLabel: '/month',
    features: [
      { text: 'Native AI Authoring', included: true },
      { text: 'Unlimited Projects', included: true },
      { text: 'SCORM/xAPI Export', included: true },
      { text: 'Standard Asset Library', included: true },
      { text: 'Real-Time Co-Authoring', included: false },
      { text: 'Integrated Review Engine', included: false },
      { text: 'Premium Asset Library', included: false },
      { text: 'SSO & Data Sovereignty', included: false },
    ],
    ctaText: 'Secure it now.',
    ctaLink: '#',
  },
  {
    id: 'team',
    name: 'Team',
    focus: 'Small L&D Teams',
    quarterlyPrice: '149',
    yearlyPrice: '119',
    priceLabel: '/seat/month',
    minSeats: 3,
    features: [
      { text: 'Native AI Authoring', included: true },
      { text: 'Unlimited Projects', included: true },
      { text: 'SCORM/xAPI Export', included: true },
      { text: 'Standard Asset Library', included: true },
      { text: 'Real-Time Co-Authoring', included: true },
      { text: 'Integrated Review Engine', included: true },
      { text: 'Premium Asset Library', included: true },
      { text: 'SSO & Data Sovereignty', included: false },
    ],
    ctaText: 'Secure it now.',
    ctaLink: '#',
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    focus: 'Large Corporations & Government',
    quarterlyPrice: null,
    yearlyPrice: null,
    features: [
      { text: 'Everything in Team', included: true },
      { text: 'SSO Integration', included: true },
      { text: 'Data Sovereignty Options', included: true },
      { text: 'Custom AI Tuning', included: true },
      { text: 'Comprehensive Audit Logs', included: true },
      { text: 'Dedicated Success Manager', included: true },
      { text: 'Custom Integrations', included: true },
      { text: 'Priority Support (24/7)', included: true },
    ],
    ctaText: 'Learn More',
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
        Save 20% with Yearly
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
        <Check className="h-5 w-5 shrink-0 text-brand-blue" aria-hidden="true" />
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
  const price = billingPeriod === 'quarterly' ? tier.quarterlyPrice : tier.yearlyPrice;
  const isContactSales = price === null;

  return (
    <div
      className={`relative flex flex-col rounded-[10px] p-6 md:p-8 transition-all duration-300 ${
        tier.highlight
          ? 'bg-lxd-light-card dark:bg-lxd-dark-card border-2 border-brand-primary shadow-xl shadow-blue-500/20'
          : 'bg-lxd-light-card dark:bg-lxd-dark-page border border-lxd-light-border dark:border-lxd-dark-border'
      }`}
      style={{
        boxShadow: tier.highlight ? '0px 8px 0px rgb(59, 130, 246)' : undefined,
      }}
    >
      {/* Most Popular badge */}
      {tier.highlight && (
        <span className="absolute -top-3 right-4 rounded-full bg-brand-primary px-3 py-1 text-xs font-semibold text-brand-primary">
          Most Popular
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
              {billingPeriod === 'yearly' && <span className="text-xs">(Billed Yearly)</span>}
            </div>
          </>
        )}
      </div>

      {/* Minimum seats note */}
      {tier.minSeats && (
        <p className="mb-4 text-xs text-lxd-text-dark-muted dark:text-lxd-text-dark-muted">
          Minimum {tier.minSeats} seats required
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
            ? 'bg-brand-primary hover:bg-brand-primary-hover text-brand-primary shadow-lg hover:shadow-xl hover:shadow-blue-500/40'
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

export function InspireStudioPricingSection(): React.JSX.Element {
  const [billingPeriod, setBillingPeriod] = useState<'quarterly' | 'yearly'>('yearly');

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* =========================================================================
            SECTION HEADER
        ========================================================================= */}
        <div className="text-center mb-8 max-w-3xl mx-auto">
          {/* Main Title - INSPIRE Studio */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 text-lxd-text-dark-heading dark:text-brand-primary">
            INSPIRE Studio
          </h2>

          {/* Subtitle - WCAG AA compliant gradient text */}
          <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 mb-4">
            AI Authoring Tool Pricing
          </p>

          {/* Description */}
          <p className="text-lxd-text-dark-body dark:text-lxd-text-light-muted text-lg leading-relaxed">
            The PLG entry point. Create next-gen, neuroscience-backed content{' '}
            <span className="text-brand-blue font-semibold">50% faster</span> than legacy tools.
            Pricing is based on developer seats and access to premium features.
          </p>
        </div>

        {/* =========================================================================
            BILLING TOGGLE
        ========================================================================= */}
        <BillingToggle selected={billingPeriod} setSelected={setBillingPeriod} />

        {/* =========================================================================
            PRICING CARDS GRID
        ========================================================================= */}
        <div className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {PRICING_TIERS.map((tier) => (
            <PricingCard key={tier.id} tier={tier} billingPeriod={billingPeriod} />
          ))}
        </div>

        {/* =========================================================================
            ADDITIONAL INFO
        ========================================================================= */}
        <div className="mt-12 text-center">
          <p className="text-sm text-lxd-text-dark-muted dark:text-lxd-text-dark-muted">
            All plans include a 14-day free trial. No credit card required to start.
          </p>
        </div>
      </div>
    </section>
  );
}
