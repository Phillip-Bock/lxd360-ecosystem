'use client';

/**
 * ChromeEditor - Phase 12
 * Player UI/shell customization editor
 */

import {
  ChevronDown,
  ChevronRight,
  Eye,
  Layout,
  Monitor,
  Moon,
  Palette,
  PanelLeft,
  PanelRight,
  Sun,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type {
  ChromeConfig,
  FooterConfig,
  HeaderConfig,
  SidebarConfig,
} from '@/types/studio/player-config';

// =============================================================================
// TYPES
// =============================================================================

interface ChromeEditorProps {
  config: ChromeConfig;
  onChange: (config: ChromeConfig) => void;
  onPreview?: () => void;
}

// =============================================================================
// SECTION COMPONENT
// =============================================================================

interface SectionProps {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function Section({ title, icon, defaultOpen = true, children }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <button
        type="button"
        className="w-full px-3 py-2 flex items-center gap-2 bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        {icon}
        <span className="text-sm font-medium text-white">{title}</span>
      </button>
      {isOpen && <div className="p-3 space-y-3 border-t border-white/5">{children}</div>}
    </div>
  );
}

// =============================================================================
// TOGGLE ROW COMPONENT
// =============================================================================

interface ToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function ToggleRow({ label, description, checked, onCheckedChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Label className="text-sm text-white">{label}</Label>
        {description && <p className="text-[10px] text-zinc-500">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

// =============================================================================
// LAYOUT PREVIEW
// =============================================================================

interface LayoutPreviewProps {
  layout: ChromeConfig['layout'];
  showHeader: boolean;
  showFooter: boolean;
  showSidebar: boolean;
  sidebarPosition: 'left' | 'right';
}

function LayoutPreview({
  layout,
  showHeader,
  showFooter,
  showSidebar,
  sidebarPosition,
}: LayoutPreviewProps) {
  return (
    <div className="w-full aspect-video bg-zinc-900 rounded-lg border border-white/10 overflow-hidden flex flex-col">
      {showHeader && layout !== 'immersive' && (
        <div className="h-3 bg-zinc-800 border-b border-white/5 flex items-center px-1">
          <div className="w-1 h-1 rounded-full bg-zinc-600" />
          <div className="flex-1" />
          <div className="w-4 h-1 rounded-xs bg-zinc-600" />
        </div>
      )}
      <div className="flex-1 flex">
        {showSidebar &&
          sidebarPosition === 'left' &&
          layout !== 'immersive' &&
          layout !== 'minimal' && <div className="w-8 bg-zinc-800/50 border-r border-white/5" />}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-16 h-10 rounded-xs bg-primary/20 border border-primary/30" />
        </div>
        {showSidebar &&
          sidebarPosition === 'right' &&
          layout !== 'immersive' &&
          layout !== 'minimal' && <div className="w-8 bg-zinc-800/50 border-l border-white/5" />}
      </div>
      {showFooter && layout !== 'immersive' && (
        <div className="h-3 bg-zinc-800 border-t border-white/5 flex items-center justify-center gap-1 px-1">
          <div className="w-1 h-1 rounded-full bg-zinc-600" />
          <div className="w-1 h-1 rounded-full bg-zinc-600" />
          <div className="flex-1 h-0.5 rounded-full bg-zinc-700 mx-1">
            <div className="w-1/3 h-full rounded-full bg-primary" />
          </div>
          <div className="w-1 h-1 rounded-full bg-zinc-600" />
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ChromeEditor({ config, onChange, onPreview }: ChromeEditorProps) {
  const [activeTab, setActiveTab] = useState('layout');

  const updateConfig = useCallback(
    (updates: Partial<ChromeConfig>) => {
      onChange({ ...config, ...updates });
    },
    [config, onChange],
  );

  const updateHeader = useCallback(
    (updates: Partial<HeaderConfig>) => {
      onChange({ ...config, header: { ...config.header, ...updates } });
    },
    [config, onChange],
  );

  const updateFooter = useCallback(
    (updates: Partial<FooterConfig>) => {
      onChange({ ...config, footer: { ...config.footer, ...updates } });
    },
    [config, onChange],
  );

  const updateSidebar = useCallback(
    (updates: Partial<SidebarConfig>) => {
      onChange({ ...config, sidebar: { ...config.sidebar, ...updates } });
    },
    [config, onChange],
  );

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f]">
      {/* Header */}
      <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <Layout className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm text-white">Player Chrome</span>
        </div>
        <div className="flex items-center gap-2">
          {onPreview && (
            <Button variant="outline" size="sm" className="h-7" onClick={onPreview}>
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </Button>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="px-4 py-3 border-b border-white/10">
        <LayoutPreview
          layout={config.layout}
          showHeader={config.showHeader}
          showFooter={config.showFooter}
          showSidebar={config.showSidebar}
          sidebarPosition={config.sidebar.position}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="mx-4 mt-2 grid grid-cols-4 h-8">
          <TabsTrigger value="layout" className="text-xs">
            Layout
          </TabsTrigger>
          <TabsTrigger value="header" className="text-xs">
            Header
          </TabsTrigger>
          <TabsTrigger value="footer" className="text-xs">
            Footer
          </TabsTrigger>
          <TabsTrigger value="sidebar" className="text-xs">
            Sidebar
          </TabsTrigger>
        </TabsList>

        {/* Layout Tab */}
        <TabsContent value="layout" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full px-4 py-3">
            <div className="space-y-4">
              {/* Layout Style */}
              <div className="space-y-2">
                <Label className="text-xs text-zinc-400">Layout Style</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(['standard', 'minimal', 'immersive', 'sidebar'] as const).map((layout) => (
                    <button
                      key={layout}
                      type="button"
                      className={cn(
                        'p-3 rounded-lg border text-center transition-colors',
                        config.layout === layout
                          ? 'border-primary bg-primary/10'
                          : 'border-white/10 hover:border-white/20',
                      )}
                      onClick={() => updateConfig({ layout })}
                    >
                      <div className="text-sm font-medium text-white capitalize">{layout}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        {layout === 'standard' && 'Full UI controls'}
                        {layout === 'minimal' && 'Clean, distraction-free'}
                        {layout === 'immersive' && 'Full screen content'}
                        {layout === 'sidebar' && 'Persistent navigation'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div className="space-y-2">
                <Label className="text-xs text-zinc-400">Theme</Label>
                <div className="grid grid-cols-4 gap-2">
                  {(['light', 'dark', 'system', 'custom'] as const).map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      className={cn(
                        'p-2 rounded-lg border flex flex-col items-center gap-1 transition-colors',
                        config.theme === theme
                          ? 'border-primary bg-primary/10'
                          : 'border-white/10 hover:border-white/20',
                      )}
                      onClick={() => updateConfig({ theme })}
                    >
                      {theme === 'light' && <Sun className="h-4 w-4" />}
                      {theme === 'dark' && <Moon className="h-4 w-4" />}
                      {theme === 'system' && <Monitor className="h-4 w-4" />}
                      {theme === 'custom' && <Palette className="h-4 w-4" />}
                      <span className="text-[10px] capitalize">{theme}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Show/Hide */}
              <Section title="Visibility" defaultOpen>
                <ToggleRow
                  label="Show Header"
                  checked={config.showHeader}
                  onCheckedChange={(checked) => updateConfig({ showHeader: checked })}
                />
                <ToggleRow
                  label="Show Footer"
                  checked={config.showFooter}
                  onCheckedChange={(checked) => updateConfig({ showFooter: checked })}
                />
                <ToggleRow
                  label="Show Sidebar"
                  checked={config.showSidebar}
                  onCheckedChange={(checked) => updateConfig({ showSidebar: checked })}
                />
                <ToggleRow
                  label="Show Minimap"
                  description="Visual overview of all slides"
                  checked={config.showMinimap}
                  onCheckedChange={(checked) => updateConfig({ showMinimap: checked })}
                />
              </Section>

              {/* Style */}
              <Section title="Style" defaultOpen={false}>
                <div className="space-y-2">
                  <Label className="text-xs text-zinc-400">Border Radius</Label>
                  <Select
                    value={config.borderRadius}
                    onValueChange={(v) =>
                      updateConfig({ borderRadius: v as ChromeConfig['borderRadius'] })
                    }
                  >
                    <SelectTrigger className="h-8 bg-zinc-900 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="sm">Small</SelectItem>
                      <SelectItem value="md">Medium</SelectItem>
                      <SelectItem value="lg">Large</SelectItem>
                      <SelectItem value="xl">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-zinc-400">Animations</Label>
                  <Select
                    value={config.animations}
                    onValueChange={(v) =>
                      updateConfig({ animations: v as ChromeConfig['animations'] })
                    }
                  >
                    <SelectTrigger className="h-8 bg-zinc-900 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="subtle">Subtle</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="playful">Playful</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Section>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Header Tab */}
        <TabsContent value="header" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full px-4 py-3">
            <div className="space-y-4">
              <Section title="Elements" defaultOpen>
                <ToggleRow
                  label="Show Title"
                  checked={config.header.showTitle}
                  onCheckedChange={(checked) => updateHeader({ showTitle: checked })}
                />
                <ToggleRow
                  label="Show Progress Bar"
                  checked={config.header.showProgress}
                  onCheckedChange={(checked) => updateHeader({ showProgress: checked })}
                />
                <ToggleRow
                  label="Show Menu Button"
                  checked={config.header.showMenu}
                  onCheckedChange={(checked) => updateHeader({ showMenu: checked })}
                />
                <ToggleRow
                  label="Show Close Button"
                  checked={config.header.showClose}
                  onCheckedChange={(checked) => updateHeader({ showClose: checked })}
                />
                <ToggleRow
                  label="Show Settings Button"
                  checked={config.header.showSettings}
                  onCheckedChange={(checked) => updateHeader({ showSettings: checked })}
                />
              </Section>

              <Section title="Logo" defaultOpen={false}>
                <div className="space-y-2">
                  <Label className="text-xs text-zinc-400">Logo URL</Label>
                  <Input
                    value={config.header.logoUrl || ''}
                    onChange={(e) => updateHeader({ logoUrl: e.target.value || undefined })}
                    placeholder="https://..."
                    className="h-8 bg-zinc-900 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-zinc-400">Logo Position</Label>
                  <Select
                    value={config.header.logoPosition}
                    onValueChange={(v) =>
                      updateHeader({ logoPosition: v as HeaderConfig['logoPosition'] })
                    }
                  >
                    <SelectTrigger className="h-8 bg-zinc-900 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Section>

              <Section title="Size" defaultOpen={false}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-zinc-400">Height</Label>
                    <span className="text-xs text-zinc-500">{config.header.height}px</span>
                  </div>
                  <Slider
                    value={[config.header.height]}
                    onValueChange={([value]) => updateHeader({ height: value })}
                    min={32}
                    max={80}
                    step={4}
                  />
                </div>
              </Section>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Footer Tab */}
        <TabsContent value="footer" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full px-4 py-3">
            <div className="space-y-4">
              <Section title="Navigation" defaultOpen>
                <ToggleRow
                  label="Show Navigation Buttons"
                  checked={config.footer.showNavigation}
                  onCheckedChange={(checked) => updateFooter({ showNavigation: checked })}
                />
                <ToggleRow
                  label="Show Slide Counter"
                  checked={config.footer.showSlideCounter}
                  onCheckedChange={(checked) => updateFooter({ showSlideCounter: checked })}
                />
              </Section>

              <Section title="Media Controls" defaultOpen>
                <ToggleRow
                  label="Show Play/Pause"
                  checked={config.footer.showPlayPause}
                  onCheckedChange={(checked) => updateFooter({ showPlayPause: checked })}
                />
                <ToggleRow
                  label="Show Volume"
                  checked={config.footer.showVolume}
                  onCheckedChange={(checked) => updateFooter({ showVolume: checked })}
                />
                <ToggleRow
                  label="Show Captions Toggle"
                  checked={config.footer.showCaptions}
                  onCheckedChange={(checked) => updateFooter({ showCaptions: checked })}
                />
                <ToggleRow
                  label="Show Playback Speed"
                  checked={config.footer.showSpeed}
                  onCheckedChange={(checked) => updateFooter({ showSpeed: checked })}
                />
              </Section>

              <Section title="Display" defaultOpen={false}>
                <ToggleRow
                  label="Show Fullscreen Button"
                  checked={config.footer.showFullscreen}
                  onCheckedChange={(checked) => updateFooter({ showFullscreen: checked })}
                />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-zinc-400">Height</Label>
                    <span className="text-xs text-zinc-500">{config.footer.height}px</span>
                  </div>
                  <Slider
                    value={[config.footer.height]}
                    onValueChange={([value]) => updateFooter({ height: value })}
                    min={40}
                    max={80}
                    step={4}
                  />
                </div>
              </Section>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Sidebar Tab */}
        <TabsContent value="sidebar" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full px-4 py-3">
            <div className="space-y-4">
              <Section title="Position" defaultOpen>
                <div className="space-y-2">
                  <Label className="text-xs text-zinc-400">Sidebar Position</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className={cn(
                        'p-2 rounded-lg border flex items-center justify-center gap-2',
                        config.sidebar.position === 'left'
                          ? 'border-primary bg-primary/10'
                          : 'border-white/10 hover:border-white/20',
                      )}
                      onClick={() => updateSidebar({ position: 'left' })}
                    >
                      <PanelLeft className="h-4 w-4" />
                      <span className="text-xs">Left</span>
                    </button>
                    <button
                      type="button"
                      className={cn(
                        'p-2 rounded-lg border flex items-center justify-center gap-2',
                        config.sidebar.position === 'right'
                          ? 'border-primary bg-primary/10'
                          : 'border-white/10 hover:border-white/20',
                      )}
                      onClick={() => updateSidebar({ position: 'right' })}
                    >
                      <PanelRight className="h-4 w-4" />
                      <span className="text-xs">Right</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-zinc-400">Default State</Label>
                  <Select
                    value={config.sidebar.defaultState}
                    onValueChange={(v) =>
                      updateSidebar({ defaultState: v as SidebarConfig['defaultState'] })
                    }
                  >
                    <SelectTrigger className="h-8 bg-zinc-900 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="auto">Auto (based on screen)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Section>

              <Section title="Content" defaultOpen>
                <ToggleRow
                  label="Table of Contents"
                  checked={config.sidebar.showTOC}
                  onCheckedChange={(checked) => updateSidebar({ showTOC: checked })}
                />
                <ToggleRow
                  label="Resources"
                  checked={config.sidebar.showResources}
                  onCheckedChange={(checked) => updateSidebar({ showResources: checked })}
                />
                <ToggleRow
                  label="Glossary"
                  checked={config.sidebar.showGlossary}
                  onCheckedChange={(checked) => updateSidebar({ showGlossary: checked })}
                />
                <ToggleRow
                  label="Notes"
                  checked={config.sidebar.showNotes}
                  onCheckedChange={(checked) => updateSidebar({ showNotes: checked })}
                />
                <ToggleRow
                  label="Bookmarks"
                  checked={config.sidebar.showBookmarks}
                  onCheckedChange={(checked) => updateSidebar({ showBookmarks: checked })}
                />
                <ToggleRow
                  label="Search"
                  checked={config.sidebar.showSearch}
                  onCheckedChange={(checked) => updateSidebar({ showSearch: checked })}
                />
              </Section>

              <Section title="Size" defaultOpen={false}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-zinc-400">Width</Label>
                    <span className="text-xs text-zinc-500">{config.sidebar.width}px</span>
                  </div>
                  <Slider
                    value={[config.sidebar.width]}
                    onValueChange={([value]) => updateSidebar({ width: value })}
                    min={200}
                    max={400}
                    step={20}
                  />
                </div>
              </Section>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ChromeEditor;
