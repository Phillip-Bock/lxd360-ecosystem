import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  Hand,
  Info,
  Monitor,
  MousePointer,
  PlayCircle,
  Plus,
  Trash2,
  Type,
} from 'lucide-react';
import { useState } from 'react';
import type { SoftwareSimulationBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface SimulationStep {
  id: string;
  stepNumber: number;
  title: string;
  instructions: string;
  actionType: 'click' | 'type' | 'select' | 'hover' | 'drag' | 'scroll' | 'wait' | 'navigate';
  targetElement: string;
  inputValue?: string;
  expectedResult?: string;
  hint?: string;
  screenshotUrl?: string;
  isRequired: boolean;
}

interface SoftwareSimulationBlockEditorProps {
  block: SoftwareSimulationBlock;
  onChange: (content: SoftwareSimulationBlock['content']) => void;
}

export const SoftwareSimulationBlockEditor = ({
  block,
  onChange,
}: SoftwareSimulationBlockEditorProps): React.JSX.Element => {
  const [steps, setSteps] = useState<SimulationStep[]>(
    Array.isArray(block.content.steps)
      ? block.content.steps.map((step, idx) => ({
          id: step.id,
          stepNumber: idx + 1,
          title: typeof step.action === 'string' ? step.action : 'Step',
          instructions: typeof step.action === 'string' ? step.action : '',
          actionType: 'click' as const,
          targetElement: '',
          isRequired: true,
          screenshot: step.screenshot,
        }))
      : [],
  );
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const updateContent = (updatedSteps: SimulationStep[]): void => {
    // Renumber steps
    const renumbered = updatedSteps.map((step, idx) => ({
      ...step,
      stepNumber: idx + 1,
    }));
    setSteps(renumbered);
    // Convert to the expected type for block.content.steps
    const contentSteps = renumbered.map((step) => ({
      id: step.id,
      action: step.title || step.instructions || 'Step',
      screenshot: step.screenshotUrl,
    }));
    onChange({
      ...block.content,
      steps: contentSteps,
    });
  };

  const selectedStep = steps.find((s) => s.id === selectedStepId);

  const addStep = (): void => {
    const newId = `step-${Date.now()}`;
    const newStep: SimulationStep = {
      id: newId,
      stepNumber: steps.length + 1,
      title: 'New Step',
      instructions: '',
      actionType: 'click',
      targetElement: '',
      isRequired: true,
    };
    updateContent([...steps, newStep]);
    setSelectedStepId(newId);
  };

  const deleteStep = (id: string): void => {
    updateContent(steps.filter((s) => s.id !== id));
    if (selectedStepId === id) setSelectedStepId(null);
  };

  const updateStep = (id: string, updates: Partial<SimulationStep>): void => {
    updateContent(steps.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const moveStep = (id: string, direction: 'up' | 'down'): void => {
    const currentIndex = steps.findIndex((s) => s.id === id);
    if (currentIndex === -1) return;
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === steps.length - 1) return;

    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    [newSteps[currentIndex], newSteps[targetIndex]] = [
      newSteps[targetIndex],
      newSteps[currentIndex],
    ];
    updateContent(newSteps);
  };

  const getActionIcon = (actionType: SimulationStep['actionType']): React.JSX.Element => {
    switch (actionType) {
      case 'click':
        return <MousePointer className="w-4 h-4" aria-hidden="true" />;
      case 'type':
        return <Type className="w-4 h-4" aria-hidden="true" />;
      case 'drag':
        return <Hand className="w-4 h-4" aria-hidden="true" />;
      default:
        return <PlayCircle className="w-4 h-4" aria-hidden="true" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label
          htmlFor="software-sim-title-input"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          <Monitor className="w-4 h-4 inline mr-1" aria-hidden="true" />
          Software Simulation Title
        </label>
        <input
          id="software-sim-title-input"
          type="text"
          value={typeof block.content.title === 'string' ? block.content.title : ''}
          onChange={(e) => onChange({ ...block.content, title: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="e.g., Excel Pivot Tables Tutorial, Photoshop Basic Editing"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="software-sim-description-input"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          Description
        </label>
        <textarea
          id="software-sim-description-input"
          value={typeof block.content.description === 'string' ? block.content.description : ''}
          onChange={(e) => onChange({ ...block.content, description: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="Describe what learners will accomplish in this simulation..."
        />
      </div>

      {/* Application & Mode Settings */}
      <div className="grid grid-cols-2 gap-4">
        {/* Application Name */}
        <div>
          <label
            htmlFor="software-sim-app-name-input"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Application Name
          </label>
          <input
            id="software-sim-app-name-input"
            type="text"
            value={
              typeof block.content.applicationName === 'string' ? block.content.applicationName : ''
            }
            onChange={(e) => onChange({ ...block.content, applicationName: e.target.value })}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="e.g., Microsoft Excel, Adobe Photoshop"
          />
        </div>

        {/* Simulation Mode */}
        <div>
          <label
            htmlFor="software-sim-mode-select"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Simulation Mode
          </label>
          <select
            id="software-sim-mode-select"
            value={
              typeof block.content.simulationType === 'string'
                ? block.content.simulationType
                : 'guided'
            }
            onChange={(e) => onChange({ ...block.content, simulationType: e.target.value })}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="guided">Guided (Click this)</option>
            <option value="try_it">Try It Yourself</option>
            <option value="test">Test Mode (No hints)</option>
            <option value="demonstration">Demonstration (Watch only)</option>
          </select>
        </div>
      </div>

      {/* Base Screenshot URL */}
      <div>
        <label
          htmlFor="software-sim-screenshot-url-input"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          Base Screenshot URL (optional)
        </label>
        <input
          id="software-sim-screenshot-url-input"
          type="url"
          value={
            typeof block.content.baseScreenshotUrl === 'string'
              ? block.content.baseScreenshotUrl
              : ''
          }
          onChange={(e) => onChange({ ...block.content, baseScreenshotUrl: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="https://example.com/screenshots/start-screen.png"
        />
        <p className="text-xs text-brand-muted mt-1">
          Starting screenshot for the simulation interface
        </p>
      </div>

      {/* Step Builder */}
      <div className="border-t border-brand-default pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-brand-secondary flex items-center gap-2">
            <PlayCircle className="w-4 h-4" aria-hidden="true" />
            Simulation Steps
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-cyan-600 hover:text-cyan-700 border border-cyan-200 rounded-lg hover:bg-cyan-50"
            >
              <Eye className="w-3 h-3" aria-hidden="true" />
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button
              type="button"
              onClick={addStep}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-brand-primary bg-brand-accent hover:bg-cyan-700 rounded-lg"
            >
              <Plus className="w-3 h-3" aria-hidden="true" />
              Add Step
            </button>
          </div>
        </div>

        {showPreview ? (
          // Preview Mode
          <div className="bg-linear-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-4 min-h-[300px]">
            <p className="text-sm text-cyan-800 mb-3">
              <strong>Simulation Preview:</strong> {steps.length} steps configured
            </p>
            <div className="space-y-2">
              {steps.length === 0 ? (
                <p className="text-sm text-brand-muted text-center py-8">
                  No steps configured yet. Add steps to build your simulation.
                </p>
              ) : (
                steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className="bg-brand-surface rounded-lg p-3 border border-brand-default"
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-8 h-8 bg-brand-accent text-brand-primary rounded-full flex items-center justify-center font-medium text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getActionIcon(step.actionType)}
                          <h4 className="font-medium text-brand-primary">{step.title}</h4>
                          <span className="ml-auto px-2 py-0.5 bg-brand-surface text-brand-secondary text-xs rounded capitalize">
                            {step.actionType}
                          </span>
                        </div>
                        <p className="text-sm text-brand-secondary mb-1">{step.instructions}</p>
                        {step.targetElement && (
                          <p className="text-xs text-brand-muted">
                            Target:{' '}
                            <code className="bg-brand-surface px-1 rounded">
                              {step.targetElement}
                            </code>
                          </p>
                        )}
                        {step.hint && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                            💡 Hint: {step.hint}
                          </div>
                        )}
                        {step.isRequired && (
                          <span className="inline-flex items-center gap-1 mt-2 text-xs text-green-600">
                            <CheckCircle className="w-3 h-3" aria-hidden="true" />
                            Required step
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="grid grid-cols-3 gap-4 min-h-[400px]">
            {/* Step List */}
            <div className="border border-brand-default rounded-lg p-3 space-y-2 overflow-y-auto max-h-[500px]">
              <p className="text-xs font-medium text-brand-secondary mb-2">
                Steps ({steps.length})
              </p>
              {steps.length === 0 ? (
                <p className="text-xs text-brand-muted text-center py-4">
                  No steps yet. Click "Add Step" to start building your simulation.
                </p>
              ) : (
                steps.map((step, idx) => (
                  <div key={step.id} className="relative">
                    <button
                      type="button"
                      onClick={() => setSelectedStepId(step.id)}
                      className={`w-full text-left p-2 rounded-lg border-2 transition-all ${
                        selectedStepId === step.id
                          ? 'border-brand-accent bg-cyan-50'
                          : 'border-brand-default hover:border-brand-strong'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 bg-brand-accent text-brand-primary rounded-full flex items-center justify-center text-xs font-medium">
                          {idx + 1}
                        </div>
                        <span className="text-sm font-medium flex-1">{step.title}</span>
                      </div>
                      <p className="text-xs text-brand-muted capitalize">{step.actionType}</p>
                    </button>
                    {/* Move buttons */}
                    <div className="absolute right-1 top-1 flex gap-1">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveStep(step.id, 'up');
                          }}
                          className="p-1 text-brand-muted hover:text-cyan-600 hover:bg-brand-surface rounded"
                          aria-label={`Move step ${idx + 1} up`}
                        >
                          <ChevronUp className="w-3 h-3" aria-hidden="true" />
                        </button>
                      )}
                      {idx < steps.length - 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveStep(step.id, 'down');
                          }}
                          className="p-1 text-brand-muted hover:text-cyan-600 hover:bg-brand-surface rounded"
                          aria-label={`Move step ${idx + 1} down`}
                        >
                          <ChevronDown className="w-3 h-3" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Step Editor */}
            {selectedStep ? (
              <div className="col-span-2 border border-brand-default rounded-lg p-4 space-y-4 overflow-y-auto max-h-[500px]">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-brand-primary">
                    Edit Step {selectedStep.stepNumber}
                  </h4>
                  <button
                    type="button"
                    onClick={() => deleteStep(selectedStep.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                    aria-label={`Delete step ${selectedStep.stepNumber}`}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                {/* Step Title */}
                <div>
                  <label
                    htmlFor="software-sim-step-title-input"
                    className="block text-xs font-medium text-brand-secondary mb-1"
                  >
                    Step Title
                  </label>
                  <input
                    id="software-sim-step-title-input"
                    type="text"
                    value={selectedStep.title}
                    onChange={(e) => updateStep(selectedStep.id, { title: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg"
                    placeholder="e.g., Click on File menu"
                  />
                </div>

                {/* Instructions */}
                <div>
                  <label
                    htmlFor="software-sim-step-instructions-input"
                    className="block text-xs font-medium text-brand-secondary mb-1"
                  >
                    Instructions
                  </label>
                  <textarea
                    id="software-sim-step-instructions-input"
                    value={selectedStep.instructions}
                    onChange={(e) => updateStep(selectedStep.id, { instructions: e.target.value })}
                    rows={2}
                    className="w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg"
                    placeholder="Detailed instructions for the learner..."
                  />
                </div>

                {/* Action Type */}
                <div>
                  <label
                    htmlFor="software-sim-step-action-type-select"
                    className="block text-xs font-medium text-brand-secondary mb-1"
                  >
                    Action Type
                  </label>
                  <select
                    id="software-sim-step-action-type-select"
                    value={selectedStep.actionType}
                    onChange={(e) =>
                      updateStep(selectedStep.id, {
                        actionType: e.target.value as
                          | 'click'
                          | 'type'
                          | 'select'
                          | 'hover'
                          | 'drag'
                          | 'scroll'
                          | 'wait'
                          | 'navigate',
                      })
                    }
                    className="w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg"
                  >
                    <option value="click">Click</option>
                    <option value="type">Type Text</option>
                    <option value="select">Select from Dropdown</option>
                    <option value="hover">Hover</option>
                    <option value="drag">Drag & Drop</option>
                    <option value="scroll">Scroll</option>
                    <option value="wait">Wait</option>
                    <option value="navigate">Navigate to URL</option>
                  </select>
                </div>

                {/* Target Element */}
                <div>
                  <label
                    htmlFor="software-sim-step-target-input"
                    className="block text-xs font-medium text-brand-secondary mb-1"
                  >
                    Target Element
                  </label>
                  <input
                    id="software-sim-step-target-input"
                    type="text"
                    value={selectedStep.targetElement}
                    onChange={(e) => updateStep(selectedStep.id, { targetElement: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg"
                    placeholder="CSS selector or element description"
                  />
                  <p className="text-xs text-brand-muted mt-1">
                    e.g., #submit-button, .menu-item, or "Save button"
                  </p>
                </div>

                {/* Input Value (for type/select actions) */}
                {(selectedStep.actionType === 'type' || selectedStep.actionType === 'select') && (
                  <div>
                    <label
                      htmlFor="software-sim-step-input-value"
                      className="block text-xs font-medium text-brand-secondary mb-1"
                    >
                      {selectedStep.actionType === 'type' ? 'Text to Type' : 'Option to Select'}
                    </label>
                    <input
                      id="software-sim-step-input-value"
                      type="text"
                      value={selectedStep.inputValue || ''}
                      onChange={(e) => updateStep(selectedStep.id, { inputValue: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg"
                      placeholder={
                        selectedStep.actionType === 'type' ? 'Text to enter' : 'Option value'
                      }
                    />
                  </div>
                )}

                {/* Expected Result */}
                <div>
                  <label
                    htmlFor="software-sim-step-expected-result"
                    className="block text-xs font-medium text-brand-secondary mb-1"
                  >
                    Expected Result (optional)
                  </label>
                  <textarea
                    id="software-sim-step-expected-result"
                    value={selectedStep.expectedResult || ''}
                    onChange={(e) =>
                      updateStep(selectedStep.id, { expectedResult: e.target.value })
                    }
                    rows={2}
                    className="w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg"
                    placeholder="What should happen after this step?"
                  />
                </div>

                {/* Hint */}
                <div>
                  <label
                    htmlFor="software-sim-step-hint-input"
                    className="block text-xs font-medium text-brand-secondary mb-1"
                  >
                    Hint (optional)
                  </label>
                  <input
                    id="software-sim-step-hint-input"
                    type="text"
                    value={selectedStep.hint || ''}
                    onChange={(e) => updateStep(selectedStep.id, { hint: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg"
                    placeholder="Helpful hint if learner gets stuck"
                  />
                </div>

                {/* Screenshot URL */}
                <div>
                  <label
                    htmlFor="software-sim-step-screenshot-input"
                    className="block text-xs font-medium text-brand-secondary mb-1"
                  >
                    Screenshot URL (optional)
                  </label>
                  <input
                    id="software-sim-step-screenshot-input"
                    type="url"
                    value={selectedStep.screenshotUrl || ''}
                    onChange={(e) => updateStep(selectedStep.id, { screenshotUrl: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg"
                    placeholder="https://example.com/step-screenshot.png"
                  />
                </div>

                {/* Required Checkbox */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStep.isRequired}
                      onChange={(e) =>
                        updateStep(selectedStep.id, { isRequired: e.target.checked })
                      }
                      className="w-4 h-4 text-cyan-600 rounded"
                    />
                    <span className="text-sm text-brand-secondary">
                      Required step (learner must complete to proceed)
                    </span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="col-span-2 border border-brand-default rounded-lg p-4 flex items-center justify-center text-brand-muted">
                <div className="text-center">
                  <Info className="w-8 h-8 mx-auto mb-2 text-brand-muted" aria-hidden="true" />
                  <p className="text-sm">Select a step to edit</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Simulation Options */}
      <div className="border-t border-brand-default pt-4 space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={
              typeof block.content.allowSkipSteps === 'boolean'
                ? block.content.allowSkipSteps
                : false
            }
            onChange={(e) => onChange({ ...block.content, allowSkipSteps: e.target.checked })}
            className="w-4 h-4 text-cyan-600 rounded"
          />
          <span className="text-sm text-brand-secondary">
            Allow learners to skip optional steps
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={block.content.showProgressBar !== false}
            onChange={(e) => onChange({ ...block.content, showProgressBar: e.target.checked })}
            className="w-4 h-4 text-cyan-600 rounded"
          />
          <span className="text-sm text-brand-secondary">Show progress bar during simulation</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={block.content.trackTimeSpent !== false}
            onChange={(e) => onChange({ ...block.content, trackTimeSpent: e.target.checked })}
            className="w-4 h-4 text-cyan-600 rounded"
          />
          <span className="text-sm text-brand-secondary">Track time spent on each step</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={
              typeof block.content.enableReplay === 'boolean' ? block.content.enableReplay : false
            }
            onChange={(e) => onChange({ ...block.content, enableReplay: e.target.checked })}
            className="w-4 h-4 text-cyan-600 rounded"
          />
          <span className="text-sm text-brand-secondary">Allow replaying the simulation</span>
        </label>
      </div>

      {/* Helper Text */}
      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
        <p className="text-xs text-cyan-800">
          <strong>Software Simulation tip:</strong> Break down complex tasks into small, clear
          steps. Use screenshots to show the expected state. Test your simulation flow before
          publishing to ensure steps work correctly.
        </p>
      </div>
    </div>
  );
};
