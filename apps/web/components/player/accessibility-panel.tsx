'use client';

import { motion } from 'framer-motion';
import { Eye, Palette, RotateCcw, Type, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
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
import type { LearnerProfile } from '@/types/player';

interface AccessibilityPanelProps {
  profile: LearnerProfile | null;
  userId?: string;
  onClose: () => void;
  onSettingsChange: (settings: Partial<LearnerProfile>) => void;
}

export function AccessibilityPanel({
  profile,
  userId,
  onClose,
  onSettingsChange,
}: AccessibilityPanelProps) {
  const [settings, setSettings] = useState({
    colorBlindMode: profile?.color_blind_mode ?? 'none',
    fontSizeMultiplier: profile?.font_size_multiplier ?? 1,
    reducedMotion: profile?.reduced_motion ?? false,
    highContrast: profile?.high_contrast ?? false,
    showCaptions: profile?.show_captions ?? false,
    playbackSpeed: profile?.default_playback_speed ?? 1,
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    onSettingsChange({
      color_blind_mode: settings.colorBlindMode as LearnerProfile['color_blind_mode'],
      font_size_multiplier: settings.fontSizeMultiplier,
      reduced_motion: settings.reducedMotion,
      high_contrast: settings.highContrast,
      show_captions: settings.showCaptions,
      default_playback_speed: settings.playbackSpeed,
    });
  }, [settings, onSettingsChange]);

  const saveSettings = async () => {
    if (!userId) {
      return;
    }

    setIsSaving(true);

    try {
      // TODO(LXD-297): Implement accessibility settings saving with Firestore
      console.error('Save settings temporarily unavailable during Firebase migration');
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      colorBlindMode: 'none',
      fontSizeMultiplier: 1,
      reducedMotion: false,
      highContrast: false,
      showCaptions: false,
      playbackSpeed: 1,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-4 z-50 flex items-center justify-center"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[var(--hud-bg)]/80 backdrop-blur-xs cursor-default border-none"
        onClick={onClose}
        aria-label="Close panel"
        tabIndex={-1}
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-[var(--hud-border)] bg-[var(--hud-bg-secondary)] shadow-2xl shadow-[var(--hud-accent)]/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--hud-border)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--hud-accent)]/15">
              <Eye className="h-5 w-5 text-[var(--hud-accent-bright)]" />
            </div>
            <div>
              <h2 className="font-semibold text-[var(--hud-text)]">Accessibility Settings</h2>
              <p className="text-xs text-[var(--hud-text-muted)]">
                Customize your learning experience
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-[var(--hud-text-muted)] hover:bg-[var(--hud-accent)]/10 hover:text-[var(--hud-text)]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 p-6">
            {/* Color Vision */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-[var(--hud-accent-bright)]" />
                <Label className="text-sm font-medium text-[var(--hud-text)]">Color Vision</Label>
              </div>
              <Select
                value={settings.colorBlindMode}
                onValueChange={(value: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia') =>
                  setSettings((prev) => ({ ...prev, colorBlindMode: value }))
                }
              >
                <SelectTrigger className="border-[var(--hud-border)] bg-[var(--hud-bg)]/80 text-[var(--hud-text)]">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent className="border-[var(--hud-border)] bg-[var(--hud-bg-secondary)]">
                  <SelectItem value="none">Normal Vision</SelectItem>
                  <SelectItem value="protanopia">Protanopia (Red-blind)</SelectItem>
                  <SelectItem value="deuteranopia">Deuteranopia (Green-blind)</SelectItem>
                  <SelectItem value="tritanopia">Tritanopia (Blue-blind)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-[var(--hud-text-muted)]/60">
                Adjust colors to accommodate different types of color vision deficiency
              </p>
            </div>

            {/* Font Size */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-[var(--hud-accent-bright)]" />
                  <Label className="text-sm font-medium text-[var(--hud-text)]">Font Size</Label>
                </div>
                <span className="text-sm text-[var(--hud-accent-bright)]">
                  {Math.round(settings.fontSizeMultiplier * 100)}%
                </span>
              </div>
              <Slider
                value={[settings.fontSizeMultiplier * 100]}
                onValueChange={([value]) =>
                  setSettings((prev) => ({ ...prev, fontSizeMultiplier: value / 100 }))
                }
                min={75}
                max={150}
                step={5}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-[var(--hud-text-muted)]/60">
                <span>75%</span>
                <span>100%</span>
                <span>150%</span>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium text-[var(--hud-text)]">
                    High Contrast
                  </Label>
                  <p className="text-xs text-[var(--hud-text-muted)]/60">
                    Increase contrast for better visibility
                  </p>
                </div>
                <Switch
                  checked={settings.highContrast}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, highContrast: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium text-[var(--hud-text)]">
                    Reduced Motion
                  </Label>
                  <p className="text-xs text-[var(--hud-text-muted)]/60">
                    Minimize animations and transitions
                  </p>
                </div>
                <Switch
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, reducedMotion: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium text-[var(--hud-text)]">Captions</Label>
                  <p className="text-xs text-[var(--hud-text-muted)]/60">
                    Show captions for video content
                  </p>
                </div>
                <Switch
                  checked={settings.showCaptions}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, showCaptions: checked }))
                  }
                />
              </div>
            </div>

            {/* Playback Speed */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[var(--hud-accent-bright)]" />
                  <Label className="text-sm font-medium text-[var(--hud-text)]">
                    Default Playback Speed
                  </Label>
                </div>
                <span className="text-sm text-[var(--hud-accent-bright)]">
                  {settings.playbackSpeed}x
                </span>
              </div>
              <Slider
                value={[settings.playbackSpeed * 100]}
                onValueChange={([value]) =>
                  setSettings((prev) => ({ ...prev, playbackSpeed: value / 100 }))
                }
                min={50}
                max={200}
                step={25}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-[var(--hud-text-muted)]/60">
                <span>0.5x</span>
                <span>1x</span>
                <span>2x</span>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--hud-border)] p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetToDefaults}
            className="gap-2 text-[var(--hud-text-muted)] hover:text-[var(--hud-text)]"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-[var(--hud-border)] bg-transparent hover:bg-[var(--hud-accent)]/10"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={saveSettings}
              disabled={isSaving}
              className="bg-linear-to-r from-[var(--hud-accent)] to-[var(--hud-accent-bright)] text-[var(--hud-bg)] hover:opacity-90 shadow-[0_0_15px_rgba(0,212,255,0.3)]"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
