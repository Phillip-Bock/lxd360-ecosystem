'use client';

import Image from 'next/image';
import { useState } from 'react';

export function TestimonialBlock(): React.JSX.Element {
  const [quote, setQuote] = useState(
    'This platform transformed how our team learns. The interactive components are incredibly engaging and effective.',
  );
  const [author, setAuthor] = useState('Jane Doe, Head of L&D');

  return (
    <div className="flex gap-5 items-center bg-lxd-dark-page border border-lxd-dark-surface p-6 rounded-xl">
      <Image
        src="/professional-headshot.png"
        alt="Avatar"
        width={60}
        height={60}
        className="rounded-full border-2 border-lxd-blue"
      />
      <div className="flex-1">
        {/* biome-ignore lint/a11y/useSemanticElements: contentEditable requires div with role="textbox" for rich text */}
        <div
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-label="Testimonial quote"
          tabIndex={0}
          onBlur={(e) => setQuote(e.currentTarget.textContent || '')}
          className="mb-2 text-lxd-text-light-body italic outline-hidden focus:ring-2 focus:ring-lxd-blue rounded px-1"
        >
          &ldquo;{quote}&rdquo;
        </div>
        {/* biome-ignore lint/a11y/useSemanticElements: contentEditable requires div with role="textbox" for rich text */}
        <div
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-label="Testimonial author"
          tabIndex={0}
          onBlur={(e) => setAuthor(e.currentTarget.textContent || '')}
          className="text-lxd-success font-medium outline-hidden focus:ring-2 focus:ring-lxd-blue rounded px-1"
        >
          — {author}
        </div>
      </div>
    </div>
  );
}
