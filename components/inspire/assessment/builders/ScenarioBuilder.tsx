'use client';

import { Layers } from 'lucide-react';
import type { FormData } from '../types';

interface ScenarioBuilderProps {
  data: FormData;
  onChange: (key: string, value: string) => void;
}

export function ScenarioBuilder({ data, onChange }: ScenarioBuilderProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div className="bg-lxd-success/10 p-4 rounded-xl border border-lxd-success/20">
        <h4 className="font-bold text-lxd-success mb-2 flex items-center gap-2">
          <Layers size={16} /> Scenario Setup
        </h4>
        <textarea
          placeholder="Describe the realistic situation..."
          className="w-full p-3 rounded-lg border border-lxd-success/30 bg-lxd-dark-page focus:ring-2 focus:ring-lxd-success outline-hidden h-24 text-sm text-lxd-text-light-body"
          value={data.situation || ''}
          onChange={(e) => onChange('situation', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="ScenarioBuilder-input-1"
            className="text-xs font-bold text-lxd-text-light-muted uppercase"
          >
            The Conflict/Challenge
          </label>
          <textarea
            placeholder="What problem must they solve?"
            className="w-full p-3 rounded-lg border border-lxd-dark-surface bg-lxd-dark-page focus:ring-2 focus:ring-lxd-success outline-hidden h-32 text-sm mt-1 text-lxd-text-light-body"
            value={data.challenge || ''}
            onChange={(e) => onChange('challenge', e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="ScenarioBuilder-input-2"
            className="text-xs font-bold text-lxd-text-light-muted uppercase"
          >
            Decision Points
          </label>
          <textarea
            placeholder="Option A: ... (Correct)&#10;Option B: ... (Incorrect because...)"
            className="w-full p-3 rounded-lg border border-lxd-dark-surface bg-lxd-dark-page focus:ring-2 focus:ring-lxd-success outline-hidden h-32 text-sm mt-1 font-mono text-lxd-text-light-body"
            value={data.decisions || ''}
            onChange={(e) => onChange('decisions', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
