'use client';

import { Heart, MessageSquare, RotateCcw, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PanoramaViewer } from './panorama-viewer';
import type {
  CharacterState,
  GameState,
  PanoramaHotspot,
  ScenarioChoice,
  ScenarioPanoramaProps,
} from './types';

const DEFAULT_GAME_STATE: GameState = {
  trust: 100,
  attempts: 3,
  completedCharacters: 0,
  characters: {},
};

export function ScenarioPanorama({
  scenarioData,
  onComplete,
  onProgress,
  storageKey = 'scenario_state',
}: ScenarioPanoramaProps): React.JSX.Element {
  const [gameState, setGameState] = useState<GameState>(() => {
    if (typeof window === 'undefined') return DEFAULT_GAME_STATE;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Silently ignore - invalid saved game state, return default
        return DEFAULT_GAME_STATE;
      }
    }
    // Initialize character states from scenario data
    const characters: Record<string, CharacterState> = {};
    Object.keys(scenarioData.characters).forEach((id) => {
      characters[id] = { completed: false, trustLost: 0, status: 'pending' };
    });
    return { ...DEFAULT_GAME_STATE, characters };
  });

  const [activeCharacter, setActiveCharacter] = useState<string | null>(null);
  const [currentScene, setCurrentScene] = useState<string | null>(null);
  const [conversationTrust, setConversationTrust] = useState(100);
  const [messages, setMessages] = useState<
    Array<{ speaker: string; text: string; isUser: boolean }>
  >([]);
  const [showOutcome, setShowOutcome] = useState(false);
  const [outcomeType, setOutcomeType] = useState<'success' | 'partial' | 'failure'>('partial');

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(gameState));
  }, [gameState, storageKey]);

  // Report progress
  useEffect(() => {
    const totalCharacters = Object.keys(scenarioData.characters).length;
    const progress = (gameState.completedCharacters / totalCharacters) * 100;
    onProgress?.(progress);
  }, [gameState.completedCharacters, scenarioData.characters, onProgress]);

  // Generate hotspots from characters
  const hotspots: PanoramaHotspot[] = Object.entries(scenarioData.characters).map(([id, char]) => ({
    id,
    pitch: -10,
    yaw: parseInt(id, 36) * 30 - 60, // Distribute around panorama
    tooltip: char.name,
    className: `character-hotspot hotspot-${id} ${gameState.characters[id]?.completed ? `completed-${gameState.characters[id].status}` : ''}`,
    data: { characterId: id },
  }));

  const handleHotspotClick = useCallback(
    (hotspot: PanoramaHotspot): void => {
      const characterId = hotspot.data?.characterId as string;
      if (!characterId || gameState.characters[characterId]?.completed) return;

      setActiveCharacter(characterId);
      setCurrentScene(scenarioData.characters[characterId].startScene);
      setConversationTrust(100);
      setMessages([]);

      // Add initial dialogue
      const scene = scenarioData.scenes[scenarioData.characters[characterId].startScene];
      if (scene) {
        setMessages([
          {
            speaker: scenarioData.characters[characterId].name,
            text: scene.dialogue,
            isUser: false,
          },
        ]);
      }
    },
    [gameState.characters, scenarioData],
  );

  const checkGameEnd = useCallback(
    (isCriticalFailure: boolean): void => {
      const totalCharacters = Object.keys(scenarioData.characters).length;
      const happyCount = Object.values(gameState.characters).filter(
        (c) => c.status === 'happy',
      ).length;
      const angryCount = Object.values(gameState.characters).filter(
        (c) => c.status === 'angry',
      ).length;

      if (isCriticalFailure || gameState.completedCharacters + 1 >= totalCharacters) {
        if (isCriticalFailure || angryCount > 0) {
          setOutcomeType('failure');
          setGameState((prev) => ({ ...prev, attempts: prev.attempts - 1 }));
        } else if (happyCount === totalCharacters) {
          setOutcomeType('success');
          onComplete?.(gameState);
        } else {
          setOutcomeType('partial');
        }
        setShowOutcome(true);
      }
    },
    [gameState, scenarioData.characters, onComplete],
  );

  const handleChoice = useCallback(
    (choice: ScenarioChoice): void => {
      if (!activeCharacter || !currentScene) return;

      // Add user message
      setMessages((prev) => [...prev, { speaker: 'You', text: choice.text, isUser: true }]);

      // Update trust
      const newTrust = Math.max(0, conversationTrust + choice.score);
      setConversationTrust(newTrust);

      if (choice.category === 'worst') {
        // Critical failure
        const feedbackKey = `${activeCharacter}_worst`;
        const feedback = scenarioData.feedback[feedbackKey] || 'This response broke trust.';

        setMessages((prev) => [...prev, { speaker: 'Feedback', text: feedback, isUser: false }]);

        // Update game state
        setGameState((prev) => ({
          ...prev,
          characters: {
            ...prev.characters,
            [activeCharacter]: {
              ...prev.characters[activeCharacter],
              completed: true,
              status: 'angry',
            },
          },
          completedCharacters: prev.completedCharacters + 1,
        }));

        setTimeout(() => {
          setActiveCharacter(null);
          checkGameEnd(true);
        }, 2500);
      } else if (choice.nextScene === 'end_conversation') {
        // Successful conversation end
        const status = newTrust > 80 ? 'happy' : 'annoyed';

        setGameState((prev) => ({
          ...prev,
          characters: {
            ...prev.characters,
            [activeCharacter]: { ...prev.characters[activeCharacter], completed: true, status },
          },
          completedCharacters: prev.completedCharacters + 1,
        }));

        setTimeout(() => {
          setActiveCharacter(null);
          checkGameEnd(false);
        }, 2000);
      } else {
        // Continue to next scene
        setCurrentScene(choice.nextScene);
        const nextSceneData = scenarioData.scenes[choice.nextScene];
        if (nextSceneData) {
          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              {
                speaker: scenarioData.characters[activeCharacter].name,
                text: nextSceneData.dialogue,
                isUser: false,
              },
            ]);
          }, 1500);
        }
      }
    },
    [activeCharacter, currentScene, conversationTrust, scenarioData, checkGameEnd],
  );

  const handleRetry = (): void => {
    const characters: Record<string, CharacterState> = {};
    Object.keys(scenarioData.characters).forEach((id) => {
      characters[id] = { completed: false, trustLost: 0, status: 'pending' };
    });
    setGameState((prev) => ({
      ...prev,
      trust: 100,
      completedCharacters: 0,
      characters,
    }));
    setShowOutcome(false);
  };

  const currentSceneData = currentScene ? scenarioData.scenes[currentScene] : null;

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden">
      {/* Panorama Viewer */}
      <PanoramaViewer
        imageUrl={scenarioData.panoramaImage}
        hotspots={hotspots}
        onHotspotClick={handleHotspotClick}
        className="w-full h-full"
      />

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        <div className="bg-lxd-dark-surface/90 rounded-lg px-4 py-2 pointer-events-auto">
          <div className="flex items-center gap-2 text-lxd-text-light-heading">
            <Heart className="w-5 h-5 text-lxd-error" />
            <div className="w-24 h-2 bg-lxd-dark-page rounded-full overflow-hidden">
              <div
                className="h-full bg-lxd-success transition-all duration-300"
                style={{ width: `${conversationTrust}%` }}
              />
            </div>
          </div>
        </div>
        <div className="bg-lxd-dark-surface/90 rounded-lg px-4 py-2 text-center pointer-events-auto">
          <div className="text-xs text-lxd-text-light-muted">ATTEMPTS</div>
          <div className="text-lg font-bold text-lxd-text-light-heading">
            {gameState.attempts}/3
          </div>
        </div>
      </div>

      {/* Conversation Modal */}
      {activeCharacter && (
        <div className="absolute inset-0 bg-lxd-dark-page/80 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl h-[500px] bg-lxd-dark-surface border-lxd-dark-surface flex flex-col">
            <div className="p-4 border-b border-lxd-dark-page flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-lxd-blue flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-lxd-text-light-heading" />
                </div>
                <div>
                  <h3 className="font-bold text-lxd-text-light-heading">
                    {scenarioData.characters[activeCharacter]?.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-lxd-text-light-muted">Trust:</span>
                    <div className="w-16 h-1.5 bg-lxd-dark-page rounded-full overflow-hidden">
                      <div
                        className="h-full bg-lxd-success transition-all"
                        style={{ width: `${conversationTrust}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveCharacter(null)}
                className="text-lxd-text-light-muted"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg max-w-[80%] ${
                    msg.isUser
                      ? 'bg-lxd-blue text-lxd-text-light-heading ml-auto'
                      : msg.speaker === 'Feedback'
                        ? 'bg-lxd-error/20 border border-lxd-error text-lxd-text-light-body'
                        : 'bg-lxd-dark-page text-lxd-text-light-body'
                  }`}
                >
                  <p className="text-xs font-bold mb-1">{msg.speaker}</p>
                  <p className="text-sm">{msg.text}</p>
                </div>
              ))}
            </div>

            {currentSceneData && !gameState.characters[activeCharacter]?.completed && (
              <div className="p-4 border-t border-lxd-dark-page space-y-2">
                {currentSceneData.choices.map((choice, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3 px-4 border-lxd-dark-surface text-lxd-text-light-secondary hover:bg-lxd-blue/10 hover:border-lxd-blue"
                    onClick={() => handleChoice(choice)}
                  >
                    {choice.text}
                  </Button>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Outcome Modal */}
      {showOutcome && (
        <div className="absolute inset-0 bg-lxd-dark-page/90 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-lxd-dark-surface border-lxd-dark-surface p-8 text-center">
            <h2
              className={`text-3xl font-bold mb-4 ${
                outcomeType === 'success'
                  ? 'text-lxd-success'
                  : outcomeType === 'partial'
                    ? 'text-lxd-blue'
                    : 'text-lxd-error'
              }`}
            >
              {outcomeType === 'success'
                ? 'SUCCESS!'
                : outcomeType === 'partial'
                  ? 'Partial Success'
                  : 'An Opportunity to Re-strategize'}
            </h2>
            <p className="text-lxd-text-light-secondary mb-6">
              {outcomeType === 'success'
                ? "Congratulations! You've achieved full buy-in by skillfully applying critical thinking principles."
                : outcomeType === 'partial'
                  ? 'You have enough support to move forward, but your coalition is fragile.'
                  : 'Trust is the foundation of effective leadership. Use this outcome to recalibrate your approach.'}
            </p>
            <p className="text-lxd-text-light-muted mb-6">
              {gameState.attempts > 0
                ? `You have ${gameState.attempts} attempt(s) remaining.`
                : 'All attempts used. Please review the course material.'}
            </p>
            <div className="flex gap-4 justify-center">
              {gameState.attempts > 0 && (
                <Button
                  onClick={handleRetry}
                  className="bg-lxd-blue hover:bg-lxd-blue/80 text-lxd-text-light-heading"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retry Scenario
                </Button>
              )}
              {outcomeType === 'success' && (
                <Button
                  onClick={() => onComplete?.(gameState)}
                  className="bg-lxd-success hover:bg-lxd-success/80 text-lxd-text-light-heading"
                >
                  Continue
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
