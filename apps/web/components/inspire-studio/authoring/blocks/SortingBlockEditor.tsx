import { ArrowUpDown, Plus, X } from 'lucide-react';
import type { SortingBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface SortingBlockEditorProps {
  block: SortingBlock;
  onChange: (content: SortingBlock['content']) => void;
}

export const SortingBlockEditor = ({
  block,
  onChange,
}: SortingBlockEditorProps): React.JSX.Element => {
  const addItem = (): void => {
    onChange({
      ...block.content,
      items: [
        ...block.content.items,
        { id: `item_${Date.now()}`, text: '', correctPosition: block.content.items.length + 1 },
      ],
    });
  };

  const removeItem = (id: string): void => {
    const newItems = block.content.items
      .filter((item) => item.id !== id)
      .map((item, index) => ({ ...item, correctPosition: index + 1 }));
    onChange({ ...block.content, items: newItems });
  };

  const updateItem = (id: string, text: string): void => {
    onChange({
      ...block.content,
      items: block.content.items.map((item) => (item.id === id ? { ...item, text } : item)),
    });
  };

  const moveItem = (id: string, direction: 'up' | 'down'): void => {
    const currentIndex = block.content.items.findIndex((item) => item.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === block.content.items.length - 1)
    ) {
      return;
    }

    const newItems = [...block.content.items];
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    [newItems[currentIndex], newItems[swapIndex]] = [newItems[swapIndex], newItems[currentIndex]];

    const updatedItems = newItems.map((item, index) => ({
      ...item,
      correctPosition: index + 1,
    }));

    onChange({ ...block.content, items: updatedItems });
  };

  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor="sorting-instruction"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Instruction
        </label>
        <textarea
          id="sorting-instruction"
          value={typeof block.content.instruction === 'string' ? block.content.instruction : ''}
          onChange={(e) => onChange({ ...block.content, instruction: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Sort the items in the correct order..."
        />
      </div>
      <div className="space-y-2">
        <span className="block text-sm font-medium text-brand-secondary">
          Items (in correct order)
        </span>
        {block.content.items.map((item, index) => (
          <div key={item.id} className="flex gap-2 items-center">
            <span className="text-sm font-medium text-brand-secondary w-6">{index + 1}.</span>
            <input
              type="text"
              value={item.text}
              onChange={(e) => updateItem(item.id, e.target.value)}
              className="flex-1 px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
              placeholder="Item content"
            />
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => moveItem(item.id, 'up')}
                disabled={index === 0}
                className="p-2 text-brand-secondary hover:bg-brand-surface rounded disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowUpDown className="w-4 h-4 rotate-180" />
              </button>
              <button
                type="button"
                onClick={() => moveItem(item.id, 'down')}
                disabled={index === block.content.items.length - 1}
                className="p-2 text-brand-secondary hover:bg-brand-surface rounded disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-2 px-4 py-2 text-brand-blue hover:bg-blue-50 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>
      <div>
        <label
          htmlFor="sorting-explanation"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Explanation (optional)
        </label>
        <textarea
          id="sorting-explanation"
          value={typeof block.content.explanation === 'string' ? block.content.explanation : ''}
          onChange={(e) => onChange({ ...block.content, explanation: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Explain the correct order..."
        />
      </div>
    </div>
  );
};
