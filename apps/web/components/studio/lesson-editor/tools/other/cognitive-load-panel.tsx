'use client';

import { Brain, ChevronDown, ChevronUp, Lightbulb, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  type CognitiveLoadResult,
  type ContentMetrics,
  calculateCognitiveLoad,
  type InspireStage,
} from '@/lib/cognitive-load';
import { cn } from '@/lib/utils';
import type { CanvasBlock } from '../../lesson-canvas';

interface CognitiveLoadPanelProps {
  blocks: CanvasBlock[];
  inspireStage?: InspireStage;
  compact?: boolean;
}

/**
 * CognitiveLoadPanel - Real-time cognitive load analysis
 * Uses Leppink's 3-Component Model with NASA-TLX predictions
 */
export function CognitiveLoadPanel({
  blocks,
  inspireStage = 'scaffold',
  compact = false,
}: CognitiveLoadPanelProps) {
  const [expanded, setExpanded] = useState(!compact);

  // Extract metrics from blocks
  const metrics = useMemo<ContentMetrics>(() => {
    let wordCount = 0;
    let sentenceCount = 0;
    let paragraphCount = 0;
    let imageCount = 0;
    let videoCount = 0;
    let audioCount = 0;
    let interactionCount = 0;
    let questionCount = 0;

    for (const block of blocks) {
      // Count text content
      const text = typeof block.content.text === 'string' ? block.content.text : '';
      const words = text.split(/\s+/).filter((w) => w.length > 0);
      wordCount += words.length;
      sentenceCount += text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;

      // Count by block type
      switch (block.type) {
        case 'paragraph':
        case 'quote':
          paragraphCount++;
          break;
        case 'image':
          imageCount++;
          break;
        case 'video':
          videoCount++;
          break;
        case 'audio':
          audioCount++;
          break;
        case 'accordion':
        case 'tabs':
        case 'flip-card':
        case 'hotspot':
          interactionCount++;
          break;
        case 'multiple-choice':
        case 'true-false':
        case 'multiple-select':
        case 'fill-blank':
          questionCount++;
          break;
      }
    }

    // Calculate derived metrics
    const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
    const readabilityScore = Math.max(
      0,
      Math.min(100, 206.835 - 1.015 * avgWordsPerSentence - 84.6 * 1.5),
    );

    const uniqueWords = new Set(
      blocks
        .flatMap((b) =>
          typeof b.content.text === 'string' ? b.content.text.toLowerCase().split(/\s+/) : [],
        )
        .filter((w) => w.length > 0),
    );
    const conceptDensity = wordCount > 0 ? (uniqueWords.size / wordCount) * 10 : 0;

    let elementInteractivity: ContentMetrics['elementInteractivity'] = 'isolated';
    if (interactionCount > 3 || videoCount > 2) {
      elementInteractivity = 'interconnected';
    } else if (interactionCount > 0 || videoCount > 0) {
      elementInteractivity = 'sequential';
    }

    const estimatedDurationMinutes =
      wordCount / 200 + videoCount * 3 + audioCount * 2 + interactionCount * 1;

    return {
      wordCount,
      sentenceCount,
      paragraphCount,
      imageCount,
      videoCount,
      audioCount,
      interactionCount,
      questionCount,
      conceptDensity: Math.round(conceptDensity * 10) / 10,
      readabilityScore: Math.round(readabilityScore),
      elementInteractivity,
      estimatedDurationMinutes: Math.round(estimatedDurationMinutes * 10) / 10,
    };
  }, [blocks]);

  // Calculate cognitive load
  const result = useMemo<CognitiveLoadResult>(
    () => calculateCognitiveLoad(metrics, inspireStage),
    [metrics, inspireStage],
  );

  const getLevelColor = (level: CognitiveLoadResult['level']) => {
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

  const getLevelBg = (level: CognitiveLoadResult['level']) => {
    switch (level) {
      case 'low':
        return 'bg-blue-500/20';
      case 'optimal':
        return 'bg-green-500/20';
      case 'high':
        return 'bg-amber-500/20';
      case 'overload':
        return 'bg-red-500/20';
    }
  };

  const getProgressColor = (value: number) => {
    if (value <= 30) return 'bg-green-500';
    if (value <= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  if (compact && !expanded) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setExpanded(true)}
        className={cn('gap-2', getLevelColor(result.level))}
      >
        <Brain className="h-4 w-4" />
        <span className="text-xs font-medium uppercase">{result.level}</span>
        <span className="text-xs text-zinc-500">{result.total}%</span>
        <ChevronDown className="h-3 w-3" />
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-white/10 bg-[#0d0d14] overflow-hidden">
      {/* Header */}
      {compact ? (
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/5 border-none text-left"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          <div className="flex items-center gap-2">
            <Brain className={cn('h-5 w-5', getLevelColor(result.level))} />
            <span className="font-medium text-white">Cognitive Load</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-xs font-medium uppercase px-2 py-0.5 rounded-full',
                getLevelBg(result.level),
                getLevelColor(result.level),
              )}
            >
              {result.level}
            </span>
            <span className="h-6 w-6 flex items-center justify-center">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </span>
          </div>
        </button>
      ) : (
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Brain className={cn('h-5 w-5', getLevelColor(result.level))} />
            <span className="font-medium text-white">Cognitive Load</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-xs font-medium uppercase px-2 py-0.5 rounded-full',
                getLevelBg(result.level),
                getLevelColor(result.level),
              )}
            >
              {result.level}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Overall Load */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-zinc-400">Total Load</span>
            <span className="font-medium text-white">{result.total}%</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={cn('h-full transition-all duration-300', getProgressColor(result.total))}
              style={{ width: `${Math.min(100, result.total)}%` }}
            />
          </div>
        </div>

        {/* Three Components */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{result.intrinsic}</div>
            <div className="text-xs text-zinc-500">Intrinsic</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{result.extraneous}</div>
            <div className="text-xs text-zinc-500">Extraneous</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">{result.germane}</div>
            <div className="text-xs text-zinc-500">Germane</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs border-t border-white/5 pt-3">
          <div className="flex justify-between text-zinc-400">
            <span>Words</span>
            <span className="text-white">{metrics.wordCount}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Blocks</span>
            <span className="text-white">{blocks.length}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Interactive</span>
            <span className="text-white">{metrics.interactionCount}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Duration</span>
            <span className="text-white">~{Math.ceil(metrics.estimatedDurationMinutes)} min</span>
          </div>
        </div>

        {/* Recommendations */}
        {result.recommendations.length > 0 && (
          <div className="border-t border-white/5 pt-3">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 mb-2">
              <Lightbulb className="h-3 w-3" />
              Recommendations
            </div>
            <ul className="space-y-2">
              {result.recommendations.slice(0, 3).map((rec) => (
                <li
                  key={rec.id}
                  className={cn(
                    'text-xs p-2 rounded',
                    rec.priority === 'high' && 'bg-red-500/10 border border-red-500/20',
                    rec.priority === 'medium' && 'bg-amber-500/10 border border-amber-500/20',
                    rec.priority === 'low' && 'bg-blue-500/10 border border-blue-500/20',
                  )}
                >
                  <p className="font-medium text-white">{rec.message}</p>
                  <p className="text-zinc-500 mt-0.5">{rec.action}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* NASA-TLX Preview */}
        {!compact && (
          <div className="border-t border-white/5 pt-3">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 mb-2">
              <Zap className="h-3 w-3" />
              NASA-TLX Prediction
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Mental Demand</span>
                <span className="text-white">{Math.round(result.nasaTlx.mentalDemand)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Effort</span>
                <span className="text-white">{Math.round(result.nasaTlx.effort)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Frustration</span>
                <span className="text-white">{Math.round(result.nasaTlx.frustration)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Performance</span>
                <span className="text-white">{Math.round(result.nasaTlx.performance)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
