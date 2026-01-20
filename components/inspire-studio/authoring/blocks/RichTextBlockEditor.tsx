import {
  Bold,
  Code,
  Eye,
  EyeOff,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Type,
  Underline,
} from 'lucide-react';
import { useRef, useState } from 'react';
import type { RichTextBlock } from '@/lib/inspire-studio/types/contentBlocks';
import { safeInnerHtml } from '@/lib/sanitize';

interface RichTextBlockEditorProps {
  block: RichTextBlock;
  onChange: (content: RichTextBlock['content']) => void;
}

export const RichTextBlockEditor = ({
  block,
  onChange,
}: RichTextBlockEditorProps): React.JSX.Element => {
  const [showPreview, setShowPreview] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wrapSelection = (before: string, after: string): void => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = block.content.html.substring(start, end);
    const beforeText = block.content.html.substring(0, start);
    const afterText = block.content.html.substring(end);

    const newText = beforeText + before + selectedText + after + afterText;
    onChange({ html: newText });

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const insertText = (text: string): void => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeText = block.content.html.substring(0, start);
    const afterText = block.content.html.substring(start);

    const newText = beforeText + text + afterText;
    onChange({ html: newText });

    // Restore focus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const formatButtons = [
    { icon: Bold, label: 'Bold', before: '<strong>', after: '</strong>' },
    { icon: Italic, label: 'Italic', before: '<em>', after: '</em>' },
    { icon: Underline, label: 'Underline', before: '<u>', after: '</u>' },
    { icon: Code, label: 'Code', before: '<code>', after: '</code>' },
    { icon: Quote, label: 'Quote', before: '<blockquote>', after: '</blockquote>' },
    { icon: Heading1, label: 'Heading 1', before: '<h1>', after: '</h1>' },
    { icon: Heading2, label: 'Heading 2', before: '<h2>', after: '</h2>' },
    { icon: Heading3, label: 'Heading 3', before: '<h3>', after: '</h3>' },
    { icon: List, label: 'Bullet List', before: '<ul>\n  <li>', after: '</li>\n</ul>' },
    { icon: ListOrdered, label: 'Numbered List', before: '<ol>\n  <li>', after: '</li>\n</ol>' },
    { icon: Link2, label: 'Link', before: '<a href="url">', after: '</a>' },
  ];

  const quickInserts = [
    { label: 'Paragraph', text: '<p></p>' },
    { label: 'Line Break', text: '<br />' },
    { label: 'Horizontal Rule', text: '<hr />' },
    { label: 'Div', text: '<div></div>' },
    { label: 'Span', text: '<span></span>' },
  ];

  return (
    <div className="space-y-4">
      {/* Formatting Toolbar */}
      <div className="bg-brand-page border border-brand-default rounded-lg p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 mr-2">
            <Type className="w-4 h-4 text-brand-muted" />
            <span className="text-xs font-medium text-brand-secondary">Format:</span>
          </div>
          {formatButtons.map((btn) => (
            <button
              type="button"
              key={btn.label}
              onClick={() => wrapSelection(btn.before, btn.after)}
              className="p-2 hover:bg-gray-200 rounded transition-colors group relative"
              title={btn.label}
            >
              <btn.icon className="w-4 h-4 text-brand-secondary group-hover:text-brand-primary" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-brand-page text-brand-primary text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                {btn.label}
              </span>
            </button>
          ))}
        </div>

        {/* Quick Inserts */}
        <div className="mt-3 pt-3 border-t border-brand-strong">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-brand-secondary">Insert:</span>
            {quickInserts.map((insert) => (
              <button
                type="button"
                key={insert.label}
                onClick={() => insertText(insert.text)}
                className="px-2 py-1 text-xs bg-brand-surface border border-brand-strong rounded hover:bg-brand-surface transition-colors"
              >
                {insert.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* HTML Editor */}
      <div>
        <label
          htmlFor="rich-text-html-content"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          HTML Content
        </label>
        <textarea
          id="rich-text-html-content"
          ref={textareaRef}
          value={block.content.html}
          onChange={(e) => onChange({ html: e.target.value })}
          rows={12}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent font-mono text-sm"
          placeholder="Enter HTML content or use the toolbar above to format text..."
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-brand-muted">{block.content.html.length} characters</p>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1 text-xs text-brand-blue hover:text-blue-700"
          >
            {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
        </div>
      </div>

      {/* Preview */}
      {showPreview && block.content.html && (
        <div className="border-t border-brand-default pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-brand-secondary">Live Preview</span>
            <span className="text-xs text-brand-muted">Updates as you type</span>
          </div>
          <div className="p-4 bg-brand-surface border border-brand-default rounded-lg">
            <div
              {...safeInnerHtml(block.content.html, 'rich')}
              className="prose prose-sm max-w-none prose-headings:font-bold prose-a:text-brand-blue prose-code:bg-brand-surface prose-code:px-1 prose-code:py-0.5 prose-code:rounded"
            />
          </div>
        </div>
      )}

      {/* Helper Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>Pro tip:</strong> Select text in the editor and click a format button to wrap it
          with HTML tags. You can also type HTML directly for advanced formatting.
        </p>
      </div>
    </div>
  );
};
