'use client';
import { AnimatePresence, motion, type Transition } from 'motion/react';
import { Children, cloneElement, type ReactElement, useEffect, useId, useState } from 'react';
import { cn } from '@/lib/utils';

export type AnimatedBackgroundProps = {
  children: ReactElement<{ 'data-id': string }>[] | ReactElement<{ 'data-id': string }>;
  defaultValue?: string;
  onValueChange?: (newActiveId: string | null) => void;
  className?: string;
  transition?: Transition;
  enableHover?: boolean;
};

export function AnimatedBackground({
  children,
  defaultValue,
  onValueChange,
  className,
  transition,
  enableHover = false,
}: AnimatedBackgroundProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const uniqueId = useId();

  const handleSetActiveId = (id: string | null): void => {
    setActiveId(id);

    if (onValueChange) {
      onValueChange(id);
    }
  };

  useEffect(() => {
    if (defaultValue !== undefined) {
      setActiveId(defaultValue);
    }
  }, [defaultValue]);

  return Children.map(children, (child: unknown, index) => {
    // Type guard for React element
    if (
      !child ||
      typeof child !== 'object' ||
      !('props' in child) ||
      !child.props ||
      typeof child.props !== 'object'
    ) {
      return null;
    }

    const childElement = child as ReactElement<{
      'data-id': string;
      className?: string;
      children?: React.ReactNode;
    }>;

    const id = childElement.props['data-id'];

    const interactionProps = enableHover
      ? {
          onMouseEnter: () => handleSetActiveId(id),
          onMouseLeave: () => handleSetActiveId(null),
        }
      : {
          onClick: () => handleSetActiveId(id),
        };

    return cloneElement(
      childElement,
      {
        key: index,
        className: cn('relative inline-flex', childElement.props.className),
        'data-checked': activeId === id ? 'true' : 'false',
        ...interactionProps,
      } as Partial<unknown>,
      <>
        <AnimatePresence initial={false}>
          {activeId === id && (
            <motion.div
              layoutId={`background-${uniqueId}`}
              className={cn('absolute inset-0', className)}
              transition={transition}
              initial={{ opacity: defaultValue ? 1 : 0 }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
            />
          )}
        </AnimatePresence>
        <div className="z-10">{childElement.props.children}</div>
      </>,
    );
  });
}
