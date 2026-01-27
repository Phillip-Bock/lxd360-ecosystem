'use client';

/**
 * NeuroTools - Phase 12
 * Neuro-friendly learning tools configuration
 */

import { Bot, Brain, Coffee, Eye, Focus, Heart, MessageCircle, Sparkles, Type } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type {
  BreakConfig,
  CognitiveLoadConfig,
  FocusModeConfig,
  MentorConfig,
  NeuroConfig,
  ReadingModeConfig,
} from '@/types/studio/player-config';

// =============================================================================
// TYPES
// =============================================================================

interface NeuroToolsProps {
  config: NeuroConfig;
  onChange: (config: NeuroConfig) => void;
  onPreview?: () => void;
}

// =============================================================================
// TOGGLE ROW COMPONENT
// =============================================================================

interface ToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function ToggleRow({ label, description, checked, onCheckedChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <Label className="text-sm text-white">{label}</Label>
        {description && <p className="text-[10px] text-zinc-500">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

// =============================================================================
// FEATURE CARD COMPONENT
// =============================================================================

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  children?: React.ReactNode;
}

function FeatureCard({ title, description, icon, enabled, onToggle, children }: FeatureCardProps) {
  const [isExpanded, setIsExpanded] = useState(enabled);

  return (
    <div
      className={cn(
        'rounded-lg border transition-colors',
        enabled ? 'border-primary/30 bg-primary/5' : 'border-white/10 bg-zinc-900/30',
      )}
    >
      <div className="p-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
              enabled ? 'bg-primary/20 text-primary' : 'bg-zinc-800 text-zinc-500',
            )}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-white">{title}</h4>
              <Switch
                checked={enabled}
                onCheckedChange={(checked) => {
                  onToggle(checked);
                  if (checked) setIsExpanded(true);
                }}
              />
            </div>
            <p className="text-[10px] text-zinc-500 mt-0.5">{description}</p>
          </div>
        </div>
      </div>

      {enabled && children && (
        <div className="px-3 pb-3 pt-0 border-t border-white/5 mt-2">
          <button
            type="button"
            className="text-[10px] text-zinc-500 hover:text-zinc-400 mb-2"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Hide options' : 'Show options'}
          </button>
          {isExpanded && <div className="space-y-3">{children}</div>}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function NeuroTools({ config, onChange, onPreview }: NeuroToolsProps) {
  const [activeTab, setActiveTab] = useState('focus');

  const updateFocusMode = useCallback(
    (updates: Partial<FocusModeConfig>) => {
      onChange({ ...config, focusMode: { ...config.focusMode, ...updates } });
    },
    [config, onChange],
  );

  const updateReadingMode = useCallback(
    (updates: Partial<ReadingModeConfig>) => {
      onChange({ ...config, readingMode: { ...config.readingMode, ...updates } });
    },
    [config, onChange],
  );

  const updateCognitiveLoad = useCallback(
    (updates: Partial<CognitiveLoadConfig>) => {
      onChange({ ...config, cognitiveLoad: { ...config.cognitiveLoad, ...updates } });
    },
    [config, onChange],
  );

  const updateBreaks = useCallback(
    (updates: Partial<BreakConfig>) => {
      onChange({ ...config, breaks: { ...config.breaks, ...updates } });
    },
    [config, onChange],
  );

  const updateMentor = useCallback(
    (updates: Partial<MentorConfig>) => {
      onChange({ ...config, mentor: { ...config.mentor, ...updates } });
    },
    [config, onChange],
  );

  return (
    <div className="flex flex-col h-full bg-(--neural-bg)">
      {/* Header */}
      <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm text-white">Neuro Tools</span>
        </div>
        <div className="flex items-center gap-2">
          {onPreview && (
            <Button variant="outline" size="sm" className="h-7" onClick={onPreview}>
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </Button>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <div className="px-4 py-2 bg-primary/5 border-b border-primary/10">
        <p className="text-[10px] text-primary/80">
          These tools support learners with ADHD, dyslexia, and other cognitive differences by
          reducing distractions, improving readability, and providing helpful guidance.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="mx-4 mt-2 grid grid-cols-5 h-8">
          <TabsTrigger value="focus" className="text-xs gap-1">
            <Focus className="h-3 w-3" />
            Focus
          </TabsTrigger>
          <TabsTrigger value="reading" className="text-xs gap-1">
            <Type className="h-3 w-3" />
            Reading
          </TabsTrigger>
          <TabsTrigger value="cognitive" className="text-xs gap-1">
            <Brain className="h-3 w-3" />
            Load
          </TabsTrigger>
          <TabsTrigger value="breaks" className="text-xs gap-1">
            <Coffee className="h-3 w-3" />
            Breaks
          </TabsTrigger>
          <TabsTrigger value="mentor" className="text-xs gap-1">
            <Bot className="h-3 w-3" />
            Mentor
          </TabsTrigger>
        </TabsList>

        {/* Focus Mode Tab */}
        <TabsContent value="focus" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full px-4 py-3">
            <div className="space-y-4">
              <FeatureCard
                title="Focus Mode"
                description="Reduce visual distractions and center attention on content"
                icon={<Focus className="h-4 w-4" />}
                enabled={config.focusMode.enabled}
                onToggle={(enabled) => updateFocusMode({ enabled })}
              >
                <ToggleRow
                  label="Hide Distractions"
                  description="Remove decorative elements"
                  checked={config.focusMode.hideDistractions}
                  onCheckedChange={(checked) => updateFocusMode({ hideDistractions: checked })}
                />
                <ToggleRow
                  label="Dim Non-Focused Areas"
                  description="Gray out surrounding content"
                  checked={config.focusMode.dimNonFocused}
                  onCheckedChange={(checked) => updateFocusMode({ dimNonFocused: checked })}
                />

                {config.focusMode.dimNonFocused && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-zinc-400">Dim Opacity</Label>
                      <span className="text-xs text-zinc-500">
                        {Math.round(config.focusMode.dimOpacity * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[config.focusMode.dimOpacity * 100]}
                      onValueChange={([value]) => updateFocusMode({ dimOpacity: value / 100 })}
                      min={10}
                      max={80}
                      step={5}
                    />
                  </div>
                )}

                <ToggleRow
                  label="Highlight Current"
                  description="Add border to active element"
                  checked={config.focusMode.highlightCurrent}
                  onCheckedChange={(checked) => updateFocusMode({ highlightCurrent: checked })}
                />
                <ToggleRow
                  label="Single Column Layout"
                  description="Simplify to one column"
                  checked={config.focusMode.singleColumn}
                  onCheckedChange={(checked) => updateFocusMode({ singleColumn: checked })}
                />
                <ToggleRow
                  label="Hide Sidebar"
                  description="Collapse sidebar when focused"
                  checked={config.focusMode.hideSidebar}
                  onCheckedChange={(checked) => updateFocusMode({ hideSidebar: checked })}
                />
              </FeatureCard>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Reading Mode Tab */}
        <TabsContent value="reading" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full px-4 py-3">
            <div className="space-y-4">
              <FeatureCard
                title="Reading Mode"
                description="Optimize text presentation for easier reading"
                icon={<Type className="h-4 w-4" />}
                enabled={config.readingMode.enabled}
                onToggle={(enabled) => updateReadingMode({ enabled })}
              >
                <ToggleRow
                  label="Reading Ruler"
                  description="Highlight current line"
                  checked={config.readingMode.readingRuler}
                  onCheckedChange={(checked) => updateReadingMode({ readingRuler: checked })}
                />

                {config.readingMode.readingRuler && (
                  <div className="space-y-2">
                    <Label className="text-xs text-zinc-400">Ruler Color</Label>
                    <Input
                      type="color"
                      value={config.readingMode.rulerColor}
                      onChange={(e) => updateReadingMode({ rulerColor: e.target.value })}
                      className="h-8 w-full bg-zinc-900 border-white/10"
                    />
                  </div>
                )}

                <ToggleRow
                  label="Bionic Reading"
                  description="Bold first part of words"
                  checked={config.readingMode.bionicReading}
                  onCheckedChange={(checked) => updateReadingMode({ bionicReading: checked })}
                />
                <ToggleRow
                  label="Text Mask"
                  description="Reveal text line by line"
                  checked={config.readingMode.textMask}
                  onCheckedChange={(checked) => updateReadingMode({ textMask: checked })}
                />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-zinc-400">Max Content Width</Label>
                    <span className="text-xs text-zinc-500">
                      {config.readingMode.maxContentWidth}px
                    </span>
                  </div>
                  <Slider
                    value={[config.readingMode.maxContentWidth]}
                    onValueChange={([value]) => updateReadingMode({ maxContentWidth: value })}
                    min={400}
                    max={1000}
                    step={40}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-zinc-400">Paragraph Spacing</Label>
                    <span className="text-xs text-zinc-500">
                      {config.readingMode.paragraphSpacing}x
                    </span>
                  </div>
                  <Slider
                    value={[config.readingMode.paragraphSpacing * 10]}
                    onValueChange={([value]) => updateReadingMode({ paragraphSpacing: value / 10 })}
                    min={10}
                    max={30}
                    step={1}
                  />
                </div>
              </FeatureCard>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Cognitive Load Tab */}
        <TabsContent value="cognitive" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full px-4 py-3">
            <div className="space-y-4">
              <FeatureCard
                title="Reduce Cognitive Load"
                description="Make content easier to process and understand"
                icon={<Brain className="h-4 w-4" />}
                enabled={true}
                onToggle={() => {}}
              >
                <ToggleRow
                  label="Simplify Language"
                  description="Show simplified text versions"
                  checked={config.cognitiveLoad.simplifyLanguage}
                  onCheckedChange={(checked) => updateCognitiveLoad({ simplifyLanguage: checked })}
                />
                <ToggleRow
                  label="Show Definitions"
                  description="Define terms on hover"
                  checked={config.cognitiveLoad.showDefinitions}
                  onCheckedChange={(checked) => updateCognitiveLoad({ showDefinitions: checked })}
                />
                <ToggleRow
                  label="Chunk Content"
                  description="Break large lists into smaller groups"
                  checked={config.cognitiveLoad.chunkContent}
                  onCheckedChange={(checked) => updateCognitiveLoad({ chunkContent: checked })}
                />

                {config.cognitiveLoad.chunkContent && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-zinc-400">Items per Chunk</Label>
                      <span className="text-xs text-zinc-500">
                        {config.cognitiveLoad.chunkSize}
                      </span>
                    </div>
                    <Slider
                      value={[config.cognitiveLoad.chunkSize]}
                      onValueChange={([value]) => updateCognitiveLoad({ chunkSize: value })}
                      min={3}
                      max={10}
                      step={1}
                    />
                  </div>
                )}

                <ToggleRow
                  label="Show Micro-Progress"
                  description="Progress for each section"
                  checked={config.cognitiveLoad.showMicroProgress}
                  onCheckedChange={(checked) => updateCognitiveLoad({ showMicroProgress: checked })}
                />
                <ToggleRow
                  label="Show Time Estimates"
                  description="Estimated completion time"
                  checked={config.cognitiveLoad.showTimeEstimates}
                  onCheckedChange={(checked) => updateCognitiveLoad({ showTimeEstimates: checked })}
                />
                <ToggleRow
                  label="Auto-Summarize"
                  description="Generate summaries for long content"
                  checked={config.cognitiveLoad.autoSummarize}
                  onCheckedChange={(checked) => updateCognitiveLoad({ autoSummarize: checked })}
                />
              </FeatureCard>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Breaks Tab */}
        <TabsContent value="breaks" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full px-4 py-3">
            <div className="space-y-4">
              <FeatureCard
                title="Break Reminders"
                description="Encourage healthy learning habits with regular breaks"
                icon={<Coffee className="h-4 w-4" />}
                enabled={config.breaks.enabled}
                onToggle={(enabled) => updateBreaks({ enabled })}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-zinc-400">Break Interval</Label>
                    <span className="text-xs text-zinc-500">
                      {config.breaks.intervalMinutes} min
                    </span>
                  </div>
                  <Slider
                    value={[config.breaks.intervalMinutes]}
                    onValueChange={([value]) => updateBreaks({ intervalMinutes: value })}
                    min={10}
                    max={60}
                    step={5}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-zinc-400">Break Duration</Label>
                    <span className="text-xs text-zinc-500">
                      {config.breaks.breakDurationMinutes} min
                    </span>
                  </div>
                  <Slider
                    value={[config.breaks.breakDurationMinutes]}
                    onValueChange={([value]) => updateBreaks({ breakDurationMinutes: value })}
                    min={1}
                    max={15}
                    step={1}
                  />
                </div>

                <ToggleRow
                  label="Stretch Suggestions"
                  description="Show stretching exercises"
                  checked={config.breaks.showStretchSuggestions}
                  onCheckedChange={(checked) => updateBreaks({ showStretchSuggestions: checked })}
                />
                <ToggleRow
                  label="Breathing Exercises"
                  description="Guided breathing during breaks"
                  checked={config.breaks.showBreathingExercises}
                  onCheckedChange={(checked) => updateBreaks({ showBreathingExercises: checked })}
                />
                <ToggleRow
                  label="Enforce Breaks"
                  description="Pause content during breaks"
                  checked={config.breaks.enforceBreaks}
                  onCheckedChange={(checked) => updateBreaks({ enforceBreaks: checked })}
                />
              </FeatureCard>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* AI Mentor Tab */}
        <TabsContent value="mentor" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full px-4 py-3">
            <div className="space-y-4">
              <FeatureCard
                title="AI Learning Mentor"
                description="Friendly AI assistant to guide and support learners"
                icon={<Bot className="h-4 w-4" />}
                enabled={config.mentor.enabled}
                onToggle={(enabled) => updateMentor({ enabled })}
              >
                <div className="space-y-2">
                  <Label className="text-xs text-zinc-400">Mentor Name</Label>
                  <Input
                    value={config.mentor.name}
                    onChange={(e) => updateMentor({ name: e.target.value })}
                    placeholder="Neuro-naut"
                    className="h-8 bg-zinc-900 border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-zinc-400">Persona</Label>
                  <Select
                    value={config.mentor.persona}
                    onValueChange={(v) => updateMentor({ persona: v as MentorConfig['persona'] })}
                  >
                    <SelectTrigger className="h-8 bg-zinc-900 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supportive">
                        <div className="flex items-center gap-2">
                          <Heart className="h-3 w-3 text-pink-400" />
                          Supportive & Encouraging
                        </div>
                      </SelectItem>
                      <SelectItem value="professional">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-3 w-3 text-blue-400" />
                          Professional & Clear
                        </div>
                      </SelectItem>
                      <SelectItem value="casual">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-3 w-3 text-amber-400" />
                          Casual & Friendly
                        </div>
                      </SelectItem>
                      <SelectItem value="academic">
                        <div className="flex items-center gap-2">
                          <Brain className="h-3 w-3 text-purple-400" />
                          Academic & Thorough
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-zinc-400">Avatar URL (optional)</Label>
                  <Input
                    value={config.mentor.avatarUrl || ''}
                    onChange={(e) => updateMentor({ avatarUrl: e.target.value || undefined })}
                    placeholder="https://..."
                    className="h-8 bg-zinc-900 border-white/10"
                  />
                </div>

                <ToggleRow
                  label="Proactive Hints"
                  description="Offer help without being asked"
                  checked={config.mentor.proactiveHints}
                  onCheckedChange={(checked) => updateMentor({ proactiveHints: checked })}
                />
                <ToggleRow
                  label="Navigation Help"
                  description="Guide through the course"
                  checked={config.mentor.navigationHelp}
                  onCheckedChange={(checked) => updateMentor({ navigationHelp: checked })}
                />
                <ToggleRow
                  label="Concept Explanation"
                  description="Explain complex topics"
                  checked={config.mentor.conceptExplanation}
                  onCheckedChange={(checked) => updateMentor({ conceptExplanation: checked })}
                />
                <ToggleRow
                  label="Encouragement"
                  description="Celebrate progress and achievements"
                  checked={config.mentor.encouragement}
                  onCheckedChange={(checked) => updateMentor({ encouragement: checked })}
                />
                <ToggleRow
                  label="Voice Enabled"
                  description="Mentor can speak responses"
                  checked={config.mentor.voiceEnabled}
                  onCheckedChange={(checked) => updateMentor({ voiceEnabled: checked })}
                />
              </FeatureCard>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default NeuroTools;
