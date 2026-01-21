'use client';

import { AlertTriangle, HelpCircle, LogOut, Trash2, UserX } from 'lucide-react';
import type * as React from 'react';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

export type ConfirmVariant = 'default' | 'danger' | 'warning' | 'info';

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  icon?: React.ReactNode;
}

export interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  confirmDelete: (itemName: string) => Promise<boolean>;
  confirmLogout: () => Promise<boolean>;
  confirmSuspend: (userName: string) => Promise<boolean>;
  confirmDiscard: () => Promise<boolean>;
}

interface DialogState extends ConfirmOptions {
  isOpen: boolean;
  resolve: ((value: boolean) => void) | null;
}

// =============================================================================
// Context
// =============================================================================

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

// =============================================================================
// Variant Configurations
// =============================================================================

const variantConfig: Record<
  ConfirmVariant,
  {
    iconBg: string;
    iconColor: string;
    confirmButton: string;
  }
> = {
  default: {
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    confirmButton: 'primary',
  },
  danger: {
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
    confirmButton: 'destructive',
  },
  warning: {
    iconBg: 'bg-brand-warning/10',
    iconColor: 'text-yellow-600 dark:text-yellow-500',
    confirmButton: 'primary',
  },
  info: {
    iconBg: 'bg-brand-primary/10',
    iconColor: 'text-brand-blue dark:text-brand-blue',
    confirmButton: 'primary',
  },
};

// =============================================================================
// Default Icons
// =============================================================================

const defaultIcons: Record<ConfirmVariant, React.ReactNode> = {
  default: <HelpCircle className="w-6 h-6" aria-hidden="true" />,
  danger: <AlertTriangle className="w-6 h-6" aria-hidden="true" />,
  warning: <AlertTriangle className="w-6 h-6" aria-hidden="true" />,
  info: <HelpCircle className="w-6 h-6" aria-hidden="true" />,
};

// =============================================================================
// Confirm Dialog Component
// =============================================================================

interface ConfirmDialogProps {
  state: DialogState;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({ state, onConfirm, onCancel }: ConfirmDialogProps) {
  const {
    isOpen,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default',
    icon,
  } = state;

  const confirmRef = useRef<HTMLButtonElement>(null);
  const config = variantConfig[variant];
  const displayIcon = icon || defaultIcons[variant];

  // Focus management
  useEffect(() => {
    if (isOpen && confirmRef.current) {
      // Delay focus to ensure dialog is mounted
      const timer = setTimeout(() => {
        confirmRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Keyboard handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                config.iconBg,
              )}
            >
              <div className={config.iconColor}>{displayIcon}</div>
            </div>
          </div>

          <AlertDialogTitle className="text-center">{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="text-center">{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            {cancelText}
          </Button>
          <Button
            ref={confirmRef}
            variant={config.confirmButton as 'primary' | 'destructive'}
            onClick={onConfirm}
            className="w-full sm:w-auto"
          >
            {confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// =============================================================================
// Confirm Provider
// =============================================================================

export interface ConfirmProviderProps {
  children: React.ReactNode;
}

export function ConfirmProvider({ children }: ConfirmProviderProps) {
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    title: '',
    resolve: null,
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        ...options,
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    dialogState.resolve?.(true);
    setDialogState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  }, [dialogState]);

  const handleCancel = useCallback(() => {
    dialogState.resolve?.(false);
    setDialogState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  }, [dialogState]);

  // Built-in confirmation variants
  const confirmDelete = useCallback(
    (itemName: string): Promise<boolean> => {
      return confirm({
        title: 'Delete Item',
        description: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'danger',
        icon: <Trash2 className="w-6 h-6" aria-hidden="true" />,
      });
    },
    [confirm],
  );

  const confirmLogout = useCallback((): Promise<boolean> => {
    return confirm({
      title: 'Sign Out',
      description:
        'Are you sure you want to sign out? You will need to sign in again to access your account.',
      confirmText: 'Sign Out',
      cancelText: 'Cancel',
      variant: 'warning',
      icon: <LogOut className="w-6 h-6" aria-hidden="true" />,
    });
  }, [confirm]);

  const confirmSuspend = useCallback(
    (userName: string): Promise<boolean> => {
      return confirm({
        title: 'Suspend User',
        description: `Are you sure you want to suspend "${userName}"? They will lose access to the platform until reactivated.`,
        confirmText: 'Suspend',
        cancelText: 'Cancel',
        variant: 'danger',
        icon: <UserX className="w-6 h-6" aria-hidden="true" />,
      });
    },
    [confirm],
  );

  const confirmDiscard = useCallback((): Promise<boolean> => {
    return confirm({
      title: 'Discard Changes',
      description: 'You have unsaved changes. Are you sure you want to discard them?',
      confirmText: 'Discard',
      cancelText: 'Keep Editing',
      variant: 'warning',
    });
  }, [confirm]);

  const contextValue: ConfirmContextValue = {
    confirm,
    confirmDelete,
    confirmLogout,
    confirmSuspend,
    confirmDiscard,
  };

  return (
    <ConfirmContext.Provider value={contextValue}>
      {children}
      <ConfirmDialog state={dialogState} onConfirm={handleConfirm} onCancel={handleCancel} />
    </ConfirmContext.Provider>
  );
}

// =============================================================================
// useConfirm Hook
// =============================================================================

export function useConfirm(): ConfirmContextValue {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}

// =============================================================================
// Exports
// =============================================================================

export default ConfirmProvider;
