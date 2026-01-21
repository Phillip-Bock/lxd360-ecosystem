import { FormSkeleton } from '@/components/ui/skeleton';

export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <FormSkeleton fields={3} />
      </div>
    </div>
  );
}
