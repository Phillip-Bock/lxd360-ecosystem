'use client';

import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RibbonTab } from './new-authoring-ribbon';

interface RibbonTabsProps {
  activeTab: RibbonTab;
  onTabChange: (tab: RibbonTab) => void;
  isMinimized: boolean;
  onMinimizeToggle: () => void;
}

const tabs: { value: RibbonTab; label: string }[] = [
  { value: 'home', label: 'Home' },
  { value: 'insert', label: 'Insert' },
  { value: 'design', label: 'Design' },
  { value: 'transitions', label: 'Transitions' },
  { value: 'animations', label: 'Animations' },
  { value: 'slideshow', label: 'Slide Show' },
  { value: 'review', label: 'Review' },
  { value: 'view', label: 'View' },
  { value: 'format', label: 'Format' },
  { value: 'help', label: 'Help' },
];

export function RibbonTabs({
  activeTab,
  onTabChange,
  isMinimized,
  onMinimizeToggle,
}: RibbonTabsProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center gap-1">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={cn(
              'relative px-4 py-2 text-sm font-medium transition-colors',
              'hover:bg-(--ribbon-hover) rounded-t-md',
              activeTab === tab.value ? 'text-primary' : 'text-foreground/70',
            )}
          >
            {tab.label}
            {activeTab === tab.value && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onMinimizeToggle}
        className="p-2 hover:bg-(--ribbon-hover) rounded-md transition-colors"
        aria-label={isMinimized ? 'Expand ribbon' : 'Minimize ribbon'}
      >
        {isMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>
    </div>
  );
}
