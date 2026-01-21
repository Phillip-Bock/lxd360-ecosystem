'use client';

/**
 * ThemeEditorPanel - Side panel for editing theme colors, typography, and spacing
 */

import { Check, Download, Moon, Palette, RotateCcw, Sun, Type } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/providers/theme-provider';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label: string;
}

function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-8 h-8 rounded-md border border-white/10 shadow-sm"
            style={{ backgroundColor: value }}
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3 bg-[#1a1a2e] border-white/10">
          <div className="space-y-2">
            <Label className="text-xs">{label}</Label>
            <Input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-32 h-10 cursor-pointer"
            />
            <Input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-32 h-8 font-mono text-xs bg-zinc-900 border-white/10"
              placeholder="#000000"
            />
          </div>
        </PopoverContent>
      </Popover>
      <span className="text-xs text-zinc-400 flex-1">{label}</span>
      <span className="text-[10px] font-mono text-zinc-500">{value}</span>
    </div>
  );
}

interface ThemeEditorPanelProps {
  onClose: () => void;
}

/**
 * ThemeEditorPanel - Slide-out panel for theme customization
 */
export function ThemeEditorPanel({ onClose }: ThemeEditorPanelProps) {
  const { theme, colorMode, setColorMode, updateColors, resetTheme } = useTheme();
  const colors = theme.colors[colorMode];
  const [activeTab, setActiveTab] = useState('colors');

  const handleColorChange = useCallback(
    (key: string, value: string) => {
      updateColors({ [key]: value } as Partial<typeof colors>);
    },
    [updateColors],
  );

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-[#1a1a2e] border-l border-white/10 shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          <span className="font-semibold text-white">Theme Editor</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setColorMode(colorMode === 'light' ? 'dark' : 'light')}
          >
            {colorMode === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            x
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start px-4 pt-4 bg-transparent">
            <TabsTrigger value="colors" className="gap-1 data-[state=active]:bg-primary/20">
              <Palette className="w-3 h-3" /> Colors
            </TabsTrigger>
            <TabsTrigger value="typography" className="gap-1 data-[state=active]:bg-primary/20">
              <Type className="w-3 h-3" /> Typography
            </TabsTrigger>
          </TabsList>

          {/* Colors Tab */}
          <TabsContent value="colors" className="p-4 space-y-6">
            {/* Brand Colors */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-white">Brand Colors</h4>
              <div className="space-y-2">
                <ColorPicker
                  value={colors.primary}
                  onChange={(v) => handleColorChange('primary', v)}
                  label="Primary"
                />
                <ColorPicker
                  value={colors.secondary}
                  onChange={(v) => handleColorChange('secondary', v)}
                  label="Secondary"
                />
                <ColorPicker
                  value={colors.accent}
                  onChange={(v) => handleColorChange('accent', v)}
                  label="Accent"
                />
              </div>
            </div>

            {/* Semantic Colors */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-white">Semantic Colors</h4>
              <div className="space-y-2">
                <ColorPicker
                  value={colors.success}
                  onChange={(v) => handleColorChange('success', v)}
                  label="Success"
                />
                <ColorPicker
                  value={colors.warning}
                  onChange={(v) => handleColorChange('warning', v)}
                  label="Warning"
                />
                <ColorPicker
                  value={colors.error}
                  onChange={(v) => handleColorChange('error', v)}
                  label="Error"
                />
                <ColorPicker
                  value={colors.info}
                  onChange={(v) => handleColorChange('info', v)}
                  label="Info"
                />
              </div>
            </div>

            {/* UI Colors */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-white">UI Colors</h4>
              <div className="space-y-2">
                <ColorPicker
                  value={colors.background}
                  onChange={(v) => handleColorChange('background', v)}
                  label="Background"
                />
                <ColorPicker
                  value={colors.foreground}
                  onChange={(v) => handleColorChange('foreground', v)}
                  label="Foreground"
                />
                <ColorPicker
                  value={colors.muted}
                  onChange={(v) => handleColorChange('muted', v)}
                  label="Muted"
                />
                <ColorPicker
                  value={colors.border}
                  onChange={(v) => handleColorChange('border', v)}
                  label="Border"
                />
              </div>
            </div>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography" className="p-4 space-y-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-white">Font Families</h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs text-zinc-400">Heading Font</Label>
                  <Select defaultValue="inter">
                    <SelectTrigger className="h-8 bg-zinc-900 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inter">Inter</SelectItem>
                      <SelectItem value="poppins">Poppins</SelectItem>
                      <SelectItem value="roboto">Roboto</SelectItem>
                      <SelectItem value="opensans">Open Sans</SelectItem>
                      <SelectItem value="lato">Lato</SelectItem>
                      <SelectItem value="montserrat">Montserrat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-zinc-400">Body Font</Label>
                  <Select defaultValue="inter">
                    <SelectTrigger className="h-8 bg-zinc-900 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inter">Inter</SelectItem>
                      <SelectItem value="poppins">Poppins</SelectItem>
                      <SelectItem value="roboto">Roboto</SelectItem>
                      <SelectItem value="opensans">Open Sans</SelectItem>
                      <SelectItem value="sourcesans">Source Sans Pro</SelectItem>
                      <SelectItem value="noto">Noto Sans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Font Size Preview */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-white">Size Scale Preview</h4>
              <div className="space-y-2 p-3 bg-zinc-900 rounded-lg">
                <div style={{ fontSize: theme.typography.fontSize.h1, fontWeight: 700 }}>
                  H1 Heading
                </div>
                <div style={{ fontSize: theme.typography.fontSize.h2, fontWeight: 600 }}>
                  H2 Heading
                </div>
                <div style={{ fontSize: theme.typography.fontSize.h3, fontWeight: 600 }}>
                  H3 Heading
                </div>
                <div style={{ fontSize: theme.typography.fontSize.body }}>Body text paragraph</div>
                <div
                  style={{ fontSize: theme.typography.fontSize.small }}
                  className="text-zinc-400"
                >
                  Small text caption
                </div>
              </div>
            </div>

            {/* Border Radius */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-white">Border Radius</h4>
              <div className="grid grid-cols-3 gap-2">
                {(['none', 'sm', 'md', 'lg', 'xl', 'full'] as const).map((radius) => (
                  <div
                    key={radius}
                    className="aspect-square bg-primary/20 border-2 border-primary flex items-center justify-center text-xs text-white"
                    style={{
                      borderRadius: theme.borderRadius[radius as keyof typeof theme.borderRadius],
                    }}
                  >
                    {radius}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="h-14 border-t border-white/10 flex items-center justify-between px-4">
        <Button variant="outline" size="sm" className="border-white/10" onClick={resetTheme}>
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-white/10">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button size="sm">
            <Check className="w-4 h-4 mr-1" />
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ThemeEditorPanel;
