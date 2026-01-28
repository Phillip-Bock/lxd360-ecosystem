'use client';

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Highlighter,
  Italic,
  Link,
  type LucideIcon,
  Strikethrough,
  Underline,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { logger } from '@/lib/logger';
import { safeInnerHtml } from '@/lib/sanitize';
import type { TextBlockContent } from '@/types/blocks';
import type { BlockComponentProps } from '../block-renderer';

const log = logger.scope('TextBlock');

/**
 * TextBlock - Rich text content with inline editing
 */
export function TextBlock({
  block,
  isEditing,
  onUpdate,
}: BlockComponentProps<TextBlockContent>): React.JSX.Element {
  const content = block.content as TextBlockContent;
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);

  // Initialize content
  useEffect(() => {
    if (editorRef.current && content.html) {
      editorRef.current.innerHTML = content.html;
    }
  }, [content.html]);

  // Handle content changes
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onUpdate({
        content: {
          ...content,
          html,
          plainText: editorRef.current.textContent || '',
        },
      });
    }
  }, [content, onUpdate]);

  // Execute formatting command
  const execCommand = useCallback(
    (command: string, value?: string) => {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
      handleInput();
    },
    [handleInput],
  );

  // Handle selection change for toolbar
  const handleSelectionChange = useCallback((): void => {
    const sel = window.getSelection();
    setShowToolbar(sel !== null && !sel.isCollapsed && isFocused);
  }, [isFocused]);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return (): void => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [handleSelectionChange]);

  // Check if format is active
  const isFormatActive = useCallback((command: string) => {
    return document.queryCommandState(command);
  }, []);

  // Handle paste to clean up HTML
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
      handleInput();
    },
    [handleInput],
  );

  // Handle key commands
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'b' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        execCommand('bold');
      } else if (e.key === 'i' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        execCommand('italic');
      } else if (e.key === 'u' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        execCommand('underline');
      }
    },
    [execCommand],
  );

  // Preview mode - just render HTML
  if (!isEditing) {
    return (
      <div
        className="prose prose-invert max-w-none text-studio-text"
        {...safeInnerHtml(content.html || '<p>No content</p>', 'rich')}
      />
    );
  }

  return (
    <div className="relative">
      {/* Floating toolbar */}
      {showToolbar && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-30">
          <div className="flex items-center gap-0.5 bg-studio-bg border border-studio-surface/50 rounded-lg shadow-xl px-1 py-1">
            <ToolbarButton
              icon={Bold}
              label="Bold"
              active={isFormatActive('bold')}
              onClick={() => execCommand('bold')}
            />
            <ToolbarButton
              icon={Italic}
              label="Italic"
              active={isFormatActive('italic')}
              onClick={() => execCommand('italic')}
            />
            <ToolbarButton
              icon={Underline}
              label="Underline"
              active={isFormatActive('underline')}
              onClick={() => execCommand('underline')}
            />
            <ToolbarButton
              icon={Strikethrough}
              label="Strikethrough"
              active={isFormatActive('strikeThrough')}
              onClick={() => execCommand('strikeThrough')}
            />
            <ToolbarDivider />
            <ToolbarButton
              icon={Link}
              label="Link"
              onClick={() => {
                log.warn('Link creation requires implementation of proper URL input dialog');
              }}
            />
            <ToolbarButton
              icon={Highlighter}
              label="Highlight"
              onClick={() => execCommand('backColor', 'var(--color-lxd-warning)')}
            />
            <ToolbarDivider />
            <ToolbarButton
              icon={AlignLeft}
              label="Align left"
              active={isFormatActive('justifyLeft')}
              onClick={() => execCommand('justifyLeft')}
            />
            <ToolbarButton
              icon={AlignCenter}
              label="Align center"
              active={isFormatActive('justifyCenter')}
              onClick={() => execCommand('justifyCenter')}
            />
            <ToolbarButton
              icon={AlignRight}
              label="Align right"
              active={isFormatActive('justifyRight')}
              onClick={() => execCommand('justifyRight')}
            />
          </div>
        </div>
      )}

      {/* Editor area */}
      {/* biome-ignore lint/a11y/useSemanticElements: contentEditable requires div with role="textbox" for rich text */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className={`
          min-h-[60px] p-4 rounded-lg outline-hidden
          prose prose-invert max-w-none
          text-studio-text text-base leading-relaxed
          focus:bg-studio-bg/50
          [&_a]:text-studio-accent [&_a]:underline
          [&_strong]:text-brand-primary [&_strong]:font-semibold
          [&_em]:italic
          [&_u]:underline
          [&_s]:line-through
          [&_mark]:bg-brand-warning/30 [&_mark]:text-brand-primary
          [&_code]:bg-studio-surface/50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm
          [&_blockquote]:border-l-4 [&_blockquote]:border-studio-accent [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-studio-text-muted
          [&_ul]:list-disc [&_ul]:pl-6
          [&_ol]:list-decimal [&_ol]:pl-6
          [&_li]:mb-1
        `}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          setShowToolbar(false);
        }}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        data-placeholder="Start typing..."
        role="textbox"
        aria-multiline="true"
        aria-label="Text content"
        tabIndex={0}
      />

      {/* Placeholder */}
      {(!content.html || content.html === '<br>' || content.html === '') && !isFocused && (
        <div className="absolute inset-0 p-4 text-studio-text-muted pointer-events-none">
          Start typing...
        </div>
      )}
    </div>
  );
}

/**
 * Toolbar button component
 */
function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  active,
  disabled,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        p-1.5 rounded transition-colors
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${
          active
            ? 'bg-studio-accent/20 text-studio-accent'
            : 'text-studio-text-muted hover:text-brand-primary hover:bg-studio-surface/50'
        }
      `}
      title={label}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

/**
 * Toolbar divider
 */
function ToolbarDivider(): React.JSX.Element {
  return <div className="w-px h-4 bg-studio-surface/50 mx-1" />;
}

export default TextBlock;
