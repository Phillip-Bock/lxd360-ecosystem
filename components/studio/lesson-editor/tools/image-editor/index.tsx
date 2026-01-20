'use client';

import {
  Crop,
  Download,
  FlipHorizontal,
  FlipVertical,
  ImageIcon,
  Library,
  MousePointer2,
  RotateCw,
  Save,
  Sparkles,
  Type,
  X,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CropTool } from './crop-tool';
import { type FilterSettings, FilterTool, getFilterCSS } from './filter-tool';
import { type Hotspot, HotspotTool } from './hotspot-tool';
import { ImageLibrary, ImageUpload } from './image-library';
import { type TextOverlay, TextOverlayTool } from './text-overlay';

interface ImageEditorProps {
  open: boolean;
  onClose: () => void;
  imageUrl?: string;
  onSave?: (editedImageUrl: string, settings: ImageSettings) => void;
}

interface ImageSettings {
  crop: { x: number; y: number; width: number; height: number };
  filters: FilterSettings;
  textOverlays: TextOverlay[];
  hotspots: Hotspot[];
  rotation: number;
  flipX: boolean;
  flipY: boolean;
}

const DEFAULT_FILTERS: FilterSettings = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  hueRotate: 0,
};

/**
 * ImageEditor - Full image editing panel with crop, filter, text, and hotspot tools
 */
