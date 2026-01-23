import { Skeleton } from '@/components/ui/skeleton';

export default function StudioLoading() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card p-4">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
      {/* Main content */}
      <div className="flex-1 p-6">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}
