'use client';

import { ArrowRight, Brain, Clock, Coffee, Play, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface BreakSuggestionModalProps {
  isVisible: boolean;
  reason: string;
  suggestedDuration: number; // in minutes
  fatigueLevel: number; // 0-100
  onAccept: () => void;
  onDismiss: () => void;
  onSnooze?: (minutes: number) => void;
}

interface BreathingExercise {
  phase: 'inhale' | 'hold' | 'exhale' | 'rest';
  duration: number;
  progress: number;
}

export function BreakSuggestionModal({
  isVisible,
  reason,
  suggestedDuration,
  fatigueLevel,
  onAccept,
  onDismiss,
  onSnooze,
}: BreakSuggestionModalProps): React.JSX.Element | null {
  const [showBreathing, setShowBreathing] = useState(false);
  const [breathingExercise, setBreathingExercise] = useState<BreathingExercise>({
    phase: 'inhale',
    duration: 4,
    progress: 0,
  });
  const [breakTimer, setBreakTimer] = useState<number | null>(null);
  const [isBreakActive, setIsBreakActive] = useState(false);

  // Breathing exercise animation
  useEffect(() => {
    if (!showBreathing) return;

    const PHASES: Array<{ phase: BreathingExercise['phase']; duration: number }> = [
      { phase: 'inhale', duration: 4 },
      { phase: 'hold', duration: 4 },
      { phase: 'exhale', duration: 4 },
      { phase: 'rest', duration: 2 },
    ];

    let phaseIndex = 0;
    let progressInterval: NodeJS.Timeout;

    const runPhase = (): void => {
      const currentPhase = PHASES[phaseIndex];
      setBreathingExercise({ ...currentPhase, progress: 0 });

      let progress = 0;
      progressInterval = setInterval((): void => {
        progress += 100 / (currentPhase.duration * 10);
        if (progress >= 100) {
          clearInterval(progressInterval);
          phaseIndex = (phaseIndex + 1) % PHASES.length;
          runPhase();
        } else {
          setBreathingExercise((prev) => ({ ...prev, progress }));
        }
      }, 100);
    };

    runPhase();

    return (): void => {
      clearInterval(progressInterval);
    };
  }, [showBreathing]);

  // Break countdown timer
  useEffect(() => {
    if (!isBreakActive || breakTimer === null) return;

    if (breakTimer <= 0) {
      setIsBreakActive(false);
      setBreakTimer(null);
      onAccept();
      return;
    }

    const timeout = setTimeout((): void => {
      setBreakTimer((prev) => (prev ?? 0) - 1);
    }, 1000);

    return (): void => clearTimeout(timeout);
  }, [isBreakActive, breakTimer, onAccept]);

  const handleStartBreak = useCallback(() => {
    setIsBreakActive(true);
    setBreakTimer(suggestedDuration * 60);
  }, [suggestedDuration]);

  const handleSkipBreak = useCallback(() => {
    setIsBreakActive(false);
    setBreakTimer(null);
    onAccept();
  }, [onAccept]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBreathingInstruction = (): string => {
    switch (breathingExercise.phase) {
      case 'inhale':
        return 'Breathe in slowly...';
      case 'hold':
        return 'Hold your breath...';
      case 'exhale':
        return 'Breathe out slowly...';
      case 'rest':
        return 'Rest...';
    }
  };

  const getBreathingColor = (): string => {
    switch (breathingExercise.phase) {
      case 'inhale':
        return 'bg-brand-primary';
      case 'hold':
        return 'bg-brand-secondary';
      case 'exhale':
        return 'bg-brand-success';
      case 'rest':
        return 'bg-lxd-blue-light/30';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md mx-4 bg-lxd-light-card rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div
          className={`px-6 py-4 ${fatigueLevel > 80 ? 'bg-brand-error' : fatigueLevel > 60 ? 'bg-brand-warning' : 'bg-brand-primary'}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-brand-primary">
              <Coffee className="w-6 h-6" />
              <h2 className="text-lg font-semibold">Time for a Break</h2>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              className="p-1 hover:bg-lxd-light-card/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-brand-primary" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isBreakActive && breakTimer !== null ? (
            // Active break view
            <div className="text-center">
              <div className="mb-6">
                <div className="text-5xl font-bold text-lxd-text-dark-heading mb-2">
                  {formatTime(breakTimer)}
                </div>
                <p className="text-lxd-text-dark-muted">Break time remaining</p>
              </div>

              {showBreathing ? (
                // Breathing exercise
                <div className="mb-6">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <div
                      className={`absolute inset-0 rounded-full ${getBreathingColor()} transition-all duration-500`}
                      style={{
                        transform: `scale(${0.5 + breathingExercise.progress / 200})`,
                        opacity: 0.6 + breathingExercise.progress / 250,
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-brand-primary font-medium text-sm">
                        {Math.round(
                          breathingExercise.duration -
                            (breathingExercise.progress / 100) * breathingExercise.duration,
                        )}
                        s
                      </span>
                    </div>
                  </div>
                  <p className="text-lxd-text-dark-body font-medium">{getBreathingInstruction()}</p>
                </div>
              ) : (
                // Break suggestions
                <div className="space-y-3 mb-6 text-left">
                  <h3 className="font-medium text-lxd-text-dark-heading mb-3">
                    Suggested activities:
                  </h3>
                  <div className="flex items-start gap-3 p-3 bg-lxd-light-card rounded-lg">
                    <Coffee className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-lxd-text-dark-heading">Get a drink</p>
                      <p className="text-sm text-lxd-text-dark-muted">
                        Stay hydrated for better focus
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-lxd-light-card rounded-lg">
                    <Brain className="w-5 h-5 text-brand-purple mt-0.5" />
                    <div>
                      <p className="font-medium text-lxd-text-dark-heading">
                        Look away from screen
                      </p>
                      <p className="text-sm text-lxd-text-dark-muted">
                        Rest your eyes for 20 seconds
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBreathing(!showBreathing)}
                  className="flex-1 px-4 py-2 text-brand-blue hover:bg-blue-50 rounded-lg font-medium transition-colors"
                >
                  {showBreathing ? 'Hide Exercise' : 'Breathing Exercise'}
                </button>
                <button
                  type="button"
                  onClick={handleSkipBreak}
                  className="flex-1 px-4 py-2 bg-brand-primary text-brand-primary rounded-lg font-medium hover:bg-brand-primary-hover transition-colors"
                >
                  End Break Early
                </button>
              </div>
            </div>
          ) : (
            // Pre-break view
            <>
              {/* Fatigue indicator */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-lxd-text-dark-muted">Cognitive Fatigue Level</span>
                  <span
                    className={`font-medium ${
                      fatigueLevel > 80
                        ? 'text-red-600'
                        : fatigueLevel > 60
                          ? 'text-amber-600'
                          : 'text-brand-blue'
                    }`}
                  >
                    {fatigueLevel}%
                  </span>
                </div>
                <div className="h-2 bg-lxd-light-surface rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      fatigueLevel > 80
                        ? 'bg-brand-error'
                        : fatigueLevel > 60
                          ? 'bg-brand-warning'
                          : 'bg-brand-primary'
                    }`}
                    style={{ width: `${fatigueLevel}%` }}
                  />
                </div>
              </div>

              {/* Reason */}
              <p className="text-lxd-text-dark-body mb-6">{reason}</p>

              {/* Suggested duration */}
              <div className="flex items-center gap-2 p-4 bg-lxd-light-card rounded-xl mb-6">
                <Clock className="w-5 h-5 text-lxd-text-light-muted" />
                <span className="text-lxd-text-dark-body">
                  Suggested break: <strong>{suggestedDuration} minutes</strong>
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleStartBreak}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-brand-primary text-brand-primary rounded-xl font-medium hover:bg-brand-primary-hover transition-colors"
                >
                  <Play className="w-5 h-5" />
                  Start {suggestedDuration} Minute Break
                </button>

                <div className="flex gap-3">
                  {onSnooze && (
                    <button
                      type="button"
                      onClick={() => onSnooze(5)}
                      className="flex-1 px-4 py-2 border border-lxd-light-border text-lxd-text-dark-body rounded-lg font-medium hover:bg-lxd-light-card transition-colors"
                    >
                      Snooze 5 min
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onDismiss}
                    className="flex-1 px-4 py-2 text-lxd-text-dark-muted hover:text-lxd-text-dark-body hover:bg-lxd-light-card rounded-lg font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    Continue Learning <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
