import { Eye, Lock, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { BaseBlockEditor, type BaseBlockEditorProps } from './base-block-editor';

interface GroupDiscussionData {
  title?: string;
  description?: string;
  moderationEnabled?: boolean;
  allowAnonymous?: boolean;
}

export const GroupDiscussionBlockEditor = (props: BaseBlockEditorProps): React.JSX.Element => {
  const data = (props.block?.content as GroupDiscussionData) || {};
  const [title, setTitle] = useState(data.title || '');
  const [description, setDescription] = useState(data.description || '');
  const [moderationEnabled, setModerationEnabled] = useState(data.moderationEnabled ?? true);
  const [allowAnonymous, setAllowAnonymous] = useState(data.allowAnonymous ?? false);

  const handleUpdate = (): void => {
    props.onUpdate({
      ...props.block,
      content: { ...data, title, description, moderationEnabled, allowAnonymous },
    });
  };

  return (
    <BaseBlockEditor {...props}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-brand-primary" />
          </div>
          <h3 className="font-semibold text-brand-primary">Group Discussion Forum</h3>
          <span className="ml-auto px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
            Social
          </span>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <p className="font-medium mb-1">Features:</p>
          <ul className="text-xs space-y-1">
            <li>• Threaded discussions with nested replies</li>
            <li>• Real-time updates and notifications</li>
            <li>• Pin important threads and lock resolved discussions</li>
          </ul>
        </div>

        <div>
          <label
            htmlFor="group-discussion-forum-title"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Forum Title
          </label>
          <input
            id="group-discussion-forum-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              handleUpdate();
            }}
            placeholder="e.g., Week 3 Discussion: Learning Theories"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          />
        </div>

        <div>
          <label
            htmlFor="group-discussion-description"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Description/Guidelines
          </label>
          <textarea
            id="group-discussion-description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              handleUpdate();
            }}
            placeholder="Provide guidelines for meaningful discussion..."
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary resize-none"
            rows={3}
          />
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 border border-brand-default rounded-lg hover:bg-brand-page cursor-pointer">
            <input
              type="checkbox"
              checked={moderationEnabled}
              onChange={(e) => {
                setModerationEnabled(e.target.checked);
                handleUpdate();
              }}
              className="w-4 h-4 text-brand-blue rounded"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-brand-secondary" />
                <span className="text-sm font-medium text-brand-primary">Enable Moderation</span>
              </div>
              <p className="text-xs text-brand-muted">Review posts before they appear publicly</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border border-brand-default rounded-lg hover:bg-brand-page cursor-pointer">
            <input
              type="checkbox"
              checked={allowAnonymous}
              onChange={(e) => {
                setAllowAnonymous(e.target.checked);
                handleUpdate();
              }}
              className="w-4 h-4 text-brand-blue rounded"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-brand-secondary" />
                <span className="text-sm font-medium text-brand-primary">
                  Allow Anonymous Posts
                </span>
              </div>
              <p className="text-xs text-brand-muted">
                Learners can post without revealing identity
              </p>
            </div>
          </label>
        </div>

        <div className="border-t pt-4">
          <div className="p-4 bg-brand-page rounded-lg">
            <p className="text-sm font-medium text-brand-secondary mb-2">Learner View Preview:</p>
            <div className="bg-brand-surface border border-brand-default rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs text-brand-muted">
                <MessageCircle className="w-4 h-4" />
                <span>Start a new thread or reply to existing discussions</span>
              </div>
              <div className="h-20 bg-brand-surface rounded flex items-center justify-center text-xs text-brand-muted">
                Discussion threads will appear here
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseBlockEditor>
  );
};
