'use client';

import { cn } from '@/lib/utils';
import type { AddonCategory, BillingPeriod, PricingAddon } from '@/types/pricing';
import { ADDON_CATEGORY_LABELS } from '@/types/pricing';
import { AddOnCard } from './add-on-card';

interface AddOnGridProps {
  addons: PricingAddon[];
  billingPeriod: BillingPeriod;
  selectedIds?: string[];
  onToggle?: (addonId: string) => void;
  disabledIds?: string[];
  groupByCategory?: boolean;
  filterCategory?: AddonCategory;
  columns?: 1 | 2 | 3;
  className?: string;
}

export function AddOnGrid({
  addons,
  billingPeriod,
  selectedIds = [],
  onToggle,
  disabledIds = [],
  groupByCategory = false,
  filterCategory,
  columns = 2,
  className,
}: AddOnGridProps) {
  // Filter and sort addons
  const filteredAddons = addons
    .filter((addon) => addon.isActive)
    .filter((addon) => !filterCategory || addon.category === filterCategory)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };

  if (groupByCategory) {
    // Group addons by category
    const grouped = filteredAddons.reduce(
      (acc, addon) => {
        if (!acc[addon.category]) {
          acc[addon.category] = [];
        }
        acc[addon.category].push(addon);
        return acc;
      },
      {} as Record<AddonCategory, PricingAddon[]>,
    );

    // Sort categories
    const categoryOrder: AddonCategory[] = [
      'ai',
      'engagement',
      'branding',
      'integration',
      'security',
      'compliance',
      'analytics',
      'infrastructure',
      'support',
      'revenue',
    ];

    const sortedCategories = Object.keys(grouped).sort(
      (a, b) =>
        categoryOrder.indexOf(a as AddonCategory) - categoryOrder.indexOf(b as AddonCategory),
    ) as AddonCategory[];

    return (
      <div className={cn('space-y-10', className)}>
        {sortedCategories.map((category) => (
          <div key={category}>
            <h3 className="text-lg font-semibold text-brand-primary mb-4">
              {ADDON_CATEGORY_LABELS[category]}
            </h3>
            <div className={cn('grid gap-4', colClasses[columns])}>
              {grouped[category].map((addon) => (
                <AddOnCard
                  key={addon.id}
                  addon={addon}
                  billingPeriod={billingPeriod}
                  isSelected={selectedIds.includes(addon.id)}
                  onToggle={onToggle ? () => onToggle(addon.id) : undefined}
                  disabled={disabledIds.includes(addon.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid gap-4', colClasses[columns], className)}>
      {filteredAddons.map((addon) => (
        <AddOnCard
          key={addon.id}
          addon={addon}
          billingPeriod={billingPeriod}
          isSelected={selectedIds.includes(addon.id)}
          onToggle={onToggle ? () => onToggle(addon.id) : undefined}
          disabled={disabledIds.includes(addon.id)}
          showCategory={!groupByCategory && !filterCategory}
        />
      ))}
    </div>
  );
}

export default AddOnGrid;
