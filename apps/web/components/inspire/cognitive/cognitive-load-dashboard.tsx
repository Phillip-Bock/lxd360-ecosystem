'use client';

import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import {
  getPaasDescription,
  interpretCognitiveLoad,
  LOAD_THRESHOLDS,
} from '@/lib/inspire/engine/cognitive-load-engine';
import type {
  CognitiveLoadMetrics,
  CognitiveLoadRecommendation,
} from '@/lib/inspire/types/inspire-types';

import { useAccessibility, useReducedMotion } from '../accessibility/accessibility-provider';

// ============================================================================
// SECTION 1: COMPONENT PROPS & TYPES
// ============================================================================

/**
 * Props for the CognitiveLoadDashboard component
 */
interface CognitiveLoadDashboardProps {
  /** Current cognitive load metrics */
  metrics: CognitiveLoadMetrics;

  /** Whether the dashboard is in compact mode (for sidebars) */
  compact?: boolean;

  /** Whether to show detailed recommendations */
  showRecommendations?: boolean;

  /** Callback when an auto-fix is applied */
  onAutoFix?: (fixId: string) => void;

  /** Callback when user dismisses a recommendation */
  onDismissRecommendation?: (id: string) => void;

  /** Custom class name */
  className?: string;

  /** Whether the dashboard is loading new data */
  isLoading?: boolean;
}

/**
 * Priority colors for recommendations
 * Designed for accessibility with sufficient contrast
 */
const PRIORITY_COLORS = {
  critical: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    border: 'border-brand-error',
    text: 'text-red-800 dark:text-red-200',
    icon: '🚨',
  },
  high: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    border: 'border-orange-500',
    text: 'text-orange-800 dark:text-orange-200',
    icon: '⚠️',
  },
  medium: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    border: 'border-brand-warning',
    text: 'text-yellow-800 dark:text-yellow-200',
    icon: '💡',
  },
  low: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    border: 'border-brand-primary',
    text: 'text-blue-800 dark:text-blue-200',
    icon: '📝',
  },
};

// ============================================================================
// SECTION 2: SUB-COMPONENTS
// ============================================================================

/**
 * Individual Load Gauge Component
 * Displays a circular gauge for a single load type
 *
 * Why circular gauges?
 * - Quick visual comprehension (gestalt perception)
 * - Clear proportion representation
 * - Intuitive "filling up" metaphor for load
 */
interface LoadGaugeProps {
  /** Label for the gauge */
  label: string;

  /** Current value (0-100) */
  value: number;

  /** Description of what this load type means */
  description: string;

  /** Color theme */
  color: {
    primary: string; // Tailwind color class
    secondary: string; // Background color class
    text: string; // Text color class
  };

  /** Whether to show animation */
  animated?: boolean;

  /** Size variant */
  size?: 'sm' | 'md' | 'lg';

  /** Whether this load type should be minimized (like extraneous) */
  minimizeTarget?: boolean;
}

