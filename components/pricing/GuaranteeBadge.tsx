'use client';

import { Clock, RefreshCw, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GuaranteeBadgeProps {
  type?: 'money-back' | 'uptime' | 'support';
  days?: number;
  percent?: number;
  variant?: 'compact' | 'full';
  className?: string;
}

export function GuaranteeBadge({
  type = 'money-back',
  days = 30,
  percent = 99.9,
  variant = 'compact',
  className,
}: GuaranteeBadgeProps) {
  const configs = {
    'money-back': {
      icon: RefreshCw,
      title: `${days}-Day Money-Back Guarantee`,
      description: 'Not satisfied? Get a full refund, no questions asked.',
      color: 'from-emerald-500/20 to-emerald-600/20',
      iconColor: 'text-brand-success',
      borderColor: 'border-emerald-500/30',
    },
    uptime: {
      icon: ShieldCheck,
      title: `${percent}% Uptime SLA`,
      description: 'Guaranteed availability with service credits if we miss it.',
      color: 'from-[var(--brand-primary)]/20 to-blue-600/20',
      iconColor: 'text-[var(--brand-primary)]',
      borderColor: 'border-[var(--brand-primary)]/30',
    },
    support: {
      icon: Clock,
      title: '24/7 Premium Support',
      description: 'Real humans available around the clock to help you succeed.',
      color: 'from-purple-500/20 to-purple-600/20',
      iconColor: 'text-brand-purple',
      borderColor: 'border-brand-secondary/30',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r border',
          config.color,
          config.borderColor,
          className,
        )}
      >
        <Icon className={cn('w-4 h-4', config.iconColor)} />
        <span className="text-sm text-brand-primary font-medium">{config.title}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-start gap-4 p-6 rounded-xl bg-linear-to-r border',
        config.color,
        config.borderColor,
        className,
      )}
    >
      <div className={cn('p-3 rounded-lg bg-(--background)')}>
        <Icon className={cn('w-6 h-6', config.iconColor)} />
      </div>
      <div>
        <h4 className="text-brand-primary font-semibold mb-1">{config.title}</h4>
        <p className="text-(--muted-foreground) text-sm">{config.description}</p>
      </div>
    </div>
  );
}

export default GuaranteeBadge;
