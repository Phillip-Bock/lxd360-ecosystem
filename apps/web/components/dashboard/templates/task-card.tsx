'use client';

import { Calendar, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
}

interface TaskCardProps {
  title: string;
  description?: string;
  tags?: { label: string; color: string }[];
  dueDate?: string;
  messages?: number;
  team?: TeamMember[];
  maxVisibleTeam?: number;
  priority?: 'low' | 'medium' | 'high';
  onClick?: () => void;
  className?: string;
}

export function TaskCard({
  title,
  description,
  tags = [],
  dueDate,
  messages,
  team = [],
  maxVisibleTeam = 3,
  priority,
  onClick,
  className,
}: TaskCardProps): React.JSX.Element {
  const visibleTeam = team.slice(0, maxVisibleTeam);
  const extraMembers = team.length - maxVisibleTeam;

  const priorityStyles = {
    low: 'border-l-green-500',
    medium: 'border-l-amber-500',
    high: 'border-l-red-500',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'bg-card border-2 border-border rounded-md p-4 text-left w-full',
        'hover:border-primary/30 transition-all duration-200',
        priority && `border-l-4 ${priorityStyles[priority]}`,
        onClick && 'cursor-pointer hover:shadow-md',
        className,
      )}
    >
      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag, index) => (
            <span
              key={index}
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                tag.color,
              )}
            >
              {tag.label}
            </span>
          ))}
        </div>
      )}

      {/* Title & Description */}
      <h4 className="text-sm font-semibold text-foreground mb-1">{title}</h4>
      {description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3">
          {/* Due Date */}
          {dueDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>{dueDate}</span>
            </div>
          )}

          {/* Messages */}
          {messages !== undefined && messages > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{messages}</span>
            </div>
          )}
        </div>

        {/* Team Avatars */}
        {team.length > 0 && (
          <div className="flex items-center -space-x-2">
            {visibleTeam.map((member) =>
              member.avatar ? (
                <Image
                  key={member.id}
                  src={member.avatar}
                  alt={member.name}
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full border-2 border-card object-cover"
                  title={member.name}
                />
              ) : (
                <div
                  key={member.id}
                  className="w-6 h-6 rounded-full border-2 border-card bg-primary/10 flex items-center justify-center"
                  title={member.name}
                >
                  <span className="text-[10px] font-medium text-primary">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              ),
            )}
            {extraMembers > 0 && (
              <div className="w-6 h-6 rounded-full border-2 border-card bg-muted flex items-center justify-center">
                <span className="text-[10px] font-medium text-muted-foreground">
                  +{extraMembers}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

// Task section with header
interface TaskSectionProps {
  title: string;
  count?: number;
  children: React.ReactNode;
  className?: string;
}

export function TaskSection({
  title,
  count,
  children,
  className,
}: TaskSectionProps): React.JSX.Element {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {count !== undefined && (
          <span className="px-2 py-0.5 bg-muted rounded-full text-xs font-medium text-muted-foreground">
            {count}
          </span>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
