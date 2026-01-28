import { Key, Lock } from 'lucide-react';
import { useState } from 'react';
import { BaseBlockEditor, type BaseBlockEditorProps } from './base-block-editor';

interface EscapeRoomData {
  title?: string;
  unlockCode?: string;
  timeLimitMinutes?: number;
}

export const EscapeRoomBlockEditor = (props: BaseBlockEditorProps): React.JSX.Element => {
  const data = (props.block?.content as EscapeRoomData) || {};
  const [title, setTitle] = useState(data.title || '');
  const [unlockCode, setUnlockCode] = useState(data.unlockCode || '');
  const [timeLimit, setTimeLimit] = useState(data.timeLimitMinutes || 30);

  return (
    <BaseBlockEditor {...props}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-linear-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <Lock className="w-5 h-5 text-brand-primary" />
          </div>
          <h3 className="font-semibold text-brand-primary">Escape Room</h3>
        </div>
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs">
          <p className="font-medium mb-1">Puzzle-based content unlocking</p>
          <p>Solve puzzles to obtain unlock code and access locked lesson content</p>
        </div>
        <div>
          <label
            htmlFor="escape-room-title"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Room Title
          </label>
          <input
            id="escape-room-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              props.onUpdate({
                ...props.block,
                content: { ...data, title: e.target.value } as Record<string, unknown>,
              });
            }}
            placeholder="e.g., Chemistry Lab Mystery"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-secondary"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="escape-room-unlock-code"
              className="block text-sm font-medium text-brand-secondary mb-2 flex items-center gap-2"
            >
              <Key className="w-4 h-4" />
              Unlock Code
            </label>
            <input
              id="escape-room-unlock-code"
              type="text"
              value={unlockCode}
              onChange={(e) => {
                setUnlockCode(e.target.value);
                props.onUpdate({
                  ...props.block,
                  content: { ...data, unlockCode: e.target.value } as Record<string, unknown>,
                });
              }}
              placeholder="BIOLOGY123"
              className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-secondary"
            />
          </div>
          <div>
            <label
              htmlFor="escape-room-time-limit"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              Time Limit (min)
            </label>
            <input
              id="escape-room-time-limit"
              type="number"
              value={timeLimit}
              onChange={(e) => {
                setTimeLimit(parseInt(e.target.value, 10));
                props.onUpdate({
                  ...props.block,
                  content: { ...data, timeLimitMinutes: parseInt(e.target.value, 10) } as Record<
                    string,
                    unknown
                  >,
                });
              }}
              className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-secondary"
            />
          </div>
        </div>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs">
          <p className="font-medium mb-1">How it works:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Learners solve puzzles in sequence</li>
            <li>Each correct answer reveals part of unlock code</li>
            <li>Enter complete code to access locked content</li>
          </ol>
        </div>
      </div>
    </BaseBlockEditor>
  );
};
