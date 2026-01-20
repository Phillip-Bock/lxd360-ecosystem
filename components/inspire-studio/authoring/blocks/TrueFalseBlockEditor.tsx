import { useId } from 'react';
import type { TrueFalseBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface TrueFalseBlockEditorProps {
  block: TrueFalseBlock;
  onChange: (content: TrueFalseBlock['content']) => void;
}

export const TrueFalseBlockEditor = ({
  block,
  onChange,
}: TrueFalseBlockEditorProps): React.JSX.Element => {
  const baseId = useId();
  const questionId = `${baseId}-question`;
  const correctAnswerGroupId = `${baseId}-correct-answer`;
  const trueOptionId = `${baseId}-true`;
  const falseOptionId = `${baseId}-false`;
  const explanationId = `${baseId}-explanation`;
  const pointsId = `${baseId}-points`;
  const radioGroupName = `${baseId}-answer`;

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor={questionId} className="block text-sm font-medium text-brand-secondary mb-1">
          Question
        </label>
        <textarea
          id={questionId}
          value={block.content.question}
          onChange={(e) => onChange({ ...block.content, question: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Enter your true/false question..."
        />
      </div>
      <fieldset>
        <legend
          id={correctAnswerGroupId}
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          Correct Answer
        </legend>
        <div className="flex gap-4" role="radiogroup" aria-labelledby={correctAnswerGroupId}>
          <label htmlFor={trueOptionId} className="flex items-center gap-2 cursor-pointer">
            <input
              id={trueOptionId}
              type="radio"
              name={radioGroupName}
              checked={block.content.correctAnswer === true}
              onChange={() => onChange({ ...block.content, correctAnswer: true })}
              className="w-4 h-4 text-brand-blue"
            />
            <span className="text-brand-secondary">True</span>
          </label>
          <label htmlFor={falseOptionId} className="flex items-center gap-2 cursor-pointer">
            <input
              id={falseOptionId}
              type="radio"
              name={radioGroupName}
              checked={block.content.correctAnswer === false}
              onChange={() => onChange({ ...block.content, correctAnswer: false })}
              className="w-4 h-4 text-brand-blue"
            />
            <span className="text-brand-secondary">False</span>
          </label>
        </div>
      </fieldset>
      <div>
        <label
          htmlFor={explanationId}
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Explanation (optional)
        </label>
        <textarea
          id={explanationId}
          value={block.content.explanation || ''}
          onChange={(e) => onChange({ ...block.content, explanation: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Explain why this is the correct answer..."
        />
      </div>
      <div>
        <label htmlFor={pointsId} className="block text-sm font-medium text-brand-secondary mb-1">
          Points (optional)
        </label>
        <input
          id={pointsId}
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
