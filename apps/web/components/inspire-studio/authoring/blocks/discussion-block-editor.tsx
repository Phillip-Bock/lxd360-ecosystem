import type { DiscussionBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface DiscussionBlockEditorProps {
  block: DiscussionBlock;
  onChange: (content: DiscussionBlock['content']) => void;
}

export const DiscussionBlockEditor = ({
  block,
  onChange,
}: DiscussionBlockEditorProps): React.JSX.Element => {
  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor="discussion-prompt"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Discussion Prompt
        </label>
        <textarea
          id="discussion-prompt"
          value={block.content.prompt}
          onChange={(e) => onChange({ ...block.content, prompt: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Enter a discussion question or topic..."
        />
      </div>
      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={block.content.allowReplies}
            onChange={(e) => onChange({ ...block.content, allowReplies: e.target.checked })}
            className="w-4 h-4 text-brand-blue rounded"
          />
          <span className="text-sm font-medium text-brand-secondary">
            Allow replies to comments
          </span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={block.content.requireApproval}
            onChange={(e) => onChange({ ...block.content, requireApproval: e.target.checked })}
            className="w-4 h-4 text-brand-blue rounded"
          />
          <span className="text-sm font-medium text-brand-secondary">
            Require approval before posting
          </span>
        </label>
      </div>
    </div>
  );
};
