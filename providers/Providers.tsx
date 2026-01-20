'use client';

import * as React from 'react';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ConfirmProvider } from '@/components/ui/confirm-dialog';
import type { ToastPosition } from '@/components/ui/toast-provider';
import { setToastRef, ToastProvider, useToast } from '@/components/ui/toast-provider';

// =============================================================================
// Types
// =============================================================================

export interface ProvidersProps {
  children: React.ReactNode;
  /** Position for toast notifications */
  toastPosition?: ToastPosition;
  /** Default duration for toast notifications (ms) */
  toastDuration?: number;
  /** Maximum number of toasts to show at once */
  maxToasts?: number;
  /** Custom error fallback component */
  errorFallback?: React.ReactNode;
  /** Error callback for ErrorBoundary */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

// =============================================================================
// Toast Ref Initializer
// =============================================================================

function ToastRefInitializer() {
  const toast = useToast();

  React.useEffect(() => {
    setToastRef(toast);
    return () => setToastRef(null);
  }, [toast]);

  return null;
}

// =============================================================================
// Providers Component
// =============================================================================

export function Providers({
  children,
  toastPosition = 'bottom-right',
  toastDuration = 5000,
  maxToasts = 5,
  errorFallback,
  onError,
}: ProvidersProps) {
  return (
    <ErrorBoundary fallback={errorFallback} onError={onError}>
      <ToastProvider position={toastPosition} defaultDuration={toastDuration} maxToasts={maxToasts}>
        <ToastRefInitializer />
        <ConfirmProvider>{children}</ConfirmProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

// =============================================================================
// Re-exports for convenience
// =============================================================================

export { ErrorBoundary } from '@/components/error/ErrorBoundary';
export { ConfirmProvider, useConfirm } from '@/components/ui/confirm-dialog';
export { ToastProvider, toast, useToast } from '@/components/ui/toast-provider';

// Default export
export default Providers;
