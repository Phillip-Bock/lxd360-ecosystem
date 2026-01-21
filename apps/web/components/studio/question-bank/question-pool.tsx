'use client';

/**
 * QuestionPool - Phase 11
 * Configure random question draws from banks
 */

import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronRight,
  Dice5,
  GripVertical,
  Layers,
  Plus,
  Settings,
  Shuffle,
  Target,
  Timer,
  Trash2,
  Zap,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
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
  PoolSource,
  QuestionBank,
  QuestionPool as QuestionPoolType,
  QuestionType,
  SelectionStrategy,
} from '@/types/studio/question-bank';

// =============================================================================
// TYPES
// =============================================================================

interface QuestionPoolProps {
  pool: QuestionPoolType;
  banks: QuestionBank[];
  onChange: (updates: Partial<QuestionPoolType>) => void;
  onPreview?: () => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const STRATEGY_OPTIONS: Array<{ value: SelectionStrategy; label: string; description: string }> = [
  {
    value: 'random',
    label: 'Random',
    description: 'Pure random selection from available questions',
  },
  {
    value: 'weighted-random',
    label: 'Weighted Random',
    description: 'Weighted random based on source weights',
  },
  { value: 'sequential', label: 'Sequential', description: 'Questions in order from sources' },
  {
    value: 'adaptive',
    label: 'Adaptive',
    description: 'Based on learner mastery and weak areas',
  },
  {
    value: 'spaced-repetition',
    label: 'Spaced Repetition',
    description: 'SM-2 algorithm for optimal review timing',
  },
];

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  'multiple-choice': 'Multiple Choice',
  'multiple-select': 'Multiple Select',
  'true-false': 'True/False',
  'fill-in-blank': 'Fill in Blank',
  'short-answer': 'Short Answer',
  essay: 'Essay',
  matching: 'Matching',
  ordering: 'Ordering',
  hotspot: 'Hotspot',
  likert: 'Likert',
  ranking: 'Ranking',
  slider: 'Slider',
};

// =============================================================================
// SOURCE ITEM COMPONENT
// =============================================================================

interface SourceItemProps {
  source: PoolSource;
  bank: QuestionBank | undefined;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<PoolSource>) => void;
  onDelete: () => void;
}

