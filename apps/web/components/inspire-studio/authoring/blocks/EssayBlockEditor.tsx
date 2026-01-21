import { Award, BookOpen, Clock, Eye, FileText, Info, Plus, X } from 'lucide-react';
import { useState } from 'react';
import type { EssayBlock, RubricCriterion } from '@/lib/inspire/types/contentBlocks';

interface EssayBlockEditorProps {
  block: EssayBlock;
  onChange: (content: EssayBlock['content']) => void;
}

export const EssayBlockEditor = ({ block, onChange }: EssayBlockEditorProps): React.JSX.Element => {
  const [rubricCriteria, setRubricCriteria] = useState<RubricCriterion[]>(
    block.content.rubricCriteria || [],
  );
  const [showPreview, setShowPreview] = useState(false);

  const updateRubricCriteria = (updatedCriteria: RubricCriterion[]): void => {
    setRubricCriteria(updatedCriteria);
    onChange({
      ...block.content,
      rubricCriteria: updatedCriteria,
    });
  };

  const addCriterion = (): void => {
    const newCriterion: RubricCriterion = {
      id: `criterion_${Date.now()}`,
      name: '',
      description: '',
      maxPoints: 10,
      levels: [
        { name: 'Excellent', points: 10, description: '' },
        { name: 'Good', points: 7, description: '' },
        { name: 'Satisfactory', points: 5, description: '' },
        { name: 'Needs Improvement', points: 3, description: '' },
      ],
    };
    updateRubricCriteria([...rubricCriteria, newCriterion]);
  };

  const removeCriterion = (id: string): void => {
    updateRubricCriteria(rubricCriteria.filter((c) => c.id !== id));
  };

  const updateCriterion = (id: string, updates: Partial<RubricCriterion>): void => {
    updateRubricCriteria(rubricCriteria.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const totalPoints = rubricCriteria.reduce((sum, c) => sum + c.maxPoints, 0);

  return (
    <div className="space-y-4">
      {/* Essay Title */}
      <div>
        <label
          htmlFor="essay-title-input"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          <FileText aria-hidden="true" className="w-4 h-4 inline mr-1" />
          Essay Title
        </label>
        <input
          id="essay-title-input"
          type="text"
          value={block.content.title || ''}
          onChange={(e) => onChange({ ...block.content, title: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="e.g., Reflective Essay on Leadership, Analysis of Case Study"
        />
      </div>

      {/* Essay Prompt */}
      <div>
        <label
          htmlFor="essay-prompt-input"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          Essay Prompt / Question
        </label>
        <textarea
          id="essay-prompt-input"
          value={block.content.prompt}
          onChange={(e) => onChange({ ...block.content, prompt: e.target.value })}
          rows={5}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="Enter the essay prompt, question, or instructions for learners..."
        />
      </div>

      {/* Guidelines / Requirements */}
      <div>
        <label
          htmlFor="essay-guidelines-input"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          <BookOpen aria-hidden="true" className="w-4 h-4 inline mr-1" />
          Guidelines & Requirements (optional)
        </label>
        <textarea
          id="essay-guidelines-input"
          value={block.content.guidelines || ''}
          onChange={(e) => onChange({ ...block.content, guidelines: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="Writing style, citation format, structure requirements, sources needed, etc."
        />
      </div>

      {/* Word Count and Time Settings */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="essay-min-words-input"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Min Words (optional)
          </label>
          <input
            id="essay-min-words-input"
            type="number"
            value={block.content.minWords || ''}
            onChange={(e) =>
              onChange({ ...block.content, minWords: parseInt(e.target.value, 10) || undefined })
            }
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            placeholder="100"
            min="1"
          />
        </div>
        <div>
          <label
            htmlFor="essay-max-words-input"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Max Words (optional)
          </label>
          <input
            id="essay-max-words-input"
            type="number"
            value={block.content.maxWords || ''}
            onChange={(e) =>
              onChange({ ...block.content, maxWords: parseInt(e.target.value, 10) || undefined })
            }
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            placeholder="500"
            min="1"
          />
        </div>
        <div>
          <label
            htmlFor="essay-time-limit-input"
            className="block text-sm font-medium text-brand-secondary mb-2 flex items-center gap-1"
          >
            <Clock aria-hidden="true" className="w-4 h-4" />
            Time Limit (min)
          </label>
          <input
            id="essay-time-limit-input"
            type="number"
            value={block.content.timeLimit || ''}
            onChange={(e) =>
              onChange({ ...block.content, timeLimit: parseInt(e.target.value, 10) || undefined })
            }
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            placeholder="60"
            min="1"
          />
        </div>
      </div>

      {/* Rubric Builder */}
      <div className="border-t border-brand-default pt-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-sm font-medium text-brand-secondary flex items-center gap-2">
              <Award aria-hidden="true" className="w-4 h-4" />
              Grading Rubric
            </span>
            {totalPoints > 0 && (
              <p className="text-xs text-brand-muted mt-1">Total: {totalPoints} points</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-brand-blue hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50"
            >
              <Eye aria-hidden="true" className="w-3 h-3" />
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button
              type="button"
              onClick={addCriterion}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-brand-primary bg-brand-primary hover:bg-brand-primary-hover rounded-lg"
            >
              <Plus aria-hidden="true" className="w-3 h-3" />
              Add Criterion
            </button>
          </div>
        </div>

        {rubricCriteria.length === 0 ? (
          <div className="border border-brand-default rounded-lg p-4 text-center text-sm text-brand-muted">
            No rubric criteria added yet. Click "Add Criterion" to build your grading rubric.
          </div>
        ) : showPreview ? (
          // Preview Mode
          <div className="bg-linear-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 mb-3">
              <strong>Rubric Preview:</strong> {rubricCriteria.length} criteria, {totalPoints} total
              points
            </p>
            <div className="bg-brand-surface rounded-lg p-4 border border-brand-default">
              <div className="space-y-4">
                {rubricCriteria.map((criterion, idx) => (
                  <div
                    key={criterion.id}
                    className="border-b border-brand-default pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-brand-primary">
                          {idx + 1}. {criterion.name || '(Untitled Criterion)'}
                        </h4>
                        {criterion.description && (
                          <p className="text-sm text-brand-secondary mt-1">
                            {criterion.description}
                          </p>
                        )}
                      </div>
                      <span className="text-sm font-medium text-brand-blue">
                        {criterion.maxPoints} pts
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {criterion.levels.map((level, levelIdx) => (
                        <div key={levelIdx} className="border border-brand-default rounded p-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-brand-secondary">
                              {level.name}
                            </span>
                            <span className="text-xs text-brand-blue">{level.points}</span>
                          </div>
                          {level.description && (
                            <p className="text-xs text-brand-secondary">{level.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-4">
            {rubricCriteria.map((criterion, index) => (
              <div
                key={criterion.id}
                className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 bg-brand-primary text-brand-primary rounded-full flex items-center justify-center text-sm font-medium mt-1">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-brand-secondary">
                        Criterion {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCriterion(criterion.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        aria-label={`Remove criterion ${index + 1}`}
                      >
                        <X aria-hidden="true" className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Criterion Name */}
                    <div>
                      <label
                        htmlFor={`criterion-name-${criterion.id}`}
                        className="block text-xs font-medium text-brand-secondary mb-1"
                      >
                        Criterion Name
                      </label>
                      <input
                        id={`criterion-name-${criterion.id}`}
                        type="text"
                        value={criterion.name}
                        onChange={(e) => updateCriterion(criterion.id, { name: e.target.value })}
                        className="w-full px-3 py-2 border border-brand-strong rounded-lg text-sm bg-brand-surface"
                        placeholder="e.g., Thesis Statement, Organization, Evidence & Support"
                      />
                    </div>

                    {/* Criterion Description */}
                    <div>
                      <label
                        htmlFor={`criterion-description-${criterion.id}`}
                        className="block text-xs font-medium text-brand-secondary mb-1"
                      >
                        Description (what to assess)
                      </label>
                      <textarea
                        id={`criterion-description-${criterion.id}`}
                        value={criterion.description}
                        onChange={(e) =>
                          updateCriterion(criterion.id, { description: e.target.value })
                        }
                        rows={2}
                        className="w-full px-3 py-2 border border-brand-strong rounded-lg text-sm bg-brand-surface"
                        placeholder="Describe what this criterion evaluates..."
                      />
                    </div>

                    {/* Max Points */}
                    <div>
                      <label
                        htmlFor={`criterion-max-points-${criterion.id}`}
                        className="block text-xs font-medium text-brand-secondary mb-1"
                      >
                        Maximum Points
                      </label>
                      <input
                        id={`criterion-max-points-${criterion.id}`}
                        type="number"
                        value={criterion.maxPoints}
                        onChange={(e) => {
                          const maxPoints = parseInt(e.target.value, 10) || 0;
                          updateCriterion(criterion.id, {
                            maxPoints,
                            levels: criterion.levels.map((level, idx) => ({
                              ...level,
                              points: Math.round(
                                (maxPoints * (criterion.levels.length - idx)) /
                                  criterion.levels.length,
                              ),
                            })),
                          });
                        }}
                        className="w-32 px-3 py-2 border border-brand-strong rounded-lg text-sm bg-brand-surface"
                        min="1"
                      />
                    </div>

                    {/* Performance Levels */}
                    <fieldset>
                      <legend className="block text-xs font-medium text-brand-secondary mb-2">
                        Performance Levels
                      </legend>
                      <div className="grid grid-cols-2 gap-2">
                        {criterion.levels.map((level, levelIdx) => (
                          <div
                            key={levelIdx}
                            className="border border-brand-strong rounded p-2 bg-brand-surface"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <label
                                htmlFor={`level-name-${criterion.id}-${levelIdx}`}
                                className="sr-only"
                              >
                                Level {levelIdx + 1} name
                              </label>
                              <input
                                id={`level-name-${criterion.id}-${levelIdx}`}
                                type="text"
                                value={level.name}
                                onChange={(e) => {
                                  const newLevels = [...criterion.levels];
                                  newLevels[levelIdx] = { ...level, name: e.target.value };
                                  updateCriterion(criterion.id, { levels: newLevels });
                                }}
                                className="flex-1 px-2 py-1 border border-brand-default rounded text-xs"
                                placeholder="Level name"
                              />
                              <label
                                htmlFor={`level-points-${criterion.id}-${levelIdx}`}
                                className="sr-only"
                              >
                                Level {levelIdx + 1} points
                              </label>
                              <input
                                id={`level-points-${criterion.id}-${levelIdx}`}
                                type="number"
                                value={level.points}
                                onChange={(e) => {
                                  const newLevels = [...criterion.levels];
                                  newLevels[levelIdx] = {
                                    ...level,
                                    points: parseInt(e.target.value, 10) || 0,
                                  };
                                  updateCriterion(criterion.id, { levels: newLevels });
                                }}
                                className="w-16 px-2 py-1 border border-brand-default rounded text-xs"
                                min="0"
                                max={criterion.maxPoints}
                              />
                            </div>
                            <label
                              htmlFor={`level-description-${criterion.id}-${levelIdx}`}
                              className="sr-only"
                            >
                              Level {levelIdx + 1} description
                            </label>
                            <textarea
                              id={`level-description-${criterion.id}-${levelIdx}`}
                              value={level.description}
                              onChange={(e) => {
                                const newLevels = [...criterion.levels];
                                newLevels[levelIdx] = { ...level, description: e.target.value };
                                updateCriterion(criterion.id, { levels: newLevels });
                              }}
                              rows={2}
                              className="w-full px-2 py-1 border border-brand-default rounded text-xs"
                              placeholder="Description for this level..."
                            />
                          </div>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Simple Rubric (legacy support) */}
      <div className="border-t border-brand-default pt-4">
        <label
          htmlFor="essay-simple-rubric-input"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          Simple Rubric Text (optional - use if not using detailed rubric above)
        </label>
        <textarea
          id="essay-simple-rubric-input"
          value={block.content.rubric || ''}
          onChange={(e) => onChange({ ...block.content, rubric: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="Simple grading criteria as plain text..."
        />
      </div>

      {/* Submission Settings */}
      <div className="border-t border-brand-default pt-4 space-y-4">
        <h4 className="text-sm font-medium text-brand-primary">Submission Settings</h4>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="essay-total-points-input"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              Total Points
            </label>
            <input
              id="essay-total-points-input"
              type="number"
              value={block.content.points || totalPoints}
              onChange={(e) =>
                onChange({ ...block.content, points: parseInt(e.target.value, 10) || undefined })
              }
              className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder={totalPoints > 0 ? `${totalPoints} (from rubric)` : '50'}
              min="0"
            />
            <p className="text-xs text-brand-muted mt-1">
              {totalPoints > 0 ? 'Overrides rubric total if specified' : 'Required if no rubric'}
            </p>
          </div>

          <div>
            <label
              htmlFor="essay-passing-score-input"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              Passing Score (%)
            </label>
            <input
              id="essay-passing-score-input"
              type="number"
              value={block.content.passingScore || 70}
              onChange={(e) =>
                onChange({ ...block.content, passingScore: parseInt(e.target.value, 10) || 70 })
              }
              className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              min="0"
              max="100"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.allowDraft !== false}
              onChange={(e) => onChange({ ...block.content, allowDraft: e.target.checked })}
              className="w-4 h-4 text-brand-blue rounded"
            />
            <span className="text-sm text-brand-secondary">Allow learners to save drafts</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.allowRevision || false}
              onChange={(e) => onChange({ ...block.content, allowRevision: e.target.checked })}
              className="w-4 h-4 text-brand-blue rounded"
            />
            <span className="text-sm text-brand-secondary">
              Allow resubmission/revision after grading
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.requirePeerReview || false}
              onChange={(e) => onChange({ ...block.content, requirePeerReview: e.target.checked })}
              className="w-4 h-4 text-brand-blue rounded"
            />
            <span className="text-sm text-brand-secondary">
              Require peer review before submission
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.plagiarismCheck || false}
              onChange={(e) => onChange({ ...block.content, plagiarismCheck: e.target.checked })}
              className="w-4 h-4 text-brand-blue rounded"
            />
            <span className="text-sm text-brand-secondary">Enable plagiarism detection</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.anonymousGrading || false}
              onChange={(e) => onChange({ ...block.content, anonymousGrading: e.target.checked })}
              className="w-4 h-4 text-brand-blue rounded"
            />
            <span className="text-sm text-brand-secondary">
              Anonymous grading (hide learner names)
            </span>
          </label>
        </div>
      </div>

      {/* Resources */}
      <div className="border-t border-brand-default pt-4">
        <label
          htmlFor="essay-resources-input"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          Resources & Examples (optional)
        </label>
        <textarea
          id="essay-resources-input"
          value={block.content.resources || ''}
          onChange={(e) => onChange({ ...block.content, resources: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="Links to sample essays, writing guides, research materials, etc."
        />
      </div>

      {/* Helper Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex gap-2">
          <Info aria-hidden="true" className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800">
            <strong>Essay Assignment tip:</strong> Use detailed rubric criteria for consistent
            grading. Provide clear examples of what constitutes different performance levels.
            Consider word limits to focus responses. Enable drafts for longer assignments.
          </p>
        </div>
      </div>
    </div>
  );
};
