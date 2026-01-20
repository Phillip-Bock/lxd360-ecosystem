import { AlertCircle, CheckCircle, Eye, Info, Lightbulb, Plus, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import type { FillBlankBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface FillBlankBlockEditorProps {
  block: FillBlankBlock;
  onChange: (content: FillBlankBlock['content']) => void;
}

export const FillBlankBlockEditor = ({
  block,
  onChange,
}: FillBlankBlockEditorProps): React.JSX.Element => {
  const [showPreview, setShowPreview] = useState(false);

  const addBlank = (): void => {
    onChange({
      ...block.content,
      blanks: [
        ...block.content.blanks,
        {
          id: `blank_${Date.now()}`,
          position: block.content.blanks.length,
          correctAnswer: [''],
          caseSensitive: false,
        },
      ],
    });
  };

  const removeBlank = (id: string): void => {
    onChange({
      ...block.content,
      blanks: block.content.blanks
        .filter((blank) => blank.id !== id)
        .map((blank, index) => ({ ...blank, position: index })),
    });
  };

  const updateBlank = (id: string, field: string, value: unknown): void => {
    onChange({
      ...block.content,
      blanks: block.content.blanks.map((blank) =>
        blank.id === id ? { ...blank, [field]: value } : blank,
      ),
    });
  };

  const updateBlankAnswers = (id: string, answersText: string): void => {
    const answers = answersText
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a);
    updateBlank(id, 'correctAnswer', answers);
  };

  // Auto-detect blanks from text
  const autoDetectBlanks = (): void => {
    const text = block.content.text;
    const blankPattern = /\[___\]/g;
    const matches = text.match(blankPattern);

    if (!matches) {
      return;
    }

    const newBlanks = matches.map((_, index) => ({
      id: `blank_${Date.now()}_${index}`,
      position: index,
      correctAnswer: [''],
      caseSensitive: false,
    }));

    onChange({
      ...block.content,
      blanks: newBlanks,
    });
  };

  // Count blanks in text
  const countBlanksInText = (): number => {
    const text = block.content.text;
    const blankPattern = /\[___\]/g;
    const matches = text.match(blankPattern);
    return matches ? matches.length : 0;
  };

  const blanksInText = countBlanksInText();
  const blanksConfigured = block.content.blanks.length;
  const blanksMatch = blanksInText === blanksConfigured;

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label
          htmlFor="fill-blank-title-input"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          Exercise Title
        </label>
        <input
          id="fill-blank-title-input"
          type="text"
          value={block.content.title || ''}
          onChange={(e) => onChange({ ...block.content, title: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="e.g., Complete the Sentences, Vocabulary Practice"
        />
      </div>

      {/* Instructions */}
      <div>
        <label
          htmlFor="fill-blank-instructions-input"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          Instructions for Learners (optional)
        </label>
        <textarea
          id="fill-blank-instructions-input"
          value={block.content.instructions || ''}
          onChange={(e) => onChange({ ...block.content, instructions: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="e.g., Fill in the blanks with the correct words..."
        />
      </div>

      {/* Text with Blanks */}
      <div>
        <label
          htmlFor="fill-blank-text-input"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          Text with Blanks
        </label>
        <textarea
          id="fill-blank-text-input"
          value={block.content.text}
          onChange={(e) => onChange({ ...block.content, text: e.target.value })}
          rows={6}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent font-mono text-sm"
          placeholder="Write your text here and use [___] to mark where blanks should appear.&#10;&#10;Example:&#10;The capital of France is [___]. The Eiffel Tower is located in [___]."
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-brand-muted">
            Use <code className="bg-brand-surface px-1 rounded">[___]</code> to indicate blank
            positions
          </p>
          <button
            type="button"
            onClick={autoDetectBlanks}
            className="flex items-center gap-1 px-3 py-1 text-xs text-brand-blue hover:bg-blue-50 rounded-lg border border-blue-200"
          >
            <Sparkles className="w-3 h-3" aria-hidden="true" />
            Auto-detect blanks
          </button>
        </div>
      </div>

      {/* Blank Counter Status */}
      {blanksInText > 0 && (
        <div
          className={`p-3 rounded-lg border flex items-start gap-2 ${
            blanksMatch ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
          }`}
        >
          {blanksMatch ? (
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" aria-hidden="true" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" aria-hidden="true" />
          )}
          <div className="text-sm">
            <p className={blanksMatch ? 'text-green-800' : 'text-yellow-800'}>
              {blanksMatch ? (
                <>
                  ✓ All blanks configured: {blanksInText} blanks in text, {blanksConfigured}{' '}
                  configured
                </>
              ) : (
                <>
                  ⚠️ Mismatch: {blanksInText} blanks in text, but {blanksConfigured} configured
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Blank Definitions */}
      <div className="border-t border-brand-default pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-brand-secondary">Blank Definitions</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-brand-blue hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50"
            >
              <Eye className="w-3 h-3" aria-hidden="true" />
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button
              type="button"
              onClick={addBlank}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-brand-primary bg-brand-primary hover:bg-brand-primary-hover rounded-lg"
            >
              <Plus className="w-3 h-3" aria-hidden="true" />
              Add Blank
            </button>
          </div>
        </div>

        {block.content.blanks.length === 0 ? (
          <div className="border border-brand-default rounded-lg p-4 text-center text-sm text-brand-muted">
            No blanks configured yet. Click "Auto-detect blanks" or "Add Blank" to start.
          </div>
        ) : showPreview ? (
          // Preview Mode
          <div className="bg-linear-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 mb-3">
              <strong>Preview:</strong> How learners will see the exercise
            </p>
            <div className="bg-brand-surface rounded-lg p-4 border border-brand-default">
              <h3 className="font-medium text-brand-primary mb-2">
                {block.content.title || 'Fill in the Blanks'}
              </h3>
              {block.content.instructions && (
                <p className="text-sm text-brand-secondary mb-4">{block.content.instructions}</p>
              )}
              <div className="space-y-3">
                {block.content.text.split(/(\[___\])/).map((part, idx) => {
                  if (part === '[___]') {
                    const blankIndex =
                      block.content.text
                        .substring(0, block.content.text.indexOf(part))
                        .split('[___]').length - 1;
                    const blank = block.content.blanks[blankIndex];
                    return (
                      <span key={idx} className="inline-flex flex-col items-start mx-1">
                        <input
                          type="text"
                          className="w-32 px-2 py-1 border-b-2 border-brand-primary text-sm bg-blue-50"
                          placeholder={`Blank ${blankIndex + 1}`}
                          disabled
                        />
                        {blank?.hint && (
                          <span className="text-xs text-brand-muted italic mt-0.5">
                            💡 {blank.hint}
                          </span>
                        )}
                      </span>
                    );
                  }
                  return <span key={idx}>{part}</span>;
                })}
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-3">
            {block.content.blanks.map((blank, index) => (
              <div
                key={blank.id}
                className="border-2 border-brand-default rounded-lg p-4 hover:border-blue-300 transition-colors bg-brand-surface"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 bg-brand-primary text-brand-primary rounded-full flex items-center justify-center text-sm font-medium mt-1">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-brand-secondary">
                        Blank {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeBlank(blank.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        aria-label={`Remove blank ${index + 1}`}
                      >
                        <X className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>

                    {/* Correct Answers */}
                    <div>
                      <label
                        htmlFor={`fill-blank-answers-${blank.id}`}
                        className="block text-xs font-medium text-brand-secondary mb-1"
                      >
                        Correct Answers (comma-separated)
                      </label>
                      <input
                        id={`fill-blank-answers-${blank.id}`}
                        type="text"
                        value={blank.correctAnswer.join(', ')}
                        onChange={(e) => updateBlankAnswers(blank.id, e.target.value)}
                        className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
                        placeholder="answer1, answer2, answer3"
                      />
                      <p className="text-xs text-brand-muted mt-1">
                        Multiple accepted answers separated by commas (e.g., "Paris, paris, PARIS")
                      </p>
                    </div>

                    {/* Hint */}
                    <div>
                      <label
                        htmlFor={`fill-blank-hint-${blank.id}`}
                        className="block text-xs font-medium text-brand-secondary mb-1 flex items-center gap-1"
                      >
                        <Lightbulb className="w-3 h-3" aria-hidden="true" />
                        Hint (optional)
                      </label>
                      <input
                        id={`fill-blank-hint-${blank.id}`}
                        type="text"
                        value={blank.hint || ''}
                        onChange={(e) => updateBlank(blank.id, 'hint', e.target.value)}
                        className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
                        placeholder="e.g., 'Capital city of France'"
                      />
                    </div>

                    {/* Feedback */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label
                          htmlFor={`fill-blank-correct-feedback-${blank.id}`}
                          className="block text-xs font-medium text-brand-secondary mb-1"
                        >
                          Correct Feedback (optional)
                        </label>
                        <input
                          id={`fill-blank-correct-feedback-${blank.id}`}
                          type="text"
                          value={blank.correctFeedback || ''}
                          onChange={(e) => updateBlank(blank.id, 'correctFeedback', e.target.value)}
                          className="w-full px-2 py-1.5 border border-brand-strong rounded-lg text-xs"
                          placeholder="Well done!"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`fill-blank-incorrect-feedback-${blank.id}`}
                          className="block text-xs font-medium text-brand-secondary mb-1"
                        >
                          Incorrect Feedback (optional)
                        </label>
                        <input
                          id={`fill-blank-incorrect-feedback-${blank.id}`}
                          type="text"
                          value={blank.incorrectFeedback || ''}
                          onChange={(e) =>
                            updateBlank(blank.id, 'incorrectFeedback', e.target.value)
                          }
                          className="w-full px-2 py-1.5 border border-brand-strong rounded-lg text-xs"
                          placeholder="Try again"
                        />
                      </div>
                    </div>

                    {/* Points and Case Sensitive */}
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={blank.caseSensitive}
                          onChange={(e) => updateBlank(blank.id, 'caseSensitive', e.target.checked)}
                          className="w-4 h-4 text-brand-blue rounded"
                        />
                        <span className="text-xs font-medium text-brand-secondary">
                          Case sensitive
                        </span>
                      </label>
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor={`fill-blank-points-${blank.id}`}
                          className="text-xs font-medium text-brand-secondary"
                        >
                          Points:
                        </label>
                        <input
                          id={`fill-blank-points-${blank.id}`}
                          type="number"
                          value={blank.points || 1}
                          onChange={(e) =>
                            updateBlank(blank.id, 'points', parseInt(e.target.value, 10) || 1)
                          }
                          className="w-16 px-2 py-1 border border-brand-strong rounded text-xs"
                          min="1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exercise Settings */}
      <div className="border-t border-brand-default pt-4 space-y-4">
        <h4 className="text-sm font-medium text-brand-primary">Exercise Settings</h4>

        <div className="grid grid-cols-2 gap-4">
          {/* Total Points */}
          <div>
            <label
              htmlFor="fill-blank-total-points-input"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              Total Points
            </label>
            <input
              id="fill-blank-total-points-input"
              type="number"
              value={
                block.content.points ||
                block.content.blanks.reduce((sum, b) => sum + (b.points || 1), 0)
              }
              onChange={(e) =>
                onChange({ ...block.content, points: parseInt(e.target.value, 10) || undefined })
              }
              className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="Auto-calculated"
              min="0"
            />
            <p className="text-xs text-brand-muted mt-1">
              Leave blank to auto-sum from individual blanks
            </p>
          </div>

          {/* Passing Score */}
          <div>
            <label
              htmlFor="fill-blank-passing-score-input"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              Passing Score (%)
            </label>
            <input
              id="fill-blank-passing-score-input"
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

        {/* Options */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.allowRetry !== false}
              onChange={(e) => onChange({ ...block.content, allowRetry: e.target.checked })}
              className="w-4 h-4 text-brand-blue rounded"
            />
            <span className="text-sm text-brand-secondary">Allow learners to retry</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.showHints !== false}
              onChange={(e) => onChange({ ...block.content, showHints: e.target.checked })}
              className="w-4 h-4 text-brand-blue rounded"
            />
            <span className="text-sm text-brand-secondary">Show hints to learners</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.instantFeedback !== false}
              onChange={(e) => onChange({ ...block.content, instantFeedback: e.target.checked })}
              className="w-4 h-4 text-brand-blue rounded"
            />
            <span className="text-sm text-brand-secondary">Show instant feedback per blank</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.content.shuffleBlanks || false}
              onChange={(e) => onChange({ ...block.content, shuffleBlanks: e.target.checked })}
              className="w-4 h-4 text-brand-blue rounded"
            />
            <span className="text-sm text-brand-secondary">
              Randomize blank order (for dropdown mode)
            </span>
          </label>
        </div>
      </div>

      {/* Overall Explanation */}
      <div className="border-t border-brand-default pt-4">
        <label
          htmlFor="fill-blank-explanation-input"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          Overall Explanation (shown after completion)
        </label>
        <textarea
          id="fill-blank-explanation-input"
          value={block.content.explanation || ''}
          onChange={(e) => onChange({ ...block.content, explanation: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="Provide context, explain the answers, or offer additional learning resources..."
        />
      </div>

      {/* Helper Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex gap-2">
          <Info className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-blue-800">
            <strong>Fill in the Blanks tip:</strong> Keep sentences clear and contextual. Provide
            hints for challenging blanks. Accept multiple valid answers (synonyms, alternate
            spellings). Use case-sensitive mode only when necessary.
          </p>
        </div>
      </div>
    </div>
  );
};
