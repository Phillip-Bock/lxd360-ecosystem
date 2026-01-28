'use client';

import { ArrowRight, Check, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { BillingPeriod, PricingTier } from '@/types/pricing';
import { calculateSavings, formatPrice, getMonthlyEquivalent, getTierPrice } from '@/types/pricing';

interface PricingCardProps {
  tier: PricingTier;
  billingPeriod: BillingPeriod;
  productSlug: string;
  className?: string;
}

export function PricingCard({ tier, billingPeriod, productSlug, className }: PricingCardProps) {
  const price = getTierPrice(tier, billingPeriod);
  const monthlyEquivalent = price ? getMonthlyEquivalent(price, billingPeriod) : null;
  const yearlySavings =
    tier.priceMonthly && tier.priceYearly
      ? calculateSavings(tier.priceMonthly, tier.priceYearly)
      : 0;

  const checkoutUrl = tier.isCustomPricing
    ? '/pricing/enterprise'
    : tier.ctaUrl || `/checkout?product=${productSlug}&tier=${tier.slug}&period=${billingPeriod}`;

  return (
    <div
      className={cn(
        'relative flex flex-col p-6 bg-[var(--studio-bg)] border rounded-2xl transition-all duration-300',
        tier.isPopular
          ? 'border-(--lxd-blue-light) shadow-lg shadow-(--lxd-blue-light)/10 scale-[1.02]'
          : 'border-[var(--lxd-dark-surface-alt)]/50 hover:border-(--lxd-blue-light)/50',
        className,
      )}
    >
      {/* Popular Badge */}
      {tier.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-flex items-center gap-1.5 px-4 py-1 bg-linear-to-r from-(--lxd-blue-light) to-(--brand-secondary) text-brand-primary text-sm font-medium rounded-full shadow-lg">
            <Sparkles className="w-3.5 h-3.5" />
            {tier.popularBadgeText || 'Most Popular'}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 pt-2">
        <h3 className="text-xl font-bold text-brand-primary mb-1">{tier.name}</h3>
        {tier.targetAudience && <p className="text-brand-muted text-sm">{tier.targetAudience}</p>}
      </div>

      {/* Price */}
      <div className="mb-6">
        {tier.isCustomPricing ? (
          <div>
            <span className="text-3xl font-bold text-brand-primary">Custom</span>
            <p className="text-studio-text text-sm mt-1">Contact for pricing</p>
          </div>
        ) : (
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-brand-primary">
                {monthlyEquivalent !== null ? formatPrice(monthlyEquivalent) : 'Free'}
              </span>
              {monthlyEquivalent !== null && monthlyEquivalent > 0 && (
                <span className="text-studio-text">/month</span>
              )}
            </div>
            {billingPeriod === 'yearly' && price && yearlySavings > 0 && (
              <p className="text-(--color-lxd-success) text-sm mt-1 font-medium">
                {formatPrice(price)} billed yearly (save {yearlySavings}%)
              </p>
            )}
            {billingPeriod === 'quarterly' && price && (
              <p className="text-studio-text text-sm mt-1">{formatPrice(price)} billed quarterly</p>
            )}
          </div>
        )}
      </div>

      {/* Limits */}
      {(tier.learnerLimit || tier.authorSeats) && (
        <div className="flex gap-6 mb-6 pb-6 border-b border-[var(--lxd-dark-surface-alt)]/50">
          {tier.authorSeats && tier.authorSeats > 0 && (
            <div className="text-center">
              <span className="text-2xl font-bold text-brand-primary">
                {tier.authorSeats === -1 ? '∞' : tier.authorSeats}
              </span>
              <p className="text-brand-muted text-xs">
                {tier.authorSeats === 1 ? 'Author Seat' : 'Author Seats'}
              </p>
            </div>
          )}
          {tier.learnerLimit && tier.learnerLimit > 0 && (
            <div className="text-center">
              <span className="text-2xl font-bold text-brand-primary">
                {tier.learnerLimit === -1 ? '∞' : tier.learnerLimit}
              </span>
              <p className="text-brand-muted text-xs">
                {tier.learnerLimit === 1 ? 'Learner' : 'Learners'}
              </p>
            </div>
          )}
          {tier.storageGB && (
            <div className="text-center">
              <span className="text-2xl font-bold text-brand-primary">{tier.storageGB}</span>
              <p className="text-brand-muted text-xs">GB Storage</p>
            </div>
          )}
        </div>
      )}

      {/* Features */}
      <ul className="space-y-3 mb-8 grow">
        {tier.highlightFeatures.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-(--color-lxd-success) shrink-0 mt-0.5" />
            <span className="text-studio-text text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={checkoutUrl}
        className={cn(
          'w-full py-3 px-4 rounded-xl font-medium text-center transition-all duration-200 flex items-center justify-center gap-2',
          tier.isPopular
            ? 'bg-linear-to-r from-(--lxd-blue-light) to-studio-accent hover:from-studio-accent-hover hover:to-(--lxd-blue-light) text-brand-primary shadow-lg shadow-(--lxd-blue-light)/25'
            : 'border border-[var(--lxd-dark-surface-alt)] hover:border-(--lxd-blue-light) hover:bg-(--lxd-blue-light)/5 text-brand-primary',
        )}
      >
        {tier.ctaText || (tier.isCustomPricing ? 'Contact Sales' : 'Start Free Trial')}
        <ArrowRight className="w-4 h-4" />
      </Link>

      {/* Trial Note */}
      {tier.trialDays && !tier.isCustomPricing && (
        <p className="text-center text-brand-muted text-xs mt-3">
          {tier.trialDays}-day free trial
          {!tier.requiresCreditCard && ' • No credit card required'}
        </p>
      )}
    </div>
  );
}

export default PricingCard;
