export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getDashboardRoute } from '@/lib/config/navigation';

export default async function DashboardPage() {
  // TODO(LXD-297): Implement auth check with Firebase Admin
  const user = null;
  const authError = null;

  if (authError || !user) {
    redirect('/auth/login?redirect=/dashboard');
  }

  // TODO(LXD-297): Fetch user role from Firestore
  const userRole = 'user';

  const dashboardRoute = getDashboardRoute(userRole);

  redirect(dashboardRoute);
}
