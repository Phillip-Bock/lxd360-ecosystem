'use client';

import type React from 'react';

import { memo, useCallback, useEffect, useRef } from 'react';

interface GlowingEffectProps {
  spread?: number;
  glow?: boolean;
  disabled?: boolean;
  proximity?: number;
  inactiveZone?: number;
  borderWidth?: number;
}

const GlowingEffect = memo(function GlowingEffect({
  spread = 40,
  glow = true,
  disabled = false,
  proximity = 64,
  inactiveZone = 0.01,
  borderWidth = 1,
}: GlowingEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPosition = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(0);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (disabled || !containerRef.current) return;

      const container = containerRef.current;
      const parent = container.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      const maxDistance = Math.sqrt((rect.width / 2) ** 2 + (rect.height / 2) ** 2);
      const normalizedDistance = distanceFromCenter / maxDistance;

      if (normalizedDistance < inactiveZone) return;

      const isWithinBounds =
        x >= -proximity &&
        x <= rect.width + proximity &&
        y >= -proximity &&
        y <= rect.height + proximity;

      if (!isWithinBounds) {
        container.style.opacity = '0';
        return;
      }

      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = requestAnimationFrame(() => {
        lastPosition.current = { x, y };
        container.style.opacity = '1';
        container.style.setProperty('--glow-x', `${x}px`);
        container.style.setProperty('--glow-y', `${y}px`);
        container.style.setProperty('--glow-spread', `${spread}px`);
        container.style.setProperty('--glow-border-width', `${borderWidth}px`);
      });
    },
    [disabled, proximity, inactiveZone, spread, borderWidth],
  );

  const handleMouseLeave = useCallback(() => {
    if (!containerRef.current) return;
    containerRef.current.style.opacity = '0';
  }, []);

  useEffect(() => {
    if (disabled) return;

    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    parent.addEventListener('mousemove', handleMouseMove);
    parent.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      parent.removeEventListener('mousemove', handleMouseMove);
      parent.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [disabled, handleMouseMove, handleMouseLeave]);

  if (disabled) return null;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300"
      style={
        {
          '--glow-x': '0px',
          '--glow-y': '0px',
          '--glow-spread': `${spread}px`,
          '--glow-border-width': `${borderWidth}px`,
        } as React.CSSProperties
      }
    >
      {/* Border glow */}
      <div
        className="absolute inset-0 rounded-[inherit]"
        style={{
          background: `radial-gradient(
            var(--glow-spread) circle at var(--glow-x) var(--glow-y),
            #7c3aed,
            #9333ea,
            #a855f7,
            #c026d3,
            transparent 100%
          )`,
          mask: `
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0)
          `,
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: 'var(--glow-border-width)',
        }}
      />
      {/* Glow effect */}
      {glow && (
        <div
          className="absolute inset-0 rounded-[inherit]"
          style={{
            background: `radial-gradient(
              calc(var(--glow-spread) * 1.5) circle at var(--glow-x) var(--glow-y),
              rgba(124, 58, 237, 0.15),
              rgba(147, 51, 234, 0.1),
              rgba(168, 85, 247, 0.05),
              transparent 100%
            )`,
          }}
        />
      )}
    </div>
  );
});

GlowingEffect.displayName = 'GlowingEffect';

export { GlowingEffect };
