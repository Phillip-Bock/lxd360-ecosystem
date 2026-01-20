'use client';

/**
 * TransitionEditor - Configure transitions between states
 */

import { ArrowRight, MousePointer, Play, Plus, Timer, Trash2, Volume2, Zap } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import type {
  EasingFunction,
  ObjectState,
  StateTransition,
  TransitionTrigger,
} from '@/types/studio/states';
import { EASING_PRESETS } from '@/types/studio/states';

// =============================================================================
// TYPES
// =============================================================================

interface TransitionEditorProps {
  states: ObjectState[];
  currentState: string;
  onAddTransition: (stateId: string, transition: Omit<StateTransition, 'id'>) => void;
  onUpdateTransition: (
    stateId: string,
    transitionId: string,
    updates: Partial<StateTransition>,
  ) => void;
  onRemoveTransition: (stateId: string, transitionId: string) => void;
}

// =============================================================================
// TRIGGER ICONS
// =============================================================================

const TRIGGER_ICONS: Record<string, React.ReactNode> = {
  click: <MousePointer className="h-3 w-3" />,
  hover: <MousePointer className="h-3 w-3" />,
  'hover-end': <MousePointer className="h-3 w-3" />,
  timer: <Timer className="h-3 w-3" />,
  scroll: <ArrowRight className="h-3 w-3" />,
  'media-end': <Volume2 className="h-3 w-3" />,
  'media-play': <Play className="h-3 w-3" />,
  'cross-object': <Zap className="h-3 w-3" />,
};

const TRIGGER_LABELS: Record<string, string> = {
  click: 'On Click',
  hover: 'On Hover',
  'hover-end': 'On Hover End',
  timer: 'After Delay',
  scroll: 'On Scroll',
  'scroll-in-view': 'Scroll Into View',
  'media-end': 'When Media Ends',
  'media-play': 'When Media Plays',
  'media-pause': 'When Media Pauses',
  'cross-object': 'Cross-Object Trigger',
  'quiz-correct': 'Quiz Correct',
  'quiz-incorrect': 'Quiz Incorrect',
  custom: 'Custom Event',
};

// =============================================================================
// TRANSITION CARD COMPONENT
// =============================================================================

interface TransitionCardProps {
  transition: StateTransition;
  states: ObjectState[];
  onUpdate: (updates: Partial<StateTransition>) => void;
  onRemove: () => void;
}

