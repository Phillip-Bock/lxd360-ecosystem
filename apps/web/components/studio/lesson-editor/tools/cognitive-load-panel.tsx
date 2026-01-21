'use client';

import {
  AlertTriangle,
  Brain,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Gauge,
  Info,
  Lightbulb,
  RefreshCw,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  type CognitiveLoadResult,
  type ContentMetrics,
  calculateCognitiveLoad,
  extractMetricsFromContent,
  type InspireStage,
  type Recommendation,
} from '@/lib/cognitive-load';

interface CognitiveLoadPanelProps {
  content?: {
    text?: string;
    blocks?: Array<{ type: string; content?: string }>;
  };
  inspireStage?: InspireStage;
  onRecommendationClick?: (recommendation: Recommendation) => void;
}

/**
 * CognitiveLoadPanel - Real-time cognitive load analysis with
 * NASA-TLX, Paas Scale, and Leppink's 3-Component visualization
 */
export function CognitiveLoadPanel({
  content,
  inspireStage,
  onRecommendationClick,
}: CognitiveLoadPanelProps) {
  const [result, setResult] = useState<CognitiveLoadResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [metrics, setMetrics] = useState<ContentMetrics | null>(null);

  useEffect(() => {
    // Wrap in setTimeout to avoid React 19 sync setState warning
    const timeout = setTimeout(() => {
      setIsAnalyzing(true);
      const extractedMetrics = extractMetricsFromContent(content || {});
      setMetrics(extractedMetrics);

      const loadResult = calculateCognitiveLoad(extractedMetrics, inspireStage);
      setResult(loadResult);
      setIsAnalyzing(false);
    }, 0);

    return () => clearTimeout(timeout);
  }, [content, inspireStage]);

  const analyzeContent = useCallback(() => {
    // Wrap in setTimeout to avoid React 19 sync setState warning
    const timeout = setTimeout(() => {
      setIsAnalyzing(true);
      const extractedMetrics = extractMetricsFromContent(content || {});
      setMetrics(extractedMetrics);

      const loadResult = calculateCognitiveLoad(extractedMetrics, inspireStage);
      setResult(loadResult);
      setIsAnalyzing(false);
    }, 0);

    return () => clearTimeout(timeout);
  }, [content, inspireStage]);

  const getLoadColor = (level: CognitiveLoadResult['level']) => {
    switch (level) {
      case 'low':
        return 'text-blue-400';
      case 'optimal':
        return 'text-green-400';
      case 'high':
        return 'text-yellow-400';
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
        return 'bg-yellow-500';
      case 'overload':
        return 'bg-red-500';
    }
  };

  const getLoadLabel = (level: CognitiveLoadResult['level']) => {
    switch (level) {
      case 'low':
        return 'Low Load';
      case 'optimal':
        return 'Optimal';
      case 'high':
        return 'High Load';
      case 'overload':
        return 'Overload';
    }
  };

  const getPriorityIcon = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'medium':
        return <Info className="h-4 w-4 text-yellow-400" />;
      case 'low':
        return <Lightbulb className="h-4 w-4 text-blue-400" />;
    }
  };

  if (!result) {
    return (
      <div className="flex items-center gap-3 text-zinc-400">
        <Brain className="h-5 w-5 animate-pulse" />
        <span className="text-sm">Analyzing cognitive load...</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Main Load Display */}
        <div className="flex items-center gap-6">
          {/* Gauge Visualization */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Gauge className={`h-8 w-8 ${getLoadColor(result.level)}`} />
              {result.level === 'overload' && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                </span>
              )}
            </div>

            <div className="w-48">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-zinc-500">Cognitive Load Index</span>
                <span className={`text-sm font-medium ${getLoadColor(result.level)}`}>
                  {result.total}%
                </span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getLoadBgColor(result.level)} rounded-full transition-all duration-500`}
                  style={{ width: `${result.total}%` }}
                />
              </div>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={`text-sm font-medium px-2 py-1 rounded-xs ${getLoadColor(result.level)} bg-white/5`}
                >
                  {getLoadLabel(result.level)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Load ratio: {result.ratio}x optimal capacity</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* 3-Component Breakdown */}
          <div className="flex items-center gap-4 px-4 border-l border-white/10">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center cursor-help">
                  <div className="text-xs text-zinc-500">Intrinsic</div>
                  <div className="text-sm font-medium text-purple-400">{result.intrinsic}%</div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium">Intrinsic Load</p>
                <p className="text-xs text-zinc-400">
                  Inherent complexity of the content. Determined by concept density and element
                  interactivity.
                </p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center cursor-help">
                  <div className="text-xs text-zinc-500">Extraneous</div>
                  <div className="text-sm font-medium text-orange-400">{result.extraneous}%</div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium">Extraneous Load</p>
                <p className="text-xs text-zinc-400">
                  Unnecessary cognitive burden from design. Lower is better.
                </p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center cursor-help">
                  <div className="text-xs text-zinc-500">Germane</div>
                  <div className="text-sm font-medium text-cyan-400">{result.germane}%</div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium">Germane Load</p>
                <p className="text-xs text-zinc-400">
                  Productive effort toward learning. Higher is better—this represents schema
                  building.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* INSPIRE Stage Indicator */}
          {inspireStage && (
            <div className="px-4 border-l border-white/10">
              <div className="text-xs text-zinc-500">INSPIRE Stage</div>
              <div className="text-sm font-medium text-primary capitalize">{inspireStage}</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              className="border-white/10"
              onClick={analyzeContent}
              disabled={isAnalyzing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
            </Button>
          </div>
        </div>

        {/* Recommendations Collapsible */}
        {result.recommendations.length > 0 && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between text-zinc-400 hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  {result.recommendations.length} Recommendation
                  {result.recommendations.length !== 1 ? 's' : ''}
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-2">
              <div className="space-y-2 bg-[#0d0d14] rounded-lg p-3">
                {result.recommendations.map((rec) => (
                  <button
                    type="button"
                    key={rec.id}
                    className="w-full flex items-start gap-3 p-2 rounded-xs hover:bg-white/5 cursor-pointer transition-colors border-none text-left"
                    onClick={() => onRecommendationClick?.(rec)}
                  >
                    {getPriorityIcon(rec.priority)}
                    <div className="flex-1">
                      <p className="text-sm text-zinc-300">{rec.message}</p>
                      {rec.action && <p className="text-xs text-zinc-500 mt-1">→ {rec.action}</p>}
                    </div>
                    <span className="text-xs text-zinc-600 uppercase">{rec.category}</span>
                  </button>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Success State */}
        {result.recommendations.length === 0 && result.level === 'optimal' && (
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <CheckCircle className="h-4 w-4" />
            <span>Cognitive load is optimized for learning</span>
          </div>
        )}

        {/* Metrics Debug (collapsed by default, for development) */}
        {metrics && process.env.NODE_ENV === 'development' && (
          <details className="text-xs text-zinc-600">
            <summary className="cursor-pointer hover:text-zinc-400">Debug: Content Metrics</summary>
            <pre className="mt-2 p-2 bg-zinc-900 rounded overflow-auto">
              {JSON.stringify(metrics, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </TooltipProvider>
  );
}

/**
 * Compact version for ribbon display
 */
export function CognitiveLoadMeter({
  content,
  inspireStage,
}: Pick<CognitiveLoadPanelProps, 'content' | 'inspireStage'>) {
  const [result, setResult] = useState<CognitiveLoadResult | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const metrics = extractMetricsFromContent(content || {});
      const loadResult = calculateCognitiveLoad(metrics, inspireStage);
      setResult(loadResult);
    }, 100);
    return () => clearTimeout(timeout);
  }, [content, inspireStage]);

  if (!result) {
    return (
      <div className="flex items-center gap-2">
        <Brain className="h-4 w-4 animate-pulse text-zinc-500" />
        <div className="w-20 h-1.5 bg-zinc-800 rounded-full" />
      </div>
    );
  }

  const getColor = () => {
    switch (result.level) {
      case 'low':
        return 'bg-blue-500';
      case 'optimal':
        return 'bg-green-500';
      case 'high':
        return 'bg-yellow-500';
      case 'overload':
        return 'bg-red-500';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-help">
            <Brain className="h-4 w-4 text-primary" />
            <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${getColor()} rounded-full transition-all duration-300`}
                style={{ width: `${result.total}%` }}
              />
            </div>
            <span className="text-xs text-zinc-400">{result.total}%</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            Cognitive Load: {result.total}% ({result.level})
          </p>
          <p className="text-xs text-zinc-400">
            I:{result.intrinsic}% E:{result.extraneous}% G:{result.germane}%
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
