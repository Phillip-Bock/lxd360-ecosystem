'use client';

import {
  Brain,
  Heart,
  Layers,
  type LucideIcon,
  Puzzle,
  Search,
  Sparkles,
  Target,
} from 'lucide-react';

export type INSPIREPhase =
  | 'inquire'
  | 'nurture'
  | 'scaffold'
  | 'practice'
  | 'integrate'
  | 'reflect'
  | 'evolve';

interface PhaseConfig {
  id: INSPIREPhase;
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  description: string;
}

const INSPIRE_PHASES: PhaseConfig[] = [
  {
    id: 'inquire',
    label: 'Inquire',
    icon: Search,
    color: 'text-lxd-blue',
    bgColor: 'bg-lxd-blue',
    description: 'Explore prior knowledge and spark curiosity',
  },
  {
    id: 'nurture',
    label: 'Nurture',
    icon: Heart,
    color: 'text-lxd-purple',
    bgColor: 'bg-lxd-purple',
    description: 'Build foundational understanding',
  },
  {
    id: 'scaffold',
    label: 'Scaffold',
    icon: Layers,
    color: 'text-lxd-success',
    bgColor: 'bg-lxd-success',
    description: 'Provide structured support and guidance',
  },
  {
    id: 'practice',
    label: 'Practice',
    icon: Target,
    color: 'text-lxd-warning',
    bgColor: 'bg-lxd-warning',
    description: 'Apply skills with feedback',
  },
  {
    id: 'integrate',
    label: 'Integrate',
    icon: Puzzle,
    color: 'text-lxd-blue-light',
    bgColor: 'bg-lxd-blue-light',
    description: 'Connect to real-world contexts',
  },
  {
    id: 'reflect',
    label: 'Reflect',
    icon: Brain,
    color: 'text-lxd-purple-dark',
    bgColor: 'bg-lxd-purple-dark',
    description: 'Review and consolidate learning',
  },
  {
    id: 'evolve',
    label: 'Evolve',
    icon: Sparkles,
    color: 'text-lxd-success',
    bgColor: 'bg-lxd-success',
    description: 'Extend and apply to new situations',
  },
];

export interface PhaseIndicatorProps {
  currentPhase: INSPIREPhase;
  progress?: number;
  showAllPhases?: boolean;
  compact?: boolean;
  onPhaseClick?: (phase: INSPIREPhase) => void;
}

export function PhaseIndicator({
  currentPhase,
  progress = 0,
  showAllPhases = false,
  compact = false,
  onPhaseClick,
}: PhaseIndicatorProps): React.JSX.Element | null {
  const currentPhaseConfig = INSPIRE_PHASES.find((p) => p.id === currentPhase);
  const currentPhaseIndex = INSPIRE_PHASES.findIndex((p) => p.id === currentPhase);

  if (!currentPhaseConfig) {
    return null;
  }

  // Compact single-phase indicator
  if (!showAllPhases || compact) {
    const Icon = currentPhaseConfig.icon;

    return (
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${currentPhaseConfig.bgColor}/20 ${currentPhaseConfig.color}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className={`font-bold ${currentPhaseConfig.color}`}>
              {currentPhaseConfig.label}
            </span>
            {progress > 0 && (
              <span className="text-xs text-lxd-text-light-muted">{Math.round(progress)}%</span>
            )}
          </div>
          <p className="text-xs text-lxd-text-light-muted">{currentPhaseConfig.description}</p>
        </div>
      </div>
    );
  }

  // Full phases timeline
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        {INSPIRE_PHASES.map((phase, index) => {
          const Icon = phase.icon;
          const isActive = phase.id === currentPhase;
          const isPast = index < currentPhaseIndex;
          // const _isFuture = index > currentPhaseIndex

          return (
            <div key={phase.id} className="flex flex-col items-center" style={{ flex: 1 }}>
              {/* Phase icon */}
              <button
                type="button"
                onClick={() => onPhaseClick?.(phase.id)}
                disabled={!onPhaseClick}
                className={`relative p-2 rounded-full transition-all ${
                  isActive
                    ? `${phase.bgColor} text-lxd-text-light-heading shadow-lg scale-110`
                    : isPast
                      ? `${phase.bgColor}/30 ${phase.color}`
                      : 'bg-lxd-dark-surface text-lxd-text-light-muted'
                } ${onPhaseClick ? 'cursor-pointer hover:scale-105' : ''}`}
              >
                <Icon className="w-4 h-4" />
                {isActive && progress > 0 && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-lxd-text-light-heading bg-lxd-dark-page px-1 rounded">
                    {Math.round(progress)}%
                  </div>
                )}
              </button>

              {/* Phase label */}
              <span
                className={`mt-2 text-[10px] font-medium text-center ${
                  isActive
                    ? phase.color
                    : isPast
                      ? 'text-lxd-text-light-secondary'
                      : 'text-lxd-text-light-muted'
                }`}
              >
                {phase.label}
              </span>

              {/* Connector line */}
              {index < INSPIRE_PHASES.length - 1 && (
                <div
                  className={`absolute h-0.5 top-[18px] left-[calc(50%+16px)] right-[calc(-50%+16px)] ${
                    isPast ? phase.bgColor : 'bg-lxd-dark-surface'
                  }`}
                  style={{
                    width: 'calc(100% - 32px)',
                    marginLeft: '16px',
                    zIndex: -1,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Current phase description */}
      <div
        className={`text-center p-3 rounded-lg ${currentPhaseConfig.bgColor}/10 border border-${currentPhaseConfig.bgColor}/20`}
      >
        <p className={`text-sm font-medium ${currentPhaseConfig.color}`}>
          {currentPhaseConfig.description}
        </p>
      </div>
    </div>
  );
}

// Export phase utilities
export function getPhaseConfig(phase: INSPIREPhase): PhaseConfig | undefined {
  return INSPIRE_PHASES.find((p) => p.id === phase);
}

export function getAllPhases(): PhaseConfig[] {
  return INSPIRE_PHASES;
}

export function getNextPhase(currentPhase: INSPIREPhase): INSPIREPhase | null {
  const currentIndex = INSPIRE_PHASES.findIndex((p) => p.id === currentPhase);
  if (currentIndex === -1 || currentIndex >= INSPIRE_PHASES.length - 1) {
    return null;
  }
  return INSPIRE_PHASES[currentIndex + 1].id;
}

export function getPreviousPhase(currentPhase: INSPIREPhase): INSPIREPhase | null {
  const currentIndex = INSPIRE_PHASES.findIndex((p) => p.id === currentPhase);
  if (currentIndex <= 0) {
    return null;
  }
  return INSPIRE_PHASES[currentIndex - 1].id;
}
