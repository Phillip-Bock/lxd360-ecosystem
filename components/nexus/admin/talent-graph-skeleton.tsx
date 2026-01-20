'use client';

/**
 * Talent Graph Skeleton
 * =====================
 * Loading skeleton for the admin talent graph page.
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function TalentGraphSkeleton(): React.JSX.Element {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-44" />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div>
                  <Skeleton className="h-6 w-12 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Graph Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-72 mt-1" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[500px] w-full rounded-xl" />
            </CardContent>
          </Card>

          {/* High Potential Employees */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64 mt-1" />
                </div>
                <Skeleton className="h-10 w-64" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg border border-brand-default dark:border-brand-default"
                  >
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-48 mb-2" />
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <Skeleton className="h-8 w-16 ml-auto" />
                        <Skeleton className="h-3 w-20 ml-auto" />
                        <Skeleton className="h-3 w-16 ml-auto" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* AI Insights */}
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56 mt-1" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg border border-brand-default dark:border-brand-default"
                >
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-6 w-24 mt-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Program Health */}
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Trending Skills */}
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48 mt-1" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
