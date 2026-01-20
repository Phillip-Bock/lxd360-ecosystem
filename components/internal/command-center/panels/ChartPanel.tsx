'use client';

import { Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { cn } from '@/lib/core/utils';

interface ChartPanelProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function ChartPanel({
  title,
  subtitle,
  children,
  className,
  onRefresh,
  isLoading = false,
}: ChartPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isExpanded) {
    return (
      <div className="fixed inset-0 z-50 bg-(--background)/95 p-8 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-brand-primary tracking-wide">{title}</h3>
            {subtitle && <p className="text-sm text-brand-muted">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isLoading}
                className="p-2 text-brand-muted hover:text-brand-cyan transition-colors"
              >
                <RefreshCw className={cn('w-5 h-5', isLoading && 'animate-spin')} />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="p-2 text-brand-muted hover:text-brand-cyan transition-colors"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 bg-(--background)/80 border border-brand-accent/20 rounded-xl p-6 overflow-auto">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'h-full bg-(--background)/80 border border-brand-accent/20 rounded-xl overflow-hidden backdrop-blur-xs hover:border-brand-accent/40 transition-colors',
        className,
      )}
    >
      <div className="px-4 py-3 border-b border-brand-accent/10 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-brand-primary tracking-wide">{title}</h3>
          {subtitle && <p className="text-xs text-brand-muted">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="p-1.5 text-brand-muted hover:text-brand-cyan transition-colors"
            >
              <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="p-1.5 text-brand-muted hover:text-brand-cyan transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
