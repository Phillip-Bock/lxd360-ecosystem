'use client';

/**
 * ScenarioPlayer - Phase 14/17
 * Runtime player for branching scenarios
 */

import {
  Award,
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  Gauge,
  Home,
  Menu,
  Pause,
  Play,
  RefreshCw,
  Settings,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
  Character,
  DecisionChoice,
  DecisionNodeData,
  DialogueNodeData,
  EndNodeData,
  FeedbackNodeData,
  Scenario,
  ScenarioPlaybackState,
  SceneNodeData,
} from '@/types/studio/scenario';

// =============================================================================
// TYPES
// =============================================================================

interface ScenarioPlayerProps {
  /** Scenario to play */
  scenario: Scenario;
  /** Starting node ID (optional, defaults to scenario.startNodeId) */
  startNodeId?: string;
  /** On scenario complete */
  onComplete?: (state: ScenarioPlaybackState) => void;
  /** On exit request */
  onExit?: () => void;
  /** xAPI tracking enabled (reserved for future use) */
  _trackingEnabled?: boolean;
  /** On xAPI statement (reserved for future use) */
  _onStatement?: (statement: unknown) => void;
}

interface PlayerSettings {
  volume: number;
  muted: boolean;
  autoAdvance: boolean;
  textSpeed: 'slow' | 'normal' | 'fast';
  showCaptions: boolean;
}

// =============================================================================
// INITIAL STATE
// =============================================================================

function createInitialState(scenario: Scenario, startNodeId?: string): ScenarioPlaybackState {
  const initialVariables: Record<string, unknown> = {};
  for (const v of scenario.variables) {
    initialVariables[v.id] = v.defaultValue;
  }

  const initialMeters: Record<string, number> = {};
  for (const m of scenario.meters) {
    initialMeters[m.id] = m.defaultValue;
  }

  const initialFlags: Record<string, boolean> = {};
  for (const f of scenario.flags) {
    initialFlags[f.id] = f.defaultValue;
  }

  const initialTimers: Record<string, { isRunning: boolean; elapsed: number }> = {};
  for (const t of scenario.timers) {
    initialTimers[t.id] = { isRunning: false, elapsed: 0 };
  }

  return {
    scenarioId: scenario.id,
    currentNodeId: startNodeId || scenario.startNodeId,
    isPlaying: true,
    isPaused: false,
    isComplete: false,
    visitedNodes: [startNodeId || scenario.startNodeId],
    pathTaken: [],
    variables: initialVariables,
    meters: initialMeters,
    inventory: {},
    flags: initialFlags,
    timers: initialTimers,
    achievements: [],
    score: 0,
    maxScore: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    startTime: Date.now(),
    elapsedTime: 0,
    attempts: 1,
    checkpoints: {},
  };
}

// =============================================================================
// SCENE RENDERER
// =============================================================================

interface SceneRendererProps {
  data: SceneNodeData;
  characters: Character[];
  onComplete: () => void;
  settings: PlayerSettings;
}

