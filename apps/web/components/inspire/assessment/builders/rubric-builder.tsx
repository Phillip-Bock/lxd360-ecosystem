'use client';

import { Gavel, RefreshCw, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { FormData } from '../types';

interface RubricBuilderProps {
  data: FormData;
  onChange: (key: string, value: string) => void;
}

export function RubricBuilder({ data, onChange }: RubricBuilderProps): React.JSX.Element {
  const [generating, setGenerating] = useState(false);

  const generateRubric = async (): Promise<void> => {
    setGenerating(true);
    // Note: In production, this would call your AI API endpoint
    const context = data.step_0_context || 'General Topic';

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock generated rubric
    onChange(
      'rubric_ExceedsExpectations',
      `Demonstrates exceptional understanding of ${context} with innovative application and synthesis of concepts.`,
    );
    onChange(
      'rubric_MeetsExpectations',
      `Shows adequate understanding of ${context} with correct application of key concepts.`,
    );
    onChange(
      'rubric_NeedsImprovement',
      `Demonstrates limited understanding of ${context} with significant gaps in application.`,
    );

    setGenerating(false);
  };

  const rubricLevels = ['Exceeds Expectations', 'Meets Expectations', 'Needs Improvement'];

  return (
    <div className="space-y-4">
      <div className="bg-lxd-dark-page p-4 rounded-xl border border-lxd-dark-surface">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-lxd-text-light-secondary flex items-center gap-2">
            <Gavel size={16} /> Rubric Criteria
          </h4>
          <button
            type="button"
            onClick={generateRubric}
            disabled={generating}
            className="text-xs bg-lxd-purple/20 text-lxd-purple px-3 py-1.5 rounded-lg font-bold hover:bg-lxd-purple/30 flex items-center gap-2"
          >
            {generating ? <RefreshCw className="animate-spin" size={12} /> : <Sparkles size={12} />}
            Auto-Generate with AI
          </button>
        </div>

        {rubricLevels.map((level) => (
          <div key={level} className="mb-3">
            <label
              htmlFor={`rubric-${level.replace(/ /g, '-').toLowerCase()}`}
              className="text-xs font-bold text-lxd-text-light-muted block mb-1"
            >
              {level}
            </label>
            <input
              id={`rubric-${level.replace(/ /g, '-').toLowerCase()}`}
              className="w-full p-2 border border-lxd-dark-surface bg-lxd-dark-surface rounded text-sm text-lxd-text-light-body"
              placeholder={`Criteria for ${level}...`}
              value={data[`rubric_${level.replace(/ /g, '')}` as keyof FormData] || ''}
              onChange={(e) => onChange(`rubric_${level.replace(/ /g, '')}`, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
