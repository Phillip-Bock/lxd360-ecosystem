import { Download, FileAudio, Link2, Music, Play, Settings, Volume2 } from 'lucide-react';
import { useState } from 'react';
import type { AudioBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface AudioBlockEditorProps {
  block: AudioBlock;
  onChange: (content: AudioBlock['content']) => void;
}

export const AudioBlockEditor = ({ block, onChange }: AudioBlockEditorProps): React.JSX.Element => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [duration, setDuration] = useState<string>('');

  const handleAudioLoad = (e: React.SyntheticEvent<HTMLAudioElement>): void => {
    const audio = e.currentTarget;
    const mins = Math.floor(audio.duration / 60);
    const secs = Math.floor(audio.duration % 60);
    setDuration(`${mins}:${secs.toString().padStart(2, '0')}`);
  };

  const detectAudioFormat = (url: string): string => {
    if (url.endsWith('.mp3')) return 'MP3';
    if (url.endsWith('.wav')) return 'WAV';
    if (url.endsWith('.ogg')) return 'OGG';
    if (url.endsWith('.m4a')) return 'M4A';
    return 'Audio';
  };

  // Use url or src property, with fallback to empty string
  const audioUrl = block.content.url || block.content.src || '';
  const audioFormat = detectAudioFormat(audioUrl);

  return (
    <div className="space-y-4">
      {/* Audio URL Input */}
      <div>
        <label
          htmlFor="audio-url-input"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          <Link2 className="w-4 h-4 inline mr-1" />
          Audio URL
        </label>
        <input
          id="audio-url-input"
          type="url"
          value={audioUrl}
          onChange={(e) => onChange({ ...block.content, url: e.target.value, src: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
          placeholder="https://example.com/audio.mp3"
        />
        {audioUrl && (
          <p className="text-xs text-green-600 mt-1">
            ✓ Format: {audioFormat} {duration && `• Duration: ${duration}`}
          </p>
        )}
      </div>

      {/* Audio Player Preview */}
      {audioUrl && (
        <div className="bg-linear-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Music className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Audio Preview</span>
          </div>
          <audio controls className="w-full" onLoadedMetadata={handleAudioLoad}>
            <source src={audioUrl} />
            <track kind="captions" srcLang="en" label="English captions" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {/* Title */}
      <div>
        <label
          htmlFor="audio-title-input"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          Audio Title (optional)
        </label>
        <input
          id="audio-title-input"
          type="text"
          value={block.content.title || ''}
          onChange={(e) => onChange({ ...block.content, title: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
          placeholder="Introduction Audio"
        />
      </div>

      {/* Caption */}
      <div>
        <label
          htmlFor="audio-caption-input"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          Caption (optional)
        </label>
        <textarea
          id="audio-caption-input"
          value={block.content.caption || ''}
          onChange={(e) => onChange({ ...block.content, caption: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
          placeholder="A brief description of the audio content..."
        />
      </div>

      {/* Advanced Settings */}
      <div className="border-t border-brand-default pt-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-medium text-brand-secondary hover:text-purple-600 mb-3"
        >
          <Settings className="w-4 h-4" />
          Audio Settings
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
                className="w-4 h-4 text-purple-600 rounded focus:ring-brand-secondary"
              />
              <Play className="w-4 h-4 text-brand-muted" />
              <span className="text-sm text-brand-secondary">Autoplay on load</span>
            </label>

            {/* Loop */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={block.content.loop || false}
                onChange={(e) => onChange({ ...block.content, loop: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded focus:ring-brand-secondary"
              />
              <svg
                className="w-4 h-4 text-brand-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                role="img"
                aria-label="Loop icon"
              >
                <title>Loop</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="text-sm text-brand-secondary">Loop audio</span>
            </label>

            {/* Show Controls */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={block.content.controls !== false}
                onChange={(e) => onChange({ ...block.content, controls: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded focus:ring-brand-secondary"
              />
              <Volume2 className="w-4 h-4 text-brand-muted" />
              <span className="text-sm text-brand-secondary">Show player controls</span>
            </label>

            {/* Download Allowed */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={block.content.allowDownload || false}
                onChange={(e) => onChange({ ...block.content, allowDownload: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded focus:ring-brand-secondary"
              />
              <Download className="w-4 h-4 text-brand-muted" />
              <span className="text-sm text-brand-secondary">Allow download</span>
            </label>

            {/* Transcript URL */}
            <div>
              <label
                htmlFor="audio-transcript-url-input"
                className="flex items-center gap-2 text-sm text-brand-secondary mb-1"
              >
                <FileAudio className="w-4 h-4 text-brand-muted" />
                Transcript URL (optional)
              </label>
              <input
                id="audio-transcript-url-input"
                type="url"
                value={block.content.transcriptUrl || ''}
                onChange={(e) => onChange({ ...block.content, transcriptUrl: e.target.value })}
                className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
                placeholder="https://example.com/transcript.txt"
              />
              <p className="text-xs text-brand-muted mt-1">
                Link to text transcript for accessibility
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Helper Text */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
        <p className="text-xs text-purple-800">
          <strong>Supported formats:</strong> MP3, WAV, OGG, M4A • Recommended: MP3 for best
          compatibility
        </p>
      </div>
    </div>
  );
};
