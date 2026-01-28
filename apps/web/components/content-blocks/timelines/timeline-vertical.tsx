'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export function TimelineVertical(): React.JSX.Element {
  const [events, setEvents] = useState([
    {
      year: '2020: Project Inception',
      description: 'Initial ideas were formed and the team was assembled.',
    },
    {
      year: '2022: First Prototype',
      description: 'A working model was developed and tested internally.',
    },
    { year: '2024: Public Launch', description: 'The product was released to the market.' },
  ]);

  const addEvent = () => {
    setEvents([...events, { year: 'Year: Title', description: 'Description here...' }]);
  };

  const removeEvent = (index: number) => {
    if (events.length > 1) {
      setEvents(events.filter((_, i) => i !== index));
    }
  };

  const updateEvent = (index: number, field: 'year' | 'description', value: string) => {
    const updated = [...events];
    updated[index][field] = value;
    setEvents(updated);
  };

  return (
    <div className="bg-lxd-dark-page border border-lxd-dark-surface rounded-2xl shadow-lg p-8 mb-6">
      <div className="relative pl-8 border-l-[3px] border-lxd-blue/30">
        {events.map((event, index) => (
          <div key={index} className="relative mb-8 last:mb-0 group">
            <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-lxd-dark-page border-[3px] border-lxd-blue" />
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => updateEvent(index, 'year', e.currentTarget.textContent || '')}
                  className="text-lg font-bold text-lxd-blue mb-2 outline-hidden focus:ring-2 focus:ring-lxd-blue rounded px-1"
                >
                  {event.year}
                </h3>
                <p
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    updateEvent(index, 'description', e.currentTarget.textContent || '')
                  }
                  className="text-lxd-text-light-secondary leading-relaxed outline-hidden focus:ring-2 focus:ring-lxd-blue rounded px-1"
                >
                  {event.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeEvent(index)}
                className="opacity-0 group-hover:opacity-100 p-1 text-lxd-error hover:text-lxd-error/80 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addEvent}
        className="mt-4 flex items-center gap-2 px-4 py-2 bg-lxd-blue/20 text-lxd-blue rounded-lg hover:bg-lxd-blue/30 transition-colors"
      >
        <Plus className="w-4 h-4" /> Add Event
      </button>
    </div>
  );
}
