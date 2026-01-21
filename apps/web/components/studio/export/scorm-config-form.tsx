'use client';

/**
 * ScormConfigForm - SCORM-specific export configuration
 *
 * Allows configuration of manifest settings, player behavior,
 * and optimization options for SCORM packages.
 */

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import type { ScormExportConfig } from '@/types/studio/publishing';

// =============================================================================
// TYPES
// =============================================================================

interface ScormConfigFormProps {
  config: ScormExportConfig;
  onChange: (config: ScormExportConfig) => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ScormConfigForm({ config, onChange }: ScormConfigFormProps) {
  const updateManifest = (updates: Partial<ScormExportConfig['manifest']>) => {
    onChange({
      ...config,
      manifest: { ...config.manifest, ...updates },
    });
  };

  const updatePlayerSettings = (updates: Partial<ScormExportConfig['playerSettings']>) => {
    onChange({
      ...config,
      playerSettings: { ...config.playerSettings, ...updates },
    });
  };

  const updateOptimization = (updates: Partial<ScormExportConfig['optimization']>) => {
    onChange({
      ...config,
      optimization: { ...config.optimization, ...updates },
    });
  };

  return (
    <div className="space-y-6">
      {/* Manifest Settings */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-300 border-b border-white/10 pb-2">
          Package Information
        </h3>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="manifest-title">Course Title</Label>
            <Input
              id="manifest-title"
              value={config.manifest.title}
              onChange={(e) => updateManifest({ title: e.target.value })}
              placeholder="Enter course title"
              className="bg-white/5 border-white/10"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="manifest-description">Description (Optional)</Label>
            <Input
              id="manifest-description"
              value={config.manifest.description || ''}
              onChange={(e) => updateManifest({ description: e.target.value })}
              placeholder="Brief course description"
              className="bg-white/5 border-white/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="manifest-identifier">Course Identifier</Label>
              <Input
                id="manifest-identifier"
                value={config.manifest.identifier}
                onChange={(e) => updateManifest({ identifier: e.target.value })}
                placeholder="course_001"
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mastery-score">Mastery Score (%)</Label>
              <Input
                id="mastery-score"
                type="number"
                min={0}
                max={100}
                value={config.manifest.masteryScore || 80}
                onChange={(e) => updateManifest({ masteryScore: Number(e.target.value) })}
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Player Settings */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-300 border-b border-white/10 pb-2">
          Player Behavior
        </h3>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Completion Criteria</Label>
            <Select
              value={config.playerSettings.completionCriteria}
              onValueChange={(value) =>
                updatePlayerSettings({
                  completionCriteria:
                    value as ScormExportConfig['playerSettings']['completionCriteria'],
                })
              }
            >
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="allSlides">View All Slides</SelectItem>
                <SelectItem value="passingScore">Achieve Passing Score</SelectItem>
                <SelectItem value="either">Either (Slides OR Score)</SelectItem>
                <SelectItem value="both">Both (Slides AND Score)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Passing Score: {config.playerSettings.passingScore}%</Label>
            <Slider
              value={[config.playerSettings.passingScore]}
              onValueChange={([value]) => updatePlayerSettings({ passingScore: value })}
              min={0}
              max={100}
              step={5}
              className="py-2"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Checkbox
                id="auto-advance"
                checked={config.playerSettings.autoAdvance}
                onCheckedChange={(checked) =>
                  updatePlayerSettings({ autoAdvance: checked === true })
                }
              />
              <Label htmlFor="auto-advance" className="font-normal cursor-pointer">
                Auto-advance through slides
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="allow-back-nav"
                checked={config.playerSettings.allowBackNavigation}
                onCheckedChange={(checked) =>
                  updatePlayerSettings({ allowBackNavigation: checked === true })
                }
              />
              <Label htmlFor="allow-back-nav" className="font-normal cursor-pointer">
                Allow backward navigation
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="show-navigation"
                checked={config.playerSettings.showNavigation}
                onCheckedChange={(checked) =>
                  updatePlayerSettings({ showNavigation: checked === true })
                }
              />
              <Label htmlFor="show-navigation" className="font-normal cursor-pointer">
                Show navigation controls
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="show-progress"
                checked={config.playerSettings.showProgress}
                onCheckedChange={(checked) =>
                  updatePlayerSettings({ showProgress: checked === true })
                }
              />
              <Label htmlFor="show-progress" className="font-normal cursor-pointer">
                Show progress indicator
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="keyboard-nav"
                checked={config.playerSettings.enableKeyboardNav}
                onCheckedChange={(checked) =>
                  updatePlayerSettings({ enableKeyboardNav: checked === true })
                }
              />
              <Label htmlFor="keyboard-nav" className="font-normal cursor-pointer">
                Enable keyboard navigation
              </Label>
            </div>
          </div>
        </div>
      </div>

      {/* Optimization Settings */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-300 border-b border-white/10 pb-2">
          Optimization
        </h3>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox
              id="compress-images"
              checked={config.optimization.compressImages}
              onCheckedChange={(checked) =>
                updateOptimization({ compressImages: checked === true })
              }
            />
            <Label htmlFor="compress-images" className="font-normal cursor-pointer">
              Compress images
            </Label>
          </div>

          {config.optimization.compressImages && (
            <div className="ml-6 grid gap-2">
              <Label>Image Quality: {config.optimization.imageQuality}%</Label>
              <Slider
                value={[config.optimization.imageQuality]}
                onValueChange={([value]) => updateOptimization({ imageQuality: value })}
                min={50}
                max={100}
                step={5}
                className="py-2"
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            <Checkbox
              id="minify-js"
              checked={config.optimization.minifyJs}
              onCheckedChange={(checked) => updateOptimization({ minifyJs: checked === true })}
            />
            <Label htmlFor="minify-js" className="font-normal cursor-pointer">
              Minify JavaScript
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="minify-css"
              checked={config.optimization.minifyCss}
              onCheckedChange={(checked) => updateOptimization({ minifyCss: checked === true })}
            />
            <Label htmlFor="minify-css" className="font-normal cursor-pointer">
              Minify CSS
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}
