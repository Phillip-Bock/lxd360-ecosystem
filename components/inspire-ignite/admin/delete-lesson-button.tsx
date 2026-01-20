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
import { deleteLesson } from '@/lib/actions/courses';

export function DeleteLessonButton({
  lessonId,
  lessonName,
}: {
  lessonId: string;
  lessonName: string;
}): React.JSX.Element {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async (): Promise<void> => {
    setIsDeleting(true);
    const result = await deleteLesson(lessonId);

    if (result.error) {
      toast.error('Failed to delete lesson', {
        description: result.error,
      });
      setIsDeleting(false);
    } else {
      toast.success('Lesson deleted successfully');
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
          <Trash2 className="h-3 w-3" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Lesson?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <strong>{lessonName}</strong> and all its content blocks.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
