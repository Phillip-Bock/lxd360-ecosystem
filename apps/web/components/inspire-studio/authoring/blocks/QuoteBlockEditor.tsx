import { Quote } from 'lucide-react';
import type { QuoteBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface QuoteBlockEditorProps {
  block: QuoteBlock;
  onChange: (content: QuoteBlock['content']) => void;
}

export const QuoteBlockEditor = ({ block, onChange }: QuoteBlockEditorProps): React.JSX.Element => {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="quote-text" className="block text-sm font-medium text-brand-secondary mb-1">
          Quote Text
        </label>
        <textarea
          id="quote-text"
          value={block.content.text}
          onChange={(e) => onChange({ ...block.content, text: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Enter the quote..."
        />
      </div>
      <div>
        <label
          htmlFor="quote-author"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Author (optional)
        </label>
        <input
          id="quote-author"
          type="text"
          value={block.content.author || ''}
          onChange={(e) => onChange({ ...block.content, author: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Author name"
        />
      </div>
      <div>
        <label
          htmlFor="quote-source"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Source (optional)
        </label>
        <input
          id="quote-source"
          type="text"
          value={block.content.source || ''}
          onChange={(e) => onChange({ ...block.content, source: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Book, article, etc."
        />
      </div>
      {block.content.text && (
        <div className="mt-4 p-4 bg-brand-page rounded-lg border-l-4 border-brand-primary">
          <Quote className="w-6 h-6 text-brand-muted mb-2" />
          <p className="text-brand-secondary italic mb-2">{block.content.text}</p>
          {(block.content.author || block.content.source) && (
            <p className="text-sm text-brand-secondary">
              {block.content.author && <span className="font-medium">{block.content.author}</span>}
              {block.content.author && block.content.source && <span>, </span>}
              {block.content.source && <span className="italic">{block.content.source}</span>}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
