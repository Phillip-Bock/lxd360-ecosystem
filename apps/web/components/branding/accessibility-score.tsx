'use client';

import { motion } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Info,
  type LucideIcon,
  Palette,
  Pointer,
  Target,
} from 'lucide-react';
import type * as React from 'react';
import type {
  AccessibilityIssue,
  AccessibilityScore as AccessibilityScoreType,
} from '@/lib/branding/wcag-utils';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface AccessibilityScoreProps {
  score: AccessibilityScoreType;
  onIssueClick?: (issue: AccessibilityIssue) => void;
  className?: string;
}

// ============================================================================
// Sub-Components
// ============================================================================

function CircularProgress({
  value,
  grade,
  size = 160,
}: {
  value: number;
  grade: AccessibilityScoreType['grade'];
  size?: number;
}): React.JSX.Element {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const gradeColors = {
    A: { stroke: '#22c55e', bg: 'bg-green-500/20', text: 'text-green-400' },
    B: { stroke: '#84cc16', bg: 'bg-lime-500/20', text: 'text-lime-400' },
    C: { stroke: '#eab308', bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    D: { stroke: '#f97316', bg: 'bg-orange-500/20', text: 'text-orange-400' },
    F: { stroke: '#ef4444', bg: 'bg-red-500/20', text: 'text-red-400' },
  };

  const colors = gradeColors[grade];

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg aria-hidden="true" width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/5"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="drop-shadow-lg"
          style={{ filter: `drop-shadow(0 0 8px ${colors.stroke}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={cn('text-5xl font-bold', colors.text)}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          {grade}
        </motion.span>
        <span className="text-sm text-muted-foreground font-mono">{Math.round(value)}%</span>
      </div>
    </div>
  );
}

function CategoryBar({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}): React.JSX.Element {
  let barColor = 'bg-red-500';
  if (value >= 90) barColor = 'bg-green-500';
  else if (value >= 70) barColor = 'bg-yellow-500';
  else if (value >= 50) barColor = 'bg-orange-500';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-foreground">{label}</span>
        </div>
        <span className="text-sm font-mono text-muted-foreground">{Math.round(value)}%</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', barColor)}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </div>
    </div>
  );
}

function IssueItem({ issue, onClick }: { issue: AccessibilityIssue; onClick?: () => void }) {
  const icons = {
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };
  const colors = {
    error: 'text-red-400 bg-red-500/10 border-red-500/20',
    warning: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    info: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  };

  const Icon = icons[issue.type];

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-lg border transition-colors hover:bg-white/5',
        colors[issue.type],
      )}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground">{issue.message}</p>
          <p className="text-xs text-muted-foreground mt-1">WCAG {issue.wcagCriteria}</p>
        </div>
      </div>
    </motion.button>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function AccessibilityScore({ score, onIssueClick, className }: AccessibilityScoreProps) {
  const errorCount = score.issues.filter((i) => i.type === 'error').length;
  const warningCount = score.issues.filter((i) => i.type === 'warning').length;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Main score display */}
      <div className="flex flex-col items-center gap-4 p-6 rounded-xl bg-white/5 border border-white/10">
        <CircularProgress value={score.overall} grade={score.grade} />

        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">Accessibility Score</h3>
          <p className="text-sm text-muted-foreground">WCAG 2.2 Compliance Rating</p>
        </div>

        {/* Summary badges */}
        <div className="flex items-center gap-3">
          {errorCount > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
              <AlertCircle className="h-3 w-3" />
              {errorCount} Error{errorCount !== 1 ? 's' : ''}
            </div>
          )}
          {warningCount > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
              <AlertTriangle className="h-3 w-3" />
              {warningCount} Warning{warningCount !== 1 ? 's' : ''}
            </div>
          )}
          {errorCount === 0 && warningCount === 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
              <CheckCircle2 className="h-3 w-3" />
              All Checks Passed
            </div>
          )}
        </div>
      </div>

      {/* Category breakdown */}
      <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10">
        <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Target className="h-4 w-4" />
          Category Breakdown
        </h4>

        <CategoryBar label="Color Contrast" value={score.colorContrast} icon={Palette} />
        <CategoryBar label="Touch Targets" value={score.touchTargets} icon={Pointer} />
        <CategoryBar label="Focus Indicators" value={score.focusIndicators} icon={Eye} />
      </div>

      {/* Issues list */}
      {score.issues.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Issues ({score.issues.length})</h4>
          <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-hide">
            {score.issues.map((issue, index) => (
              <IssueItem key={index} issue={issue} onClick={() => onIssueClick?.(issue)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
