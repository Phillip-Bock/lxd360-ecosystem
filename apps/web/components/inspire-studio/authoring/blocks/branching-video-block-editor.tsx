import { GitBranch, PlayCircle, Plus } from 'lucide-react';
import { useState } from 'react';
import { BaseBlockEditor, type BaseBlockEditorProps } from './base-block-editor';

interface DecisionPoint {
  id: number | string;
  timestamp: number;
  prompt: string;
  choices: unknown[];
}

interface BranchingVideoContent {
  title?: string;
  initialVideoUrl?: string;
  decisionPoints?: DecisionPoint[];
}

export const BranchingVideoBlockEditor = (props: BaseBlockEditorProps): React.JSX.Element => {
  const data = (props.block?.content as BranchingVideoContent) || {};
  const [title, setTitle] = useState(data.title || '');
  const [initialVideoUrl, setInitialVideoUrl] = useState(data.initialVideoUrl || '');
  const [decisionPoints, setDecisionPoints] = useState<DecisionPoint[]>(data.decisionPoints || []);

  return (
    <BaseBlockEditor {...props}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-linear-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
            <PlayCircle className="w-5 h-5 text-brand-primary" />
          </div>
          <h3 className="font-semibold text-brand-primary">Branching Video Scenario</h3>
        </div>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <p className="font-medium mb-1">Interactive video with choice-driven paths</p>
          <ul className="text-xs space-y-1 text-blue-800">
            <li>• Video pauses at decision points</li>
            <li>• Learner choices determine next segment</li>
            <li>• Multiple outcomes based on decisions</li>
            <li>• Track decision paths and outcomes</li>
          </ul>
        </div>
        <div>
          <label
            htmlFor="branching-video-scenario-title"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Scenario Title
          </label>
          <input
            id="branching-video-scenario-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              props.onUpdate({ ...props.block, content: { ...data, title: e.target.value } });
            }}
            placeholder="e.g., Customer Service Decision Scenario"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium text-brand-secondary mb-2"
            htmlFor="initial-video-url"
          >
            Initial Video URL
          </label>
          <input
            id="initial-video-url"
            type="text"
            value={initialVideoUrl}
            onChange={(e) => {
              setInitialVideoUrl(e.target.value);
              props.onUpdate({
                ...props.block,
                content: { ...data, initialVideoUrl: e.target.value },
              });
            }}
            placeholder="https://example.com/video.mp4"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="block text-sm font-medium text-brand-secondary">Decision Points</span>
            <button
              type="button"
              onClick={() => {
                const newPoint = { id: Date.now(), timestamp: 0, prompt: '', choices: [] };
                setDecisionPoints([...decisionPoints, newPoint]);
                props.onUpdate({
                  ...props.block,
                  content: { ...data, decisionPoints: [...decisionPoints, newPoint] },
                });
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded"
            >
              <Plus className="w-3 h-3" />
              Add Point
            </button>
          </div>
          <div className="space-y-2">
            {decisionPoints.map((point: DecisionPoint) => (
              <div
                key={point.id}
                className="p-3 bg-brand-page border border-brand-default rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <GitBranch className="w-4 h-4 text-brand-muted" />
                  <input
                    type="number"
                    placeholder="Time (sec)"
                    className="w-24 px-2 py-1 text-sm border border-brand-strong rounded"
                  />
                  <input
                    type="text"
                    placeholder="Decision prompt"
                    className="flex-1 px-2 py-1 text-sm border border-brand-strong rounded"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BaseBlockEditor>
  );
};
