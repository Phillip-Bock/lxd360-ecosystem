import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ActivityItemProps {
  user: string;
  action: string;
  target?: string;
  time: string;
  avatar?: string;
  initials: string;
}

export function ActivityItem({
  user,
  action,
  target,
  time,
  avatar,
  initials,
}: ActivityItemProps): React.JSX.Element {
  return (
    <div className="flex items-start gap-3">
      <Avatar className="h-10 w-10">
        {avatar && <AvatarImage src={avatar || '/placeholder.svg'} alt={user} />}
        <AvatarFallback className="bg-primary-gradient text-brand-primary text-xs font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <p className="text-sm leading-tight">
          <span className="font-semibold">{user}</span> {action}{' '}
          {target && <span className="text-primary hover:underline cursor-pointer">{target}</span>}
        </p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  );
}