function LoadGauge({
  label,
  value,
  description,
  color,
  animated = true,
  size = 'md',
  minimizeTarget = false,
}: LoadGaugeProps): React.JSX.Element {
  const reducedMotion = useReducedMotion();
  const shouldAnimate = animated && !reducedMotion;

  // Size configurations
  const sizes = {
    sm: { container: 'w-20 h-20', text: 'text-sm', stroke: 6 },
    md: { container: 'w-28 h-28', text: 'text-base', stroke: 8 },
    lg: { container: 'w-36 h-36', text: 'text-lg', stroke: 10 },
  };

  const sizeConfig = sizes[size];

  // Calculate SVG circle properties
  // Using a circle with strokeDasharray/strokeDashoffset for the gauge
  const radius = 45; // Circle radius (viewBox is 100x100)
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  // Determine if value is concerning based on type
  const isHigh = value > LOAD_THRESHOLDS.HIGH;
  const isOptimal = value >= LOAD_THRESHOLDS.OPTIMAL_MIN && value <= LOAD_THRESHOLDS.OPTIMAL_MAX;
  const isLow = value < LOAD_THRESHOLDS.TOO_LOW;

  // For extraneous load, lower is better, so invert the logic
  const statusColor = minimizeTarget
    ? value > 30
      ? 'text-brand-error'
      : value > 15
        ? 'text-yellow-500'
        : 'text-brand-success'
    : isHigh
      ? 'text-brand-error'
      : isOptimal
        ? 'text-brand-success'
        : isLow
          ? 'text-brand-blue'
          : 'text-yellow-500';

  return (
    <div
      className="flex flex-col items-center gap-2"
      role="img"
      aria-label={`${label}: ${value}%. ${description}`}
    >
      {/* Circular Gauge */}
      <div className={`relative ${sizeConfig.container}`}>
        <svg
          viewBox="0 0 100 100"
          className="transform -rotate-90 w-full h-full"
          aria-hidden="true"
        >
          <title>{`${label} gauge showing ${Math.round(value)}%`}</title>
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={sizeConfig.stroke}
            className={`${color.secondary} opacity-20`}
          />

          {/* Foreground (progress) circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={sizeConfig.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${color.primary} ${
              shouldAnimate ? 'transition-all duration-700 ease-out' : ''
            }`}
          />
        </svg>

        {/* Center value display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${sizeConfig.text} ${statusColor}`} aria-hidden="true">
            {Math.round(value)}%
          </span>
        </div>
      </div>

      {/* Label */}
      <div className="text-center">
        <p className={`font-semibold ${color.text} ${sizeConfig.text}`}>{label}</p>
        <p className="text-xs text-brand-muted dark:text-lxd-muted max-w-[120px]">{description}</p>
        {minimizeTarget && (
          <span className="text-xs text-brand-muted italic">(aim to minimize)</span>
        )}
      </div>
    </div>
  );
}

/**
 * Total Load Bar Component
 * Horizontal bar showing combined load with threshold markers
 *
 * Why a bar instead of gauge for total?
 * - Shows proportion against thresholds clearly
 * - Easier to see "danger zones"
 * - Complements the circular gauges visually
 */
interface TotalLoadBarProps {
  /** Total load value (0-100+) */
  total: number;

  /** Intrinsic portion */
  intrinsic: number;

  /** Extraneous portion */
  extraneous: number;

  /** Germane portion */
  germane: number;
}

function TotalLoadBar({
  total,
  intrinsic,
  extraneous,
  germane,
}: TotalLoadBarProps): React.JSX.Element {
  useAccessibility();
  const interpretation = interpretCognitiveLoad(total);

  // Calculate widths (capped at 100% for display)
  const displayTotal = Math.min(100, total);

  return (
    <div className="w-full space-y-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <span className="font-semibold text-brand-secondary dark:text-brand-secondary">
          Total Cognitive Load
        </span>
        <span className="font-bold text-lg" style={{ color: interpretation.color }}>
          {Math.round(total)}%{total > 100 && ' ⚠️'}
        </span>
      </div>

      {/* Bar with threshold markers */}
      <div className="relative h-6 bg-gray-200 dark:bg-brand-surface-hover rounded-full overflow-visible">
        {/* Threshold markers */}
        <div
          className="absolute h-full w-0.5 bg-blue-400 z-10"
          style={{ left: `${LOAD_THRESHOLDS.TOO_LOW}%` }}
          title="Too Low Threshold"
        />
        <div
          className="absolute h-full w-0.5 bg-green-400 z-10"
          style={{ left: `${LOAD_THRESHOLDS.OPTIMAL_MIN}%` }}
          title="Optimal Zone Start"
        />
        <div
          className="absolute h-full w-0.5 bg-green-400 z-10"
          style={{ left: `${LOAD_THRESHOLDS.OPTIMAL_MAX}%` }}
          title="Optimal Zone End"
        />
        <div
          className="absolute h-full w-0.5 bg-yellow-400 z-10"
          style={{ left: `${LOAD_THRESHOLDS.HIGH}%` }}
          title="High Threshold"
        />
        <div
          className="absolute h-full w-0.5 bg-red-400 z-10"
          style={{ left: `${LOAD_THRESHOLDS.CRITICAL}%` }}
          title="Critical Threshold"
        />

        {/* Stacked load portions */}
        <div
          className="absolute h-full rounded-full overflow-hidden"
          style={{ width: `${displayTotal}%` }}
        >
          {/* Intrinsic (blue) */}
          <div
            className="absolute h-full bg-brand-primary"
            style={{ width: `${(intrinsic / displayTotal) * 100}%`, left: 0 }}
          />
          {/* Extraneous (red) */}
          <div
            className="absolute h-full bg-brand-error"
            style={{
              width: `${(extraneous / displayTotal) * 100}%`,
              left: `${(intrinsic / displayTotal) * 100}%`,
            }}
          />
        </div>

        {/* Germane indicator (shown above, different style) */}
        <div
          className="absolute -top-1 h-2 bg-brand-success rounded-full"
          style={{
            width: `${Math.min(germane, 100)}%`,
            opacity: 0.7,
          }}
          title={`Germane Load: ${germane}%`}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-brand-secondary dark:text-lxd-muted">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-brand-primary rounded-sm" />
          Intrinsic
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-brand-error rounded-sm" />
          Extraneous
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-brand-success rounded-sm opacity-70" />
          Germane
        </span>
      </div>

      {/* Status message */}
      <p
        className="text-sm p-2 rounded"
        style={{
          backgroundColor: `${interpretation.color}20`,
          color: interpretation.color,
        }}
      >
        {interpretation.description}
      </p>
    </div>
  );
}

