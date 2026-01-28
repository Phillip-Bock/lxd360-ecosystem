'use client';

import { useState } from 'react';

export function QuoteCentered(): React.JSX.Element {
  const [quote, setQuote] = useState(
    'Live as if you were to die tomorrow. Learn as if you were to live forever.',
  );
  const [author, setAuthor] = useState('Mahatma Gandhi');

  return (
    <div className="text-center bg-lxd-dark-page border border-lxd-dark-surface rounded-xl p-8">
      {/* biome-ignore lint/a11y/useSemanticElements: contentEditable requires div with role="textbox" for rich text */}
      <div
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label="Quote text"
        tabIndex={0}
        onBlur={(e) => setQuote(e.currentTarget.textContent || '')}
        className="text-xl font-medium text-lxd-text-light-heading mb-3 outline-hidden focus:ring-2 focus:ring-lxd-blue rounded px-2"
      >
        &quot;{quote}&quot;
      </div>
      {/* biome-ignore lint/a11y/useSemanticElements: contentEditable requires div with role="textbox" for rich text */}
      <div
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label="Quote author"
        tabIndex={0}
        onBlur={(e) => setAuthor(e.currentTarget.textContent || '')}
        className="text-lxd-purple-dark outline-hidden focus:ring-2 focus:ring-lxd-blue rounded px-2"
      >
        — {author}
      </div>
    </div>
  );
}
