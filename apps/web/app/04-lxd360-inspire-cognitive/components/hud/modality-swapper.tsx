// ============================================================================
// INSPIRE IGNITE — Modality Swapper Component
// Location: app/04-lxd360-inspire-cognitive/components/hud/modality-swapper.tsx
// Version: 1.0.0
// ============================================================================

'use client';

import { motion } from 'framer-motion';
import { Eye, FileText, Hand, Headphones, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Modality } from '@/lib/xapi/cognitive-utils';

// ----------------------------------------------------------------------------
// TYPE DEFINITIONS
// ----------------------------------------------------------------------------

export interface ModalitySwapperProps {
  /** Current active modality */
  currentModality: Modality;
  /** Available modalities */
  availableModalities: Modality[];
  /** Suggested modality (AI recommendation) */
  suggestedModality?: Modality;
  /** Change handler */
  onModalityChange: (modality: Modality) => void;
  /** Additional CSS classes */
  className?: string;
}

// ----------------------------------------------------------------------------
// CONFIGURATION
// ----------------------------------------------------------------------------

export const MODALITY_CONFIG: Record<
  'visual' | 'auditory' | 'textual' | 'kinesthetic',
  { icon: typeof Eye; label: string; color: string }
> = {
  visual: { icon: Eye, label: 'Visual', color: 'text-blue-500' },
  auditory: { icon: Headphones, label: 'Audio', color: 'text-purple-500' },
  textual: { icon: FileText, label: 'Text', color: 'text-green-500' },
  kinesthetic: { icon: Hand, label: 'Interactive', color: 'text-orange-500' },
};

// ----------------------------------------------------------------------------
// COMPONENT
// ----------------------------------------------------------------------------

export function ModalitySwapper({
  currentModality,
  availableModalities,
  suggestedModality,
  onModalityChange,
  className,
}: ModalitySwapperProps) {
  // Filter to only supported modalities for display
  const displayModalities = availableModalities.filter(
    (m): m is keyof typeof MODALITY_CONFIG => m in MODALITY_CONFIG,
  );

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      role="radiogroup"
      aria-label="Learning modality selection"
    >
      {displayModalities.map((modality) => {
        const config = MODALITY_CONFIG[modality];
        const Icon = config.icon;
        const isActive = modality === currentModality;
        const isSuggested = modality === suggestedModality && !isActive;

        return (
          // biome-ignore lint/a11y/useSemanticElements: Custom styled radio button within radiogroup - button provides better styling
          <button
            key={modality}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={`${config.label}${isSuggested ? ' (recommended)' : ''}`}
            onClick={() => onModalityChange(modality)}
            className={cn(
              'relative p-3 rounded-lg border-2 transition-all',
              isActive
                ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30'
                : isSuggested
                  ? 'border-dashed border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
            )}
          >
            <Icon
              className={cn('h-5 w-5 transition-colors', isActive ? config.color : 'text-gray-400')}
              aria-hidden="true"
            />

            {/* Suggested badge */}
            {isSuggested && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5"
              >
                <RefreshCw className="h-3 w-3 text-yellow-900" />
              </motion.div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default ModalitySwapper;
