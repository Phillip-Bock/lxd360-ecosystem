import { Plus, X } from 'lucide-react';
import type { TimelineBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface TimelineBlockEditorProps {
  block: TimelineBlock;
  onChange: (content: TimelineBlock['content']) => void;
}

export const TimelineBlockEditor = ({
  block,
  onChange,
}: TimelineBlockEditorProps): React.JSX.Element => {
  const addEvent = (): void => {
    onChange({
      ...block.content,
      events: [
        ...block.content.events,
        { id: `event_${Date.now()}`, date: '', title: '', description: '' },
      ],
    });
  };

  const removeEvent = (id: string): void => {
    onChange({
      ...block.content,
      events: block.content.events.filter((event) => event.id !== id),
    });
  };

  const updateEvent = (
    id: string,
    field: keyof TimelineBlock['content']['events'][0],
    value: string,
  ): void => {
    onChange({
      ...block.content,
      events: block.content.events.map((event) =>
        event.id === id ? { ...event, [field]: value } : event,
      ),
    });
  };

  return (
    <div className="space-y-3">
      <fieldset>
        <legend className="block text-sm font-medium text-brand-secondary mb-2">Orientation</legend>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`timeline-orientation-${block.id}`}
              checked={block.content.orientation === 'vertical'}
              onChange={() => onChange({ ...block.content, orientation: 'vertical' })}
              className="w-4 h-4 text-brand-blue"
            />
            <span className="text-sm text-brand-secondary">Vertical</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`timeline-orientation-${block.id}`}
              checked={block.content.orientation === 'horizontal'}
              onChange={() => onChange({ ...block.content, orientation: 'horizontal' })}
              className="w-4 h-4 text-brand-blue"
            />
            <span className="text-sm text-brand-secondary">Horizontal</span>
          </label>
        </div>
      </fieldset>
      <div className="space-y-3">
        <span className="block text-sm font-medium text-brand-secondary">Timeline Events</span>
        {block.content.events.map((event, index) => (
          <div key={event.id} className="border border-brand-strong rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-brand-secondary">Event {index + 1}</span>
              <button
                type="button"
                onClick={() => removeEvent(event.id)}
                className="ml-auto p-1 text-red-600 hover:bg-red-50 rounded"
                aria-label={`Remove event ${index + 1}`}
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div>
              <label
                htmlFor={`event-date-${event.id}`}
                className="block text-xs font-medium text-brand-secondary mb-1"
              >
                Date
              </label>
              <input
                id={`event-date-${event.id}`}
                type="text"
                value={event.date}
                onChange={(e) => updateEvent(event.id, 'date', e.target.value)}
                className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
                placeholder="e.g., 2024, Jan 15, or Q1 2024"
              />
            </div>
            <div>
              <label
                htmlFor={`event-title-${event.id}`}
                className="block text-xs font-medium text-brand-secondary mb-1"
              >
                Title
              </label>
              <input
                id={`event-title-${event.id}`}
                type="text"
                value={event.title}
                onChange={(e) => updateEvent(event.id, 'title', e.target.value)}
                className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
                placeholder="Event title"
              />
            </div>
            <div>
              <label
                htmlFor={`event-description-${event.id}`}
                className="block text-xs font-medium text-brand-secondary mb-1"
              >
                Description
              </label>
              <textarea
                id={`event-description-${event.id}`}
                value={event.description}
                onChange={(e) => updateEvent(event.id, 'description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
                placeholder="Event description"
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addEvent}
          className="flex items-center gap-2 px-4 py-2 text-brand-blue hover:bg-blue-50 rounded-lg"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Add Event
        </button>
      </div>
    </div>
  );
};
