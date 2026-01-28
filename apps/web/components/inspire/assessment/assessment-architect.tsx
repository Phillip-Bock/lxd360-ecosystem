'use client';

import {
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Download,
  Eye,
  HelpCircle,
  Save,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { ASSESSMENT_TYPES } from './assessment-data';
import { RubricBuilder, ScenarioBuilder, StandardQuestionBuilder } from './builders';
import { NeuronautHelper } from './neuronaut-helper';
import { StudentSimulator } from './student-simulator';
import type { AssessmentType, FormData } from './types';
import { WizardOverlay } from './wizard-overlay';

// Persistent state hook
function usePersistentState<T>(
  key: string,
  defaultValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const saved = localStorage.getItem(`assess-arch-${key}`);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      // Silently ignore - invalid localStorage data, return default value
      return defaultValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(`assess-arch-${key}`, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}

export function AssessmentArchitect(): React.JSX.Element {
  const [selectedType, setSelectedType] = useState<AssessmentType | null>(null);
  const [wizardMode, setWizardMode] = usePersistentState('wizard', true);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = usePersistentState<FormData>('form', {});
  const [showOverlay, setShowOverlay] = useState(false);
  const [showStudentView, setShowStudentView] = useState(false);

  useEffect(() => {
    if (selectedType && wizardMode && !showStudentView) {
      setShowOverlay(true);
    }
  }, [selectedType, wizardMode, showStudentView]);

  const handleTypeSelect = (type: AssessmentType): void => {
    setSelectedType(type);
    setCurrentStep(0);
    setFormData({});
  };

  const updateForm = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const renderBuilderContent = () => {
    if (!selectedType) return null;
    if (selectedType.id === 'scenario')
      return <ScenarioBuilder data={formData} onChange={updateForm} />;
    if (
      selectedType.id === 'criterion' ||
      selectedType.id === 'peer' ||
      selectedType.id === 'summative'
    )
      return <RubricBuilder data={formData} onChange={updateForm} />;
    return <StandardQuestionBuilder data={formData} onChange={updateForm} />;
  };

  const exportAssessment = () => {
    if (!selectedType) return;
    const text = `Assessment Plan: ${selectedType.title}\n\nData:\n${JSON.stringify(formData, null, 2)}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedType.title}_Assessment.txt`;
    a.click();
  };

  // --- STUDENT PREVIEW MODE ---
  if (showStudentView && selectedType) {
    return (
      <StudentSimulator
        type={selectedType}
        data={formData}
        onExit={() => setShowStudentView(false)}
      />
    );
  }

  // --- SPLASH SCREEN ---
  if (!selectedType) {
    return (
      <div className="min-h-screen bg-lxd-dark-page p-8 font-sans">
        <header className="max-w-6xl mx-auto mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-lxd-text-light-heading mb-2 flex items-center gap-3">
              <ClipboardCheck className="text-lxd-blue" size={40} />
              Assessment<span className="text-lxd-blue">Architect</span>
            </h1>
            <p className="text-lxd-text-light-muted">
              Select an assessment strategy to begin designing.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setWizardMode(!wizardMode)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
              wizardMode
                ? 'bg-lxd-blue text-lxd-text-light-heading shadow-lg'
                : 'bg-lxd-dark-surface border border-lxd-dark-surface text-lxd-text-light-secondary'
            }`}
          >
            {wizardMode ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
            {wizardMode ? 'Wizard Guidance ON' : 'Wizard Guidance OFF'}
          </button>
        </header>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ASSESSMENT_TYPES.map((type) => (
            <button
              type="button"
              key={type.id}
              onClick={() => handleTypeSelect(type)}
              className="group bg-lxd-dark-surface p-6 rounded-2xl border border-lxd-dark-surface hover:border-lxd-blue hover:shadow-xl transition-all text-left flex flex-col h-full"
            >
              <div
                className={`p-4 rounded-xl ${type.bgColor} w-fit mb-4 group-hover:scale-110 transition-transform`}
              >
                <type.icon className={type.color} size={32} />
              </div>
              <h3 className="text-xl font-bold text-lxd-text-light-heading mb-2">{type.title}</h3>
              <p className="text-sm text-lxd-text-light-muted mb-4 flex-1">{type.purpose}</p>
              <div className="mt-auto pt-4 border-t border-lxd-dark-page text-xs text-lxd-text-light-muted">
                <strong>Examples:</strong> {type.examples}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- BUILDER INTERFACE ---
  return (
    <div className="min-h-screen bg-lxd-dark-page font-sans relative flex flex-col">
      {showOverlay && (
        <WizardOverlay
          text={
            currentStep === 0
              ? selectedType.wizardContext
              : `Step ${currentStep + 1}: ${selectedType.steps[currentStep]}. Focus on alignment with your objectives.`
          }
          onGotIt={() => setShowOverlay(false)}
        />
      )}

      <header className="bg-lxd-dark-surface border-b border-lxd-dark-page px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSelectedType(null)}
            className="p-2 hover:bg-lxd-dark-page rounded-lg text-lxd-text-light-muted hover:text-lxd-text-light-secondary"
          >
            <ChevronLeft />
          </button>
          <div className={`p-2 rounded-lg ${selectedType.bgColor}`}>
            <selectedType.icon size={20} className={selectedType.color} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-lxd-text-light-heading">
              {selectedType.title} Builder
            </h1>
            <div className="flex items-center gap-2 text-xs text-lxd-text-light-muted">
              <span className="flex items-center gap-1 text-lxd-success">
                <Save size={10} /> Auto-Saving
              </span>
              <span>•</span>
              <span>
                Step {currentStep + 1} of {selectedType.steps.length}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowStudentView(true)}
            className="flex items-center gap-2 px-4 py-2 bg-lxd-dark-page text-lxd-text-light-heading rounded-lg text-xs font-bold hover:bg-lxd-dark-page/80 transition-colors"
          >
            <Eye size={16} /> Student View
          </button>
          <button
            type="button"
            onClick={() => setShowOverlay(true)}
            className="text-lxd-text-light-muted hover:text-lxd-blue"
          >
            <HelpCircle size={20} />
          </button>
          <button
            type="button"
            onClick={() => setWizardMode(!wizardMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              wizardMode
                ? 'bg-lxd-blue/20 text-lxd-blue'
                : 'bg-lxd-dark-page text-lxd-text-light-secondary'
            }`}
          >
            {wizardMode ? 'Wizard ON' : 'Wizard OFF'}
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto w-full p-8 flex-1 flex flex-col">
        <div className="bg-lxd-dark-surface rounded-2xl shadow-sm border border-lxd-dark-surface overflow-hidden flex-1 flex flex-col">
          <div className="h-1 w-full bg-lxd-dark-page">
            <div
              className={`h-full transition-all duration-500 ${selectedType.color.replace('text-', 'bg-')}`}
              style={{
                width: `${((currentStep + 1) / selectedType.steps.length) * 100}%`,
              }}
            ></div>
          </div>

          <div className="p-8 flex-1">
            <h2 className="text-2xl font-bold text-lxd-text-light-heading mb-6">
              {selectedType.steps[currentStep]}
            </h2>
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="mb-6">
                <label
                  htmlFor="AssessmentArchitect-input-1"
                  className="block text-sm font-bold text-lxd-text-light-secondary mb-2"
                >
                  Goal / Context for this Step
                </label>
                <textarea
                  className="w-full p-4 border border-lxd-dark-surface bg-lxd-dark-page rounded-xl text-sm focus:ring-2 focus:ring-lxd-blue outline-hidden h-24 resize-none text-lxd-text-light-body"
                  placeholder={`Define the ${selectedType.steps[currentStep]}...`}
                  value={formData[`step_${currentStep}_context`] || ''}
                  onChange={(e) => updateForm(`step_${currentStep}_context`, e.target.value)}
                />
              </div>
              <div className="border-t border-lxd-dark-page pt-6">
                <h3 className="text-sm font-bold text-lxd-text-light-muted uppercase tracking-wider mb-4">
                  Detailed Construction
                </h3>
                {renderBuilderContent()}
              </div>
            </div>
          </div>

          <div className="p-6 bg-lxd-dark-page border-t border-lxd-dark-surface flex justify-between items-center">
            <button
              type="button"
              onClick={() => currentStep > 0 && setCurrentStep((c) => c - 1)}
              disabled={currentStep === 0}
              className="px-6 py-2 rounded-lg font-bold text-lxd-text-light-muted hover:bg-lxd-dark-surface disabled:opacity-0"
            >
              Back
            </button>
            {currentStep < selectedType.steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((c) => c + 1)}
                className="px-8 py-3 bg-lxd-blue hover:bg-lxd-blue/80 text-lxd-text-light-heading rounded-xl font-bold shadow-lg shadow-lxd-blue/30 flex items-center gap-2"
              >
                Next Step <ChevronRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={exportAssessment}
                className="px-8 py-3 bg-lxd-success hover:bg-lxd-success/80 text-lxd-text-light-heading rounded-xl font-bold shadow-lg shadow-lxd-success/30 flex items-center gap-2"
              >
                <Download size={18} /> Export Plan
              </button>
            )}
          </div>
        </div>
      </div>

      <NeuronautHelper type={selectedType.title} step={selectedType.steps[currentStep]} />
    </div>
  );
}
