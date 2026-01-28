import type { EmbedBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface EmbedBlockEditorProps {
  block: EmbedBlock;
  onChange: (content: EmbedBlock['content']) => void;
}

export const EmbedBlockEditor = ({ block, onChange }: EmbedBlockEditorProps): React.JSX.Element => {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="embed-url" className="block text-sm font-medium text-brand-secondary mb-1">
          Embed URL
        </label>
        <input
          id="embed-url"
          type="url"
          value={block.content.url}
          onChange={(e) => onChange({ ...block.content, url: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="https://example.com/embed"
        />
        <p className="text-xs text-brand-muted mt-1">
          Supports YouTube, Vimeo, Google Maps, and more
        </p>
      </div>
      <div>
        <label
          htmlFor="embed-title"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Title (optional)
        </label>
        <input
          id="embed-title"
          type="text"
          value={block.content.title || ''}
          onChange={(e) => onChange({ ...block.content, title: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Embed title"
        />
      </div>
      <div>
        <label
          htmlFor="embed-provider"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Provider (optional)
        </label>
        <input
          id="embed-provider"
          type="text"
          value={block.content.provider || ''}
          onChange={(e) => onChange({ ...block.content, provider: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="YouTube, Vimeo, etc."
        />
      </div>
      <div>
        <label
          htmlFor="embed-custom-html"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Custom Embed HTML (optional)
        </label>
        <textarea
          id="embed-custom-html"
          value={block.content.html || ''}
          onChange={(e) => onChange({ ...block.content, html: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary font-mono text-sm"
          placeholder="<iframe src='...'></iframe>"
        />
        <p className="text-xs text-brand-muted mt-1">Override URL with custom HTML embed code</p>
      </div>
      {block.content.url && (
        <div className="mt-4 p-4 bg-brand-page rounded-lg">
          <p className="text-xs font-medium text-brand-secondary mb-2">Preview:</p>
          <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-brand-muted text-sm">Embedded content will appear here</p>
          </div>
        </div>
      )}
    </div>
  );
};
