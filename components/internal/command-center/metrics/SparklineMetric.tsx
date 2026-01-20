'use client';

import { cn } from '@/lib/core/utils';

interface SparklineMetricProps {
  value: number;
  data: number[];
  label: string;
  prefix?: string;
  suffix?: string;
  trend?: number;
  color?: 'cyan' | 'green' | 'blue' | 'purple' | 'amber';
  className?: string;
}

export function SparklineMetric({
  value,
  data,
  label,
  prefix = '',
  suffix = '',
  trend,
  color = 'cyan',
  className,
}: SparklineMetricProps) {
  const colorClasses = {
    cyan: 'text-brand-cyan stroke-cyan-400',
    green: 'text-brand-success stroke-green-400',
    blue: 'text-brand-cyan stroke-blue-400',
    purple: 'text-brand-purple stroke-purple-400',
    amber: 'text-brand-warning stroke-amber-400',
  };

  // Normalize data for sparkline
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 24;
  const width = 60;
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div>
        <p className="text-xs text-brand-muted uppercase tracking-wide">{label}</p>
        <p className={cn('text-xl font-bold font-mono', colorClasses[color].split(' ')[0])}>
          {prefix}
          {value.toLocaleString()}
          {suffix}
        </p>
        {trend !== undefined && (
          <p
            className={cn(
              'text-xs font-medium',
              trend >= 0 ? 'text-brand-success' : 'text-brand-error',
            )}
          >
            {trend >= 0 ? '+' : ''}
            {trend}%
          </p>
        )}
      </div>
      <svg aria-hidden="true" width={width} height={height} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          className={colorClasses[color].split(' ')[1]}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
