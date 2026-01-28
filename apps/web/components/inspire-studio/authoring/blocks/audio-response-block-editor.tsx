import { Clock, Mic } from 'lucide-react';
import { useState } from 'react';
import { BaseBlockEditor, type BaseBlockEditorProps } from './base-block-editor';

interface AudioResponseData {
  title?: string;
  prompt?: string;
  maxDurationSeconds?: number;
  allowRetakes?: boolean;
}

export const AudioResponseBlockEditor = (props: BaseBlockEditorProps): React.JSX.Element => {
  const data = (props.block?.content as AudioResponseData) || {};
  const [title, setTitle] = useState(data.title || '');
  const [prompt, setPrompt] = useState(data.prompt || '');
  const [maxDuration, setMaxDuration] = useState(data.maxDurationSeconds || 60);
  const [allowRetakes, setAllowRetakes] = useState(data.allowRetakes ?? true);

  return (
    <BaseBlockEditor {...props}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-linear-to-br from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Mic className="w-5 h-5 text-brand-primary" />
          </div>
          <h3 className="font-semibold text-brand-primary">Audio Response</h3>
          <span className="ml-auto px-2 py-1 bg-rose-100 text-rose-700 text-xs rounded-full font-medium">
            Assessment
          </span>
        </div>
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs">
          <p className="font-medium mb-1">Voice recording assessment</p>
          <p>Use cases: Elevator pitches, pronunciation practice, verbal explanations</p>
        </div>
        <div>
          <label
            htmlFor="audio-response-title"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Question/Prompt
          </label>
          <input
            id="audio-response-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              props.onUpdate({
                ...props.block,
                content: { ...data, title: e.target.value } as Record<string, unknown>,
              });
            }}
            placeholder="e.g., Record Your 30-Second Pitch"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-rose-500"
          />
        </div>
        <div>
          <label
            htmlFor="audio-response-prompt"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Instructions
          </label>
          <textarea
            id="audio-response-prompt"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              props.onUpdate({
                ...props.block,
                content: { ...data, prompt: e.target.value } as Record<string, unknown>,
              });
            }}
            placeholder="Explain what learners should record..."
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-rose-500 resize-none"
            rows={3}
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label
              htmlFor="audio-response-duration"
              className="block text-sm font-medium text-brand-secondary mb-2 flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Max Duration (sec)
            </label>
            <input
              id="audio-response-duration"
              type="number"
              value={maxDuration}
              onChange={(e) => {
                setMaxDuration(parseInt(e.target.value, 10));
                props.onUpdate({
                  ...props.block,
                  content: { ...data, maxDurationSeconds: parseInt(e.target.value, 10) } as Record<
                    string,
                    unknown
                  >,
                });
              }}
              min="10"
              max="300"
              className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div className="flex-1">
            <span className="block text-sm font-medium text-brand-secondary mb-2">Settings</span>
            <label className="flex items-center gap-2 p-2 border border-brand-default rounded-lg">
              <input
                type="checkbox"
                checked={allowRetakes}
                onChange={(e) => {
                  setAllowRetakes(e.target.checked);
                  props.onUpdate({
                    ...props.block,
                    content: { ...data, allowRetakes: e.target.checked } as Record<string, unknown>,
                  });
                }}
                className="w-4 h-4 text-rose-600 rounded"
              />
              <span className="text-sm">Allow Retakes</span>
            </label>
          </div>
        </div>
      </div>
    </BaseBlockEditor>
  );
};
