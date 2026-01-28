'use client';

import { BookOpen, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function ReferencesBlock(): React.JSX.Element {
  const [references, setReferences] = useState([
    'Clark, R. C., & Mayer, R. E. (2016). E-learning and the science of instruction. John Wiley & Sons.',
    'Knowles, M. S., Holton, E. F., & Swanson, R. A. (2014). The adult learner. Routledge.',
  ]);

  const updateReference = (index: number, newValue: string) => {
    setReferences((prev) => {
      const newRefs = [...prev];
      newRefs[index] = newValue;
      return newRefs;
    });
  };

  const addReference = () => {
    setReferences((prev) => [...prev, 'New reference...']);
  };

  const removeReference = (index: number) => {
    setReferences((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-lxd-dark-page border border-lxd-dark-surface p-5 rounded-xl">
      <h4 className="flex items-center gap-2.5 text-lxd-blue font-semibold mb-4">
        <BookOpen className="w-5 h-5" />
        References & Citations
      </h4>
      <ol className="pl-5 space-y-3">
        {references.map((ref, index) => (
          <li key={index} className="flex items-start gap-2 group">
            <span className="text-lxd-purple-dark font-medium min-w-[24px]">{index + 1}.</span>
            {/* biome-ignore lint/a11y/useSemanticElements: contentEditable requires div with role="textbox" for rich text */}
            <div
              contentEditable
              suppressContentEditableWarning
              role="textbox"
              aria-label={`Reference ${index + 1}`}
              tabIndex={0}
              onBlur={(e) => updateReference(index, e.currentTarget.textContent || '')}
              className="flex-1 text-lxd-text-light-secondary text-sm outline-hidden focus:ring-2 focus:ring-lxd-blue rounded px-2 py-1 bg-lxd-dark-surface"
            >
              {ref}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeReference(index)}
              className="opacity-0 group-hover:opacity-100 h-6 w-6 text-lxd-error hover:text-lxd-error/80 hover:bg-lxd-error/20"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </li>
        ))}
      </ol>
      <Button
        variant="ghost"
        onClick={addReference}
        className="mt-4 text-lxd-success hover:text-lxd-success hover:bg-lxd-success/10"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Reference
      </Button>
    </div>
  );
}
