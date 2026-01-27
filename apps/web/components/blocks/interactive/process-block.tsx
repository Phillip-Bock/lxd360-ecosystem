'use client';

/**
 * ProcessBlock - Step-by-step workflow visualization
 */

import { ArrowDown, ArrowRight, CheckCircle, Circle, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProcessConfig, ProcessContent } from '@/types/blocks';
import { BlockWrapper } from '../block-wrapper';

interface ProcessBlockProps {
  id: string;
  content: ProcessContent;
  config: ProcessConfig;
  isSelected?: boolean;
  isEditing?: boolean;
  onSelect?: () => void;
  onContentChange?: (content: ProcessContent) => void;
  onStartEditing?: () => void;
  onStopEditing?: () => void;
  onXAPIEvent?: (verb: string, data?: Record<string, unknown>) => void;
}

// Icon map for common process step icons
const STEP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  check: CheckCircle,
  circle: Circle,
};

export function ProcessBlock({
  id,
  content,
  config,
  isSelected = false,
  isEditing = false,
  onSelect,
  onContentChange,
  onStartEditing,
}: ProcessBlockProps) {
  const isHorizontal = config.orientation === 'horizontal';
  const showConnectors = config.showConnectors !== false;
  const variant = config.variant || 'default';

  const updateStep = (index: number, updates: Partial<ProcessContent['steps'][0]>) => {
    const newSteps = [...content.steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    onContentChange?.({ steps: newSteps });
  };

  const addStep = () => {
    const newId = `step-${Date.now()}`;
    onContentChange?.({
      steps: [...content.steps, { id: newId, title: 'New Step', content: 'Add content here...' }],
    });
  };

  const removeStep = (index: number) => {
    if (content.steps.length <= 1) return;
    const newSteps = content.steps.filter((_, i) => i !== index);
    onContentChange?.({ steps: newSteps });
  };

  const renderStepIndicator = (index: number) => {
    const stepNumber = index + 1;
    const step = content.steps[index];
    const IconComponent = step.icon ? STEP_ICONS[step.icon] || Circle : undefined;

    switch (variant) {
      case 'numbered':
        return (
          <div className="w-10 h-10 rounded-full bg-[var(--color-lxd-primary)] text-white flex items-center justify-center font-semibold text-lg shrink-0">
            {stepNumber}
          </div>
        );
      case 'icon':
        return (
          <div className="w-10 h-10 rounded-full bg-card border-2 border-[var(--color-lxd-primary)] flex items-center justify-center shrink-0">
            {IconComponent ? (
              <IconComponent className="w-5 h-5 text-[var(--color-lxd-primary)]" />
            ) : (
              <Circle className="w-5 h-5 text-[var(--color-lxd-primary)]" />
            )}
          </div>
        );
      case 'timeline':
        return <div className="w-4 h-4 rounded-full bg-[var(--color-lxd-primary)] shrink-0" />;
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-[var(--color-lxd-primary)]/10 border-2 border-[var(--color-lxd-primary)] flex items-center justify-center text-[var(--color-lxd-primary)] font-medium text-sm shrink-0">
            {stepNumber}
          </div>
        );
    }
  };

  const renderConnector = (isLast: boolean) => {
    if (!showConnectors || isLast) return null;

    if (isHorizontal) {
      return (
        <div className="flex items-center justify-center px-2">
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
        </div>
      );
    }

    return (
      <div className="flex justify-center py-2">
        {variant === 'timeline' ? (
          <div className="w-0.5 h-8 bg-[var(--color-lxd-primary)]/30" />
        ) : (
          <ArrowDown className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
    );
  };

  return (
    <BlockWrapper
      id={id}
      type="Process"
      isSelected={isSelected}
      isEditing={isEditing}
      onClick={onSelect}
      onDoubleClick={onStartEditing}
    >
      <ol
        className={cn(
          'flex gap-4 list-none m-0 p-0',
          isHorizontal ? 'flex-row flex-wrap items-start' : 'flex-col',
        )}
        aria-label="Process steps"
      >
        {content.steps.map((step, index) => (
          <li key={step.id} className="contents">
            <div
              className={cn(
                'flex gap-4',
                isHorizontal
                  ? 'flex-col items-center text-center flex-1 min-w-[150px]'
                  : 'flex-row items-start',
                variant === 'timeline' && !isHorizontal && 'ml-2',
              )}
            >
              {renderStepIndicator(index)}

              <div className={cn('flex-1', isHorizontal && 'w-full')}>
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => updateStep(index, { title: e.target.value })}
                        className={cn(
                          'flex-1 bg-transparent font-semibold outline-hidden border-b border-transparent focus:border-cyan-500',
                          isHorizontal && 'text-center',
                        )}
                        placeholder="Step title"
                      />
                      {content.steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStep(index)}
                          className="p-1 text-red-500 hover:text-red-400"
                          aria-label="Remove step"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <textarea
                      value={step.content}
                      onChange={(e) => updateStep(index, { content: e.target.value })}
                      rows={2}
                      className={cn(
                        'w-full bg-background px-3 py-2 rounded border border-border outline-hidden focus:border-cyan-500 resize-y text-sm',
                        isHorizontal && 'text-center',
                      )}
                      placeholder="Step content"
                    />
                  </div>
                ) : (
                  <>
                    <h4 className="font-semibold text-foreground">{step.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{step.content}</p>
                  </>
                )}
              </div>
            </div>

            {renderConnector(index === content.steps.length - 1)}
          </li>
        ))}
      </ol>

      {/* Add step button (editing mode) */}
      {isEditing && (
        <button
          type="button"
          onClick={addStep}
          className="mt-4 w-full py-2 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-cyan-500 hover:text-cyan-500 flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Step
        </button>
      )}
    </BlockWrapper>
  );
}
