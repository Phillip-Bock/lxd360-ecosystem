import {
  CheckCircle,
  Eye,
  FileText,
  Info,
  Lightbulb,
  Plus,
  Scale,
  Trash2,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import type {
  MoralDilemmaBlock,
  MoralDilemmaChoiceOption,
  MoralDilemmaStakeholder,
} from '@/lib/inspire-studio/types/contentBlocks';

interface MoralDilemmaBlockEditorProps {
  block: MoralDilemmaBlock;
  onChange: (content: MoralDilemmaBlock['content']) => void;
}

export const MoralDilemmaBlockEditor = ({
  block,
  onChange,
}: MoralDilemmaBlockEditorProps): React.JSX.Element => {
  const [choices, setChoices] = useState<MoralDilemmaChoiceOption[]>(block.content.choices || []);
  const [stakeholders, setStakeholders] = useState<MoralDilemmaStakeholder[]>(
    block.content.stakeholders || [],
  );
  const [showPreview, setShowPreview] = useState(false);

  const updateContent = (
    updatedChoices?: MoralDilemmaChoiceOption[],
    updatedStakeholders?: MoralDilemmaStakeholder[],
  ): void => {
    onChange({
      ...block.content,
      choices: updatedChoices ?? choices,
      stakeholders: updatedStakeholders ?? stakeholders,
    });
  };

  // Choice management
  const addChoice = (): void => {
    const newChoice: MoralDilemmaChoiceOption = {
      id: `choice-${Date.now()}`,
      choice: '',
      shortTerm: '',
      longTerm: '',
      stakeholdersAffected: [],
    };
    const updated = [...choices, newChoice];
    setChoices(updated);
    updateContent(updated, undefined);
  };

  const deleteChoice = (id: string): void => {
    const updated = choices.filter((c) => c.id !== id);
    setChoices(updated);
    updateContent(updated, undefined);
  };

  const updateChoice = (id: string, updates: Partial<MoralDilemmaChoiceOption>): void => {
    const updated = choices.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setChoices(updated);
    updateContent(updated, undefined);
  };

  // Stakeholder management
  const addStakeholder = (): void => {
    const newStakeholder: MoralDilemmaStakeholder = {
      id: `stakeholder-${Date.now()}`,
      name: '',
      role: '',
      interests: '',
    };
    const updated = [...stakeholders, newStakeholder];
    setStakeholders(updated);
    updateContent(undefined, updated);
  };

  const deleteStakeholder = (id: string): void => {
    const updated = stakeholders.filter((s) => s.id !== id);
    setStakeholders(updated);
    updateContent(undefined, updated);
  };

  const updateStakeholder = (id: string, updates: Partial<MoralDilemmaStakeholder>): void => {
    const updated = stakeholders.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setStakeholders(updated);
    updateContent(undefined, updated);
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label
          htmlFor="dilemma-title"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          <Scale className="w-4 h-4 inline mr-1" aria-hidden="true" />
          Ethical Dilemma Title
        </label>
        <input
          id="dilemma-title"
          type="text"
          value={block.content.title || ''}
          onChange={(e) => onChange({ ...block.content, title: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="e.g., AI in Healthcare Decisions, Whistleblowing Dilemma"
        />
      </div>

      {/* Scenario Description */}
      <div>
        <label
          htmlFor="scenario-description"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          Scenario Description
        </label>
        <textarea
          id="scenario-description"
          value={block.content.scenario || ''}
          onChange={(e) => onChange({ ...block.content, scenario: e.target.value })}
          rows={5}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Describe the ethical dilemma in detail. Set the context, introduce the situation, and outline the conflicting values or principles..."
        />
      </div>

      {/* Dilemma Type and Complexity */}
      <div className="grid grid-cols-2 gap-4">
        {/* Dilemma Type */}
        <div>
          <label
            htmlFor="dilemma-type"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Dilemma Type
          </label>
          <select
            id="dilemma-type"
            value={block.content.dilemmaType || 'professional'}
            onChange={(e) => onChange({ ...block.content, dilemmaType: e.target.value })}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="professional">Professional Ethics</option>
            <option value="medical">Medical Ethics</option>
            <option value="business">Business Ethics</option>
            <option value="environmental">Environmental Ethics</option>
            <option value="technology">Technology Ethics</option>
            <option value="research">Research Ethics</option>
            <option value="social">Social Justice</option>
            <option value="personal">Personal Ethics</option>
          </select>
        </div>

        {/* Complexity */}
        <div>
          <label
            htmlFor="complexity-level"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Complexity Level
          </label>
          <select
            id="complexity-level"
            value={block.content.complexityLevel || 'intermediate'}
            onChange={(e) => onChange({ ...block.content, complexityLevel: e.target.value })}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="basic">Basic (clear right/wrong)</option>
            <option value="intermediate">Intermediate (competing values)</option>
            <option value="advanced">Advanced (complex tradeoffs)</option>
            <option value="expert">Expert (systemic issues)</option>
          </select>
        </div>
      </div>

      {/* Context Information */}
      <div>
        <label
          htmlFor="background-context"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          <Info className="w-4 h-4 inline mr-1" aria-hidden="true" />
          Background Context (optional)
        </label>
        <textarea
          id="background-context"
          value={block.content.backgroundContext || ''}
          onChange={(e) => onChange({ ...block.content, backgroundContext: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Additional context, relevant policies, cultural considerations, historical background..."
        />
      </div>

      {/* Stakeholders Section */}
      <div className="border-t border-brand-default pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-brand-secondary flex items-center gap-2">
            <Users className="w-4 h-4" aria-hidden="true" />
            Stakeholders
          </span>
          <button
            type="button"
            onClick={addStakeholder}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-brand-primary bg-indigo-600 hover:bg-indigo-700 rounded-lg"
          >
            <Plus className="w-3 h-3" />
            Add Stakeholder
          </button>
        </div>

        {stakeholders.length === 0 ? (
          <div className="border border-brand-default rounded-lg p-4 text-center text-sm text-brand-muted">
            No stakeholders added yet. Identify people or groups affected by this dilemma.
          </div>
        ) : (
          <div className="space-y-2">
            {stakeholders.map((stakeholder, idx) => (
              <div key={stakeholder.id} className="border border-brand-default rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="shrink-0 w-6 h-6 bg-indigo-600 text-brand-primary rounded-full flex items-center justify-center text-xs font-medium mt-1">
                    {idx + 1}
                  </div>
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={stakeholder.name}
                      onChange={(e) => updateStakeholder(stakeholder.id, { name: e.target.value })}
                      className="px-2 py-1.5 text-sm border border-brand-strong rounded-lg"
                      placeholder="Name"
                    />
                    <input
                      type="text"
                      value={stakeholder.role}
                      onChange={(e) => updateStakeholder(stakeholder.id, { role: e.target.value })}
                      className="px-2 py-1.5 text-sm border border-brand-strong rounded-lg"
                      placeholder="Role"
                    />
                    <input
                      type="text"
                      value={stakeholder.interests}
                      onChange={(e) =>
                        updateStakeholder(stakeholder.id, { interests: e.target.value })
                      }
                      className="px-2 py-1.5 text-sm border border-brand-strong rounded-lg"
                      placeholder="Interests/Concerns"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteStakeholder(stakeholder.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Choice Options Section */}
      <div className="border-t border-brand-default pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-brand-secondary">
            Choice Options & Outcomes
          </span>
          <button
            type="button"
            onClick={addChoice}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-brand-primary bg-indigo-600 hover:bg-indigo-700 rounded-lg"
          >
            <Plus className="w-3 h-3" />
            Add Choice
          </button>
        </div>

        {choices.length === 0 ? (
          <div className="border border-brand-default rounded-lg p-4 text-center text-sm text-brand-muted">
            No choices added yet. Add possible courses of action for this dilemma.
          </div>
        ) : (
          <div className="space-y-3">
            {choices.map((choice, idx) => (
              <div
                key={choice.id}
                className="border-2 border-indigo-200 rounded-lg p-4 bg-indigo-50"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 bg-indigo-600 text-brand-primary rounded-full flex items-center justify-center font-medium text-sm mt-1">
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <div className="flex-1 space-y-3">
                    {/* Choice Description */}
                    <div>
                      <label
                        htmlFor={`choice-action-${choice.id}`}
                        className="block text-xs font-medium text-brand-secondary mb-1"
                      >
                        Choice/Action
                      </label>
                      <input
                        id={`choice-action-${choice.id}`}
                        type="text"
                        value={choice.choice}
                        onChange={(e) => updateChoice(choice.id, { choice: e.target.value })}
                        className="w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg bg-brand-surface"
                        placeholder="Describe this course of action..."
                      />
                    </div>

                    {/* Short-term Consequences */}
                    <div>
                      <label
                        htmlFor={`choice-short-term-${choice.id}`}
                        className="block text-xs font-medium text-brand-secondary mb-1"
                      >
                        Short-term Consequences
                      </label>
                      <textarea
                        id={`choice-short-term-${choice.id}`}
                        value={choice.shortTerm}
                        onChange={(e) => updateChoice(choice.id, { shortTerm: e.target.value })}
                        rows={2}
                        className="w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg bg-brand-surface"
                        placeholder="Immediate outcomes and impacts..."
                      />
                    </div>

                    {/* Long-term Consequences */}
                    <div>
                      <label
                        htmlFor={`choice-long-term-${choice.id}`}
                        className="block text-xs font-medium text-brand-secondary mb-1"
                      >
                        Long-term Consequences
                      </label>
                      <textarea
                        id={`choice-long-term-${choice.id}`}
                        value={choice.longTerm}
                        onChange={(e) => updateChoice(choice.id, { longTerm: e.target.value })}
                        rows={2}
                        className="w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg bg-brand-surface"
                        placeholder="Long-term effects and ripple impacts..."
                      />
                    </div>

                    {/* Ethical Framework */}
                    <div>
                      <label
                        htmlFor={`choice-framework-${choice.id}`}
                        className="block text-xs font-medium text-brand-secondary mb-1"
                      >
                        Relevant Ethical Framework
                      </label>
                      <select
                        id={`choice-framework-${choice.id}`}
                        value={choice.ethicalFramework || ''}
                        onChange={(e) =>
                          updateChoice(choice.id, { ethicalFramework: e.target.value })
                        }
                        className="w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg bg-brand-surface"
                      >
                        <option value="">Select framework...</option>
                        <option value="utilitarianism">Utilitarianism (greatest good)</option>
                        <option value="deontology">Deontology (duty-based)</option>
                        <option value="virtue_ethics">Virtue Ethics (character-based)</option>
                        <option value="care_ethics">Ethics of Care (relationships)</option>
                        <option value="rights_based">Rights-Based Ethics</option>
                        <option value="justice">Justice Theory</option>
                        <option value="consequentialism">Consequentialism</option>
                      </select>
                    </div>

                    {/* Additional Consequences */}
                    <div>
                      <label
                        htmlFor={`choice-consequences-${choice.id}`}
                        className="block text-xs font-medium text-brand-secondary mb-1"
                      >
                        Additional Considerations (optional)
                      </label>
                      <textarea
                        id={`choice-consequences-${choice.id}`}
                        value={choice.consequences || ''}
                        onChange={(e) => updateChoice(choice.id, { consequences: e.target.value })}
                        rows={2}
                        className="w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg bg-brand-surface"
                        placeholder="Unintended consequences, ethical tensions, trade-offs..."
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteChoice(choice.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ethical Frameworks to Reference */}
      <div className="border-t border-brand-default pt-4">
        <span className="block text-sm font-medium text-brand-secondary mb-2">
          <Lightbulb className="w-4 h-4 inline mr-1" aria-hidden="true" />
          Ethical Frameworks (select which learners should consider)
        </span>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'utilitarianism', label: 'Utilitarianism' },
            { value: 'deontology', label: 'Deontology' },
            { value: 'virtue_ethics', label: 'Virtue Ethics' },
            { value: 'care_ethics', label: 'Ethics of Care' },
            { value: 'rights_based', label: 'Rights-Based' },
            { value: 'justice', label: 'Justice Theory' },
          ].map((framework) => (
            <label
              key={framework.value}
              className="flex items-center gap-2 p-2 border border-brand-default rounded-lg hover:border-indigo-300 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={(block.content.requiredFrameworks || []).includes(framework.value)}
                onChange={(e) => {
                  const current = block.content.requiredFrameworks || [];
                  const updated = e.target.checked
                    ? [...current, framework.value]
                    : current.filter((f) => f !== framework.value);
                  onChange({ ...block.content, requiredFrameworks: updated });
                }}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-sm text-brand-secondary">{framework.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Assessment Requirements */}
      <div className="border-t border-brand-default pt-4 space-y-4">
        <h4 className="text-sm font-medium text-brand-primary">Assessment Requirements</h4>

        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.requireJustification !== false}
              onChange={(e) =>
                onChange({ ...block.content, requireJustification: e.target.checked })
              }
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <span className="text-sm text-brand-secondary">
              Require written justification for choice
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.requireFrameworkReference !== false}
              onChange={(e) =>
                onChange({ ...block.content, requireFrameworkReference: e.target.checked })
              }
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <span className="text-sm text-brand-secondary">
              Require reference to ethical frameworks
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.requireStakeholderAnalysis || false}
              onChange={(e) =>
                onChange({ ...block.content, requireStakeholderAnalysis: e.target.checked })
              }
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <span className="text-sm text-brand-secondary">
              Require stakeholder impact analysis
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.enablePeerDiscussion || false}
              onChange={(e) =>
                onChange({ ...block.content, enablePeerDiscussion: e.target.checked })
              }
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <span className="text-sm text-brand-secondary">
              Enable peer discussion and alternative viewpoints
            </span>
          </label>
        </div>

        {/* Minimum word count */}
        <div>
          <label htmlFor="min-word-count" className="block text-sm text-brand-secondary mb-2">
            Minimum Justification Word Count
          </label>
          <input
            id="min-word-count"
            type="number"
            value={block.content.minWordCount || 100}
            onChange={(e) =>
              onChange({ ...block.content, minWordCount: parseInt(e.target.value, 10) || 0 })
            }
            min="0"
            className="w-32 px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Reflection Prompts */}
      <div className="border-t border-brand-default pt-4">
        <label
          htmlFor="reflection-prompts"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          <FileText className="w-4 h-4 inline mr-1" aria-hidden="true" />
          Reflection Prompts (optional)
        </label>
        <textarea
          id="reflection-prompts"
          value={block.content.reflectionPrompts || ''}
          onChange={(e) => onChange({ ...block.content, reflectionPrompts: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Questions to guide learner reflection... (one per line)"
        />
        <p className="text-xs text-brand-muted mt-1">
          e.g., "What values conflict in this scenario?", "How might different cultures view this
          dilemma?"
        </p>
      </div>

      {/* Preview */}
      <div className="border-t border-brand-default pt-4">
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 mb-3"
        >
          <Eye className="w-4 h-4" />
          {showPreview ? 'Hide' : 'Show'} Preview
        </button>

        {showPreview && (
          <div className="bg-linear-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="w-5 h-5 text-indigo-600" aria-hidden="true" />
              <span className="text-sm font-medium text-indigo-900">Ethical Dilemma Preview</span>
            </div>
            <div className="bg-brand-surface rounded-lg p-4 border border-brand-default space-y-4">
              <div>
                <h3 className="font-medium text-brand-primary mb-2">
                  {block.content.title || 'Untitled Dilemma'}
                </h3>
                <p className="text-sm text-brand-secondary mb-3">
                  {block.content.scenario || 'No scenario provided.'}
                </p>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded capitalize">
                    {block.content.dilemmaType || 'professional'}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded capitalize">
                    {block.content.complexityLevel || 'intermediate'}
                  </span>
                </div>
              </div>

              {stakeholders.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-brand-primary mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Stakeholders:
                  </h4>
                  <div className="space-y-1">
                    {stakeholders.map((stakeholder) => (
                      <div key={stakeholder.id} className="text-sm text-brand-secondary">
                        • <strong>{stakeholder.name}</strong> ({stakeholder.role}) -{' '}
                        {stakeholder.interests}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {choices.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-brand-primary mb-2">Options:</h4>
                  <div className="space-y-2">
                    {choices.map((choice, idx) => (
                      <div
                        key={choice.id}
                        className="p-3 bg-indigo-50 rounded-lg border border-indigo-200"
                      >
                        <div className="flex items-start gap-2">
                          <span className="font-medium text-indigo-700">
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-brand-primary">
                              {choice.choice || '(Empty choice)'}
                            </p>
                            {choice.ethicalFramework && (
                              <p className="text-xs text-indigo-600 mt-1 capitalize">
                                Framework: {choice.ethicalFramework.replace('_', ' ')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2 text-xs text-brand-secondary bg-yellow-50 border border-yellow-200 rounded p-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-yellow-600 mt-0.5" />
                <div>
                  <strong>Requirements:</strong> Learners must select a choice
                  {block.content.requireJustification && ', provide written justification'}
                  {block.content.requireFrameworkReference && ', reference ethical frameworks'}
                  {block.content.requireStakeholderAnalysis && ', analyze stakeholder impacts'}.
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-2 text-xs text-indigo-700">
              <Info className="w-4 h-4 shrink-0" />
              <p>
                This is an ethical reasoning exercise. There may be multiple defensible positions
                depending on the framework applied.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Helper Text */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
        <p className="text-xs text-indigo-800">
          <strong>Ethical Dilemma tip:</strong> Present genuine moral tensions without obvious
          "right" answers. Include diverse stakeholder perspectives. Encourage learners to explore
          multiple frameworks and recognize complexity.
        </p>
      </div>
    </div>
  );
};
