/**
 * =============================================================================
 * LXP360-SaaS | Accessible Dialog Components
 * =============================================================================
 *
 * @fileoverview Enhanced accessible dialog and modal components
 *
 * @description
 * Provides accessible dialog components with:
 * - Proper ARIA attributes and roles
 * - Focus management and trapping
 * - Screen reader announcements
 * - Alert dialog for important messages
 * - Confirmation dialog pattern
 * - Scroll locking
 *
 * WCAG Compliance:
 * - 1.3.1 Info and Relationships (Level A)
 * - 2.1.1 Keyboard (Level A)
 * - 2.1.2 No Keyboard Trap (Level A)
 * - 2.4.3 Focus Order (Level A)
 * - 4.1.2 Name, Role, Value (Level A)
 *
 * @usage
 * ```tsx
 * // Basic dialog
 * <AccessibleDialog open={open} onOpenChange={setOpen} title="Dialog Title">
 *   <p>Dialog content here</p>
 * </AccessibleDialog>
 *
 * // Alert dialog
 * <AlertDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Alert"
 *   description="This is an important message"
 *   onConfirm={handleConfirm}
 * />
 *
 * // Confirmation dialog
 * <ConfirmationDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Confirm Action"
 *   message="Are you sure you want to proceed?"
 *   onConfirm={handleConfirm}
 *   onCancel={handleCancel}
 *   variant="danger"
 * />
 * ```
 *
 * =============================================================================
 */

'use client';

import * as React from 'react';
import {
  announce,
  createFocusTrap,
  type FocusTrap,
  restoreFocus,
  saveFocus,
} from '@/lib/accessibility/focus-management';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface AccessibleDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Dialog title (required for accessibility) */
  title: string;
  /** Optional description */
  description?: string;
  /** Dialog content */
  children: React.ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Show close button */
  showCloseButton?: boolean;
  /** Close on overlay click */
  closeOnOverlayClick?: boolean;
  /** Close on Escape key */
  closeOnEscape?: boolean;
  /** Element to focus initially */
  initialFocus?: React.RefObject<HTMLElement | null>;
  /** Element to focus when closing */
  returnFocus?: React.RefObject<HTMLElement | null> | boolean;
  /** Additional class names */
  className?: string;
  /** Announce to screen readers when opened */
  announceOnOpen?: boolean;
  /** Custom footer content */
  footer?: React.ReactNode;
}

export interface AlertDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Alert title */
  title: string;
  /** Alert description */
  description: string;
  /** Confirm button text */
  confirmText?: string;
  /** Confirm callback */
  onConfirm?: () => void;
  /** Alert variant */
  variant?: 'info' | 'warning' | 'error' | 'success';
}

export interface ConfirmationDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Dialog title */
  title: string;
  /** Confirmation message */
  message: string;
  /** Additional details */
  details?: string;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Confirm callback */
  onConfirm: () => void;
  /** Cancel callback */
  onCancel?: () => void;
  /** Whether action is loading */
  isLoading?: boolean;
  /** Dialog variant */
  variant?: 'default' | 'danger' | 'warning';
}

// ============================================================================
// Size Variants
// ============================================================================

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]',
};

// ============================================================================
// Alert Variants
// ============================================================================

const alertVariants = {
  info: {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-6 h-6 text-brand-blue"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    ),
    containerClass: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950',
  },
  warning: {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-6 h-6 text-yellow-500"
        aria-hidden="true"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    containerClass: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950',
  },
  error: {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-6 h-6 text-brand-error"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    containerClass: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950',
  },
  success: {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-6 h-6 text-brand-success"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    containerClass: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950',
  },
};

// ============================================================================
// Accessible Dialog Component
// ============================================================================

