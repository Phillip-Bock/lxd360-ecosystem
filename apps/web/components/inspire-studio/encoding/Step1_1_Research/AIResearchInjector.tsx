'use client';

import { Bot, Loader2, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  type AIResearchSuggestion,
  INDUSTRY_CATALOG,
  type IndustryId,
  type LocalPerformanceGap,
} from './types';

// ============================================================================
// COMPONENT
// ============================================================================

interface AIResearchInjectorProps {
  industry: IndustryId | null;
  topic: string;
  onSuggestionsGenerated: (suggestions: AIResearchSuggestion) => void;
  onApplyGaps: (gaps: LocalPerformanceGap[]) => void;
  className?: string;
}

/**
 * AIResearchInjector - AI-powered baseline suggestion tool
 *
 * Features:
 * - Generates industry-specific performance gaps
 * - Provides research summary and trends
 * - Allows selective application of suggestions
 * - Stub for Vertex AI integration
 */
export function AIResearchInjector({
  industry,
  topic,
  onSuggestionsGenerated,
  onApplyGaps,
  className,
}: AIResearchInjectorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AIResearchSuggestion | null>(null);
  const [selectedGaps, setSelectedGaps] = useState<Set<string>>(new Set());

  // Simulate AI research (stub for Vertex AI)
  const generateSuggestions = useCallback(async () => {
    if (!industry) return;

    setIsLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Get industry-specific defaults
    const industryOption = INDUSTRY_CATALOG.find((i) => i.id === industry);
    const baseGaps = industryOption?.defaultGaps ?? [];

    // Generate AI suggestion based on topic
    const aiSuggestion: AIResearchSuggestion = {
      performanceGaps: baseGaps.map((gap) => ({
        ...gap,
        id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      })),
      industrySummary: getIndustrySummary(industry, topic),
      keyTrends: getKeyTrends(industry),
      recommendedFocus: getRecommendedFocus(industry, topic),
      confidence: 0.85,
    };

    setSuggestions(aiSuggestion);
    setSelectedGaps(new Set(aiSuggestion.performanceGaps.map((g) => g.id)));
    onSuggestionsGenerated(aiSuggestion);
    setIsLoading(false);
  }, [industry, topic, onSuggestionsGenerated]);

  // Toggle gap selection
  const toggleGapSelection = (gapId: string) => {
    setSelectedGaps((prev) => {
      const next = new Set(prev);
      if (next.has(gapId)) {
        next.delete(gapId);
      } else {
        next.add(gapId);
      }
      return next;
    });
  };

  // Apply selected gaps
  const handleApplyGaps = () => {
    if (!suggestions) return;
    const selectedGapsList = suggestions.performanceGaps.filter((g) => selectedGaps.has(g.id));
    onApplyGaps(selectedGapsList);
  };

  if (!industry) {
    return (
      <Card className={cn('bg-lxd-dark-surface border-lxd-dark-border', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-5 w-5 text-lxd-purple" />
            AI Research Injector
          </CardTitle>
          <CardDescription>
            Select an industry to generate AI-powered baseline research
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={cn('bg-lxd-dark-surface border-lxd-dark-border', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bot className="h-5 w-5 text-lxd-purple" />
              AI Research Injector
            </CardTitle>
            <CardDescription>Generate baseline performance gaps for your industry</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generateSuggestions}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : suggestions ? (
              <RefreshCw className="h-4 w-4 mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {suggestions ? 'Regenerate' : 'Generate'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-lxd-purple" />
            <p>Analyzing industry data...</p>
            <p className="text-sm">Generating performance gap suggestions</p>
          </div>
        )}

        {!isLoading && suggestions && (
          <>
            {/* Industry Summary */}
            <div className="p-4 rounded-lg bg-lxd-dark-bg/50">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-lxd-cyan" />
                Industry Analysis
              </h4>
              <p className="text-sm text-muted-foreground mb-3">{suggestions.industrySummary}</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.keyTrends.map((trend, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {trend}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Recommended Focus */}
            <div className="p-3 rounded-lg bg-lxd-purple/10 border border-lxd-purple/30">
              <p className="text-sm">
                <span className="font-medium text-lxd-purple">Recommended Focus:</span>{' '}
                {suggestions.recommendedFocus}
              </p>
            </div>

            {/* Performance Gaps */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Suggested Performance Gaps</h4>
              {suggestions.performanceGaps.map((gap) => (
                <div
                  key={gap.id}
                  className={cn(
                    'p-3 rounded-lg border cursor-pointer transition-colors',
                    selectedGaps.has(gap.id)
                      ? 'bg-lxd-purple/10 border-lxd-purple/50'
                      : 'bg-lxd-dark-bg/50 border-lxd-dark-border hover:border-lxd-dark-hover',
                  )}
                  onClick={() => toggleGapSelection(gap.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleGapSelection(gap.id);
                    }
                  }}
                  role="checkbox"
                  aria-checked={selectedGaps.has(gap.id)}
                  tabIndex={0}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{gap.title}</span>
                        <Badge
                          variant={
                            gap.priority === 'critical'
                              ? 'destructive'
                              : gap.priority === 'high'
                                ? 'default'
                                : 'secondary'
                          }
                          className="text-xs"
                        >
                          {gap.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{gap.description}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedGaps.has(gap.id)}
                      onChange={() => toggleGapSelection(gap.id)}
                      className="mt-1 h-4 w-4 rounded border-lxd-dark-border"
                      aria-label={`Select ${gap.title}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Apply Button */}
            <Button
              type="button"
              onClick={handleApplyGaps}
              disabled={selectedGaps.size === 0}
              className="w-full"
            >
              Apply {selectedGaps.size} Selected Gap{selectedGaps.size !== 1 ? 's' : ''}
            </Button>

            {/* Confidence */}
            <p className="text-xs text-center text-muted-foreground">
              AI Confidence: {Math.round(suggestions.confidence * 100)}% • Powered by INSPIRE AI
            </p>
          </>
        )}

        {!isLoading && !suggestions && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-4 text-lxd-purple/50" />
            <p>Click &quot;Generate&quot; to get AI-powered baseline research</p>
            <p className="text-sm mt-1">Based on your selected industry and topic description</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// HELPER FUNCTIONS (Stubs for Vertex AI)
// ============================================================================

function getIndustrySummary(industry: IndustryId, _topic: string): string {
  const summaries: Record<IndustryId, string> = {
    healthcare:
      'The healthcare industry faces ongoing challenges in maintaining consistent safety protocols and adapting to rapidly evolving technology. Key focus areas include patient safety, regulatory compliance, and digital transformation of care delivery.',
    aerospace:
      'Aerospace and aviation require rigorous maintenance standards and strict regulatory compliance. The industry emphasizes safety-critical training, technical precision, and continuous skill development.',
    manufacturing:
      'Manufacturing environments demand consistent quality control and workplace safety. Modern challenges include automation integration, lean processes, and environmental compliance.',
    financial:
      'Financial services operate under complex regulatory frameworks with high stakes for compliance. Focus areas include fraud prevention, customer protection, and digital security.',
    technology:
      'The technology sector faces rapid change requiring continuous skill development. Security practices, cloud infrastructure, and agile methodologies are key training areas.',
    retail:
      'Retail and hospitality prioritize customer experience and service consistency. Staff training focuses on product knowledge, sales techniques, and brand representation.',
    government:
      'Government and defense sectors require strict adherence to security protocols and policy implementation. Training emphasizes compliance, procedural accuracy, and accountability.',
    education:
      'Education sector focuses on effective instructional design and technology integration. Key areas include learner engagement, assessment strategies, and adaptive learning.',
    other:
      'Custom industry analysis based on your specific requirements and organizational context.',
  };
  return summaries[industry];
}

function getKeyTrends(industry: IndustryId): string[] {
  const trends: Record<IndustryId, string[]> = {
    healthcare: ['Digital Health', 'AI Diagnostics', 'Remote Care', 'Data Privacy'],
    aerospace: ['Predictive Maintenance', 'Automation', 'Sustainability', 'Digital Twin'],
    manufacturing: ['Industry 4.0', 'IoT Integration', 'Lean Six Sigma', 'Sustainability'],
    financial: ['Digital Banking', 'RegTech', 'Cybersecurity', 'Open Banking'],
    technology: ['Cloud Native', 'AI/ML Ops', 'Zero Trust', 'DevSecOps'],
    retail: ['Omnichannel', 'Personalization', 'Sustainability', 'Mobile Commerce'],
    government: ['Digital Services', 'Cybersecurity', 'Data Governance', 'Automation'],
    education: ['Microlearning', 'AI Tutoring', 'Gamification', 'Competency-Based'],
    other: ['Digital Transformation', 'Skills Gap', 'Remote Work', 'Compliance'],
  };
  return trends[industry];
}

function getRecommendedFocus(industry: IndustryId, topic: string): string {
  if (topic.toLowerCase().includes('safety')) {
    return 'Prioritize safety-critical procedures with high-stakes scenario training and compliance verification.';
  }
  if (topic.toLowerCase().includes('compliance')) {
    return 'Focus on regulatory knowledge with practical application exercises and audit preparation.';
  }
  if (topic.toLowerCase().includes('technology') || topic.toLowerCase().includes('system')) {
    return 'Emphasize hands-on system training with progressive complexity and real-world simulations.';
  }
  return `Based on ${industry} best practices, recommend a blended approach combining foundational knowledge with practical application.`;
}
