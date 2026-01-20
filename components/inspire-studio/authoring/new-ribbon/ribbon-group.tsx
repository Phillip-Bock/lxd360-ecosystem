'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RibbonGroupProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  expandable?: boolean;
  onExpand?: () => void;
}

export function RibbonGroup({
  title,
  children,
  className,
  expandable = false,
  onExpand,
}: RibbonGroupProps): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex flex-col gap-1.5 px-2.5 py-1.5 bg-card rounded-md shadow-sm border border-border/40 relative',
        className,
      )}
    >
      <div className="flex-1 flex items-center justify-center">{children}</div>
      <div className="flex items-center justify-center gap-1">
        <div className="text-[9px] text-muted-foreground text-center font-medium leading-tight">
          {title}
        </div>
        {expandable && (
          <button
            type="button"
            onClick={onExpand}
            className="p-0.5 hover:bg-accent rounded transition-colors"
            title={`Expand ${title}`}
          >
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