function TransitionCard({ transition, states, onUpdate, onRemove }: TransitionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const fromState = states.find((s) => s.id === transition.fromState);
  const toState = states.find((s) => s.id === transition.toState);

  return (
    <div
      className={cn(
        'rounded-lg border border-white/10 bg-zinc-900/50',
        !transition.enabled && 'opacity-50',
      )}
    >
      {/* Header */}
      <div className="p-3 flex items-center gap-2">
        <button
          type="button"
          className="flex items-center gap-2 cursor-pointer flex-1 text-left"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-1.5">
            {TRIGGER_ICONS[transition.trigger.type] || <Zap className="h-3 w-3" />}
            <span className="text-xs text-zinc-400">
              {TRIGGER_LABELS[transition.trigger.type] || transition.trigger.type}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-white">
              {fromState?.name || '?'}
            </span>
            <ArrowRight className="h-3 w-3 text-primary" />
            <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary">
              {toState?.name || '?'}
            </span>
          </div>
        </button>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] text-zinc-500">{transition.animation.duration}ms</span>
          <Switch
            checked={transition.enabled}
            onCheckedChange={(enabled) => onUpdate({ enabled })}
            className="scale-75"
          />
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-0 space-y-4 border-t border-white/5">
          {/* Trigger Config */}
          <div className="space-y-2 pt-3">
            <Label className="text-xs text-zinc-400">Trigger</Label>
            <Select
              value={transition.trigger.type}
              onValueChange={(type) =>
                onUpdate({
                  trigger: { ...transition.trigger, type: type as TransitionTrigger['type'] },
                })
              }
            >
              <SelectTrigger className="h-8 bg-zinc-900 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="click">On Click</SelectItem>
                <SelectItem value="hover">On Hover</SelectItem>
                <SelectItem value="hover-end">On Hover End</SelectItem>
                <SelectItem value="timer">After Delay</SelectItem>
                <SelectItem value="scroll-in-view">Scroll Into View</SelectItem>
                <SelectItem value="media-end">When Media Ends</SelectItem>
                <SelectItem value="quiz-correct">Quiz Correct</SelectItem>
                <SelectItem value="quiz-incorrect">Quiz Incorrect</SelectItem>
              </SelectContent>
            </Select>

            {transition.trigger.type === 'timer' && (
              <div className="space-y-2">
                <Label className="text-xs text-zinc-400">Delay (ms)</Label>
                <Input
                  type="number"
                  value={transition.trigger.config.delay || 0}
                  onChange={(e) =>
                    onUpdate({
                      trigger: {
                        ...transition.trigger,
                        config: { ...transition.trigger.config, delay: Number(e.target.value) },
                      },
                    })
                  }
                  min={0}
                  step={100}
                  className="h-8 bg-zinc-900 border-white/10"
                />
              </div>
            )}
          </div>

          {/* Animation Config */}
          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">Animation</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-[10px] text-zinc-500">Duration</Label>
                <Input
                  type="number"
                  value={transition.animation.duration}
                  onChange={(e) =>
                    onUpdate({
                      animation: { ...transition.animation, duration: Number(e.target.value) },
                    })
                  }
                  min={0}
                  step={50}
                  className="h-8 bg-zinc-900 border-white/10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] text-zinc-500">Delay</Label>
                <Input
                  type="number"
                  value={transition.animation.delay || 0}
                  onChange={(e) =>
                    onUpdate({
                      animation: { ...transition.animation, delay: Number(e.target.value) },
                    })
                  }
                  min={0}
                  step={50}
                  className="h-8 bg-zinc-900 border-white/10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] text-zinc-500">Easing</Label>
              <Select
                value={transition.animation.easing}
                onValueChange={(easing) =>
                  onUpdate({
                    animation: { ...transition.animation, easing: easing as EasingFunction },
                  })
                }
              >
                <SelectTrigger className="h-8 bg-zinc-900 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EASING_PRESETS).map(([name, value]) => (
                    <SelectItem key={name} value={value}>
                      {name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Delete Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10"
            onClick={onRemove}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Remove Transition
          </Button>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// TRANSITION EDITOR COMPONENT
// =============================================================================

export function TransitionEditor({
  states,
  currentState: _currentState,
  onAddTransition,
  onUpdateTransition,
  onRemoveTransition,
}: TransitionEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newFromState, setNewFromState] = useState<string>('');
  const [newToState, setNewToState] = useState<string>('');

  // Collect all transitions from all states
  const allTransitions = states.flatMap((state) =>
    state.transitions.map((t) => ({ ...t, stateId: state.id })),
  );

  const handleAddTransition = useCallback(() => {
    if (!newFromState || !newToState || newFromState === newToState) return;

    const newTransition: Omit<StateTransition, 'id'> = {
      name: `${states.find((s) => s.id === newFromState)?.name} → ${states.find((s) => s.id === newToState)?.name}`,
      fromState: newFromState,
      toState: newToState,
      trigger: { type: 'click', config: {} },
      animation: { duration: 300, easing: 'ease-out' },
      enabled: true,
    };

    onAddTransition(newFromState, newTransition);
    setIsAdding(false);
    setNewFromState('');
    setNewToState('');
  }, [newFromState, newToState, states, onAddTransition]);

  return (
    <div className="h-full flex flex-col">
      {/* Add Transition Form */}
      {isAdding ? (
        <div className="px-4 py-3 border-b border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-white">New Transition</Label>
            <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Select value={newFromState} onValueChange={setNewFromState}>
              <SelectTrigger className="h-8 bg-zinc-900 border-white/10 flex-1">
                <SelectValue placeholder="From state" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state.id} value={state.id}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <ArrowRight className="h-4 w-4 text-primary shrink-0" />

            <Select value={newToState} onValueChange={setNewToState}>
              <SelectTrigger className="h-8 bg-zinc-900 border-white/10 flex-1">
                <SelectValue placeholder="To state" />
              </SelectTrigger>
              <SelectContent>
                {states
                  .filter((s) => s.id !== newFromState)
                  .map((state) => (
                    <SelectItem key={state.id} value={state.id}>
                      {state.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            size="sm"
            className="w-full"
            onClick={handleAddTransition}
            disabled={!newFromState || !newToState}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Transition
          </Button>
        </div>
      ) : (
        <div className="px-4 py-2 border-b border-white/5">
          <Button
            variant="outline"
            size="sm"
            className="w-full border-dashed border-white/20 hover:border-primary/50 hover:bg-primary/5"
            onClick={() => setIsAdding(true)}
            disabled={states.length < 2}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Transition
          </Button>
        </div>
      )}

      {/* Transitions List */}
      <ScrollArea className="flex-1 px-4 py-2">
        <div className="space-y-2">
          {allTransitions.length === 0 ? (
            <div className="py-8 text-center text-zinc-500">
              <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No transitions yet</p>
              <p className="text-xs mt-1">Add a transition to animate between states</p>
            </div>
          ) : (
            allTransitions.map((transition) => (
              <TransitionCard
                key={transition.id}
                transition={transition}
                states={states}
                onUpdate={(updates) =>
                  onUpdateTransition(transition.stateId, transition.id, updates)
                }
                onRemove={() => onRemoveTransition(transition.stateId, transition.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default TransitionEditor;
