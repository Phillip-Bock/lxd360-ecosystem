'use client';

export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

/**
 * Manage section root - redirects to dashboard
 */
export default function ManagePage() {
  redirect('/(tenant)/ignite/manage/dashboard');
}
