import { Skeleton } from '@/components/ui/skeleton';

export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Skeleton variant="circular" className="h-16 w-16" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}
