'use client';

export function ScanlineOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-50"
      style={{
        background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(6, 182, 212, 0.015) 2px,
          rgba(6, 182, 212, 0.015) 4px
        )`,
      }}
      aria-hidden="true"
    />
  );
}
