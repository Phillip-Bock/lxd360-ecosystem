'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { removeRole } from '@/lib/rbac/permissions';

export function RemoveRoleButton({
  userId,
  roleName,
}: {
  userId: string;
  roleName: string;
}): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleRemove = async (): Promise<void> => {
    setIsLoading(true);

    const result = await removeRole(userId, roleName);

    if (result.success) {
      toast({
        title: 'Success',
        description: 'Role removed successfully',
      });
      setOpen(false);
      router.refresh();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to remove role',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="tertiary" size="icon" className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Role</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove the &quot;{roleName}&quot; role from this user? This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemove}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Removing...' : 'Remove Role'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
