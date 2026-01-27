import { DashboardSkeleton } from '@/components/ui/skeleton';

export default function IgniteLoading() {
  return (
    <div className="container mx-auto py-6 px-4">
      <DashboardSkeleton />
    </div>
  );
}
