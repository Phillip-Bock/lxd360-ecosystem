'use client';

export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

/**
 * Manage section root - redirects to dashboard
 */
export default function ManagePage() {
  redirect('/03-lxd360-inspire-ignite/manage/dashboard');
}
