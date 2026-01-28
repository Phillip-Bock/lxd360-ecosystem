import { CheckCircle, Circle, Eye, GitBranch, Network, Plus, Square, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { DecisionTreeBlock, DecisionTreeNode } from '@/lib/inspire-studio/types/contentBlocks';

interface DecisionTreeBlockEditorProps {
  block: DecisionTreeBlock;
  onChange: (content: DecisionTreeBlock['content']) => void;
}

export const DecisionTreeBlockEditor = ({
  block,
  onChange,
}: DecisionTreeBlockEditorProps): React.JSX.Element => {
  const [nodes, setNodes] = useState<DecisionTreeNode[]>(
    block.content.nodes || [
      {
        id: 'start',
        type: 'decision',
        label: 'Starting Point',
        description: 'Where the decision tree begins',
        branches: [],
      },
    ],
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('start');
  const [showPreview, setShowPreview] = useState(false);

  const updateContent = (updatedNodes: DecisionTreeNode[]): void => {
    setNodes(updatedNodes);
    onChange({
      ...block.content,
      nodes: updatedNodes,
    });
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const addNode = (): void => {
    const newId = `node-${Date.now()}`;
    const newNode: DecisionTreeNode = {
      id: newId,
      type: 'decision',
      label: 'New Node',
      description: '',
      branches: [],
    };
    updateContent([...nodes, newNode]);
    setSelectedNodeId(newId);
  };

  const deleteNode = (id: string): void => {
    if (id === 'start') return; // Cannot delete start node
    updateContent(nodes.filter((n) => n.id !== id));
    if (selectedNodeId === id) setSelectedNodeId('start');
  };

  const updateNode = (id: string, updates: Partial<DecisionTreeNode>): void => {
    updateContent(nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)));
  };

  const addBranch = (nodeId: string): void => {
    updateContent(
      nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              branches: [...(n.branches || []), { label: 'New Branch', targetId: '' }],
            }
          : n,
      ),
    );
  };

  const updateBranch = (
    nodeId: string,
    branchIndex: number,
    updates: Partial<{ label: string; targetId: string }>,
  ): void => {
    updateContent(
      nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              branches: (n.branches || []).map((b, i) =>
                i === branchIndex ? { ...b, ...updates } : b,
              ),
            }
          : n,
      ),
    );
  };

  const deleteBranch = (nodeId: string, branchIndex: number): void => {
    updateContent(
      nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              branches: (n.branches || []).filter((_, i) => i !== branchIndex),
            }
          : n,
      ),
    );
  };

  const getNodeIcon = (type: DecisionTreeNode['type']): React.JSX.Element => {
    switch (type) {
      case 'decision':
        return <GitBranch className="w-4 h-4" />;
      case 'action':
        return <Square className="w-4 h-4" />;
      case 'outcome':
        return <Circle className="w-4 h-4" />;
    }
  };

  const getNodeColor = (type: DecisionTreeNode['type']): string => {
    switch (type) {
      case 'decision':
        return 'bg-blue-100 border-blue-300 text-blue-700';
      case 'action':
        return 'bg-purple-100 border-purple-300 text-purple-700';
      case 'outcome':
        return 'bg-green-100 border-green-300 text-green-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label
          htmlFor="decision-tree-title"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          <Network className="w-4 h-4 inline mr-1" />
          Decision Tree Title
        </label>
        <input
          id="decision-tree-title"
          type="text"
          value={block.content.title}
          onChange={(e) => onChange({ ...block.content, title: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="e.g., Medical Diagnosis Flowchart, Troubleshooting Guide"
        />
      </div>

      {/* Instructions */}
      <div>
        <label
          htmlFor="decision-tree-instructions"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          Instructions
        </label>
        <textarea
          id="decision-tree-instructions"
          value={block.content.instructions}
          onChange={(e) => onChange({ ...block.content, instructions: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="Explain how learners should navigate the decision tree..."
        />
      </div>

      {/* Tree Builder */}
      <div className="border-t border-brand-default pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-brand-secondary">Tree Structure</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-brand-blue hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50"
            >
              <Eye className="w-3 h-3" />
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button
              type="button"
              onClick={addNode}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-brand-primary bg-brand-primary hover:bg-brand-primary-hover rounded-lg"
            >
              <Plus className="w-3 h-3" />
              Add Node
            </button>
          </div>
        </div>

        {showPreview ? (
          // Preview Mode
          <div className="bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 min-h-[300px]">
            <p className="text-sm text-blue-800 mb-3">
              <strong>Tree Preview:</strong> {nodes.length} nodes configured
            </p>
            <div className="space-y-2">
              {nodes.map((node) => (
                <div key={node.id} className={`p-3 rounded-lg border-2 ${getNodeColor(node.type)}`}>
                  <div className="flex items-center gap-2">
                    {getNodeIcon(node.type)}
                    <strong className="text-sm">{node.label}</strong>
                    {node.type === 'outcome' && node.isCorrect && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  {node.description && (
                    <p className="text-xs mt-1 opacity-75">{node.description}</p>
                  )}
                  {node.branches && node.branches.length > 0 && (
                    <div className="mt-2 pl-4 space-y-1">
                      {node.branches.map((branch, idx) => (
                        <div key={idx} className="text-xs flex items-center gap-1">
                          <span className="text-brand-muted">→</span>
                          <span>{branch.label}</span>
                          {branch.targetId && (
                            <span className="text-brand-muted">
                              ({nodes.find((n) => n.id === branch.targetId)?.label || 'Unlinked'})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="grid grid-cols-3 gap-4 min-h-[400px]">
            {/* Node List */}
            <div className="border border-brand-default rounded-lg p-3 space-y-2 overflow-y-auto max-h-[400px]">
              <p className="text-xs font-medium text-brand-secondary mb-2">
                Nodes ({nodes.length})
              </p>
              {nodes.map((node) => (
                <button
                  type="button"
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`w-full text-left p-2 rounded-lg border-2 transition-all ${
                    selectedNodeId === node.id
                      ? 'border-brand-primary bg-blue-50'
                      : 'border-brand-default hover:border-brand-strong'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getNodeIcon(node.type)}
                    <span className="text-sm font-medium">{node.label}</span>
                  </div>
                  <p className="text-xs text-brand-muted">{node.type}</p>
                </button>
              ))}
            </div>

            {/* Node Editor */}
            {selectedNode ? (
              <div className="col-span-2 border border-brand-default rounded-lg p-4 space-y-4 overflow-y-auto max-h-[400px]">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-brand-primary">Edit Node</h4>
                  {selectedNode.id !== 'start' && (
                    <button
                      type="button"
                      onClick={() => deleteNode(selectedNode.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Node Type */}
                <div>
                  <label
                    htmlFor={`node-type-${selectedNode.id}`}
                    className="block text-xs font-medium text-brand-secondary mb-1"
                  >
                    Node Type
                  </label>
                  <select
                    id={`node-type-${selectedNode.id}`}
                    value={selectedNode.type}
                    onChange={(e) => {
                      const newType = e.target.value as DecisionTreeNode['type'];
                      updateNode(selectedNode.id, { type: newType });
                    }}
                    className="w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg"
                  >
                    <option value="decision">Decision (has branches)</option>
                    <option value="action">Action (intermediate step)</option>
                    <option value="outcome">Outcome (end point)</option>
                  </select>
                </div>

                {/* Node Label */}
                <div>
                  <label
                    htmlFor={`node-label-${selectedNode.id}`}
                    className="block text-xs font-medium text-brand-secondary mb-1"
                  >
                    Label
                  </label>
                  <input
                    id={`node-label-${selectedNode.id}`}
                    type="text"
                    value={selectedNode.label}
                    onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg"
                  />
                </div>

                {/* Node Description */}
                <div>
                  <label
                    htmlFor={`node-description-${selectedNode.id}`}
                    className="block text-xs font-medium text-brand-secondary mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id={`node-description-${selectedNode.id}`}
                    value={selectedNode.description || ''}
                    onChange={(e) => updateNode(selectedNode.id, { description: e.target.value })}
                    rows={2}
                    className="w-full px-2 py-1.5 text-sm border border-brand-strong rounded-lg"
                  />
                </div>

                {/* Outcome Options */}
                {selectedNode.type === 'outcome' && (
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedNode.isCorrect || false}
                        onChange={(e) =>
                          updateNode(selectedNode.id, { isCorrect: e.target.checked })
                        }
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="text-sm text-brand-secondary">Mark as correct outcome</span>
                    </label>
                  </div>
                )}

                {/* Branches (for decision and action nodes) */}
                {(selectedNode.type === 'decision' || selectedNode.type === 'action') && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-brand-secondary">Branches</span>
                      <button
                        type="button"
                        onClick={() => addBranch(selectedNode.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-brand-blue hover:text-blue-700"
                      >
                        <Plus className="w-3 h-3" />
                        Add Branch
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(selectedNode.branches || []).map((branch, idx) => (
                        <div
                          key={idx}
                          className="flex gap-2 items-start p-2 bg-brand-page rounded-lg"
                        >
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={branch.label}
                              onChange={(e) =>
                                updateBranch(selectedNode.id, idx, {
                                  label: e.target.value,
                                })
                              }
                              placeholder="Branch label (e.g., Yes, No)"
                              className="w-full px-2 py-1 text-xs border border-brand-strong rounded"
                            />
                            <select
                              value={branch.targetId}
                              onChange={(e) =>
                                updateBranch(selectedNode.id, idx, {
                                  targetId: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 text-xs border border-brand-strong rounded"
                            >
                              <option value="">Select target node...</option>
                              {nodes
                                .filter((n) => n.id !== selectedNode.id)
                                .map((n) => (
                                  <option key={n.id} value={n.id}>
                                    {n.label} ({n.type})
                                  </option>
                                ))}
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteBranch(selectedNode.id, idx)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {(!selectedNode.branches || selectedNode.branches.length === 0) && (
                        <p className="text-xs text-brand-muted text-center py-2">
                          No branches yet. Add one to connect this node.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="col-span-2 border border-brand-default rounded-lg p-4 flex items-center justify-center text-brand-muted">
                Select a node to edit
              </div>
            )}
          </div>
        )}
      </div>

      {/* Helper Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>Decision Tree tip:</strong> Start with your initial decision point, then add
          branches for each possible choice. Create outcome nodes to mark correct and incorrect
          paths.
        </p>
      </div>
    </div>
  );
};
