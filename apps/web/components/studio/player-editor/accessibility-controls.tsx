'use client';

/**
 * AccessibilityControls - Phase 12
 * Accessibility settings editor for the player
 */

import { Accessibility, AudioLines, Clock, Eye, Keyboard, Type } from 'lucide-react';
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
import type {
  AccessibilityConfig,
  AudioAccessibilityConfig,
  NavigationAccessibilityConfig,
  TextAccessibilityConfig,
  TimingAccessibilityConfig,
  VisualAccessibilityConfig,
} from '@/types/studio/player-config';

// =============================================================================
// TYPES
// =============================================================================

interface AccessibilityControlsProps {
  config: AccessibilityConfig;
  onChange: (config: AccessibilityConfig) => void;
  onPreview?: () => void;
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
    <div className="flex items-center justify-between py-1">
      <div>
        <Label className="text-sm text-white">{label}</Label>
        {description && <p className="text-[10px] text-zinc-500">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

// =============================================================================
// SECTION COMPONENT
// =============================================================================

interface SectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function Section({ title, description, children }: SectionProps) {
  return (
    <div className="space-y-3 pb-4 border-b border-white/5 last:border-0">
      <div>
        <h4 className="text-sm font-medium text-white">{title}</h4>
        {description && <p className="text-[10px] text-zinc-500 mt-0.5">{description}</p>}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AccessibilityControls({ config, onChange, onPreview }: AccessibilityControlsProps) {
  const [activeTab, setActiveTab] = useState('text');

  const updateText = useCallback(
    (updates: Partial<TextAccessibilityConfig>) => {
      onChange({ ...config, text: { ...config.text, ...updates } });
    },
    [config, onChange],
  );

  const updateVisual = useCallback(
    (updates: Partial<VisualAccessibilityConfig>) => {
      onChange({ ...config, visual: { ...config.visual, ...updates } });
    },
    [config, onChange],
  );

  const updateAudio = useCallback(
    (updates: Partial<AudioAccessibilityConfig>) => {
      onChange({ ...config, audio: { ...config.audio, ...updates } });
    },
    [config, onChange],
  );

  const updateNavigation = useCallback(
    (updates: Partial<NavigationAccessibilityConfig>) => {
      onChange({ ...config, navigation: { ...config.navigation, ...updates } });
    },
    [config, onChange],
  );

  const updateTiming = useCallback(
    (updates: Partial<TimingAccessibilityConfig>) => {
      onChange({ ...config, timing: { ...config.timing, ...updates } });
    },
    [config, onChange],
  );

  return (
    <div className="flex flex-col h-full bg-(--neural-bg)">
      {/* Header */}
      <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <Accessibility className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm text-white">Accessibility</span>
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="mx-4 mt-2 grid grid-cols-5 h-8">
          <TabsTrigger value="text" className="text-xs gap-1">
            <Type className="h-3 w-3" />
            Text
          </TabsTrigger>
          <TabsTrigger value="visual" className="text-xs gap-1">
            <Eye className="h-3 w-3" />
            Visual
          </TabsTrigger>
          <TabsTrigger value="audio" className="text-xs gap-1">
            <AudioLines className="h-3 w-3" />
            Audio
          </TabsTrigger>
          <TabsTrigger value="nav" className="text-xs gap-1">
            <Keyboard className="h-3 w-3" />
            Nav
          </TabsTrigger>
          <TabsTrigger value="timing" className="text-xs gap-1">
            <Clock className="h-3 w-3" />
            Timing
          </TabsTrigger>
        </TabsList>

        {/* Text Tab */}
        <TabsContent value="text" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full px-4 py-3">
            <div className="space-y-4">
              <Section title="Font Size">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-zinc-400">Base Size</Label>
                    <span className="text-xs text-zinc-500">{config.text.fontSize}%</span>
                  </div>
                  <Slider
                    value={[config.text.fontSize]}
                    onValueChange={([value]) => updateText({ fontSize: value })}
                    min={config.text.minFontSize}
                    max={config.text.maxFontSize}
                    step={5}
                  />
                </div>

                <ToggleRow
                  label="Allow User Resize"
                  description="Let learners adjust font size"
                  checked={config.text.allowFontResize}
                  onCheckedChange={(checked) => updateText({ allowFontResize: checked })}
                />

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-zinc-500">Min Size</Label>
                    <Input
                      type="number"
                      value={config.text.minFontSize}
                      onChange={(e) => updateText({ minFontSize: Number(e.target.value) })}
                      min={50}
                      max={100}
                      className="h-7 bg-zinc-900 border-white/10 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-zinc-500">Max Size</Label>
                    <Input
                      type="number"
                      value={config.text.maxFontSize}
                      onChange={(e) => updateText({ maxFontSize: Number(e.target.value) })}
                      min={100}
                      max={400}
                      className="h-7 bg-zinc-900 border-white/10 text-sm"
                    />
                  </div>
                </div>
              </Section>

              <Section title="Font Family">
                <Select
                  value={config.text.fontFamily}
                  onValueChange={(v) =>
                    updateText({ fontFamily: v as TextAccessibilityConfig['fontFamily'] })
                  }
                >
                  <SelectTrigger className="h-8 bg-zinc-900 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">System Default</SelectItem>
                    <SelectItem value="dyslexic">OpenDyslexic</SelectItem>
                    <SelectItem value="sans-serif">Sans-serif</SelectItem>
                    <SelectItem value="serif">Serif</SelectItem>
                    <SelectItem value="monospace">Monospace</SelectItem>
                  </SelectContent>
                </Select>
              </Section>

              <Section title="Spacing">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-zinc-400">Line Height</Label>
                    <span className="text-xs text-zinc-500">{config.text.lineHeight}</span>
                  </div>
                  <Slider
                    value={[config.text.lineHeight * 10]}
                    onValueChange={([value]) => updateText({ lineHeight: value / 10 })}
                    min={10}
                    max={30}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-zinc-400">Letter Spacing</Label>
                  <Select
                    value={config.text.letterSpacing}
                    onValueChange={(v) =>
                      updateText({ letterSpacing: v as TextAccessibilityConfig['letterSpacing'] })
                    }
                  >
                    <SelectTrigger className="h-8 bg-zinc-900 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="wide">Wide</SelectItem>
                      <SelectItem value="wider">Wider</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-zinc-400">Word Spacing</Label>
                  <Select
                    value={config.text.wordSpacing}
                    onValueChange={(v) =>
                      updateText({ wordSpacing: v as TextAccessibilityConfig['wordSpacing'] })
                    }
                  >
                    <SelectTrigger className="h-8 bg-zinc-900 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="wide">Wide</SelectItem>
                      <SelectItem value="wider">Wider</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Section>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Visual Tab */}
        <TabsContent value="visual" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full px-4 py-3">
            <div className="space-y-4">
              <Section title="Display">
                <ToggleRow
                  label="High Contrast Mode"
                  description="Increase color contrast"
                  checked={config.visual.highContrast}
                  onCheckedChange={(checked) => updateVisual({ highContrast: checked })}
                />
                <ToggleRow
                  label="Reduce Motion"
                  description="Minimize animations"
                  checked={config.visual.reduceMotion}
                  onCheckedChange={(checked) => updateVisual({ reduceMotion: checked })}
                />
                <ToggleRow
                  label="Reduce Transparency"
                  description="Use solid backgrounds"
                  checked={config.visual.reduceTransparency}
                  onCheckedChange={(checked) => updateVisual({ reduceTransparency: checked })}
                />
              </Section>

              <Section title="Color Vision">
                <div className="space-y-2">
                  <Label className="text-xs text-zinc-400">Color Blind Mode</Label>
                  <Select
                    value={config.visual.colorBlindMode}
                    onValueChange={(v) =>
                      updateVisual({
                        colorBlindMode: v as VisualAccessibilityConfig['colorBlindMode'],
                      })
                    }
                  >
                    <SelectTrigger className="h-8 bg-zinc-900 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="protanopia">Protanopia (Red-blind)</SelectItem>
                      <SelectItem value="deuteranopia">Deuteranopia (Green-blind)</SelectItem>
                      <SelectItem value="tritanopia">Tritanopia (Blue-blind)</SelectItem>
                      <SelectItem value="achromatopsia">Achromatopsia (Grayscale)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Section>

              <Section title="Focus">
                <div className="space-y-2">
                  <Label className="text-xs text-zinc-400">Focus Indicator</Label>
                  <Select
                    value={config.visual.focusIndicator}
                    onValueChange={(v) =>
                      updateVisual({
                        focusIndicator: v as VisualAccessibilityConfig['focusIndicator'],
                      })
                    }
                  >
                    <SelectTrigger className="h-8 bg-zinc-900 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="high-visibility">High Visibility</SelectItem>
                      <SelectItem value="custom">Custom Color</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {config.visual.focusIndicator === 'custom' && (
                  <div className="space-y-2">
                    <Label className="text-xs text-zinc-400">Focus Color</Label>
                    <Input
                      type="color"
                      value={config.visual.focusColor || '#0072f5'}
                      onChange={(e) => updateVisual({ focusColor: e.target.value })}
                      className="h-8 w-full bg-zinc-900 border-white/10"
                    />
                  </div>
                )}

                <ToggleRow
                  label="Always Show Focus"
                  description="Show focus outlines even with mouse"
                  checked={config.visual.alwaysShowFocus}
                  onCheckedChange={(checked) => updateVisual({ alwaysShowFocus: checked })}
                />
              </Section>

              <Section title="Images">
                <ToggleRow
                  label="Show Image Descriptions"
                  description="Display alt text below images"
                  checked={config.visual.showImageDescriptions}
                  onCheckedChange={(checked) => updateVisual({ showImageDescriptions: checked })}
                />
              </Section>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Audio Tab */}
        <TabsContent value="audio" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full px-4 py-3">
            <div className="space-y-4">
              <Section title="Volume">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-zinc-400">Default Volume</Label>
                    <span className="text-xs text-zinc-500">{config.audio.defaultVolume}%</span>
                  </div>
                  <Slider
                    value={[config.audio.defaultVolume]}
                    onValueChange={([value]) => updateAudio({ defaultVolume: value })}
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>
                <ToggleRow
                  label="Auto-play Media"
                  description="Start audio/video automatically"
                  checked={config.audio.autoPlay}
                  onCheckedChange={(checked) => updateAudio({ autoPlay: checked })}
                />
              </Section>

              <Section title="Captions">
                <ToggleRow
                  label="Show Captions"
                  description="Enable closed captions by default"
                  checked={config.audio.showCaptions}
                  onCheckedChange={(checked) => updateAudio({ showCaptions: checked })}
                />

                {config.audio.showCaptions && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-zinc-400">Caption Size</Label>
                        <span className="text-xs text-zinc-500">
                          {config.audio.captionStyle.fontSize}%
                        </span>
                      </div>
                      <Slider
                        value={[config.audio.captionStyle.fontSize]}
                        onValueChange={([value]) =>
                          updateAudio({
                            captionStyle: { ...config.audio.captionStyle, fontSize: value },
                          })
                        }
                        min={75}
                        max={200}
                        step={25}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] text-zinc-500">Text Color</Label>
                        <Input
                          type="color"
                          value={config.audio.captionStyle.textColor}
                          onChange={(e) =>
                            updateAudio({
                              captionStyle: {
                                ...config.audio.captionStyle,
                                textColor: e.target.value,
                              },
                            })
                          }
                          className="h-7 w-full bg-zinc-900 border-white/10"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-zinc-500">Background</Label>
                        <Input
                          type="color"
                          value={config.audio.captionStyle.backgroundColor}
                          onChange={(e) =>
                            updateAudio({
                              captionStyle: {
                                ...config.audio.captionStyle,
                                backgroundColor: e.target.value,
                              },
                            })
                          }
                          className="h-7 w-full bg-zinc-900 border-white/10"
                        />
                      </div>
                    </div>
                  </>
                )}
              </Section>

              <Section title="Assistive Features">
                <ToggleRow
                  label="Audio Descriptions"
                  description="Narrate visual elements"
                  checked={config.audio.audioDescriptions}
                  onCheckedChange={(checked) => updateAudio({ audioDescriptions: checked })}
                />
                <ToggleRow
                  label="Sign Language"
                  description="Show interpreter window"
                  checked={config.audio.signLanguage}
                  onCheckedChange={(checked) => updateAudio({ signLanguage: checked })}
                />
              </Section>

              <Section title="Text to Speech">
                <ToggleRow
                  label="Enable TTS"
                  description="Read content aloud"
                  checked={config.audio.textToSpeech}
                  onCheckedChange={(checked) => updateAudio({ textToSpeech: checked })}
                />

                {config.audio.textToSpeech && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-zinc-400">Speech Rate</Label>
                      <span className="text-xs text-zinc-500">{config.audio.ttsRate}x</span>
                    </div>
                    <Slider
                      value={[config.audio.ttsRate * 10]}
                      onValueChange={([value]) => updateAudio({ ttsRate: value / 10 })}
                      min={5}
                      max={20}
                      step={1}
                    />
                  </div>
                )}
              </Section>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Navigation Tab */}
        <TabsContent value="nav" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full px-4 py-3">
            <div className="space-y-4">
              <Section title="Keyboard">
                <ToggleRow
                  label="Keyboard Navigation"
                  description="Navigate with keyboard only"
                  checked={config.navigation.keyboardNav}
                  onCheckedChange={(checked) => updateNavigation({ keyboardNav: checked })}
                />
                <ToggleRow
                  label="Skip Links"
                  description="Show skip to content links"
                  checked={config.navigation.skipLinks}
                  onCheckedChange={(checked) => updateNavigation({ skipLinks: checked })}
                />
              </Section>

              <Section title="Screen Reader">
                <ToggleRow
                  label="Screen Reader Mode"
                  description="Optimize for screen readers"
                  checked={config.navigation.screenReaderMode}
                  onCheckedChange={(checked) => updateNavigation({ screenReaderMode: checked })}
                />
                <ToggleRow
                  label="Announce Page Changes"
                  description="Announce when navigating"
                  checked={config.navigation.announcePageChanges}
                  onCheckedChange={(checked) => updateNavigation({ announcePageChanges: checked })}
                />
                <ToggleRow
                  label="Announce Interactions"
                  description="Announce button clicks, etc."
                  checked={config.navigation.announceInteractions}
                  onCheckedChange={(checked) => updateNavigation({ announceInteractions: checked })}
                />
              </Section>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Timing Tab */}
        <TabsContent value="timing" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full px-4 py-3">
            <div className="space-y-4">
              <Section title="Extended Time">
                <ToggleRow
                  label="Allow Extended Time"
                  description="Give more time for timed activities"
                  checked={config.timing.allowExtendedTime}
                  onCheckedChange={(checked) => updateTiming({ allowExtendedTime: checked })}
                />

                {config.timing.allowExtendedTime && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-zinc-400">Time Multiplier</Label>
                      <span className="text-xs text-zinc-500">{config.timing.timeMultiplier}x</span>
                    </div>
                    <Slider
                      value={[config.timing.timeMultiplier * 10]}
                      onValueChange={([value]) => updateTiming({ timeMultiplier: value / 10 })}
                      min={10}
                      max={30}
                      step={5}
                    />
                  </div>
                )}
              </Section>

              <Section title="Pausing">
                <ToggleRow
                  label="Pause on Focus Loss"
                  description="Pause when window loses focus"
                  checked={config.timing.pauseOnFocusLoss}
                  onCheckedChange={(checked) => updateTiming({ pauseOnFocusLoss: checked })}
                />
                <ToggleRow
                  label="Disable Auto-Advance"
                  description="Require manual navigation"
                  checked={config.timing.disableAutoAdvance}
                  onCheckedChange={(checked) => updateTiming({ disableAutoAdvance: checked })}
                />
              </Section>

              <Section title="Warnings">
                <ToggleRow
                  label="Timeout Warning"
                  description="Warn before time runs out"
                  checked={config.timing.timeoutWarning}
                  onCheckedChange={(checked) => updateTiming({ timeoutWarning: checked })}
                />

                {config.timing.timeoutWarning && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-zinc-400">Warning Time</Label>
                      <span className="text-xs text-zinc-500">
                        {config.timing.timeoutWarningSeconds}s
                      </span>
                    </div>
                    <Slider
                      value={[config.timing.timeoutWarningSeconds]}
                      onValueChange={([value]) => updateTiming({ timeoutWarningSeconds: value })}
                      min={10}
                      max={120}
                      step={10}
                    />
                  </div>
                )}
              </Section>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AccessibilityControls;
