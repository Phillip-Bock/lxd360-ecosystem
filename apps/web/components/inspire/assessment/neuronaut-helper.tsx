'use client';

import { Brain, X } from 'lucide-react';
import { useState } from 'react';

interface NeuronautHelperProps {
  type: string;
  step: string;
}

export function NeuronautHelper({ type, step }: NeuronautHelperProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const askAi = async (): Promise<void> => {
    setLoading(true);
    // Note: In production, this would call your AI API endpoint
    const mockResponse = `Here are 3 examples for ${type} assessment, step "${step}":

1. Example question focusing on knowledge application
2. Scenario-based assessment with decision points
3. Reflective prompt for self-evaluation

These examples align with best practices for ${type} assessments.`;

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setResponse(mockResponse);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="bg-lxd-purple-dark hover:bg-lxd-purple text-lxd-text-light-heading p-4 rounded-full shadow-xl flex items-center gap-2 transition-all hover:scale-105"
        >
          <Brain size={24} />
          <span className="font-bold">Ask Neuro-naut</span>
        </button>
      )}

      {isOpen && (
        <div className="bg-lxd-dark-surface rounded-2xl shadow-2xl border border-lxd-dark-surface w-80 overflow-hidden animate-in slide-in-from-bottom-10">
          <div className="bg-lxd-purple-dark p-4 text-lxd-text-light-heading flex justify-between items-center">
            <div className="flex items-center gap-2 font-bold">
              <Brain size={18} /> Neuro-naut
            </div>
            <button type="button" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>
          <div className="p-4 bg-lxd-dark-page min-h-[200px] max-h-[400px] overflow-y-auto text-sm text-lxd-text-light-secondary">
            {!response && !loading && (
              <p>I can suggest questions, rubrics, or scenarios for this {type} assessment.</p>
            )}
            {loading && <div className="text-lxd-purple animate-pulse">Designing examples...</div>}
            {response && <div className="whitespace-pre-wrap">{response}</div>}
          </div>
          <div className="p-3 border-t border-lxd-dark-surface">
            <button
              type="button"
              onClick={askAi}
              className="w-full py-2 bg-lxd-purple/20 text-lxd-purple rounded-lg font-bold text-xs hover:bg-lxd-purple/30"
            >
              Generate Examples for this Step
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
