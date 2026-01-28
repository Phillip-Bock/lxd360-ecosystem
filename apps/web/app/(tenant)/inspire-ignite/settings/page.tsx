'use client';

export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Settings Index Page
 *
 * Redirects to the profile settings page.
 * The actual redirect logic is also in the layout for cases where
 * the page might not be rendered.
 */
export default function SettingsPage(): React.JSX.Element {
  const router = useRouter();

  useEffect(() => {
    router.replace('/ignite/settings/profile');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        <p className="text-muted-foreground text-sm">Redirecting...</p>
      </div>
    </div>
  );
}
