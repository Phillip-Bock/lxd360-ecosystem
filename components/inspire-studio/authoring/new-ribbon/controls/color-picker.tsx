'use client';

import * as Popover from '@radix-ui/react-popover';
import { AnimatePresence, motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { useEditor } from '@/lib/inspire-studio/editor-context';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  icon: LucideIcon;
  label: string;
  defaultColor?: string;
}

const colors = [
  [
    '#000000',
    '#434343',
    '#666666',
    '#999999',
    '#B7B7B7',
    '#CCCCCC',
    '#D9D9D9',
    '#EFEFEF',
    '#F3F3F3',
    '#FFFFFF',
  ],
  [
    '#980000',
    '#FF0000',
    '#FF9900',
    '#FFFF00',
    '#00FF00',
    '#00FFFF',
    '#4A86E8',
    '#0000FF',
    '#9900FF',
    '#FF00FF',
  ],
  [
    '#E6B8AF',
    '#F4CCCC',
    '#FCE5CD',
    '#FFF2CC',
    '#D9EAD3',
    '#D0E0E3',
    '#C9DAF8',
    '#CFE2F3',
    '#D9D2E9',
    '#EAD1DC',
  ],
  [
    '#DD7E6B',
    '#EA9999',
    '#F9CB9C',
    '#FFE599',
    '#B6D7A8',
    '#A2C4C9',
    '#A4C2F4',
    '#9FC5E8',
    '#B4A7D6',
    '#D5A6BD',
  ],
  [
    '#CC4125',
    '#E06666',
    '#F6B26B',
    '#FFD966',
    '#93C47D',
    '#76A5AF',
    '#6D9EEB',
    '#6FA8DC',
    '#8E7CC3',
    '#C27BA0',
  ],
];

export function ColorPicker({
  icon: Icon,
  label,
  defaultColor = '#000000',
}: ColorPickerProps): React.JSX.Element {
  const { state, dispatch, applyFormatting } = useEditor();
  const [open, setOpen] = useState(false);

  const handleColorSelect = (color: string): void => {
    dispatch({ type: 'SET_COLOR', payload: { color } });
    applyFormatting('foreColor', color);
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'flex flex-col items-center gap-0.5 p-1.5 rounded transition-colors',
            'hover:bg-(--ribbon-hover)',
          )}
          aria-label={label}
        >
          <Icon className="w-4 h-4" />
          <div
            className="w-4 h-1 rounded-full"
            style={{ backgroundColor: state.selectedColor ?? defaultColor }}
          />
        </motion.button>
      </Popover.Trigger>

      <Popover.Portal>
        <AnimatePresence>
          {open && (
            <Popover.Content className="z-50" sideOffset={4} asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  'bg-popover border border-border rounded-md shadow-lg p-2',
                  'w-[240px]',
                )}
              >
                <div className="flex flex-col gap-1">
                  {colors.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex gap-1">
                      {row.map((color) => (
                        <motion.button
                          key={color}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleColorSelect(color)}
                          className={cn(
                            'w-5 h-5 rounded border-2 transition-all',
                            state.selectedColor === color
                              ? 'border-primary ring-2 ring-primary/20'
                              : 'border-transparent hover:border-border',
                          )}
                          style={{ backgroundColor: color }}
                          aria-label={`Select color ${color}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </motion.div>
            </Popover.Content>
          )}
        </AnimatePresence>
      </Popover.Portal>
    </Popover.Root>
  );
}
