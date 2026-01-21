export const dynamic = 'force-dynamic';

import { CreditCard } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Billing | Organization Admin | LXP360',
  description: 'Organization billing management',
};

export default function OrgAdminBillingPage(): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-lxd-primary/10">
            <CreditCard className="h-8 w-8 text-lxd-primary" />
          </div>
          <CardTitle className="text-2xl">Billing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Organization billing is under development.</p>
          <Button asChild>
            <Link href="/organization-admin">Back to Org Admin</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
