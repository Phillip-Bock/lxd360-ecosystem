'use client';

import { Eye, MessageSquare, Plus, Share2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
}

interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  progress?: number;
  tasksCompleted?: number;
  tasksTotal?: number;
  category?: { label: string; color: string };
  views?: number;
  shares?: number;
  messages?: number;
  team?: TeamMember[];
}

interface KanbanColumnProps {
  title: string;
  count: number;
  color?: string;
  tasks: KanbanTask[];
  onAddTask?: () => void;
  onTaskClick?: (task: KanbanTask) => void;
  className?: string;
}

export function KanbanColumn({
  title,
  count,
  color = 'bg-primary',
  tasks,
  onAddTask,
  onTaskClick,
  className,
}: KanbanColumnProps): React.JSX.Element {
  return (
    <div className={cn('flex-1 min-w-[280px] max-w-[320px]', className)}>
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn('w-3 h-3 rounded-full', color)} />
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <span className="px-2 py-0.5 bg-muted rounded-full text-xs font-medium text-muted-foreground">
            {count}
          </span>
        </div>
        {onAddTask && (
          <button
            type="button"
            onClick={onAddTask}
            className="p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-[6px] transition-colors"
            aria-label={`Add task to ${title}`}
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tasks */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} onClick={() => onTaskClick?.(task)} />
        ))}

        {/* Add Task Button */}
        {onAddTask && (
          <button
            type="button"
            onClick={onAddTask}
            className="w-full py-3 border-2 border-dashed border-border rounded-md text-sm text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
          >
            + Add new task
          </button>
        )}
      </div>
    </div>
  );
}

interface KanbanCardProps {
  task: KanbanTask;
  onClick?: () => void;
}

function KanbanCard({ task, onClick }: KanbanCardProps): React.JSX.Element {
  const visibleTeam = task.team?.slice(0, 3) || [];
  const extraMembers = (task.team?.length || 0) - 3;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'bg-card border-2 border-border rounded-md p-4 text-left w-full',
        'hover:border-primary/30 transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-md',
      )}
    >
      {/* Category */}
      {task.category && (
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mb-3',
            task.category.color,
          )}
        >
          {task.category.label}
        </span>
      )}

      {/* Title & Description */}
      <h4 className="text-sm font-semibold text-foreground mb-1">{task.title}</h4>
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
      )}

      {/* Progress */}
      {task.progress !== undefined && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            {task.tasksCompleted !== undefined && task.tasksTotal !== undefined && (
              <span className="text-xs text-muted-foreground">
                {task.tasksCompleted} of {task.tasksTotal} completed
              </span>
            )}
            <span className="text-xs font-medium text-foreground">{task.progress}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                task.progress === 100 ? 'bg-brand-success' : 'bg-primary',
              )}
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Metrics */}
        <div className="flex items-center gap-3">
          {task.views !== undefined && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="w-3.5 h-3.5" />
              <span>{task.views}</span>
            </div>
          )}
          {task.shares !== undefined && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Share2 className="w-3.5 h-3.5" />
              <span>{task.shares}</span>
            </div>
          )}
          {task.messages !== undefined && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{task.messages}</span>
            </div>
          )}
        </div>

        {/* Team Avatars */}
        {visibleTeam.length > 0 && (
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

// Full Kanban Board Component
interface KanbanBoardProps {
  columns: {
    id: string;
    title: string;
    color?: string;
    tasks: KanbanTask[];
  }[];
  onAddTask?: (columnId: string) => void;
  onTaskClick?: (task: KanbanTask) => void;
  className?: string;
}

export function KanbanBoard({
  columns,
  onAddTask,
  onTaskClick,
  className,
}: KanbanBoardProps): React.JSX.Element {
  return (
    <div className={cn('flex gap-6 overflow-x-auto pb-4', className)}>
      {columns.map(
        (column): React.JSX.Element => (
          <KanbanColumn
            key={column.id}
            title={column.title}
            count={column.tasks.length}
            color={column.color}
            tasks={column.tasks}
            onAddTask={onAddTask ? (): void => onAddTask(column.id) : undefined}
            onTaskClick={onTaskClick}
          />
        ),
      )}
    </div>
  );
}
