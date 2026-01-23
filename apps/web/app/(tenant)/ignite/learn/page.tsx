export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

/**
 * /ignite/learn - Learning home page
 * Redirects to my-learning by default
 */
export default function LearnPage() {
  redirect('/(tenant)/ignite/learn/my-learning');
}
