'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { RibbonTabs } from './ribbon-tabs';
import { AnimationsTab } from './tabs/animations-tab';
import { DesignTab } from './tabs/design-tab';
import { FormatTab } from './tabs/format-tab';
import { HomeTab } from './tabs/home-tab';
import { InsertTab } from './tabs/insert-tab';
import { ReviewTab } from './tabs/review-tab';
import { TransitionsTab } from './tabs/transitions-tab';
import { ViewTab } from './tabs/view-tab';

export type RibbonTab =
  | 'home'
  | 'insert'
  | 'design'
  | 'transitions'
  | 'animations'
  | 'slideshow'
  | 'review'
  | 'view'
  | 'format'
  | 'help';

interface NewAuthoringRibbonProps {
  onRightSidebarOpen?: (content: React.ReactNode) => void;
  onRightSidebarClose?: () => void;
  isMinimized?: boolean;
  onMinimizeToggle?: () => void;
}

export function NewAuthoringRibbon({
  onRightSidebarOpen,
  onRightSidebarClose: _onRightSidebarClose,
  isMinimized: externalMinimized,
  onMinimizeToggle,
}: NewAuthoringRibbonProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<RibbonTab>('home');
  const [internalMinimized, setInternalMinimized] = useState(false);
  const isMinimized = externalMinimized !== undefined ? externalMinimized : internalMinimized;

  void _onRightSidebarClose;

  return (
    <div className="bg-(--ribbon-bg) border-b border-(--ribbon-border) shadow-sm">
      {/* Tab Bar */}
      <RibbonTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isMinimized={isMinimized}
        onMinimizeToggle={() => {
          if (externalMinimized !== undefined && onMinimizeToggle) {
            // If externally controlled, call parent's toggle handler
            onMinimizeToggle();
          } else {
            // Otherwise, use internal state
            setInternalMinimized(!internalMinimized);
          }
        }}
      />

      {/* Ribbon Content */}
      <AnimatePresence mode="wait">
        {!isMinimized && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
              'border-t border-(--ribbon-border)',
              'bg-linear-to-b from-(--ribbon-bg) to-white',
            )}
          >
            <div className="px-3 py-1.5">
              {activeTab === 'home' && <HomeTab onExpandGroup={onRightSidebarOpen} />}
              {activeTab === 'insert' && <InsertTab />}
              {activeTab === 'design' && <DesignTab />}
              {activeTab === 'transitions' && <TransitionsTab />}
              {activeTab === 'animations' && <AnimationsTab />}
              {activeTab === 'slideshow' && (
                <div className="text-muted-foreground text-sm py-8 text-center">
                  Slideshow tab content
                </div>
              )}
              {activeTab === 'review' && <ReviewTab />}
              {activeTab === 'view' && <ViewTab />}
              {activeTab === 'format' && <FormatTab />}
              {activeTab === 'help' && (
                <div className="text-muted-foreground text-sm py-8 text-center">
                  Help tab content (Support resources)
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
