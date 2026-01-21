import { PenTool, StickyNote, Type } from 'lucide-react';
import { useState } from 'react';
import { BaseBlockEditor, type BaseBlockEditorProps } from './BaseBlockEditor';

interface SharedWhiteboardData {
  title?: string;
  maxParticipants?: number;
  allowDrawing?: boolean;
  allowText?: boolean;
  allowStickyNotes?: boolean;
}

export const SharedWhiteboardBlockEditor = (props: BaseBlockEditorProps): React.JSX.Element => {
  const data = (props.block?.content as SharedWhiteboardData) || {};
  const [title, setTitle] = useState(data.title || '');
  const [maxParticipants, setMaxParticipants] = useState(data.maxParticipants || 50);
  const [allowDrawing, setAllowDrawing] = useState(data.allowDrawing ?? true);
  const [allowText, setAllowText] = useState(data.allowText ?? true);
  const [allowStickyNotes, setAllowStickyNotes] = useState(data.allowStickyNotes ?? true);

  return (
    <BaseBlockEditor {...props}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-linear-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
            <PenTool className="w-5 h-5 text-brand-primary" />
          </div>
          <h3 className="font-semibold text-brand-primary">Shared Whiteboard</h3>
          <span className="ml-auto px-2 py-1 bg-cyan-100 text-cyan-700 text-xs rounded-full font-medium">
            Social
          </span>
        </div>
        <div>
          <label
            htmlFor="whiteboard-title"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Whiteboard Title
          </label>
          <input
            id="whiteboard-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              props.onUpdate({
                ...props.block,
                content: { ...data, title: e.target.value } as Record<string, unknown>,
              });
            }}
            placeholder="e.g., Brainstorm Session"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div>
          <label
            htmlFor="whiteboard-max-participants"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Max Participants
          </label>
          <input
            id="whiteboard-max-participants"
            type="number"
            value={maxParticipants}
            onChange={(e) => {
              setMaxParticipants(parseInt(e.target.value, 10));
              props.onUpdate({
                ...props.block,
                content: { ...data, maxParticipants: parseInt(e.target.value, 10) } as Record<
                  string,
                  unknown
                >,
              });
            }}
            min="1"
            max="100"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div>
          <span className="block text-sm font-medium text-brand-secondary mb-2">Enabled Tools</span>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-2 border border-brand-default rounded-lg hover:bg-brand-page cursor-pointer">
              <input
                type="checkbox"
                checked={allowDrawing}
                onChange={(e) => {
                  setAllowDrawing(e.target.checked);
                  props.onUpdate({
                    ...props.block,
                    content: { ...data, allowDrawing: e.target.checked } as Record<string, unknown>,
                  });
                }}
                className="w-4 h-4 text-cyan-600 rounded"
              />
              <PenTool className="w-4 h-4 text-brand-secondary" />
              <span className="text-sm text-brand-primary">Drawing Tools</span>
            </label>
            <label className="flex items-center gap-3 p-2 border border-brand-default rounded-lg hover:bg-brand-page cursor-pointer">
              <input
                type="checkbox"
                checked={allowText}
                onChange={(e) => {
                  setAllowText(e.target.checked);
                  props.onUpdate({
                    ...props.block,
                    content: { ...data, allowText: e.target.checked } as Record<string, unknown>,
                  });
                }}
                className="w-4 h-4 text-cyan-600 rounded"
              />
              <Type className="w-4 h-4 text-brand-secondary" />
              <span className="text-sm text-brand-primary">Text Addition</span>
            </label>
            <label className="flex items-center gap-3 p-2 border border-brand-default rounded-lg hover:bg-brand-page cursor-pointer">
              <input
                type="checkbox"
                checked={allowStickyNotes}
                onChange={(e) => {
                  setAllowStickyNotes(e.target.checked);
                  props.onUpdate({
                    ...props.block,
                    content: { ...data, allowStickyNotes: e.target.checked } as Record<
                      string,
                      unknown
                    >,
                  });
                }}
                className="w-4 h-4 text-cyan-600 rounded"
              />
              <StickyNote className="w-4 h-4 text-brand-secondary" />
              <span className="text-sm text-brand-primary">Sticky Notes</span>
            </label>
          </div>
        </div>
        <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg text-xs text-cyan-800">
          <p>
            Real-time collaborative workspace. All changes sync instantly across connected learners.
          </p>
        </div>
      </div>
    </BaseBlockEditor>
  );
};
