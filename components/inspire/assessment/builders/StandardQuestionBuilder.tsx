'use client';

import { useState } from 'react';
import type { FormData } from '../types';

interface StandardQuestionBuilderProps {
  data: FormData;
  onChange: (key: string, value: string) => void;
}

export function StandardQuestionBuilder({
  data,
  onChange,
}: StandardQuestionBuilderProps): React.JSX.Element {
  const [bloomLevel, setBloomLevel] = useState('Remember');

  const bloomLevels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

  return (
    <div className="space-y-4">
      <div className="bg-lxd-dark-surface p-4 rounded-xl border border-lxd-dark-surface">
        <div className="flex justify-between mb-2">
          <label
            htmlFor="StandardQuestionBuilder-input-1"
            className="block text-sm font-bold text-lxd-text-light-secondary"
          >
            Question Stem
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-lxd-text-light-muted font-medium">Cognitive Level:</span>
            <select
              value={bloomLevel}
              onChange={(e) => setBloomLevel(e.target.value)}
              className="text-xs border border-lxd-dark-surface rounded p-1 bg-lxd-dark-page font-bold text-lxd-blue"
            >
              {bloomLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>
        <textarea
          className="w-full p-3 border border-lxd-dark-surface bg-lxd-dark-page rounded-lg h-20 text-sm focus:ring-2 focus:ring-lxd-blue outline-hidden text-lxd-text-light-body"
          placeholder="Write your question here..."
          value={data.question || ''}
          onChange={(e) => onChange('question', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="StandardQuestionBuilder-input-2"
            className="block text-xs font-bold text-lxd-success mb-1"
          >
            Correct Answer
          </label>
          <input
            className="w-full p-2 border border-lxd-success/30 bg-lxd-success/10 rounded text-sm text-lxd-text-light-body"
            placeholder="The right answer..."
            value={data.correctAnswer || ''}
            onChange={(e) => onChange('correctAnswer', e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="StandardQuestionBuilder-input-3"
            className="block text-xs font-bold text-lxd-error mb-1"
          >
            Distractors (Wrong Answers)
          </label>
          <textarea
            className="w-full p-2 border border-lxd-error/30 bg-lxd-error/10 rounded text-sm h-20 text-lxd-text-light-body"
            placeholder="Option B...&#10;Option C..."
            value={data.distractors || ''}
            onChange={(e) => onChange('distractors', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
