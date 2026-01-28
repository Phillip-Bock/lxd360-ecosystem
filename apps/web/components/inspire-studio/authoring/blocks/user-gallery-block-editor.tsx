import { CheckCircle, ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { BaseBlockEditor, type BaseBlockEditorProps } from './base-block-editor';

interface UserGalleryData {
  title?: string;
  prompt?: string;
  moderationRequired?: boolean;
  allowedFormats?: string[];
}

export const UserGalleryBlockEditor = (props: BaseBlockEditorProps): React.JSX.Element => {
  const data = (props.block?.content as UserGalleryData) || {};
  const [title, setTitle] = useState(data.title || '');
  const [prompt, setPrompt] = useState(data.prompt || '');
  const [moderationRequired, setModerationRequired] = useState(data.moderationRequired ?? true);
  const [allowedFormats, setAllowedFormats] = useState(
    data.allowedFormats || ['image', 'video', 'document'],
  );

  return (
    <BaseBlockEditor {...props}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-linear-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-brand-primary" />
          </div>
          <h3 className="font-semibold text-brand-primary">User-Generated Gallery</h3>
          <span className="ml-auto px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full font-medium">
            Social
          </span>
        </div>
        <div>
          <label
            htmlFor="user-gallery-title"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Gallery Title
          </label>
          <input
            id="user-gallery-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              props.onUpdate({ ...props.block, content: { ...data, title: e.target.value } });
            }}
            placeholder="e.g., Project Showcase Gallery"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-pink-500"
          />
        </div>
        <div>
          <label
            htmlFor="user-gallery-upload-prompt"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Upload Prompt
          </label>
          <textarea
            id="user-gallery-upload-prompt"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              props.onUpdate({ ...props.block, content: { ...data, prompt: e.target.value } });
            }}
            placeholder="What should learners submit?"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-pink-500 resize-none"
            rows={2}
          />
        </div>
        <div>
          <span className="block text-sm font-medium text-brand-secondary mb-2">
            Allowed Formats
          </span>
          <div className="space-y-2">
            {['image', 'video', 'document'].map((format) => (
              <label key={format} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={allowedFormats.includes(format)}
                  onChange={(e) => {
                    const updated = e.target.checked
                      ? [...allowedFormats, format]
                      : allowedFormats.filter((f: string) => f !== format);
                    setAllowedFormats(updated);
                    props.onUpdate({
                      ...props.block,
                      content: { ...data, allowedFormats: updated },
                    });
                  }}
                  className="w-4 h-4 text-pink-600 rounded"
                />
                <span className="text-sm text-brand-secondary capitalize">{format}s</span>
              </label>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-3 p-3 border border-brand-default rounded-lg hover:bg-brand-page cursor-pointer">
          <input
            type="checkbox"
            checked={moderationRequired}
            onChange={(e) => {
              setModerationRequired(e.target.checked);
              props.onUpdate({
                ...props.block,
                content: { ...data, moderationRequired: e.target.checked },
              });
            }}
            className="w-4 h-4 text-pink-600 rounded"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-brand-secondary" />
              <span className="text-sm font-medium text-brand-primary">Require Moderation</span>
            </div>
            <p className="text-xs text-brand-muted">Review submissions before public display</p>
          </div>
        </label>
      </div>
    </BaseBlockEditor>
  );
};
