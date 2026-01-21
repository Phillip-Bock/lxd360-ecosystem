'use client';

import * as Select from '@radix-ui/react-select';
import { motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const sizes = [
  '8',
  '9',
  '10',
  '11',
  '12',
  '14',
  '16',
  '18',
  '20',
  '24',
  '28',
  '32',
  '36',
  '48',
  '72',
];

export function FontSizePicker(): React.JSX.Element {
  const [value, setValue] = useState('18');

  return (
    <Select.Root value={value} onValueChange={setValue}>
      <Select.Trigger
        className={cn(
          'flex items-center justify-between gap-2 px-3 py-1.5 rounded',
          'bg-brand-surface border border-input hover:border-ring',
          'text-sm w-[70px] transition-colors',
        )}
      >
        <Select.Value />
        <Select.Icon>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className={cn(
            'overflow-hidden bg-popover rounded-md shadow-lg border border-border',
            'w-(--radix-select-trigger-width) max-h-[300px]',
          )}
          position="popper"
          sideOffset={4}
        >
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Select.Viewport className="p-1">
              {sizes.map((size) => (
                <Select.Item
                  key={size}
                  value={size}
                  className={cn(
                    'relative flex items-center px-8 py-2 rounded-sm',
                    'text-sm cursor-pointer select-none',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus:bg-accent focus:text-accent-foreground outline-hidden',
                    'data-[state=checked]:bg-accent/50',
                  )}
                >
                  <Select.ItemIndicator className="absolute left-2">
                    <Check className="w-4 h-4" />
                  </Select.ItemIndicator>
                  <Select.ItemText>{size}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </motion.div>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
