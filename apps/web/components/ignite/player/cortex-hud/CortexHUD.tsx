'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Brain, ChevronDown, ChevronUp, Clock, Target, Zap } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface CortexHUDProps {
  /** Current skill mastery percentage (0-100) */
  skillMastery?: number;
  /** Cognitive load level (0-100) */
  cognitiveLoad?: number;
  /** Current engagement score (0-100) */
  engagementScore?: number;
  /** Time spent on current content (seconds) */
  timeSpent?: number;
  /** Recommended time for break (seconds remaining, null if not needed) */
  timeToBreak?: number | null;
  /** Current learning state */
  learningState?: 'struggling' | 'engaged' | 'mastering' | 'ready-to-challenge';
  /** AI confidence in current recommendation (0-1) */
  aiConfidence?: number;
  /** Number of xAPI statements sent this session */
  xapiStatementCount?: number;
  /** Whether the HUD is expanded */
  defaultExpanded?: boolean;
  /** Called when adaptive intervention is triggered */
  onRequestIntervention?: () => void;
  /** Additional class names */
  className?: string;
}

export type LearningState = 'struggling' | 'engaged' | 'mastering' | 'ready-to-challenge';

// ============================================================================
// CONSTANTS
// ============================================================================

const LEARNING_STATE_CONFIG: Record<
  LearningState,
  { label: string; color: string; icon: string; description: string }
> = {
  struggling: {
    label: 'Struggling',
    color: 'text-orange-400',
    icon: '⚠️',
    description: 'You may benefit from a different approach',
  },
  engaged: {
    label: 'Engaged',
    color: 'text-emerald-400',
    icon: '✨',
    description: 'You are on track',
  },
  mastering: {
    label: 'Mastering',
    color: 'text-cyan-400',
    icon: '🎯',
    description: 'Building strong knowledge',
  },
  'ready-to-challenge': {
    label: 'Ready for Challenge',
    color: 'text-purple-400',
    icon: '🚀',
    description: 'Try harder content',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getMasteryColor(mastery: number): string {
  if (mastery >= 80) return 'text-emerald-400';
  if (mastery >= 60) return 'text-cyan-400';
  if (mastery >= 40) return 'text-amber-400';
  return 'text-orange-400';
}

function getCognitiveLoadColor(load: number): string {
  if (load <= 40) return 'bg-emerald-500';
  if (load <= 70) return 'bg-amber-500';
  return 'bg-red-500';
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Cortex HUD (Heads-Up Display)
 *
 * Displays real-time learning metrics and adaptive insights during course playback.
 * Features BKT mastery, cognitive load, engagement, and time tracking.
 *
 * Uses Glass Box AI principles - all metrics are explained, not hidden.
 *
 * @example
 * ```tsx
 * <CortexHUD
 *   skillMastery={75}
 *   cognitiveLoad={45}
 *   engagementScore={88}
 *   learningState="engaged"
 *   timeSpent={720}
 * />
 * ```
 */
export function CortexHUD({
  skillMastery = 0,
  cognitiveLoad = 0,
  engagementScore = 0,
  timeSpent = 0,
  timeToBreak = null,
  learningState = 'engaged',
  aiConfidence = 0.85,
  xapiStatementCount = 0,
  defaultExpanded = false,
  onRequestIntervention,
  className,
}: CortexHUDProps): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const stateConfig = LEARNING_STATE_CONFIG[learningState];

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'fixed top-20 left-4 z-40',
        'glass-panel rounded-lg shadow-lg',
        'border border-[var(--hud-border)]',
        className,
      )}
    >
      {/* Collapsed Header - Always visible */}
      <button
        type="button"
        onClick={toggleExpanded}
        className={cn(
          'w-full flex items-center justify-between gap-3 px-4 py-2',
          'hover:bg-white/5 transition-colors rounded-t-lg',
          !isExpanded && 'rounded-b-lg',
        )}
        aria-expanded={isExpanded}
        aria-label="Toggle Cortex HUD"
      >
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-[var(--color-neural-purple)]" aria-hidden="true" />
          <span className="text-xs font-medium text-[var(--hud-text)]">Cortex</span>
        </div>

        {/* Mini metrics when collapsed */}
        {!isExpanded && (
          <div className="flex items-center gap-3">
            <span className={cn('text-xs font-bold tabular-nums', getMasteryColor(skillMastery))}>
              {skillMastery}%
            </span>
            <span className={cn('text-xs', stateConfig.color)}>{stateConfig.icon}</span>
          </div>
        )}

        {isExpanded ? (
          <ChevronUp className="h-3 w-3 text-[var(--hud-text-muted)]" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-3 w-3 text-[var(--hud-text-muted)]" aria-hidden="true" />
        )}
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 space-y-4">
              {/* Learning State Badge */}
              <div className="flex items-center justify-between">
                <span
                  className={cn('text-sm font-medium flex items-center gap-1', stateConfig.color)}
                >
                  <span>{stateConfig.icon}</span>
                  {stateConfig.label}
                </span>
                <span className="text-[10px] text-[var(--hud-text-muted)]">
                  AI Confidence: {Math.round(aiConfidence * 100)}%
                </span>
              </div>

              {/* Skill Mastery Gauge */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-[var(--hud-text-muted)]">
                    <Target className="h-3 w-3" aria-hidden="true" />
                    Skill Mastery
                  </span>
                  <span className={cn('font-bold tabular-nums', getMasteryColor(skillMastery))}>
                    {skillMastery}%
                  </span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${skillMastery}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Cognitive Load Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-[var(--hud-text-muted)]">
                    <Zap className="h-3 w-3" aria-hidden="true" />
                    Cognitive Load
                  </span>
                  <span className="font-medium tabular-nums text-[var(--hud-text)]">
                    {cognitiveLoad}%
                  </span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <motion.div
                    className={cn('h-full rounded-full', getCognitiveLoadColor(cognitiveLoad))}
                    initial={{ width: 0 }}
                    animate={{ width: `${cognitiveLoad}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Engagement & Time Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 rounded bg-black/20 border border-white/5">
                  <div className="flex items-center gap-1 text-[10px] text-[var(--hud-text-muted)] mb-1">
                    <Activity className="h-3 w-3" aria-hidden="true" />
                    Engagement
                  </div>
                  <div className="text-lg font-bold text-emerald-400 tabular-nums">
                    {engagementScore}%
                  </div>
                </div>

                <div className="p-2 rounded bg-black/20 border border-white/5">
                  <div className="flex items-center gap-1 text-[10px] text-[var(--hud-text-muted)] mb-1">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    Time
                  </div>
                  <div className="text-lg font-bold text-cyan-400 tabular-nums">
                    {formatTime(timeSpent)}
                  </div>
                </div>
              </div>

              {/* Break Reminder */}
              {timeToBreak !== null && timeToBreak < 300 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-xs"
                >
                  <span className="text-amber-400">
                    ☕ Break recommended in {formatTime(timeToBreak)}
                  </span>
                </motion.div>
              )}

              {/* xAPI Counter (developer/debug info) */}
              <div className="flex items-center justify-between text-[10px] text-[var(--hud-text-muted)] pt-2 border-t border-white/5">
                <span>📡 xAPI Statements</span>
                <span className="tabular-nums">{xapiStatementCount}</span>
              </div>

              {/* Request Help Button */}
              {learningState === 'struggling' && onRequestIntervention && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRequestIntervention}
                  className="w-full text-xs bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20"
                >
                  🆘 Get Adaptive Help
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default CortexHUD;
