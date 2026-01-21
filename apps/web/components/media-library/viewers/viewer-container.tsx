'use client';

import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import type * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ViewerContainerProps {
  children?: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
  aspectRatio?: 'auto' | 'video' | 'square' | 'portrait';
  fullscreen?: boolean;
}

export function ViewerContainer({
  children,
  isLoading = false,
  error = null,
  onRetry,
  className,
  aspectRatio = 'auto',
  fullscreen = false,
}: ViewerContainerProps) {
  const aspectRatioClasses = {
    auto: '',
    video: 'aspect-video',
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-black/5 dark:bg-brand-surface/5 rounded-lg',
          aspectRatioClasses[aspectRatio],
          fullscreen ? 'fixed inset-0 z-50 rounded-none' : 'min-h-[300px]',
          className,
        )}
      >
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-destructive/5 rounded-lg',
          aspectRatioClasses[aspectRatio],
          fullscreen ? 'fixed inset-0 z-50 rounded-none' : 'min-h-[300px]',
          className,
        )}
      >
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-destructive">Failed to load</p>
            <p className="text-xs text-muted-foreground max-w-[300px]">{error}</p>
          </div>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative bg-black/5 dark:bg-brand-surface/5 rounded-lg overflow-hidden',
        aspectRatioClasses[aspectRatio],
        fullscreen ? 'fixed inset-0 z-50 rounded-none bg-black' : '',
        className,
      )}
    >
      {children}
    </div>
  );
}
