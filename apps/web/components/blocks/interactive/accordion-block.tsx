'use client';

/**
 * AccordionBlock - Expandable content sections using shadcn Accordion
 */

import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import type { AccordionConfig, AccordionContent as AccordionContentType } from '@/types/blocks';
import { BlockWrapper } from '../block-wrapper';

interface AccordionBlockProps {
  id: string;
  content: AccordionContentType;
  config: AccordionConfig;
  isSelected?: boolean;
  isEditing?: boolean;
  onSelect?: () => void;
  onContentChange?: (content: AccordionContentType) => void;
  onStartEditing?: () => void;
  onStopEditing?: () => void;
  onXAPIEvent?: (verb: string, data?: Record<string, unknown>) => void;
}

export function AccordionBlock({
  id,
  content,
  config,
  isSelected = false,
  isEditing = false,
  onSelect,
  onContentChange,
  onStartEditing,
  onXAPIEvent,
}: AccordionBlockProps) {
  // Compute default expanded panels from content
  const defaultExpanded = content.panels.filter((p) => p.defaultExpanded).map((p) => p.id);

  // Separate state for single vs multiple mode
  const [singleValue, setSingleValue] = useState<string>(defaultExpanded[0] || '');
  const [multipleValue, setMultipleValue] = useState<string[]>(defaultExpanded);
  const [viewedPanels, setViewedPanels] = useState<Set<string>>(new Set(defaultExpanded));

  const handleSingleValueChange = (value: string) => {
    setSingleValue(value);
    if (config.trackInteractions && value) {
      const panel = content.panels.find((p) => p.id === value);
      const isFirstView = !viewedPanels.has(value);
      setViewedPanels((prev) => new Set([...prev, value]));

      onXAPIEvent?.('interacted', {
        panelId: value,
        panelTitle: panel?.title || value,
        action: 'expanded',
        isFirstView,
        totalPanels: content.panels.length,
        viewedPanels: viewedPanels.size + (isFirstView ? 1 : 0),
        progress: (viewedPanels.size + (isFirstView ? 1 : 0)) / content.panels.length,
      });
    }
  };

  const handleMultipleValueChange = (value: string[]) => {
    // Track xAPI interaction for newly expanded panels
    if (config.trackInteractions) {
      const justOpened = value.filter((v) => !multipleValue.includes(v));
      for (const panelId of justOpened) {
        const panel = content.panels.find((p) => p.id === panelId);
        const isFirstView = !viewedPanels.has(panelId);
        setViewedPanels((prev) => new Set([...prev, panelId]));

        onXAPIEvent?.('interacted', {
          panelId,
          panelTitle: panel?.title || panelId,
          action: 'expanded',
          isFirstView,
          totalPanels: content.panels.length,
          viewedPanels: viewedPanels.size + (isFirstView ? 1 : 0),
          progress: (viewedPanels.size + (isFirstView ? 1 : 0)) / content.panels.length,
        });
      }
    }
    setMultipleValue(value);
  };

  const updatePanel = (index: number, updates: Partial<AccordionContentType['panels'][0]>) => {
    const newPanels = [...content.panels];
    newPanels[index] = { ...newPanels[index], ...updates };
    onContentChange?.({ panels: newPanels });
  };

  const addPanel = () => {
    const newId = `panel-${Date.now()}`;
    onContentChange?.({
      panels: [
        ...content.panels,
        { id: newId, title: 'New Section', content: 'Add content here...' },
      ],
    });
    // Auto-expand newly added panel
    if (config.allowMultiple) {
      setMultipleValue((prev) => [...prev, newId]);
    } else {
      setSingleValue(newId);
    }
  };

  const removePanel = (index: number) => {
    const newPanels = content.panels.filter((_, i) => i !== index);
    onContentChange?.({ panels: newPanels });
  };

  const variantClasses: Record<string, string> = {
    default: 'border border-border rounded-lg divide-y divide-border',
    bordered: 'border-2 border-border rounded-lg divide-y-2 divide-border',
    filled: 'bg-card/50 rounded-lg divide-y divide-border',
    separated: 'space-y-2',
    minimal: '',
  };

  const itemVariantClasses: Record<string, string> = {
    default: 'border-0',
    bordered: 'border-0',
    filled: 'border-0',
    separated: 'border border-border rounded-lg',
    minimal: 'border-b border-border last:border-b-0',
  };

  // Shared accordion items renderer
  const renderAccordionItems = () =>
    content.panels.map((panel, index) => (
      <AccordionItem
        key={panel.id}
        value={panel.id}
        className={cn(
          itemVariantClasses[config.variant || 'default'],
          config.iconPosition === 'left' && '[&>button]:flex-row-reverse [&>button]:justify-end',
        )}
      >
        <AccordionTrigger
          className={cn('px-4 py-3 hover:bg-card/50', isEditing && 'pointer-events-none')}
          onClick={(e) => {
            if (isEditing) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          <div className="flex items-center gap-3 flex-1">
            {isEditing ? (
              <input
                type="text"
                value={panel.title}
                onChange={(e) => updatePanel(index, { title: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                className="flex-1 bg-transparent outline-hidden border-b border-transparent focus:border-cyan-500 pointer-events-auto"
              />
            ) : (
              <span className="flex-1 text-left">{panel.title}</span>
            )}
            {isEditing && content.panels.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removePanel(index);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="p-1 text-red-500 hover:text-red-400 pointer-events-auto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2">
          {isEditing ? (
            <textarea
              value={panel.content}
              onChange={(e) => updatePanel(index, { content: e.target.value })}
              rows={3}
              className={cn(
                'w-full bg-background px-3 py-2 rounded border border-border',
                'outline-hidden focus:border-cyan-500 resize-y text-sm',
              )}
            />
          ) : (
            <p className="text-muted-foreground">{panel.content}</p>
          )}
        </AccordionContent>
      </AccordionItem>
    ));

  return (
    <BlockWrapper
      id={id}
      type="Accordion"
      isSelected={isSelected}
      isEditing={isEditing}
      onClick={onSelect}
      onDoubleClick={onStartEditing}
    >
      {config.allowMultiple ? (
        <Accordion
          type="multiple"
          value={multipleValue}
          onValueChange={handleMultipleValueChange}
          className={variantClasses[config.variant || 'default']}
        >
          {renderAccordionItems()}
        </Accordion>
      ) : (
        <Accordion
          type="single"
          value={singleValue}
          onValueChange={handleSingleValueChange}
          className={variantClasses[config.variant || 'default']}
          collapsible
        >
          {renderAccordionItems()}
        </Accordion>
      )}

      {/* Add panel button */}
      {isEditing && (
        <button
          type="button"
          onClick={addPanel}
          className="mt-3 w-full py-2 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-cyan-500 hover:text-cyan-500 flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Section
        </button>
      )}
    </BlockWrapper>
  );
}
