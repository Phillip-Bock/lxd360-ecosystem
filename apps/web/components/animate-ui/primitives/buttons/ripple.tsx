'use client';

import { type HTMLMotionProps, motion } from 'motion/react';
import * as React from 'react';
import { Slot, type WithAsChild } from '@/components/animate-ui/primitives/animate/slot';
import { getStrictContext } from '@/lib/get-strict-context';

type Ripple = {
  id: number;
  x: number;
  y: number;
};

type RippleButtonContextType = {
  ripples: Ripple[];
  setRipples: (ripples: Ripple[]) => void;
};

const [RippleButtonProvider, useRippleButton] =
  getStrictContext<RippleButtonContextType>('RippleButtonContext');

type RippleButtonProps = WithAsChild<
  HTMLMotionProps<'button'> & {
    hoverScale?: number;
    tapScale?: number;
  }
>;

function RippleButton({
  ref,
  onClick,
  hoverScale = 1.05,
  tapScale = 0.95,
  asChild = false,
  style,
  ...props
}: RippleButtonProps): React.JSX.Element {
  const [ripples, setRipples] = React.useState<Ripple[]>([]);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  React.useImperativeHandle(ref, () => buttonRef.current as HTMLButtonElement);

  const createRipple = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newRipple: Ripple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  }, []);

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      createRipple(event);
      if (onClick) {
        onClick(event);
      }
    },
    [createRipple, onClick],
  );

  const commonProps = {
    ref: buttonRef,
    'data-slot': 'ripple-button',
    onClick: handleClick,
    whileTap: { scale: tapScale },
    whileHover: { scale: hoverScale },
    style: {
      position: 'relative' as const,
      overflow: 'hidden' as const,
      ...style,
    },
    ...props,
  };

  return (
    <RippleButtonProvider value={{ ripples, setRipples }}>
      {asChild ? (
        <Slot {...(commonProps as React.ComponentProps<typeof Slot>)} />
      ) : (
        <motion.button {...commonProps} />
      )}
    </RippleButtonProvider>
  );
}

type RippleButtonRipplesProps = WithAsChild<
  HTMLMotionProps<'span'> & {
    color?: string;
    scale?: number;
  }
>;

function RippleButtonRipples({
  color = 'var(--ripple-button-ripple-color)',
  scale = 10,
  transition = { duration: 0.6, ease: 'easeOut' },
  asChild = false,
  style,
  ...props
}: RippleButtonRipplesProps): React.JSX.Element[] {
  const { ripples } = useRippleButton();

  return ripples.map((ripple) => {
    const commonProps = {
      initial: { scale: 0, opacity: 0.5 },
      animate: { scale, opacity: 0 },
      transition,
      style: {
        position: 'absolute' as const,
        borderRadius: '50%',
        pointerEvents: 'none' as const,
        width: '20px',
        height: '20px',
        backgroundColor: color,
        top: ripple.y - 10,
        left: ripple.x - 10,
        ...style,
      },
      ...props,
    };

    if (asChild) {
      return <Slot key={ripple.id} {...(commonProps as React.ComponentProps<typeof Slot>)} />;
    }

    return <motion.span key={ripple.id} {...commonProps} />;
  });
}

export { RippleButton, RippleButtonRipples, type RippleButtonProps, type RippleButtonRipplesProps };
