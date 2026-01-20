'use client';

import { TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';

export function ProgressIndicator(): React.JSX.Element {
  const [progress, setProgress] = useState(65);
  const [label, setLabel] = useState('Lesson Progress');

  return (
    <div className="bg-linear-to-r from-brand-accent-muted to-brand-accent-muted rounded-lg p-6 border border-brand-primary-muted">
      <div className="flex items-center justify-between mb-3">
        <h4
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setLabel(e.currentTarget.textContent || '')}
          className="mt-0 flex items-center gap-2 text-brand-primary-hover font-semibold outline-hidden focus:ring-2 focus:ring-lxd-secondary rounded px-2"
        >
          <TrendingUp className="w-5 h-5" />
          {label}
        </h4>
        <span className="text-2xl font-bold text-brand-primary-hover">{progress}%</span>
      </div>
      <Progress value={progress} className="h-3 mb-3" />
      <div className="flex gap-2">
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="flex-1 accent-lxd-secondary"
        />
      </div>
      <p className="text-sm text-lxd-text-dark-body mt-2">
        Adjust the slider to set progress level
      </p>
    </div>
  );
}
