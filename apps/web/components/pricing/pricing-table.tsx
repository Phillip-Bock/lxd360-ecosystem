'use client';

import { Check, HelpCircle, Minus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BillingPeriod, PricingFeature, PricingTier } from '@/types/pricing';
import { formatPrice, getMonthlyEquivalent, getTierPrice } from '@/types/pricing';

interface FeatureGroup {
  name: string;
  features: {
    feature: PricingFeature;
    values: Record<string, string | boolean | number>;
  }[];
}

interface PricingTableProps {
  tiers: PricingTier[];
  featureGroups: FeatureGroup[];
  billingPeriod: BillingPeriod;
  productSlug: string;
  stickyHeader?: boolean;
  className?: string;
}

export function PricingTable({
  tiers,
  featureGroups,
  billingPeriod,
  productSlug,
  stickyHeader = true,
  className,
}: PricingTableProps) {
  // Sort tiers by display order
  const sortedTiers = [...tiers].sort((a, b) => a.displayOrder - b.displayOrder);

  const renderValue = (value: string | boolean | number | undefined) => {
    if (value === undefined || value === null) {
      return <Minus className="w-4 h-4 text-brand-muted" />;
    }
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-brand-success" />
      ) : (
        <X className="w-5 h-5 text-brand-muted" />
      );
    }
    if (typeof value === 'number') {
      return (
        <span className="text-brand-primary">
          {value === -1 ? 'Unlimited' : value.toLocaleString()}
        </span>
      );
    }
    return <span className="text-brand-primary text-sm">{value}</span>;
  };

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse min-w-[800px]">
        {/* Header */}
        <thead className={cn(stickyHeader && 'sticky top-0 z-10')}>
          <tr className="bg-lxd-blue-dark-700">
            <th className="p-4 text-left text-brand-muted font-normal border-b border-[var(--lxd-dark-surface-alt)]/50 w-[240px]">
              Compare Plans
            </th>
            {sortedTiers.map((tier) => {
              const price = getTierPrice(tier, billingPeriod);
              const monthlyEquivalent = price ? getMonthlyEquivalent(price, billingPeriod) : null;

              return (
                <th
                  key={tier.id}
                  className={cn(
                    'p-4 text-center border-b border-l border-[var(--lxd-dark-surface-alt)]/50 min-w-[160px]',
                    tier.isPopular && 'bg-lxd-blue-light/5',
                  )}
                >
                  {tier.isPopular && (
                    <span className="inline-block px-3 py-1 mb-2 bg-lxd-blue-light text-brand-primary text-xs font-medium rounded-full">
                      Most Popular
                    </span>
                  )}
                  <div className="text-brand-primary font-semibold">{tier.name}</div>
                  <div className="mt-1">
                    {tier.isCustomPricing ? (
                      <span className="text-brand-muted text-sm">Custom</span>
                    ) : (
                      <>
                        <span className="text-xl font-bold text-brand-primary">
                          {monthlyEquivalent !== null ? formatPrice(monthlyEquivalent) : 'Free'}
                        </span>
                        {monthlyEquivalent !== null && monthlyEquivalent > 0 && (
                          <span className="text-brand-muted text-sm">/mo</span>
                        )}
                      </>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {featureGroups.map((group, groupIndex) => (
            <>
              {/* Group header */}
              <tr key={`group-${groupIndex}`} className="bg-[var(--studio-bg-dark)]">
                <td
                  colSpan={sortedTiers.length + 1}
                  className="px-4 py-3 text-lxd-blue-light text-sm font-semibold uppercase tracking-wider border-b border-[var(--lxd-dark-surface-alt)]/50"
                >
                  {group.name}
                </td>
              </tr>

              {/* Features */}
              {group.features.map((row, rowIndex) => (
                <tr
                  key={`feature-${groupIndex}-${rowIndex}`}
                  className={cn(
                    'hover:bg-studio-bg transition-colors',
                    rowIndex % 2 === 0 ? 'bg-lxd-blue-dark-700' : 'bg-lxd-blue-dark-700/50',
                  )}
                >
                  <td className="px-4 py-3 border-b border-[var(--lxd-dark-surface-alt)]/30">
                    <div className="flex items-center gap-2">
                      <span className="text-brand-muted text-sm">{row.feature.name}</span>
                      {row.feature.tooltip && (
                        <button
                          type="button"
                          className="text-brand-muted hover:text-lxd-blue-light transition-colors"
                          title={row.feature.tooltip}
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                  {sortedTiers.map((tier) => (
                    <td
                      key={`${row.feature.id}-${tier.id}`}
                      className={cn(
                        'px-4 py-3 text-center border-b border-l border-[var(--lxd-dark-surface-alt)]/30',
                        tier.isPopular && 'bg-lxd-blue-light/5',
                      )}
                    >
                      {renderValue(row.values[tier.id])}
                    </td>
                  ))}
                </tr>
              ))}
            </>
          ))}
        </tbody>

        {/* Footer with CTAs */}
        <tfoot>
          <tr className="bg-lxd-blue-dark-700">
            <td className="p-4 border-t border-[var(--lxd-dark-surface-alt)]/50" />
            {sortedTiers.map((tier) => (
              <td
                key={`cta-${tier.id}`}
                className={cn(
                  'p-4 text-center border-t border-l border-[var(--lxd-dark-surface-alt)]/50',
                  tier.isPopular && 'bg-lxd-blue-light/5',
                )}
              >
                <a
                  href={
                    tier.isCustomPricing
                      ? '/pricing/enterprise'
                      : `/checkout?product=${productSlug}&tier=${tier.slug}&period=${billingPeriod}`
                  }
                  className={cn(
                    'inline-block px-6 py-2 rounded-lg font-medium text-sm transition-colors',
                    tier.isPopular
                      ? 'bg-lxd-blue-light hover:bg-studio-accent-hover text-brand-primary'
                      : 'border border-[var(--lxd-dark-surface-alt)] hover:border-lxd-blue-light/50 text-brand-primary',
                  )}
                >
                  {tier.ctaText || (tier.isCustomPricing ? 'Contact Sales' : 'Get Started')}
                </a>
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default PricingTable;
