import type { HeadingBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface HeadingBlockEditorProps {
  block: HeadingBlock;
  onChange: (content: HeadingBlock['content']) => void;
}

export const HeadingBlockEditor = ({
  block,
  onChange,
}: HeadingBlockEditorProps): React.JSX.Element => {
  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor="heading-level"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Heading Level
        </label>
        <select
          id="heading-level"
          value={block.content.level}
          onChange={(e) =>
            onChange({ ...block.content, level: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6 })
          }
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
        >
          <option value="1">Heading 1 (Largest)</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
          <option value="5">Heading 5</option>
          <option value="6">Heading 6 (Smallest)</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="heading-text"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Heading Text
        </label>
        <input
          id="heading-text"
          type="text"
          value={block.content.text}
          onChange={(e) => onChange({ ...block.content, text: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="Enter your heading text..."
        />
      </div>

      {/* Preview */}
      <div className="mt-4 p-4 bg-brand-page rounded-lg">
        <p className="text-xs text-brand-muted mb-2">Preview:</p>
        {block.content.level === 1 && (
          <h1 className="text-4xl font-bold">{block.content.text || 'Heading preview'}</h1>
        )}
        {block.content.level === 2 && (
          <h2 className="text-3xl font-bold">{block.content.text || 'Heading preview'}</h2>
        )}
        {block.content.level === 3 && (
          <h3 className="text-2xl font-bold">{block.content.text || 'Heading preview'}</h3>
        )}
        {block.content.level === 4 && (
          <h4 className="text-xl font-bold">{block.content.text || 'Heading preview'}</h4>
        )}
        {block.content.level === 5 && (
          <h5 className="text-lg font-bold">{block.content.text || 'Heading preview'}</h5>
        )}
        {block.content.level === 6 && (
          <h6 className="text-base font-bold">{block.content.text || 'Heading preview'}</h6>
        )}
      </div>
    </div>
  );
};
