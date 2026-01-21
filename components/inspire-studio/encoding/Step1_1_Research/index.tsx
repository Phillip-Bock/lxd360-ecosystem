'use client';

import { FileText, Info } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { IndustryAnalysis } from '@/schemas/inspire';
import { useMissionStore } from '@/store/inspire';
import { AIResearchInjector } from './AIResearchInjector';
import { CSVUploader } from './CSVUploader';
import { IndustrySelector } from './IndustrySelector';
import { PerformanceGapEditor } from './PerformanceGapEditor';
import {
  type AIResearchSuggestion,
  fromSchemaPerformanceGap,
  type IndustryId,
  type IndustryOption,
  type LocalPerformanceGap,
  toSchemaPerformanceGap,
} from './types';

// ============================================================================
// COMPONENT
// ============================================================================

interface Step1_1_ResearchProps {
  className?: string;
}

/**
 * Step1_1_Research - Research & Industry Analysis
 *
 * This step captures:
 * - Industry selection
 * - Topic/course description
 * - Performance gaps (manual, AI, or CSV)
 *
 * Output to store:
 * - manifest.encoding.industryAnalysis
 */
export function Step1_1_Research({ className }: Step1_1_ResearchProps) {
  const manifest = useMissionStore((state) => state.manifest);
  const updateEncodingData = useMissionStore((state) => state.updateEncodingData);

  // Local state - convert from schema format
  const [industry, setIndustry] = useState<IndustryId | null>(
    (manifest?.encoding?.industryAnalysis?.industry as IndustryId) ?? null,
  );
  const [topic, setTopic] = useState(manifest?.encoding?.industryAnalysis?.topic ?? '');
  const [performanceGaps, setPerformanceGaps] = useState<LocalPerformanceGap[]>(
    manifest?.encoding?.industryAnalysis?.performanceGaps?.map(fromSchemaPerformanceGap) ?? [],
  );
  const [aiSuggestions, setAISuggestions] = useState<AIResearchSuggestion | null>(null);

  // Validation state
  const isValid = useMemo(() => {
    return !!industry && topic.trim().length >= 10 && performanceGaps.length > 0;
  }, [industry, topic, performanceGaps]);

  // Sync to store on valid state
  useEffect(() => {
    if (isValid && industry) {
      const industryAnalysis: IndustryAnalysis = {
        industry,
        topic,
        performanceGaps: performanceGaps.map(toSchemaPerformanceGap),
        aiResearchUsed: !!aiSuggestions,
        regulatoryRequirements: [],
        businessDrivers: aiSuggestions?.keyTrends ?? [],
      };
      updateEncodingData({ industryAnalysis });
    }
  }, [isValid, industry, topic, performanceGaps, aiSuggestions, updateEncodingData]);

  // Handle industry selection
  const handleIndustryChange = useCallback((newIndustry: IndustryId) => {
    setIndustry(newIndustry);
  }, []);

  // Handle industry option selection (with default gaps)
  const handleIndustrySelect = useCallback(
    (industryOption: IndustryOption) => {
      // Auto-populate with industry defaults if no gaps exist
      if (performanceGaps.length === 0 && industryOption.defaultGaps.length > 0) {
        setPerformanceGaps(industryOption.defaultGaps);
      }
    },
    [performanceGaps.length],
  );

  // Handle AI suggestions
  const handleAISuggestions = useCallback((suggestions: AIResearchSuggestion) => {
    setAISuggestions(suggestions);
  }, []);

  // Handle AI gaps application
  const handleApplyAIGaps = useCallback((gaps: LocalPerformanceGap[]) => {
    setPerformanceGaps((prev) => {
      // Merge without duplicates (by title)
      const existingTitles = new Set(prev.map((g) => g.title.toLowerCase()));
      const newGaps = gaps.filter((g) => !existingTitles.has(g.title.toLowerCase()));
      return [...prev, ...newGaps];
    });
  }, []);

  // Handle CSV upload
  const handleCSVUpload = useCallback((gaps: LocalPerformanceGap[]) => {
    setPerformanceGaps((prev) => {
      // Merge without duplicates
      const existingTitles = new Set(prev.map((g) => g.title.toLowerCase()));
      const newGaps = gaps.filter((g) => !existingTitles.has(g.title.toLowerCase()));
      return [...prev, ...newGaps];
    });
  }, []);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5 text-lxd-purple" />
          Research &amp; Industry Analysis
        </h2>
        <p className="text-muted-foreground mt-1">
          Define your training focus area and identify performance gaps to address
        </p>
      </div>

      {/* Validation Status */}
      {!isValid && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Complete all required fields to proceed:
            {!industry && ' • Select an industry'}
            {topic.trim().length < 10 && ' • Add topic description (min 10 chars)'}
            {performanceGaps.length === 0 && ' • Add at least one performance gap'}
          </AlertDescription>
        </Alert>
      )}

      {/* Industry Selection */}
      <IndustrySelector
        value={industry}
        onChange={handleIndustryChange}
        onIndustrySelect={handleIndustrySelect}
      />

      {/* Topic Description */}
      <div className="space-y-2">
        <Label htmlFor="topic-description">Topic / Course Description *</Label>
        <Textarea
          id="topic-description"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Describe the training topic, target audience, and key learning goals..."
          rows={4}
          className="bg-lxd-dark-surface border-lxd-dark-border"
        />
        <p className="text-xs text-muted-foreground">
          {topic.length} characters • Minimum 10 required
        </p>
      </div>

      {/* Performance Gap Input Methods */}
      <div className="space-y-4">
        <h3 className="font-medium">Performance Gaps</h3>
        <p className="text-sm text-muted-foreground">
          Identify the gaps between current and desired performance. Use any combination of methods
          below.
        </p>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="ai">AI Suggestions</TabsTrigger>
            <TabsTrigger value="csv">CSV Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="mt-4">
            <PerformanceGapEditor gaps={performanceGaps} onChange={setPerformanceGaps} />
          </TabsContent>

          <TabsContent value="ai" className="mt-4">
            <AIResearchInjector
              industry={industry}
              topic={topic}
              onSuggestionsGenerated={handleAISuggestions}
              onApplyGaps={handleApplyAIGaps}
            />
          </TabsContent>

          <TabsContent value="csv" className="mt-4">
            <CSVUploader onUploadComplete={handleCSVUpload} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Gap Summary */}
      {performanceGaps.length > 0 && (
        <div className="p-4 rounded-lg bg-lxd-dark-bg/50 border border-lxd-dark-border">
          <h4 className="font-medium mb-2">Gap Summary</h4>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Gaps</p>
              <p className="text-2xl font-bold text-lxd-purple">{performanceGaps.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Critical</p>
              <p className="text-2xl font-bold text-red-500">
                {performanceGaps.filter((g) => g.priority === 'critical').length}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">High</p>
              <p className="text-2xl font-bold text-orange-500">
                {performanceGaps.filter((g) => g.priority === 'high').length}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Medium/Low</p>
              <p className="text-2xl font-bold text-yellow-500">
                {
                  performanceGaps.filter((g) => g.priority === 'medium' || g.priority === 'low')
                    .length
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Step1_1_Research;
