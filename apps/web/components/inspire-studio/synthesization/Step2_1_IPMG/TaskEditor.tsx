'use client';

import { Plus, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { JobTask } from '@/schemas/inspire';
import {
  CRITICALITY_OPTIONS,
  FREQUENCY_OPTIONS,
  fromSchemaTask,
  getDefaultTaskFormData,
  type TaskFormData,
  toSchemaTask,
} from './types';

// ============================================================================
// COMPONENT
// ============================================================================

interface TaskEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: JobTask | null;
  parentTasks?: JobTask[];
  onSave: (task: JobTask) => void;
  className?: string;
}

/**
 * TaskEditor - Dialog for creating/editing job tasks
 */
export function TaskEditor({
  open,
  onOpenChange,
  task,
  parentTasks = [],
  onSave,
  className,
}: TaskEditorProps) {
  const [formData, setFormData] = useState<TaskFormData>(getDefaultTaskFormData());

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      if (task) {
        setFormData(fromSchemaTask(task));
      } else {
        setFormData(getDefaultTaskFormData());
      }
    }
  }, [open, task]);

  // Update field helper
  const updateField = <K extends keyof TaskFormData>(field: K, value: TaskFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle save
  const handleSave = () => {
    const schemaTask = toSchemaTask(formData, task?.id);
    onSave(schemaTask);
    onOpenChange(false);
  };

  const isValid = formData.title.trim().length >= 3;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn('sm:max-w-[500px] bg-lxd-dark-surface border-lxd-dark-border', className)}
      >
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Job Task' : 'Add Job Task'}</DialogTitle>
          <DialogDescription>
            Define a job task that learners need to perform competently
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="task-title">Task Title *</Label>
            <Input
              id="task-title"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="e.g., Process patient intake documentation"
              className="bg-lxd-dark-bg border-lxd-dark-border"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Describe what this task involves..."
              rows={3}
              className="bg-lxd-dark-bg border-lxd-dark-border"
            />
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label>Task Frequency</Label>
            <Select
              value={formData.frequency}
              onValueChange={(v) => updateField('frequency', v as typeof formData.frequency)}
            >
              <SelectTrigger className="bg-lxd-dark-bg border-lxd-dark-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-lxd-dark-surface border-lxd-dark-border">
                {FREQUENCY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <span className="font-medium">{option.label}</span>
                      <span className="text-muted-foreground text-xs ml-2">
                        — {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Criticality */}
          <div className="space-y-2">
            <Label>Task Criticality</Label>
            <Select
              value={formData.criticality}
              onValueChange={(v) => updateField('criticality', v as typeof formData.criticality)}
            >
              <SelectTrigger className="bg-lxd-dark-bg border-lxd-dark-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-lxd-dark-surface border-lxd-dark-border">
                {CRITICALITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span className={cn('font-medium', option.color)}>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {CRITICALITY_OPTIONS.find((o) => o.value === formData.criticality)?.description}
            </p>
          </div>

          {/* Parent Task (Optional) */}
          {parentTasks.length > 0 && (
            <div className="space-y-2">
              <Label>Parent Task (Optional)</Label>
              <Select
                value={formData.parentTaskId ?? 'none'}
                onValueChange={(v) => updateField('parentTaskId', v === 'none' ? undefined : v)}
              >
                <SelectTrigger className="bg-lxd-dark-bg border-lxd-dark-border">
                  <SelectValue placeholder="No parent (top-level task)" />
                </SelectTrigger>
                <SelectContent className="bg-lxd-dark-surface border-lxd-dark-border">
                  <SelectItem value="none">No parent (top-level task)</SelectItem>
                  {parentTasks
                    .filter((t) => t.id !== task?.id)
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={!isValid}>
            {task ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
