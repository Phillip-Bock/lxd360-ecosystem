'use client';

import { useRouter } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { assignRole } from '@/lib/rbac/permissions';

type Role = {
  id: string;
  name: string;
  description: string | null;
};

export function AssignRoleForm({
  userId,
  availableRoles,
}: {
  userId: string;
  availableRoles: Role[];
}): React.JSX.Element {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!selectedRole) {
      toast({
        title: 'Error',
        description: 'Please select a role',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const result = await assignRole(userId, selectedRole);

    if (result.success) {
      toast({
        title: 'Success',
        description: 'Role assigned successfully',
      });
      setSelectedRole('');
      router.refresh();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to assign role',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="role">Select Role</Label>
        <Select value={selectedRole} onValueChange={setSelectedRole} disabled={isLoading}>
          <SelectTrigger id="role">
            <SelectValue placeholder="Choose a role" />
          </SelectTrigger>
          <SelectContent>
            {availableRoles.map((role) => (
              <SelectItem key={role.id} value={role.name}>
                <div>
                  <div className="font-medium capitalize">{role.name}</div>
                  {role.description && (
                    <div className="text-xs text-muted-foreground">{role.description}</div>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isLoading || !selectedRole} className="w-full">
        {isLoading ? 'Assigning...' : 'Assign Role'}
      </Button>
    </form>
  );
}
