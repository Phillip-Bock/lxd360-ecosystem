'use client';

import { ChevronRight, Lock } from 'lucide-react';
import { useMemo } from 'react';
import type {
  Choice,
  Condition,
  VariableMutation,
  VariableValue,
} from '@/components/inspire-studio/branching/types';
import { cn } from '@/lib/utils';

// =============================================================================
// Choice Presenter Component
// =============================================================================

interface ChoicePresenterProps {
  choices: Choice[];
  variableValues: Record<string, VariableValue>;
  onChoice: (choiceId: string, label: string, mutations: VariableMutation[]) => void;
  className?: string;
}

export function ChoicePresenter({
  choices,
  variableValues,
  onChoice,
  className,
}: ChoicePresenterProps) {
  // Filter and sort choices based on conditions
  const visibleChoices = useMemo(() => {
    return choices.filter((choice) => {
      if (!choice.condition) return true;
      return evaluateCondition(choice.condition, variableValues);
    });
  }, [choices, variableValues]);

  if (visibleChoices.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <Lock className="w-8 h-8 text-white/30 mx-auto mb-2" />
        <p className="text-sm text-white/50">No choices available</p>
        <p className="text-xs text-white/30 mt-1">
          Your previous decisions have limited your options
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {visibleChoices.map((choice, index) => (
        <ChoiceButton
          key={choice.id}
          choice={choice}
          index={index}
          onClick={() => onChoice(choice.id, choice.label, choice.variableMutations)}
        />
      ))}
    </div>
  );
}

// =============================================================================
// Choice Button Component
// =============================================================================

interface ChoiceButtonProps {
  choice: Choice;
  index: number;
  onClick: () => void;
}

function ChoiceButton({ choice, index, onClick }: ChoiceButtonProps) {
  const isDisabled = !choice.targetNodeId;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        'w-full flex items-center gap-4 p-4 rounded-xl',
        'bg-lxd-dark-surface border-2 border-lxd-dark-border',
        'text-left transition-all duration-200',
        'hover:border-lxd-cyan hover:bg-lxd-cyan/5',
        'focus:outline-none focus:ring-2 focus:ring-lxd-cyan focus:ring-offset-2 focus:ring-offset-lxd-dark-bg',
        isDisabled &&
          'opacity-50 cursor-not-allowed hover:border-lxd-dark-border hover:bg-lxd-dark-surface',
      )}
    >
      {/* Choice Number */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full',
          'flex items-center justify-center',
          'bg-lxd-cyan/20 text-lxd-cyan font-bold text-sm',
        )}
      >
        {index + 1}
      </div>

      {/* Choice Label */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium">{choice.label}</p>
        {choice.feedbackText && (
          <p className="text-xs text-white/40 mt-1 truncate">{choice.feedbackText}</p>
        )}
      </div>

      {/* Arrow */}
      <ChevronRight
        className={cn(
          'w-5 h-5 text-white/30 transition-transform',
          'group-hover:translate-x-1 group-hover:text-lxd-cyan',
        )}
      />
    </button>
  );
}

// =============================================================================
// Helper Functions
// =============================================================================

function evaluateCondition(condition: Condition, values: Record<string, VariableValue>): boolean {
  const value = values[condition.variableKey];
  const target = condition.targetValue;

  switch (condition.operator) {
    case 'equals':
      return value === target;
    case 'not_equals':
      return value !== target;
    case 'greater_than':
      return typeof value === 'number' && typeof target === 'number' && value > target;
    case 'less_than':
      return typeof value === 'number' && typeof target === 'number' && value < target;
    case 'greater_equal':
      return typeof value === 'number' && typeof target === 'number' && value >= target;
    case 'less_equal':
      return typeof value === 'number' && typeof target === 'number' && value <= target;
    case 'contains':
      return typeof value === 'string' && typeof target === 'string' && value.includes(target);
    case 'not_contains':
      return typeof value === 'string' && typeof target === 'string' && !value.includes(target);
    default:
      return false;
  }
}

export default ChoicePresenter;
