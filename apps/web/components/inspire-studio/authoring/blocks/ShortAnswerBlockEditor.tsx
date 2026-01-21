import type { ShortAnswerBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface ShortAnswerBlockEditorProps {
  block: ShortAnswerBlock;
  onChange: (content: ShortAnswerBlock['content']) => void;
}

export const ShortAnswerBlockEditor = ({
  block,
  onChange,
}: ShortAnswerBlockEditorProps): React.JSX.Element => {
  const questionId = `short-answer-question-${block.id}`;
  const sampleAnswerId = `short-answer-sample-${block.id}`;
  const maxLengthId = `short-answer-maxlength-${block.id}`;
  const pointsId = `short-answer-points-${block.id}`;

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
          placeholder="Enter your question..."
        />
      </div>
      <div>
        <label
          htmlFor={sampleAnswerId}
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Sample Answer (optional)
        </label>
        <textarea
          id={sampleAnswerId}
          value={typeof block.content.sampleAnswer === 'string' ? block.content.sampleAnswer : ''}
          onChange={(e) => onChange({ ...block.content, sampleAnswer: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Provide a sample answer for reference..."
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor={maxLengthId}
            className="block text-sm font-medium text-brand-secondary mb-1"
          >
            Max Length (optional)
          </label>
          <input
            id={maxLengthId}
            type="number"
            value={block.content.maxLength || ''}
            onChange={(e) =>
              onChange({ ...block.content, maxLength: parseInt(e.target.value, 10) || undefined })
            }
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
            placeholder="500"
            min="1"
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
    </div>
  );
};
