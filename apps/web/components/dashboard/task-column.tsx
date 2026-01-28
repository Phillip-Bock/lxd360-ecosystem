'use client';

import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TaskItem } from './task-item';

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: number;
  total: number;
  category: string;
  comments: number;
  attachments: number;
  likes: number;
  members: string[];
}

interface TaskColumnProps {
  title: string;
  count: number;
  tasks: Task[];
  variant?: 'new' | 'in-progress' | 'completed';
}

export function TaskColumn({
  title,
  count,
  tasks,
  variant = 'new',
}: TaskColumnProps): React.JSX.Element {
  const variantColors = {
    new: 'bg-brand-primary/10 text-brand-blue',
    'in-progress': 'bg-brand-warning/10 text-orange-600',
    completed: 'bg-brand-success/10 text-green-600',
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Badge className={variantColors[variant]}>{count}</Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
