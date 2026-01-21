'use client';

import { useState } from 'react';

export function PullQuote(): React.JSX.Element {
  const [quote, setQuote] = useState(
    'Eu est quot porro legimus, ne elitr aliquam menandri duo, quo dictas vituperata ut. Ei mei tale expetendis.',
  );

  return (
    <div className="bg-lxd-dark-page rounded-xl border border-lxd-dark-surface p-10">
      <div className="relative pl-10 pr-6 py-5 border-l-4 border-lxd-purple-dark bg-lxd-dark-surface rounded-r-lg">
        <div className="absolute -top-2 left-2 text-8xl text-lxd-purple-dark/30 font-serif leading-none">
          &quot;
        </div>
        <p
          contentEditable
          className="relative z-10 text-2xl italic font-serif text-lxd-text-light-heading leading-relaxed outline-hidden focus:ring-2 focus:ring-lxd-blue rounded p-2"
          onInput={(e) => {
            setQuote(e.currentTarget.textContent || '');
          }}
          suppressContentEditableWarning
        >
          {quote}
        </p>
      </div>
    </div>
  );
}
