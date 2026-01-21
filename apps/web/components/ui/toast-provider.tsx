'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import type * as React from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition =
  | 'top-left'
  | 'top-right'
  | 'top-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'bottom-center';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: ToastAction;
  dismissible?: boolean;
}

export interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
  action?: ToastAction;
  dismissible?: boolean;
}

export interface ToastContextValue {
  toasts: Toast[];
  success: (options: ToastOptions | string) => string;
  error: (options: ToastOptions | string) => string;
  warning: (options: ToastOptions | string) => string;
  info: (options: ToastOptions | string) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

export interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
  defaultDuration?: number;
  maxToasts?: number;
}

// =============================================================================
// Context
// =============================================================================

const ToastContext = createContext<ToastContextValue | null>(null);

// =============================================================================
// Utilities
// =============================================================================

function generateId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function normalizeOptions(options: ToastOptions | string): ToastOptions {
  if (typeof options === 'string') {
    return { title: options };
  }
  return options;
}

// =============================================================================
// Toast Icons
// =============================================================================

const ToastIcon: Record<ToastType, React.FC<{ className?: string }>> = {
  success: ({ className }) => (
    <CheckCircle2 className={cn('w-5 h-5', className)} aria-hidden="true" />
  ),
  error: ({ className }) => <XCircle className={cn('w-5 h-5', className)} aria-hidden="true" />,
  warning: ({ className }) => (
    <AlertTriangle className={cn('w-5 h-5', className)} aria-hidden="true" />
  ),
  info: ({ className }) => <Info className={cn('w-5 h-5', className)} aria-hidden="true" />,
};

// =============================================================================
// Toast Styles
// =============================================================================

const toastStyles: Record<ToastType, string> = {
  success:
    'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100',
  error:
    'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100',
  warning:
    'bg-yellow-50 dark:bg-yellow-950/50 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100',
  info: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100',
};

const iconStyles: Record<ToastType, string> = {
  success: 'text-green-600 dark:text-brand-success',
  error: 'text-red-600 dark:text-brand-error',
  warning: 'text-yellow-600 dark:text-brand-warning',
  info: 'text-brand-blue dark:text-brand-cyan',
};

// =============================================================================
// Position Styles
// =============================================================================

const positionStyles: Record<ToastPosition, string> = {
  'top-left': 'top-4 left-4',
  'top-right': 'top-4 right-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-left': 'bottom-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

// =============================================================================
// Toast Item Component
// =============================================================================

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
  position: ToastPosition;
}

function ToastItem({ toast, onDismiss, position }: ToastItemProps) {
  const { id, type, title, description, duration = 5000, action, dismissible = true } = toast;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  const Icon = ToastIcon[type];

  // Animation variants based on position
  const isTop = position.startsWith('top');
  const isLeft = position.includes('left');
  const isRight = position.includes('right');

  const variants = {
    initial: {
      opacity: 0,
      y: isTop ? -20 : 20,
      x: isLeft ? -20 : isRight ? 20 : 0,
      scale: 0.95,
    },
    animate: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
    },
    exit: {
      opacity: 0,
      y: isTop ? -20 : 20,
      x: isLeft ? -100 : isRight ? 100 : 0,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.div
      layout
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      role="alert"
      aria-live="polite"
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-lg border shadow-lg',
        'w-full max-w-sm',
        toastStyles[type],
      )}
    >
      {/* Icon */}
      <Icon className={iconStyles[type]} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{title}</p>
        {description && <p className="mt-1 text-sm opacity-90">{description}</p>}
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-2 text-sm font-medium underline underline-offset-2 hover:no-underline"
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Dismiss Button */}
      {dismissible && (
        <button
          type="button"
          onClick={() => onDismiss(id)}
          className="shrink-0 p-1 rounded-md hover:bg-black/10 dark:hover:bg-brand-surface/10 transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}

      {/* Progress Bar */}
      {duration > 0 && (
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          className="absolute bottom-0 left-0 right-0 h-1 origin-left bg-current opacity-20 rounded-b-lg"
        />
      )}
    </motion.div>
  );
}

// =============================================================================
// Toast Container Component
// =============================================================================

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
  position: ToastPosition;
}

function ToastContainer({ toasts, onDismiss, position }: ToastContainerProps) {
  const isTop = position.startsWith('top');

  return (
    <div
      className={cn(
        'fixed z-[100] flex flex-col gap-2 pointer-events-none',
        positionStyles[position],
        isTop ? 'flex-col' : 'flex-col-reverse',
      )}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={onDismiss} position={position} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// Toast Provider Component
// =============================================================================

export function ToastProvider({
  children,
  position = 'bottom-right',
  defaultDuration = 5000,
  maxToasts = 5,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (type: ToastType, options: ToastOptions | string): string => {
      const normalizedOptions = normalizeOptions(options);
      const id = generateId();

      const newToast: Toast = {
        id,
        type,
        title: normalizedOptions.title,
        description: normalizedOptions.description,
        duration: normalizedOptions.duration ?? defaultDuration,
        action: normalizedOptions.action,
        dismissible: normalizedOptions.dismissible ?? true,
      };

      setToasts((prev) => {
        const updated = [...prev, newToast];
        // Remove oldest toasts if exceeding max
        if (updated.length > maxToasts) {
          return updated.slice(-maxToasts);
        }
        return updated;
      });

      return id;
    },
    [defaultDuration, maxToasts],
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const success = useCallback(
    (options: ToastOptions | string) => addToast('success', options),
    [addToast],
  );

  const error = useCallback(
    (options: ToastOptions | string) => addToast('error', options),
    [addToast],
  );

  const warning = useCallback(
    (options: ToastOptions | string) => addToast('warning', options),
    [addToast],
  );

  const info = useCallback(
    (options: ToastOptions | string) => addToast('info', options),
    [addToast],
  );

  const contextValue: ToastContextValue = {
    toasts,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} position={position} />
    </ToastContext.Provider>
  );
}

// =============================================================================
// useToast Hook
// =============================================================================

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// =============================================================================
// Standalone Toast Function (for use outside React components)
// =============================================================================

let toastRef: ToastContextValue | null = null;

export function setToastRef(ref: ToastContextValue | null): void {
  toastRef = ref;
}

export const toast = {
  success: (options: ToastOptions | string) => toastRef?.success(options),
  error: (options: ToastOptions | string) => toastRef?.error(options),
  warning: (options: ToastOptions | string) => toastRef?.warning(options),
  info: (options: ToastOptions | string) => toastRef?.info(options),
  dismiss: (id: string) => toastRef?.dismiss(id),
  dismissAll: () => toastRef?.dismissAll(),
};

export default ToastProvider;
