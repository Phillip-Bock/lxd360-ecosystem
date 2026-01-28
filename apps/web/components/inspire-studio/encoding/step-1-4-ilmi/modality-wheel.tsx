'use client';

import { Brain, Eye, FileText, Gamepad2, Hand, MapPin, Users, Volume2 } from 'lucide-react';
import type React from 'react';
import { useMemo } from 'react';
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

interface ModalityWheelProps {
  weights: Record<ModalityType, number>;
  primaryModality?: ModalityType;
  secondaryModality?: ModalityType;
  onModalityClick?: (modality: ModalityType) => void;
  className?: string;
}

/**
 * ModalityWheel - Visual balance indicator for modality distribution
 */
export function ModalityWheel({
  weights,
  primaryModality,
  secondaryModality,
  onModalityClick,
  className,
}: ModalityWheelProps) {
  // Calculate total for percentage display
  const total = useMemo(() => {
    return Object.values(weights).reduce((sum, w) => sum + w, 0) || 1;
  }, [weights]);

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Wheel Container */}
      <div className="relative w-64 h-64">
        {/* Center Circle */}
        <div className="absolute inset-1/4 rounded-full bg-lxd-dark-bg border-2 border-lxd-dark-border flex items-center justify-center z-10">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className="text-lg font-bold text-lxd-cyan">
              {Math.round((Object.values(weights).filter((w) => w > 0).length / 8) * 100)}%
            </p>
          </div>
        </div>

        {/* Modality Segments */}
        {MODALITY_CATALOG.map((modality, index) => {
          const Icon = ICON_MAP[modality.icon];
          const weight = weights[modality.id] || 0;
          const percentage = Math.round((weight / total) * 100);
          const angle = (index / MODALITY_CATALOG.length) * 360;
          const isPrimary = primaryModality === modality.id;
          const isSecondary = secondaryModality === modality.id;

          // Calculate position on the wheel
          const radius = 100; // Distance from center
          const x = Math.cos(((angle - 90) * Math.PI) / 180) * radius;
          const y = Math.sin(((angle - 90) * Math.PI) / 180) * radius;

          return (
            <button
              key={modality.id}
              type="button"
              onClick={() => onModalityClick?.(modality.id)}
              className={cn(
                'absolute w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all',
                'border-2 bg-lxd-dark-surface hover:scale-110',
                isPrimary && 'border-lxd-purple bg-lxd-purple/20 scale-110',
                isSecondary && 'border-lxd-cyan bg-lxd-cyan/20',
                !isPrimary && !isSecondary && 'border-lxd-dark-border',
                weight > 0 ? 'opacity-100' : 'opacity-40',
              )}
              style={{
                left: `calc(50% + ${x}px - 28px)`,
                top: `calc(50% + ${y}px - 28px)`,
              }}
              title={modality.name}
            >
              {Icon && <Icon className={cn('h-5 w-5', modality.color)} />}
              <span className="text-[10px] font-medium mt-0.5">
                {percentage > 0 ? `${percentage}%` : '—'}
              </span>
            </button>
          );
        })}

        {/* Connection Lines for Primary/Secondary */}
        {primaryModality && secondaryModality && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 256 256"
            aria-hidden="true"
          >
            <title>Modality connections</title>
            <line
              x1="128"
              y1="128"
              x2={getModalityPosition(primaryModality).x}
              y2={getModalityPosition(primaryModality).y}
              stroke="var(--lxd-purple)"
              strokeWidth="2"
              strokeDasharray="4"
            />
            <line
              x1="128"
              y1="128"
              x2={getModalityPosition(secondaryModality).x}
              y2={getModalityPosition(secondaryModality).y}
              stroke="var(--lxd-cyan)"
              strokeWidth="2"
              strokeDasharray="4"
            />
          </svg>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {primaryModality && (
          <div className="flex items-center gap-1 text-xs">
            <div className="w-3 h-3 rounded-full bg-lxd-purple" />
            <span>Primary</span>
          </div>
        )}
        {secondaryModality && (
          <div className="flex items-center gap-1 text-xs">
            <div className="w-3 h-3 rounded-full bg-lxd-cyan" />
            <span>Secondary</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function getModalityPosition(modality: ModalityType): { x: number; y: number } {
  const index = MODALITY_CATALOG.findIndex((m) => m.id === modality);
  if (index === -1) return { x: 128, y: 128 };

  const angle = (index / MODALITY_CATALOG.length) * 360;
  const radius = 100;
  const x = 128 + Math.cos(((angle - 90) * Math.PI) / 180) * radius;
  const y = 128 + Math.sin(((angle - 90) * Math.PI) / 180) * radius;

  return { x, y };
}
