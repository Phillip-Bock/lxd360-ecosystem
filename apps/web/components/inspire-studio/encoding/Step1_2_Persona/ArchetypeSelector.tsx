'use client';

import {
  Briefcase,
  Building2,
  Crown,
  Microscope,
  Sparkles,
  User,
  UserPlus,
  Users,
} from 'lucide-react';
import type React from 'react';
import { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import type { LearnerArchetype } from '@/schemas/inspire';
import { ARCHETYPE_CATALOG, type ArchetypeOption } from './types';

// ============================================================================
// ICON MAPPING
// ============================================================================

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'user-plus': UserPlus,
  user: User,
  users: Users,
  'building-2': Building2,
  crown: Crown,
  microscope: Microscope,
  briefcase: Briefcase,
  sparkles: Sparkles,
};

// ============================================================================
// COMPONENT
// ============================================================================

interface ArchetypeSelectorProps {
  value: LearnerArchetype;
  onChange: (archetype: LearnerArchetype) => void;
  onArchetypeSelect?: (option: ArchetypeOption) => void;
  className?: string;
}

/**
 * ArchetypeSelector - Visual card selector for learner archetypes
 */
export function ArchetypeSelector({
  value,
  onChange,
  onArchetypeSelect,
  className,
}: ArchetypeSelectorProps) {
  const selectedArchetype = useMemo(() => ARCHETYPE_CATALOG.find((a) => a.id === value), [value]);

  const handleChange = (archetypeId: string) => {
    const archetype = archetypeId as LearnerArchetype;
    onChange(archetype);

    const option = ARCHETYPE_CATALOG.find((a) => a.id === archetype);
    if (option && onArchetypeSelect) {
      onArchetypeSelect(option);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <Label>Learner Archetype *</Label>
      <RadioGroup
        value={value}
        onValueChange={handleChange}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {ARCHETYPE_CATALOG.map((archetype) => {
          const Icon = ICON_MAP[archetype.icon];
          const isSelected = value === archetype.id;

          return (
            <div key={archetype.id} className="relative">
              <RadioGroupItem
                value={archetype.id}
                id={`archetype-${archetype.id}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`archetype-${archetype.id}`}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all',
                  'bg-lxd-dark-surface border-lxd-dark-border',
                  'hover:border-lxd-purple/50 hover:bg-lxd-dark-bg/50',
                  isSelected && 'border-lxd-purple bg-lxd-purple/10',
                )}
              >
                {Icon && (
                  <Icon
                    className={cn(
                      'h-8 w-8 transition-colors',
                      isSelected ? 'text-lxd-purple' : 'text-muted-foreground',
                    )}
                  />
                )}
                <span
                  className={cn('text-sm font-medium text-center', isSelected && 'text-lxd-purple')}
                >
                  {archetype.name}
                </span>
              </Label>
            </div>
          );
        })}
      </RadioGroup>

      {selectedArchetype && (
        <p className="text-sm text-muted-foreground">{selectedArchetype.description}</p>
      )}
    </div>
  );
}
