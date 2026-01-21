'use client';

import { cn } from '@/lib/utils';
import type { BillingPeriod } from '@/types/pricing';

interface PricingToggleProps {
  value: BillingPeriod;
  onChange: (value: BillingPeriod) => void;
  showQuarterly?: boolean;
  yearlySavings?: number;
  className?: string;
}

interface ToggleOption {
  value: BillingPeriod;
  label: string;
  badge?: string;
}

export function PricingToggle({
  value,
  onChange,
  showQuarterly = true,
  yearlySavings = 20,
  className,
}: PricingToggleProps) {
  const options: ToggleOption[] = [
    { value: 'monthly', label: 'Monthly' },
    ...(showQuarterly ? [{ value: 'quarterly' as BillingPeriod, label: 'Quarterly' }] : []),
    {
      value: 'yearly',
      label: 'Yearly',
      badge: yearlySavings > 0 ? `Save ${yearlySavings}%` : undefined,
    },
  ];

  return (
    <div
      className={cn(
        'inline-flex items-center p-1.5 bg-studio-bg border border-[var(--lxd-dark-surface-alt)]/50 rounded-xl',
        className,
      )}
    >
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
            value === option.value
              ? 'bg-linear-to-r from-(--lxd-blue-light) to-studio-accent text-brand-primary shadow-md'
              : 'text-studio-text hover:text-brand-primary hover:bg-[var(--lxd-dark-surface-alt)]/30',
          )}
        >
          {option.label}
          {option.badge && (
            <span
              className={cn(
                'absolute -top-2 -right-2 px-2 py-0.5 text-xs rounded-full font-medium transition-colors',
                value === option.value
                  ? 'bg-brand-success text-brand-primary'
                  : 'bg-brand-success/80 text-brand-primary',
              )}
            >
              {option.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export default PricingToggle;
