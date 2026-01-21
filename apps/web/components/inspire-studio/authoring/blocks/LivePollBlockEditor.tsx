import { BarChart3, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { BaseBlockEditor, type BaseBlockEditorProps } from './BaseBlockEditor';

interface LivePollData {
  question?: string;
  pollType?: string;
  displayType?: string;
  options?: string[];
}

export const LivePollBlockEditor = (props: BaseBlockEditorProps): React.JSX.Element => {
  const data = (props.block?.content as LivePollData) || {};
  const [question, setQuestion] = useState(data.question || '');
  const [pollType, setPollType] = useState(data.pollType || 'multiple_choice');
  const [displayType, setDisplayType] = useState(data.displayType || 'bar_chart');
  const [options, setOptions] = useState(data.options || ['Option 1', 'Option 2']);

  return (
    <BaseBlockEditor {...props}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-linear-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-brand-primary" />
          </div>
          <h3 className="font-semibold text-brand-primary">Live Poll / Word Cloud</h3>
          <span className="ml-auto px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
            Social
          </span>
        </div>
        <div>
          <label
            htmlFor="poll-question"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Question/Prompt
          </label>
          <input
            id="poll-question"
            type="text"
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value);
              props.onUpdate({ ...props.block, content: { ...data, question: e.target.value } });
            }}
            placeholder="What&apos;s your opinion on..."
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-secondary"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="poll-type"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              Poll Type
            </label>
            <select
              id="poll-type"
              value={pollType}
              onChange={(e) => {
                setPollType(e.target.value);
                props.onUpdate({ ...props.block, content: { ...data, pollType: e.target.value } });
              }}
              className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-secondary"
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="word_cloud">Word Cloud (Open Text)</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="poll-display-type"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              Display
            </label>
            <select
              id="poll-display-type"
              value={displayType}
              onChange={(e) => {
                setDisplayType(e.target.value);
                props.onUpdate({
                  ...props.block,
                  content: { ...data, displayType: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-secondary"
            >
              <option value="bar_chart">Bar Chart</option>
              <option value="word_cloud">Word Cloud</option>
            </select>
          </div>
        </div>
        {pollType === 'multiple_choice' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="block text-sm font-medium text-brand-secondary">Options</span>
              <button
                type="button"
                onClick={() => {
                  const updated = [...options, `Option ${options.length + 1}`];
                  setOptions(updated);
                  props.onUpdate({ ...props.block, content: { ...data, options: updated } });
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {options.map((opt: string, idx: number) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const updated = [...options];
                      updated[idx] = e.target.value;
                      setOptions(updated);
                      props.onUpdate({ ...props.block, content: { ...data, options: updated } });
                    }}
                    className="flex-1 px-2 py-1 text-sm border border-brand-strong rounded"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = options.filter((_: string, i: number) => i !== idx);
                      setOptions(updated);
                      props.onUpdate({ ...props.block, content: { ...data, options: updated } });
                    }}
                    className="p-1 text-brand-muted hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-800">
          <p>
            Results update in real-time as learners submit responses. Collective results shown
            immediately after submission.
          </p>
        </div>
      </div>
    </BaseBlockEditor>
  );
};
