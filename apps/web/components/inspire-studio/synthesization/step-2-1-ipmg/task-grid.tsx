'use client';

import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { JobTask } from '@/schemas/inspire';
import { TaskEditor } from './task-editor';
import {
  buildTaskTree,
  CRITICALITY_OPTIONS,
  calculatePriorityScore,
  FREQUENCY_OPTIONS,
  type TaskWithMeta,
} from './types';

// ============================================================================
// COMPONENT
// ============================================================================

interface TaskGridProps {
  tasks: JobTask[];
  onTasksChange: (tasks: JobTask[]) => void;
  className?: string;
}

/**
 * TaskGrid - Hierarchical task list with priority indicators
 */
export function TaskGrid({ tasks, onTasksChange, className }: TaskGridProps) {
  const [editingTask, setEditingTask] = useState<JobTask | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  // Build hierarchical tree
  const taskTree = buildTaskTree(tasks);

  // Toggle task expansion
  const toggleExpanded = (taskId: string) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  // Add new task
  const handleAddTask = useCallback((parentId?: string) => {
    setEditingTask(parentId ? ({ parentTaskId: parentId } as JobTask) : null);
    setIsEditorOpen(true);
  }, []);

  // Edit task
  const handleEditTask = useCallback((task: JobTask) => {
    setEditingTask(task);
    setIsEditorOpen(true);
  }, []);

  // Delete task
  const handleDeleteTask = useCallback(
    (taskId: string) => {
      // Also delete child tasks
      const toDelete = new Set<string>([taskId]);
      const queue = [taskId];

      while (queue.length > 0) {
        const current = queue.shift();
        for (const task of tasks) {
          if (task.parentTaskId === current && !toDelete.has(task.id)) {
            toDelete.add(task.id);
            queue.push(task.id);
          }
        }
      }

      onTasksChange(tasks.filter((t) => !toDelete.has(t.id)));
    },
    [tasks, onTasksChange],
  );

  // Save task
  const handleSaveTask = useCallback(
    (task: JobTask) => {
      const exists = tasks.some((t) => t.id === task.id);
      if (exists) {
        onTasksChange(tasks.map((t) => (t.id === task.id ? task : t)));
      } else {
        onTasksChange([...tasks, task]);
      }
    },
    [tasks, onTasksChange],
  );

  return (
    <Card className={cn('bg-lxd-dark-surface border-lxd-dark-border', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Job Task Analysis</CardTitle>
            <CardDescription>
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} defined
            </CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => handleAddTask()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tasks defined yet</p>
            <p className="text-xs mt-1">Add job tasks that learners need to master</p>
          </div>
        ) : (
          <div className="space-y-1">
            {taskTree.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                depth={0}
                expandedTasks={expandedTasks}
                onToggleExpand={toggleExpanded}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onAddChild={handleAddTask}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Task Editor Dialog */}
      <TaskEditor
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        task={editingTask}
        parentTasks={tasks}
        onSave={handleSaveTask}
      />
    </Card>
  );
}

// ============================================================================
// TASK ROW COMPONENT
// ============================================================================

interface TaskRowProps {
  task: TaskWithMeta;
  depth: number;
  expandedTasks: Set<string>;
  onToggleExpand: (taskId: string) => void;
  onEdit: (task: JobTask) => void;
  onDelete: (taskId: string) => void;
  onAddChild: (parentId: string) => void;
}

function TaskRow({
  task,
  depth,
  expandedTasks,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddChild,
}: TaskRowProps) {
  const hasChildren = task.children && task.children.length > 0;
  const isExpanded = expandedTasks.has(task.id);
  const priorityScore = calculatePriorityScore(task);

  const frequencyLabel = FREQUENCY_OPTIONS.find((o) => o.value === task.frequency)?.label;
  const criticalityOption = CRITICALITY_OPTIONS.find((o) => o.value === task.criticality);

  return (
    <>
      <div
        className={cn(
          'flex items-center gap-2 p-2 rounded-lg hover:bg-lxd-dark-bg/50 transition-colors',
          depth > 0 && 'ml-6 border-l-2 border-lxd-dark-border',
        )}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />

        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggleExpand(task.id)}
            className="p-1 hover:bg-lxd-dark-bg rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <div className="w-6" />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{task.title}</span>
            <Badge variant="outline" className={cn('text-xs', criticalityOption?.color)}>
              {criticalityOption?.label}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {frequencyLabel}
            </Badge>
          </div>
          {task.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{task.description}</p>
          )}
        </div>

        {/* Priority Score */}
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
            priorityScore >= 20
              ? 'bg-red-500/20 text-red-400'
              : priorityScore >= 12
                ? 'bg-orange-500/20 text-orange-400'
                : priorityScore >= 6
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-gray-500/20 text-gray-400',
          )}
          title={`Priority Score: ${priorityScore}`}
        >
          {priorityScore}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onAddChild(task.id)}
            title="Add subtask"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(task)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:text-red-400"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Render children if expanded */}
      {hasChildren && isExpanded && (
        <div className="ml-4">
          {task.children?.map((child) => (
            <TaskRow
              key={child.id}
              task={child}
              depth={depth + 1}
              expandedTasks={expandedTasks}
              onToggleExpand={onToggleExpand}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </>
  );
}
