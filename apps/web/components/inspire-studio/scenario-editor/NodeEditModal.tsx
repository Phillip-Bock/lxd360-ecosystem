'use client';

import { GripVertical, Plus, Trash2, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { DecisionOption, NodeData, ScenarioNode } from './types';

interface NodeEditModalProps {
  node: ScenarioNode;
  onSave: (data: NodeData) => void;
  onClose: () => void;
}

let optionIdCounter = 1;

function generateOptionId(): string {
  return `opt-${Date.now()}-${optionIdCounter++}`;
}

export function NodeEditModal({ node, onSave, onClose }: NodeEditModalProps): React.JSX.Element {
  const [title, setTitle] = useState(node.data.title || '');
  const [content, setContent] = useState(node.data.content || '');
  const [options, setOptions] = useState<DecisionOption[]>(
    node.data.options || [
      { id: generateOptionId(), label: 'Option A' },
      { id: generateOptionId(), label: 'Option B' },
    ],
  );
  const [mediaUrl, setMediaUrl] = useState(node.data.media?.url || '');
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio'>(
    node.data.media?.type || 'image',
  );

  const handleSave = useCallback((): void => {
    const data: NodeData = {
      title,
      content: content || undefined,
      options: node.type === 'decision' ? options : undefined,
      media: mediaUrl ? { type: mediaType, url: mediaUrl } : undefined,
    };
    onSave(data);
  }, [title, content, options, mediaUrl, mediaType, node.type, onSave]);

  const addOption = useCallback((): void => {
    setOptions((prev) => [
      ...prev,
      { id: generateOptionId(), label: `Option ${String.fromCharCode(65 + prev.length)}` },
    ]);
  }, []);

  const removeOption = useCallback((optionId: string): void => {
    setOptions((prev) => prev.filter((o) => o.id !== optionId));
  }, []);

  const updateOption = useCallback((optionId: string, label: string): void => {
    setOptions((prev) => prev.map((o) => (o.id === optionId ? { ...o, label } : o)));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-brand-surface rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">
            Edit {node.type.charAt(0).toUpperCase() + node.type.slice(1)} Node
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-brand-surface rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-brand-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter node title..."
            />
          </div>

          {/* Content (not for start/end nodes) */}
          {(node.type === 'content' || node.type === 'decision') && (
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter content description..."
                rows={4}
              />
            </div>
          )}

          {/* Decision Options */}
          {node.type === 'decision' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Decision Options</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Option
                </Button>
              </div>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div
                    key={option.id}
                    className="flex items-center gap-2 p-2 bg-brand-page rounded-lg"
                  >
                    <GripVertical className="w-4 h-4 text-brand-muted cursor-grab" />
                    <span className="w-6 h-6 flex items-center justify-center text-xs font-medium bg-amber-100 text-amber-800 rounded">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <Input
                      value={option.label}
                      onChange={(e) => updateOption(option.id, e.target.value)}
                      placeholder="Option label..."
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(option.id)}
                      disabled={options.length <= 2}
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        options.length > 2
                          ? 'hover:bg-red-100 text-brand-muted hover:text-brand-error'
                          : 'text-brand-primary cursor-not-allowed',
                      )}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-brand-muted">
                Connect each option to different nodes in the canvas to create branching paths.
              </p>
            </div>
          )}

          {/* Media (for content nodes) */}
          {node.type === 'content' && (
            <div className="space-y-3">
              <Label>Media (Optional)</Label>
              <div className="flex items-center gap-2">
                <select
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value as 'image' | 'video' | 'audio')}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                </select>
                <Input
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="Enter media URL..."
                  className="flex-1"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-brand-page">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
