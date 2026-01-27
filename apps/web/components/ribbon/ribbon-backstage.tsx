'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { ribbonAnimations } from './ribbon-animations';

interface BackstageItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
}

interface RibbonBackstageProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: BackstageItem[];
  defaultItem?: string;
  header?: React.ReactNode;
}

export function RibbonBackstage({
  open,
  onOpenChange,
  items,
  defaultItem,
  header,
}: RibbonBackstageProps) {
  const [activeItem, setActiveItem] = React.useState(defaultItem || items[0]?.id);
  const activeContent = items.find((item) => item.id === activeItem)?.content;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn('fixed inset-0 z-50 bg-black/80', ribbonAnimations.tabFadeIn)}
        />
        <DialogPrimitive.Content
          className={cn('fixed inset-0 z-50 flex', ribbonAnimations.popoverIn)}
        >
          {/* Left sidebar */}
          <div className="w-64 bg-(--ribbon-accent) flex flex-col">
            {/* Header */}
            {header && <div className="p-4 border-b border-white/10">{header}</div>}

            {/* Navigation */}
            <nav className="flex-1 py-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveItem(item.id)}
                  className={cn(
                    'flex items-center gap-3 w-full px-4 py-3',
                    'text-left transition-colors',
                    activeItem === item.id
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white',
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Close button at bottom */}
            <div className="p-4 border-t border-white/10">
              <DialogPrimitive.Close asChild>
                <button
                  type="button"
                  className={cn(
                    'flex items-center gap-2 text-white/60 hover:text-white',
                    'transition-colors',
                  )}
                >
                  <X className="h-5 w-5" />
                  <span>Close</span>
                </button>
              </DialogPrimitive.Close>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 bg-(--neural-bg) overflow-auto">
            <div className="p-8">{activeContent}</div>
          </div>

          {/* Escape hint */}
          <div className="absolute bottom-4 right-4 text-white/30 text-sm">
            Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Esc</kbd> to close
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

// Backstage trigger (File tab)
interface RibbonBackstageTriggerProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}

export function RibbonBackstageTrigger({
  children,
  onClick,
  className,
}: RibbonBackstageTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-4 py-1.5 text-sm font-medium',
        'bg-(--ribbon-accent) text-white',
        'hover:bg-(--ribbon-accent)/80',
        'rounded-t-sm transition-colors',
        'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white',
        className,
      )}
    >
      {children}
    </button>
  );
}
