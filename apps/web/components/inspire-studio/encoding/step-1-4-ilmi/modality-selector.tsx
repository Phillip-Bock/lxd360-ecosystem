'use client';

import { Brain, Eye, FileText, Gamepad2, Hand, MapPin, Users, Volume2 } from 'lucide-react';
import type React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import type { ModalityType } from '@/schemas/inspire';
import { MODALITY_CATALOG } from './types';

// ============================================================================
// ICON MAPPING
// ============================================================================

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  eye: Eye,
  'volume-2': Volume2,
  'file-text': FileText,
  hand: Hand,
  users: Users,
  'gamepad-2': Gamepad2,
  brain: Brain,
  'map-pin': MapPin,
};

// ============================================================================
// COMPONENT
// ============================================================================

interface ModalitySelectorProps {
  label: string;
  description: string;
  value: ModalityType | undefined;
  onChange: (modality: ModalityType) => void;
  excludeModality?: ModalityType;
  recommendedModalities?: ModalityType[];
  variant: 'primary' | 'secondary';
  className?: string;
}

/**
 * ModalitySelector - Card-based selector for primary/secondary modality
 */
export function ModalitySelector({
  label,
  description,
  value,
  onChange,
  excludeModality,
  recommendedModalities = [],
  variant,
  className,
}: ModalitySelectorProps) {
  const availableModalities = MODALITY_CATALOG.filter((m) => m.id !== excludeModality);
  const selectedModality = MODALITY_CATALOG.find((m) => m.id === value);

  return (
    <div className={cn('space-y-3', className)}>
      <div>
        <Label className="text-base font-medium">{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <RadioGroup
        value={value ?? ''}
        onValueChange={(v) => onChange(v as ModalityType)}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {availableModalities.map((modality) => {
          const Icon = ICON_MAP[modality.icon];
          const isSelected = value === modality.id;
          const isRecommended = recommendedModalities.includes(modality.id);

          return (
            <div key={modality.id} className="relative">
              <RadioGroupItem
                value={modality.id}
                id={`${variant}-${modality.id}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`${variant}-${modality.id}`}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all',
                  'bg-lxd-dark-surface hover:bg-lxd-dark-bg/50',
                  isSelected && variant === 'primary' && 'border-lxd-purple bg-lxd-purple/10',
                  isSelected && variant === 'secondary' && 'border-lxd-cyan bg-lxd-cyan/10',
                  !isSelected && 'border-lxd-dark-border',
                )}
              >
                {isRecommended && (
                  <Badge className="absolute -top-2 -right-2 text-[10px] bg-lxd-cyan text-black">
                    Recommended
                  </Badge>
                )}
                {Icon && (
                  <Icon
                    className={cn(
                      'h-6 w-6 transition-colors',
                      isSelected ? modality.color : 'text-muted-foreground',
                    )}
                  />
                )}
                <span
                  className={cn(
                    'text-sm font-medium text-center',
                    isSelected && variant === 'primary' && 'text-lxd-purple',
                    isSelected && variant === 'secondary' && 'text-lxd-cyan',
                  )}
                >
                  {modality.name}
                </span>
              </Label>
            </div>
          );
        })}
      </RadioGroup>

      {/* Selected Modality Details */}
      {selectedModality && (
        <Card className="bg-lxd-dark-bg/30 border-lxd-dark-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              {(() => {
                const Icon = ICON_MAP[selectedModality.icon];
                return Icon ? <Icon className={cn('h-4 w-4', selectedModality.color)} /> : null;
              })()}
              {selectedModality.name}
            </CardTitle>
            <CardDescription className="text-xs">{selectedModality.description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-1">
              {selectedModality.examples.map((example) => (
                <Badge key={example} variant="outline" className="text-xs">
                  {example}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
