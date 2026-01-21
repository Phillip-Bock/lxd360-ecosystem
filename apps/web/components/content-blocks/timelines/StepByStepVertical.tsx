'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function StepByStepVertical(): React.JSX.Element {
  const [steps, setSteps] = useState([
    {
      title: 'Step 1: Planning',
      description: 'Define the project goals and create a detailed plan.',
    },
    { title: 'Step 2: Design', description: 'Develop mockups and prototypes based on the plan.' },
    { title: 'Step 3: Development', description: 'Build the final product with all features.' },
  ]);

  const updateStep = (index: number, field: 'title' | 'description', value: string) => {
    setSteps((prev) => {
      const newSteps = [...prev];
      newSteps[index] = { ...newSteps[index], [field]: value };
      return newSteps;
    });
  };

  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      { title: `Step ${prev.length + 1}`, description: 'New step description...' },
    ]);
  };

  const removeStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-lxd-dark-page border border-lxd-dark-surface rounded-xl p-8 mb-6">
      <div className="relative pl-8 border-l-[3px] border-dashed border-lxd-blue">
        {steps.map((step, index) => (
          <div key={index} className="relative mb-8 last:mb-0 group">
            <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-lxd-dark-page border-[3px] border-lxd-blue" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeStep(index)}
              className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 h-6 w-6 text-lxd-error hover:text-lxd-error/80 hover:bg-lxd-error/20"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <h3
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => updateStep(index, 'title', e.currentTarget.textContent || '')}
              className="text-lg font-bold text-lxd-text-light-heading mb-2 outline-hidden focus:ring-2 focus:ring-lxd-blue rounded"
            >
              {step.title}
            </h3>
            <p
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => updateStep(index, 'description', e.currentTarget.textContent || '')}
              className="text-lxd-text-light-muted leading-relaxed outline-hidden focus:ring-2 focus:ring-lxd-blue rounded"
            >
              {step.description}
            </p>
          </div>
        ))}
      </div>
      <Button
        variant="ghost"
        onClick={addStep}
        className="mt-4 text-lxd-success hover:text-lxd-success hover:bg-lxd-success/10"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Step
      </Button>
    </div>
  );
}
