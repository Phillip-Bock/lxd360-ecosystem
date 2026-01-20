'use client';

import { Award, CheckCircle2, Globe, Lock, Shield, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustBadge {
  icon: typeof Shield;
  label: string;
  color: string;
  description?: string;
}

interface TrustBadgesProps {
  badges?: TrustBadge[];
  variant?: 'inline' | 'grid';
  showDescriptions?: boolean;
  className?: string;
}

const defaultBadges: TrustBadge[] = [
  {
    icon: Shield,
    label: 'SOC 2 Type II',
    color: 'text-brand-success',
    description: 'Certified security controls',
  },
  {
    icon: Lock,
    label: 'HIPAA Compliant',
    color: 'text-brand-error',
    description: 'Healthcare data protection',
  },
  { icon: Globe, label: 'GDPR Ready', color: 'text-brand-purple', description: 'EU data privacy' },
  { icon: Zap, label: '99.9% Uptime', color: 'text-brand-warning', description: 'SLA guaranteed' },
  {
    icon: Award,
    label: 'ISO 27001',
    color: 'text-brand-cyan',
    description: 'Information security',
  },
  {
    icon: CheckCircle2,
    label: 'WCAG 2.1 AA',
    color: 'text-brand-cyan',
    description: 'Accessibility compliant',
  },
];

export function TrustBadges({
  badges = defaultBadges,
  variant = 'inline',
  showDescriptions = false,
  className,
}: TrustBadgesProps) {
  if (variant === 'grid') {
    return (
      <div className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4', className)}>
        {badges.map((badge, index) => (
          <div
            key={index}
            className="flex flex-col items-center p-4 bg-studio-bg border border-[var(--lxd-dark-surface-alt)]/50 rounded-xl text-center"
          >
            <badge.icon className={cn('w-6 h-6 mb-2', badge.color)} />
            <span className="text-brand-primary text-sm font-medium">{badge.label}</span>
            {showDescriptions && badge.description && (
              <span className="text-brand-muted text-xs mt-1">{badge.description}</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-wrap justify-center gap-x-8 gap-y-4', className)}>
      {badges.map((badge, index) => (
        <div key={index} className="flex items-center gap-2 text-studio-text">
          <badge.icon className={cn('w-5 h-5', badge.color)} />
          <span className="text-sm">{badge.label}</span>
        </div>
      ))}
    </div>
  );
}

export default TrustBadges;
