'use client';

import { useState } from 'react';

export function BlockquoteCard(): React.JSX.Element {
  const [quote, setQuote] = useState(
    "By all means, write your to-do list. But then scrap your well-thought out plan when your intuition whispers, 'This way.'",
  );
  const [author, setAuthor] = useState('Danielle LaPorte, The Fire Starter Sessions');

  return (
    <div className="bg-card dark:bg-lxd-dark-page rounded-xl shadow-md p-6">
      <blockquote className="border border-border dark:border-lxd-dark-surface rounded-xl shadow-sm overflow-hidden">
        <p
          contentEditable
          className="p-6 text-lg bg-background dark:bg-lxd-dark-surface outline-hidden focus:ring-2 focus:ring-lxd-blue text-lxd-text-dark-body dark:text-lxd-text-light-heading"
          onInput={(e) => setQuote(e.currentTarget.textContent || '')}
          suppressContentEditableWarning
        >
          {quote}
        </p>
        <footer
          contentEditable
          className="px-6 py-4 bg-muted dark:bg-lxd-dark-surface text-sm font-medium text-lxd-text-dark-secondary dark:text-lxd-text-light-secondary text-right outline-hidden focus:ring-2 focus:ring-lxd-blue"
          onInput={(e) => setAuthor(e.currentTarget.textContent || '')}
          suppressContentEditableWarning
        >
          — {author}
        </footer>
      </blockquote>
    </div>
  );
}
