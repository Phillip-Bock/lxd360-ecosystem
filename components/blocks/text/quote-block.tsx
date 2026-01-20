'use client';

/**
 * QuoteBlock - Blockquote with attribution
 */

import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { QuoteConfig, QuoteContent } from '@/types/blocks';
import { BlockWrapper } from '../block-wrapper';

interface QuoteBlockProps {
  id: string;
  content: QuoteContent;
  config: QuoteConfig;
  isSelected?: boolean;
  isEditing?: boolean;
  onSelect?: () => void;
  onContentChange?: (content: QuoteContent) => void;
  onStartEditing?: () => void;
  onStopEditing?: () => void;
}

export function QuoteBlock({
  id,
  content,
  config,
  isSelected = false,
  isEditing = false,
  onSelect,
  onContentChange,
  onStartEditing,
  onStopEditing,
}: QuoteBlockProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const [localContent, setLocalContent] = useState(content);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  useEffect(() => {
    if (isEditing && textRef.current) {
      textRef.current.focus();
    }
  }, [isEditing]);

  const handleTextInput = () => {
    if (textRef.current) {
      setLocalContent((prev) => ({ ...prev, text: textRef.current?.innerText ?? '' }));
    }
  };

  const handleBlur = () => {
    if (JSON.stringify(localContent) !== JSON.stringify(content)) {
      onContentChange?.(localContent);
    }
    onStopEditing?.();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      textRef.current?.blur();
    }
  };

  const variantClasses: Record<string, string> = {
    default: 'border-l-4 border-cyan-500 pl-4',
    large: 'border-l-4 border-cyan-500 pl-6 text-xl',
    bordered: 'border border-border rounded-lg p-4',
    filled: 'bg-cyan-500/10 border-l-4 border-cyan-500 pl-4 pr-4 py-2 rounded-r-lg',
    highlighted: 'bg-cyan-500/10 border-l-4 border-cyan-500 pl-4 pr-4 py-2 rounded-r-lg',
    minimal: 'pl-4 italic',
  };

  return (
    <BlockWrapper
      id={id}
      type="Quote"
      isSelected={isSelected}
      isEditing={isEditing}
      onClick={onSelect}
      onDoubleClick={onStartEditing}
    >
      <blockquote className={cn(variantClasses[config.variant || 'default'])}>
        {/* Quote marks */}
        {config.showQuoteMarks && (
          <span className="text-4xl text-cyan-500 leading-none select-none">&ldquo;</span>
        )}

        {/* Quote text */}
        {isEditing ? (
          // biome-ignore lint/a11y/useSemanticElements: contentEditable requires div with role="textbox" for rich text
          <div
            ref={textRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleTextInput}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            role="textbox"
            tabIndex={0}
            aria-label="Quote text editor"
            className={cn(
              'text-lg text-foreground outline-hidden min-h-[1.5em]',
              config.showQuoteMarks && '-mt-4 ml-4',
              'bg-card/50 rounded px-2 py-1',
            )}
          >
            {localContent.text}
          </div>
        ) : (
          <div
            className={cn(
              'text-lg text-foreground outline-hidden min-h-[1.5em]',
              config.showQuoteMarks && '-mt-4 ml-4',
            )}
          >
            {localContent.text || (
              <span className="text-muted-foreground italic">Enter quote text...</span>
            )}
          </div>
        )}

        {config.showQuoteMarks && (
          <span className="text-4xl text-cyan-500 leading-none select-none float-right -mt-2">
            &rdquo;
          </span>
        )}

        {/* Attribution */}
        {(localContent.attribution || isEditing) && (
          <footer
            className={cn(
              'mt-3 text-sm text-muted-foreground',
              config.attributionPosition === 'inline' ? 'inline ml-2' : 'block',
            )}
          >
            <span className="mr-1">—</span>
            {isEditing ? (
              <input
                type="text"
                value={localContent.attribution || ''}
                onChange={(e) =>
                  setLocalContent((prev) => ({ ...prev, attribution: e.target.value }))
                }
                onBlur={handleBlur}
                placeholder="Author name"
                className="bg-transparent border-b border-border outline-hidden focus:border-cyan-500"
              />
            ) : (
              <cite className="not-italic">{localContent.attribution}</cite>
            )}
            {localContent.source && (
              <span className="text-muted-foreground/70">, {localContent.source}</span>
            )}
          </footer>
        )}
      </blockquote>
    </BlockWrapper>
  );
}
