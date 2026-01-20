'use client';

import * as React from 'react';
import { InputGroup as BaseInputGroup } from '@/components/ui/input-group';
import { type GlassCustomization, getGlassStyles } from '@/lib/glass-utils';
import { type HoverEffect, hoverEffects } from '@/lib/hover-effects';
import { cn } from '@/lib/utils';

type InputGroupVariant = 'default' | 'glass' | 'frosted';

export interface InputGroupProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  variant?: InputGroupVariant;
  effect?: HoverEffect;
  glass?: GlassCustomization;
}

const variantStyles: Record<InputGroupVariant, string> = {
  default: '',
  glass: 'backdrop-blur-md bg-white/10 dark:bg-black/20 border-white/20 dark:border-white/10',
  frosted: 'backdrop-blur-xl bg-white/20 dark:bg-black/30 border-white/30 dark:border-white/15',
};

/**
 * Glass UI Input Group - A beautifully designed input group with glassy effects
 * Built on top of the base InputGroup component with enhanced visual styling
 */
export const InputGroup = React.forwardRef<HTMLFieldSetElement, InputGroupProps>(
  ({ className, variant = 'default', effect = 'none', glass, style, ...props }, ref) => {
    const glassStyle = glass ? getGlassStyles(glass) : undefined;

    return (
      <BaseInputGroup
        ref={ref}
        style={{ ...glassStyle, ...style }}
        className={cn(variantStyles[variant], hoverEffects({ hover: effect }), className)}
        {...props}
      />
    );
  },
);
InputGroup.displayName = 'InputGroup';
