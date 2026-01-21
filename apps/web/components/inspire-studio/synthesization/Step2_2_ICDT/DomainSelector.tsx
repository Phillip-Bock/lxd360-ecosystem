'use client';

import { Brain, Hand, Heart, Lightbulb, Monitor, Sparkles, Users } from 'lucide-react';
import type React from 'react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { LearningDomain } from '@/schemas/inspire';
import { LEARNING_DOMAIN_CATALOG } from './types';

// ============================================================================
// ICON MAPPING
// ============================================================================

const DOMAIN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  brain: Brain,
  heart: Heart,
  hand: Hand,
  users: Users,
  lightbulb: Lightbulb,
  sparkles: Sparkles,
  monitor: Monitor,
};

// ============================================================================
// COMPONENT
// ============================================================================

interface DomainSelectorProps {
  value: LearningDomain[];
  onChange: (domains: LearningDomain[]) => void;
  className?: string;
}

/**
 * DomainSelector - Multi-select for learning domains
 * Displays domains as toggleable badges with icons
 */
export function DomainSelector({ value, onChange, className }: DomainSelectorProps) {
  const handleToggle = (domain: LearningDomain) => {
    if (value.includes(domain)) {
      onChange(value.filter((d) => d !== domain));
    } else {
      onChange([...value, domain]);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Learning Domains</Label>
        <span className="text-xs text-muted-foreground">{value.length} selected</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {LEARNING_DOMAIN_CATALOG.map((domain) => {
          const isSelected = value.includes(domain.value);
          const Icon = DOMAIN_ICONS[domain.icon];

          return (
            <button
              key={domain.value}
              type="button"
              onClick={() => handleToggle(domain.value)}
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-lxd-purple rounded-md"
            >
              <Badge
                variant={isSelected ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer transition-all px-3 py-1.5',
                  isSelected
                    ? 'bg-lxd-purple/20 text-lxd-purple border-lxd-purple hover:bg-lxd-purple/30'
                    : 'hover:bg-lxd-dark-bg/50',
                )}
              >
                {Icon && <Icon className={cn('h-3.5 w-3.5 mr-1.5', isSelected && domain.color)} />}
                {domain.label}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Selected Domains Description */}
      {value.length > 0 && (
        <div className="p-3 rounded-lg bg-lxd-dark-bg/30 border border-lxd-dark-border">
          <p className="text-xs text-muted-foreground mb-2">Selected domains target:</p>
          <div className="space-y-1">
            {value.map((domainValue) => {
              const domain = LEARNING_DOMAIN_CATALOG.find((d) => d.value === domainValue);
              if (!domain) return null;

              return (
                <div key={domainValue} className="flex items-center gap-2 text-sm">
                  <span className={cn('font-medium', domain.color)}>{domain.label}:</span>
                  <span className="text-muted-foreground">{domain.description}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
