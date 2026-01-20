'use client';

import { Lightbulb } from 'lucide-react';

interface WizardOverlayProps {
  text: string;
  onGotIt: () => void;
}

export function WizardOverlay({ text, onGotIt }: WizardOverlayProps): React.JSX.Element {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-lxd-dark-page/60 backdrop-blur-xs animate-in fade-in duration-300">
      <div className="bg-lxd-dark-surface rounded-3xl p-8 max-w-lg w-full shadow-2xl border-4 border-lxd-blue/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-lxd-blue/20 rounded-full blur-2xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4 text-lxd-blue font-bold uppercase tracking-wider text-xs">
            <Lightbulb size={18} />
            <span>Assessment Strategy Insight</span>
          </div>
          <h3 className="text-2xl font-bold text-lxd-text-light-heading mb-4">Why this matters</h3>
          <p className="text-lxd-text-light-secondary leading-relaxed mb-8">{text}</p>
          <button
            type="button"
            onClick={onGotIt}
            className="w-full py-3 bg-lxd-blue text-lxd-text-light-heading font-bold rounded-xl hover:bg-lxd-blue/80 transition-all shadow-lg hover:shadow-lxd-blue/30"
          >
            Got it, let&apos;s build!
          </button>
        </div>
      </div>
    </div>
  );
}
