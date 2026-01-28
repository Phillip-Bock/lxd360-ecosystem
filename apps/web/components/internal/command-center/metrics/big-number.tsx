'use client';

import { useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface BigNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

export function BigNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 2000,
  className = '',
}: BigNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const easeOutCubic = 1 - (1 - progress) ** 3;

      const currentValue = startValue + (value - startValue) * easeOutCubic;
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  const formatted = Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(displayValue);

  return (
    <span
      ref={ref}
      className={`text-3xl font-bold text-brand-primary font-mono tracking-tight ${className}`}
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
