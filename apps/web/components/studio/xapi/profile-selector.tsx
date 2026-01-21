'use client';

/**
 * ProfileSelector - xAPI Profile Selector
 *
 * Allows selection between xAPI, cmi5, and SCORM-to-xAPI profiles
 * with configuration options for each profile type.
 */

import {
  BookOpen,
  Check,
  ChevronRight,
  FileCode,
  GraduationCap,
  Info,
  Settings,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export type XAPIProfileType = 'xapi' | 'cmi5' | 'scorm-to-xapi';

export interface XAPIProfileConfig {
  profile: XAPIProfileType;

  // xAPI-specific settings
  xapi?: {
    verbProfile: 'adl' | 'tincan' | 'custom';
    activityIdBase: string;
    includeContext: boolean;
    includeTimestamp: boolean;
  };

  // cmi5-specific settings
  cmi5?: {
    moveOn: 'Passed' | 'Completed' | 'CompletedAndPassed' | 'CompletedOrPassed' | 'NotApplicable';
    masteryScore?: number;
    launchMode: 'Normal' | 'Browse' | 'Review';
    publisherId?: string;
    returnUrl?: string;
  };

  // SCORM-to-xAPI mapping settings
  scormMapping?: {
    scormVersion: '1.2' | '2004';
    mapBookmark: boolean;
    mapSuspendData: boolean;
    mapInteractions: boolean;
    mapObjectives: boolean;
    preserveScormIds: boolean;
  };
}

interface ProfileSelectorProps {
  value: XAPIProfileConfig;
  onChange: (config: XAPIProfileConfig) => void;
  className?: string;
}

interface ProfileOptionProps {
  profile: XAPIProfileType;
  title: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
}

// =============================================================================
// DEFAULT CONFIG
// =============================================================================

export const DEFAULT_PROFILE_CONFIG: XAPIProfileConfig = {
  profile: 'xapi',
  xapi: {
    verbProfile: 'adl',
    activityIdBase: 'https://inspire.lxd360.com/activities',
    includeContext: true,
    includeTimestamp: true,
  },
  cmi5: {
    moveOn: 'CompletedAndPassed',
    launchMode: 'Normal',
  },
  scormMapping: {
    scormVersion: '2004',
    mapBookmark: true,
    mapSuspendData: true,
    mapInteractions: true,
    mapObjectives: true,
    preserveScormIds: false,
  },
};

// =============================================================================
// PROFILE OPTION COMPONENT
// =============================================================================

function ProfileOption({
  profile: _profile,
  title,
  description,
  icon,
  selected,
  onSelect,
}: ProfileOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex items-start gap-4 p-4 rounded-lg border text-left transition-all w-full',
        selected
          ? 'border-blue-500 bg-blue-500/10'
          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10',
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
          selected ? 'bg-blue-500 text-white' : 'bg-white/10 text-zinc-400',
        )}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-zinc-200">{title}</span>
          {selected && <Check className="h-4 w-4 text-blue-500" />}
        </div>
        <p className="text-sm text-zinc-400 mt-1">{description}</p>
      </div>

      <ChevronRight
        className={cn('h-5 w-5 text-zinc-500 transition-transform', selected && 'rotate-90')}
      />
    </button>
  );
}

// =============================================================================
// PROFILE SETTINGS PANELS
// =============================================================================

interface XAPISettingsProps {
  config: NonNullable<XAPIProfileConfig['xapi']>;
  onChange: (config: NonNullable<XAPIProfileConfig['xapi']>) => void;
}

