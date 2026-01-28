'use client';

import { ArrowRight, Building2, Check, HeadphonesIcon, Shield, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface EnterpriseCardProps {
  title?: string;
  description?: string;
  features?: string[];
  ctaText?: string;
  ctaUrl?: string;
  className?: string;
}

const defaultFeatures = [
  'Unlimited users and learners',
  'Dedicated infrastructure',
  'Custom integrations & API',
  'SSO/SAML authentication',
  'Advanced security & compliance',
  'Dedicated customer success manager',
  'Custom contract terms',
  '99.9% SLA guarantee',
];

export function EnterpriseCard({
  title = 'Enterprise',
  description = 'For large organizations with custom requirements',
  features = defaultFeatures,
  ctaText = 'Contact Sales',
  ctaUrl = '/pricing/enterprise',
  className,
}: EnterpriseCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-linear-to-br from-studio-bg to-[var(--studio-bg)] border border-[var(--lxd-dark-surface-alt)]/50',
        className,
      )}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--lxd-blue-light) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <div className="relative p-8 md:p-10">
        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <div className="p-3 bg-linear-to-br from-(--lxd-blue-light)/20 to-(--brand-secondary)/20 rounded-xl">
            <Building2 className="w-8 h-8 text-(--lxd-blue-light)" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-brand-primary mb-1">{title}</h3>
            <p className="text-studio-text">{description}</p>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: 'Unlimited Scale', color: 'text-(--lxd-blue-light)' },
            { icon: Shield, label: 'Enterprise Security', color: 'text-brand-success' },
            { icon: Zap, label: 'Custom Solutions', color: 'text-brand-warning' },
            { icon: HeadphonesIcon, label: 'Priority Support', color: 'text-brand-purple' },
          ].map((benefit, i) => (
            <div key={i} className="text-center p-4 bg-[var(--studio-bg-dark)]/50 rounded-xl">
              <benefit.icon className={cn('w-6 h-6 mx-auto mb-2', benefit.color)} />
              <span className="text-sm text-studio-text">{benefit.label}</span>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-3 mb-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <Check className="w-5 h-5 text-brand-success shrink-0" />
              <span className="text-studio-text text-sm">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={ctaUrl}
            className="flex-1 py-4 px-6 bg-linear-to-r from-(--lxd-blue-light) to-studio-accent hover:from-studio-accent-hover hover:to-(--lxd-blue-light) text-brand-primary font-medium rounded-xl text-center transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-(--lxd-blue-light)/25"
          >
            {ctaText}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/demo?plan=enterprise"
            className="flex-1 py-4 px-6 border border-[var(--lxd-dark-surface-alt)] hover:border-(--lxd-blue-light)/50 text-brand-primary font-medium rounded-xl text-center transition-colors flex items-center justify-center gap-2"
          >
            Schedule Demo
          </Link>
        </div>

        {/* Note */}
        <p className="text-center text-brand-muted text-xs mt-4">
          Custom pricing based on your specific requirements
        </p>
      </div>
    </div>
  );
}

export default EnterpriseCard;
