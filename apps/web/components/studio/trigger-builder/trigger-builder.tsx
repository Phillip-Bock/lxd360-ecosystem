/**
 * TriggerBuilder - Phase 9
 * UI component for building and editing triggers
 */

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Code,
  Eye,
  Keyboard,
  type LucideIcon,
  MousePointer,
  Navigation,
  Pause,
  Play,
  Plus,
  Settings,
  Trash2,
  Variable,
  Volume2,
  Zap,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import type {
  ActionConfig,
  ActionType,
  AudioActionConfig,
  CustomEventConfig,
  JavaScriptActionConfig,
  KeyEventConfig,
  MouseEventConfig,
  NavigationActionConfig,
  StateActionConfig,
  TimerEventConfig,
  Trigger,
  TriggerAction,
  TriggerEventConfig,
  TriggerEventType,
  VariableActionConfig,
  VariableEventConfig,
  VisibilityActionConfig,
} from '@/types/studio/triggers';

// =============================================================================
// TYPES
// =============================================================================

interface TriggerBuilderProps {
  triggers: Trigger[];
  onChange: (triggers: Trigger[]) => void;
  className?: string;
  availableObjects?: { id: string; name: string; type: string }[];
  availableVariables?: { id: string; name: string; type: string }[];
  availableStates?: { objectId: string; states: { id: string; name: string }[] }[];
  availableSlides?: { id: string; name: string }[];
  availableLayers?: { id: string; name: string }[];
}

// =============================================================================
// CONSTANTS
// =============================================================================

const EVENT_TYPE_ICONS: Record<string, LucideIcon> = {
  click: MousePointer,
  'double-click': MousePointer,
  'mouse-enter': MousePointer,
  'mouse-leave': MousePointer,
  'key-press': Keyboard,
  'key-down': Keyboard,
  'key-up': Keyboard,
  focus: Eye,
  blur: Eye,
  'slide-enter': Navigation,
  'slide-exit': Navigation,
  delay: Clock,
  'variable-change': Variable,
  'media-play': Play,
  'media-pause': Pause,
  'custom-event': Zap,
};

const ACTION_TYPE_ICONS: Record<string, LucideIcon> = {
  show: Eye,
  hide: Eye,
  'toggle-visibility': Eye,
  'go-to-state': Settings,
  animate: Zap,
  'go-to-slide': Navigation,
  'go-to-next-slide': Navigation,
  'go-to-previous-slide': Navigation,
  'go-to-layer': Navigation,
  'play-media': Play,
  'pause-media': Pause,
  'set-variable': Variable,
  'play-sound': Volume2,
  'execute-javascript': Code,
};

const EVENT_CATEGORIES = [
  { key: 'mouse', label: 'Mouse', icon: MousePointer },
  { key: 'keyboard', label: 'Keyboard', icon: Keyboard },
  { key: 'focus', label: 'Focus', icon: Eye },
  { key: 'lifecycle', label: 'Lifecycle', icon: Navigation },
  { key: 'timer', label: 'Timer', icon: Clock },
  { key: 'variable', label: 'Variable', icon: Variable },
  { key: 'media', label: 'Media', icon: Play },
  { key: 'custom', label: 'Custom', icon: Zap },
];

