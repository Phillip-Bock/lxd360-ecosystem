'use client';

import { AlertTriangle, CheckCircle, Code, Link } from 'lucide-react';
import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { safeInnerHtml } from '@/lib/sanitize';
import type { EmbedBlockContent } from '@/types/blocks';
import type { BlockComponentProps } from '../block-renderer';

const EMBED_PROVIDERS = [
  { pattern: /youtube\.com|youtu\.be/, name: 'YouTube', aspectRatio: '16:9' },
  { pattern: /vimeo\.com/, name: 'Vimeo', aspectRatio: '16:9' },
  { pattern: /twitter\.com|x\.com/, name: 'Twitter', aspectRatio: 'auto' },
  { pattern: /instagram\.com/, name: 'Instagram', aspectRatio: '1:1' },
  { pattern: /tiktok\.com/, name: 'TikTok', aspectRatio: '9:16' },
  { pattern: /spotify\.com/, name: 'Spotify', aspectRatio: 'auto' },
  { pattern: /soundcloud\.com/, name: 'SoundCloud', aspectRatio: 'auto' },
  { pattern: /codepen\.io/, name: 'CodePen', aspectRatio: '16:9' },
  { pattern: /codesandbox\.io/, name: 'CodeSandbox', aspectRatio: '16:9' },
  { pattern: /figma\.com/, name: 'Figma', aspectRatio: '16:9' },
  { pattern: /loom\.com/, name: 'Loom', aspectRatio: '16:9' },
  { pattern: /miro\.com/, name: 'Miro', aspectRatio: '16:9' },
  { pattern: /notion\.so/, name: 'Notion', aspectRatio: 'auto' },
  { pattern: /docs\.google\.com/, name: 'Google Docs', aspectRatio: '4:3' },
  { pattern: /slides\.google\.com/, name: 'Google Slides', aspectRatio: '16:9' },
  { pattern: /forms\.google\.com/, name: 'Google Forms', aspectRatio: 'auto' },
  { pattern: /airtable\.com/, name: 'Airtable', aspectRatio: 'auto' },
  { pattern: /typeform\.com/, name: 'Typeform', aspectRatio: 'auto' },
];

const ASPECT_RATIOS = {
  '16:9': 'aspect-video',
  '4:3': 'aspect-[4/3]',
  '1:1': 'aspect-square',
  '9:16': 'aspect-[9/16]',
  auto: '',
};

/**
 * EmbedBlock - External content embeds
 */
