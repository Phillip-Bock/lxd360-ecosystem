import {
  Aperture,
  CheckCircle,
  Eye,
  Info,
  Link2,
  MapPin,
  Sparkles,
  Volume2,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import type { ARPortalBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface ARPortalBlockEditorProps {
  block: ARPortalBlock;
  onChange: (content: ARPortalBlock['content']) => void;
}

export const ARPortalBlockEditor = ({
  block,
  onChange,
}: ARPortalBlockEditorProps): React.JSX.Element => {
  const [showPreview, setShowPreview] = useState(false);
  const [urlValid, setUrlValid] = useState<boolean | null>(null);

  const validateUrl = (url: string): void => {
    if (!url) {
      setUrlValid(null);
      return;
    }
    try {
      const urlObj = new URL(url);
      const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(urlObj.pathname);
      const isVideo = /\.(mp4|webm|ogg)$/i.test(urlObj.pathname);
      setUrlValid(isImage || isVideo);
    } catch {
      // Silently ignore - invalid URL format
      setUrlValid(false);
    }
  };

  const handleUrlChange = (url: string): void => {
    onChange({ ...block.content, environmentUrl: url });
    validateUrl(url);
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label
          htmlFor="ar-portal-title"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          <Aperture aria-hidden="true" className="w-4 h-4 inline mr-1" />
          AR Portal Title
        </label>
        <input
          id="ar-portal-title"
          type="text"
          value={block.content.title}
          onChange={(e) => onChange({ ...block.content, title: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="e.g., Enter Ancient Rome, Virtual Museum Tour"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="ar-portal-description"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          Description
        </label>
        <textarea
          id="ar-portal-description"
          value={block.content.description || ''}
          onChange={(e) => onChange({ ...block.content, description: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="Describe what learners will experience..."
        />
      </div>

      {/* Environment URL */}
      <div>
        <label
          htmlFor="ar-portal-environment-url"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          <Link2 aria-hidden="true" className="w-4 h-4 inline mr-1" />
          360° Environment URL
        </label>
        <div className="relative">
          <input
            id="ar-portal-environment-url"
            type="url"
            value={block.content.environmentUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent ${
              urlValid === false
                ? 'border-red-300'
                : urlValid === true
                  ? 'border-green-300'
                  : 'border-brand-strong'
            }`}
            placeholder="https://example.com/360-environment.jpg"
          />
          {urlValid !== null && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {urlValid ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
          )}
        </div>
        <p className="text-xs text-brand-muted mt-1">
          Supported formats: 360° images (.jpg, .png, .webp) or 360° videos (.mp4, .webm)
        </p>
        {urlValid === false && (
          <p className="text-xs text-red-600 mt-1">⚠️ Invalid URL or unsupported format</p>
        )}
      </div>

      {/* Environment Type */}
      <fieldset>
        <legend className="block text-sm font-medium text-brand-secondary mb-2">
          Environment Type
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'image', label: '360° Image', emoji: '🖼️' },
            { value: 'video', label: '360° Video', emoji: '🎬' },
          ].map((type) => (
            <button
              type="button"
              key={type.value}
              onClick={() => onChange({ ...block.content, environmentType: type.value })}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                (block.content.environmentType || 'image') === type.value
                  ? 'bg-brand-primary text-brand-primary border-brand-primary'
                  : 'bg-brand-surface text-brand-secondary border-brand-strong hover:border-blue-300'
              }`}
            >
              <div className="text-lg">{type.emoji}</div>
              <div className="text-xs">{type.label}</div>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Portal Trigger */}
      <div>
        <label
          htmlFor="ar-portal-trigger"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          Portal Activation
        </label>
        <select
          id="ar-portal-trigger"
          value={block.content.trigger || 'click'}
          onChange={(e) => onChange({ ...block.content, trigger: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
        >
          <option value="click">Click to enter</option>
          <option value="auto">Automatic on load</option>
          <option value="gaze">Gaze activation (VR)</option>
        </select>
      </div>

      {/* Transition Effect */}
      <div>
        <label
          htmlFor="ar-portal-transition"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          <Sparkles aria-hidden="true" className="w-4 h-4 inline mr-1" />
          Transition Effect
        </label>
        <select
          id="ar-portal-transition"
          value={block.content.transitionEffect || 'fade'}
          onChange={(e) => onChange({ ...block.content, transitionEffect: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
        >
          <option value="fade">Fade</option>
          <option value="zoom">Zoom In</option>
          <option value="warp">Warp Effect</option>
          <option value="portal">Portal Ripple</option>
          <option value="none">Instant</option>
        </select>
      </div>

      {/* Audio Settings */}
      <div>
        <label
          htmlFor="ar-portal-audio-url"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          <Volume2 aria-hidden="true" className="w-4 h-4 inline mr-1" />
          Ambient Audio URL (optional)
        </label>
        <input
          id="ar-portal-audio-url"
          type="url"
          value={block.content.audioUrl || ''}
          onChange={(e) => onChange({ ...block.content, audioUrl: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="https://example.com/ambient-sound.mp3"
        />
        <p className="text-xs text-brand-muted mt-1">
          Background audio that plays when inside the AR environment
        </p>
      </div>

      {/* Duration Limit */}
      <div>
        <label
          htmlFor="ar-portal-duration"
          className="block text-sm font-medium text-brand-secondary mb-2"
        >
          Experience Duration (optional)
        </label>
        <div className="flex gap-2 items-center">
          <input
            id="ar-portal-duration"
            type="number"
            value={block.content.durationSeconds || 0}
            onChange={(e) =>
              onChange({ ...block.content, durationSeconds: parseInt(e.target.value, 10) || 0 })
            }
            min="0"
            className="w-32 px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            placeholder="0"
          />
          <span className="text-sm text-brand-secondary">seconds (0 = unlimited)</span>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="border-t border-brand-default pt-4 space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={block.content.allowNavigation !== false}
            onChange={(e) => onChange({ ...block.content, allowNavigation: e.target.checked })}
            className="w-4 h-4 text-brand-blue rounded"
          />
          <span className="text-sm text-brand-secondary">Allow 360° navigation (look around)</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={block.content.showExitButton !== false}
            onChange={(e) => onChange({ ...block.content, showExitButton: e.target.checked })}
            className="w-4 h-4 text-brand-blue rounded"
          />
          <span className="text-sm text-brand-secondary">Show exit button (allow early exit)</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={block.content.enableHotspots || false}
            onChange={(e) => onChange({ ...block.content, enableHotspots: e.target.checked })}
            className="w-4 h-4 text-brand-blue rounded"
          />
          <span className="text-sm text-brand-secondary flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Enable interactive hotspots in environment
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={block.content.gyroscopeControl || false}
            onChange={(e) => onChange({ ...block.content, gyroscopeControl: e.target.checked })}
            className="w-4 h-4 text-brand-blue rounded"
          />
          <span className="text-sm text-brand-secondary">Enable gyroscope control (mobile/VR)</span>
        </label>
      </div>

      {/* Preview */}
      {block.content.environmentUrl && urlValid && (
        <div className="border-t border-brand-default pt-4">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 text-sm font-medium text-brand-blue hover:text-blue-700 mb-3"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>

          {showPreview && (
            <div className="bg-linear-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Aperture aria-hidden="true" className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">AR Portal Preview</span>
              </div>
              <div className="bg-brand-surface rounded-lg overflow-hidden border border-brand-default">
                {block.content.environmentType === 'video' ? (
                  <video
                    src={block.content.environmentUrl}
                    className="w-full aspect-video object-cover"
                    controls
                    muted
                    loop
                    onError={(e) => {
                      e.currentTarget.poster =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23f3f4f6" width="800" height="600"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E360° Video Preview%3C/text%3E%3C/svg%3E';
                    }}
                  />
                ) : (
                  <div className="relative w-full aspect-video">
                    <Image
                      src={
                        block.content.environmentUrl ||
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23f3f4f6" width="800" height="600"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E360° Image Preview%3C/text%3E%3C/svg%3E'
                      }
                      alt="360° Environment Preview"
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23f3f4f6" width="800" height="600"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E360° Image Preview%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="mt-3 flex gap-2 text-xs text-purple-700">
                <Info className="w-4 h-4 shrink-0" />
                <p>
                  In the actual AR experience, learners will be able to look around in 360° using
                  their device or VR headset.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Helper Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>AR Portal tip:</strong> Use high-quality 360° images or videos. Test on mobile
          devices for best experience. Popular sources: Ricoh Theta cameras, Google Street View, or
          specialized 360° content creation tools.
        </p>
      </div>
    </div>
  );
};
