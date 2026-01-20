'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Edit3, GripVertical, Plus, Trash2 } from 'lucide-react';
import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { safeInnerHtml } from '@/lib/sanitize';
import type { AccordionBlockContent, AccordionItem } from '@/types/blocks';
import type { BlockComponentProps } from '../BlockRenderer';

/**
 * AccordionBlock - Collapsible panels
 */
export function AccordionBlock({
  block,
  isEditing,
  onUpdate,
}: BlockComponentProps<AccordionBlockContent>): React.JSX.Element {
  const content = block.content as AccordionBlockContent;
  const [editingPanelId, setEditingPanelId] = useState<string | null>(null);
  const [expandedPanels, setExpandedPanels] = useState<string[]>(content.defaultOpen || []);

  // Default values - wrapped in useMemo to maintain stable references
  const panels = useMemo(() => content.items || [], [content.items]);
  const allowMultiple = content.allowMultiple ?? true;
  const iconPosition = content.iconPosition || 'right';

  // Toggle panel expansion
  const togglePanel = useCallback(
    (panelId: string) => {
      if (allowMultiple) {
        setExpandedPanels((prev) =>
          prev.includes(panelId) ? prev.filter((id) => id !== panelId) : [...prev, panelId],
        );
      } else {
        setExpandedPanels((prev) => (prev.includes(panelId) ? [] : [panelId]));
      }
    },
    [allowMultiple],
  );

  // Add new panel
  const addPanel = useCallback(() => {
    const newPanel: AccordionItem = {
      id: `panel-${Date.now()}`,
      title: 'New Panel',
      content: '',
    };
    onUpdate({
      content: {
        ...content,
        items: [...panels, newPanel],
      },
    });
    setEditingPanelId(newPanel.id);
  }, [content, panels, onUpdate]);

  // Update panel
  const updatePanel = useCallback(
    (panelId: string, updates: Partial<AccordionItem>) => {
      onUpdate({
        content: {
          ...content,
          items: panels.map((p: AccordionItem) => (p.id === panelId ? { ...p, ...updates } : p)),
        },
      });
    },
    [content, panels, onUpdate],
  );

  // Delete panel
  const deletePanel = useCallback(
    (panelId: string) => {
      onUpdate({
        content: {
          ...content,
          items: panels.filter((p: AccordionItem) => p.id !== panelId),
        },
      });
    },
    [content, panels, onUpdate],
  );

  // Get container classes (removed variant - not in type)
  const getContainerClasses = (): string => {
    return 'divide-y divide-studio-surface/30';
  };

  // Get panel classes
  const getPanelClasses = (isExpanded: boolean) => {
    return `rounded-lg border ${isExpanded ? 'border-studio-accent/30 bg-studio-accent/5' : 'border-studio-surface/50 bg-studio-bg'}`;
  };

  // Preview mode
  if (!isEditing) {
    if (panels.length === 0) {
      return (
        <div className="p-4 text-center text-studio-text-muted border border-dashed border-studio-surface/50 rounded-lg">
          No panels added
        </div>
      );
    }

    return (
      <div className={`${getContainerClasses()}`}>
        {panels.map((panel: AccordionItem) => {
          const isExpanded = expandedPanels.includes(panel.id);

          return (
            <div key={panel.id} className={getPanelClasses(isExpanded)}>
              {/* Header */}
              <button
                type="button"
                onClick={() => togglePanel(panel.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                  ${isExpanded ? 'text-brand-primary' : 'text-studio-text hover:text-brand-primary'}
                `}
              >
                {iconPosition === 'left' && (
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-5 h-5 text-studio-text-muted" />
                  </motion.div>
                )}

                <span className="flex-1 font-medium">{panel.title}</span>

                {panel.icon && <span className="text-studio-text-muted">{panel.icon}</span>}

                {iconPosition === 'right' && (
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-studio-text-muted" />
                  </motion.div>
                )}
              </button>

              {/* Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-1">
                      {panel.content ? (
                        <div
                          className="prose prose-invert prose-sm max-w-none text-studio-text"
                          {...safeInnerHtml(panel.content, 'rich')}
                        />
                      ) : (
                        <p className="text-studio-text-muted text-sm">No content</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    );
  }

  // Edit mode
  return (
    <div className="space-y-4">
      {/* Settings bar */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Icon position */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-studio-text-muted">Icon:</span>
          <select
            value={iconPosition}
            onChange={(e) =>
              onUpdate({ content: { ...content, iconPosition: e.target.value as unknown } })
            }
            className="px-2 py-1.5 bg-studio-bg border border-studio-surface/50 rounded-lg text-brand-primary text-sm"
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>

        {/* Allow multiple */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={allowMultiple}
            onChange={(e) => onUpdate({ content: { ...content, allowMultiple: e.target.checked } })}
            className="w-4 h-4 rounded border-studio-surface bg-studio-bg-dark text-studio-accent"
          />
          <span className="text-sm text-studio-text-muted">Allow multiple open</span>
        </label>

        {/* Add panel */}
        <button
          type="button"
          onClick={addPanel}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-studio-accent hover:text-studio-accent-hover transition-colors ml-auto"
        >
          <Plus className="w-4 h-4" />
          Add Panel
        </button>
      </div>

      {/* Panels */}
      <div className={`${getContainerClasses()}`}>
        {panels.length === 0 ? (
          <button
            type="button"
            className="w-full p-8 text-center border-2 border-dashed border-studio-surface/50 rounded-lg cursor-pointer hover:border-studio-accent/50 transition-colors"
            onClick={addPanel}
          >
            <Plus className="w-8 h-8 text-studio-text-muted mx-auto mb-2" />
            <p className="text-studio-text-muted">Add your first accordion panel</p>
          </button>
        ) : (
          panels.map((panel: AccordionItem) => {
            const isExpanded = expandedPanels.includes(panel.id);
            const isEditing = editingPanelId === panel.id;

            return (
              <div key={panel.id} className={`group ${getPanelClasses(isExpanded)}`}>
                {/* Header */}
                <div className="flex items-center gap-2 px-2 py-1">
                  {/* Drag handle */}
                  <button
                    type="button"
                    className="p-1 cursor-grab text-studio-text-muted hover:text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <GripVertical className="w-4 h-4" />
                  </button>

                  {/* Expand toggle */}
                  <button type="button" onClick={() => togglePanel(panel.id)} className="p-1">
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4 text-studio-text-muted" />
                    </motion.div>
                  </button>

                  {/* Title input */}
                  <input
                    type="text"
                    value={panel.title}
                    onChange={(e) => updatePanel(panel.id, { title: e.target.value })}
                    className="flex-1 bg-transparent text-brand-primary font-medium outline-hidden"
                    placeholder="Panel title..."
                  />

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => setEditingPanelId(isEditing ? null : panel.id)}
                      className={`p-1 rounded transition-colors ${isEditing ? 'text-studio-accent' : 'text-studio-text-muted hover:text-brand-primary'}`}
                      title="Edit content"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePanel(panel.id)}
                      className="p-1 text-studio-text-muted hover:text-brand-error transition-colors"
                      title="Delete panel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content editor */}
                <AnimatePresence>
                  {(isExpanded || isEditing) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1">
                        {isEditing ? (
                          <textarea
                            value={panel.content || ''}
                            onChange={(e) => updatePanel(panel.id, { content: e.target.value })}
                            className="w-full min-h-[100px] px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary text-sm resize-y outline-hidden focus:border-studio-accent/50"
                            placeholder="Enter panel content (HTML supported)..."
                          />
                        ) : (
                          <button
                            type="button"
                            className="w-full text-left prose prose-invert prose-sm max-w-none text-studio-text cursor-pointer hover:text-brand-primary transition-colors"
                            onClick={() => setEditingPanelId(panel.id)}
                            {...safeInnerHtml(
                              panel.content || '<em>Click to add content...</em>',
                              'rich',
                            )}
                          />
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default AccordionBlock;
