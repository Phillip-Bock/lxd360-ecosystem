import { Check, Plus, X } from 'lucide-react';
import type { MultipleChoiceBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface MultipleChoiceBlockEditorProps {
  block: MultipleChoiceBlock;
  onChange: (content: MultipleChoiceBlock['content']) => void;
}

export const MultipleChoiceBlockEditor = ({
  block,
  onChange,
}: MultipleChoiceBlockEditorProps): React.JSX.Element => {
  const addOption = (): void => {
    const newOption = {
      id: `opt_${Date.now()}`,
      text: '',
      isCorrect: false,
    };
    onChange({
      ...block.content,
      options: [...block.content.options, newOption],
    });
  };

  const updateOption = (optionId: string, text: string): void => {
    onChange({
      ...block.content,
      options: block.content.options.map((opt) => (opt.id === optionId ? { ...opt, text } : opt)),
    });
  };

  const toggleCorrect = (optionId: string): void => {
    onChange({
      ...block.content,
      options: block.content.options.map((opt) =>
        opt.id === optionId
          ? { ...opt, isCorrect: !opt.isCorrect }
          : block.content.allowMultiple
            ? opt
            : { ...opt, isCorrect: false },
      ),
    });
  };

  const removeOption = (optionId: string): void => {
    onChange({
      ...block.content,
      options: block.content.options.filter((opt) => opt.id !== optionId),
    });
  };

  return (
    <div className="space-y-4">
      {/* Question */}
      <div>
        <label
          htmlFor={`question-${block.id}`}
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Question
        </label>
        <textarea
          id={`question-${block.id}`}
          value={block.content.question}
          onChange={(e) => onChange({ ...block.content, question: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent min-h-[80px]"
          placeholder="Enter your question..."
        />
      </div>

      {/* Allow Multiple Answers */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="allowMultiple"
          checked={
            typeof block.content.allowMultiple === 'boolean' ? block.content.allowMultiple : false
          }
          onChange={(e) => onChange({ ...block.content, allowMultiple: e.target.checked })}
          className="w-4 h-4 text-brand-blue rounded focus:ring-brand-primary"
        />
        <label htmlFor="allowMultiple" className="text-sm text-brand-secondary">
          Allow multiple correct answers
        </label>
      </div>

      {/* Options */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="block text-sm font-medium text-brand-secondary">Answer Options</span>
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Option
          </button>
        </div>

        <div className="space-y-2">
          {block.content.options.map((option, index) => (
            <div key={option.id} className="flex items-start gap-2">
              <button
                type="button"
                onClick={() => toggleCorrect(option.id)}
                className={`mt-2 p-1 rounded border-2 transition-colors ${
                  option.isCorrect
                    ? 'bg-brand-success border-brand-success text-brand-primary'
                    : 'bg-brand-surface border-brand-strong text-transparent hover:border-gray-400'
                }`}
                title="Mark as correct"
              >
                <Check className="w-4 h-4" />
              </button>

              <div className="flex-1">
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => updateOption(option.id, e.target.value)}
                  className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder={`Option ${index + 1}`}
                />
              </div>

              <button
                type="button"
                onClick={() => removeOption(option.id)}
                className="mt-2 p-1 text-brand-muted hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Remove option"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Explanation */}
      <div>
        <label
          htmlFor={`explanation-${block.id}`}
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Explanation (optional)
        </label>
        <textarea
          id={`explanation-${block.id}`}
          value={block.content.explanation || ''}
          onChange={(e) => onChange({ ...block.content, explanation: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent min-h-[60px]"
          placeholder="Explain the correct answer..."
        />
      </div>

      {/* Points */}
      <div>
        <label
          htmlFor={`points-${block.id}`}
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Points
        </label>
        <input
          id={`points-${block.id}`}
          type="number"
          value={typeof block.content.points === 'number' ? block.content.points : 1}
          onChange={(e) => onChange({ ...block.content, points: Number(e.target.value) })}
          className="w-32 px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          min="0"
          step="1"
        />
      </div>
    </div>
  );
};