/**
 * Recommendation Card Component
 * Displays a single recommendation with action options
 */
interface RecommendationCardProps {
  recommendation: CognitiveLoadRecommendation;
  onAutoFix?: (fixId: string) => void;
  onDismiss?: (id: string) => void;
}

function RecommendationCard({
  recommendation,
  onAutoFix,
  onDismiss,
}: RecommendationCardProps): React.JSX.Element {
  const colors = PRIORITY_COLORS[recommendation.priority];

  return (
    <article
      className={`
        p-4 rounded-lg border-l-4
        ${colors.bg} ${colors.border}
        transition-all duration-200 hover:shadow-md
      `}
      aria-label={`${recommendation.priority} priority recommendation`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span aria-hidden="true">{colors.icon}</span>
          <span className={`font-semibold ${colors.text} capitalize`}>
            {recommendation.priority} Priority
          </span>
          <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-brand-surface-hover rounded-full">
            {recommendation.loadType}
          </span>
        </div>

        {/* Expected impact badge */}
        <span
          className={`
            text-xs font-medium px-2 py-1 rounded
            ${
              recommendation.expectedImpact < 0
                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
            }
          `}
        >
          {recommendation.expectedImpact > 0 ? '+' : ''}
          {recommendation.expectedImpact}% load
        </span>
      </div>

      {/* Recommendation text */}
      <p className={`mt-2 ${colors.text}`}>{recommendation.recommendation}</p>

      {/* Action text */}
      <p className="mt-2 text-sm text-brand-secondary dark:text-lxd-muted">
        <strong>Action:</strong> {recommendation.action}
      </p>

      {/* Action buttons */}
      <div className="mt-3 flex gap-2">
        {recommendation.autoFixAvailable && recommendation.autoFixId && (
          <button
            type="button"
            onClick={() => {
              if (recommendation.autoFixId) {
                onAutoFix?.(recommendation.autoFixId);
              }
            }}
            className="
              px-3 py-1.5 text-sm font-medium
              bg-brand-success text-brand-primary rounded-md
              hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2
              transition-colors duration-200
            "
          >
            🔧 Auto-Fix
          </button>
        )}

        <button
          type="button"
          onClick={() => onDismiss?.(recommendation.id)}
          className="
            px-3 py-1.5 text-sm font-medium
            bg-gray-200 text-brand-secondary rounded-md
            hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
            dark:bg-brand-surface-hover dark:text-brand-secondary dark:hover:bg-gray-600
            transition-colors duration-200
          "
        >
          Dismiss
        </button>
      </div>
    </article>
  );
}

/**
 * NASA-TLX and Paas Score Display
 * Shows predictive workload scores
 */
interface WorkloadScoresProps {
  nasaTlx: number;
  paas: number;
}

function WorkloadScores({ nasaTlx, paas }: WorkloadScoresProps): React.JSX.Element {
  const paasDescription = getPaasDescription(paas);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* NASA-TLX Score */}
      <div className="p-4 bg-brand-page dark:bg-brand-surface rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl" aria-hidden="true">
            📊
          </span>
          <span className="font-semibold text-brand-secondary dark:text-brand-secondary">
            NASA-TLX Prediction
          </span>
        </div>
        <div className="text-3xl font-bold text-brand-primary dark:text-brand-primary">
          {Math.round(nasaTlx)}
          <span className="text-lg text-brand-muted">/100</span>
        </div>
        <p className="text-xs text-brand-muted dark:text-lxd-muted mt-1">
          Predicted workload score based on multiple dimensions
        </p>
      </div>

      {/* Paas Scale Score */}
      <div className="p-4 bg-brand-page dark:bg-brand-surface rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl" aria-hidden="true">
            🧠
          </span>
          <span className="font-semibold text-brand-secondary dark:text-brand-secondary">
            Paas Scale Estimate
          </span>
        </div>
        <div className="text-3xl font-bold text-brand-primary dark:text-brand-primary">
          {paas}
          <span className="text-lg text-brand-muted">/9</span>
        </div>
        <p className="text-xs text-brand-muted dark:text-lxd-muted mt-1">{paasDescription}</p>
      </div>
    </div>
  );
}

