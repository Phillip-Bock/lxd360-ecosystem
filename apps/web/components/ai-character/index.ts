// Re-export types and config from ai-personas lib
export {
  AI_PERSONAS,
  type AIPersona,
  type AIPersonaId,
  getAllPersonaIds,
  getPersonaForRoute,
} from '@/lib/ai-personas/persona-config';
export { AiCharacterChat } from './AiCharacterChat';
export { Character3D } from './Character3D';
export { CharacterDisplay } from './CharacterDisplay';
export { CharacterFallback } from './CharacterFallback';
export { PersonaSelector } from './PersonaSelector';
