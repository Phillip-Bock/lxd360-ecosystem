'use client';

import { useRef, useState } from 'react';

export function SubtitleOnly(): React.JSX.Element {
  const [charCount, setCharCount] = useState(0);
  const subtitleRef = useRef<HTMLHeadingElement>(null);
  const maxChars = 100;

  const updateCharCount = () => {
    if (!subtitleRef.current) return;
    const text = subtitleRef.current.innerText || subtitleRef.current.textContent || '';

    if (text.length > maxChars) {
      subtitleRef.current.innerText = text.substring(0, maxChars);
      const range = document.createRange();
      const sel = window.getSelection();
      if (sel && subtitleRef.current.childNodes.length > 0) {
        range.selectNodeContents(subtitleRef.current);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }

    setCharCount(subtitleRef.current.innerText.length);
  };

  return (
    <div className="bg-lxd-dark-page border border-lxd-dark-surface rounded-xl p-10 w-full">
      <h2
        ref={subtitleRef}
        contentEditable
        suppressContentEditableWarning
        onInput={updateCharCount}
        className="text-[1.75em] font-semibold text-lxd-text-light-secondary m-0 p-2.5 outline-hidden border-2 border-transparent transition-[border-color] duration-300 focus:border-lxd-purple-dark rounded"
      >
        Consectetur adipiscing elit
      </h2>
      <div
        className="text-right text-[0.9em] mt-2"
        style={{
          color: charCount >= maxChars ? 'var(--color-lxd-error)' : 'var(--color-text-muted)',
        }}
      >
        <span>{charCount}</span> / {maxChars}
      </div>
    </div>
  );
}
