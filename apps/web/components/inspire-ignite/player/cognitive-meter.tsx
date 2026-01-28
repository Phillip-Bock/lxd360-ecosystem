'use client';

import { AlertTriangle, Brain, Coffee, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type CognitiveLevel = 'low' | 'optimal' | 'high' | 'overload';

interface CognitiveMeterProps {
  cognitiveLoadIndex: number;
  cognitiveLoadLevel: CognitiveLevel;
  engagementScore: number;
  attentionScore: number;
  showDetails?: boolean;
  compact?: boolean;
}

const LEVEL_CONFIG: Record<
  CognitiveLevel,
  {
    color: string;
    bgColor: string;
    borderColor: string;
    icon: typeof Brain;
    label: string;
    message: string;
  }
> = {
  low: {
    color: 'text-brand-blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: Zap,
    label: 'Underload',
    message: 'Ready for more challenge',
  },
  optimal: {
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: Brain,
    label: 'Optimal',
    message: 'Perfect learning zone',
  },
  high: {
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: AlertTriangle,
    label: 'Elevated',
    message: 'Consider slowing down',
  },
  overload: {
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: Coffee,
    label: 'Overload',
    message: 'Time for a break',
  },
};

export function CognitiveMeter({
  cognitiveLoadIndex,
  cognitiveLoadLevel,
  engagementScore,
  attentionScore,
  showDetails = false,
  compact = false,
}: CognitiveMeterProps): React.JSX.Element {
  const [animatedCLI, setAnimatedCLI] = useState(0);
  const animatedCLIRef = useRef(0);
  const config = LEVEL_CONFIG[cognitiveLoadLevel];
  const Icon = config.icon;

  // Animate CLI changes
  useEffect(() => {
    const duration = 500;
    const startTime = Date.now();
    const startValue = animatedCLIRef.current;

    const animate = (): void => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3; // ease-out cubic
      const current = startValue + (cognitiveLoadIndex - startValue) * eased;
      const rounded = Math.round(current);

      setAnimatedCLI(rounded);
      animatedCLIRef.current = rounded;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [cognitiveLoadIndex]);

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor} ${config.borderColor} border`}
      >
        <Icon className={`w-4 h-4 ${config.color}`} />
        <span className={`text-sm font-semibold ${config.color}`}>{animatedCLI}</span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border ${config.borderColor} ${config.bgColor} p-4 transition-colors duration-300`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg bg-lxd-light-card shadow-sm`}>
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-lxd-text-dark-heading">Cognitive Load</h3>
            <p className={`text-xs ${config.color}`}>{config.label}</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-2xl font-bold ${config.color}`}>{animatedCLI}</span>
          <span className="text-xs text-lxd-text-dark-muted ml-1">/ 100</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-lxd-light-card rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full transition-all duration-500 rounded-full`}
          style={{
            width: `${animatedCLI}%`,
            backgroundColor:
              cognitiveLoadLevel === 'low'
                ? 'var(--info)'
                : cognitiveLoadLevel === 'optimal'
                  ? 'var(--success)'
                  : cognitiveLoadLevel === 'high'
                    ? 'var(--warning)'
                    : 'var(--error)',
          }}
        />
      </div>

      <p className="text-xs text-lxd-text-dark-body mt-2">{config.message}</p>

      {showDetails && (
        <div className="mt-4 pt-3 border-t border-lxd-light-border/50 grid grid-cols-2 gap-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-lxd-text-dark-muted">Engagement</span>
              <span className="font-medium">{engagementScore}%</span>
            </div>
            <div className="h-1.5 bg-lxd-light-card rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${engagementScore}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-lxd-text-dark-muted">Attention</span>
              <span className="font-medium">{attentionScore}%</span>
            </div>
            <div className="h-1.5 bg-lxd-light-card rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-secondary rounded-full transition-all duration-300"
                style={{ width: `${attentionScore}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
