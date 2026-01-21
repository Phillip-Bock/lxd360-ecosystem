'use client';

export const dynamic = 'force-dynamic';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * LRS Analytics page - Deep analytics on learning data
 */
export default function LRSAnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">LRS Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep analytics on learning record data</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" aria-hidden="true" />
          Export
        </Button>
      </div>

      {/* Analytics content placeholder */}
      <Card className="bg-lxd-dark-surface border-lxd-dark-border">
        <CardHeader>
          <CardTitle className="text-brand-primary">BigQuery Analytics</CardTitle>
          <CardDescription>Advanced analytics powered by BigQuery</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              BigQuery analytics dashboard will be implemented in Phase 4.
            </p>
            <p className="text-sm text-muted-foreground mt-2">This will include:</p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• Learning pathway analysis</li>
              <li>• Cognitive load trends</li>
              <li>• Mastery progression over time</li>
              <li>• Content effectiveness metrics</li>
              <li>• Custom SQL queries</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
