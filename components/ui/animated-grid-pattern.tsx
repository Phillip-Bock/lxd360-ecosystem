'use client';

import { motion } from 'motion/react';
import {
  type ComponentPropsWithoutRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { cn } from '@/lib/utils';

export interface AnimatedGridPatternProps extends ComponentPropsWithoutRef<'svg'> {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  strokeDasharray?: number;
  numSquares?: number;
  maxOpacity?: number;
  duration?: number;
  repeatDelay?: number;
}

export function AnimatedGridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  numSquares = 50,
  className,
  maxOpacity = 0.5,
  duration = 4,
  ...props
}: AnimatedGridPatternProps) {
  const id = useId();
  const containerRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Store dimensions in a ref for use in callbacks without causing re-renders
  const dimensionsRef = useRef(dimensions);
  dimensionsRef.current = dimensions;

  const getPos = useCallback(() => {
    return [
      Math.floor((Math.random() * dimensionsRef.current.width) / width),
      Math.floor((Math.random() * dimensionsRef.current.height) / height),
    ];
  }, [width, height]);

  // Adjust the generateSquares function to return objects with an id, x, and y
  const generateSquares = useCallback(
    (count: number) => {
      return Array.from({ length: count }, (_, i) => ({
        id: i,
        pos: getPos(),
      }));
    },
    [getPos],
  );

  const [squares, setSquares] = useState(() =>
    Array.from({ length: numSquares }, (_, i) => ({
      id: i,
      pos: [0, 0] as number[],
    })),
  );

  // Function to update a single square's position
  const updateSquarePosition = useCallback(
    (squareId: number) => {
      setSquares((currentSquares) =>
        currentSquares.map((sq) =>
          sq.id === squareId
            ? {
                ...sq,
                pos: getPos(),
              }
            : sq,
        ),
      );
    },
    [getPos],
  );

  // Update squares to animate in
  useEffect(() => {
    if (dimensions.width && dimensions.height) {
      setSquares(generateSquares(numSquares));
    }
  }, [dimensions, numSquares, generateSquares]);

  // Resize observer to update container dimensions
  useEffect(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(currentContainer);

    return () => {
      resizeObserver.unobserve(currentContainer);
    };
  }, []);

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30',
        className,
      )}
      {...props}
    >
      <defs>
        <pattern id={id} width={width} height={height} patternUnits="userSpaceOnUse" x={x} y={y}>
          <path d={`M.5 ${height}V.5H${width}`} fill="none" strokeDasharray={strokeDasharray} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      <svg aria-hidden="true" x={x} y={y} className="overflow-visible">
        {squares.map(({ pos: [x, y], id }, index) => (
          <motion.rect
            initial={{ opacity: 0 }}
            animate={{ opacity: maxOpacity }}
            transition={{
              duration,
              repeat: 1,
              delay: index * 0.1,
              repeatType: 'reverse',
            }}
            onAnimationComplete={() => updateSquarePosition(id)}
            key={`${x}-${y}-${index}`}
            width={width - 1}
            height={height - 1}
            x={x * width + 1}
            y={y * height + 1}
            fill="currentColor"
            strokeWidth="0"
          />
        ))}
      </svg>
    </svg>
  );
}
