'use client';

import * as React from 'react';
import {
  Card as BaseCard,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card-base';
import { type GlassCustomization, getGlassStyles } from '@/lib/glass-utils';
import { type HoverEffect, hoverEffects } from '@/lib/hover-effects';
import { cn } from '@/lib/utils';

type CardVariant = 'default' | 'glass' | 'frosted' | 'fluted' | 'crystal';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  gradient?: boolean;
  animated?: boolean;
  hover?: HoverEffect;
  glass?: GlassCustomization;
}

/**
 * Glass UI Card - A beautifully designed card component with glassy effects
 * Built on top of the base Card component with enhanced visual styling
 *
 * @example
 * ```tsx
 * // Standard glass variant (default)
 * <Card variant="glass">
 *   Content
 * </Card>
 *
 * // Frosted glass variant - enhanced blur and opacity
 * <Card variant="frosted">
 *   Content
 * </Card>
 *
 * // Fluted glass variant - vertical ridges texture
 * <Card variant="fluted">
 *   Content
 * </Card>
 *
 * // Crystal glass variant - clear with highlights and glow
 * <Card variant="crystal">
 *   Content
 * </Card>
 *
 * // Custom glass properties
 * <Card
 *   variant="glass"
 *   glass={{
 *     color: "rgba(139, 92, 246, 0.2)",
 *     blur: 30,
 *     transparency: 0.3,
 *     outline: "rgba(139, 92, 246, 0.5)",
 *     innerGlow: "rgba(255, 255, 255, 0.3)",
 *     innerGlowBlur: 25
 *   }}
 *   gradient
 *   animated
 * >
 *   Content
 * </Card>
 * ```
 */
const variantStyles: Record<CardVariant, string> = {
  default:
    'bg-card/80 backdrop-blur-xl border-border rounded-lg transition-shadow hover:shadow-glow-md',
  glass:
    'backdrop-blur-xl bg-lxd-card border-lxd-border rounded-lg transition-shadow hover:shadow-glow-md',
  frosted:
    'backdrop-blur-xl bg-lxd-card/90 border-lxd-border rounded-lg transition-shadow hover:shadow-glow-md',
  fluted:
    'backdrop-blur-xl bg-lxd-card border-lxd-border rounded-lg bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:4px_100%] transition-shadow hover:shadow-glow-md',
  crystal:
    'backdrop-blur-xs bg-card/50 border-lxd-border rounded-lg shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] transition-shadow hover:shadow-glow-lg',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      gradient = false,
      animated = false,
      hover = 'none',
      glass,
      children,
      style,
      ...props
    },
    ref,
  ) => {
    const glassStyle = glass ? getGlassStyles(glass) : undefined;

    return (
      <BaseCard
        ref={ref}
        style={{ ...glassStyle, ...style }}
        className={cn(
          'relative overflow-hidden',
          variantStyles[variant],
          gradient &&
            'bg-linear-to-br from-lxd-primary/10 via-lxd-secondary/10 to-neural-purple/10',
          animated && 'transition-all duration-300 hover:scale-[1.02] hover:shadow-lg',
          hoverEffects({ hover }),
          className,
        )}
        {...props}
      >
        {children}
      </BaseCard>
    );
  },
);
Card.displayName = 'Card';

export { CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
