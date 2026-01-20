'use client';

import { BookOpen, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function Prerequisites(): React.JSX.Element {
  const [prerequisites, setPrerequisites] = useState([
    'Basic understanding of the subject matter',
    'Completion of previous module or course',
  ]);

  const addPrerequisite = (): void => {
    setPrerequisites([...prerequisites, 'New prerequisite']);
  };

  const removePrerequisite = (index: number): void => {
    setPrerequisites(prerequisites.filter((_, i) => i !== index));
  };

  const updatePrerequisite = (index: number, value: string): void => {
    const updated = [...prerequisites];
    updated[index] = value;
    setPrerequisites(updated);
  };

  return (
    <div className="border-l-4 border-block-interactive bg-linear-to-r from-caution to-white rounded-lg p-6 shadow-sm">
      <h4 className="mt-0 flex items-center gap-2.5 text-block-interactive font-bold text-lg mb-4">
        <BookOpen className="w-6 h-6" />
        Prerequisites
      </h4>
      <p className="text-sm text-lxd-text-dark-body mb-4">
        Before starting this lesson, you should have:
      </p>
      <ul className="space-y-3 mb-4">
        {prerequisites.map((prerequisite, index) => (
          <li key={index} className="flex items-start gap-2 group">
            <span className="text-block-interactive mt-1 font-bold">✓</span>
            {/* biome-ignore lint/a11y/useSemanticElements: contentEditable requires div with role="textbox" for rich text */}
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => updatePrerequisite(index, e.currentTarget.textContent || '')}
              role="textbox"
              tabIndex={0}
              aria-label={`Prerequisite ${index + 1}`}
              className="flex-1 outline-hidden focus:ring-2 focus:ring-block-interactive rounded px-2 py-1"
            >
              {prerequisite}
            </div>
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => removePrerequisite(index)}
              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
            >
              <X className="w-4 h-4 text-brand-error" />
            </Button>
          </li>
        ))}
      </ul>
      <Button
        onClick={addPrerequisite}
        variant="secondary"
        size="sm"
        className="text-block-interactive border-block-interactive bg-transparent"
      >
        <Plus className="w-4 h-4 mr-1" />
        Add Prerequisite
      </Button>
    </div>
  );
}
