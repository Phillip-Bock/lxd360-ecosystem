'use client';

/**
 * CognitiveLoadTab - Full ribbon tab for Cognitive Load Theory analysis
 * Uses Leppink's 3-Component Model with NASA-TLX predictions
 */

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Brain,
  CheckCircle,
  Gauge,
  Info,
  Lightbulb,
  Minus,
  RefreshCw,
  Sparkles,
  Target,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  type CognitiveLoadResult,
  type ContentMetrics,
  calculateCognitiveLoad,
  extractMetricsFromContent,
  type InspireStage,
  type Recommendation,
} from '@/lib/cognitive-load';
import { cn } from '@/lib/utils';
import { RibbonGroup } from '../ribbon-group';

interface CognitiveLoadTabProps {
  content?: {
    text?: string;
    blocks?: Array<{ type: string; content?: string }>;
  };
  inspireStage?: InspireStage;
  onRecommendationClick?: (recommendation: Recommendation) => void;
  onOptimize?: () => void;
}

/**
 * CognitiveLoadTab - Ribbon tab component for CLT analysis
 */
export function CognitiveLoadTab({
  content,
  inspireStage = 'scaffold',
  onRecommendationClick,
  onOptimize,
}: CognitiveLoadTabProps) {
  const [result, setResult] = useState<CognitiveLoadResult | null>(null);
  const [metrics, setMetrics] = useState<ContentMetrics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Analyze content on change
  useEffect(() => {
    const timeout = setTimeout(() => {
      const extractedMetrics = extractMetricsFromContent(content || {});
      setMetrics(extractedMetrics);
      const loadResult = calculateCognitiveLoad(extractedMetrics, inspireStage);
      setResult(loadResult);
    }, 100);
    return () => clearTimeout(timeout);
  }, [content, inspireStage]);

  const handleReanalyze = useCallback(() => {
    setIsAnalyzing(true);
    const timeout = setTimeout(() => {
      const extractedMetrics = extractMetricsFromContent(content || {});
      setMetrics(extractedMetrics);
      const loadResult = calculateCognitiveLoad(extractedMetrics, inspireStage);
      setResult(loadResult);
      setIsAnalyzing(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [content, inspireStage]);

  const getLoadColor = (level: CognitiveLoadResult['level']) => {
    switch (level) {
      case 'low':
        return 'text-blue-400';
      case 'optimal':
        return 'text-green-400';
      case 'high':
        return 'text-amber-400';
      case 'overload':
        return 'text-red-400';
    }
  };

  const getLoadBgColor = (level: CognitiveLoadResult['level']) => {
    switch (level) {
      case 'low':
        return 'bg-blue-500';
      case 'optimal':
        return 'bg-green-500';
      case 'high':
        return 'bg-amber-500';
      case 'overload':
        return 'bg-red-500';
    }
  };

  const getTrendIcon = (value: number, optimal: number) => {
    const diff = value - optimal;
    if (Math.abs(diff) < 5) return <Minus className="h-3 w-3 text-zinc-500" />;
    if (diff > 0) return <ArrowUpRight className="h-3 w-3 text-amber-400" />;
    return <ArrowDownRight className="h-3 w-3 text-blue-400" />;
  };

  const getPriorityColor = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'low':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  };

  if (!result) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 text-zinc-400">
        <Brain className="h-5 w-5 animate-pulse" />
        <span className="text-sm">Analyzing cognitive load...</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex items-stretch gap-1 px-2">
        {/* Load Gauge Group */}
        <RibbonGroup label="Load Gauge">
          <div className="flex items-center gap-3 px-2">
            {/* Gauge Icon with Status */}
            <div className="relative">
              <Gauge className={cn('h-10 w-10', getLoadColor(result.level))} />
              {result.level === 'overload' && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                </span>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-32">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-zinc-500 uppercase">Total Load</span>
                <span className={cn('text-sm font-bold', getLoadColor(result.level))}>
                  {result.total}%
                </span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    getLoadBgColor(result.level),
                  )}
                  style={{ width: `${Math.min(100, result.total)}%` }}
                />
              </div>
              <div className="flex justify-between mt-0.5">
                <span className="text-[9px] text-zinc-600">0</span>
                <span className="text-[9px] text-zinc-600">50</span>
                <span className="text-[9px] text-zinc-600">100</span>
              </div>
            </div>

            {/* Status Badge */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    'text-xs font-medium uppercase px-2 py-1 rounded-sm',
                    getLoadColor(result.level),
                    result.level === 'optimal' && 'bg-green-500/20',
                    result.level === 'low' && 'bg-blue-500/20',
                    result.level === 'high' && 'bg-amber-500/20',
                    result.level === 'overload' && 'bg-red-500/20',
                  )}
                >
                  {result.level}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Load ratio: {result.ratio}x optimal capacity</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </RibbonGroup>

        {/* Three Components Group */}
        <RibbonGroup label="Three Components">
          <div className="flex items-center gap-4 px-2">
            {/* Intrinsic */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center cursor-help">
                  <div className="flex items-center gap-1">
                    <span className="text-xl font-bold text-purple-400">{result.intrinsic}</span>
                    {getTrendIcon(result.intrinsic, 30)}
                  </div>
                  <div className="text-[10px] text-zinc-500 uppercase">Intrinsic</div>
                  <Progress value={result.intrinsic} className="h-1 w-12 mt-1 bg-zinc-800" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium">Intrinsic Load</p>
                <p className="text-xs text-zinc-400">
                  Inherent complexity of content. Determined by concept density and element
                  interactivity.
                </p>
              </TooltipContent>
            </Tooltip>

            {/* Extraneous */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center cursor-help">
                  <div className="flex items-center gap-1">
                    <span className="text-xl font-bold text-orange-400">{result.extraneous}</span>
                    {getTrendIcon(result.extraneous, 20)}
                  </div>
                  <div className="text-[10px] text-zinc-500 uppercase">Extraneous</div>
                  <Progress value={result.extraneous} className="h-1 w-12 mt-1 bg-zinc-800" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium">Extraneous Load</p>
                <p className="text-xs text-zinc-400">
                  Unnecessary cognitive burden. Lower is better—reduce distractions.
                </p>
              </TooltipContent>
            </Tooltip>

            {/* Germane */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center cursor-help">
                  <div className="flex items-center gap-1">
                    <span className="text-xl font-bold text-cyan-400">{result.germane}</span>
                    {getTrendIcon(result.germane, 50)}
                  </div>
                  <div className="text-[10px] text-zinc-500 uppercase">Germane</div>
                  <Progress value={result.germane} className="h-1 w-12 mt-1 bg-zinc-800" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium">Germane Load</p>
                <p className="text-xs text-zinc-400">
                  Productive learning effort. Higher is better—schema building.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </RibbonGroup>

        {/* Quick Stats Group */}
        <RibbonGroup label="Quick Stats">
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 px-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-500">Words</span>
              <span className="text-white font-medium">{metrics?.wordCount ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Blocks</span>
              <span className="text-white font-medium">{content?.blocks?.length ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Interactions</span>
              <span className="text-white font-medium">{metrics?.interactionCount ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Duration</span>
              <span className="text-white font-medium">
                ~{Math.ceil(metrics?.estimatedDurationMinutes ?? 0)} min
              </span>
            </div>
          </div>
        </RibbonGroup>

        {/* Recommendations Group */}
        <RibbonGroup label="Recommendations">
          <div className="flex flex-col gap-1 px-2 max-w-xs">
            {result.recommendations.length === 0 ? (
              <div className="flex items-center gap-2 text-green-400 text-xs py-1">
                <CheckCircle className="h-4 w-4" />
                <span>Cognitive load optimized</span>
              </div>
            ) : (
              result.recommendations.slice(0, 2).map((rec) => (
                <Tooltip key={rec.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => onRecommendationClick?.(rec)}
                      className={cn(
                        'flex items-center gap-2 text-xs px-2 py-1 rounded-sm border cursor-pointer',
                        'hover:brightness-110 transition-all text-left',
                        getPriorityColor(rec.priority),
                      )}
                    >
                      {rec.priority === 'high' && <AlertTriangle className="h-3 w-3 shrink-0" />}
                      {rec.priority === 'medium' && <Info className="h-3 w-3 shrink-0" />}
                      {rec.priority === 'low' && <Lightbulb className="h-3 w-3 shrink-0" />}
                      <span className="truncate">{rec.message}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{rec.message}</p>
                    {rec.action && <p className="text-xs text-zinc-400 mt-1">→ {rec.action}</p>}
                  </TooltipContent>
                </Tooltip>
              ))
            )}
            {result.recommendations.length > 2 && (
              <span className="text-[10px] text-zinc-500">
                +{result.recommendations.length - 2} more
              </span>
            )}
          </div>
        </RibbonGroup>

        {/* Actions Group */}
        <RibbonGroup label="Actions">
          <div className="flex flex-col gap-1 px-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs border-white/10"
              onClick={handleReanalyze}
              disabled={isAnalyzing}
            >
              <RefreshCw className={cn('h-3 w-3 mr-1', isAnalyzing && 'animate-spin')} />
              Re-analyze
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs border-primary/50 text-primary"
              onClick={onOptimize}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              AI Optimize
            </Button>
          </div>
        </RibbonGroup>

        {/* INSPIRE Stage */}
        {inspireStage && (
          <RibbonGroup label="INSPIRE Stage">
            <div className="flex items-center gap-2 px-2">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm font-medium text-primary capitalize">{inspireStage}</div>
                <div className="text-[10px] text-zinc-500">Current methodology phase</div>
              </div>
            </div>
          </RibbonGroup>
        )}
      </div>
    </TooltipProvider>
  );
}
