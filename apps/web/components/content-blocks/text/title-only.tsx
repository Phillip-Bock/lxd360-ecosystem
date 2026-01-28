'use client';

import { useRef, useState } from 'react';

export function TitleOnly(): React.JSX.Element {
  const [charCount, setCharCount] = useState(0);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const maxChars = 100;

  const updateCharCount = () => {
    if (!titleRef.current) return;
    const text = titleRef.current.innerText || titleRef.current.textContent || '';

    if (text.length > maxChars) {
      titleRef.current.innerText = text.substring(0, maxChars);
      const range = document.createRange();
      const sel = window.getSelection();
      if (sel && titleRef.current.childNodes.length > 0) {
        range.selectNodeContents(titleRef.current);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }

    setCharCount(titleRef.current.innerText.length);
  };

  return (
    <div className="bg-lxd-dark-page border border-lxd-dark-surface rounded-xl shadow-lg p-10 w-full">
      <h1
        ref={titleRef}
        contentEditable
        suppressContentEditableWarning
        onInput={updateCharCount}
        className="text-[2.5em] font-bold text-lxd-text-light-heading m-0 p-2.5 outline-hidden border-2 border-transparent transition-[border-color] duration-300 focus:border-lxd-blue"
      >
        Lorem Ipsum Dolor Sit Amet
      </h1>
      <div
        className="text-right text-sm mt-2"
        style={{
          color: charCount >= maxChars ? 'var(--color-lxd-error)' : 'var(--color-text-muted)',
        }}
      >
        <span>{charCount}</span> / {maxChars}
      </div>
    </div>
  );
}
