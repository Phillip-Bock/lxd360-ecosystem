'use client';

import { useState } from 'react';

export function BlockquoteCentered(): React.JSX.Element {
  const [quote, setQuote] = useState(
    'We open ourselves to discovery by following our deepest questions.',
  );
  const [author, setAuthor] = useState('Jane Hirshfield');

  return (
    <div className="bg-brand-surface dark:bg-lxd-dark-page rounded-xl shadow-md p-10">
      <blockquote className="text-center my-6 max-w-4xl mx-auto">
        <p
          contentEditable
          className="font-serif text-2xl font-bold text-lxd-text-dark-heading dark:text-lxd-text-light-heading outline-hidden focus:ring-2 focus:ring-lxd-blue rounded p-2"
          onInput={(e) => setQuote(e.currentTarget.textContent || '')}
          suppressContentEditableWarning
        >
          {quote}
        </p>
        <footer
          contentEditable
          className="mt-4 text-base italic text-lxd-purple-dark outline-hidden focus:ring-2 focus:ring-lxd-blue rounded p-2"
          onInput={(e) => setAuthor(e.currentTarget.textContent || '')}
          suppressContentEditableWarning
        >
          — {author}
        </footer>
      </blockquote>
    </div>
  );
}
