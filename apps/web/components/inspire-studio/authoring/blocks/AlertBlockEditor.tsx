import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import type { AlertBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface AlertBlockEditorProps {
  block: AlertBlock;
  onChange: (content: AlertBlock['content']) => void;
}

export const AlertBlockEditor = ({ block, onChange }: AlertBlockEditorProps): React.JSX.Element => {
  const getAlertClasses = (): string => {
    const typeClasses = {
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      success: 'bg-green-50 border-green-200 text-green-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      error: 'bg-red-50 border-red-200 text-red-800',
    };
    return typeClasses[block.content.type];
  };

  const getAlertIcon = (): React.JSX.Element => {
    const iconClasses = 'w-5 h-5';
    const icons = {
      info: <Info className={iconClasses} />,
      success: <CheckCircle className={iconClasses} />,
      warning: <AlertTriangle className={iconClasses} />,
      error: <XCircle className={iconClasses} />,
    };
    return icons[block.content.type];
  };

  return (
    <div className="space-y-3">
      <div>
        <label
          className="block text-sm font-medium text-brand-secondary mb-1"
          htmlFor="alert-message"
        >
          Alert Message
        </label>
        <textarea
          id="alert-message"
          value={block.content.message}
          onChange={(e) => onChange({ ...block.content, message: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Enter alert message..."
        />
      </div>
      <fieldset>
        <legend className="block text-sm font-medium text-brand-secondary mb-2">Alert Type</legend>
        <div className="grid grid-cols-4 gap-2">
          {(['info', 'success', 'warning', 'error'] as const).map((type) => (
            <button
              type="button"
              key={type}
              onClick={() => onChange({ ...block.content, type })}
              className={`px-4 py-2 rounded-lg border-2 text-sm font-medium capitalize transition-colors ${
                block.content.type === type
                  ? 'border-brand-primary bg-blue-50 text-blue-700'
                  : 'border-brand-strong bg-brand-surface text-brand-secondary hover:bg-brand-page'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={block.content.dismissible}
          onChange={(e) => onChange({ ...block.content, dismissible: e.target.checked })}
          className="w-4 h-4 text-brand-blue rounded"
        />
        <span className="text-sm font-medium text-brand-secondary">Allow dismissing alert</span>
      </label>
      {block.content.message && (
        <div className="mt-4 p-4 bg-brand-page rounded-lg">
          <p className="text-xs font-medium text-brand-secondary mb-2">Preview:</p>
          <div className={`flex items-start gap-3 p-4 rounded-lg border-2 ${getAlertClasses()}`}>
            {getAlertIcon()}
            <p className="flex-1">{block.content.message}</p>
            {block.content.dismissible && (
              <button type="button" className="hover:opacity-70">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
