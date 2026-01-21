'use client';

import { CheckCircle, Clock, HelpCircle, Plus, Trash2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type QuizQuestionType = 'multiple-choice' | 'true-false' | 'open-ended';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface VideoQuiz {
  id: string;
  timestamp: number;
  pauseVideo: boolean;
  question: string;
  questionType: QuizQuestionType;
  options: QuizOption[];
  feedback: {
    correct: string;
    incorrect: string;
  };
  allowSkip: boolean;
  requiredToProgress: boolean;
}

interface QuizOverlayProps {
  quizzes: VideoQuiz[];
  selectedId: string | null;
  currentTime: number;
  onQuizzesChange: (quizzes: VideoQuiz[]) => void;
  onSelect: (id: string | null) => void;
}

/**
 * QuizOverlay - Add quiz questions that pause video for interaction
 */
export function QuizOverlay({
  quizzes,
  selectedId,
  currentTime,
  onQuizzesChange,
  onSelect,
}: QuizOverlayProps) {
  const selectedQuiz = quizzes.find((q) => q.id === selectedId);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addQuiz = () => {
    const newQuiz: VideoQuiz = {
      id: `quiz-${Date.now()}`,
      timestamp: currentTime,
      pauseVideo: true,
      question: 'Enter your question here...',
      questionType: 'multiple-choice',
      options: [
        { id: 'opt-1', text: 'Option A', isCorrect: true },
        { id: 'opt-2', text: 'Option B', isCorrect: false },
        { id: 'opt-3', text: 'Option C', isCorrect: false },
        { id: 'opt-4', text: 'Option D', isCorrect: false },
      ],
      feedback: {
        correct: 'Correct! Great job.',
        incorrect: 'Not quite. Try again.',
      },
      allowSkip: true,
      requiredToProgress: false,
    };

    const updated = [...quizzes, newQuiz].sort((a, b) => a.timestamp - b.timestamp);
    onQuizzesChange(updated);
    onSelect(newQuiz.id);
  };

  const updateQuiz = (id: string, updates: Partial<VideoQuiz>) => {
    const updated = quizzes.map((q) => (q.id === id ? { ...q, ...updates } : q));
    if (updates.timestamp !== undefined) {
      updated.sort((a, b) => a.timestamp - b.timestamp);
    }
    onQuizzesChange(updated);
  };

  const deleteQuiz = (id: string) => {
    onQuizzesChange(quizzes.filter((q) => q.id !== id));
    if (selectedId === id) {
      onSelect(null);
    }
  };

  const updateOption = (quizId: string, optionId: string, updates: Partial<QuizOption>) => {
    const quiz = quizzes.find((q) => q.id === quizId);
    if (!quiz) return;

    const newOptions = quiz.options.map((opt) =>
      opt.id === optionId ? { ...opt, ...updates } : opt,
    );

    updateQuiz(quizId, { options: newOptions });
  };

  const addOption = (quizId: string) => {
    const quiz = quizzes.find((q) => q.id === quizId);
    if (!quiz || quiz.options.length >= 6) return;

    const newOption: QuizOption = {
      id: `opt-${Date.now()}`,
      text: `Option ${String.fromCharCode(65 + quiz.options.length)}`,
      isCorrect: false,
    };

    updateQuiz(quizId, { options: [...quiz.options, newOption] });
  };

  const deleteOption = (quizId: string, optionId: string) => {
    const quiz = quizzes.find((q) => q.id === quizId);
    if (!quiz || quiz.options.length <= 2) return;

    updateQuiz(quizId, { options: quiz.options.filter((o) => o.id !== optionId) });
  };

  const toggleCorrect = (quizId: string, optionId: string) => {
    const quiz = quizzes.find((q) => q.id === quizId);
    if (!quiz) return;

    // For single-answer questions, only one can be correct
    if (quiz.questionType !== 'open-ended') {
      const newOptions = quiz.options.map((opt) => ({
        ...opt,
        isCorrect: opt.id === optionId,
      }));
      updateQuiz(quizId, { options: newOptions });
    }
  };

  // Check if any quiz is near current time
  const nearbyQuiz = quizzes.find((q) => Math.abs(q.timestamp - currentTime) < 2);

  return (
    <TooltipProvider>
      <div className="space-y-4 p-4 bg-[#0d0d14] rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <HelpCircle className="h-4 w-4" />
            <span>Video Quiz Points</span>
          </div>
          <Button variant="outline" size="sm" className="border-white/10" onClick={addQuiz}>
            <Plus className="h-4 w-4 mr-1" />
            Add Quiz
          </Button>
        </div>

        {/* Nearby indicator */}
        {nearbyQuiz && (
          <div className="flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xs">
            <HelpCircle className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-yellow-400">
              Quiz at {formatTime(nearbyQuiz.timestamp)}
            </span>
          </div>
        )}

        {/* Quiz List */}
        {quizzes.length > 0 && (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {quizzes.map((quiz) => (
              <button
                type="button"
                key={quiz.id}
                className={`w-full flex items-center gap-2 p-2 rounded-xs cursor-pointer transition-colors border-none text-left ${
                  selectedId === quiz.id
                    ? 'bg-primary/20 border border-primary/50'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
                onClick={() => onSelect(quiz.id)}
                aria-pressed={selectedId === quiz.id}
              >
                <HelpCircle className="h-4 w-4 text-yellow-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{quiz.question}</p>
                  <p className="text-xs text-zinc-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(quiz.timestamp)} • {quiz.questionType}
                  </p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteQuiz(quiz.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-red-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              </button>
            ))}
          </div>
        )}

        {/* Selected Quiz Editor */}
        {selectedQuiz && (
          <div className="space-y-4 pt-4 border-t border-white/5 max-h-100 overflow-y-auto">
            {/* Timestamp */}
            <div className="space-y-2">
              <Label className="text-xs text-zinc-500">Appears at</Label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-zinc-500" />
                <Input
                  type="number"
                  value={selectedQuiz.timestamp.toFixed(1)}
                  onChange={(e) =>
                    updateQuiz(selectedQuiz.id, {
                      timestamp: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-24 bg-[#1a1a2e] border-white/10"
                  step={0.1}
                />
                <span className="text-xs text-zinc-500">seconds</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs ml-auto"
                  onClick={() => updateQuiz(selectedQuiz.id, { timestamp: currentTime })}
                >
                  Set Current
                </Button>
              </div>
            </div>

            {/* Question Type */}
            <div className="space-y-2">
              <Label className="text-xs text-zinc-500">Question Type</Label>
              <div className="flex gap-2">
                {(['multiple-choice', 'true-false'] as const).map((type) => (
                  <Button
                    key={type}
                    variant={selectedQuiz.questionType === type ? 'default' : 'outline'}
                    size="sm"
                    className={`text-xs ${
                      selectedQuiz.questionType !== type ? 'border-white/10' : ''
                    }`}
                    onClick={() => {
                      if (type === 'true-false') {
                        updateQuiz(selectedQuiz.id, {
                          questionType: type,
                          options: [
                            { id: 'true', text: 'True', isCorrect: true },
                            { id: 'false', text: 'False', isCorrect: false },
                          ],
                        });
                      } else {
                        updateQuiz(selectedQuiz.id, { questionType: type });
                      }
                    }}
                  >
                    {type === 'multiple-choice' ? 'Multiple Choice' : 'True/False'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Question */}
            <div className="space-y-2">
              <Label className="text-xs text-zinc-500">Question</Label>
              <textarea
                value={selectedQuiz.question}
                onChange={(e) => updateQuiz(selectedQuiz.id, { question: e.target.value })}
                className="w-full h-16 bg-[#1a1a2e] border border-white/10 rounded-md p-2 text-sm resize-none"
              />
            </div>

            {/* Options */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-zinc-500">Answer Options</Label>
                {selectedQuiz.questionType === 'multiple-choice' &&
                  selectedQuiz.options.length < 6 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-6"
                      onClick={() => addOption(selectedQuiz.id)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  )}
              </div>
              <div className="space-y-2">
                {selectedQuiz.options.map((option) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        option.isCorrect
                          ? 'bg-green-500 border-green-500'
                          : 'border-zinc-600 hover:border-zinc-400'
                      }`}
                      onClick={() => toggleCorrect(selectedQuiz.id, option.id)}
                    >
                      {option.isCorrect && <CheckCircle className="h-4 w-4 text-white" />}
                    </button>
                    <Input
                      value={option.text}
                      onChange={(e) =>
                        updateOption(selectedQuiz.id, option.id, {
                          text: e.target.value,
                        })
                      }
                      className="flex-1 bg-[#1a1a2e] border-white/10 text-sm h-8"
                      disabled={selectedQuiz.questionType === 'true-false'}
                    />
                    {selectedQuiz.questionType === 'multiple-choice' &&
                      selectedQuiz.options.length > 2 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => deleteOption(selectedQuiz.id, option.id)}
                        >
                          <Trash2 className="h-3 w-3 text-red-400" />
                        </Button>
                      )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-zinc-600">Click circle to mark correct answer</p>
            </div>

            {/* Feedback */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-zinc-500 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  Correct Feedback
                </Label>
                <Input
                  value={selectedQuiz.feedback.correct}
                  onChange={(e) =>
                    updateQuiz(selectedQuiz.id, {
                      feedback: { ...selectedQuiz.feedback, correct: e.target.value },
                    })
                  }
                  className="bg-[#1a1a2e] border-white/10 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-zinc-500 flex items-center gap-1">
                  <XCircle className="h-3 w-3 text-red-400" />
                  Incorrect Feedback
                </Label>
                <Input
                  value={selectedQuiz.feedback.incorrect}
                  onChange={(e) =>
                    updateQuiz(selectedQuiz.id, {
                      feedback: { ...selectedQuiz.feedback, incorrect: e.target.value },
                    })
                  }
                  className="bg-[#1a1a2e] border-white/10 text-sm"
                />
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <Label className="text-xs text-zinc-500">Behavior</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedQuiz.pauseVideo}
                    onChange={(e) => updateQuiz(selectedQuiz.id, { pauseVideo: e.target.checked })}
                    className="rounded-xs border-white/10"
                  />
                  Pause video when quiz appears
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedQuiz.allowSkip}
                    onChange={(e) => updateQuiz(selectedQuiz.id, { allowSkip: e.target.checked })}
                    className="rounded-xs border-white/10"
                  />
                  Allow learners to skip
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedQuiz.requiredToProgress}
                    onChange={(e) =>
                      updateQuiz(selectedQuiz.id, {
                        requiredToProgress: e.target.checked,
                      })
                    }
                    className="rounded-xs border-white/10"
                  />
                  Must answer correctly to continue
                </label>
              </div>
            </div>
          </div>
        )}

        {quizzes.length === 0 && (
          <div className="text-center py-6 text-zinc-500">
            <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No quiz questions</p>
            <p className="text-xs mt-1">Add questions that pause the video for interaction</p>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
