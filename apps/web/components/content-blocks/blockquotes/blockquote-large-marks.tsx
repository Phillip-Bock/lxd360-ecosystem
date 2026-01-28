'use client';

import { useState } from 'react';

export function BlockquoteLargeMarks(): React.JSX.Element {
  const [quote, setQuote] = useState(
    'The future has yet to unfold. But the now is full of beauty simply waiting for our attention.',
  );
  const [author, setAuthor] = useState('Thich Nhat Hanh');

  return (
    <div className="bg-brand-surface dark:bg-lxd-dark-page rounded-xl shadow-md p-10">
      <blockquote className="relative px-10 py-5 my-6 bg-lxd-blue/10 dark:bg-lxd-blue/20 rounded-lg">
        <div className="absolute -top-5 left-0 text-9xl text-lxd-blue/30 leading-none">&quot;</div>
        <p
          contentEditable
          className="relative z-10 text-lg text-lxd-text-dark-body dark:text-lxd-text-light-heading outline-hidden focus:ring-2 focus:ring-lxd-blue rounded p-2"
          onInput={(e) => setQuote(e.currentTarget.textContent || '')}
          suppressContentEditableWarning
        >
          {quote}
        </p>
        <footer
          contentEditable
          className="text-right mt-3 font-semibold text-lxd-blue outline-hidden focus:ring-2 focus:ring-lxd-blue rounded p-2"
          onInput={(e) => setAuthor(e.currentTarget.textContent || '')}
          suppressContentEditableWarning
        >
          — {author}
        </footer>
      </blockquote>
    </div>
  );
}
