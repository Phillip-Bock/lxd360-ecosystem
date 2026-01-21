'use client';

import { cn } from '@/lib/utils';
import type { BlockStyleConfig } from './BlockStylePresets';
import type { ColorPalette } from './ColorPaletteManager';
import type { TypographyConfig } from './TypographyManager';

// =============================================================================
// Types
// =============================================================================

export interface ThemeConfig {
  name: string;
  palette: ColorPalette;
  typography: TypographyConfig;
  blockStyles: BlockStyleConfig;
}

interface ThemePreviewCardProps {
  theme: ThemeConfig;
  isActive?: boolean;
  onClick?: () => void;
  showDetails?: boolean;
  className?: string;
}

// =============================================================================
// Shadow CSS Helper
// =============================================================================

const SHADOW_CSS: Record<string, string> = {
  none: 'none',
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 6px rgba(0,0,0,0.1)',
  lg: '0 10px 15px rgba(0,0,0,0.1)',
  xl: '0 20px 25px rgba(0,0,0,0.15)',
};

// =============================================================================
// Theme Preview Card Component
// =============================================================================

export function ThemePreviewCard({
  theme,
  isActive = false,
  onClick,
  showDetails = true,
  className,
}: ThemePreviewCardProps) {
  const { palette, typography, blockStyles } = theme;

  return (
    // biome-ignore lint/a11y/useSemanticElements: Theme card with complex styling requires div container
    <div
      className={cn(
        'relative rounded-lg overflow-hidden transition-all cursor-pointer border-2',
        isActive
          ? 'border-lxd-cyan ring-2 ring-lxd-cyan/30'
          : 'border-transparent hover:border-lxd-dark-border',
        className,
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-pressed={isActive}
      aria-label={`Select ${theme.name} theme`}
    >
      {/* Preview Area */}
      <div
        className="p-4"
        style={{
          backgroundColor: palette.background,
          fontFamily: typography.bodyFont,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between mb-3 pb-2"
          style={{ borderBottom: `1px solid ${palette.border}` }}
        >
          <div
            className="text-sm font-semibold"
            style={{
              color: palette.text,
              fontFamily: typography.headingFont,
            }}
          >
            {theme.name}
          </div>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.primary }} />
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.secondary }} />
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.accent }} />
          </div>
        </div>

        {/* Mock Content Block */}
        <div
          className="p-3 transition-all"
          style={{
            backgroundColor: palette.surface,
            borderRadius: `${blockStyles.borderRadius}px`,
            border: `${blockStyles.borderWidth}px solid ${palette.border}`,
            boxShadow: SHADOW_CSS[blockStyles.shadowSize],
          }}
        >
          {/* Title */}
          <div
            className="font-medium mb-2"
            style={{
              color: palette.text,
              fontFamily: typography.headingFont,
              fontSize: `${typography.baseSize * typography.scaleRatio}px`,
              lineHeight: typography.lineHeight,
            }}
          >
            Sample Heading
          </div>

          {/* Body Text */}
          <div
            className="text-sm mb-2"
            style={{
              color: palette.textSecondary,
              fontFamily: typography.bodyFont,
              fontSize: `${typography.baseSize}px`,
              lineHeight: typography.lineHeight,
              letterSpacing: `${typography.letterSpacing}em`,
            }}
          >
            This is sample body text to preview typography settings.
          </div>

          {/* Mock Button */}
          <div
            className="inline-block px-3 py-1.5 text-xs font-medium"
            style={{
              backgroundColor: palette.primary,
              color: '#fff',
              borderRadius: `${blockStyles.borderRadius / 2}px`,
            }}
          >
            Action
          </div>
        </div>

        {/* Status Colors */}
        <div className="flex gap-2 mt-3">
          <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: palette.success }} />
          <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: palette.warning }} />
          <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: palette.error }} />
        </div>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="p-3 bg-lxd-dark-surface border-t border-lxd-dark-border">
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div>
              <span className="text-white/40 block">Font</span>
              <span className="text-white/80 truncate block">
                {typography.bodyFont.split(',')[0]}
              </span>
            </div>
            <div>
              <span className="text-white/40 block">Scale</span>
              <span className="text-white/80">{typography.scaleRatio.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-white/40 block">Radius</span>
              <span className="text-white/80">{blockStyles.borderRadius}px</span>
            </div>
          </div>
        </div>
      )}

      {/* Active Indicator */}
      {isActive && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-lxd-cyan flex items-center justify-center">
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            role="img"
            aria-label="Selected"
          >
            <title>Selected</title>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default ThemePreviewCard;
