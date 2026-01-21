'use client';

import {
  Building,
  Cpu,
  Factory,
  GraduationCap,
  HeartPulse,
  Landmark,
  Plane,
  Shield,
  Store,
} from 'lucide-react';
import { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { INDUSTRY_CATALOG, type IndustryId, type IndustryOption } from './types';

// ============================================================================
// ICON MAPPING
// ============================================================================

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'heart-pulse': HeartPulse,
  plane: Plane,
  factory: Factory,
  landmark: Landmark,
  cpu: Cpu,
  store: Store,
  shield: Shield,
  'graduation-cap': GraduationCap,
  building: Building,
};

// ============================================================================
// COMPONENT
// ============================================================================

interface IndustrySelectorProps {
  value: IndustryId | null;
  onChange: (industry: IndustryId) => void;
  onIndustrySelect?: (industryOption: IndustryOption) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * IndustrySelector - Dropdown for selecting target industry
 *
 * Features:
 * - Industry catalog with icons
 * - Descriptions for each industry
 * - Triggers AI baseline suggestions on selection
 */
export function IndustrySelector({
  value,
  onChange,
  onIndustrySelect,
  className,
  disabled = false,
}: IndustrySelectorProps) {
  const selectedIndustry = useMemo(() => INDUSTRY_CATALOG.find((i) => i.id === value), [value]);

  const handleValueChange = (industryId: string) => {
    const industry = industryId as IndustryId;
    onChange(industry);

    const industryOption = INDUSTRY_CATALOG.find((i) => i.id === industry);
    if (industryOption && onIndustrySelect) {
      onIndustrySelect(industryOption);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor="industry-select">Target Industry</Label>
      <Select value={value ?? undefined} onValueChange={handleValueChange} disabled={disabled}>
        <SelectTrigger
          id="industry-select"
          className="w-full h-12 bg-lxd-dark-surface border-lxd-dark-border"
        >
          <SelectValue placeholder="Select an industry...">
            {selectedIndustry && (
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = ICON_MAP[selectedIndustry.icon];
                  return Icon ? <Icon className="h-4 w-4 text-lxd-purple" /> : null;
                })()}
                <span>{selectedIndustry.name}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-lxd-dark-surface border-lxd-dark-border">
          {INDUSTRY_CATALOG.map((industry) => {
            const Icon = ICON_MAP[industry.icon];
            return (
              <SelectItem key={industry.id} value={industry.id} className="py-3 cursor-pointer">
                <div className="flex items-start gap-3">
                  {Icon && <Icon className="h-5 w-5 text-lxd-purple mt-0.5" />}
                  <div className="flex flex-col">
                    <span className="font-medium">{industry.name}</span>
                    <span className="text-xs text-muted-foreground">{industry.description}</span>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {selectedIndustry && (
        <p className="text-sm text-muted-foreground">{selectedIndustry.description}</p>
      )}
    </div>
  );
}
