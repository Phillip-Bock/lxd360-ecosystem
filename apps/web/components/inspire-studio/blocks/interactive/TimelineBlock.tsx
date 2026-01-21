'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Bookmark,
  Calendar,
  CheckCircle,
  Circle,
  Edit3,
  Flag,
  GripVertical,
  Plus,
  Star,
  Trash2,
} from 'lucide-react';
import NextImage from 'next/image';
import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { safeInnerHtml } from '@/lib/sanitize';
import type { TimelineBlockContent, TimelineEvent } from '@/types/blocks';
import type { BlockComponentProps } from '../BlockRenderer';

const TIMELINE_ICONS = [
  { value: 'circle', label: 'Circle', icon: Circle },
  { value: 'check', label: 'Check', icon: CheckCircle },
  { value: 'star', label: 'Star', icon: Star },
  { value: 'flag', label: 'Flag', icon: Flag },
  { value: 'alert', label: 'Alert', icon: AlertCircle },
  { value: 'bookmark', label: 'Bookmark', icon: Bookmark },
  { value: 'calendar', label: 'Calendar', icon: Calendar },
];

const TIMELINE_COLORS = [
  'var(--secondary-blue)',
  'var(--accent-purple-light)',
  'var(--success)',
  'var(--warning)',
  'var(--error)',
  'var(--accent-cyan)',
  'var(--accent-pink)',
  'var(--text-muted-dark)',
];

const TIMELINE_LAYOUTS = [
  { value: 'vertical', label: 'Vertical' },
  { value: 'vertical-alternating', label: 'Vertical Alternating' },
  { value: 'horizontal', label: 'Horizontal' },
];

/**
 * TimelineBlock - Chronological timeline
 */
