'use client';

/**
 * TriggersPanel - Manage cross-object trigger rules
 * Allows creating interactions between different canvas objects
 */

import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  MousePointer,
  Play,
  Plus,
  Timer,
  Trash2,
  Volume2,
  Zap,
} from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { TriggerAction, TriggerEvent, TriggerRule } from '@/lib/studio/state-trigger-engine';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface ObjectInfo {
  id: string;
  name: string;
  type: string;
  states?: Array<{ id: string; name: string }>;
}

interface TriggersPanelProps {
  rules: TriggerRule[];
  objects: ObjectInfo[];
  onAddRule: (rule: Omit<TriggerRule, 'id'>) => string;
  onUpdateRule: (ruleId: string, updates: Partial<TriggerRule>) => void;
  onDeleteRule: (ruleId: string) => void;
  onEnableRule: (ruleId: string) => void;
  onDisableRule: (ruleId: string) => void;
  onClose?: () => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const EVENT_OPTIONS: Array<{ value: TriggerEvent['type']; label: string; icon: React.ReactNode }> =
  [
    { value: 'click', label: 'On Click', icon: <MousePointer className="h-3 w-3" /> },
    { value: 'hover-start', label: 'On Hover', icon: <MousePointer className="h-3 w-3" /> },
    { value: 'hover-end', label: 'On Hover End', icon: <MousePointer className="h-3 w-3" /> },
    { value: 'state-enter', label: 'State Enter', icon: <Zap className="h-3 w-3" /> },
    { value: 'state-exit', label: 'State Exit', icon: <Zap className="h-3 w-3" /> },
    { value: 'media-play', label: 'Media Play', icon: <Play className="h-3 w-3" /> },
    { value: 'media-pause', label: 'Media Pause', icon: <Volume2 className="h-3 w-3" /> },
    { value: 'media-end', label: 'Media End', icon: <Volume2 className="h-3 w-3" /> },
    { value: 'quiz-correct', label: 'Quiz Correct', icon: <Check className="h-3 w-3" /> },
    { value: 'quiz-incorrect', label: 'Quiz Incorrect', icon: <Zap className="h-3 w-3" /> },
    { value: 'timer', label: 'After Delay', icon: <Timer className="h-3 w-3" /> },
  ];

const ACTION_OPTIONS: Array<{ value: TriggerAction['type']; label: string }> = [
  { value: 'go-to-state', label: 'Go to State' },
  { value: 'show', label: 'Show' },
  { value: 'hide', label: 'Hide' },
  { value: 'toggle-visibility', label: 'Toggle Visibility' },
  { value: 'play-media', label: 'Play Media' },
  { value: 'pause-media', label: 'Pause Media' },
  { value: 'focus', label: 'Focus' },
  { value: 'scroll-to', label: 'Scroll To' },
];

// =============================================================================
// TRIGGER RULE CARD
// =============================================================================

interface TriggerRuleCardProps {
  rule: TriggerRule;
  objects: ObjectInfo[];
  onUpdate: (updates: Partial<TriggerRule>) => void;
  onDelete: () => void;
  onToggle: () => void;
}

function TriggerRuleCard({ rule, objects, onUpdate, onDelete, onToggle }: TriggerRuleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const sourceObject = objects.find((o) => o.id === rule.sourceObjectId);
  const targetObject = objects.find((o) => o.id === rule.targetObjectId);

  const eventLabel =
    EVENT_OPTIONS.find((e) => e.value === rule.sourceEvent.type)?.label || rule.sourceEvent.type;
  const actionLabel =
    ACTION_OPTIONS.find((a) => a.value === rule.targetAction.type)?.label || rule.targetAction.type;

  return (
    <div
      className={cn(
        'rounded-lg border transition-all',
        rule.enabled
          ? 'border-white/10 bg-zinc-900/50'
          : 'border-white/5 bg-zinc-900/30 opacity-60',
      )}
    >
      {/* Header */}
      <button
        type="button"
        className="p-3 flex items-center gap-2 cursor-pointer w-full text-left bg-transparent border-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <button
          type="button"
          className="w-5 h-5 flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-white truncate">{rule.name}</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-[10px] text-zinc-500">
            <span className="px-1.5 py-0.5 rounded bg-zinc-800 truncate max-w-20">
              {sourceObject?.name || rule.sourceObjectId}
            </span>
            <span className="text-zinc-600">{eventLabel}</span>
            <ArrowRight className="h-2.5 w-2.5" />
            <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary truncate max-w-20">
              {targetObject?.name || rule.targetObjectId}
            </span>
            <span className="text-primary">{actionLabel}</span>
          </div>
        </div>

        <Switch
          checked={rule.enabled}
          onCheckedChange={(_e) => {
            onToggle();
          }}
          className="scale-75"
          onClick={(e) => e.stopPropagation()}
        />
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-0 space-y-4 border-t border-white/5">
          {/* Rule Name */}
          <div className="space-y-2 pt-3">
            <Label className="text-xs text-zinc-400">Rule Name</Label>
            <Input
              value={rule.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="h-8 bg-zinc-900 border-white/10 text-sm"
            />
          </div>

          {/* Source */}
          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">When this object...</Label>
            <Select
              value={rule.sourceObjectId}
              onValueChange={(value) => onUpdate({ sourceObjectId: value })}
            >
              <SelectTrigger className="h-8 bg-zinc-900 border-white/10">
                <SelectValue placeholder="Select source object" />
              </SelectTrigger>
              <SelectContent>
                {objects.map((obj) => (
                  <SelectItem key={obj.id} value={obj.id}>
                    {obj.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Event */}
          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">...does this...</Label>
            <Select
              value={rule.sourceEvent.type}
              onValueChange={(value) =>
                onUpdate({
                  sourceEvent: { type: value as TriggerEvent['type'] } as TriggerEvent,
                })
              }
            >
              <SelectTrigger className="h-8 bg-zinc-900 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_OPTIONS.map((event) => (
                  <SelectItem key={event.value} value={event.value}>
                    <div className="flex items-center gap-2">
                      {event.icon}
                      {event.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* State selector for state-enter/state-exit */}
            {(rule.sourceEvent.type === 'state-enter' || rule.sourceEvent.type === 'state-exit') &&
              sourceObject?.states && (
                <Select
                  value={(rule.sourceEvent as { stateId?: string }).stateId || ''}
                  onValueChange={(value) =>
                    onUpdate({
                      sourceEvent: { ...rule.sourceEvent, stateId: value } as TriggerEvent,
                    })
                  }
                >
                  <SelectTrigger className="h-8 bg-zinc-900 border-white/10 mt-2">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceObject.states.map((state) => (
                      <SelectItem key={state.id} value={state.id}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

            {/* Timer delay */}
            {rule.sourceEvent.type === 'timer' && (
              <div className="space-y-1.5 mt-2">
                <Label className="text-[10px] text-zinc-500">Delay (ms)</Label>
                <Input
                  type="number"
                  value={(rule.sourceEvent as { delay?: number }).delay || 0}
                  onChange={(e) =>
                    onUpdate({
                      sourceEvent: {
                        ...rule.sourceEvent,
                        delay: Number(e.target.value),
                      } as TriggerEvent,
                    })
                  }
                  min={0}
                  step={100}
                  className="h-8 bg-zinc-900 border-white/10"
                />
              </div>
            )}
          </div>

          {/* Target */}
          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">...then this object...</Label>
            <Select
              value={rule.targetObjectId}
              onValueChange={(value) => onUpdate({ targetObjectId: value })}
            >
              <SelectTrigger className="h-8 bg-zinc-900 border-white/10">
                <SelectValue placeholder="Select target object" />
              </SelectTrigger>
              <SelectContent>
                {objects.map((obj) => (
                  <SelectItem key={obj.id} value={obj.id}>
                    {obj.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action */}
          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">...should...</Label>
            <Select
              value={rule.targetAction.type}
              onValueChange={(value) =>
                onUpdate({
                  targetAction: { type: value } as TriggerAction,
                })
              }
            >
              <SelectTrigger className="h-8 bg-zinc-900 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTION_OPTIONS.map((action) => (
                  <SelectItem key={action.value} value={action.value}>
                    {action.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* State selector for go-to-state */}
            {rule.targetAction.type === 'go-to-state' && targetObject?.states && (
              <Select
                value={(rule.targetAction as { stateId?: string }).stateId || ''}
                onValueChange={(value) =>
                  onUpdate({
                    targetAction: { ...rule.targetAction, stateId: value } as TriggerAction,
                  })
                }
              >
                <SelectTrigger className="h-8 bg-zinc-900 border-white/10 mt-2">
                  <SelectValue placeholder="Select target state" />
                </SelectTrigger>
                <SelectContent>
                  {targetObject.states.map((state) => (
                    <SelectItem key={state.id} value={state.id}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Delete Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete Rule
          </Button>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// TRIGGERS PANEL COMPONENT
// =============================================================================

export function TriggersPanel({
  rules,
  objects,
  onAddRule,
  onUpdateRule,
  onDeleteRule,
  onEnableRule,
  onDisableRule,
  onClose,
}: TriggersPanelProps) {
  const [_isAdding, _setIsAdding] = useState(false);

  const handleAddRule = useCallback(() => {
    const newRule: Omit<TriggerRule, 'id'> = {
      name: `Trigger ${rules.length + 1}`,
      enabled: true,
      sourceObjectId: objects[0]?.id || '',
      sourceEvent: { type: 'click' },
      targetObjectId: objects[1]?.id || objects[0]?.id || '',
      targetAction: { type: 'show' },
      conditions: [],
    };
    onAddRule(newRule);
  }, [rules.length, objects, onAddRule]);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-(--neural-bg)">
        {/* Header */}
        <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm text-white">Triggers</span>
            <span className="text-xs text-zinc-500">({rules.length})</span>
          </div>
          <div className="flex items-center gap-1">
            {onClose && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                <span className="text-lg">×</span>
              </Button>
            )}
          </div>
        </div>

        {/* Add Rule Button */}
        <div className="px-4 py-2 border-b border-white/5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full border-dashed border-white/20 hover:border-primary/50 hover:bg-primary/5"
            onClick={handleAddRule}
            disabled={objects.length === 0}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Trigger Rule
          </Button>
        </div>

        {/* Rules List */}
        <ScrollArea className="flex-1 px-4 py-2">
          <div className="space-y-2">
            {rules.length === 0 ? (
              <div className="py-8 text-center text-zinc-500">
                <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No trigger rules yet</p>
                <p className="text-xs mt-1">Add triggers to create interactions between objects</p>
                {objects.length === 0 && (
                  <p className="text-xs mt-3 text-amber-500">Add objects to the canvas first</p>
                )}
              </div>
            ) : (
              rules.map((rule) => (
                <TriggerRuleCard
                  key={rule.id}
                  rule={rule}
                  objects={objects}
                  onUpdate={(updates) => onUpdateRule(rule.id, updates)}
                  onDelete={() => onDeleteRule(rule.id)}
                  onToggle={() => (rule.enabled ? onDisableRule(rule.id) : onEnableRule(rule.id))}
                />
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer - Help Text */}
        <div className="px-4 py-2 border-t border-white/5 shrink-0">
          <p className="text-[10px] text-zinc-500 text-center">
            Triggers allow objects to control each other. When source event happens, target action
            executes.
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default TriggersPanel;
