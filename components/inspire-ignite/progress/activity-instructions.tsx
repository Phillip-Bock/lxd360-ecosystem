'use client';

import { ClipboardList, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function ActivityInstructions(): React.JSX.Element {
  const [title, setTitle] = useState('Activity: Apply Your Knowledge');
  const [description, setDescription] = useState('Follow these steps to complete the activity:');
  const [steps, setSteps] = useState([
    'Read through the scenario carefully',
    'Identify the key concepts from the lesson',
    'Apply the concepts to solve the problem',
    'Document your findings and reasoning',
  ]);

  const addStep = (): void => {
    setSteps([...steps, 'New step']);
  };

  const removeStep = (index: number): void => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, value: string): void => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  return (
    <div className="border-l-4 border-lxd-primary bg-linear-to-r from-brand-primary-muted to-white rounded-lg p-6 shadow-sm">
      <h4
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => setTitle(e.currentTarget.textContent || '')}
        className="mt-0 flex items-center gap-2.5 text-neural-purple font-bold text-lg mb-3 outline-hidden focus:ring-2 focus:ring-lxd-primary rounded px-2"
      >
        <ClipboardList className="w-6 h-6" />
        {title}
      </h4>
      <p
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => setDescription(e.currentTarget.textContent || '')}
        className="text-lxd-text-dark-body mb-4 outline-hidden focus:ring-2 focus:ring-lxd-primary rounded p-2"
      >
        {description}
      </p>
      <ol className="space-y-3 mb-4">
        {steps.map((step, index) => (
          <li key={index} className="flex items-start gap-3 group">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-lxd-primary text-brand-primary font-bold text-sm shrink-0 mt-0.5">
              {index + 1}
            </span>
            {/* biome-ignore lint/a11y/useSemanticElements: contentEditable requires div with role="textbox" for rich text */}
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => updateStep(index, e.currentTarget.textContent || '')}
              role="textbox"
              tabIndex={0}
              aria-label={`Step ${index + 1}`}
              className="flex-1 outline-hidden focus:ring-2 focus:ring-lxd-primary rounded px-2 py-1"
            >
              {step}
            </div>
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => removeStep(index)}
              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
            >
              <X className="w-4 h-4 text-brand-error" />
            </Button>
          </li>
        ))}
      </ol>
      <Button
        onClick={addStep}
        variant="secondary"
        size="sm"
        className="text-neural-purple border-lxd-primary bg-transparent"
      >
        <Plus className="w-4 h-4 mr-1" />
        Add Step
      </Button>
    </div>
  );
}
