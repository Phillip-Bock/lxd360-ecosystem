'use client';

import {
  Contrast,
  Eye,
  EyeOff,
  Grid3X3,
  Maximize2,
  Minimize2,
  Monitor,
  Palette,
  RefreshCw,
  RotateCcw,
  Ruler,
  Smartphone,
  SunMoon,
  Tablet,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  type ColorBlindnessType,
  DEFAULT_DEVICE_PRESETS,
  type DevicePreset,
  type PreviewSettings,
} from '@/types/studio/qa';

interface DevicePreviewProps {
  lessonId: string;
  previewUrl?: string;
  onDeviceChange?: (device: DevicePreset) => void;
  onSettingsChange?: (settings: PreviewSettings) => void;
}

/**
 * DevicePreview - Responsive preview tool with accessibility simulations
 */
export function DevicePreview({
  previewUrl,
  onDeviceChange,
  onSettingsChange,
}: DevicePreviewProps) {
  const [device, setDevice] = useState<DevicePreset>(DEFAULT_DEVICE_PRESETS[0]);
  const [settings, setSettings] = useState<PreviewSettings>({
    device: DEFAULT_DEVICE_PRESETS[0],
    mode: 'desktop',
    showRulers: false,
    showGrid: false,
    simulateColorBlindness: undefined,
    simulateReducedMotion: false,
    simulateDarkMode: false,
    simulateHighContrast: false,
    zoomLevel: 100,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const updateSettings = useCallback(
    (updates: Partial<PreviewSettings>) => {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      onSettingsChange?.(newSettings);
    },
    [settings, onSettingsChange],
  );

  const handleDeviceChange = useCallback(
    (deviceId: string) => {
      const newDevice = DEFAULT_DEVICE_PRESETS.find((d) => d.id === deviceId);
      if (newDevice) {
        setDevice(newDevice);
        updateSettings({ device: newDevice });
        onDeviceChange?.(newDevice);
      }
    },
    [onDeviceChange, updateSettings],
  );

  const toggleOrientation = useCallback(() => {
    const newDevice: DevicePreset = {
      ...device,
      width: device.height,
      height: device.width,
      orientation: device.orientation === 'portrait' ? 'landscape' : 'portrait',
    };
    setDevice(newDevice);
    updateSettings({ device: newDevice });
    onDeviceChange?.(newDevice);
  }, [device, onDeviceChange, updateSettings]);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const colorBlindnessOptions: { value: ColorBlindnessType; label: string }[] = [
    { value: 'protanopia', label: 'Protanopia (Red-Blind)' },
    { value: 'deuteranopia', label: 'Deuteranopia (Green-Blind)' },
    { value: 'tritanopia', label: 'Tritanopia (Blue-Blind)' },
    { value: 'achromatopsia', label: 'Achromatopsia (Total)' },
    { value: 'protanomaly', label: 'Protanomaly (Red-Weak)' },
    { value: 'deuteranomaly', label: 'Deuteranomaly (Green-Weak)' },
    { value: 'tritanomaly', label: 'Tritanomaly (Blue-Weak)' },
  ];

  const previewWidth = Math.min((device.width * settings.zoomLevel) / 100, 1920);
  const previewHeight = Math.min((device.height * settings.zoomLevel) / 100, 1080);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Toolbar */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Device Selection */}
            <div className="flex items-center gap-2">
              <Select value={device.id} onValueChange={handleDeviceChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select device" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="heading-desktop" disabled>
                    Desktop
                  </SelectItem>
                  {DEFAULT_DEVICE_PRESETS.filter((d) => d.type === 'desktop').map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(d.type)}
                        {d.name}
                      </div>
                    </SelectItem>
                  ))}
                  <SelectItem value="heading-tablet" disabled>
                    Tablet
                  </SelectItem>
                  {DEFAULT_DEVICE_PRESETS.filter((d) => d.type === 'tablet').map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(d.type)}
                        {d.name}
                      </div>
                    </SelectItem>
                  ))}
                  <SelectItem value="heading-mobile" disabled>
                    Mobile
                  </SelectItem>
                  {DEFAULT_DEVICE_PRESETS.filter((d) => d.type === 'mobile').map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(d.type)}
                        {d.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" onClick={toggleOrientation}>
                <RotateCcw className="h-4 w-4" />
              </Button>

              <Badge variant="outline">
                {device.width}x{device.height} @{device.pixelRatio}x
              </Badge>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateSettings({ zoomLevel: Math.max(25, settings.zoomLevel - 25) })}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <div className="w-24">
                <Slider
                  value={[settings.zoomLevel]}
                  min={25}
                  max={150}
                  step={25}
                  onValueChange={([value]) => updateSettings({ zoomLevel: value })}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  updateSettings({ zoomLevel: Math.min(150, settings.zoomLevel + 25) })
                }
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground w-12">{settings.zoomLevel}%</span>
            </div>

            {/* View Options */}
            <div className="flex items-center gap-2">
              <Button
                variant={settings.showRulers ? 'secondary' : 'outline'}
                size="icon"
                onClick={() => updateSettings({ showRulers: !settings.showRulers })}
              >
                <span title="Toggle Rulers">
                  <Ruler className="h-4 w-4" />
                </span>
              </Button>
              <Button
                variant={settings.showGrid ? 'secondary' : 'outline'}
                size="icon"
                onClick={() => updateSettings({ showGrid: !settings.showGrid })}
              >
                <span title="Toggle Grid">
                  <Grid3X3 className="h-4 w-4" />
                </span>
              </Button>
              <Button variant="outline" size="icon" onClick={() => setIsFullscreen(!isFullscreen)}>
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Simulations */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="dark-mode"
                  checked={settings.simulateDarkMode}
                  onCheckedChange={(checked) => updateSettings({ simulateDarkMode: checked })}
                />
                <Label htmlFor="dark-mode" className="flex items-center gap-1">
                  <SunMoon className="h-4 w-4" />
                  Dark Mode
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="high-contrast"
                  checked={settings.simulateHighContrast}
                  onCheckedChange={(checked) => updateSettings({ simulateHighContrast: checked })}
                />
                <Label htmlFor="high-contrast" className="flex items-center gap-1">
                  <Contrast className="h-4 w-4" />
                  High Contrast
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="reduced-motion"
                  checked={settings.simulateReducedMotion}
                  onCheckedChange={(checked) => updateSettings({ simulateReducedMotion: checked })}
                />
                <Label htmlFor="reduced-motion" className="flex items-center gap-1">
                  <RefreshCw className="h-4 w-4" />
                  Reduced Motion
                </Label>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={settings.simulateColorBlindness ? 'secondary' : 'outline'}>
                  <Palette className="mr-2 h-4 w-4" />
                  Color Blindness
                  {settings.simulateColorBlindness && (
                    <Badge variant="outline" className="ml-2">
                      Active
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Simulate Color Vision</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => updateSettings({ simulateColorBlindness: undefined })}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Normal Vision
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {colorBlindnessOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => updateSettings({ simulateColorBlindness: option.value })}
                  >
                    <EyeOff className="mr-2 h-4 w-4" />
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Preview Frame */}
      <div
        className={`flex-1 flex items-center justify-center bg-muted/30 rounded-lg overflow-auto p-8 ${
          isFullscreen ? 'fixed inset-0 z-50 bg-background p-4' : ''
        }`}
      >
        {isFullscreen && (
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 right-4"
            onClick={() => setIsFullscreen(false)}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        )}

        <div className="relative">
          {/* Rulers */}
          {settings.showRulers && (
            <>
              <HorizontalRuler width={previewWidth} />
              <VerticalRuler height={previewHeight} />
            </>
          )}

          {/* Device Frame */}
          <div
            className="relative bg-background rounded-lg shadow-2xl overflow-hidden transition-all duration-300"
            style={{
              width: previewWidth,
              height: previewHeight,
            }}
          >
            {/* Device Bezel */}
            <div
              className={`absolute inset-0 pointer-events-none z-10 ${
                device.type === 'mobile'
                  ? 'border-8 border-zinc-800 rounded-3xl'
                  : device.type === 'tablet'
                    ? 'border-4 border-zinc-700 rounded-xl'
                    : ''
              }`}
            />

            {/* Grid Overlay */}
            {settings.showGrid && (
              <div
                className="absolute inset-0 pointer-events-none z-20"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
            )}

            {/* Preview Content */}
            <div
              className={`w-full h-full ${settings.simulateDarkMode ? 'dark' : ''} ${
                settings.simulateHighContrast ? 'contrast-more' : ''
              }`}
              style={{
                filter: getColorBlindnessFilter(settings.simulateColorBlindness),
              }}
            >
              {previewUrl ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0"
                  title="Content Preview"
                  style={{
                    transform: `scale(${100 / settings.zoomLevel})`,
                    transformOrigin: 'top left',
                    width: `${settings.zoomLevel}%`,
                    height: `${settings.zoomLevel}%`,
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Monitor className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-lg font-medium">No Preview Available</p>
                    <p className="text-sm">Select a lesson to preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Device Quick Select */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center justify-center gap-2">
            {DEFAULT_DEVICE_PRESETS.slice(0, 6).map((preset) => (
              <Button
                key={preset.id}
                variant={device.id === preset.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleDeviceChange(preset.id)}
              >
                {getDeviceIcon(preset.type)}
                <span className="ml-2 hidden md:inline">{preset.name.split(' ')[0]}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function HorizontalRuler({ width }: { width: number }) {
  const ticks = Math.floor(width / 50);

  return (
    <div
      className="absolute -top-6 left-8 h-5 bg-muted border border-border rounded-t flex items-end"
      style={{ width }}
    >
      {Array.from({ length: ticks + 1 }).map((_, i) => (
        <div
          key={i}
          className="absolute bottom-0 border-l border-muted-foreground/30"
          style={{
            left: i * 50,
            height: i % 2 === 0 ? 12 : 6,
          }}
        >
          {i % 2 === 0 && (
            <span className="absolute -top-4 -left-3 text-xs text-muted-foreground">{i * 50}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function VerticalRuler({ height }: { height: number }) {
  const ticks = Math.floor(height / 50);

  return (
    <div
      className="absolute top-0 -left-6 w-5 bg-muted border border-border rounded-l flex items-end"
      style={{ height }}
    >
      {Array.from({ length: ticks + 1 }).map((_, i) => (
        <div
          key={i}
          className="absolute right-0 border-t border-muted-foreground/30"
          style={{
            top: i * 50,
            width: i % 2 === 0 ? 12 : 6,
          }}
        >
          {i % 2 === 0 && i > 0 && (
            <span className="absolute -left-8 -top-2 text-xs text-muted-foreground">{i * 50}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function getColorBlindnessFilter(type?: ColorBlindnessType): string {
  if (!type) return 'none';

  const filters: Record<ColorBlindnessType, string> = {
    protanopia: 'url(#protanopia)',
    deuteranopia: 'url(#deuteranopia)',
    tritanopia: 'url(#tritanopia)',
    achromatopsia: 'grayscale(100%)',
    protanomaly: 'url(#protanomaly)',
    deuteranomaly: 'url(#deuteranomaly)',
    tritanomaly: 'url(#tritanomaly)',
  };

  return filters[type] || 'none';
}