export function ImageEditor({
  open,
  onClose,
  imageUrl: initialImageUrl,
  onSave,
}: ImageEditorProps) {
  const [imageUrl, setImageUrl] = useState(initialImageUrl || '');
  const [imageSize, setImageSize] = useState({ width: 800, height: 600 });

  // Crop state
  const [cropSettings, setCropSettings] = useState({
    x: 0,
    y: 0,
    width: imageSize.width,
    height: imageSize.height,
    aspectRatio: null as number | null,
  });

  // Filter state
  const [filters, setFilters] = useState<FilterSettings>(DEFAULT_FILTERS);

  // Text overlay state
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);

  // Hotspot state
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const [isDrawingHotspot, setIsDrawingHotspot] = useState(false);

  // Transform state
  const [rotation, setRotation] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);

  const handleImageLoad = useCallback((width: number, height: number) => {
    setImageSize({ width, height });
    setCropSettings({
      x: 0,
      y: 0,
      width,
      height,
      aspectRatio: null,
    });
  }, []);

  const handleFileUpload = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file);
      setImageUrl(url);

      // Get image dimensions
      const img = new window.Image();
      img.onload = () => {
        handleImageLoad(img.width, img.height);
      };
      img.src = url;
    },
    [handleImageLoad],
  );

  const handleSelectFromLibrary = useCallback(
    (image: { url: string; width: number; height: number }) => {
      setImageUrl(image.url);
      handleImageLoad(image.width, image.height);
    },
    [handleImageLoad],
  );

  const handleSave = useCallback(() => {
    if (!imageUrl) return;

    onSave?.(imageUrl, {
      crop: {
        x: cropSettings.x,
        y: cropSettings.y,
        width: cropSettings.width,
        height: cropSettings.height,
      },
      filters,
      textOverlays,
      hotspots,
      rotation,
      flipX,
      flipY,
    });
    onClose();
  }, [
    imageUrl,
    cropSettings,
    filters,
    textOverlays,
    hotspots,
    rotation,
    flipX,
    flipY,
    onSave,
    onClose,
  ]);

  const handleReset = useCallback(() => {
    setCropSettings({
      x: 0,
      y: 0,
      width: imageSize.width,
      height: imageSize.height,
      aspectRatio: null,
    });
    setFilters(DEFAULT_FILTERS);
    setTextOverlays([]);
    setHotspots([]);
    setRotation(0);
    setFlipX(false);
    setFlipY(false);
  }, [imageSize]);

  const getTransformStyle = () => {
    const transforms = [];
    if (rotation !== 0) transforms.push(`rotate(${rotation}deg)`);
    if (flipX) transforms.push('scaleX(-1)');
    if (flipY) transforms.push('scaleY(-1)');
    return transforms.join(' ');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl bg-[#1a1a2e] border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            Image Editor
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-[1fr,320px] gap-4">
          {/* Image Preview */}
          <div className="space-y-4">
            {imageUrl ? (
              <div className="relative bg-zinc-900 rounded-lg overflow-hidden flex items-center justify-center p-4 min-h-100">
                <div
                  className="relative max-w-full max-h-100"
                  style={{
                    transform: getTransformStyle(),
                    filter: getFilterCSS(filters),
                  }}
                >
                  {/* Placeholder gradient since we don't have real images */}
                  <div className="w-100 h-75 bg-linear-to-br from-primary/30 to-purple-500/30 rounded-xs" />

                  {/* Text Overlays */}
                  {textOverlays.map((overlay) => (
                    <button
                      type="button"
                      key={overlay.id}
                      className={`absolute cursor-move border-0 ${
                        selectedTextId === overlay.id ? 'ring-2 ring-primary' : ''
                      }`}
                      style={{
                        left: `${overlay.x}%`,
                        top: `${overlay.y}%`,
                        transform: 'translate(-50%, -50%)',
                        fontSize: overlay.fontSize,
                        fontFamily: overlay.fontFamily,
                        fontWeight: overlay.fontWeight,
                        fontStyle: overlay.fontStyle,
                        textAlign: overlay.textAlign,
                        color: overlay.color,
                        backgroundColor: overlay.backgroundColor,
                        opacity: overlay.opacity / 100,
                        padding: overlay.backgroundColor !== 'transparent' ? '4px 8px' : 0,
                      }}
                      onClick={() => setSelectedTextId(overlay.id)}
                      aria-label={`Select text overlay: ${overlay.text}`}
                    >
                      {overlay.text}
                    </button>
                  ))}

                  {/* Hotspots */}
                  {hotspots.map((hotspot) => (
                    <button
                      type="button"
                      key={hotspot.id}
                      className={`absolute cursor-pointer transition-transform hover:scale-105 p-0 ${
                        hotspot.shape === 'circle' ? 'rounded-full' : 'rounded-xs'
                      } ${selectedHotspotId === hotspot.id ? 'ring-2 ring-white' : ''}`}
                      style={{
                        left: `${hotspot.x}%`,
                        top: `${hotspot.y}%`,
                        width: `${hotspot.width}%`,
                        height: `${hotspot.height}%`,
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: `${hotspot.color}33`,
                        border: `2px solid ${hotspot.color}`,
                      }}
                      onClick={() => setSelectedHotspotId(hotspot.id)}
                      aria-label={`Select hotspot: ${hotspot.label || hotspot.id}`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <ImageUpload onUpload={handleFileUpload} />
            )}

            {/* Transform Tools */}
            {imageUrl && (
              <div className="flex items-center gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                >
                  <RotateCw className="h-4 w-4 mr-1" />
                  Rotate
                </Button>
                <Button
                  variant={flipX ? 'default' : 'outline'}
                  size="sm"
                  className={!flipX ? 'border-white/10' : ''}
                  onClick={() => setFlipX(!flipX)}
                >
                  <FlipHorizontal className="h-4 w-4 mr-1" />
                  Flip H
                </Button>
                <Button
                  variant={flipY ? 'default' : 'outline'}
                  size="sm"
                  className={!flipY ? 'border-white/10' : ''}
                  onClick={() => setFlipY(!flipY)}
                >
                  <FlipVertical className="h-4 w-4 mr-1" />
                  Flip V
                </Button>
              </div>
            )}
          </div>

          {/* Tools Panel */}
          <div className="border-l border-white/10 pl-4">
            <Tabs defaultValue="crop" className="w-full">
              <TabsList className="w-full bg-[#0d0d14] border border-white/10">
                <TabsTrigger value="crop" className="flex-1">
                  <Crop className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="filter" className="flex-1">
                  <Sparkles className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="text" className="flex-1">
                  <Type className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="hotspot" className="flex-1">
                  <MousePointer2 className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="library" className="flex-1">
                  <Library className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="crop" className="mt-4">
                <CropTool
                  imageWidth={imageSize.width}
                  imageHeight={imageSize.height}
                  cropSettings={cropSettings}
                  onCropChange={setCropSettings}
                  onApply={() => {
                    // Apply crop logic
                  }}
                  onReset={() => {
                    setCropSettings({
                      x: 0,
                      y: 0,
                      width: imageSize.width,
                      height: imageSize.height,
                      aspectRatio: null,
                    });
                  }}
                />
              </TabsContent>

              <TabsContent value="filter" className="mt-4">
                <FilterTool
                  filters={filters}
                  onFilterChange={setFilters}
                  onReset={() => setFilters(DEFAULT_FILTERS)}
                />
              </TabsContent>

              <TabsContent value="text" className="mt-4">
                <TextOverlayTool
                  overlays={textOverlays}
                  selectedId={selectedTextId}
                  onOverlaysChange={setTextOverlays}
                  onSelect={setSelectedTextId}
                />
              </TabsContent>

              <TabsContent value="hotspot" className="mt-4">
                <HotspotTool
                  hotspots={hotspots}
                  selectedId={selectedHotspotId}
                  onHotspotsChange={setHotspots}
                  onSelect={setSelectedHotspotId}
                  isDrawing={isDrawingHotspot}
                  onDrawingChange={setIsDrawingHotspot}
                />
              </TabsContent>

              <TabsContent value="library" className="mt-4">
                <ImageLibrary onSelectImage={handleSelectFromLibrary} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t border-white/10">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-white/10" onClick={handleReset}>
              Reset All
            </Button>
            {imageUrl && (
              <Button variant="outline" size="sm" className="border-white/10">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!imageUrl}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { CropPreview, CropTool } from './crop-tool';
export type { FilterSettings } from './filter-tool';
export { FilterTool, getFilterCSS } from './filter-tool';
export type { Hotspot } from './hotspot-tool';
export { HotspotOverlay, HotspotTool } from './hotspot-tool';
export { ImageLibrary, ImageUpload } from './image-library';
export type { TextOverlay } from './text-overlay';
export { TextOverlayTool } from './text-overlay';
