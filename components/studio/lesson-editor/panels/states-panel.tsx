'use client';

/**
 * StatesPanel - Full-featured state management panel for canvas objects
 * Allows creating, editing, and managing object states and transitions
 */

import {
  Copy,
  Edit2,
  MoreHorizontal,
  Play,
  Plus,
  Save,
  Settings2,
  Sparkles,
  Trash2,
  Zap,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { ObjectState } from '@/types/studio/states';
import { STATE_PRESETS } from '@/types/studio/states';
import { StatePropertyEditor } from './state-property-editor';
import { TransitionEditor } from './transition-editor';

// =============================================================================
// TYPES
// =============================================================================

interface StatesPanelProps {
  objectId: string | null;
  objectName?: string;
  states: ObjectState[];
  currentState: string;
  isAnimating?: boolean;
  isDirty?: boolean;
  isSaving?: boolean;
  onAddState: (state: Omit<ObjectState, 'id'>) => string;
  onUpdateState: (stateId: string, updates: Partial<ObjectState>) => void;
  onDeleteState: (stateId: string) => void;
  onDuplicateState: (stateId: string) => string;
  onSetDefaultState: (stateId: string) => void;
  onGoToState: (stateId: string, animate?: boolean) => Promise<void>;
  onSave: () => Promise<void>;
  onClose?: () => void;
}

// =============================================================================
// STATE CARD COMPONENT
// =============================================================================

interface StateCardProps {
  state: ObjectState;
  isActive: boolean;
  isDefault: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  onPreview: () => void;
}

function StateCard({
  state,
  isActive,
  isDefault,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onSetDefault,
  onPreview,
}: StateCardProps) {
  return (
    <div
      className={cn(
        'group relative rounded-lg border p-3 transition-all',
        'hover:border-primary/50 hover:bg-primary/5',
        isActive
          ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
          : 'border-white/10 bg-zinc-900/50',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-2 cursor-pointer flex-1 text-left"
          onClick={onSelect}
        >
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              isActive ? 'bg-primary animate-pulse' : 'bg-zinc-600',
            )}
          />
          <span className="font-medium text-sm text-white">{state.name}</span>
          {isDefault && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">
              Default
            </span>
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 bg-[#1a1a2e] border-white/10">
            <DropdownMenuItem onClick={onPreview}>
              <Play className="h-3 w-3 mr-2" />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Edit2 className="h-3 w-3 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="h-3 w-3 mr-2" />
              Duplicate
            </DropdownMenuItem>
            {!isDefault && (
              <DropdownMenuItem onClick={onSetDefault}>
                <Sparkles className="h-3 w-3 mr-2" />
                Set as Default
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-red-400 focus:text-red-400"
              disabled={isDefault}
            >
              <Trash2 className="h-3 w-3 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Preview of properties */}
      <div className="mt-2 flex flex-wrap gap-1">
        {state.properties.opacity !== undefined && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
            opacity: {(state.properties.opacity * 100).toFixed(0)}%
          </span>
        )}
        {state.properties.scale !== undefined && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
            scale: {state.properties.scale}
          </span>
        )}
        {state.properties.x !== undefined && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
            x: {state.properties.x}px
          </span>
        )}
        {state.properties.y !== undefined && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
            y: {state.properties.y}px
          </span>
        )}
      </div>

      {/* Transitions count */}
      {state.transitions.length > 0 && (
        <div className="mt-2 flex items-center gap-1 text-[10px] text-zinc-500">
          <Zap className="h-3 w-3" />
          {state.transitions.length} transition{state.transitions.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// STATES PANEL COMPONENT
// =============================================================================

export function StatesPanel({
  objectId,
  objectName = 'Object',
  states,
  currentState,
  isAnimating = false,
  isDirty = false,
  isSaving = false,
  onAddState,
  onUpdateState,
  onDeleteState,
  onDuplicateState,
  onSetDefaultState,
  onGoToState,
  onSave,
  onClose,
}: StatesPanelProps) {
  const [activeTab, setActiveTab] = useState<'states' | 'transitions' | 'presets'>('states');
  const [editingStateId, setEditingStateId] = useState<string | null>(null);
  const [_showPresets, setShowPresets] = useState(false);

  const editingState = useMemo(
    () => states.find((s) => s.id === editingStateId),
    [states, editingStateId],
  );

  const handleAddState = useCallback(() => {
    const newId = onAddState({
      name: `State ${states.length + 1}`,
      isDefault: false,
      properties: {},
      transitions: [],
      sortOrder: states.length,
    });
    setEditingStateId(newId);
  }, [onAddState, states.length]);

  const handleApplyPreset = useCallback(
    (presetId: string) => {
      const preset = STATE_PRESETS.find((p) => p.id === presetId);
      if (!preset) return;

      // Clear existing states and add preset states
      for (const presetState of preset.states) {
        onAddState(presetState);
      }
      setShowPresets(false);
    },
    [onAddState],
  );

  if (!objectId) {
    return (
      <div className="flex flex-col h-full bg-[#0a0a0f] p-4">
        <div className="flex-1 flex items-center justify-center text-center">
          <div className="space-y-2">
            <Settings2 className="h-12 w-12 text-zinc-700 mx-auto" />
            <h3 className="text-sm font-medium text-zinc-400">No Object Selected</h3>
            <p className="text-xs text-zinc-500">
              Select an object on the canvas to manage its states
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-[#0a0a0f]">
        {/* Header */}
        <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm text-white">States</span>
            <span className="text-xs text-zinc-500">• {objectName}</span>
          </div>
          <div className="flex items-center gap-1">
            {isDirty && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={onSave}
                    disabled={isSaving}
                  >
                    <Save className={cn('h-3.5 w-3.5', isSaving && 'animate-pulse')} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save changes</TooltipContent>
              </Tooltip>
            )}
            {onClose && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                <span className="text-lg">×</span>
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as typeof activeTab)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="w-full justify-start px-4 pt-2 bg-transparent shrink-0">
            <TabsTrigger value="states" className="text-xs data-[state=active]:bg-primary/20">
              States ({states.length})
            </TabsTrigger>
            <TabsTrigger value="transitions" className="text-xs data-[state=active]:bg-primary/20">
              Transitions
            </TabsTrigger>
            <TabsTrigger value="presets" className="text-xs data-[state=active]:bg-primary/20">
              Presets
            </TabsTrigger>
          </TabsList>

          {/* States Tab */}
          <TabsContent value="states" className="flex-1 overflow-hidden m-0">
            <div className="h-full flex flex-col">
              {/* State Editor or List */}
              {editingState ? (
                <StatePropertyEditor
                  state={editingState}
                  onUpdate={(updates) => onUpdateState(editingState.id, updates)}
                  onClose={() => setEditingStateId(null)}
                />
              ) : (
                <>
                  {/* Add State Button */}
                  <div className="px-4 py-2 border-b border-white/5 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-dashed border-white/20 hover:border-primary/50 hover:bg-primary/5"
                      onClick={handleAddState}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add State
                    </Button>
                  </div>

                  {/* States List */}
                  <ScrollArea className="flex-1 px-4 py-2">
                    <div className="space-y-2">
                      {states
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((state) => (
                          <StateCard
                            key={state.id}
                            state={state}
                            isActive={state.id === currentState}
                            isDefault={state.isDefault}
                            onSelect={() => onGoToState(state.id, true)}
                            onEdit={() => setEditingStateId(state.id)}
                            onDuplicate={() => onDuplicateState(state.id)}
                            onDelete={() => onDeleteState(state.id)}
                            onSetDefault={() => onSetDefaultState(state.id)}
                            onPreview={() => onGoToState(state.id, true)}
                          />
                        ))}
                    </div>
                  </ScrollArea>
                </>
              )}
            </div>
          </TabsContent>

          {/* Transitions Tab */}
          <TabsContent value="transitions" className="flex-1 overflow-hidden m-0">
            <TransitionEditor
              states={states}
              currentState={currentState}
              onAddTransition={(stateId, transition) => {
                const state = states.find((s) => s.id === stateId);
                if (state) {
                  onUpdateState(stateId, {
                    transitions: [
                      ...state.transitions,
                      { ...transition, id: `trans_${Date.now()}` },
                    ],
                  });
                }
              }}
              onUpdateTransition={(stateId, transitionId, updates) => {
                const state = states.find((s) => s.id === stateId);
                if (state) {
                  onUpdateState(stateId, {
                    transitions: state.transitions.map((t) =>
                      t.id === transitionId ? { ...t, ...updates } : t,
                    ),
                  });
                }
              }}
              onRemoveTransition={(stateId, transitionId) => {
                const state = states.find((s) => s.id === stateId);
                if (state) {
                  onUpdateState(stateId, {
                    transitions: state.transitions.filter((t) => t.id !== transitionId),
                  });
                }
              }}
            />
          </TabsContent>

          {/* Presets Tab */}
          <TabsContent value="presets" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full px-4 py-2">
              <div className="space-y-2">
                {STATE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className="w-full p-3 rounded-lg border border-white/10 bg-zinc-900/50 hover:border-primary/50 hover:bg-primary/5 text-left transition-all"
                    onClick={() => handleApplyPreset(preset.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-white">{preset.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        {preset.category}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">{preset.description}</p>
                    <div className="flex gap-1 mt-2">
                      {preset.states.map((state, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary"
                        >
                          {state.name}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Footer - Animation Status */}
        {isAnimating && (
          <div className="h-10 border-t border-white/10 flex items-center justify-center gap-2 px-4 bg-primary/5 shrink-0">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-primary">Animating...</span>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

export default StatesPanel;
