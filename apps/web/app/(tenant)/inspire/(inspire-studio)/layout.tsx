import type { ReactNode } from 'react';

// INSPIRE Studio now uses the main dashboard layout
// This is a simple passthrough layout
export default function InspireStudioLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
