import type { SliderBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface SliderBlockEditorProps {
  block: SliderBlock;
  onChange: (content: SliderBlock['content']) => void;
}

export const SliderBlockEditor = ({
  block,
  onChange,
}: SliderBlockEditorProps): React.JSX.Element => {
  const questionId = `slider-question-${block.id}`;
  const minId = `slider-min-${block.id}`;
  const maxId = `slider-max-${block.id}`;
  const stepId = `slider-step-${block.id}`;
  const correctValueId = `slider-correct-value-${block.id}`;
  const unitId = `slider-unit-${block.id}`;
  const explanationId = `slider-explanation-${block.id}`;

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor={questionId} className="block text-sm font-medium text-brand-secondary mb-1">
          Question
        </label>
        <input
          id={questionId}
          type="text"
          value={block.content.question}
          onChange={(e) => onChange({ ...block.content, question: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="What value do you select?"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor={minId} className="block text-sm font-medium text-brand-secondary mb-1">
            Min Value
          </label>
          <input
            id={minId}
            type="number"
            value={block.content.min}
            onChange={(e) => onChange({ ...block.content, min: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          />
        </div>
        <div>
          <label htmlFor={maxId} className="block text-sm font-medium text-brand-secondary mb-1">
            Max Value
          </label>
          <input
            id={maxId}
            type="number"
            value={block.content.max}
            onChange={(e) => onChange({ ...block.content, max: parseFloat(e.target.value) || 100 })}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          />
        </div>
        <div>
          <label htmlFor={stepId} className="block text-sm font-medium text-brand-secondary mb-1">
            Step
          </label>
          <input
            id={stepId}
            type="number"
            value={block.content.step}
            onChange={(e) => onChange({ ...block.content, step: parseFloat(e.target.value) || 1 })}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
            step="any"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor={correctValueId}
            className="block text-sm font-medium text-brand-secondary mb-1"
          >
            Correct Value (optional)
          </label>
          <input
            id={correctValueId}
            type="number"
            value={block.content.correctValue || ''}
            onChange={(e) =>
              onChange({ ...block.content, correctValue: parseFloat(e.target.value) || undefined })
            }
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          />
        </div>
        <div>
          <label htmlFor={unitId} className="block text-sm font-medium text-brand-secondary mb-1">
            Unit (optional)
          </label>
          <input
            id={unitId}
            type="text"
            value={block.content.unit || ''}
            onChange={(e) => onChange({ ...block.content, unit: e.target.value })}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
            placeholder="%, kg, etc."
          />
        </div>
      </div>
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
          placeholder="Explain the correct value..."
        />
      </div>
      {block.content.question && (
        <div className="mt-4 p-4 bg-brand-page rounded-lg">
          <p className="text-xs font-medium text-brand-secondary mb-2">Preview:</p>
          <div className="bg-brand-surface p-4 rounded-lg border border-brand-default">
            <p className="text-sm font-medium text-brand-primary mb-3">{block.content.question}</p>
            <input
              type="range"
              min={block.content.min}
              max={block.content.max}
              step={block.content.step}
              className="w-full"
              disabled
              aria-label="Slider preview"
            />
            <div className="flex justify-between text-xs text-brand-secondary mt-1">
              <span>
                {block.content.min}
                {block.content.unit}
              </span>
              <span>
                {block.content.max}
                {block.content.unit}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
