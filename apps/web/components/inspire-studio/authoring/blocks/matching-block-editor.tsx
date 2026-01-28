import { Plus, X } from 'lucide-react';
import { useId } from 'react';
import type { MatchingBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface MatchingBlockEditorProps {
  block: MatchingBlock;
  onChange: (content: MatchingBlock['content']) => void;
}

export const MatchingBlockEditor = ({
  block,
  onChange,
}: MatchingBlockEditorProps): React.JSX.Element => {
  const instructionId = useId();
  const explanationId = useId();
  const pointsId = useId();
  const addPair = (): void => {
    onChange({
      ...block.content,
      pairs: [...block.content.pairs, { id: `pair_${Date.now()}`, left: '', right: '' }],
    });
  };

  const removePair = (id: string): void => {
    onChange({
      ...block.content,
      pairs: block.content.pairs.filter((pair) => pair.id !== id),
    });
  };

  const updatePair = (id: string, side: 'left' | 'right', value: string): void => {
    onChange({
      ...block.content,
      pairs: block.content.pairs.map((pair) =>
        pair.id === id ? { ...pair, [side]: value } : pair,
      ),
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor={instructionId}
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Instruction
        </label>
        <textarea
          id={instructionId}
          value={typeof block.content.instruction === 'string' ? block.content.instruction : ''}
          onChange={(e) => onChange({ ...block.content, instruction: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Match each item on the left with the correct item on the right..."
        />
      </div>
      <div className="space-y-3">
        <span className="block text-sm font-medium text-brand-secondary">Matching Pairs</span>
        {block.content.pairs.map((pair, index) => (
          <div key={pair.id} className="border border-brand-strong rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-brand-secondary">Pair {index + 1}</span>
              {block.content.pairs.length > 2 && (
                <button
                  type="button"
                  onClick={() => removePair(pair.id)}
                  aria-label={`Remove pair ${index + 1}`}
                  className="ml-auto p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <X aria-hidden="true" className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor={`${pair.id}-left`}
                  className="block text-xs font-medium text-brand-secondary mb-1"
                >
                  Left Item
                </label>
                <input
                  id={`${pair.id}-left`}
                  type="text"
                  value={pair.left}
                  onChange={(e) => updatePair(pair.id, 'left', e.target.value)}
                  className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
                  placeholder="Term or question"
                />
              </div>
              <div>
                <label
                  htmlFor={`${pair.id}-right`}
                  className="block text-xs font-medium text-brand-secondary mb-1"
                >
                  Right Item
                </label>
                <input
                  id={`${pair.id}-right`}
                  type="text"
                  value={pair.right}
                  onChange={(e) => updatePair(pair.id, 'right', e.target.value)}
                  className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
                  placeholder="Definition or answer"
                />
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addPair}
          className="flex items-center gap-2 px-4 py-2 text-brand-blue hover:bg-blue-50 rounded-lg"
        >
          <Plus aria-hidden="true" className="w-4 h-4" />
          Add Pair
        </button>
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
          value={typeof block.content.explanation === 'string' ? block.content.explanation : ''}
          onChange={(e) => onChange({ ...block.content, explanation: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Explain the correct matches..."
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
