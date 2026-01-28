'use client';

import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  icon,
  className,
}: StatCardProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'bg-card border-2 border-border rounded-[10px] p-5',
        'hover:border-primary/30 transition-colors duration-200',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              {change.type === 'increase' && <TrendingUp className="w-4 h-4 text-brand-success" />}
              {change.type === 'decrease' && <TrendingDown className="w-4 h-4 text-brand-error" />}
              {change.type === 'neutral' && <Minus className="w-4 h-4 text-lxd-text-dark-muted" />}
              <span
                className={cn(
                  'text-sm font-medium',
                  change.type === 'increase' && 'text-brand-success',
                  change.type === 'decrease' && 'text-brand-error',
                  change.type === 'neutral' && 'text-lxd-text-dark-muted',
                )}
              >
                {change.type === 'increase' ? '+' : change.type === 'decrease' ? '' : ''}
                {change.value}%
              </span>
            </div>
          )}
        </div>
        {icon && <div className="p-2 bg-primary/10 rounded-[8px] text-primary">{icon}</div>}
      </div>
    </div>
  );
}
