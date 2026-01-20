'use client';

/**
 * LXD360EcosystemPricingSection Component
 * =======================================
 * Pricing section for LXD360 Ecosystem - the all-in-one bundle.
 * This is Section 3 of the pricing sections (after LXP360 SaaS).
 *
 * Layout Structure:
 * - Section header with title, subtitle, and description
 * - 2 bundle pricing cards side by side
 *
 * Pricing Tiers (Annual Only):
 * 1. The Solopreneur - $1,500/year (Save 11%)
 *    - 1 INSPIRE Creator Seat + LXP Micro (5 Learners)
 * 2. The Corporate Starter - $8,500/year (Save 6%) - MOST POPULAR
 *    - 3 INSPIRE Team Seats + LXP Scale (50 Learners)
 *
 * Features:
 * - Bundle savings display
 * - Highlighted "Most Popular" tier
 * - Included components breakdown
 * - Dark/light mode support
 * - Responsive grid layout
 */

import { Check, Package, Sparkles } from 'lucide-react';

/* =============================================================================
   PRICING DATA CONFIGURATION
============================================================================= */

interface BundleComponent {
  name: string;
  description: string;
}

interface PricingTier {
  id: string;
  name: string;
  focus: string;
  annualPrice: string;
  originalPrice: string;
  savingsPercent: string;
  savingsAmount: string;
  components: BundleComponent[];
  features: string[];
  ctaText: string;
  ctaLink: string;
  highlight?: boolean;
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'solopreneur',
    name: 'The Solopreneur',
    focus: 'Independent Consultants & Coaches',
    annualPrice: '1,500',
    originalPrice: '1,678',
    savingsPercent: '11',
    savingsAmount: '178',
    components: [
      {
        name: '1 INSPIRE Creator Seat',
        description: 'AI Authoring, Unlimited Projects',
      },
      {
        name: 'LXP Micro (5 Learners)',
        description: 'Content hosting, 30-day LRS retention',
      },
    ],
    features: [
      'Full INSPIRE Creator feature set',
      'Native AI Authoring capabilities',
      'Unlimited course projects',
      'INSPIRE content hosting',
      'Basic completion reporting',
      '30-day xAPI data retention',
      'Single simplified annual bill',
    ],
    ctaText: 'Get Started',
    ctaLink: '#',
  },
  {
    id: 'corporate-starter',
    name: 'The Corporate Starter',
    focus: 'Small L&D Teams & Mid-Market Companies',
    annualPrice: '8,500',
    originalPrice: '9,084',
    savingsPercent: '6',
    savingsAmount: '584',
    components: [
      {
        name: '3 INSPIRE Team Seats',
        description: 'Collaboration, Premium Assets, 5k AI credits/seat',
      },
      {
        name: 'LXP Scale (50 Learners)',
        description: 'Full LRS, AI Recommendations, HRIS Integrations',
      },
    ],
    features: [
      'Everything in Solopreneur',
      'Real-time co-authoring',
      'Premium asset library access',
      'Integrated review engine',
      'Full LRS raw data access',
      'AI-powered recommendations',
      'HRIS & team integrations',
      'Social learning features',
    ],
    ctaText: 'Contact Sales',
    ctaLink: '#',
    highlight: true,
  },
];

/* =============================================================================
   BUNDLE COMPONENT ITEM
============================================================================= */

interface BundleComponentItemProps {
  component: BundleComponent;
}

function BundleComponentItem({ component }: BundleComponentItemProps): React.JSX.Element {
  return (
    <div className="flex items-start gap-3 p-3 rounded-[10px] bg-lxd-light-card dark:bg-lxd-dark-card/50">
      <Package className="h-5 w-5 shrink-0 text-brand-blue mt-0.5" />
      <div>
        <p className="font-semibold text-lxd-text-dark-heading dark:text-brand-primary text-sm">
          {component.name}
        </p>
        <p className="text-xs text-lxd-text-dark-muted dark:text-lxd-text-light-muted">
          {component.description}
        </p>
      </div>
    </div>
  );
}

/* =============================================================================
   FEATURE LIST ITEM COMPONENT
============================================================================= */

interface FeatureItemProps {
  text: string;
}

function FeatureItem({ text }: FeatureItemProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-3 text-sm">
      <Check className="h-4 w-4 shrink-0 text-brand-blue" />
      <span className="text-lxd-text-dark-body dark:text-lxd-text-light-body">{text}</span>
    </div>
  );
}

