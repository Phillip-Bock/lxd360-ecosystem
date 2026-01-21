import { Glasses, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { BaseBlockEditor, type BaseBlockEditorProps } from './BaseBlockEditor';

interface VREnvironmentData {
  title?: string;
  environmentUrl?: string;
  mediaType?: string;
  audioUrl?: string;
}

export const VREnvironmentBlockEditor = (props: BaseBlockEditorProps): React.JSX.Element => {
  const data = (props.block?.content as VREnvironmentData) || {};
  const [title, setTitle] = useState(data.title || '');
  const [environmentUrl, setEnvironmentUrl] = useState(data.environmentUrl || '');
  const [mediaType, setMediaType] = useState(data.mediaType || '360_image');
  const [audioUrl, setAudioUrl] = useState(data.audioUrl || '');

  return (
    <BaseBlockEditor {...props}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-linear-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Glasses className="w-5 h-5 text-brand-primary" />
          </div>
          <h3 className="font-semibold text-brand-primary">VR 360° Environment</h3>
          <span className="ml-auto px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
            VR
          </span>
        </div>
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-800">
          <p className="font-medium mb-1">Device Requirements:</p>
          <p className="text-xs">
            VR Headset (Quest, Vive, etc.) or Mobile with gyroscope for 360° viewing
          </p>
        </div>
        <div>
          <label
            htmlFor="vr-environment-title"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Environment Title
          </label>
          <input
            id="vr-environment-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              props.onUpdate({
                ...props.block,
                content: { ...data, title: e.target.value } as Record<string, unknown>,
              });
            }}
            placeholder="e.g., Tour of Mars Surface"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label
            htmlFor="vr-media-type"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Media Type
          </label>
          <select
            id="vr-media-type"
            value={mediaType}
            onChange={(e) => {
              setMediaType(e.target.value);
              props.onUpdate({
                ...props.block,
                content: { ...data, mediaType: e.target.value } as Record<string, unknown>,
              });
            }}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="360_image">360° Image</option>
            <option value="360_video">360° Video</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="vr-media-url"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            360° Media URL
          </label>
          <input
            id="vr-media-url"
            type="text"
            value={environmentUrl}
            onChange={(e) => {
              setEnvironmentUrl(e.target.value);
              props.onUpdate({
                ...props.block,
                content: { ...data, environmentUrl: e.target.value } as Record<string, unknown>,
              });
            }}
            placeholder="https://example.com/360-environment.jpg"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <p className="mt-1 text-xs text-brand-muted">
            Minimum 4K resolution recommended (4096×2048)
          </p>
        </div>
        <div>
          <label
            htmlFor="vr-audio-url"
            className="block text-sm font-medium text-brand-secondary mb-2 flex items-center gap-2"
          >
            <Volume2 className="w-4 h-4" aria-hidden="true" />
            Ambient Audio (Optional)
          </label>
          <input
            id="vr-audio-url"
            type="text"
            value={audioUrl}
            onChange={(e) => {
              setAudioUrl(e.target.value);
              props.onUpdate({
                ...props.block,
                content: { ...data, audioUrl: e.target.value } as Record<string, unknown>,
              });
            }}
            placeholder="Background audio URL"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </BaseBlockEditor>
  );
};
