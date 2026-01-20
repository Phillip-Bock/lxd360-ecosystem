'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Building2, Check, Crown, Eye, Lock, Search, Sparkles, Zap } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  tier: 'basic' | 'professional' | 'enterprise' | 'white-label';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  previewImage?: string;
  isPopular?: boolean;
  isNew?: boolean;
}

interface PresetGalleryProps {
  presets: ThemePreset[];
  currentTier: ThemePreset['tier'];
  selectedPresetId?: string;
  onSelectPreset: (preset: ThemePreset) => void;
  onPreviewPreset?: (preset: ThemePreset) => void;
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const TIER_CONFIG = {
  basic: {
    label: 'Basic',
    icon: Zap,
    color: 'text-gray-400',
    bg: 'bg-gray-500/20',
    order: 0,
  },
  professional: {
    label: 'Professional',
    icon: Sparkles,
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    order: 1,
  },
  enterprise: {
    label: 'Enterprise',
    icon: Building2,
    color: 'text-purple-400',
    bg: 'bg-purple-500/20',
    order: 2,
  },
  'white-label': {
    label: 'White Label',
    icon: Crown,
    color: 'text-amber-400',
    bg: 'bg-amber-500/20',
    order: 3,
  },
};

const TIER_ORDER: ThemePreset['tier'][] = ['basic', 'professional', 'enterprise', 'white-label'];

function getTierAccess(
  currentTier: ThemePreset['tier'],
  requiredTier: ThemePreset['tier'],
): boolean {
  const currentOrder = TIER_CONFIG[currentTier].order;
  const requiredOrder = TIER_CONFIG[requiredTier].order;
  return currentOrder >= requiredOrder;
}

// ============================================================================
// Sub-Components
// ============================================================================

function PresetCard({
  preset,
  isSelected,
  isLocked,
  onSelect,
  onPreview,
}: {
  preset: ThemePreset;
  isSelected: boolean;
  isLocked: boolean;
  onSelect: () => void;
  onPreview?: () => void;
}): React.JSX.Element {
  const tierConfig = TIER_CONFIG[preset.tier];
  const TierIcon = tierConfig.icon;

  return (
    <motion.div
      whileHover={{ scale: isLocked ? 1 : 1.02 }}
      whileTap={{ scale: isLocked ? 1 : 0.98 }}
      className={cn(
        'relative rounded-xl overflow-hidden border-2 transition-all',
        isSelected
          ? 'border-primary-500 ring-2 ring-primary-500/30'
          : isLocked
            ? 'border-white/10 opacity-60'
            : 'border-white/10 hover:border-white/20',
      )}
    >
      {/* Color preview */}
      <div className="relative aspect-[4/3]">
        {/* Background */}
        <div className="absolute inset-0" style={{ backgroundColor: preset.colors.background }} />

        {/* Simulated UI elements */}
        <div className="absolute inset-0 p-4 flex flex-col">
          {/* Header bar */}
          <div
            className="h-3 w-24 rounded-full mb-4"
            style={{ backgroundColor: preset.colors.primary }}
          />

          {/* Content blocks */}
          <div className="flex-1 flex gap-3">
            <div className="flex-1 space-y-2">
              <div className="h-8 rounded-lg" style={{ backgroundColor: preset.colors.primary }} />
              <div
                className="h-16 rounded-lg opacity-50"
                style={{ backgroundColor: preset.colors.secondary }}
              />
            </div>
            <div className="w-1/3 rounded-lg" style={{ backgroundColor: preset.colors.accent }} />
          </div>

          {/* Text preview */}
          <div className="mt-4 space-y-1">
            <div
              className="h-2 w-3/4 rounded-full opacity-80"
              style={{ backgroundColor: preset.colors.foreground }}
            />
            <div
              className="h-2 w-1/2 rounded-full opacity-40"
              style={{ backgroundColor: preset.colors.foreground }}
            />
          </div>
        </div>

        {/* Overlay for locked state */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Lock className="h-8 w-8 text-white/80" />
              <span className="text-xs text-white/80 font-medium">{tierConfig.label} Required</span>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          {preset.isNew && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500 text-white">
              NEW
            </span>
          )}
          {preset.isPopular && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-500 text-white">
              POPULAR
            </span>
          )}
        </div>

        {/* Tier badge */}
        <div
          className={cn(
            'absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1',
            tierConfig.bg,
            tierConfig.color,
          )}
        >
          <TierIcon className="h-3 w-3" />
          {tierConfig.label}
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
            <Check className="h-5 w-5 text-white" />
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="p-4 bg-white/5">
        <h4 className="text-sm font-medium text-foreground truncate">{preset.name}</h4>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{preset.description}</p>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          {onPreview && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onPreview();
              }}
              className="flex-1 h-8 text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </Button>
          )}
          <Button
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (!isLocked) onSelect();
            }}
            disabled={isLocked}
            className={cn('flex-1 h-8 text-xs', isSelected && 'bg-primary-500 text-white')}
          >
            {isSelected ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Selected
              </>
            ) : isLocked ? (
              <>
                <Lock className="h-3 w-3 mr-1" />
                Locked
              </>
            ) : (
              'Apply'
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function PresetGallery({
  presets,
  currentTier,
  selectedPresetId,
  onSelectPreset,
  onPreviewPreset,
  className,
}: PresetGalleryProps): React.JSX.Element {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterTier, setFilterTier] = React.useState<ThemePreset['tier'] | 'all'>('all');

  const filteredPresets = React.useMemo(() => {
    return presets.filter((preset) => {
      const matchesSearch =
        preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        preset.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTier = filterTier === 'all' || preset.tier === filterTier;
      return matchesSearch && matchesTier;
    });
  }, [presets, searchQuery, filterTier]);

  const groupedPresets = React.useMemo(() => {
    const groups: Record<ThemePreset['tier'], ThemePreset[]> = {
      basic: [],
      professional: [],
      enterprise: [],
      'white-label': [],
    };

    filteredPresets.forEach((preset) => {
      groups[preset.tier].push(preset);
    });

    return groups;
  }, [filteredPresets]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-linear-to-br from-pink-500/30 to-purple-500/30 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-pink-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Theme Gallery</h3>
            <p className="text-sm text-muted-foreground">
              {presets.length} preset{presets.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>
      </div>

      {/* Search and filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search themes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5">
          <button
            type="button"
            onClick={() => setFilterTier('all')}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              filterTier === 'all'
                ? 'bg-white/20 text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            All
          </button>
          {TIER_ORDER.map((tier) => {
            const config = TIER_CONFIG[tier];
            const TierIcon = config.icon;
            return (
              <button
                type="button"
                key={tier}
                onClick={() => setFilterTier(tier)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1',
                  filterTier === tier
                    ? 'bg-white/20 text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <TierIcon className="h-3 w-3" />
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Your tier indicator */}
      <div
        className={cn(
          'p-3 rounded-lg border flex items-center gap-3',
          TIER_CONFIG[currentTier].bg,
          `border-${TIER_CONFIG[currentTier].color.replace('text-', '')}/30`,
        )}
      >
        <div
          className={cn(
            'h-8 w-8 rounded-lg flex items-center justify-center',
            TIER_CONFIG[currentTier].bg,
          )}
        >
          {React.createElement(TIER_CONFIG[currentTier].icon, {
            className: cn('h-4 w-4', TIER_CONFIG[currentTier].color),
          })}
        </div>
        <div>
          <p className={cn('text-sm font-medium', TIER_CONFIG[currentTier].color)}>
            {TIER_CONFIG[currentTier].label} Plan
          </p>
          <p className="text-xs text-muted-foreground">
            You have access to {TIER_ORDER.slice(0, TIER_CONFIG[currentTier].order + 1).length} tier
            {TIER_CONFIG[currentTier].order > 0 ? 's' : ''} of themes
          </p>
        </div>
      </div>

      {/* Preset grid */}
      <div className="space-y-8">
        {TIER_ORDER.map((tier) => {
          const tierPresets = groupedPresets[tier];
          if (tierPresets.length === 0) return null;

          const config = TIER_CONFIG[tier];
          const TierIcon = config.icon;
          const hasAccess = getTierAccess(currentTier, tier);

          return (
            <div key={tier}>
              <div className="flex items-center gap-2 mb-4">
                <TierIcon className={cn('h-4 w-4', config.color)} />
                <h4 className={cn('text-sm font-medium', config.color)}>{config.label}</h4>
                <span className="text-xs text-muted-foreground">({tierPresets.length})</span>
                {!hasAccess && <Lock className="h-3 w-3 text-muted-foreground ml-2" />}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <AnimatePresence>
                  {tierPresets.map((preset) => (
                    <PresetCard
                      key={preset.id}
                      preset={preset}
                      isSelected={preset.id === selectedPresetId}
                      isLocked={!hasAccess}
                      onSelect={() => onSelectPreset(preset)}
                      onPreview={onPreviewPreset ? () => onPreviewPreset(preset) : undefined}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPresets.length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">No themes match your search</p>
        </div>
      )}
    </div>
  );
}
