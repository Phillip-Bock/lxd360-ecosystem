export interface PanoramaHotspot {
  id: string;
  pitch: number;
  yaw: number;
  tooltip?: string;
  className?: string;
  data?: Record<string, unknown>;
}

export interface ScenarioCharacter {
  id: string;
  name: string;
  image: string;
  startScene: string;
}

export interface ScenarioChoice {
  text: string;
  category: 'best' | 'better' | 'worst';
  score: number;
  nextScene: string;
}

export interface ScenarioScene {
  id: string;
  dialogue: string;
  choices: ScenarioChoice[];
}

export interface ScenarioFeedback {
  [key: string]: string;
}

export interface ScenarioData {
  panoramaImage: string;
  characters: Record<string, ScenarioCharacter>;
  scenes: Record<string, ScenarioScene>;
  feedback: ScenarioFeedback;
}

export interface CharacterState {
  completed: boolean;
  trustLost: number;
  status: 'pending' | 'happy' | 'annoyed' | 'angry';
}

export interface GameState {
  trust: number;
  attempts: number;
  completedCharacters: number;
  characters: Record<string, CharacterState>;
}

export interface PanoramaViewerProps {
  imageUrl: string;
  hotspots?: PanoramaHotspot[];
  onHotspotClick?: (hotspot: PanoramaHotspot) => void;
  onViewChange?: (view: { pitch: number; yaw: number }) => void;
  className?: string;
  autoRotate?: boolean;
  initialView?: { pitch: number; yaw: number };
}

export interface ScenarioPanoramaProps {
  scenarioData: ScenarioData;
  onComplete?: (state: GameState) => void;
  onProgress?: (progress: number) => void;
  storageKey?: string;
}
