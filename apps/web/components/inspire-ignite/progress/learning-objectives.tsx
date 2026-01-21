'use client';

import { Plus, Target, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function LearningObjectives(): React.JSX.Element {
  const [objectives, setObjectives] = useState([
    'Understand the core concepts and principles',
    'Apply knowledge to real-world scenarios',
    'Analyze complex problems effectively',
  ]);

  const addObjective = (): void => {
    setObjectives([...objectives, 'New learning objective']);
  };

  const removeObjective = (index: number): void => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  const updateObjective = (index: number, value: string): void => {
    const updated = [...objectives];
    updated[index] = value;
    setObjectives(updated);
  };

  return (
    <div className="border-l-4 border-block-media bg-linear-to-r from-success to-white rounded-lg p-6 shadow-sm">
      <h4 className="mt-0 flex items-center gap-2.5 text-success font-bold text-lg mb-4">
        <Target className="w-6 h-6" />
        Learning Objectives
      </h4>
      <p className="text-sm text-lxd-text-dark-body mb-4">
        By the end of this lesson, you will be able to:
      </p>
      <ul className="space-y-3 mb-4">
        {objectives.map((objective, index) => (
          <li key={index} className="flex items-start gap-2 group">
            <span className="text-block-media mt-1 font-bold">•</span>
            {/* biome-ignore lint/a11y/useSemanticElements: contentEditable requires div with role="textbox" for rich text */}
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => updateObjective(index, e.currentTarget.textContent || '')}
              role="textbox"
              tabIndex={0}
              aria-label={`Objective ${index + 1}`}
              className="flex-1 outline-hidden focus:ring-2 focus:ring-block-media rounded px-2 py-1"
            >
              {objective}
            </div>
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => removeObjective(index)}
              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
            >
              <X className="w-4 h-4 text-brand-error" />
            </Button>
          </li>
        ))}
      </ul>
      <Button
        onClick={addObjective}
        variant="secondary"
        size="sm"
        className="text-success border-block-media bg-transparent"
      >
        <Plus className="w-4 h-4 mr-1" />
        Add Objective
      </Button>
    </div>
  );
}
