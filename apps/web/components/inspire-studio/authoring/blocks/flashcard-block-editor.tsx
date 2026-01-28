import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import type { FlashcardBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface FlashcardBlockEditorProps {
  block: FlashcardBlock;
  onChange: (content: FlashcardBlock['content']) => void;
}

export const FlashcardBlockEditor = ({
  block,
  onChange,
}: FlashcardBlockEditorProps): React.JSX.Element => {
  const [flippedCard, setFlippedCard] = useState<string | null>(null);

  const addCard = (): void => {
    onChange({
      ...block.content,
      cards: [...block.content.cards, { id: `card_${Date.now()}`, front: '', back: '' }],
    });
  };

  const removeCard = (id: string): void => {
    onChange({
      ...block.content,
      cards: block.content.cards.filter((card) => card.id !== id),
    });
  };

  const updateCard = (id: string, side: 'front' | 'back', value: string): void => {
    onChange({
      ...block.content,
      cards: block.content.cards.map((card) =>
        card.id === id ? { ...card, [side]: value } : card,
      ),
    });
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={block.content.shuffleCards}
          onChange={(e) => onChange({ ...block.content, shuffleCards: e.target.checked })}
          className="w-4 h-4 text-brand-blue rounded"
        />
        <span className="text-sm font-medium text-brand-secondary">Shuffle cards for learners</span>
      </label>
      <div className="space-y-3">
        <span className="block text-sm font-medium text-brand-secondary">Flashcards</span>
        {block.content.cards.map((card, index) => (
          <div key={card.id} className="border border-brand-strong rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-brand-secondary">Card {index + 1}</span>
              <button
                type="button"
                onClick={() => removeCard(card.id)}
                className="ml-auto p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label
                htmlFor={`card-front-${card.id}`}
                className="block text-xs font-medium text-brand-secondary mb-1"
              >
                Front
              </label>
              <textarea
                id={`card-front-${card.id}`}
                value={card.front}
                onChange={(e) => updateCard(card.id, 'front', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
                placeholder="Question or term"
              />
            </div>
            <div>
              <label
                htmlFor={`card-back-${card.id}`}
                className="block text-xs font-medium text-brand-secondary mb-1"
              >
                Back
              </label>
              <textarea
                id={`card-back-${card.id}`}
                value={card.back}
                onChange={(e) => updateCard(card.id, 'back', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
                placeholder="Answer or definition"
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addCard}
          className="flex items-center gap-2 px-4 py-2 text-brand-blue hover:bg-blue-50 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Add Card
        </button>
      </div>
      {block.content.cards.length > 0 && block.content.cards[0].front && (
        <div className="mt-4 p-4 bg-brand-page rounded-lg">
          <p className="text-xs font-medium text-brand-secondary mb-2">Preview:</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {block.content.cards.map((card) => (
              <button
                key={card.id}
                type="button"
                className="min-w-[200px] h-32 bg-brand-surface border-2 border-brand-strong rounded-lg p-4 cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => setFlippedCard(flippedCard === card.id ? null : card.id)}
                aria-label={`Flashcard: ${flippedCard === card.id ? 'showing back' : 'showing front'}. Click to flip.`}
              >
                <span className="text-sm text-brand-secondary text-center flex items-center justify-center h-full">
                  {flippedCard === card.id ? card.back || 'Back' : card.front || 'Front'}
                </span>
              </button>
            ))}
          </div>
          <p className="text-xs text-brand-muted mt-2">Click cards to flip</p>
        </div>
      )}
    </div>
  );
};