export function AccessibleDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  initialFocus,
  returnFocus = true,
  className,
  announceOnOpen = true,
  footer,
}: AccessibleDialogProps) {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const focusTrapRef = React.useRef<FocusTrap | null>(null);
  const titleId = React.useId();
  const descriptionId = React.useId();

  // Handle body scroll lock
  React.useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  // Handle focus management
  React.useEffect(() => {
    if (!dialogRef.current) return;

    if (open) {
      saveFocus();

      // Handle returnFocus - if it's a RefObject, extract the current element
      const returnFocusValue =
        typeof returnFocus === 'boolean' ? returnFocus : returnFocus?.current || false;

      focusTrapRef.current = createFocusTrap(dialogRef.current, {
        initialFocus: initialFocus?.current || null,
        returnFocus: returnFocusValue,
        escapeDeactivates: closeOnEscape,
        onEscape: () => onOpenChange(false),
      });

      focusTrapRef.current.activate();

      if (announceOnOpen) {
        announce(`${title} dialog opened`, { politeness: 'polite' });
      }
    } else {
      focusTrapRef.current?.deactivate();
      if (returnFocus) {
        restoreFocus();
      }
    }

    return () => {
      focusTrapRef.current?.deactivate();
    };
  }, [open, title, closeOnEscape, onOpenChange, initialFocus, returnFocus, announceOnOpen]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="presentation">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in-0"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          'relative z-50 w-full bg-background rounded-lg shadow-xl',
          'animate-in fade-in-0 zoom-in-95',
          'mx-4 p-6',
          sizeClasses[size],
          className,
        )}
      >
        {/* Close button */}
        {showCloseButton && (
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className={cn(
              'absolute top-4 right-4 p-1 rounded-md',
              'text-muted-foreground hover:text-foreground',
              'focus-visible:outline-hidden focus-visible:ring-2',
              'focus-visible:ring-ring focus-visible:ring-offset-2',
            )}
            aria-label="Close dialog"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Header */}
        <div className="mb-4">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          {description && (
            <p id={descriptionId} className="mt-1 text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="space-y-4">{children}</div>

        {/* Footer */}
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

// ============================================================================
// Alert Dialog Component
// ============================================================================

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'OK',
  onConfirm,
  variant = 'info',
}: AlertDialogProps) {
  const confirmRef = React.useRef<HTMLButtonElement>(null);
  const { icon, containerClass } = alertVariants[variant];

  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange(false);
  };

  return (
    <AccessibleDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      initialFocus={confirmRef}
      size="sm"
      className={cn('border-2', containerClass)}
    >
      <div className="flex gap-4">
        <div className="shrink-0">{icon}</div>
        <div>
          <p className="text-sm">{description}</p>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          ref={confirmRef}
          type="button"
          onClick={handleConfirm}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium',
            'bg-primary text-primary-foreground',
            'hover:bg-primary/90',
            'focus-visible:outline-hidden focus-visible:ring-2',
            'focus-visible:ring-ring focus-visible:ring-offset-2',
          )}
        >
          {confirmText}
        </button>
      </div>
    </AccessibleDialog>
  );
}

// ============================================================================
// Confirmation Dialog Component
// ============================================================================

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  message,
  details,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'default',
}: ConfirmationDialogProps) {
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
  };

  const confirmButtonClass = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    warning: 'bg-brand-warning text-brand-primary hover:bg-yellow-600',
  };

  return (
    <AccessibleDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      initialFocus={cancelRef}
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
      size="sm"
    >
      <div role="alertdialog" aria-describedby="confirmation-message">
        <p id="confirmation-message" className="text-sm">
          {message}
        </p>
        {details && <p className="mt-2 text-sm text-muted-foreground">{details}</p>}
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          ref={cancelRef}
          type="button"
          onClick={handleCancel}
          disabled={isLoading}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium',
            'border bg-background hover:bg-accent',
            'focus-visible:outline-hidden focus-visible:ring-2',
            'focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isLoading}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium',
            'focus-visible:outline-hidden focus-visible:ring-2',
            'focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'inline-flex items-center gap-2',
            confirmButtonClass[variant],
          )}
        >
          {isLoading && (
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {confirmText}
        </button>
      </div>
    </AccessibleDialog>
  );
}

// ============================================================================
// Loading Dialog Component
// ============================================================================

export interface LoadingDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Loading message */
  message?: string;
  /** Progress percentage (0-100) */
  progress?: number;
}

export function LoadingDialog({ open, message = 'Loading...', progress }: LoadingDialogProps) {
  return (
    <AccessibleDialog
      open={open}
      onOpenChange={() => {}}
      title="Loading"
      showCloseButton={false}
      closeOnOverlayClick={false}
      closeOnEscape={false}
      size="sm"
      announceOnOpen={true}
    >
      <div className="flex flex-col items-center py-4">
        <output
          className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary block"
          aria-label="Loading"
        />
        <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
          {message}
        </p>
        {progress !== undefined && (
          <div className="mt-4 w-full">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <p className="mt-1 text-xs text-center text-muted-foreground">{progress}% complete</p>
          </div>
        )}
      </div>
    </AccessibleDialog>
  );
}

// ============================================================================
// Dialog Hook
// ============================================================================

export interface UseDialogReturn {
  /** Whether dialog is open */
  isOpen: boolean;
  /** Open the dialog */
  open: () => void;
  /** Close the dialog */
  close: () => void;
  /** Toggle the dialog */
  toggle: () => void;
  /** Set open state */
  setOpen: (open: boolean) => void;
}

export function useDialog(initialOpen = false): UseDialogReturn {
  const [isOpen, setIsOpen] = React.useState(initialOpen);

  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const toggle = React.useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setOpen: setIsOpen,
  };
}

// ============================================================================
// Exports
// ============================================================================

export default AccessibleDialog;
