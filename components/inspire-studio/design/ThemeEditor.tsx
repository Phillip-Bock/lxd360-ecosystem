'use client';

import { ChevronDown, Download, Paintbrush, Save, Sparkles, Upload } from 'lucide-react';
import { useCallback, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  type BlockStyleConfig,
  BlockStylePresets,
  DEFAULT_BLOCK_STYLES,
} from './BlockStylePresets';
import {
  type ColorPalette,
  ColorPaletteManager,
  DEFAULT_DARK_PALETTE,
  DEFAULT_LIGHT_PALETTE,
} from './ColorPaletteManager';
import { type ThemeConfig, ThemePreviewCard } from './ThemePreviewCard';
import { DEFAULT_TYPOGRAPHY, type TypographyConfig, TypographyManager } from './TypographyManager';

// =============================================================================
// Types
// =============================================================================

interface ThemeEditorProps {
  theme: ThemeConfig;
  onChange: (theme: ThemeConfig) => void;
  onSave?: (theme: ThemeConfig) => void;
  className?: string;
}

// =============================================================================
// Preset Themes
// =============================================================================

const PRESET_THEMES: ThemeConfig[] = [
  {
    name: 'Mission Control',
    palette: {
      ...DEFAULT_DARK_PALETTE,
      primary: '#00d4ff',
      secondary: '#8b5cf6',
      background: '#0a0a0f',
      surface: '#1a1a24',
    },
    typography: {
      ...DEFAULT_TYPOGRAPHY,
      headingFont: 'JetBrains Mono, monospace',
      bodyFont: 'Inter, sans-serif',
      monoFont: 'JetBrains Mono, monospace',
    },
    blockStyles: {
      ...DEFAULT_BLOCK_STYLES,
      borderRadius: 4,
      borderWidth: 1,
      shadowSize: 'none',
    },
  },
  {
    name: 'Corporate Clean',
    palette: {
      ...DEFAULT_LIGHT_PALETTE,
      primary: '#0072f5',
      secondary: '#7c3aed',
      background: '#ffffff',
      surface: '#f8fafc',
    },
    typography: {
      ...DEFAULT_TYPOGRAPHY,
      headingFont: 'Inter, sans-serif',
      bodyFont: 'Inter, sans-serif',
    },
    blockStyles: {
      ...DEFAULT_BLOCK_STYLES,
      borderRadius: 8,
      shadowSize: 'sm',
    },
  },
  {
    name: 'Accessibility Focus',
    palette: {
      primary: '#0066cc',
      secondary: '#6600cc',
      accent: '#cc6600',
      background: '#ffffff',
      surface: '#f5f5f5',
      text: '#000000',
      textSecondary: '#333333',
      border: '#666666',
      success: '#008000',
      warning: '#cc6600',
      error: '#cc0000',
    },
    typography: {
      headingFont: 'OpenDyslexic, sans-serif',
      bodyFont: 'OpenDyslexic, sans-serif',
      monoFont: 'JetBrains Mono, monospace',
      baseSize: 18,
      scaleRatio: 1.333,
      lineHeight: 1.75,
      letterSpacing: 0.05,
    },
    blockStyles: {
      borderRadius: 4,
      borderWidth: 2,
      shadowSize: 'none',
      containerPadding: 32,
      blockGap: 24,
      animationDuration: 0,
      animationEasing: 'ease',
    },
  },
];

// =============================================================================
// Theme Editor Component
// =============================================================================

export function ThemeEditor({ theme, onChange, onSave, className }: ThemeEditorProps) {
  const [activeSection, setActiveSection] = useState<string[]>(['colors']);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Handle palette change
  const handlePaletteChange = useCallback(
    (palette: ColorPalette) => {
      onChange({ ...theme, palette });
      setHasUnsavedChanges(true);
    },
    [theme, onChange],
  );

  // Handle typography change
  const handleTypographyChange = useCallback(
    (typography: TypographyConfig) => {
      onChange({ ...theme, typography });
      setHasUnsavedChanges(true);
    },
    [theme, onChange],
  );

  // Handle block styles change
  const handleBlockStylesChange = useCallback(
    (blockStyles: BlockStyleConfig) => {
      onChange({ ...theme, blockStyles });
      setHasUnsavedChanges(true);
    },
    [theme, onChange],
  );

  // Apply preset theme
  const applyPreset = useCallback(
    (preset: ThemeConfig) => {
      onChange(preset);
      setHasUnsavedChanges(true);
    },
    [onChange],
  );

  // Handle save
  const handleSave = useCallback(() => {
    onSave?.(theme);
    setHasUnsavedChanges(false);
  }, [theme, onSave]);

  // Export theme as JSON
  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify(theme, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${theme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [theme]);

  // Import theme from JSON
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const imported = JSON.parse(text) as ThemeConfig;
        onChange(imported);
        setHasUnsavedChanges(true);
      } catch {
        console.error('Failed to import theme');
      }
    };
    input.click();
  }, [onChange]);

  return (
    <div className={cn('flex flex-col h-full bg-lxd-dark-bg', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-lxd-dark-border">
        <div className="flex items-center gap-2">
          <Paintbrush className="w-4 h-4 text-lxd-cyan" />
          <h3 className="text-sm font-semibold text-white">Theme Editor</h3>
          {hasUnsavedChanges && (
            <span className="text-[10px] text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">
              Unsaved
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8">
                <Sparkles className="w-3 h-3 mr-1" />
                Presets
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {PRESET_THEMES.map((preset) => (
                <DropdownMenuItem key={preset.name} onClick={() => applyPreset(preset)}>
                  {preset.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleImport}
            title="Import Theme"
          >
            <Upload className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleExport}
            title="Export Theme"
          >
            <Download className="w-4 h-4" />
          </Button>
          {onSave && (
            <Button
              type="button"
              size="sm"
              className="h-8 bg-lxd-cyan hover:bg-lxd-cyan/80"
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
            >
              <Save className="w-3 h-3 mr-1" />
              Save
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Live Preview */}
          <div className="space-y-2">
            <p className="text-xs text-white/40 uppercase tracking-wider">Live Preview</p>
            <ThemePreviewCard theme={theme} isActive showDetails={false} />
          </div>

          {/* Settings Accordion */}
          <Accordion
            type="multiple"
            value={activeSection}
            onValueChange={setActiveSection}
            className="space-y-2"
          >
            {/* Colors */}
            <AccordionItem
              value="colors"
              className="border border-lxd-dark-border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:bg-lxd-dark-surface text-sm">
                Colors
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ColorPaletteManager palette={theme.palette} onChange={handlePaletteChange} />
              </AccordionContent>
            </AccordionItem>

            {/* Typography */}
            <AccordionItem
              value="typography"
              className="border border-lxd-dark-border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:bg-lxd-dark-surface text-sm">
                Typography
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <TypographyManager
                  typography={theme.typography}
                  onChange={handleTypographyChange}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Block Styles */}
            <AccordionItem
              value="blocks"
              className="border border-lxd-dark-border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:bg-lxd-dark-surface text-sm">
                Block Styles
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <BlockStylePresets
                  blockStyles={theme.blockStyles}
                  onChange={handleBlockStylesChange}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Preset Gallery */}
          <div className="space-y-3">
            <p className="text-xs text-white/40 uppercase tracking-wider">Theme Gallery</p>
            <div className="grid grid-cols-1 gap-3">
              {PRESET_THEMES.map((preset) => (
                <ThemePreviewCard
                  key={preset.name}
                  theme={preset}
                  isActive={preset.name === theme.name}
                  onClick={() => applyPreset(preset)}
                />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

export default ThemeEditor;
