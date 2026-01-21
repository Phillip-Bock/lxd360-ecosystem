import { HelpCircle, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { BaseBlockEditor, type BaseBlockEditorProps } from './BaseBlockEditor';

interface AskExpertData {
  title?: string;
  description?: string;
  allowAnonymous?: boolean;
}

export const AskExpertBlockEditor = (props: BaseBlockEditorProps): React.JSX.Element => {
  const data = (props.block?.content as AskExpertData) || {};
  const [title, setTitle] = useState(data.title || '');
  const [description, setDescription] = useState(data.description || '');
  const [allowAnonymous, setAllowAnonymous] = useState(data.allowAnonymous ?? false);

  return (
    <BaseBlockEditor {...props}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-linear-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-brand-primary" />
          </div>
          <h3 className="font-semibold text-brand-primary">Ask an Expert Queue</h3>
          <span className="ml-auto px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
            Social
          </span>
        </div>

        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-800">
          <p className="font-medium mb-1">Features:</p>
          <ul className="text-xs space-y-1">
            <li>• Questions directed to designated SMEs/mentors</li>
            <li>• Expert dashboard for managing Q&A</li>
            <li>• Public answers visible to all learners</li>
            <li>• Notification system for updates</li>
          </ul>
        </div>

        <div>
          <label
            htmlFor="ask-expert-queue-title"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Queue Title
          </label>
          <input
            id="ask-expert-queue-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              props.onUpdate({
                ...props.block,
                content: { ...data, title: e.target.value } as Record<string, unknown>,
              });
            }}
            placeholder="e.g., Technical Support Q&A"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="ask-expert-description"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Description
          </label>
          <textarea
            id="ask-expert-description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              props.onUpdate({
                ...props.block,
                content: { ...data, description: e.target.value } as Record<string, unknown>,
              });
            }}
            placeholder="What types of questions can be asked?"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
            rows={3}
          />
        </div>

        <label className="flex items-center gap-3 p-3 border border-brand-default rounded-lg hover:bg-brand-page cursor-pointer">
          <input
            type="checkbox"
            checked={allowAnonymous}
            onChange={(e) => {
              setAllowAnonymous(e.target.checked);
              props.onUpdate({
                ...props.block,
                content: { ...data, allowAnonymous: e.target.checked } as Record<string, unknown>,
              });
            }}
            className="w-4 h-4 text-indigo-600 rounded"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-brand-secondary" />
              <span className="text-sm font-medium text-brand-primary">
                Allow Anonymous Questions
              </span>
            </div>
            <p className="text-xs text-brand-muted">Learners can ask without revealing identity</p>
          </div>
        </label>

        <div className="border-t pt-4">
          <div className="p-4 bg-brand-page rounded-lg">
            <p className="text-sm font-medium text-brand-secondary mb-2">Question Flow:</p>
            <div className="space-y-2 text-xs text-brand-secondary">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                  1
                </div>
                <span>Learner submits question</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                  2
                </div>
                <span>Question assigned to available expert</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                  3
                </div>
                <span>Expert provides answer</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                  4
                </div>
                <span>Answer posted publicly for all learners</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseBlockEditor>
  );
};
