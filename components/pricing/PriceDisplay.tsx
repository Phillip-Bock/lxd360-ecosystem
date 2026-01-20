'use client';

import { cn } from '@/lib/utils';
import type { BillingPeriod } from '@/types/pricing';
import { BILLING_PERIOD_LABELS, formatPrice, getMonthlyEquivalent } from '@/types/pricing';

interface PriceDisplayProps {
  /** Price in cents */
  amount: number;
  billingPeriod: BillingPeriod;
  /** Show the monthly equivalent for non-monthly periods */
  showMonthlyEquivalent?: boolean;
  /** Original price (for showing discounts) */
  originalAmount?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function PriceDisplay({
  amount,
  billingPeriod,
  showMonthlyEquivalent = true,
  originalAmount,
  size = 'lg',
  className,
}: PriceDisplayProps) {
  const displayAmount = showMonthlyEquivalent
    ? getMonthlyEquivalent(amount, billingPeriod)
    : amount;

  const periodLabel = showMonthlyEquivalent
    ? BILLING_PERIOD_LABELS.monthly.perUnit
    : BILLING_PERIOD_LABELS[billingPeriod].perUnit;

  const sizeClasses = {
    sm: { price: 'text-xl', period: 'text-xs' },
    md: { price: 'text-2xl', period: 'text-sm' },
    lg: { price: 'text-4xl', period: 'text-base' },
    xl: { price: 'text-5xl', period: 'text-lg' },
  };

  const { price: priceSize, period: periodSize } = sizeClasses[size];

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-baseline gap-1">
        {originalAmount && originalAmount > amount && (
          <span className={cn('text-brand-muted line-through mr-2', periodSize)}>
            {formatPrice(
              showMonthlyEquivalent
                ? getMonthlyEquivalent(originalAmount, billingPeriod)
                : originalAmount,
            )}
          </span>
        )}
        <span className={cn('font-bold text-brand-primary', priceSize)}>
          {formatPrice(displayAmount)}
        </span>
        <span className={cn('text-studio-text', periodSize)}>{periodLabel}</span>
      </div>

      {showMonthlyEquivalent && billingPeriod !== 'monthly' && (
        <p className="text-brand-muted text-sm mt-1">
          {formatPrice(amount)} billed {billingPeriod === 'yearly' ? 'annually' : 'quarterly'}
        </p>
      )}
    </div>
  );
}

export default PriceDisplay;
