import { Heart, MessageSquare, MoreVertical, Paperclip } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Task } from './TaskColumn';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps): React.JSX.Element {
  const percentage = Math.round((task.completed / task.total) * 100);

  const categoryColors: Record<string, string> = {
    Development: 'bg-brand-primary/10 text-brand-blue border-brand-primary/20',
    Marketing: 'bg-brand-secondary/10 text-purple-600 border-brand-secondary/20',
    Design: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  };

  return (
    <Card className="transition-card hover-lift cursor-pointer">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold leading-tight flex-1">{task.title}</h4>
          <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {task.completed} of {task.total} completed
            </span>
            <span className="font-medium">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-1.5" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {task.members.map((member, i) => (
                <Avatar key={i} className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="bg-primary-gradient text-brand-primary text-[10px] font-semibold">
                    {member}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <Badge variant="outline" className={categoryColors[task.category]}>
              {task.category}
            </Badge>
          </div>

          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="flex items-center gap-1 text-xs">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{task.comments}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Paperclip className="h-3.5 w-3.5" />
              <span>{task.attachments}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Heart className="h-3.5 w-3.5" />
              <span>{task.likes}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
