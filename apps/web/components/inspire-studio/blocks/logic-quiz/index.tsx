'use client';

import { AlertCircle, Check, HelpCircle, Lightbulb, Plus, Trash2, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { BaseBlockProps, LogicQuizConfig, LogicQuizContent, QuizOption } from '../types';
import { getDefaultLogicQuizConfig } from '../types';

// ============================================================================
// COMPONENT
// ============================================================================

interface LogicQuizBlockProps extends BaseBlockProps {
  content?: LogicQuizContent;
  config?: LogicQuizConfig;
}

/**
 * LogicQuizBlock - Intelligent assessment block
 *
 * Features:
 * - Multiple question types (MC, T/F, fill-blank, matching, ordering)
 * - Immediate or delayed feedback
 * - Hints with penalty system
 * - Retry support
 */
export function LogicQuizBlock({
  content,
  config = getDefaultLogicQuizConfig(),
  isEditing = false,
  onContentChange,
  onConfigChange,
  className,
}: LogicQuizBlockProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleConfigChange = useCallback(
    (key: keyof LogicQuizConfig, value: unknown) => {
      onConfigChange?.({ ...config, [key]: value });
    },
    [config, onConfigChange],
  );

  const handleContentChange = useCallback(
    (updates: Partial<LogicQuizContent>) => {
      onContentChange?.({ ...content, ...updates });
    },
    [content, onContentChange],
  );

  const handleOptionChange = useCallback(
    (index: number, updates: Partial<QuizOption>) => {
      if (!content?.options) return;
      const newOptions = [...content.options];
      newOptions[index] = { ...newOptions[index], ...updates };
      handleContentChange({ options: newOptions });
    },
    [content?.options, handleContentChange],
  );

  const addOption = useCallback(() => {
    const newOption: QuizOption = {
      id: uuidv4(),
      text: '',
      isCorrect: false,
    };
    handleContentChange({ options: [...(content?.options ?? []), newOption] });
  }, [content?.options, handleContentChange]);

  const removeOption = useCallback(
    (index: number) => {
      if (!content?.options) return;
      const newOptions = content.options.filter((_, i) => i !== index);
      handleContentChange({ options: newOptions });
    },
    [content?.options, handleContentChange],
  );

  const handleSubmit = useCallback(() => {
    setIsSubmitted(true);
    setAttempts((prev) => prev + 1);
  }, []);

  const handleRetry = useCallback(() => {
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setShowHint(false);
  }, []);

  const isCorrect =
    selectedAnswer && content?.options?.find((o) => o.id === selectedAnswer)?.isCorrect;

  const canRetry = config.allowRetry && (!config.maxAttempts || attempts < config.maxAttempts);

  // Render editing mode
  if (isEditing) {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Question Type & Config */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">Question Type</Label>
            <Select
              value={content?.questionType ?? 'multiple-choice'}
              onValueChange={(v) =>
                handleContentChange({ questionType: v as LogicQuizContent['questionType'] })
              }
            >
              <SelectTrigger className="h-8 text-xs bg-lxd-dark-bg border-lxd-dark-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-lxd-dark-surface border-lxd-dark-border">
                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                <SelectItem value="true-false">True/False</SelectItem>
                <SelectItem value="fill-blank">Fill in the Blank</SelectItem>
                <SelectItem value="matching">Matching</SelectItem>
                <SelectItem value="ordering">Ordering</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Points</Label>
            <Input
              type="number"
              min={0}
              value={content?.points ?? 10}
              onChange={(e) => handleContentChange({ points: Number(e.target.value) })}
              className="h-8 text-xs bg-lxd-dark-bg border-lxd-dark-border"
            />
          </div>
        </div>

        {/* Question Text */}
        <div className="space-y-2">
          <Label className="text-xs">Question</Label>
          <Textarea
            value={content?.questionText ?? ''}
            onChange={(e) => handleContentChange({ questionText: e.target.value })}
            placeholder="Enter your question..."
            className="min-h-[80px] bg-lxd-dark-bg border-lxd-dark-border"
          />
        </div>

        {/* Options */}
        {(content?.questionType === 'multiple-choice' ||
          content?.questionType === 'true-false') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Answer Options</Label>
              {content?.questionType === 'multiple-choice' && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addOption}
                  className="h-7 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Option
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {content?.options?.map((option, index) => (
                <div
                  key={option.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-lxd-dark-bg border border-lxd-dark-border"
                >
                  <Checkbox
                    checked={option.isCorrect}
                    onCheckedChange={(checked) =>
                      handleOptionChange(index, { isCorrect: !!checked })
                    }
                  />
                  <Input
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, { text: e.target.value })}
                    placeholder={`Option ${index + 1}`}
                    className="h-8 text-xs bg-transparent border-0 flex-1"
                  />
                  {content?.questionType === 'multiple-choice' && content.options.length > 2 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeOption(index)}
                      className="h-7 w-7 text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Explanation */}
        <div className="space-y-2">
          <Label className="text-xs">Explanation (shown after answer)</Label>
          <Textarea
            value={content?.explanation ?? ''}
            onChange={(e) => handleContentChange({ explanation: e.target.value })}
            placeholder="Explain the correct answer..."
            className="min-h-[60px] bg-lxd-dark-bg border-lxd-dark-border"
          />
        </div>

        {/* Config Options */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-lxd-dark-border">
          <div className="flex items-center gap-2">
            <Switch
              checked={config.shuffleOptions ?? false}
              onCheckedChange={(v) => handleConfigChange('shuffleOptions', v)}
            />
            <Label className="text-xs">Shuffle Options</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={config.allowRetry ?? false}
              onCheckedChange={(v) => handleConfigChange('allowRetry', v)}
            />
            <Label className="text-xs">Allow Retry</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={config.showHints ?? false}
              onCheckedChange={(v) => handleConfigChange('showHints', v)}
            />
            <Label className="text-xs">Show Hints</Label>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Feedback Timing</Label>
            <Select
              value={config.showFeedback}
              onValueChange={(v) =>
                handleConfigChange('showFeedback', v as LogicQuizConfig['showFeedback'])
              }
            >
              <SelectTrigger className="h-8 text-xs bg-lxd-dark-bg border-lxd-dark-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-lxd-dark-surface border-lxd-dark-border">
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="on-submit">On Submit</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  }

  // Render display/learner mode
  return (
    <div className={cn('space-y-4', className)}>
      {/* Question */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <p className="text-lg font-medium">{content?.questionText ?? 'No question set'}</p>
          <Badge variant="outline" className="shrink-0">
            {content?.points ?? 0} pts
          </Badge>
        </div>
      </div>

      {/* Options */}
      {content?.questionType === 'multiple-choice' || content?.questionType === 'true-false' ? (
        <RadioGroup
          value={selectedAnswer ?? ''}
          onValueChange={setSelectedAnswer}
          disabled={isSubmitted && !canRetry}
          className="space-y-2"
        >
          {content?.options?.map((option) => {
            const showCorrect = isSubmitted && config.showFeedback !== 'never';
            const isSelected = selectedAnswer === option.id;

            return (
              <div
                key={option.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                  !isSubmitted && 'hover:bg-lxd-dark-bg/50 cursor-pointer',
                  isSelected && !isSubmitted && 'border-lxd-purple bg-lxd-purple/10',
                  showCorrect && option.isCorrect && 'border-green-500 bg-green-500/10',
                  showCorrect && isSelected && !option.isCorrect && 'border-red-500 bg-red-500/10',
                  !showCorrect && !isSelected && 'border-lxd-dark-border',
                )}
              >
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                  {option.text}
                </Label>
                {showCorrect && option.isCorrect && <Check className="h-5 w-5 text-green-500" />}
                {showCorrect && isSelected && !option.isCorrect && (
                  <X className="h-5 w-5 text-red-500" />
                )}
              </div>
            );
          })}
        </RadioGroup>
      ) : null}

      {/* Hint */}
      {config.showHints && content?.hints && content.hints.length > 0 && !isSubmitted && (
        <div>
          {showHint ? (
            <Alert className="bg-yellow-500/10 border-yellow-500/30">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-300">
                {content.hints[0]}
                {config.hintPenalty && (
                  <span className="text-xs opacity-70 ml-2">(-{config.hintPenalty}% penalty)</span>
                )}
              </AlertDescription>
            </Alert>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowHint(true)}
              className="text-yellow-400"
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              Show Hint
            </Button>
          )}
        </div>
      )}

      {/* Feedback */}
      {isSubmitted && config.showFeedback !== 'never' && (
        <Alert
          className={cn(
            isCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30',
          )}
        >
          {isCorrect ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <AlertDescription className={isCorrect ? 'text-green-300' : 'text-red-300'}>
            {isCorrect ? 'Correct!' : 'Incorrect.'}
            {content?.explanation && <span className="block mt-1">{content.explanation}</span>}
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {!isSubmitted ? (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            className={cn(!selectedAnswer && 'opacity-50 cursor-not-allowed')}
          >
            Submit Answer
          </Button>
        ) : canRetry && !isCorrect ? (
          <Button type="button" variant="outline" onClick={handleRetry}>
            Try Again
          </Button>
        ) : null}

        {attempts > 0 && (
          <span className="text-xs text-muted-foreground">
            Attempt {attempts}
            {config.maxAttempts && ` of ${config.maxAttempts}`}
          </span>
        )}
      </div>
    </div>
  );
}

export default LogicQuizBlock;
