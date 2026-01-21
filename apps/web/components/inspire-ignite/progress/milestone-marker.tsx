'use client';

import { CheckCircle2, Flag } from 'lucide-react';
import { useState } from 'react';

export function MilestoneMarker(): React.JSX.Element {
  const [title, setTitle] = useState('Milestone Reached');
  const [description, setDescription] = useState(
    "You've completed a significant portion of your learning journey!",
  );
  const [milestoneNumber, setMilestoneNumber] = useState(1);
  const [totalMilestones, setTotalMilestones] = useState(5);

  return (
    <div className="relative bg-linear-to-r from-brand-primary-muted via-brand-primary-muted to-brand-primary-muted rounded-lg p-6 border-2 border-lxd-primary shadow-lg overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-lxd-primary opacity-10 rounded-full -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-lxd-primary opacity-10 rounded-full -ml-12 -mb-12" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-lxd-primary rounded-full p-3 shadow-md">
            <Flag className="w-6 h-6 text-brand-primary" />
          </div>
          <div className="flex-1">
            <h4
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => setTitle(e.currentTarget.textContent || '')}
              className="mt-0 text-brand-primary-hover font-bold text-xl outline-hidden focus:ring-2 focus:ring-lxd-primary rounded px-2"
            >
              {title}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-brand-primary-hover font-semibold">
                Milestone{' '}
                <input
                  type="number"
                  value={milestoneNumber}
                  onChange={(e) => setMilestoneNumber(Number(e.target.value))}
                  className="w-12 text-center bg-lxd-light-card rounded border border-lxd-primary outline-hidden px-1"
                  min="1"
                />{' '}
                of{' '}
                <input
                  type="number"
                  value={totalMilestones}
                  onChange={(e) => setTotalMilestones(Number(e.target.value))}
                  className="w-12 text-center bg-lxd-light-card rounded border border-lxd-primary outline-hidden px-1"
                  min="1"
                />
              </span>
            </div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-block-media fill-block-media" />
        </div>

        <p
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setDescription(e.currentTarget.textContent || '')}
          className="text-brand-primary-hover leading-relaxed outline-hidden focus:ring-2 focus:ring-lxd-primary rounded p-2"
        >
          {description}
        </p>

        <div className="mt-4 bg-lxd-light-card rounded-lg p-3 shadow-sm">
          <div className="flex gap-1">
            {Array.from({ length: totalMilestones }).map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  index < milestoneNumber ? 'bg-lxd-primary' : 'bg-lxd-light-surface'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
