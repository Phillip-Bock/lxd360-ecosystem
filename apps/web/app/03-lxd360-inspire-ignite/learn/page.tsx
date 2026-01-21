export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

/**
 * /ignite/learn - Learning home page
 * Redirects to my-learning by default
 */
export default function LearnPage() {
  redirect('/03-lxd360-inspire-ignite/learn/my-learning');
}
