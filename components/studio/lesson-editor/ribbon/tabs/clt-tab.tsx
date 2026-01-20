'use client';

/**
 * CLTTab - Cognitive Load Theory analysis ribbon tab
 * Re-exports and wraps the shared cognitive-load-tab component
 * with lesson editor specific functionality
 */

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Brain,
  FileBarChart,
  Gauge,
  History,
  Minus,
  RefreshCw,
  Settings2,
  Sparkles,
  Target,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  RibbonButton,
  RibbonContent,
  RibbonDropdown,
  RibbonGroup,
  RibbonSeparator,
} from '@/components/ribbon';

// Super light blue for icons
const ICON = 'text-sky-400';

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

export interface CLTTabProps {
  // Content for analysis
  content?: {
    text?: string;
    blocks?: Array<{ type: string; content?: string }>;
  };

  // INSPIRE methodology stage
  inspireStage?: InspireStage;
  onInspireStageChange?: (stage: InspireStage) => void;

  // Callbacks
  onRecommendationClick?: (recommendation: Recommendation) => void;
  onOptimize?: () => void;
  onViewReport?: () => void;
  onViewHistory?: () => void;
  onConfigureSettings?: () => void;
}

const INSPIRE_STAGES: { value: InspireStage; label: string }[] = [
  { value: 'intrigue', label: 'Intrigue' },
  { value: 'note', label: 'Note' },
  { value: 'scaffold', label: 'Scaffold' },
  { value: 'practice', label: 'Practice' },
  { value: 'integrate', label: 'Integrate' },
  { value: 'reflect', label: 'Reflect' },
  { value: 'extend', label: 'Extend' },
];

