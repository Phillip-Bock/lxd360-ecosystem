import { Plus, X } from 'lucide-react';
import type { DragDropBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface DragDropBlockEditorProps {
  block: DragDropBlock;
  onChange: (content: DragDropBlock['content']) => void;
}

export const DragDropBlockEditor = ({
  block,
  onChange,
}: DragDropBlockEditorProps): React.JSX.Element => {
  const addItem = (): void => {
    onChange({
      ...block.content,
      items: [
        ...block.content.items,
        { id: `item_${Date.now()}`, content: '', correctZone: block.content.zones[0]?.id || '' },
      ],
    });
  };

  const removeItem = (id: string): void => {
    onChange({
      ...block.content,
      items: block.content.items.filter((item) => item.id !== id),
    });
  };

  const updateItem = (
    id: string,
    field: keyof DragDropBlock['content']['items'][0],
    value: string,
  ): void => {
    onChange({
      ...block.content,
      items: block.content.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    });
  };

  const addZone = (): void => {
    onChange({
      ...block.content,
      zones: [...block.content.zones, { id: `zone_${Date.now()}`, label: '' }],
    });
  };

  const removeZone = (id: string): void => {
    onChange({
      ...block.content,
      zones: block.content.zones.filter((zone) => zone.id !== id),
      items: block.content.items.map((item) =>
        item.correctZone === id ? { ...item, correctZone: block.content.zones[0]?.id || '' } : item,
      ),
    });
  };

  const updateZone = (id: string, label: string): void => {
    onChange({
      ...block.content,
      zones: block.content.zones.map((zone) => (zone.id === id ? { ...zone, label } : zone)),
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor="dragdrop-instruction"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Instruction
        </label>
        <textarea
          id="dragdrop-instruction"
          value={block.content.instruction}
          onChange={(e) => onChange({ ...block.content, instruction: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Drag each item to its correct zone..."
        />
      </div>
      <fieldset className="space-y-3">
        <legend className="block text-sm font-medium text-brand-secondary">Drop Zones</legend>
        {block.content.zones.map((zone, index) => (
          <div key={zone.id} className="flex gap-2">
            <input
              type="text"
              value={zone.label}
              onChange={(e) => updateZone(zone.id, e.target.value)}
              className="flex-1 px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
              placeholder={`Zone ${index + 1} label`}
            />
            {block.content.zones.length > 1 && (
              <button
                type="button"
                onClick={() => removeZone(zone.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addZone}
          className="flex items-center gap-2 px-4 py-2 text-brand-blue hover:bg-blue-50 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Add Zone
        </button>
      </fieldset>
      <fieldset className="space-y-3">
        <legend className="block text-sm font-medium text-brand-secondary">Draggable Items</legend>
        {block.content.items.map((item, index) => (
          <div key={item.id} className="border border-brand-strong rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-brand-secondary">Item {index + 1}</span>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="ml-auto p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              value={item.content}
              onChange={(e) => updateItem(item.id, 'content', e.target.value)}
              className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
              placeholder="Item content"
            />
            <select
              value={item.correctZone}
              onChange={(e) => updateItem(item.id, 'correctZone', e.target.value)}
              className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
            >
              <option value="">Select correct zone</option>
              {block.content.zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.label || 'Unnamed zone'}
                </option>
              ))}
            </select>
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
      </fieldset>
      <div>
        <label
          htmlFor="dragdrop-explanation"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Explanation (optional)
        </label>
        <textarea
          id="dragdrop-explanation"
          value={block.content.explanation || ''}
          onChange={(e) => onChange({ ...block.content, explanation: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Explain the correct answers..."
        />
      </div>
    </div>
  );
};
