'use client';

import { motion } from 'framer-motion';
import { Bold, Italic, Strikethrough, Underline } from 'lucide-react';
import { useEditor } from '@/lib/inspire-studio/editor-context';
import { cn } from '@/lib/utils';

type TextFormatKey = 'bold' | 'italic' | 'underline' | 'strikethrough';

interface StyleButton {
  icon: typeof Bold;
  label: string;
  key: TextFormatKey;
  command: TextFormatKey;
}

const styles: StyleButton[] = [
  { icon: Bold, label: 'Bold', key: 'bold', command: 'bold' },
  { icon: Italic, label: 'Italic', key: 'italic', command: 'italic' },
  { icon: Underline, label: 'Underline', key: 'underline', command: 'underline' },
  { icon: Strikethrough, label: 'Strikethrough', key: 'strikethrough', command: 'strikethrough' },
];

export function FontStyleButtons(): React.JSX.Element {
  const { state, applyFormatting } = useEditor();

  const toggleStyle = (command: TextFormatKey): void => {
    applyFormatting(command);
  };

  return (
    <div className="flex gap-0.5">
      {styles.map(({ icon: Icon, label, key, command }) => (
        <motion.button
          key={key}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => toggleStyle(command)}
          className={cn(
            'p-1.5 rounded transition-colors',
            'hover:bg-(--ribbon-hover)',
            state.activeStyles.has(key) && 'bg-(--ribbon-active) text-primary',
          )}
          aria-label={label}
          aria-pressed={state.activeStyles.has(key)}
        >
          <Icon className="w-4 h-4" />
        </motion.button>
      ))}
    </div>
  );
}