function XAPISettings({ config, onChange }: XAPISettingsProps) {
  return (
    <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
      <h4 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
        <Settings className="h-4 w-4" />
        xAPI Settings
      </h4>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="verb-profile">Verb Profile</Label>
          <Select
            value={config.verbProfile}
            onValueChange={(value) =>
              onChange({ ...config, verbProfile: value as 'adl' | 'tincan' | 'custom' })
            }
          >
            <SelectTrigger id="verb-profile" className="bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="adl">ADL (Recommended)</SelectItem>
              <SelectItem value="tincan">Tin Can / Rustici</SelectItem>
              <SelectItem value="custom">Custom Verbs</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-zinc-500">Verb IRI source for statements</p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="activity-base">Activity ID Base URL</Label>
          <Input
            id="activity-base"
            value={config.activityIdBase}
            onChange={(e) => onChange({ ...config, activityIdBase: e.target.value })}
            placeholder="https://example.com/activities"
            className="bg-white/5 border-white/10"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox
              id="include-context"
              checked={config.includeContext}
              onCheckedChange={(checked) =>
                onChange({ ...config, includeContext: checked === true })
              }
            />
            <Label htmlFor="include-context" className="font-normal cursor-pointer">
              Include context (registration, platform)
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="include-timestamp"
              checked={config.includeTimestamp}
              onCheckedChange={(checked) =>
                onChange({ ...config, includeTimestamp: checked === true })
              }
            />
            <Label htmlFor="include-timestamp" className="font-normal cursor-pointer">
              Include timestamp on all statements
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CMI5SettingsProps {
  config: NonNullable<XAPIProfileConfig['cmi5']>;
  onChange: (config: NonNullable<XAPIProfileConfig['cmi5']>) => void;
}

function CMI5Settings({ config, onChange }: CMI5SettingsProps) {
  return (
    <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
      <h4 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
        <Settings className="h-4 w-4" />
        cmi5 Settings
      </h4>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="move-on">Move On Criteria</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-zinc-500" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    Defines when the AU (Assignable Unit) is considered satisfied and the learner
                    can move to the next content.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select
            value={config.moveOn}
            onValueChange={(value) =>
              onChange({ ...config, moveOn: value as typeof config.moveOn })
            }
          >
            <SelectTrigger id="move-on" className="bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Passed">Passed</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="CompletedAndPassed">Completed AND Passed</SelectItem>
              <SelectItem value="CompletedOrPassed">Completed OR Passed</SelectItem>
              <SelectItem value="NotApplicable">Not Applicable</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="mastery-score">Mastery Score (0-100)</Label>
          <Input
            id="mastery-score"
            type="number"
            min={0}
            max={100}
            value={config.masteryScore ?? ''}
            onChange={(e) =>
              onChange({
                ...config,
                masteryScore: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="Optional"
            className="bg-white/5 border-white/10"
          />
          <p className="text-xs text-zinc-500">Minimum score required for &quot;Passed&quot;</p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="launch-mode">Launch Mode</Label>
          <Select
            value={config.launchMode}
            onValueChange={(value) =>
              onChange({ ...config, launchMode: value as typeof config.launchMode })
            }
          >
            <SelectTrigger id="launch-mode" className="bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Normal">Normal (full tracking)</SelectItem>
              <SelectItem value="Browse">Browse (preview, no tracking)</SelectItem>
              <SelectItem value="Review">Review (read-only)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="publisher-id">Publisher ID (Optional)</Label>
          <Input
            id="publisher-id"
            value={config.publisherId ?? ''}
            onChange={(e) => onChange({ ...config, publisherId: e.target.value || undefined })}
            placeholder="https://publisher.example.com"
            className="bg-white/5 border-white/10"
          />
        </div>
      </div>
    </div>
  );
}

interface SCORMMappingSettingsProps {
  config: NonNullable<XAPIProfileConfig['scormMapping']>;
  onChange: (config: NonNullable<XAPIProfileConfig['scormMapping']>) => void;
}

function SCORMMappingSettings({ config, onChange }: SCORMMappingSettingsProps) {
  return (
    <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
      <h4 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
        <Settings className="h-4 w-4" />
        SCORM-to-xAPI Mapping
      </h4>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="scorm-version">SCORM Version</Label>
          <Select
            value={config.scormVersion}
            onValueChange={(value) =>
              onChange({ ...config, scormVersion: value as '1.2' | '2004' })
            }
          >
            <SelectTrigger id="scorm-version" className="bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1.2">SCORM 1.2</SelectItem>
              <SelectItem value="2004">SCORM 2004</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="text-xs text-zinc-500 uppercase tracking-wider">Data Mapping</div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="map-bookmark"
              checked={config.mapBookmark}
              onCheckedChange={(checked) => onChange({ ...config, mapBookmark: checked === true })}
            />
            <Label htmlFor="map-bookmark" className="font-normal cursor-pointer">
              Map cmi.location/cmi.core.lesson_location to xAPI state
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="map-suspend-data"
              checked={config.mapSuspendData}
              onCheckedChange={(checked) =>
                onChange({ ...config, mapSuspendData: checked === true })
              }
            />
            <Label htmlFor="map-suspend-data" className="font-normal cursor-pointer">
              Map cmi.suspend_data to xAPI state
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="map-interactions"
              checked={config.mapInteractions}
              onCheckedChange={(checked) =>
                onChange({ ...config, mapInteractions: checked === true })
              }
            />
            <Label htmlFor="map-interactions" className="font-normal cursor-pointer">
              Map cmi.interactions to xAPI statements
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="map-objectives"
              checked={config.mapObjectives}
              onCheckedChange={(checked) =>
                onChange({ ...config, mapObjectives: checked === true })
              }
            />
            <Label htmlFor="map-objectives" className="font-normal cursor-pointer">
              Map cmi.objectives to xAPI statements
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="preserve-scorm-ids"
              checked={config.preserveScormIds}
              onCheckedChange={(checked) =>
                onChange({ ...config, preserveScormIds: checked === true })
              }
            />
            <Label htmlFor="preserve-scorm-ids" className="font-normal cursor-pointer">
              Preserve original SCORM IDs in extensions
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ProfileSelector({ value, onChange, className }: ProfileSelectorProps) {
  const [expanded, setExpanded] = useState(true);

  const handleProfileSelect = useCallback(
    (profile: XAPIProfileType) => {
      onChange({ ...value, profile });
    },
    [value, onChange],
  );

  const updateXAPIConfig = useCallback(
    (xapi: NonNullable<XAPIProfileConfig['xapi']>) => {
      onChange({ ...value, xapi });
    },
    [value, onChange],
  );

  const updateCMI5Config = useCallback(
    (cmi5: NonNullable<XAPIProfileConfig['cmi5']>) => {
      onChange({ ...value, cmi5 });
    },
    [value, onChange],
  );

  const updateSCORMConfig = useCallback(
    (scormMapping: NonNullable<XAPIProfileConfig['scormMapping']>) => {
      onChange({ ...value, scormMapping });
    },
    [value, onChange],
  );

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-300">xAPI Profile</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="text-zinc-400"
        >
          {expanded ? 'Collapse' : 'Expand'}
        </Button>
      </div>

      {/* Profile Options */}
      <div className="space-y-2">
        <ProfileOption
          profile="xapi"
          title="Standard xAPI"
          description="ADL Experience API 1.0.3 - Compatible with most LRS systems"
          icon={<FileCode className="h-5 w-5" />}
          selected={value.profile === 'xapi'}
          onSelect={() => handleProfileSelect('xapi')}
        />

        <ProfileOption
          profile="cmi5"
          title="cmi5"
          description="xAPI profile for traditional LMS - enhanced interoperability"
          icon={<GraduationCap className="h-5 w-5" />}
          selected={value.profile === 'cmi5'}
          onSelect={() => handleProfileSelect('cmi5')}
        />

        <ProfileOption
          profile="scorm-to-xapi"
          title="SCORM-to-xAPI"
          description="Convert SCORM data model calls to xAPI statements"
          icon={<BookOpen className="h-5 w-5" />}
          selected={value.profile === 'scorm-to-xapi'}
          onSelect={() => handleProfileSelect('scorm-to-xapi')}
        />
      </div>

      {/* Profile-specific Settings */}
      {expanded && (
        <div className="mt-4">
          {value.profile === 'xapi' && value.xapi && (
            <XAPISettings config={value.xapi} onChange={updateXAPIConfig} />
          )}

          {value.profile === 'cmi5' && value.cmi5 && (
            <CMI5Settings config={value.cmi5} onChange={updateCMI5Config} />
          )}

          {value.profile === 'scorm-to-xapi' && value.scormMapping && (
            <SCORMMappingSettings config={value.scormMapping} onChange={updateSCORMConfig} />
          )}
        </div>
      )}
    </div>
  );
}
