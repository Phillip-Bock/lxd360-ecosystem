'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { BloomVerb } from '@/schemas/inspire';
import { BLOOM_TAXONOMY, getVerbLabel } from './types';

// ============================================================================
// COMPONENT
// ============================================================================

interface VerbSelectorProps {
  value: BloomVerb | undefined;
  onChange: (verb: BloomVerb) => void;
  className?: string;
}

/**
 * VerbSelector - Dropdown for Bloom's Taxonomy action verbs
 * Groups verbs by cognitive level
 */
export function VerbSelector({ value, onChange, className }: VerbSelectorProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-sm font-medium">Action Verb (Bloom&apos;s Taxonomy)</Label>

      <Select value={value} onValueChange={(v) => onChange(v as BloomVerb)}>
        <SelectTrigger className="w-full bg-lxd-dark-surface border-lxd-dark-border">
          <SelectValue placeholder="Select an action verb..." />
        </SelectTrigger>
        <SelectContent className="bg-lxd-dark-surface border-lxd-dark-border max-h-80">
          {BLOOM_TAXONOMY.map((category) => (
            <SelectGroup key={category.name}>
              <SelectLabel className={cn('text-xs font-semibold', category.color)}>
                {category.name} (Level {category.level})
              </SelectLabel>
              {category.verbs.map((verb) => (
                <SelectItem key={verb} value={verb} className="pl-6">
                  {getVerbLabel(verb)}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>

      {/* Show category hint when verb selected */}
      {value && (
        <div className="text-xs text-muted-foreground">
          {(() => {
            const category = BLOOM_TAXONOMY.find((c) => c.verbs.includes(value));
            if (!category) return null;
            return (
              <span>
                <span className={category.color}>{category.name}:</span> {category.description}
              </span>
            );
          })()}
        </div>
      )}
    </div>
  );
}
