'use client';

import { Check, ChevronDown, Package, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import type { AddonCategory, BillingPeriod, PricingAddon } from '@/types/pricing';
import { ADDON_CATEGORY_LABELS, formatPrice, getMonthlyEquivalent } from '@/types/pricing';
import { AddOnCard } from './add-on-card';

interface AddOnSelectorProps {
  addons: PricingAddon[];
  billingPeriod: BillingPeriod;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  includedAddonIds?: string[];
  disabledAddonIds?: string[];
  basePrice?: number;
  className?: string;
}

export function AddOnSelector({
  addons,
  billingPeriod,
  selectedIds,
  onSelectionChange,
  includedAddonIds = [],
  disabledAddonIds = [],
  basePrice = 0,
  className,
}: AddOnSelectorProps) {
  const [expandedCategory, setExpandedCategory] = useState<AddonCategory | null>(null);

  // Filter active addons
  const activeAddons = addons.filter((addon) => addon.isActive);

  // Group by category
  const groupedAddons = useMemo(() => {
    return activeAddons.reduce(
      (acc, addon) => {
        if (!acc[addon.category]) {
          acc[addon.category] = [];
        }
        acc[addon.category].push(addon);
        return acc;
      },
      {} as Record<AddonCategory, PricingAddon[]>,
    );
  }, [activeAddons]);

  // Calculate totals
  const addOnTotal = useMemo(() => {
    return selectedIds.reduce((total, id) => {
      const addon = activeAddons.find((a) => a.id === id);
      if (!addon || includedAddonIds.includes(id)) return total;

      const price =
        billingPeriod === 'yearly' && addon.priceYearly
          ? getMonthlyEquivalent(addon.priceYearly, 'yearly')
          : addon.priceMonthly;

      return total + price;
    }, 0);
  }, [selectedIds, activeAddons, billingPeriod, includedAddonIds]);

  const grandTotal = basePrice + addOnTotal;

  // Toggle addon selection
  const toggleAddon = (addonId: string) => {
    if (includedAddonIds.includes(addonId) || disabledAddonIds.includes(addonId)) return;

    if (selectedIds.includes(addonId)) {
      onSelectionChange(selectedIds.filter((id) => id !== addonId));
    } else {
      onSelectionChange([...selectedIds, addonId]);
    }
  };

  // Category order
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

  const sortedCategories = Object.keys(groupedAddons).sort(
    (a, b) => categoryOrder.indexOf(a as AddonCategory) - categoryOrder.indexOf(b as AddonCategory),
  ) as AddonCategory[];

  return (
    <div
      className={cn(
        'bg-[var(--studio-bg)] border border-[var(--lxd-dark-surface-alt)]/50 rounded-2xl overflow-hidden',
        className,
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-[var(--lxd-dark-surface-alt)]/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-(--lxd-blue-light)/10 rounded-lg">
            <Package className="w-5 h-5 text-(--lxd-blue-light)" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-brand-primary">Add-ons</h3>
            <p className="text-brand-muted text-sm">Customize your plan with powerful add-ons</p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="divide-y divide-[var(--lxd-dark-surface-alt)]/30">
        {sortedCategories.map((category) => {
          const categoryAddons = groupedAddons[category];
          const selectedInCategory = categoryAddons.filter(
            (a) => selectedIds.includes(a.id) || includedAddonIds.includes(a.id),
          ).length;
          const isExpanded = expandedCategory === category;

          return (
            <div key={category}>
              {/* Category header */}
              <button
                type="button"
                onClick={() => setExpandedCategory(isExpanded ? null : category)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-studio-bg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-brand-primary font-medium">
                    {ADDON_CATEGORY_LABELS[category]}
                  </span>
                  <span className="text-brand-muted text-sm">
                    ({categoryAddons.length} add-ons)
                  </span>
                  {selectedInCategory > 0 && (
                    <span className="px-2 py-0.5 bg-(--lxd-blue-light)/20 text-(--lxd-blue-light) text-xs rounded-full">
                      {selectedInCategory} selected
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 text-brand-muted transition-transform',
                    isExpanded && 'rotate-180',
                  )}
                />
              </button>

              {/* Category addons */}
              {isExpanded && (
                <div className="px-6 pb-4 space-y-3">
                  {categoryAddons.map((addon) => {
                    const isIncluded = includedAddonIds.includes(addon.id);
                    const isDisabled = disabledAddonIds.includes(addon.id);
                    const isSelected = selectedIds.includes(addon.id);

                    return (
                      <AddOnCard
                        key={addon.id}
                        addon={addon}
                        billingPeriod={billingPeriod}
                        isSelected={isSelected || isIncluded}
                        onToggle={isIncluded ? undefined : () => toggleAddon(addon.id)}
                        disabled={isDisabled}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="p-6 bg-[var(--studio-bg-dark)] border-t border-[var(--lxd-dark-surface-alt)]/50">
        <div className="space-y-3">
          {basePrice > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-studio-text">Base plan</span>
              <span className="text-brand-primary">{formatPrice(basePrice)}/mo</span>
            </div>
          )}

          {addOnTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-studio-text">
                Add-ons ({selectedIds.filter((id) => !includedAddonIds.includes(id)).length})
              </span>
              <span className="text-brand-primary">+{formatPrice(addOnTotal)}/mo</span>
            </div>
          )}

          <div className="pt-3 border-t border-[var(--lxd-dark-surface-alt)]/50 flex justify-between">
            <span className="text-brand-primary font-medium">Total</span>
            <div className="text-right">
              <span className="text-xl font-bold text-brand-primary">
                {formatPrice(grandTotal)}
              </span>
              <span className="text-brand-muted text-sm">/mo</span>
            </div>
          </div>

          {billingPeriod === 'yearly' && (
            <p className="text-brand-success text-xs text-right">
              Billed annually • 20% savings on add-ons
            </p>
          )}
        </div>

        {/* Selected addons chips */}
        {selectedIds.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[var(--lxd-dark-surface-alt)]/50">
            <p className="text-brand-muted text-xs mb-2">Selected add-ons:</p>
            <div className="flex flex-wrap gap-2">
              {selectedIds.map((id) => {
                const addon = activeAddons.find((a) => a.id === id);
                if (!addon) return null;
                const isIncluded = includedAddonIds.includes(id);

                return (
                  <span
                    key={id}
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full',
                      isIncluded
                        ? 'bg-brand-success/10 text-brand-success'
                        : 'bg-(--lxd-blue-light)/10 text-(--lxd-blue-light)',
                    )}
                  >
                    {addon.name}
                    {isIncluded ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleAddon(id)}
                        className="hover:text-brand-primary transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddOnSelector;
