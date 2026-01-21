'use client';

/**
 * SessionPlanner - ILT/vILT Session Planning Component
 *
 * Provides a visual drag-and-drop interface for planning
 * instructor-led training sessions with timing and activities.
 */

import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clock,
  Coffee,
  Copy,
  GripVertical,
  Laptop,
  MessageSquare,
  Monitor,
  Pencil,
  Play,
  Plus,
  Settings,
  Trash2,
  Users,
  Video,
  Wand2,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type {
  ActivityType,
  DeliveryMode,
  ILTSession,
  InteractionLevel,
  SessionAgendaItem,
} from '@/types/studio/ilt';

// =============================================================================
// TYPES
// =============================================================================

interface SessionPlannerProps {
  /** Initial session data */
  session?: ILTSession;
  /** Callback when session changes */
  onChange?: (session: ILTSession) => void;
  /** Read-only mode */
  readOnly?: boolean;
  /** Additional class name */
  className?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const ACTIVITY_TYPES: Array<{
  value: ActivityType;
  label: string;
  icon: typeof Clock;
  color: string;
}> = [
  { value: 'presentation', label: 'Presentation', icon: Monitor, color: 'bg-blue-500' },
  { value: 'discussion', label: 'Discussion', icon: MessageSquare, color: 'bg-green-500' },
  { value: 'exercise', label: 'Exercise', icon: Pencil, color: 'bg-purple-500' },
  { value: 'breakout', label: 'Breakout', icon: Users, color: 'bg-orange-500' },
  { value: 'demo', label: 'Demo', icon: Play, color: 'bg-cyan-500' },
  { value: 'assessment', label: 'Assessment', icon: BookOpen, color: 'bg-red-500' },
  { value: 'break', label: 'Break', icon: Coffee, color: 'bg-zinc-500' },
  { value: 'icebreaker', label: 'Icebreaker', icon: Wand2, color: 'bg-pink-500' },
  { value: 'debrief', label: 'Debrief', icon: MessageSquare, color: 'bg-teal-500' },
  { value: 'q-and-a', label: 'Q&A', icon: MessageSquare, color: 'bg-indigo-500' },
  { value: 'role-play', label: 'Role Play', icon: Users, color: 'bg-amber-500' },
  { value: 'case-study', label: 'Case Study', icon: BookOpen, color: 'bg-emerald-500' },
  { value: 'hands-on-lab', label: 'Hands-on Lab', icon: Laptop, color: 'bg-violet-500' },
  { value: 'video', label: 'Video', icon: Video, color: 'bg-rose-500' },
  { value: 'reading', label: 'Reading', icon: BookOpen, color: 'bg-slate-500' },
  { value: 'reflection', label: 'Reflection', icon: Pencil, color: 'bg-lime-500' },
];

const INTERACTION_LEVELS: Array<{ value: InteractionLevel; label: string; color: string }> = [
  { value: 'passive', label: 'Passive', color: 'bg-zinc-400' },
  { value: 'moderate', label: 'Moderate', color: 'bg-blue-400' },
  { value: 'active', label: 'Active', color: 'bg-green-400' },
  { value: 'highly-active', label: 'Highly Active', color: 'bg-orange-400' },
];

const DEFAULT_SESSION: ILTSession = {
  id: '',
  title: 'New Training Session',
  deliveryMode: 'in-person',
  duration: 120,
  learningObjectives: [],
  agenda: [],
  materials: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  version: 1,
  status: 'draft',
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generateId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function calculateStartTimes(
  agenda: SessionAgendaItem[],
  sessionStartTime?: string,
): SessionAgendaItem[] {
  let cumulativeMinutes = 0;
  const startDate = sessionStartTime
    ? new Date(`2000-01-01T${sessionStartTime}`)
    : new Date(`2000-01-01T09:00`);

  return agenda.map((item) => {
    const startTime = new Date(startDate.getTime() + cumulativeMinutes * 60000);
    const timeString = startTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    cumulativeMinutes += item.duration;
    return { ...item, startTime: timeString };
  });
}

// =============================================================================
// ACTIVITY ITEM COMPONENT
// =============================================================================

interface ActivityItemProps {
  item: SessionAgendaItem;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (item: SessionAgendaItem) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  readOnly?: boolean;
}

function ActivityItem({
  item,
  index: _index,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onDelete,
  onDuplicate,
  readOnly,
}: ActivityItemProps) {
  const activityConfig = ACTIVITY_TYPES.find((a) => a.value === item.activityType);
  const interactionConfig = INTERACTION_LEVELS.find((i) => i.value === item.interactionLevel);
  const Icon = activityConfig?.icon || Clock;

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-white/5">
      {/* Header */}
      <button
        type="button"
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/5 w-full text-left"
        onClick={onToggleExpand}
      >
        {!readOnly && <GripVertical className="h-4 w-4 text-zinc-500 cursor-grab" />}

        <div
          className={cn('w-8 h-8 rounded flex items-center justify-center', activityConfig?.color)}
        >
          <Icon className="h-4 w-4 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-200 truncate">{item.title}</span>
            <span
              className={cn(
                'text-xs px-1.5 py-0.5 rounded',
                interactionConfig?.color,
                'text-white',
              )}
            >
              {interactionConfig?.label}
            </span>
          </div>
          <div className="text-xs text-zinc-500">
            {item.startTime} • {formatDuration(item.duration)}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!readOnly && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate();
                }}
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-400"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
          )}
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 border-t border-white/10 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor={`title-${item.id}`}>Title</Label>
              <Input
                id={`title-${item.id}`}
                value={item.title}
                onChange={(e) => onUpdate({ ...item, title: e.target.value })}
                disabled={readOnly}
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`duration-${item.id}`}>Duration (minutes)</Label>
              <Input
                id={`duration-${item.id}`}
                type="number"
                min={1}
                max={480}
                value={item.duration}
                onChange={(e) => onUpdate({ ...item, duration: parseInt(e.target.value, 10) || 5 })}
                disabled={readOnly}
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Activity Type</Label>
              <Select
                value={item.activityType}
                onValueChange={(v) => onUpdate({ ...item, activityType: v as ActivityType })}
                disabled={readOnly}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Interaction Level</Label>
              <Select
                value={item.interactionLevel}
                onValueChange={(v) =>
                  onUpdate({ ...item, interactionLevel: v as InteractionLevel })
                }
                disabled={readOnly}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTERACTION_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`description-${item.id}`}>Description</Label>
            <Textarea
              id={`description-${item.id}`}
              value={item.description || ''}
              onChange={(e) => onUpdate({ ...item, description: e.target.value })}
              disabled={readOnly}
              placeholder="Describe this activity..."
              className="bg-white/5 border-white/10 resize-none"
              rows={2}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`instructions-${item.id}`}>Facilitator Instructions</Label>
            <Textarea
              id={`instructions-${item.id}`}
              value={item.facilitatorInstructions || ''}
              onChange={(e) => onUpdate({ ...item, facilitatorInstructions: e.target.value })}
              disabled={readOnly}
              placeholder="Instructions for the facilitator..."
              className="bg-white/5 border-white/10 resize-none"
              rows={3}
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