const ACTION_CATEGORIES = [
  { key: 'visibility', label: 'Visibility', icon: Eye },
  { key: 'state', label: 'State', icon: Settings },
  { key: 'animation', label: 'Animation', icon: Zap },
  { key: 'navigation', label: 'Navigation', icon: Navigation },
  { key: 'media', label: 'Media', icon: Play },
  { key: 'variable', label: 'Variable', icon: Variable },
  { key: 'audio', label: 'Audio', icon: Volume2 },
  { key: 'custom', label: 'Custom', icon: Code },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TriggerBuilder({
  triggers,
  onChange,
  className,
  availableObjects = [],
  availableVariables = [],
  availableStates = [],
  availableSlides = [],
  availableLayers = [],
}: TriggerBuilderProps) {
  const [expandedTriggerId, setExpandedTriggerId] = useState<string | null>(null);
  const [showAddTrigger, setShowAddTrigger] = useState(false);

  // Create a new trigger
  const handleAddTrigger = useCallback(
    (eventType: TriggerEventType) => {
      const newTrigger: Trigger = {
        id: `trigger_${Date.now()}`,
        name: `New ${eventType} Trigger`,
        enabled: true,
        event: {
          type: eventType,
          config: getDefaultEventConfig(eventType),
        },
        actions: [],
        settings: {
          executeOnce: false,
          continueOnError: true,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onChange([...triggers, newTrigger]);
      setExpandedTriggerId(newTrigger.id);
      setShowAddTrigger(false);
    },
    [triggers, onChange],
  );

  // Delete a trigger
  const handleDeleteTrigger = useCallback(
    (triggerId: string) => {
      onChange(triggers.filter((t) => t.id !== triggerId));
      if (expandedTriggerId === triggerId) {
        setExpandedTriggerId(null);
      }
    },
    [triggers, onChange, expandedTriggerId],
  );

  // Update a trigger
  const handleUpdateTrigger = useCallback(
    (triggerId: string, updates: Partial<Trigger>) => {
      onChange(
        triggers.map((t) =>
          t.id === triggerId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t,
        ),
      );
    },
    [triggers, onChange],
  );

  // Toggle trigger enabled
  const handleToggleEnabled = useCallback(
    (triggerId: string) => {
      const trigger = triggers.find((t) => t.id === triggerId);
      if (trigger) {
        handleUpdateTrigger(triggerId, { enabled: !trigger.enabled });
      }
    },
    [triggers, handleUpdateTrigger],
  );

  // Add action to trigger
  const handleAddAction = useCallback(
    (triggerId: string, actionType: ActionType) => {
      const trigger = triggers.find((t) => t.id === triggerId);
      if (!trigger) return;

      const newAction: TriggerAction = {
        id: `action_${Date.now()}`,
        type: actionType,
        enabled: true,
        config: getDefaultActionConfig(actionType),
      };

      handleUpdateTrigger(triggerId, {
        actions: [...trigger.actions, newAction],
      });
    },
    [triggers, handleUpdateTrigger],
  );

  // Delete action from trigger
  const handleDeleteAction = useCallback(
    (triggerId: string, actionId: string) => {
      const trigger = triggers.find((t) => t.id === triggerId);
      if (!trigger) return;

      handleUpdateTrigger(triggerId, {
        actions: trigger.actions.filter((a) => a.id !== actionId),
      });
    },
    [triggers, handleUpdateTrigger],
  );

  // Update action
  const handleUpdateAction = useCallback(
    (triggerId: string, actionId: string, updates: Partial<TriggerAction>) => {
      const trigger = triggers.find((t) => t.id === triggerId);
      if (!trigger) return;

      handleUpdateTrigger(triggerId, {
        actions: trigger.actions.map((a) => (a.id === actionId ? { ...a, ...updates } : a)),
      });
    },
    [triggers, handleUpdateTrigger],
  );

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-neutral-200">Triggers</h3>
        <button
          type="button"
          onClick={() => setShowAddTrigger(!showAddTrigger)}
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-neural-cyan hover:bg-neural-cyan/10 rounded-sm transition-colors"
        >
          <Plus className="h-3 w-3" />
          Add Trigger
        </button>
      </div>

      {/* Add Trigger Panel */}
      <AnimatePresence>
        {showAddTrigger && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-neutral-800/50 rounded-xs border border-neutral-700">
              <p className="text-xs text-neutral-400 mb-2">Select trigger type:</p>
              <div className="grid grid-cols-2 gap-2">
                {EVENT_CATEGORIES.map((category) => (
                  <EventCategoryButton
                    key={category.key}
                    category={category}
                    onSelect={(eventType) => handleAddTrigger(eventType)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger List */}
      <div className="flex flex-col gap-2">
        {triggers.length === 0 ? (
          <p className="text-xs text-neutral-500 text-center py-4">
            No triggers defined. Click &quot;Add Trigger&quot; to create one.
          </p>
        ) : (
          triggers.map((trigger) => (
            <TriggerItem
              key={trigger.id}
              trigger={trigger}
              isExpanded={expandedTriggerId === trigger.id}
              onToggleExpand={() =>
                setExpandedTriggerId(expandedTriggerId === trigger.id ? null : trigger.id)
              }
              onToggleEnabled={() => handleToggleEnabled(trigger.id)}
              onDelete={() => handleDeleteTrigger(trigger.id)}
              onUpdate={(updates) => handleUpdateTrigger(trigger.id, updates)}
              onAddAction={(actionType) => handleAddAction(trigger.id, actionType)}
              onDeleteAction={(actionId) => handleDeleteAction(trigger.id, actionId)}
              onUpdateAction={(actionId, updates) =>
                handleUpdateAction(trigger.id, actionId, updates)
              }
              availableObjects={availableObjects}
              availableVariables={availableVariables}
              availableStates={availableStates}
              availableSlides={availableSlides}
              availableLayers={availableLayers}
            />
          ))
        )}
      </div>
    </div>
  );
}

// =============================================================================
// EVENT CATEGORY BUTTON
// =============================================================================

interface EventCategoryButtonProps {
  category: {
    key: string;
    label: string;
    icon: LucideIcon;
  };
  onSelect: (eventType: TriggerEventType) => void;
}

function EventCategoryButton({ category, onSelect }: EventCategoryButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = category.icon;

  const events = getEventsForCategory(category.key);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-neutral-300 hover:bg-neutral-700/50 rounded-xs transition-colors"
      >
        <Icon className="h-3 w-3 text-neural-cyan" />
        {category.label}
        <ChevronDown
          className={cn('h-3 w-3 ml-auto transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-1"
          >
            <div className="bg-neutral-900 border border-neutral-700 rounded-xs p-1">
              {events.map((event) => (
                <button
                  key={event}
                  type="button"
                  onClick={() => {
                    onSelect(event);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-2 py-1 text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-xs transition-colors"
                >
                  {formatEventType(event)}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// TRIGGER ITEM
// =============================================================================

interface TriggerItemProps {
  trigger: Trigger;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleEnabled: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<Trigger>) => void;
  onAddAction: (actionType: ActionType) => void;
  onDeleteAction: (actionId: string) => void;
  onUpdateAction: (actionId: string, updates: Partial<TriggerAction>) => void;
  availableObjects: { id: string; name: string; type: string }[];
  availableVariables: { id: string; name: string; type: string }[];
  availableStates: { objectId: string; states: { id: string; name: string }[] }[];
  availableSlides: { id: string; name: string }[];
  availableLayers: { id: string; name: string }[];
}

function TriggerItem({
  trigger,
  isExpanded,
  onToggleExpand,
  onToggleEnabled,
  onDelete,
  onUpdate,
  onAddAction,
  onDeleteAction,
  onUpdateAction,
  availableObjects,
  availableVariables,
  availableStates,
  availableSlides,
  availableLayers,
}: TriggerItemProps) {
  const [showAddAction, setShowAddAction] = useState(false);
  const EventIcon = EVENT_TYPE_ICONS[trigger.event.type] || Zap;

  return (
    <div
      className={cn(
        'border rounded-xs transition-colors',
        trigger.enabled
          ? 'border-neutral-700 bg-neutral-800/30'
          : 'border-neutral-800 bg-neutral-900/30 opacity-60',
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-2">
        <button
          type="button"
          onClick={onToggleExpand}
          className="p-0.5 hover:bg-neutral-700/50 rounded-xs transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-neutral-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-neutral-400" />
          )}
        </button>

        <EventIcon className="h-4 w-4 text-neural-cyan" />

        <input
          type="text"
          value={trigger.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="flex-1 bg-transparent text-sm text-neutral-200 outline-hidden focus:text-white"
        />

        <span className="text-xs text-neutral-500">{formatEventType(trigger.event.type)}</span>

        <button
          type="button"
          onClick={onToggleEnabled}
          className={cn(
            'px-2 py-0.5 text-xs rounded-xs transition-colors',
            trigger.enabled
              ? 'bg-green-500/20 text-green-400'
              : 'bg-neutral-700/50 text-neutral-500',
          )}
        >
          {trigger.enabled ? 'On' : 'Off'}
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="p-1 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-xs transition-colors"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 border-t border-neutral-700/50 space-y-4">
              {/* Actions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-neutral-400">
                    Actions ({trigger.actions.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddAction(!showAddAction)}
                    className="flex items-center gap-1 px-1.5 py-0.5 text-xs text-neural-cyan hover:bg-neural-cyan/10 rounded-xs transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    Add
                  </button>
                </div>

                {/* Add Action Panel */}
                <AnimatePresence>
                  {showAddAction && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mb-2"
                    >
                      <div className="p-2 bg-neutral-900/50 rounded-xs border border-neutral-700/50">
                        <div className="grid grid-cols-2 gap-1">
                          {ACTION_CATEGORIES.map((category) => (
                            <ActionCategoryButton
                              key={category.key}
                              category={category}
                              onSelect={(actionType) => {
                                onAddAction(actionType);
                                setShowAddAction(false);
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action List */}
                <div className="space-y-1">
                  {trigger.actions.length === 0 ? (
                    <p className="text-xs text-neutral-500 text-center py-2">
                      No actions. Add an action to define what happens.
                    </p>
                  ) : (
                    trigger.actions.map((action, index) => (
                      <ActionItem
                        key={action.id}
                        action={action}
                        index={index}
                        onDelete={() => onDeleteAction(action.id)}
                        onUpdate={(updates) => onUpdateAction(action.id, updates)}
                        availableObjects={availableObjects}
                        availableVariables={availableVariables}
                        availableStates={availableStates}
                        availableSlides={availableSlides}
                        availableLayers={availableLayers}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Settings */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-700/50">
                <label className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <input
                    type="checkbox"
                    checked={trigger.settings.executeOnce}
                    onChange={(e) =>
                      onUpdate({
                        settings: {
                          ...trigger.settings,
                          executeOnce: e.target.checked,
                        },
                      })
                    }
                    className="rounded-xs"
                  />
                  Execute once
                </label>

                <label className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <input
                    type="checkbox"
                    checked={trigger.settings.stopPropagation}
                    onChange={(e) =>
                      onUpdate({
                        settings: {
                          ...trigger.settings,
                          stopPropagation: e.target.checked,
                        },
                      })
                    }
                    className="rounded-xs"
                  />
                  Stop propagation
                </label>

                <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <span>Delay:</span>
                  <input
                    type="number"
                    value={trigger.settings.delay || 0}
                    onChange={(e) =>
                      onUpdate({
                        settings: {
                          ...trigger.settings,
                          delay: parseInt(e.target.value, 10) || 0,
                        },
                      })
                    }
                    className="w-16 px-1 py-0.5 bg-neutral-900 border border-neutral-700 rounded-xs text-neutral-200"
                    min={0}
                    step={100}
                  />
                  <span>ms</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// ACTION CATEGORY BUTTON
// =============================================================================

interface ActionCategoryButtonProps {
  category: {
    key: string;
    label: string;
    icon: LucideIcon;
  };
  onSelect: (actionType: ActionType) => void;
}

function ActionCategoryButton({ category, onSelect }: ActionCategoryButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = category.icon;

  const actions = getActionsForCategory(category.key);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-1.5 px-1.5 py-1 text-xs text-neutral-300 hover:bg-neutral-700/50 rounded-xs transition-colors"
      >
        <Icon className="h-3 w-3 text-neural-purple" />
        {category.label}
        <ChevronDown
          className={cn('h-3 w-3 ml-auto transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-0.5"
          >
            <div className="bg-neutral-800 border border-neutral-700 rounded-xs p-0.5">
              {actions.map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => {
                    onSelect(action);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-1.5 py-0.5 text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700 rounded-xs transition-colors"
                >
                  {formatActionType(action)}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// ACTION ITEM
// =============================================================================

interface ActionItemProps {
  action: TriggerAction;
  index: number;
  onDelete: () => void;
  onUpdate: (updates: Partial<TriggerAction>) => void;
  availableObjects: { id: string; name: string; type: string }[];
  availableVariables: { id: string; name: string; type: string }[];
  availableStates: { objectId: string; states: { id: string; name: string }[] }[];
  availableSlides: { id: string; name: string }[];
  availableLayers: { id: string; name: string }[];
}

function ActionItem({
  action,
  index,
  onDelete,
  onUpdate,
  availableObjects,
  availableVariables,
  availableSlides,
  availableLayers,
}: ActionItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const ActionIcon = ACTION_TYPE_ICONS[action.type] || Zap;

  return (
    <div
      className={cn(
        'border rounded-xs',
        action.enabled
          ? 'border-neutral-700/50 bg-neutral-900/30'
          : 'border-neutral-800/50 bg-neutral-900/50 opacity-60',
      )}
    >
      <div className="flex items-center gap-2 p-1.5">
        <span className="text-xs text-neutral-500 w-4">{index + 1}</span>
        <ActionIcon className="h-3 w-3 text-neural-purple" />
        <span className="flex-1 text-xs text-neutral-300">{formatActionType(action.type)}</span>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-0.5 text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          <Settings className="h-3 w-3" />
        </button>

        <button
          type="button"
          onClick={() => onUpdate({ enabled: !action.enabled })}
          className={cn(
            'px-1.5 py-0.5 text-xs rounded-xs transition-colors',
            action.enabled
              ? 'bg-green-500/20 text-green-400'
              : 'bg-neutral-700/50 text-neutral-500',
          )}
        >
          {action.enabled ? 'On' : 'Off'}
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="p-0.5 text-neutral-500 hover:text-red-400 transition-colors"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Expanded Config */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-2 border-t border-neutral-700/30 space-y-2">
              {/* Target Object */}
              {needsTarget(action.type) && (
                <div className="flex items-center gap-2">
                  <label
                    htmlFor={`action-target-${action.id}`}
                    className="text-xs text-neutral-500 w-16"
                  >
                    Target:
                  </label>
                  <select
                    id={`action-target-${action.id}`}
                    value={action.targetObjectId || ''}
                    onChange={(e) => onUpdate({ targetObjectId: e.target.value || undefined })}
                    className="flex-1 px-2 py-1 text-xs bg-neutral-900 border border-neutral-700 rounded-xs text-neutral-200"
                  >
                    <option value="">Self</option>
                    {availableObjects.map((obj) => (
                      <option key={obj.id} value={obj.id}>
                        {obj.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Slide selection for navigation */}
              {action.type === 'go-to-slide' && (
                <div className="flex items-center gap-2">
                  <label
                    htmlFor={`action-slide-${action.id}`}
                    className="text-xs text-neutral-500 w-16"
                  >
                    Slide:
                  </label>
                  <select
                    id={`action-slide-${action.id}`}
                    value={(action.config as NavigationActionConfig).slideId || ''}
                    onChange={(e) =>
                      onUpdate({
                        config: {
                          type: 'navigation',
                          slideId: e.target.value,
                        } as NavigationActionConfig,
                      })
                    }
                    className="flex-1 px-2 py-1 text-xs bg-neutral-900 border border-neutral-700 rounded-xs text-neutral-200"
                  >
                    <option value="">Select slide...</option>
                    {availableSlides.map((slide) => (
                      <option key={slide.id} value={slide.id}>
                        {slide.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Layer selection */}
              {(action.type === 'go-to-layer' || action.type === 'close-layer') && (
                <div className="flex items-center gap-2">
                  <label
                    htmlFor={`action-layer-${action.id}`}
                    className="text-xs text-neutral-500 w-16"
                  >
                    Layer:
                  </label>
                  <select
                    id={`action-layer-${action.id}`}
                    value={(action.config as NavigationActionConfig).layerId || ''}
                    onChange={(e) =>
                      onUpdate({
                        config: {
                          type: 'navigation',
                          layerId: e.target.value,
                        } as NavigationActionConfig,
                      })
                    }
                    className="flex-1 px-2 py-1 text-xs bg-neutral-900 border border-neutral-700 rounded-xs text-neutral-200"
                  >
                    <option value="">Select layer...</option>
                    {availableLayers.map((layer) => (
                      <option key={layer.id} value={layer.id}>
                        {layer.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Variable actions */}
              {isVariableAction(action.type) && (
                <>
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor={`action-variable-${action.id}`}
                      className="text-xs text-neutral-500 w-16"
                    >
                      Variable:
                    </label>
                    <select
                      id={`action-variable-${action.id}`}
                      value={(action.config as VariableActionConfig).variableId || ''}
                      onChange={(e) =>
                        onUpdate({
                          config: {
                            type: 'variable',
                            variableId: e.target.value,
                          } as VariableActionConfig,
                        })
                      }
                      className="flex-1 px-2 py-1 text-xs bg-neutral-900 border border-neutral-700 rounded-xs text-neutral-200"
                    >
                      <option value="">Select variable...</option>
                      {availableVariables.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {action.type === 'set-variable' && (
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={`action-value-${action.id}`}
                        className="text-xs text-neutral-500 w-16"
                      >
                        Value:
                      </label>
                      <input
                        id={`action-value-${action.id}`}
                        type="text"
                        value={String((action.config as VariableActionConfig).value || '')}
                        onChange={(e) =>
                          onUpdate({
                            config: {
                              type: 'variable',
                              variableId: (action.config as VariableActionConfig).variableId,
                              value: e.target.value,
                            } as VariableActionConfig,
                          })
                        }
                        className="flex-1 px-2 py-1 text-xs bg-neutral-900 border border-neutral-700 rounded-xs text-neutral-200"
                        placeholder="Value to set"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Delay */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor={`action-delay-${action.id}`}
                  className="text-xs text-neutral-500 w-16"
                >
                  Delay:
                </label>
                <input
                  id={`action-delay-${action.id}`}
                  type="number"
                  value={action.delay || 0}
                  onChange={(e) => onUpdate({ delay: parseInt(e.target.value, 10) || 0 })}
                  className="w-20 px-2 py-1 text-xs bg-neutral-900 border border-neutral-700 rounded-xs text-neutral-200"
                  min={0}
                  step={100}
                />
                <span className="text-xs text-neutral-500">ms</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function getEventsForCategory(category: string): TriggerEventType[] {
  const categoryMap: Record<string, TriggerEventType[]> = {
    mouse: ['click', 'double-click', 'mouse-enter', 'mouse-leave'],
    keyboard: ['key-press', 'key-down', 'key-up'],
    focus: ['focus', 'blur'],
    lifecycle: ['slide-enter', 'slide-exit', 'lesson-start', 'lesson-complete'],
    timer: ['delay', 'timer-start', 'timer-end'],
    variable: ['variable-change', 'variable-equals'],
    media: ['media-play', 'media-pause', 'media-ended'],
    custom: ['custom-event'],
  };
  return categoryMap[category] || [];
}

function getActionsForCategory(category: string): ActionType[] {
  const categoryMap: Record<string, ActionType[]> = {
    visibility: ['show', 'hide', 'toggle-visibility', 'fade-in', 'fade-out'],
    state: ['go-to-state', 'go-to-next-state', 'go-to-previous-state', 'reset-state'],
    animation: ['animate', 'stop-animation', 'pause-animation'],
    navigation: [
      'go-to-slide',
      'go-to-next-slide',
      'go-to-previous-slide',
      'go-to-layer',
      'close-layer',
    ],
    media: ['play-media', 'pause-media', 'stop-media', 'seek-media'],
    variable: ['set-variable', 'increment-variable', 'decrement-variable', 'toggle-variable'],
    audio: ['play-sound', 'stop-sound', 'stop-all-sounds'],
    custom: ['execute-javascript', 'dispatch-event'],
  };
  return categoryMap[category] || [];
}

function formatEventType(type: TriggerEventType): string {
  return type
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatActionType(type: ActionType): string {
  return type
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getDefaultEventConfig(type: TriggerEventType): TriggerEventConfig {
  switch (type) {
    case 'key-press':
    case 'key-down':
    case 'key-up':
      return { type: 'key' } as KeyEventConfig;
    case 'click':
    case 'double-click':
    case 'mouse-enter':
    case 'mouse-leave':
      return { type: 'mouse' } as MouseEventConfig;
    case 'variable-change':
    case 'variable-equals':
      return { type: 'variable', variableId: '' } as VariableEventConfig;
    case 'delay':
      return { type: 'timer', delay: 1000 } as TimerEventConfig;
    default:
      return { type: 'custom', eventName: '' } as CustomEventConfig;
  }
}

function getDefaultActionConfig(type: ActionType): ActionConfig {
  switch (type) {
    case 'show':
    case 'hide':
    case 'toggle-visibility':
    case 'fade-in':
    case 'fade-out':
      return { type: 'visibility' } as VisibilityActionConfig;
    case 'go-to-state':
      return { type: 'state', stateId: '' } as StateActionConfig;
    case 'go-to-slide':
      return { type: 'navigation', slideId: '' } as NavigationActionConfig;
    case 'go-to-layer':
    case 'close-layer':
      return { type: 'navigation', layerId: '' } as NavigationActionConfig;
    case 'set-variable':
    case 'increment-variable':
    case 'decrement-variable':
    case 'toggle-variable':
      return { type: 'variable', variableId: '' } as VariableActionConfig;
    case 'play-sound':
      return { type: 'audio', src: '' } as AudioActionConfig;
    case 'execute-javascript':
      return { type: 'javascript', code: '' } as JavaScriptActionConfig;
    default:
      return { type: 'visibility' } as VisibilityActionConfig;
  }
}

function needsTarget(type: ActionType): boolean {
  const targetActions: ActionType[] = [
    'show',
    'hide',
    'toggle-visibility',
    'fade-in',
    'fade-out',
    'go-to-state',
    'animate',
    'play-media',
    'pause-media',
    'stop-media',
    'seek-media',
    'focus-object',
    'scroll-to-object',
  ];
  return targetActions.includes(type);
}

function isVariableAction(type: ActionType): boolean {
  return [
    'set-variable',
    'increment-variable',
    'decrement-variable',
    'toggle-variable',
    'reset-variable',
  ].includes(type);
}

export default TriggerBuilder;
