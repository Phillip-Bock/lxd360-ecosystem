'use client';

import dynamic from 'next/dynamic';

// Dynamic import for 3D components (no SSR for Three.js)
// Moved to Client Component per Next.js 15 requirements
const GlobalReachSection = dynamic(
  () => import('./GlobalReachSection').then((mod) => mod.GlobalReachSection),
  { ssr: false },
);

export function GlobalReachSectionWrapper(): React.JSX.Element {
  return <GlobalReachSection />;
}
