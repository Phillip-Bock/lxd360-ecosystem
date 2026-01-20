'use client';

/**
 * QuizToolsTab - Contextual ribbon tab for quiz/assessment block editing
 * Provides Question, Feedback, and Settings groups for quiz configuration
 */

import {
  CheckCircle,
  Hash,
  HelpCircle,
  ListChecks,
  MessageSquare,
  Plus,
  RefreshCw,
  Settings,
  Shuffle,
  Sparkles,
  Star,
  Target,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { RibbonGroup } from '../ribbon-group';

type QuestionType =
  | 'multiple-choice'
  | 'multiple-select'
  | 'true-false'
  | 'fill-blank'
  | 'matching'
  | 'ordering';

interface QuizToolsTabProps {
  /** Current question type */
  questionType?: QuestionType;
  /** Whether shuffle is enabled */
  isShuffled?: boolean;
  /** Current points value */
  points?: number;
  /** Maximum attempts allowed */
  maxAttempts?: number;
  /** Callback to change question type */
  onChangeQuestionType?: (type: QuestionType) => void;
  /** Callback to toggle shuffle */
  onToggleShuffle?: () => void;
  /** Callback to add a choice/option */
  onAddChoice?: () => void;
  /** Callback to mark correct answer */
  onMarkCorrect?: () => void;
  /** Callback to update points */
  onUpdatePoints?: (points: number) => void;
  /** Callback to update max attempts */
  onUpdateMaxAttempts?: (attempts: number) => void;
  /** Callback to edit correct feedback */
  onEditCorrectFeedback?: () => void;
  /** Callback to edit incorrect feedback */
  onEditIncorrectFeedback?: () => void;
  /** Callback to edit hint */
  onEditHint?: () => void;
  /** Callback to open question settings */
  onOpenSettings?: () => void;
  /** Callback to AI generate distractors */
  onGenerateDistractors?: () => void;
  /** Callback to AI generate feedback */
  onGenerateFeedback?: () => void;
}

/**
 * Get icon for question type
 */
function getQuestionTypeIcon(type: QuestionType) {
  switch (type) {
    case 'multiple-choice':
      return HelpCircle;
    case 'multiple-select':
      return ListChecks;
    case 'true-false':
      return CheckCircle;
    case 'fill-blank':
      return MessageSquare;
    case 'matching':
      return Target;
    case 'ordering':
      return Hash;
  }
}

/**
 * QuizToolsTab - Full contextual ribbon tab for quiz editing
 */
export function QuizToolsTab({
  questionType = 'multiple-choice',
  isShuffled = false,
  points = 1,
  maxAttempts = 1,
  onChangeQuestionType,
  onToggleShuffle,
  onAddChoice,
  onMarkCorrect,
  onUpdatePoints,
  onUpdateMaxAttempts,
  onEditCorrectFeedback,
  onEditIncorrectFeedback,
  onEditHint,
  onOpenSettings,
  onGenerateDistractors,
  onGenerateFeedback,
}: QuizToolsTabProps) {
  const QuestionIcon = getQuestionTypeIcon(questionType);
  const canAddChoice = questionType !== 'true-false' && questionType !== 'fill-blank';
  const canShuffle = questionType !== 'fill-blank';

  return (
    <TooltipProvider>
      <div className="flex items-stretch gap-1 px-2">
        {/* Question Type Group */}
        <RibbonGroup label="Question Type">
          <div className="flex items-center gap-1 px-1">
            {/* Current Type Indicator */}
            <div className="flex items-center gap-2 px-2 py-1 bg-amber-500/20 rounded-sm">
              <QuestionIcon className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-medium text-amber-400 capitalize">
                {questionType.replace('-', ' ')}
              </span>
            </div>

            {/* Type Switcher Buttons */}
            <div className="flex gap-0.5 ml-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-7 w-7',
                      questionType === 'multiple-choice' && 'bg-amber-500/20 text-amber-400',
                    )}
                    onClick={() => onChangeQuestionType?.('multiple-choice')}
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Multiple Choice</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-7 w-7',
                      questionType === 'multiple-select' && 'bg-amber-500/20 text-amber-400',
                    )}
                    onClick={() => onChangeQuestionType?.('multiple-select')}
                  >
                    <ListChecks className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Multiple Select</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-7 w-7',
                      questionType === 'true-false' && 'bg-amber-500/20 text-amber-400',
                    )}
                    onClick={() => onChangeQuestionType?.('true-false')}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>True/False</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-7 w-7',
                      questionType === 'fill-blank' && 'bg-amber-500/20 text-amber-400',
                    )}
                    onClick={() => onChangeQuestionType?.('fill-blank')}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Fill in the Blank</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </RibbonGroup>

        {/* Choices Group */}
        <RibbonGroup label="Choices">
          <div className="flex items-center gap-1 px-1">
            {/* Add Choice */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-white/10"
                  onClick={onAddChoice}
                  disabled={!canAddChoice}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Choice
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add a new answer choice</TooltipContent>
            </Tooltip>

            {/* Mark Correct */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-green-500/50 text-green-400"
                  onClick={onMarkCorrect}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark Correct
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mark selected choice as correct</TooltipContent>
            </Tooltip>

            {/* Shuffle Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn('h-8 w-8', isShuffled && 'bg-amber-500/20 text-amber-400')}
                  onClick={onToggleShuffle}
                  disabled={!canShuffle}
                >
                  <Shuffle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isShuffled ? 'Shuffle On' : 'Shuffle Off'}</TooltipContent>
            </Tooltip>
          </div>
        </RibbonGroup>

        {/* Scoring Group */}
        <RibbonGroup label="Scoring">
          <div className="flex items-center gap-3 px-2">
            {/* Points */}
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-amber-400" />
              <Input
                type="number"
                value={points}
                onChange={(e) => onUpdatePoints?.(Number(e.target.value))}
                className="h-7 w-14 text-xs bg-zinc-900 border-white/10 text-center"
                min={0}
                max={100}
              />
              <span className="text-[10px] text-zinc-500">pts</span>
            </div>

            {/* Max Attempts */}
            <div className="flex items-center gap-1">
              <RefreshCw className="h-4 w-4 text-cyan-400" />
              <Input
                type="number"
                value={maxAttempts}
                onChange={(e) => onUpdateMaxAttempts?.(Number(e.target.value))}
                className="h-7 w-12 text-xs bg-zinc-900 border-white/10 text-center"
                min={1}
                max={10}
              />
              <span className="text-[10px] text-zinc-500">tries</span>
            </div>
          </div>
        </RibbonGroup>

        {/* Feedback Group */}
        <RibbonGroup label="Feedback">
          <div className="flex items-center gap-1 px-1">
            {/* Correct Feedback */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-green-500/30"
                  onClick={onEditCorrectFeedback}
                >
                  <CheckCircle className="h-4 w-4 mr-1 text-green-400" />
                  Correct
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit correct answer feedback</TooltipContent>
            </Tooltip>

            {/* Incorrect Feedback */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-red-500/30"
                  onClick={onEditIncorrectFeedback}
                >
                  <XCircle className="h-4 w-4 mr-1 text-red-400" />
                  Incorrect
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit incorrect answer feedback</TooltipContent>
            </Tooltip>

            {/* Hint */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-blue-500/30"
                  onClick={onEditHint}
                >
                  <HelpCircle className="h-4 w-4 mr-1 text-blue-400" />
                  Hint
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit hint text</TooltipContent>
            </Tooltip>
          </div>
        </RibbonGroup>

        {/* AI Generation Group */}
        <RibbonGroup label="AI Assist">
          <div className="flex items-center gap-1 px-1">
            {/* Generate Distractors */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-primary/50 text-primary"
                  onClick={onGenerateDistractors}
                  disabled={!canAddChoice}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  Distractors
                </Button>
              </TooltipTrigger>
              <TooltipContent>AI generate plausible wrong answers</TooltipContent>
            </Tooltip>

            {/* Generate Feedback */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-primary/50 text-primary"
                  onClick={onGenerateFeedback}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  Feedback
                </Button>
              </TooltipTrigger>
              <TooltipContent>AI generate answer feedback</TooltipContent>
            </Tooltip>
          </div>
        </RibbonGroup>

        {/* Settings Group */}
        <RibbonGroup label="Settings">
          <div className="flex items-center px-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onOpenSettings}>
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Question Settings</TooltipContent>
            </Tooltip>
          </div>
        </RibbonGroup>
      </div>
    </TooltipProvider>
  );
}
