import { Clock, Video } from 'lucide-react';
import { useState } from 'react';
import { BaseBlockEditor, type BaseBlockEditorProps } from './BaseBlockEditor';

interface VideoResponseData {
  title?: string;
  prompt?: string;
  maxDurationSeconds?: number;
}

export const VideoResponseBlockEditor = (props: BaseBlockEditorProps): React.JSX.Element => {
  const data = (props.block?.content as VideoResponseData) || {};
  const [title, setTitle] = useState(data.title || '');
  const [prompt, setPrompt] = useState(data.prompt || '');
  const [maxDuration, setMaxDuration] = useState(data.maxDurationSeconds || 120);

  return (
    <BaseBlockEditor {...props}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-linear-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
            <Video className="w-5 h-5 text-brand-primary" />
          </div>
          <h3 className="font-semibold text-brand-primary">Video Response</h3>
          <span className="ml-auto px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
            Assessment
          </span>
        </div>
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs">
          <p className="font-medium mb-1">Webcam video recording</p>
          <p>Use cases: Skill demonstrations, presentation practice, physical task completion</p>
        </div>
        <div>
          <label
            htmlFor="video-response-question"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Question/Prompt
          </label>
          <input
            id="video-response-question"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              props.onUpdate({
                ...props.block,
                content: { ...data, title: e.target.value } as Record<string, unknown>,
              });
            }}
            placeholder="e.g., Demonstrate the Procedure"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div>
          <label
            htmlFor="video-response-instructions"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Instructions
          </label>
          <textarea
            id="video-response-instructions"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              props.onUpdate({
                ...props.block,
                content: { ...data, prompt: e.target.value } as Record<string, unknown>,
              });
            }}
            placeholder="What should learners demonstrate?"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
            rows={3}
          />
        </div>
        <div>
          <label
            htmlFor="video-response-max-duration"
            className="block text-sm font-medium text-brand-secondary mb-2 flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Max Duration (sec)
          </label>
          <input
            id="video-response-max-duration"
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
            min="30"
            max="600"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>
    </BaseBlockEditor>
  );
};
