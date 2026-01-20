import { Plus, X } from 'lucide-react';
import type { ReflectionBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface ReflectionBlockEditorProps {
  block: ReflectionBlock;
  onChange: (content: ReflectionBlock['content']) => void;
}

export const ReflectionBlockEditor = ({
  block,
  onChange,
}: ReflectionBlockEditorProps): React.JSX.Element => {
  const addQuestion = (): void => {
    onChange({
      ...block.content,
      guidingQuestions: [...(block.content.guidingQuestions || []), ''],
    });
  };

  const removeQuestion = (index: number): void => {
    onChange({
      ...block.content,
      guidingQuestions: block.content.guidingQuestions?.filter((_, i) => i !== index),
    });
  };

  const updateQuestion = (index: number, value: string): void => {
    const questions = [...(block.content.guidingQuestions || [])];
    questions[index] = value;
    onChange({ ...block.content, guidingQuestions: questions });
  };

  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor="reflection-prompt"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Reflection Prompt
        </label>
        <textarea
          id="reflection-prompt"
          value={block.content.prompt}
          onChange={(e) => onChange({ ...block.content, prompt: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="What did you learn from this lesson?"
        />
      </div>
      <div className="space-y-2">
        <span className="block text-sm font-medium text-brand-secondary">
          Guiding Questions (optional)
        </span>
        {block.content.guidingQuestions?.map((question, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => updateQuestion(index, e.target.value)}
              className="flex-1 px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
              placeholder={`Question ${index + 1}`}
            />
            <button
              type="button"
              onClick={() => removeQuestion(index)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addQuestion}
          className="flex items-center gap-2 px-4 py-2 text-brand-blue hover:bg-blue-50 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>
      <div>
        <label
          htmlFor="reflection-min-words"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Minimum Words (optional)
        </label>
        <input
          id="reflection-min-words"
          type="number"
          value={typeof block.content.minWords === 'number' ? block.content.minWords : ''}
          onChange={(e) =>
            onChange({ ...block.content, minWords: parseInt(e.target.value, 10) || undefined })
          }
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="100"
          min="1"
        />
      </div>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={typeof block.content.isPrivate === 'boolean' ? block.content.isPrivate : false}
          onChange={(e) => onChange({ ...block.content, isPrivate: e.target.checked })}
          className="w-4 h-4 text-brand-blue rounded"
        />
        <span className="text-sm font-medium text-brand-secondary">
          Make reflection private (only visible to learner and instructor)
        </span>
      </label>
    </div>
  );
};
