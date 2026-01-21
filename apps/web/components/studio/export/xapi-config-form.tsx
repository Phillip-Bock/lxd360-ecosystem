'use client';

/**
 * XAPIConfigForm - xAPI-specific export configuration
 *
 * Allows configuration of LRS settings, statement tracking options,
 * and player behavior for xAPI packages.
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
import type { XAPIExportConfig } from '@/types/studio/publishing';

// =============================================================================
// TYPES
// =============================================================================

interface XAPIConfigFormProps {
  config: XAPIExportConfig;
  onChange: (config: XAPIExportConfig) => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function XAPIConfigForm({ config, onChange }: XAPIConfigFormProps) {
  const updateLrs = (updates: Partial<XAPIExportConfig['lrs']>) => {
    onChange({
      ...config,
      lrs: { ...config.lrs, ...updates },
    });
  };

  const updateStatements = (updates: Partial<XAPIExportConfig['statements']>) => {
    onChange({
      ...config,
      statements: { ...config.statements, ...updates },
    });
  };

  const updatePlayerSettings = (updates: Partial<XAPIExportConfig['playerSettings']>) => {
    onChange({
      ...config,
      playerSettings: { ...config.playerSettings, ...updates },
    });
  };

  const updateOptimization = (updates: Partial<XAPIExportConfig['optimization']>) => {
    onChange({
      ...config,
      optimization: { ...config.optimization, ...updates },
    });
  };

  return (
    <div className="space-y-6">
      {/* LRS Configuration */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-300 border-b border-white/10 pb-2">
          LRS Configuration
        </h3>

        <div className="grid gap-4">
          <div className="flex items-center gap-3">
            <Checkbox
              id="prompt-for-config"
              checked={config.lrs.promptForConfig}
              onCheckedChange={(checked) => updateLrs({ promptForConfig: checked === true })}
            />
            <div className="grid gap-1">
              <Label htmlFor="prompt-for-config" className="font-normal cursor-pointer">
                Prompt for LRS configuration at launch
              </Label>
              <p className="text-xs text-zinc-500">
                Learner will enter LRS details when starting the course
              </p>
            </div>
          </div>

          {!config.lrs.promptForConfig && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="lrs-endpoint">LRS Endpoint URL</Label>
                <Input
                  id="lrs-endpoint"
                  value={config.lrs.endpoint || ''}
                  onChange={(e) => updateLrs({ endpoint: e.target.value })}
                  placeholder="https://your-lrs.com/xapi/"
                  className="bg-white/5 border-white/10"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="lrs-auth">Authorization Header</Label>
                <Input
                  id="lrs-auth"
                  type="password"
                  value={config.lrs.auth || ''}
                  onChange={(e) => updateLrs({ auth: e.target.value })}
                  placeholder="Basic xxxxx or Bearer xxxxx"
                  className="bg-white/5 border-white/10"
                />
                <p className="text-xs text-zinc-500">
                  Base64-encoded credentials for Basic auth, or Bearer token
                </p>
              </div>
            </>
          )}

          <div className="grid gap-2">
            <Label htmlFor="activity-base">Activity ID Base URL</Label>
            <Input
              id="activity-base"
              value={config.lrs.activityIdBase}
              onChange={(e) => updateLrs({ activityIdBase: e.target.value })}
              placeholder="https://inspire.lxd360.com/activities"
              className="bg-white/5 border-white/10"
            />
            <p className="text-xs text-zinc-500">Base URL for activity IDs in xAPI statements</p>
          </div>
        </div>
      </div>

      {/* Statement Tracking */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-300 border-b border-white/10 pb-2">
          Statement Tracking
        </h3>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox
              id="track-slides"
              checked={config.statements.trackSlides}
              onCheckedChange={(checked) => updateStatements({ trackSlides: checked === true })}
            />
            <div className="grid gap-1">
              <Label htmlFor="track-slides" className="font-normal cursor-pointer">
                Track slide views
              </Label>
              <p className="text-xs text-zinc-500">Record when learners view each slide</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="track-interactions"
              checked={config.statements.trackInteractions}
              onCheckedChange={(checked) =>
                updateStatements({ trackInteractions: checked === true })
              }
            />
            <div className="grid gap-1">
              <Label htmlFor="track-interactions" className="font-normal cursor-pointer">
                Track interactions
              </Label>
              <p className="text-xs text-zinc-500">
                Record quiz answers, button clicks, accordion opens, etc.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="track-media"
              checked={config.statements.trackMedia}
              onCheckedChange={(checked) => updateStatements({ trackMedia: checked === true })}
            />
            <div className="grid gap-1">
              <Label htmlFor="track-media" className="font-normal cursor-pointer">
                Track media events
              </Label>
              <p className="text-xs text-zinc-500">
                Record video play, pause, seek, and completion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="extended-verbs"
              checked={config.statements.includeExtendedVerbs}
              onCheckedChange={(checked) =>
                updateStatements({ includeExtendedVerbs: checked === true })
              }
            />
            <div className="grid gap-1">
              <Label htmlFor="extended-verbs" className="font-normal cursor-pointer">
                Include extended verbs
              </Label>
              <p className="text-xs text-zinc-500">
                Use detailed verbs like &quot;progressed&quot;, &quot;suspended&quot;,
                &quot;resumed&quot;
              </p>
            </div>
          </div>

          <div className="grid gap-2 pt-2">
            <Label>Statement Batch Size: {config.statements.batchSize}</Label>
            <Slider
              value={[config.statements.batchSize]}
              onValueChange={([value]) => updateStatements({ batchSize: value })}
              min={1}
              max={50}
              step={1}
              className="py-2"
            />
            <p className="text-xs text-zinc-500">
              Number of statements to batch before sending to LRS
            </p>
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
                    value as XAPIExportConfig['playerSettings']['completionCriteria'],
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
                id="xapi-allow-back-nav"
                checked={config.playerSettings.allowBackNavigation}
                onCheckedChange={(checked) =>
                  updatePlayerSettings({ allowBackNavigation: checked === true })
                }
              />
              <Label htmlFor="xapi-allow-back-nav" className="font-normal cursor-pointer">
                Allow backward navigation
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="xapi-show-navigation"
                checked={config.playerSettings.showNavigation}
                onCheckedChange={(checked) =>
                  updatePlayerSettings({ showNavigation: checked === true })
                }
              />
              <Label htmlFor="xapi-show-navigation" className="font-normal cursor-pointer">
                Show navigation controls
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="xapi-show-progress"
                checked={config.playerSettings.showProgress}
                onCheckedChange={(checked) =>
                  updatePlayerSettings({ showProgress: checked === true })
                }
              />
              <Label htmlFor="xapi-show-progress" className="font-normal cursor-pointer">
                Show progress indicator
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
              id="xapi-compress-images"
              checked={config.optimization.compressImages}
              onCheckedChange={(checked) =>
                updateOptimization({ compressImages: checked === true })
              }
            />
            <Label htmlFor="xapi-compress-images" className="font-normal cursor-pointer">
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
              id="xapi-minify-js"
              checked={config.optimization.minifyJs}
              onCheckedChange={(checked) => updateOptimization({ minifyJs: checked === true })}
            />
            <Label htmlFor="xapi-minify-js" className="font-normal cursor-pointer">
              Minify JavaScript
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="xapi-minify-css"
              checked={config.optimization.minifyCss}
              onCheckedChange={(checked) => updateOptimization({ minifyCss: checked === true })}
            />
            <Label htmlFor="xapi-minify-css" className="font-normal cursor-pointer">
              Minify CSS
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}
