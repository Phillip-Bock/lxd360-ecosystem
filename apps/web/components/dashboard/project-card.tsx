import { Calendar, MoreVertical } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ProjectCardProps {
  title: string;
  description: string;
  progress: number;
  dueDate: string;
  status: 'on-track' | 'at-risk' | 'completed';
  members: string[];
}

export function ProjectCard({
  title,
  description,
  progress,
  dueDate,
  status,
  members,
}: ProjectCardProps): React.JSX.Element {
  const statusColors = {
    'on-track': 'bg-brand-success/10 text-green-600 border-brand-success/20',
    'at-risk': 'bg-brand-warning/10 text-orange-600 border-orange-500/20',
    completed: 'bg-brand-primary/10 text-brand-blue border-brand-primary/20',
  };

  return (
    <Card className="transition-card hover-lift cursor-pointer">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{dueDate}</span>
            </div>
            <div className="flex -space-x-2">
              {members.map((member, i) => (
                <Avatar key={i} className="h-7 w-7 border-2 border-background">
                  <AvatarFallback className="bg-primary-gradient text-brand-primary text-[10px] font-semibold">
                    {member}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
          <Badge variant="outline" className={statusColors[status]}>
            {status === 'on-track' ? 'On Track' : status === 'at-risk' ? 'At Risk' : 'Completed'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
