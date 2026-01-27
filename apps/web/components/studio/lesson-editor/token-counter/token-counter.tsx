'use client';

/**
 * TokenCounter - Display AI token consumption with visual progress
 * Shows usage breakdown and warning states
 */

import { AlertTriangle, ChevronDown, Info, RefreshCw, Sparkles, Zap } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface TokenBreakdown {
  textGen: number;
  imageGen: number;
  tts: number;
  other: number;
}

interface TokenCounterProps {
  used: number;
  limit: number;
  breakdown?: TokenBreakdown;
  onReset?: () => void;
  showBreakdown?: boolean;
  isAdmin?: boolean;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

/**
 * TokenCounter - Compact token usage display with breakdown
 */
export function TokenCounter({
  used,
  limit,
  breakdown,
  onReset,
  showBreakdown = true,
  isAdmin = false,
}: TokenCounterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const percentage = Math.min(100, (used / limit) * 100);
  const remaining = Math.max(0, limit - used);

  // Determine status
  const getStatus = () => {
    if (percentage >= 95) return 'critical';
    if (percentage >= 80) return 'warning';
    if (percentage >= 60) return 'elevated';
    return 'normal';
  };

  const status = getStatus();

  const getStatusConfig = () => {
    switch (status) {
      case 'critical':
        return {
          color: 'text-red-400',
          bgColor: 'bg-red-500',
          borderColor: 'border-red-500/30',
          glowColor: 'shadow-red-500/20',
          icon: <AlertTriangle className="h-3 w-3 animate-pulse" />,
          label: 'Critical',
        };
      case 'warning':
        return {
          color: 'text-amber-400',
          bgColor: 'bg-amber-500',
          borderColor: 'border-amber-500/30',
          glowColor: 'shadow-amber-500/20',
          icon: <AlertTriangle className="h-3 w-3" />,
          label: 'Warning',
        };
      case 'elevated':
        return {
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500',
          borderColor: 'border-yellow-500/30',
          glowColor: '',
          icon: <Info className="h-3 w-3" />,
          label: 'Elevated',
        };
      default:
        return {
          color: 'text-green-400',
          bgColor: 'bg-green-500',
          borderColor: 'border-white/10',
          glowColor: '',
          icon: <Sparkles className="h-3 w-3" />,
          label: 'Normal',
        };
    }
  };

  const config = getStatusConfig();

  // Gradient for progress bar
  const getProgressGradient = () => {
    if (percentage >= 95) return 'from-red-500 to-red-600';
    if (percentage >= 80) return 'from-amber-500 to-red-500';
    if (percentage >= 60) return 'from-yellow-500 to-amber-500';
    if (percentage >= 40) return 'from-green-500 to-yellow-500';
    return 'from-green-400 to-green-500';
  };

  const breakdownItems = breakdown
    ? [
        { label: 'Text Generation', value: breakdown.textGen, icon: <Zap className="h-3 w-3" /> },
        {
          label: 'Image Generation',
          value: breakdown.imageGen,
          icon: <Sparkles className="h-3 w-3" />,
        },
        { label: 'Text-to-Speech', value: breakdown.tts, icon: <Sparkles className="h-3 w-3" /> },
        { label: 'Other', value: breakdown.other, icon: <Info className="h-3 w-3" /> },
      ]
    : [];

  return (
    <TooltipProvider>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all',
                  'bg-zinc-900/80 backdrop-blur-sm hover:bg-zinc-800/80',
                  config.borderColor,
                  status !== 'normal' && config.glowColor && 'shadow-lg',
                )}
              >
                {/* Status Icon */}
                <span className={config.color}>{config.icon}</span>

                {/* Token Count */}
                <div className="flex items-baseline gap-1">
                  <span className={cn('text-sm font-mono font-medium', config.color)}>
                    {formatNumber(used)}
                  </span>
                  <span className="text-xs text-zinc-500">/</span>
                  <span className="text-xs text-zinc-500 font-mono">{formatNumber(limit)}</span>
                </div>

                {/* Mini Progress */}
                <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full bg-linear-to-r transition-all',
                      getProgressGradient(),
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Dropdown Indicator */}
                {showBreakdown && (
                  <ChevronDown
                    className={cn(
                      'h-3 w-3 text-zinc-500 transition-transform',
                      isOpen && 'rotate-180',
                    )}
                  />
                )}
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>
              AI Tokens: {formatNumber(used)} of {formatNumber(limit)} used
            </p>
          </TooltipContent>
        </Tooltip>

        {showBreakdown && (
          <PopoverContent
            className="w-72 p-0 bg-(--studio-surface) border-white/10"
            align="end"
            sideOffset={8}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm text-white">Token Usage</span>
                </div>
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-sm',
                    config.color,
                    status === 'critical' && 'bg-red-500/20',
                    status === 'warning' && 'bg-amber-500/20',
                    status === 'elevated' && 'bg-yellow-500/20',
                    status === 'normal' && 'bg-green-500/20',
                  )}
                >
                  {config.label}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-400">
                    {formatNumber(used)} / {formatNumber(limit)}
                  </span>
                  <span className={config.color}>{percentage.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full bg-linear-to-r transition-all',
                      getProgressGradient(),
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-[10px] text-zinc-500 mt-1">
                  {formatNumber(remaining)} tokens remaining
                </div>
              </div>
            </div>

            {/* Breakdown */}
            {breakdown && (
              <div className="px-4 py-3 space-y-2">
                <div className="text-[10px] uppercase text-zinc-500 mb-2">Usage Breakdown</div>
                {breakdownItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className="text-zinc-500">{item.icon}</span>
                      {item.label}
                    </div>
                    <span className="text-xs font-mono text-white">{formatNumber(item.value)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Reset Button (Admin Only) */}
            {isAdmin && onReset && (
              <div className="px-4 py-3 border-t border-white/10">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-white/10 text-xs"
                  onClick={() => {
                    onReset();
                    setIsOpen(false);
                  }}
                >
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Reset Token Count
                </Button>
              </div>
            )}
          </PopoverContent>
        )}
      </Popover>
    </TooltipProvider>
  );
}

export default TokenCounter;
