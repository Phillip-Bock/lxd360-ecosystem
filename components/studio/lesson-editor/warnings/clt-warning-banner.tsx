'use client';

/**
 * CLTWarningBanner - Real-time cognitive load warning banners
 * Displays actionable feedback based on CLT calculations
 */

import {
  AlertTriangle,
  Brain,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Layers,
  Monitor,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type FactorType = 'interactivity' | 'split-attention' | 'density' | 'multimedia';
type Severity = 'low' | 'medium' | 'high';

interface CLTFactor {
  type: FactorType;
  severity: Severity;
  suggestion: string;
}

interface CLTWarningBannerProps {
  score: number;
  factors: CLTFactor[];
  onDismiss: () => void;
  onLearnMore: () => void;
}

function getFactorIcon(type: FactorType) {
  switch (type) {
    case 'interactivity':
      return <Zap className="h-4 w-4" />;
    case 'split-attention':
      return <Monitor className="h-4 w-4" />;
    case 'density':
      return <Layers className="h-4 w-4" />;
    case 'multimedia':
      return <Sparkles className="h-4 w-4" />;
  }
}

function getFactorLabel(type: FactorType) {
  switch (type) {
    case 'interactivity':
      return 'Interactivity';
    case 'split-attention':
      return 'Split Attention';
    case 'density':
      return 'Content Density';
    case 'multimedia':
      return 'Multimedia Load';
  }
}

function getSeverityColor(severity: Severity) {
  switch (severity) {
    case 'low':
      return 'text-amber-400 bg-amber-500/10';
    case 'medium':
      return 'text-orange-400 bg-orange-500/10';
    case 'high':
      return 'text-red-400 bg-red-500/10';
  }
}

/**
 * CLTWarningBanner - Displays cognitive load warnings with suggestions
 */
export function CLTWarningBanner({
  score,
  factors,
  onDismiss,
  onLearnMore,
}: CLTWarningBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  // Determine warning level
  const getWarningLevel = () => {
    if (score <= 60) return 'optimal';
    if (score <= 80) return 'elevated';
    if (score <= 90) return 'high';
    return 'overload';
  };

  const level = getWarningLevel();

  // handleDismiss must be defined before the useEffect that uses it
  const handleDismiss = useCallback(() => {
    setIsAnimatingOut(true);
    const timeout = setTimeout(() => {
      setIsVisible(false);
      onDismiss();
    }, 300);
    return () => clearTimeout(timeout);
  }, [onDismiss]);

  // Auto-dismiss after 10 seconds for non-critical warnings
  useEffect(() => {
    if (level === 'elevated') {
      const timeout = setTimeout(() => {
        handleDismiss();
      }, 10000);
      return () => clearTimeout(timeout);
    }
  }, [level, handleDismiss]);

  // Don't render for optimal scores
  if (level === 'optimal' || !isVisible) {
    return null;
  }

  const getConfig = () => {
    switch (level) {
      case 'elevated':
        return {
          icon: <Brain className="h-5 w-5" />,
          title: 'Consider simplifying',
          message: 'Cognitive load is elevated - learners may need more time to process',
          bgClass: 'bg-amber-500/10 border-amber-500/30',
          iconClass: 'text-amber-400',
          glowClass: 'shadow-amber-500/20',
        };
      case 'high':
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          title: 'High cognitive load detected',
          message: 'Warning: High cognitive load may impair learning outcomes',
          bgClass: 'bg-orange-500/10 border-orange-500/30',
          iconClass: 'text-orange-400',
          glowClass: 'shadow-orange-500/20',
        };
      case 'overload':
        return {
          icon: <AlertTriangle className="h-5 w-5 animate-pulse" />,
          title: 'Critical: Cognitive overload',
          message: 'Immediate action required - simplify content to prevent learning failure',
          bgClass: 'bg-red-500/10 border-red-500/30',
          iconClass: 'text-red-400',
          glowClass: 'shadow-red-500/20',
        };
      default:
        return {
          icon: <Brain className="h-5 w-5" />,
          title: '',
          message: '',
          bgClass: '',
          iconClass: '',
          glowClass: '',
        };
    }
  };

  const config = getConfig();

  return (
    <div
      className={cn(
        'fixed top-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl',
        'transition-all duration-300 ease-out',
        isAnimatingOut ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0',
      )}
    >
      <div
        className={cn(
          'rounded-lg border backdrop-blur-xl shadow-lg',
          config.bgClass,
          config.glowClass,
        )}
      >
        {/* Main Banner */}
        <div className="px-4 py-3 flex items-center gap-3">
          {/* Icon */}
          <div className={cn('shrink-0', config.iconClass)}>{config.icon}</div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn('font-semibold text-sm', config.iconClass)}>{config.title}</span>
              <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-sm">
                {score}%
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{config.message}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {factors.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Hide
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Details
                  </>
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-primary"
              onClick={onLearnMore}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Learn
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-zinc-500 hover:text-white"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Expanded Suggestions */}
        {isExpanded && factors.length > 0 && (
          <div className="px-4 pb-3 pt-1 border-t border-white/5">
            <div className="text-[10px] uppercase text-zinc-500 mb-2">
              Suggestions to reduce load
            </div>
            <div className="space-y-2">
              {factors.map((factor, idx) => (
                <div
                  key={`${factor.type}-${idx}`}
                  className={cn(
                    'flex items-start gap-2 p-2 rounded-sm text-xs',
                    getSeverityColor(factor.severity),
                  )}
                >
                  <div className="shrink-0 mt-0.5">{getFactorIcon(factor.type)}</div>
                  <div className="flex-1">
                    <div className="font-medium">{getFactorLabel(factor.type)}</div>
                    <div className="text-zinc-400 mt-0.5">{factor.suggestion}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CLTWarningBanner;
