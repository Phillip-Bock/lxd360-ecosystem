'use client';

import { Check, Info } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { BillingPeriod, PricingAddon } from '@/types/pricing';
import { ADDON_CATEGORY_LABELS, formatPrice, getMonthlyEquivalent } from '@/types/pricing';

interface AddOnCardProps {
  addon: PricingAddon;
  billingPeriod: BillingPeriod;
  isSelected?: boolean;
  onToggle?: () => void;
  disabled?: boolean;
  showCategory?: boolean;
  className?: string;
}

export function AddOnCard({
  addon,
  billingPeriod,
  isSelected,
  onToggle,
  disabled,
  showCategory = false,
  className,
}: AddOnCardProps): React.JSX.Element {
  const [showDetails, setShowDetails] = useState(false);

  const monthlyEquivalent =
    billingPeriod === 'yearly' && addon.priceYearly
      ? getMonthlyEquivalent(addon.priceYearly, 'yearly')
      : addon.priceMonthly;

  const categoryLabel = ADDON_CATEGORY_LABELS[addon.category];

  const cardClasses = cn(
    'relative p-5 bg-(--lxd-blue-dark-700) border rounded-xl transition-all duration-200 text-left w-full',
    isSelected
      ? 'border-(--lxd-blue-light) bg-(--lxd-blue-light)/5 ring-1 ring-(--lxd-blue-light)/30'
      : 'border-(--lxd-blue-dark-700)/50 hover:border-(--lxd-blue-light)/50',
    disabled && 'opacity-50 cursor-not-allowed',
    !disabled && onToggle && 'cursor-pointer',
    className,
  );

  const cardContent = (
    <>
      {/* Badges */}
      <div className="absolute -top-2 right-4 flex gap-2">
        {addon.isPopular && (
          <span className="px-2 py-0.5 bg-brand-warning text-brand-primary text-xs font-medium rounded-full">
            Popular
          </span>
        )}
        {addon.isNew && (
          <span className="px-2 py-0.5 bg-(--lxd-blue-light) text-brand-primary text-xs font-medium rounded-full">
            New
          </span>
        )}
        {addon.comingSoon && (
          <span className="px-2 py-0.5 bg-(--lxd-blue-dark-700) text-brand-muted text-xs font-medium rounded-full">
            Coming Soon
          </span>
        )}
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="grow min-w-0">
          {showCategory && (
            <span className="text-brand-muted text-xs uppercase tracking-wider mb-1 block">
              {categoryLabel}
            </span>
          )}
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-brand-primary truncate">{addon.name}</h4>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(!showDetails);
              }}
              className="text-brand-muted hover:text-(--lxd-blue-light) transition-colors shrink-0"
              aria-label="Toggle details"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
          <p className="text-brand-muted text-sm line-clamp-2">{addon.description}</p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-lg font-bold text-brand-primary">
            {formatPrice(monthlyEquivalent)}
          </span>
          <span className="text-brand-muted text-sm">/mo</span>
          {addon.isPerSeat && <span className="block text-brand-muted text-xs">per seat</span>}
        </div>

        {onToggle && (
          <div
            className={cn(
              'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
              isSelected
                ? 'bg-(--lxd-blue-light) border-(--lxd-blue-light)'
                : 'border-(--lxd-blue-dark-700) hover:border-(--lxd-blue-light)/50',
            )}
          >
            {isSelected && <Check className="w-4 h-4 text-brand-primary" />}
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {showDetails && addon.features.length > 0 && (
        <div className="mt-4 pt-4 border-t border-(--lxd-blue-dark-700)/50">
          <p className="text-brand-muted text-xs uppercase tracking-wider mb-3">
            What&apos;s included:
          </p>
          <ul className="space-y-2">
            {addon.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-brand-muted">
                <Check className="w-4 h-4 text-brand-success shrink-0 mt-0.5" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );

  // When onToggle is provided and not disabled, render as a button for accessibility
  if (onToggle && !disabled) {
    return (
      <button type="button" className={cardClasses} onClick={onToggle} aria-pressed={isSelected}>
        {cardContent}
      </button>
    );
  }

  // Otherwise render as a div (non-interactive)
  return <div className={cardClasses}>{cardContent}</div>;
}

export default AddOnCard;
