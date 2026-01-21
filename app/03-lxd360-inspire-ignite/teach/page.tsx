'use client';

export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

/**
 * Teach section root - redirects to gradebook
 */
export default function TeachPage() {
  redirect('/03-lxd360-inspire-ignite/teach/gradebook');
}