export function EmbedBlock({
  block,
  isEditing,
  onUpdate,
}: BlockComponentProps<EmbedBlockContent>): React.JSX.Element {
  const content = block.content as EmbedBlockContent;
  const [urlInput, setUrlInput] = useState('');
  const [embedCodeInput, setEmbedCodeInput] = useState('');
  const [embedType, setEmbedType] = useState<'url' | 'code'>('url');
  const [error, setError] = useState<string | null>(null);

  const aspectRatio = content.aspectRatio || '16:9';

  // Detect provider from URL
  const detectedProvider = useMemo(() => {
    if (!content.embedCode) return null;
    return EMBED_PROVIDERS.find((p) => p.pattern.test(content.embedCode));
  }, [content.embedCode]);

  // Convert URL to embed URL
  const getEmbedUrl = useCallback((url: string): string | null => {
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s?]+)/);
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // Spotify
    const spotifyMatch = url.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([^?]+)/);
    if (spotifyMatch) {
      return `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}`;
    }

    // CodePen
    const codepenMatch = url.match(/codepen\.io\/([^/]+)\/pen\/([^/?]+)/);
    if (codepenMatch) {
      return `https://codepen.io/${codepenMatch[1]}/embed/${codepenMatch[2]}?default-tab=result`;
    }

    // Figma
    const figmaMatch = url.match(/figma\.com\/(file|proto)\/([^/?]+)/);
    if (figmaMatch) {
      return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}`;
    }

    // Loom
    const loomMatch = url.match(/loom\.com\/share\/([^/?]+)/);
    if (loomMatch) {
      return `https://www.loom.com/embed/${loomMatch[1]}`;
    }

    // Return original if no special handling needed
    return url;
  }, []);

  // Extract iframe src from embed code
  const extractIframeSrc = useCallback((code: string): string | null => {
    const match = code.match(/src=["']([^"']+)["']/);
    return match ? match[1] : null;
  }, []);

  // Handle URL submission
  const handleUrlSubmit = useCallback(() => {
    if (!urlInput) return;

    try {
      const embedUrl = getEmbedUrl(urlInput);
      if (embedUrl) {
        const provider = EMBED_PROVIDERS.find((p) => p.pattern.test(urlInput));
        onUpdate({
          content: {
            ...content,
            embedCode: embedUrl,
            type: 'iframe',
            provider: provider?.name,
            aspectRatio: provider?.aspectRatio || '16:9',
          },
        });
        setUrlInput('');
        setError(null);
      } else {
        setError('Invalid URL format');
      }
    } catch {
      setError('Failed to process URL');
    }
  }, [urlInput, content, getEmbedUrl, onUpdate]);

  // Handle embed code submission
  const handleCodeSubmit = useCallback(() => {
    if (!embedCodeInput) return;

    const iframeSrc = extractIframeSrc(embedCodeInput);
    if (iframeSrc) {
      const provider = EMBED_PROVIDERS.find((p) => p.pattern.test(iframeSrc));
      onUpdate({
        content: {
          ...content,
          embedCode: iframeSrc,
          type: 'iframe',
          provider: provider?.name,
        },
      });
    } else {
      // Store the full embed code
      onUpdate({
        content: {
          ...content,
          embedCode: embedCodeInput,
          type: 'custom',
        },
      });
    }
    setEmbedCodeInput('');
    setError(null);
  }, [embedCodeInput, content, extractIframeSrc, onUpdate]);

  // Preview mode
  if (!isEditing && content.embedCode) {
    const aspectClass = ASPECT_RATIOS[aspectRatio as keyof typeof ASPECT_RATIOS] || '';

    if (content.type === 'custom') {
      // Note: Custom embed codes need iframe support - using 'rich' mode sanitizes
      // but may strip iframes. For trusted admin content, consider allowing iframes.
      return (
        <div
          className={`bg-card rounded-lg overflow-hidden ${aspectClass || 'min-h-[300px]'}`}
          {...safeInnerHtml(content.embedCode, 'rich')}
        />
      );
    }

    return (
      <div
        className={`relative ${aspectClass || 'min-h-[300px]'} bg-studio-bg rounded-lg overflow-hidden`}
      >
        <iframe
          src={content.embedCode}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen={content.allowFullscreen !== false}
          loading="lazy"
          title="Embedded content"
        />
      </div>
    );
  }

  // Edit mode
  return (
    <div className="space-y-4">
      {/* Type selector */}
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => setEmbedType('url')}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors
            ${
              embedType === 'url'
                ? 'bg-studio-accent text-brand-primary'
                : 'bg-studio-surface/30 text-studio-text-muted hover:text-brand-primary'
            }
          `}
        >
          <Link className="w-3.5 h-3.5" />
          URL
        </button>
        <button
          type="button"
          onClick={() => setEmbedType('code')}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors
            ${
              embedType === 'code'
                ? 'bg-studio-accent text-brand-primary'
                : 'bg-studio-surface/30 text-studio-text-muted hover:text-brand-primary'
            }
          `}
        >
          <Code className="w-3.5 h-3.5" />
          Embed Code
        </button>
      </div>

      {/* Input area */}
      {embedType === 'url' ? (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
            placeholder="Paste URL from YouTube, Vimeo, Figma, etc..."
            className="flex-1 px-3 py-2 bg-studio-bg border border-studio-surface/50 rounded-lg text-brand-primary placeholder:text-studio-text-muted outline-hidden focus:border-studio-accent/50"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="px-4 py-2 bg-studio-accent hover:bg-studio-accent/80 text-brand-primary rounded-lg transition-colors"
          >
            Embed
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={embedCodeInput}
            onChange={(e) => setEmbedCodeInput(e.target.value)}
            placeholder="Paste embed code (e.g., <iframe src=...>)"
            className="w-full px-3 py-2 bg-studio-bg border border-studio-surface/50 rounded-lg text-brand-primary placeholder:text-studio-text-muted outline-hidden focus:border-studio-accent/50 font-mono text-sm"
            rows={4}
          />
          <button
            type="button"
            onClick={handleCodeSubmit}
            className="px-4 py-2 bg-studio-accent hover:bg-studio-accent/80 text-brand-primary rounded-lg transition-colors"
          >
            Add Embed
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-brand-error text-sm">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Supported providers */}
      <div className="text-xs text-studio-text-muted">
        Supported: YouTube, Vimeo, Spotify, CodePen, Figma, Loom, Google Docs/Slides/Forms, and more
      </div>

      {/* Current embed preview */}
      {content.embedCode && (
        <div className="space-y-3">
          {/* Provider info */}
          {detectedProvider && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-brand-success" />
              <span className="text-studio-text">
                Detected: <span className="text-brand-primary">{detectedProvider.name}</span>
              </span>
            </div>
          )}

          {/* Preview */}
          <div
            className={`relative ${ASPECT_RATIOS[aspectRatio as keyof typeof ASPECT_RATIOS] || 'min-h-[300px]'} bg-studio-bg rounded-lg overflow-hidden border border-studio-surface/30`}
          >
            {content.type === 'custom' ? (
              <div className="w-full h-full" {...safeInnerHtml(content.embedCode, 'rich')} />
            ) : (
              <iframe
                src={content.embedCode}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                title="Embedded content preview"
              />
            )}
          </div>

          {/* Aspect ratio selector */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-studio-text-muted">Aspect ratio:</span>
            <div className="flex gap-1">
              {Object.keys(ASPECT_RATIOS).map((ratio) => (
                <button
                  type="button"
                  key={ratio}
                  onClick={() => onUpdate({ content: { ...content, aspectRatio: ratio } })}
                  className={`
                    px-2.5 py-1 text-xs rounded-lg transition-colors
                    ${
                      aspectRatio === ratio
                        ? 'bg-studio-accent text-brand-primary'
                        : 'bg-studio-surface/30 text-studio-text-muted hover:text-brand-primary'
                    }
                  `}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Remove button */}
          <button
            type="button"
            onClick={() => onUpdate({ content: { ...content, embedCode: '', type: 'iframe' } })}
            className="text-sm text-brand-error hover:text-red-300 transition-colors"
          >
            Remove embed
          </button>
        </div>
      )}
    </div>
  );
}

export default EmbedBlock;