function SourceItem({
  source,
  bank,
  index: _index,
  isExpanded,
  onToggle,
  onUpdate,
  onDelete,
}: SourceItemProps) {
  const availableCount = bank?.questions.length || 0;
  const filteredCount = useMemo(() => {
    if (!bank) return 0;
    return bank.questions.filter((q) => {
      if (source.tags?.length && !source.tags.some((t) => q.tags?.includes(t))) return false;
      if (source.questionTypes?.length && !source.questionTypes.includes(q.type)) return false;
      if (source.difficultyRange) {
        if (!q.difficulty) return true;
        if (q.difficulty < source.difficultyRange.min || q.difficulty > source.difficultyRange.max)
          return false;
      }
      return true;
    }).length;
  }, [bank, source]);

  return (
    <div className="rounded-lg border border-white/10 bg-zinc-900/50">
      {/* Header */}
      <div className="px-3 py-2 flex items-center gap-2">
        <GripVertical className="h-4 w-4 text-zinc-600 cursor-grab" />
        <button
          type="button"
          className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer text-left"
          onClick={onToggle}
        >
          <span className="w-5 h-5 flex items-center justify-center">
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-white truncate">
                {bank?.name || 'Unknown Bank'}
              </span>
              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                {filteredCount}/{availableCount}
              </Badge>
            </div>
            {source.weight !== undefined && source.weight !== 1 && (
              <span className="text-[10px] text-zinc-500">Weight: {source.weight}x</span>
            )}
          </div>
        </button>

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-red-400 opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 space-y-3 border-t border-white/5">
          {/* Weight */}
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-400">Source Weight</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[source.weight || 1]}
                onValueChange={([value]) => onUpdate({ weight: value })}
                min={0.1}
                max={5}
                step={0.1}
                className="flex-1"
              />
              <span className="text-sm text-white w-10 text-right">{source.weight || 1}x</span>
            </div>
          </div>

          {/* Max from source */}
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-400">Max Questions from Source</Label>
            <Input
              type="number"
              value={source.maxFromSource || ''}
              onChange={(e) =>
                onUpdate({ maxFromSource: e.target.value ? Number(e.target.value) : undefined })
              }
              placeholder="No limit"
              min={1}
              className="h-8 bg-zinc-900 border-white/10"
            />
          </div>

          {/* Question Types Filter */}
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-400">Question Types</Label>
            <div className="flex flex-wrap gap-1">
              {Object.entries(QUESTION_TYPE_LABELS).map(([type, label]) => {
                const isSelected = source.questionTypes?.includes(type as QuestionType);
                return (
                  <Badge
                    key={type}
                    variant={isSelected ? 'default' : 'outline'}
                    className="cursor-pointer text-[9px] px-1.5 py-0.5"
                    onClick={() => {
                      const current = source.questionTypes || [];
                      const updated = isSelected
                        ? current.filter((t) => t !== type)
                        : [...current, type as QuestionType];
                      onUpdate({ questionTypes: updated.length ? updated : undefined });
                    }}
                  >
                    {label}
                  </Badge>
                );
              })}
            </div>
            <p className="text-[10px] text-zinc-500">Click to toggle. Empty = all types.</p>
          </div>

          {/* Difficulty Range */}
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-400">Difficulty Range</Label>
            <div className="flex items-center gap-2">
              <Select
                value={String(source.difficultyRange?.min || '')}
                onValueChange={(v) =>
                  onUpdate({
                    difficultyRange: v
                      ? {
                          min: Number(v) as 1 | 2 | 3 | 4 | 5,
                          max: source.difficultyRange?.max || (5 as 1 | 2 | 3 | 4 | 5),
                        }
                      : undefined,
                  })
                }
              >
                <SelectTrigger className="w-24 h-7 bg-zinc-900 border-white/10 text-xs">
                  <SelectValue placeholder="Min" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  {[1, 2, 3, 4, 5].map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-zinc-500">to</span>
              <Select
                value={String(source.difficultyRange?.max || '')}
                onValueChange={(v) =>
                  onUpdate({
                    difficultyRange: source.difficultyRange?.min
                      ? {
                          min: source.difficultyRange.min,
                          max: Number(v) as 1 | 2 | 3 | 4 | 5,
                        }
                      : undefined,
                  })
                }
              >
                <SelectTrigger className="w-24 h-7 bg-zinc-900 border-white/10 text-xs">
                  <SelectValue placeholder="Max" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  {[1, 2, 3, 4, 5].map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags Filter */}
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-400">Filter by Tags</Label>
            <Input
              value={source.tags?.join(', ') || ''}
              onChange={(e) => {
                const tags = e.target.value
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean);
                onUpdate({ tags: tags.length ? tags : undefined });
              }}
              placeholder="Enter tags separated by commas"
              className="h-8 bg-zinc-900 border-white/10 text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function QuestionPool({ pool, banks, onChange, onPreview }: QuestionPoolProps) {
  const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set([0]));
  const [activeTab, setActiveTab] = useState('sources');

  // Toggle source expansion
  const toggleSource = useCallback((index: number) => {
    setExpandedSources((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  // Update a specific source
  const updateSource = useCallback(
    (index: number, updates: Partial<PoolSource>) => {
      const newSources = [...pool.sources];
      newSources[index] = { ...newSources[index], ...updates };
      onChange({ sources: newSources });
    },
    [pool.sources, onChange],
  );

  // Delete a source
  const deleteSource = useCallback(
    (index: number) => {
      const newSources = pool.sources.filter((_, i) => i !== index);
      onChange({ sources: newSources });
    },
    [pool.sources, onChange],
  );

  // Add a source
  const addSource = useCallback(
    (bankId: string) => {
      const newSource: PoolSource = { bankId, weight: 1 };
      onChange({ sources: [...pool.sources, newSource] });
      setExpandedSources((prev) => new Set([...prev, pool.sources.length]));
    },
    [pool.sources, onChange],
  );

  // Calculate total available questions
  const totalAvailable = useMemo(() => {
    let count = 0;
    for (const source of pool.sources) {
      const bank = banks.find((b) => b.id === source.bankId);
      if (bank) {
        count += bank.questions.length;
      }
    }
    return count;
  }, [pool.sources, banks]);

  // Validation
  const validation = useMemo(() => {
    const issues: string[] = [];
    if (pool.sources.length === 0) {
      issues.push('Add at least one question source');
    }
    if (pool.drawCount <= 0) {
      issues.push('Draw count must be greater than 0');
    }
    if (pool.drawCount > totalAvailable) {
      issues.push(`Draw count (${pool.drawCount}) exceeds available questions (${totalAvailable})`);
    }
    return issues;
  }, [pool, totalAvailable]);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f]">
      {/* Header */}
      <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <Dice5 className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm text-white">Question Pool</span>
        </div>
        <div className="flex items-center gap-2">
          {onPreview && (
            <Button variant="outline" size="sm" className="h-7" onClick={onPreview}>
              <Shuffle className="h-3 w-3 mr-1" />
              Preview Draw
            </Button>
          )}
        </div>
      </div>

      {/* Pool Name & Description */}
      <div className="px-4 py-3 border-b border-white/10 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-zinc-400">Pool Name</Label>
          <Input
            value={pool.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Enter pool name"
            className="h-8 bg-zinc-900 border-white/10"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-zinc-400">Description</Label>
          <Input
            value={pool.description || ''}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Optional description"
            className="h-8 bg-zinc-900 border-white/10"
          />
        </div>
      </div>

      {/* Validation Alerts */}
      {validation.length > 0 && (
        <div className="px-4 py-2 border-b border-white/10">
          <div className="flex items-start gap-2 text-amber-400">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <div className="space-y-0.5">
              {validation.map((issue, i) => (
                <p key={i} className="text-xs">
                  {issue}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="mx-4 mt-2 grid grid-cols-3 h-8">
          <TabsTrigger value="sources" className="text-xs gap-1">
            <Layers className="h-3 w-3" />
            Sources
          </TabsTrigger>
          <TabsTrigger value="randomization" className="text-xs gap-1">
            <Shuffle className="h-3 w-3" />
            Randomization
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs gap-1">
            <Settings className="h-3 w-3" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Sources Tab */}
        <TabsContent value="sources" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full px-4 py-3">
            <div className="space-y-3">
              {/* Draw Count */}
              <div className="flex items-center gap-4 p-3 rounded-lg bg-zinc-900/50 border border-white/10">
                <Target className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <Label className="text-xs text-zinc-400">Questions to Draw</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      value={pool.drawCount}
                      onChange={(e) => onChange({ drawCount: Number(e.target.value) })}
                      min={1}
                      max={totalAvailable || undefined}
                      className="h-8 w-24 bg-zinc-800 border-white/10"
                    />
                    <span className="text-sm text-zinc-500">of {totalAvailable} available</span>
                  </div>
                </div>
              </div>

              {/* Sources */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-zinc-400">Question Sources</Label>
                  <Select onValueChange={addSource}>
                    <SelectTrigger className="w-auto h-7 gap-1">
                      <Plus className="h-3 w-3" />
                      <span className="text-xs">Add Source</span>
                    </SelectTrigger>
                    <SelectContent>
                      {banks.map((bank) => (
                        <SelectItem key={bank.id} value={bank.id}>
                          {bank.name} ({bank.questions.length})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {pool.sources.length === 0 ? (
                  <div className="py-6 text-center text-zinc-500 border border-dashed border-white/10 rounded-lg">
                    <Layers className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No sources added</p>
                    <p className="text-xs mt-1">Add question banks to draw from</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pool.sources.map((source, index) => (
                      <SourceItem
                        key={`${source.bankId}-${index}`}
                        source={source}
                        bank={banks.find((b) => b.id === source.bankId)}
                        index={index}
                        isExpanded={expandedSources.has(index)}
                        onToggle={() => toggleSource(index)}
                        onUpdate={(updates) => updateSource(index, updates)}
                        onDelete={() => deleteSource(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Randomization Tab */}
        <TabsContent value="randomization" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full px-4 py-3">
            <div className="space-y-4">
              {/* Selection Strategy */}
              <div className="space-y-2">
                <Label className="text-xs text-zinc-400">Selection Strategy</Label>
                <div className="space-y-2">
                  {STRATEGY_OPTIONS.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      className={cn(
                        'w-full p-3 rounded-lg border cursor-pointer transition-colors text-left',
                        pool.selectionStrategy === option.value
                          ? 'border-primary bg-primary/10'
                          : 'border-white/10 hover:border-white/20',
                      )}
                      onClick={() => onChange({ selectionStrategy: option.value })}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                            pool.selectionStrategy === option.value
                              ? 'border-primary'
                              : 'border-white/20',
                          )}
                        >
                          {pool.selectionStrategy === option.value && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <span className="font-medium text-sm text-white">{option.label}</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1 ml-6">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Shuffle Settings */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-white">Shuffle Questions</Label>
                    <p className="text-xs text-zinc-500">Randomize question order</p>
                  </div>
                  <Switch
                    checked={pool.randomization.shuffleQuestions}
                    onCheckedChange={(checked) =>
                      onChange({
                        randomization: { ...pool.randomization, shuffleQuestions: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-white">Shuffle Choices</Label>
                    <p className="text-xs text-zinc-500">Randomize answer order within questions</p>
                  </div>
                  <Switch
                    checked={pool.randomization.shuffleChoices}
                    onCheckedChange={(checked) =>
                      onChange({
                        randomization: { ...pool.randomization, shuffleChoices: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-white">Lock Seed Per Learner</Label>
                    <p className="text-xs text-zinc-500">Same learner sees same questions</p>
                  </div>
                  <Switch
                    checked={pool.randomization.lockSeedPerLearner}
                    onCheckedChange={(checked) =>
                      onChange({
                        randomization: { ...pool.randomization, lockSeedPerLearner: checked },
                      })
                    }
                  />
                </div>
              </div>

              {/* Fixed Seed */}
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Fixed Seed (Optional)</Label>
                <Input
                  type="number"
                  value={pool.randomization.seed || ''}
                  onChange={(e) =>
                    onChange({
                      randomization: {
                        ...pool.randomization,
                        seed: e.target.value ? Number(e.target.value) : undefined,
                      },
                    })
                  }
                  placeholder="Leave empty for random"
                  className="h-8 bg-zinc-900 border-white/10"
                />
                <p className="text-[10px] text-zinc-500">
                  Set a seed for reproducible randomization during testing
                </p>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full px-4 py-3">
            <div className="space-y-4">
              {/* Presentation */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <Label className="text-sm text-white">Presentation</Label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-white">One at a Time</Label>
                    <p className="text-xs text-zinc-500">Show one question per screen</p>
                  </div>
                  <Switch
                    checked={pool.presentation.oneAtATime}
                    onCheckedChange={(checked) =>
                      onChange({ presentation: { ...pool.presentation, oneAtATime: checked } })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-white">Allow Navigation</Label>
                    <p className="text-xs text-zinc-500">Allow going back to previous questions</p>
                  </div>
                  <Switch
                    checked={pool.presentation.allowNavigation}
                    onCheckedChange={(checked) =>
                      onChange({ presentation: { ...pool.presentation, allowNavigation: checked } })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-white">Show Progress</Label>
                    <p className="text-xs text-zinc-500">Display progress indicator</p>
                  </div>
                  <Switch
                    checked={pool.presentation.showProgress}
                    onCheckedChange={(checked) =>
                      onChange({ presentation: { ...pool.presentation, showProgress: checked } })
                    }
                  />
                </div>
              </div>

              {/* Timing */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="h-4 w-4 text-primary" />
                  <Label className="text-sm text-white">Timing</Label>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Total Time Limit (seconds)</Label>
                  <Input
                    type="number"
                    value={pool.presentation.totalTimeLimit || ''}
                    onChange={(e) =>
                      onChange({
                        presentation: {
                          ...pool.presentation,
                          totalTimeLimit: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })
                    }
                    placeholder="No limit"
                    min={0}
                    className="h-8 bg-zinc-900 border-white/10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Time Per Question (seconds)</Label>
                  <Input
                    type="number"
                    value={pool.presentation.timePerQuestion || ''}
                    onChange={(e) =>
                      onChange({
                        presentation: {
                          ...pool.presentation,
                          timePerQuestion: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })
                    }
                    placeholder="No limit"
                    min={0}
                    className="h-8 bg-zinc-900 border-white/10"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-white">Show Timer</Label>
                    <p className="text-xs text-zinc-500">Display countdown timer</p>
                  </div>
                  <Switch
                    checked={pool.presentation.showTimer}
                    onCheckedChange={(checked) =>
                      onChange({ presentation: { ...pool.presentation, showTimer: checked } })
                    }
                  />
                </div>
              </div>

              {/* Scoring */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-4 w-4 text-primary" />
                  <Label className="text-sm text-white">Scoring</Label>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Passing Score (%)</Label>
                  <Input
                    type="number"
                    value={pool.scoring.passingScore || ''}
                    onChange={(e) =>
                      onChange({
                        scoring: {
                          ...pool.scoring,
                          passingScore: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })
                    }
                    placeholder="No passing threshold"
                    min={0}
                    max={100}
                    className="h-8 bg-zinc-900 border-white/10"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-white">Show Score Immediately</Label>
                    <p className="text-xs text-zinc-500">Display score after each question</p>
                  </div>
                  <Switch
                    checked={pool.scoring.showScoreImmediately}
                    onCheckedChange={(checked) =>
                      onChange({ scoring: { ...pool.scoring, showScoreImmediately: checked } })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-white">Show Correct Answers</Label>
                    <p className="text-xs text-zinc-500">Reveal answers after completion</p>
                  </div>
                  <Switch
                    checked={pool.scoring.showCorrectAnswers}
                    onCheckedChange={(checked) =>
                      onChange({ scoring: { ...pool.scoring, showCorrectAnswers: checked } })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-white">Allow Partial Credit</Label>
                    <p className="text-xs text-zinc-500">Give partial points for partial answers</p>
                  </div>
                  <Switch
                    checked={pool.scoring.allowPartialCredit}
                    onCheckedChange={(checked) =>
                      onChange({ scoring: { ...pool.scoring, allowPartialCredit: checked } })
                    }
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default QuestionPool;
