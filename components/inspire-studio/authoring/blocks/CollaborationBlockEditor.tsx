import type { CollaborationBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface CollaborationBlockEditorProps {
  block: CollaborationBlock;
  onChange: (content: CollaborationBlock['content']) => void;
}

export const CollaborationBlockEditor = ({
  block,
  onChange,
}: CollaborationBlockEditorProps): React.JSX.Element => {
  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor="collaboration-activity-title"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Activity Title
        </label>
        <input
          id="collaboration-activity-title"
          type="text"
          value={block.content.title}
          onChange={(e) => onChange({ ...block.content, title: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Group activity title"
        />
      </div>
      <div>
        <label
          htmlFor="collaboration-instructions"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Instructions
        </label>
        <textarea
          id="collaboration-instructions"
          value={block.content.instruction}
          onChange={(e) => onChange({ ...block.content, instruction: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Provide instructions for the collaborative activity..."
        />
      </div>
      <fieldset>
        <legend className="block text-sm font-medium text-brand-secondary mb-2">
          Activity Type
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {(['group_discussion', 'shared_document', 'peer_review', 'group_project'] as const).map(
            (type) => (
              <button
                type="button"
                key={type}
                onClick={() => onChange({ ...block.content, activityType: type })}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium capitalize transition-colors ${
                  block.content.activityType === type
                    ? 'border-brand-primary bg-blue-50 text-blue-700'
                    : 'border-brand-strong bg-brand-surface text-brand-secondary hover:bg-brand-page'
                }`}
              >
                {type.replace(/_/g, ' ')}
              </button>
            ),
          )}
        </div>
      </fieldset>
      <div>
        <label
          htmlFor="collaboration-group-size"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Group Size (optional)
        </label>
        <input
          id="collaboration-group-size"
          type="number"
          value={block.content.groupSize || ''}
          onChange={(e) =>
            onChange({ ...block.content, groupSize: parseInt(e.target.value, 10) || undefined })
          }
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="3-5 learners per group"
          min="2"
        />
      </div>
    </div>
  );
};
