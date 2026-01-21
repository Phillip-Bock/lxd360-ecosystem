import {
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Image as ImageIcon,
  Info,
  Plus,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import type {
  CriticalIncidentBlock,
  IncidentFactor,
  IncidentResponseOption,
} from '@/lib/inspire-studio/types/contentBlocks';

interface CriticalIncidentBlockEditorProps {
  block: CriticalIncidentBlock;
  onChange: (content: CriticalIncidentBlock['content']) => void;
}

export const CriticalIncidentBlockEditor = ({
  block,
  onChange,
}: CriticalIncidentBlockEditorProps): React.JSX.Element => {
  const [factors, setFactors] = useState<IncidentFactor[]>(block.content.factors ?? []);
  const [responses, setResponses] = useState<IncidentResponseOption[]>(
    block.content.responseOptions ?? [],
  );
  const [showPreview, setShowPreview] = useState(false);

  const updateContent = (
    updatedFactors?: IncidentFactor[],
    updatedResponses?: IncidentResponseOption[],
  ): void => {
    onChange({
      ...block.content,
      factors: updatedFactors ?? factors,
      responseOptions: updatedResponses ?? responses,
    });
  };

  // Factor management
  const addFactor = (): void => {
    const newFactor: IncidentFactor = {
      id: `factor-${Date.now()}`,
      factor: '',
      isCritical: false,
    };
    const updated = [...factors, newFactor];
    setFactors(updated);
    updateContent(updated, undefined);
  };

  const deleteFactor = (id: string): void => {
    const updated = factors.filter((f) => f.id !== id);
    setFactors(updated);
    updateContent(updated, undefined);
  };

  const updateFactor = (id: string, updates: Partial<IncidentFactor>): void => {
    const updated = factors.map((f) => (f.id === id ? { ...f, ...updates } : f));
    setFactors(updated);
    updateContent(updated, undefined);
  };

  // Response option management
  const addResponse = (): void => {
    const newResponse: IncidentResponseOption = {
      id: `response-${Date.now()}`,
      response: '',
      isCorrect: false,
      feedback: '',
      points: 0,
    };
    const updated = [...responses, newResponse];
    setResponses(updated);
    updateContent(undefined, updated);
  };

  const deleteResponse = (id: string): void => {
    const updated = responses.filter((r) => r.id !== id);
    setResponses(updated);
    updateContent(undefined, updated);
  };

  const updateResponse = (id: string, updates: Partial<IncidentResponseOption>): void => {
    const updated = responses.map((r) => (r.id === id ? { ...r, ...updates } : r));
    setResponses(updated);
    updateContent(undefined, updated);
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label
          htmlFor="incident-title"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          <AlertCircle className="w-4 h-4 inline mr-1" aria-hidden="true" />
          Incident Scenario Title
        </label>
        <input
          id="incident-title"
          type="text"
          value={block.content.title}
          onChange={(e) => onChange({ ...block.content, title: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="e.g., Workplace Safety Incident, Customer Service Crisis"
        />
      </div>

      {/* Scenario Description */}
      <div>
        <label
          htmlFor="incident-scenario"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          Scenario Description
        </label>
        <textarea
          id="incident-scenario"
          value={block.content.scenario || ''}
          onChange={(e) => onChange({ ...block.content, scenario: e.target.value })}
          rows={5}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Describe the incident scenario in detail. Provide context, background, and the sequence of events..."
        />
      </div>

      {/* Context and Metadata */}
      <div className="grid grid-cols-2 gap-4">
        {/* Incident Type */}
        <div>
          <label
            htmlFor="incident-type"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Incident Type
          </label>
          <select
            id="incident-type"
            value={block.content.incidentType || 'safety'}
            onChange={(e) => onChange({ ...block.content, incidentType: e.target.value })}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="safety">Safety Incident</option>
            <option value="security">Security Breach</option>
            <option value="customer_service">Customer Service</option>
            <option value="medical">Medical Emergency</option>
            <option value="technical">Technical Failure</option>
            <option value="ethical">Ethical Dilemma</option>
            <option value="communication">Communication Breakdown</option>
            <option value="operational">Operational Issue</option>
          </select>
        </div>

        {/* Severity Level */}
        <div>
          <label
            htmlFor="severity-level"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Severity Level
          </label>
          <select
            id="severity-level"
            value={block.content.severityLevel || 'moderate'}
            onChange={(e) => onChange({ ...block.content, severityLevel: e.target.value })}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="low">Low Impact</option>
            <option value="moderate">Moderate Impact</option>
            <option value="high">High Impact</option>
            <option value="critical">Critical/Life-threatening</option>
          </select>
        </div>
      </div>

      {/* Supporting Media */}
      <div className="grid grid-cols-2 gap-4">
        {/* Image URL */}
        <div>
          <label
            htmlFor="incident-image-url"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            <ImageIcon className="w-4 h-4 inline mr-1" aria-hidden="true" />
            Incident Image URL (optional)
          </label>
          <input
            id="incident-image-url"
            type="url"
            value={block.content.imageUrl || ''}
            onChange={(e) => onChange({ ...block.content, imageUrl: e.target.value })}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="https://example.com/incident-photo.jpg"
          />
        </div>

        {/* Document URL */}
        <div>
          <label
            htmlFor="incident-document-url"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            <FileText className="w-4 h-4 inline mr-1" aria-hidden="true" />
            Supporting Document URL (optional)
          </label>
          <input
            id="incident-document-url"
            type="url"
            value={block.content.documentUrl || ''}
            onChange={(e) => onChange({ ...block.content, documentUrl: e.target.value })}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="https://example.com/incident-report.pdf"
          />
        </div>
      </div>

      {/* Critical Factors Section */}
      <div className="border-t border-brand-default pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-brand-secondary">Contributing Factors</span>
          <button
            type="button"
            onClick={addFactor}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-brand-primary bg-orange-600 hover:bg-orange-700 rounded-lg"
          >
            <Plus className="w-3 h-3" aria-hidden="true" />
            Add Factor
          </button>
        </div>

        {factors.length === 0 ? (
          <div className="border border-brand-default rounded-lg p-4 text-center text-sm text-brand-muted">
            No factors added yet. Add factors that contributed to the incident.
          </div>
        ) : (
          <div className="space-y-2">
            {factors.map((factor, idx) => (
              <div
                key={factor.id}
                className={`border-2 rounded-lg p-3 ${
                  factor.isCritical
                    ? 'border-red-300 bg-red-50'
                    : 'border-brand-default bg-brand-surface'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="shrink-0 w-6 h-6 bg-orange-600 text-brand-primary rounded-full flex items-center justify-center text-xs font-medium mt-1">
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={factor.factor}
                      onChange={(e) => updateFactor(factor.id, { factor: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg"
                      placeholder="Describe the contributing factor..."
                    />
                    <textarea
                      value={factor.explanation || ''}
                      onChange={(e) => updateFactor(factor.id, { explanation: e.target.value })}
                      rows={2}
                      className="w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg"
                      placeholder="Explanation (why this is/isn't critical)..."
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={factor.isCritical}
                          onChange={(e) =>
                            updateFactor(factor.id, { isCritical: e.target.checked })
                          }
                          className="w-4 h-4 text-red-600 rounded"
                        />
                        <span className="text-sm font-medium text-brand-secondary flex items-center gap-1">
                          {factor.isCritical ? (
                            <>
                              <AlertCircle className="w-4 h-4 text-red-600" aria-hidden="true" />
                              <span className="text-red-700">Critical root cause</span>
                            </>
                          ) : (
                            <span>Mark as critical root cause</span>
                          )}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => deleteFactor(factor.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        aria-label="Delete factor"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Response Options Section */}
      <div className="border-t border-brand-default pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-brand-secondary">Response Options</span>
          <button
            type="button"
            onClick={addResponse}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-brand-primary bg-orange-600 hover:bg-orange-700 rounded-lg"
          >
            <Plus className="w-3 h-3" aria-hidden="true" />
            Add Response
          </button>
        </div>

        {responses.length === 0 ? (
          <div className="border border-brand-default rounded-lg p-4 text-center text-sm text-brand-muted">
            No response options added yet. Add multiple-choice responses for learners.
          </div>
        ) : (
          <div className="space-y-2">
            {responses.map((response, idx) => (
              <div
                key={response.id}
                className={`border-2 rounded-lg p-3 ${
                  response.isCorrect
                    ? 'border-green-300 bg-green-50'
                    : 'border-brand-default bg-brand-surface'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="shrink-0 w-6 h-6 bg-gray-600 text-brand-primary rounded-full flex items-center justify-center text-xs font-medium mt-1">
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={response.response}
                      onChange={(e) => updateResponse(response.id, { response: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg"
                      placeholder="Response option text..."
                    />
                    <textarea
                      value={response.feedback}
                      onChange={(e) => updateResponse(response.id, { feedback: e.target.value })}
                      rows={2}
                      className="w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg"
                      placeholder="Feedback for this response..."
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={response.isCorrect}
                            onChange={(e) =>
                              updateResponse(response.id, { isCorrect: e.target.checked })
                            }
                            className="w-4 h-4 text-green-600 rounded"
                          />
                          <span className="text-sm font-medium text-brand-secondary flex items-center gap-1">
                            {response.isCorrect ? (
                              <>
                                <CheckCircle
                                  className="w-4 h-4 text-green-600"
                                  aria-hidden="true"
                                />
                                <span className="text-green-700">Correct response</span>
                              </>
                            ) : (
                              <span>Mark as correct</span>
                            )}
                          </span>
                        </label>
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor={`response-points-${response.id}`}
                            className="text-xs text-brand-secondary"
                          >
                            Points:
                          </label>
                          <input
                            id={`response-points-${response.id}`}
                            type="number"
                            value={response.points || 0}
                            onChange={(e) =>
                              updateResponse(response.id, {
                                points: parseInt(e.target.value, 10) || 0,
                              })
                            }
                            className="w-16 px-2 py-1 text-xs border border-brand-strong rounded"
                            min="0"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteResponse(response.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        aria-label="Delete response"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assessment Settings */}
      <div className="border-t border-brand-default pt-4 space-y-4">
        <h4 className="text-sm font-medium text-brand-primary">Assessment Settings</h4>

        {/* Time Limit */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer mb-2">
            <input
              type="checkbox"
              checked={block.content.hasTimeLimit || false}
              onChange={(e) => onChange({ ...block.content, hasTimeLimit: e.target.checked })}
              className="w-4 h-4 text-orange-600 rounded"
            />
            <span className="text-sm text-brand-secondary flex items-center gap-1">
              <Clock className="w-4 h-4" aria-hidden="true" />
              Enable time limit (simulates time pressure)
            </span>
          </label>
          {block.content.hasTimeLimit && (
            <div className="ml-6 flex gap-2 items-center">
              <input
                type="number"
                value={block.content.timeLimitMinutes || 5}
                onChange={(e) =>
                  onChange({
                    ...block.content,
                    timeLimitMinutes: parseInt(e.target.value, 10) || 0,
                  })
                }
                min="1"
                className="w-24 px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <span className="text-sm text-brand-secondary">minutes</span>
            </div>
          )}
        </div>

        {/* Other Options */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.showFactorsToLearner !== false}
              onChange={(e) =>
                onChange({ ...block.content, showFactorsToLearner: e.target.checked })
              }
              className="w-4 h-4 text-orange-600 rounded"
            />
            <span className="text-sm text-brand-secondary">
              Show all factors to learner (before asking for root cause)
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.allowMultipleAttempts !== false}
              onChange={(e) =>
                onChange({ ...block.content, allowMultipleAttempts: e.target.checked })
              }
              className="w-4 h-4 text-orange-600 rounded"
            />
            <span className="text-sm text-brand-secondary">Allow multiple attempts</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.showDetailedFeedback !== false}
              onChange={(e) =>
                onChange({ ...block.content, showDetailedFeedback: e.target.checked })
              }
              className="w-4 h-4 text-orange-600 rounded"
            />
            <span className="text-sm text-brand-secondary">
              Show detailed feedback with explanations
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.requireJustification || false}
              onChange={(e) =>
                onChange({ ...block.content, requireJustification: e.target.checked })
              }
              className="w-4 h-4 text-orange-600 rounded"
            />
            <span className="text-sm text-brand-secondary">
              Require learners to justify their response
            </span>
          </label>
        </div>
      </div>

      {/* Preview */}
      <div className="border-t border-brand-default pt-4">
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 mb-3"
        >
          <Eye className="w-4 h-4" aria-hidden="true" />
          {showPreview ? 'Hide' : 'Show'} Preview
        </button>

        {showPreview && (
          <div className="bg-linear-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-orange-600" aria-hidden="true" />
              <span className="text-sm font-medium text-orange-900">Critical Incident Preview</span>
            </div>
            <div className="bg-brand-surface rounded-lg p-4 border border-brand-default space-y-4">
              <div>
                <h3 className="font-medium text-brand-primary mb-2">{block.content.title}</h3>
                <p className="text-sm text-brand-secondary mb-3">
                  {block.content.scenario || 'No scenario description provided.'}
                </p>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded capitalize">
                    {block.content.incidentType || 'safety'}
                  </span>
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded capitalize">
                    {block.content.severityLevel || 'moderate'} severity
                  </span>
                </div>
              </div>

              {factors.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-brand-primary mb-2">
                    Contributing Factors:
                  </h4>
                  <div className="space-y-1">
                    {factors.map((factor, idx) => (
                      <div key={factor.id} className="flex items-start gap-2 text-sm">
                        <span className="text-brand-muted">{idx + 1}.</span>
                        <span
                          className={
                            factor.isCritical ? 'text-red-700 font-medium' : 'text-brand-secondary'
                          }
                        >
                          {factor.factor || '(Empty factor)'}
                          {factor.isCritical && ' ⚠️'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {responses.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-brand-primary mb-2">Response Options:</h4>
                  <div className="space-y-2">
                    {responses.map((response, idx) => (
                      <div
                        key={response.id}
                        className={`p-2 rounded text-sm ${
                          response.isCorrect
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-brand-page'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="font-medium">{String.fromCharCode(65 + idx)}.</span>
                          <span className="flex-1">{response.response || '(Empty response)'}</span>
                          {response.isCorrect && (
                            <CheckCircle
                              className="w-4 h-4 text-green-600 shrink-0"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-3 flex gap-2 text-xs text-orange-700">
              <Info className="w-4 h-4 shrink-0" aria-hidden="true" />
              <p>
                Learners will analyze this scenario to identify the critical root cause and select
                the best response.
                {block.content.hasTimeLimit &&
                  ` Time limit: ${block.content.timeLimitMinutes || 5} minutes.`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Helper Text */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
        <p className="text-xs text-orange-800">
          <strong>Critical Incident tip:</strong> Create realistic scenarios based on actual
          incidents (anonymized). Clearly mark the critical root cause factor. Provide constructive
          feedback that helps learners understand the reasoning.
        </p>
      </div>
    </div>
  );
};
