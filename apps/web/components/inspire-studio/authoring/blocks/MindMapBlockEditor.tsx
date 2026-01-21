import { Plus, X } from 'lucide-react';
import type { MindMapBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface MindMapBlockEditorProps {
  block: MindMapBlock;
  onChange: (content: MindMapBlock['content']) => void;
}

export const MindMapBlockEditor = ({
  block,
  onChange,
}: MindMapBlockEditorProps): React.JSX.Element => {
  const addNode = (): void => {
    onChange({
      ...block.content,
      nodes: [
        ...block.content.nodes,
        { id: `node_${Date.now()}`, text: '', parentId: block.content.nodes[0]?.id },
      ],
    });
  };

  const removeNode = (id: string): void => {
    onChange({
      ...block.content,
      nodes: block.content.nodes.filter((node) => node.id !== id && node.parentId !== id),
    });
  };

  const updateNode = (id: string, field: string, value: unknown): void => {
    onChange({
      ...block.content,
      nodes: block.content.nodes.map((node) =>
        node.id === id ? { ...node, [field]: value } : node,
      ),
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor="mind-map-title"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Mind Map Title
        </label>
        <input
          id="mind-map-title"
          type="text"
          value={block.content.title}
          onChange={(e) => onChange({ ...block.content, title: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Central concept"
        />
      </div>
      <div className="space-y-2">
        <span className="block text-sm font-medium text-brand-secondary">Nodes</span>
        {block.content.nodes.map((node, index) => (
          <div key={node.id} className="border border-brand-strong rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-brand-secondary">Node {index + 1}</span>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeNode(node.id)}
                  className="ml-auto p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <input
              type="text"
              value={node.text}
              onChange={(e) => updateNode(node.id, 'text', e.target.value)}
              className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
              placeholder="Node text"
            />
            {index > 0 && (
              <select
                value={node.parentId || ''}
                onChange={(e) => updateNode(node.id, 'parentId', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
              >
                <option value="">No parent (root node)</option>
                {block.content.nodes
                  .filter((n) => n.id !== node.id)
                  .map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.text || 'Untitled node'}
                    </option>
                  ))}
              </select>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addNode}
          className="flex items-center gap-2 px-4 py-2 text-brand-blue hover:bg-blue-50 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Add Node
        </button>
      </div>
    </div>
  );
};
