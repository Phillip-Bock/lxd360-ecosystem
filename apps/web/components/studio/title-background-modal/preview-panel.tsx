'use client';

import { Image as ImageIcon, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import type { TitleBackgroundSettings } from '@/types/outline';

interface PreviewPanelProps {
  settings: TitleBackgroundSettings;
  onSettingsChange: (settings: Partial<TitleBackgroundSettings>) => void;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  startPosX: number;
  startPosY: number;
}

export function PreviewPanel({ settings, onSettingsChange }: PreviewPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0,
  });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!settings.url) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragState({
        isDragging: true,
        startX: e.clientX,
        startY: e.clientY,
        startPosX: settings.positionX,
        startPosY: settings.positionY,
      });
    },
    [settings.url, settings.positionX, settings.positionY],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState.isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragState.startX;
      const deltaY = e.clientY - dragState.startY;

      // Convert pixel delta to percentage offset
      // Using smaller multiplier for finer control
      const sensitivity = 0.3;
      const newPosX = Math.max(
        -50,
        Math.min(50, dragState.startPosX + (deltaX / containerRect.width) * 100 * sensitivity),
      );
      const newPosY = Math.max(
        -50,
        Math.min(50, dragState.startPosY + (deltaY / containerRect.height) * 100 * sensitivity),
      );

      onSettingsChange({ positionX: newPosX, positionY: newPosY });
    },
    [dragState, onSettingsChange],
  );

  const handlePointerUp = useCallback(() => {
    setDragState((prev) => ({ ...prev, isDragging: false }));
  }, []);

  const handleResetPosition = useCallback(() => {
    onSettingsChange({ positionX: 0, positionY: 0, scale: 1 });
  }, [onSettingsChange]);

  const handleScaleChange = useCallback(
    (value: number[]) => {
      onSettingsChange({ scale: value[0] });
    },
    [onSettingsChange],
  );

  const hasMedia = settings.url && settings.type !== 'none';
  const isVideo = settings.type === 'video';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Preview & Position</Label>
        {hasMedia && (
          <Button variant="ghost" size="sm" onClick={handleResetPosition} className="h-7 text-xs">
            <RefreshCw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Preview container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={`
          relative aspect-video rounded-lg overflow-hidden
          border border-border bg-muted/50
          ${hasMedia ? 'cursor-move' : 'cursor-default'}
          ${dragState.isDragging ? 'cursor-grabbing' : ''}
        `}
      >
        {hasMedia ? (
          <>
            {isVideo ? (
              <video
                src={settings.url}
                autoPlay={settings.autoplay}
                loop={settings.loop}
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                style={{
                  objectPosition: `${50 + settings.positionX}% ${50 + settings.positionY}%`,
                  transform: `scale(${settings.scale})`,
                  filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%)`,
                }}
              />
            ) : (
              <Image
                src={settings.url}
                alt="Background preview"
                fill
                sizes="400px"
                className="pointer-events-none"
                style={{
                  objectFit: 'cover',
                  objectPosition: `${50 + settings.positionX}% ${50 + settings.positionY}%`,
                  transform: `scale(${settings.scale})`,
                  filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%)`,
                }}
              />
            )}

            {/* Overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundColor: '#000',
                opacity: settings.overlayOpacity / 100,
              }}
            />

            {/* Drag indicator when dragging */}
            {dragState.isDragging && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                <div className="bg-black/50 text-white text-xs px-2 py-1 rounded">
                  Drag to reposition
                </div>
              </div>
            )}

            {/* Center crosshair guide */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/50" />
              <div className="absolute top-1/2 left-0 right-0 h-px bg-white/50" />
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
            <p className="text-sm">No media selected</p>
            <p className="text-xs">Select a source from the tabs on the left</p>
          </div>
        )}
      </div>

      {/* Zoom/Scale slider */}
      {hasMedia && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Zoom</Label>
            <span className="text-xs text-muted-foreground">{settings.scale.toFixed(1)}x</span>
          </div>
          <Slider
            value={[settings.scale]}
            onValueChange={handleScaleChange}
            min={1}
            max={3}
            step={0.1}
          />
        </div>
      )}

      {/* Video controls */}
      {isVideo && (
        <div className="flex items-center gap-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoplay}
              onChange={(e) => onSettingsChange({ autoplay: e.target.checked })}
              className="rounded border-border"
            />
            <span className="text-muted-foreground">Autoplay</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.loop}
              onChange={(e) => onSettingsChange({ loop: e.target.checked })}
              className="rounded border-border"
            />
            <span className="text-muted-foreground">Loop</span>
          </label>
        </div>
      )}

      {/* Position indicator */}
      {hasMedia && (
        <p className="text-xs text-muted-foreground text-center">
          Position: {settings.positionX.toFixed(0)}%, {settings.positionY.toFixed(0)}%
        </p>
      )}
    </div>
  );
}
