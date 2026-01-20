'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { deleteCourse } from '@/lib/actions/courses';

export function DeleteCourseButton({
  courseId,
  courseName,
}: {
  courseId: string;
  courseName: string;
}): React.JSX.Element {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async (): Promise<void> => {
    setIsDeleting(true);
    const result = await deleteCourse(courseId);

    if (result.error) {
      toast.error('Failed to delete course', {
        description: result.error,
      });
      setIsDeleting(false);
    } else {
      toast.success('Course deleted successfully');
      router.push('/admin');
      router.refresh();
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="primary"
          size="sm"
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the course <strong>{courseName}</strong> and all its
            modules, lessons, and blocks. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete Course'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
