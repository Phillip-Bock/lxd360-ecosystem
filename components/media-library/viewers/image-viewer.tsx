'use client';

import {
  Copy,
  Download,
  Info,
  Maximize2,
  Minimize2,
  Move,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import NextImage from 'next/image';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { ViewerContainer } from './viewer-container';
import { ToolbarButton, ToolbarGroup, ToolbarSeparator, ViewerToolbar } from './viewer-toolbar';

export interface ImageViewerProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  blurhash?: string;
  onClose?: () => void;
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.25;

export function ImageViewer({ src, alt, width, height, onClose }: ImageViewerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const imageRef = React.useRef<HTMLImageElement>(null);

  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showInfo, setShowInfo] = React.useState(false);
  const [imageDimensions, setImageDimensions] = React.useState({
    width: width || 0,
    height: height || 0,
  });
  const [fileSize, setFileSize] = React.useState<string | null>(null);

  // Load image and get dimensions
  React.useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      setIsLoading(false);
    };
    img.onerror = () => {
      setError('Failed to load image');
      setIsLoading(false);
    };
    img.src = src;

    // Try to get file size
    fetch(src, { method: 'HEAD' })
      .then((res) => {
        const size = res.headers.get('content-length');
        if (size) {
          const bytes = parseInt(size, 10);
          if (bytes < 1024) {
            setFileSize(`${bytes} B`);
          } else if (bytes < 1024 * 1024) {
            setFileSize(`${(bytes / 1024).toFixed(1)} KB`);
          } else {
            setFileSize(`${(bytes / (1024 * 1024)).toFixed(1)} MB`);
          }
        }
      })
      .catch(() => {
        // Silently ignore - failed to get file size from headers
      });
  }, [src]);

  // Handle zoom
  const handleZoomIn = React.useCallback(() => {
    setZoom((z) => Math.min(z + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const handleZoomOut = React.useCallback(() => {
    setZoom((z) => Math.max(z - ZOOM_STEP, MIN_ZOOM));
  }, []);

  const handleFitToScreen = React.useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleActualSize = React.useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current.getBoundingClientRect();
    const scaleX = imageDimensions.width / container.width;
    const scaleY = imageDimensions.height / container.height;
    setZoom(Math.max(scaleX, scaleY));
    setPosition({ x: 0, y: 0 });
  }, [imageDimensions]);

  const handleReset = React.useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Mouse wheel zoom
  const handleWheel = React.useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setZoom((z) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z + delta)));
  }, []);

  // Pan handling
  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      if (zoom <= 1) return;
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    },
    [zoom, position],
  );

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart],
  );

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  // Double-click toggle
  const handleDoubleClick = React.useCallback(() => {
    if (zoom === 1) {
      handleActualSize();
    } else {
      handleFitToScreen();
    }
  }, [zoom, handleActualSize, handleFitToScreen]);

  // Fullscreen toggle
  const toggleFullscreen = React.useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Silently ignore - fullscreen not supported or user declined
    }
  }, []);

  // Download image
  const handleDownload = React.useCallback(async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = alt || 'image';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Silently ignore - download failed, fallback to opening in new tab
      window.open(src, '_blank');
    }
  }, [src, alt]);

  // Copy to clipboard
  const handleCopy = React.useCallback(async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    } catch {
      // Silently ignore - clipboard API not supported or user declined
    }
  }, [src]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case '0':
          handleFitToScreen();
          break;
        case '1':
          handleActualSize();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen();
          } else if (onClose) {
            onClose();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleZoomIn,
    handleZoomOut,
    handleFitToScreen,
    handleActualSize,
    toggleFullscreen,
    isFullscreen,
    onClose,
  ]);

  // Listen for fullscreen change
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <ViewerContainer
      isLoading={isLoading}
      error={error}
      onRetry={() => {
        setError(null);
        setIsLoading(true);
      }}
      fullscreen={isFullscreen}
      className="min-h-[400px]"
    >
      <div
        ref={containerRef}
        role="application"
        aria-label="Image viewer with pan and zoom controls"
        className={cn(
          'relative w-full h-full flex items-center justify-center overflow-hidden',
          zoom > 1 ? 'cursor-grab' : 'cursor-default',
          isDragging && 'cursor-grabbing',
          isFullscreen && 'bg-black',
        )}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      >
        {/* Image */}
        <NextImage
          ref={imageRef}
          src={src}
          alt={alt}
          width={imageDimensions.width || 1920}
          height={imageDimensions.height || 1080}
          className="max-w-full max-h-full object-contain select-none"
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          draggable={false}
          unoptimized
        />

        {/* Info overlay */}
        {showInfo && (
          <div className="absolute top-3 left-3 bg-background/95 backdrop-blur-xs border rounded-lg p-3 text-sm space-y-1">
            <div className="font-medium">{alt}</div>
            <div className="text-muted-foreground">
              {imageDimensions.width} x {imageDimensions.height}px
            </div>
            {fileSize && <div className="text-muted-foreground">{fileSize}</div>}
            <div className="text-muted-foreground">Zoom: {Math.round(zoom * 100)}%</div>
          </div>
        )}

        {/* Close button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/95 backdrop-blur-xs border flex items-center justify-center hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}

        {/* Toolbar */}
        <ViewerToolbar>
          <ToolbarGroup>
            <ToolbarButton
              icon={<ZoomOut className="h-4 w-4" />}
              label="Zoom out"
              shortcut="-"
              onClick={handleZoomOut}
              disabled={zoom <= MIN_ZOOM}
            />
            <span className="px-2 text-sm tabular-nums min-w-[4rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <ToolbarButton
              icon={<ZoomIn className="h-4 w-4" />}
              label="Zoom in"
              shortcut="+"
              onClick={handleZoomIn}
              disabled={zoom >= MAX_ZOOM}
            />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <ToolbarButton
              icon={<Minimize2 className="h-4 w-4" />}
              label="Fit to screen"
              shortcut="0"
              onClick={handleFitToScreen}
            />
            <ToolbarButton
              icon={<Move className="h-4 w-4" />}
              label="Actual size"
              shortcut="1"
              onClick={handleActualSize}
            />
            <ToolbarButton
              icon={<RotateCcw className="h-4 w-4" />}
              label="Reset"
              onClick={handleReset}
            />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <ToolbarButton
              icon={<Info className="h-4 w-4" />}
              label="Image info"
              onClick={() => setShowInfo(!showInfo)}
              active={showInfo}
            />
            <ToolbarButton
              icon={<Copy className="h-4 w-4" />}
              label="Copy to clipboard"
              onClick={handleCopy}
            />
            <ToolbarButton
              icon={<Download className="h-4 w-4" />}
              label="Download"
              onClick={handleDownload}
            />
            <ToolbarButton
              icon={<Maximize2 className="h-4 w-4" />}
              label="Fullscreen"
              shortcut="F"
              onClick={toggleFullscreen}
            />
          </ToolbarGroup>
        </ViewerToolbar>
      </div>
    </ViewerContainer>
  );
}
