import type { LucideIcon } from 'lucide-react';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title?: string;
  label?: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  color?: string;
  trend?: 'up' | 'down' | { value: string; isPositive: boolean };
}

export function StatsCard({
  title,
  label,
  value,
  change,
  icon: Icon,
  trend,
}: StatsCardProps): React.JSX.Element {
  const displayTitle = title || label || '';
  const isPositive = typeof trend === 'string' ? trend === 'up' : (trend?.isPositive ?? false);
  const hasTrend = trend !== undefined || change !== undefined;

  return (
    <Card className="transition-card hover-lift">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{displayTitle}</p>
            <p className="text-3xl font-bold">{value}</p>
            {hasTrend && (
              <div className="flex items-center gap-1">
                {isPositive ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-600" />
                )}
                <span
                  className={cn(
                    'text-sm font-medium',
                    isPositive ? 'text-green-600' : 'text-red-600',
                  )}
                >
                  {typeof trend === 'object'
                    ? trend.value
                    : change !== undefined
                      ? `${Math.abs(change)}%`
                      : ''}
                </span>
              </div>
            )}
          </div>
          <div className="rounded-lg bg-primary/10 p-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
