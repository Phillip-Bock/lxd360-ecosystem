'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { type ComponentType, isValidElement, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface IconComponentProps {
  className?: string;
}

interface RibbonButtonProps {
  icon: LucideIcon | ComponentType<IconComponentProps> | ReactNode;
  label: string;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'primary';
  disabled?: boolean;
}

export function RibbonButton({
  icon,
  label,
  size = 'small',
  onClick,
  className,
  variant = 'default',
  disabled = false,
}: RibbonButtonProps): React.JSX.Element {
  const isLarge = size === 'large';
  const isMedium = size === 'medium';

  const iconSize = isLarge ? 'w-7 h-7' : isMedium ? 'w-5 h-5' : 'w-3.5 h-3.5';

  // Check if icon is already a rendered React element
  const isReactElement = isValidElement(icon);

  // If not a React element, treat it as a component
  const IconComponent = !isReactElement ? (icon as ComponentType<IconComponentProps>) : null;

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-1.5 px-1.5 py-1 rounded transition-colors',
        'hover:bg-(--ribbon-hover) active:bg-(--ribbon-active)',
        'text-foreground/80 hover:text-foreground',
        isLarge && 'flex-col justify-center min-h-14 px-2',
        isMedium && 'flex-col justify-center min-h-11 px-2',
        variant === 'primary' && 'bg-primary/10 hover:bg-primary/20',
        disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent',
        className,
      )}
    >
      {isReactElement ? (
        // If already a React element, render it directly
        icon
      ) : IconComponent ? (
        // If it's a component, instantiate it with props
        <IconComponent className={cn(iconSize, variant === 'primary' && 'text-primary')} />
      ) : null}
      <span
        className={cn(
          'text-[10px] font-medium whitespace-nowrap',
          (isLarge || isMedium) && 'text-center',
        )}
      >
        {label}
      </span>
    </motion.button>
  );
}
