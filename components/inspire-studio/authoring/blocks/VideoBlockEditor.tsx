import { Clock, FileText, Link2, Play, Repeat, Settings, Volume2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { VideoAspectRatio, VideoBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface VideoBlockEditorProps {
  block: VideoBlock;
  onChange: (content: VideoBlock['content']) => void;
}

type VideoProvider = 'youtube' | 'vimeo' | 'direct' | 'unknown';

export const VideoBlockEditor = ({ block, onChange }: VideoBlockEditorProps): React.JSX.Element => {
  const [provider, setProvider] = useState<VideoProvider>('unknown');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Detect video provider from URL
  useEffect(() => {
    const url = block.content.url;
    if (!url || typeof url !== 'string') {
      setProvider('unknown');
      return;
    }

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      setProvider('youtube');
    } else if (url.includes('vimeo.com')) {
      setProvider('vimeo');
    } else if (url.match(/\.(mp4|webm|ogg)$/i)) {
      setProvider('direct');
    } else {
      setProvider('unknown');
    }
  }, [block.content.url]);

  // Extract YouTube video ID for thumbnail
  const getYouTubeThumbnail = (url: string): string | null => {
    const regex =
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url.match(regex);
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
  };

  // Extract Vimeo video ID for thumbnail
  const getVimeoThumbnail = (url: string): string | null => {
    const regex = /vimeo\.com\/(\d+)/;
    const match = url.match(regex);
    // Note: Vimeo thumbnails require API call, placeholder for now
    return match ? `https://vimeo.com/${match[1]}` : null;
  };

  const getThumbnailUrl = (): string | null => {
    const url = block.content.url;
    if (!url || typeof url !== 'string') {
      return null;
    }
    if (provider === 'youtube') {
      return getYouTubeThumbnail(url);
    } else if (provider === 'vimeo') {
      return getVimeoThumbnail(url);
    }
    return null;
  };

  const thumbnailUrl = getThumbnailUrl();

  return (
    <div className="space-y-4">
      {/* Video URL Input */}
      <div>
        <label
          htmlFor="video-url-input"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          <Link2 className="w-4 h-4 inline mr-1" />
          Video URL
        </label>
        <input
          id="video-url-input"
          type="url"
          value={typeof block.content.url === 'string' ? block.content.url : ''}
          onChange={(e) => onChange({ ...block.content, url: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
        />
        {provider !== 'unknown' && (
          <p className="text-xs text-green-600 mt-1">
            ✓ Detected:{' '}
            {provider === 'youtube' ? 'YouTube' : provider === 'vimeo' ? 'Vimeo' : 'Direct Video'}
          </p>
        )}
      </div>

      {/* Thumbnail Preview */}
      {thumbnailUrl && provider === 'youtube' && (
        <div>
          <span className="block text-sm font-medium text-brand-secondary mb-2">Preview</span>
          <div className="relative aspect-video bg-brand-surface rounded-lg overflow-hidden">
            <Image src={thumbnailUrl} alt="Video thumbnail" fill className="object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Play className="w-16 h-16 text-brand-primary opacity-80" />
            </div>
          </div>
        </div>
      )}

      {/* Video Title */}
      <div>
        <label
          htmlFor="video-title-input"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          Video Title (optional)
        </label>
        <input
          id="video-title-input"
          type="text"
          value={block.content.title || ''}
          onChange={(e) => onChange({ ...block.content, title: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="Introduction to Course"
        />
      </div>

      {/* Aspect Ratio */}
      <fieldset className="border-0 p-0 m-0">
        <legend className="block text-sm font-medium text-brand-secondary mb-2">
          Aspect Ratio
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: '16:9', label: 'Widescreen (16:9)' },
            { value: '4:3', label: 'Standard (4:3)' },
            { value: '1:1', label: 'Square (1:1)' },
          ].map((ratio) => (
            <button
              type="button"
              key={ratio.value}
              onClick={() =>
                onChange({ ...block.content, aspectRatio: ratio.value as VideoAspectRatio })
              }
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                (block.content.aspectRatio || '16:9') === ratio.value
                  ? 'bg-brand-primary text-brand-primary border-brand-primary'
                  : 'bg-brand-surface text-brand-secondary border-brand-strong hover:border-blue-300'
              }`}
            >
              {ratio.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Playback Controls */}
      <div className="border-t border-brand-default pt-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-medium text-brand-secondary hover:text-brand-blue mb-3"
        >
          <Settings className="w-4 h-4" />
          Playback Settings
          <span className="text-xs text-brand-muted">({showAdvanced ? 'hide' : 'show'})</span>
        </button>

        {showAdvanced && (
          <div className="space-y-3 pl-6">
            {/* Autoplay */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={block.content.autoplay || false}
                onChange={(e) => onChange({ ...block.content, autoplay: e.target.checked })}
                className="w-4 h-4 text-brand-blue rounded focus:ring-brand-primary"
              />
              <Play className="w-4 h-4 text-brand-muted" />
              <span className="text-sm text-brand-secondary">Autoplay on load</span>
            </label>

            {/* Muted */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={block.content.muted || false}
                onChange={(e) => onChange({ ...block.content, muted: e.target.checked })}
                className="w-4 h-4 text-brand-blue rounded focus:ring-brand-primary"
              />
              <Volume2 className="w-4 h-4 text-brand-muted" />
              <span className="text-sm text-brand-secondary">Start muted</span>
            </label>

            {/* Loop */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={block.content.loop || false}
                onChange={(e) => onChange({ ...block.content, loop: e.target.checked })}
                className="w-4 h-4 text-brand-blue rounded focus:ring-brand-primary"
              />
              <Repeat className="w-4 h-4 text-brand-muted" />
              <span className="text-sm text-brand-secondary">Loop video</span>
            </label>

            {/* Show Controls */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={block.content.controls !== false}
                onChange={(e) => onChange({ ...block.content, controls: e.target.checked })}
                className="w-4 h-4 text-brand-blue rounded focus:ring-brand-primary"
              />
              <Settings className="w-4 h-4 text-brand-muted" />
              <span className="text-sm text-brand-secondary">Show player controls</span>
            </label>

            {/* Start Time */}
            <div>
              <label
                htmlFor="video-start-time-input"
                className="flex items-center gap-2 text-sm text-brand-secondary mb-1"
              >
                <Clock className="w-4 h-4 text-brand-muted" />
                Start time (seconds)
              </label>
              <input
                id="video-start-time-input"
                type="number"
                value={block.content.startTime || 0}
                onChange={(e) =>
                  onChange({ ...block.content, startTime: parseInt(e.target.value, 10) || 0 })
                }
                min="0"
                className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                placeholder="0"
              />
            </div>

            {/* Captions URL */}
            <div>
              <label
                htmlFor="video-captions-url-input"
                className="flex items-center gap-2 text-sm text-brand-secondary mb-1"
              >
                <FileText className="w-4 h-4 text-brand-muted" />
                Captions/Subtitles URL (optional)
              </label>
              <input
                id="video-captions-url-input"
                type="url"
                value={block.content.captionsUrl || ''}
                onChange={(e) => onChange({ ...block.content, captionsUrl: e.target.value })}
                className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                placeholder="https://example.com/captions.vtt"
              />
              <p className="text-xs text-brand-muted mt-1">
                WebVTT format (.vtt) recommended for accessibility
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Helper Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>Supported platforms:</strong> YouTube, Vimeo, and direct video URLs (.mp4, .webm,
          .ogg)
        </p>
      </div>
    </div>
  );
};
