import type { DividerBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface DividerBlockEditorProps {
  block: DividerBlock;
  onChange: (content: DividerBlock['content']) => void;
}

export const DividerBlockEditor = ({
  block,
  onChange,
}: DividerBlockEditorProps): React.JSX.Element => {
  return (
    <div className="space-y-3">
      <div>
        <span className="block text-sm font-medium text-brand-secondary mb-2">Divider Style</span>
        <div className="flex gap-4" role="radiogroup" aria-label="Divider style">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={block.content.style === 'solid'}
              onChange={() => onChange({ ...block.content, style: 'solid' })}
              className="w-4 h-4 text-brand-blue"
            />
            <span className="text-sm text-brand-secondary">Solid</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={block.content.style === 'dashed'}
              onChange={() => onChange({ ...block.content, style: 'dashed' })}
              className="w-4 h-4 text-brand-blue"
            />
            <span className="text-sm text-brand-secondary">Dashed</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={block.content.style === 'dotted'}
              onChange={() => onChange({ ...block.content, style: 'dotted' })}
              className="w-4 h-4 text-brand-blue"
            />
            <span className="text-sm text-brand-secondary">Dotted</span>
          </label>
        </div>
      </div>
      <div>
        <label
          htmlFor="divider-thickness"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Thickness (px)
        </label>
        <input
          id="divider-thickness"
          type="number"
          value={block.content.thickness || 1}
          onChange={(e) =>
            onChange({ ...block.content, thickness: parseInt(e.target.value, 10) || 1 })
          }
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          min="1"
          max="10"
        />
      </div>
      <div className="mt-4 p-4 bg-brand-page rounded-lg">
        <p className="text-xs font-medium text-brand-secondary mb-2">Preview:</p>
        <hr
          className="border-brand-strong"
          style={{
            borderStyle: block.content.style,
            borderWidth: `${block.content.thickness || 1}px`,
          }}
        />
      </div>
    </div>
  );
};
