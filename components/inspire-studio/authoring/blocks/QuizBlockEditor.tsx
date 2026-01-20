import type { QuizBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface QuizBlockEditorProps {
  block: QuizBlock;
  onChange: (content: QuizBlock['content']) => void;
}

export const QuizBlockEditor = ({ block, onChange }: QuizBlockEditorProps): React.JSX.Element => {
  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor="quiz-question"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Question
        </label>
        <textarea
          id="quiz-question"
          value={block.content.question}
          onChange={(e) => onChange({ ...block.content, question: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Enter your quiz question..."
        />
      </div>
      <div>
        <label htmlFor="quiz-type" className="block text-sm font-medium text-brand-secondary mb-2">
          Question Type
        </label>
        <select
          id="quiz-type"
          value={typeof block.content.type === 'string' ? block.content.type : 'multiple_choice'}
          onChange={(e) => onChange({ ...block.content, type: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
        >
          <option value="multiple_choice">Multiple Choice</option>
          <option value="true_false">True/False</option>
          <option value="short_answer">Short Answer</option>
        </select>
      </div>
      {(typeof block.content.type === 'string' ? block.content.type : 'multiple_choice') ===
        'multiple_choice' && (
        <div>
          <label
            htmlFor="quiz-options"
            className="block text-sm font-medium text-brand-secondary mb-1"
          >
            Options (one per line)
          </label>
          <textarea
            id="quiz-options"
            value={
              Array.isArray(block.content.options)
                ? block.content.options
                    .map((opt) => (typeof opt === 'string' ? opt : opt.text))
                    .join('\n')
                : ''
            }
            onChange={(e) => {
              const optionTexts = e.target.value.split('\n').filter((o) => o.trim());
              const options = optionTexts.map((text, idx) => ({
                id: `opt_${idx}`,
                text,
                isCorrect: false,
              }));
              onChange({ ...block.content, options });
            }}
            rows={4}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
            placeholder="Option 1&#10;Option 2&#10;Option 3"
          />
        </div>
      )}
      <div>
        <label
          htmlFor="quiz-correct-answer"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Correct Answer
        </label>
        {(typeof block.content.type === 'string' ? block.content.type : 'multiple_choice') ===
        'true_false' ? (
          <select
            id="quiz-correct-answer"
            value={
              typeof block.content.correctAnswer === 'boolean'
                ? block.content.correctAnswer
                  ? 'true'
                  : 'false'
                : typeof block.content.correctAnswer === 'string'
                  ? block.content.correctAnswer
                  : 'true'
            }
            onChange={(e) => onChange({ ...block.content, correctAnswer: e.target.value })}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        ) : (
          <input
            id="quiz-correct-answer"
            type="text"
            value={
              Array.isArray(block.content.correctAnswer)
                ? block.content.correctAnswer.join(', ')
                : typeof block.content.correctAnswer === 'string' ||
                    typeof block.content.correctAnswer === 'number'
                  ? String(block.content.correctAnswer)
                  : ''
            }
            onChange={(e) => onChange({ ...block.content, correctAnswer: e.target.value })}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
            placeholder="Enter correct answer(s)"
          />
        )}
      </div>
      <div>
        <label
          htmlFor="quiz-explanation"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Explanation (optional)
        </label>
        <textarea
          id="quiz-explanation"
          value={block.content.explanation || ''}
          onChange={(e) => onChange({ ...block.content, explanation: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Explain the correct answer..."
        />
      </div>
      <div>
        <label
          htmlFor="quiz-points"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Points (optional)
        </label>
        <input
          id="quiz-points"
          type="number"
          value={typeof block.content.points === 'number' ? block.content.points : ''}
          onChange={(e) =>
            onChange({ ...block.content, points: parseInt(e.target.value, 10) || undefined })
          }
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="10"
          min="0"
        />
      </div>
    </div>
  );
};
