import type { ButtonBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface ButtonBlockEditorProps {
  block: ButtonBlock;
  onChange: (content: ButtonBlock['content']) => void;
}

export const ButtonBlockEditor = ({
  block,
  onChange,
}: ButtonBlockEditorProps): React.JSX.Element => {
  const getButtonClasses = (): string => {
    const baseClasses = 'px-6 py-2 rounded-lg font-medium transition-colors';
    const sizeClasses = {
      small: 'text-sm px-4 py-1.5',
      medium: 'text-base px-6 py-2',
      large: 'text-lg px-8 py-3',
    };
    const styleClasses = {
      primary: 'bg-brand-primary text-brand-primary hover:bg-brand-primary-hover',
      secondary: 'bg-gray-600 text-brand-primary hover:bg-brand-surface-hover',
      success: 'bg-brand-success text-brand-primary hover:bg-green-700',
      danger: 'bg-brand-error text-brand-primary hover:bg-red-700',
    };
    const size = block.content.size ?? 'medium';
    const style = block.content.style ?? 'primary';
    return `${baseClasses} ${sizeClasses[size]} ${styleClasses[style]}`;
  };

  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor="button-text"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Button Text
        </label>
        <input
          id="button-text"
          type="text"
          value={block.content.text}
          onChange={(e) => onChange({ ...block.content, text: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Click me"
        />
      </div>
      <div>
        <label htmlFor="button-url" className="block text-sm font-medium text-brand-secondary mb-1">
          Button URL (optional)
        </label>
        <input
          id="button-url"
          type="url"
          value={block.content.url || ''}
          onChange={(e) => onChange({ ...block.content, url: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="https://example.com"
        />
      </div>
      <div>
        <label
          htmlFor="button-action"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Action (optional)
        </label>
        <input
          id="button-action"
          type="text"
          value={block.content.action || ''}
          onChange={(e) => onChange({ ...block.content, action: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="submit, next-lesson, etc."
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="button-style"
            className="block text-sm font-medium text-brand-secondary mb-1"
          >
            Style
          </label>
          <select
            id="button-style"
            value={block.content.style}
            onChange={(e) =>
              onChange({
                ...block.content,
                style: e.target.value as ButtonBlock['content']['style'],
              })
            }
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          >
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="success">Success</option>
            <option value="danger">Danger</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="button-size"
            className="block text-sm font-medium text-brand-secondary mb-1"
          >
            Size
          </label>
          <select
            id="button-size"
            value={block.content.size}
            onChange={(e) =>
              onChange({ ...block.content, size: e.target.value as ButtonBlock['content']['size'] })
            }
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </div>
      {block.content.text && (
        <div className="mt-4 p-4 bg-brand-page rounded-lg">
          <p className="text-xs font-medium text-brand-secondary mb-2">Preview:</p>
          <button type="button" className={getButtonClasses()}>
            {block.content.text}
          </button>
        </div>
      )}
    </div>
  );
};
