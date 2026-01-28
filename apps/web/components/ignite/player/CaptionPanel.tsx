'use client';

import { Settings, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export type CaptionPosition = 'bottom' | 'top';
export type CaptionSize = 'small' | 'medium' | 'large';

export interface CaptionEntry {
  id: string;
  text: string;
  speaker: 'user' | 'assistant';
  timestamp: Date;
  isFinal: boolean;
}

export interface CaptionPanelProps {
  /** Current caption text to display */
  currentCaption?: string;
  /** Whether the caption is interim (still being transcribed) */
  isInterim?: boolean;
  /** Speaker of the current caption */
  speaker?: 'user' | 'assistant';
  /** Whether captions are enabled */
  enabled?: boolean;
  /** Callback to toggle captions */
  onToggle?: (enabled: boolean) => void;
  /** Caption position */
  position?: CaptionPosition;
  /** Caption text size */
  size?: CaptionSize;
  /** Callback when settings change */
  onSettingsChange?: (settings: { position: CaptionPosition; size: CaptionSize }) => void;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// SIZE CLASSES
// ============================================================================

const sizeClasses: Record<CaptionSize, string> = {
  small: 'text-sm',
  medium: 'text-base',
  large: 'text-lg',
};

const positionClasses: Record<CaptionPosition, string> = {
  bottom: 'bottom-4',
  top: 'top-4',
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Caption Panel Component
 *
 * Displays live captions for speech-to-text and AI responses with
 * customizable position and size settings.
 *
 * Accessibility features:
 * - ARIA live region for screen reader announcements
 * - High contrast text on semi-transparent background
 * - Keyboard accessible settings menu
 *
 * @example
 * ```tsx
 * <CaptionPanel
 *   currentCaption={transcript}
 *   isInterim={isListening}
 *   speaker="user"
 *   enabled={captionsEnabled}
 *   onToggle={setCaptionsEnabled}
 * />
 * ```
 */
export function CaptionPanel({
  currentCaption,
  isInterim = false,
  speaker = 'user',
  enabled = true,
  onToggle,
  position = 'bottom',
  size = 'medium',
  onSettingsChange,
  className,
}: CaptionPanelProps): React.JSX.Element | null {
  const [localPosition, setLocalPosition] = useState<CaptionPosition>(position);
  const [localSize, setLocalSize] = useState<CaptionSize>(size);
  const [isVisible, setIsVisible] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update local state when props change
  useEffect(() => {
    setLocalPosition(position);
    setLocalSize(size);
  }, [position, size]);

  // Auto-hide caption after a delay when no new text
  useEffect(() => {
    if (currentCaption) {
      setIsVisible(true);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      if (!isInterim) {
        hideTimeoutRef.current = setTimeout(() => {
          setIsVisible(false);
        }, 5000);
      }
    } else {
      setIsVisible(false);
    }

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [currentCaption, isInterim]);

  const handlePositionChange = useCallback(
    (newPosition: CaptionPosition) => {
      setLocalPosition(newPosition);
      onSettingsChange?.({ position: newPosition, size: localSize });
    },
    [localSize, onSettingsChange],
  );

  const handleSizeChange = useCallback(
    (newSize: CaptionSize) => {
      setLocalSize(newSize);
      onSettingsChange?.({ position: localPosition, size: newSize });
    },
    [localPosition, onSettingsChange],
  );

  // Don't render if disabled or no caption
  if (!enabled) {
    return null;
  }

  return (
    <section
      className={cn(
        'absolute left-1/2 -translate-x-1/2 z-50 transition-all duration-300',
        positionClasses[localPosition],
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none',
        className,
      )}
      aria-label="Live captions"
    >
      {/* Caption container */}
      <div
        className={cn(
          'relative max-w-2xl px-6 py-3 rounded-lg',
          'bg-black/80 backdrop-blur-sm',
          'shadow-lg border border-white/10',
        )}
      >
        {/* Settings button */}
        <div className="absolute -top-2 -right-2 flex gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full bg-white/10 hover:bg-white/20"
                aria-label="Caption settings"
              >
                <Settings className="h-3 w-3 text-white" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Position</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handlePositionChange('top')}
                className={localPosition === 'top' ? 'bg-accent' : ''}
              >
                Top
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlePositionChange('bottom')}
                className={localPosition === 'bottom' ? 'bg-accent' : ''}
              >
                Bottom
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Text Size</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handleSizeChange('small')}
                className={localSize === 'small' ? 'bg-accent' : ''}
              >
                Small
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSizeChange('medium')}
                className={localSize === 'medium' ? 'bg-accent' : ''}
              >
                Medium
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSizeChange('large')}
                className={localSize === 'large' ? 'bg-accent' : ''}
              >
                Large
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full bg-white/10 hover:bg-white/20"
            onClick={() => onToggle?.(false)}
            aria-label="Close captions"
          >
            <X className="h-3 w-3 text-white" aria-hidden="true" />
          </Button>
        </div>

        {/* Speaker indicator */}
        <div className="flex items-start gap-3">
          <span
            className={cn(
              'shrink-0 mt-1 text-xs font-medium uppercase tracking-wider',
              speaker === 'user' ? 'text-cyan-400' : 'text-purple-400',
            )}
          >
            {speaker === 'user' ? 'You' : 'Neuro-naut'}
          </span>

          {/* Caption text */}
          <p
            className={cn(
              'text-white font-medium leading-relaxed',
              sizeClasses[localSize],
              isInterim && 'opacity-70',
            )}
            aria-live="polite"
            aria-atomic="true"
          >
            {currentCaption}
            {isInterim && (
              <span className="inline-flex ml-1">
                <span className="animate-pulse">.</span>
                <span className="animate-pulse animation-delay-200">.</span>
                <span className="animate-pulse animation-delay-400">.</span>
              </span>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CAPTION TOGGLE BUTTON
// ============================================================================

export interface CaptionToggleProps {
  /** Whether captions are enabled */
  enabled: boolean;
  /** Callback when toggled */
  onToggle: (enabled: boolean) => void;
  /** Additional class names */
  className?: string;
}

/**
 * Caption Toggle Button
 *
 * Button to toggle captions on/off with visual indicator.
 */
export function CaptionToggle({
  enabled,
  onToggle,
  className,
}: CaptionToggleProps): React.JSX.Element {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onToggle(!enabled)}
      className={cn('relative', enabled && 'text-cyan-400', className)}
      aria-label={enabled ? 'Disable captions' : 'Enable captions'}
      aria-pressed={enabled}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M7 12h2a2 2 0 0 0 0-4H7v8" />
        <path d="M15 12h2a2 2 0 0 0 0-4h-2v8" />
      </svg>
      {/* Visual indicator when enabled */}
      {enabled && (
        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-cyan-400" />
      )}
    </Button>
  );
}

export default CaptionPanel;