export function CLTTab({
  content,
  inspireStage = 'scaffold',
  onInspireStageChange,
  onRecommendationClick: _onRecommendationClick,
  onOptimize,
  onViewReport,
  onViewHistory,
  onConfigureSettings,
}: CLTTabProps) {
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
        return ICON;
      case 'optimal':
        return 'text-green-500';
      case 'high':
        return 'text-amber-500';
      case 'overload':
        return 'text-red-500';
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
    if (Math.abs(diff) < 5) return <Minus className="h-3 w-3 text-gray-400" />;
    if (diff > 0) return <ArrowUpRight className="h-3 w-3 text-amber-500" />;
    return <ArrowDownRight className={`h-3 w-3 ${ICON}`} />;
  };

  if (!result) {
    return (
      <RibbonContent>
        <div className="flex items-center gap-3 px-4 py-2 text-gray-400">
          <Brain className={`h-5 w-5 animate-pulse ${ICON}`} />
          <span className="text-sm">Analyzing cognitive load...</span>
        </div>
      </RibbonContent>
    );
  }

  return (
    <RibbonContent>
      <TooltipProvider>
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
            <div className="w-28">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-500 uppercase">Total</span>
                <span className={cn('text-sm font-bold', getLoadColor(result.level))}>
                  {result.total}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    getLoadBgColor(result.level),
                  )}
                  style={{ width: `${Math.min(100, result.total)}%` }}
                />
              </div>
            </div>

            {/* Status Badge */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    'text-xs font-medium uppercase px-2 py-1 rounded-xs',
                    getLoadColor(result.level),
                    result.level === 'optimal' && 'bg-green-100',
                    result.level === 'low' && 'bg-blue-100',
                    result.level === 'high' && 'bg-amber-100',
                    result.level === 'overload' && 'bg-red-100',
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

        <RibbonSeparator />

        {/* Three Components Group */}
        <RibbonGroup label="3-Component Model">
          <div className="flex items-center gap-4 px-2">
            {/* Intrinsic */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center cursor-help">
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-purple-500">{result.intrinsic}</span>
                    {getTrendIcon(result.intrinsic, 30)}
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase">Intrinsic</div>
                  <Progress value={result.intrinsic} className="h-1 w-10 mt-1" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium">Intrinsic Load</p>
                <p className="text-xs text-gray-500">
                  Inherent complexity of content. Determined by concept density.
                </p>
              </TooltipContent>
            </Tooltip>

            {/* Extraneous */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center cursor-help">
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-orange-500">{result.extraneous}</span>
                    {getTrendIcon(result.extraneous, 20)}
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase">Extraneous</div>
                  <Progress value={result.extraneous} className="h-1 w-10 mt-1" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium">Extraneous Load</p>
                <p className="text-xs text-gray-500">
                  Unnecessary cognitive burden. Lower is better.
                </p>
              </TooltipContent>
            </Tooltip>

            {/* Germane */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center cursor-help">
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-cyan-500">{result.germane}</span>
                    {getTrendIcon(result.germane, 50)}
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase">Germane</div>
                  <Progress value={result.germane} className="h-1 w-10 mt-1" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium">Germane Load</p>
                <p className="text-xs text-gray-500">
                  Productive learning effort. Higher is better.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </RibbonGroup>

        <RibbonSeparator />

        {/* Quick Stats Group */}
        <RibbonGroup label="Metrics">
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 px-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Words</span>
              <span className="font-medium">{metrics?.wordCount ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Blocks</span>
              <span className="font-medium">{content?.blocks?.length ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Interactive</span>
              <span className="font-medium">{metrics?.interactionCount ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Duration</span>
              <span className="font-medium">
                ~{Math.ceil(metrics?.estimatedDurationMinutes ?? 0)}m
              </span>
            </div>
          </div>
        </RibbonGroup>

        <RibbonSeparator />

        {/* INSPIRE Stage Group */}
        <RibbonGroup label="INSPIRE">
          <div className="flex items-center gap-2 px-2">
            <Target className={`h-5 w-5 ${ICON}`} />
            <RibbonDropdown
              options={INSPIRE_STAGES}
              value={inspireStage}
              onValueChange={(val) => onInspireStageChange?.(val as InspireStage)}
              placeholder="Stage"
            />
          </div>
        </RibbonGroup>

        <RibbonSeparator />

        {/* Actions Group */}
        <RibbonGroup label="Actions">
          <div className="flex items-center gap-1">
            <RibbonButton
              icon={<RefreshCw className={cn(`h-5 w-5 ${ICON}`, isAnalyzing && 'animate-spin')} />}
              label="Analyze"
              size="lg"
              onClick={handleReanalyze}
              disabled={isAnalyzing}
              tooltip="Re-analyze content"
            />
            <RibbonButton
              icon={<Sparkles className={`h-5 w-5 ${ICON}`} />}
              label="Optimize"
              size="lg"
              onClick={onOptimize}
              tooltip="AI optimization suggestions"
            />
          </div>
        </RibbonGroup>

        <RibbonSeparator />

        {/* Reports Group */}
        <RibbonGroup label="Reports">
          <div className="flex items-center gap-0.5">
            <RibbonButton
              icon={<FileBarChart className={`h-5 w-5 ${ICON}`} />}
              label="Report"
              size="lg"
              onClick={onViewReport}
              tooltip="View full CLT report"
            />
            <div className="flex flex-col gap-0.5">
              <RibbonButton
                icon={<History className={`h-4 w-4 ${ICON}`} />}
                onClick={onViewHistory}
                tooltip="View analysis history"
              />
              <RibbonButton
                icon={<Settings2 className={`h-4 w-4 ${ICON}`} />}
                onClick={onConfigureSettings}
                tooltip="Configure CLT settings"
              />
            </div>
          </div>
        </RibbonGroup>

        {/* Recommendations - show if any high priority */}
        {result.recommendations.filter((r) => r.priority === 'high').length > 0 && (
          <>
            <RibbonSeparator />
            <RibbonGroup label="Alerts">
              <div className="flex items-center gap-2 px-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span className="text-xs text-amber-600">
                  {result.recommendations.filter((r) => r.priority === 'high').length} high priority
                  recommendations
                </span>
              </div>
            </RibbonGroup>
          </>
        )}
      </TooltipProvider>
    </RibbonContent>
  );
}