function SceneRenderer({ data, characters, onComplete, settings }: SceneRendererProps) {
  const [overlayVisible, setOverlayVisible] = useState<Record<string, boolean>>({});
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Initialize overlay visibility based on timing
    const timeouts: NodeJS.Timeout[] = [];

    data.overlays.forEach((overlay) => {
      const showTimeout = setTimeout(() => {
        setOverlayVisible((prev) => ({ ...prev, [overlay.id]: true }));
      }, overlay.timing.startDelay * 1000);
      timeouts.push(showTimeout);

      if (overlay.timing.duration) {
        const hideTimeout = setTimeout(
          () => {
            setOverlayVisible((prev) => ({ ...prev, [overlay.id]: false }));
          },
          (overlay.timing.startDelay + overlay.timing.duration) * 1000,
        );
        timeouts.push(hideTimeout);
      }
    });

    // Auto-advance
    if (data.autoAdvance && data.duration) {
      const advanceTimeout = setTimeout(onComplete, data.duration * 1000);
      timeouts.push(advanceTimeout);
    }

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [data, onComplete]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background */}
      {data.background.type === 'image' && data.background.src && (
        <Image
          src={data.background.src}
          alt=""
          fill
          className="object-cover"
          style={{
            filter: data.background.blur ? `blur(${data.background.blur}px)` : undefined,
          }}
          priority
        />
      )}

      {data.background.type === 'video' && data.background.src && (
        <video
          ref={videoRef}
          src={data.background.src}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay={data.background.videoSettings?.autoplay}
          loop={data.background.videoSettings?.loop}
          muted={settings.muted || data.background.videoSettings?.muted}
          onEnded={() => {
            if (data.autoAdvance && !data.background.videoSettings?.loop) {
              onComplete();
            }
          }}
        />
      )}

      {data.background.type === 'color' && (
        <div className="absolute inset-0" style={{ backgroundColor: data.background.color }} />
      )}

      {/* Background overlay */}
      {data.background.overlay && (
        <div className="absolute inset-0" style={{ backgroundColor: data.background.overlay }} />
      )}

      {/* Characters */}
      <div className="absolute inset-0 flex items-end justify-center pb-32 pointer-events-none">
        {data.characters.map((char) => {
          const character = characters.find((c) => c.id === char.characterId);
          if (!character) return null;

          const expression = character.expressions.find((e) => e.id === char.expression);
          const imageUrl = expression?.imageUrl || character.avatarUrl;

          let positionClasses = '';
          if (typeof char.position === 'string') {
            switch (char.position) {
              case 'left':
                positionClasses = 'absolute left-[15%]';
                break;
              case 'center-left':
                positionClasses = 'absolute left-[30%]';
                break;
              case 'center':
                positionClasses = 'absolute left-1/2 -translate-x-1/2';
                break;
              case 'center-right':
                positionClasses = 'absolute right-[30%]';
                break;
              case 'right':
                positionClasses = 'absolute right-[15%]';
                break;
            }
          }

          return (
            <div
              key={char.characterId}
              className={cn('transition-all duration-500', positionClasses)}
            >
              {imageUrl && (
                <div className="relative h-[60vh] w-auto">
                  <Image
                    src={imageUrl}
                    alt={character.name}
                    fill
                    className="object-contain drop-shadow-2xl"
                    style={{
                      filter: char.speaking ? 'brightness(1.1)' : undefined,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overlays */}
      {data.overlays.map((overlay) => {
        if (!overlayVisible[overlay.id]) return null;

        return (
          <div
            key={overlay.id}
            className="absolute transition-all duration-300"
            style={{
              left: `${overlay.position.x}%`,
              top: `${overlay.position.y}%`,
              width: overlay.position.width ? `${overlay.position.width}%` : undefined,
              zIndex: overlay.position.layer,
            }}
          >
            {overlay.content.type === 'text' && (
              <div
                className="px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: overlay.style?.backgroundColor || 'rgba(0,0,0,0.7)',
                  color: overlay.style?.textColor || 'white',
                }}
              >
                {overlay.content.text}
              </div>
            )}
            {overlay.content.type === 'button' && (
              <Button
                onClick={() => {
                  if (
                    overlay.content.type === 'button' &&
                    overlay.content.action.type === 'navigate'
                  ) {
                    // Handle navigation
                  }
                }}
              >
                {overlay.content.label}
              </Button>
            )}
          </div>
        );
      })}

      {/* Click to continue */}
      {!data.autoAdvance && (
        <button type="button" className="absolute inset-0 cursor-pointer" onClick={onComplete}>
          <div className="absolute bottom-8 right-8 flex items-center gap-2 text-white/70 animate-pulse">
            <span className="text-sm">Click to continue</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </button>
      )}
    </div>
  );
}

// =============================================================================
// DECISION RENDERER
// =============================================================================

interface DecisionRendererProps {
  data: DecisionNodeData;
  onChoose: (choice: DecisionChoice) => void;
  timeRemaining?: number;
}

function DecisionRenderer({ data, onChoose, timeRemaining }: DecisionRendererProps) {
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);

  const handleChoiceClick = (choice: DecisionChoice) => {
    if (data.allowMultiple) {
      setSelectedChoices((prev) =>
        prev.includes(choice.id) ? prev.filter((id) => id !== choice.id) : [...prev, choice.id],
      );
    } else {
      onChoose(choice);
    }
  };

  const handleConfirm = () => {
    const firstChoice = data.choices.find((c) => selectedChoices.includes(c.id));
    if (firstChoice) {
      onChoose(firstChoice);
    }
  };

  const choices = data.randomizeOrder
    ? [...data.choices].sort(() => Math.random() - 0.5)
    : data.choices;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Timer */}
      {timeRemaining !== undefined && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white">
          <Clock className="h-5 w-5" />
          <span className="text-xl font-mono">{Math.ceil(timeRemaining)}s</span>
        </div>
      )}

      {/* Prompt */}
      {data.prompt && (
        <div className="mb-8 max-w-2xl text-center">
          <p className="text-2xl font-medium text-white">{data.prompt}</p>
        </div>
      )}

      {/* Choices */}
      <div
        className={cn(
          'grid gap-4 max-w-4xl w-full px-8',
          data.layout.type === 'cards' && `grid-cols-${data.layout.columns}`,
          data.layout.type === 'buttons' &&
            data.layout.alignment === 'horizontal' &&
            'grid-cols-2 md:grid-cols-4',
          data.layout.type === 'buttons' &&
            data.layout.alignment === 'vertical' &&
            'grid-cols-1 max-w-lg',
        )}
      >
        {choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            className={cn(
              'p-4 rounded-xl border-2 text-left transition-all',
              'hover:scale-[1.02] hover:border-primary',
              data.allowMultiple && selectedChoices.includes(choice.id)
                ? 'border-primary bg-primary/20'
                : 'border-white/20 bg-black/50 backdrop-blur-sm',
            )}
            onClick={() => handleChoiceClick(choice)}
          >
            {choice.imageUrl && (
              <div className="relative w-full h-32 mb-3">
                <Image src={choice.imageUrl} alt="" fill className="object-cover rounded-lg" />
              </div>
            )}
            <h4 className="font-medium text-white text-lg">{choice.label}</h4>
            {choice.description && (
              <p className="text-sm text-white/70 mt-1">{choice.description}</p>
            )}
          </button>
        ))}
      </div>

      {/* Confirm button for multiple selection */}
      {data.allowMultiple && selectedChoices.length >= (data.minSelections || 1) && (
        <Button className="mt-8" size="lg" onClick={handleConfirm}>
          Confirm ({selectedChoices.length} selected)
        </Button>
      )}
    </div>
  );
}

