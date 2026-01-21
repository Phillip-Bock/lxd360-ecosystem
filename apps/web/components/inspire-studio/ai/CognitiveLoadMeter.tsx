'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Brain,
  CheckCircle,
  Info,
  Minus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface CognitiveLoadMeterProps {
  value: number; // 0-100
  target?: number; // Target value (default 60)
  showLabel?: boolean;
  showTips?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'horizontal' | 'circular' | 'compact';
  className?: string;
}

// Load level configuration
const LOAD_LEVELS = {
  low: {
    range: [0, 40],
    label: 'Low',
    color: '#22c55e',
    icon: CheckCircle,
    description: 'Good cognitive headroom - consider adding depth',
    tips: [
      'Add more interactive elements',
      'Include additional examples',
      'Consider deeper explanations',
      'Add practice activities',
    ],
  },
  optimal: {
    range: [41, 60],
    label: 'Optimal',
    color: '#3b82f6',
    icon: Brain,
    description: 'Perfect balance for effective learning',
    tips: [
      'Content is well-balanced',
      'Learners can absorb information effectively',
      'Maintain this level throughout',
      'Good mix of complexity and clarity',
    ],
  },
  moderate: {
    range: [61, 75],
    label: 'Moderate',
    color: '#f59e0b',
    icon: Info,
    description: 'Approaching cognitive limits - monitor carefully',
    tips: [
      'Consider breaking into smaller sections',
      'Add more visual aids',
      'Reduce text density',
      'Include micro-breaks or pauses',
    ],
  },
  high: {
    range: [76, 90],
    label: 'High',
    color: '#f97316',
    icon: AlertTriangle,
    description: 'May overwhelm learners - simplification recommended',
    tips: [
      'Break content into smaller chunks',
      'Remove non-essential information',
      'Simplify language and sentences',
      'Add progressive disclosure',
    ],
  },
  overload: {
    range: [91, 100],
    label: 'Overload',
    color: '#ef4444',
    icon: AlertTriangle,
    description: 'Likely to overwhelm - significant changes needed',
    tips: [
      'Immediately reduce complexity',
      'Split into multiple lessons',
      'Remove redundant content',
      'Focus on essential concepts only',
    ],
  },
};

function getLoadLevel(value: number): typeof LOAD_LEVELS.low {
  if (value <= 40) return LOAD_LEVELS.low;
  if (value <= 60) return LOAD_LEVELS.optimal;
  if (value <= 75) return LOAD_LEVELS.moderate;
  if (value <= 90) return LOAD_LEVELS.high;
  return LOAD_LEVELS.overload;
}

