'use client';

import { AlertCircle, Check, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AssetMetadata } from '@/lib/assets/storage';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

interface AITagResult {
  tags: string[];
  altText?: string;
  dominantColors?: string[];
  confidence: number;
}

interface AIAutoTaggerProps {
  asset: AssetMetadata;
  onTagsGenerated?: (result: AITagResult) => void;
  onApplyTags?: (tags: string[]) => void;
  onApplyAltText?: (altText: string) => void;
  className?: string;
}

// =============================================================================
// AI Auto Tagger Component
// =============================================================================

export function AIAutoTagger({
  asset,
  onTagsGenerated,
  onApplyTags,
  onApplyAltText,
  className,
}: AIAutoTaggerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<AITagResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  // Generate tags using AI
  const generateTags = useCallback(async () => {
    if (asset.category !== 'image') {
      setError('AI tagging is only available for images');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: asset.url,
          assetId: asset.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data: AITagResult = await response.json();
      setResult(data);
      setSelectedTags(new Set(data.tags));
      onTagsGenerated?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate tags');
    } finally {
      setIsProcessing(false);
    }
  }, [asset, onTagsGenerated]);

  // Toggle tag selection
  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }, []);

  // Apply selected tags
  const applySelectedTags = useCallback(() => {
    onApplyTags?.(Array.from(selectedTags));
  }, [selectedTags, onApplyTags]);

  // Apply alt text
  const applyAltText = useCallback(() => {
    if (result?.altText) {
      onApplyAltText?.(result.altText);
    }
  }, [result, onApplyAltText]);

  // Can't use AI for non-images
  if (asset.category !== 'image') {
    return (
      <div className={cn('p-4 text-center', className)}>
        <p className="text-xs text-white/50">AI analysis is only available for images</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-lxd-cyan" />
          <h4 className="text-sm font-semibold text-white">AI Analysis</h4>
        </div>
        {result && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7"
            onClick={generateTags}
            disabled={isProcessing}
          >
            <RefreshCw className={cn('w-3 h-3', isProcessing && 'animate-spin')} />
          </Button>
        )}
      </div>

      {/* Initial State */}
      {!result && !isProcessing && !error && (
        <Button type="button" variant="outline" className="w-full" onClick={generateTags}>
          <Sparkles className="w-4 h-4 mr-2" />
          Analyze Image with AI
        </Button>
      )}

      {/* Processing State */}
      {isProcessing && (
        <div className="flex flex-col items-center py-8 text-center">
          <Loader2 className="w-8 h-8 text-lxd-cyan animate-spin mb-3" />
          <p className="text-sm text-white">Analyzing image...</p>
          <p className="text-xs text-white/50 mt-1">This may take a few seconds</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center py-4 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
          <p className="text-sm text-red-400">{error}</p>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={generateTags}>
            Try Again
          </Button>
        </div>
      )}

      {/* Results */}
      {result && !isProcessing && (
        <div className="space-y-4">
          {/* Confidence Indicator */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-lxd-dark-surface overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  result.confidence >= 0.8
                    ? 'bg-green-500'
                    : result.confidence >= 0.5
                      ? 'bg-yellow-500'
                      : 'bg-red-500',
                )}
                style={{ width: `${result.confidence * 100}%` }}
              />
            </div>
            <span className="text-xs text-white/60">
              {Math.round(result.confidence * 100)}% confidence
            </span>
          </div>

          {/* Suggested Tags */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/60">Suggested Tags</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={applySelectedTags}
                disabled={selectedTags.size === 0}
              >
                <Check className="w-3 h-3 mr-1" />
                Apply Selected
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.has(tag) ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer transition-colors',
                    selectedTags.has(tag)
                      ? 'bg-lxd-cyan hover:bg-lxd-cyan/80'
                      : 'hover:bg-lxd-dark-surface',
                  )}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Suggested Alt Text */}
          {result.altText && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/60">Suggested Alt Text</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={applyAltText}
                >
                  <Check className="w-3 h-3 mr-1" />
                  Apply
                </Button>
              </div>
              <div className="p-3 rounded-lg bg-lxd-dark-surface border border-lxd-dark-border">
                <p className="text-xs text-white/80">{result.altText}</p>
              </div>
            </div>
          )}

          {/* Dominant Colors */}
          {result.dominantColors && result.dominantColors.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-white/60">Detected Colors</p>
              <div className="flex gap-2">
                {result.dominantColors.map((color, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded border border-lxd-dark-border shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Hook for AI Tagging
// =============================================================================

export function useAIAutoTagger() {
  const [isProcessing, setIsProcessing] = useState(false);

  const analyzeImage = useCallback(
    async (imageUrl: string, assetId: string): Promise<AITagResult> => {
      setIsProcessing(true);
      try {
        const response = await fetch('/api/ai/analyze-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageUrl, assetId }),
        });

        if (!response.ok) {
          throw new Error('Failed to analyze image');
        }

        return await response.json();
      } finally {
        setIsProcessing(false);
      }
    },
    [],
  );

  return {
    analyzeImage,
    isProcessing,
  };
}

export default AIAutoTagger;
