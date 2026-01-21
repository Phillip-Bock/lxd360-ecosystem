import { Skeleton } from '@/components/ui/skeleton';

export default function MarketingLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero skeleton */}
      <div className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-2/3 mx-auto" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
          <div className="flex justify-center gap-4 pt-4">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-32" />
          </div>
        </div>
      </div>
      {/* Features skeleton */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-6 border rounded-lg">
              <Skeleton variant="circular" className="h-12 w-12 mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full mt-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