// ============================================================================
// SECTION 3: MAIN DASHBOARD COMPONENT
// ============================================================================

/**
 * Cognitive Load Dashboard
 *
 * The main dashboard component that brings together all CLT metrics
 * in a unified, accessible interface.
 *
 * @example
 * ```tsx
 * <CognitiveLoadDashboard
 *   metrics={currentMetrics}
 *   showRecommendations={true}
 *   onAutoFix={(fixId) => applyFix(fixId)}
 * />
 * ```
 */
export function CognitiveLoadDashboard({
  metrics,
  compact = false,
  showRecommendations = true,
  onAutoFix,
  onDismissRecommendation,
  className = '',
  isLoading = false,
}: CognitiveLoadDashboardProps): React.JSX.Element {
  useAccessibility(); // Accessed via useAccessibility hook
  const [expandedRecommendations, setExpandedRecommendations] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Filter out dismissed recommendations
  const visibleRecommendations = useMemo(
    () => metrics.recommendations.filter((r) => !dismissedIds.has(r.id)),
    [metrics.recommendations, dismissedIds],
  );

  // Handle dismiss
  const handleDismiss = useCallback(
    (id: string) => {
      setDismissedIds((prev) => new Set([...prev, id]));
      onDismissRecommendation?.(id);
    },
    [onDismissRecommendation],
  );

  // Loading state
  if (isLoading) {
    return (
      <output
        className={`
          p-6 bg-brand-surface dark:bg-brand-page rounded-xl shadow-lg
          flex items-center justify-center min-h-[300px]
          ${className}
        `}
        aria-label="Loading cognitive load analysis"
      >
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-brand-secondary dark:text-lxd-muted">
            Analyzing cognitive load...
          </p>
        </div>
      </output>
    );
  }

  // Compact mode (for sidebars)
  if (compact) {
    return (
      <section
        className={`
          p-4 bg-brand-surface dark:bg-brand-page rounded-lg shadow
          ${className}
        `}
        aria-label="Cognitive Load Summary"
      >
        {/* Mini gauges */}
        <div className="flex justify-around mb-4">
          <div className="text-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                backgroundColor: `${interpretCognitiveLoad(metrics.intrinsicLoad).color}20`,
                color: interpretCognitiveLoad(metrics.intrinsicLoad).color,
              }}
            >
              {Math.round(metrics.intrinsicLoad)}
            </div>
            <span className="text-xs text-brand-muted">Int</span>
          </div>
          <div className="text-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                backgroundColor: metrics.extraneousLoad > 30 ? '#FEE2E2' : '#E5E7EB',
                color: metrics.extraneousLoad > 30 ? '#DC2626' : '#6B7280',
              }}
            >
              {Math.round(metrics.extraneousLoad)}
            </div>
            <span className="text-xs text-brand-muted">Ext</span>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold bg-green-100 text-green-700">
              {Math.round(metrics.germaneLoad)}
            </div>
            <span className="text-xs text-brand-muted">Ger</span>
          </div>
        </div>

        {/* Quick status */}
        <div className="text-center">
          <span
            className="text-lg font-bold"
            style={{ color: interpretCognitiveLoad(metrics.totalLoad).color }}
          >
            Total: {Math.round(metrics.totalLoad)}%
          </span>
          {visibleRecommendations.length > 0 && (
            <p className="text-xs text-yellow-600 mt-1">
              {visibleRecommendations.length} suggestion
              {visibleRecommendations.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </section>
    );
  }

  // Full dashboard
  return (
    <section
      className={`
        p-6 bg-brand-surface dark:bg-brand-page rounded-xl shadow-lg
        space-y-6 ${className}
      `}
      aria-label="Cognitive Load Dashboard"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-brand-primary dark:text-brand-primary flex items-center gap-2">
            <span aria-hidden="true">🧠</span>
            Cognitive Load Analysis
          </h2>
          <p className="text-sm text-brand-secondary dark:text-lxd-muted">
            Real-time analysis based on Cognitive Load Theory
          </p>
        </div>

        <div className="text-xs text-brand-muted dark:text-lxd-muted">
          Updated: {metrics.timestamp.toLocaleTimeString()}
        </div>
      </div>

      {/* Load Gauges */}
      <div className="flex justify-around flex-wrap gap-4">
        <LoadGauge
          label="Intrinsic Load"
          value={metrics.intrinsicLoad}
          description="Content complexity"
          color={{
            primary: 'text-brand-blue',
            secondary: 'text-blue-200',
            text: 'text-blue-700 dark:text-blue-300',
          }}
          size="md"
        />

        <LoadGauge
          label="Extraneous Load"
          value={metrics.extraneousLoad}
          description="Design burden"
          color={{
            primary: 'text-brand-error',
            secondary: 'text-red-200',
            text: 'text-red-700 dark:text-red-300',
          }}
          size="md"
          minimizeTarget={true}
        />

        <LoadGauge
          label="Germane Load"
          value={metrics.germaneLoad}
          description="Productive effort"
          color={{
            primary: 'text-brand-success',
            secondary: 'text-green-200',
            text: 'text-green-700 dark:text-green-300',
          }}
          size="md"
        />
      </div>

      {/* Total Load Bar */}
      <TotalLoadBar
        total={metrics.totalLoad}
        intrinsic={metrics.intrinsicLoad}
        extraneous={metrics.extraneousLoad}
        germane={metrics.germaneLoad}
      />

      {/* NASA-TLX and Paas Scores */}
      <WorkloadScores nasaTlx={metrics.nasaTlxPrediction} paas={metrics.paasScaleEstimate} />

      {/* Recommendations Section */}
      {showRecommendations && visibleRecommendations.length > 0 && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setExpandedRecommendations(!expandedRecommendations)}
            className="
              flex items-center justify-between w-full 
              p-3 bg-brand-surface dark:bg-brand-surface rounded-lg
              hover:bg-gray-200 dark:hover:bg-brand-surface-hover
              transition-colors duration-200
            "
            aria-expanded={expandedRecommendations}
          >
            <span className="font-semibold text-brand-secondary dark:text-brand-secondary">
              💡 Recommendations ({visibleRecommendations.length})
            </span>
            <span className="text-brand-muted">{expandedRecommendations ? '▼' : '▶'}</span>
          </button>

          {expandedRecommendations && (
            <div className="space-y-3">
              {visibleRecommendations.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onAutoFix={onAutoFix}
                  onDismiss={handleDismiss}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* No recommendations state */}
      {showRecommendations && visibleRecommendations.length === 0 && (
        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <span className="text-2xl" aria-hidden="true">
            ✅
          </span>
          <p className="text-green-700 dark:text-green-300 font-medium mt-2">
            Cognitive load is well-optimized!
          </p>
          <p className="text-sm text-green-600 dark:text-brand-success">
            No recommendations at this time.
          </p>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-brand-muted dark:text-lxd-muted border-t pt-4">
        <p>
          <strong>Tip:</strong> Aim to minimize extraneous load (design burden) while keeping total
          load in the optimal zone (40-70%). Higher germane load indicates productive learning
          effort.
        </p>
      </div>
    </section>
  );
}

// ============================================================================
// SECTION 4: UTILITY EXPORTS
// ============================================================================

/**
 * Export sub-components for flexible composition
 */
export { LoadGauge, TotalLoadBar, WorkloadScores, RecommendationCard };

// ============================================================================
// END OF COGNITIVE LOAD DASHBOARD
// ============================================================================
