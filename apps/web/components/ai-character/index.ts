// Re-export types and config from ai-personas lib
export {
  AI_PERSONAS,
  type AIPersona,
  type AIPersonaId,
  getAllPersonaIds,
  getPersonaForRoute,
} from '@/lib/ai-personas/persona-config';
export { AiCharacterChat } from './AiCharacterChat';
// Note: Character3D is NOT exported here to avoid SSR issues with Three.js
// It's dynamically imported by CharacterDisplay with ssr: false
export { CharacterDisplay } from './CharacterDisplay';
export { CharacterFallback } from './CharacterFallback';
export { PersonaSelector } from './PersonaSelector';
