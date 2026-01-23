'use client';

export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

/**
 * Teach section root - redirects to gradebook
 */
export default function TeachPage() {
  redirect('/(tenant)/ignite/teach/gradebook');
}
