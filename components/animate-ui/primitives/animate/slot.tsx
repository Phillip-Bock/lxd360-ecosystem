'use client';

import { isMotionComponent, motion } from 'motion/react';
import * as React from 'react';
import { cn } from '@/lib/utils';

// Permissive props type for internal forwarding
type AnyProps = { [key: string]: unknown };

// SlotProps accepts unknown props - type safety enforced at usage site
interface SlotProps<T extends HTMLElement = HTMLElement> {
  ref?: React.Ref<T>;
  children?: React.ReactNode;
  [key: string]: unknown;
}

type WithAsChild<Base extends object> =
  | (Base & { asChild: true; children: React.ReactElement })
  | (Base & { asChild?: false | undefined });

function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> {
  return (node) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === 'function') {
        ref(node);
      } else {
        (ref as React.RefObject<T | null>).current = node;
      }
    });
  };
}

function mergeProps(childProps: AnyProps, slotProps: AnyProps): AnyProps {
  const merged: AnyProps = { ...childProps, ...slotProps };

  if (childProps.className || slotProps.className) {
    merged.className = cn(childProps.className as string, slotProps.className as string);
  }

  if (childProps.style || slotProps.style) {
    merged.style = {
      ...(childProps.style as React.CSSProperties),
      ...(slotProps.style as React.CSSProperties),
    };
  }

  return merged;
}

function Slot<T extends HTMLElement = HTMLElement>({
  children,
  ref,
  ...props
}: SlotProps<T>): React.ReactNode {
  // React Hooks must be called before any early returns
  const childType = React.isValidElement(children) ? children.type : null;
  const isAlreadyMotion =
    childType !== null && typeof childType === 'object' && isMotionComponent(childType);

  const Base = React.useMemo(
    () =>
      childType && isAlreadyMotion
        ? (childType as React.ElementType)
        : childType
          ? motion.create(childType as React.ElementType)
          : null,
    [isAlreadyMotion, childType],
  );

  // Validate element AFTER hooks
  if (!React.isValidElement(children)) return null;

  const { ref: childRef, ...childProps } = children.props as AnyProps & {
    ref?: React.Ref<T>;
  };

  const mergedProps = mergeProps(childProps, props);
  const combinedRef = mergeRefs<T>(childRef, ref);

  // Cast Base to accept the ref - motion.create returns a motion component
  // that accepts refs, but TypeScript can't infer this from dynamic creation
  const MotionBase = Base as React.ComponentType<AnyProps & { ref?: React.Ref<T> }>;

  return <MotionBase {...mergedProps} ref={combinedRef} />;
}

export { Slot, type SlotProps, type WithAsChild, type AnyProps };
