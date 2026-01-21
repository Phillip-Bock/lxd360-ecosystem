'use client';

import { Lightbulb, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function KeyTakeaways(): React.JSX.Element {
  const [takeaways, setTakeaways] = useState([
    'Main concept or principle covered',
    'Key insight or learning point',
    'Practical application or next step',
  ]);

  const addTakeaway = (): void => {
    setTakeaways([...takeaways, 'New key takeaway']);
  };

  const removeTakeaway = (index: number): void => {
    setTakeaways(takeaways.filter((_, i) => i !== index));
  };

  const updateTakeaway = (index: number, value: string): void => {
    const updated = [...takeaways];
    updated[index] = value;
    setTakeaways(updated);
  };

  return (
    <div className="border-2 border-lxd-purple bg-linear-to-br from-brand-secondary-muted to-brand-secondary-muted rounded-lg p-6 shadow-md">
      <h4 className="mt-0 flex items-center gap-2.5 text-lxd-purple font-bold text-lg mb-4">
        <Lightbulb className="w-6 h-6 fill-block-interactive" />
        Key Takeaways
      </h4>
      <div className="space-y-3 mb-4">
        {takeaways.map((takeaway, index) => (
          <div
            key={index}
            className="flex items-start gap-3 bg-lxd-light-card rounded-lg p-3 shadow-sm border border-brand-secondary-muted group"
          >
            <span className="text-lxd-purple font-bold text-lg mt-0.5">{index + 1}.</span>
            {/* biome-ignore lint/a11y/useSemanticElements: contentEditable requires div with role="textbox" for rich text */}
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => updateTakeaway(index, e.currentTarget.textContent || '')}
              role="textbox"
              tabIndex={0}
              aria-label={`Takeaway ${index + 1}`}
              className="flex-1 outline-hidden focus:ring-2 focus:ring-lxd-purple rounded px-2 py-1"
            >
              {takeaway}
            </div>
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => removeTakeaway(index)}
              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
            >
              <X className="w-4 h-4 text-brand-error" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        onClick={addTakeaway}
        variant="secondary"
        size="sm"
        className="text-lxd-purple border-lxd-purple bg-transparent"
      >
        <Plus className="w-4 h-4 mr-1" />
        Add Takeaway
      </Button>
    </div>
  );
}
