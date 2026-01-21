'use client';

import { Check, ChevronDown, Code, Copy, Download, Palette } from 'lucide-react';
import NextImage from 'next/image';
import * as React from 'react';
import { HexColorPicker } from 'react-colorful';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { sanitizeRichText } from '@/lib/sanitize';
import { cn } from '@/lib/utils';
import { ViewerContainer } from './viewer-container';

export interface IconViewerProps {
  src: string;
  isSvg: boolean;
  svgContent?: string;
}

const ICON_SIZES = [16, 24, 32, 48, 64, 128, 256] as const;
const PREVIEW_SIZES = [16, 24, 32, 48, 64] as const;

type BackgroundType = 'transparent' | 'white' | 'black' | 'checkered';

const BACKGROUNDS: { value: BackgroundType; label: string }[] = [
  { value: 'transparent', label: 'Transparent' },
  { value: 'white', label: 'White' },
  { value: 'black', label: 'Black' },
  { value: 'checkered', label: 'Checkered' },
];

export function IconViewer({ src, isSvg, svgContent }: IconViewerProps) {
  const [background, setBackground] = React.useState<BackgroundType>('checkered');
  const [iconColor, setIconColor] = React.useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [copiedType, setCopiedType] = React.useState<string | null>(null);
  const [loadedSvgContent, setLoadedSvgContent] = React.useState<string | null>(svgContent || null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Load SVG content if not provided
  React.useEffect(() => {
    if (svgContent) {
      setLoadedSvgContent(svgContent);
      setIsLoading(false);
      return;
    }

    if (isSvg) {
      fetch(src)
        .then((res) => res.text())
        .then((content) => {
          setLoadedSvgContent(content);
          setIsLoading(false);
        })
        .catch(() => {
          // Silently ignore - failed to load SVG, show error state
          setError('Failed to load SVG');
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [src, isSvg, svgContent]);

  // Get colorized SVG content
  const getColorizedSvg = React.useCallback(
    (color: string | null) => {
      if (!loadedSvgContent || !color) return loadedSvgContent;

      // Replace fill and stroke colors (simple implementation)
      let colorized = loadedSvgContent
        .replace(/fill="(?!none)[^"]*"/g, `fill="${color}"`)
        .replace(/stroke="(?!none)[^"]*"/g, `stroke="${color}"`);

      // Handle currentColor
      colorized = colorized.replace(/currentColor/g, color);

      return colorized;
    },
    [loadedSvgContent],
  );

  const displaySvgContent = React.useMemo(
    () => getColorizedSvg(iconColor),
    [getColorizedSvg, iconColor],
  );

  // Background styles
  const getBackgroundStyle = React.useCallback((bg: BackgroundType) => {
    switch (bg) {
      case 'white':
        return { backgroundColor: '#ffffff' };
      case 'black':
        return { backgroundColor: '#000000' };
      case 'checkered':
        return {
          backgroundImage:
            'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
          backgroundSize: '16px 16px',
          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
        };
      default:
        return {};
    }
  }, []);

  // Copy to clipboard
  const copyToClipboard = React.useCallback(
    async (type: 'svg' | 'react' | 'url') => {
      try {
        let content = '';

        switch (type) {
          case 'svg':
            content = displaySvgContent || '';
            break;
          case 'react':
            if (displaySvgContent) {
              // Convert SVG to React component format
              content = displaySvgContent
                .replace(/class=/g, 'className=')
                .replace(/stroke-width=/g, 'strokeWidth=')
                .replace(/stroke-linecap=/g, 'strokeLinecap=')
                .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
                .replace(/fill-rule=/g, 'fillRule=')
                .replace(/clip-rule=/g, 'clipRule=')
                .replace(/xmlns:xlink=/g, 'xmlnsXlink=');

              content = `const Icon = (props) => (\n  ${content.replace(/\n/g, '\n  ')}\n);\n\nexport default Icon;`;
            }
            break;
          case 'url':
            content = src;
            break;
        }

        await navigator.clipboard.writeText(content);
        setCopiedType(type);
        setTimeout(() => setCopiedType(null), 2000);
      } catch {
        // Silently ignore - clipboard API not supported or user declined
      }
    },
    [displaySvgContent, src],
  );

  // Download icon
  const downloadIcon = React.useCallback(
    async (size?: number) => {
      if (isSvg && displaySvgContent) {
        if (!size) {
          // Download as SVG
          const blob = new Blob([displaySvgContent], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'icon.svg';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else {
          // Convert to PNG at specified size
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            const img = new Image();
            const svgBlob = new Blob([displaySvgContent], {
              type: 'image/svg+xml',
            });
            const svgUrl = URL.createObjectURL(svgBlob);

            img.onload = () => {
              ctx.drawImage(img, 0, 0, size, size);
              canvas.toBlob((blob) => {
                if (blob) {
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `icon-${size}x${size}.png`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }
              }, 'image/png');
              URL.revokeObjectURL(svgUrl);
            };

            img.src = svgUrl;
          }
        }
      } else {
        // Download original file
        try {
          const response = await fetch(src);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'icon';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } catch {
          // Silently ignore - download failed, fallback to opening in new tab
          window.open(src, '_blank');
        }
      }
    },
    [isSvg, displaySvgContent, src],
  );

  return (
    <ViewerContainer
      isLoading={isLoading}
      error={error}
      onRetry={() => {
        setError(null);
        setIsLoading(true);
      }}
      className="min-h-[400px]"
    >
      <div className="w-full h-full flex flex-col p-6">
        {/* Main preview */}
        <div className="flex-1 flex items-center justify-center mb-6">
          <div
            className="relative flex items-center justify-center rounded-lg border p-8"
            style={{
              ...getBackgroundStyle(background),
              minWidth: '200px',
              minHeight: '200px',
            }}
          >
            {isSvg && displaySvgContent ? (
              <div
                className="w-32 h-32"
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(displaySvgContent) }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
            ) : (
              <NextImage
                src={src}
                alt="Icon"
                width={128}
                height={128}
                className="w-32 h-32 object-contain"
                unoptimized
              />
            )}
          </div>
        </div>

        {/* Size variants */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3">Size Variants</h4>
          <div
            className="flex items-end gap-4 p-4 rounded-lg border"
            style={getBackgroundStyle(background)}
          >
            {PREVIEW_SIZES.map((size) => (
              <Tooltip key={size}>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="flex items-center justify-center"
                      style={{ width: size, height: size }}
                    >
                      {isSvg && displaySvgContent ? (
                        <div
                          style={{ width: size, height: size }}
                          dangerouslySetInnerHTML={{ __html: sanitizeRichText(displaySvgContent) }}
                        />
                      ) : (
                        <NextImage
                          src={src}
                          alt={`${size}x${size}`}
                          width={size}
                          height={size}
                          className="object-contain"
                          unoptimized
                        />
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{size}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {size}x{size}px
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Background toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <div
                  className="w-4 h-4 rounded border mr-2"
                  style={getBackgroundStyle(background)}
                />
                Background
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {BACKGROUNDS.map((bg) => (
                <DropdownMenuItem
                  key={bg.value}
                  onClick={() => setBackground(bg.value)}
                  className={cn(background === bg.value && 'bg-accent')}
                >
                  <div
                    className="w-4 h-4 rounded border mr-2"
                    style={getBackgroundStyle(bg.value)}
                  />
                  {bg.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Color customization (SVG only) */}
          {isSvg && (
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowColorPicker(!showColorPicker)}
              >
                <Palette className="h-4 w-4 mr-2" />
                {iconColor ? (
                  <div className="w-4 h-4 rounded border" style={{ backgroundColor: iconColor }} />
                ) : (
                  'Color'
                )}
              </Button>
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-background border rounded-lg p-3 shadow-lg">
                  <HexColorPicker color={iconColor || '#000000'} onChange={setIconColor} />
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIconColor(null);
                        setShowColorPicker(false);
                      }}
                      className="flex-1"
                    >
                      Reset
                    </Button>
                    <Button size="sm" onClick={() => setShowColorPicker(false)} className="flex-1">
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex-1" />

          {/* Copy buttons */}
          {isSvg && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard('svg')}>
                    {copiedType === 'svg' ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    Copy SVG
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy SVG code</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard('react')}>
                    {copiedType === 'react' ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : (
                      <Code className="h-4 w-4 mr-2" />
                    )}
                    Copy React
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy as React component</TooltipContent>
              </Tooltip>
            </>
          )}

          {/* Download */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isSvg && (
                <>
                  <DropdownMenuItem onClick={() => downloadIcon()}>Download SVG</DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {ICON_SIZES.map((size) => (
                <DropdownMenuItem key={size} onClick={() => downloadIcon(size)}>
                  PNG {size}x{size}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </ViewerContainer>
  );
}
