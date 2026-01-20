'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
}

interface ProjectCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  progress: number;
  tasksCompleted: number;
  tasksTotal: number;
  lastUpdated?: string;
  team?: TeamMember[];
  maxVisibleTeam?: number;
  onClick?: () => void;
  className?: string;
}

export function ProjectCard({
  title,
  description,
  icon,
  iconBgColor = 'bg-primary',
  progress,
  tasksCompleted,
  tasksTotal,
  lastUpdated,
  team = [],
  maxVisibleTeam = 3,
  onClick,
  className,
}: ProjectCardProps): React.JSX.Element {
  const visibleTeam = team.slice(0, maxVisibleTeam);
  const extraMembers = team.length - maxVisibleTeam;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'bg-card border-2 border-border rounded-[10px] p-5 text-left w-full',
        'hover:border-primary/30 transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-lg',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {icon && (
          <div className={cn('p-3 rounded-[8px] text-brand-primary', iconBgColor)}>{icon}</div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground truncate">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            {tasksCompleted} of {tasksTotal} completed
          </span>
          <span className="text-sm font-medium text-foreground">{progress}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Team Avatars */}
        {team.length > 0 && (
          <div className="flex items-center -space-x-2">
            {visibleTeam.map((member) =>
              member.avatar ? (
                <Image
                  key={member.id}
                  src={member.avatar}
                  alt={member.name}
                  width={28}
                  height={28}
                  className="w-7 h-7 rounded-full border-2 border-card object-cover"
                  title={member.name}
                />
              ) : (
                <div
                  key={member.id}
                  className="w-7 h-7 rounded-full border-2 border-card bg-primary/10 flex items-center justify-center"
                  title={member.name}
                >
                  <span className="text-xs font-medium text-primary">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              ),
            )}
            {extraMembers > 0 && (
              <div className="w-7 h-7 rounded-full border-2 border-card bg-muted flex items-center justify-center">
                <span className="text-xs font-medium text-muted-foreground">+{extraMembers}</span>
              </div>
            )}
          </div>
        )}

        {/* Last Updated */}
        {lastUpdated && <span className="text-xs text-muted-foreground">{lastUpdated}</span>}
      </div>
    </button>
  );
}
