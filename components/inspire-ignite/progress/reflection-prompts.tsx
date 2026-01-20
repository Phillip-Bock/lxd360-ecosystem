'use client';

import { MessageCircle, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function ReflectionPrompts(): React.JSX.Element {
  const [prompts, setPrompts] = useState([
    'How does this concept relate to your previous knowledge or experience?',
    'What was the most challenging aspect of this lesson for you?',
    "How might you apply what you've learned in a real-world situation?",
  ]);

  const addPrompt = (): void => {
    setPrompts([...prompts, 'New reflection question']);
  };

  const removePrompt = (index: number): void => {
    setPrompts(prompts.filter((_, i) => i !== index));
  };

  const updatePrompt = (index: number, value: string): void => {
    const updated = [...prompts];
    updated[index] = value;
    setPrompts(updated);
  };

  return (
    <div className="border-2 border-block-assessment bg-linear-to-br from-block-assessment to-white rounded-lg p-6 shadow-md">
      <h4 className="mt-0 flex items-center gap-2.5 text-lxd-purple font-bold text-lg mb-4">
        <MessageCircle className="w-6 h-6" />
        Reflection Prompts
      </h4>
      <p className="text-sm text-lxd-text-dark-body mb-4">
        Take a moment to reflect on your learning:
      </p>
      <div className="space-y-4 mb-4">
        {prompts.map((prompt, index) => (
          <div
            key={index}
            className="bg-lxd-light-card rounded-lg p-4 shadow-sm border border-block-assessment group"
          >
            <div className="flex items-start gap-2 mb-2">
              <span className="text-block-assessment font-bold">Q{index + 1}:</span>
              {/* biome-ignore lint/a11y/useSemanticElements: contentEditable requires div with role="textbox" for rich text */}
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => updatePrompt(index, e.currentTarget.textContent || '')}
                role="textbox"
                tabIndex={0}
                aria-label={`Reflection prompt ${index + 1}`}
                className="flex-1 outline-hidden focus:ring-2 focus:ring-block-assessment rounded px-2 py-1 font-medium"
              >
                {prompt}
              </div>
              <Button
                variant="tertiary"
                size="sm"
                onClick={() => removePrompt(index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
              >
                <X className="w-4 h-4 text-brand-error" />
              </Button>
            </div>
            <Textarea placeholder="Your reflection..." className="mt-2 min-h-20 resize-none" />
          </div>
        ))}
      </div>
      <Button
        onClick={addPrompt}
        variant="secondary"
        size="sm"
        className="text-lxd-purple border-block-assessment bg-transparent"
      >
        <Plus className="w-4 h-4 mr-1" />
        Add Prompt
      </Button>
    </div>
  );
}
