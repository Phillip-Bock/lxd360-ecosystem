'use client';

import { type HTMLMotionProps, motion, type Variant } from 'motion/react';
import type * as React from 'react';
import { Slot, type WithAsChild } from '@/components/animate-ui/primitives/animate/slot';
import { getStrictContext } from '@/lib/get-strict-context';

const buildVariant = ({
  opacity,
  rotation,
  offset,
  isVertical,
  rotateAxis,
}: {
  opacity: number;
  rotation: number;
  offset: string | null;
  isVertical: boolean;
  rotateAxis: string;
}): Variant => ({
  opacity,
  [rotateAxis]: rotation,
  ...(isVertical && offset !== null ? { y: offset } : {}),
  ...(!isVertical && offset !== null ? { x: offset } : {}),
});

type FlipDirection = 'top' | 'bottom' | 'left' | 'right';

type FlipButtonContextType = {
  from: FlipDirection;
  isVertical: boolean;
  rotateAxis: string;
};

const [FlipButtonProvider, useFlipButton] =
  getStrictContext<FlipButtonContextType>('FlipButtonContext');

type FlipButtonProps = WithAsChild<
  HTMLMotionProps<'button'> & {
    from?: FlipDirection;
    tapScale?: number;
  }
>;

function FlipButton({
  from = 'top',
  tapScale = 0.95,
  asChild = false,
  style,
  ...props
}: FlipButtonProps): React.JSX.Element {
  const isVertical = from === 'top' || from === 'bottom';
  const rotateAxis = isVertical ? 'rotateX' : 'rotateY';

  const commonProps = {
    'data-slot': 'flip-button',
    initial: 'initial' as const,
    whileHover: 'hover' as const,
    whileTap: { scale: tapScale },
    style: {
      display: 'inline-grid' as const,
      placeItems: 'center' as const,
      perspective: '1000px',
      ...style,
    },
    ...props,
  };

  return (
    <FlipButtonProvider value={{ from, isVertical, rotateAxis }}>
      {asChild ? (
        <Slot {...(commonProps as React.ComponentProps<typeof Slot>)} />
      ) : (
        <motion.button {...commonProps} />
      )}
    </FlipButtonProvider>
  );
}

type FlipButtonFaceProps = WithAsChild<HTMLMotionProps<'span'>>;

function FlipButtonFront({
  transition = { type: 'spring', stiffness: 280, damping: 20 },
  asChild = false,
  style,
  ...props
}: FlipButtonFaceProps): React.JSX.Element {
  const { from, isVertical, rotateAxis } = useFlipButton();

  const frontOffset = from === 'top' || from === 'left' ? '50%' : '-50%';

  const frontVariants = {
    initial: buildVariant({
      opacity: 1,
      rotation: 0,
      offset: '0%',
      isVertical,
      rotateAxis,
    }),
    hover: buildVariant({
      opacity: 0,
      rotation: 90,
      offset: frontOffset,
      isVertical,
      rotateAxis,
    }),
  };

  const commonProps = {
    'data-slot': 'flip-button-front',
    variants: frontVariants,
    transition,
    style: {
      gridArea: '1 / 1',
      display: 'inline-flex' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      ...style,
    },
    ...props,
  };

  if (asChild) {
    return <Slot {...(commonProps as React.ComponentProps<typeof Slot>)} />;
  }

  return <motion.span {...commonProps} />;
}

function FlipButtonBack({
  transition = { type: 'spring', stiffness: 280, damping: 20 },
  asChild = false,
  style,
  ...props
}: FlipButtonFaceProps): React.JSX.Element {
  const { from, isVertical, rotateAxis } = useFlipButton();

  const backOffset = from === 'top' || from === 'left' ? '-50%' : '50%';

  const backVariants = {
    initial: buildVariant({
      opacity: 0,
      rotation: 90,
      offset: backOffset,
      isVertical,
      rotateAxis,
    }),
    hover: buildVariant({
      opacity: 1,
      rotation: 0,
      offset: '0%',
      isVertical,
      rotateAxis,
    }),
  };

  const commonProps = {
    'data-slot': 'flip-button-back',
    variants: backVariants,
    transition,
    style: {
      gridArea: '1 / 1',
      display: 'inline-flex' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      ...style,
    },
    ...props,
  };

  if (asChild) {
    return <Slot {...(commonProps as React.ComponentProps<typeof Slot>)} />;
  }

  return <motion.span {...commonProps} />;
}

export {
  FlipButton,
  FlipButtonFront,
  FlipButtonBack,
  useFlipButton,
  type FlipButtonProps,
  type FlipButtonFaceProps as FlipButtonFrontProps,
  type FlipButtonFaceProps as FlipButtonBackProps,
  type FlipDirection,
  type FlipButtonContextType,
};
