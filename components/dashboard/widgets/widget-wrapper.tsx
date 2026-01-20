'use client';

import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getWidgetColSpan, type WidgetSize } from '@/types/dashboard';

interface WidgetWrapperProps {
  title: string;
  size: WidgetSize;
  children: React.ReactNode;
  onSettings?: () => void;
  className?: string;
  headerAction?: React.ReactNode;
}

export default function WidgetWrapper({
  title,
  size,
  children,
  onSettings,
  className,
  headerAction,
}: WidgetWrapperProps) {
  return (
    <div
      role="presentation"
      className={cn(
        // Widget container with INSPIRE palette
        'rounded-xl overflow-hidden transition-all duration-300',
        'border',
        // Hover effect - lifts card
        'hover:-translate-y-0.5',
        getWidgetColSpan(size),
        className,
      )}
      style={{
        backgroundColor: 'var(--inspire-widget-bg)',
        borderColor: 'var(--inspire-widget-border)',
        boxShadow: 'var(--inspire-card-shadow)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--inspire-card-shadow-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--inspire-card-shadow)';
      }}
    >
      {/* Widget Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--inspire-card-border-subtle)' }}
      >
        <h3 className="font-medium text-sm" style={{ color: 'var(--inspire-text-on-card)' }}>
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {headerAction}
          {onSettings && (
            <button
              type="button"
              onClick={onSettings}
              className="p-1 rounded-md transition-colors"
              style={{ color: 'var(--inspire-text-on-card)' }}
              title="Widget settings"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Widget Content */}
      <div className="p-4" style={{ color: 'var(--inspire-text-on-card)' }}>
        {children}
      </div>
    </div>
  );
}
