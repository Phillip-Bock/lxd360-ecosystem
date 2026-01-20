import { Mail } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

interface TeamMemberCardProps {
  name: string;
  email: string;
  avatar?: string;
  initials: string;
}

export function TeamMemberCard({
  name,
  email,
  avatar,
  initials,
}: TeamMemberCardProps): React.JSX.Element {
  return (
    <Card className="transition-card hover-lift cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            {avatar && <AvatarImage src={avatar || '/placeholder.svg'} alt={name} />}
            <AvatarFallback className="bg-primary-gradient text-brand-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate">{name}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate">{email}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
