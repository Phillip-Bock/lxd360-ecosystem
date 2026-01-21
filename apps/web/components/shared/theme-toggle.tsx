'use client';

import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const TOGGLE_CLASSES =
  'text-sm font-medium flex items-center gap-2 px-3 md:pl-3 md:pr-3.5 py-3 md:py-1.5 transition-colors relative z-10';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const selected = theme === 'dark' ? 'dark' : 'light';

  return (
    <div className="relative flex w-fit items-center rounded-full bg-lxd-light-surface dark:bg-lxd-dark-surface">
      <button
        type="button"
        className={`${TOGGLE_CLASSES} ${
          selected === 'light'
            ? 'text-brand-primary'
            : 'text-lxd-text-dark dark:text-lxd-text-light'
        }`}
        onClick={() => setTheme('light')}
      >
        <Sun className="relative z-10 h-4 w-4 md:h-3.5 md:w-3.5" />
        <span className="relative z-10 hidden sm:inline">Light</span>
      </button>
      <button
        type="button"
        className={`${TOGGLE_CLASSES} ${
          selected === 'dark' ? 'text-brand-primary' : 'text-lxd-text-dark dark:text-lxd-text-light'
        }`}
        onClick={() => setTheme('dark')}
      >
        <Moon className="relative z-10 h-4 w-4 md:h-3.5 md:w-3.5" />
        <span className="relative z-10 hidden sm:inline">Dark</span>
      </button>
      <div
        className={`absolute inset-0 z-0 flex ${
          selected === 'dark' ? 'justify-end' : 'justify-start'
        }`}
      >
        <motion.span
          layout
          transition={{ type: 'spring', damping: 15, stiffness: 250 }}
          className="h-full w-1/2 rounded-full bg-linear-to-r from-blue-600 to-blue-700"
        />
      </div>
    </div>
  );
}
