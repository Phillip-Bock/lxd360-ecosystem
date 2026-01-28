'use client';

import { cn } from '@/lib/utils';
import type { BillingPeriod, PricingTier } from '@/types/pricing';
import { PricingCard } from './pricing-card';

interface PricingGridProps {
  tiers: PricingTier[];
  billingPeriod: BillingPeriod;
  productSlug: string;
  className?: string;
}

export function PricingGrid({ tiers, billingPeriod, productSlug, className }: PricingGridProps) {
  // Sort by display order
  const sortedTiers = [...tiers].sort((a, b) => a.displayOrder - b.displayOrder);

  // Determine grid columns based on number of tiers
  const gridCols = {
    2: 'md:grid-cols-2 max-w-3xl',
    3: 'md:grid-cols-3 max-w-5xl',
    4: 'md:grid-cols-2 lg:grid-cols-4 max-w-7xl',
    5: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 max-w-7xl',
  };

  const colClass =
    gridCols[sortedTiers.length as keyof typeof gridCols] || 'md:grid-cols-3 max-w-5xl';

  return (
    <div className={cn('mx-auto', className)}>
      <div className={cn('grid gap-6', colClass)}>
        {sortedTiers.map((tier) => (
          <PricingCard
            key={tier.id}
            tier={tier}
            billingPeriod={billingPeriod}
            productSlug={productSlug}
          />
        ))}
      </div>
    </div>
  );
}

export default PricingGrid;