// =============================================================================
// DIALOGUE RENDERER
// =============================================================================

interface DialogueRendererProps {
  data: DialogueNodeData;
  characters: Character[];
  onComplete: () => void;
  settings: PlayerSettings;
}

function DialogueRenderer({ data, characters, onComplete, settings }: DialogueRendererProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const character = characters.find((c) => c.id === data.characterId);
  const currentLine = data.lines[lineIndex];
  const speedMs = settings.textSpeed === 'slow' ? 50 : settings.textSpeed === 'fast' ? 15 : 30;

  useEffect(() => {
    if (!currentLine || !data.typewriterEffect) {
      setDisplayedText(currentLine?.text || '');
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    setDisplayedText('');

    let charIndex = 0;
    const interval = setInterval(() => {
      charIndex++;
      setDisplayedText(currentLine.text.slice(0, charIndex));

      if (charIndex >= currentLine.text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [currentLine, data.typewriterEffect, speedMs]);

  const handleAdvance = () => {
    if (isTyping) {
      // Skip typewriter
      setDisplayedText(currentLine?.text || '');
      setIsTyping(false);
    } else if (lineIndex < data.lines.length - 1) {
      // Next line
      setLineIndex((prev) => prev + 1);
    } else {
      // Complete
      onComplete();
    }
  };

  if (!currentLine) return null;

  return (
    <button type="button" className="absolute inset-0 cursor-pointer" onClick={handleAdvance}>
      {/* Dialogue box */}
      <div
        className={cn(
          'absolute left-0 right-0 bg-black/80 backdrop-blur-md',
          data.textboxStyle === 'bottom' && 'bottom-0 px-8 py-6',
          data.textboxStyle === 'fullscreen' && 'inset-0 flex items-center justify-center p-8',
        )}
      >
        <div className="max-w-4xl mx-auto">
          {/* Character name */}
          {character && (
            <div className="flex items-center gap-3 mb-2">
              {character.avatarUrl && (
                <Image
                  src={character.avatarUrl}
                  alt=""
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <span className="font-medium" style={{ color: character.color || 'white' }}>
                {data.nameOverride || character.name}
              </span>
            </div>
          )}

          {/* Text */}
          <p className="text-lg text-white leading-relaxed">
            {displayedText}
            {isTyping && <span className="animate-pulse">▋</span>}
          </p>

          {/* Progress indicator */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-white/50">
              {lineIndex + 1} / {data.lines.length}
            </span>
            {!isTyping && (
              <span className="text-xs text-white/50 animate-pulse">Click to continue →</span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// =============================================================================
// FEEDBACK RENDERER
// =============================================================================

interface FeedbackRendererProps {
  data: FeedbackNodeData;
  onContinue: () => void;
}

function FeedbackRenderer({ data, onContinue }: FeedbackRendererProps) {
  useEffect(() => {
    if (data.autoAdvance && data.autoAdvanceDelay) {
      const timeout = setTimeout(onContinue, data.autoAdvanceDelay * 1000);
      return () => clearTimeout(timeout);
    }
  }, [data.autoAdvance, data.autoAdvanceDelay, onContinue]);

  const variantStyles = {
    success: 'border-green-500 bg-green-500/10',
    error: 'border-red-500 bg-red-500/10',
    info: 'border-blue-500 bg-blue-500/10',
    tip: 'border-amber-500 bg-amber-500/10',
    neutral: 'border-zinc-500 bg-zinc-500/10',
    custom: 'border-primary bg-primary/10',
  };

  const variantIcons = {
    success: <Check className="h-8 w-8 text-green-500" />,
    error: <X className="h-8 w-8 text-red-500" />,
    info: <BookOpen className="h-8 w-8 text-blue-500" />,
    tip: <Award className="h-8 w-8 text-amber-500" />,
    neutral: null,
    custom: null,
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm p-8">
      <div
        className={cn(
          'max-w-lg w-full rounded-2xl border-2 p-8 text-center',
          variantStyles[data.variant],
        )}
      >
        {variantIcons[data.variant] && (
          <div className="flex justify-center mb-4">{variantIcons[data.variant]}</div>
        )}

        {data.heading && <h3 className="text-2xl font-bold text-white mb-4">{data.heading}</h3>}

        <p className="text-lg text-white/80">{data.message}</p>

        {data.showExplanation && data.explanationText && (
          <div className="mt-4 p-4 rounded-lg bg-white/5 text-left">
            <p className="text-sm text-white/70">{data.explanationText}</p>
          </div>
        )}

        {!data.autoAdvance && (
          <Button className="mt-6" onClick={onContinue}>
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// END SCREEN RENDERER
// =============================================================================

interface EndScreenRendererProps {
  data: EndNodeData;
  state: ScenarioPlaybackState;
  onRestart: () => void;
  onExit: () => void;
}

function EndScreenRenderer({ data, state, onRestart, onExit }: EndScreenRendererProps) {
  const endStyles = {
    success: 'from-green-500/20 to-transparent',
    failure: 'from-red-500/20 to-transparent',
    neutral: 'from-zinc-500/20 to-transparent',
    custom: 'from-primary/20 to-transparent',
  };

  const elapsedMinutes = Math.floor(state.elapsedTime / 60000);
  const elapsedSeconds = Math.floor((state.elapsedTime % 60000) / 1000);

  return (
    <div
      className={cn(
        'absolute inset-0 flex items-center justify-center bg-linear-to-b',
        endStyles[data.endType],
      )}
    >
      <div className="max-w-lg w-full text-center px-8">
        {/* End type icon */}
        {data.endType === 'success' && <Award className="h-16 w-16 text-green-500 mx-auto mb-6" />}

        {/* Heading */}
        {data.heading && <h2 className="text-3xl font-bold text-white mb-4">{data.heading}</h2>}

        {/* Message */}
        {data.message && <p className="text-lg text-white/80 mb-8">{data.message}</p>}

        {/* Summary */}
        {data.showSummary && (
          <div className="bg-black/50 rounded-xl p-6 mb-8 text-left space-y-4">
            {data.summaryConfig?.showScore && (
              <div className="flex justify-between">
                <span className="text-white/70">Score</span>
                <span className="text-white font-mono">
                  {state.score} / {state.maxScore || '∞'}
                </span>
              </div>
            )}

            {data.summaryConfig?.showTime && (
              <div className="flex justify-between">
                <span className="text-white/70">Time</span>
                <span className="text-white font-mono">
                  {elapsedMinutes}:{elapsedSeconds.toString().padStart(2, '0')}
                </span>
              </div>
            )}

            {data.summaryConfig?.showChoices && (
              <div className="flex justify-between">
                <span className="text-white/70">Choices Made</span>
                <span className="text-white font-mono">
                  {state.pathTaken.filter((p) => p.choiceId).length}
                </span>
              </div>
            )}

            {data.summaryConfig?.showPath && (
              <div className="flex justify-between">
                <span className="text-white/70">Scenes Visited</span>
                <span className="text-white font-mono">{state.visitedNodes.length}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={onRestart}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Restart
          </Button>
          <Button onClick={onExit}>
            <Home className="h-4 w-4 mr-2" />
            Exit
          </Button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// HUD COMPONENT
// =============================================================================

interface PlayerHUDProps {
  scenario: Scenario;
  state: ScenarioPlaybackState;
  settings: PlayerSettings;
  onSettingsChange: (settings: Partial<PlayerSettings>) => void;
  onPause: () => void;
  onResume: () => void;
  onExit: () => void;
}

function PlayerHUD({
  scenario,
  state,
  settings,
  onSettingsChange,
  onPause,
  onResume,
  onExit,
}: PlayerHUDProps) {
  const [showMenu, setShowMenu] = useState(false);

  const progress = useMemo(() => {
    const totalNodes = scenario.nodes.length;
    const visited = state.visitedNodes.length;
    return (visited / totalNodes) * 100;
  }, [scenario.nodes.length, state.visitedNodes.length]);

  return (
    <>
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-linear-to-b from-black/50 to-transparent pointer-events-auto">
        <div className="flex items-center h-full px-4 gap-4">
          {/* Menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/70 hover:text-white"
            onClick={() => setShowMenu(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Title */}
          <span className="text-sm text-white/80 font-medium truncate">{scenario.title}</span>

          <div className="flex-1" />

          {/* Meters */}
          {scenario.settings.showMeters &&
            scenario.meters
              .filter((m) => m.showInHUD)
              .map((meter) => (
                <div key={meter.id} className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-white/70" />
                  <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${((state.meters[meter.id] || 0) / meter.max) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}

          {/* Volume */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/70 hover:text-white"
            onClick={() => onSettingsChange({ muted: !settings.muted })}
          >
            {settings.muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>

          {/* Pause/Play */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/70 hover:text-white"
            onClick={state.isPaused ? onResume : onPause}
          >
            {state.isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {scenario.settings.showProgress && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Menu Overlay */}
      {showMenu && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center pointer-events-auto">
          <div className="bg-card rounded-2xl p-6 w-80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Menu</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowMenu(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setShowMenu(false);
                  onResume();
                }}
              >
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>

              <Button variant="ghost" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start text-destructive"
                onClick={onExit}
              >
                <Home className="h-4 w-4 mr-2" />
                Exit to Menu
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ScenarioPlayer({
  scenario,
  startNodeId,
  onComplete,
  onExit,
  _trackingEnabled = false,
  _onStatement,
}: ScenarioPlayerProps) {
  // State
  const [playbackState, setPlaybackState] = useState<ScenarioPlaybackState>(() =>
    createInitialState(scenario, startNodeId),
  );
  const [settings, setSettings] = useState<PlayerSettings>({
    volume: scenario.settings.defaultMusicVolume,
    muted: false,
    autoAdvance: true,
    textSpeed: 'normal',
    showCaptions: scenario.settings.accessibility.showCaptions,
  });
  const [decisionTimer, setDecisionTimer] = useState<number | undefined>();

  // Current node
  const currentNode = useMemo(
    () => scenario.nodes.find((n) => n.id === playbackState.currentNodeId),
    [scenario.nodes, playbackState.currentNodeId],
  );

  // Navigation - must be defined before useEffects that use it
  const navigateToNode = useCallback(
    (nodeId: string, choiceId?: string) => {
      const node = scenario.nodes.find((n) => n.id === nodeId);
      if (!node) return;

      setPlaybackState((prev) => ({
        ...prev,
        currentNodeId: nodeId,
        visitedNodes: prev.visitedNodes.includes(nodeId)
          ? prev.visitedNodes
          : [...prev.visitedNodes, nodeId],
        pathTaken: [
          ...prev.pathTaken,
          {
            nodeId,
            timestamp: Date.now(),
            choiceId,
            timeSpent: 0,
          },
        ],
      }));
    },
    [scenario.nodes],
  );

  // Timer effect
  useEffect(() => {
    if (!playbackState.isPlaying || playbackState.isPaused) return;

    const interval = setInterval(() => {
      setPlaybackState((prev) => ({
        ...prev,
        elapsedTime: Date.now() - prev.startTime,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [playbackState.isPlaying, playbackState.isPaused]);

  // Decision timer
  useEffect(() => {
    if (currentNode?.data.nodeType !== 'decision') {
      setDecisionTimer(undefined);
      return;
    }

    const data = currentNode.data as DecisionNodeData;
    if (!data.timeLimit) return;

    setDecisionTimer(data.timeLimit);

    const interval = setInterval(() => {
      setDecisionTimer((prev) => {
        if (prev === undefined || prev <= 0) {
          // Time's up - use default choice
          if (data.defaultChoiceId) {
            const defaultChoice = data.choices.find((c) => c.id === data.defaultChoiceId);
            if (defaultChoice) {
              navigateToNode(defaultChoice.targetNodeId);
            }
          }
          return undefined;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentNode, navigateToNode]);

  // Handle choice
  const handleChoice = useCallback(
    (choice: DecisionChoice) => {
      // Apply effects
      if (choice.effects) {
        setPlaybackState((prev) => {
          const newState = { ...prev };

          for (const effect of choice.effects || []) {
            switch (effect.type) {
              case 'set-variable':
                newState.variables = {
                  ...newState.variables,
                  [effect.target]: effect.value,
                };
                break;
              case 'add-variable':
                newState.variables = {
                  ...newState.variables,
                  [effect.target]:
                    (Number(newState.variables[effect.target]) || 0) + Number(effect.value),
                };
                break;
              case 'set-meter':
                newState.meters = {
                  ...newState.meters,
                  [effect.target]: Number(effect.value),
                };
                break;
              case 'add-meter':
                newState.meters = {
                  ...newState.meters,
                  [effect.target]: (newState.meters[effect.target] || 0) + Number(effect.value),
                };
                break;
              case 'add-inventory':
                newState.inventory = {
                  ...newState.inventory,
                  [effect.target]: (newState.inventory[effect.target] || 0) + 1,
                };
                break;
            }
          }

          // Update score
          if (choice.points) {
            newState.score = newState.score + choice.points;
          }

          return newState;
        });
      }

      // Show feedback or navigate
      if (choice.feedback) {
        // TODO(LXD-409): Show feedback overlay
      }

      navigateToNode(choice.targetNodeId, choice.id);
    },
    [navigateToNode],
  );

  // Pause/Resume
  const handlePause = useCallback(() => {
    setPlaybackState((prev) => ({ ...prev, isPaused: true }));
  }, []);

  const handleResume = useCallback(() => {
    setPlaybackState((prev) => ({ ...prev, isPaused: false }));
  }, []);

  // Restart
  const handleRestart = useCallback(() => {
    setPlaybackState(createInitialState(scenario, startNodeId));
  }, [scenario, startNodeId]);

  // Exit
  const handleExit = useCallback(() => {
    onComplete?.(playbackState);
    onExit?.();
  }, [playbackState, onComplete, onExit]);

  // Render current node content
  const renderNodeContent = () => {
    if (!currentNode) return null;

    switch (currentNode.data.nodeType) {
      case 'scene':
        return (
          <SceneRenderer
            data={currentNode.data}
            characters={scenario.characters}
            onComplete={() => {
              // Find next node from edges
              const edge = scenario.edges.find((e) => e.source === currentNode.id);
              if (edge) {
                navigateToNode(edge.target);
              }
            }}
            settings={settings}
          />
        );

      case 'decision':
        return (
          <DecisionRenderer
            data={currentNode.data}
            onChoose={handleChoice}
            timeRemaining={decisionTimer}
          />
        );

      case 'dialogue':
        return (
          <DialogueRenderer
            data={currentNode.data}
            characters={scenario.characters}
            onComplete={() => {
              const edge = scenario.edges.find((e) => e.source === currentNode.id);
              if (edge) {
                navigateToNode(edge.target);
              }
            }}
            settings={settings}
          />
        );

      case 'narration':
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-8">
            <div className="max-w-2xl text-center">
              <p className="text-xl text-white/90 leading-relaxed italic">
                {currentNode.data.text}
              </p>
              {!currentNode.data.autoAdvance && (
                <Button
                  className="mt-8"
                  onClick={() => {
                    const edge = scenario.edges.find((e) => e.source === currentNode.id);
                    if (edge) {
                      navigateToNode(edge.target);
                    }
                  }}
                >
                  Continue
                </Button>
              )}
            </div>
          </div>
        );

      case 'feedback':
        return (
          <FeedbackRenderer
            data={currentNode.data}
            onContinue={() => {
              const edge = scenario.edges.find((e) => e.source === currentNode.id);
              if (edge) {
                navigateToNode(edge.target);
              }
            }}
          />
        );

      case 'end':
        return (
          <EndScreenRenderer
            data={currentNode.data}
            state={playbackState}
            onRestart={handleRestart}
            onExit={handleExit}
          />
        );

      default:
        // For logic nodes (branch, variable, etc.), process and move on
        // This should be handled by the engine, not rendered
        return null;
    }
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Content */}
      {renderNodeContent()}

      {/* HUD */}
      {currentNode?.data.nodeType !== 'end' && (
        <PlayerHUD
          scenario={scenario}
          state={playbackState}
          settings={settings}
          onSettingsChange={(updates) => setSettings((prev) => ({ ...prev, ...updates }))}
          onPause={handlePause}
          onResume={handleResume}
          onExit={handleExit}
        />
      )}

      {/* Pause overlay */}
      {playbackState.isPaused && currentNode?.data.nodeType !== 'end' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-center">
            <Pause className="h-16 w-16 text-white/50 mx-auto mb-4" />
            <p className="text-white/70">Paused</p>
            <Button className="mt-4" onClick={handleResume}>
              Resume
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScenarioPlayer;
