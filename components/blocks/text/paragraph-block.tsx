'use client';

/**
 * ParagraphBlock - Rich text content block
 * Supports contenteditable for inline editing
 */

import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { ParagraphConfig, ParagraphContent } from '@/types/blocks';
import { BlockWrapper } from '../block-wrapper';

interface ParagraphBlockProps {
  id: string;
  content: ParagraphContent;
  config: ParagraphConfig;
  isSelected?: boolean;
  isEditing?: boolean;
  onSelect?: () => void;
  onContentChange?: (content: ParagraphContent) => void;
  onStartEditing?: () => void;
  onStopEditing?: () => void;
}

export function ParagraphBlock({
  id,
  content,
  config,
  isSelected = false,
  isEditing = false,
  onSelect,
  onContentChange,
  onStartEditing,
  onStopEditing,
}: ParagraphBlockProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [localText, setLocalText] = useState(content.text);

  // Sync with external content changes
  useEffect(() => {
    // Use setTimeout to avoid sync setState in effect (React 19 pattern)
    const timeout = setTimeout(() => {
      setLocalText(content.text);
    }, 0);
    return () => clearTimeout(timeout);
  }, [content.text]);

  // Focus editor when entering edit mode
  useEffect(() => {
    if (isEditing && editorRef.current) {
      editorRef.current.focus();
      // Place cursor at end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);

  const handleInput = () => {
    if (editorRef.current) {
      const newText = editorRef.current.innerText;
      setLocalText(newText);
    }
  };

  const handleBlur = () => {
    if (localText !== content.text) {
      onContentChange?.({ text: localText });
    }
    onStopEditing?.();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      editorRef.current?.blur();
    }
  };

  const sizeClasses = {
    small: 'text-sm',
    normal: 'text-base',
    large: 'text-lg',
    lead: 'text-xl font-medium',
  };

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  };

  return (
    <BlockWrapper
      id={id}
      type="Paragraph"
      isSelected={isSelected}
      isEditing={isEditing}
      onClick={onSelect}
      onDoubleClick={onStartEditing}
    >
      {isEditing ? (
        // biome-ignore lint/a11y/useSemanticElements: contentEditable requires div with role="textbox" for rich text
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          role="textbox"
          tabIndex={0}
          aria-label="Paragraph text editor"
          className={cn(
            'outline-hidden min-h-[1.5em] transition-colors',
            'text-foreground leading-relaxed',
            sizeClasses[config.size || 'normal'],
            alignmentClasses[config.alignment || 'left'],
            'bg-card/50 rounded px-2 py-1 -mx-2 -my-1',
          )}
          data-placeholder="Enter your text here..."
        >
          {localText}
        </div>
      ) : (
        <div
          className={cn(
            'outline-hidden min-h-[1.5em] transition-colors',
            'text-foreground leading-relaxed',
            sizeClasses[config.size || 'normal'],
            alignmentClasses[config.alignment || 'left'],
            'cursor-text',
          )}
          data-placeholder="Enter your text here..."
        >
          {localText || (
            <span className="text-muted-foreground italic">Double-click to edit...</span>
          )}
        </div>
      )}

      {/* TTS Button (if enabled) */}
      {config.enableTTS && !isEditing && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            // TODO(LXD-407): Implement proper TTS with voice selection
            const utterance = new SpeechSynthesisUtterance(localText);
            window.speechSynthesis.speak(utterance);
          }}
          className={cn(
            'absolute top-2 right-2 p-1.5 rounded',
            'bg-card/80 backdrop-blur-xs border border-border',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'hover:bg-card hover:border-cyan-500',
          )}
          title="Read aloud"
        >
          <svg
            aria-hidden="true"
            className="w-4 h-4 text-cyan-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
          </svg>
        </button>
      )}
    </BlockWrapper>
  );
}