export function SessionPlanner({
  session: initialSession,
  onChange,
  readOnly = false,
  className,
}: SessionPlannerProps) {
  const [session, setSession] = useState<ILTSession>(initialSession || DEFAULT_SESSION);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showSettings, setShowSettings] = useState(false);

  // Calculate total duration
  const totalAgendaDuration = useMemo(() => {
    return session.agenda.reduce((sum, item) => sum + item.duration, 0);
  }, [session.agenda]);

  // Calculate start times
  const agendaWithTimes = useMemo(() => {
    return calculateStartTimes(session.agenda, session.scheduledTime);
  }, [session.agenda, session.scheduledTime]);

  const updateSession = useCallback(
    (updates: Partial<ILTSession>) => {
      const updated = { ...session, ...updates, updatedAt: new Date().toISOString() };
      setSession(updated);
      onChange?.(updated);
    },
    [session, onChange],
  );

  const addActivity = useCallback(
    (activityType: ActivityType = 'presentation') => {
      const newItem: SessionAgendaItem = {
        id: generateId(),
        title: `New ${ACTIVITY_TYPES.find((a) => a.value === activityType)?.label || 'Activity'}`,
        activityType,
        duration: activityType === 'break' ? 10 : 15,
        interactionLevel: activityType === 'break' ? 'passive' : 'moderate',
      };

      updateSession({ agenda: [...session.agenda, newItem] });
      setExpandedItems((prev) => new Set(prev).add(newItem.id));
    },
    [session.agenda, updateSession],
  );

  const updateActivity = useCallback(
    (itemId: string, updates: SessionAgendaItem) => {
      updateSession({
        agenda: session.agenda.map((item) => (item.id === itemId ? updates : item)),
      });
    },
    [session.agenda, updateSession],
  );

  const deleteActivity = useCallback(
    (itemId: string) => {
      updateSession({
        agenda: session.agenda.filter((item) => item.id !== itemId),
      });
    },
    [session.agenda, updateSession],
  );

  const duplicateActivity = useCallback(
    (itemId: string) => {
      const item = session.agenda.find((a) => a.id === itemId);
      if (!item) return;

      const newItem = { ...item, id: generateId(), title: `${item.title} (Copy)` };
      const index = session.agenda.findIndex((a) => a.id === itemId);

      updateSession({
        agenda: [
          ...session.agenda.slice(0, index + 1),
          newItem,
          ...session.agenda.slice(index + 1),
        ],
      });
    },
    [session.agenda, updateSession],
  );

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          {readOnly ? (
            <h2 className="text-xl font-semibold text-zinc-200">{session.title}</h2>
          ) : (
            <Input
              value={session.title}
              onChange={(e) => updateSession({ title: e.target.value })}
              className="text-xl font-semibold bg-transparent border-0 border-b border-transparent hover:border-white/20 focus:border-white/40 rounded-none px-0"
            />
          )}
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDuration(session.duration)} session
            </span>
            <span className="flex items-center gap-1">
              {session.deliveryMode === 'virtual' ? (
                <Laptop className="h-4 w-4" />
              ) : session.deliveryMode === 'hybrid' ? (
                <Monitor className="h-4 w-4" />
              ) : (
                <Users className="h-4 w-4" />
              )}
              {session.deliveryMode === 'in-person'
                ? 'In-Person'
                : session.deliveryMode === 'virtual'
                  ? 'Virtual'
                  : 'Hybrid'}
            </span>
          </div>
        </div>

        {!readOnly && (
          <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && !readOnly && (
        <div className="p-4 rounded-lg border border-white/10 bg-white/5 space-y-4">
          <h3 className="text-sm font-medium text-zinc-300">Session Settings</h3>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>Delivery Mode</Label>
              <Select
                value={session.deliveryMode}
                onValueChange={(v) => updateSession({ deliveryMode: v as DeliveryMode })}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-person">In-Person</SelectItem>
                  <SelectItem value="virtual">Virtual (vILT)</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Total Duration: {formatDuration(session.duration)}</Label>
              <Slider
                value={[session.duration]}
                onValueChange={([v]) => updateSession({ duration: v })}
                min={30}
                max={480}
                step={15}
              />
            </div>

            <div className="grid gap-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={session.scheduledTime || '09:00'}
                onChange={(e) => updateSession({ scheduledTime: e.target.value })}
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea
              value={session.description || ''}
              onChange={(e) => updateSession({ description: e.target.value })}
              placeholder="Session description..."
              className="bg-white/5 border-white/10 resize-none"
              rows={2}
            />
          </div>
        </div>
      )}

      {/* Timeline Summary */}
      <div className="p-4 rounded-lg border border-white/10 bg-white/5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-zinc-300">Timeline</h3>
          <div className="text-sm text-zinc-400">
            {formatDuration(totalAgendaDuration)} of {formatDuration(session.duration)} planned
            {totalAgendaDuration > session.duration && (
              <span className="text-red-400 ml-2">
                (over by {formatDuration(totalAgendaDuration - session.duration)})
              </span>
            )}
          </div>
        </div>

        {/* Timeline Bar */}
        <div className="h-8 bg-white/10 rounded-lg overflow-hidden flex">
          {agendaWithTimes.map((item) => {
            const widthPercent = (item.duration / session.duration) * 100;
            const activityConfig = ACTIVITY_TYPES.find((a) => a.value === item.activityType);

            return (
              <div
                key={item.id}
                className={cn(
                  'h-full flex items-center justify-center text-xs text-white truncate px-1',
                  activityConfig?.color,
                )}
                style={{ width: `${Math.min(widthPercent, 100)}%` }}
                title={`${item.title} (${formatDuration(item.duration)})`}
              >
                {widthPercent > 10 && item.title}
              </div>
            );
          })}
          {totalAgendaDuration < session.duration && (
            <div
              className="h-full bg-white/5 flex items-center justify-center text-xs text-zinc-500"
              style={{
                width: `${((session.duration - totalAgendaDuration) / session.duration) * 100}%`,
              }}
            >
              Unplanned
            </div>
          )}
        </div>

        {/* Interaction Level Distribution */}
        <div className="mt-3 flex items-center gap-4 text-xs text-zinc-400">
          <span>Interaction:</span>
          {INTERACTION_LEVELS.map((level) => {
            const count = session.agenda.filter((a) => a.interactionLevel === level.value).length;
            const duration = session.agenda
              .filter((a) => a.interactionLevel === level.value)
              .reduce((sum, a) => sum + a.duration, 0);

            if (count === 0) return null;

            return (
              <span key={level.value} className="flex items-center gap-1">
                <span className={cn('w-2 h-2 rounded-full', level.color)} />
                {level.label}: {formatDuration(duration)}
              </span>
            );
          })}
        </div>
      </div>

      {/* Agenda Items */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-300">
            Agenda ({session.agenda.length} activities)
          </h3>
        </div>

        <div className="space-y-2">
          {agendaWithTimes.map((item, index) => (
            <ActivityItem
              key={item.id}
              item={item}
              index={index}
              isExpanded={expandedItems.has(item.id)}
              onToggleExpand={() => toggleExpand(item.id)}
              onUpdate={(updated) => updateActivity(item.id, updated)}
              onDelete={() => deleteActivity(item.id)}
              onDuplicate={() => duplicateActivity(item.id)}
              readOnly={readOnly}
            />
          ))}
        </div>

        {/* Add Activity */}
        {!readOnly && (
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addActivity('presentation')}
              className="gap-1"
            >
              <Plus className="h-3 w-3" />
              Add Activity
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addActivity('break')}
              className="gap-1"
            >
              <Coffee className="h-3 w-3" />
              Add Break
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addActivity('discussion')}
              className="gap-1"
            >
              <MessageSquare className="h-3 w-3" />
              Add Discussion
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addActivity('exercise')}
              className="gap-1"
            >
              <Pencil className="h-3 w-3" />
              Add Exercise
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
