'use client';

import { Check, Lock, Palette } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { PlayerSkin } from '@/types/player';

interface SkinsPanelProps {
  currentSkinId: string;
  userId?: string;
  onSkinChange: (skinId: string, cssVariables: Record<string, string>) => void;
  isDemo?: boolean;
}

// Default skins for demo mode
const DEFAULT_SKINS: PlayerSkin[] = [
  {
    id: 'default',
    name: 'Classic Blue',
    description: 'Default clean interface',
    thumbnail_url: null,
    preview_image_url: null,
    css_variables: {
      '--hud-bg': '#030508',
      '--hud-accent': '#00d4ff',
      '--hud-accent-bright': '#00e5ff',
    },
    is_free: true,
    price_credits: null,
    price_cents: null,
    is_premium: false,
    is_featured: true,
    unlock_requirement: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'dark-pro',
    name: 'Dark Mode Pro',
    description: 'Easy on the eyes',
    thumbnail_url: null,
    preview_image_url: null,
    css_variables: {
      '--hud-bg': '#0a0a0a',
      '--hud-accent': '#7103A0',
      '--hud-accent-bright': '#BA23FB',
    },
    is_free: true,
    price_credits: null,
    price_cents: null,
    is_premium: false,
    is_featured: false,
    unlock_requirement: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    description: 'Nature-inspired calm',
    thumbnail_url: null,
    preview_image_url: null,
    css_variables: {
      '--hud-bg': '#021408',
      '--hud-accent': '#166534',
      '--hud-accent-bright': '#22c55e',
    },
    is_free: true,
    price_credits: 100,
    price_cents: null,
    is_premium: false,
    is_featured: false,
    unlock_requirement: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    description: 'Warm and energetic',
    thumbnail_url: null,
    preview_image_url: null,
    css_variables: {
      '--hud-bg': '#140805',
      '--hud-accent': '#c2410c',
      '--hud-accent-bright': '#f97316',
    },
    is_free: true,
    price_credits: 100,
    price_cents: null,
    is_premium: false,
    is_featured: false,
    unlock_requirement: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cosmic-purple',
    name: 'Cosmic Purple',
    description: 'Premium space theme',
    thumbnail_url: null,
    preview_image_url: null,
    css_variables: {
      '--hud-bg': '#0a0514',
      '--hud-accent': '#7103A0',
      '--hud-accent-bright': '#BA23FB',
    },
    is_free: false,
    price_credits: 250,
    price_cents: 499,
    is_premium: true,
    is_featured: true,
    unlock_requirement: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'neon-cyber',
    name: 'Neon Cyber',
    description: 'Futuristic glow',
    thumbnail_url: null,
    preview_image_url: null,
    css_variables: {
      '--hud-bg': '#0f172a',
      '--hud-accent': '#00ff88',
      '--hud-accent-bright': '#00ffaa',
    },
    is_free: false,
    price_credits: 500,
    price_cents: 999,
    is_premium: true,
    is_featured: false,
    unlock_requirement: null,
    created_at: new Date().toISOString(),
  },
];

export function SkinsPanel({
  currentSkinId,
  userId,
  onSkinChange,
  isDemo = false,
}: SkinsPanelProps) {
  const [skins, setSkins] = useState<PlayerSkin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSkin, setSelectedSkin] = useState(currentSkinId);

  useEffect(() => {
    const fetchSkins = async () => {
      if (isDemo) {
        setSkins(DEFAULT_SKINS);
        setIsLoading(false);
        return;
      }

      try {
        // TODO(LXD-297): Implement skin fetching with Firestore
        setSkins(DEFAULT_SKINS);
      } catch {
        // Fall back to default skins on error
        setSkins(DEFAULT_SKINS);
      }
      setIsLoading(false);
    };

    fetchSkins();
  }, [isDemo]);

  const applySkin = async (skin: PlayerSkin) => {
    if (!skin.is_free) return;

    setSelectedSkin(skin.id);
    onSkinChange(skin.id, skin.css_variables);

    if (isDemo || !userId) {
      localStorage.setItem('demo-skin-id', skin.id);
      return;
    }

    try {
      // TODO(LXD-297): Implement skin preference saving with Firestore
      console.error('Save skin preference temporarily unavailable during Firebase migration');
    } catch (error) {
      console.error('Failed to save skin preference:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-[var(--hud-text-muted)]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--hud-border)] border-t-[var(--hud-accent)]" />
        <p className="mt-2 text-sm">Loading skins...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-[var(--hud-border)] p-4">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-[var(--hud-accent-bright)]" />
          <h3 className="font-semibold text-[var(--hud-text)]">Player Skins</h3>
        </div>
        <p className="mt-1 text-xs text-[var(--hud-text-muted)]">
          Customize the look of your learning experience
        </p>
      </div>

      {/* Skins Grid */}
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-2 gap-3 p-4">
          {skins.map((skin) => {
            const isSelected = selectedSkin === skin.id;
            const bgColor = skin.css_variables['--hud-bg'] || '#030508';
            const accentColor = skin.css_variables['--hud-accent'] || '#00d4ff';

            return (
              <button
                type="button"
                key={skin.id}
                onClick={() => applySkin(skin)}
                disabled={!skin.is_free}
                className={cn(
                  'group relative overflow-hidden rounded-xl border-2 p-3 text-left transition-all',
                  isSelected
                    ? 'border-[var(--hud-accent)] bg-[var(--hud-accent)]/10'
                    : 'border-[var(--hud-border)] bg-[var(--hud-bg)]/60 hover:border-[var(--hud-accent)]/50',
                  !skin.is_free && 'opacity-60',
                )}
              >
                {/* Color Preview */}
                <div
                  className="mb-3 h-16 rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor} 60%, ${accentColor} 100%)`,
                  }}
                >
                  {/* Mini HUD preview */}
                  <div className="flex h-full flex-col justify-between p-2">
                    <div
                      className="h-1.5 w-8 rounded-full"
                      style={{ backgroundColor: accentColor }}
                    />
                    <div className="flex gap-1">
                      <div
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: accentColor }}
                      />
                      <div
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: accentColor, opacity: 0.5 }}
                      />
                      <div
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: accentColor, opacity: 0.3 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Skin Info */}
                <h4 className="text-sm font-medium text-[var(--hud-text)]">{skin.name}</h4>
                <p className="mt-0.5 text-xs text-[var(--hud-text-muted)] line-clamp-2">
                  {skin.description}
                </p>

                {/* Selected/Locked Indicator */}
                {isSelected && (
                  <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--hud-accent)] shadow-[0_0_10px_rgba(0,212,255,0.5)]">
                    <Check className="h-3 w-3 text-[var(--hud-bg)]" />
                  </div>
                )}
                {!skin.is_free && (
                  <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--hud-bg-secondary)]">
                    <Lock className="h-3 w-3 text-[var(--hud-text-muted)]" />
                  </div>
                )}

                {/* Price Badge */}
                {!skin.is_free && skin.price_cents && (
                  <div className="absolute bottom-2 right-2 rounded-full bg-brand-secondary/20 px-2 py-0.5 text-xs text-purple-300">
                    ${(skin.price_cents / 100).toFixed(2)}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Marketplace CTA */}
      <div className="border-t border-[var(--hud-border)] p-4">
        <Button
          variant="outline"
          className="w-full border-[var(--hud-border)] bg-transparent hover:bg-[var(--hud-accent)]/10"
          disabled
        >
          Browse Marketplace (Coming Soon)
        </Button>
      </div>
    </div>
  );
}