/* =============================================================================
   PRICING CARD COMPONENT
============================================================================= */

interface PricingCardProps {
  tier: PricingTier;
}

function PricingCard({ tier }: PricingCardProps): React.JSX.Element {
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
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5 text-brand-blue" />
          <h3 className="text-xl font-bold text-lxd-text-dark-heading dark:text-brand-primary">
            {tier.name}
          </h3>
        </div>
        <p className="text-sm text-lxd-text-dark-body dark:text-lxd-text-light-muted">
          {tier.focus}
        </p>
      </div>

      {/* Price display */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-lxd-text-dark-body dark:text-lxd-text-light-muted">$</span>
          <span className="text-4xl md:text-5xl font-bold text-lxd-text-dark-heading dark:text-brand-primary">
            {tier.annualPrice}
          </span>
          <span className="text-sm text-lxd-text-dark-body dark:text-lxd-text-light-muted">
            /year
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-lxd-text-light-muted line-through">
            ${tier.originalPrice}/year
          </span>
          <span className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-xs font-semibold text-brand-blue dark:text-brand-cyan">
            Save {tier.savingsPercent}% (${tier.savingsAmount})
          </span>
        </div>
      </div>

      {/* Bundle Components */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-lxd-text-dark-muted dark:text-lxd-text-light-muted uppercase tracking-wider mb-3">
          What&apos;s Included
        </p>
        <div className="space-y-2">
          {tier.components.map((component, index) => (
            <BundleComponentItem key={index} component={component} />
          ))}
        </div>
      </div>

      {/* Feature list */}
      <div className="mb-8 grow space-y-2">
        <p className="text-xs font-semibold text-lxd-text-dark-muted dark:text-lxd-text-light-muted uppercase tracking-wider mb-3">
          Features
        </p>
        {tier.features.map((feature, index) => (
          <FeatureItem key={index} text={feature} />
        ))}
      </div>

      {/* CTA Button */}
      <button
        type="button"
        className={`w-full rounded-[10px] py-3 px-6 font-semibold transition-all duration-300 ${
          tier.highlight
            ? 'bg-brand-primary hover:bg-brand-primary-hover text-brand-primary shadow-lg hover:shadow-xl hover:shadow-blue-500/25'
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

export function LXD360EcosystemPricingSection(): React.JSX.Element {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* =========================================================================
            SECTION HEADER
        ========================================================================= */}
        <div className="text-center mb-12 max-w-4xl mx-auto">
          {/* Product badge */}
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-brand-blue dark:text-brand-cyan text-sm font-semibold">
            LXD360 Ecosystem Bundle
          </span>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-lxd-text-dark-heading dark:text-brand-primary">
              The All-in-One{' '}
            </span>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-purple-600">
              Category Killer.
            </span>
          </h2>

          {/* Description */}
          <p className="text-lxd-text-dark-body dark:text-lxd-text-light-muted text-lg leading-relaxed">
            Achieve true end-to-end learning mastery without managing multiple subscriptions or
            disparate systems. The LXD360 Ecosystem bundles our AI-powered{' '}
            <span className="text-brand-blue font-semibold">INSPIRE Studio</span> with our flexible{' '}
            <span className="text-brand-blue font-semibold">LXP360</span> delivery system—a single,
            unified platform to author, distribute, and analyze your L&D content.
          </p>
        </div>

        {/* =========================================================================
            PRICING CARDS GRID
        ========================================================================= */}
        <div className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {PRICING_TIERS.map((tier) => (
            <PricingCard key={tier.id} tier={tier} />
          ))}
        </div>

        {/* =========================================================================
            ADDITIONAL INFO
        ========================================================================= */}
        <div className="mt-12 text-center">
          <p className="text-sm text-lxd-text-dark-muted dark:text-lxd-text-dark-muted">
            All ecosystem bundles are billed annually. Simplify your vendor management with one
            unified platform.
          </p>
          <p className="text-xs text-lxd-text-light-muted dark:text-lxd-text-dark-body mt-2">
            Need a custom enterprise bundle?{' '}
            <button
              type="button"
              onClick={() => {
                window.location.href = '/contact';
              }}
              className="text-brand-blue hover:underline bg-transparent border-0 p-0 cursor-pointer"
            >
              Contact our sales team
            </button>{' '}
            for tailored solutions.
          </p>
        </div>
      </div>
    </section>
  );
}
