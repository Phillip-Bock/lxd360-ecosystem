'use client';

export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

/**
 * LRS section root - redirects to dashboard
 */
export default function LRSPage() {
  redirect('/03-lxd360-inspire-ignite/lrs/dashboard');
}
