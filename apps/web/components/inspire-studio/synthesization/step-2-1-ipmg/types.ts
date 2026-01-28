'use client';

import type {
  JobTask,
  PerformanceCriterion,
  TaskCompetencyLink,
  TaskCriticality,
  TaskFrequency,
} from '@/schemas/inspire';

// ============================================================================
// LOCAL UI TYPES
// ============================================================================

/**
 * Form data for creating/editing a job task
 */
export interface TaskFormData {
  title: string;
  description: string;
  frequency: TaskFrequency;
  criticality: TaskCriticality;
  parentTaskId?: string;
}

/**
 * Task with UI metadata
 */
export interface TaskWithMeta extends JobTask {
  isExpanded?: boolean;
  children?: TaskWithMeta[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const FREQUENCY_OPTIONS: { value: TaskFrequency; label: string; description: string }[] = [
  { value: 'hourly', label: 'Hourly', description: 'Multiple times per hour' },
  { value: 'daily', label: 'Daily', description: 'Once or more per day' },
  { value: 'weekly', label: 'Weekly', description: 'Once or more per week' },
  { value: 'monthly', label: 'Monthly', description: 'Once or more per month' },
  { value: 'quarterly', label: 'Quarterly', description: 'Every 3 months' },
  { value: 'annually', label: 'Annually', description: 'Once per year' },
  { value: 'as-needed', label: 'As Needed', description: 'Situational or ad-hoc' },
];

export const CRITICALITY_OPTIONS: {
  value: TaskCriticality;
  label: string;
  description: string;
  color: string;
}[] = [
  {
    value: 'both',
    label: 'Critical (Both)',
    description: 'High frequency AND high stakes - prioritize in training',
    color: 'text-red-500',
  },
  {
    value: 'high-stakes',
    label: 'High Stakes',
    description: 'Errors have significant consequences',
    color: 'text-orange-500',
  },
  {
    value: 'high-frequency',
    label: 'High Frequency',
    description: 'Performed very often, efficiency matters',
    color: 'text-yellow-500',
  },
  {
    value: 'standard',
    label: 'Standard',
    description: 'Routine task with normal risk',
    color: 'text-gray-400',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a unique ID for a new task
 */
export function generateTaskId(): string {
  return crypto.randomUUID();
}

/**
 * Generate a unique ID for a criterion
 */
export function generateCriterionId(): string {
  return crypto.randomUUID();
}

/**
 * Generate a unique ID for a link
 */
export function generateLinkId(): string {
  return crypto.randomUUID();
}

/**
 * Create default form data for a new task
 */
export function getDefaultTaskFormData(): TaskFormData {
  return {
    title: '',
    description: '',
    frequency: 'daily',
    criticality: 'standard',
  };
}

/**
 * Convert form data to schema task
 */
export function toSchemaTask(formData: TaskFormData, id?: string): JobTask {
  return {
    id: id ?? generateTaskId(),
    title: formData.title,
    description: formData.description || undefined,
    frequency: formData.frequency,
    criticality: formData.criticality,
    parentTaskId: formData.parentTaskId,
  };
}

/**
 * Convert schema task to form data
 */
export function fromSchemaTask(task: JobTask): TaskFormData {
  return {
    title: task.title,
    description: task.description ?? '',
    frequency: task.frequency,
    criticality: task.criticality,
    parentTaskId: task.parentTaskId,
  };
}

/**
 * Build hierarchical task tree
 */
export function buildTaskTree(tasks: JobTask[]): TaskWithMeta[] {
  const taskMap = new Map<string, TaskWithMeta>();
  const roots: TaskWithMeta[] = [];

  // First pass: create all task nodes
  for (const task of tasks) {
    taskMap.set(task.id, { ...task, children: [], isExpanded: true });
  }

  // Second pass: build hierarchy
  for (const task of tasks) {
    const node = taskMap.get(task.id);
    if (!node) continue;

    if (task.parentTaskId) {
      const parent = taskMap.get(task.parentTaskId);
      if (parent) {
        parent.children = parent.children ?? [];
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  return roots;
}

/**
 * Create default performance criterion
 */
export function createDefaultCriterion(text: string): PerformanceCriterion {
  return {
    id: generateCriterionId(),
    criterion: text,
    measurementMethod: undefined,
    targetMetric: undefined,
  };
}

/**
 * Create task-competency link
 */
export function createTaskLink(
  taskId: string,
  competencyId: string,
  relevance: 'primary' | 'secondary' | 'supporting' = 'primary',
): TaskCompetencyLink {
  return {
    id: generateLinkId(),
    taskId,
    competencyId,
    performanceCriteria: [],
    relevance,
  };
}

/**
 * Get criticality badge color
 */
export function getCriticalityColor(criticality: TaskCriticality): string {
  return CRITICALITY_OPTIONS.find((o) => o.value === criticality)?.color ?? 'text-gray-400';
}

/**
 * Calculate task priority score (for sorting)
 */
export function calculatePriorityScore(task: JobTask): number {
  const frequencyScores: Record<TaskFrequency, number> = {
    hourly: 7,
    daily: 6,
    weekly: 5,
    monthly: 4,
    quarterly: 3,
    annually: 2,
    'as-needed': 1,
  };

  const criticalityScores: Record<TaskCriticality, number> = {
    both: 4,
    'high-stakes': 3,
    'high-frequency': 2,
    standard: 1,
  };

  return frequencyScores[task.frequency] * criticalityScores[task.criticality];
}
