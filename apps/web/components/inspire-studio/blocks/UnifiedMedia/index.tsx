'use client';

import {
  FileText,
  Image as ImageIcon,
  Maximize2,
  Music,
  Pause,
  Play,
  Video,
  Volume2,
  VolumeX,
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { BaseBlockProps, UnifiedMediaConfig, UnifiedMediaContent } from '../types';
import { getDefaultUnifiedMediaConfig } from '../types';

// ============================================================================
// COMPONENT
// ============================================================================

interface UnifiedMediaBlockProps extends BaseBlockProps {
  content?: UnifiedMediaContent;
  config?: UnifiedMediaConfig;
}

/**
 * UnifiedMediaBlock - Multi-format media container
 *
 * Features:
 * - Image, video, audio, document, embed support
 * - Aspect ratio control
 * - Lightbox mode
 * - Lazy loading
 */
export function UnifiedMediaBlock({
  content,
  config = getDefaultUnifiedMediaConfig(),
  isEditing = false,
  onContentChange,
  onConfigChange,
  a11yConfig,
  className,
}: UnifiedMediaBlockProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(config.muted ?? false);
  const [showLightbox, setShowLightbox] = useState(false);

  const handleConfigChange = useCallback(
    (key: keyof UnifiedMediaConfig, value: unknown) => {
      onConfigChange?.({ ...config, [key]: value });
    },
    [config, onConfigChange],
  );

  const handleContentChange = useCallback(
    (updates: Partial<UnifiedMediaContent>) => {
      onContentChange?.({ ...content, ...updates });
    },
    [content, onContentChange],
  );

  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const aspectRatioClass = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-4/3',
    '1:1': 'aspect-square',
    '9:16': 'aspect-[9/16]',
    auto: '',
  }[config.aspectRatio];

  // Render editing mode
  if (isEditing) {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Config Panel */}
        <div className="grid grid-cols-2 gap-4">
          {/* Media Type */}
          <div className="space-y-2">
            <Label className="text-xs">Media Type</Label>
            <Select
              value={content?.mediaType ?? 'image'}
              onValueChange={(v) =>
                handleContentChange({ mediaType: v as UnifiedMediaContent['mediaType'] })
              }
            >
              <SelectTrigger className="h-8 text-xs bg-lxd-dark-bg border-lxd-dark-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-lxd-dark-surface border-lxd-dark-border">
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="embed">Embed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-2">
            <Label className="text-xs">Aspect Ratio</Label>
            <Select
              value={config.aspectRatio}
              onValueChange={(v) =>
                handleConfigChange('aspectRatio', v as UnifiedMediaConfig['aspectRatio'])
              }
            >
              <SelectTrigger className="h-8 text-xs bg-lxd-dark-bg border-lxd-dark-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-lxd-dark-surface border-lxd-dark-border">
                <SelectItem value="16:9">16:9</SelectItem>
                <SelectItem value="4:3">4:3</SelectItem>
                <SelectItem value="1:1">1:1</SelectItem>
                <SelectItem value="9:16">9:16</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Source URL */}
        <div className="space-y-2">
          <Label className="text-xs">Source URL</Label>
          <Input
            value={content?.src ?? ''}
            onChange={(e) => handleContentChange({ src: e.target.value })}
            placeholder="Enter media URL..."
            className="h-8 text-xs bg-lxd-dark-bg border-lxd-dark-border"
          />
        </div>

        {/* Title & Description */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">Title</Label>
            <Input
              value={content?.title ?? ''}
              onChange={(e) => handleContentChange({ title: e.target.value })}
              placeholder="Media title..."
              className="h-8 text-xs bg-lxd-dark-bg border-lxd-dark-border"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Description</Label>
            <Input
              value={content?.description ?? ''}
              onChange={(e) => handleContentChange({ description: e.target.value })}
              placeholder="Description..."
              className="h-8 text-xs bg-lxd-dark-bg border-lxd-dark-border"
            />
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-wrap gap-4">
          {(content?.mediaType === 'video' || content?.mediaType === 'audio') && (
            <>
              <div className="flex items-center gap-2">
                <Switch
                  checked={config.autoplay ?? false}
                  onCheckedChange={(v) => handleConfigChange('autoplay', v)}
                />
                <Label className="text-xs">Autoplay</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={config.loop ?? false}
                  onCheckedChange={(v) => handleConfigChange('loop', v)}
                />
                <Label className="text-xs">Loop</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={config.muted ?? false}
                  onCheckedChange={(v) => handleConfigChange('muted', v)}
                />
                <Label className="text-xs">Muted</Label>
              </div>
            </>
          )}
          <div className="flex items-center gap-2">
            <Switch
              checked={config.showCaption ?? false}
              onCheckedChange={(v) => handleConfigChange('showCaption', v)}
            />
            <Label className="text-xs">Show Caption</Label>
          </div>
          {content?.mediaType === 'image' && (
            <div className="flex items-center gap-2">
              <Switch
                checked={config.lightbox ?? false}
                onCheckedChange={(v) => handleConfigChange('lightbox', v)}
              />
              <Label className="text-xs">Lightbox</Label>
            </div>
          )}
        </div>

        {/* Preview */}
        {content?.src && (
          <div
            className={cn('relative rounded-lg overflow-hidden bg-lxd-dark-bg', aspectRatioClass)}
          >
            {renderMedia()}
          </div>
        )}
      </div>
    );
  }

  // Render display mode
  function renderMedia() {
    if (!content?.src) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <MediaIcon type={content?.mediaType ?? 'image'} className="h-12 w-12 opacity-30" />
        </div>
      );
    }

    switch (content.mediaType) {
      case 'image':
        return (
          <div className="relative w-full h-full">
            <Image
              src={content.src}
              alt={a11yConfig?.altText ?? content.title ?? 'Media'}
              fill
              className={cn(`object-${config.fit}`, config.lightbox && 'cursor-zoom-in')}
              onClick={() => config.lightbox && setShowLightbox(true)}
            />
          </div>
        );

      case 'video':
        return (
          <div className="relative w-full h-full group">
            <video
              ref={videoRef}
              src={content.src}
              poster={content.thumbnailSrc}
              autoPlay={config.autoplay}
              loop={config.loop}
              muted={config.muted}
              controls={config.controls}
              className={cn(`w-full h-full object-${config.fit}`)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            {!config.controls && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="h-12 w-12 rounded-full"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
              </div>
            )}
          </div>
        );

      case 'audio':
        return (
          <div className="flex items-center justify-center h-full p-4">
            <div className="flex items-center gap-4 w-full max-w-md">
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="h-10 w-10 rounded-full shrink-0"
                onClick={togglePlayPause}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <div className="flex-1 h-2 bg-lxd-dark-surface rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-lxd-purple rounded-full" />
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 shrink-0"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
            <audio
              ref={videoRef as unknown as React.RefObject<HTMLAudioElement>}
              src={content.src}
              autoPlay={config.autoplay}
              loop={config.loop}
              muted={config.muted}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <MediaIcon type={content.mediaType} className="h-12 w-12 text-muted-foreground" />
          </div>
        );
    }
  }

  return (
    <div className={cn('relative', className)}>
      <div className={cn('relative rounded-lg overflow-hidden bg-lxd-dark-bg', aspectRatioClass)}>
        {renderMedia()}
      </div>

      {/* Caption */}
      {config.showCaption && content?.title && (
        <p className="mt-2 text-sm text-muted-foreground text-center">{content.title}</p>
      )}

      {/* Lightbox */}
      {showLightbox && content?.src && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setShowLightbox(false)}
          onKeyDown={(e) => e.key === 'Escape' && setShowLightbox(false)}
          role="dialog"
          aria-modal="true"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white"
            onClick={() => setShowLightbox(false)}
          >
            <Maximize2 className="h-6 w-6" />
          </Button>
          <Image
            src={content.src}
            alt={a11yConfig?.altText ?? content.title ?? 'Media'}
            width={1200}
            height={800}
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />
        </div>
      )}
    </div>
  );
}

function MediaIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case 'video':
      return <Video className={className} />;
    case 'audio':
      return <Music className={className} />;
    case 'document':
      return <FileText className={className} />;
    default:
      return <ImageIcon className={className} />;
  }
}

export default UnifiedMediaBlock;
