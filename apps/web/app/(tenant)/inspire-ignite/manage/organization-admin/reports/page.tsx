export const dynamic = 'force-dynamic';

import { FileBarChart } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Reports | Organization Admin | LXP360',
  description: 'Organization reports and analytics',
};

export default function OrgAdminReportsPage(): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-lxd-primary/10">
            <FileBarChart className="h-8 w-8 text-lxd-primary" />
          </div>
          <CardTitle className="text-2xl">Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Organization reports is under development.</p>
          <Button asChild>
            <Link href="/organization-admin">Back to Org Admin</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
