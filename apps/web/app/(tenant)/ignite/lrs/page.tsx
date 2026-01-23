'use client';

export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

/**
 * LRS section root - redirects to dashboard
 */
export default function LRSPage() {
  redirect('/(tenant)/ignite/lrs/dashboard');
}
