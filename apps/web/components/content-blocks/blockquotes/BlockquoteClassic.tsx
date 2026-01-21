'use client';

import { useState } from 'react';

export function BlockquoteClassic(): React.JSX.Element {
  const [quote, setQuote] = useState(
    'It is in vain to say human beings ought to be satisfied with tranquillity: they must have action; and they will make it if they cannot find it.',
  );
  const [author, setAuthor] = useState('Charlotte Brontë, Jane Eyre');

  return (
    <div className="bg-brand-surface dark:bg-lxd-dark-page rounded-xl shadow-md p-10">
      <blockquote className="border-l-4 border-lxd-purple-dark pl-5 my-4 text-lxd-text-dark-secondary dark:text-lxd-text-light-secondary">
        <p
          contentEditable
          className="font-serif italic text-lg outline-hidden focus:ring-2 focus:ring-lxd-blue rounded p-2"
          onInput={(e) => setQuote(e.currentTarget.textContent || '')}
          suppressContentEditableWarning
        >
          {quote}
        </p>
        <footer
          contentEditable
          className="mt-3 text-sm text-lxd-text-dark-muted dark:text-lxd-text-light-muted outline-hidden focus:ring-2 focus:ring-lxd-blue rounded p-2"
          onInput={(e) => setAuthor(e.currentTarget.textContent || '')}
          suppressContentEditableWarning
        >
          — {author}
        </footer>
      </blockquote>
    </div>
  );
}
