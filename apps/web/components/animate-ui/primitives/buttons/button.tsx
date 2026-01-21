'use client';

import { type HTMLMotionProps, motion } from 'motion/react';
import type * as React from 'react';

import { Slot, type WithAsChild } from '@/components/animate-ui/primitives/animate/slot';

type ButtonProps = WithAsChild<
  HTMLMotionProps<'button'> & {
    hoverScale?: number;
    tapScale?: number;
  }
>;

function Button({
  hoverScale = 1.05,
  tapScale = 0.95,
  asChild = false,
  ...props
}: ButtonProps): React.JSX.Element {
  const motionProps = {
    whileTap: { scale: tapScale },
    whileHover: { scale: hoverScale },
    ...props,
  };

  if (asChild) {
    return <Slot {...(motionProps as React.ComponentProps<typeof Slot>)} />;
  }

  return <motion.button {...motionProps} />;
}

export { Button, type ButtonProps };
