// ============================================================================
// INSPIRE IGNITE — Glass Box Overlay Component
// Location: app/04-lxd360-inspire-cognitive/components/hud/glass-box-overlay.tsx
// Version: 1.0.0
// ============================================================================

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

// ----------------------------------------------------------------------------
// TYPE DEFINITIONS
// ----------------------------------------------------------------------------

export interface GlassBoxOverlayProps {
  /** Whether overlay is visible */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Headline text */
  headline: string;
  /** Detail explanation */
  detail: string;
  /** Evidence factors */
  evidence?: { factor: string; value: string; weight: number }[];
  /** Actions available */
  actions?: { label: string; action: string; variant?: 'primary' | 'secondary' }[];
  /** Action handler */
  onAction?: (action: string) => void;
  /** Additional CSS classes */
  className?: string;
}

// ----------------------------------------------------------------------------
// COMPONENT
// ----------------------------------------------------------------------------

export function GlassBoxOverlay({
  isOpen,
  onClose,
  headline,
  detail,
  evidence = [],
  actions = [],
  onAction,
  className,
}: GlassBoxOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-labelledby="glass-box-headline"
            aria-describedby="glass-box-detail"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96',
              'bg-white dark:bg-gray-900 rounded-2xl shadow-2xl',
              'border border-gray-200 dark:border-gray-800',
              'z-50 overflow-hidden',
              className,
            )}
          >
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-500">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
                <h3 id="glass-box-headline" className="text-lg font-semibold text-white">
                  {headline}
                </h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p id="glass-box-detail" className="text-gray-700 dark:text-gray-300">
                {detail}
              </p>

              {/* Evidence */}
              {evidence.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">
                    Why we think this
                  </p>
                  {evidence.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{item.factor}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            {actions.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex gap-2">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      onAction?.(action.action);
                      if (action.action === 'dismiss') onClose();
                    }}
                    className={cn(
                      'flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors',
                      action.variant === 'primary'
                        ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300',
                    )}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default GlassBoxOverlay;