export function TimelineBlock({
  block,
  isEditing,
  onUpdate,
}: BlockComponentProps<TimelineBlockContent>): React.JSX.Element {
  const content = block.content as TimelineBlockContent;
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Default values - wrapped in useMemo to maintain stable references
  const events = useMemo(() => content.events || [], [content.events]);
  const layout = content.layout || 'vertical';
  const lineColor = content.lineColor || 'var(--studio-surface)';
  const animated = content.animated !== false;

  // Add new event
  const addEvent = useCallback(() => {
    const newEvent: TimelineEvent = {
      id: `event-${Date.now()}`,
      date: new Date().toLocaleDateString(),
      title: 'New Event',
      content: '',
      description: '',
      icon: 'circle',
      color: TIMELINE_COLORS[events.length % TIMELINE_COLORS.length],
    };
    onUpdate({
      content: {
        ...content,
        events: [...events, newEvent],
      },
    });
    setEditingEventId(newEvent.id);
  }, [content, events, onUpdate]);

  // Update event
  const updateEvent = useCallback(
    (eventId: string, updates: Partial<TimelineEvent>) => {
      onUpdate({
        content: {
          ...content,
          events: events.map((e) => (e.id === eventId ? { ...e, ...updates } : e)),
        },
      });
    },
    [content, events, onUpdate],
  );

  // Delete event
  const deleteEvent = useCallback(
    (eventId: string) => {
      onUpdate({
        content: {
          ...content,
          events: events.filter((e) => e.id !== eventId),
        },
      });
      if (editingEventId === eventId) setEditingEventId(null);
    },
    [content, events, editingEventId, onUpdate],
  );

  // Get icon component
  const getIcon = (iconType: string): typeof Circle => {
    const found = TIMELINE_ICONS.find((i) => i.value === iconType);
    return found?.icon || Circle;
  };

  // Render event
  const renderEvent = (
    event: TimelineEvent,
    index: number,
    isAlternate: boolean = false,
  ): React.ReactElement => {
    const Icon = getIcon(event.icon || 'circle');
    const isExpanded = expandedEvent === event.id;
    const isEventEditing = editingEventId === event.id;

    return (
      <motion.div
        key={event.id}
        initial={animated ? { opacity: 0, y: 20 } : undefined}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`
          relative flex items-start gap-4
          ${layout === 'vertical-alternating' && isAlternate ? 'flex-row-reverse text-right' : ''}
        `}
      >
        {/* Timeline marker */}
        <div className="relative z-10 shrink-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center border-4 bg-studio-bg-dark"
            style={{ backgroundColor: event.color }}
          >
            <Icon className="w-5 h-5 text-brand-primary" />
          </div>
        </div>

        {/* Content */}
        <div
          className={`
            flex-1 pb-8
            ${layout === 'vertical-alternating' && isAlternate ? 'pr-4' : 'pl-0'}
          `}
        >
          {/* Date */}
          <p className="text-sm text-studio-text-muted mb-1">{event.date}</p>

          {/* Card */}
          <button
            type="button"
            className={`
              w-full text-left p-4 rounded-lg border transition-all cursor-pointer
              ${
                isExpanded || isEventEditing
                  ? 'bg-studio-bg border-studio-accent/30'
                  : 'bg-studio-bg/50 border-studio-surface/30 hover:border-studio-surface'
              }
            `}
            onClick={() => !isEditing && setExpandedEvent(isExpanded ? null : event.id)}
          >
            <h4 className="font-medium text-brand-primary">{event.title}</h4>

            <AnimatePresence>
              {(isExpanded || isEventEditing) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {event.description && (
                    <div
                      className="mt-2 text-sm text-studio-text"
                      {...safeInnerHtml(event.description, 'rich')}
                    />
                  )}
                  {event.image && (
                    <NextImage
                      src={event.image}
                      alt=""
                      width={800}
                      height={600}
                      className="mt-3 rounded-lg max-w-full"
                      unoptimized
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.div>
    );
  };

  // Preview mode
  if (!isEditing) {
    if (events.length === 0) {
      return (
        <div className="p-4 text-center text-studio-text-muted border border-dashed border-studio-surface/50 rounded-lg">
          No timeline events
        </div>
      );
    }

    // Horizontal layout
    if (layout === 'horizontal') {
      return (
        <div className="relative overflow-x-auto pb-4">
          <div className="flex items-start gap-8 min-w-max px-4">
            {events.map((event, index) => {
              const Icon = getIcon(event.icon || 'circle');
              const isExpanded = expandedEvent === event.id;

              return (
                <motion.div
                  key={event.id}
                  initial={animated ? { opacity: 0, y: 20 } : undefined}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex flex-col items-center w-48"
                >
                  {/* Line */}
                  {index < events.length - 1 && (
                    <div
                      className="absolute top-5 left-1/2 w-full h-0.5"
                      style={{ backgroundColor: lineColor }}
                    />
                  )}

                  {/* Marker */}
                  <div
                    className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 bg-studio-bg-dark"
                    style={{ backgroundColor: event.color }}
                  >
                    <Icon className="w-5 h-5 text-brand-primary" />
                  </div>

                  {/* Content */}
                  <button
                    type="button"
                    className="mt-4 text-center cursor-pointer w-full"
                    onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                  >
                    <p className="text-xs text-studio-text-muted">{event.date}</p>
                    <h4 className="font-medium text-brand-primary mt-1">{event.title}</h4>
                    <AnimatePresence>
                      {isExpanded && event.description && (
                        <motion.p
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="text-sm text-studio-text mt-2"
                          {...safeInnerHtml(event.description, 'rich')}
                        />
                      )}
                    </AnimatePresence>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      );
    }

    // Vertical layouts
    return (
      <div className="relative">
        {/* Timeline line */}
        <div
          className={`
            absolute h-full w-0.5
            ${layout === 'vertical-alternating' ? 'left-1/2 -translate-x-1/2' : 'left-5'}
          `}
          style={{ backgroundColor: lineColor }}
        />

        {/* Events */}
        <div className={layout === 'vertical-alternating' ? 'space-y-0' : 'space-y-0'}>
          {events.map((event, index) => (
            <div key={event.id} className={layout === 'vertical-alternating' ? 'flex' : ''}>
              {layout === 'vertical-alternating' && (
                <>
                  <div className={`flex-1 ${index % 2 === 0 ? '' : 'order-2'}`}>
                    {index % 2 === 0 && renderEvent(event, index, false)}
                    {index % 2 === 1 && renderEvent(event, index, true)}
                  </div>
                  <div className="flex-1" />
                </>
              )}
              {layout === 'vertical' && renderEvent(event, index)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Edit mode
  return (
    <div className="space-y-4">
      {/* Settings bar */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Layout */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-studio-text-muted">Layout:</span>
          <select
            value={layout}
            onChange={(e) =>
              onUpdate({
                content: {
                  ...content,
                  layout: e.target.value as 'vertical' | 'vertical-alternating' | 'horizontal',
                },
              })
            }
            className="px-2 py-1.5 bg-studio-bg border border-studio-surface/50 rounded-lg text-brand-primary text-sm"
          >
            {TIMELINE_LAYOUTS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {/* Line color */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-studio-text-muted">Line:</span>
          <input
            type="color"
            value={typeof lineColor === 'string' ? lineColor : '#000000'}
            onChange={(e) => onUpdate({ content: { ...content, lineColor: e.target.value } })}
            className="w-8 h-8 rounded cursor-pointer"
          />
        </div>

        {/* Animation toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={animated}
            onChange={(e) => onUpdate({ content: { ...content, animated: e.target.checked } })}
            className="w-4 h-4 rounded border-studio-surface bg-studio-bg-dark text-studio-accent"
          />
          <span className="text-sm text-studio-text-muted">Animate</span>
        </label>

        {/* Add event */}
        <button
          type="button"
          onClick={addEvent}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-studio-accent hover:bg-studio-accent-hover transition-colors ml-auto"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      {/* Events list */}
      <div className="space-y-3">
        {events.length === 0 ? (
          <button
            type="button"
            className="w-full p-8 text-center border-2 border-dashed border-studio-surface/50 rounded-lg cursor-pointer hover:border-studio-accent/50 transition-colors"
            onClick={addEvent}
          >
            <Plus className="w-8 h-8 text-studio-text-muted mx-auto mb-2" aria-hidden="true" />
            <p className="text-studio-text-muted">Add your first timeline event</p>
          </button>
        ) : (
          events.map((event) => {
            const Icon = getIcon(event.icon || 'circle');
            const isEventEditing = editingEventId === event.id;

            return (
              <div
                key={event.id}
                className={`
                  p-4 rounded-lg border transition-colors
                  ${
                    isEventEditing
                      ? 'bg-studio-bg border-studio-accent/30'
                      : 'bg-studio-bg border-studio-surface/30 hover:border-studio-surface'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  {/* Drag handle */}
                  <button
                    type="button"
                    className="p-1 cursor-grab text-studio-text-muted hover:text-brand-primary"
                  >
                    <GripVertical className="w-4 h-4" />
                  </button>

                  {/* Icon marker */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: event.color }}
                  >
                    <Icon className="w-5 h-5 text-brand-primary" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={event.date}
                        onChange={(e) => updateEvent(event.id, { date: e.target.value })}
                        className="w-32 px-2 py-1 bg-transparent border-b border-studio-surface/50 text-sm text-studio-text-muted focus:border-studio-accent outline-hidden"
                        placeholder="Date..."
                      />
                      <input
                        type="text"
                        value={event.title}
                        onChange={(e) => updateEvent(event.id, { title: e.target.value })}
                        className="flex-1 bg-transparent text-brand-primary font-medium outline-hidden"
                        placeholder="Event title..."
                      />
                    </div>

                    {/* Expanded editor */}
                    {isEventEditing && (
                      <div className="space-y-3 pt-2 border-t border-studio-surface/30">
                        {/* Description */}
                        <textarea
                          value={event.description || ''}
                          onChange={(e) =>
                            updateEvent(event.id, {
                              description: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary text-sm resize-none"
                          rows={3}
                          placeholder="Event description (HTML)..."
                        />

                        {/* Icon & Color */}
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label
                              htmlFor={`icon-select-${event.id}`}
                              className="block text-xs text-studio-text-muted mb-1"
                            >
                              Icon
                            </label>
                            <select
                              id={`icon-select-${event.id}`}
                              value={event.icon || 'circle'}
                              onChange={(e) => updateEvent(event.id, { icon: e.target.value })}
                              className="w-full px-2 py-1.5 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary text-sm"
                            >
                              {TIMELINE_ICONS.map((i) => (
                                <option key={i.value} value={i.value}>
                                  {i.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <fieldset className="border-0 p-0 m-0">
                            <legend className="block text-xs text-studio-text-muted mb-1">
                              Color
                            </legend>
                            <div className="flex gap-1">
                              {TIMELINE_COLORS.map((color) => (
                                <button
                                  type="button"
                                  key={color}
                                  onClick={() => updateEvent(event.id, { color })}
                                  aria-label={`Select color ${color}`}
                                  aria-pressed={event.color === color}
                                  className={`
                                    w-6 h-6 rounded-full border-2 transition-transform
                                    ${event.color === color ? 'scale-110 border-white' : 'border-transparent hover:scale-105'}
                                  `}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </fieldset>
                        </div>

                        {/* Image URL */}
                        <div>
                          <label
                            htmlFor={`image-url-${event.id}`}
                            className="block text-xs text-studio-text-muted mb-1"
                          >
                            Image URL
                          </label>
                          <input
                            id={`image-url-${event.id}`}
                            type="url"
                            value={event.image || ''}
                            onChange={(e) => updateEvent(event.id, { image: e.target.value })}
                            className="w-full px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary text-sm"
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingEventId(isEventEditing ? null : event.id)}
                      className={`p-1 rounded transition-colors ${isEventEditing ? 'text-studio-accent' : 'text-studio-text-muted hover:text-brand-primary'}`}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteEvent(event.id)}
                      className="p-1 text-studio-text-muted hover:text-brand-error transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default TimelineBlock;
