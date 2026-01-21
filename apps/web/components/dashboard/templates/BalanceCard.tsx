'use client';

import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BalanceCardProps {
  title: string;
  value: string;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  tabs?: { label: string; active?: boolean }[];
  periods?: { label: string; active?: boolean }[];
  onTabChange?: (tab: string) => void;
  onPeriodChange?: (period: string) => void;
  className?: string;
}

export function BalanceCard({
  title,
  value,
  change,
  tabs,
  periods,
  onTabChange,
  onPeriodChange,
  className,
}: BalanceCardProps): React.JSX.Element {
  return (
    <div className={cn('bg-card border-2 border-border rounded-[10px] p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {tabs && tabs.length > 0 && (
          <div className="flex gap-1 bg-muted rounded-[8px] p-1">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.label}
                onClick={() => onTabChange?.(tab.label)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-[6px] transition-colors',
                  tab.active
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-foreground">{value}</span>
        {change && (
          <div className="flex items-center gap-1">
            <TrendingUp
              className={cn(
                'w-4 h-4',
                change.type === 'increase' ? 'text-brand-success' : 'text-brand-error',
              )}
            />
            <span
              className={cn(
                'text-sm font-medium',
                change.type === 'increase' ? 'text-brand-success' : 'text-brand-error',
              )}
            >
              {change.type === 'increase' ? '+' : '-'}
              {change.value}%
            </span>
          </div>
        )}
      </div>

      {periods && periods.length > 0 && (
        <div className="flex gap-2 mt-4">
          {periods.map((period) => (
            <button
              type="button"
              key={period.label}
              onClick={() => onPeriodChange?.(period.label)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-[6px] transition-colors',
                period.active
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground',
              )}
            >
              {period.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
