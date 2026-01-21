export const dynamic = 'force-dynamic';

/**
 * Player layout - Full-screen layout for the course player
 * No sidebar, minimal chrome for immersive learning
 */
export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  return <div className="h-screen w-screen overflow-hidden bg-lxd-dark-bg">{children}</div>;
}