export function CognitiveLoadMeter({
  value,
  target = 60,
  showLabel = true,
  showTips = false,
  size = 'md',
  variant = 'horizontal',
  className,
}: CognitiveLoadMeterProps): React.JSX.Element {
  const [animatedValue, setAnimatedValue] = useState(0);
  const level = getLoadLevel(value);
  const LoadIcon = level.icon;

  // Animate value on change
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  const diff = value - target;
  const DiffIcon = diff > 5 ? TrendingUp : diff < -5 ? TrendingDown : Minus;

  const sizeConfig = {
    sm: { height: 'h-1.5', text: 'text-xs', icon: 'w-3 h-3', padding: 'p-2' },
    md: { height: 'h-2', text: 'text-sm', icon: 'w-4 h-4', padding: 'p-3' },
    lg: { height: 'h-3', text: 'text-base', icon: 'w-5 h-5', padding: 'p-4' },
  };

  const config = sizeConfig[size];

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div
          className="w-6 h-6 rounded flex items-center justify-center"
          style={{ backgroundColor: `${level.color}20` }}
        >
          <LoadIcon className="w-3.5 h-3.5" style={{ color: level.color }} />
        </div>
        <span className="text-sm font-medium" style={{ color: level.color }}>
          {level.label}
        </span>
        <span className="text-sm text-muted-foreground">({value}%)</span>
      </div>
    );
  }

  if (variant === 'circular') {
    const circumference = 2 * Math.PI * 36; // radius = 36
    const strokeDashoffset = circumference - (animatedValue / 100) * circumference;

    return (
      <div className={cn('flex flex-col items-center', className)}>
        <div className="relative w-24 h-24">
          {/* Background Circle */}
          <svg aria-hidden="true" className="w-full h-full -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-muted"
            />
            {/* Progress Circle */}
            <motion.circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke={level.color}
              strokeWidth="6"
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ strokeDasharray: circumference }}
            />
            {/* Target Marker */}
            <circle
              cx={40 + 36 * Math.cos(((target / 100) * 360 - 90) * (Math.PI / 180))}
              cy={40 + 36 * Math.sin(((target / 100) * 360 - 90) * (Math.PI / 180))}
              r="3"
              fill="white"
              stroke={level.color}
              strokeWidth="2"
            />
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{value}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>

        {showLabel && (
          <div className="mt-3 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <LoadIcon className="w-4 h-4" style={{ color: level.color }} />
              <span className="font-medium" style={{ color: level.color }}>
                {level.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{level.description}</p>
          </div>
        )}
      </div>
    );
  }

  // Horizontal variant (default)
  return (
    <div className={cn('space-y-2', className)}>
      {/* Header */}
      {showLabel && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className={cn(config.icon, 'text-muted-foreground')} />
            <span className={cn(config.text, 'text-muted-foreground')}>Cognitive Load</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(config.text, 'font-medium')} style={{ color: level.color }}>
              {level.label}
            </span>
            <LoadIcon className={config.icon} style={{ color: level.color }} />
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className={cn('relative bg-muted rounded-full overflow-hidden', config.height)}>
        {/* Target Marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-foreground z-10"
          style={{ left: `${target}%` }}
        />

        {/* Progress */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 rounded-full"
          style={{ backgroundColor: level.color }}
          initial={{ width: 0 }}
          animate={{ width: `${animatedValue}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />

        {/* Zone Markers (subtle) */}
        <div className="absolute inset-0 flex">
          <div className="flex-[40]" />
          <div className="w-px bg-border/30" />
          <div className="flex-[20]" />
          <div className="w-px bg-border/30" />
          <div className="flex-[15]" />
          <div className="w-px bg-border/30" />
          <div className="flex-[15]" />
          <div className="w-px bg-border/30" />
          <div className="flex-[10]" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span>{value}%</span>
          {target && (
            <>
              <span className="mx-1">•</span>
              <span>Target: {target}%</span>
              <DiffIcon
                className={cn(
                  'w-3 h-3 ml-1',
                  diff > 10 && 'text-amber-500',
                  diff > 20 && 'text-brand-error',
                  diff < -10 && 'text-brand-success',
                )}
              />
            </>
          )}
        </div>
        <span>100%</span>
      </div>

      {/* Warning Message */}
      {value > target + 10 && (
        <div className="flex items-start gap-2 p-2 rounded-lg bg-brand-warning/10 border border-amber-500/20">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-brand-warning">
            Content may overwhelm learners. Consider simplifying or breaking into smaller chunks.
          </p>
        </div>
      )}

      {/* Tips */}
      {showTips && (
        <div
          className="rounded-lg p-3 border"
          style={{
            backgroundColor: `${level.color}10`,
            borderColor: `${level.color}20`,
          }}
        >
          <h4 className="text-sm font-medium text-foreground mb-2">Recommendations</h4>
          <ul className="space-y-1">
            {level.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span style={{ color: level.color }}>•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Helper function to calculate cognitive load from content
export function calculateCognitiveLoad(content: {
  wordCount: number;
  imageCount: number;
  videoCount: number;
  interactionCount: number;
  conceptCount: number;
  technicality: 'low' | 'medium' | 'high';
}): number {
  const { wordCount, imageCount, videoCount, interactionCount, conceptCount, technicality } =
    content;

  // Base load from word count (0-30 points)
  const wordLoad = Math.min(30, (wordCount / 500) * 20);

  // Visual load (0-20 points) - images reduce load, too many increase it
  const imageOptimal = 3;
  const imageLoad = Math.abs(imageCount - imageOptimal) * 3;

  // Interaction load (0-15 points)
  const interactionLoad = Math.min(15, interactionCount * 3);

  // Concept density (0-20 points)
  const conceptLoad = conceptCount * 4;

  // Technicality multiplier
  const techMultiplier = { low: 0.8, medium: 1.0, high: 1.3 }[technicality];

  // Video adds moderate load
  const videoLoad = videoCount * 8;

  const total = (wordLoad + imageLoad + interactionLoad + conceptLoad + videoLoad) * techMultiplier;

  return Math.min(100, Math.max(0, Math.round(total)));
}

export { LOAD_LEVELS, getLoadLevel };
export type { CognitiveLoadMeterProps };
