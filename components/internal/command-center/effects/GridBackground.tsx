'use client';

export function GridBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(rgba(6, 182, 212, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(6, 182, 212, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }}
      aria-hidden="true"
    />
  );
}
