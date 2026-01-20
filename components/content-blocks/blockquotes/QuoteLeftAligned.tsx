'use client';

import { useState } from 'react';

export function QuoteLeftAligned(): React.JSX.Element {
  const [quote, setQuote] = useState('The art of teaching is the art of assisting discovery.');
  const [author, setAuthor] = useState('Mark Van Doren');

  return (
    <div className="border-l-4 border-lxd-blue pl-5 italic bg-lxd-dark-page rounded-r-lg p-4">
      {/* biome-ignore lint/a11y/useSemanticElements: contentEditable requires div with role="textbox" for rich text */}
      <div
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label="Quote text"
        tabIndex={0}
        onBlur={(e) => setQuote(e.currentTarget.textContent || '')}
        className="text-lxd-text-light-heading text-lg outline-hidden focus:ring-2 focus:ring-lxd-blue rounded mb-2"
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
        className="text-lxd-success outline-hidden focus:ring-2 focus:ring-lxd-blue rounded not-italic"
      >
        — {author}
      </div>
    </div>
  );
}
