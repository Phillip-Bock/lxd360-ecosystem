'use client';

import { CloudUpload, Folder, Globe, Link, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOutlineStore } from '@/store/outline-store';
import type { TitleBackgroundSettings } from '@/types/outline';
import { AdjustmentSliders } from './adjustment-sliders';
import { PreviewPanel } from './preview-panel';
import { LibraryTab } from './source-tabs/library-tab';
import { StockTab } from './source-tabs/stock-tab';
import { UploadTab } from './source-tabs/upload-tab';
import { UrlTab } from './source-tabs/url-tab';
import { detectMediaType, type MediaMetadata, type TabValue } from './types';

const TAB_ICONS: Record<TabValue, typeof Folder> = {
  library: Folder,
  upload: CloudUpload,
  url: Link,
  stock: Globe,
};

const TAB_LABELS: Record<TabValue, string> = {
  library: 'Library',
  upload: 'Upload',
  url: 'URL',
  stock: 'Stock',
};

export function TitleBackgroundModal() {
  const { isTitleSettingsOpen, closeTitleSettings, outline, setTitleBackground } =
    useOutlineStore();

  // Local state for editing (so we can cancel without saving)
  const [localSettings, setLocalSettings] = useState<TitleBackgroundSettings>(
    outline.titleBackground,
  );
  const [activeTab, setActiveTab] = useState<TabValue>('library');

  // Sync local state when modal opens
  // Wrap in setTimeout to avoid React 19 sync setState warning
  useEffect(() => {
    if (isTitleSettingsOpen) {
      const timeout = setTimeout(() => {
        setLocalSettings(outline.titleBackground);
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [isTitleSettingsOpen, outline.titleBackground]);

  const handleLocalSettingsChange = useCallback((updates: Partial<TitleBackgroundSettings>) => {
    setLocalSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleMediaSelect = useCallback((url: string, metadata?: MediaMetadata) => {
    const mediaType = metadata?.type || detectMediaType(url);
    setLocalSettings((prev) => ({
      ...prev,
      url,
      type: mediaType,
      sourceType: metadata?.sourceType || 'url',
      fileName: metadata?.fileName,
      fileSize: metadata?.fileSize,
      stockProvider: metadata?.stockProvider,
      stockAttribution: metadata?.stockAttribution,
      stockId: metadata?.stockId,
      // Reset position when new media is selected
      positionX: 0,
      positionY: 0,
      scale: 1,
    }));
  }, []);

  const handleRemoveBackground = useCallback(() => {
    setLocalSettings((prev) => ({
      ...prev,
      type: 'none',
      sourceType: null,
      url: '',
      fileName: undefined,
      fileSize: undefined,
      stockProvider: undefined,
      stockAttribution: undefined,
      stockId: undefined,
      positionX: 0,
      positionY: 0,
      scale: 1,
    }));
  }, []);

  const handleApply = useCallback(() => {
    setTitleBackground(localSettings);
    closeTitleSettings();
  }, [localSettings, setTitleBackground, closeTitleSettings]);

  const handleCancel = useCallback(() => {
    closeTitleSettings();
  }, [closeTitleSettings]);

  const hasBackground = localSettings.url && localSettings.type !== 'none';

  return (
    <Dialog open={isTitleSettingsOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-6xl h-150 flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>Title Background Settings</DialogTitle>
        </DialogHeader>

        {/* Two-column layout */}
        <div className="flex-1 grid grid-cols-2 gap-6 p-4 overflow-hidden">
          {/* Left: Source Selection */}
          <div className="flex flex-col overflow-hidden">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as TabValue)}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <TabsList className="w-full grid grid-cols-4">
                {(Object.keys(TAB_LABELS) as TabValue[]).map((tab) => {
                  const Icon = TAB_ICONS[tab];
                  return (
                    <TabsTrigger key={tab} value={tab} className="gap-1.5">
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{TAB_LABELS[tab]}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <div className="flex-1 overflow-y-auto mt-4">
                <TabsContent value="library" className="m-0">
                  <LibraryTab onSelect={handleMediaSelect} />
                </TabsContent>
                <TabsContent value="upload" className="m-0">
                  <UploadTab onSelect={handleMediaSelect} />
                </TabsContent>
                <TabsContent value="url" className="m-0">
                  <UrlTab onSelect={handleMediaSelect} />
                </TabsContent>
                <TabsContent value="stock" className="m-0">
                  <StockTab onSelect={handleMediaSelect} />
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Right: Preview & Adjustments */}
          <div className="flex flex-col gap-4 overflow-y-auto">
            <PreviewPanel settings={localSettings} onSettingsChange={handleLocalSettingsChange} />
            <AdjustmentSliders
              settings={localSettings}
              onSettingsChange={handleLocalSettingsChange}
              disabled={!hasBackground}
            />
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 pt-0 border-t border-border mt-auto">
          <div className="flex items-center justify-between w-full">
            <div>
              {hasBackground && (
                <Button
                  variant="ghost"
                  onClick={handleRemoveBackground}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Background
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleApply}>Apply Background</Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
