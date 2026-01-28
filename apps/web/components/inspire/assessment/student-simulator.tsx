'use client';

import type { AssessmentType, FormData } from './types';

interface StudentSimulatorProps {
  type: AssessmentType;
  data: FormData;
  onExit: () => void;
}

export function StudentSimulator({ type, data, onExit }: StudentSimulatorProps): React.JSX.Element {
  return (
    <div className="fixed inset-0 bg-lxd-dark-page z-50 flex flex-col animate-in fade-in duration-300">
      <div className="bg-lxd-dark-surface text-lxd-text-light-heading p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-lxd-success px-3 py-1 rounded-full text-xs font-bold text-lxd-dark-page animate-pulse">
            LIVE PREVIEW
          </div>
          <h2 className="font-bold">Student View Simulator</h2>
        </div>
        <button
          type="button"
          onClick={onExit}
          className="px-4 py-2 bg-lxd-dark-page hover:bg-lxd-dark-page/80 rounded-lg text-sm font-bold"
        >
          Exit Preview
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex justify-center">
        <div className="max-w-2xl w-full bg-lxd-dark-surface rounded-2xl shadow-xl p-8 border border-lxd-dark-surface">
          {/* Header */}
          <div className="border-b border-lxd-dark-page pb-6 mb-6">
            <h1 className="text-3xl font-bold text-lxd-text-light-heading mb-2">
              {type.title} Assessment
            </h1>
            <p className="text-lxd-text-light-muted">Instructions: Complete the following tasks.</p>
          </div>

          {/* Scenario Rendering */}
          {type.id === 'scenario' && (
            <div className="space-y-6">
              <div className="bg-lxd-blue/10 p-6 rounded-xl border border-lxd-blue/20 text-lxd-text-light-body text-lg leading-relaxed">
                <span className="font-bold uppercase text-xs tracking-wider text-lxd-blue block mb-2">
                  Scenario
                </span>
                {data.situation || 'No situation defined yet.'}
              </div>
              <div className="p-6 rounded-xl border border-lxd-dark-surface">
                <h3 className="font-bold text-lxd-text-light-heading text-xl mb-4">
                  The Challenge
                </h3>
                <p className="text-lxd-text-light-secondary mb-6">
                  {data.challenge || 'No challenge defined yet.'}
                </p>
                <div className="space-y-3">
                  <button
                    type="button"
                    className="w-full text-left p-4 rounded-lg border border-lxd-dark-surface hover:border-lxd-blue hover:bg-lxd-blue/10 transition-all font-medium text-lxd-text-light-secondary"
                  >
                    Option A (Simulated Click)
                  </button>
                  <button
                    type="button"
                    className="w-full text-left p-4 rounded-lg border border-lxd-dark-surface hover:border-lxd-blue hover:bg-lxd-blue/10 transition-all font-medium text-lxd-text-light-secondary"
                  >
                    Option B (Simulated Click)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Standard/Rubric Rendering */}
          {type.id !== 'scenario' && (
            <div className="space-y-8">
              {data.question && (
                <div>
                  <h3 className="text-xl font-bold text-lxd-text-light-heading mb-4">Question 1</h3>
                  <p className="text-lg text-lxd-text-light-secondary mb-6">{data.question}</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border border-lxd-dark-surface rounded-lg hover:bg-lxd-dark-page cursor-pointer">
                      <div className="w-5 h-5 rounded-full border-2 border-lxd-text-light-muted"></div>
                      <span className="text-lxd-text-light-secondary">
                        {data.correctAnswer || 'Correct Answer Placeholder'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 border border-lxd-dark-surface rounded-lg hover:bg-lxd-dark-page cursor-pointer">
                      <div className="w-5 h-5 rounded-full border-2 border-lxd-text-light-muted"></div>
                      <span className="text-lxd-text-light-secondary">
                        {data.distractors?.split('\n')[0] || 'Distractor 1 Placeholder'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {(data.rubric_ExceedsExpectations || data.rubric_MeetsExpectations) && (
                <div className="mt-8 pt-8 border-t border-lxd-dark-surface">
                  <h4 className="font-bold text-lxd-text-light-muted uppercase text-xs mb-4">
                    Grading Rubric Visible to Student
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-lxd-success/10 p-3 rounded border border-lxd-success/20">
                      <strong className="text-lxd-success block mb-1">Exceeds</strong>
                      <span className="text-lxd-text-light-secondary">
                        {data.rubric_ExceedsExpectations || '...'}
                      </span>
                    </div>
                    <div className="bg-lxd-blue/10 p-3 rounded border border-lxd-blue/20">
                      <strong className="text-lxd-blue block mb-1">Meets</strong>
                      <span className="text-lxd-text-light-secondary">
                        {data.rubric_MeetsExpectations || '...'}
                      </span>
                    </div>
                    <div className="bg-lxd-warning/10 p-3 rounded border border-lxd-warning/20">
                      <strong className="text-lxd-warning block mb-1">Needs Work</strong>
                      <span className="text-lxd-text-light-secondary">
                        {data.rubric_NeedsImprovement || '...'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
